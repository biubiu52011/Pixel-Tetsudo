# Canonical 数据恢复历史

本页说明历史来源，不是恢复任务执行入口。原始 recovery 目录及五份车型专项报告已按内容去重封存在主工作区 .work/backups/recovery-archive.zip，逐文件 SHA-256 清单保存在同目录 recovery-archive-manifest.json。

早期 Phase13 原始快照记录152条线路、503个车站；2026年8月的迁移曾仅包含60条线路。历史快照不能替代现役 data/core/railway_data.json，数量与最新完成状态以当前数据和 PROGRESS 为准。

## 正式文件归属

- 生产实体基线、approved removal manifest、Home UI 基线和架构 inventory现位于 tests/fixtures/guards/，迁移时字节不变。
- [2026-09-27 canonical迁移审计](canonical-migration-audit.json)保留原始审计事实。基线JSON内部的旧路径是当时的来源记录，CI不把这些字符串用作文件依赖。
- [2026-10-14非FULL SQL历史验收](non-full-sql-timetables.md)保留当时方案与测试范围。
- [现役车型说明](../train-vehicle-plans.md)与[工程规则](../../ENGINEERING.md)管理后续开发。

原目录中的 source、before、日志、临时执行器和API样本都已封存；它们不参与生产、SQL迁移或CI执行。不要恢复整个目录作为发布步骤。需要比对旧文件时，应从本地归档解出到 .work 中。
