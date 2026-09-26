# Phase 3A Review Gate

checked_at: 2026-09-27T00:00:00+09:00
scope: review only. No production changes were made during this gate.

## Final Result

REVIEW_PASS

Phase 3A.1 hotfix result: the two UNKNOWN fallback failures from the original review are fixed. The Phase 3A target fixes remain green under the existing guards.

Original review failures:

1. `TrainVehicle.resolve({ lineId: "UnknownRoute", operator: "UnknownOperator", vehicleTypeManual: "E235系9999番台" })` returned the real Yamanote E235 asset.
2. `TrainVehicle.resolve({ lineId: "UnknownRoute", operator: "UnknownOperator" })` returned the real Yamanote E235 asset.

Hotfix:

- Explicit but unresolved vehicle input is now treated as UNKNOWN and does not fall through to route/operator/icon fallback.
- Absent vehicle input with unknown route/operator no longer accepts the ultimate E235 Yamanote fallback.
- Known route/service defaults still work; for example, absent vehicle on Yamanote Local still resolves to the Yamanote E235 current default.

## Changed Files

Changed production files:

- `data/timetables/vehicle-type-map.js`
- `js/train-icons.js`
- `js/train-vehicle.js`

Changed test files:

- `tools/train_vehicle_mapping_guard.js`

Changed audit files:

- `audit/train-images/PHASE3A_FIX_REPORT.md`
- `audit/train-images/PHASE3A_REVIEW.md`

Image files changed: 0

## Diff Review

- Hardcoded runtime exceptions found: 0
- Filename-dependent identity logic found: 0
- Route-specific `if (line === "...") return "...png"` patterns introduced: 0
- New `includes()` / `startsWith()` fuzzy identity matching introduced in production code: 0
- Resolver public interface changed unexpectedly: no
- Operator override regression found in diff: no
- Through-service parsing regression found in diff: no
- Browser-only production code importing Node APIs: no

The new production code adds a data table, `CANONICAL_VEHICLES`, and a lookup index. It does not add scattered runtime special cases. Phase 3A.1 adds one fallback gate in `TrainVehicle.resolve` to keep UNKNOWN inputs from being converted into concrete train assets.

## Canonical Alias Layer Review

- Canonical identity independent of PNG filename: PASS
- Legacy names accepted as aliases: PASS
- Alias resolves to canonical identity: PASS
- Asset filename is a resource property: PASS
- Same canonical vehicle can own multiple assets: DEFERRED
- Different subseries remain distinct: PASS

Deferred detail:

- `CANONICAL_VEHICLES` entries are shaped as `{ displayName, iconName, asset, aliases }`.
- A future canonical registry pass should convert this to asset-pool capability, e.g. `assets: [...]`. Phase 3A.1 was limited to UNKNOWN fallback behavior and did not alter this schema.

## P0 Verification

- P0 regressions: 0
- Tozai JR-East through stock: verified.
- ShonanShinjuku current pool: verified.
- Joban/Chiyoda split: verified.

## P1 Verification

- P1 regressions: 0
- Yamanote bare E235: verified.
- Keiyo/Musashino E231-900 removal: verified.
- Kawagoe current historical 209 removal: verified.
- Ito Odoriko E257-2000/2500: verified.
- Nikko/Kinugawa formal 253: verified.

## Fixed High Risks Verification

All 13 Phase 3A fixed High fuzzy risk rows were checked against current runtime mapping:

| risk_id | before | after | runtime_reachable | verified |
|---|---|---|---|---|
| H-296 | `JR E233系` in Chiyoda Local | `E233系2000番台` explicit pool | yes | TRUE |
| H-394 | `JR E231系` in Tozai CommuterRapid | `E231系800番台（東西線直通）` | yes | TRUE |
| H-399a | `JR E231系` in Tozai Local | `E231系800番台（東西線直通）` | yes | TRUE |
| H-399b | `東葉高速1000系` in Tozai Local | `東葉高速2000系` | yes | TRUE |
| H-404a | `JR E231系` in Tozai Rapid | `E231系800番台（東西線直通）` | yes | TRUE |
| H-404b | `東葉高速1000系` in Tozai Rapid | `東葉高速2000系` | yes | TRUE |
| H-978 | `209系3100番台 / 209系3000番台` in Kawagoe Local | removed from current default | yes | TRUE |
| H-986 | `E231系900番台` in Keiyo Local | removed from current default | yes | TRUE |
| H-987 | `E231系900番台` in Keiyo Rapid | removed from current default | yes | TRUE |
| H-991 | `E231系900番台` in Musashino Local | `E231系0番台` | yes | TRUE |
| H-1017 | `E235系1000番台` in ShonanShinjuku Local | removed from current default | yes | TRUE |
| H-1018 | `E235系1000番台` in ShonanShinjuku Rapid | removed from current default | yes | TRUE |
| H-1019 | `E235系1000番台` in ShonanShinjuku SpecialRapid | removed from current default | yes | TRUE |

Fixed High risks verified: 13/13

## Deferred High Risks

| risk_id | current item | classification | reason |
|---|---|---|---|
| H-955 | `Hachiko` `209系3000番台` | NEEDS_PHASE3B | Phase 2 marked Hachiko/Kawagoe-area 209 review as needing research; not directly part of Phase 3A P0/P1. |
| H-983 | `KawagoeWest` `209系3000番台` | NEEDS_PHASE3B | Phase 2 marked this as needing research; not directly part of the Saikyo/Kawagoe through-current fix. |
| H-1094 | `Yokosuka` Local mixed pool | NEEDS_PHASE3B | Probable issue, but not in the Phase 3A target P0/P1 set. |
| H-1095 | `Yokosuka` Rapid mixed pool | NEEDS_PHASE3B | Probable issue, but not in the Phase 3A target P0/P1 set. |

Deferred High risks classified: 4/4
Deferred ACTUALLY_P0: 0

## Negative Tests

Cross-subseries fallback found: 0

Verified no cross-selection among the Phase 3A touched families:

- `E235系0番台（山手線）` does not resolve to E235-1000 or fictional Chuo-Sobu E235.
- `E235系1000番台` does not resolve to Yamanote or fictional Chuo-Sobu E235.
- `E231系0番台`, `E231系800番台`, and `E231系1000番台` remain distinct.
- `E233系2000番台`, `E233系3000番台`, `E233系5000番台`, and `E233系7000番台` remain distinct.

Unknown-input incorrect guessing found: 0

Original blocking unknown-input cases and hotfix result:

- `TrainVehicle.resolve({ lineId: "UnknownRoute", operator: "UnknownOperator", vehicleTypeManual: "E235系9999番台" })` now returns `iconPath: ""`.
- `TrainVehicle.resolve({ lineId: "UnknownRoute", operator: "UnknownOperator" })` now returns `iconPath: ""`.

Root cause:

- Explicit UNKNOWN vehicle input could fail exact icon resolution, then continue into route/operator/icon fallbacks.
- Unknown route/operator with absent vehicle could reach `TrainIcons.getTrainIcon` ultimate fallback and receive `E235系山手線.png`.

Fix:

- `TrainVehicle.resolve` now distinguishes explicit vehicle input from absent vehicle input.
- If explicit vehicle input is present but cannot be resolved exactly, fallback icon selection is skipped.
- If there is no chosen vehicle and the only visual result is the non-Yamanote ultimate E235 fallback, the icon path is cleared.

## Determinism

Determinism: PASS

The Tozai JR-East through runtime probe was resolved 100 times with the same vehicle name and icon path.

## Mapping Completeness

- Vehicle mapping guard: PASS
- Missing references: 0
- Canonical entries exist for the Phase 3A canonical layer records.
- Canonical asset references exist on disk.

Deferred limitation:

- Canonical records do not yet use `assets: [...]`; this remains out of scope for Phase 3A.1.

## Historical/Special/Fictional Isolation

- Current fictional assets: 0
- Confirmed fictional `E235系総武中央線.png` is not selected by current default mapping guard.
- No image files were deleted, renamed, or modified.

## Performance Sanity

- Performance regression found: 0
- `CANONICAL_VEHICLE_ALIAS_INDEX` is built once at script load.
- Per-train runtime lookup is map-based and does not scan 2539 image files.

## Browser Compatibility

- Browser incompatibility found: 0
- Production files did not introduce `require`, filesystem APIs, `process`, or `Buffer`.
- Node APIs appear only in `tools/train_vehicle_mapping_guard.js`.

## Test Results

PASS:

- `node tools/train_vehicle_mapping_guard.js`
- `node tools/audit_train_mapping.js`
- `python .github/workflows/ci_guard_check.py`

Hotfix negative probe:

- UNKNOWN explicit vehicle: PASS
- UNKNOWN route/operator absent vehicle: PASS
- Canonical ID with random suffix: PASS
- Known series with unknown subseries: PASS
- Known operator with nonexistent vehicle: PASS

## Gate Metrics

- P0 regression: 0
- P1 regression: 0
- Critical fuzzy risks: 0
- Fixed High risks verified: 13/13
- Deferred High risks classified: 4/4
- Deferred ACTUALLY_P0: 0
- Hardcoded runtime exceptions: 0
- Filename-dependent canonical identity: 0
- Cross-subseries fallback: 0
- Unknown-input incorrect guessing: 0
- Missing references: 0
- Current fictional assets: 0
- Determinism: PASS
- Vehicle mapping guard: PASS
- Canonical preservation guard: PASS
- Relevant tests: PASS
- Image modifications: 0

## Minimal Suggestions

Phase 3A.1 is ready for review/commit after user approval.

Future follow-up, not part of this hotfix:

1. Convert the canonical layer from scalar `asset` to `assets: [...]` while preserving a deterministic default asset selection.
