# 5. 变更日志（2026-09-21）

> 本文件为 2026-09-21 变更归档；条目格式与正文组织沿用 archive/DEVELOPMENT-CHANGELOG-2026-09-20.md。

## 4.3.932（2026-09-21，trains/home 两页推送架构优化——第一阶段 E1/E2/E3+E5）

**用户指示**：「整体优化一下两个铁路相关页面的推送方式和推送架构」（两个页面 = trains.html 全量页 + home.html 惰性页）。

**问题基线**：整页跳转后新页 loadRealtimeData 需 2–4s 拉完所有 operator 才推送；首页惰性模式与 trains 页全量模式两套初始化并存；数据加载不分可见性，后台标签页持续轮询；切页后 41 条 JR 地方线时刻表探测标记（probed）丢失导致重复探测请求。

**落地（全部在 data/api/odpt-unified.js）**：
- **E1 轮询生命周期**：visibilitychange 暂停/恢复——hidden 时清空全部轮询定时器（30s realtime + 300s ttcheck + 位置/推定），visible 时恢复并立即刷新一次（ODPT_DELAY_DATA 引用变化驱动）。
- **E2 probed 持久化**：collectTimetableByRailway 探测结果（含 41 条 JR 地方线映射）写入 localStorage `odpt_tt_probed_v1`，切页后恢复，重复探测归零。
- **E3+E5 缓存优先 + 惰性轻量读**：getCompleteTimetable 缓存优先（ODPT_TIMETABLES 命中即零请求，LINE_RAILWAY_CODE 别名/完整 URI 归一）；惰性模式追加 loadTimetableCache（IDB 轻量读，不拉 API），搜索不再重复打 API；回前台立即刷新延误。

**验证**：node vm 沙箱 verify_push_optimize.js 23/23 断言全绿（零真实请求）：E1 定时器建/清/恢复、E2 probed 落盘与恢复、E3 缓存命中/映射/未命中走 API、lazy 单轮询定时器与缓存命中。

**遗留**：真实页面行为由用户人工确认（项目打磨期规则：不系统截图确认，交付后由用户人工验收）。

## 4.3.936（2026-09-21，实时数据落盘 + stale-while-revalidate——第二阶段 E4）

**用户指示**：「继续」（第一阶段确认后继续第二阶段）。

**问题基线**：整页跳转后新页 loadRealtimeData 拉完所有 operator 前，UI 显示「情報取得中」空窗 2–4s；首页切回搜索页时延误徽章同样延迟。

**落地（data/api/odpt-unified.js，4 处）**：
1. **persistRawRealtime**：每次拉取完成即把原始 delay/positions 写入 RTCache（IDB，独立 raw 键 `rawDelay`/`rawPositions`，带 ts；不与 data-fusion 的 positions/delayInfo 融合键冲突；lazy 模式只落 rawDelay 防覆盖 trains 页位置）。
2. **loadRawRealtimeCache**：新页启动先读缓存（30s 新鲜窗口与轮询同周期）→ 填充全局 → DataFusion 就绪后立即推送（300ms 重试等待），过期缓存不进入推送链。
3. **loadAllData 顺序化**：先 loadRawRealtimeCache 再 loadRealtimeData（stale-while-revalidate：缓存命中立即渲染，拉取完成覆盖）。
4. **lazy 分支同样先缓存后拉取**：切回搜索页延误徽章即刻显示。

**RTCache API 核验**：db-loader.js rtPut 存 `{key, value, ts}`、rtGet 返回 value——E4 调用 `put('rawDelay', {ts, data})` + `get` 返回 `{ts, data}` 完全匹配（data/core/db-loader.js:29-58）。

**加载顺序核验**：trains.html L129/L134/L144 与 home.html L104/L105 均 db-loader → odpt-unified → data-fusion，RTCache 先就绪。

**验证**：verify_push_optimize.js 扩至 74/74 断言全绿（全量 31 + lazy 19 + data-fusion 24）：E4 全量落盘 rawDelay/rawPositions、缓存命中先于拉取进入推送链、缓存 positions 触发 loadTrainPositions、过期缓存（60s > 30s）不推送、lazy 只落 rawDelay（模式隔离）。

**遗留**：真实页面行为（切页空窗消除）由用户人工确认（项目打磨期规则：不系统截图确认，交付后由用户人工验收）。RTCache 写入失败静默降级（persist 判空 + try/catch），不影响拉取主链。
