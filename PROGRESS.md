# Pixel Tetsudo 工程进度

> 本文件是智能体之间的**唯一共享进度账本**。开始工作前先读 `ENGINEERING.md` 和本文件；完成/阻塞/交接后必须更新本文件。
>
> 最后人工整理：2026-10-07 JST

## 1. 当前总览

| Workstream | 状态 | 当前结论 / 下一步 |
|---|---|---|
| UI-001 全站 SiteShell | TODO | 7 个 HTML 重复 Header/Language/Nav/Footer；先建立共享契约，再逐页迁移 |
| UI-002 OperatorFilterBar | REVIEW | JR-East、tOp、多页面显隐回归已修；等待最新 CI/CD、Release Guards、Pages 最终结果 |
| UI-003 LineCard / SystemCard | TODO | 当前共享 `DataState.renderCard/renderSystemCard`，但内部 mode 分叉且 realtime 直接 patch DOM；需正式组件化 |
| UI-004 LineList / OperatorGroup | PARTIAL | `DataState.renderList` 已共享；需与 LineCard 职责拆清并统一空结果/排序 |
| UI-005 PageState lifecycle | PARTIAL | `DataState` 已共享 render/retry 基础；页面仍重复 loading/retry/recovery glue |
| UI-006 Tourism Detail Shell | TODO | event/shop/spot HTML 骨架几乎相同；待 SiteShell 稳定后吸收 |
| UI-007 CSS 收敛 | IN_PROGRESS | 已确认公共/页面 CSS 混合覆盖；页脚误加分割线已删除 |
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

- [ ] **UI-002A** 当前 HEAD `cdba6c6d...` 的 Release Guards、CI/CD、Pages 已启动，等待最终结果。旧 CI 失败根因是 guard 文件重复声明 `fusionSource`，已由 `59471139` 修复。
- [x] **UI-002B** trains 已恢复 `TransitConstants.isJRERoute` 特殊过滤语义（`94f11773`）。
- [x] **UI-002C** 共享 FilterBar 优先使用 `tOp()`，再 fallback `operatorLabel()`（`cdba6c6d`）。
- [x] **UI-002D** trains detail show/hide 已统一走 `setFilterAvailability()` → 组件 API（`94f11773`）。

### P1 — 全站基础层

- [ ] **UI-001A** 定义 SiteShell API / DOM contract，不先改业务。
- [ ] **UI-001B** 吸收 Header。
- [ ] **UI-001C** 吸收 LanguageSwitcher。
- [ ] **UI-001D** 吸收 MainNavigation，active tab 由 page identity 决定。
- [ ] **UI-001E** 吸收 Footer；保持无顶部横线。
- [ ] **UI-001F** 添加 architecture guard，禁止 7 个 HTML 再复制 SiteShell 完整结构。

### P1 — 卡片/列表

- [ ] **UI-003A** 从 `DataState.renderCard` 提取正式 LineCard 基础组件。
- [ ] **UI-003B** SystemCard 归入同一组件体系。
- [ ] **UI-003C** 建立 `LineCard.update()` 或等价稳定 API。
- [ ] **UI-003D** 删除 realtime 对 LineCard 内部 DOM 的手工 patch。
- [ ] **UI-004A** DataState/LineList 只负责 list/group orchestration，不再拥有卡片内部模板。
- [ ] **UI-004B** 收敛 realtime/trains 对 `.rs-line-card` 的页面 CSS override。

### P1 — 页面状态

- [ ] **UI-005A** 在现有 `DataState` 上吸收 page lifecycle；不要创建第二个平行状态系统。
- [ ] **UI-005B** 统一 loading/offline/fetch_error/timeout/retry。
- [ ] **UI-005C** 保留 mobile Chrome BFCache/online recovery 语义。
- [ ] **UI-005D** 更新 RECOVERY-001 guard，从检查页面重复 glue 转为检查共享 lifecycle contract。

### P2 — Tourism

- [ ] **UI-006A** event/shop/spot 使用同一 TourismDetailShell。
- [ ] **UI-006B** 类型差异通过 config/controller 注入，不复制 HTML。
- [ ] **UI-006C** 地图能力/CSP 继续最小权限，不因 shell 统一而扩大权限。

### P2 — RunInfo 后续

- [ ] **RUNINFO-004A** 统一 RunInfoAPI 与 DataFusion 的 line/operator-global record 选择语义。
- [ ] **RUNINFO-004B** 成功返回 `[]` 时明确“本次 snapshot 无 incident/正常”与 last-good 的关系，避免旧 incident 无意义保留 10 分钟。
- [ ] **RUNINFO-004C** 检查 last-good 是否应保存 notice/info。
- [ ] **RUNINFO-004D** 搜索 `aggregateDelayRecords` 是否已成为 dead path，确认后再删除。
- [ ] **RUNINFO-004E** 检查 `_previousPosMap` / raw realtime restore，确保 stale row 不会复活。

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

## 6. 交接规则

下一位智能体不要从“重新审计整个仓库”开始。先看：

1. 上表当前状态。
2. 待办队列中最高优先级未完成项。
3. 最近工作记录和 commit。
4. 对应代码最新 main。

如果实际代码与本文件不一致，以代码/CI 为事实，并立即修正本文件。

如果发现另一个智能体已经提交相同目标，不建立第二套实现；审查并继续现有实现。
