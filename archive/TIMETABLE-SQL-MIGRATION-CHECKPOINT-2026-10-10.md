# Pixel Tetsudo — SQL 时刻表迁移归档检查点

**记录日期：** 2026-10-10（日本时间）  
**GitHub 仓库：** `biubiu52011/Pixel-Tetsudo`，迁移验收基线提交 `cda875d556245db75306a3148d7ce9c3fc961573`  
**Supabase 项目：** `pnupwfmgbtxqhpzsrhfn`（像素铁道）  
**记录性质：** 双端盘点和可追溯索引，**不是**数据库文件备份，也**不是**线上浏览器验收通过声明。

## 1. SQL 数据基线

| 检查项 | 2026-10-10 数量 |
| --- | ---: |
| `railway_lines`（配置线路） | 224 |
| `line_data_inventory`（已全部归类） | 224 |
| 无完整 ODPT timetable API 配置的线路 | 187 |
| SQL 有时刻表模板的线路 | 188 |
| `manual_timetable_templates` | 74,114 |
| `manual_timetable_template_stops` | 785,514 |
| 至少两站且有至少两个真实时刻锚点的模板 | 73,368 |
| 原始数据只有一站的模板 | 536 |
| 至少两站但不足两个时刻锚点的模板 | 210 |

ODPT 有能力的线路优先走 ODPT；无 API 的线路使用已有 `train-runs` Edge Function → SQL 模板。不能因为 SQL 存在模板就宣称已验证完整车次覆盖，或在没有两处有效时间时生成推算位置。当前 Edge Function v18 ACTIVE，代码判定为至少两个站点和两个有时刻的站点；历史异常数据保留供溯源。

## 2. 现有清单状态（`line_data_inventory`）

| 数据库状态 | 条数 | 归档处置 |
| --- | ---: | --- |
| `migrated` | 184 | SQL 已导入；**原始来源继续保留**，需验收前不可删除 |
| `blocked` | 4 | SQL **已经导入**；仅质量验收阻塞，不是迁移未执行 |
| `indexed` | 36 | ODPT API 已配置、SQL 模板未导入；走 ODPT |
| `discovered` | 0 | 无待同步的旧标记 |

本次将原先 27 条 `discovered`（实际已有 SQL 模板）更新为 `migrated`；补录四条此前不在清单中的线路：`SaitamaRapid`、`ToyoRapid`、`TokyuShinYokohama`、`SotetsuJRDirect`。保留四条质量 `blocked`：`ChuoTatsuno`、`Shinonoi`、`Suigun`、`TokyuSetagaya`，明确标注“数据已导入，仅原文件存在单站记录”。

四条新来源固定到 Mini Tokyo 3D 提交 `c708abea8bf05ab56137a50e52c032112b6f9beb`；各车次的 `source_path` 存于 `manual_timetable_templates`，官方版本与 MIT 署名记录于现有 `evidence_sources` / `timetable_revisions`。先前补齐的越后线 `Echigo` 工作日 125 / 土休日 126 条已计入总量。

## 3. GitHub 文件分类与保护

`data/timetables/` 目录目前 246 个条目：**220 个 `*-manual.js` 原始时刻表**，另有 26 个证据、运用及辅助文件。**不可将整个目录作为已迁走的旧时刻表删除**。

- **RETAIN_RUNTIME：** 车辆编组、运行证据 JS（如 `vehicle-operation-evidence-data.js`、`train-operation-evidence.js`、各运营公司 `formation-evidence`）仍由 `pages/realtime.html` / `pages/trains.html` 载入，不能删除或整体搬走。
- **RETAIN_PROVENANCE：** 220 个 `*-manual.js` 原文件。各页面 HTML 未直接静态引用这些文件，但 `js/data-fusion.js` 的 `ensureManualTimetable()` **仍会动态请求**，既可能作为 SQL MISS 时的旧回退路径，也可能为 ODPT 线路提供 `vehicleType` 证据；至少 `tools/performance-lifecycle.test.js` 直接读取 `NewShuttle-manual.js`。**因此目前零文件可安全直接删除/移动。**
- **SQL_PRIMARY：** 有 API 时以 ODPT 为准；无 API 时，已有 SQL 模板是预期主要时刻表来源。此为架构目标而非“旧 JS 加载路径已完全清除”的断言。
- **HOLD_FOR_REVIEW：** 536 个单站模板、210 个时间锚点不足的模板；10 条只具 `Weekday` 来源的新干线，不得未经官方核实即复制成 `SaturdayHoliday`。
- **ARCHIVE_DOCUMENT：** 本文件仅作盘点检查点，既不新增数据解析脚本，也不改变生产数据选择逻辑。

## 4. 验收缺口和解封条件

1. **双链路收敛：** 检查 `DataFusion.ensureTimetable()` 在 SQL MISS、网络错误、ODPT BYPASS 时对 `ensureManualTimetable()` 的处理；必须分离车辆证据读取和位置估算，保留车型识别但不能让旧 JS 在 SQL 已迁入线路重建另一套生产时刻表。
2. **实际线上验收：** 工作日和土休日分别访问 `train-runs?line_id=...&service_date=...&fallback_only=1`，检查 ODPT API 线路 BYPASS、SQL 无 API 线路 HIT/PARTIAL、跨日车次和页面图标连续性。2026-10-10 时尚未独立获得成功的公开 HTTP 响应或浏览器运行证明。
3. **历史质量处理：** 对 746 条不完整模板逐条查原始来源；无法核实的保留为不可定位的历史证据，不得猜停站/时刻。
4. **新干线服务日：** 查证 10 条仅 `Weekday` 的原文件实际使用日历；在正式验证前不能误认为土休日完整。
5. **真正备份：** 在变更或删除原文件前另行导出数据库结构、模板、停站、来源记录并校验可恢复性；本检查点未执行数据库备份。
6. **CI/CD：** 基线提交 `cda875d556245db75306a3148d7ce9c3fc961573` 的 CI / CD、Release Guards、Pages 均成功；后续归档文档提交须重新查看 Actions 结论。

**处置结论：当前执行“清单整理＋只读归档检查点”；不可执行物理搬迁、删除旧 JS、宣称双链路完全解决、或宣布全系统冻结。**
