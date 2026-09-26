# Phase 3A Minimal Runtime Fix Report

checked_at: 2026-09-27T00:00:00+09:00
scope: minimal production runtime fix for Phase 2 P0/P1 targets only.

## Summary

- P0 fixed: 3
- P1 fixed: 5
- Confirmed mapping errors fixed: 5
- Critical fuzzy resolver risks fixed: 1
- High fuzzy resolver risks fixed: 13
- High fuzzy resolver risks deferred: 4
- Current resolver confirmed fictional assets reachable: 0
- Missing references: 0

## P0 Fixes

1. Tozai JR-East through stock
   - File: `data/timetables/vehicle-type-map.js`
   - Runtime effect: Tozai JR-East destination/operator mappings now use `E231系800番台（東西線直通）`, not `E231系500番台` or generic `JR E231系`.
   - Default Tozai Local/Rapid pools now use `東葉高速2000系`, not `東葉高速1000系`.

2. ShonanShinjuku CURRENT pool
   - File: `data/timetables/vehicle-type-map.js`
   - Runtime effect: Local/Rapid/SpecialRapid now use `E231系1000番台 / E233系3000番台`.
   - `E235系1000番台` was removed from Shonan-Shinjuku defaults.

3. Joban systems split
   - File: `data/timetables/vehicle-type-map.js`
   - Runtime effect: `Joban` Local/Rapid now use `E231系0番台`; `Joban` SpecialRapid uses `E531系`.
   - `Chiyoda` Local default now names `E233系2000番台` explicitly instead of generic `JR E233系`.
   - `JobanMain` was already `E531系` and was not expanded.

## P1 Fixes

1. Yamanote critical bare E235
   - `Yamanote` Local now maps to `E235系0番台（山手線）`.
   - Added canonical alias entry `jr-east-e235-0-yamanote` pointing to existing asset `JR東日本/E235系山手線.png`.

2. Keiyo/Musashino E231-900
   - `Keiyo` Local/Rapid now use `E233系5000番台`.
   - `Musashino` Local now uses `E231系0番台`.
   - `E231系900番台` remains available as an asset/alias but is no longer a CURRENT default for these routes.

3. Saikyo/Kawagoe historical 209 defaults
   - `Kawagoe` Local default now uses `E233系7000番台`.
   - `209系3000番台` and `209系3100番台` were removed from this CURRENT default.
   - `KawagoeWest` was not changed because Phase 2 marked that area as needing research.

4. Ito Odoriko
   - `Ito` LimitedExpress now uses `E257系2000番台 / E257系2500番台`.
   - `E257系1500番台（踊り子）` was removed from the current Odoriko default.

5. Nikko/Kinugawa formal 253
   - `ShonanShinjuku` and `UtsunomiyaJR` LimitedExpress now use `253系（日光・きぬがわ）`.
   - `E253系（日光・きぬがわ）` remains as a compatibility alias to the formal 253 entry.

## Confirmed Mapping Errors

- ShonanShinjuku: fixed.
- Tozai default Local/Rapid: fixed.
- Tozai JR-East: fixed.
- Joban: fixed for Phase 2 target runtime paths.
- Ito: fixed.

## Critical Fuzzy Risk

- Fixed: `Yamanote` no longer emits bare `E235系`.
- Runtime now resolves `E235系0番台（山手線）` through a canonical alias record before asset filename lookup.

## High Fuzzy Risks

FIXED:

- `JR E233系` in Chiyoda Local.
- `JR E231系` in Tozai CommuterRapid/Local/Rapid.
- `東葉高速1000系` in Tozai Local/Rapid.
- `209系3000番台 / 209系3100番台` in Kawagoe Local default.
- `E231系900番台` in Keiyo Local/Rapid.
- `E231系900番台` in Musashino Local.
- `E235系1000番台` in ShonanShinjuku Local/Rapid/SpecialRapid.

DEFERRED:

- `Hachiko` `209系3000番台`: Phase 2 marked this area as needing research.
- `KawagoeWest` `209系3000番台`: Phase 2 marked this area as needing research.
- `Yokosuka` Local/Rapid mixed pool: probable issue, not a Phase 3A P0/P1 target.

## Fictional/Error Asset Isolation

- Confirmed fictional/error asset from Phase 2: `JR東日本/E235系総武中央線.png`.
- The new guard scans current VehicleTypeMap defaults and verifies that current resolver paths do not select this asset.
- Asset was not deleted, renamed, or moved.

## Canonical Alias Layer

Added a minimal `CANONICAL_VEHICLES` layer in `js/train-icons.js` for Phase 3A P0/P1 vehicles only.

The layer separates:

- internal canonical ID
- display name
- existing physical asset filename
- legacy aliases

No full 2539-image registry was added.

## Tests

PASS:

- `node tools/train_vehicle_mapping_guard.js`
- `node tools/audit_train_mapping.js`
- `python .github/workflows/ci_guard_check.py`

Guard results:

- Vehicle mapping guard: PASS
- Missing references: 0
- Current resolver fictional assets: 0
- Canonical preservation guard: PASS

## Modified Files

Production code:

- `data/timetables/vehicle-type-map.js`
- `js/train-icons.js`

Test/guard:

- `tools/train_vehicle_mapping_guard.js`

Audit report:

- `audit/train-images/PHASE3A_FIX_REPORT.md`

## Not Changed

- No image files modified.
- No image files renamed.
- No image files deleted.
- No commits made.
- No pushes made.

## Remaining Deferred Items

- `Hachiko` / `KawagoeWest` 209-series historical/current classification needs source-backed research before runtime changes.
- `Yokosuka` mixed pool remains deferred because it was not in the Phase 3A P0/P1 target list.
- Full canonical registry migration remains a later phase.
