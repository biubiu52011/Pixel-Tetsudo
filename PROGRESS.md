# Pixel Tetsudo 工程进度

## 2026-10-14 JST — 方向／目的地标签恢复图标正下方（本地完成，发布待验收）

- 用户指出方向应该在列车图标正下方。常规线路 _trainLabelY 的上／下行共用 py+21，方向箭头仍按实际运行方向；共享 resolveLabels 固定横向中心，只允许向下避让，不再横移或移到图标上方。移位时保留竖直引导，完整终点不裁切。既有大江户六形地图的专用方向走廊继续使用原入口。
- 适用仅 trains 的共享 renderer/layout；其余六页不加载这两个模块，车型／SQL／拓扑不变。缓存资源 4.3.1210。新增真实函数上下行／未知方向锚点检查与密集标签不横移／不上移回归。
- 本地 Joban DOM 13 标签全部位于所属 PNG 下方；横向中心最大误差0.000041px、最小间隙5.59px，标签互相重叠0、error0。密集站点仅向下延后标签，并用竖线保持归属。
- 修改前备份 recovery/local-backup-20261014-before-caption-anchor；原六项独立修改保留。


## 2026-10-14 JST — 常磐快速车辆判定补齐（DONE：SQL／公开页面验证通过）

- 用户要求补齐当前 Joban 页车辆判定。复用 Supabase train_vehicle_rules／evidence_sources、既有 export-vehicle-operation-evidence.js、TrainOperationEvidence、TrainVehicle 和原生 PNG；未新增第二套车型 resolver、线路后缀默认值或运行拓扑。
- 当前公开 JO/J 20260314 平日／休日表、确切列车号／列车种别／首都圈停站及同编组 G 组，与 JR East E231、E531、Hitachi/Tokiwa E657 官方资料交叉核对。按线路+完整列车号+calendar 写入 1,143 个 Grade-C timetable-reference：Joban 682（平日343+休日339，现有班次全部覆盖）、JobanMain 375、NaritaAbikoBranch 86。323M↔1152M／1157M、327M↔462M 为明确刊载的同编组关联，不是所有 M 号默认 E531。北段 E501/E531 混用等未核对号保留未判定。
- 计划车型适用 2026-10-14～2026-11-30，到期必须重新核验；不声称当天实际编组、特殊涂装或未验证的时刻表日期。原 ODPT template source_revision_date=null 等状态保留，不提升为当前已核验时刻表。成田线页面／拓扑仍独立。
- 既有 canonical exporter 的 mapping-input 更新两份快照，保留全部原 records／datedRecords／familyRules／aliases／carsets；既有 2,660 条 reference 全部保留，总数 3,803；inventory 与 SQL 增量一致。
- 修复共享 TrainPositionEstimator 缺失 source calendarType：纯 SQL 位置也能按源 Weekday／SaturdayHoliday 解析车型参考；不根据宿主日期或线路号段猜车型。TrainVehicle 增加 E657 标准模型原生 PNG 的明确目录登记，不从列车号判特殊涂装。三种 PNG 均原生 82×98。
- 适用页面 trains／realtime 共用车型与推算模块，相关三个资源 4.3.1209；home/history/tourism 不加载该链路，无需改运行逻辑。63 页面／服务日检查、31 tools suites、4 Python guards PASS（保留既有基线警告）。新增完整 SQL-reference→车辆→PNG、纯 SQL 推算平日／休日、跨线／过期隔离及实时车型优先回归。
- 本地真实 Joban DOM 当前 18 个标记全部 vehicle PNG，未判定 0、浏览器 error 0。来源原件、SHA256 manifest、SQL 导入／导出与修改前备份保存在 recovery/joban-vehicle-evidence-20261014；其他六项既有本地修改保留。
- 发布 d04a33ebd6502e9446f4a69bc4c4b3bafd4e8e74；CI / CD 38521567650、Release Guards 38521567540、Pages 38521566583 全 success。三个公开脚本 HTTP 200 并逐字匹配提交。公开浏览器当前 18 标记全部 PNG，车型为 E231常磐快速／E531／E657，未判定 0、标签重叠 0、error 0、无横向溢出；加载 build=d04a33eb。SQL 对照再核对：Weekday343/343、SaturdayHoliday339/339。报告 recovery/reports/2026-10-14_joban_vehicle_completion.md；发布后验收记录保留本地。


## 2026-10-14 JST — 页面问题汇总修复（DONE：发布与公开页面验证通过）

- 成田线保持独立，Joban presentation.lineIds 仅 Joban；常磐快速日／中／英文标题移除成田线，NaritaAbikoBranch.branchOf=Narita 保留，实际我孙子跨线班次仍按证据判断。此前融合条目已明确标为撤回。
- 保留既有上野东京走廊语义、上野基础终点、品川延伸停站与实际目的地，以及同站交接的 running-chain 修正。
- 复用 TrainTrackLayout：稳定标识槽位发生哈希碰撞／相邻段重合时再次避让，不改变 stationIndex、段进度或删除列车。复用 trains-render 标签更新生命周期：完整目的地避开站名、图标、其他目的地；移位标签带虚线引导；动画每帧共用一次布局，既有大江户六形专用布局保持。
- Supabase 只读核对：Joban 相关 train_vehicle_rules 仅 chiyoda-joban-odakyu 缓行网络 1593 行；常磐快速／本线未找到可用规则或 operation observations/runtime evidence。保持未判定圆点，未从线路／号段猜测车型，未写入数据库。
- 新增同站 12 班列车不重合、反转 SQL 行序保持布局、8 个目的地避让站名／彼此并保持边界、独立标题／支线归属回归。31 tools suites、63 node checks、4 Python guards PASS（既有 baseline warnings）。本地真实页面 13 标记／13 完整标签，标签重叠 0，无浏览器 error／横向溢出。
- 修改前备份：recovery/local-backup-20261014-before-summary-fix；保留原有六项独立本地修改。发布仅三个标题字段、共享布局／渲染与 trains 资源 4.3.1208、回归和本记录。
- 发布提交 2ea7d5e028cf142f8e4b6b9d137d585ef20aa891；CI / CD 38506660361、Release Guards 38506660586、Pages 38506659081 全 success。公开布局／渲染／canonical JSON HTTP 200 且匹配提交。公开浏览器测得 13 标记／13 标签：标记互相、标签互相、标签与站名的重叠均 0，error 0，无横向溢出；独立卡片常磐快速上野↔土浦／成田线佐仓↔松岸、UenoTokyo 卡片 0。报告 recovery/reports/2026-10-14_joban_summary_fix.md；本条发布后验收记录保留本地。


## 2026-10-14 JST — 用户叫停：撤回成田线融合

- 用户明确“有单独的成田线，不要融合”。停止该方案，撤回 34122a62／74164c7a 的组合成员与地图融合改动，恢复独立成田线及原支线归属。保留此前上野东京走廊与上野基础终点修正。
- 发布仅撤回融合范围；其他原有本地数据修改保留。资源升至 4.3.1203 使撤回立即可加载。


## 2026-10-14 JST — 常磐快速・成田线组合范围补齐（已按用户要求撤回）

- 用户指出标题包含成田线但地图只绘常磐快速，先前验收漏查该范围。根因：NaritaAbikoBranch 物理 branchOf=Narita，Joban presentation.lineIds 只有 Joban；原 geometry／positions 仅依父子关系，漏掉另一个父线下的组合展示成员。
- Joban 既有 presentation.lineIds 增加 NaritaAbikoBranch。共享 LinePresentationService.getMapBranchIds 根据 canonical 支线与显式组合成员范围统一给 geometry、train positions、activation 供给。保留 NaritaAbikoBranch.branchOf=Narita、原拓扑／运行情报／SQL source identity，不重新建表、改名或复制站表。
- 我孙子 junction 与东我孙子、湖北、新木、布佐、木下、小林、安食、下总松崎、成田九个站点使用既有支线几何；支线 SQL 列车以 branch fusionRole 投影到该列。成田主线原页面仍保留我孙子支线和机场支线。
- Supabase 原有平日 80／SaturdayHoliday 80 班次；本次只读核对，未修改 SQL。新增真实数据结构回归同时验证成员范围、双页面分支、物理归属、支线列车、移动／桌面九站坐标与画布边界。
- 验证：31 tools suites、64 页面／服务日检查、4 Python guards PASS（既有 baseline warnings 保留）。相关资源版本 4.3.1201。原有其他本地修改保留，数据发布仅含 presentation.lineIds 增量。
- 下一步：同步上线并实际检查公开 Joban 地图的支线站点和支线列车；此前截图／视觉声明不代替这次验收。



## 2026-10-14 JST — 上野东京运行走廊语义修正（DONE）

- 用户更正：上野东京线是连接品川—上野的共用运行走廊，不是独立线路；常磐以上野为基本终点，部分班次（含特急）按实际时刻表延伸品川。
- 复用 RuntimeConfig 的走廊角色声明、共享 LinePresentationService／DataState／LineCard、trains-data 和 RunningChainResolver：走廊不生成独立线路卡片或直通标志，不参与列车跨线路后继拼接；原 source records／站表／SQL 保留。Joban presentation.originStation=Ueno，只影响基础区间文字，保留所有品川延伸停站与特急实际目的地。
- 修正所有线路交接条件：前段末站必须等于后段首站，不能只因两站同属 handoverStations 集合而串联。成田线等真实跨线关系与证据判断保留。
- 测试：63 页面／服务日检查、31 tools suites、49 线路排序、运行情报隔离、4 Python guards PASS（既有 baseline warnings 保留）。新增多交接站误串复现、走廊隐藏／真实成田直通保留、常磐上野基础区间卡片检查。相关七页资源版本 4.3.1200。
- 既有独立本地数据改动不纳入本次发布；railway_data.json／file fallback 仅发布 presentation.originStation 增量。修改前文件备份于 recovery/local-backup-20261014-before-corridor-fix。
- 最终发布 HEAD：5e18ad0a0b4158b537f8c78000ce99ee54914210（生产增量 ea75bbb3／4505d6f7；测试调用参数修正 5e18ad0a）。CI / CD 38504289194、Release Guards 38504289184、Pages 38504288765 均 success。
- 公开浏览器 DOM：常磐卡片为 上野↔土浦，UenoTokyo 独立卡片数 0；地图保留 品川／上野，直通上野东京文本 0，列车标记中 UenoTokyo 误串 ID 0。按真实班次停站及 destination 保留品川始发／终到，包括特急。未做系统截图或宣称人工视觉验收。
- 发布完成后的验收记录保存在本地；原有六项独立修改保持，JSON／file fallback 仅向线上增加 originStation 字段。



## 2026-10-14 JST — 公开 Joban 页面只读检查（DONE：诊断；未修复）

- 用户要求检查当前浏览器 trains.html#Joban。实际 DOM／日志、只读 Supabase SQL 与现有 resolver 最小复现完成；未修改生产脚本或数据库。
- P1：running-chain 将 Joban 1161M 与 UenoTokyo 1159M、1157M 与 1155M 错串。_confirmedEdge 仅要求末站／首站各自在 [Ueno,Tokyo,Shinagawa] 内，没有要求同一交接站；上野 11:32 → 品川 11:35 被当作 dt=3、numberChanged=true、sourceLinked=false 的连续边。
- P2：实际目的地 DOM 边界框捕获 5 对重叠；同站圆点也重合。
- 车型覆盖缺口：初始 20 标记均为未判定圆点，0 PNG；Joban／JobanMain／UenoTokyo 现有证据审计为 0，抽查 SQL mapping unresolved。中性降级本身符合证据规则，不是 PNG 文件损坏。
- 页面加载／状态正常，浏览器 error／warn 为空，503×603 视口无横向溢出；未使用系统截图。报告：recovery/reports/2026-10-14_joban_browser_inspection.md。原有本地修改保持。

## 2026-10-14 JST — 本地备份、线上同步与 trains.html 公开发布（DONE）

- 用户明确授权保留本地备份、与线上同步并公开对接 trains.html。24 个文件逐文件 SHA256 备份通过；原始完整 binary patch 和 manifest 保存在 recovery/local-backup-20261014-before-publish，Git stash backup-before-non-full-sql-publish-20261014 继续保留。
- 工作区已快进至 origin/main 5483796c8cbed364b0158a95ab7f6a5de9e31cac，在最新脚本上合入非 FULL SQL 策略；保留线上新增日历有效性、候选车型分级、列车去重、荒川 ODPT trip ID 保护、渲染和日期叠加功能。未覆盖 Supabase v142/v7 函数。
- 发布范围为既有 ODPTClient、DataFusion、trains-page 的共用 SQL 选择规则、共享配置注释、七页相关资源版本 4.3.1199 及回归测试／执行记录。本地其他原有数据、Meguro manual、normalization backlog、db-loader 改动在备份／工作区保留，独立于本次发布。
- 最新基准验证：31 tools suites、61 node:test checks、4 Python guards PASS；保留既有 baseline warnings。SQL 已有 210 非 FULL 线路，13 FULL 禁用 SQL，新增班次导入及 PNG 检查记录见本次报告。
- 发布代码提交：0cccd721bf834f568f7a881b7879be7aa9ad5e3d。CI / CD 38495454495、Release Guards 38495454599、Pages 38495454358 全部 success；公开四个改动脚本 HTTP 200、SHA256 与提交内容一致，页面资源版本 4.3.1199。
- 真实浏览器 DOM 验收通过：公开 trains.html 山手线显示 planned-trip 1000G／929G 等 SQL 班次及原生 E235系0番台 PNG；埼京线显示 odpt.Train／urn:ucode 实时标记，接口为 REALTIME_API_LINE BYPASS；没有浏览器 error 日志。未使用系统截图或声明人工视觉验收。
- 原有六个独立本地修改逐文件 SHA256 与备份一致；备份、binary patch 和 Git stash 均保留。发布验收材料存放在 recovery/local-backup-20261014-before-publish。



## 2026-10-14 JST — 非 FULL 线路统一 SQL 时刻表（数据库完成；前端本地验证完成）

- Workstream：non-full-sql-timetables；执行者 Codex；Commit SHA：未提交。用户明确要求 ODPT／SQL 列车号 → 线路车型对应 → TrainOperationEvidence → TrainVehicle → PNG 检查，非 FULL 统一 Supabase SQL。本次要求优先于此前“所有实时 API 线路禁止 SQL”的记录。
- 复用既有 ODPTClient、RuntimeConfig、DataFusion、trains-page 及 Supabase 导入／canonical mapping 链。覆盖模式与 API 存在性分离：210 非 FULL 使用 SQL，13 FULL 禁用 SQL；实时观测仍优先，缺失或错误 SQL 不复活旧 JS 位置源。日期滚动与直通依赖同步采用新规则。
- Supabase SQL 更新 railway_lines 的现有 eligibility 字段；通过现有 SQL job／timetable-ingest／persist_odpt_timetable_templates 补齐 18 条线路的平日与休日。36 jobs：26 complete、10 partial、0 failed；新增 12,842 有效班次、220,482 停站，171 不完整上游记录被排除。现有 210 条 SQL 线路、92,320 模板，缺失非 FULL 线路及新增模板 canonical resolution 均为 0。
- 实测服务接口：Yamanote 522／Mita 406／Rinkai 296，Keiyo 558 PARTIAL，Kawagoe 3 PARTIAL；SaikyoKawagoe FULL BYPASS。山手线实际 SQL 522 条经既有证据／车型解析均得到 E235系0番台同车型原生 PNG。证据不足的其他列车不猜车型或编成。
- 验证：31 tools suites、50 node:test checks、4 Python guards、JS syntax、diff check PASS；83 canonical artworks、78 refs、466 locked PNG、0 missing native PNG。保留既有工程 baseline warnings。七页相关资源版本升至 4.3.1198，原有未提交改动保留。
- 修改：data/api/odpt-unified.js、runtime-config.js／data-config-bundle.js、js/data-fusion.js／trains-page.js、两个既有 Supabase function 源文件、两个既有测试、七页资源版本及本进度记录。完整执行与验证记录：recovery/reports/2026-10-14_non_full_sql_timetables.md。
- 发布边界：数据库 SQL 已执行；前端未提交／推送／发布，browser runtime: NOT VERIFIED。未部署或降级现有 train-runs v142／timetable-ingest v7，它们已经支持 SQL eligibility；本地改动保持较旧工作区接口，不整文件覆盖线上新功能。


## 2026-10-13 JST — SQL 已核验车辆 PNG 路径断链修复（REVIEW）

- 根因：`train-runs` 经 `train_timetable_source_resolution` 已传回 source-dated `dated_operation_owner` 车型与 `vehicle_artwork_path`，但 `js/train-position-estimator.js` 的 `resolveTrainRunIdentity` 和 `matchRealtimeVehicleEvidence` 只让 `dated_schedule_rule` 携带图片。既有 TrainVehicle 解析器因此收到确认车型却丢失可用 PNG，渲染退化为中性点。
- SQL 只读核验：`train_timetable_vehicle_mappings` 中 `dated_operation_owner` 64 个车型映射，`train_timetable_vehicle_artwork` 均为已登记的 `相模鉄道_20000系_YOKOHAMA_NAVYBLUE.png`；GitHub 列车图库 468 张 PNG、Supabase 467 条资产登记、38 个编成图标链接，SQL 引用路径均存在于 Git 树。
- 修复：仅扩展现有 `js/train-position-estimator.js` 的 3 个 source-dated PNG 许可条件，从仅 `dated_schedule_rule` 改为允许 `dated_operation_owner`。模型仍必须是单一来源认证的同一 identity，路径仍须经过 `TrainVehicle.resolve` 的 exact-model + gallery path 检查；不把 `source_single_type_candidate` 升级成准确车型，不引入新脚本/映射表，也不更改 SQL/RLS/静态拓扑。
- 提交：`5e847bae`（代码）；`20d1837f`、`292e6a80`（补充并隔离已有 `tools/train-vehicle-icon-resolution.test.js` 的 source-dated owner/候选负例回归）。
- 测试：最新版 `292e6a80` 的 GitHub Release Guards 已成功，CI Validate 已成功。GitHub Pages 的最终部署及交互可视化仍需以最新 Actions 与真实浏览器检查为准；无外网 DNS 时不伪称生产 PNG HTTP 200。
- 限制：本次恢复的是已有充分证据的 PNG 通路，不代表 223 条线路的每一趟列车都能断言具体车型。无证据列车保留灰点，不凭运营线路、车次或图片名称猜测。
- 浏览器兼容补充：列车 SVG `<image>` 创建及路径更新时，现同步设置 SVG2 `href` 和带命名空间的 `xlink:href`，与既有站内图标双引用策略对齐，降低 Safari/iOS 兼容风险（`1cf11ed9`）。新增 `tools/train-vehicle-icon-resolution.test.js` 双属性回归（`e21bfab7`），`tools/train-position-evidence-regression.test.js` 的仿真 DOM 补充 `setAttributeNS` 和真实 SVG 双属性断言（`839be1a8`）；测试不依赖改变车型判断。
- CI 修复记录：`e21bfab7` 曾在 Train Position Evidence 回归测试失败（模拟 SVG 节点遗漏标准 `setAttributeNS`，非生产 JavaScript 运行时缺失）；已针对 test fixture 修复，`839be1a8` Validate 与 Release Guards 成功，最终 Pages 以 Actions 验收结果为准。
- 后续：若用户所指为其它具体线路仍不显示，按该线路的 `vehicleIdentityStatus`、`vehicleIconPath`、浏览器 SVG image/error 与 ODPT 源记录排查；线型参考图片本身不能证明某一具体班次使用该车，禁止批量填充猜测车型。


## 2026-10-13 JST — GitHub × Supabase 结构体检整改（PARTIAL）

- 范围：只修复已确认且不改变线路事实/身份/RLS 的问题。没有批量删除手动时刻表、迁移 pg_net、覆盖已验证车型或复活第二套位置推定。
- 数据库索引：执行 Supabase migration `20261013072931_index_timetable_ingest_jobs_line_fk`，给 `public.timetable_ingest_jobs(line_id)` 增加外键索引；GitHub 同名文件已同步（`2dd13aeb`），Performance Advisor 的 `unindexed_foreign_keys` 告警已消失。
- 日期有效性：`train-runs` 在原 `train_timetable_source_resolution` 查询中读取已有 `timetable_validity`，每班返回 `timetable_validity` 和 `timetable_date_verified`，并新增 `date_verified_runs` / `date_unverified_runs`。不改变原 `complete/partial` 的结构完整性含义，不将来源日期未知当成当前有效，也不删掉可用的停站推定（`53542744`）。
- 防回归：扩展现有 `tools/performance-lifecycle.test.js`，检查来源日期验证与结构完整度独立（`ec070a35`）；对应 GitHub CI / CD 与 Release Guards 已成功。
- Supabase Edge：`train-runs` 已发布为 ACTIVE v70，部署源码与 GitHub 逐字节一致，保留已有公开只读 GET / `verify_jwt=false` 契约。无法由当前执行环境直连实际 HTTP 端点（外网 DNS 不可用），所以不声称真实 API 响应验收通过。
- 数据证据：未修改数据库中 `undated_not_current_verified` 或 `actual_vehicle_confirmed=false` 的原始状态，绝不凭数据行完整、计划车型或 PNG 文件名提高证明级别。
- 尚未自动处理（需要前置条件）：`timetable-ingest` 仍有从公开仓库解码 ODPT key 的兼容路径。现有工具不能查看或设置 Edge secrets，也不能替上游轮换凭据；在确认 `ODPT_CONSUMER_KEY` / `ODPT_CHALLENGE_CONSUMER_KEY` 已配置前删除 fallback 会使导入中断。需要先配置新服务端凭据，再移除公开回退并做真实导入验收。
- 保留（不属于安全一键修复）：45 张 RLS enabled/no policy 表默认拒绝访问；`pg_net` 扩展 `extrelocatable=false`，禁止直接 `ALTER EXTENSION SET SCHEMA`；历史未使用索引/源时刻表缺少现行有效证据，继续保留待测，不做无凭据猜测。
- 最低验证：迁移文件与数据库版本一致；索引存在；性能告警下降；GitHub CI / CD & Release Guards 成功；Supabase Edge v70 源码一致。尚需浏览器生产 HTTP 与真实接口返回的最终验证。


## 2026-10-13 JST — realtime 分支梳理与增量落地（REVIEW）

- 依据提交历史梳理 9 个 realtime 相关远程分支与 main 的关系：`ome-itsukaichi-isolation`（data-state.js/line-card.js/runinfo-scope 测试与 main 逐字节一致）、`yamanote-single-chain`（data-fusion.js 已含 "No parallel realtime merge"、无 Composite mode 残留）、`yamanote-canonical-station-indices`（trains-geometry.js 与 main SAME，canonical index 断言已在）、`odpt-realtime-vehicle-evidence`（JST 服务日修正 `_snapshotJstNow` 已在 main）、`odpt-dual-source-model`（main 已有 matched-timetable 与 dated_operation_owner）、`odpt-default-markers`（main 的 roster/vehicle 证据链已超越分支）均已吸收；`realtime-source-authority` 的 `_realtimeSourceIdentity` 已在 main。
- 移植 `fix/double-column-loop-readability-20261011` 的双列环可读性增量：`js/trains-geometry.js` 双列环 rectW 加宽（移动 120/桌面 132，普通环 63/67.2 不变）、修复 `svgW = rectW + _isMobileView() ? 225 : 240` 运算符优先级 bug（恒取 225/240，丢弃动态环宽）、返回对象补 `isDoubleColumnLoop`；`js/trains-render.js` 站名标签双列偏移 ±24、新增 `_trainLabelDisplayX` 将环方向标题移入内环走廊并在初绘/逐帧两处调用。保留 main 的 canonical index 存储（分支旧 loopPts.push 不回退）。
- 移植 `fix/realtime-source-fusion-safe-20261010` 的 3 项独立修复：`_isFreshRealtimeRecord` 拒绝未来 `dc:date`（> now+60s 时钟偏差）；ODPT railway 多候选匹配改唯一匹配（`_mappedMatches.length===1` / 精确 `_exactMatches`），移除子串猜测兜底；`_linePositionIndex` 空 trainId 不折叠、`set` 前判空。其余分支改动（_uniqueMatchedChain/_timetableFallbackReason/odpt-unified 缓存）已被 main 10-13 融合管道重写取代，不移植。
- 测试：`train-position-evidence-regression.test.js` 新增双列环布局、唯一匹配、空 trainId、未来时间戳 4 组断言；railway-browser-contract 26 pass、vehicle-icon/runinfo/performance 全 PASS，brace/arch/ci/home 4 个 Python guards PASS，`git diff --check` 通过。trains.html 的 trains-geometry/trains-render 版本升至 4.3.1197。
- 未提交/推送/部署；先前本地 TokyuMeguro-manual.js / normalization backlog / PROGRESS 部署记录保留。真实浏览器视觉由用户人工确认（项目规则：禁止系统截图确认）。

## 2026-10-13 JST — realtime 实机体检与 ODPT 命名空间修复（REVIEW）

- 实机体检（桌面浏览器 + DevTools）确认：线上 trains.html 三脚本均为 4.3.1197 且 SHA256 与本地一致；山手线双列环（#Yamanote）左右站名、内环/外环方向标签（环带走廊）、换乘字母（JA/JS/JB/M/S/E/KD/OH/JK/JC/G/JO/JE/JU/JT/Y）均无遮挡；京叶线（#Keiyo）站点/换乘字母正常；console 无 JS 错误；运行情报弹窗（埼京线·川越线）直接显示 ODPT text 原文（平常運転，更新 16:12）。湘南单轨官网外部状态图 2 个 404 属 runinfo 降级，非本次范围。
- 体检发现并修复唯一匹配回归（提交 `55de0918`）：ODPT `odpt:railway` 带运营商命名空间前缀（如 `JR-East.Joban`），而 `_railwayCodeLines` 的 key 是无前缀短名（`Joban`），导致修复前唯一匹配永远 miss、京叶线/常磐线位置落入 ambiguous 分支（console 曾出现 1473E/JR-East.Keiyo、2394M/JR-East.Joban 两例）。修复：`var _shortRailway = String(railwayName).split(".").pop();` 后再查 `_railwayCodeLines[_shortRailway]` 与 `_exactMatches`；映射命中如 `JR-East.Joban` → `JobanMain`（常磐線本線），未映射短名走精确匹配（`Keiyo` → 京叶线）。测试补命名空间规范化断言；`train-position-evidence-regression.test.js` 全 PASS。
- 部署确认：55de0918 推送后线上 data-fusion.js SHA256 与本地 match=True 且含 `_shortRailway`；页面刷新后 console ambiguous 日志消失，新 build 以 `?build_ead08907a08956` 出现在 odpt-unified.js 等资源 URL。远程 main HEAD = 55de0918a267d6ef411e250086ead08907a08956，本地与 origin/main 0 ahead / 0 behind。
- 视觉验收由用户人工确认（项目规则：禁止系统截图确认；诊断截图用完即删）。

## 2026-10-13 JST — mapping cleanup and snapshot validity optimization

- Deployment verified: `6f0bbf801d530f20395ca126eb0191eb57c3905b`; CI/CD `38348625461`, Pages `38348624436`, Release Guards `38348625389` and canonical sync `38348625381` all succeeded. Published trains HTML uses this build, and all three changed runtime scripts match local SHA256. Deployment audit saved as `mapping-optimization-deployment.json` outside the repository.

- Kept the existing scripts and shared data chain. Vehicle rosters now index owner/car and owner/formation, select the newest snapshot not after service day, then validate active status. Retired/status-conflicting records cannot revive an old active car; canonical alias duplicates converge. Snapshot replacement rebuilds indexes.
- Evidence network matching caches the verified alias graph, handles deep/cyclic aliases, and parses ODPT railway namespaces explicitly. Removed arbitrary suffix matches; audit uses this exact shared matcher rather than a second alias implementation. Realtime fallback identity uses normalized operator scope.
- Coverage audit now uses the estimator's Japan service date/calendar and separates historical from current eligible evidence: 223 lines audited, 35 with stored evidence, 17 with currently eligible rules on 2026-10-13 weekday. Eligibility still requires exact train/run matching; it does not certify every train or today's formation.
- Extended existing tests for retirement, future snapshots, conflicting status, deep/cyclic aliases, cache replacement, suffix isolation and JSON/browser roster parity. 31 tools suites and 49 service-day/browser tests passed; four Python release guards and HTML/script verification passed. OCR delegation review includes changed runtime/audit and manually includes test files; unrelated Meguro/backlog changes preserved.

## 2026-10-13 JST — all-line vehicle mapping and deduplication

- Deployment confirmed: `daf7b982be7035ce0a130b02b5a1514f8e07c16c` pushed to main. CI/CD `38347461263`, Release Guards `38347461260`, canonical sync `38347461271`, Pages `38347461046` all succeeded. Published HTML points to this build; runtime/evidence/05 shuttle PNG match local hashes. Final service-day/browser total: 49 tests passed.

- No new project scripts. Shared `TrainVehicle` now resolves source-supplied car/formation IDs against sourced SQL carsets, scoped to owner and snapshot date. Physical identity outranks planned references; contradictory physical/model evidence blocks PNG selection.
- Existing canonical exporter admits every source/date/calendar-complete network, instead of Saikyo only: 2,660 references (Saikyo 826, Chiyoda–Joban–Odakyu 1,593, Odakyu main 241). The 67 Tobu rows without calendar remain excluded from this provider; existing Tobu evidence stays intact. Added 8 TWR carsets / 80 car IDs through the Supabase read-only connector export, without exposing credentials.
- Official Tokyo Metro Chiyoda 05 shuttle identity projects to its existing native PNG; bare ambiguous 05 family remains unresolved. All six exported reference models now have model-exact PNGs.
- Realtime deduplication uses source `owl:sameAs`/train object identity, or operator/railway/number/direction scope, and rejects older duplicate records. Existing SQL/realtime running-chain deduplication remains the single physical-run join.
- Existing artwork audit checks all 223 canonical lines: 35 have local source-scoped evidence; all others require explicit source identity. 83 canonical artwork records, zero missing native PNG paths. Report saved outside repository as `all-line-vehicle-mapping-audit.json`.
- Validation: 31 tools suites, service-day/browser contract tests, all 4 Python release guards pass. OCR delegation review covers runtime/export/audit changes and generated snapshot consistency; unrelated local Meguro/backlog edits remain untouched.

> 本文件是智能体之间的**唯一共享进度账本**。开始工作前先读 `ENGINEERING.md` 和本文件；完成/阻塞/交接后必须更新本文件。
>
> 最后人工整理：2026-10-07 JST








## 2026-10-13 JST — train icon deployment verified complete

- 发布提交：fbcc68828714b077d9c89363b6536827cf928b67，已推送 origin/main。CI / CD run 38339581582 的 Validate 与 Deploy to GitHub Pages 均 success；Release Guards run 38339581463 success；pages build/deployment run 38339580685 success。
- 线上验收：pages/trains.html HTTP 200，引用本次 ?build=fbcc688... 且含 no-cache meta；railway_data.json 的 JO 成员为 [Yokosuka,SobuRapid]；新 db-loader cache key 识别 build 标记。抽查 3 张已有列车 PNG HTTP 200、SHA256 与本地完全一致。
- Supabase：train-runs 已部署 ACTIVE v60，保留既有公开只读 verify_jwt=false 配置；旧 v59 源码/元数据已备份到当前对话 visualization。真实请求 Rinkai / 2026-10-13 = HTTP200、SQL HIT、296 个 canonical timetable runs；SaikyoKawagoe = HTTP200、REALTIME_API_LINE BYPASS、0 SQL runs，实时数据源隔离正常。Rinkai 响应无 certified vehicle label，不能据此声称全部车次都有已确认车型；无证据继续维持 UNKNOWN，而不猜图标。
- 校验范围：资产发布、CI/Release Guards、线上页面/缓存/JO 数据、PNG 完整性及真实 SQL/API 读请求；未进行人工浏览器互动验收。
- 发布未包含先前独立的 TokyuMeguro-manual.js / normalization backlog 修改；仍保留本地文件及原始 stash/备份。本段是部署后的本地进度记录，尚未另行提交。

## 2026-10-13 JST — train icon deployment release (in progress)

- 用户明确授权完成列车图标部署。发布已验证的最新版整合及 JO 合并展示修复，保留 canonical 实体、车辆/编成证据、同车型 PNG 和实时/SQL 单一链路。原始本地工作仍在备份及 stash。
- 发布范围：页面/缓存/地图数据融合/SQL 日期查询/现有测试；TokyuMeguro-manual.js 和 normalization backlog 是先前独立修改，本次不提交、不发布。没有新增脚本。
- 发布前检查：47 node:test PASS；49 排序/JO 地图检查 PASS；77 图片引用 PASS；466 locked PNG 内容校验 PASS；列车图标身份/同车型映射回归 PASS。此前全套 33 工具测试与4工程 guards 已通过。
- 新修复：db-loader 的缓存 key 识别 deploy workflow 的 ?build=SHA，同时兼容 ?v=，避免新发布继续读取分开 JO/旧图标的静态缓存。新增实际版本键行为测试。
- Supabase train-runs v59 部署源码已备份，并确认其与 GitHub 最新基准一致；拟发布已测试的日期 run/stop 分页及部分有效数据保留。沿用现有 verify_jwt=false 的公开只读接口，不改 schema，不发布 importer。
- 完成条件：GitHub CI/CD 与 Release Guards 成功，Pages 实际页面为本次 build，静态图标可访问；Supabase 函数更新并通过真实读请求验证。

## 2026-10-13 JST — JO combined presentation restored after user correction

- 用户明确：横须贺线与总武快速线分开是错误编译产物，不能当作新版设计。此前为接受分开结构而修改 real-data 测试的判断已撤销；原“独立 JO”整合记录是错误判断，以下更正为准。
- 只恢复两条 canonical line 的 presentation.lineIds = [Yokosuka, SobuRapid]，Yokosuka 为展示 primary。保留独立物理站表、时刻表、运行情报、列车身份、ODPT/API 能力和既有东京站 handover；未合并实体 topology。
- railway_data.json 与 railway-data.file.js 同步，程序验证两份数据一致，并验证移除这两个成员字段后所有其余 canonical 字段与修改前完全相同。
- 恢复 JO 单一卡片排序断言，并新增 SobuRapid 不单独占卡片、两线共同成员声明、file fallback 一致、东京站地图延伸和两条实体实时列车身份保留的行为检查。
- 七页 db-loader 版本统一提升至 4.3.1194，避免旧静态缓存的分开列表继续留在界面。没有新增脚本。
- 验证：排序/地图检查 PASS；46 node:test 页面/服务日/直通检查 PASS；identity coverage、runinfo scope、frontend smoke PASS；canonical entity guard / home guard / diff check PASS（既有 baseline warnings 保留）。未提交/推送/部署。

## 2026-10-13 JST — latest-main integration completed locally (PASS; deployment pending)

- 用户授权：先保存旧工作区，取得线上新版，迁移仍需要的改动并验证，再更新原项目目录。整合基准 = origin/main 9b7c3915ba6d83e39180368d8428769c5e33734b，较旧本地基准多 115 个提交。
- 安全保存：22 个原本未提交文件逐文件备份并核对 SHA256；完整 7,705,589 字节 binary patch / manifest 保存在当前对话 visualization/local-backup-before-online-integration。原始工作将另外保留在 Git stash 中；不丢弃恢复材料。
- 最新架构优先：保留 canonical timetable/source resolution、实体直通链、operation owner/车辆证据、来源 PNG 校验；复用新版单推定与日本时区实现。实时 API 线路保持 API 权威，不以空快照启动 SQL；当前地图中的无实时 API 支线/直通段使用 SQL，维持混合展示。旧 FULL 断流自动切 SQL 不迁移。
- 迁移增量：SQL-only 行按服务日期限定；现有 position timer 按分钟推进、跨日失败逐线重试；旧推定清理；区间进度/有效期 dirty 检测；支线/延伸数据 scope 与展示体系分离；实时请求与时刻表加载并行；当前空位置快照不复活旧缓存；SQL 优先级及日期 run/stop 分页、有效部分保留。
- 原本的 TokyuMeguro-manual / normalization backlog 无线上重叠，保留本地更新。旧车辆快照、旧 resolver/exporter 及其旧测试已被新版 canonical 证据/测试取代，不覆盖线上新版；原文件完整保存在备份与 stash。PROGRESS 历史记录保留。
- 脚本约束：只修改现有工程脚本/页面/测试，不新增工程脚本。HTML 资产版本升到 4.3.1193；版本 guard 允许不低于已验证的发布版本，避免新版本被旧的精确 pin 拒绝。
- 排序测试修正：新版 canonical 将 Yokosuka / SobuRapid 建为独立 JO presentations，旧 real-data 测试仍要求单一 JO slot。现断言两项独立实体及成员边界；不改变 canonical topology 或公共排序逻辑。
- 验证：46 node:test checks PASS；33 工具测试/映射/图库检查 PASS；4 Python 工程 guards PASS（保留原有基线警告）；43 JS scripts 语法 PASS；train-runs TypeScript 语法 PASS；git diff --check PASS。Open Code Review 内置委托方式审查整合范围，未发现未解决 high/medium 问题。
- 未提交本次改动、未推送、未发布 GitHub Pages / Supabase Edge。真实浏览器验收与线上部署验收仍未执行。

## 2026-10-13 JST — GitHub online/local reconciliation audit

- 用户要求与线上仓库核对。两次 git ls-remote 验证线上 main = 9b7c3915ba6d83e39180368d8428769c5e33734b；本地 HEAD/origin-main 缓存仍为 175b87a7095a71fbc3f88411039519fd83e864ea。GitHub compare 确认线上领先 115 个提交、修改 101 个文件。
- 本地 22 个未提交文件，其中 19 个与线上修改重叠；22 个文件按固定 SHA 读取线上内容，三方文本比较 16 个文件出现冲突，均未执行工作区合并。核对快照与报告保存在当前对话 visualization/repository-check。
- 线上已实现单次推定、日本时区/服务日、SQL 来源保留，以及 canonical timetable/source resolution、实体直通关联、operation owner 与车辆证据映射。
- 关键语义差异：线上通过 hasRealtimePositionApi / realtime_position_api_enabled 禁止实时线路查询 SQL；本地允许 SQL 补缺和 FULL 断流回退。整文件覆盖会丢失线上新版字段和证据链，必须按功能迁移。
- 前轮 27 tests 与委托审查仅验证旧基准工作区，不证明与线上新版兼容；原 local PASS 不应当作可直接发布状态。本次只核对，没有提交、推送、拉取覆盖或部署。

## 2026-10-13 JST — Open Code Review delegation completed (local PASS)

- 用户选择插件内置委托模式；OCR 用于 preview/rule，当前 Codex 执行审查，不需要额外模型 API 端点；未修改 Codex 登录凭据。
- 本次范围：OCR 选出的 10 个 refactor 文件全部 reviewed，额外手动检查 tools/performance-lifecycle.test.js；共 11 个文件、0 skipped、范围覆盖率 100%。其余 11 个既有车辆相关改动/进度账本未纳入代码审查；不声称全工作区审查完成。
- 发现并修复 4 项：区间内 segmentProgress/实时有效期变化不触发 dirty fusion（high）；服务日 SQL 失败预先标记日期导致不重试（medium）；SQL 日期与本地日历/分钟轴时区不一致（high）；主线可见 SQL 支线/延伸未激活（medium）。已修复，当前范围无未解决 high/medium findings。
- 修复方式：细化现有 dirty 比较；按线路记录成功 SQL 日期，现有分钟 timer 重试；日历、推定分钟和实时证据统一日本时区/04:00 服务日；可见位置依赖与 presentation membership 分开跟踪。仍不新增脚本。
- 验证：27 node:test checks、performance-lifecycle、train-position-evidence-regression、frontend-smoke PASS；服务日测试在 UTC 和 America/Los_Angeles 环境各 13 项 PASS；git diff --check PASS。审查报告保存在当前对话 visualization 目录 trains-review.json。
- 仍未提交/推送/部署；真实浏览器、GitHub CI/Pages、线上 Supabase Edge 发布尚未验证。

## 2026-10-13 JST — trains realtime / SQL position pipeline (local validation PASS; deployment REVIEW)

- 用户约束：仅改造现有脚本，不新增脚本；保留工作区已有未提交改动。
- 页面结构：trains.html 现有脚本依赖分组说明、更新相关资源版本；Controller 负责线路激活/生命周期，DataFusion 负责唯一位置融合，Estimator 负责时刻推定，render 负责展示。
- 数据：现有 ODPTClient 同时启动实时拉取和 SQL 时刻表读取；SQL fallback_only 不再因线路配置 API 而跳过数据库。SQL 无记录且已有时刻表 API 时保留该 API 时刻表回退；无 API 线路 SQL 缺失保持无数据，不启用旧 manual 脚本位置源。
- 融合：移除两处重复 manual 推定/合并；重算前移除旧推定与过期实时位置。HYBRID 按物理列车去重补缺；FULL 有有效实时时维持权威，断流后允许 SQL；SEGMENTED 保留声明区间规则。SQL 来源标记保留为 supabase-train-run，并持续标为 estimated。
- 生命周期：复用已有 position timer，每分钟推进无实时 API 的时刻表位置，后台停止；日本 04:00 服务日切换重新读 SQL，旧服务日记录不再推定。当前系统/支线共同加载、共同参与可见位置签名和过期检查；当前空快照不复活 IDB 旧列车。
- SQL：现有 train-runs/index.ts 的日期 run/stop 查询分页、stop ID 分批；不完整 run 不影响其他有效 run，返回 partial 与 omitted_incomplete_runs。不新增 schema 或 migration。
- Supabase 只读核查：manual_timetable_templates = 79,473 条 / 191 条线路；train_runs = 9 条 / 2 条线路，最新日期 2026-10-09。实时线上 endpoint 本次未部署修改。
- 验证：performance-lifecycle、train-position-evidence-regression、frontend-smoke PASS；两个现有 node:test 文件共 24 tests PASS，包含 1,005 个 SQL runs / 8,040 stops 分页、部分有效记录保留、空快照、来源优先、FULL/HYBRID 回退、日本服务日边界。JS 语法与 git diff --check PASS。
- Open Code Review 已尝试，但因未配置 LLM endpoint 启动失败；不声称 OCR 审查完成。实际浏览器、GitHub CI/Pages 和 Supabase Edge 部署尚未验证。当前为本地可审查改动，未提交/推送/部署。

## 2026-10-09 JST — UI-004 / UI-002 non-business DOM coupling cleanup (REVIEW)

- 执行者：ChatGPT GitHub connector；直接修改 main，未使用 Work。
- 目标：解除筛选器对线路列表的全局 DOM 查询、页面 controller 对运营商分组内部 DOM 的重复控制；保留业务数据/页面详情差异。
- 修改：`js/operator-filter-bar.js`、`js/data-state.js`、`js/realtime-view.js`、`js/trains-page.js`、`pages/history.html`。
- 关联 commits：`668d28aa`、`3e5cdc80`、`471a225c`、`6f1a965b`、`4aac2751`；先前历史页容器保留修复 `e193f3ad`。
- 结果：FilterBar 不再从其他组件内部查找运营商；公共 DataState 提供 `setOperatorVisibility` 和 `filterLinesByOperator`，realtime/trains 均调用；realtime 卡片选中状态限定到本页列表；两页空结果走公共列表渲染；history 的稳定 mount 不再预置随后被替换的内部 DOM。
- 静态回读：两个页面均已调用共享筛选接口；页面控制器内 `group.style.display` 已消失；FilterBar 全局 `document.querySelectorAll(".rs-line-list-content...")` 已消失。
- 验证：GitHub 源码回读 PASS；语法/架构测试、CI/CD、Pages、browser runtime **NOT VERIFIED**。
- 遗留：realtime/trains 筛选器+列表组合容器的统一结构契约尚未落地；PageState lifecycle、CSS 全量粘连及七页动态 DOM 完整检查未完成。状态 REVIEW，不得标记 DONE。

## 2026-10-09 JST — UI-004 shared layout boundary follow-up (REVIEW)

- 执行者：ChatGPT GitHub connector；用户要求不使用 Work。
- 修复上一轮 `js/data-state.js` 新增接口意外含字面 `\\n` 的语法风险，commit `095e83d6`；GitHub 源码回读确认已恢复实际换行。
- 为 `pages/realtime.html` 和 `pages/trains.html` 增加一致的 `data-railway-browser` 组合布局容器，分别提交 `450c7c67`、`bfa6c860`；仅包裹筛选器和线路列表，详情视图保持页面业务所有权。
- 结构回读：两页均有一个 `data-railway-browser`，内部保留原 FilterBar、LineList shell、data-state-host，未新增第二套组件。
- 状态 REVIEW：未运行 JS syntax/tests/CI、浏览器和 Pages 验证；跨页结构自动化 guard 尚待实现。不得标记 DONE。

## 2026-10-09 JST — UI-004 railway-browser contract guard (REVIEW)

- 新增 `tests/railway-browser-contract.test.cjs`，commit `db3c6a46`；使用 Node 内置 `node:test`，命令 `node --test tests/railway-browser-contract.test.cjs`。
- 断言：realtime/trains 唯一组合容器及 FilterBar→LineList 布局顺序、数据状态宿主、FilterBar 不全局查询 LineList 内部、两页 controller 只使用共享筛选接口、realtime 选中态局部化、history mount 稳定。
- 文件写入与 GitHub 回读已确认；测试执行、CI、浏览器运行时仍 **NOT VERIFIED**。不要因测试文件存在而声称 PASS。
- 下一步：运行该测试与现有 CI；复核 trains 详情态筛选栏显隐和筛选后结构更新；继续清理 PageState 重复生命周期。状态 REVIEW。

## 2026-10-09 JST — UI-004 trains detail/layout regression fix (REVIEW)

- 修复 `js/trains-page.js` 进入详情只隐藏列表、不隐藏新增组合容器内筛选栏的问题：详情进入/返回分别隐藏/恢复最近的 `[data-railway-browser]`；commit `e771f89c`。
- 切换语言时重建运营商组使用共享 `DataState.filterLinesByOperator`，避免筛选状态丢失；保留原滚动位置及卡片更新逻辑。
- `tests/railway-browser-contract.test.cjs` 添加详情容器显隐及语言刷新筛选断言；commit `a28df3cf`。
- 验证：GitHub 源码修改提交成功；测试执行、CI 和真实浏览器 **NOT VERIFIED**。状态 REVIEW。

## 2026-10-09 JST — UI-004 trains language refresh DOM ownership (REVIEW)

- `js/trains-page.js` 删除 `_oldGroups/_freshGroups/_freshByOp` 的运营商组 DOM 逐个匹配替换；使用共享 `DataState.renderList` 的结果一次更新稳定 list host，保留 `setFilter` 及滚动位置恢复。commit `5575095d`。
- `tests/railway-browser-contract.test.cjs` 新增防止页面恢复内部 group reconciler 的断言，commit `69044912`。
- GitHub 当前 HEAD 组合状态查询无 statuses（空数组不代表 CI PASS）；Node 测试及浏览器 **NOT VERIFIED**。
- 状态 REVIEW。后续必须验证语言切换时的滚动/焦点/筛选、realtime 更新、CI 运行结果。

## 2026-10-09 JST — UI-004 operator selection across snapshot updates (REVIEW)

- `js/trains-page.js` 的 `renderList` 不再直接渲染全量线路，而是委托现有 `renderFiltered`，保持已选运营商；commit `4cbb094d`。
- `js/realtime-view.js` 的 `reconcileRealtimeList` 状态签名只遍历 `DataState.filterLinesByOperator` 得到的可见线路，避免筛选状态下把全网签名误当成列表结构；commit `4ebd3317`。
- `tests/railway-browser-contract.test.cjs` 添加刷新链路源码断言，commit `0627be7a`。
- 验证：已提交，未实际执行 Node 测试、CI 或浏览器；状态 REVIEW。须重点验证筛选切换、语言切换、实时推送后的卡片状态和 DOM 增量更新。

## 2026-10-09 JST — UI-004 empty/missing mount guard (REVIEW)

- `DataState.renderList` 在访问 `container.innerHTML` 前独立判断 `!container`，避免缺失 mount 时异常；commit `82f821c5`。
- `OperatorFilterBar.render` 在运营商列表变空时清空过期按钮并调用现有 `available(false)`；commit `8de9fd5c`。
- `tests/railway-browser-contract.test.cjs` 新增上述边界条件的源码断言；commit `4db303f4`。
- 验证：GitHub 提交成功；Node 测试/CI/浏览器 **NOT VERIFIED**。状态 REVIEW。

## 2026-10-09 JST — UI contract guard connected to existing CI (REVIEW)

- `.github/workflows/ci-cd.yml` 的既有 `validate` job（Node 20 setup 后）添加 `node --test tests/railway-browser-contract.test.cjs`，没有新建 workflow；commit `c3e1c07f`。
- 查询该提交的 GitHub combined statuses 和 commit workflow runs 均返回空列表，**不代表 PASS**；未取得测试执行结果或浏览器验收。
- 保持 UI-004/UI-005 REVIEW，后续须读取实际 Actions job 结果并解决真实失败项。

## 2026-10-09 JST — UI-004 language-change empty state (REVIEW)

- `js/trains-page.js` 的语言切换刷新不再跳过空的 `_linesNow`；统一通过 `DataState.renderList` 替换旧列表，避免旧卡片残留；commit `74c9f539`。
- `tests/railway-browser-contract.test.cjs` 添加语言切换空列表源码回归断言；commit `f02aba04`。
- 验证：GitHub 已提交；CI Actions 的实际 job 结果和浏览器行为尚未获取，状态保持 REVIEW。

## 2026-10-09 JST — UI-004 realtime empty-selection filter controls (REVIEW)

- `js/realtime-view.js` 的 `renderFiltered` 不再因筛选结果为空而提前跳过 `renderFilterBar(_latestLines)`，统一通过共享 `DataState.renderList` 显示空状态；commit `29b59706`。
- `tests/railway-browser-contract.test.cjs` 新增对应源码回归测试；commit `19b53ca3`。
- 验证：代码已提交；本会话未能取得 GitHub Actions 实际运行日志，也未执行浏览器验收；保持 REVIEW。

## 2026-10-09 JST — GitHub Actions verified for 6ce272c7 (CI PASS; browser REVIEW)

- 实际查询 Actions run 列表并读取 run `37847954790` 的 jobs；此前 `fetch_commit_workflow_runs` 仅筛选 PR 触发的记录，不能用于判断 main push 的 CI。
- commit `6ce272c7a1b3617cf92776204942ee4ea335cfde`：CI / CD run `37847954790` = completed/success；`Validate` 含 `Railway browser cross-page contract` = success，`Deploy to GitHub Pages` = success。
- 同一提交：Release Guards run `37847954732` = completed/success；pages build and deployment run `37847953855` = completed/success。
- 前序 push 对应运行部分 cancelled，与并发取消设置吻合，不能计为当前提交 FAIL。
- **UI-004/UI-005：CI 验证 PASS；实际浏览器交互尚未测试，浏览器验收 REVIEW。**

## 1. 当前总览

| Workstream | 状态 | 当前结论 / 下一步 |
|---|---|---|
| UI-001 全站 SiteShell | DONE | 7 页已接管；CSP-safe 外部自启动已稳定；2026-10-07 mobile Chrome 实机确认 Header/语言按钮/自适应居中菜单可通过 |
| UI-002 OperatorFilterBar | DONE | JR-East、tOp、显隐链路已修；HEAD `4ada406b` 的 CI/CD、Release Guards、Pages 全部成功 |
| UI-003 LineCard / SystemCard | REVIEW | `js/line-card.js` 已成为唯一卡片模板/更新入口；DataState 仅列表编排，realtime 不再 patch 卡片内部 DOM；等待 HEAD Actions 最终验证 |
| UI-004 LineList / OperatorGroup | PARTIAL | `DataState.renderList` 已共享；需与 LineCard 职责拆清并统一空结果/排序 |
| UI-005 PageState lifecycle | PARTIAL | `DataState` 已共享 render/retry 基础；页面仍重复 loading/retry/recovery glue |
| UI-006 Tourism Detail Shell | PARTIAL | 已由现有 tourism-core.js 接管三页重复返回按钮 DOM；其余详情页主体 Shell 仍需公共化，待验证 |
| UI-007 CSS 收敛 | IN_PROGRESS | 已移除 realtime 独占的移动端 LineCard 规则并迁至共享 style.css（`c7e8e7f1`, `5e7a27f9`）；仍需检查其他页面覆盖与浏览器回归 |
| RECOVERY-001 Mobile Chrome 恢复 | DONE | BFCache/online/late-data/ODPT/DataFusion 恢复链已建立并有 guard |
| RUNINFO-001 运行情报线路隔离 | DONE | 已修复跨线路 incident leakage |
| RUNINFO-002 popup freshness | DONE | popup cache 已缩短到 15 秒并加 guard |
| RUNINFO-003 realtime freshness | DONE | `dct:valid` / `dc:date` / frequency 新鲜度检查已加入 DataFusion/trains |
| RUNINFO-004 状态语义统一 | TODO | DataFusion 与 RunInfoAPI 对 operator-global/empty-success/last-good 语义仍需统一 |
| DEPLOY-001 Pages cache busting | DONE | deploy 时以 commit SHA 重写本地资产/页面 URL，避免手机长期卡旧版本 |
| DATA-001 Supabase runtime coverage | PARTIAL | runtime/evidence 架构已存在；timed run 数据与 network coverage 仍不足 |
| VEHICLE-001 图片命名/图库 | PARTIAL | 已有大规模 inventory/rename 工作；继续按文件命名规范推进，避免重复审计 |

## 2. 当前架构事实

### 全站 HTML

当前页面：

- `home.html`
- `history.html`
- `realtime.html`
- `trains.html`
- `tourism-event.html`
- `tourism-shop.html`
- `tourism-spot.html`

2026-10-07 审计确认：

- Header / LanguageSwitcher / Footer 在 7 页重复。
- 主导航在多页重复。
- tourism event/shop/spot 的主体 HTML 基本同构。
- 同一公共 CSS 在页面中存在不同手工版本号。
- 当前是“各 HTML 自己写底层 + 各自 JS/CSS 努力做出相似视觉”的结构，不是统一 SiteShell。

### 线路卡片

已有共享基础：

- `DataState.renderCard()`
- `DataState.renderSystemCard()`
- `DataState.renderList()`

但仍不是完整组件：

- `renderCard` 内存在 `mode === "realtime"` / `mode === "trains"` 分叉。
- realtime 页面直接查询/替换 `.rs-line-card`、`.rs-line-interval`、`.rs-line-info` 等内部 DOM。
- `style.css` 是共享样式，但 realtime/trains CSS 仍存在页面覆盖。

目标：建立正式 LineCard API，页面 Controller 不再操作内部 DOM。

## 3. 已完成 / 已提交记录

| 日期 JST | Task | 执行者 | 状态 | Commit | 内容 / 验证 |
|---|---|---|---|---|---|
| 2026-10-07 | DEPLOY-001 | agent | DONE | `eb787d5a` | Pages deploy 注入 no-cache meta + commit SHA asset/page cache busting |
| 2026-10-07 | DEPLOY-001 | agent | DONE | `f23f93bf` | manual Pages deploy 同步 cache-safe 逻辑 |
| 2026-10-07 | RECOVERY-001 | agent | DONE | `b1a6ce5` | bounded/deduped ODPT readiness waits |
| 2026-10-07 | RECOVERY-001 | agent | DONE | `7e1a786` | db-loader 统一 `pt:railway-ready` signal |
| 2026-10-07 | RECOVERY-001 | agent | DONE | `3b22dc9` | trains late-data recovery |
| 2026-10-07 | RECOVERY-001 | agent | DONE | `c823df3e` | trains startup DataLoader error state |
| 2026-10-07 | RECOVERY-001 | agent | DONE | `eedb8bf3` | DataState online/pageshow retry recovery |
| 2026-10-07 | RECOVERY-001 | agent | DONE | `38555711` | realtime responds to late railway-ready |
| 2026-10-07 | RECOVERY-001 | agent | DONE | `5abfd73` | architecture guard for mobile recovery |
| 2026-10-07 | RECOVERY-001 | agent | DONE | `35fe74f1` | ODPT refresh after BFCache restore |
| 2026-10-07 | RECOVERY-001 | agent | DONE | `7e3d2d03` | DataFusion resume after BFCache restore |
| 2026-10-07 | RECOVERY-001 | agent | DONE | `01a734fd` | BFCache LIVE recovery guard；当时 Actions 全绿 |
| 2026-10-07 | RUNINFO-001 | agent | DONE | `e5f68419` | 修复 DataFusion 跨线路 ODPT incident leakage |
| 2026-10-07 | RUNINFO-001 | agent | DONE | `74c6e99c` | 加 line-scoped runinfo static guard；当时 Actions 全绿 |
| 2026-10-07 | RUNINFO-002 | agent | DONE | `51e93b0b` | RunInfoAPI popup cache TTL 缩短至 15s |
| 2026-10-07 | RUNINFO-002 | agent | DONE | `946059d8` | popup freshness guard |
| 2026-10-07 | RUNINFO-003 | agent | DONE | `b1c1f3ac` | DataFusion realtime freshness policy |
| 2026-10-07 | RUNINFO-003 | agent | DONE | `1053937c` | trains renderer 同步 freshness policy |
| 2026-10-07 | RUNINFO-003 | agent | DONE | `5862e2c5` | train position evidence regression guard |
| 2026-10-07 | UI-002 | agent | REVIEW | `4a40a090` | 新增共享 `js/operator-filter-bar.js` |
| 2026-10-07 | UI-002 | agent | REVIEW | `f704d9fb` | realtime 接入共享 OperatorFilterBar |
| 2026-10-07 | UI-002 | agent | REVIEW | `36170f7d` | trains 接入共享 OperatorFilterBar；需确认 JR-East 特殊过滤语义未回退 |
| 2026-10-07 | UI-002 | agent | REVIEW | `3a27ef55` | realtime HTML 加载共享 FilterBar |
| 2026-10-07 | UI-002 | agent | REVIEW | `bb35e750` | trains HTML 加载共享 FilterBar |
| 2026-10-07 | UI-002 | agent | REVIEW | `f846a376` | COMPONENT-001 architecture guard；该轮 Actions 在记录时仍需复核最终状态 |
| 2026-10-07 | UI-007 | agent | REVIEW | `670e1c34` | 删除公共 `.pixel-footer` 未经设计要求的 `border-top` 分割线 |

## 4. 待办队列

### P0 — 先保证当前迁移没有回归

- [x] **UI-002A** HEAD `4ada406b...`：Release Guards、CI/CD、Pages 全部 SUCCESS。旧 CI 失败根因 `fusionSource` 重复声明已由 `59471139` 修复。
- [x] **UI-002B** trains 已恢复 `TransitConstants.isJRERoute` 特殊过滤语义（`94f11773`）。
- [x] **UI-002C** 共享 FilterBar 优先使用 `tOp()`，再 fallback `operatorLabel()`（`cdba6c6d`）。
- [x] **UI-002D** trains detail show/hide 已统一走 `setFilterAvailability()` → 组件 API（`94f11773`）。

### P1 — 全站基础层

- [x] **UI-001A** 已建立 `js/site-shell.js`：固定 header/navigation/footer mounts、page identity/active tab、`pt:site-shell-ready`；保持页面 CSP/能力 `<head>` 独立。SHELL-001 guard 已加入（`865225b7`, `befbe1c5`）。
- [x] **UI-001B** 7 页 Header 已由 canonical SiteShell 接管。
- [x] **UI-001C** 7 页 LanguageSwitcher 已由 SiteShell 接管，并保持 lang-init 的 body reparent 行为。
- [x] **UI-001D** MainNavigation 已由 page identity 生成 active tab；SiteShell 同时继承 deploy `?build=` token，避免页面导航丢失 cache-busting。
- [x] **UI-001E** 7 页 Footer 已由 SiteShell 接管；共享 footer 保持无顶部横线。
- [x] **UI-001F** SHELL-001 已保护唯一 SiteShell、三 mount、禁止迁移页重新复制旧 Shell，并保护 build token 传播。

### P1 — 卡片/列表

- [x] **UI-003A** 已提取 `js/line-card.js`，LineCard 模板所有权移出 DataState。
- [x] **UI-003B** SystemCard 已归入同一 `window.LineCard` 组件体系。
- [x] **UI-003C** 已建立 `LineCard.update()/updateSystem()/applyColor()` 稳定入口。
- [x] **UI-003D** realtime 已只提交数据变化给 LineCard API，不再 patch 卡片内部 DOM。
- [x] **UI-004A** DataState/LineList 现只负责 list/group orchestration，不再拥有卡片内部模板。
- [ ] **UI-004B** 已迁移 realtime 移动端 LineCard 样式到共享 CSS（`c7e8e7f1`, `5e7a27f9`）；仍需检查其他覆盖并通过 Actions / 浏览器回归后关闭。

### P1 — 页面状态

- [ ] **UI-005A** 在现有 `DataState` 上吸收 page lifecycle；已为 online/pageshow 自动恢复添加单飞保护（`22c689c9`），其余页面重复 glue 仍待吸收。
- [ ] **UI-005B** 统一 loading/offline/fetch_error/timeout/retry。
- [ ] **UI-005C** 保留 mobile Chrome BFCache/online recovery 语义。
- [ ] **UI-005D** 更新 RECOVERY-001 guard，从检查页面重复 glue 转为检查共享 lifecycle contract。

### P2 — Tourism

- [ ] **UI-006A** event/shop/spot 使用同一 TourismDetailShell；已将三页重复返回按钮交由 tourism-core.js 唯一生成（`60852841`, `f83fefda`, `08fa3381`, `5e9502c8`），其余主体待迁移。
- [ ] **UI-006B** 类型差异通过 config/controller 注入，不复制 HTML。
- [ ] **UI-006C** 地图能力/CSP 继续最小权限，不因 shell 统一而扩大权限。

### P2 — RunInfo 后续

- [ ] **RUNINFO-004A** 统一 RunInfoAPI 与 DataFusion 的 line/operator-global record 选择语义。
- [ ] **RUNINFO-004B** 成功返回 `[]` 时明确“本次 snapshot 无 incident/正常”与 last-good 的关系，避免旧 incident 无意义保留 10 分钟。
- [ ] **RUNINFO-004C** 检查 last-good 是否应保存 notice/info。
- [ ] **RUNINFO-004D** 搜索 `aggregateDelayRecords` 是否已成为 dead path，确认后再删除。
- [ ] **RUNINFO-004E** 检查 `_previousPosMap` / raw realtime restore，确保 stale row 不会复活。

### 2026-10-07 16:xx JST — UI-003 LineCard / SystemCard — agent

- Status: REVIEW
- Scope: 卡片模板所有权与增量更新边界统一
- Files: `js/line-card.js`, `js/data-state.js`, `js/realtime-view.js`, `pages/realtime.html`, `pages/trains.html`, architecture guard
- Commits: `5e23ce6e`, `8a1ea29e`, `80c8f16e`, `4cdd5f0f`, `f2638f39`, `2b33847d`, `3868d2a8`, `b4c696f0`, `4a438c5c`
- Work: 建立 LineCard update boundary；迁出 LineCard/SystemCard 唯一模板；DataState 退回列表/状态职责；realtime 删除内部 DOM patch；两页面加载 canonical component。
- Validation: 三个核心 JS syntax PASS；COMPONENT-002 guard 已升级为检查唯一模板所有权和旧 API 回流。
- Risks / blockers: GitHub Actions 尚在执行；浏览器视觉输出刻意保持原模板结构，未声明新的视觉验收。
- Next: HEAD Actions 全绿后将 UI-003 标记 DONE；随后处理 UI-004B CSS override 收敛。

### 2026-10-08 — UI-004B shared LineCard mobile CSS — agent

- Status: REVIEW
- Scope: 将 realtime 页面私有的移动端 LineCard 样式统一归入共享样式表，供 realtime / trains 共用
- Files: `css/style.css`, `css/realtime.css`, `PROGRESS.md`
- Commits: `c7e8e7f1`, `5e7a27f9`
- Work: 保留原规则数值，将 `.rs-line-card` / `.rs-line-name` / `.rs-operator-title` 的移动端规则从 realtime.css 移入 style.css；不增加新 renderer，不更改业务逻辑。
- Validation: source-level rule migration；CI/CD, Release Guards, Pages, browser runtime: NOT VERIFIED。
- Next: 复核剩余页面 CSS 覆盖及移动端视觉，确认 CI 后再关闭 UI-004B；继续 UI-005 现有 DataState lifecycle 收敛。

### 2026-10-08 — UI-005 shared recovery single-flight — agent

- Status: REVIEW
- Scope: DataState 的 online/pageshow 自动恢复并发保护
- Files: `js/data-state.js`, `PROGRESS.md`
- Commit: `22c689c9`
- Work: 共享 retryVisibleFailedStates 入口增加 pending guard；同步事件和 Promise resolve/reject 均释放保护；复用页面已登记的 retry callback，不增加新的 DataLoader/renderer。
- Validation: source-level review only；CI/CD, Release Guards, Pages, browser runtime: NOT VERIFIED。
- Next: 补自动恢复回归测试，核实 Actions，再逐页吸收重复 loading/error/retry glue；不得提前标记 UI-005 DONE。

### 2026-10-08 — UI-006 tourism detail shared back control — agent

- Status: REVIEW
- Scope: 统一三种观光详情页返回按钮 DOM 结构
- Files: `js/tourism-core.js`, `pages/tourism-event.html`, `pages/tourism-shop.html`, `pages/tourism-spot.html`, `PROGRESS.md`
- Commits: `60852841`, `f83fefda`, `08fa3381`, `5e9502c8`
- Work: tourism-core.start() 首先在 `data-tourism-detail-back` mount 生成唯一返回按钮；三页移除重复按钮 HTML，保留原 ID、SVG、样式、翻译与回到 home 的事件链。
- Validation: source-level migration only；CI/CD, Release Guards, Pages, browser runtime: NOT VERIFIED。
- Next: 核实生产页面脚本加载与按钮行为，继续抽取旅游详情页面主体，避免创建平行 controller。

## 5. 智能体工作记录模板

每个智能体开始/结束工作时，在本节顶部追加记录；不要覆盖他人的记录。

```md
### YYYY-MM-DD HH:mm JST — <Task ID> — <agent name>

- Status: CLAIMED | IN_PROGRESS | BLOCKED | REVIEW | DONE | PARTIAL
- Scope:
- Files:
- Base HEAD:
- Commit:
- Work:
- Validation:
- Risks / blockers:
- Next:
```

### 2026-10-07 — UI architecture audit — agent

- Status: PARTIAL
- Scope: 全站 HTML/UI 基础层审计
- Files: 7 个 `pages/*.html`、共享/页面 CSS、realtime/trains UI JS
- Base HEAD: 包含 `670e1c34`
- Commit: `670e1c34`（本轮仅实际代码修正）
- Work: 确认全站重复 SiteShell；确认线路卡片为共享 renderer + mode 分叉 + 页面 DOM patch；删除未要求的 Footer 顶部分割线。
- Validation: repository source inspection；Footer CSS rule 已从公共 style 删除。
- Risks / blockers: 尚未执行 SiteShell 迁移；OperatorFilterBar 当前轮 CI 最终状态需复核。
- Next: 先完成 UI-002 P0 回归检查，再开始 UI-001 SiteShell contract。


### 2026-10-07 13:xx JST — UI-002 P0 readiness — agent

- Status: REVIEW
- Scope: SiteShell 开工前 FilterBar/CI 回归清理
- Files: `tools/train-position-evidence-regression.test.js`, `js/trains-page.js`, `js/operator-filter-bar.js`
- Base HEAD: `c6a6266d`
- Commits: `59471139`, `94f11773`, `cdba6c6d`
- Work: 修复 CI guard 重复声明；恢复 trains JR-East 特殊过滤；详情显隐统一走组件 API；共享 FilterBar 恢复 tOp 多语言标签链。
- Validation: source inspection complete；最新 Actions 已启动，最终结果待确认。
- Risks / blockers: Actions 未完成前 UI-002 仍为 REVIEW；SiteShell 暂不应标记 IN_PROGRESS。
- Next: 等待/确认最新三条 Actions 全绿后，将 UI-002 标记 DONE，再启动 UI-001A SiteShell contract。


### 2026-10-07 15:23 JST — UI readiness final check — agent

- Status: DONE
- Scope: SiteShell 开工准备最终检查
- Files: 7 个 `pages/*.html`, GitHub Actions, `PROGRESS.md`
- Base HEAD: `4ada406b`
- Commit: pending progress-ledger commit
- Work: 确认 HEAD 的 Release Guards / CI/CD / Pages 全绿；复核 7 页 CSP、脚本依赖和导航结构；确认 SiteShell 只统一 body 公共壳，页面 capability/CSP 保持最小权限。
- Validation: Release Guards SUCCESS；CI/CD SUCCESS；Pages SUCCESS；7 页 source inspection complete。
- Risks / blockers: 无 P0 blocker。HTML 中手工 asset version 不一致属于后续 SiteShell/asset 收敛范围，不阻塞 UI-001A。
- Next: UI-001A 定义 SiteShell DOM/API contract，并添加防双链路 architecture guard，再开始逐页迁移。


### 2026-10-07 — UI-001A SiteShell contract — agent

- Status: REVIEW
- Scope: 全站 SiteShell 唯一 DOM/API 契约与防双链路 guard
- Files: `js/site-shell.js`, `.github/workflows/arch_guard_check.py`, `PROGRESS.md`
- Base HEAD: `941da537`
- Commits: `865225b7`, `befbe1c5`
- Work: 建立 canonical SiteShell；统一 Header/LanguageSwitcher/Nav/Footer renderer 与三个 mount；active tab 由 page identity 决定；加入 SHELL-001，页面一旦加载 SiteShell 就禁止保留旧 header/nav/footer 副本。
- Validation: source contract inspection complete；生产页面尚未加载 SiteShell，因此本提交无 UI 行为切换；Actions 待本轮最终确认。
- Risks / blockers: `lang-init.js` 会把 language wrapper 移到 body，SiteShell 保持原 ID/class 以兼容；不能把各页 CSP/head 能力统一。
- Next: Actions 通过后开始 UI-001B~E，迁移页面并删除旧重复 Shell markup；每批迁移后验证 i18n/mobile/nav。


### 2026-10-07 — UI-001B~F SiteShell migration — agent

- Status: REVIEW
- Scope: 7 页生产 SiteShell 迁移与迁移后残留清理
- Files: 7 个 `pages/*.html`, `js/site-shell.js`, `.github/workflows/arch_guard_check.py`, `PROGRESS.md`
- Commits: `e3655605`, `1e6cf471`, `6734ff78`, `adb18884`, `5e86052a`, `d89baebe`, `d003a1eb`, `49cf04cf`, `ad666582`
- Work: 7 页删除重复 Header/Nav/Footer 并使用 canonical mounts；保留各页 CSP/业务 DOM；检查页面 CSS 无 realtime/trains/tourism 私有 Shell 覆盖；补 SiteShell 内部导航 build token 传播；扩展 SHELL-001 guard。
- Validation: 每页 SiteShell=1、三个 mount 各=1、旧 Header/Nav/Footer=0；source CSS inspection complete；Actions 待最新 HEAD 最终确认。
- Risks / blockers: browser runtime 尚未在用户的 mobile Chrome 实机确认，故保持 REVIEW。
- Next: 确认 Actions；实机/生产检查语言切换、sticky nav、active tab、footer；通过后 UI-001 DONE，进入 UI-003 LineCard。


### 2026-10-07 — UI-001 CSP production recovery — agent

- Status: REVIEW
- Scope: SiteShell 手机生产环境公共 UI 全消失回归
- Files: `js/site-shell.js`, 7 个 `pages/*.html`, `.github/workflows/arch_guard_check.py`, `PROGRESS.md`
- Commits: `cee818d7`, `8cadf6e8`, `1ac6cf76`, `40395a9d`, `7989f04d`, `2c7a61e4`, `4c289634`, `d2bc607d`, `0003ae80`
- Work: 根据用户 mobile Chrome 截图确认业务 DOM 正常但公共 Shell 全空；根因是所有页面 CSP 为 `script-src 'self'`，旧 inline `window.SiteShell.mount()` 被拦截。改为 external `site-shell.js` 自启动，删除 7 页 inline bootstrap；SHELL-001 禁止回归。
- Validation: HEAD `0003ae80` Release Guards SUCCESS；CI/CD SUCCESS；Pages SUCCESS。公开 Pages 无法由当前外部抓取器读取，因此不伪称 browser runtime verified。
- Risks / blockers: mobile Chrome production refresh still required；UI-001 继续 REVIEW。
- Next: 用户刷新生产页确认 Header/Language/Nav/Footer；若恢复则 UI-001 DONE，若仍异常按实机现象继续修。

### 2026-10-10 — IMG-001 SQL verified formation artwork integration

- Status: REVIEW（自动化回归 / 浏览器运行环境待确认）
- Scope: `images/列车` 的车型 PNG 映射；适用产品页为 `pages/trains.html`，由 `js/trains-render.js` 共享唯一标记选择入口。运行情报页不显示列车车型 PNG，无需新增映射。
- Ownership: 列车运行证据由 `TrainOperationEvidence`、`runningChainId` 与 `TrainVehicle.resolve` 收敛；PNG 由 `TrainIcons.resolveVehicleArtwork` 与 `TrainVehicle.selectMarkerArtwork` 唯一选择；图形排布仍由 `trains-render.js` 负责。
- Work: 允许 Supabase `vehicle_visual_identities` 的 `exact` 编成级 PNG 用于已经明确的公司+车型+编成身份；执行日期窗口和一身份多 PNG 的冲突拒绝。旧 `tools/gallery-sync.js` 改成只读仓库图库核对，删除其旧 `VEHICLE_NAME_TO_ICON` / line / operator / pool 逆推逻辑；Release Guards 接入只读检查。历史允许 177 条缺图引用的阈值归零。
- Data parity: 2026-10-10 GitHub 476 张 PNG = Supabase 475 条图库资产 + `共通_形式未確認.png`；数据库 62 available / 413 review；`vehicle_visual_identities` 58 exact（38 带图片，均为编成级），不能把 review 图片提升成确认车型。
- Safety: 不变更 PNG、数据库/RLS、列车事实认定；UNKNOWN/NARROWED、无编成证据、日期不符与图片歧义继续落入 neutral PNG。只在原解析器加索引，禁止恢复第二条映射链路。
- Validation: 加入 SQL 编成/日期/冲突回归与图库路径校验。GitHub Actions 与 Chrome 实际数据渲染由本次 PR 校验结果决定最终状态。
- Next: 验证 `CI / CD`、`Release Guards` 和生产列车图；未知车辆图保持中性，不从 PNG 名称反推模型。

## 6. 交接规则

下一位智能体不要从“重新审计整个仓库”开始。先看：

1. 上表当前状态。
2. 待办队列中最高优先级未完成项。
3. 最近工作记录和 commit。
4. 对应代码最新 main。

如果实际代码与本文件不一致，以代码/CI 为事实，并立即修正本文件。

如果发现另一个智能体已经提交相同目标，不建立第二套实现；审查并继续现有实现。
