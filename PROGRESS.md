# Pixel Tetsudo 工程进度

> 本文件是智能体之间的**唯一共享进度账本**。开始工作前先读 `ENGINEERING.md` 和本文件；完成/阻塞/交接后必须更新本文件。
>
> 最后人工整理：2026-10-07 JST

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

## 6. 交接规则

下一位智能体不要从“重新审计整个仓库”开始。先看：

1. 上表当前状态。
2. 待办队列中最高优先级未完成项。
3. 最近工作记录和 commit。
4. 对应代码最新 main。

如果实际代码与本文件不一致，以代码/CI 为事实，并立即修正本文件。

如果发现另一个智能体已经提交相同目标，不建立第二套实现；审查并继续现有实现。
