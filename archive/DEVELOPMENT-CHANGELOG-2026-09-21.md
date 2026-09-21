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

## 4.3.937（2026-09-21，千代田线北綾瀬支线名标签超出 SVG 右缘被裁修复）

**用户反馈**：线上 trains.html 千代田线详情图，北綾瀬支线名标签「千代田線（北綾瀬支線）」绿色像素字被右边界硬裁，手机端只显示到「千代田線（北綾瀬支」。

**根因**：trains-render.js:752 branchName（竖列模式支线名标签，fill=#009944 线色，text-anchor=start 从 bx+6 向右排，font-size 14）画在了 trains-geometry.js:527 单支线 svgW 计算的包围盒之外——svgW 只预留支线竖列区（stubR + BRANCH_COL_W=96 + padding），未算标签文字本身宽度（14 字全 CJK ≈ 215.6px）。SVG 规则：超出 viewBox 右缘的内容直接不绘制，CSS width=100% 拉伸救不了（与推送优化无关，既有几何缺陷）。

**修复**（js/trains-geometry.js:524-537）：单支线分支 svgW 追加 _singleBranchNameW——branchLines.length===1 时取 resolveLineName(branch.id)，按渲染 clamp 同公式（CJK 1.1 / 其他 0.55 × 14px）算标签文字宽计入 svgW。无支线（0 条）恒为 0，多支线（≥2 条）走另一分支不受影响。

**验证**（node vm 沙箱真实跑 computeRouteGeometry，对比 git HEAD 旧版）：
- 千代田线移动端 svgW 318.5 → 472.5（+154.0，标签右缘 420.1 完整入画，余量 52px）；桌面 334.5 → 488.5（+154.0）。
- 回归 5 线 svgW 逐值不变：Yamanote / Ginza / Narita（多支线）/ Tsurumi（多支线）/ Oedo（六形环）。
- 10/10 PASS；node --check 通过；pages/trains.html trains-geometry.js?v=4.3.905 bump 至 ?v=4.3.937。

**遗留**：实际渲染效果（整字「千代田線（北綾瀬支線）」完整显示）由用户人工确认（项目打磨期规则）。多支线分支的竖列线名标签若遇同类问题另行处理（本次未动，超范围）。
## 4.3.938（2026-09-22，全线路图大小统一：竖列支线名移出 SVG，viewBox 宽度归一）

**用户诉求**：4.3.937 把千代田线 viewBox 从 318.5 拉宽到 472.5（塞下长支线名）后，width=100% 等比缩放导致千代田整图比主流线小 37%——用户要求"所有线路图大小统一"。

**量化现状**（survey_viewbox.js，166 线）：主流线 svgW=297（157/166），单支线线（千代田/丸之内/Nambu）被支线名标签撑到 457~472.5，Narita/Tsurumi 横排多支线 868~1747。width=100% + preserveAspectRatio meet 下，viewBox 越宽缩放越小——支线线字比主流线小 37%。高度（svgH 134~3734）随行数变化是物理必然，无法统一也不需统一。

**方案 A 实施**（支线名移出 SVG，不撑宽 viewBox）：
1. **trains-geometry.js**：撤回 4.3.937 的 _singleBranchNameW（不再把标签宽计入 svgW），单支线 svgW 回到 mainCx+stubR+branchOffset+pad 基准公式。
2. **trains-render.js**：竖列分支的 branchName SVG text 元素删除（L729-741），改为收集 {name,color} 到 _branchNoteItems；L757 .tp-map-wrap 内 SVG 上方插入 .branch-note HTML 图注（线色着色，多条以 · 分隔）。横排 bHName（Narita/Tsurumi）不动——其宽度由横排支线列物理需要，非标签撑宽。
3. **trains.css**：新增 .branch-note（14px 像素字体、居中、线色）。

**验证**（survey_viewbox.js 复跑）：Chiyoda/Marunouchi 472.5→318.5、Nambu 457.1→318.5（-154/-138.6）；svgW 唯一值 8→6；与主流线 297 仅差 21.5px（7%，支线列物理宽度非标签）。node --check 通过；竖列 branchName grep 零残留。版本戳 trains.html 三处 bump 至 4.3.938。

**效果**：所有竖列支线线（千代田/丸之内/Nambu）字大小回到主流线水平，切换线路密度不跳；「千代田線（北綾瀬支線）」完整显示在图上方 HTML 层，自动换行不裁切。

**遗留**：Narita（1747）/Tsurumi（868）横排多支线线仍宽（横排布局物理需要），本次未动；Oedo 六形环 384/820 同理。若用户仍要求这些线也统一密度，需另行评估横排支线改竖向折叠方案。实际渲染由用户人工确认（项目打磨期规则）。