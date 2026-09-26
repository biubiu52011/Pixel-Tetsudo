# DEVELOPMENT Changelog - 2026-09-27

## RC-5（2026-09-27，代码对照修订）

### 问题

DEVELOPMENT.md 与当前 main 的代码事实发生漂移：trains 页面已拆分为 config / utils / data / geometry / track-layout / render / page 多模块，line-service-relations.js 已进入 data-config-bundle 运行契约，CI 已依赖 recovery/baseline guard，但文档仍把部分内容写成设计稿或旧脚本链。

### 修复

- 更新 DEVELOPMENT.md 标题、目录、版本记录与术语表，登记 RC-5。
- 修正 trains 模块 ownership、脚本加载顺序、ODPT 唯一入口、TrainVehicle / TrainVehicleResolver 职责边界。
- 将 LineServiceRelations 从“只读设计产物”改为当前架构契约，并明确 LOS=显示分组、Relations=服务关系。
- 补齐 canonical migration → approved removal manifest → baseline refresh → guard verification 生命周期。
- 更新 CI/CD、Release Gate、CSP、data-config-bundle 与已知债务章节。

### 验证

- 本次只修改文档与变更日志，不修改运行时代码或 canonical 数据。
- 后续发布仍需按 DEVELOPMENT.md 第 12.9 发布门运行 guard 与必要的浏览器实测。

### 遗留

- train-vehicle-resolver.js 重复定义/重复导出与 ultimate fallback 仍记录为已知债务，未在本次文档同步中修代码。
