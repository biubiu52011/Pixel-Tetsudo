# Pixel Tetsudo 全站统一工程

> 本文件是工程规则与目标的长期入口。任何智能体、Codex 或人工开发者开始修改仓库前，必须先阅读本文件和根目录 `PROGRESS.md`。
>
> **唯一原则：先复用、再吸收、最后删除旧链路。禁止为了快速完成任务再建立一套平行实现。**

## 1. 工程目标

Pixel Tetsudo 当前的主要结构问题不是单个页面的视觉差异，而是多个 HTML 页面各自维护底层结构，再依靠不同 JS/CSS 实现近似统一的视觉与行为。

本工程目标是把全站收敛为：

```text
SiteShell
├── Header
├── LanguageSwitcher
├── MainNavigation
├── PageContainer
└── Footer

Shared UI Components
├── FilterBar
├── LineList / OperatorGroup
├── LineCard / SystemCard
├── PageState
├── Modal / Detail shell
├── Button / BackButton
└── Empty / Loading / Error / Retry

Page Controllers
├── home
├── history
├── realtime
├── trains
└── tourism detail
```

HTML 负责稳定挂载点和页面特有语义；共享 JS 负责重复的结构与状态；共享 CSS 负责组件视觉；页面 Controller 只负责页面业务。

## 2. 当前页面范围

必须把以下 7 个页面视为一个网站整体，而不是独立项目：

- `pages/home.html`
- `pages/history.html`
- `pages/realtime.html`
- `pages/trains.html`
- `pages/tourism-event.html`
- `pages/tourism-shop.html`
- `pages/tourism-spot.html`

已确认的全站重复包括 Header、语言切换器、主导航、Footer；三个 tourism detail HTML 的主体骨架高度重复。公共 CSS/JS 在不同页面还存在不同手工版本号。

## 3. 架构边界

### 3.1 SiteShell

目标：全站只有一个 Header / LanguageSwitcher / MainNavigation / Footer 结构来源。

要求：

- 页面通过 page identity 决定 active navigation，不复制四个导航链接。
- Footer 不得自行添加未确认的装饰。当前设计 **没有顶部横向分割线**。
- Header/Footer/Nav 的视觉变化必须在共享基础层完成，禁止页面 CSS 反向覆盖公共设计。
- CSP、ODPT、Supabase、地图等页面能力不同，`<head>` 权限不能为了“统一”而粗暴合并；能力声明按实际页面最小化保留。

### 3.2 Shared UI Components

共享组件必须拥有自己的 DOM 契约和状态更新入口。页面业务代码不得依赖组件内部偶然的 DOM 结构进行 patch。

例如 LineCard 完成迁移后，应通过组件 API 更新，不应由页面 Controller 直接查找 `.rs-line-interval`、`.rs-line-info` 后手工替换。

### 3.3 Page Controllers

页面 Controller 只负责业务差异：

- realtime：运行情报、状态详情、实时刷新。
- trains：列车位置、线路图、列车详情。
- home：路线搜索、附近观光。
- history：历史记录。
- tourism：详情数据和类型特有内容。

Controller 不应重新实现 Header、Nav、Footer、FilterBar、通用 Card、通用 Loading/Error/Retry。

## 4. 数据与运行时边界

- GitHub canonical railway data 保持唯一事实源；不要新建重复线路拓扑 truth JSON。
- Supabase 用于 runtime facts / evidence，不复制 canonical topology。
- running-chain 必须继续使用 evidence-based resolver，不恢复已删除的硬编码 through-service truth tables。
- realtime API 能直接识别车辆时优先 realtime；timetable/observation 只作必要 fallback/evidence。
- Wikipedia 仅参考/交叉验证，不作为 production runtime truth。
- 不允许为了 UI 重构改变这些数据边界。

## 5. 防止双链路

修改任何功能前：

1. 搜索是否已有公共实现。
2. 如果已有，优先扩展/吸收，不创建 `xxx-v2.js`、`new-xxx.js`、第二套 JSON 或第二个 renderer。
3. 新公共组件接管后，同一提交或紧随其后的迁移提交应删除/停用旧实现。
4. CI architecture guard 应验证“新路径存在 + 旧路径不能重新出现”。
5. 临时兼容 wrapper 允许短期存在，但必须在 `PROGRESS.md` 登记清理任务。

## 6. HTML / CSS / JS 统一原则

### HTML

- 稳定语义和挂载点留在 HTML。
- 重复 SiteShell 不应长期复制到每个 HTML。
- 页面不得自行复制已有共享组件内部结构。

### CSS

- 共享组件样式归共享 CSS。
- 页面 CSS 只保留真正业务特有布局。
- 禁止用页面级 `!important` 或反向覆盖来修复共享组件设计错误。
- 设计没有要求的装饰不得擅自加入公共组件。

### JavaScript

- 数据驱动 UI 使用共享组件。
- 页面脚本不直接重建已有共享组件。
- 公共行为必须有稳定 API；不要靠页面脚本摸组件内部 DOM。
- 对 mobile Chrome 的 BFCache / online / retry / stale-data 行为继续保留现有恢复保障。

## 6.1 七页 HTML 结构与组件所有权契约

全站采用同一层级的职责，不强制每个页面拥有相同业务 DOM：

1. **Document / capability**：每页保留自己的 `head`、CSP、脚本与地图/API 权限，不因结构统一而合并权限。
2. **SiteShell**：七页统一使用 `#app[data-site-shell-root]` 和唯一的 header/navigation/footer mounts；这些结构只能由 `js/site-shell.js` 生成。
3. **Page content**：每页一个主要业务 section；页面只提供稳定业务容器或语义节点。业务 section 的 ID 可不同，不要求为了统一而更名。
4. **Shared component**：相同功能必须选择**一个** DOM 所有者：HTML 仅提供 mount，组件 JS 负责生成与更新内部 DOM；或者 HTML 保留静态语义且 JS 只绑定行为。禁止两种模式混用或重复生成。
5. **Page controller**：只获取公开的 mount/组件 API，不通过查询共享组件的内部 class 实现业务 patch。
6. **Styles**：共享组件 CSS 由公共样式层拥有，页面样式只定义业务差异；不得靠后加载的页面 CSS 覆盖公共组件来伪装统一。

当前七页检查（2026-10-08）：

| 页面 | SiteShell | 业务容器 | 组件所有权重点 |
| --- | --- | --- | --- |
| home | 公共挂载 | tab-search | 搜索与观光由业务 controller 管理 |
| history | 公共挂载 | tab-history | 历史记录由页面 controller 管理 |
| realtime | 公共挂载 | tab-status | FilterBar / LineCard / DataState 公共；状态弹窗仍需审视所有权 |
| trains | 公共挂载 | tab-trains | FilterBar / LineCard / DataState 公共；列车线路图与详情属页面业务 |
| tourism-event | 公共挂载 | tourism-detail-page | tourism-core 负责公共返回按钮，event controller 负责类型正文 |
| tourism-shop | 公共挂载 | tourism-detail-page | tourism-core 负责公共返回按钮，shop controller 负责类型正文 |
| tourism-spot | 公共挂载 | tourism-detail-page | tourism-core 负责公共返回按钮，spot controller 负责类型正文 |

**当前未收敛事项**：三个 tourism HTML 仍复制相同的业务 section/article mount；realtime 状态弹窗与 trains 详情结构不同，需先判定是否属于同一种交互再决定共享，不得盲目合并；共享 CSS 和脚本版本号需在部署机制约束下统一。任何迁移必须同时验证七页的挂载点、唯一 ID、公共组件加载顺序及页面特有 CSP。

## 7. 当前优先级

按依赖顺序推进，不要同时建立多套方案：

1. **SiteShell 契约**：Header / LanguageSwitcher / Nav / Footer。
2. **LineCard / SystemCard**：从 `DataState` 的混合职责中整理为正式基础组件。
3. **LineList / OperatorGroup**：列表组织、排序、空结果。
4. **PageState lifecycle**：loading/offline/fetch_error/timeout/retry/recovery。
5. **Tourism detail shell**：吸收 event/shop/spot 三份重复 HTML。
6. **CSS 收敛**：删除页面对共享组件的重复/冲突定义。
7. **HTML 收敛**：所有页面只保留必要业务挂载点与能力声明。

已完成的 `OperatorFilterBar` 是 Shared UI Components 的一部分，不另建替代实现。

## 8. 智能体协作协议

### 开工前

每个智能体必须：

1. 读取 `ENGINEERING.md`。
2. 读取 `PROGRESS.md` 最新状态。
3. 检查目标文件最新 `main`，不要基于旧快照修改。
4. 在已有任务存在时继续该任务，不重复创建相同组件。
5. 若任务会改变架构边界，先在进度记录中说明。

### 工作中

- 每次只占用明确 workstream。
- 不修改其他智能体正在处理的同一文件，除非确认其提交已经落入 `main`。
- 发现隐藏问题可记录为 TODO；不要借机无边界重构。
- 修改 production code 时同步考虑 tests / guards / CI。
- 不能通过删除校验来“修复”CI。

### 完成后

必须更新 `PROGRESS.md`：

- 日期/时间（JST）
- Workstream / Task ID
- 执行者（能识别时写 agent/tool 名；不能识别写 `agent`）
- 状态
- 修改文件
- Commit SHA
- 做了什么
- 验证结果
- 遗留问题 / 下一步

**没有进度记录的架构改动视为未交接。**

## 9. 状态定义

- `TODO`：未开始
- `CLAIMED`：已有智能体准备处理，尚未提交
- `IN_PROGRESS`：正在修改
- `BLOCKED`：有明确阻塞
- `REVIEW`：代码已提交，等待验证/CI/浏览器确认
- `DONE`：代码和要求的验证均完成
- `PARTIAL`：部分完成，仍有明确缺口

不要把“代码已写”自动记为 DONE。

## 10. 提交规则

- 提交信息描述实际变化，不写泛化的 `fix`。
- 架构迁移优先小步提交，保证每步可回退。
- 每次迁移必须保证旧路径不会与新路径同时长期运行。
- 直接提交到 `main` 时尤其要保持每个提交可部署。
- GitHub Pages cache-busting/deployment 机制不得回退。

## 11. 验证最低要求

根据改动范围至少执行/确认：

- 语法/静态检查
- Architecture Guards
- Release Guards
- CI/CD
- Pages deployment
- 涉及 realtime/trains 时检查 mobile recovery 契约
- 涉及 UI 时确认共享组件未被页面 CSS/JS重新覆盖

浏览器未实际验证时必须明确写 `browser runtime: NOT VERIFIED`，不能写 PASS。

## 12. 明确禁止

- 禁止新增第二套 FilterBar / LineCard / PageState / SiteShell。
- 禁止恢复硬编码 through-service truth tables。
- 禁止把 Supabase runtime 数据重新复制为新的 canonical JSON。
- 禁止通过页面 CSS patch 掩盖共享组件错误。
- 禁止为了统一而扩大 CSP/API 权限。
- 禁止忽略/关闭 CI 错误后宣称完成。
- 禁止智能体完成工作后不更新 `PROGRESS.md`。
