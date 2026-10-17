# 文档索引

整理日期：2026-10-17（JST）。本页导航到已纳入版本管理的文档；不把历史报告的数量或验收结果当作当前运行状态。

先读项目 [README](../README.md)，修改前读 [ENGINEERING](../ENGINEERING.md) 与 [最新进度](../PROGRESS.md)。

## 文档维护约定

- README 解释项目和实现，ENGINEERING 维护长期约束，PROGRESS 记录任务及验证；专项结论放在对应报告中。
- 报告注明日期、版本、输入范围与验证边界；保留旧结论，用后续记录补充或更正。
- 新增或更名文档时同步入口与相对链接；不把临时备份清单当作现役架构。
- 文档整理不代表产品代码、数据库或浏览器行为已重新验收。

## 入口与工程协作

- [Pixel-Tetsudo（像素铁道）](../README.md) — `README.md`
- [Pixel Tetsudo 全站统一工程](../ENGINEERING.md) — `ENGINEERING.md`
- [Pixel Tetsudo 工程进度](../PROGRESS.md) — `PROGRESS.md`

## 现役车型与验证入口

- [数据链路端到端审计与重构验收](reports/runtime-pipeline-audit.md) — 五份HAR、分阶段PR、来源/性能/发布门禁。

- [列车计划车型与图标](train-vehicle-plans.md) — 唯一现役车型说明，替代分散日期报告。
- [共享组件](COMPONENTS.md)
- [CI 固定夹具](../tests/fixtures/guards/) — 基线与架构清单，原值保留。
- 本地去重备份位于主工作区 .work/backups/recovery-archive.zip；不发布，不参与运行。

## 专项报告

- [车辆映射检查：2026-10-15（JST）](reports/vehicle-mapping-audit-20261015.md) — `docs/reports/vehicle-mapping-audit-20261015.md`
- [车辆映射第二批修复：2026-10-15](reports/vehicle-mapping-batch2-20261015.md) — `docs/reports/vehicle-mapping-batch2-20261015.md`

## 车辆图片历史审计

- [Phase 3A Minimal Runtime Fix Report](../audit/train-images/PHASE3A_FIX_REPORT.md) — `audit/train-images/PHASE3A_FIX_REPORT.md`
- [Phase 3A Review Gate](../audit/train-images/PHASE3A_REVIEW.md) — `audit/train-images/PHASE3A_REVIEW.md`

## 历史变更与迁移检查点

- [5. 变更日志](../archive/DEVELOPMENT-CHANGELOG-2026-09-17.md) — `archive/DEVELOPMENT-CHANGELOG-2026-09-17.md`
- [5. 变更日志](../archive/DEVELOPMENT-CHANGELOG-2026-09-18.md) — `archive/DEVELOPMENT-CHANGELOG-2026-09-18.md`
- [5. 变更日志（2026-09-20）](../archive/DEVELOPMENT-CHANGELOG-2026-09-20.md) — `archive/DEVELOPMENT-CHANGELOG-2026-09-20.md`
- [5. 变更日志（2026-09-21）](../archive/DEVELOPMENT-CHANGELOG-2026-09-21.md) — `archive/DEVELOPMENT-CHANGELOG-2026-09-21.md`
- [DEVELOPMENT Changelog - 2026-09-27](../archive/DEVELOPMENT-CHANGELOG-2026-09-27.md) — `archive/DEVELOPMENT-CHANGELOG-2026-09-27.md`
- [Pixel Tetsudo — SQL 时刻表迁移归档检查点](../archive/TIMETABLE-SQL-MIGRATION-CHECKPOINT-2026-10-10.md) — `archive/TIMETABLE-SQL-MIGRATION-CHECKPOINT-2026-10-10.md`

## 数据恢复历史

- [Canonical 数据恢复历史](reports/canonical-recovery-history.md)
- [非 FULL SQL 时刻表历史验收](reports/non-full-sql-timetables.md)
- [Canonical 迁移审计记录](reports/canonical-migration-audit.json)
- [历史归档索引](../archive/README.md)
