# Pixel-Tetsudo（像素铁道）— 项目总文档（综合版）
## 目录

> **文档结构**：第一部分 综合版（第 1-10 章）——项目概要、架构、规范、设计、API、部署、测试、风险；第二部分 附录（附录 A-D）——四份原始源文档全文（权威细则）。
> **阅读建议**：新会话 / AI agent 建议顺序——1.1 文档目的与约定 → 3 系统架构 → 4 通用规范 → 附录 A 硬规则 → 附录 B 线路图设计；涉及具体主题时按目录直达对应章节。

  - [1. 文档总述](#1-文档总述)
    - [1.1 文档目的与阅读对象](#11-文档目的与阅读对象)
    - [1.2 版本修订记录](#12-版本修订记录)
    - [1.3 术语与缩写](#13-术语与缩写)
    - [1.4 参考资料](#14-参考资料)
  - [2. 项目概述](#2-项目概述)
    - [2.1 业务背景](#21-业务背景)
    - [2.2 用户角色](#22-用户角色)
    - [2.3 功能清单](#23-功能清单)
    - [2.4 核心业务流程](#24-核心业务流程)
  - [3. 系统架构设计](#3-系统架构设计)
    - [3.1 整体架构](#31-整体架构)
    - [3.2 技术栈](#32-技术栈)
    - [3.3 环境划分](#33-环境划分)
    - [3.4 外部依赖](#34-外部依赖)
    - [3.5 目录结构](#35-目录结构)
    - [3.6 页面结构](#36-页面结构)
    - [3.7 前端分层](#37-前端分层)
    - [3.8 数据通道](#38-数据通道)
    - [3.9 后端（服务端）规范](#39-后端服务端规范)
    - [3.10 页面结构规则](#310-页面结构规则)
      - [3.10.1 通用页面骨架（7 页统一）](#3101-通用页面骨架7-页统一)
      - [3.10.2 各页面结构清单](#3102-各页面结构清单)
      - [3.10.3 资源引用规范（脚本链顺序）](#3103-资源引用规范脚本链顺序)
  - [4. 全局统一格式与开发规范](#4-全局统一格式与开发规范)
    - [4.1 目录文件命名规范](#41-目录文件命名规范)
    - [4.2 代码命名、注释统一规范](#42-代码命名注释统一规范)
    - [4.3 页面、路由命名规范](#43-页面路由命名规范)
    - [4.4 多语言文案格式规范](#44-多语言文案格式规范)
    - [4.5 铁道数据录入统一规范（线路 / 车站 / 颜色 / 排序）](#45-铁道数据录入统一规范线路--车站--颜色--排序)
    - [4.6 UI 视觉统一规范（字体、间距、配色、SVG 绘制规则）](#46-ui-视觉统一规范字体间距配色svg-绘制规则)
    - [4.7 接口命名、参数格式统一规范](#47-接口命名参数格式统一规范)
  - [5. 前端设计](#5-前端设计)
    - [5.1 项目目录结构](#51-项目目录结构)
    - [5.2 全站路由清单](#52-全站路由清单)
    - [5.3 多语言实现方案](#53-多语言实现方案)
    - [5.4 铁道 SVG 地图渲染标准](#54-铁道-svg-地图渲染标准)
    - [5.5 全局公共组件设计](#55-全局公共组件设计)
    - [5.6 响应式适配规范](#56-响应式适配规范)
    - [5.7 静态资源管理规范](#57-静态资源管理规范)
    - [5.8 本地存储方案](#58-本地存储方案)
  - [6. 后端设计](#6-后端设计)
    - [6.1 系统模块划分](#61-系统模块划分)
    - [6.2 后台权限模型](#62-后台权限模型)
    - [6.3 数据库设计](#63-数据库设计)
      - [6.3.1 本地铁道线路基础数据库（核心静态底库）](#631-本地铁道线路基础数据库核心静态底库)
      - [6.3.2 观光业务数据库](#632-观光业务数据库)
    - [6.4 ODPT 实时数据对接 & 双库联动策略](#64-odpt-实时数据对接--双库联动策略)
    - [6.5 核心业务规则](#65-核心业务规则)
  - [7. API 接口文档](#7-api-接口文档)
    - [7.1 全局请求 / 响应统一格式](#71-全局请求--响应统一格式)
    - [7.2 全局错误码规范](#72-全局错误码规范)
    - [7.3 前台业务接口（读取本地线路库、景点、观光路线）](#73-前台业务接口读取本地线路库景点观光路线)
    - [7.4 ODPT 实时数据封装接口（实时运行/时刻表，与本地线路库匹配）](#74-odpt-实时数据封装接口实时运行时刻表与本地线路库匹配)
    - [7.5 后台管理接口](#75-后台管理接口)
    - [7.6 系统数据字典](#76-系统数据字典)
  - [8. 部署与运维](#8-部署与运维)
    - [8.1 服务器资源配置](#81-服务器资源配置)
    - [8.2 CI/CD 构建部署流程](#82-cicd-构建部署流程)
    - [8.3 环境变量配置清单](#83-环境变量配置清单)
    - [8.4 静态资源、SVG、CDN 部署规范](#84-静态资源svgcdn-部署规范)
    - [8.5 日志、监控规则](#85-日志监控规则)
    - [8.6 数据库备份策略（本地线路库重点备份）](#86-数据库备份策略本地线路库重点备份)
    - [8.7 降级容灾方案（ODPT 失效优先走本地库）](#87-降级容灾方案odpt-失效优先走本地库)
  - [9. 测试规范](#9-测试规范)
    - [9.1 核心测试场景](#91-核心测试场景)
    - [9.2 数据一致性测试（本地库 vs ODPT）](#92-数据一致性测试本地库-vs-odpt)
    - [9.3 兼容性、性能测试标准](#93-兼容性性能测试标准)
  - [10. 风险说明 & 常见 FAQ](#10-风险说明--常见-faq)
    - [10.1 项目已知风险点](#101-项目已知风险点)
    - [10.2 开发 / 部署 / 数据维护常见问题](#102-开发--部署--数据维护常见问题)
- [附录（原四份源文档全文）](#附录原四份源文档全文)
- [附录 A 开发规则（Hard Rules，原 AGENTS.md）](#附录-a-开发规则hard-rules原-agentsmd)
  - [线路层级规则（Line Hierarchy Rule，硬规则）](#线路层级规则line-hierarchy-rule硬规则)
  - [系统优先变更规则（System-First Change Rule，硬规则）](#系统优先变更规则system-first-change-rule硬规则)
    - [变更前](#变更前)
    - [任何结构性变更后](#任何结构性变更后)
    - [关键原则](#关键原则)
  - [规则 9 - 全系统消费方保全（Rule 9 - Whole-System Consumer Preservation，硬规则）](#规则-9---全系统消费方保全rule-9---whole-system-consumer-preservation硬规则)
    - [变更前问卷（动代码前必须回答全部）](#变更前问卷动代码前必须回答全部)
    - [迁移规则](#迁移规则)
    - [删除规则](#删除规则)
    - [禁止并行实现规则](#禁止并行实现规则)
    - [任务提示词规则](#任务提示词规则)
  - [新功能开发流程（Post RC-2）](#新功能开发流程post-rc-2)
  - [4.3.0 功能准入 / 系统影响评审（强制）](#430-功能准入--系统影响评审强制)
    - [准入问卷（动代码前必须回答全部）](#准入问卷动代码前必须回答全部)
    - [A 换 B 退化检查（关键）](#a-换-b-退化检查关键)
    - [决策树](#决策树)
    - [4.3.0 准入后流程](#430-准入后流程)
  - [能力归属检查（所有功能开发强制）](#能力归属检查所有功能开发强制)
    - [能力归属图（当前 RC-2 基线）](#能力归属图当前-rc-2-基线)
    - [逻辑挪用规则](#逻辑挪用规则)
    - [反模式：B 借用 A 的逻辑却不回馈](#反模式b-借用-a-的逻辑却不回馈)
  - [已知债务（不需要自动修复）](#已知债务不需要自动修复)
  - [架构基线（Architecture Baselines）](#架构基线architecture-baselines)
  - [数据不变规则・显示同一性・其他硬规则](#数据不变规则显示同一性其他硬规则)
  - [规范数据冻结规则（Canonical Data Freeze Rule）](#规范数据冻结规则canonical-data-freeze-rule)
  - [显示身份规则（Display Identity Rule）](#显示身份规则display-identity-rule)
  - [三层数据架构规则（Three-Layer Data Architecture Rule）](#三层数据架构规则three-layer-data-architecture-rule)
  - [无孤儿迁移规则（No Orphan-Generating Migration Rule）](#无孤儿迁移规则no-orphan-generating-migration-rule)
  - [只读优先规则（Read-Only First Rule）](#只读优先规则read-only-first-rule)
  - [模块主心规则（Module Main-Heart Rule）](#模块主心规则module-main-heart-rule)
  - [发布门规则（Release Gate Rule）](#发布门规则release-gate-rule)
  - [运行契约（Runtime Contract）](#运行契约runtime-contract)
- [附录 B 线路图设计规定（LINE-DIAGRAM-SPEC，原 LINE-DIAGRAM-SPEC.md）](#附录-b-线路图设计规定line-diagram-spec原-line-diagram-specmd)
  - [1. 字体体系](#1-字体体系)
    - [1.1 字体族（全局唯一）](#11-字体族全局唯一)
    - [1.2 字号刻度（两套体系）](#12-字号刻度两套体系)
    - [1.3 字重与颜色](#13-字重与颜色)
    - [1.4 站名自适应（clamp）](#14-站名自适应clamp)
  - [2. 几何尺寸体系（GEOM 设计令牌）](#2-几何尺寸体系geom-设计令牌)
    - [2.1 设计令牌表（trains-page.js 26-35）](#21-设计令牌表trains-pagejs-26-35)
    - [2.2 环线宽度（标准宽度，2026-09-10 定稿）](#22-环线宽度标准宽度2026-09-10-定稿)
    - [2.3 缩放系数](#23-缩放系数)
  - [3. 车站节点规格](#3-车站节点规格)
    - [3.1 圆点（统一渲染函数 _renderStationNode）](#31-圆点统一渲染函数-_renderstationnode)
    - [3.2 直通标记（列车直通箭头）](#32-直通标记列车直通箭头)
  - [4. 线路与线宽](#4-线路与线宽)
  - [5. 图标体系](#5-图标体系)
    - [5.1 换乘图标（trains 详情 chip）](#51-换乘图标trains-详情-chip)
    - [5.2 线路徽章（卡片）](#52-线路徽章卡片)
    - [5.3 车型图标](#53-车型图标)
  - [6. 布局规则](#6-布局规则)
    - [6.1 站间距 sp（按站数分档，487-490）](#61-站间距-sp按站数分档487-490)
    - [6.2 站名锚点与偏移（916-924）](#62-站名锚点与偏移916-924)
    - [6.3 环线布局](#63-环线布局)
    - [6.4 直通标签](#64-直通标签)
  - [7. 触控与间距（移动端）](#7-触控与间距移动端)
  - [8. 现状不统一项（待统一，v1.0 起草时发现）](#8-现状不统一项待统一v10-起草时发现)
  - [9. 修订记录](#9-修订记录)
- [附录 C 4.3.31 设计文档（Line-to-Line Service Relation Layer，原 4.3.31_design.md）](#附录-c-4331-设计文档line-to-line-service-relation-layer原-4331_designmd)
  - [1. 问题陈述](#1-问题陈述)
    - [1.1 三层架构的缺口](#11-三层架构的缺口)
    - [1.2 具体缺口](#12-具体缺口)
    - [1.3 核心矛盾](#13-核心矛盾)
  - [2. 关系类型定义](#2-关系类型定义)
  - [3. 数据模型：line-service-relations.js](#3-数据模型line-service-relationsjs)
  - [4. 全 156 线关系映射](#4-全-156-线关系映射)
    - [4.1 BRANCH_OF 关系（来自 branchOf 字段）](#41-branch_of-关系来自-branchof-字段)
    - [4.2 已验证的 THROUGH_SERVICE 关系](#42-已验证的-through_service-关系)
    - [4.3 跨运营者直通（数据缺口）](#43-跨运营者直通数据缺口)
    - [4.4 TYPE-C 详细分类](#44-type-c-详细分类)
    - [4.5 REGIONAL 重新分类](#45-regional-重新分类)
  - [5. 架构集成设计](#5-架构集成设计)
    - [5.1 新五层架构](#51-新五层架构)
    - [5.2 LinePresentationService 扩展](#52-linepresentationservice-扩展)
    - [5.3 DataState.renderList 影响](#53-datastaterenderlist-影响)
  - [6. 文件结构](#6-文件结构)
  - [7. 风险评估](#7-风险评估)
  - [8. 后续阶段计划](#8-后续阶段计划)
  - [9. 结论](#9-结论)
- [附录 D 基本信息（README，原 README.md）](#附录-d-基本信息readme原-readmemd)
  - [运行方式（必须通过本地服务器）](#运行方式必须通过本地服务器)
  - [页面入口](#页面入口)
  - [开发约定](#开发约定)

---

## 1. 文档总述

### 1.1 文档目的与阅读对象

- **文档目的**：本文件是像素铁道项目**唯一的开发技术文档（综合版）**，统一定义网站结构、前后端规范、开发规则、项目运行信息与变更记录。
- **来源**：由 AGENTS.md / LINE-DIAGRAM-SPEC.md / 4.3.31_design.md / README.md 四份文档合并而来。
- **阅读对象**：参与本项目的 AI agent 与开发者。文档中的硬规则对 AI agent 生效，优先级高于任何任务级指令。
- **文档维护约定**：
  - 新增/修改规则：直接修改对应章节，并在归档变更日志登记条目与日期。
  - 归档变更日志（`archive/DEVELOPMENT-CHANGELOG-*.md`）：条目格式为 `## 版本号（日期，主题）`，正文按「问题 → 修复 → 验证 → 遗留」组织。
  - 版本号冲突：项目开发存在并发会话，**版本号可能重复**（同一号码对应不同主题）。判断先后一律以「日期 + 标题」为准，不依赖版本号推断顺序。
  - 冻结数据：`data/core/railway_data.json` 等冻结数据修改必须符合附录 A Canonical Data Freeze Rule（需 Freeze 例外），改后重跑 `node data/core/gen-file-data.js`。
  - **规则沉淀（防污染）**：规则正文一律写入对应规则章节（附录 B 线路图设计规定、第 4 章通用规范、特殊规则部分）；变更记录只做登记（版本号 + 一句话主题 + 指向规则章节），归档于 `archive/DEVELOPMENT-CHANGELOG-*.md`，**禁止以笔录体（如"用户指示（主题・版本号）: "）书写规则正文**；历史笔录条目与规则章节冲突时，以规则章节为准。
- **语言约定**：本文档全部使用中文编写（2026-09-17 用户指示统一语言）；专有名词、代码 ID、线路/车站 ID、数据文件名、API 名称保留原文（如 ODPT、LOS、railway_data.json、JC_Chuo_Rapid 等）；日文/英文历史记录已全部译为中文，如需核对原文以 Git 历史为准。

### 1.2 版本修订记录

| 版本 | 日期 | 更新人 | 修订内容 |
|---|---|---|---|
| RC-3 | 2026-09-17 | 用户／开发会话 | 可读性优化：目录置顶（全文锚点）；四份源文档重编号为附录 A-D（新增附录总览）；正文交叉引用由「第 1/2 章」改为「附录 A/B」；附录 C（4.3.31 设计文档）全文中译；6.5 节重复内容清理；错别字修正（其其他→其他） |
| RC-2 | 2026-09-17 | 用户／开发会话 | 结构优化（章节重组、CRLF→LF、重复版本号标注〔并发会话〕）；语言统一为中文；新增第 3 章"系统架构设计"（含 3.10 页面结构规则，原第 0 章并入）；第 6 章按"系统模块划分 / 后台权限模型 / 数据库设计 / ODPT 实时数据对接 & 双库联动策略 / 核心业务规则"重组；第 7 章按 7.1-7.6 重排（全局格式 / 错误码 / 前台业务接口 / ODPT 封装 / 后台管理接口 / 数据字典）；新增第 8-10 章（部署与运维 / 测试规范 / 风险说明 & FAQ）；取消"用户指示"笔录形态，变更日志统一为标准条目 |
| v1.0 | 2026-09-11 | 用户／开发会话 | 四份文档合并为综合版（AGENTS.md / LINE-DIAGRAM-SPEC.md / 4.3.31_design.md / README.md） |

> 文档状态：维护中 ｜ 统合日：2026-09-17 ｜ 最近修订：RC-3（2026-09-17 可读性优化）

### 1.3 术语与缩写

| 术语/缩写 | 说明 |
|---|---|
| ODPT | Open Data for Public Transportation（公共交通开放数据）——实时位置/时刻表/运行情报数据源 |
| LOS | Line Operation Systems——线路运行系统（data/core/line-operation-systems.js） |
| Freeze | 数据冻结——railway_data.json 等冻结数据，修改需 Freeze 例外 |
| RC | Release Candidate——候选发布版本 |
| manual 时刻表 | ODPT 无数据的线路由人工整理的时刻表（data/timetables/*-manual.js） |
| i18n | 国际化（本项目 4 语言：ja/zh/ko/en） |
| db-loader | 构建期数据加载器（data/core/db-loader.js） |
| CSP | 内容安全策略（页面 script-src 'self' 等约束） |
| GEOM | 线路图几何设计令牌（附录 B 2.1 节） |
| BFS | 广度优先搜索——路径搜索实现（js/route-search.js） |

### 1.4 参考资料

- **ODPT API**：https://api-challenge.odpt.org / https://api.odpt.org（实时/时刻表数据，浏览器 connect-src 白名单）
- **项目内**：`scripts/serve.py`（本地服务器）、`data/core/*`（构建期数据）、附录 B 线路图设计规定（原 LINE-DIAGRAM-SPEC.md）
- **外部核验**：JR 東日本 / 東武 / 小田急 / 京成 等官方页面、ja.wikipedia、鉄道ファン 等（车型与运行系统核验，引用见归档变更日志）

## 2. 项目概述

### 2.1 业务背景

- **项目定位**：像素铁道（Pixel-Tetsudo）是面向东京首都圈的铁道信息可视化网站，以像素美术风格呈现线路图、列车实时/推定位置与运行情报。覆盖 JR 东日本、東京メトロ、都営、私铁、单轨、新交通等 160+ 线路。
- **数据现实**：多数线路的实时位置/时刻表/运行情报来自 ODPT；但部分线路（地方线、部分私铁等）ODPT 无数据——项目以人工整理时刻表（`data/timetables/*-manual.js`）补全，保证线路全覆盖。
- **工程形态**：纯前端静态站点 + 轻量本地服务端（`serve.py`），无传统业务后端；4 语言（ja/zh/ko/en）；离线优先（构建期数据 + 运行时缓存）。

### 2.2 用户角色

| 角色 | 说明 |
|---|---|
| 普通用户（乘客／观光客） | 查询路线与票价、查看线路图与列车实时位置、浏览运行情报、获取观光推荐与详情；无需登录 |
| 开发者／AI agent | 维护数据与功能；必须遵守本文档全部规范（硬规则优先级高于任务级指令） |

### 2.3 功能清单

| # | 功能 | 说明 | 入口／模块 |
|---|---|---|---|
| 1 | 路线搜索 | 起终点路径搜索（BFS）+ 各段时刻推算 + 票价估算 | home.html / route-search.js / route-timetable.js / fare-estimator.js |
| 2 | 线路图 | 全线路像素风线路图（站名、换乘、支线、六形环布局） | trains.html / trains-page.js |
| 3 | 列车实时位置 | ODPT 实时位置优先，无实时线路按时刻表+延误推定补缺 | trains.html / data-fusion.js / train-position-estimator.js |
| 4 | 运行情报 | 各线运行状态（正常/延误/中断/通知）与线路详情弹窗（显示 ODPT 原文全文） | realtime.html / realtime-view.js / delay-translator.js |
| 5 | 观光推荐与详情 | 按位置推荐景点；景点/活动/店铺三类详情页（信息、地图、距离） | home.html / sightseeing.js / tourism-*.js / tourism-proximity.js |
| 6 | 搜索历史 | 本地保存最近搜索记录 | history.html / history.js |
| 7 | 多语言 | ja/zh/ko/en 四语言切换 | translations.js / lang-init.js |

### 2.4 核心业务流程

**流程 A：查路线**
1. 打开 `pages/home.html`（唯一业务入口），输入出发站与到达站
2. `route-search.js` 以 BFS 计算路径（基线数据经 `db-loader.js` 加载，ODPT 数据惰性按需获取）
3. `route-timetable.js` 推算各段发到时刻 → `fare-estimator.js` 估算票价
4. `search-ui.js` 渲染结果；点击线路可跳转 `trains.html` 查看该线实时位置

**流程 B：看实时与运行情报**
1. 打开 `realtime.html`：`odpt-unified.js` 拉取各线状态 → `data-fusion.js` 融合 → 状态卡列表
2. 点击线路卡弹出详情（`realtime-view.js` + `delay-translator.js` 翻译，运行情报显示 ODPT 原文全文）
3. 打开 `trains.html`：线路图 + 列车位置（实时优先；无实时线路由 `train-position-estimator.js` 按时刻表推定补缺）

**流程 C：观光**
1. 首页观光模块按当前位置推荐（`sightseeing.js` + `tourism-proximity.js`）
2. 点击景点/活动/店铺进入详情页（`tourism-core.js` 底座 + 各类型控制器，含地图）
3. 搜索与浏览记录写入本地历史（`history.js`）

## 3. 系统架构设计

### 3.1 整体架构

本项目 = **纯前端静态站点 + 轻量本地服务端**，无传统业务后端。

- **前端**：多页面静态站（7 页），4 语言（ja/zh/ko/en），离线优先（构建期数据 + 运行时缓存）
- **服务端**：`scripts/serve.py`（本地静态服务 + 白名单 API 代理），是唯一允许的本地服务器
- **入口**：`pages/home.html` 唯一业务入口，共 7 个页面（见 3.6）
- **数据三通道**：构建期生成 / 浏览器直连 ODPT / 本地白名单代理（详见 3.8）
- **前端分层**：数据层 ← 业务层 ← 展示层，i18n 横切（详见 3.7）

### 3.2 技术栈

| 类别 | 选型 | 说明 |
|---|---|---|
| 前端 | 原生 HTML/CSS/JavaScript | 无框架；资源引用带 `?v=4.3.xxx` 版本化缓存 |
| 地图 | Leaflet + MapLibre GL | tourism 三页地图渲染（js/leaflet/ + js/maplibre/） |
| 数据 | JSON + JS 数据文件 | data/core/*（构建期）、data/timetables/*-manual.js（人工时刻表） |
| 服务端 | Python `scripts/serve.py` | 标准库实现：静态托管 + 白名单代理 + Host 校验 |
| 构建 | Node.js `node data/core/gen-file-data.js` | 生成 `*.file.js` 构建期数据 |
| 版本控制 | Git | 项目根目录 .git |
| 多语言 | 自研 i18n（translations.js / lang-init.js） | ja/zh/ko/en |

### 3.3 环境划分

本项目为本地个人项目，无传统开发/测试/预发/生产多环境：

| 环境 | 说明 |
|---|---|
| 本地运行 | `python serve.py` → http://127.0.0.1:8017（唯一运行方式，自 4.3.405 起替代 `python -m http.server 8017`） |
| 构建期 | `node data/core/gen-file-data.js`（数据文件变更后重跑，见附录 A Freeze 规则） |
| 数据源 | ODPT 挑战版 api-challenge.odpt.org（开发）与正式版 api.odpt.org（运行）；API key 经环境变量注入，不硬编码 |
| 限制 | 小田急端点因 key 泄露已 403 封锁，需 `.work/serve.env` 提供 ODAKYU_API_KEY 恢复 |

### 3.4 外部依赖

| 依赖 | 用途 | 说明 |
|---|---|---|
| ODPT API | 实时位置/时刻表/运行情报 | api-challenge.odpt.org / api.odpt.org；浏览器 connect-src 白名单 |
| 官方线路页面 | 车型/运行系统核验 | JR 東日本 / 東武 / 小田急 / 京成 等，人工核验后写入数据 |
| Leaflet + MapLibre GL | 观光详情页地图 | 本地 vendored（js/leaflet/ js/maplibre/），不引 CDN |
| 环境变量 | 代理密钥 | ODAKYU_API_KEY（serve.env 读取，不落代码） |

> 本章为项目基础规范，适用于全部后续规则。任何变更（含细则）不得破坏本章定义的结构与边界。

### 3.5 目录结构

| 路径 | 职责 | 规范 |
|---|---|---|
| `pages/` | 页面（7 个，见 3.6） | 每页职责单一；只允许引用 `../css` `../js` `../data` `../images` `../fonts` |
| `css/` | 样式 | 全局 `style.css`；页面专属样式独立文件；禁止页面内联 style（CSP `style-src 'self'`） |
| `js/` | 前端模块 | 按数据/业务/展示三层组织（见 3.7）；模块职责单一，禁止跨层依赖 |
| `data/core/` | 构建期生成数据 + 加载器（`db-loader.js`、`*.file.js`、源 JSON） | **生成文件禁止手工编辑**；冻结数据修改必须走 Freeze 例外，改后重跑生成脚本 |
| `data/api/` | ODPT 客户端（`odpt-unified.js`）与链接（`odpt-links.js`） | ODPT 访问唯一入口；首页经 `odpt-lazy.js` 惰性加载 |
| `data/timetables/` | 手动时刻表（`*-manual.js`）+ `vehicle-type-map.js` | 命名 `<RailwayId>-manual.js`；仅 ODPT 无数据的线路允许手工整理 |
| `fonts/` | 像素字体（ja/ko/zh-hans/zh-hant/latin） | 唯一字体源，禁止使用系统字体替代 |
| `images/` | 素材（列车/料理/観光地/鉄道） | 按子目录归类；命名规范（型番系/形 + 用途括弧） |
| `scripts/` | 服务端 + 数据生成脚本 | `serve.py` 为唯一服务器；生成脚本产出必须落 `data/core` 或 `data/timetables` |
| `archive/` | 已废弃脚本存档 | 只读存档，禁止再被页面引用 |
| `recovery/` | 数据修复现场 | 修复完成后归档或清理，不留常驻产物 |
| `work/` `.work/` | 本地工作区（工具脚本、`serve.env`） | 仅本地使用，禁止被页面引用；敏感文件必须 `.gitignore` |
| `node_modules/` | 工具依赖 | 禁止在其中放置项目文件或临时文件（`.tmp_*` 等应立即清理） |

### 3.6 页面结构

| 页面 | 职责 | 说明 |
|---|---|---|
| `pages/home.html` | 搜索首页（路线/车站搜索 + 观光推荐） | 唯一业务入口 |
| `pages/trains.html` | 线路图 + 列车实时/推定位置 | |
| `pages/realtime.html` | 运行情报一览 | |
| `pages/tourism-spot.html` | 景点详情 | 三类型旅游详情共用 `tourism-core.js` 底座 |
| `pages/tourism-event.html` | 活动详情 | 同上 |
| `pages/tourism-shop.html` | 店铺详情 | 同上 |
| `pages/history.html` | 搜索历史 | |

### 3.7 前端分层

四层结构（三层业务 + i18n 横切）：

1. **数据层**（`data/` + `js/data-*`）：`db-loader.js`（构建期数据加载）、`odpt-unified.js`（ODPT 客户端）、`data-fusion.js`（实时+推定融合）、`data-state.js`（状态+线路卡片）、`data-layer.js`（统一数据层）、`train-position-estimator.js`（时刻表推定）、`station-resolver.js`、`running-chain-resolver.js`、`delay-translator.js`、`local-railway-data.js`
2. **业务层**（`js/*`）：`line-presentation-service.js`（显示排序）、`route-search.js`（路径搜索）、`fare-estimator.js`（票价估算）、`train-icons.js`（车型图标）、`route-timetable.js`（搜索时刻推算）、`tourism-proximity.js`、`sightseeing.js`
3. **展示层**（页面专属）：`trains-page.js`、`realtime-view.js`、`search-ui.js`、`history.js`、`tourism-core/spot/event/shop.js`
4. **i18n 横切**：`translations.js`、`lang-init.js`、`common.js`、`i18n-common.js`（合并包）

规则：
- **依赖方向**：数据层 ← 业务层 ← 展示层，禁止反向；展示层不得绕过业务层直接读写数据层
- **ODPT 唯一入口**：所有 ODPT 请求必须经 `odpt-unified.js`；首页首屏走惰性模式（`odpt-lazy.js`）
- **缓存版本化**：资源引用一律带 `?v=4.3.xxx` 版本参数，模块变更必须 bump（防浏览器缓存命中旧版）
- **CSP 约束**：`script-src 'self'`；`connect-src` 仅 `self` + ODPT 白名单（`api-challenge.odpt.org` / `api.odpt.org`），新外部连接必须先登记

### 3.8 数据通道

三通道获取数据，融合后供展示：

1. **构建期生成**：`scripts/*` 生成脚本 → `data/core/*.file.js` → `db-loader.js` 加载（基线数据：线路/车站/i18n/旅游）
2. **运行时官方数据**：浏览器直连 ODPT（CSP `connect-src` 白名单）→ `odpt-unified.js`（实时位置/时刻表/运行情报）
3. **无 CORS 官方 API**：浏览器 → `/api-proxy/` → `serve.py` → 官方 API（白名单代理）

数据流：`db-loader`（基线）→ `odpt-unified`（实时/时刻表）→ `data-fusion`（实时优先、推定补缺）→ 业务层 → 展示层。

### 3.9 后端（服务端）规范

`scripts/serve.py` 仅承担两项职责：
1. **静态文件服务**（`127.0.0.1:8017`，等价替代 `python -m http.server 8017`）
2. **`/api-proxy/` 白名单代理**（官方 API 无 CORS 头、浏览器不能直连时经本地转发）

规则：
- **新代理端点必须登记 `PROXY_TARGETS` 白名单**（固定目标，防 SSRF）；禁止代理任意 URL
- **API key 不硬编码**：环境变量或 `.work/serve.env`（已被 `.gitignore` 排除）；key 一旦泄露必须轮换并封锁对应端点（先例：小田急 key 泄露 → 端点 403 封锁，前端显示"暂无延误情报"）
- **安全加固不得回退**：Host 头校验（防 DNS rebinding）、敏感路径拦截（`/.work/` `/.git/` `/scripts/` 等）、关闭目录列表（防结构泄露）、错误响应不回显内部细节
- **服务端不引入业务逻辑**：本项目无传统后端，所有业务在浏览器端完成

### 3.10 页面结构规则

#### 3.10.1 通用页面骨架（7 页统一）

所有页面必须遵循以下骨架（结构与顺序不得随意改变）：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="…（3.7 CSP 白名单）…">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="theme-color" content="#008803"> <meta name="mobile-web-app-capable" content="yes">
  <meta name="description" content="Pixel Tetsudo - …"> <meta name="referrer" content="strict-origin-when-cross-origin">
  <title>Pixel Tetsudo</title>
  <link rel="icon" href="../images/pixel-tetsudo.ico" type="image/x-icon">
  <link rel="stylesheet" href="../css/style.css?v=…">   <!-- 全局（必须） -->
  <link rel="stylesheet" href="../css/lang-bar.css?v=…"> <!-- 语言栏（必须） -->
  <link rel="stylesheet" href="../css/<页面专属>.css?v=…"> <!-- 按页面 -->
</head>
<body>
  <div id="app">
    <header class="pixel-header">
      <div class="header-container">
        <div class="header-text">…</div>          <!-- 站点标题 -->
        <div class="lang-switcher-wrapper">
          <div id="langSwitcher" class="lang-switcher">…</div> <!-- 语言切换 -->
        </div>
      </div>
      <nav class="pixel-tabs">…</nav>             <!-- 4 个 tab：search/status/trains/history -->
    </header>
    <section id="tab-<页面>" class="tab-content active">…页面主体…</section>
    <footer class="pixel-footer" data-i18n="app.footer">© 2026 Pixel Tetsudo</footer>
  </div>
  <script src="…基础链…"></script>               <!-- 见 3.10.3 -->
</body>
</html>
```

规则：
- `<html lang="ja">` 固定不变——页面语言由 `lang-init.js` 运行时切换，DOM 不随语言重写
- **所有交互/数据容器必须有稳定 `id`**（供 JS 定位），视觉样式统一 `pixel-*` 类（pixel-header / pixel-card / pixel-footer / pixel-tabs）
- **禁止内联 script 与 style**（CSP `script-src 'self'` / `style-src 'self'`）
- 页面内禁止硬编码多语言文案：静态文案用 `data-i18n`，动态文案由模块渲染时经 `translations.js` 取词
- 资源引用一律相对路径 `../` 且带 `?v=4.3.xxx`

#### 3.10.2 各页面结构清单

| 页面 | 主体容器（必须存在的 id/class） | 专属 CSS | 专属模块（js） |
|---|---|---|---|
| `home.html` 搜索首页 | `#tab-search.active` → `#searchContainer.search-card`（搜索卡：search-inputs 双 input-group + `#searchResults`）+ `#smModule.sm-module`（观光推荐：sm-location-bar → `#smTagFilters` → `#smGrid` + `#smEmpty`） | tourism-styles.css | search-ui / route-search / route-timetable / fare-estimator / sightseeing / tourism-proximity / history |
| `trains.html` 线路图+实时 | `#tab-trains.active` → `#trainsFilterBar.rs-filter-bar` + `#trainsLineListContent.pixel-card`（线路列表）+ `#trainsDetailView.trains-detail.hidden`（详情：`#trainsDetailTitle` + `#trainsMapContainer.tp-line-map`） | trains.css | trains-page / data-state / train-icons / train-position-estimator / local-railway-data |
| `realtime.html` 运行情报 | `#tab-status.active` → `#realtimeFilterBar.rs-filter-bar` + `#realtimeStatusContainer.pixel-card`（状态卡列表）+ `#lineDetailModal.rs-modal`（线路详情弹窗） | realtime.css | realtime-view / data-state / delay-translator / line-presentation-service / running-chain-resolver |
| `tourism-spot.html` 景点详情 | `section.tab-content.active` → `.tourism-detail-page` → `#articleContainer`（内容由模块渲染） | tourism-styles + tourism-spot.css + leaflet/maplibre | tourism-core / tourism-spot / sightseeing / tourism-proximity / leaflet + maplibre（地图三件套） |
| `tourism-event.html` 活动详情 | 同上（`#articleContainer`） | tourism-styles + tourism-event.css + leaflet/maplibre | tourism-core / tourism-event / sightseeing / tourism-proximity / 地图三件套 |
| `tourism-shop.html` 店铺详情 | 同上（`#articleContainer`） | tourism-styles + tourism-shop.css + leaflet/maplibre | tourism-core / tourism-shop / sightseeing / tourism-proximity / 地图三件套 |
| `history.html` 搜索历史 | `#tab-history.active` → `#historyContainer.pixel-card` → `#historyEmpty` + `#historyList` | tourism-styles.css | history |

#### 3.10.3 资源引用规范（脚本链顺序）

每个页面底部脚本按以下顺序加载（分层，禁止跳层）：

1. **基础**：`db-loader.js` → `translations.js` → `common.js` → `lang-init.js`（详情页可不引 common）
2. **数据层**：`odpt-links.js` → `odpt-lazy.js`（仅 home 惰性）→ `odpt-unified.js` → `runtime-config.js` → `data-layer.js` / `data-state.js` / `data-fusion.js` / `station-resolver.js` / `train-position-estimator.js` / `running-chain-resolver.js` 等
3. **业务层**：`line-presentation-service.js` / `route-search.js` / `fare-estimator.js` / `train-icons.js` / `route-timetable.js` / `sightseeing.js` / `tourism-proximity.js` 等
4. **展示层**：页面控制器（`search-ui.js` / `trains-page.js` / `realtime-view.js` / `tourism-*.js` / `history.js`）最后加载

数据文件（`data/core/*.file.js`、`data/timetables/*-manual.js`、`vehicle-type-map.js`）按页面所需注入，位置遵循其所属层。

**变更规则**：
- 新增页面必须遵循 3.10.1 骨架；属于站内主功能的一律登记进 `nav.pixel-tabs`（详情页例外）
- 新增/删除容器 id：必须同步更新引用模块；变更后 bump 相关资源 `?v=`（一个版本号覆盖该页面全部资源）
- 新增脚本：按 3.10.3 顺序插入，禁止插在页面控制器之后
- 页面级改动（容器结构/资源清单）必须在本节同步登记

## 4. 全局统一格式与开发规范

> 本章为通用规范，适用于全部代码、数据与文档；与附录 A 开发规则同属"通用规则"主体。特殊线路/模块的专门规则另见文档后部"特殊规则"部分。

### 4.1 目录文件命名规范

- **目录**：全部小写（`data` `css` `js` `pages` `scripts` `fonts` `images` `archive` `recovery` `work` `.work`）
- **页面**：`pages/*.html` 小写 kebab-case（`home.html` `trains.html` `realtime.html` `tourism-spot.html` `history.html`）
- **JS 模块**：`js/*.js` 小写 kebab-case（`data-fusion.js` `route-search.js` `tourism-core.js`）
- **CSS**：全局 `style.css` + `lang-bar.css`；页面专属按页命名（`trains.css` `realtime.css` `tourism-*.css`）
- **数据**：源 JSON 小写下划线（`railway_data.json` `station_i18n.json` `tourism_data.json`）；构建产物 `*.file.js`；manual 时刻表 `<RailwayId>-manual.js`（`vehicle-type-map.js` 同目录）
- **图片**：`images/` 按子目录归类（列车/料理/観光地/鉄道），文件名规范（型番系/形 + 用途括弧），全库唯一
- **禁止**：文件名含中文/空格/大写（历史遗留例外须登记）；`archive/` 只读，`recovery/` 用后即清

### 4.2 代码命名、注释统一规范

- **模块结构**：IIFE + `"use strict"`；模块职责单一，文件头块注释声明职责与依赖
- **命名**：全局导出 `window.*` 驼峰（`RailwayDB` `ODPTClient` `STATION_COORDS`）；函数/变量驼峰（`resolveStationName` `getTrainPositions`）；常量 UPPER_SNAKE（`STORAGE_KEY` `MAX_HISTORY` `PROXY_TARGETS`）
- **注释**：复杂逻辑必须行内注释说明意图；数据修正/特殊分支标注版本号与依据（先例：变更记录条目均带版本号）
- **版本化**：修改模块必须 bump 资源 `?v=4.3.xxx`（一个版本号覆盖该页面全部资源）；防浏览器缓存命中旧版
- **生成文件**：`*.file.js` 等构建产物禁止手工编辑，改源数据后重跑生成脚本
- **代码校验**：JS 改动提交前 `node --check` 通过

### 4.3 页面、路由命名规范

- **页面文件**：kebab-case（见 4.1）；主功能页（home/trains/realtime/history）在 `nav.pixel-tabs` 登记；详情页（tourism-*）无 tab
- **容器 id**：驼峰、语义明确（`searchContainer` `trainsDetailView` `realtimeStatusContainer` `lineDetailModal` `historyContainer`）
- **样式类**：基础组件统一 `pixel-*` 前缀（pixel-header/pixel-card/pixel-footer/pixel-tabs）；功能类按模块（`rs-filter-bar` `tp-line-map` `sm-module`）
- **路由**：`pages/home.html` 唯一入口；页面间跳转经链接/URL，不伪造路由状态

### 4.4 多语言文案格式规范

- **词表**：文案统一入 `translations.js`，key 按模块分层（`app.*` `trains.*` `op.*` 等）；禁在页面/模块内硬编码显示文案
- **引用**：静态文案 `data-i18n`；动态文案 `window.t(key)` 取词，缺词回退默认语言（ja）
- **覆盖**：新增/修改文案必须 4 语言齐全（ja/zh/ko/en）；站名等数据类多语言入 `station_i18n.json` / `name_map`，不散写
- **原文保留**：ODPT 原文（运行情报 `text`、站名）不翻译——realtime 弹窗直接显示原文全文；专名/ID 保留原文
- **语言切换**：`lang-init.js` 统一处理（`i18n_lang` 存储 + `onLanguageChange` 监听），模块不自行管理语言状态
- **方向词**：ODPT 方向词（Inbound/Outbound/Northbound/Southbound/Eastbound/Westbound 等）统一本地化映射，不裸露英文原文；方向标签形态见 5.4 列车标签（4.3.470/473）

### 4.5 铁道数据录入统一规范（线路 / 车站 / 颜色 / 排序）

- **线路**：线路 ID（RailwayId）以 ODPT 为准；新增线路须同步登记 `UNIFIED_LINES`、`LINE_TO_OPERATOR`、`LINE_RAILWAY_CODE`；ODPT 无数据线路才允许手工时刻表（`<RailwayId>-manual.js`）
- **车站**：站 ID + 坐标（lat/lng 真实核验）；站序、换乘（同名合并/异名映射）、站台/检票口/出口均结构化登记，不散写
- **颜色**：线路色以官方口径为准（ODPT/官网）；色块徽章文字用线名（4.3.614 起），不另行造色
- **排序**：线路显示排序经 `line-presentation-service.js`；观光排序按距离/规则，不硬编码散排
- **权威与核验**：订正以 ODPT 为权威源；车型"不编造、核验有据才升、不确定保持候选"；改后跑校验脚本（verify_through_vtype.js 等）+ `node --check`
- **冻结**：`railway_data.json` 等冻结数据修改走附录 A Freeze 例外，改后重跑 `gen-file-data.js`

### 4.6 UI 视觉统一规范（字体、间距、配色、SVG 绘制规则）

- **字体**：`fonts/` 像素字体为唯一来源（ja/ko/zh-hans/zh-hant/latin），禁止系统字体替代
- **配色**：站点主色 `#008803`（theme-color）；线路色官方口径；组件统一 `pixel-*` 类，不逐页散改
- **布局**：统一 header（pixel-header）/tabs/页脚骨架（见 3.10.1）；卡片统一 pixel-card 间距
- **SVG 线路图**：绘制规则（直线/环线/异常环/支线画法、尺寸、触控）见 5.4 铁道 SVG 地图渲染标准，细则以附录 B 为准
- **双档验收**：桌面 + 移动（约 410px 容器）双档实测，无溢出、无文字穿线、无 JS error

### 4.7 接口命名、参数格式统一规范

- **模块接口**：全局导出 `window.*` 驼峰；方法名"动词 + 对象"驼峰（`getTrainPositions` `resolveStationName`）
- **ODPT 封装**：统一经 `ODPTClient`，参数为运营者代码（operator）；不绕过封装直连 ODPT
- **数据访问**：统一经 `RailwayDB`（站名解析等），不跨层直读原始全局表（见 3.7 依赖方向）
- **坐标参数**：统一 `[lat, lng]`（`tourism_data.json` coord / `STATION_COORDS` 一致口径）
- **版本化**：接口变更必须 bump `?v=` 并在对应章节登记

## 5. 前端设计

### 5.1 项目目录结构

完整目录职责表见 3.5。核心结构：

```
像素铁道/
├── pages/                  # 7 个页面（见 5.2 全站路由清单）
├── css/                    # style.css 全局 + lang-bar + 页面专属
├── js/                     # 前端模块（数据/业务/展示三层，见 3.7）
├── data/
│   ├── core/               # 构建期数据 + db-loader.js
│   ├── api/                # odpt-unified.js / odpt-links.js
│   └── timetables/         # *-manual.js 人工时刻表
├── fonts/  images/         # 像素字体 / 素材
├── scripts/                # serve.py + 数据生成脚本
└── archive/  recovery/  work/  .work/   # 存档 / 修复 / 本地工作区
```

### 5.2 全站路由清单

| 路由（文件） | 页面 | tab | 说明 |
|---|---|---|---|
| `pages/home.html` | 搜索首页 | search | 唯一业务入口：路线/车站搜索 + 观光推荐 |
| `pages/trains.html` | 线路图+实时 | trains | 全线路像素风线路图 + 列车实时/推定位置 |
| `pages/realtime.html` | 运行情报 | status | 各线运行状态一览 + 线路详情弹窗 |
| `pages/tourism-spot.html` | 景点详情 | （详情页） | 共用 `tourism-core.js` 底座 |
| `pages/tourism-event.html` | 活动详情 | （详情页） | 同上 |
| `pages/tourism-shop.html` | 店铺详情 | （详情页） | 同上 |
| `pages/history.html` | 搜索历史 | history | 本地历史展示/清空/单条删除 |

页面间跳转：搜索结果显示线路 → `trains.html`；首页观光推荐 → 对应 tourism 详情页；主功能页均在 `nav.pixel-tabs` 登记（详情页例外）。

返回行为：线路图详情返回按钮一律回到线路一览——`location.hash=""` 清 hash 触发 hashchange 兜底显示列表，不依赖 history.back；trains 页唯一返回入口 `trainsBackBtn`（4.3.556）。

### 5.3 多语言实现方案

- **语言集**：ja（默认）/ zh / ko / en，共 4 种；`html lang="ja"` 固定不变，运行时由 `lang-init.js` 切换 `window.currentLang`
- **存储**：语言偏好写入 `localStorage["i18n_lang"]`
- **词表**：`translations.js`（键值词表）；静态文案 `data-i18n`，动态文案由模块渲染时 `window.t(key)` 取词
- **模块**：`translations.js`（词表）+ `lang-init.js`（切换/存储/监听 `onLanguageChange`）+ `common.js` + `i18n-common.js`（合并包）
- **动态数据**：运营公司名经 `tOp()` 动态翻译；ODPT 原文（站名/运行情报）不翻译——realtime 弹窗直接显示 ODPT `text` 原文全文，区间/原因解析仅作概览兜底（用户明确要求）
- **外部服务**：MapTiler 瓦片按 `language=langMap[currentLang]` 取对应语言地名

### 5.4 铁道 SVG 地图渲染标准

线路图以 **SVG** 自绘（`trains-page.js` 渲染，非图片/Canvas），像素风样式；几何参数统一来自附录 B GEOM 设计令牌，任何改动须同步附录 B。通用绘制规则如下（细则与异常分支以附录 B 为准）：

**直线画法**
- 站间距按站数分档（移动/桌面）：≤20 站 72/62px；21–30 站 66/58px；31–50 站 60/54px；>50 站 56/50px
- 顶部/底部留白 topP=18 / botP=16（有直通标签 +26）
- 站名与圆点同行、垂直居中（`dominant-baseline: central`），按 side 定锚点（附录 B 6.2）

**环线画法**
- 双列画法（右列田端→東京→品川、左列駒込→大崎），站名空间 75×scale/侧
- 环宽 `rectW = 48`（4.3.495/496）

**异常环（六形环，大江户线）画法**
- 环段左右双列（14/14），junction（都庁前）在环左缘左列第 7 位
- 站序流：都庁前→左列下（春日）→环底→右列下（本郷三丁目）→右列上（赤羽橋）→环顶→左列上→闭合
- 站名侧、动态避让、clamp 缩字、移动端白描边遮线规则见附录 B 6.3

**支线延伸画法**
- 直线线型支线 ≥2 条：全部同侧（左）直排——junction 行水平直 stub + 垂直列（不拐弯）；单支线右侧弯折
- 支线 junction 站（接续站，支持首/末位）主干站名早右；junction 定位统一 `_branchJunctionStation`
- 横排站距 = 名宽 + sp；右侧 stub 叉出段 ≥ 站间距；竖线只画到最后一站（附录 B 6.2）

**列车标签**
- 单标签：图标上/下方显示 "▼/▲方向端点站名"（箭头 + 方向端点站名），不单独显示上下行方向词与终点标签（4.3.471）
- 方向映射：抽象方向词 Inbound/Outbound 与方位词 Northbound/Southbound/Eastbound/Westbound 统一映射 ▲/▼ 方向标签，不裸露英文原文（4.3.470/473）

**画布尺寸**
- 移动端内容宽度统一 `MOBILE_CONTENT_W = 297`（全线路含直线型，4.3.605 起）；桌面端直线型 820；环线环宽 `rectW = 48`

**移动端触控**
- 触控目标 ≥44×44px、列表项 ≥48px（附录 B 7）

**变更验收**
- `node --check` + 几何仿真/本地 DOM 实测（桌面/移动两档），禁止仅凭数值推断交付

### 5.5 全局公共组件设计

| 组件 | 结构/类 | 说明 |
|---|---|---|
| 站点头 | `header.pixel-header > .header-container` | 标题 + 语言切换 |
| 语言切换 | `#langSwitcher.lang-switcher` + `.lang-options` | 4 语言下拉 |
| 导航 | `nav.pixel-tabs` | search/status/trains/history 四 tab |
| 搜索卡 | `#searchContainer.search-card` | 起终点输入 + 结果列表 |
| 观光推荐 | `#smModule.sm-module` | 位置栏 + 标签筛选 + 卡片网格 |
| 过滤条 | `.rs-filter-bar` | realtime/trains 共用样式 |
| 状态卡/线路卡 | `.pixel-card` | realtime 状态卡、trains 线路列表 |
| 详情视图 | `.trains-detail`（`#trainsDetailView`） | 线路图详情（含 `#trainsMapContainer`） |
| 详情弹窗 | `#lineDetailModal.rs-modal` | realtime 线路详情（ODPT 原文全文） |
| 地图 | `.tourism-detail-page > #articleContainer` | tourism 三页共用详情容器，含 Leaflet/MapLibre |
| 页脚 | `footer.pixel-footer` | `data-i18n="app.footer"` |
| 换乘徽章 | 线路图/换乘结果渲染 | 图标单一权威 = LOS ResolveIcon；同 icon 系统去重合并；无图线降级色块徽章（LOS 官方色 + 当前语言线名，截 4 字）；JR 东换乘排前（4.3.613/614） |
| 观光推荐卡 | `.sm-module` 卡片网格 | 定位失败显示空态（"位置情報が取得できません"），不提供备选站、无手动选站（结构已删）；排序有图优先、无图卡 56px 类别文字卡；标签多选 OR、按数据量排序、零数据标签不展示（4.3.564/570/575） |
| 换乘结果 | `search-ui.js` 渲染 | 乘车段两行结构（路线徽章 + 方向徽章 / 乘车区间）；方向恒取段终点站名；换乘动作文案零歧义（"在此换乘" / "换乘不需要"）（4.3.586/588） |

JS 模块清单（数据/业务/展示三层）见 3.7。

### 5.6 响应式适配规范

- **视口**：`maximum-scale=1.0, user-scalable=no, viewport-fit=cover`——禁止用户缩放，布局按视口宽度自适应
- **双档布局**：桌面/移动两档，几何参数可分支（先例：线路图 `_tailCap`、svgW 缩放、clamp 缩字）
- **硬约束**：线路图移动端容器 1:1 固定比例，放不下时走缩放/描边兜底（先例：六形环移动端三区分离不可行时站名加白描边遮线）
- **验收**：改动须在桌面 + 移动（约 410px 容器）双档实测，无 JS error、无溢出、无文字穿线

### 5.7 静态资源管理规范

- **版本化缓存**：资源引用一律带 `?v=4.3.xxx`；模块变更必须 bump（防浏览器命中旧版）
- **CSS**：全局 `style.css` + `lang-bar.css` + 页面专属（trains/realtime/tourism-*）；禁内联 style（CSP）
- **本地 vendored**：Leaflet / MapLibre GL 均本地存放（`js/leaflet/` `js/maplibre/`），不引 CDN
- **数据文件**：`data/core/*.file.js` 为生成产物，禁手工编辑；`*.manual.js` 按 `<RailwayId>-manual.js` 命名
- **字体/图片**：`fonts/`（像素字体）与 `images/`（按子目录归类）为唯一素材源
- **CSP**：`script-src 'self'`、`style-src 'self'`、`connect-src` 仅 self + ODPT/MapTiler 白名单；新外部资源必须先登记

### 5.8 本地存储方案

- **现状（搜索历史）**：`history.js` 写入 `localStorage["pixel_tetsudo_search_history"]`，上限 **50 条**（超限裁剪最旧）；条目含 id/timestamp/起终点（名称+ID）/耗时/路径/线路信息；支持单条删除与清空
- **语言偏好**：`localStorage["i18n_lang"]`（见 4.3）
- **收藏（预留约定）**：当前版本暂无收藏功能；如引入，沿用同一套机制——key 统一 `pixel_tetsudo_*` 前缀、JSON 数组、写入 try/catch 容错（localStorage 满/禁用时降级为内存态并 console.warn）、上限裁剪；收藏对象复用线路/车站/观光条目的规范 ID，不存渲染态 DOM

## 6. 后端设计

> 本项目无传统业务后端（无应用服务器、无 SQL 数据库、无后台管理界面）。"后端"在本项目中指 **轻量服务端 `serve.py` + 本地数据文件体系**，以下按此如实描述。

### 6.1 系统模块划分

| 模块 | 文件 | 职责 |
|---|---|---|
| 静态服务 | `scripts/serve.py` | 本地静态文件托管（127.0.0.1:8017） |
| 白名单代理 | `scripts/serve.py`（`/api-proxy/`） | 无 CORS 官方 API 的本地转发（PROXY_TARGETS 白名单） |
| 数据生成 | `scripts/*`（`gen-file-data.js` 等） | 源数据 → `data/core/*.file.js` 构建产物 |
| 本地线路库 | `data/core/railway_data.json` + `station_i18n.json` | 线路/车站/坐标/关联/多语言（见 6.3.1） |
| 观光业务库 | `data/core/tourism_data.json` | 景点/活动/店铺/多语言（见 6.3.2） |
| 时刻表库 | `data/timetables/*-manual.js` + `vehicle-type-map.js` | ODPT 无数据线路的人工时刻表 |
| ODPT 客户端 | `data/api/odpt-unified.js` + `odpt-links.js` | 实时/时刻表/运行情报统一入口 |

服务端规则（白名单登记、key 不硬编码、安全加固不回退）见 3.9。


### 6.2 后台权限模型

本项目**无后台管理界面、无账号体系、无传统权限模型**，不适用 RBAC/ACL。实际访问控制如下：

| 控制面 | 机制 |
|---|---|
| 服务绑定 | `serve.py` 仅绑定 `127.0.0.1`，外部网络不可达 |
| Host 校验 | 非 `127.0.0.1`/`localhost`/`[::1]` 拒绝（防 DNS rebinding） |
| 敏感路径 | `/.work/` `/.git/` `/scripts/` 等路径拦截（防敏感文件下载） |
| 代理白名单 | `/api-proxy/` 仅可转发 PROXY_TARGETS 登记端点（防 SSRF） |
| 密钥管理 | API key 走环境变量 / `.work/serve.env`（.gitignore 排除），不落代码；泄露即轮换并封锁端点 |
| 关闭目录列表 | 防目录结构泄露；错误响应不回显内部细节 |

### 6.3 数据库设计

数据以 **JSON/JS 文件** 形式存放于仓库（无 SQL 数据库），由构建脚本生成浏览器可加载的 `*.file.js` 产物。

#### 6.3.1 本地铁道线路基础数据库（核心静态底库）

| 数据文件 | 内容 | 维护规则 |
|---|---|---|
| `data/core/railway_data.json` | 线路（156 线）、车站（含坐标/站序/换乘）、LOS 运行系统、站台/检票口/出口等关联 | **冻结数据**：修改须 Freeze 例外，改后重跑生成脚本 |
| `data/core/station_i18n.json` | 车站多语言文本（ja/zh/ko/en） | 与线路库同源，改站名须同步 |
| `data/timetables/*-manual.js` | ODPT 无数据线路的人工时刻表（`<RailwayId>-manual.js`） | 仅 ODPT 无数据的线路允许手工整理；命名规范 |
| `data/core/*.file.js` | 构建产物（db-loader 加载） | **禁止手工编辑**，由 `scripts/*` 重新生成 |

权威源：**车站/线路数据以 ODPT API 为权威**（订正先例见归档变更日志）；车型/运行系统核验以官方页面为准。

#### 6.3.2 观光业务数据库

| 数据文件 | 内容 |
|---|---|
| `data/core/tourism_data.json` | 景点/活动/店铺三类条目：坐标、多语言文本（ja/zh/ko/en）、标签（labelForTags）、图片、出入口/距离锚点等 |
| 图片 | `images/` 按子目录归类（料理/観光地/鉄道等），与条目 ID 对应 |

观光条目的验收口径：坐标必须真实可查（以实际地点/官方信息核验）；标签去 emoji 化；补图优先官方/可溯源来源。

### 6.4 ODPT 实时数据对接 & 双库联动策略

- **三通道获取**（详见 3.8）：构建期生成 / 浏览器直连 ODPT（CSP 白名单）/ 本地白名单代理（无 CORS 官方 API）
- **唯一入口**：所有 ODPT 请求经 `odpt-unified.js`；首页首屏走惰性模式（`odpt-lazy.js`）
- **联动链路**：`db-loader`（本地基线）→ `odpt-unified`（实时/时刻表）→ `data-fusion`（实时优先、推定补缺）→ 业务层 → 展示层
- **双库联动**：本地线路库为基线（`LINE_TO_OPERATOR`/`LINE_RAILWAY_CODE` 映射 ODPT）；匹配成功请求 ODPT，匹配不到（ODPT 无数据线路）使用本地 `*-manual.js` 时刻表，不发空请求
- **数据同步策略**：
  - 基线数据（线路/车站/观光）构建期固化进 `*.file.js`，运行时不再变更
  - 实时/时刻表按需拉取（惰性），浏览器缓存 + `?v=` 版本化刷新
  - 无实时数据的线路由 `train-position-estimator.js` 按时刻表+延误推定补缺
  - ODPT 无数据的线路使用本地 manual 时刻表，不向 ODPT 发起空请求
- **降级与安全**：官方端点不可用时前端兜底（先例：小田急 403 → 显示"暂无延误情报"）；key 管理见 6.2

### 6.5 核心业务规则

- **数据权威**：车站/线路订正以 ODPT API 为权威源；车型"不编造、核验有据才升、不确定保持候选"
- **运行情报**：realtime 弹窗直接显示 ODPT `text` 原文全文，区间/原因解析仅作概览兜底；运行状态 = 官方 status 字段值 + cause
- **推定显示**：推定数据随页面加载初始化，容器内与实时同一外观；仅在容器外标注"*数据来自时刻表计算"（见归档变更日志 4.3.469）
- **推定提示去重**：推定提示（"*数据来自时刻表计算"）每视图最多 1 条，禁止重复堆叠（4.3.517）
- **直通判定**："能连上就是直通"——存在直通运行事实即登记直通关系
- **冻结数据**：`railway_data.json` 等冻结数据修改必须符合附录 A Canonical Data Freeze Rule（Freeze 例外）
- **显示同一性**：数据不变规则与显示一致性要求见附录 A「数据不变规则・显示同一性・其他硬规则」
- 其余硬规则以附录 A 开发规则为准

## 7. API 接口文档

### 7.1 全局请求 / 响应统一格式

本项目**无自有 HTTP 业务 API**（无服务端业务接口）。数据获取按形态分三类：

| 接口形态 | 入口 | 说明 |
|---|---|---|
| 本地库模块接口 | `window.RailwayDB` 等（见 7.4） | 浏览器端读取构建期数据（线路/车站/观光） |
| ODPT 外部 API | `window.ODPTClient`（见 7.4） | 实时/时刻表/运行情报，经 CSP `connect-src` 白名单 |
| 本地代理 | `/api-proxy/`（serve.py） | 无 CORS 官方 API 的本地转发（PROXY_TARGETS 白名单） |

通用约定：
- **标识符**：线路 ID（RailwayId）与车站 ID 以 ODPT / 项目数据为准（如 `JC_Chuo_Rapid`、`Shinjuku`、`Nippori_Toneri`）；不自行造 ID
- **版本化**：模块接口随资源 `?v=4.3.xxx` 版本化；接口变更必须 bump
- **CSP**：`connect-src` 仅 `self` + ODPT/MapTiler 白名单；新端点必须先登记
- **错误与降级**：fetch 失败/限流/403 由前端兜底（先例：小田急 403 → 显示"暂无延误情报"）；ODPT 限流经 `rateLimitedFetch` 排队节流
- **缓存**：ODPT 时刻表经 IndexedDB 缓存（`RTCache` / ODPTClient 内部缓存），localStorage 旧缓存自动迁移


### 7.2 全局错误码规范

本项目无自有 HTTP 业务 API，故无统一服务端错误码表。实际错误处理约定：

| 场景 | 处理 |
|---|---|
| 本地库模块接口读取失败 | 视为数据缺失（DATA-BLOCKED），不编造兜底内容 |
| ODPT fetch 失败 / 限流 / 403 | 前端兜底（先例：小田急 403 → 显示"暂无延误情报"）；ODPT 限流经 `rateLimitedFetch` 排队节流 |
| 代理 /api-proxy/ 404/403 | 不再保留请求能力（4.3.619 彻底移除官方源代理请求链） |
| 缓存键冲突 / 版本过期 | 缓存键推进 + `?v=` 版本化刷新 |

### 7.3 前台业务接口（读取本地线路库、景点、观光路线）

构建期数据经 `db-loader.js`（`applyData`）加载为浏览器全局，统一由数据层访问：

| 接口 | 形态 | 内容 |
|---|---|---|
| `window.RailwayDB` | 数据访问对象 | 线路/车站数据统一入口（如 `resolveStationName` 站名解析，供搜索/历史/观光模块使用） |
| `window.STATION_COORDS` | `{ stationId: [lat, lng] }` | 车站坐标表（来自 railway_data.json `stations`） |
| `window.STATION_NAME_MAP` / `EN_STATION_NAME_MAP` | `{ 日文站名: 多语言 }` / 英文反查 | 站名多语言映射（来自 `name_map`） |
| `window.UNIFIED_LINES` | `{ lineId: 线路对象 }` | 统一线路库（来自 railway_data.json `lines`） |
| `window.RTCache` | IndexedDB 读写（`rtPut`/`rtGet`） | 运行时缓存层 |

观光数据（景点/活动/店铺）同样经 db-loader 加载（`tourism_data.json`），由 `sightseeing.js` / `tourism-core.js` 提供推荐与详情读取。

### 7.4 ODPT 实时数据封装接口（实时运行/时刻表，与本地线路库匹配）

所有 ODPT 请求统一经 `odpt-unified.js` 的 `window.ODPTClient`：

| 方法 | 参数 | 返回内容 |
|---|---|---|
| `getTrainPositions(operator)` | 运营者代码 | 列车实时位置（odpt:Train 列表） |
| `getTrainInformation(operator)` | 运营者代码 | 运行情报/延误信息 |
| `getTimetable(operator)` | 运营者代码（支持日历拆分解决 1000 条上限） | 列车时刻表 |

与本地线路库匹配机制：
- `LINE_TO_OPERATOR`：线路 ID → 运营者映射（本地线路库经此找到 ODPT 运营者）
- `LINE_RAILWAY_CODE`：线路 ID → ODPT railway 代码（`resolveRailwayCode` 解析）
- 匹配成功 → 请求 ODPT；匹配不到（ODPT 无数据线路）→ 使用本地 `*-manual.js` 时刻表，不发空请求
- 数据融合：`odpt-unified`（实时）→ `data-fusion`（实时优先、推定补缺）→ 业务层

### 7.5 后台管理接口

本项目**无后台管理界面、无账号体系**，因此**无后台管理接口**。数据维护通过直接编辑数据文件（见 6.3）+ 构建脚本重新生成完成；访问控制见 6.2。

### 7.6 系统数据字典

**本地线路库（railway_data.json，构建产物经 db-loader 加载）**

| 字段 | 类型 | 说明 |
|---|---|---|
| `stations` | `{ stationId: {lat, lng} }` | 车站坐标（≈160 站以上全库） |
| `lines` | `{ lineId: 线路对象 }` | 线路库：多语言名称、车站序列、LOS 系统、站台/检票口/出口关联 |
| `name_map` | `{ 日文名: {ja,zh,ko,en} }` | 站名多语言 |

**观光业务库（tourism_data.json）**

| 字段 | 类型 | 说明 |
|---|---|---|
| `spots` / `events` / `shops` | 对象数组 | 景点/活动/店铺三类条目 |
| 条目字段 | — | `name`（名称）、`coord`（[lat, lng]）、`dist`（步行距离）、`desc`（多语言描述）、`tags[]`（标签）、`image`（图片路径）、`bestTime`/`hours`（营业/时间）等 |

**本地存储**

| Key | 内容 |
|---|---|
| `pixel_tetsudo_search_history` | 搜索历史（上限 50）：`{id, timestamp, from/to, fromId/toId, fromName/toName, durationMin, path[], lineInfo[]}` |
| `i18n_lang` | 语言偏好（ja/zh/ko/en） |
| IndexedDB `RTCache` | ODPT 时刻表运行时缓存 |

## 8. 部署与运维

### 8.1 服务器资源配置

- 本项目为**纯静态站点 + 本地开发服务器**，无独立服务器、无数据库服务器：
  - 生产：GitHub Pages 静态托管（`biubiu52011.github.io/Pixel-Tetsudo`）
  - 本地开发：`scripts/serve.py`（仅绑定 `127.0.0.1:8017`，外部不可达）
  - 数据以仓库内 JSON/JS 文件形式存在，无运行时数据库进程
- 资源要求：纯静态文件（HTML/CSS/JS/图片/字体），无构建期外的计算资源需求

### 8.2 CI/CD 构建部署流程

- **无自动 CI/CD**，发布为手动流程：
  1. 数据改动（`data/core/*.json` 等）→ 重跑构建：`node data/core/gen-file-data.js`
  2. `node --check` 全部 JS 语法校验 + 本地 `python serve.py` 实测
  3. 浏览器双档实测（桌面/移动），console 0 错误
  4. 提交并推送（GitHub Pages 自动发布）
- 版本化：每次发布 bump `?v=4.3.xxx` 缓存键，旧缓存自动迁移/失效

### 8.3 环境变量配置清单

| 变量 | 位置 | 说明 |
|---|---|---|
| ODPT API key 等 | `.work/serve.env`（本地开发） | 经 `serve.py` 注入代理请求；`.gitignore` 排除，不落代码；泄露即轮换并封锁端点（见 6.2） |
| 生产环境 | 无环境变量 | GitHub Pages 静态托管，ODPT 请求走浏览器直连（CSP 白名单）；key 管理见 6.2 |

### 8.4 静态资源、SVG、CDN 部署规范

- 静态资源：`fonts/`（像素字体唯一来源）、`images/`（按子目录归类：料理/観光地/鉄道等）、`css/`、`js/`（详见 5.7）
- SVG：线路图全部 SVG 自绘（`trains-page.js` 渲染，非图片/Canvas），绘制规范见 5.4 / 附录 B
- CDN：**无自有 CDN**；第三方依赖走 CSP 白名单——ODPT API、MapTiler 瓦片（地图底图），新端点必须先登记（见 7.1）

### 8.5 日志、监控规则

- **无服务端日志与监控系统**（静态站点）。实际质量门：
  - 前端 console 治理（P3 记录，发布前 console 0 错误）
  - 体检脚本（`audit-coverage-final.js` 等：本地 165 线 vs ODPT 覆盖四维审计）
  - 数据一致性审计见第 9 章
- 线上问题通过用户反馈 + 版本回滚处理（git 历史）

### 8.6 数据库备份策略（本地线路库重点备份）

- **git 仓库即备份**：`data/core/railway_data.json`（156 线 / 509 站 / 1703 name_map / 93 观光点）等冻结数据随仓库版本管理
- 冻结数据保护：修改必须符合附录 A Canonical Data Freeze Rule（Freeze 例外），改后重跑构建并提交
- 无独立备份系统；恢复 = 从 git 历史回滚数据文件 + 重跑构建

### 8.7 降级容灾方案（ODPT 失效优先走本地库）

- ODPT 不可用 / 限流 / 403：
  - 有本地 manual 时刻表的线路 → 直接使用本地数据，不发空请求
  - 无 manual 的线路 → `train-position-estimator.js` 按时刻表+延误推定补缺
  - 运行情报失效 → 前端兜底显示"暂无延误情报"（先例：小田急 403 → 封锁数据源）
- 本地库损坏 / 数据缺失 → 从 git 回滚 + 重跑构建；数据缺失字段遵循 DATA-BLOCKED（不编造）
- 降级优先级：本地基线 > ODPT 实时 > 推定补缺 > 显式降级提示

## 9. 测试规范

### 9.1 核心测试场景

- 构建产物：`node --check` 全部 JS + 重跑 `node data/core/gen-file-data.js` 后 bundle 一致性
- 本地实测：`python serve.py`（127.0.0.1:8017）启动后浏览器访问全部页面
- 双档布局：桌面 + 移动（约 410px 容器）实测，无溢出、无文字穿线、无 JS error（见 4.6）
- 数据完整性：全量相邻站检测（>12km 仅允许真实远距，如 Tokaido Odawara-Atami 19km）
- console 0 错误（页面加载 + 交互路径）

### 9.2 数据一致性测试（本地库 vs ODPT）

- ODPT API 全量对比矫正（先例：4.3.478 JR 东全量对比矫正、4.3.470 ODPT railway ID 映射全面修正）
- 覆盖审计：`audit-coverage-final.js`——本地 165 线 vs ODPT 四维缺口（线路/车站/时刻表/实时）
- 直通一致性：`tt_join_check` BFS 多跳判定（123 件接续站缺失修复闭环）
- 车型核验：vehicle-type-map.js 候选条目经官方/有力信息源核验（"核验有据才升、不确定保持候选"）
- 多语言：站名/文本 ja/zh/ko/en 四语覆盖检查（站名搜索多语言验证，4.3.604）

### 9.3 兼容性、性能测试标准

- 兼容性：Chrome 桌面/移动实测；CSP 合规（connect-src 仅 self + ODPT/MapTiler 白名单）；file:// 与 localhost 双方式可访问（经 db-loader 兼容）
- 性能：首页首屏惰性加载（`odpt-lazy.js`）；时刻表 IndexedDB 缓存（RTCache）避免重复请求；`?v=` 版本化缓存刷新
- 资源：SVG 自绘线路图渲染性能（大江户线六形环等复杂图元双档实测）

## 10. 风险说明 & 常见 FAQ

### 10.1 项目已知风险点

- **埼京线站序混入**：stations 混入京滨东北线系车站（Urawa/Naka-Urawa 等），线路站序重构风险大，另立任务待处理（4.3.456 遗留）
- **远郊线路出口数据缺失**：约 1500 站（东北/北陆/甲信越）无真实出口数据——无观光景点覆盖、wiki 数据稀疏（4.3.626 遗留）
- **车型候选待核验**：vehicle-type-map.js 仍存在"（候选）"条目，需官方源核验后方可升级
- **ODPT API key 风险**：曾发生 key 泄露（4.3.537 P0-3），已有轮换 + 封锁机制，仍需持续治理
- **并发会话版本冲突**：同一版本号多次出现（已用〔并发会话〕标注），需以"日期 + 标题"判断先后
- **无自动 CI**：回归依赖手动测试流程，存在漏测风险（发布门规则见附录 A Release Gate Rule）

### 10.2 开发 / 部署 / 数据维护常见问题

- **Q：如何本地运行？** A：`python scripts/serve.py`（127.0.0.1:8017），必须通过本地服务器访问（file:// 部分功能受限）
- **Q：如何修改冻结数据（railway_data.json）？** A：需 Freeze 例外（见附录 A Canonical Data Freeze Rule），改后重跑 `node data/core/gen-file-data.js`
- **Q：为什么某线路没有实时数据？** A：ODPT 无该线路数据 → 使用本地 manual 时刻表 + 推定补缺，不发空请求
- **Q：实时弹窗内容看不懂？** A：弹窗直接显示 ODPT text 原文全文，区间/原因解析仅作概览兜底（见 6.5）
- **Q：多语言（ja/zh/ko/en）有缺失怎么办？** A：补充须与权威源核对（数据权威规则），站名 i18n 同步更新（见 6.3.1）
- **Q：如何推送上线？** A：重跑构建 → node --check → 双档实测 → 提交推送 GitHub Pages（见 8.2）
- **Q：图片/资源引用断了？** A：检查 images/ 子目录归类与条目 ID 对应（见 5.7）；图库迁移后断链须清零（4.3.535 先例）

---

# 附录（原四份源文档全文）

> 本部分为构成综合版的四份原始文档全文：**附录 A 开发规则**（原 AGENTS.md）、**附录 B 线路图设计规定**（原 LINE-DIAGRAM-SPEC.md）、**附录 C 4.3.31 设计文档**（原 4.3.31_design.md）、**附录 D 基本信息**（原 README.md）。
> 综合版（第 1-10 章）为概要视图，附录为权威细则；正文引用一律以「附录 A-D」编号为准，与第一部分章节编号相互独立。

# 附录 A 开发规则（Hard Rules，原 AGENTS.md）

> 本章规则对本项目所有 AI agent 生效，优先级高于任何任务级指令。

本文件定义了任何参与本项目的 AI agent 必须遵守的硬规则。
这些规则的优先级高于任何任务级指令。

---

## 线路层级规则（Line Hierarchy Rule，硬规则）

**规则一：平级独立运营线（Peer Independent Service Line）的排他定义**
满足以下任意一个条件的线路，即使共享同一路线记号（JC/JU 等）、即使物理上分叉或直通，也 MUST 是完全平级、独立的顶级节点（Parent Line），严禁被当作另一条的"支线（Branch）"嵌套合并：
1. 独立爱称：拥有官方和乘客公认的不同运营线名称（例：中央线快速 JC / 青梅线 JC / 五日市线 JC 是三条独立主线；宇都宮线 JU / 高崎线 JU 是两条独立主线）。
2. 独立大列表：拥有独立、完整的长途运行区间和独立车站大列表，不是依附主线的盲肠。
Line_ID 必须彻底解耦（JC_Chuo_Rapid / JC_Ome / JC_Itsukaichi 级别），并在"线路一览"一级大列表并列独立展示。

**规则二：真正的内部支线（Branch Line）的嵌套规则**
仅当线路在日常运营和向导看板上没有独立于父线的宏观运营系统名称（官方即称"XX线XX支线"，如：中央本线辰野支线、水郡线常陸太田支线、丸ノ内线方南町支线、千代田线北綾瀬支线、鶴見线海芝浦支线/大川支线）时，才判定为支线并强制执行嵌套：
- 数据模型：line 带 branchOf=<父线ID>，父线带 branches=[子线ID...]；严禁在一级总列表独立展示。
- 支线只能在父线详情/系统卡片内展示。

**判定流程（禁止用物理线覆盖）**：先问"乘客看板/运营系统叫什么"→ 独立运营名 = 平级顶级；官方叫"XX支线" = 嵌套。任何合并/嵌套前必须显式声明依据规则一还是规则二。

**Agatsuma（吾妻线）、Miyo（弥彦线）等拥有独立运营名的线路均为平级顶级，branchOf 必须为 null。**

**干线本名不进展示层（2026-09-08）**：中央本线（ChuoMain）/東海道本线（TokaidoMain）/東北本线（TohokuMain）是国鉄大干线本名，不是运行系统——LOS 系统卡已删除、data-state renderList 排除（TRUNK_MAIN_LINE_IDS）；数据保留作换乘锚点/支线父线（ChuoTatsuno 的 branchOf 不变）。

**干线本名展示规则修订（2026-09-09，wiki 编译确认）**：
- **中央本线（ChuoMain）恢复进展示层**——wiki 确认中央東线（高尾～塩尻）是 JR 东管内独立运行系统：车站编号 CO33-61、路线色 #007ac0、中距离列车（211 系等）独立运行，与中央快速（JC，東京～高尾 24 站）记号/运行系统不同。ODPT odpt:Train 亦按 odpt:railway=Chuo 独立推送（与 ChuoRapid 分开）。LOS 新增 CO 系统卡（中央本线，order 20——**CO 是干线记号，不属于 JA-JY 东京近郊通勤记号序列，置于 JY（19）之后**）；TRUNK_MAIN_LINE_IDS 移除 ChuoMain，现为 ["Shinetsu","TokaidoMain","TohokuMain"]。
- **中央快速 / 中央本线 = 两个独立运行系统**（wiki 中央线快速词条：通勤铁路运行系统 東京～高尾；wiki 中央本线词条：干线本名，JR 东管内高尾～塩尻为中央東线）——各自独立卡、列车数据分开显示（4.3.413 拆分实施，4.3.414 修正 CO 记号与 #007ac0 官方色）。
- **横須賀线・総武快速线 = 官方同一运行系统**（wiki 横须贺·总武快速线词条：JR 东日本通勤列车运行系统之一，久里滨→东京→千叶，路线记号 JO，1980 年 SM 分离后一体化互相直通）——LOS JO 系统卡 lineIds=[Yokosuka, SobuRapid] 融合显示、trains 详情延伸段聚合正确（4.3.409）。
- **TRUNK 延伸白名单化（4.3.421）**：trains 详情页延伸段原按"端点相接"自动判定干线本名延伸——横須賀线（東京）误延伸整条東海道本线（東京→熱海 并行线非直通，线路图右列混入有楽町/川崎/熱海等）。改为显式白名单 `_TRUNK_EXTENSION_ALLOW`（当前为空，不延伸任何干线本名）；中央本线已独立 CO 卡、Shinetsu 分断排除、TokaidoMain/TohokuMain 均为并行非直通。LOS 同系统直通延伸（Yokosuka↔SobuRapid、Tokaido↔Ito 等）保留不受影响。
- **运行状态判定收紧 + 日文用词修正（4.3.425）**：①文本兜底不再因出现"停运"二字判全线中断——八戸线"設備メンテナンスのため…6本の列車を運休します"（部分运休通知）曾被误判为断线；现仅明确"運転を見合わせ/運転を中止/全線運休"才 suspended（data-fusion.js parseODPTDelay + official-railway.js ゆりかもめ同步收紧）。②日文 status.suspended 翻译 "運航中断"（船舶/航空用词）→"運転見合わせ"（铁路标准用语）。验证：部分停运→normal、真暂停/全線運休→suspended。
- **notice 状态（黄色惊叹号，4.3.426）**：有运行通知但非延误/非中断时显示 ⚠（黄色）而非正常○/中断×——data-fusion.js parseODPTDelay 在 status=normal 且有实质文本（非"正常運転/遅延なし"类否定宣言）时置 notice；STATUS_META/statusRank（3.5，介于 normal 与 delayed）新增 notice；realtime-view 颜色映射 notice=yellow；translations status.notice 4 语言（Notice/通知/運行情報/안내）；CSS --yellow:#f5b301。验证：部分停运→notice、正常運転→normal、真暂停→suspended、15分延误→delayed、遅延なし→normal。

**東武スカイツリーライン / 伊勢崎线 切割（2026-09-09，ODPT 双 railway ID 拆分）**：ODPT 分开推送两个 railway ID（Tobu.TobuSkytree 浅草～東武動物公園 愛称线 / Tobu.Isesaki 東武動物公園以遠 本线）——LOS TOBU 组 TI 合并卡（伊勢崎线（スカイツリーライン）lineIds=[TobuSkytree,TobuIsesaki]）拆为 **TS 卡（東武スカイツリーライン，TobuSkytree）** + **TI 卡（伊勢崎线，TobuIsesaki）** 两张独立卡（4.3.417）。符合规则一（独立运营爱称=平级顶级）；列车数据各自独立不融合。

**信越本线（Shinetsu）追加排除（2026-09-08，wiki 编译确认）**：北陆新干线开通后信越本线已分断——高崎～横川（JR东）+ 横川～軽井沢（废线）+ 軽井沢～妙高高原（しなの鉄道）+ 妙高高原～直江津（えちごトキめき鉄道）+ 直江津～新潟（JR东）——完整"信越本线"称呼不存在于 JR 东管内。LOS 卡已删除、TRUNK_MAIN_LINE_IDS 追加 Shinetsu；数据保留（横川～直江津区间含第三セクター，站序断裂待 Freeze 例外修正）。

**trains 详情返回按钮与 tourism-detail 同步（4.3.439）**：trains 详情返回从"清 hash + 强制回列表"改为 `history.back`（与 tourism-detail 的 handleBack 一致）——外部跳入详情页返回时回到来源页，页内切换返回时回到列表。因 trains 为 hash 路由且原无 hashchange 监听，补 hashchange 兜底：hash 变空 → hideLineView，hash 变为未匹配线路 → showLineView。无历史（新标签直开详情、history.length===1）时 fallback 清 hash + hideLineView 回列表。验证：页内/外部跳入/新标签直开 三场景均正确。

## 系统优先变更规则（System-First Change Rule，硬规则）

任何新增、修改或删除操作都必须从当前完整系统状态出发，绝不能只从目标文件出发。

### 变更前
1. 明确本次变更所服务的用户任务
2. 确认当前架构边界（哪个模块拥有什么）
3. 列出涉及的所有 Provider（提供方）/Consumer（消费方）关系
4. 检查历史实现、孤儿条目或废弃路径
5. 在系统模型内设计修改方案——而不是靠适配现有代码

### 任何结构性变更后
必须重新检查以下所有项：
- Provider → Consumer 链条完整
- 未产生新的孤儿
- 没有旧入口被重新引用
- 未引入重复实现
- 没有现有模块能力被削弱
- 没有 A+B 临时融合形成新的模糊边界
- 新功能没有错误继承旧框架
- 旧功能在变更后仍保留原有能力

### 关键原则
"能运行"不等于"正确集成进系统"。
如果局部改动与系统级设计冲突，应重新设计改动方案——绝不需要强行适配现有代码。

---


## 规则 9 - 全系统消费方保全（Rule 9 - Whole-System Consumer Preservation，硬规则）

任何新增、修改、迁移或删除操作都必须从当前完整的系统 Provider-Consumer-边界（提供方-消费方-边界）地图出发，绝不能只从目标文件出发。

### 变更前问卷（动代码前必须回答全部）
1. 当前由哪个现有 Provider 提供这项能力？
2. 现在有哪些 Consumer（直接与间接）？
3. 每个受影响页面的主心（main heart）是什么？
4. 该功能属于哪个模块？
5. 是否已有实现？
6. 是否存在历史/废弃实现？
7. 历史实现当初为什么未被使用？
8. 本次变更会影响哪些 Consumer？
9. 是否会制造新的孤儿？
10. 是否会为同一职责创建第二套实现？
11. 变更后系统职责地图会变成什么样？

### 迁移规则
将能力从 Provider A 迁移到 Provider B 时：
- 先把 A 的全部 Consumer 迁移到 B
- 逐个验证 Consumer 与 B 正常工作
- 之后才移除 A
- 执行全局孤儿清扫

### 删除规则
移除某项能力时：
- 确认剩余 Consumer 为零
- 确认没有历史文件会被未来的 AI 误认为是当前实现
- 记录本次删除

### 禁止并行实现规则
绝不需要因为"方便"就为同一职责创建第二个 Provider。
如果现有 Provider 无法满足新需求，应扩展它——而不是复制一套。

### 任务提示词规则
未来任务提示词必须写成：
"使用当前系统作为参照，完成功能 X。目标文件只是候选修改点，不是最终实现位置。"

绝不需要写成：修改 xxx.js 来实现 xxx。

---

## 新功能开发流程（Post RC-2）

每个新功能都必须遵循以下链条：

1. 只读系统审计（基于基线的当前状态）
2. 检查现有能力是否可复用
3. 如需新能力：明确界定 Provider 边界
4. 明确哪个模块主心拥有此功能
5. 在系统边界内实现
6. 消费方链条审计（所有 Consumer 均验证）
7. 未来 AI 陷阱扫描（不留误导性条目）
8. 全局产品走查（无跨模块回归）
9. 发布门（Release Gate）检查

不得跳步。不需要把文件级改动视为充分。

---

## 4.3.0 功能准入 / 系统影响评审（强制）

在任何新功能开发之前，agent 必须完成以下准入问卷。
这是所有未来功能开发的固定入口。

### 准入问卷（动代码前必须回答全部）

1. **用户任务**：该功能服务哪个用户任务？
2. **页面归属**：该功能属于哪个页面？
3. **主心检查**：该页面的主心是什么？此功能是强化还是稀释了主心？
4. **能力分类**：这是主心能力、辅助能力还是后台能力？
5. **Provider 影响**：会影响到哪个现有 Provider？是扩展还是替换？
6. **Consumer 影响**：哪些 Consumer 会受影响？逐一列出。
7. **新数据入口**：是否会创建新的数据入口？如果是，属于哪一层（UNIFIED_LINES / DataLayer / RailwayDB）？
8. **显示解析器**：是否会创建新的显示名解析器？如果是，必须经由 RailwayDB 路由。
9. **孤儿风险**：是否会导致任何现有模块变成孤儿？
10. **A 换 B 退化**：变更后，模块 A 是否仍保留全部原有能力？
11. **遗留清理**：变更后哪些旧代码应迁移、保留或删除？

### A 换 B 退化检查（关键）

这是最重要的规则。它防止以下模式：
- B 基于被修改过的 A 构建
- A 的原有 Consumer 在过程中被破坏
- 之后 AI 发现 A 的旧代码，误以为它仍是当前框架
- 新功能挂接到孤儿的 A 上，而不是正确路径

**检查模板**：
`
变更前：A -> Provider -> Consumer_X, Consumer_Y
变更后：A -> Provider -> Consumer_X（必须仍然可用）
 A -> NewPath（B 的新路径）
 Consumer_Y -> ?（绝不能变成孤儿）
`

如果任何 Consumer 失去了对其能力的访问，变更被拒绝，直到修复。

### 决策树

| 发现 | 行动 |
|---------|--------|
| 现有 Provider 可满足需求 | 扩展现有 Provider，不需要新建 |
| 需要新 Provider | 明确界定边界，记录到本附录 |
| 旧 Provider 可完全替换 | 先迁移所有 Consumer，再移除 |
| 有制造孤儿的风险 | 停止——以消费方保全为原则重新设计 |
| 无法回答第 10 问 | 停止——先调查完整消费方链条 |

### 4.3.0 准入后流程

准入完成并获批后：

1. 只读系统审计（确认基线状态）
2. 检查现有能力是否可复用
3. 如需新能力：明确界定 Provider 边界
4. 明确哪个模块主心拥有此功能
5. 在系统边界内实现
6. 消费方链条审计（所有 Consumer 均验证）
7. 未来 AI 陷阱扫描（不留误导性条目）
8. 全局产品走查（无跨模块回归）
9. 发布门（Release Gate）检查

不得跳步。

---

## 能力归属检查（所有功能开发强制）

在完成 11 问准入后、做出任何实现决策之前，agent 必须回答这个问题：

**"这项能力属于谁？"**

### 能力归属图（当前 RC-2 基线）

| 能力 | 归属 | 边界 |
|-----------|-------|----------|
| 线路/车站身份 | RailwayDB | resolveLineName, resolveStationName |
| 显示名（i18n） | RailwayDB | resolveLineName(currentLang) |
| 运营商显示 | RailwayDB | tOp(operatorId) |
| 运行时缓存 / 位置 | DataLayer | positions, regions |
| 实时融合 | DataFusion | 来自多源的数据统一 |
| 原始规范数据 | UNIFIED_LINES | db-loader.js 输入 |
| 运行系统分组 | LineOperationSystems (LOS) | lineIds 分组 + 系统名 (i18n) + 官方 HEX + 路线记号；系统卡唯一权威 |
| 搜索交互 | SearchUI | 表单处理、结果展示 |
| 历史记录 | History | 消费 SearchUI 输出，不拥有搜索逻辑 |
| 路线搜索 UI | Route 页 | 拥有主心："我怎么去？" |
| 实时状态 | Realtime 页 | 拥有主心："现在能坐吗？" |
| 观光 / 景点 | Tourism 页 | 拥有主心："到达后去哪玩？" |

### 逻辑挪用规则

如果模块 B 需要位于模块 A 内部代码中的能力：

**情形 1：该能力属于 A 的职责**
- A 应将其暴露为公共方法 / Provider
- B 调用公共 API，而不是 A 的内部实现
- 如果 A 无法合理暴露，扩展 A 的职责图

**情形 2：该能力不属于 A**
- B 依赖错了模块
- 在上面的归属图中找到正确归属
- 将 B 的依赖改指向正确归属
- 绝不让 B 以捷径方式"潜入"A 的内部实现

### 反模式：B 借用 A 的逻辑却不回馈

以下模式绝不允许发生：
`
B 需要 X
→ B 从 A 的内部复制/重写 X
→ B 正常工作了
→ A 从未获得 X
→ A 的 Consumer 失去了对 X 的访问
→ 未来的 AI 发现 A 的旧 X 代码，误以为仍是最新的
→ 新功能 C 挂接到 A 的孤儿 X 上
→ A+B+C 框架崩塌
`

**每次变更都用这个问题检查：**
> 变更后，归属模块是否仍向它所有的原始消费方提供相同能力？

如果答案是否定的，变更被拒绝。

## 已知债务（不需要自动修复）

| 债务 | 优先级 | 延期理由 |
|------|----------|-----------------|
| History <-> SearchUI 耦合（P2） | P2 | 需要 SearchUI 公共 API 重新设计 |
| ~~data/铁道/ 目录~~ | 已移除 2026-09-06 | 依用户明确指示删除历史归档（git 历史完整保留；曾被并发工作流 63114dd 恢复一次，经用户批准后再次删除）。带坏相对路径的双 home.html 已消除——入口仅为 pages/home.html |
| ~~data/api/line-operation-systems.js~~ | 已移除 4.3.41 | data/core 的孤儿副本（零页面引用、缺 isStandalone）——已删除，保留 data/core/line-operation-systems.js 为唯一来源 |
| CSS 孤儿类（5 个） | P3 | 风险低，由继承覆盖 |
| odpt-unified.js 中的 console.log（2 处） | P3 | 非产品调试输出 |
| js/trains-detail.js 孤儿 | P3 | 零消费方（无任何页面引用）；含未解析的 _rS/tStation/_lang 引用——不需要启用 |
| LOS isStandalone / REGIONAL 伪分组 | 已移除 4.3.42 | 运行系统渲染退役了支线跳过机制；LOS 从权威运行系统表重新生成（支线位于其系统组内，如 Ome/Itsukaichi 在 JC 中） |
| ~~Yurakucho/Fukutoshin 站序错乱~~ | 已修复 2026-09-07 | 官方站序 和光市-成増-赤塚-平和台-氷川台-小竹向原-千川-要町-池袋。旧数据有乐町线缺小竹向原、副都心线缺冰川台。官方证据修正 railway_data.json（Yurakucho +Kotake-Mukaihara / Fukutoshin +Hikawadai）。两线最初 9 站一致，共有区间为 和光市～池袋 的 1 段。 |
| ~~Odawara（小田原线）站表末端混入 JR 东海道系车站~~ | 已修复 2026-09-10 | 按 ODPT 官方（Odakyu.Odawara 47 站/Station API OH41-46）全面修正——4 个错误站（Oiso/Ninomiya/Kozu/Kamonomiya）去除、Iriuda（箱根登山铁道站）去除、新站 6 件追加（ShinMatsuda 新松田 OH41/Kaisei 开成 OH42/Kayama 栢山 OH43/Tomizu 富水 OH44/Hotaruda 萤田 OH45/Ashigara 足柄 OH46）、按 46→47 站正序重建（见下方 Freeze 例外 4.3.493）。 |
| 13 个图片路径修复 | 待处理 | 素材映射，无产品影响 |
| ~~Noda（东武都市公园线）的 Sakae（荣）站~~ | 已修复 2026-09-08 | 东武野田线不存在荣站（正确为逆井 Sakasai）。经 wiki 核验将 Noda 全面重建为正序 35 站、删除重复线 TobuNoda、28 个错误 ID 替换为正 ID 并补 i18n（见下方 Freeze 例外）。 |
| ~~SotetsuDirect（相铁直通）列车误配山手线 posMap~~ | 已修复 2026-09-10 | 经 ODPT 实证（JR-East.SotetsuDirect 独立 railway、fromStation 专属站 ID）修复（4.3.494）——THROUGH_RAILWAY_FALLBACK 表（SotetsuDirect→prefer SotetsuShin-Yokohama/Yokosuka/Saikyo/ShonanShinjuku、exclude Yamanote）+ 羽泽横滨国大跨 operator 放行。验证：Osaki→Saikyo / MusashiKosugi→Yokosuka / NishiOi→Yokosuka / HazawaYokohamaKokudai→SotetsuShin-Yokohama，Yamanote 正常列车不受影响，integration_test 28/28。 |

---

## 架构基线（Architecture Baselines）

| 标签 | 提交 | 描述 |
|-----|--------|-------------|
| RC-1 | 63b388d | 工程基线：显示身份统一，P0-3=0 |
| RC-2 | 6e502f4 | 产品基线：架构成文、规则执行、Home 视觉一致性修复 |

---

## 数据不变规则・显示同一性・其他硬规则

## 规范数据冻结规则（Canonical Data Freeze Rule）
以下数据为**锁定**状态。任何情况下都不得修改：
- data/core/railway_data.json：156 线 / 509 站 / 1703 name_map / 93 观光点
- 任何缺失的数据字段属于**数据阻断（DATA-BLOCKED）**，不是凭空编造内容的理由。
- **Yurakucho / Fukutoshin 站序修正**（2026-09-07）：Yurakucho +Kotake-Mukaihara / Fukutoshin +Hikawadai（与官方站序一致）。冰川台・小竹向原作为两线共有的车站处理
- **东海道线换乘问题**（2026-09-08）：消除同名站 ID 冲突引发的搜索瞬移。伊奈线加茂宫 Kamonomiya→Kamomiya 分离（stations/transferStations/stationLines/lineStationOrder/显示名映射/station_i18n 一并更新）、东海道本线鸭宫保持 Kamonomiya 并新设 i18n(ja:鸭宫)。移除 Odawara/NewShuttle/TokaidoMain 之间的 Kamonomiya 误换乘宣言 6 件（加茂宫・鸭宫处的小田原线/新交通换乘并不存在）。
- **东海道线换乘标记过多、京滨东北线详图**（2026-09-08）：从京滨东北线/山手线/横须贺线/鹤见线/有乐町线/横滨线/东急多摩川线/东急池上线 的 transferStations 中，移除指向东海道线不停车车站（有乐町・滨松町・田町・高轮 gateway・大森・蒲田・鹤见・新子安・东神奈川・东户冢・保土谷等）的 TokaidoMain（东海道本线）换乘宣言 22 件。东京单轨滨松町⇔JR滨松町 的站外换乘中排除东海道本线（仅山手・京滨东北；滨松町没有东海道线停车）。东海道线运行系统停车站（东京・新桥・品川・川崎・横滨・户冢・大船・藤泽・茅崎・平冢・大矶・国府津・小田原・热海＋热海以远 早川・根府川・真鹤・汤河原）的宣言维持。湘南新宿线辻堂・二宫的 TokaidoMain 宣言作为东海道本线的车站保留（东海道线普通列车停车）。小田原线 Ninomiya 的 TokaidoMain 宣言属于 Odawara 误站问题（Known Debt P1）因此保留。
- **羽田机场换乘信息**（2026-09-08）：东京单轨羽田机场线（TokyoMonorail）与京急机场线（KeikyuAirport）之间的换乘宣言 8 件双向追加。天空桥（Tenkubashi⇔Tenku-Bashi，站内 in）、羽田机场第1航站楼（Haneda Airport Terminal 1⇔Haneda-Kuko-T1T2，站外 out 步行约5分钟）、羽田机场第2航站楼（Haneda Airport Terminal 2⇔Haneda-Kuko-T1T2，站外 out 步行约3分钟）、羽田机场第3航站楼（Haneda Airport Terminal 3⇔Haneda-Kuko-T3，站外 out 步行约4分钟）。
- **常磐线补充・wiki 确认**（2026-09-08）：常磐线本线（JobanMain、取手～岩沼 62 站）新增。wiki 确认运行系统分为 快速（品川～取手 JJ）/各站停车（绫濑～取手 JL）/中距离・特急（取手～岩沼→仙台），中距离区间此前缺失故补充。同时从 JobanLocal 删除北千住（各站停车以绫濑为起点，北千住是快速线/千代田线的车站）、移除 Joban 的 Kita-Senju→JobanLocal 误换乘宣言。新站 52 件（其中 Ono-Fukushima 大野・Yamashita-Miyagi 山下 为避免既有 ID 冲突使用独立 ID）。双向换乘 7 组追加（取手⇔快速/各站停车、友部⇔水户线、水户⇔水郡线、胜田⇔常陆那珂海滨铁道凑线、磐城⇔磐越东线、岩沼⇔东北本线）。
- **常磐线各站停车修正**（2026-09-08）：车辆图标统一为千代田线（东京地铁18000系）——删除 train-icons.js 的 JobanLocal 特急 typeMatch（E657系 常陆/常盘）误匹配（常磐线各站停车不存在常陆/常盘特急）。绫濑站追加北绫濑支线（ChiyodaBranch）换乘宣言：JobanLocal/Chiyoda 的 transferStations 中追加 Ayase→ChiyodaBranch、ChiyodaBranch 的 transferStations 中追加 Ayase→Chiyoda / Ayase→JobanLocal（绫濑是千代田线・常磐线各站停车・北绫濑支线 3 线连接点）。
- **奥羽本线收窄・wiki 确认**（2026-09-08）：奥羽本线（OuMain）100→66 站（新庄～青森）收窄。wiki 确认 福岛～新庄 为山形线（山形新干线）运行区间，移除 OuMain 开头 34 站（福岛～舟形），该区间由山形线（Yamagata）独占。删除重复注册的同名站 ID（Sakinoko/Mokichi-Kinenkan-mae/Zao/Minami-Tendo/Jimmachi 删除，山形线侧的 Sasanogawa/Mogami-Kinenkan-mae/Za-o/Tendo-Minami/Jimba 已存在）、Ashisawa/Funagata 作为山形线的车站在其 stationLines 中追加 Yamagata。Yamagata.transferStations 的 OuMain 换乘宣言除新庄外全部删除（仅新庄为两线连接，Shinjo→OuMain 维持）。OuMain.transferStations 仅保留新范围内 13 件，lineStationOrder/durations 也按 66 站重建。
- **总武本线 成田→成东 修正・wiki 确认**（2026-09-08）：总武本线（SobuMain）的站序误为 八街→日向→成田→松尾，已修正。wiki 确认正确站序为 八街→日向（Hyuga，实存）→成东（Naruto）→松尾。成田站是成田线的车站、不属于总武本线，因此将 SobuMain.stations 的 Narita 替换为 Naruto（成东）、移除 SobuMain.transferStations 的 Narita 宣言、从 Narita.stationLines 移除 SobuMain、在 Naruto.stationLines 追加 SobuMain。i18n.Naruto 由 鸣门→成东 修正（与外房线成东站共用，外房线显示也随之正确）。Hyuga（日向）作为总武本线的实存站维持。
- **水户线 Yamato 误换乘移除**（2026-09-08）：水户线（Mito）的大和站（茨城县筑西市）与神奈川县大和市的相铁线/小田急/高座涩谷（弘南）的大和站同名 ID 冲突，移除误换乘宣言 3 件（Yamato→OdakyuEnoshima / SotetsuMain / Kounan）。水户线大和为单独车站（无换乘）。ID 共享本身未分离（Kamonomiya 前例那样的 ID 分离另行讨论）。
- **外房线站表大混入・wiki 确认**（2026-09-08）：外房线（Uchibo）的站表全面重写（25站→正确的 27站）。混入的总武本线/成田线/野田线车站（Sakura 佐仓・Yachimata 八街・Enokido 榎户・Yokaichiba 八日市场・Matsuo 松尾・Naruto 成东・Sakae 荣・Namegawa 滑河）移除，新站 13 件追加（Kamatori 镰取・Nagata 永田・Honno 本纳・Shim-Mobara 新茂原・Torami 东浪见・Taito 太东・Chojamachi 长者町・Mikado 三门・Ohara 大原・Namihana 浪花・Onjuku 御宿・Ubara 鵜原・Namegawa-Island 行川岛）。行川岛站游乐园闭园后仍作为 JR 站存续（wiki/铁道LOD 确认，由旧表记 行川岛 改为正名）。i18n.Namegawa 滑川→滑河（成田线正表记）、Iikura.en typo 修正、Iigura 作为 Iikura 的重复 ID 删除。从 Narita/Noda/SobuMain 指向 Uchibo 的残留误换乘宣言 8 件移除。无归属站 Kujukuri 九十九里・Kasugacho 春日町・Daijima 大岛 以 stationLines 为空保留（实存性不明・待调查）。换乘站仅 千叶（总武快速/中央总武/成田/都市单轨/总武本线）・苏我（京叶/内房）・安房鸭川（内房）。
- **Yamato ID 分离**（2026-09-08）：水户线大和分离为 Yamato-Mito（下馆→新治→大和→岩濑）。花轮线（Kounan）的大和实存不存在故从站表移除（26→25 站）。stationLines.Yamato 缩减为 [OdakyuEnoshima, SotetsuMain]。重建 Kounan 的 lineStationOrder。
- **Osawa ID 分离**（2026-09-08）：奥羽本线（山形线）大泽分离为 Osawa-Yamagata，上越线大泽维持 Osawa。移除 Joetsu→OuMain/Yamagata・Yamagata→Joetsu 的同名瞬移换乘宣言 3 件。
- **山形线补站・wiki 确认**（2026-09-08）：山形线（Yamagata）追加芦泽（Ashisawa）・舟形（Funagata）（正序 北大石田→芦泽→舟形→新庄）、34→36 站。※楯山是仙山线（Senzan）的车站、山形线不存在故不追加。
- **东武野田线 荣站误登记修正・wiki 确认**（2026-09-08）：东武野田线（Noda）按 wiki 正序 35 站（大宫～船桥 TD-01〜35）全面重建。删除重复线 TobuNoda（29 站、混入其他线/架空站众多）。架空站 荣（Sakae）→逆井（Sakasai）订正。误 ID 28 件（Kita_Omiya/Omiya_Koen/Higashi_Iwatsuki/Shimizu_Koen/Shichiri/Kasugabe/Fujino_Shima/Kawa/Nanakouen/Ichihashi/Umon/Hajime/Nagareyama/Ohtakano_Mori/Toyotoki/Shin_Kashiwa/Shin_Kamagaya/Shin_Funabashi/Sakae/Rokkoku/Matsumizawa/Tsuka/Tohyu/Nanodai/Ohanabatake/Gumyo/Maezaki/Unane）删除并替换为正 ID。正 ID 9 站（Toyoharu/Fujino-Ushijima/Nanakodai/Nodashi/Umesato/Unga/Hatsuishi/Toyoshiki/Magomezawa）＋ Shin-Funabashi 的 i18n 新增。name_map 统一为正 ID（流山おおたかの森→Nagareyama-Otakanomori 等）、架空键 荣/求名 删除。处理 TobuNoda 残存宣言 17 件（正站 11 件→Noda 替换、非 Noda 站 6 件＝西船桥/东船桥/谷津/荣町 删除）。京成习志野（Keisei-Narashino）作为京成本线的车站插入 Keisei（42→43 站）、北习志野（Kita-Narashino）无归属保留。LOS 野田线卡 lineIds → ["Noda"]、删除 train-icons.js 的 TobuNoda 键。
- **JR集团 图标线路色・线路颜色修正**（2026-09-08）：房总 4 线线路颜色改为官方色——内房线（Sotobo/UCH）#fcc60d→#0071C5（蓝）、外房线（Uchibo/SOT）#fcc60d→#F22335（朱）、成田线（Narita/NRT）#fcc60d→#00BB85（黄绿）。总武本线（SobuMain/SOB）维持 #fcc60d（黄）。railway_data.json 与 line-operation-systems.js（LOS 系统卡）同步。同时 data-state.js 的 renderSystemCard/renderCard 中 JR集团.png 图标改为用「线路色框＋白底JR」的 fallback 容器（.rs-line-icon-fallback）绘制（此前是图片直出无框，与用户提供的 JR 官方 logo 设计＝线路色圆角框＋白底 JR 一致）。
- **误添加线路的一并删除・Freeze 例外**（2026-09-09）：删除过去其其他会话工作中混入的非 JR 东首都圈线路 4 线——青森铁道线（Aoimori/第三部门）、IGR岩手银河铁道线（IGR/第三部门）、常陆那珂海滨铁道凑线（HitachiNakaKaimin/第三部门、op 误 MIR 是 TX 的 operator）、JR山口线（JR_Yamaguchi/JR 西）。删除范围：lines 4 件・专属站 77 件（Metoki 清扫后无主故删除）・stationLines/lineStationOrder/name_map/station_i18n 引用・LOS 系统卡（AO/IGR/MIR-凑线/JR_WEST）・common.js OP_ORDER 的 JR West/IGR/Aoimori・translations op.Aoimori/op.IGR・odpt-unified 的 JR_Yamaguchi 运营商映射・train-icons/db-loader 图片引用・其他线 transferStations 指向该线的换乘宣言 8 件（八户/野边地/青森/盛冈/胜田 等共用站保留车站本身、仅移除引用）。删除后 162 线。odpt-links.js 是 ODPT 官方全量链接库（生成器产出・禁止手改）故 IGR 链接保留（已删线路不会被请求）。JR 东北地方线（大凑线等）保留。
- **千叶都市单轨・湘南单轨删除・Freeze 例外**（2026-09-09）：其他模型站数据编辑中误追加的首都圈单轨 2 线，删除——千叶都市单轨（ChibaUrbanMonorail/18 站、4.3.94 作为"缺失线路"追加但现在属范围外）、湘南单轨江之岛线（ShonanMonorailE/8 站、canonical 60→156 线时收录）。东京单轨・多摩都市单轨等同类**保留**（方案 A）。删除范围：lines 2 件・专属站 22 件（千叶15+湘南7）・共用站 4 件（Chiba-Minato/Chiba/Tsuga/Ofuna）仅移除 stationLines 引用・自身 transferStations 13 件随线删除・LOS 系统卡（SHONAN_MONORAIL/CHIBA_URBAN_MONORAIL）・common.js TRANSIT_NORMALIZE/LOS_KEY_MAP/OP_ORDER・lang-init _opIds・translations op.ShonanMonorail/op.ChibaUrbanMonorail（4语言8行）・train-icons OPERATOR_ICONS/LINE_ICONS・db-loader 图片引用・odpt-unified LINE_OPERATOR_CODE（ShonanMonorailE→ShonanMonorail / ChibaUrbanMonorail→ChibaMonorail）。删除后 160 线（4.3.434）。
- **川越线拆分为 2 个运行系统・Freeze 例外**（2026-09-09）：川越线按官方运行系统拆分——Kawagoe（大宫〜川越 6 站）维持 JA 卡「埼京线・川越线」（与埼京线在大宫直通、E233系7000番台 deployment 继续）、新设 KawagoeWest（川越〜高丽川 6 站、code JA、#00ac47）为新 LOS 卡「川越线（川越〜高丽川）」（order 1.1、无专用图标→JR色框 fallback、E209系3500番台）。川越站两线共用（stationLines: Kawagoe/KawagoeWest/Tojo）。through-service.js 追加川越站 Kawagoe↔KawagoeWest 直通（THROUGH_JOIN: 川越）、两线 transferStations 追加川越站相互接续宣言（直通标记用）、高丽川八高线换乘宣言移至 KawagoeWest（Hachiko 侧 lineId 也修正为 KawagoeWest）。line-service-relations.js 追加 THROUGH_SERVICE 记录。搜索 大宫→高丽川 经川越站直通 0 换乘。拆分后 161 线（4.3.436）。
- **川越线 ODPT 数据归属修正**（2026-09-09）：按 ODPT 官方定义 JR-East.Kawagoe=川越线（川越-高丽川间）、JR-East.SaikyoKawagoe=埼京线・川越线（大崎〜川越・大宫〜川越含）。修正 odpt-unified.js LINE_RAILWAY_CODE——Kawagoe（大宫〜川越段）→SaikyoKawagoe（埼京线API）、KawagoeWest（川越〜高丽川）→Kawagoe；LINE_TO_OPERATOR 追加 KawagoeWest=JR-East。data-fusion.js posMap 匹配与 train-position-estimator.js 的 railway 过滤器改为 LINE_RAILWAY_CODE 反查（集合匹配）——防止川越〜高丽川的 Kawagoe 数据误配到大宫〜川越段、房总 ID 反转（Sotobo/Uchibo）的潜在误匹配也同时解消（4.3.437）。
- **川越线（川越〜高丽川）从 JA-JY 序列移出**（2026-09-09）：LOS 的川越线（川越〜高丽川）卡 order 由 19.1→22.1 修改——放在东京近郊通勤记号列（JA 1〜
- **多语言缺损修复・Freeze 例外**（2026-09-09）：韩语 ko 缺损全面修复（4.3.441）——①station_i18n.json 34 站（奥羽/羽越/陆羽/津轻等东北地方线车站）追加 ko 站名（日文音译规范：大馆→오다테、汤泽→유자와 等）。②LOS 系统卡 148/149 追加 nameKo（原仅多摩单轨 1 张；ko 界面系统卡全部回退日语）——日文音译+선 规范、括号/・保持（埼京线・川越线→사이쿄선・가와고에선、中央・总武线（各站停车）→주오・소부선（각역정차）等）。③railway_data.json lines 161 线追加 nameZh+nameKo（154 线从 LOS 映射沿用、LOS 外 7 线＝Shinetsu/TohokuMain/TokaidoMain/MarunouchiBranch/ChiyodaBranch/ChuoTatsuno/JobanMain 手工翻译）——解消 resolveLineName 的 zh/ko 回退（日语显示）。验证：站 ko 缺损 0、LOS nameKo 空 0/149、线 nameZh/nameKo 161/161、ko 界面浏览器实测系统卡/详情标题/站名均为韩语显示、console 0 错误。
- **实时内容的多语言化**（2026-09-09）：4.3.442 修复实时系 3 处缺损——①data-fusion.js 片端站 interval「东京方向」的日文「方向」残留于 zh/ko/en 界面 → translations 追加 status.toward 4 语言（en" bound for"/zh"方向"/ja"方向"/ko" 방면"）、data-state.js 新设 localizeInterval 并公开为 API、realtime 卡/模态的 interval 绘制改用。②trains-page.js 直通チップ「直通○○线」日文固定 → translations 追加 train.through 4 语言（en"Through "/zh"直通"/ja"直通"/ko"직통"）、_throughChipSize 使用 t。③语言切换后 interval 未重新融合、保持旧语言（DataState 仅重渲染）→ data-state.js 语言监听中先调用 DataFusion.refresh 重新融合后再 notify。验证：各键 4 语言×4 处、node --check 4 文件、ko 界面模态（운행 정보/정상/전 노선）与直通チップ（직통）实测、console 0 错误。
- **全页面全语言・实时正文的翻译**（2026-09-09）：4.3.443 实现「任何页面全语言（含实时）」——ODPT 日文运行信息正文用免注册的翻译 API 多语言化。①serve.py 追加 /api-proxy/translate 端点：MyMemory（官方公开・免注册・500 字符限制）主力 + Google gtx 端点兜底（尽力、自动化封锁时 catch 并回退原文）；白名单固定目标防 SSRF；服务器侧 7 日文本缓存（30 秒自动更新+多卡复用防止免费额度消耗）。②js/translate-service.js 新增（Provider: window.TranslateService）——按 currentLang 翻译动态日文文本、客户端二次缓存、ja 界面恒用原文、失败/离线时自动回退原文；翻译对象仅为动态文本（运行信息）、不触碰站名/线名（防止二次翻译改変）。③realtime-view.js 模态：运行信息正文/原因以译文为主显示 + 原文 details 折叠（摘要文案 4 语言内联）、片端/文本兜底区间（京急线内/取手〜上野站间 类）非 ja 界面自动翻译。④css/style.css 追加 .rs-cause-translated（pre-wrap 保持原文换行）+ .rs-cause-original 折叠样式。验证：curl 3 语言+缓存命中、浏览器 ko/zh 界面常磐线快速 notice 模态——正文/原因/区间均为对应语言、原文折叠可展开、console 0 错误。※Google gtx 从本环境会受自动化封锁，实际运行依赖 MyMemory（gtx 失败时回退原文）。
- **路线搜索 三模式＋费用＋种类・4.3.452**（2026-09-09）：route-search.js 三模式化——findRoute(from,to,mode) 以 MODE_PENALTY（combo 6 / duration 3 / transfers 1000 分的换乘惩罚、直通 0）参数化，实现换乘指引式的「推荐/最快/换乘最少」。search-ui.js 结果卡开头追加模式标签（search.mode.combo/duration/transfers、4 语言）、点击后改 currentMode 重新搜索（innerHTML 提交后再绑定——提交前绑定会因元素不存在而无效）。ride 段追加种类徽章（TRAIN_TYPE_BY_LINE 保守映射：ChuoRapid/Saikyo/Tokaido/Yokosuka 等→rapid、Yamanote/JobanLocal/ChuoSobuLocal→local、未映射不显示）与方向显示（search.direction「{s}方向/方向/bound for/방면」、由 direction 字段计算）。页头追加总费用（新 js/fare-estimator.js=window.FareEstimator：operator 别分组 JR-East/地下铁/私铁 的距离别票价阶梯、站间数×平均站距→km→概算、search.fare_tag「概算/参考/est./예상」注记）。验证：新宿→品川 combo=湘南新宿→横须贺 0 换乘 12 分 / duration=埼京→山手 1 换乘 8 分 / transfers=0 换乘 12 分（三模式分支正确）、新桥→池袋 ¥470 概算・种类「快速」・「新桥方向」显示、zh 界面 推荐/最快/最少换乘＋新桥方向＋参考、console 0 错误。票价是概算（数据冻结故无官方票价表）。
- **线上翻译失效・双路径修复**（2026-09-09）：4.3.443 部署到 GitHub Pages（biubiu52011.github.io）后模态运行信息仍是日文原文——原因：翻译端点仅存在于本地 serve.py（/api-proxy/translate），静态托管的线上 404 → 回退原文。诊断：确认 MyMemory 带 Origin 也返回 200 + Access-Control-Allow-Origin: *（浏览器可直连）；但本地沙箱浏览器到该域名的访问被网络出口阻断（no-cors 也 Failed to fetch、ODPT 外域正常）＝沙箱环境固有限制、用户实环境不受影响。4.3.444 中 translate-service.js 双路径化——①本地 /api-proxy/translate 优先（服务器侧 7 日缓存）、②代理不可用（线上 404/网络错误）时 MyMemory 直连（CORS 允许・免注册・结果客户端缓存）、③全部失败回退原文。验证：语法 OK、本地路径代理优先无回归、MyMemory 带 Origin 实测 200+ACAO:*。※沙箱浏览器无法实测 MyMemory 直连，需用户在实环境确认。
- **丸之内线支线的实时部署・Freeze 例外**（2026-09-09）：丸之内线支线（MarunouchiBranch 方南町支线）不单独生成、维持丸之内线体系集成状态部署实时数据（4.3.446）。①odpt-unified.js LINE_RAILWAY_CODE 追加 Marunouchi→Marunouchi / MarunouchiBranch→MarunouchiBranch（ODPT 以 TokyoMetro.MarunouchiBranch 独立 railway 发布、反查集合匹配使共用站 中野坂上 的列车正确归属支线侧）。②LOS 丸之内线卡 lineIds=["Marunouchi","MarunouchiBranch"]——系统卡整合支线（不独立成卡）、数据保持 branchOf 嵌套（规则二）。③train-icons.js 追加 MarunouchiBranch=2000系（与本线同车辆、防误 fallback 山手线 E235）。④trains-page.js 支线融合——computeRouteGeometry 追加 branchGeom（支线站列坐标 bx=junction.x+20+70*idx）、renderTrainMap 中 svg.__branchGeom 保持、getRealtimePositions 将 branchOf 子线列车以 fusionLineId 并入本线详图、updateTrainLayer 以 branchGeom 坐标绘制支线列车（与主线保持距离）。⑤data-fusion.js 时刻表按需加载（loadMissingTimetables）将 linesNeedingTimetable 追加支线（line.branches）、toLoad 上限 12→24——确保获取支线时刻表（ODPT TokyoMetro.MarunouchiBranch 658 件）（4.3.447）。⑥4.3.448 支线绘制样式统一为主线——支线站标签原为独立简略绘制（12px/#666）改为主线站相同的 16px/#555/500、支线名改为 14px（全支线共通代码故 1 处修改反映全部支线）。⑦4.3.449 详图的站・换乘・直通绘制统一——renderTrainMap 的主线站循环与支线站循环收敛到新设统一函数 `_renderStationNode(staticLayer, svgNS, o)`。主线/支线的区别仅保留在 geometry（坐标・side・色・branchGeom），站圆・标签（16px/#555/500）・换乘チップ・直通チップ全部走全站共通路径（支线站以 tx/ty/anchor 覆盖为 bx+6/bsy+3/start、分岐站 bsi=0 仅 skipTx 防换乘重复）。验证：丸之内线详图支线站标签与主线站同一样式、山手线 95 换乘图标・横须贺线直通チップ（直通湘南新宿线等）照常绘制、节点语法 OK。
- **直通列车的车辆形式・Freeze 例外**（2026-09-09）：确认 ODPT 列车位置（odpt:Train）没有车辆形式字段（字段仅 trainType 运行种类・carComposition 编组数）——直通列车的车辆以车号规则识别为方针。4.3.450 中 train-icons.js 追加 THROUGH_SUFFIX_RULES——京叶线上 E 结尾车号＝武藏野线直通（E231系0番台）、武藏野线上 Y 结尾＝京叶线直通（E233系5000番台）——JR 社内直通（京叶↔武藏野）的直通车按车籍显示。验证：京叶线详图 E 号=E231系0番台・Y 号=E233系5000番台 共存、节点语法 OK。
- **常磐线各站停车默认车辆变更订正（4.3.452）**（2026-09-09）：4.3.450 中执行的常磐线各站停车（JobanLocal）默认车辆变更（18000系→E231系0番台）为误，撤回——维持 2026-09
- **开源翻译方案调研・离线模板引擎最终打磨**（2026-09-09）：调研结论——浏览器端离线 NMT（OPUS-MT 无 ja→zh/ko 模型、NLLB/M2M-100 200-600MB 与加载性能冲突）、Chrome/Edge 内置 Translator API（Chrome 147 实测 canTranslate 仍不可用）、LibreTranslate（需自托管后端、GitHub Pages 无法承载）、Google gtx 网页端点（数据中心出口被反爬拦截）均不可行；业界/开源无"免费无额度、免注册、线上可用、加载快、覆盖 ja→zh/ko/en"的现成方案，离线模板引擎为当前约束下最优解。4.3.445→450 打磨：①模板顺序修正——恢复运行（"暂停ていましたが…再開"）模板前置、避免被運転見合わせ误匹配（东北本线恢复运行回归 normal）。②词级替换重写——出现位置收集+长词优先+区间去重、防止连锁替换（"上下线"→"上下行线"后被"上下"再命中成"上下行行线"）；允许空串删除助词（の/を）。③站名候选来源扩展——getStations 实体 + 全线站表 + 换乘站合并收集（長野原草津口/大前/千倉等仅有 i18n/线路引用、无站实体的站也覆盖）；数据未就绪时不缓存避免空缓存污染。④_normTime 增加 lang 参数（ko 界面"19:10경"）。⑤serve.py 删除 4.3.443 /api-proxy/translate 端点、js/translate-service.js 删除（API 方案废弃清理、realtime-view.js 全部改走 DelayTranslator）。验证：12 个全量真实样本（zh/ko）全部模板命中、站名/线路/原因全替换、时间规范化正确、console 0 错误。
- **file:// 双击打开搜索不可用修复・4.3.453**（2026-09-09）："无法读取路径"根因=双击 home.html 时 fetch 被 CORS 阻断（file:// protocol），db-loader 抛 "No data source available under file:// protocol"，RailwayDB 为空、搜索完全失效。修复：①新生成器 data/core/gen-file-data.js（node data/core/gen-file-data.js）把冻结 JSON（railway_data.json/station_i18n.json/tourism_data.json）序列化为 script 可加载的 .file.js bundle（railway-data.file.js=window.RAILWAY_DATA / station-i18n.file.js=window.RAILWAY_I18N / tourism-data.file.js=window.RAILWAY_TOURISM，含 </script 转义）——JSON 仍是唯一真源，bundle 是派生副本；②db-loader.js file:// 分支改为 loadFileBundles（顺序 <script> 注入 3 bundle，<script src> 不受 CORS 限制）后 applyData(RAILWAY_DATA, RAILWAY_I18N)+applyTourismData(RAILWAY_TOURISM)——补齐原分支缺失的 i18n/tourism；③HTTP 下不加载 bundle、fetch 路径不变（回归零）。验证: file:// 双击 162 线・北千住→池袋 14 分・¥370 概算・观光 32 处・resolveStationName 正常・console 0 错误；localhost 5 组搜索回归通过。※改 JSON 后须重跑 gen-file-data.js（AGENTS.md 已记录生成命令）。

- **半蔵門线直通列车按车号前缀判定车籍・4.3.453**（2026-09-09）：实测确认车号前缀与车籍系统一致（半蔵門线 ODPT 时刻表 994 件：B 前缀 492 件起点全部为東武侧＝南栗橋/久喜/東武動物公園/押上、A 前缀 502 件起点全部为東急侧＝中央林间/長津田/二子玉川）。train-icons.js 追加 THROUGH_PREFIX_RULES（Hanzomon: B→東武50000系、A→既定東急2020系），getTrainIcon 按前缀→后缀（京葉 E/武蔵野 Y 维持 4.3.450）顺序判定。trainId 对应「車号_站idx」与「lineId_車号_站idx」两种形式（車号＝倒数第 2 个 token）。验证: 半蔵門线详情图 B 号=東武50000系・A 号=東急2020系 共存、京葉线 E/E231系0番台・Y/E233系5000番台 无回归。
- **ODPT railway ID 映射全面修正・4.3.470**（2026-09-10）：将 22 个 operator 的 odpt:Railway API 全量（178 ID）与本地 161 线对比——JR 系全数命中（湘南新宿/横須賀・総武 JO 分离/常磐 3 粒度/川越双切点/房総反转/支线帰属全部正确），但私铁系的 LINE_RAILWAY_CODE 与 ODPT 官方 ID 命名不一致、维持默认透传 404 的 25 件已修正。①LINE_RAILWAY_CODE 追加/修正 24 件——京急 5（Keikyu→Main・KeikyuAirport→Airport・KeikyuKurihama→Kurihama・KeikyuZushi→Zushi・Daishi_Keikyu→Daishi）、京成 4（Keisei→Main・KeiseiChiba→Chiba・KeiseiKanamachi→Kanamachi・KeiseiOshiage→Oshiage）、西武 9（Hamura→Haijima（拝島线！本地 ID 为终点站名误命名）・Seibu_Sayama→Sayama・SeibuEn→Seibuen・SeibuShinjuku→Shinjuku・SeibuTamagawa→Tamagawa・SeibuTamako→Tamako・SeibuToshima→Toshima・SeibuYamaguchi→Yamaguchi・Yurakucho_Seibu→SeibuYurakucho）、小田急 2（OdakyuEnoshima→Enoshima・OdakyuTama→Tama）、相鉄 1（SotetsuShin-Yokohama→SotetsuShinYokohama）、東京モノレール 1（TokyoMonorail→HanedaAirport）、埼玉新都市 1（NewShuttle→SaitamaRailway）、東北地方线 2（Kamiishi→Kitakami・Sanriku→Yamada——本地 ID 本身误命名（北上线/山田线），映射层先垫 ODPT 官方 ID，改名等待 Freeze 例外）。②LINE_TO_OPERATOR 修正 1 件（NewShuttle: SaitamaTransit→SaitamaRailway）。③ODPT 中真正不存在的 2 线（MinatoMirai 港未来线・KeiseiChihara 京成千原线）接受无实时（LOS 卡片继续静态显示）。验证: 命中 134→159/161、剩余不整合仅港未来・千原 2 件、node --check OK、data-fusion/train-position-estimator 的 LINE_RAILWAY_CODE 反查集合匹配为动态读取、追加映射自动适用（消费者变更零）、其他文件的旧 ID 引用均为本地 line ID（冻结层）故无影响。
- **景点详情页首入语言修复**（2026-09-09）：tourism-detail 页从旅游页进入后首屏固定日语，需再点一次语言按钮才变对——根因: 模块级 `var lang = window.currentLang || 'ja'` 在脚本加载时快照（此时 lang-init 尚未初始化，恒为 ja），首次渲染用该闭包变量；点语言按钮才触发 onLanguageChange 刷新。修复（4.3.451）: init 首行刷新 `lang = window.currentLang || 'ja'`（渲染前），translateUI/renderArticle 及 getSpotName/getStationLabel 等全部立即用对语言。全局排查确认其他页面（realtime-view/sightseeing/search-ui/trains-page/data-state/history/route-search/translations）均为函数内实时读 currentLang，无模块级快照问题。验证: ko/zh 界面带真实跳转参数直接打开详情页——currentLang 正确、全文对应语言、无日文假名残留、无需再点语言按钮。

- **3 个 line ID 正名・4.3.471、Freeze 例外**（2026-09-10）：将 4.3.470 在映射层垫的 3 个误命名 line ID 改为本名（railway_data.json 冻结层 + 全库引用同步）。①Hamura→Haijima（西武拝島线——旧 ID 为终点站名 Hamura/羽村 的误命名、正确为拝島站 Haijima）: lines key/nameEn（Hamura Line→Haijima Line）、终点站 Hamura→Haijima、lineStationOrder、transferStations 5 件（Kodaira 2 系统・Ogawa 3 线）、stationLines[Haijima] 追加 Haijima。②Kamiishi→Kitakami（JR 北上线——旧 ID 为路线名误写、正确为北上）: 首站 Kamiichi/上市 误引用→Kitakami/北上 修正、transferStations 1 件（OuMain Yokote）、stationLines[Kitakami] 追加 Kitakami。③Sanriku→Yamada（JR 山田线——旧 ID 与三陸鉄道混同、正确为山田线）: transferStations 2 件（Tazawako/TohokuMain Morioka）。④幽灵站清理: 删除 stationLines/i18n 的 Hamura（羽村重复、正确为 Hamu）・Kamiichi（上市），name_map 羽村→Hamu。⑤同步: odpt-unified.js（LINE_TO_OPERATOR 3 key 改名 + 删除 LINE_RAILWAY_CODE 的 3 个垫片——Haijima/Kitakami/Yamada 同名透传即可 ODPT 命中）、line-operation-systems.js（3 卡片 lineIds + SAN nameEn Sanriku Line→Yamada Line）、train-icons.js（Hamura→Haijima・Kamiishi→Kitakami キハ110系）。⑥JSON 以文本级精确替换实施（json.dump 全量重写会因浮点数 35.7900→35.79 产生 590 行伪 diff，不可用，弃用 rename_lines.py 的 json.dump 写法），改后重跑 `node data/core/gen-file-data.js`。验证: ODPT 命中 159/161 不变（3 线透传命中）・全库一致性错误仅 2 件（Keisei lineStationOrder 42≠43 与 TobuNoda 残留——均为既有・非本次引入）・旧 ID 残留 0（i18n Hamu.en=Hamura 的羽村罗马字 2 处正确保留）・node --check 全过。

- **图库整理后的车辆图标映射更新・4.3.457**（2026-09-09）：images/列车/ 按命名规则（型番系/形 + 涂装用途括弧）整理更新为 159 文件，因此更新 train-icons.js 的映射（先确认型番）——ChiyodaBranch→05系（北綾瀬）.png（北綾瀬支线专用车、db-loader.js LINE_IMAGE_FIXES 同步改名追随）、Chiyoda→16000系.png（千代田线本线主力）、JobanRapid→E231系常磐LED.png（常磐线快速主力）、TobuTojo/Tojo→60000系.png（東上线現主力、90000系亮相后即启用）、Keisei系→80000形.png（京成本线系新主力、3200形退役中、NaritaAccess/SkyAccess 维持 AE形）、TokyoMonorail→mn-tky10000.png（10000形现役）、TWR/Rinkai→twr71000.png（71-000形现役）、NipporiToneri/Nippori_Toneri→toky330.png（330形实车图）、ExpTobu きぬ・けごん・日光→100系（スペーシア）.png（涂装）、ExpJREast 追加 Nikkoku 特急日光・きぬがわ（253系）。验证: 断链 0・浏览器实测映射值正确。未接入（数据中无线/重复/旧型）: 北総 9200形・江ノ島電鉄・箱根登山 1000形・千葉都市モノレール 1000形（线已删除）、相鉄 10000/11000系・都営 todn- 別名・TX 1000系/3000系・東武 10000/30000系 等留在图库。

- **都电・新型号漏接补接・4.3.458**（2026-09-09）：补接 4.3.457 漏掉的新素材——Arakawa（都電荒川线）→todn8503.png（都電8500形）、NaritaAccess/NaritaSkyAccess→3900系.png（スカイアクセス线的普通列车）＋新设 ExpKeisei 以 typeMatch 判定スカイライナー（AE形）（Skyliner→AE形/Rapid・Local→3900系 实测）、SotetsuShin-Yokohama→11000系（新涂装）.png（相鉄新横浜线主力）、Odawara→5000系.png（小田急5000形 2025 年新型）、TsukubaExpress→tx3000.png（TX-3000系、OPERATOR/LINE 两方）。NaritaAccess 为数据中不存在的旧 ID（留在 LINE_ICONS）。未衔接: todn8903（已代表采用 8500形 故为预备）、東急6021系（6020系2次车・外观相同）、小田急2000形/8000系・相鉄10000系/8000系・京成3200形・JR 211系甲信越/701系仙台/E127系100番台/E501系/E655系・TX旧型・mn-tma编组别・todn100f/todn5500（旧型/同型别名/无衔接目标）——留在图库。数据中无线: 北総9200形/江ノ島電鉄/箱根登山1000形/千葉都市モノレール。
- **详情图列车的终点・方向标签・4.3.454**（2026-09-09）：在详情图显示直通・推定列车的终点与方向。①数据层——posMap（实位置）与推定器 positions 两方都追加 destinationStation（odpt:destinationStation 的末段 ID）。②描画层——updateTrainLayer 为各列车附加 2 行标签（上＝方向 ▶+railDirection 端点站名 7px/#999、下＝终点站名 8px/#666，data-train-label-for），随图标移动追踪、列车消失时同一 uid 清理。③站名正規化——ODPT 的无连字符 ID（KiyosumiShirakawa）与项目的带连字符 ID（Kiyosumi-Shirakawa）以「去连字符+小写」突合解决显示名（直通终点 南栗橋/久喜/東武動物公園/中央林间 等也正确显示）。验证: 半蔵門线 B 号=東武50000系+▶渋谷/中央林间・長津田、A 号=東急2020系+▶押上/押上・南栗橋・久喜、京葉线 ▶Inbound/東京、E/Y 車号规则无回归。※中央林间（ChuoRinkan）在项目中无站实体、仅 i18n 引用（東急田園都市线缺失另计）。

- **都電荒川线的实时部署・4.3.459**（2026-09-09）：API 线路 ID=Toei.Arakawa / 日文名=都電荒川线。稼働确认结果发现并修正 **ODPT 时刻表缓存的压缩缺陷**——compressTimetable 只保存 stop 的 `odpt:station`，但现行 ODPT 以 `odpt:departureStation`/`odpt:arrivalStation` 返回，因此缓存解冻后全部 stop 的站为空→时刻表推定位置全线为 0（都電荒川线 879 条・23041 stop 全灭）。修正: 压缩时对 station/departureStation/arrivalStation 三种作 fallback，解冻时恢复 departureStation/arrivalStation，缓存键 odpt_timetable_cache_v1→v2 升级（旧空站缓存强制失效）。Arakawa 无需追加专用映射（LINE_RAILWAY_CODE 未定义时以 self-match fallback＋站名匹配即可工作）。验证: 缓存未命中（API 新增获取）时 pos=11、命中（v2 解冻）时同样 pos=11・详情图 trainLayer=11・图标=todn8503（都電8500形、4.3.458 映射）。同时首次提交 4.3.457/458 开始引用的新增图像素材（todn8503/todn8903/toky330/tx3000/mn-tky10000/twr71000/mn-tma*/todn100f/todn5500/横浜高速鉄道 yok*）（此前未追踪、线上有 404 风险）。

- **Toei odpt:Train 有效化・4.3.468**（2026-09-10）：按 ODPT URL 实测确认 Toei 的 odpt:Train 有返回（浅草/新宿/三田/大江戸、深夜 0:26 也有 26 件）——此前代码侧 ODPT_ENDPOINTS["Toei"].train=null 未获取，因此有效化 train 端点。验证: ODPT_TRAIN_POSITIONS["Toei"]=25、Asakusa pos=4・Oedo 8・Shinjuku 5・Mita 4 全部 estimated:false（真实实时位置）、详情图绘制列车。**但都電荒川线（Arakawa）不在 Toei 的 odpt:Train 内**（25 件全为地铁线）——都电的 ODPT 不提供 Train 实时位置，因此荒川线维持时刻表推定（estimated:true）。
- **方向标签改为朝向行进方向・4.3.455**（2026-09-09）：将列车的方向箭头指向行进方向——比较方向端点站名在站表中的 index 与当前位置（端点在下方＝▼ 图标朝下、在上方＝▲ 图标朝上）。Inbound/Outbound 按起点/终点方向判定上下（Inbound=▲、Outbound=▼）。环线 Inner/Outer 等无法判定故固定 ▶。▼ 时终点标签下移 1 行避免重复，标签追踪也随移动方向重新布置。验证: 半蔵門线 A 号（押上方向）=▼下・B 号（渋谷方向）=▲上、京葉线 Inbound/Outbound 语义判定。---

- **推定数据提示方式变更・4.3.469**（2026-09-10）：重新设计详情图推定线的提示。①容器内不显示「时刻表で推定中...」（trains.no_data、positions=0 时显示的 tp-no-data 块）——推定数据随页面加载一起初始化，容器内与实时同一外观（废止 .train-icon.estimated 的 opacity 0.65 半透明，统一 opacity 1）。②数据为推定来源时在容器外（.tp-map-wrap 之后、下方中央）标注 `*数据は时刻表からの計算`（.tp-est-note、trains.estimated_note 加 4 语言: zh=*数据来自时刻表计算 / ja=*时刻表计算的数据 / en=*Data calculated from timetable / ko=*시간표 기반 계산 데이터）。③判定: 该线路的 realtimePositions 中存在 1 个以上 estimated:true 就显示标注（仅实时位置的线路不显示）。实现: trains-page.js 新设 updateEstimatedNote(el, positions)，从增量・全再构建两条路径调用（幂等）。验证: Nippori_Toneri（6 辆全推定）容器内无 noData・标注 zh「*数据来自时刻表计算」/ ja「*时刻表计算的数据」・全图标 opacity 1，Yamanote（17 辆实时）无标注。
- **环状线的方向标签・4.3.456**（2026-09-09）：环状线（山手线等）的 InnerLoop/OuterLoop 按语言本地化（内环/外环、内环/外环、Inner/Outer、내선/외선），无上下箭头・不显示终点标签（ODPT 环状线的终点是大崎等折返点、并非实际终点）。基点方向词 Northbound/Southbound/Eastbound/Westbound 也改为北行/南行/东行/西行（4 语言）。验证：山手线 28 车=内环/外环无终点、274M=▶北行/新宿、半藏门线 ▲涩谷/▼押上 无回归。※确认相铁直通（SotetsuDirect）列车误匹配山手线 posMap 的既有问题（因 Osaki 共用站）——列入 Known Debt（待定）。
- **景点详情页地图换简洁底图・4.3.459**（2026-09-09）：OSM 官方 embed（mapnik）信息过杂，改用简洁底图——方案: Leaflet（业界标准，本地化以满足 CSP script-src 'self'）+ Carto Positron 浅色极简底图（免费无 key，仅灰白底+主干道路，无 POI 噪音）。改动: ①curl 下载 leaflet@1.9.4 到 js/leaflet/leaflet.min.js（147KB）+ css/leaflet/leaflet.css（14.8KB，新目录需纳入 git）；②tourism-detail.html CSP img-src 追加 https://*.basemaps.cartocdn.com（瓦片走 img 标签，无需 connect-src），head 注入 leaflet.css、body 注入 leaflet.min.js（tourism-proximity 之前），页面全量 v=4.3.459；③tourism-detail.js initMap 由 OSM iframe 重写为 L.map + L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png')（subdomains abcd、maxZoom 20、attribution OSM+CARTO），zoomControl:false（手势缩放）、scrollWheelZoom:false（防滚动劫持）、divIcon 像素风绿点 marker（.td-map-marker-dot 13px #008803+白边+阴影，无外域图片依赖）、popup 显示景点名、mapEl._tdLeaflet 缓存实例以在切换景点/语言时 remove 防重复初始化、setTimeout invalidateSize 修正挂载后尺寸；④tourism-styles.css .map-container 圆角 8→12px + 柔和阴影，新增 .leaflet-container 底色/.td-map-marker*/.map-error（Leaflet 缺失时兜底文案 detail.unavailable）。验证（浏览器 DOM 实测，不用截图）: 瓦片 6/6 全加载（retina @2x）、marker/popup（LUMINE 北千住）正常、attribution 正确、zoom 控件无、OSM iframe 已移除、ko/zh 重载后地图重建无重复实例、console 0 错误。※CSP 仍只放行 self + Carto 瓦片域，未引入任何外域脚本。
- **景点地图底图演进 4.3.460→461**（2026-09-09）：Carto light_all 英文地名标签与多语言界面不协调——①4.3.460 试 light_nolabels（无文字版）：Carto 语言变体 light_ja/zh/ko/en 已废弃全 404、OpenFreeMap raster 403/404 不可用，仅 light_nolabels（200）可达；但用户实测"找不到位置"→ ②4.3.461 换回 light_all。Wikimedia osm-intl 实测 403（需 UA/已限制）不可用。
- **MapTiler 接入・4.3.462**（2026-09-09）：接入 MapTiler（wiki.openstreetmap.org/wiki/MapTiler），在浏览器登录态下授权创建 key：name=pixel-tetsudo、Allowed user-agent header=pixel-tetsudo-static、Allowed HTTP Origins=biubiu52011.github.io/localhost/localhost:8017/127.0.0.1:8017（格式必须无协议，带 https:// 报 Invalid）。Key=tYRNv4akrEAKTL5ORzUm（20 字符完整，frontend key 模式靠 origin 防盗用；免费层 10 万请求/月，超限当月停服）。tourism-detail.js initMap 瓦片层改 MapTiler Basic 极简样式: 'https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=' + MAPTILER_KEY + '&language=' + langMap[currentLang]（ja/zh/ko/en，中文界面中文地名），tileLayer crossOrigin:'anonymous'（MapTiler origin 校验需浏览器带 Origin 头）、maxZoom 19；tileerror 兜底自动移除 MapTiler 层回退 Carto light_all（key 失效/额度超/校验异常时地图不空白）；MAPTILER_KEY 常量声明在 IIFE 顶部（key 属前端可公开，靠 origin 白名单防盗）。tourism-detail.html CSP img-src 追加 https://api.maptiler.com。验证: 浏览器实测 ko 界面 6/6 瓦片 language=ko、zh 界面 6/6 language=zh、loadedOK 全过、console 0 错误（curl 带 Origin 仍 403=UA 校验差异，浏览器 UA 通过，以浏览器实测为准）。※origin 规则变更需 5 分钟生效；创建时用 JS 直改 textarea.value 会绕过 React state，本 key origins 实际保存成功（页面回读确认）。
- **临海线站点坐标订正・Freeze 例外**（2026-09-18，4.3.841）：用户报告"临海线站点缺少坐标"。对照 TWR 官方 GTFS（项目根目录 twr-gtfs.zip 的 stops.txt，仅读取未改动）核验临海线（Rinkai）8 站——3 站坐标错误/缺失：①第 3 站被误登记为幽灵站 Tokyo-Showa-Center（i18n=东京昭和纪念馆，坐标误为东京站 35.68111111,139.76666667，偏移约 5km），实际应为国际展示场 KokusaiTenjijo（官方 35.63457,139.79163）——lines.Rinkai.stations[2] / stationLines / lineStationOrder.Rinkai 改键，幽灵实体在 stations / station_i18n / tourism station_exits 三处清除；②新木场 Shin-Kiba 坐标 35.6606,139.8253 偏移约 1.6km，订正为官方 35.64604,139.82678；③东云 Shinonome 坐标 35.6378,139.7978 偏移约 570m，订正为官方 35.64060,139.80328；④tourism station_exits 同步（Shin-Kiba 北口 / Shinonome 駅前 / KokusaiTenjijo 駅前）；⑤顺带清除连字符孤儿实体 Kokusai-Tenjijo（stations / i18n / station_exits；name_map 与别名表 "Kokusai-Tenjijo": "国際展示場" 属罗马字别名保留）；⑥i18n 订正——KokusaiTenjijo zh/ko 错字（国際展示场→国际展示场、코쿠사이테ㄴ지조→코쿠사이텐지조）、Tokyo-Teleport 名称被误写为百合海鸥线 テレコムセンター（订正为 ja=東京テレポート / zh=东京电讯站 / en=Tokyo Teleport，ko 维持）。Oimachi 现有坐标（35.60681,139.73499）与官方差约 70m，在容差内不改；Kokusai-Tenjijo-Seimon（国際展示場正門）仅 i18n 引用、无关临海线，不动。实施：JSON 以文本级精确替换（railway 7+/15-、i18n 5+/17-、tourism 7+/14- 行，无浮点伪 diff），改后重跑 node data/core/gen-file-data.js（bundle 全量同步——此前 railway-data.file.js 已落后 JSON 约 143KB、缩进 1 空格 vs 现行 2 空格，本次一并对齐）。验证：临海线 8 站全部有真实坐标且与 GTFS 一致、Rinkai 链路（stations/stationLines/lineStationOrder）一致、Tokyo-Showa-Center / Kokusai-Tenjijo 残留 0、JSON 解析 OK、node --check 3 bundle OK、name_map 别名保留。
## 显示身份规则（Display Identity Rule）
RailwayDB.resolveLineName / resolveStationName / tOp 是**唯一**允许的显示名路径。
绝不需要实现第二个解析器。绝不需要在用户可见输出中直接使用 line.name / line.nameJa / line.nameEn。

---

## 三层数据架构规则（Three-Layer Data Architecture Rule）
项目使用三个有意的层级。**不需要合并它们**：
| 层级 | 归属 | 职责 |
|-------|-------|---------------|
| UNIFIED_LINES | db-loader.js | 原始规范线路对象（DataFusion 输入） |
| DataLayer | data-layer.js | 运行时缓存（positions、分组访问） |
| RailwayDB | db-loader.js | 规范查询 + 显示身份（i18n） |
每层有明确的职责。按正确的关注点使用正确的层。

---

## 无孤儿迁移规则（No Orphan-Generating Migration Rule）
将能力从模块 A 迁移到模块 B 时：
1. 找出 A 的全部消费方
2. 将每个消费方迁移到 B
3. 验证每个消费方与 B 正常工作
4. **然后才**移除 A
5. 移除后执行全局孤儿清扫
消费方仍在引用时，绝不需要删除 Provider。

---

## 只读优先规则（Read-Only First Rule）
每个评审/审计阶段都以只读分析开始。只有在明确批准后才修改代码。

---

## 模块主心规则（Module Main-Heart Rule）
每个页面有且仅有一个主心：
| 页面 | 主心 |
|------|-----------|
| Home | 路线搜索 |
| 路线搜索 | 我怎么去？ |
| 实时 | 现在能坐这条线吗？ |
| 线路详情 | 这条线是什么？ |
| 历史 | 我之前搜过什么？ |
| 观光 | 目的地有什么值得逛的？ |
任何模块不得劫持另一个模块的主心。

---

## 发布门规则（Release Gate Rule）
打版本标签前：
1. 运行预检（Preflight）：git 状态、规范数据、脚本完整性、Provider 健康
2. 如果架构演进，先更新系统优先变更规则
3. **先提交规则更新，再打标签**
4. 在新提交上打标签（不是旧 HEAD）
5. main 分支与标签一起推送

---

## 运行契约（Runtime Contract）
- 规范数据由 db-loader.js 通过 `fetch` 加载（railway_data.json / station_i18n.json / tourism_data.json）。
- `file://` 协议会阻断 fetch（CORS），因此双击打开页面**无法工作**。项目必须通过 HTTP 服务：
 - `python serve.py`（本地静态服务器 + `/api-proxy/` 官方 API 代理，4.3.405 起替代 `python -m http.server 8017`），然后打开 `http://localhost:8017/pages/home.html`
- **官方源代理（4.3.405）**：ODPT 未提供运行状况的线路（小田急 3 线/百合海鸥号）由 `data/api/official-railway.js`（window.OfficialRailway）经本地代理抓取官方 API——小田急 `d6oynijiy33tb.cloudfront.net`（x-api-key 公开 key）、百合海鸥号 `cms-2.yurikamome.co.jp/api/operation/`（无 key）。两个官方 API 均无 CORS 头，浏览器必须经 `serve.py` 的 `/api-proxy/` 白名单端点转发（防 SSRF）。DataFusion 融合优先级：official（按 line.id）> ODPT > localStatus > fallback。
- 数据加载成功信号：console 输出 `509 stations, 159 lines, 94 tourism stations`。
- 唯一入口页面是 `pages/home.html`。不需要在其其他地方创建或恢复第二个 home.html。


---

# 附录 B 线路图设计规定（LINE-DIAGRAM-SPEC，原 LINE-DIAGRAM-SPEC.md）

> 版本：v1.0（草案，待用户确认）
> 日期：2026-09-11
> 适用范围：所有线路图视觉元素——trains 详情页 SVG 线路图、线路卡片、状态徽章
> 单一事实来源：本规范 + `js/trains-page.js` GEOM 令牌 + `css/style.css` 设计变量
> 数值现状来源：trains-page.js / style.css 实采（代码行号已标注，改动后需同步）

---

## 1. 字体体系

### 1.1 字体族（全局唯一）
| 项 | 值 | 来源 |
|---|---|---|
| 主字体 | `'Fusion Pixel'`（像素字体） | style.css @font-face |
| 语言包 | 拉丁 / 日文 / 简体中文 / 繁体中文 / 韩文（5 个 ttf） | style.css |
| 回退 | `'Courier New', monospace` | style.css body |
| SVG 站名/支线名 | 显式 `'Fusion Pixel', 'Courier New', monospace`（v4.3.498 起，原 sans-serif） | trains-page.js 934/1320 |

### 1.2 字号刻度（两套体系）
**A. CSS 设计令牌**（页面 UI）：
| 令牌 | 值 |
|---|---|
| `--font-xs` | 10px |
| `--font-sm` | 11px |
| `--font-md` | 13px |
| `--font-lg` | 14px |
| `--font-xl` | 16px |

**B. SVG 线路图内字号**（trains-page.js）：
| 元素 | 移动 | 桌面 | 来源 |
|---|---|---|---|
| 站名（普通/换乘/顶底，统一） | 16 | 16 | 928-932 |
| 换乘 chip 标记字号 | 12 | 10 | 408 |
| 延伸段线名 | 12 | 12 | 804 |
| 支线名 | 14 | 14 | 1318 |
| 方向文本（ldir） | 8 | 8 | 1675 |
| 直通时刻 | 11（compact 9） | 6 | 1082 |
| "+n" 溢出标记 | 7 | 7 | 1096 |

### 1.3 字重与颜色
| 元素 | 字重 | 填充色 | 来源 |
|---|---|---|---|
| 换乘站站名 | 700 | 线色 | 933/935 |
| 普通站站名 | 500 | `#555` | 933/935 |

### 1.4 站名自适应（clamp）
- 站名超宽时**缩小字号**（shrink, never clip），下限 **10px**（v4.3.504：原 12 下调——六形环左列上方站名在 58px 环内窄空间需 10px 完整放下，5 字=55px 恰好贴右列圆点左缘）。
- 可用宽度由 `data-clamp-avail` 计算（环线/侧列各有官方，见 6.3）。

---

## 2. 几何尺寸体系（GEOM 设计令牌）

### 2.1 设计令牌表（trains-page.js 26-35）
| 令牌 | 值 | 含义 |
|---|---|---|
| `BRANCH_COL_W` | 96 | 支线列宽（站名 16px 最长 6 字 + 换乘 chip 余量） |
| `BRANCH_STUB` | 20 | 主线 → 支线水平引出长度 |
| `MAIN_BASE_W_MOBILE` | 410 | 移动端基准画布宽 |
| `MAIN_BASE_W_MIN` | 440 | 桌面画布宽下限 |
| `MAIN_BASE_W_MAX` | 820 | 桌面画布宽上限 |

### 2.2 环线宽度（标准宽度，2026-09-10 定稿）
| 项 | 值 | 说明 |
|---|---|---|
| 环宽基准 `rectW` | **48** | 山手线双列 + 六形环圆环部分统一（4.3.495/496） |
| 移动端环宽 | 72px（48×1.5） | |
| 桌面端环宽 | 76.8px（48×1.6） | |
| 画布宽 `svgW` | `rectW + 150×scale`（派生式） | 两侧站名空间恒定 75×scale |

### 2.3 缩放系数
| 场景 | 移动 | 桌面 | 来源 |
|---|---|---|---|
| 六形环几何 `scale6` | 1.5 | 1.6 | 532 |
| 站名/标记内 `_sc6` | 1.5 | 1.3 | 941-944 |
| 山手线双列 `loopScale` | 1.5 | 1.6 | — |

---

## 3. 车站节点规格

### 3.1 圆点（统一渲染函数 _renderStationNode）
| 元素 | 半径 | fill | stroke | 线宽 | 来源 |
|---|---|---|---|---|---|
| 普通站 | r=**7**（v4.3.499 放大，原 4） | 线色 | `#fff` | 2 | 907-910 |
| 换乘站（junction） | r=**12**（v4.3.499 放大，原 7） | `#fff` | 线色 | 2.5 | 907-910 |

站名偏移随圆点联动（v4.3.499）：普通站水平 10 / 换乘站水平 14（均 ≥ r+2）；top 普通 y-10 / 换乘 y-14；bottom 普通 y+15 / 换乘 y+19；换乘 chip 下移（ty+11 junction / ty+7 普通）。验证：相邻站/环线双列/六形环/tail 列均无冲突，左列站名空间仅 -2px。

### 3.2 直通标记（列车直通箭头）
| 元素 | 值 | 来源 |
|---|---|---|
| 外圈 | r=8 | 1494 |
| 内圈 | r=3 | 1502 |

---

## 4. 线路与线宽

| 元素 | 线宽 | 透明度 | 来源 |
|---|---|---|---|
| 主线 | 5 | 1.0 | 633 |
| 环线外框（标准环） | 5 | 0.35 | 737 |
| 六形环结构线 | 3/5 | 1.0/0.35 | 633-664 |
| 延伸段 | 4 | 0.5 | 794-800 |
| 支线 | 3 | 1.0 | 1282-1294 |
| 并行线 | 3 | 0.55 | 822 |

---

## 5. 图标体系

### 5.1 换乘图标（trains 详情 chip）
| 项 | 移动 | 桌面 | 来源 |
|---|---|---|---|
| 图标尺寸 ICON | **16**（v4.3.497 统一，原 20） | 16 | 969 |
| 图标间距 GAP | 2 | 2 | 970 |
| 每行上限 | 4（窄列自适应降为 3/2） | 4 | 971/998 |
| 行数上限 | 2 | 2 | 972 |
| 溢出显示 | "+n" | "+n" | 989 |

**对齐规则（v4.3.501）**：换乘图标块必须有一边与站名文字侧边对齐——站名在圆点右侧（anchor=start）→ chip 左缘=文字左缘（ix0=tx）；站名在左侧（anchor=end）→ chip 右缘=文字右缘（ix0=tx-totalW）；顶底站名（anchor=middle）→ chip 居中于文字。空间不足时先降 PER_ROW（3/2）保持对齐，仅极端挤压才 clamp。

### 5.2 线路徽章（卡片）
| 项 | 值 | 来源 |
|---|---|---|
| `--badge-size` | 36px | style.css |
| fallback 图标框 | 36×36（内图 28×28） | style.css .rs-line-icon-fallback |
| 徽章内字号 | 11px | style.css .rs-code-badge |

### 5.3 车型图标
- 来源：train-icons.js `LINE_ICONS` / `OPERATOR_ICONS`（映射表，无尺寸定义）
- 渲染尺寸继承卡片徽章（36px 容器）

---

## 6. 布局规则

### 6.1 站间距 sp（按站数分档，487-490）
| 站数 | 移动 | 桌面 |
|---|---|---|
| ≤20 | 72 | 62 |
| 21-30 | 66 | 58 |
| 31-50 | 60 | 54 |
| >50 | 56 | 50 |

顶部/底部留白：topP=18、botP=16（有直通标签时 +26）。

### 6.2 站名锚点与偏移（916-924）
- **左右侧站名与圆点同行、垂直居中**（v4.3.500：`dominant-baseline: central`，ty=圆心）
| side | tx | ty | anchor |
|---|---|---|---|
| top | x | y-14（换乘）/y-10 | middle |
| bottom | x | y+19/y+15 | middle |
| left（六形环枝干站：光丘尾，v4.3.511 站名早左——右缘避让左列上方站名带（文字带 y±8 重叠即避让，被避让站右缘左移、画布左限由 clamp 缩字兜底；v4.3.513 桌面三区分离后避让不触发、全 16px，移动端仍触发）；Tochomae junction 保持岔路早右 v4.3.505） | 光丘尾：左 x-10（避让时右缘=左列站名左缘−4）；Tochomae：右 x+14 | y（central） | 光丘尾 end / Tochomae start |
| left（六形环主干环站：左列，v4.3.511 统一早左——左列上方麻布十番〜新宿由早右改早左，与左列下方一致；v4.3.513 桌面三区分离后无穿线，移动端左列上方站名加白色描边遮线） | x-10（上方）/ x-14 或 x-10（下方） | y（central） | end |
| left（六形环周长模式 tail，v4.3.506） | x+14/x+10 | y（central） | start |
| left | x-14/x-10 | y（central） | end |
| dual（双列） | x-16/x-12 | y（central） | end |
| right（六形环周长均布，v4.3.502 已停用） | x-14/x-10 | y（central） | end |
| right（六形环右列，v4.3.502 双列） | x+14/x+10 | y（central） | start |
| right（默认） | x+14/x+10 | y（central） | start |

- 支线站（数据覆盖）：tx=bx+10、ty=bsy（central），同普通站规格（1310）。
- **支线分叉布局（v4.3.516）**：直线线型支线 **≥2 条**时**全部同侧直排（左侧）**——每条支线 junction 行水平直 stub（无下移拐弯）+ 垂直列；单支线保持右侧弯折（现状）。左侧支线 bx=mainCx−_branchStubL−支线序号×_branchColW（**_branchStubL=主干最大站名宽+22**，避开主干早左站名带 gap 10；**_branchColW=max(96, 左支线最大站名宽+14)**，列间竖线不穿前列名带 gap ≥4）、站名早左（tx=bx−10，anchor=end）、支线名早左；**支线 junction 站（支线与主干的接续站，v4.3.520 起不限 stations[0]——我孫子支线 junction 成田在站表末位也命中）主干站名早右**（tx=mainCx+12、anchor=start，Tochomae 岔路早右先例）——直 stub 不穿 junction 站名带。svgW=max(_baseW, mainCx+12+最长 junction 站名宽+_rightPad)，mainCx=max(_baseW/2, _leftNeed+20)。适用：鶴見线（大川列0 bx 232.1/海芝浦列1 bx 136.1 桌面）、成田线（空港列0/我孫子列1，列距 119.6；**v4.3.520 修复我孫子支线整条缺失**——junction 成田在支线站表末位 [我孫子…成田]，旧代码只查 stations[0] 找不到 junction 跳过渲染；现统一 `_branchJunctionStation` 解析（支线站表第一个出现在主干站表的站），junction 在末位时渲染站序反转从 junction 向下延伸）。
- 换乘 chip 顶部：ty+14（换乘站）/ty+9（普通站），避让圆点底缘 +2px（995）。

### 6.3 环线布局
- **标准环线（山手线）**：双列画法（JR 官方视觉），右列田端→東京→品川、左列駒込→大崎；站名空间 = 75×scale/侧。
- **六形环（大江户线，v4.3.504 支线从环左/右侧 1/2 处展开）**：环段 27 站 + 都庁前分左右两列（14/14）——**都庁前（junction）在环左缘、左列第 7 位**（y=loopCy−0.5/14×rectH，中点偏上 36px，参考实际在环左半故从左侧展开）；左列（顶→下）= [麻布十番…新宿, 都庁前, 新宿西口…春日]，右列（顶→下）= [本郷三丁目…赤羽橋]。站序流 都庁前→左列下（春日）→环底→右列下（本郷三丁目）→右列上（赤羽橋）→环顶→左列上（麻布十番…新宿）→都庁前（闭合）。**光丘尾（10 站）从都庁前水平 stub 向左后垂直向上**——v4.3.511 起 stubX=**max(leftMargin+10×scale6, leftMargin+10+105.6)**（竖线右移：光丘尾站名改早左后，6 字全尺寸文字左缘仍 ≥ leftMargin）。**站名侧（v4.3.511）**：**主干左列统一早左**——左列上方（麻布十番…新宿）由早右改早左，左列下方不变；**枝干光丘尾 10 站站名早左**，右缘动态避让左列上方站名带（文字带 y±8 重叠且右缘越过其左缘 → 右缘左移 4px；画布左限由 clamp 缩字兜底）；**Tochomae junction 保持岔路早右**（v4.3.505）。右列早右不变。**4.3.513 回归修复（三区分离）**：v4.3.512 stubX 右移后竖线（x≈128.4）从早左的左列上方文字带中间穿过（视觉回归：线路和文字堆叠）——桌面 tail 列上限 `_tailCap` 扩至 **223.6（=10+105.6+10+88+10）**，tailAreaWidth=223.6、svgW=429、junctionX=236.4，实现**光丘尾文字带[12.8,118.4] \| stub 竖线 128.4 \| 左列上方文字带[138.4,226.4] \| 环 236.4** 三区分离（双侧 gap 10px）：光丘尾不再触发避让（全 16px 无 clamp）、左列上方 6 站 16px 无穿线；移动端容器 1:1 硬约束（tailAreaWidth 上限 144 < 223.6）无法三区分离，保留 4.3.512 几何，**左列上方站名加白色描边（paint-order stroke 3px）遮线**（线路从文字后穿过，光丘尾避让/clamp 行为不变）。当前视觉（移动 410 容器实测）：光丘尾 9 站 16px 全尺寸 + 落合南長崎 11.5px（避让国立競技場）、左列上方 6 站 16px 全尺寸恢复、都庁前 14.2px（clamp）、右列/左列下方不变。早右的 left 站（仅 Tochomae）走窄空间 clamp（到右列圆点前）。右列站名空间 = marginRight−16（移动 76 / 桌面 68px）。环高 = 山手线官方 + 换乘 chip 高度动态放大（_colPitch6）；svgH 官方 `max(rectH+120, 2×(marginTopBot+0.5/14×rectH+tailTotalHeight))`。
- 站名 clamp 官方：双列左列 `tx-4`、右列 `svgW-2-tx`（通用）；六形环仅 Tochomae（junction 早右）走 `max(40, floor(junctionX+loopRectW−7−4−tx))`（v4.3.504/511）；光丘尾早左走通用 `tx-4`（tx=避让后右缘，落合南長崎 5 字经 clamp 缩至 11.5px）。

### 6.4 直通标签
- 首末站上方/下方 26px 留白，∧/∨ 方向标记（481-485）。

---

## 7. 触控与间距（移动端）
| 项 | 值 |
|---|---|
| 触控目标下限 | 44×44px（iOS HIG / MD3） |
| 列表项下限 | 48px 高 |
| 线路卡片 | `--pad-lg`（12px 14px） |

---

## 8. 现状不统一项（待统一，v1.0 起草时发现）

| # | 问题 | 位置 | 建议 |
|---|---|---|---|
| 1 | 直通时刻字号 11/9/6 三档分散，桌面仅 6px 过小 | 1082 | 并入字号刻度表，桌面提到 8 |
| 2 | "+n" 溢出标记 7px、方向 8px 为裸数字，未入令牌 | 1096/1675 | 抽为令牌 |
| 3 | `_sc6`（1.3）与 `scale6`（1.6）桌面不一致 | 532/939 | 统一为 1.6 或明确各自语义 |
| 4 | 换乘标记字号（12/10）与 chip 图标（20/16）无命名关系 | 408/969 | 统一命名（TX_*） |

---

## 9. 修订记录

| 日期 | 版本 | 内容 |
| 2026-09-11 | v1.0 | 初稿：盘点现状并成文；环宽 48 标准、GEOM 令牌、字体/图标/节点/线宽/布局统一规格 |
| 2026-09-11 | 4.3.497 | 换乘图标统一 16px（原移动 20/桌面 16） |
| 2026-09-11 | 4.3.498 | 站名/支线名用像素字体（Fusion Pixel 栈） |
| 2026-09-11 | 4.3.499 | 站圆点放大（普通 4→7 / 换乘 7→12，≥70%） |
| 2026-09-11 | 4.3.500 | 站名与圆点同行垂直居中（dominant-baseline central） |
| 2026-09-11 | 4.3.501 | 换乘图标与站名侧边对齐规则固化（5.1 节） |
| 2026-09-11 | 4.3.502 | 六形环（大江户线）环段改左右二分（双列，6.3 节） |
| 2026-09-11 | 4.3.503 | 六形环支线从环中心支出去——都庁前（junction）移到环顶正中央（x=loopCx），光丘尾从正上方垂直向上；环段改左 14/右 13 列，站名方向/紧致按 o.y 与 junctionY 判定（6.2/6.3 节） |
| 2026-09-11 | 4.3.504 | 支线改从环左侧 1/2 处展开（左/右参考车站按实际半区定位，2/1 处=中点）——都庁前回到左列第 7 位（左缘、中点偏上 0.5/14×rectH），光丘尾水平 stub 后向上（10 站全在环上半部左侧带）；左列站序 [S32..S37, 都庁前, S11..S17]、右列 [S18..S31]；左列上方站名早环内（clamp 到右列圆点前 58px 窄空间，clamp 下限 12→10）；svgH 缩短至 rectH+120（tail 不再伸出环顶）（6.2/6.3/1.4 节） |
| 2026-09-11 | 4.3.505 | 岔路站名统一早右——都庁前（岔路 junction）站名由早左改为早右（与光丘尾 10 站一致，线上确认岔路站名在右）；左列下方站（新宿西口…春日）仍早左。Tochomae clamp 走左列上方分支（到右列圆点前，3 字缩至 14.5px=51px，贴圆点 4px）（6.2/6.3 节） |
| 2026-09-11 | 4.3.506 | 站名侧改为占用检测规则（规则：左侧被占用就在右侧，右侧被占用就在左侧）——新增 `_pickSixLabelSide(o, geometry, svgW)`：依次检测①空间（放不下 16px 全尺寸文字宽）②线路（stub 线，Tochomae 左占用）③文字带（光丘尾站名带，左列上方站左占用）④对面圆点（左列站右 / 右列站左占用）；方向结果与 4.3.504/505 视觉一致但由占用动态决定。_renderStationNode 预取站名记 labelLen。clamp 窄空间分支改由 `_sixSide==='right'` 触发（6.2/6.3 节） |
| 2026-09-11 | 4.3.507 | 占用检测收窄范围（规则仅适用于岔路站）——占用检测**只用于岔路站**（光丘尾 10 站 + Tochomae junction）；环站（左列/右列）恢复 4.3.504 固定规则（左列上方早右、左列下方早左、右列早右）。视觉不变（岔路站检测结果与固定规则一致），规则边界明确（6.2/6.3 节） |
| 2026-09-11 | 4.3.508 | 占用检测语义精化（主干按双排固定，枝干被主干占用则换侧）——主干（环站）站名按双排固定规则不动（4.3.504）；枝干（光丘尾 + Tochomae）站名侧=占用检测：①空间（可用空间 < clamp 下限 10px×字数×1.1，右侧到主干边界【光丘尾→环左缘 / Tochomae→右列圆点左缘】、左侧到画布左缘）②线路（Tochomae 左侧 stub 线骑线）；单侧占用→放另一侧，双侧同况→默认右。占用阈值从 16px 全尺寸降为 10px 下限（clamp 保证不碰主干），检测语义由"全局几何"改为"被主干/画布挤压"。视觉不变（6.2/6.3 节） |
| 2026-09-11 | 4.3.510 | 枝干站名侧改为站名重叠检测（检测对象是站名文字带而非空间/几何）——枝干（光丘尾 10 站 + Tochomae junction）站名放某一侧时，若与主干（环）站名文字带重叠（被主干站名占用）则放另一侧；双侧都不重叠默认早右；画布边界硬约束（放不下即占用）。主干站名带方向按双排固定规则。视觉不变（当前布局枝干全早右，站名带互不重叠） |
| 2026-09-11 | 4.3.509 | 枝干占用检测方向修正（检测方向修正）——去掉"左侧被画布/stub 占用→放右"的双侧检测（左侧无主干元素，非"被主干占用"）；改为**枝干站名默认早右**（v4.3.505 岔路站名标准），**只检测右侧是否被主干（环）占用**：右侧可用空间（到主干边界：光丘尾→环左缘 / Tochomae→右列圆点左缘）< clamp 下限文字宽 → 放左，否则默认右。视觉不变（当前布局枝干全早右），检测语义与用户规则精确对齐（6.2/6.3 节） |
| 2026-09-11 | 4.3.512 | 两段站名改早左（西新宿五丁目〜光が丘 与 麻布十番〜新宿 站名早左）——**光丘尾 10 站站名早左**（stubX 右移至 max(leftMargin+10×scale6, leftMargin+115.6)，竖线 x≈128，6 字全尺寸早左文字左缘 ≥ leftMargin；右缘动态避让左列上方站名带【文字带 y±8 重叠且右缘越过其左缘 → 右缘左移 4px】，画布左限由 clamp 缩字兜底——移动 410 容器实测 9 站 16px、仅落合南長崎 11.5px）；**左列上方 6 站（麻布十番…新宿）站名早左**（由早右改早左，环内小字问题解除——16px 全尺寸恢复）；Tochomae junction 保持岔路早右（4.3.505）、右列早右、左列下方早左不变；`_pickSixLabelSide` 左列站名带假设同步改早左（6.2/6.3 节） |
| 2026-09-11 | 4.3.513 | 修复 4.3.512 视觉回归（视觉回归：线路和文字堆叠）——竖线从早左的左列上方文字带中间穿过。**桌面三区分离**：tail 列上限 `_tailCap` 扩至 223.6（=10+105.6+10+88+10），tailAreaWidth=223.6、svgW=429、junctionX=236.4——光丘尾文字带[12.8,118.4] \| stub 竖线 128.4 \| 左列上方文字带[138.4,226.4] \| 环 236.4 三区分离（双侧 gap 10px），光丘尾避让不再触发（全 16px 无 clamp）、左列上方 6 站 16px 无穿线、都庁前早右 [250.4,303.2] 不碰 stub。**移动端描边兜底**：容器 1:1 硬约束（tailAreaWidth 上限 144 < 223.6）无法三区分离，保留 4.3.512 几何，左列上方站名加白色描边（paint-order stroke 3px）遮线（线路从文字后穿过）；光丘尾避让/clamp 行为不变。`_tailCap` 移动分支保持 BRANCH_COL_W×scale6（6.2/6.3 节） |
| 2026-09-11 | 4.3.514 | 支线宽度取决于文本最多的那个站——stubX 与桌面 `_tailCap` 不再硬编码 105.6/88，动态扫描光丘尾列（stub 前 10 站）与左列上方站名的最大文字宽（`_sixNameW`，字数×16×1.1，与 _pickSixLabelSide 同源）：stubX=max(leftMargin+10×scale6, leftMargin+10+_tailWidest)、桌面 _tailCap=max(96×1.6, 10+_tailWidest+10+_leftTopWidest+10)。当前日文下 _tailWidest=105.6（西新宿五丁目）/ _leftTopWidest=88（国立競技場）→ 桌面 223.6/429.2/236.4/128.4、移动 144/350/156/127.6，与 4.3.513 视觉一致；语言切换/站名变化时自动适应（6.2/6.3 节） |
| 2026-09-11 | 4.3.515 | 双支线及以上左右交替分叉（双支线不采用弯折方案）——直线线型支线 ≥2 条时：偶数支线早右（ㅑ，现状几何）、奇数支线早左（ㅕ，镜像）；单支线保持右侧弯折。左侧支线 `_branchStubL`=主干最大站名宽+22（避开主干早左站名带 gap 10），bx=mainCx−_branchStubL−左列序×BRANCH_COL_W，站名早左（anchor=end）、支线名早左；**左侧连接线沿主干下移 20px 再水平分叉**（水平线不穿 junction 主干站名带）。svgW=mainCx+_rightNeed+20、mainCx=max(_baseW/2, _leftNeed+20)（_baseW 主导时主线位置不变）；branchGeom 列车定位同步。适用：鶴見线（海芝浦右/大川左，桌面 bx 344.5/232.1）、成田线（空港右/我孫子左）。验证: node --check OK、几何仿真（桌面/移动）gap 10 无穿字、主线 mainCx/svgW 不变（6.2 节） |
| 2026-09-11 | 4.3.516 | 多支线全左直排（4.3.515 一左一右方案被判定为"拐弯"，回退）——直线线型支线 ≥2 条时**全部同一侧（左侧）直排**：junction 行水平直 stub（无拐弯）+ 垂直列；`_branchColW`=max(96, 左支线最大站名宽+14)（列间竖线不穿前列名带 gap≥4）；**支线 junction 站（各支线 stations[0]）主干站名早右**（tx=mainCx+12、anchor=start，Tochomae 岔路早右先例）——直 stub 不穿 junction 站名带。svgW=max(_baseW, mainCx+12+最长 junction 站名宽+_rightPad)、mainCx=max(_baseW/2, _leftNeed+20)；branchGeom 同步。适用：鶴見线（大川列0 bx 232.1/海芝浦列1 bx 136.1 桌面；移动 mainCx 205→273.2 不缩放）、成田线（空港列0/我孫子列1，列距 119.6；移动 mainCx 349.6 svgW 438.4 缩放 0.935）。验证: node --check OK、几何仿真（桌面/移动）四档——名带全画布内、列间 gap 4/33、junction 名早右不溢出、直 stub 无穿字（6.2 节） |
| 2026-09-11 | 4.3.517 | 修复时刻表推定提示重复堆积（提示重复堆积）——`updateEstimatedNote` 的 note 插在 el 之后（`insertAdjacentElement('afterend')`，兄弟节点），旧清理代码却只在 el 内部查 `.tp-est-note`（永远删不到），每次增量刷新/重建都堆一个新条。改为清理 el 父级下全部 `.tp-est-note` 再插唯一一个（父级 querySelectorAll + 逐个 remove）。验证：node --check OK；线上 #Tsurumi DOM 由 6 个 note 变 1 个 |
| 2026-09-11 | 4.3.520 | 修复成田线我孫子支线整条缺失——支线 junction 不再限定 stations[0]：新增 `_branchJunctionStation(branchStations, mainStations)`（取支线站表第一个出现在主干站表的站，返回 {station, at}），统一渲染 junction 查找、branchGeom、_isBranchJunction（改 indexOf 扫描）、_jMaxW6（junction 名宽用实际 junction 站）4 处；junction 在支线站表末位时渲染/几何站序反转从 junction 向下延伸（成田→下総松崎→…→我孫子）。初版渲染层误传 stations（renderTrainMap 无此变量）致全线路图崩溃，4.3.520b 改从 stationCoords 提取 _mainIds7 传入；4.3.521 bump v 参数绕过浏览器缓存（4.3.520b 修复后未 bump，缓存命中初版 bug）。验证：线上 #Narita 我孫子支线整条渲染（junction 成田 y=142 向下 10 站到 742，两条水平直 stub 349.6-257.2/349.6-137.6 无拐弯）、#Tsurumi 回归 2 列推定 |
| 2026-09-11 | 4.3.522/523 | 短支线线 → 支线水平直线横排（4.3.516 的"junction 行水平直 stub + 垂直列"整体仍是 ⊥ 拐弯，未达"两条直线"要求）——新增 `_branchH` 判定（**双支线及以上**且该线所有支线非 junction 站数 ≤ 4 才横排；单支线如丸ノ内方南町/千代田北綾瀬保持右侧弯折现状【4.3.523 修正，初版误横排单支线】，含长支线的线如成田我孫子 9 站保持竖列现状）：支线从 junction 圆点**直接一条水平直线**延伸到最后一站（无 stub、无竖列、无拐弯），支线站横排（跳过 junction，主干已画）、站距 `_branchHSp`=全支线最宽站名+12（"支线宽度取决于文本最多的那个"）、站名早侧边与圆点同行（左支线 anchor=end）、支线名放远端上方；mainCx 左需求改用 `_leftNeedH`=最长支线长+最宽站名+余量（鹤见线 197 < _baseW/2，viewBox 不变）；branchGeom 列车定位同步横排。影响面核实（railway_data 全量支线分组）：仅鶴見线触发横排。验证：node --check OK；线上 #Tsurumi 两条水平直线（海芝浦 332.5→202.9:266、大川 332.5→267.7:328），支线竖列 0 条 |
| 2026-09-12 | 4.3.547 | 成田线拆三条（JR 官方成田线为「本线（佐倉～松岸）」「空港支线（成田～成田空港）」「我孫子支线（我孫子～成田）」三条，合计 27 站）——本地 Narita 本线站表原为佐倉→…→松岸→銚子（17 站，銚子为総武本线终点被误收，銚子→SobuMain 换乘声明/stationLines 均错误引用）；改为官方三条：Narita 本线删銚子 17→16 站（佐倉～松岸，durations 17→15、transferStations 删銚子条目）、SobuMain.transferStations 删銚子→Narita 声明、stationLines[Choshi] 删 Narita、LSO[Narita] 删銚子；空港支线（3 站）/我孫子支线（10 站）已正确不变；三条合计 27 站与官方「站数 27」一致。bump db-loader.js ?v=4.3.547（数据 localStorage 缓存 key 跟随 db-loader 版本，不 bump 则命中旧缓存）。验证：本地三条数据断言全过（銚子 0 残留）、bundle 重生成 |
| 2026-09-12 | 4.3.548 | 成田线图 junction 重复绘制修复（双支线竖列把 junction「成田」当支线首站重复画，主干 1 + 两竖列各 1 共 3 个「成田」，支线竖线从重复站起头视觉纠缠）——computeRouteGeometry branchGeom 竖列与 renderTrainMap 竖列均加 `if (站===junction) continue`（对照横排 _branchH 早有 skip），支线只画独有站，独有站从 junction 下方一档起（_bK 从 1 起，同横排 _bHi+1 规则）。效果：圆点 29→27、成田仅主干 1 次、支线竖列自下総松崎/空港第2大楼 起。bump trains-page.js ?v=4.3.548 |
| 2026-09-12 | 4.3.549 | 成田线 junction 站名/换乘 chip y=undefined 修复（深度检查成田线查不到实时：ODPT challenge 实测三条线 odpt:Train 均 0 条——数据源不推送成田线实时位置，属覆盖限制；时刻表推定正常 728 条/11 列车标记）——renderTrainMap 主干 junction 分支漏传 ty（`tx: _bJ7 ? (sc.x+12) : undefined` 无 ty），_renderStationNode 1159 行 `ty = o.ty` 取 undefined → 站名 text y=undefined、换乘 chip iy0=ty+14=NaN 不渲染（成田线是多支线首条触发 _bJ7 的线）；补 `ty: _bJ7 ? sc.y : undefined`。验证：本地 DOM 成田站名 y=142、chip rect/image y=150/151、坏 y 0。bump trains-page.js ?v=4.3.549 |
| 2026-09-12 | 4.3.550 | 双支线及以上左右分侧（换画法——4.3.516/522 双支线全左：成田我孫子 9 站竖列 + 空港 2 站被拖成拐弯竖列全挤左侧）——**每条支线独立画法**：非 junction 站 ≤4 → 水平直线横排（h）、>4 → 竖列（v）（原全局 _branchH 阈值）；**位置规则**：竖列支线在左、横排支线在右（仅当存在竖列支线时；全部横排如鶴見线保持全左现状不回归）；`_bCol` 改同侧内序号（左右分别从 0 计）；**junction 站名**在存在右支线时转圆点上方居中 + 白色描边（paint-order stroke 3px 遮主干竖线），换乘 chip 仍放圆点下方（iy0 判据改 anchor==="middle"——非 loop 线 isJunction=false 的坑）；svgW 右侧需求含右横排支线（_rightNeed=横排长+站名带，修复 var 提升陷阱：_branchHSp 定义前移）；branchGeom/renderTrainMap 同步 branchModes。效果：成田线 我孫子竖列左（x=317.6 9 站）+ 空港横排右（x=527.6/645.2 2 站）+ 成田站名上方描边，viewBox 820→852；鶴見线全横排左/千代田单支线右 不回归。bump trains-page.js ?v=4.3.550 |
| 2026-09-12 | 4.3.551 | 所有插线叉出去部分也要算站间距——**横排支线站距 = 全支线最宽名 + 标准站间距(sp)**（原 +12 仅文本 padding；竖列支线站距本就 = sp，横排补上后站名间隙 = sp，与主干/竖列视觉统一）：成田空港 117.6→167.6（=105.6+62）、鹤见 64.8→114.8（=52.8+62）；svgW 成田 852→952（_rightNeed 自动跟随 _branchHSp）。**配套 svgH 完备化**：竖列支线底部计入 svgH（原只按主干 stationCoords 站间距算，junction 靠上+长竖列支线时支线底部会被 viewBox 裁剪）——branchGeom 构建后取全部支线坐标最大 y，超过主干底时 svgH = max(原 svgH, 支线底+sp+botP)。验证：成田空港 587.6/755.2（站距 167.6）成田站名 y=126、我孫子竖列 307.6:204→700（站距 62 无回归）、viewBox 952×1026；鹤见 viewBox 820×654 不变、横排站距 114.8 站名间隙 62；千代田 820×1344 无回归；node --check OK。bump trains-page.js ?v=4.3.550→4.3.551 |
| 2026-09-12 | 4.3.552 | 详情页返回按钮改纯退回（返回语义修正）——原实现 history.back 优先 + fallback（history.length<=1 时 `location.hash=""` 清 hash 跳一览页）；问题：①直开详情（新标签 history.length=1）时 fallback 直接跳一览页，违背"退回"语义；②`location.hash=""` 会产生新 history entry（hlen 1→2），用户再点返回反而 back 回详情，形成"详情→一览→详情"循环。修复：返回按钮一律 `window.history.back`（与 tourism-detail handleBack 完全同步）——有历史退到来源页（列表/主页/上一详情，hashchange 兜底恢复视图）；无历史（直开详情）时 back 无操作、详情保持，与浏览器后退按钮行为一致。验证：本地 DOM——直开 #Tsurumi（hlen=1）点返回 URL/hash/详情均不变（不再跳一览页）；列表→详情→返回回列表（hash 空）；详情→列表→成田详情→返回回列表；node --check OK。bump trains-page.js ?v=4.3.551→4.3.552 |
| 2026-09-12 | 4.3.553 | 右侧支线 stub（叉出段）≥ 标准站间距（南武线手机截图：浜川崎支线竖列紧贴主线，两条竖线视觉像双线并行；4.3.551「插线叉出去那一部分也要算站间距」只覆盖了横排站距，右侧单支线竖列的 stub 仍是固定 20px 未算站间距）——新增 `_branchStubR = Math.max(GEOM.BRANCH_STUB, sp)`（站间距 sp 是"插线叉出段"的统一基准），替换右侧竖列 4 处固定 stub：_rightNeed 单支线（598）、svgW 单支线（934）、branchGeom 右侧竖列 x（1030）、renderTrainMap 右侧竖列 x（1737，geometry 增传 branchStubR）；左侧竖列 _branchStubL（主干最宽名+22）与横排站距 _branchHSp（名宽+sp）不受影响。效果：南武线/丸ノ内方南町/千代田北綾瀬 支线竖线 x=主线+20 → +sp（南武线 410→468、丸ノ内 410→468），支线站名随之右移 10px（478 起），svgW 不变（南武线/丸ノ内 820）；成田/鶴見 不回归（双支线右横排、全横排左 均不用右侧竖列 stub）。验证：node --check OK、本地 DOM 四线——南武线 竖线 410/468+站名 478、丸ノ内 410/468+方南町 478、成田 我孫子 307.6/空港 587.6+755.2/成田 410 middle 全不变、鶴見 海芝浦 170.4/大川 285.2/浅野 422 全不变。bump trains-page.js ?v=4.3.552→4.3.553 |
| 2026-09-12 | 4.3.554 | 竖列支线第一站与 junction 同行（竖列支线此前独有站从 junction 下方一档开始，第一站落到主干下一站行、岔路起点视觉下沉）——branchGeom 竖列 `_bK` 1→0、renderTrainMap 竖列 `_bK2` 1→0：支线跳过 junction 后**第一站与 junction 同一水平行**水平叉出，再竖列向下（横排支线第一站本就与 junction 同行 y=by，竖列规则统一；"岔路的第一站和出去的站在一行"= junction 行即岔路点行）。效果：南武线 八丁畷/尻手 y=76 同行、成田 下総松崎/成田同行（viewBox 952×1026 不变）、千代田 北綾瀬/綾瀬同行（viewBox 820×1344→1282 缩短一档）、丸ノ内 西新宿五丁目/中野坂上同行、方南町为第二站 y=366。验证：node --check OK、本地 DOM 四线同行全过。bump trains-page.js ?v=4.3.553→4.3.554（4.3.553 已被 stub 修复占用并 push，同行修复必须新版本号绕缓存） |
| 2026-09-12 | 4.3.555 | 竖列支线竖线只画到最后一个站（丸ノ内方南町支线竖线 308→462 在方南町圆点下方多出 96px 空线，列车标记还落在空线段上）——竖线终点原 `branchTop + 站数×sp`（junction 上一档起 + 含 junction 全站计数），4.3.548 跳过 junction、4.3.554 第一站同行后该官方多出 2×sp−20px：改为**精确计数支线独有站**（跳过 junction），终点 = junction 行 + (独有站数−1)×sp = 最后一站 y（单站支线零长竖线）。效果：丸ノ内 308→366、南武线 76→250（浜川崎）、千代田 零长（北綾瀬同行）、成田我孫子竖列 142→638（我孫子）。验证：node --check OK、本地 DOM 四线竖线终点=最后一站圆点。bump trains-page.js ?v=4.3.554→4.3.555 |
| 2026-09-12 | 4.3.556 | 返回按钮统一回到线路一览（反转 4.3.552 纯退回）——trainsBackBtn 点击由 `history.back` 改为 `location.hash = ""`：清 hash 触发 hashchange 兜底 hideLineView，无论从哪进入详情（列表/主页/上一详情/直开新标签），点返回一律回到线路一览页（trains 页唯一返回入口）。清 hash 产生新 history entry（直开详情 hlen 1→2），浏览器后退仍回详情——标准浏览器历史行为，与"返回按钮=回一览"语义一致。验证：node --check OK；本地 DOM 两场景——列表→南武→返回：URL #Nambu→#、detailHidden true、listHidden false；直开 #Nambu（hlen=1）→返回：同样回列表（4.3.552 时直开详情 back 无操作）。bump trains-page.js ?v=4.3.555→4.3.556 |


---

# 附录 C 4.3.31 设计文档（Line-to-Line Service Relation Layer，原 4.3.31_design.md）

> 任务：只读架构设计（READ-ONLY ARCHITECTURE DESIGN）
> 基线：HEAD=4d72d25 | Canonical=156/509/1703/93

## 1. 问题陈述

### 1.1 三层架构的缺口

第 1 层：线路身份（railway_data.json lines[id]）
第 2 层：物理拓扑（stationLines + lineStationOrder）
第 3 层：显示分组（LineOperationSystems）

缺失：线路间服务关系（Line-to-Line Service Relation）

### 1.2 具体缺口

| 缺口 | 症状 | 影响 |
|-----|---------|--------|
| 无直通运行表达 | Saikyo→Sotetsu→MinatoMirai→Rinkai：0 个共用站 | Realtime/Trains 无法展示实际服务关系 |
| 线路区间不完整 | Yokosuka 仅有 8 站（南段） | 无法从 stationLines 证明 Yokosuka–SobuRapid 直通 |
| 支线数据缺口 | Ome/Itsukaichi/ChuoKonosu/Sotobo/Uchibo：与父线 0 共用站 | branchOf 存在但 stationLines 未反映连接 |
| 别名歧义 | TobuIsesaki（code=TI）vs Isesaki（code=TIS） | 重复显示 |
| REGIONAL 语义模糊 | 52 线混杂，maxShared=54 来自 3 条别名线 | 无法区分真正相连的线路 |

### 1.3 核心矛盾

LineOperationSystems 承载两个概念：
1. 显示分组（UI 排序/徽章）
2. 直通服务关系（运营意图，未实现）

这导致无法判断一个多线 OS 究竟是纯显示分组还是真实直通服务。

## 2. 关系类型定义

| 类型 | 常量 | 含义 | 示例 |
|------|-------|---------|---------|
| THROUGH_SERVICE | TS | 同一列车连续运行跨越两条线 | Saikyo <-> Kawagoe（Omiya） |
| PHYSICAL_CONNECT | PC | 线路共用车站/轨道连接 | Saikyo <-> ShonanShinjuku（共用 Omiya/Urawa） |
| BRANCH_OF | BR | 子线是父线的支线 | Ome -> ChuoRapid |
| ALIAS_OF | AL | 同一物理线路的不同命名 | TobuIsesaki <-> Isesaki（存疑） |
| DISPLAY_GROUP | DG | 仅 UI 分组，无运营含义 | JR_EAST/JO 徽章 |
| UNKNOWN | UN | 数据不足以判定 | TobuNikko <-> Nikkoku |

关键原则：SHARED_STATION >= 1 **并不蕴含** THROUGH_SERVICE，仅蕴含 PHYSICAL_CONNECT（且仍需验证）。

## 3. 数据模型：line-service-relations.js

新文件：data/core/line-service-relations.js

每条关系条目的结构：
- id：string（唯一）
- lineA：string（railway_data.json 的 line_id）
- lineB：string（railway_data.json 的 line_id）
- type：THROUGH_SERVICE | PHYSICAL_CONNECT | BRANCH_OF | ALIAS_OF | DISPLAY_GROUP | UNKNOWN
- confidence：HIGH | MEDIUM | LOW | UNKNOWN
- evidence：string（该关系的证明依据）
- source：string（railway_data.branchOf / stationLines / manual）
- active：boolean

与既有数据的关系：
- railway_data.json（冻结 FROZEN）：lines[].branchOf → 映射为 BRANCH_OF 关系
- stationLines[]：推导 PHYSICAL_CONNECT 证据
- LineOperationSystems（保持不变）：继续作为显示分组来源

## 4. 全 156 线关系映射

### 4.1 BRANCH_OF 关系（来自 branchOf 字段）

| 支线 | 父线 | 共用站 | 问题 |
|--------|--------|----------------|-------|
| Ome | ChuoRapid | 0 | 数据缺口：Ome 仅 18 站，缺少连接站 |
| Itsukaichi | ChuoRapid | 0 | 数据缺口：Itsukaichi 仅 6 站 |
| ChuoKonosu | ChuoRapid | 0 | 数据缺口：ChuoKonosu 仅 6 站 |
| Agatsuma | Takasaki | 1（Takasaki） | 正常 |
| Sotobo | SobuRapid | 0 | 数据缺口：Sotobo 仅 3 站 |
| SuigunBranch | Suigun | 1（Kami-Sugaya） | 正常 |
| Uchibo | SobuRapid | 0 | 数据缺口：Uchibo 仅 4 站 |

结论：7 条支线关系中 5 条存在 stationLines 数据缺口。关系层以 confidence=LOW 记录。

### 4.2 已验证的 THROUGH_SERVICE 关系

| 线路对 | 证据 | 置信度 |
|------|----------|------------|
| Saikyo <-> Kawagoe | 共用 Omiya（1 站），LOS JA 系统 | HIGH |
| TobuSkytree <-> Skytree | 共用 21 站，LOS TS 系统 | HIGH |
| TobuSkytree <-> TobuNoda | 共用 7 站，LOS TS 系统 | MEDIUM |
| Skytree <-> TobuNoda | 共用 7 站，LOS TS 系统 | MEDIUM |
| Marunouchi <-> MarunouchiBranch | 共用 7 站，LOS M 系统 | HIGH |
| SeibuIkebukuro <-> Ikebukuro | 共用 18 站（子集），LOS SI 系统 | HIGH |

### 4.3 跨运营者直通（数据缺口）

| 链 | 当前数据 | 缺口 |
|-------|-------------|-----|
| Saikyo -> SotetsuMain | 0 共用 | Saikyo 使用 Urawa、SotetsuMain 使用 Minami-Urawa（同一车站不同 ID） |
| SotetsuMain -> MinatoMirai | 共用 Yokohama（1） | 正常 |
| MinatoMirai -> Rinkai | 0 共用 | Rinkai 数据不完整 |
| Yokosuka <-> SobuRapid | 0 共用 | Yokosuka 仅有 8 个南部车站，缺少东京—横滨北段 |

以上：THROUGH_SERVICE + confidence=LOW + evidence 车站数据不完整。

### 4.4 TYPE-C 详细分类

| OS | 线路 | 分类 | 理由 |
|----|-------|---------------|--------|
| JR_EAST/JC | ChuoRapid <-> ChuoKonosu | BRANCH_OF（LOW） | branchOf=ChuoRapid，stationLines 缺少连接 |
| JR_EAST/JO | Yokosuka <-> SobuRapid | THROUGH_SERVICE（LOW） | 实际 Yokosuka–Sobu Rapid 线数据不完整 |
| TOBU/TI | TobuIsesaki <-> Isesaki | ALIAS_OF（MEDIUM） | 日文名相同，代码 TI vs TIS 不同 |
| TOBU/TN | TobuNikko <-> Nikkoku | UNKNOWN | 站集 21 vs 9 差异不明确 |
| TOBU/TTJ | Tojo <-> Utsunomiya | THROUGH_SERVICE（UNKNOWN） | 实际存在直通服务，数据 0 共用站 |

### 4.5 REGIONAL 重新分类

REGIONAL 52 线不应是单一直通服务簇。

| 子组 | 线路 | 类型 | 依据 |
|-----------|-------|------|-------|
| 别名组 | Yonezawa / Tsugaru / TohokuMain | ALIAS_OF | 共用 54 站同一物理轨道 |
| 相连 | Shinetsu <-> Shinonoi | PHYSICAL_CONNECT | 共用 41 站 |
| 相连 | Senseki <-> Yamagata | PHYSICAL_CONNECT | 共用 31 站 |
| 相连 | Kiryu <-> Sagami <-> Sano | PHYSICAL_CONNECT | 各共用 18 站 |
| 孤立 | 其余约 40 线 | 无关系 | 0 共用站 |

## 5. 架构集成设计

### 5.1 新五层架构

第 1 层：线路身份（railway_data.json lines[id]）
第 2 层：物理拓扑（stationLines + lineStationOrder）
第 3 层：服务关系（line-service-relations.js）〔新增〕
第 4 层：运行系统（LineOperationSystems 不变）
第 5 层：展示（LinePresentationService 扩展）

### 5.2 LinePresentationService 扩展

当前 API：
- getDisplayOrder(allLines) → 按 LOS 排序后的线路 ID 列表

扩展 API（向后兼容）：
- getServiceChains → [{lineIds 数组，type TS，confidence HIGH}]
- getRelatedLines(lineId) → [{lineId，type，confidence，evidence}]
- isThroughService(lineA, lineB) → boolean

### 5.3 DataState.renderList 影响

当前渲染：
按 OPERATOR 分组 → 按 LOS 顺序排序 → 渲染卡片

扩展渲染（可选增强，非 4.3.31 必需）：
按 OPERATOR 分组
→ 按 OS 系统（LOS）分组
→ 系统内先显示 THROUGH_SERVICE 链
→ 再显示其余线路
→ 渲染带链指示的卡片

## 6. 文件结构

data/core/
 railway_data.json（冻结 FROZEN — 156/509/1703/93）
 line-operation-systems.js（不变 — 显示分组）
 line-service-relations.js（新增 — 服务关系层）

js/
 line-presentation-service.js（扩展 — 添加 getServiceChains / getRelatedLines）
 data-state.js（基础功能无需变更）

## 7. 风险评估

| 风险 | 级别 | 缓解措施 |
|------|-------|------------|
| 新文件加载顺序问题 | 低 | 在 db-loader.js 中按正确顺序加载 |
| LinePresentationService 扩展影响既有排序 | 中 | 无关系时向后兼容回退到 LOS 顺序 |
| 关系层与 LOS 重复 | 低 | 明确分离：LOS=显示，Relations=服务 |
| 数据质量依赖 | 高 | confidence 字段 + evidence 描述，不伪造确定性 |

## 8. 后续阶段计划

| 阶段 | 内容 | 是否修改数据？ |
|-------|---------|----------------|
| 4.3.32 | 实施影响审计 | 否 |
| 4.3.33 | line-service-relations.js 数据填充 | 是（新文件） |
| 4.3.34 | LinePresentationService 扩展 | 是（JS） |
| 4.3.35 | DataState/Realtime/Trains 渲染增强 | 是（JS+CSS） |
| 4.3.36 | stationLines 数据质量修复（独立任务） | 是（数据治理） |

## 9. 结论

4.3.31 设计完成。

核心交付物：
1. 六种关系类型定义（THROUGH_SERVICE / PHYSICAL_CONNECT / BRANCH_OF / ALIAS_OF / DISPLAY_GROUP / UNKNOWN）
2. line-service-relations.js 文件结构设计
3. 全 156 线关系映射（区分已验证 / 数据缺口 / 别名）
4. 职责分离清晰的新五层架构
5. 后续阶段 4.3.32–4.3.36 实施路线图

下一步：4.3.32 实施影响审计

本文档为只读设计产物，不修改任何代码或数据文件。

---

# 附录 D 基本信息（README，原 README.md）

> 面向东京首都圈，提供铁路路线检索・运行状况・观光景点信息的像素风 Web 应用。

## 运行方式（必须通过本地服务器）

项目数据通过 `fetch` 加载（`data/core/railway_data.json` 等），**双击 HTML（file:// 协议）无法工作**，必须用本地 HTTP 服务器启动：

```bash
python serve.py
```

然后访问：

```
http://localhost:8017/pages/home.html
```

> 注：`serve.py` 为本地静态服务器，同时提供 `/api-proxy/` 官方 API 代理（4.3.405 起替代 `python -m http.server 8017`，详见附录 A「运行契约」）。

数据加载成功的标志：浏览器控制台（F12）输出
`509 stations, 159 lines, 94 tourism stations`。

## 页面入口

| 页面 | 路径 |
|------|------|
| 首页（路线检索） | `pages/home.html`（唯一入口） |
| 运行状况 | `pages/realtime.html` |
| 列车实时 | `pages/trains.html` |
| 搜索履历 | `pages/history.html` |

## 开发约定

详见附录 A（三层数据架构、显示身份规则、规范数据冻结等硬规则）与附录 B（线路图设计规定）。


---
