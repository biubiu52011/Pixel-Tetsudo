# Pixel-Tetsudo - Agent Development Rules

This file defines the hard rules for any AI agent working on this project.
These rules take precedence over any per-task instructions.

---

## System-First Change Rule (HARD RULE)

Any add, modify, or delete operation MUST start from the current full system state, never from the target file alone.

### Before any change
1. Identify the user task this change serves
2. Confirm the current architecture boundary (which module owns what)
3. List all existing Provider/Consumer relationships involved
4. Check for historical implementations, orphan entries, or deprecated paths
5. Design the modification within the system model - not by adapting existing code

### After any structural change
Re-check ALL of the following:
- Provider -> Consumer chain is complete
- No new orphans created
- No old entry point re-referenced
- No duplicate implementation introduced
- No existing module capability degraded
- No A+B temporary fusion forming new ambiguous boundary
- New feature does not incorrectly inherit old framework
- Old feature still retains its original capability after the change

### Critical principle
Can run does not equal correctly integrated into the system.
If a local change conflicts with the system-wide design, redesign the change - never force-adapt the existing code.
---


---

## Rule 9 - Whole-System Consumer Preservation (HARD RULE)

Any add, modify, migrate, or delete operation MUST start from the current full system Provider-Consumer-Boundary map, not from the target file alone.

### Pre-change questionnaire (answer ALL before touching code)
1. Which existing Provider currently supplies this capability?
2. Who are all current Consumers (direct and indirect)?
3. What is the main heart of each affected page?
4. Which module does this feature belong to?
5. Does an implementation already exist?
6. Does a historical/abandoned implementation exist?
7. Why was the historical implementation not used?
8. Which Consumers will this change affect?
9. Will this create new orphans?
10. Will this create a second implementation of the same responsibility?
11. What will the system responsibility map look like after this change?

### Migration rule
When moving a capability from Provider A to Provider B:
- Migrate ALL Consumers from A to B first
- Verify each Consumer works with B
- Only THEN remove A
- Run global orphan sweep

### Deletion rule
When removing a capability:
- Confirm zero Consumers remain
- Confirm no historical file can be mistaken for current implementation by future AI
- Document the removal

### No parallel implementation rule
Never create a second Provider for the same responsibility just because it is convenient.
If the existing Provider cannot serve the new requirement, EXTEND it - do not duplicate it.

### Task prompt rule
Future task prompts MUST be written as:
Complete feature X using the current system as the reference. The target file is a candidate modification point, not the final implementation location.

Never write: Modify xxx.js to implement xxx.

---

## Development Workflow for New Features (Post RC-2)

Every new feature MUST follow this chain:

1. Read-only system audit (current state from baseline)
2. Check if existing capability can be reused
3. If new capability needed: define Provider boundary clearly
4. Define which module main-heart owns this feature
5. Implement within system boundaries
6. Consumer Chain Audit (all Consumers verified)
7. Future AI Trap Scan (no new misleading entries)
8. Global product walkthrough (no cross-module regression)
9. Release Gate check

Do not skip steps. Do not treat file-level changes as sufficient.

---

---

## 4.3.0 Feature Intake / System Impact Review (MANDATORY)

Before ANY new feature development, the agent MUST complete this intake questionnaire.
This is the fixed entry point for all future feature work.

### Intake Questionnaire (answer ALL before touching code)

1. **User task**: Which user task does this feature serve?
2. **Page ownership**: Which page does this belong to?
3. **Main-heart check**: What is the main heart of that page? Does this feature strengthen or dilute it?
4. **Capability classification**: Is this a main-heart capability, auxiliary capability, or background capability?
5. **Provider impact**: Which existing Provider will this affect? Will it extend or replace?
6. **Consumer impact**: Which Consumers will be affected? List each one.
7. **New data entry**: Will this create a new data entry point? If yes, which layer (UNIFIED_LINES / DataLayer / RailwayDB)?
8. **Display resolver**: Will this create a new display name resolver? If yes, must it route through RailwayDB.
9. **Orphan risk**: Could this cause any existing module to become orphaned?
10. **A-for-B degradation**: After this change, does Module A still have all its original capabilities?
11. **Legacy cleanup**: Which old code should be migrated, preserved, or deleted after this change?

### A-for-B Degradation Check (CRITICAL)

This is the most important rule. It prevents the pattern where:
- B is built to work with a modified A
- A's original Consumer is broken in the process
- Later, AI finds A's old code and assumes it is still the current framework
- New features attach to the orphaned A instead of the correct path

**Check template**:
`
Before: A -> Provider -> Consumer_X, Consumer_Y
After:  A -> Provider -> Consumer_X   (must still work)
        A -> NewPath                   (B's new path)
        Consumer_Y -> ?                (MUST NOT be orphaned)
`

If any Consumer loses access to its capability, the change is REJECTED until fixed.

### Decision tree

| Finding | Action |
|---------|--------|
| Existing Provider can serve the need | EXTEND existing Provider, do NOT create new |
| New Provider needed | Define boundary explicitly, document in AGENTS.md |
| Old Provider can be fully replaced | Migrate all Consumers first, then remove |
| Risk of orphan creation | STOP - redesign with Consumer Preservation in mind |
| Cannot answer question 10 | STOP - investigate full Consumer chain first |

### 4.3.0 Post-Intake Workflow

After intake is complete and approved:

1. Read-only system audit (confirm baseline state)
2. Check if existing capability can be reused
3. If new capability needed: define Provider boundary clearly
4. Define which module main-heart owns this feature
5. Implement within system boundaries
6. Consumer Chain Audit (all Consumers verified)
7. Future AI Trap Scan (no new misleading entries)
8. Global product walkthrough (no cross-module regression)
9. Release Gate check

Do not skip steps.
## Known Debt (Do Not Auto-Fix)

| Debt | Priority | Reason for defer |
|------|----------|-----------------|
| History <-> SearchUI coupling (P2) | P2 | Requires SearchUI public API redesign |
| data/铁道/ directory (P3) | P3 | Historical archive, zero runtime impact |
| CSS orphan classes (5) | P3 | Low risk, covered by inheritance |
| console.log in odpt-unified.js (2) | P3 | Non-product debug output |
| 13 image path fixes | Deferred | Asset mapping, no product impact |

---

## Architecture Baselines

| Tag | Commit | Description |
|-----|--------|-------------|
| RC-1 | 63b388d | Engineering baseline: Display Identity unified, P0-3=0 |
| RC-2 \| 6e502f4 \| Product baseline: Architecture documented, rules enforced, Home visual consistency fixed |

---

Last updated: 2026-09-01
Version: RC-2
---

## Canonical Data Freeze Rule
The following data is LOCKED. Never modify for any reason:
- data/core/railway_data.json: 156 lines / 509 stations / 1703 name_map / 93 tourism
- Any missing data field is DATA-BLOCKED, not a reason to fabricate content.

---

## Display Identity Rule
RailwayDB.resolveLineName() / resolveStationName() / tOp() are the ONLY allowed display name paths.
Never implement a second resolver. Never use line.name / line.nameJa / line.nameEn directly in user-visible output.

---

## Three-Layer Data Architecture Rule
The project uses three intentional layers. Do NOT merge them:
| Layer | Owner | Responsibility |
|-------|-------|---------------|
| UNIFIED_LINES | db-loader.js | Raw canonical line objects (DataFusion input) |
| DataLayer | data-layer.js | Runtime cache (positions, grouped access) |
| RailwayDB | db-loader.js | Canonical query + display identity (i18n) |
Each layer has a distinct responsibility. Use the correct layer for the correct concern.

---

## No Orphan-Generating Migration Rule
When moving a capability from module A to module B:
1. Identify ALL consumers of A
2. Migrate each consumer to B
3. Verify each consumer works with B
4. Only THEN remove A
5. Run global orphan sweep after removal
Never delete a provider while consumers still reference it.
---

## Read-Only First Rule
Every review/audit phase starts with read-only analysis. Code changes only after explicit approval.

---

## Module Main-Heart Rule
Each page has exactly ONE main heart:
| Page | Main Heart |
|------|-----------|
| Home | Route Search |
| Route Search | How do I get there? |
| Realtime | Can I ride this line now? |
| Trains | What is this line? |
| History | What did I search before? |
| Tourism | What is worth visiting at the destination? |
No module may hijack another module main heart.

---

## Release Gate Rule
Before tagging a release:
1. Run Preflight check (git status, canonical data, script integrity, provider health)
2. Write System-First Change Rule update if architecture evolved
3. Commit rule update BEFORE tagging
4. Tag on the new commit (not on old HEAD)
5. Push main branch + tag together