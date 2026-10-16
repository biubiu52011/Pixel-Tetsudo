# Pixel Tetsudo 公共组件索引（COMPONENTS）

> 目的：**开发前先查本索引——命中即复用，禁止新构**。
> 本项目反对"每个任务独立制作组件"的开发方式；公共组件是共享资产，样式统一、参数变化的场景一律复用渲染组件。
> 维护规则：新增公共组件必须在本索引登记；收敛重复实现后更新对应条目；删除组件先查引用。

---

## 0. 使用规则（强约束）

1. **开工前查索引**：按能力关键词（数据加载 / 分类判定 / 直通标签 / 换乘提示 / 图集 / 徽章 / i18n / 地图 / 列车图）检索下表。
2. **命中即复用**：调用现成组件/全局 Provider，不复制实现、不另起炉灶。
3. **单一真源**：同一能力只允许一处实现（如分类判定只在 `tourism-type.js`）。
4. **同质异参**：样式统一、仅文本/方向/数量/图片集等参数变化的场景（直通标签、换乘提示、图集查看器、徽章），复用同一渲染组件并传参，不得复制样式或另写渲染。
5. **数据改动**：改单一真源 JSON → 用 `gen-file-data.js` 重新生成 `.file.js` / `.compact.json` 双胞胎产物，不手改产物。
6. **全局 Provider**（`window.*`）是项目的公共 API 面，页面/模块间调用优先走 Provider，不直接读取私有状态。

---

## 1. 数据层（真源 + 产物 + 加载器）

| 组件 | 位置 | 说明 / 用法 |
|---|---|---|
| 统一数据加载器 | `data/core/db-loader.js` | file/http 双分支 + localStorage 缓存（v4.3.1226）；缓存键随 `?v=` 失效。全站页面共用，**新页面加载数据一律走它**。 |
| 线路数据真源 | `data/core/railway_data.json` | 站点/时长/线路唯一真源；产物：`railway-data.file.js`（内联）+ `railway_data.compact.json`（紧凑）。 |
| 站名多语言真源 | `data/core/station_i18n.json` | 产物：`station-i18n.file.js` + `station_i18n.compact.json`。 |
| 观光数据真源 | `data/core/tourism_data.json` | spots=516+ 条目；产物：`tourism-data.file.js` + `tourism_data.compact.json`。 |
| 产物生成器 | `data/core/gen-file-data.js` | 从真源 JSON 生成 `.file.js` 与 `.compact.json` **双胞胎**；数据变更后必须重跑。 |
| 运行时配置 | `data/core/runtime-config.js` | 轮询间隔（REFRESH_INTERVAL / POSITION_INTERVAL）等全局常量。 |
| 线路数据配置 | `data/core/data-config-bundle.js` | 线路数据配置 bundle。 |
| 车型定义 | `data/core/train-type-defs.js` | 车辆类型定义。 |
| 换乘提示数据 | `data/core/transfer-hints.js` | 换乘/直通提示的提示语数据（配合 4.2 渲染）。 |
| 运营/服务关系 | `data/core/line-service-relations.js` | 线路间运营/服务关系。（注意：副本另有 `through-service.js` 直通关系模块，主项目待同步确认） |
| 实时数据融合 | `js/data-fusion.js` | DataFusion v11：ODPT trains/delayInfo/realtimePositions 融合；消费 `TrainPositionEstimator` 结果。 |
| 统一数据层 | `js/data-layer.js` | 缓存（TTL 60s / 上限 50）/ 本地数据 / API 数据三层。 |
| 数据状态 | `js/data-state.js` | 数据状态管理。 |
| 本地铁路数据 | `js/local-railway-data.js` | 本地铁路数据源。 |
| ODPT 惰性标记 | `js/odpt-lazy.js` | home 页加载 odpt 前惰性标记（`ODPT_LAZY`），避免首屏全量 init。 |

## 2. 业务判定（单一真源）

| 组件 | 位置 | 说明 |
|---|---|---|
| 观光分类 | `js/tourism-type.js` | event / shop / spot 路由的唯一入口；百货商场→景点等硬规则只在此处。 |
| 直通方向数据 | `js/trains-data.js::_throughDirForStation` | 直通标签方向数据源（端点 up/down、中间接续 middle）；**职责仅为直通标签渲染（4.1）供数**，不承担独立业务判定。 |
| 运行链解析 | `js/running-chain-resolver.js` | Running-Chain ↔ canonical entity 解析（每线路 ResolutionContext）。 |
| 站名解析 | `js/station-resolver.js` | 多语言站名 ↔ station_id 双向解析（`window.StationResolver`）。 |
| 车型判定 | `js/train-vehicle.js` | 车辆类型**单一决策路径**：S0 内嵌字段 > S1 ODPT 实时 > S2 车号累积表。 |
| 位置推算 | `js/train-position-estimator.js` | 无实时位置的线路按时刻表+延误推算列车位置（Provider/Consumer 契约见文件头）。 |
| 路径搜索 | `js/route-search.js` | BFS 站间路径搜索（基于 UNIFIED_LINES 图结构，`window.RouteSearch`）。 |

## 3. 全局 Provider（`window.*` 公共 API 面）

页面/模块间调用优先走以下 Provider（均来自对应 js 文件，文件头有职责说明）：

数据：`DataFusion` `DataLayer` `DataLoader` `DataState` `RailwayDB` `RailwayRTC` `RTCache` `RunInfoAPI` `LOCAL_RAILWAY_DATA` `PLATFORM_DATA` `PlatformResolver` `ODPT_LAZY`
判定：`TourismType` `StationResolver` `RouteSearch` `SearchUI` `RunningChainResolver` `ThroughService`(副本) `LineOperationSystems` `LineServiceRelations` `DelayTranslator` `FareEstimator` `TrainPositionEstimator` `TrainVehicle`(待挂载确认)
观光：`TourismDetailCore` `SightseeingModule` `TourismProximity` `TOURISM_DATA` `TOURISM_EVENTS` `TOURISM_SHOPS` `TOURISM_SPOTS` `TOURISM_SIGHTS` `TOURISM_STATIONS`
列车图：`TrainsPage` `TrainsConfig` `TrainsColors` `TrainsActiveSystemLineIds` `TrainIcons` `TrainTrackLayout` `LinePresentationService` `SharedTrackPairs` `GEOM`
数据常量：`RAILWAY_DATA` `RAILWAY_I18N` `STATION_NAME_MAP` `EN_STATION_NAME_MAP` `STATION_LINES` `STATION_COORDS` `STATION_EXITS` `EXIT_DATA` `LINE_STATION_ORDER` `TRAIN_NO_VEHICLE` `DataCorrectionRules`

## 4. 渲染组件（同质异参 —— 重点复用区）

> 以下组件的共同模式：**样式统一，参数变化**。任何页面/模块需要同类视觉时，复用组件传参，不复制样式或另写渲染。

### 4.1 直通标签 through-chip（统一样式：方向/文本参数化）

- **入口**：`js/trains-utils.js::_throughChipSize`（尺寸/文本换行/基线补偿）、`_throughChipHeight`（几何预留）、`_layoutThroughChipGroup`（分组布局）、`_normalizeThroughChipList`（归一化）；`js/trains-render.js::_renderThroughChip`（SVG 渲染）。
- **参数化**：
  - 文本：`直通`（i18n `train.through`）+ 线路名（`_throughShortName` 去"直通"字样/括号），窄屏换行（`throughLbl` 独立行）。
  - 方向：up/down（端点）→ ▲/▼；middle（中间接续）→ ←/→（`_throughSide` 由分组对齐决定）。
  - 形态：mobile 11px / desktop 9px；像素字体基线补偿 `textBaselineOffset = fontSize * 0.59`（v4.3.1240，箭头与文本共中线）。
- **数据源**：`js/trains-data.js::_throughDirForStation`。
- **用途**：列车图多条直通线路复用同一渲染器；新直通场景直接传 `lineObj`（含 lineId/color/name）即可。

### 4.2 换乘提示 journey-transfer（统一样式：数量/直通参数化）

- **入口**：`js/search-ui.js`——换乘计数徽章（L341 `journey-transfers`）、换乘/直通徽章（L381-395 `journey-transfer` + `--through` 变体 + hint）、直通降级（L476-484：ODPT 无贯通车次时去直通样式避免误导）。
- **参数化**：换乘次数（`transfers > 0` 计数）、线路名/车站名（escapeHtml）、提示语（`journey-transfer-hint`，来自 1. `transfer-hints.js`）、是否直通（`seg.through`）。
- **样式**：CSS 类 `journey-transfer` / `journey-transfer--through` / `journey-transfer-text--through` / `journey-transfer-hint`。
- **用途**：路径搜索结果的换乘/直通提示；新结果形态复用同一徽章构建逻辑。

### 4.3 图集查看器 Gallery Viewer（三类型详情页共用，v4.3.1244）

- **入口**：`js/tourism-core.js` L556 起（`galleryState` / `galleryIsOpen` / `bindGallery` 等）。
- **参数化**：`items` 图片列表——`tourism-event.js` / `tourism-spot.js` / `tourism-shop.js` 各自传入不同条目图片集。
- **用途**：观光详情页图片弹窗统一升级为图集（左右切换 + 菜单/推荐信息）；新页面要图集直接调用同一查看器。

### 4.4 徽章/标签 badge

- **入口**：`js/tourism-core.js`（tag / type / station badge 构建）。
- **参数化**：tag 文本、type（event/shop/spot）、station 名。
- **用途**：观光条目卡片/详情头部共用；样式在 `css/tourism-styles.css`。

### 4.5 列车图 SVG 渲染体系

| 组件 | 位置 | 说明 |
|---|---|---|
| 几何常量 | `js/trains-config.js` | `TrainsConfig.GEOM`（分支列宽/主列宽/移动端宽度等）。 |
| 几何计算 | `js/trains-geometry.js` | 坐标/并行双线（共享轨道区段判定，如 Yurakucho×Fukutoshin 和光市-池袋、Namboku×Mita 目黒-白金高輪）。 |
| SVG 渲染 | `js/trains-render.js` | 线路/站点/直通标签渲染；**列车图新增视觉元素优先复用其渲染骨架**。 |
| 测量/布局工具 | `js/trains-utils.js` | SVG 文本宽度测量（缓存）、基线偏移、标签尺寸（4.1）。 |
| 列车图标 | `js/train-icons.js` | 车型图标绘制。 |
| 位置→坐标 | `js/train-track-layout.js` | 列车位置 → 显示坐标（方向车道/间距）。 |
| 线路展示 | `js/line-presentation-service.js` | 线路展示服务（配色/图标解析）。 |

### 4.6 观光详情页公共底座

- **入口**：`js/tourism-core.js`（文件头自述 v4.3.802：数据加载流程/条目查找/距离·出站指引/公共章节/地图初始化 MapLibre→MapTiler→Leaflet 兜底/翻译切换）。
- **三类型**：`js/tourism-event.js` / `tourism-spot.js` / `tourism-shop.js` 各自实现快速信息条/信息网格/正文顺序/菜单板块，**公共部分一律走 core**。
- **周边**：`js/tourism-proximity.js`；**观光总入口**：`js/sightseeing.js`。

## 5. i18n（多语言）

| 组件 | 位置 | 说明 |
|---|---|---|
| 翻译表 | `js/translations.js` | en / zh / ja / ko 四语言键值（`window.t`）。 |
| 语言初始化 | `js/lang-init.js` | 语言检测/切换/持久化。 |
| 站名多语言 | `js/station-resolver.js` + `data/core/station_i18n.json` | 站名 ↔ id ↔ 多语言。 |
| 运行情报翻译 | `js/delay-translator.js` | 离线模板翻译引擎（`window.DelayTranslator`）；ODPT/官方文本句式高度模板化，**不依赖第三方 API**（线上不可用教训 v4.3.443/444）。 |
| i18n 一致性工具 | `tools/audit_i18n_consistency.js`、`tools/sync_i18n_pages.js`、`tools/sync_station_i18n.js` | 翻译键/页面注入审计与同步。 |

## 6. 样式 token（视觉单一真源）

| 文件 | 说明 |
|---|---|
| `css/style.css` | 全局 `:root` 变量（颜色/间距/字号 token）+ 基础样式；**新视觉一律引用 token，不硬编码色值**。 |
| `css/tourism-styles.css` | 观光模块公共样式（badge/章节/图集）。 |
| `css/trains.css` | 列车图样式（含 through-chip 类）。 |
| `css/realtime.css` / `css/lang-bar.css` / `css/tourism-{event,shop,spot}.css` | 各页面专属样式。 |

## 7. 工具脚本（tools/ + data/core 生成器）

| 脚本 | 用途 |
|---|---|
| `data/core/gen-file-data.js` | 真源 JSON → `.file.js` + `.compact.json` 双胞胎（**数据变更必跑**）。 |
| `data/core/gen-config-bundle.js` / `generate-platform-data.js` | 配置/平台数据产物生成。 |
| `tools/gallery-sync.js` | 图库同步。 |
| `tools/audit_train_mapping.js` / `train_vehicle_mapping_guard.js` / `vehicle-audit.js` | 列车/车型映射审计。 |
| `tools/audit_i18n_consistency.js` / `sync_i18n_pages.js` / `sync_station_i18n.js` | i18n 审计与同步。 |
| `tools/runinfo-evaluator.test.js` / `runinfo-scope.test.js` | 运行情报评估单测。 |

---

## 附：当前待收敛/待同步项

1. **`data/core/through-service.js`**：职责已收敛为**仅向直通标签渲染提供数据**（不是独立业务模块）；仅出现在 Linux workspace 副本，主项目未同步——确认后并入 1. 数据层（直通数据源）。
2. **重复实现排查**：各页面若有独立实现的"徽章/弹窗/提示条"，应收敛到 4.2 / 4.3 / 4.4 组件并删除重复样式。
3. 直通标签修复（v4.3.1240 基线补偿）已落地未推送——推送前复核本文档 4.1 条目与代码一致。
