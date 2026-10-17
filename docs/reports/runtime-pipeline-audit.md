# 数据链路审计（2026-10-17 JST）

当前状态：四阶段实现与验证完成，PR #36→#37→#38→#39 待依赖顺序审查；未合并main，未生产部署。

基线：origin/main 78accf09。完整五份 HAR 位于用户 Downloads；脱敏汇总及原件 SHA256 位于 tests/fixtures/guards/request-har-baseline.json。复算：node tools/audit-request-har.cjs <五份HAR路径>。不输出查询参数、密钥、请求头或 Cookie。

| 样本 | 请求总数 | 同 URL 重叠请求 | SQL 响应 |
|---|---:|---:|---|
| Agatsuma |107|0|6 个行程，complete；日期未逐班验证|
| ChuoMain |108|0|320，partial，遗漏43；另加载ChuoRapid506、Shinonoi142（遗漏2）、ChuoTatsuno126（遗漏8）|
| JobanLocal |89|0|243；Chiyoda528；日期未逐班验证|
| realtime |792|1|无 SQL；701 次 TrainInformation|
| SaikyoKawagoe |5|0|3 次 Train；无 SQL|

complete 只代表服务端本次查询完整性，不能解释为实际全线覆盖。吾妻仅6个计划不能声称含全部普通列车。所有这些 SQL 行程 date_verified_runs=0。304 的 content.size 是内容大小，不是下载字节；汇总单列 transferBytes。HAR 无 JS/渲染执行时间，不能据此捏造融合或 SVG 性能改善。

## 当前所有权与迁移边界

- data/api/odpt-unified.js：ODPT 限流、原始快照、SQL 请求及缓存、前后台网络生命周期。
- js/runinfo-api.js：消费 ODPTClient，共用请求入口；不应成为另一网络所有者。
- js/data-fusion.js：融合、显式来源优先级、线路依赖扩展、计划时钟推进及 dirty 分发。
- js/train-position-estimator.js：时刻表位置，禁止宣称官方实时；运行日与线路隔离。
- js/running-chain-resolver.js / train-vehicle.js：已有证据身份与车型唯一入口。
- js/trains-page.js / trains-render.js：页面订阅、绘制、动画；需要用浏览器 trace 核验实际渲染成本，不能用网络完成代替。

## 已确认的风险

1. fetchODPT 吞掉错误返回 null，extractData 再返回空数组；失败无法进入上层 catch，影响运行状态与空时刻表负缓存。
2. 限流不等于请求去重；同一 URL 的多个消费者仍可排队独立请求。
3. SQL 适配前缺少响应 line_id/service_date 与请求绑定检查。
4. 原手动 Pages workflow 绕过 Validate；原部署仅依赖 Validate，不等待 Release Guards。阶段01已关闭该路径。
5. 网络快照需要防止较早源时间覆盖较新源时间；完成时间不能当作数据版本。

## 验收与后续

阶段01：五份网络基线、发布门禁。阶段02：在现有 ODPTClient 统一去重、失败传播、SQL校验、快照版本；不增新请求引擎。阶段03：在既有 Fusion/Estimator/Renderer 中明确元数据/位置/显示变化，并回放身份连续性。阶段04：删除迁移旧路、登记定时器、浏览器性能对比与四类线路验证。

本阶段发布守卫及架构守卫本地通过。没有执行生产部署。浏览器运行与全链路渲染性能尚未验证；整体状态 PARTIAL。回滚使用 revert PR，通过同一 CI/CD，保留构建 SHA 的资源缓存版本机制。


## 阶段02–04实施与验收（2026-10-17 20:43 JST）

PR按顺序叠加：#36基线/发布门禁，#37请求/版本，#38变化契约，#39性能/浏览器门禁（创建后链接见PROGRESS）。未合并main，未部署生产，主工作区未提交内容保留。

旧路径已替换：吞错转空数组、同URL独立排队、Train激活后停更情报、情报初始化清空Train快照、页面元数据位移哈希、逐数组索引脏检测、无时刻表分钟空算、全量车型族扫描、直通候选全量两两比较、每次前台恢复新增官方网页监听器、独立手动Pages部署。没有新增生产请求/渲染引擎。测试bootstrap只由本地回放服务器临时注入，生产页面不引用。

### 保全证据

- 固定HAR 429条Train记录，优化前后完整车型/证据/图片决定JSON的SHA256均为8a646b8babe0fe3006e9439211f7fd2266e320b4953279885e48930a73a91e18。
- 相同本机Node回放：第一次645→81ms，重复599→55ms；主要减少既有车型族规则的跨网络无效扫描。实际每次仍检查日期、日历、种别、全行程和冲突；别名撤销、快照替换会重建索引。不是新的结果缓存。
- 直通原实现e3998695对固定SQL样本生成18个根行程结果；新实现逐项完全一致，候选证据检查4525次，CI预算小于5000。原源链接/边界/唯一性/歧义规则均继续执行。
- 20并发消费者只产生1网络请求；错误重试、运行日04:00乱序、响应/行线路日期校验、SQL partial、详情消费者错误传播均有回归。
- 10次官方网页后台/前台循环只保留1监听器和1有效timer。

### 浏览器固定输入回放

服务器仅从脱敏压缩夹具返回远程fetch；缺失资源明确失败，不能合成为已确认空记录。请求头、Cookie和consumerKey未进入夹具。程序使用真实performance时钟；CI headless驱动不用virtual-time-budget，以免虚拟时钟掩盖CPU执行耗时。

| 场景 | 标记数 | SVG最大观测ms | 位置处理最大观测ms | 覆盖 |
|---|---:|---:|---:|---|
| SaikyoKawagoe realtime |20|65.6|715.1|保留真实API来源|
| ChuoMain hybrid |31|82.0|1881.5|partial，320行程，遗漏43|
| Agatsuma SQL plan |0|9.4|146.9|仅6计划，日期未逐班验证；当时无位置不补造|
| JobanLocal through |8|25.5|882.7|243行程，保留贯通上下文|

这些数值为本地Edge固定HAR采样；不与先前不同实时输入的耗时直接计算改善比例。Node固定输入前后对比见上一节。CI另以真实Chromium重跑4场景，强制SVG≤500ms、位置处理≤2000ms、网络扇出上限、无重复标记、元数据事件不重绘、SQL覆盖保全。保存JSON/截图供审查；失败阻止部署。最终GitHub结论见PR与PROGRESS。

### 历史核对与保留边界

main的7dbb7d1b已处理计划时钟/禁止重放；bb9ae03d将SQL TTL调整为600秒；7883c4ea补充季节计划和同日刷新。这些现役功能保留，未回退成第二套时刻表或动画引擎。现有TrainOperationEvidence、TrainVehicle、TrainPositionEstimator、RunningChainResolver各自职责继续使用；没有复制canonical拓扑或修改生产数据库。

生产发布与最终合并留给逐阶段PR审查。基线/预算变更必须有新来源与回归证据，不能为了变绿重写golden或放宽阈值。这里的4场景证明固定样本契约，不代表223条线路/所有未来运营情形均已人工验收。


## 最终自动验收

2026-10-17 20:46 JST，阶段04实现b8cafaae通过 [CI/CD 39029895965](https://github.com/biubiu52011/Pixel-Tetsudo/actions/runs/39029895965)：Validate、Release Guards、Fixed HAR browser replay全部success；Deploy按PR条件skipped。

Chromium固定HAR真实计时：埼京SVG18/位置54.9ms，中央本线15.6/177.2ms，吾妻8.8/43.6ms，常磐各停19.7/69.7ms。4类场景的身份唯一、元数据无重绘、覆盖保全和请求扇出预算均通过；browser-replay-metrics产物保留4份JSON及PNG。

本地最终50个CI Node入口、65项node:test、4个Python守卫通过，历史警告未删除。审查入口：[阶段01](https://github.com/biubiu52011/Pixel-Tetsudo/pull/36)、[阶段02](https://github.com/biubiu52011/Pixel-Tetsudo/pull/37)、[阶段03](https://github.com/biubiu52011/Pixel-Tetsudo/pull/38)、[阶段04](https://github.com/biubiu52011/Pixel-Tetsudo/pull/39)。

## CI/CD 集成与契约迁移设计

本阶段以最终集成 PR 对 main 运行所有门禁；#36–39保留为分阶段审查切片，避免要求完整新检查后，早期切片缺少后续构建检查而无法单独合并。此次不合并或部署 main。

发布图：Validate + reusable Release Guards + 固定 HAR 浏览器 → Build verified release（仅跟踪的发布目录、完整哈希、staged 浏览器）→ 唯一 Pages 发布 → 线上字节与交互验收。正常发布只构建一次；PR 也生成相同结构的产物但不部署。失败自动选择保留的 main 成功发布和成功 Verify production release，恢复原始字节和源 SHA；没有历史基线则明确失败并要求维护者处理。手动恢复同样验证来源，不能将绿色功能分支冒充生产基线。产物保留90天，过期不算有效回滚目标。

契约变更理由：ci-cd.yml 将独立绿色结果改为显式依赖并交付不可变发布清单和验收；release-guards.yml 改为被唯一入口调用；删除 pages.yml 关闭手动旁路；sync-vehicle-evidence.yml 从直接写main迁移到候选分支和显式CI；ENGINEERING.md 增加数据生命周期与PR发布规范；service-day旧测试的VM片段加载新提取的变化分类函数，保留原有位置与有效期断言。新增部署契约、请求/变化/HAR回放回归均为增强，未为实现删测或放宽原预算。精确文件前后哈希见 .github/contract-changes/runtime-release-integration.json。

帧耗时门禁使用真实 requestAnimationFrame 间隔（至少20帧，p95≤50ms）和 PerformanceObserver 长任务（单任务≤2000ms），与已有SVG≤500ms、位置处理≤2000ms共同阻断可复现退化；CI保存原始JSON/截图，环境抖动应调查而非直接放宽阈值。

仓库配置另外核验：main PR/4项检查/strict/管理员保护/0审批；Pages build_type=workflow；旧手动工作流禁用；部署环境只允许main；Actions PR创建审批保持false。实际读回结果与CI链接记录于PROGRESS。设置与代码分别验收；代码未合并时旧main工作流不会自动获得新门禁。

契约检查的威胁边界：内容哈希声明、基线检查器和回归测试使变更可审查，无法自动判断解释真假，仓库内CI本身也不是不可修改的外部策略。仍需人工核对最终PR，不能把“绿色”解释为架构语义的绝对证明。

配置实读确认：main 的4项 strict 检查绑定 GitHub Actions app15368，0审批、PR必需、管理员保护、禁止强推/删除、讨论解决；Pages 已从legacy切换workflow，旧pages.yml已disabled_manually，环境仅main，Actions创建PR/审批仍false。最终集成[PR #40](https://github.com/biubiu52011/Pixel-Tetsudo/pull/40)待审查，未合并/部署。初次staged验收发现测试在hashchange之前同步读取返回状态，已修正等待真实列表恢复，未改生产路由或放宽断言。
