# 数据链路审计（2026-10-17 JST）

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
- js/trains-page.js / trains-render.js / train-motion.js：页面订阅、绘制、动画；需要用浏览器 trace 核验实际渲染成本，不能用网络完成代替。

## 已确认的风险

1. fetchODPT 吞掉错误返回 null，extractData 再返回空数组；失败无法进入上层 catch，影响运行状态与空时刻表负缓存。
2. 限流不等于请求去重；同一 URL 的多个消费者仍可排队独立请求。
3. SQL 适配前缺少响应 line_id/service_date 与请求绑定检查。
4. 原手动 Pages workflow 绕过 Validate；原部署仅依赖 Validate，不等待 Release Guards。阶段01已关闭该路径。
5. 网络快照需要防止较早源时间覆盖较新源时间；完成时间不能当作数据版本。

## 验收与后续

阶段01：五份网络基线、发布门禁。阶段02：在现有 ODPTClient 统一去重、失败传播、SQL校验、快照版本；不增新请求引擎。阶段03：在既有 Fusion/Estimator/Renderer 中明确元数据/位置/显示变化，并回放身份连续性。阶段04：删除迁移旧路、登记定时器、浏览器性能对比与四类线路验证。

本阶段发布守卫及架构守卫本地通过。没有执行生产部署。浏览器运行与全链路渲染性能尚未验证；整体状态 PARTIAL。回滚使用 revert PR，通过同一 CI/CD，保留构建 SHA 的资源缓存版本机制。
