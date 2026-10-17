# 2026-10-14 JST — 非 FULL SQL 时刻表及车型证据链

> 历史记录：保留当时的方案与验收结论，不代表现役实现或当前线上状态。 最新进度见 [PROGRESS](../../PROGRESS.md)；分类入口见 [文档索引](../README.md)。

执行者：Codex。数据库已更新；前端已在用户授权后完成本地备份、线上整合和公开发布。下方原始 SQL 执行记录保留，发布验收见文末。

## 规则与实现

`ODPT／SQL 列车号 → 既有线路车型证据 → TrainOperationEvidence → TrainVehicle → 原生 PNG 路径`。

`ODPTClient.usesSqlTimetable` 按 `REALTIME_POSITION_POLICY` 的线路覆盖模式选择时刻表来源：FULL 禁用 SQL，HYBRID／COARSE／SEGMENTED／UNKNOWN 使用 Supabase SQL。实时 Train 观测继续优先于同一物理班次的推定位置。SQL 错误或空结果不启动旧 JS 时刻表位置链路。

适用页面：trains 的时刻表按需加载、直通依赖、跨日重试和位置推定；其他页面继续使用共享 RuntimeConfig，未改变它们的业务来源。

SQL 端复用既有 `railway_lines.sql_planned_fallback_enabled`、`timetable_ingest_jobs`、`persist_odpt_timetable_templates`、canonical sync 和车型 mapping refresh。未增加 schema 或第二套映射脚本。

## Supabase 执行结果

- 项目：像素铁道（pnupwfmgbtxqhpzsrhfn）。
- 210 条非 FULL 线路均启用 SQL，并均有模板；13 条 FULL 线路禁用 SQL。
- 原有 192 条线路、79,478 个模板；补齐 18 条线路后为 210 条、92,320 个模板。
- 18 条线路 × 平日／SaturdayHoliday = 36 个导入任务：26 complete、10 partial、0 failed。
- 新增 12,842 个有效班次及 220,482 条停站；171 条上游不完整记录排除，partial 标签保留。
- 新增 ODPT 模板均已进入 `train_timetable_source_resolution`；缺失 canonical resolution 为 0。
- 来源为执行时实际 ODPT TrainTimetable 响应；没有导入本地无修订日期的旧 manual 记录，也未赋予未经证据确认的车型或编成。

补齐线路：TobuIsesaki、TobuNikko、Tsurumi、Yamanote、Yokosuka、SobuRapid、UtsunomiyaJR、ChuoRapid、KeihinTohoku、Mita、Nambu、Tokaido、Takasaki、ShonanShinjuku、JobanLocal、Joban、Keiyo、Musashino。

本次政策更新 SQL（FULL 列表来自当前 canonical IDs 与 RuntimeConfig；将来政策改变时应重新计算）：

```sql
UPDATE public.railway_lines
SET sql_planned_fallback_enabled = id <> ALL (ARRAY[
  'SaikyoKawagoe','Asakusa','Shinjuku','Oedo','Arakawa',
  'KeioInokashira','KeioKeibajo','KeioMain','KeioTakao',
  'Noda','Ogose','Tojo','TobuSkytree'
]);
```

通过 SQL 建立一次性导入任务，然后调用已有 timetable-ingest；由该函数验证线路、日历、列车号、至少两个有效站点时间和截断上限，再调用 SQL RPC 原子导入。未记录任务密钥。

## 验证

- 实际服务日 2026-10-14：Yamanote 522／Mita 406／Rinkai 296 个 SQL runs；Keiyo 558，PARTIAL；Kawagoe 3，PARTIAL；SaikyoKawagoe BYPASS，0 SQL runs。
- 实际山手线 522 条 SQL rows 通过既有 TrainOperationEvidence 和 TrainVehicle，522 条解析为 E235系0番台（山手線），路径存在；示例 1000G → `images/列车/JR東日本/JR東日本_E235系_0番台.png`。该证据确认车型，不宣称当日具体编成。
- 223 线路车型证据／图库检查：83 canonical artwork records，0 missing native PNG；78 资源引用和 466 张锁定 PNG 检查通过。缺少决定性车型证据的列车继续使用中性位置标记。
- 31 工具测试套件、50 页面／服务日测试、4 个 Python 工程 guards、JS 语法及 diff whitespace 检查通过；工程 guards 的既有 baseline warnings 保留。
- 未进行真实浏览器交互验收（browser runtime: NOT VERIFIED）。未执行 GitHub CI/CD 或 Pages 发布；未部署或降级现有 Supabase train-runs v142、timetable-ingest v7，直接复用它们已有的 SQL eligibility 支持。

审计材料保存在本次对话 visualization 的 `non-full-sql` 目录：upstream-audit.json、live-serving-audit.json、vehicle-mapping-audit.json、sql-evidence-png-chain.json。相关原始本地文件及核对用线上固定版本快照也保存在该目录。

## 用户授权后的公开发布验收

- 发布代码提交：0cccd721bf834f568f7a881b7879be7aa9ad5e3d；最新线上基准 5483796c 已完整吸收，本次策略在新版实现上合入。
- 本地 24 个文件备份经 SHA256 确认；完整补丁、manifest 和 Git stash 保留。6 个原有独立本地修改保持原样。
- 最新基准的 31 工具测试套件、61 页面／服务日测试、4 Python guards 和 PNG 校验通过。
- CI / CD 38495454495、Release Guards 38495454599、Pages 38495454358 均 success。公开四个修改脚本 HTTP 200、哈希匹配，资源版本 4.3.1199。
- 公开页面真实浏览器 DOM：山手线 SQL planned-trip 1000G／929G 等 → E235系0番台 PNG；埼京线为 ODPT Train 实时标记。错误日志为空。未进行系统截图或人工视觉确认。
- 公开地址：https://biubiu52011.github.io/Pixel-Tetsudo/pages/trains.html 。

## 2026-10-17 位置重播调查补充

本轮确认：原位置计算把同公司运行情报中的最坏延误应用于全部时刻表列车，未知延误默认15分钟、停驶默认60分钟；情报改变时会倒拨或重新显示已经终到的班次。现移除此种无逐车依据的位置偏移，计划位置使用当前JST（含秒），实际位置及实测延误仍由ODPT Train优先。现役15秒本地位置时钟替代60秒整分钟步进，不增加SQL/ODPT网络轮询。环线位置回调不再转换为整圈动画，前台恢复或跳过区间直接对齐最新位置。

SQL只读审计：92,322条source resolution均缺少date_verified有效期认证。这是元数据缺口，不等于证明全部时刻错误，也不能据此声称全部已对标现行ダイヤ。26条线路存在纯大写前缀内部编号，涉及京急、西武、部分小田急/东急/京成及单轨；内部编号本身不能证明时刻虚构，但缺少可追溯的公开班次身份，需要逐来源校核。例Keikyu KKO001的品川06:23→浦贺08:32必须回到原始发布时刻核对，不可用车型图标测试替代。

本轮未删除或改写这些SQL时刻、未将车型规则修订日期充当时刻表有效期。当前ダイヤ有效期与全班次逐站核对仍待补齐，不能宣称全线路时刻表已完成验证。

## 2026-10-17 内房线公开计划与 SQL 缺班核对

以 JR 东日本2026年10月号内房线上下行、平日与土休日四张矩阵及逐车日历核对：既有平日189班均有对应公开班次；本次比对5456个矩阵到发字段，5417个已存同名字段时刻一致，39个属于源记录仅保留边界到达/发车的一侧，不作为39个错误时刻修改。不是只按记录存在或图标数量验收。

土休日缺新宿さざなみ1号内房段9043M（千叶08:38→馆山10:06）和4号内房段9046M（馆山16:02→千叶17:23，继续往新宿）。官方逐车日历分别公布28个开行日期，范围2026-09-19至2026-11-29；现以56条按日期train_runs和560条停站补入，未复制为全年每日班次，也未改写原370个周期模板。两个来源URL及完整公布日期保存在evidence_sources；正式回归事实样本为tests/fixtures/uchibo-published-seasonal.json，不参与生产数据加载。

- https://timetables.jreast.co.jp/2610/train/015/019131.html
- https://timetables.jreast.co.jp/2610/train/020/022251.html

官方实际运行表同时明确2026-10-17/18两班停运；复用既有service_exceptions保存4条逐车逐日例外。计划保留在SQL/API，位置适配器不将cancelled计划变成移动标记。例外不按裸列车号跨日/跨线路扩散。现役train-runs v243同时为周期计划和日期计划读取这一例外来源，原RLS与接口权限保持原样。实现中短暂加入的重复状态列已撤回，实际迁移20261017044313/20261017050314如实保留；最终schema继续使用既有service_exceptions所有者。
停运来源：https://traininfo.jreast.co.jp/train_info/express.aspx?group=wakashio_sazamani 。

共用刷新缺口：DataFusion原来只在运营日变化时重新加载SQL，同日新增计划和停运可能停留整天。改为使用既有十分钟缓存TTL，并替换该线路旧SQL副本；确认空/全部取消可以清空旧注册数据，SQL错误则不能伪装空结果或启动旧JS位置回退。保持FULL实时优先与唯一位置计算器。

线上回读：10/17、10/18各183计划（181周期+2日期），其中2班cancelled；10/19为189平日计划；10/24为183公布计划；11/30无新增季节班次。56个公布日历样本验证正常运行区间与终到退出，停运样本不生成位置；并验证同日TTL、确认空替换、旧副本逐线驱逐、异常隔离，以及超过1000条例外的分页。

全库筛查另确认10条新干线只有Weekday模板、没有土休日分支：上越、北海道、秋田、山形、西九州、九州、北陆、东北、东海道、山阳。此项仍未补齐，不通过复制平日数据或统计“有模板”宣称完成。其余低样本线路（川越、吉都、北上、吾妻、上越等）也不能由模板数量推断全班次完整。
