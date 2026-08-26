import json, os
from datetime import datetime
repo = os.getcwd()

readme = """# Recovery Workspace

Historical data audit and preservation artifacts for Pixel Tetsudo.

## Structure

- `source/` — Raw historical data snapshots (READ ONLY, never modify)
- `inventory/` — Entity inventories for historical data
- `reports/` — Audit reports and analysis results

## Source Data

| File | SHA-256 | Lines | Stations | Description |
|------|---------|-------|----------|-------------|
| `railway_152_raw.json` | `44ADFC07...` | 152 | 503 | Primary 152-line canonical source (Phase13 backup) |
| `railway_data_phase15_pre_cleanup_backup.json` | — | 152 | 503 | Phase15 cleanup backup |
| `railway_data_phase29e1p0_pre_recover_backup.json` | `0086A706...` | 152 | 629 | Phase29 recovery backup (more stations) |

## Current Canonical

| File | SHA-256 | Lines | Stations | Description |
|------|---------|-------|----------|-------------|
| `data/core/railway_data.json` | `D759E38E...` | 60 | 503 | Production canonical (post-caeae43 migration) |

## Task 0 Checklist

- [x] 0-1: Current project state frozen and recorded
- [x] 0-2: 152-line historical data source confirmed
- [x] 0-3: Raw 152 data independently saved
- [x] 0-4: Raw file SHA recorded
- [x] 0-5: 152 data entity inventory generated
- [x] 0-6: 152 vs 60 diff generated
- [x] 0-7: 59→152→60 lineage documented
- [x] 0-8: Old vs new structure clearly distinguished
- [x] 0-9: Missing field handling policy defined
- [x] 0-10: Current canonical railway_data.json NOT modified
- [x] 0-11: No historical data deleted

## Key Finding

commit `caeae43` (Aug 15, 2026) migrated data from JS files to `railway_data.json` but only included 60 of 152 lines.
92 lines were lost during this migration. The Phase13 backup preserves the complete dataset.

## Next

Task 1: New Schema Design + 152→New Structure Migration Plan
"""

open(os.path.join(repo, "recovery", "README.md"), "w", encoding="utf-8").write(readme)
print("README.md written")