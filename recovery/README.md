# Recovery Workspace

Pixel Tetsudo 历史恢复资料与验收报告。

> 下方 60／152 条线路及校验值属于早期恢复阶段，不是当前生产数量或待执行任务。现役事实源是仓库的 `data/core/railway_data.json`，工程状态以 [PROGRESS](../PROGRESS.md) 为准。

- [完整文档索引](../docs/README.md)
- [已纳入版本管理的非 FULL SQL 验收报告](reports/2026-10-14_non_full_sql_timetables.md)

本目录还可能包含被 Git 忽略的本地备份、样本和临时报告；它们不自动等同于可发布证据。`source/` 的原始数据保持只读。

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

## Historical Canonical Snapshot

| File | SHA-256 | Lines | Stations | Description |
|------|---------|-------|----------|-------------|
| `data/core/railway_data.json` | `D759E38E...` | 60 | 503 | Canonical snapshot at that recovery stage (post-caeae43 migration) |

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

## Historical Next Step

Task 1: New Schema Design + 152→New Structure Migration Plan
