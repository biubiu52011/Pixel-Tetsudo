# Pixel-Tetsudo（像素铁道）— 项目总文档（综合版）

## 目录

> **文档结构**：第 1-12 章——项目概要、架构、规范、前端设计、数据层、接口、部署、测试、风险、开发规则、线路服务关系层。
> **阅读建议**：新人按 1→2→3→5.4 顺序读（是什么→怎么画）；改代码前必读第 11 章硬规则。

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
    - [3.9 本地开发服务器与代理（serve.py）](#39-本地开发服务器与代理servepy)
    - [3.10 页面结构规则](#310-页面结构规则)
  - [4. 全局统一格式与开发规范](#4-全局统一格式与开发规范)
    - [4.1 目录文件命名规范](#41-目录文件命名规范)
    - [4.2 代码命名、注释统一规范](#42-代码命名注释统一规范)
    - [4.3 页面、路由命名规范](#43-页面路由命名规范)
    - [4.4 多语言文案格式规范](#44-多语言文案格式规范)
    - [4.5 铁道数据录入统一规范](#45-铁道数据录入统一规范线路--车站--颜色--排序)
    - [4.6 UI 视觉统一规范](#46-ui-视觉统一规范字体--间距--配色--svg-绘制规则)
    - [4.7 接口命名、参数格式统一规范](#47-接口命名参数格式统一规范)
  - [5. 前端设计](#5-前端设计)
    - [5.1 项目目录结构](#51-项目目录结构)
    - [5.2 全站路由清单](#52-全站路由清单)
    - [5.3 多语言实现方案](#53-多语言实现方案)
    - [5.4 线路图设计规定（SVG 渲染标准）](#54-线路图设计规定svg-渲染标准)
      - [5.4.1 基础前置规则（所有画法通用）](#541-基础前置规则所有画法通用)
        - [5.4.1.1 画布基准](#5411-画布基准)
        - [5.4.1.2 尺寸速查表](#5412-尺寸速查表移动端--桌面端最终值)
        - [5.4.1.3 GEOM 令牌](#5413-geom-设计令牌)
        - [5.4.1.4 字体体系](#5414-字体体系字体族字号刻度字重颜色)
        - [5.4.1.5 站间距](#5415-站间距换乘-chip-高度自适应所有画法共用)
        - [5.4.1.6 站名自适应](#5416-站名自适应clamp)
        - [5.4.1.7 触控](#5417-触控与间距移动端)
        - [5.4.1.8 数据来源](#5418-数据来源)
        - [5.4.1.9 车站节点](#5419-车站节点圆点规格与站名偏移)
        - [5.4.1.10 站名锚点](#54110-站名文本与锚点通用规则)
        - [5.4.1.11 换乘 chip](#54111-换乘图标-chip规格与对齐)
        - [5.4.1.12 线路主线](#54112-线路主线线宽与透明度)
        - [5.4.1.13 直通标记](#54113-直通标记箭头与留白)
        - [5.4.1.14 列车标签](#54114-列车标签方向端点站名)
      - [5.4.2 环线布局](#542-环线布局画法专属)
      - [5.4.3 支线布局](#543-支线布局画法专属)
      - [5.4.4 线路与线宽](#544-线路与线宽画法专属主线通用)
      - [5.4.5 图标体系](#545-图标体系卡片侧)
      - [5.4.6 现状不统一项](#546-现状不统一项待统一)
    - [5.5 全局公共组件](#55-全局公共组件设计)
    - [5.6 响应式适配](#56-响应式适配规范)
    - [5.7 静态资源管理](#57-静态资源管理规范)
    - [5.8 本地存储](#58-本地存储方案)
  - [6. 数据层（本地底库 + ODPT 实时）](#6-数据层本地底库--odpt-实时)
    - [6.1 系统模块划分](#61-系统模块划分)
    - [6.2 访问控制（serve.py 安全）](#62-后台权限模型)
    - [6.3 数据文件体系](#63-数据文件体系)
    - [6.4 ODPT 实时对接 & 双库联动](#64-odpt-实时数据对接--双库联动策略)
    - [6.5 核心业务规则](#65-核心业务规则)
  - [7. ODPT 接口与数据通道](#7-odpt-接口与数据通道)
    - [7.1 请求/响应格式](#71-全局请求--响应统一格式)
    - [7.2 错误码规范](#72-全局错误码规范)
    - [7.3 前台业务接口](#73-前台业务接口读取本地线路库景点观光路线)
    - [7.4 ODPT 实时封装接口](#74-odpt-实时数据封装接口实时运行时刻表与本地线路库匹配)
    - [7.5 后台管理接口（无）](#75-后台管理接口无数据维护见-63)
    - [7.6 系统数据字典](#76-系统数据字典)
  - [8. 部署与运维](#8-部署与运维)
    - [8.1 本地开发服务器（serve.py）](#81-本地开发服务器servepy)
    - [8.2 CI/CD 构建部署](#82-cicd-构建部署流程)
    - [8.3 环境变量配置](#83-环境变量配置清单)
    - [8.4 静态资源/CDN 部署](#84-静态资源svgcdn-部署规范)
    - [8.5 日志、监控](#85-日志监控规则)
    - [8.6 数据文件备份](#86-数据文件备份策略本地线路库重点备份)
    - [8.7 降级容灾](#87-降级容灾方案odpt-失效优先走本地库)
  - [9. 测试规范](#9-测试规范)
    - [9.1 核心测试场景](#91-核心测试场景)
    - [9.2 数据一致性测试](#92-数据一致性测试本地库-vs-odpt)
    - [9.3 兼容性、性能测试](#93-兼容性性能测试标准)
  - [10. 风险说明 & FAQ](#10-风险说明--常见-faq)
    - [10.1 已知风险点](#101-项目已知风险点)
    - [10.2 常见问题](#102-开发--部署--数据维护常见问题)
  - [11. 开发规则（Hard Rules）](#11-开发规则hard-rules)
  - [12. 架构基线（Architecture Baselines）](#12-架构基线architecture-baselines)
    - [线路层级规则](#线路层级规则line-hierarchy-rule硬规则)
    - [系统优先变更规则](#系统优先变更规则system-first-change-rule硬规则)
    - [变更前 / 结构性变更后](#变更前)
    - [规则 9 - 全系统消费方保全](#规则-9---全系统消费方保全rule-9--whole-system-consumer-preservation硬规则)
    - [变更前问卷](#变更前问卷动代码前必须回答全部)
    - [迁移规则](#迁移规则)
    - [删除规则](#删除规则)
    - [禁止并行实现规则](#禁止并行实现规则)
    - [任务提示词规则](#任务提示词规则)
    - [新功能开发流程](#新功能开发流程)
    - [功能准入 / 系统影响评审](#功能准入--系统影响评审强制)
    - [准入问卷](#准入问卷动代码前必须回答全部)
    - [A 换 B 退化检查](#a-换-b-退化检查关键)
    - [决策树](#决策树)
    - [能力归属检查](#能力归属检查所有功能开发强制)
    - [逻辑挪用规则](#逻辑挪用规则)
    - [已知债务](#已知债务不需要自动修复)
    - [架构基线](#架构基线architecture-baselines)
    - [规范数据冻结规则](#规范数据冻结规则canonical-data-freeze-rule)
    - [显示身份规则](#显示身份规则display-identity-rule)
    - [三层数据架构规则](#三层数据架构规则three-layer-data-architecture-rule)
    - [无孤儿迁移规则](#无孤儿迁移规则no-orphan-generating-migration-rule)
    - [只读优先规则](#只读优先规则read-only-first-rule)
    - [模块核心规则](#模块核心规则module-main-heart-rule)
    - [发布门规则](#发布门规则release-gate-rule)
    - [运行契约](#运行契约runtime-contract)
  - [13. 线路服务关系层设计](#13-线路服务关系层设计line-to-line-service-relation-layer)
    - [12.1 问题陈述](#121-问题陈述)
    - [12.2 关系类型定义](#122-关系类型定义)
    - [12.3 数据模型](#123-数据模型-line-service-relationsjs)
    - [12.4 全部线路关系映射](#124-全部线路关系映射)
    - [12.5 架构集成设计](#125-架构集成设计)
    - [12.6 文件结构](#126-文件结构)
    - [12.7 风险评估](#127-风险评估)
    - [12.8 后续阶段计划](#128-后续阶段计划)
    - [12.9 结论](#129-结论)

## 1. 文档总述

### 1.1 文档目的与阅读对象

文档目的：本文件是像素铁道项目唯一的开发技术文档（综合版），统一定义网站结构、前后端规范、开发规则、项目运行信息与变更记录。

来源：本文档由 AGENTS.md、LINE-DIAGRAM-SPEC.md、4.3.31_design.md、README.md 等多份开发文档整理合并而成。

阅读对象：参与本项目的 AI agent 与开发者。文档中的硬规则对 AI agent 生效，优先级高于任何任务级指令。

文档维护约定：

新增/修改规则：直接修改对应章节，并在归档变更日志登记条目与日期。

归档变更日志（archive/DEVELOPMENT-CHANGELOG-*.md）：条目格式为 ## 版本号（日期，主题），正文按「问题 → 修复 → 验证 → 遗留」组织。

版本号冲突：项目开发存在并发会话，版本号可能重复（同一号码对应不同主题）。判断先后一律以「日期 + 标题」为准，不依赖版本号推断顺序。

冻结数据：data/core/railway_data.json 等冻结数据修改必须符合第 11 章 Canonical Data Freeze Rule（需 Freeze 例外），改后重跑 node data/core/gen-file-data.js。

规则沉淀（防污染）：规则正文一律写入对应规则章节（5.4 线路图设计规定、第 4 章通用规范、特殊规则部分）；变更记录只做登记（版本号 + 一句话主题 + 指向规则章节），归档于 archive/DEVELOPMENT-CHANGELOG-*.md，禁止以笔录体（如“用户指示（主题・版本号）: ”）书写规则正文；历史笔录条目与规则章节冲突时，以规则章节为准。

语言约定：本文档全部使用中文编写；专有名词、代码 ID、线路/车站 ID、数据文件名、API 名称保留原文（如 ODPT、LOS、railway_data.json、JC_Chuo_Rapid 等）；日文/英文历史记录已全部译为中文，如需核对原文以 Git 历史为准。

### 1.2 版本修订记录

| 版本 | 日期 | 更新人 | 修订内容 |
| --- | --- | --- | --- |
| RC-4 | 2026-09-18 | 用户／开发会话 | 与确认稿 RC-3 对齐：第 11 章硬规则编号补回（系统优先变更「变更前」/ 无孤儿迁移 / 发布门）、附录 A 结论编号补回；移除 5.2 误混入的根入口路由行（该文件已删除，入口统一 pages/home.html） |
| RC-3 | 2026-09-17 | 用户／开发会话 | 可读性优化：目录置顶（全文锚点）；多份开发文档整理合并（线路图设计规定并入正文 5.4，设计文档与 README 保留为附录 A/B）；设计文档全文中译；6.5 节重复内容清理；错别字修正 |
| RC-2 | 2026-09-17 | 用户／开发会话 | 结构优化（章节重组、CRLF→LF、重复版本号标注〔并发会话〕）；语言统一为中文；新增第 3 章“系统架构设计”（含 3.10 页面结构规则，原第 0 章并入）；第 6 章按“系统模块划分 / 后台权限模型 / 数据库设计 / ODPT 实时数据对接 & 双库联动策略 / 核心业务规则”重组；第 7 章按 7.1-7.6 重排（全局格式 / 错误码 / 前台业务接口 / ODPT 封装 / 后台管理接口 / 数据字典）；新增第 8-10 章（部署与运维 / 测试规范 / 风险说明 & FAQ）；取消“用户指示”笔录形态，变更日志统一为标准条目 |
| v1.0 | 2026-09-11 | 用户／开发会话 | 由 AGENTS.md、LINE-DIAGRAM-SPEC.md、4.3.31_design.md、README.md 等多份开发文档整理合并形成综合版；完整原文收录于附录 A-B。 |

> 文档状态：维护中 ｜ 最近修订：RC-4（确认稿对齐）

### 1.3 术语与缩写

| 术语/缩写 | 说明 |
| --- | --- |
| ODPT | Open Data for Public Transportation（公共交通开放数据）——实时位置/时刻表/运行情报数据源 |
| LOS | Line Operation Systems——线路运行系统（data/core/line-operation-systems.js） |
| Freeze | 数据冻结——railway_data.json 等冻结数据，修改需 Freeze 例外 |
| RC | Release Candidate——候选发布版本 |
| manual 时刻表 | ODPT 无数据的线路由人工整理的时刻表（data/timetables/*-manual.js） |
| i18n | 国际化（本项目 4 语言：ja/zh/ko/en） |
| db-loader | 构建期数据加载器（data/core/db-loader.js） |
| CSP | 内容安全策略（页面 script-src 'self' 等约束） |
| GEOM | 线路图几何设计令牌（5.4.1.13 节） |
| BFS | 广度优先搜索——路径搜索实现（js/route-search.js） |
| 线路系统（Line） | 铁路基础设施/线路实体——一条线路 = 一个物理线路定义（railway_data.json lines），可包含多个运行系统；与运行系统（LOS）是两个维度 |
| 运行系统（LOS） | Line Operation System——按运营/向导看板组织的运行系统（如快速/各站停车/中距离可以是同一线路的多个运行系统；多条线路也可以共享一个运行系统） |
| 直通（THROUGH_SERVICE） | 列车跨线运行——直通关系登记在服务关系层（line-service-relations.js THROUGH_SERVICE）；直通列车按车号规则识别车籍 |
| 并行区间 | 两条线路在部分区间并行（各自停靠不同车站，或一条各停一条快速）——并行不等于直通，换乘标记只标注实际共用站 |
| 线路分断 | 线路因新线开通/废线等原因物理分断为多段后，“完整线路称呼”可能消失——按各自运营主体建卡，不保留虚构整线 |
| 共有区间 | 两线共同经过的车站区间——共有站作为两线共有处理，只登记一次换乘 |

### 1.4 参考资料

ODPT API：来源站点 www.odpt.org；https://api-challenge.odpt.org / https://api.odpt.org（实时/时刻表数据，浏览器 connect-src 白名单）

项目内：scripts/serve.py（本地服务器）、data/core/*（构建期数据）、5.4 线路图设计规定

外部核验：JR 東日本 / 東武 / 小田急 / 京成 等官方页面、ja.wikipedia、鉄道ファン 等（车型与运行系统核验）

## 2. 项目概述

### 2.1 业务背景

项目定位：像素铁道（Pixel-Tetsudo）是面向日本全国的铁道信息可视化网站，以像素美术风格呈现线路图、列车实时/推定位置与运行情报；目前仅完成东部地区，覆盖 JR 东日本、東京メトロ、都営、私铁、单轨、新交通等线路。

数据现实：多数线路的实时位置/时刻表/运行情报来自 ODPT；但部分线路（地方线、部分私铁等）ODPT 无数据——项目以人工整理时刻表（data/timetables/*-manual.js）补全，保证线路全覆盖。

工程形态：纯前端静态站点 + 轻量本地服务端（serve.py），无传统业务后端；4 语言（ja/zh/ko/en）；离线优先（构建期数据 + 运行时缓存）。

### 2.2 用户角色

| 角色 | 说明 |
| --- | --- |
| 普通用户（乘客／观光客） | 查询路线与票价、查看线路图与列车实时位置、浏览运行情报、获取观光推荐与详情；无需登录 |
| 开发者／AI agent | 维护数据与功能；必须遵守本文档全部规范（硬规则优先级高于任务级指令） |

### 2.3 功能清单

| # | 功能 | 说明 | 入口／模块 |
| --- | --- | --- | --- |
| 1 | 路线搜索 | 起终点路径搜索（BFS）+ 各段时刻推算 + 票价估算 | home.html / route-search.js / route-timetable.js / fare-estimator.js |
| 2 | 线路图 | 全线路像素风线路图（站名、换乘、支线、六形环布局） | trains.html / trains-page.js |
| 3 | 列车实时位置 | ODPT 实时位置优先，无实时线路按时刻表+延误推定补缺 | trains.html / data-fusion.js / train-position-estimator.js |
| 4 | 运行情报 | 各线运行状态（正常/延误/中断/通知）与线路详情弹窗（显示 ODPT 原文全文） | realtime.html / realtime-view.js / delay-translator.js |
| 5 | 观光推荐与详情 | 按位置推荐景点；景点/活动/店铺三类详情页（信息、地图、距离） | home.html / sightseeing.js / tourism-*.js / tourism-proximity.js |
| 6 | 搜索历史 | 本地保存最近搜索记录 | history.html / history.js |
| 7 | 多语言 | ja/zh/ko/en 四语言切换 | translations.js / lang-init.js |

### 2.4 核心业务流程

流程 A：查路线

打开 pages/home.html（唯一业务入口），输入出发站与到达站

route-search.js 以 BFS 计算路径（基线数据经 db-loader.js 加载，ODPT 数据惰性按需获取）

route-timetable.js 推算各段发到时刻 → fare-estimator.js 估算票价

search-ui.js 渲染结果；点击线路可跳转 trains.html 查看该线实时位置

流程 B：看实时与运行情报

打开 realtime.html：odpt-unified.js 拉取各线状态 → data-fusion.js 融合 → 状态卡列表

点击线路卡弹出详情（realtime-view.js + delay-translator.js 翻译，运行情报显示 ODPT 原文全文）

打开 trains.html：线路图 + 列车位置（实时优先；无实时线路由 train-position-estimator.js 按时刻表推定补缺）

流程 C：观光

首页观光模块按当前位置推荐（sightseeing.js + tourism-proximity.js）

点击景点/活动/店铺进入详情页（tourism-core.js 底座 + 各类型控制器，含地图）

搜索与浏览记录写入本地历史（history.js）

## 3. 系统架构设计

### 3.1 整体架构

本项目 = 纯前端静态站点 + 轻量本地服务端，无传统业务后端。

前端：多页面静态站（7 页），4 语言（ja/zh/ko/en），离线优先（构建期数据 + 运行时缓存）

服务端：scripts/serve.py（本地静态服务 + 白名单 API 代理），是唯一允许的本地服务器

入口：pages/home.html 为唯一业务入口，共 7 个页面（见 3.6）

数据三通道：构建期生成 / 浏览器直连 ODPT / 本地白名单代理（详见 3.8）

前端分层：数据层 ← 业务层 ← 展示层，i18n 横切（详见 3.7）

### 3.2 技术栈

| 类别 | 选型 | 说明 |
| --- | --- | --- |
| 前端 | 原生 HTML/CSS/JavaScript | 无框架；资源引用带 ?v=4.3.xxx 版本化缓存 |
| 地图 | Leaflet + MapLibre GL | tourism 三页地图渲染（js/leaflet/ + js/maplibre/） |
| 数据 | JSON + JS 数据文件 | data/core/（构建期）、data/timetables/-manual.js（人工时刻表） |
| 服务端 | Python scripts/serve.py | 标准库实现：静态托管 + 白名单代理 + Host 校验 |
| 构建 | Node.js node data/core/gen-file-data.js | 生成 *.file.js 构建期数据 |
| 版本控制 | Git | 项目根目录 .git |
| 多语言 | 自研 i18n（translations.js / lang-init.js） | ja/zh/ko/en |

### 3.3 环境划分

本项目为本地个人项目，无传统开发/测试/预发/生产多环境：

| 环境 | 说明 |
| --- | --- |
| 本地运行 | python serve.py → http://127.0.0.1:8017（唯一运行方式，替代 python -m http.server 8017） |
| 构建期 | node data/core/gen-file-data.js（数据文件变更后重跑） |
| 数据源 | ODPT 挑战版 api-challenge.odpt.org（开发）与正式版 api.odpt.org（运行）；API key 经环境变量注入，不硬编码 |

### 3.4 外部依赖

| 依赖 | 用途 | 说明 |
| --- | --- | --- |
| ODPT API | 实时位置/时刻表/运行情报 | api-challenge.odpt.org / api.odpt.org；浏览器 connect-src 白名单 |
| 官方线路页面 | 车型/运行系统核验 | JR 東日本 / 東武 / 小田急 / 京成 等，人工核验后写入数据 |
| Leaflet + MapLibre GL | 观光详情页地图 | 本地 vendored（js/leaflet/ js/maplibre/），不引 CDN |
| 环境变量 | 代理密钥 | ODAKYU_API_KEY（serve.env 读取，不落代码） |

> 本章为项目基础规范，适用于全部后续规则。任何变更（含细则）不得破坏本章定义的结构与边界。

### 3.5 目录结构

| 路径 | 职责 | 规范 |
| --- | --- | --- |
| pages/ | 页面（7 个，见 3.6） | 每页职责单一；只允许引用 ../css/ ../js/ ../data/ ../images/ ../fonts/ |
| css/ | 样式 | 全局 style.css；页面专属样式独立文件；禁止页面内联 style（CSP style-src 'self'） |
| js/ | 前端模块 | 按数据/业务/展示三层组织（见 3.7）；模块职责单一，禁止跨层依赖 |
| data/core/ | 构建期生成数据 + 加载器（db-loader.js、*.file.js、源 JSON）+ 运行时常量表 | 生成文件（*.file.js、config-bundle.js）禁止手工编辑；冻结数据修改必须走 Freeze 例外，改后重跑 gen-file-data.js；改 7 个运行时常量表后重跑 gen-config-bundle.js |
| data/api/ | ODPT 客户端（odpt-unified.js）与链接（odpt-links.js） | ODPT 访问唯一入口；首页经 odpt-lazy.js 惰性加载 |
| data/timetables/ | 手动时刻表（*-manual.js）+ vehicle-type-map.js | 命名 <RailwayId>-manual.js；仅 ODPT 无数据的线路允许手工整理 |
| fonts/ | 像素字体（ja/ko/zh-hans/zh-hant/latin） | 唯一字体源，禁止使用系统字体替代 |
| images/ | 素材库，按业务主题分四个子目录；根级仅放全站图标/站点标记（pixel-tetsudo.ico、Language.png、icon-metro-station.svg、地铁站点.svg） | 见下方「图库管理规范」：四个子目录各自的用途与命名 |
| scripts/ | 数据治理脚本（i18n 审计/对齐/提交前检查） | serve.py 为本地开发服务器（.gitignore 排除不入库）；生成脚本产出必须落 data/core 或 data/timetables |
| archive/ | 已废弃脚本存档 | 只读存档，禁止再被页面引用 |
| recovery/ | 数据修复现场 | baseline/ 与统一线路清单为 CI guard 依赖必须入库（.gitignore 白名单）；其余修复现场用完归档或清理 |
| work/.work/ | 本地工作区（工具脚本、serve.env） | 仅本地使用，禁止被页面引用；敏感文件必须 .gitignore |
| .github/ | CI/CD 工作流（GitHub Actions） | push/PR 到 main 触发 validate（guard 检查）+ 自动部署 GitHub Pages；guard 脚本依赖 recovery/baseline/ |
| node_modules/ | 工具依赖 | 禁止在其中放置项目文件或临时文件（.tmp_* 等应立即清理） |

#### 3.5.1 图库管理规范（images/）

图库按业务主题分四个子目录，**文件名全库唯一**，禁止跨子目录重名；新素材必须先确定归属子目录再落盘。

| 子目录 | 用途 | 命名规范 | 被谁引用 |
| --- | --- | --- | --- |
| images/列车/<運営者>/ | 列车形态/涂装图标（按型番系） | 型番系/形 + 涂装样式括弧，如 E231系（山手線）.png | train-icons.js / LINE_ICONS、operResolvedIcon |
| images/鉄道/<運営者>/ | 线路/运营者 logo（按线路名） | 与线路名一致，如 JR東日本/京浜東北線.png | railway_data.json 的 line.image、LOS ResolveIcon |
| images/観光地/ | 景点/活动/店铺主图 | 与条目显示名一致，如 北千住丸井.jpg | tourism_data.json 的 image 字段（../images/観光地/...） |
| images/料理/<店ID>_<序号>_<菜名>.jpg | 餐饮多图 | <店slug>_<序号>_<菜名>.jpg，如 sakusa-juraku_0_omurice.jpg | 店铺详情页按店 ID 前缀加载 |
| images/ 根级 | 全站唯一图标/站点标记 | 仅 pixel-tetsudo.ico、Language.png、icon-metro-station.svg、地铁站点.svg；禁止在根级堆放业务素材 | HTML link rel=icon / 地图标记 |

硬规则：
- 图片路径在数据中以 ../images/...（相对 pages/）写入；移动/重命名图片必须同步改数据引用，断链清零（见 Q&A「图片/资源引用断了」）。
- 禁止把临时截图、PSD、源文件入库；只放最终展示图。
- 线路 logo 与列车图标分目录存放：line.image 只指向 鉄道/ 下的线路 logo，列车形态图标只指向 列车/ 下的型番系图，二者不得混用。

### 3.6 页面结构

| 页面 | 职责 | 说明 |
| --- | --- | --- |
| pages/home.html | 搜索首页（路线/车站搜索 + 观光推荐） | 唯一业务入口 |
| pages/trains.html | 线路图 + 列车实时/推定位置 | 独立页：线路列表（#trainsLineListContent）+ SVG 线路图（#trainsMapContainer）+ 实时详情（#trainsDetailView） |
| pages/realtime.html | 运行情报一览 | 独立页：状态卡列表（#realtimeStatusContainer）+ 线路详情弹窗（#lineDetailModal） |
| pages/tourism-spot.html | 景点详情 | 独立详情页：专属 tourism-spot.css + tourism-spot.js（景点：desc/tags/image/bestTime）+ leaflet/maplibre 地图；共用 tourism-core.js 底座 |
| pages/tourism-event.html | 活动详情 | 独立详情页：专属 tourism-event.css + tourism-event.js（活动：desc/时间/场地）+ leaflet/maplibre 地图；共用 tourism-core.js 底座 |
| pages/tourism-shop.html | 店铺详情 | 独立详情页：专属 tourism-shop.css + tourism-shop.js（店铺：desc/hours 营业时间）+ leaflet/maplibre 地图；共用 tourism-core.js 底座 |
| pages/history.html | 搜索历史 |  |

### 3.7 前端分层

四层结构（三层业务 + i18n 横切）：

数据层（data/ + js/data-*）：db-loader.js（构建期数据加载）、odpt-unified.js（ODPT 客户端）、data-fusion.js（实时+推定融合）、data-state.js（状态+线路卡片）、data-layer.js（统一数据层）、train-position-estimator.js（时刻表推定）、station-resolver.js、running-chain-resolver.js、delay-translator.js、local-railway-data.js

业务层（js/*）：line-presentation-service.js（显示排序）、route-search.js（路径搜索）、fare-estimator.js（票价估算）、train-icons.js（车型图标）、route-timetable.js（搜索时刻推算）、tourism-proximity.js、sightseeing.js

展示层（页面专属）：trains-page.js、realtime-view.js、search-ui.js、history.js、tourism-core/spot/event/shop.js

i18n 横切：translations.js、lang-init.js、common.js、i18n-common.js（构建期合并包，不入库）

规则：

依赖方向：数据层 ← 业务层 ← 展示层，禁止反向；展示层不得绕过业务层直接读写数据层

ODPT 唯一入口：所有 ODPT 请求必须经 odpt-unified.js；首页首屏走惰性模式（odpt-lazy.js）

缓存版本化：资源引用一律带 ?v=4.3.xxx 版本参数，模块变更必须 bump（防浏览器缓存命中旧版）

CSP 约束：script-src 'self'；connect-src 仅 self + ODPT 白名单（api-challenge.odpt.org / api.odpt.org），新外部连接必须先登记

### 3.8 数据通道

三通道获取数据，融合后供展示：

构建期生成：data/core/gen-file-data.js 等生成脚本 → *.file.js → db-loader.js 加载（基线数据：线路/车站/i18n/旅游）

运行时官方数据：浏览器直连 ODPT（CSP connect-src 白名单）→ odpt-unified.js（实时位置/时刻表/运行情报）

无 CORS 官方 API：浏览器 → /api-proxy/ → serve.py → 官方 API（白名单代理）

数据流：db-loader（基线）→ odpt-unified（实时/时刻表）→ data-fusion（实时优先、推定补缺）→ 业务层 → 展示层。

### 3.9 本地开发服务器与代理（serve.py）

scripts/serve.py 仅承担两项职责：

静态文件服务（127.0.0.1:8017，等价替代 python -m http.server 8017）

/api-proxy/ 白名单代理（官方 API 无 CORS 头、浏览器不能直连时经本地转发）

规则：

新代理端点必须登记 PROXY_TARGETS 白名单（固定目标，防 SSRF）；禁止代理任意 URL

API key 不硬编码：环境变量或 .work/serve.env（已被 .gitignore 排除）；key 一旦泄露必须轮换并封锁对应端点（小田急 key 泄露 → 端点 403 封锁 → 前端显示“暂无延误情报”）

安全加固不得回退：Host 头校验（防 DNS rebinding）、敏感路径拦截（/.work//.git//scripts/ 等）、关闭目录列表（防结构泄露）、错误响应不回显内部细节

服务端不引入业务逻辑：本项目无传统后端，所有业务在浏览器端完成

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

<html lang="ja"> 固定不变——页面语言由 lang-init.js 运行时切换，DOM 不随语言重写

所有交互/数据容器必须有稳定 id（供 JS 定位），视觉样式统一 pixel-* 类（pixel-header / pixel-card / pixel-footer / pixel-tabs）

禁止内联 script 与 style（CSP script-src 'self' / style-src 'self'）

页面内禁止硬编码多语言文案：静态文案用 data-i18n，动态文案由模块渲染时经 translations.js 取词

资源引用一律相对路径 ../ 且带 ?v=4.3.xxx

#### 3.10.2 各页面结构清单

| 页面 | 主体容器（必须存在的 id/class） | 专属 CSS | 专属模块（js） |
| --- | --- | --- | --- |
| home.html 搜索首页 | #searchContainer.search-card（搜索卡：search-inputs 双 input-group + #searchResults）+ #smModule.sm-module（观光推荐：sm-location-bar → #smTagFilters → #smGrid + #smEmpty） | tourism-styles.css | search-ui / route-search / route-timetable / fare-estimator / sightseeing / tourism-proximity / history |
| realtime.html 运行情报 | #realtimeFilterBar.rs-filter-bar + #realtimeStatusContainer.pixel-card（状态卡列表）+ #lineDetailModal.rs-modal（线路详情弹窗） | realtime.css | realtime-view / data-state / delay-translator / line-presentation-service / running-chain-resolver |
| tourism-spot.html 景点详情 | section.tab-content.active → .tourism-detail-page → #articleContainer（内容由模块渲染） | tourism-styles + tourism-spot.css + leaflet/maplibre | tourism-core / tourism-spot / sightseeing / tourism-proximity / leaflet + maplibre（地图三件套） |
| tourism-event.html 活动详情 | section.tab-content.active → .tourism-detail-page → #articleContainer（内容由模块渲染） | tourism-styles + tourism-event.css + leaflet/maplibre | tourism-core / tourism-event / sightseeing / tourism-proximity / 地图三件套 |
| tourism-shop.html 店铺详情 | section.tab-content.active → .tourism-detail-page → #articleContainer（内容由模块渲染） | tourism-styles + tourism-shop.css + leaflet/maplibre | tourism-core / tourism-shop / sightseeing / tourism-proximity / 地图三件套 |
| history.html 搜索历史 | #historyContainer.pixel-card → #historyEmpty + #historyList | tourism-styles.css | history |

#### 3.10.3 资源引用规范（脚本链顺序）

每个页面底部脚本按以下顺序加载（分层，禁止跳层）：

基础：db-loader.js → translations.js → common.js → lang-init.js（详情页可不引 common）

数据层：odpt-links.js → odpt-lazy.js（仅 home 惰性）→ odpt-unified.js → runtime-config.js → data-layer.js / data-state.js / data-fusion.js / station-resolver.js / train-position-estimator.js / running-chain-resolver.js 等

业务层：line-presentation-service.js / route-search.js / fare-estimator.js / train-icons.js / route-timetable.js / sightseeing.js / tourism-proximity.js 等

展示层：页面控制器（search-ui.js / trains-page.js / realtime-view.js / tourism-*.js / history.js）最后加载

数据文件（data/core/*.file.js、data/timetables/*-manual.js、vehicle-type-map.js）按页面所需注入，位置遵循其所属层。

变更规则：

新增页面必须遵循 3.10.1 骨架；属于站内主功能的一律登记进 nav.pixel-tabs（详情页例外）

新增/删除容器 id：必须同步更新引用模块；变更后 bump 相关资源 ?v=（一个版本号覆盖该页面全部资源）

新增脚本：按 3.10.3 顺序插入，禁止插在页面控制器之后

页面级改动（容器结构/资源清单）必须在本节同步登记

## 4. 全局统一格式与开发规范

> 本章为通用规范，适用于全部代码、数据与文档；与第 11 章开发规则同属“通用规则”主体。特殊线路/模块的专门规则另见文档后部“特殊规则”部分。

### 4.1 目录文件命名规范

目录：全部小写（data/、css/、js/、pages/、scripts/、fonts/、images/、archive/、recovery/、work/、.work/；.github/ 为 CI/CD 配置目录）

页面：pages/*.html 小写 kebab-case（home.html、trains.html、realtime.html、tourism-spot.html、history.html）

JS 模块：js/*.js 小写 kebab-case（data-fusion.js、route-search.js、tourism-core.js）

CSS：全局 style.css + lang-bar.css；页面专属按页命名（trains.css、realtime.css、tourism-*.css）

数据：源 JSON 小写下划线（railway_data.json、station_i18n.json、tourism_data.json）；构建产物 *.file.js；manual 时刻表 <RailwayId>-manual.js（vehicle-type-map.js 同目录）

图片：images/ 按业务主题分子目录，文件名全库唯一；列车子目录按型番系/形 + 涂装样式括弧命名

禁止：文件名含中文/空格/大写（历史遗留例外须登记）；archive/ 只读，recovery/ 用后即清

### 4.2 代码命名、注释统一规范

模块结构：IIFE + 'use strict'；模块职责单一，文件头块注释声明职责与依赖

命名：全局导出 window.* 驼峰（RailwayDB、ODPTClient、STATION_COORDS）；函数/变量驼峰（resolveStationName、getTrainPositions）；常量 UPPER_SNAKE（STORAGE_KEY、MAX_HISTORY、PROXY_TARGETS）

注释：复杂逻辑必须行内注释说明意图；数据修正/特殊分支标注版本号与依据

版本化：修改模块必须 bump 资源 ?v=4.3.xxx（一个版本号覆盖该页面全部资源）；防浏览器缓存命中旧版

生成文件：*.file.js 等构建产物禁止手工编辑，改源数据后重跑生成脚本

代码校验：JS 改动提交前 node --check 通过

### 4.3 页面、路由命名规范

页面文件：kebab-case（见 4.1）；主功能页（home/trains/realtime/history）在 nav.pixel-tabs 登记；详情页（tourism-*）无 tab

容器 id：驼峰、语义明确（searchContainer、trainsDetailView、realtimeStatusContainer、lineDetailModal、historyContainer）

样式类：基础组件统一 pixel-* 前缀（pixel-header/pixel-card/pixel-footer/pixel-tabs）；功能类按模块（rs-filter-bar / tp-line-map / sm-module）

路由：pages/home.html 为唯一入口；页面间跳转经链接/URL，不伪造路由状态

### 4.4 多语言文案格式规范

词表：文案统一入 translations.js，key 按模块分层（app.*trains.*op.* 等）；禁在页面/模块内硬编码显示文案

引用：静态文案 data-i18n；动态文案 window.t(key) 取词，缺词回退默认语言（ja）

覆盖：新增/修改文案必须 4 语言齐全（ja/zh/ko/en）；站名等数据类多语言入 station_i18n.json / name_map，不分散写入

原文保留：ODPT 原文（运行情报 text、站名）不翻译——realtime 弹窗直接显示原文全文；专名/ID 保留原文

语言切换：lang-init.js 统一处理（i18n_lang 存储 + onLanguageChange 监听），模块不自行管理语言状态

方向词：ODPT 方向词（Inbound/Outbound/Northbound/Southbound/Eastbound/Westbound 等）统一映射为 ▲/▼ 方向标签，不显示方位词原文与译文；方向标签形态见 5.4 列车标签

### 4.5 铁道数据录入统一规范（线路 / 车站 / 颜色 / 排序）

线路：线路 ID（RailwayId）以 ODPT 为准；新增线路须同步登记 UNIFIED_LINES、LINE_TO_OPERATOR、LINE_RAILWAY_CODE；ODPT 无数据线路才允许手工时刻表（<RailwayId>-manual.js）

车站：站 ID + 坐标（lat/lng 真实核验）；站序、换乘（同名合并/异名映射）、站台/检票口/出口均结构化登记，不分散写入

颜色：线路色以官方口径为准（ODPT/官网）；色块徽章文字用线名，不另行自定义颜色

排序：线路显示排序经 line-presentation-service.js；观光排序按距离/规则，不硬编码散排

权威与核验：订正以 ODPT 为权威源；车型“不编造、核验有据才升、不确定保持候选”；改后跑校验脚本（verify_through_vtype.js 等）+ node --check

冻结：railway_data.json 等冻结数据修改走第 11 章 Freeze 例外，改后重跑 gen-file-data.js

### 4.6 UI 视觉统一规范（字体、间距、配色、SVG 绘制规则）

字体：fonts/ 像素字体为唯一来源（ja/ko/zh-hans/zh-hant/latin），禁止系统字体替代

配色：站点主色 #008803（theme-color）；线路色官方口径；组件统一 pixel-* 类，不逐页散改

布局：统一 header（pixel-header）/tabs/页脚骨架（见 3.10.1）；卡片统一 pixel-card 间距

SVG 线路图：绘制规则（直线/环线/异常环/支线画法、尺寸、触控）见 5.4 线路图设计规定（SVG 渲染标准）

双档验收：桌面 + 移动（约 410px 容器）双档实测，无溢出、无文字穿线、无 JS error

### 4.7 接口命名、参数格式统一规范

模块接口：全局导出 window.* 驼峰；方法名“动词 + 对象”驼峰（getTrainPositions / resolveStationName）

ODPT 封装：统一经 ODPTClient，参数为运营者代码（operator）；不绕过封装直连 ODPT

数据访问：统一经 RailwayDB（站名解析等），不跨层直读原始全局表（见 3.7 依赖方向）

坐标参数：统一 [lat, lng]（tourism_data.json coord / STATION_COORDS 一致口径）

版本化：接口变更必须 bump ?v= 并在对应章节登记

## 5. 前端设计

### 5.1 项目目录结构

完整目录职责表见 3.5。核心结构：

```text
像素铁道/
├── pages/                  # 7 个页面（见 5.2 全站路由清单）
├── css/                    # style.css 全局 + lang-bar + 页面专属
├── js/                     # 前端模块（数据/业务/展示三层，见 3.7）
├── data/
│   ├── core/               # 构建期数据 + db-loader.js
│   ├── api/                # odpt-unified.js / odpt-links.js
│   └── timetables/         # *-manual.js 人工时刻表
├── fonts/  images/         # 像素字体 / 素材
├── scripts/                # 数据治理脚本（i18n 审计/对齐/提交前检查）
├── .github/               # CI/CD 工作流（validate + 自动部署）
└── archive/  recovery/  work/  .work/   # 存档 / 修复 / 本地工作区
```

### 5.2 全站路由清单

| 路由（文件） | 页面 | tab | 说明 |
| --- | --- | --- | --- |
| pages/home.html | 搜索首页 | search | 唯一业务入口：路线/车站搜索 + 观光推荐 |
| pages/trains.html | 线路图+实时 | trains | 全线路像素风线路图 + 列车实时/推定位置 |
| pages/realtime.html | 运行情报 | status | 各线运行状态一览 + 线路详情弹窗 |
| pages/tourism-spot.html | 景点详情 | （详情页） | 共用 tourism-core.js 底座 |
| pages/tourism-event.html | 活动详情 | （详情页） | 共用 tourism-core.js 底座 |
| pages/tourism-shop.html | 店铺详情 | （详情页） | 共用 tourism-core.js 底座 |
| pages/history.html | 搜索历史 | history | 本地历史展示/清空/单条删除 |

页面间跳转：搜索结果显示线路 → trains.html；首页观光推荐 → 对应 tourism 详情页；主功能页均在 nav.pixel-tabs 登记（详情页例外）。

返回行为：线路图详情返回按钮一律回到线路一览——location.hash="" 清 hash 触发 hashchange 兜底显示列表；trains 页唯一返回入口 trainsBackBtn。

### 5.3 多语言实现方案

语言集：ja（默认）/ zh / ko / en，共 4 种；html lang="ja" 固定不变，运行时由 lang-init.js 切换 window.currentLang

存储：语言偏好写入 localStorage["i18n_lang"]

词表：translations.js（键值词表）；静态文案 data-i18n，动态文案由模块渲染时 window.t(key) 取词

模块：translations.js（词表）+ lang-init.js（切换/存储/监听 onLanguageChange）+ common.js + i18n-common.js（构建期合并包，不入库）

动态数据：运营公司名经 tOp() 动态翻译；ODPT 原文（站名/运行情报）不翻译——realtime 弹窗直接显示 ODPT text 原文全文，区间/原因解析仅作概览兜底（用户明确要求）

外部服务：MapTiler 瓦片按 language=langMap[currentLang] 取对应语言地名

### 5.4 线路图设计规定（SVG 渲染标准）

适用范围：所有线路图视觉元素——trains 详情页 SVG 线路图、线路卡片、状态徽章。单一事实来源：本规范 + js/trains-page.js GEOM 令牌 + css/style.css 设计变量；数值以 trains-page.js / style.css 实采为准，改动后需同步。

#### 5.4.1 基础前置规则（所有画法通用）

本节为全部画法共有的元素与规则（统一前置基线）：直线、环线（标准环）、异常环（六形环）、支线都必须先满足本节，再按各画法小节（5.4.2 环线布局 / 5.4.3 支线布局 / 5.4.4 线路与线宽）给出的处理方式与规格执行；本节未覆盖或与画法专属参数冲突时，以画法专属小节为准。


#### 5.4.1.1 画布基准
#### 5.4.1.2 尺寸速查表（移动端 / 桌面端最终值）
> 所有尺寸为 viewBox 逻辑坐标。SVG 通过 `width=100%` + viewBox 按比例拉伸到容器宽，移动端屏幕越宽实际像素越大，但 viewBox 内相对密度恒定。

**环线（scale6 = 移动 1.5 / 桌面 1.6）**：

| 项目 | 移动端 | 桌面端 |
| --- | --- | --- |
| 环宽 rectW | 72 | 76.8 |
| 环站距 spLoop6 | 39 | 41.6 |
| 左边距 leftMargin | 12 | 12.8 |
| 右边距 marginRight | 94（30+64） | 116（32+84） |
| 上下边距 marginTopBot | 60 | 64 |
| 支线列宽 BRANCH_COL_W | 144 | 153.6 |
| 分叉引出 BRANCH_STUB | 30 | 32 |
| viewBox 宽 svgW | 297 | 316.8 |

**直线型（_sc6 = 移动 1.5 / 桌面 1.3）**：

| 项目 | 移动端 | 桌面端 |
| --- | --- | --- |
| 支线标签字号 | 9 | 6.5 |
| 支线列宽 | 105 | 124.8 |

**固定尺寸（移动/桌面统一）**：

| 项目 | 值 |
| --- | --- |
| 普通站圆点 r | 7 |
| 换乘站圆点 r | 12 |
| 站名字号 | 16 |
| 支线站名 | 14 |
| 主线 stroke-width | 5（环线）/ 4（支线） |
| chip ICON | 16 |
| chip GAP | 2 |
| 行高 ROW_H | 18 |

#### 5.4.1.3 GEOM 设计令牌
| 令牌 | 值 | 含义 |
| --- | --- | --- |
| BRANCH_COL_W | 96 | 支线列宽（站名 16px 最长 6 字 + 换乘 chip 余量） |
| BRANCH_STUB | 20 | 主线 → 支线水平引出长度 |
| MAIN_BASE_W_MOBILE | 410 | 移动端基准画布宽 |
| MOBILE_CONTENT_W | 297 | 移动端内容区宽（= svgW 基准） |
| MAIN_BASE_W_MIN | 440 | 桌面画布宽下限 |
| MAIN_BASE_W_MAX | 820 | 桌面画布宽上限 |

• 数据来源：站序、站名、换乘、坐标一律来自 data/core 冻结数据（railway_data.json 等），画法只做渲染，不派生业务数据。

#### 5.4.1.4 字体体系（字体族/字号刻度/字重颜色）
| 项 | 值 | 来源 |
| --- | --- | --- |
| 主字体 | 'Fusion Pixel'（像素字体） | style.css @font-face |
| 语言包 | 拉丁 / 日文 / 简体中文 / 繁体中文 / 韩文（5 个 ttf） | style.css |
| 回退 | 'Courier New', monospace | style.css body |
| SVG 站名/支线名 | 显式 'Fusion Pixel', 'Courier New', monospace（原 sans-serif） | trains-page.js 934/1320 |

| 令牌 | 值 |
| --- | --- |
| --font-xs | 10px |
| --font-sm | 11px |
| --font-md | 13px |
| --font-lg | 14px |
| --font-xl | 16px |

| 元素 | 移动 | 桌面 | 来源 |
| --- | --- | --- | --- |
| 站名（普通/换乘/上方/下方，统一） | 16 | 16 | 928-932 |
| 换乘 chip 标记字号 | 12 | 10 | 408 |
| 延伸段线名 | 12 | 12 | 804 |
| 支线名 | 14 | 14 | 1318 |
| 方向文本（ldir） | 8 | 8 | 1675 |
| 直通时刻 | 11（compact 9） | 6 | 1082 |
| “+n” 溢出标记 | 7 | 7 | 1096 |

| 元素 | 字重 | 填充色 | 来源 |
| --- | --- | --- | --- |
| 换乘站站名 | 700 | 线色 | 933/935 |
| 普通站站名 | 500 | #555 | 933/935 |

• 站间距：sp = 换乘图标的高 + 一点空隙（共同规则，见 5.4.1.5），不再按站数分档。

• 顶部/底部留白：topP=18、botP=16（有直通标签时 +26）。

#### 5.4.1.5 站间距（换乘 chip 高度自适应，所有画法共用）
**公式**：站间距 sp = **换乘图标的高 + 一点空隙**（不再按站数分档；chip 底部不与相邻站圆点/站名重叠）。移动/桌面统一。

| 项 | 值 | 说明 |
| --- | --- | --- |
| 换乘图标的高 | 行数 × 行高 | chip 块实际高度 |
| 行高 | 18px/行 | = ICON 16 + GAP 2（渲染口径，见 5.4.1.3） |
| 行数 | ⌈min(换乘数, 16) ÷ 4⌉ | 每行最多 4、最多 4 行（4×4=16 上限，RuntimeConfig.TRANSFER_MAX_ROWS） |
| 一点空隙 | 32px | chip 底到下一站圆点的可见留白：1 行 11 / 2 行 9 / 3 行 7 / 4 行 5px |
| sp 取值 | 1 行 50 / 2 行 68 / 3 行 86 / 4 行 104 | = 行数×18 + 32 |

**统一方式**：全线所有站段取同一个 sp = 全线各站换乘图标的高 的**最大值** + 空隙（无换乘站按 1 行计）——大站（多行 chip）抬高全线所有段，视觉间距均匀。

**各画法适用**：
- 直线主竖列：每段 = sp。
- 环线双列（_colPitch / _colPitch6）：列内间距 = 该列各站 chip 高最大值 + 空隙，两列取最大；超基准环高时环高放大为 间距×(列站数−1)。
- 六形环：同环线双列。
- 支线竖列：段距 = sp；横排支线站距与右侧 stub 以 sp 为保底。

• 站名自适应：超宽时缩小字号（shrink, never clip），下限 10px；可用宽度由 data-clamp-avail 计算。

#### 5.4.1.6 站名自适应（clamp）
站名超宽时缩小字号（shrink, never clip），下限 10px（确保窄环/窄列站名完整放下）。

可用宽度由 data-clamp-avail 计算。clamp 规则（双列画法通用）：左列 tx−4、右列 svgW−2−tx；junction（岔路居右）走 max(40, floor(junctionX+loopRectW−7−4−tx))；尾段居左走 tx−4（tx=避让后右缘）。

• 触控目标（移动端）：下限 44×44px（iOS HIG / MD3）；列表项下限 48px 高。

#### 5.4.1.7 触控与间距（移动端）
| 项 | 值 |
| --- | --- |
| 触控目标下限 | 44×44px（iOS HIG / MD3） |
| 列表项下限 | 48px 高 |
| 线路卡片 | --pad-lg（12px 14px） |

• 缩放系数：线路图整体移动端 1.5、桌面端 1.6（所有画法统一）；站名/标记内 _sc6 移动端 1.5、桌面端 1.3（所有画法）。

#### 5.4.1.8 数据来源
• 外部数据源：ODPT 公共交通开放数据（www.odpt.org）——实时位置、时刻表、运行情报。

• API 端点：https://api-challenge.odpt.org（挑战版/开发）、https://api.odpt.org（正式版/运行）。

• 浏览器 CSP：connect-src 白名单放行 api-challenge.odpt.org 与 api.odpt.org。

• ODPT 无数据的线路由人工时刻表补全（data/timetables/*-manual.js），不改变画法。

验收 SOP（通用基线）——绘制任何线路前/后逐项核对：

• 车站节点：普通站 r=7（fill=线色、stroke=#fff、线宽 2）；换乘站 junction r=12（fill=#fff、stroke=线色、线宽 2）。

• 站名偏移：普通站水平 10 / 换乘站水平 14（均 ≥ r+2）；top 普通 y-10 / 换乘 y-14；bottom 普通 y+15 / 换乘 y+19。

• 站名文本：与圆点同行、垂直居中（dominant-baseline: central，ty=圆心）。

• 换乘 chip：ICON=16、GAP=2、每行上限 4（窄列 3/2）、行数上限 4（v4.3.849，TRANSFER_MAX_ROWS=4，4×4=16）、溢出 +n；chip 必须有一边与站名文字侧边对齐；顶部 ty+14（换乘）/ty+9（普通）。

• 字体：全局唯一 Fusion Pixel（回退 Courier New/monospace）；站名字号 16px（移动/桌面统一）。

• 站间距：全线统一 = 全线最高换乘图标的高 + 一点空隙（max(行数)×18 + 32；详见 5.4.1.5）。

• 顶部/底部留白：topP=18 / botP=16（有直通标签 +26）。

• 站名超宽：shrink（缩小字号，never clip），下限 10px；可用宽度由 data-clamp-avail 计算。

• 触控目标（移动端）：≥44×44px；列表项 ≥48px 高。

• 缩放：线路图整体 移动 1.5 / 桌面 1.6；站名/标记内 _sc6 移动 1.5 / 桌面 1.3。

• 数据来源：站序/站名/换乘/坐标一律来自 data/core 冻结数据，画法只做渲染，不派生业务数据。

#### 5.4.1.9 车站节点（圆点规格与站名偏移）
• 车站节点：统一由 _renderStationNode 渲染——普通站 r=7（fill=线色、stroke=#fff、线宽 2）；换乘站 junction r=12（fill=#fff、stroke=线色、线宽 2.5）。

| 元素 | 半径 | fill | stroke | 线宽 | 来源 |
| --- | --- | --- | --- | --- | --- |
| 普通站 | r=7 | 线色 | #fff | 2 | 907-910 |
| 换乘站（junction） | r=12 | #fff | 线色 | 2.5 | 907-910 |

站名偏移随圆点联动：普通站水平 10 / 换乘站水平 14（均 ≥ r+2）；top 普通 y-10 / 换乘 y-14；bottom 普通 y+15 / 换乘 y+19；换乘 chip 下移（ty+11 junction / ty+7 普通）。验证：相邻站、环线双列、异常环（六形环）与 tail 列等各画法典型场景均无冲突（异常环窄列站名空间最紧处 -2px 亦通过）。

#### 5.4.1.10 站名文本与锚点（通用规则）
左右侧站名与圆点同行、垂直居中（dominant-baseline: central，ty=圆心）

| side | tx | ty | anchor |
| --- | --- | --- | --- |
| top | x | y-14（换乘）/y-10 | middle |
| bottom | x | y+19/y+15 | middle |
| left | x-14/x-10 | y（central） | end |
| dual（双列） | x-16/x-12 | y（central） | end |
| right（默认） | x+14/x+10 | y（central） | start |

#### 5.4.1.11 换乘图标 chip（规格与对齐）
| 项 | 移动 | 桌面 | 来源 |
| --- | --- | --- | --- |
| 图标尺寸 ICON | 16 | 16 | 969 |
| 图标间距 GAP | 2 | 2 | 970 |
| 行高 | 18（= ICON 16 + GAP 2，渲染口径） | 18 | 4.3.851（原 4.3.850 记 22） |
| 每行上限 | 4（窄列自适应降为 3/2） | 4 | 971/998 |
| 行数上限 | 4 | 4 | 4.3.849（4×4=16；原 972 记 2、4.3.613 记 3） |
| 溢出显示 | "+n" | "+n" | 989 |

对齐规则：换乘图标块必须有一边与站名文字侧边对齐——站名在圆点右侧（anchor=start）→ chip 左缘=文字左缘（ix0=tx）；站名在左侧（anchor=end）→ chip 右缘=文字右缘（ix0=tx-totalW）；上方/下方站名（anchor=middle）→ chip 居中于文字。空间不足时先降 PER_ROW（3/2）保持对齐，仅极端挤压才 clamp。

换乘 chip 顶部：ty+14（换乘站）/ty+9（普通站），避让圆点底缘 +2px。

#### 5.4.1.12 线路主线（线宽与透明度）
• 线路主线：线宽 5、透明度 1.0（各画法的衍生结构线见画法专属小节）。

#### 5.4.1.13 直通标记（箭头与留白）
| 元素 | 值 | 来源 |
| --- | --- | --- |
| 外圈 | r=8 | 1494 |
| 内圈 | r=3 | 1502 |

直通标记：标在直通关系的实际接续站（THROUGH_JOIN_STATIONS 门控：未定义=全部共用站兜底、空数组=不标、列站=仅这些站），站名带外侧 26px 留白（线首上/线尾下）。方向为 SVG 矢量箭头（不依赖字体字形）：该站在线路站表为线首→向上（∧ 形）、线尾→向下（∨ 形）、中间→向右（→ 形）；途经非接续站不标。

#### 5.4.1.14 列车标签（方向端点站名）
单标签：图标上/下方显示 “▼/▲方向端点站名”（箭头 + 方向端点站名），不单独显示上下行方向词与终点标签

方向映射：抽象方向词 Inbound/Outbound 与方位词 Northbound/Southbound/Eastbound/Westbound 统一映射为 ▲/▼ 方向标签，不显示方位词原文与译文


• 字体：全局唯一 Fusion Pixel（SVG 站名/支线名显式声明 “Fusion Pixel”, “Courier New”, monospace），回退 Courier New/monospace。

#### 5.4.2 环线布局（画法专属）

#### 5.4.2.1 标准环线（通用画法）

双列画法（JR 官方视觉为设计参考），站序按 data/core 冻结数据分为右列/左列两列，右列/左列各承载环线一个行驶方向的站序（不依赖具体线路）；站名空间 = 75×scale/侧。

| 项 | 值 | 说明 |
| --- | --- | --- |
| 环宽基准 | rectW=48 | 标准环线双列与异常环圆环部分统一 |
| 移动端环宽 | 72px（48×1.5） |  |
| 桌面端环宽 | 76.8px（48×1.6） |  |
| 画布宽 | svgW=rectW+150×scale（派生式） |  |
| 两侧站名空间 | 恒定 75×scale |  |
| 列内垂直站距 | 换乘图标的高 + 一点空隙（同 5.4.1.5 共同规则） | _colPitch 复用 _chipPitch |

验收 SOP（标准环线）——绘制完成后逐项核对：

• 双列分列：站序来自 data/core 冻结数据，右列/左列各承载环线一个行驶方向，未手工派生。

• 站名空间：每侧 75×scale（两侧恒定）。

• 环宽 rectW=48（移动 72=48×1.5 / 桌面 76.8=48×1.6）。

• 画布宽 svgW=rectW+150×scale（派生式）。

• 站名与圆点同行、垂直居中（dominant-baseline: central）。

#### 5.4.2.2 异常环（通用画法）

环状但非标准圆环形态——环段分左右两列（站序按 data/core 冻结数据均分，不依赖具体线路）、站序流闭合（起点 junction → 左列下 → 环底 → 右列下 → 右列上 → 环顶 → 左列上 → 闭合）、支线从环左/右侧 1/2 处展开。此类画法称“六形环”（环段分双列、整体轮廓近似“六”字）；画法规则通用，不绑定任何线路，不依赖特定线路的站名/站数，任何满足双列异常环形态的线路均适用。布局：junction 位于环左缘（y=loopCy−0.5/列数×rectH，中点偏上；junction 位于环左半，故从左侧展开）；左列（顶→下）与右列（顶→下）站序由冻结数据按站序流规则分配。

尾段（tail，站数由数据决定）：从 junction 水平 stub 向外侧垂直展开——stubX=max(leftMargin+10×scale, leftMargin+10+尾段最长站名宽)（竖线位置：尾段站名居左后，全尺寸文字左缘仍 ≥ leftMargin）。

站名侧（按端区分，v4.3.846）：桌面端——主干左列统一居左（上/下一致）、右列居右、junction 岔路居右；枝干尾段站名居左，右缘动态避让左列上方站名带（文字带 y±8 重叠且右缘越过其左缘 → 右缘左移 4px；画布左限由 clamp 缩字兜底）。移动端——环左列主干站站名改朝右进环内（窄屏根因：尾段与环左列两组朝左站名 x 范围重叠）；尾段站名仍居左，避让循环关闭（环左列已朝右，无重叠对象）。

三区分离（桌面）：尾段文字带 | stub 竖线 | 左列上方站名带 | 环 互不重叠（双侧 gap 10px），尾段不再触发避让（全尺寸无 clamp）、左列上方无穿线。移动端容器 1:1 硬约束（v4.3.846）：环宽 loopRectW 撑满剩余宽度、右边距 marginRight 收窄（92→64），环左列站名朝右进环内，尾段避让关闭；尾段站名居左若与环内线路重叠，仍以白色描边（paint-order stroke 3px）遮线。

junction 的 left 站（站名居右）走窄空间 clamp（到右列圆点前）。右列站名空间 = marginRight−16。环高 = 标准环线基准环高 + 换乘 chip 高度动态放大（_colPitch6，列内站距同 5.4.1.5 共同规则）；svgH 计算 max(rectH+120, 2×(marginTopBot+环半高+tailTotalHeight))。

站名 clamp 规则：双列左列 tx-4、右列 svgW-2-tx（通用）；junction（岔路居右）走 max(40, floor(junctionX+loopRectW−7−4−tx))；尾段居左走通用 tx-4（tx=避让后右缘，长站名经 clamp 缩字兜底）。

| side | tx | ty | anchor |
| --- | --- | --- | --- |
| left（六形环枝干站（尾段站）：桌面站名居左——右缘避让左列上方站名带（文字带 y±8 重叠即避让，被避让站右缘左移、画布左限由 clamp 缩字兜底；桌面三区分离后避让不触发、全 16px）；v4.3.846 移动端避让循环关闭、尾段仍居左 tx=x−10；junction 保持岔路居右） | 尾段站：左 x−10（桌面避让时右缘=左列站名左缘−4）；junction：右 x+14 | y（central） | 尾段站 end / junction start |
| left（六形环主干环站·左列：桌面统一居左、与左列下方一致、三区分离后无穿线；v4.3.846 移动端改朝右进环内 tx=x+10、anchor=start，避免窄屏与尾段站名重叠） | 桌面 x−10（上方）/ x−14 或 x−10（下方）；移动端 x+10 | y（central） | 桌面 end / 移动端 start |
| left（六形环环周模式 tail） | x+14/x+10 | y（central） | start |
| right（六形环环周均布，停用） | x-14/x-10 | y（central） | end |
| right（六形环右列，双列） | x+14/x+10 | y（central） | start |

验收 SOP（异常环）——绘制完成后逐项核对：

• 环段左右双列：站序按 data/core 冻结数据均分，不依赖具体线路。

• junction 在环左缘：y=loopCy−0.5/列数×rectH（中点偏上）。

• 站序流闭合：junction→左列下→环底→右列下→右列上→环顶→左列上→闭合。

• 尾段（tail）：stubX=max(leftMargin+10×scale, leftMargin+10+尾段最长站名宽)；尾段站名居左后全尺寸文字左缘仍 ≥ leftMargin。

• 站名侧：桌面主干左列统一居左（上/下一致）、右列居右、junction 岔路居右、尾段站名居左；v4.3.846 移动端环左列主干站改朝右进环内、尾段仍居左。

• 尾段避让（仅桌面）：文字带 y±8 重叠且右缘越过左列上方站名带左缘 → 右缘左移 4px；画布左限由 clamp 缩字兜底。v4.3.846 移动端避让循环关闭（环左列已朝右进环内，无重叠对象）。

• 三区分离（桌面）：尾段文字带 | stub 竖线 | 左列上方站名带 | 环 互不重叠（双侧 gap 10px）。

• 移动端（v4.3.846）：容器 1:1 环宽撑满剩余宽度、右边距收窄；环左列站名朝右进环内；尾段避让关闭；尾段居左若与环内线路重叠仍以白色描边（paint-order stroke 3px）遮线。

• clamp：左列 tx-4 / 右列 svgW-2-tx；junction（岔路居右）max(40, floor(junctionX+loopRectW−7−4−tx))；尾段居左 tx-4（v4.3.846 移动端尾段 clamp 统一走 tx-4 向左空间）。

• 右列站名空间 = marginRight−16；环高 = 标准环线基准环高 + chip 高度动态放大（同 5.4.1.5 共同规则）。

#### 5.4.3 支线布局（画法专属）

支线站（数据覆盖）：tx=bx+10、ty=bsy（central），同普通站规格。

#### 5.4.3.1 支线类型判定

支线按两维度交叉判定：①数量——单支线（1 条）/ 多支线（≥2 条）；②非 junction 站数——短（≤4 站）/ 长（>4 站）。组合为五类情况：单短（单支线、≤4 站）、单长（单支线、>4 站）、多短（多支线、全部 ≤4 站）、多长（多支线、全部 >4 站）、长短不一（多支线、长短混合）。画法归属：单支线（无论长短）一律右侧弯折；多支线按每条非 junction 站数独立画法——短横排、长竖列。

#### 5.4.3.2 单支线（单短 ≤4 站 / 单长 >4 站）

保持右侧弯折（现状，明确单支线不横排）——junction 行水平直 stub（无下移拐弯）+ 垂直列；右侧 stub 叉出段 ≥ 标准站间距（sp：_branchStubR=Math.max(GEOM.BRANCH_STUB, sp)）；竖列第一站与 junction 同一水平行、竖线只画到最后一站。单短与单长画法相同，仅竖列长度不同（短 ≤4 站竖列短、长 >4 站竖列长）。

#### 5.4.3.3 多支线全短（≥2 条，全部 ≤4 站）

全部水平直线横排（h）——每条支线从 junction 圆点直接一条水平直线延伸到最后一站（无 stub、无竖列、无拐弯）；支线站横排（跳过 junction，主干已画），站距 = 全支线最宽站名 + 标准站间距（sp）；站名居左与圆点同行（anchor=end）、支线名放远端上方。位置：全部横排时保持全左（现状，不回归）。

#### 5.4.3.4 多支线全长（≥2 条，全部 >4 站）

全部竖列（v）——每条支线 junction 行水平直 stub（无下移拐弯）+ 垂直列；bx=mainCx−_branchStubL−同侧序号×_branchColW（_branchStubL=主干最大站名宽+22，避开主干居左站名带 gap 10；_branchColW=max(96, 该侧支线最大站名宽+14)，列间竖线不穿前列名带 gap ≥4）、站名居左（tx=bx−10，anchor=end）、支线名居左；竖列第一站与 junction 同一水平行、竖线只画到最后一站。位置：全部竖列时支线在左，_bCol 同侧序号（0/1…）从左排列。

#### 5.4.3.5 多支线长短不一（≥2 条，长短混合）

每条支线独立画法（短横排 / 长竖列）；位置规则：竖列支线在左、横排支线在右（仅当存在竖列支线时）。支线 junction 站——接续站为支线站表中第一个出现在主干站表中的站（不限于 stations[0]，站表末位同样命中；站序自 junction 向下延伸）——站名：存在右支线时转圆点上方居中 + 白色描边（paint-order stroke 3px 遮主干竖线），否则主干站名居右（tx=mainCx+12、anchor=start；junction 岔路居右窄空间 clamp 走 max(40, floor(junctionX+loopRectW−7−4−tx))）——直 stub 不穿 junction 站名带。

#### 5.4.3.6 支线几何参数

| 参数 | 值 | 含义 / 适用 |
| --- | --- | --- |
| 支线类型阈值 | 非 junction 站 ≤4 / >4 | ≤4 → 短（横排）；>4 → 长（竖列）；单支线不论长短均右侧弯折 |
| _branchStubL | 主干最大站名宽 + 22 | 左侧竖列 stub 长；避开主干居左站名带 gap 10 |
| _branchColW | max(96, 该侧支线最大站名宽 + 14) | 支线列宽；列间竖线不穿前列名带 gap ≥4 |
| 竖列站名 | tx=bx−10，anchor=end | 居左 |
| 横排站距（_branchHSp） | 全支线最宽站名 + sp | 短支线横排站距 |
| 右侧 stub（_branchStubR） | max(GEOM.BRANCH_STUB, sp) | 单支线右侧竖列 stub 叉出段 |
| 竖列第一站 | 与 junction 同行 | _bK=0 |
| 竖线终点 | junction 行 + (独有站数−1)×sp | 竖列支线竖线只画到最后一站 |
| junction 站名（有右支线） | 圆点上方居中 + 白描边 paint-order stroke 3px | 遮主干竖线 |
| svgW | max(_baseW, mainCx + 右侧需求 + _rightPad) | 右侧需求含右横排支线长 + 站名带 |
| mainCx | max(_baseW/2, _leftNeed + 20) | 画布中线 |
| svgH | 超主干底时 max(原 svgH, 支线底 + sp + botP) | 竖列支线底部计入 |

验收 SOP（支线）——绘制完成后逐项核对：

• 类型判定：先按数量（单/多）、再按非 junction 站数（≤4 短 / >4 长）确定五类归属（单短/单长/多短/多长/长短不一）。

• 单支线（单短/单长）：右侧弯折——junction 行水平直 stub + 垂直列；右侧 stub 叉出段 ≥ sp；第一站与 junction 同行；竖线只画到最后一站。

• 多支线全短：全横排全左——每条从 junction 圆点水平直线延伸到最后一站（无 stub/竖列/拐弯）；站距 = 最宽站名 + sp。

• 多支线全长：全竖列全左——bx=mainCx−_branchStubL−同侧序号×_branchColW；列间竖线不穿前列名带（gap ≥4）；第一站与 junction 同行；竖线只画到最后一站。

• 长短不一：竖列左、横排右；junction 站名存在右支线时转圆点上方居中 + 白描边（paint-order stroke 3px），否则主干站名居右。

• 站名侧：支线站居左（tx=bx−10、anchor=end）；存在右支线时 junction 站名转圆点上方居中 + 白描边，否则主干站居右（tx=mainCx+12、anchor=start）——直 stub 不穿 junction 站名带。

• 画布：svgW=max(_baseW, mainCx+右侧需求+_rightPad)，右侧需求含右横排支线长+站名带；mainCx=max(_baseW/2, _leftNeed+20)；竖列支线底部计入 svgH。

#### 5.4.4 线路与线宽（画法专属，主线通用）

| 元素 | 线宽 | 透明度 | 来源 |
| --- | --- | --- | --- |
| 主线 | 5 | 1.0 | 633 |
| 环线外框（标准环） | 5 | 0.35 | 737 |
| 六形环结构线 | 3/5 | 1.0/0.35 | 633-664 |
| 延伸段 | 4 | 0.5 | 794-800 |
| 支线 | 3 | 1.0 | 1282-1294 |
| 并行线 | 3 | 0.55 | 822 |

#### 5.4.5 图标体系（卡片侧）

| 项 | 值 | 来源 |
| --- | --- | --- |
| --badge-size | 36px | style.css |
| fallback 图标框 | 36×36（内图 28×28） | style.css .rs-line-icon-fallback |
| 徽章内字号 | 11px | style.css .rs-code-badge |

来源：train-icons.js LINE_ICONS / OPERATOR_ICONS（映射表，无尺寸定义）

渲染尺寸继承卡片徽章（36px 容器）

#### 5.4.6 现状不统一项（待统一）

| # | 问题 | 位置 | 建议 |
| --- | --- | --- | --- |
| 1 | 直通时刻字号 11/9/6 三档分散，桌面仅 6px 过小 | 1082 | 并入字号刻度表，桌面提到 8 |
| 2 | “+n” 溢出标记 7px、方向 8px 为裸数字，未入令牌 | 1096/1675 | 抽为令牌 |
| 3 | 换乘标记字号（12/10）与 chip 图标（16）无命名关系 | 408/969 | 统一命名（TX_*） |

### 5.5 全局公共组件设计

| 组件 | 结构/类 | 说明 |
| --- | --- | --- |
| 站点头 | header.pixel-header > .header-container | 标题 + 语言切换 |
| 语言切换 | #langSwitcher.lang-switcher + .lang-options | 4 语言下拉 |
| 导航 | nav.pixel-tabs | search/status/trains/history 四 tab |
| 搜索卡 | #searchContainer.search-card | 起终点输入 + 结果列表 |
| 观光推荐 | #smModule.sm-module | 位置栏 + 标签筛选 + 卡片网格 |
| 过滤条 | .rs-filter-bar | realtime/trains 共用样式 |
| 状态卡/线路卡 | .pixel-card | realtime 状态卡、trains 线路列表 |
| 详情弹窗 | #lineDetailModal.rs-modal | realtime 线路详情（ODPT 原文全文） |
| 地图 | .tourism-detail-page > #articleContainer | tourism 三页共用详情容器，含 Leaflet/MapLibre |
| 页脚 | footer.pixel-footer | data-i18n="app.footer" |
| 换乘徽章 | 线路图/换乘结果渲染 | 图标单一权威 = LOS ResolveIcon；同 icon 系统去重合并；无图线降级色块徽章（LOS 官方色 + 当前语言线名，截 4 字）；JR 东换乘排前 |
| 观光推荐卡 | .sm-module 卡片网格 | 定位失败显示空态（“位置情報が取得できません”），不提供备选站、无手动选站；排序有图优先、无图卡 56px 类别文字卡；标签多选 OR、按数据量排序、零数据标签不展示 |
| 换乘结果 | search-ui.js 渲染 | 乘车段两行结构（路线徽章 + 方向徽章 / 乘车区间）；方向恒取段终点站名；换乘动作文案零歧义（“在此换乘” / “换乘不需要”） |

JS 模块清单（数据/业务/展示三层）见 3.7。

### 5.6 响应式适配规范

视口：maximum-scale=1.0, user-scalable=no, viewport-fit=cover——禁止用户缩放，布局按视口宽度自适应

双档布局：桌面/移动两档，几何参数可分支（如线路图 _tailCap、svgW 缩放、clamp 缩字）

硬约束：线路图移动端容器 1:1 固定比例，放不下时走缩放/描边兜底（六形环移动端三区分离不可行时站名加白描边遮线）

验收：改动须在桌面 + 移动（约 410px 容器）双档实测，无 JS error、无溢出、无文字穿线

### 5.7 静态资源管理规范

版本化缓存：资源引用一律带 ?v=4.3.xxx；模块变更必须 bump（防浏览器命中旧版）

CSS：全局 style.css + lang-bar.css + 页面专属（trains/realtime/tourism-*）；禁内联 style（CSP）

本地 vendored：Leaflet / MapLibre GL 均本地存放（js/leaflet/js/maplibre/），不引 CDN

数据文件：data/core/*.file.js 为生成产物，禁手工编辑；*.manual.js 按 <RailwayId>-manual.js 命名

字体/图片：fonts/（像素字体）与 images/（按子目录归类）为唯一素材源

CSP：script-src 'self'、style-src 'self'、connect-src 仅 self + ODPT/MapTiler 白名单；新外部资源必须先登记

### 5.8 本地存储方案

现状（搜索历史）：history.js 写入 localStorage["pixel_tetsudo_search_history"]，上限 50 条（超限裁剪最旧）；条目含 id/timestamp/起终点（名称+ID）/耗时/路径/线路信息；支持单条删除与清空

语言偏好：localStorage["i18n_lang"]（见 4.3）

收藏（预留约定）：当前版本暂无收藏功能；如引入，沿用同一套机制——key 统一 pixel_tetsudo_* 前缀、JSON 数组、写入 try/catch 容错（localStorage 满/禁用时降级为内存态并 console.warn）、上限裁剪；收藏对象复用线路/车站/观光条目的规范 ID，不存渲染态 DOM

## 6. 数据层（本地底库 + ODPT 实时）

> 本项目无传统业务后端（无应用服务器、无 SQL 数据库、无后台管理界面）。"数据层"指 本地 JSON/JS 底库（静态基线）+ ODPT 实时通道（主源）+ serve.py（本地开发服务器/代理），以下按此如实描述。

### 6.1 系统模块划分

| 模块 | 文件 | 职责 |
| --- | --- | --- |
| 静态服务 | scripts/serve.py | 本地静态文件托管（127.0.0.1:8017） |
| 白名单代理 | scripts/serve.py（/api-proxy/） | 无 CORS 官方 API 的本地转发（PROXY_TARGETS 白名单） |
| 数据生成 | data/core/gen-file-data.js 等生成脚本 | 源数据 → *.file.js 构建产物 |
| 本地线路库 | data/core/railway_data.json + station_i18n.json | 线路/车站/坐标/关联/多语言（见 6.3.1） |
| 观光业务库 | data/core/tourism_data.json | 景点/活动/店铺/多语言（见 6.3.2） |
| 时刻表库 | data/timetables/*-manual.js + vehicle-type-map.js | ODPT 无数据线路的人工时刻表 |
| ODPT 客户端 | data/api/odpt-unified.js + odpt-links.js | 实时/时刻表/运行情报统一入口 |

服务端规则（白名单登记、key 不硬编码、安全加固不回退）见 3.9。

### 6.2 访问控制（serve.py 安全）

本项目无后台管理界面、无账号体系、无传统权限模型，不适用 RBAC/ACL。实际访问控制如下：

| 控制面 | 机制 |
| --- | --- |
| 服务绑定 | serve.py 仅绑定 127.0.0.1，外部网络不可达 |
| Host 校验 | 非 127.0.0.1/localhost/[::1] 拒绝（防 DNS rebinding） |
| 敏感路径 | /.work//.git//scripts/ 等路径拦截（防敏感文件下载） |
| 代理白名单 | /api-proxy/ 仅可转发 PROXY_TARGETS 登记端点（防 SSRF） |
| 密钥管理 | API key 走环境变量 / .work/serve.env（.gitignore 排除），不落代码；泄露即轮换并封锁端点 |
| 关闭目录列表 | 防目录结构泄露；错误响应不回显内部细节 |

### 6.3 数据文件体系

数据以 JSON/JS 文件 形式存放于仓库（无 SQL 数据库），由构建脚本生成浏览器可加载的 *.file.js 产物。

#### 6.3.1 本地铁道线路基础数据库（核心静态底库）

| 数据文件 | 内容 | 维护规则 |
| --- | --- | --- |
| data/core/railway_data.json | 线路（ODPT 推送 + 手工新增，以数据文件实际为准）、车站（含坐标/站序/换乘）、LOS 运行系统、站台/检票口/出口等关联 | 冻结数据：修改须 Freeze 例外，改后重跑生成脚本 |
| data/core/station_i18n.json | 车站多语言文本（ja/zh/ko/en） | 与线路库同源，改站名须同步 |
| data/timetables/*-manual.js | ODPT 无数据线路的人工时刻表（<RailwayId>-manual.js） | 仅 ODPT 无数据的线路允许手工整理；命名规范 |
| data/core/*.file.js | 构建产物（db-loader 加载） | 禁止手工编辑，由生成脚本（data/core/gen-file-data.js）重新生成 |

权威源：车站/线路数据以 ODPT API 为权威；车型/运行系统核验以官方页面为准。

#### 6.3.2 观光业务数据库

| 数据文件 | 内容 |
| --- | --- |
| data/core/tourism_data.json | 景点/活动/店铺三类条目：坐标、多语言文本（ja/zh/ko/en）、标签（labelForTags）、图片、出入口/距离锚点等 |
| 图片 | images/ 按业务主题分子目录，与条目 ID 对应 |

观光条目的验收口径：坐标必须真实可查（以实际地点/官方信息核验）；标签去 emoji 化；补图优先官方/可溯源来源。

### 6.4 ODPT 实时数据对接 & 双库联动策略

三通道获取（详见 3.8）：构建期生成 / 浏览器直连 ODPT（CSP 白名单）/ 本地白名单代理（无 CORS 官方 API）

唯一入口：所有 ODPT 请求经 odpt-unified.js；首页首屏走惰性模式（odpt-lazy.js）

联动链路：db-loader（本地基线）→ odpt-unified（实时/时刻表）→ data-fusion（实时优先、推定补缺）→ 业务层 → 展示层

双库联动：本地线路库为基线（LINE_TO_OPERATOR/LINE_RAILWAY_CODE 映射 ODPT）；匹配成功请求 ODPT，匹配不到（ODPT 无数据线路）使用本地 *-manual.js 时刻表，不发空请求

数据同步策略：

基线数据（线路/车站/观光）构建期固化进 *.file.js，运行时不再变更

实时/时刻表按需拉取（惰性），浏览器缓存 + ?v= 版本化刷新

无实时数据的线路由 train-position-estimator.js 按时刻表+延误推定补缺

ODPT 无数据的线路使用本地 manual 时刻表，不向 ODPT 发起空请求

降级与安全：官方端点不可用时前端兜底（小田急 403 → 显示“暂无延误情报”）；key 管理见 6.2

### 6.5 核心业务规则

数据权威：车站/线路订正以 ODPT API 为权威源；车型“不编造、核验有据才升、不确定保持候选”

运行情报：realtime 弹窗直接显示 ODPT text 原文全文，区间/原因解析仅作概览兜底；运行状态 = 官方 status 字段值 + cause

运行状态判定：仅明确“運転を見合わせ / 運転を中止 / 運転中止 / 全線運休”时判定为中断；部分运休（一部運休）显示 notice；有运行通知但非延误/非中断时显示 info。notice 与 info 状态图标均为全角“！”（黄色），不细分中断/延误。

推定显示：推定数据随页面加载初始化，容器内与实时同一外观；仅在容器外标注“*数据来自时刻表计算”

推定提示去重：推定提示（“*数据来自时刻表计算”）每视图最多 1 条，禁止重复堆叠

直通判定：“能连上就是直通”——存在直通运行事实即登记直通关系

冻结数据：railway_data.json 等冻结数据修改必须符合第 11 章 Canonical Data Freeze Rule（Freeze 例外）

显示同一性：数据不变规则与显示一致性要求见第 11 章「数据不变规则・显示同一性・其他硬规则」

其余硬规则以第 11 章开发规则为准

## 7. ODPT 接口与数据通道

### 7.1 全局请求 / 响应统一格式

本项目无自有 HTTP 业务 API（无服务端业务接口）。数据获取按形态分三类：

| 接口形态 | 入口 | 说明 |
| --- | --- | --- |
| 本地库模块接口 | window.RailwayDB 等（见 7.4） | 浏览器端读取构建期数据（线路/车站/观光） |
| ODPT 外部 API | window.ODPTClient（见 7.4） | 实时/时刻表/运行情报，经 CSP connect-src 白名单 |
| 本地代理 | /api-proxy/（serve.py） | 无 CORS 官方 API 的本地转发（PROXY_TARGETS 白名单） |

通用约定：

标识符：线路 ID（RailwayId）与车站 ID 以 ODPT / 项目数据为准（如 JC_Chuo_Rapid、Shinjuku、Nippori_Toneri）；不自行造 ID

版本化：模块接口随资源 ?v=4.3.xxx 版本化；接口变更必须 bump

CSP：connect-src 仅 self + ODPT/MapTiler 白名单；新端点必须先登记

错误与降级：fetch 失败/限流/403 由前端兜底（小田急 403 → 显示“暂无延误情报”）；ODPT 限流经 rateLimitedFetch 排队节流

缓存：ODPT 时刻表经 IndexedDB 缓存（RTCache / ODPTClient 内部缓存）；线路库经 localStorage 双键缓存——pt_db_v{ver}（railway+i18n，全页面共用）与 pt_tourism_v{ver}（tourism，仅观光相关页面）；页面级开关 PT_SKIP_TOURISM 可跳过 tourism_data.json 的下载/解析/缓存读写（realtime 等不需要旅游数据的页面）；localStorage 旧缓存自动迁移

### 7.2 全局错误码规范

本项目无自有 HTTP 业务 API，故无统一服务端错误码表。实际错误处理约定：

| 场景 | 处理 |
| --- | --- |
| 本地库模块接口读取失败 | 视为数据缺失（DATA-BLOCKED），不编造兜底内容 |
| ODPT fetch 失败 / 限流 / 403 | 前端兜底（小田急 403 → 显示“暂无延误情报”）；ODPT 限流经 rateLimitedFetch 排队节流 |
| 代理 /api-proxy/ 404/403 | 官方源代理请求失败 → 前端兜底显示（小田急 403 → “暂无延误情报”） |
| 缓存键冲突 / 版本过期 | 缓存键推进 + ?v= 版本化刷新 |

### 7.3 前台业务接口（读取本地线路库、景点、观光路线）

构建期数据经 db-loader.js（applyData）加载为浏览器全局，统一由数据层访问：

| 接口 | 形态 | 内容 |
| --- | --- | --- |
| window.RailwayDB | 数据访问对象 | 线路/车站数据统一入口（如 resolveStationName 站名解析，供搜索/历史/观光模块使用） |
| window.STATION_COORDS | { stationId: [lat, lng] } | 车站坐标表（来自 railway_data.json stations） |
| window.STATION_NAME_MAP / EN_STATION_NAME_MAP | { 日文站名: 多语言 } / 英文反查 | 站名多语言映射（来自 name_map） |
| window.UNIFIED_LINES | { lineId: 线路对象 } | 统一线路库（来自 railway_data.json lines） |
| window.RTCache | IndexedDB 读写（rtPut/rtGet） | 运行时缓存层 |

观光数据（景点/活动/店铺）同样经 db-loader 加载（tourism_data.json），由 sightseeing.js / tourism-core.js 提供推荐与详情读取。

### 7.4 ODPT 实时数据封装接口（实时运行/时刻表，与本地线路库匹配）

所有 ODPT 请求统一经 odpt-unified.js 的 window.ODPTClient：

| 方法 | 参数 | 返回内容 |
| --- | --- | --- |
| getTrainPositions(operator) | 运营者代码 | 列车实时位置（odpt:Train 列表） |
| getTrainInformation(operator) | 运营者代码 | 运行情报/延误信息 |
| getTimetable(operator) | 运营者代码（支持日历拆分解决 1000 条上限） | 列车时刻表 |

与本地线路库匹配机制：

LINE_TO_OPERATOR：线路 ID → 运营者映射（本地线路库经此找到 ODPT 运营者）

LINE_RAILWAY_CODE：线路 ID → ODPT railway 代码（resolveRailwayCode 解析）

匹配成功 → 请求 ODPT；匹配不到（ODPT 无数据线路）→ 使用本地 *-manual.js 时刻表，不发空请求

数据融合：odpt-unified（实时）→ data-fusion（实时优先、推定补缺）→ 业务层

### 7.5 后台管理接口（无，数据维护见 6.3）

本项目无后台管理界面、无账号体系，因此无后台管理接口。数据维护通过直接编辑数据文件（见 6.3）+ 构建脚本重新生成完成；访问控制见 6.2。

### 7.6 系统数据字典

本地线路库（railway_data.json，构建产物经 db-loader 加载）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| stations | { stationId: {lat, lng} } | 车站坐标（全库） |
| lines | { lineId: 线路对象 } | 线路库：多语言名称、车站序列、LOS 系统、站台/检票口/出口关联 |
| name_map | { 日文名: {ja,zh,ko,en} } | 站名多语言 |

观光业务库（tourism_data.json）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| spots / events / shops | 对象数组 | 景点/活动/店铺三类条目 |

本地存储

| Key | 内容 |
| --- | --- |
| pixel_tetsudo_search_history | 搜索历史（上限 50）：{id, timestamp, from/to, fromId/toId, fromName/toName, durationMin, path[], lineInfo[]} |
| i18n_lang | 语言偏好（ja/zh/ko/en） |
| IndexedDB RTCache | ODPT 时刻表运行时缓存 |

## 8. 部署与运维

### 8.1 本地开发服务器（serve.py）

本项目为纯静态站点 + 本地开发服务器，无独立服务器、无数据库服务器：

生产：GitHub Pages 静态托管（biubiu52011.github.io/Pixel-Tetsudo）

本地开发：scripts/serve.py（仅绑定 127.0.0.1:8017，外部不可达）

数据以仓库内 JSON/JS 文件形式存在，无运行时数据库进程

资源要求：纯静态文件（HTML/CSS/JS/图片/字体），无构建期外的计算资源需求

**本地启动**：

```bash
python scripts/serve.py
```

然后访问 http://localhost:8017/pages/home.html（双击 file:// 无法工作，数据走 fetch）。

数据加载成功标志：浏览器控制台（F12）输出线路/车站/观光条目计数。

### 8.2 CI/CD 构建部署流程

GitHub Actions 自动 CI/CD（.github/workflows/ci-cd.yml）：push/PR 到 main 触发 validate——括号平衡、实体保全、架构完整性、首页 UI 保全、localhost 引用、CSP 内联样式检查；push 通过后自动部署 GitHub Pages（pages.yml）。本地提交前验证流程：

数据改动（data/core/*.json 等）→ 重跑构建：node data/core/gen-file-data.js

node --check 全部 JS 语法校验 + 本地 python serve.py 实测

浏览器双档实测（桌面/移动），console 0 错误

提交并推送（push 到 main 触发自动部署）

版本化：每次发布 bump ?v=4.3.xxx 缓存键，旧缓存自动迁移/失效

### 8.3 环境变量配置清单

| 变量 | 位置 | 说明 |
| --- | --- | --- |
| ODPT API key 等 | .work/serve.env（本地开发） | 经 serve.py 注入代理请求；.gitignore 排除，不落代码；泄露即轮换并封锁端点（见 6.2） |
| 生产环境 | 无环境变量 | GitHub Pages 静态托管，ODPT 请求走浏览器直连（CSP 白名单）；key 管理见 6.2 |

### 8.4 静态资源、SVG、CDN 部署规范

静态资源：fonts/（像素字体唯一来源）、images/（按业务主题分子目录）、css/、js/（详见 5.7）

SVG：线路图全部 SVG 自绘（trains-page.js 渲染，非图片/Canvas），绘制规范见 5.4

CDN：无自有 CDN；第三方依赖走 CSP 白名单——ODPT API、MapTiler 瓦片（地图底图），新端点必须先登记（见 7.1）

### 8.5 日志、监控规则

无服务端日志与监控系统（静态站点）。实际质量门：

前端 console 治理（P3 记录，发布前 console 0 错误）

体检脚本（audit-coverage-final.js 等：本地线路库 vs ODPT 覆盖四维审计）

数据一致性审计见第 9 章

线上问题通过用户反馈 + 版本回滚处理（git 历史）

### 8.6 数据文件备份策略（本地线路库重点备份）

git 仓库即备份：data/core/railway_data.json 等冻结数据随仓库版本管理

冻结数据保护：修改必须符合第 11 章 Canonical Data Freeze Rule（Freeze 例外），改后重跑构建并提交

无独立备份系统；恢复 = 从 git 历史回滚数据文件 + 重跑构建

### 8.7 降级容灾方案（ODPT 失效优先走本地库）

ODPT 不可用 / 限流 / 403：

有本地 manual 时刻表的线路 → 直接使用本地数据，不发空请求

无 manual 的线路 → train-position-estimator.js 按时刻表+延误推定补缺

运行情报失效 → 前端兜底显示“暂无延误情报”（小田急 403 → 封锁数据源）

本地库损坏 / 数据缺失 → 从 git 回滚 + 重跑构建；数据缺失字段遵循 DATA-BLOCKED（不编造）

降级优先级：本地基线 > ODPT 实时 > 推定补缺 > 显式降级提示

## 9. 测试规范

### 9.1 核心测试场景

构建产物：node --check 全部 JS + 重跑 node data/core/gen-file-data.js 后 bundle 一致性

本地实测：python serve.py（127.0.0.1:8017）启动后浏览器访问全部页面

双档布局：桌面 + 移动（约 410px 容器）实测，无溢出、无文字穿线、无 JS error（见 4.6）

数据完整性：全量相邻站检测（>12km 仅允许真实远距，如 Tokaido Odawara-Atami 19km）

console 0 错误（页面加载 + 交互路径）

### 9.2 数据一致性测试（本地库 vs ODPT）

ODPT API 全量对比矫正（JR 东全量对比矫正、ODPT railway ID 映射全面修正）

覆盖审计：audit-coverage-final.js——本地线路库 vs ODPT 四维缺口（线路/车站/时刻表/实时）

直通一致性：tt_join_check BFS 多跳判定（接续站缺失修复闭环）

车型核验：vehicle-type-map.js 候选条目经官方/有力信息源核验（“核验有据才升、不确定保持候选”）

多语言：站名/文本 ja/zh/ko/en 四语覆盖检查（站名搜索多语言验证）

### 9.3 兼容性、性能测试标准

兼容性：Chrome 桌面/移动实测；CSP 合规（connect-src 仅 self + ODPT/MapTiler 白名单）；file:// 与 localhost 双方式可访问（经 db-loader 兼容）

性能：首页首屏惰性加载（odpt-lazy.js）；时刻表 IndexedDB 缓存（RTCache）避免重复请求；?v= 版本化缓存刷新

资源：SVG 自绘线路图渲染性能（六形环等复杂图元双档实测）

## 10. 风险说明 & 常见 FAQ

### 10.1 项目已知风险点

埼京线站序混入：stations 混入京滨东北线系车站（Urawa/Naka-Urawa 等），线路站序重构风险大，另立任务待处理（遗留）

远郊线路出口数据缺失：约 1500 站（东北/北陆/甲信越）无真实出口数据——无观光景点覆盖、wiki 数据稀疏（遗留）

车型候选待核验：vehicle-type-map.js 仍存在“（候选）”条目，需官方源核验后方可升级

ODPT API key 风险：曾发生 key 泄露，已有轮换 + 封锁机制，仍需持续治理

自动 CI 覆盖有限：GitHub Actions 仅做静态 guard 检查（括号平衡/实体保全/架构/首页 UI/localhost/CSP 内联样式），无浏览器端回归测试，视觉回归依赖手动流程

### 10.2 开发 / 部署 / 数据维护常见问题

Q：如何本地运行？ A：python scripts/serve.py（127.0.0.1:8017），必须通过本地服务器访问（file:// 部分功能受限）

Q：如何修改冻结数据（railway_data.json）？ A：走 Freeze 例外流程：修订记录追加「Freeze 例外」条目 → 修改冻结文件 → 重跑 node data/core/gen-file-data.js → 验证 → 提交

Q：为什么某线路没有实时数据？ A：ODPT 无该线路数据 → 使用本地 manual 时刻表 + 推定补缺，不发空请求

Q：实时弹窗内容看不懂？ A：弹窗直接显示 ODPT text 原文全文，区间/原因解析仅作概览兜底

Q：多语言（ja/zh/ko/en）有缺失怎么办？ A：补充须与权威源核对（数据权威规则），站名 i18n 同步更新（见 6.3.1）

Q：如何推送上线？ A：重跑构建 → node --check → 双档实测 → 提交推送 GitHub Pages

Q：图片/资源引用断了？ A：检查 images/ 子目录归类与条目 ID 对应；图库迁移后断链须清零

## 11. 开发规则（Hard Rules）

本文件定义了任何参与本项目的 AI agent 必须遵守的硬规则。
这些规则的优先级高于任何任务级指令。

### 11.1 线路层级规则（Line Hierarchy Rule，硬规则）

规则一：平级独立运营线（Peer Independent Service Line）的排他定义
满足以下任意一个条件的线路，即使共享同一路线记号（JC/JU 等）、即使物理上分叉或直通，也必须完全平级、独立的顶级节点（Parent Line），严禁被当作另一条的“支线（Branch）”嵌套合并：

独立爱称：拥有官方和乘客公认的不同运营线名称（例：中央线快速 JC / 青梅线 JC / 五日市线 JC 是三条独立主线；宇都宮线 JU / 高崎线 JU 是两条独立主线）。

独立大列表：拥有独立、完整的长途运行区间和独立车站大列表，不依附主线。
Line_ID 必须彻底解耦（JC_Chuo_Rapid / JC_Ome / JC_Itsukaichi 级别），并在“线路一览”一级大列表并列独立展示。

规则二：真正的内部支线（Branch Line）的嵌套规则
仅当线路在日常运营和向导看板上没有独立于父线的宏观运营系统名称（官方即称“XX线XX支线”，如：中央本线辰野支线、水郡线常陸太田支线、丸ノ内线方南町支线、千代田线北綾瀬支线、鶴見线海芝浦支线/大川支线）时，才判定为支线并强制执行嵌套：

数据模型：line 带 branchOf=<父线ID>，父线带 branches=[子线ID...]；严禁在一级总列表独立展示。

支线只能在父线详情/系统卡片内展示。

判定流程（不以物理线路形态为判定依据）：先问“乘客看板/运营系统叫什么”→ 独立运营名 = 平级顶级；官方叫“XX支线” = 嵌套。任何合并/嵌套前必须显式声明依据规则一还是规则二。

Agatsuma（吾妻线）、Miyo（弥彦线）等拥有独立运营名的线路均为平级顶级，branchOf 必须为 null。

规则三：运行系统（Line Operation System）与线路（Line）是两个维度——一条线路可以拆分为多个运行系统（按官方运行系统拆分，如某线按快速/各站停车/中距离分为 3 个运行系统），也可以多条线路共享一个运行系统（如两条独立线路同属一个通勤铁路运行系统）。线路卡（LOS）按运行系统组织，数据模型按线路（railway_data.json lines）组织；两者必须显式映射，不得混为一谈。（例：中央快速 JC 与中央本线 CO 是两个独立运行系统；横須賀线・総武快速线同属 JO 一个运行系统）

规则四：线路分断（物理分断后称呼可能消失）——一条线路因新线开通等原因物理分断为多段（含废线、转第三部门运营）后，“完整线路称呼”可能不再存在。此时不得保留虚构的整线：分断区间按各自运营主体/运行系统建卡，废线区间删除，LOS 卡移除整线、TRUNK 主线路由保留到仍存续的区间。

规则五：并行区间与换乘标记——两条线路在部分区间并行（各自停靠不同车站，或一条各停一条快速）时：换乘标记只标注实际共用站；不停车车站不得因并行而获得换乘标记；并行区间不等于直通区间，详情页延伸段不得按“端点相接”自动判定线路本名延伸（须显式白名单）。

规则六：直通列车识别——直通列车（跨线运行）的识别按车号规则判定：车号前缀/后缀与车籍系统一致（同社直通按车籍显示、跨社直通按车号前缀归属判定）；不依赖列车位置字段（ODPT odpt:Train 无车辆形式字段）。直通关系登记在服务关系层（THROUGH_SERVICE），“能连上就是直通”须有实际直通运行事实。

规则七：同名站 ID 与共有区间——不同线路的同名站必须分离为独立站 ID（同名站 ID 冲突会引发搜索瞬移/换乘误判）；同一线路在两线共有区间只登记一次换乘。两线共有的车站作为共有站处理（如两线最初站序一致时，共有区间为一段）。

规则八：线路 ID 命名规范——本地 line ID 必须以官方线路本名为准，禁止以终点站名误命名、禁止路线名误写、禁止与第三部门线路混同。ID 需修正时：冻结层（railway_data.json）+ 全库引用（stationLines/transferStations/lineStationOrder/station_i18n/name_map/LOS 卡/train-icons/odpt-unified 映射）同步修改；JSON 修改用文本级精确替换，禁用 json.dump 全量重写（浮点格式变化会产生大量伪 diff）。

规则九：线路删除范围清单——删除一条线路（或移除范围外线路）时，必须同步清理：lines 条目、专属站（无主后删除）、stationLines/lineStationOrder/name_map/station_i18n 引用、LOS 系统卡、common.js OP_ORDER、translations 运营者名、odpt-unified 运营商映射、train-icons/db-loader 图片引用、其他线 transferStations 指向该线的换乘标记（共用站保留车站本身、仅移除引用）。删除后核对线路总数。

### 11.2 系统优先变更规则（System-First Change Rule，硬规则）

任何新增、修改或删除操作都必须从当前完整系统状态出发，绝不能只从目标文件出发。

#### 11.2.1 变更前

1. 明确本次变更所服务的用户任务

2. 确认当前架构边界（哪个模块拥有什么）

3. 列出涉及的所有 Provider（提供方）/Consumer（消费方）关系

4. 检查历史实现、孤儿条目或废弃路径

5. 在系统模型内设计修改方案——而不是靠适配现有代码

#### 11.2.2 任何结构性变更后

必须重新检查以下所有项：

Provider → Consumer 链条完整

未产生新的孤儿

没有旧入口被重新引用

未引入重复实现

没有现有模块能力被削弱

没有 A+B 临时融合形成新的模糊边界

新功能没有错误继承旧框架

旧功能在变更后仍保留原有能力

### 11.5 关键原则

“能运行”不等于“正确集成进系统”。
如果局部改动与系统级设计冲突，应重新设计改动方案——绝不强行适配现有代码。

### 11.6 规则 9 - 全系统消费方保全（Rule 9 - Whole-System Consumer Preservation，硬规则）

任何新增、修改、迁移或删除操作都必须从当前完整的系统 Provider-Consumer-边界（提供方-消费方-边界）地图出发，绝不能只从目标文件出发。

### 11.7 变更前问卷（动代码前必须回答全部）

当前由哪个现有 Provider 提供这项能力？

现在有哪些 Consumer（直接与间接）？

每个受影响页面的核心是什么？

该功能属于哪个模块？

是否已有实现？

是否存在历史/废弃实现？

历史实现当初为什么未被使用？

本次变更会影响哪些 Consumer？

是否会制造新的孤儿？

是否会为同一职责创建第二套实现？

变更后系统职责地图会变成什么样？

### 11.8 迁移规则

将能力从 Provider A 迁移到 Provider B 时：

先把 A 的全部 Consumer 迁移到 B

逐个验证 Consumer 与 B 正常工作

之后才移除 A

执行全局孤儿清扫

### 11.9 删除规则

移除某项能力时：

确认剩余 Consumer 为零

确认没有历史文件会被未来的 AI 误认为是当前实现

记录本次删除

### 11.10 禁止并行实现规则

绝不因为“方便”就为同一职责创建第二个 Provider。
如果现有 Provider 无法满足新需求，应扩展它——而不是复制一套。

### 11.11 任务提示词规则

未来任务提示词必须写成：
“使用当前系统作为参照，完成功能 X。目标文件只是候选修改点，不是最终实现位置。”

绝不写成：修改 xxx.js 来实现 xxx。

### 11.12 新功能开发流程

每个新功能都必须遵循以下链条：

只读系统审计（基于基线的当前状态）

检查现有能力是否可复用

如需新能力：明确界定 Provider 边界

明确哪个模块核心拥有此功能

在系统边界内实现

消费方链条审计（所有 Consumer 均验证）

未来 AI 陷阱扫描（不留误导性条目）

全局产品走查（无跨模块回归）

发布门（Release Gate）检查

不得跳步。不得把文件级改动视为充分。

### 11.13 功能准入 / 系统影响评审（强制）

在任何新功能开发之前，agent 必须完成以下准入问卷。
这是所有未来功能开发的固定入口。

### 11.14 准入问卷（动代码前必须回答全部）

用户任务：该功能服务哪个用户任务？

页面归属：该功能属于哪个页面？

核心检查：该页面的核心是什么？此功能是强化还是稀释了核心？

能力分类：这是核心能力、辅助能力还是后台能力？

Provider 影响：会影响到哪个现有 Provider？是扩展还是替换？

Consumer 影响：哪些 Consumer 会受影响？逐一列出。

新数据入口：是否会创建新的数据入口？如果是，属于哪一层（UNIFIED_LINES / DataLayer / RailwayDB）？

显示解析器：是否会创建新的显示名解析器？如果是，必须经由 RailwayDB 路由。

孤儿风险：是否会导致任何现有模块变成孤儿？

A 换 B 退化：变更后，模块 A 是否仍保留全部原有能力？

遗留清理：变更后哪些旧代码应迁移、保留或删除？

### 11.15 A 换 B 退化检查（关键）

这是最重要的规则。它防止以下模式：

B 基于被修改过的 A 构建

A 的原有 Consumer 在过程中被破坏

之后 AI 发现 A 的旧代码，误以为它仍是当前框架

新功能挂接到孤儿的 A 上，而不是正确路径

检查模板：
变更前：A -> Provider -> Consumer_X, Consumer_Y变更后：A -> Provider -> Consumer_X（必须仍然可用）A -> NewPath（B 的新路径）Consumer_Y -> ?（绝不能变成孤儿）

> 变更后，归属模块是否仍向它所有的原始消费方提供相同能力？

如果任何 Consumer 失去了对其能力的访问，变更被拒绝，直到修复。

### 11.16 决策树

| 发现 | 行动 |
| --- | --- |
| 现有 Provider 可满足需求 | 扩展现有 Provider，不需要新建 |
| 需要新 Provider | 明确界定边界，记录到本附录 |
| 旧 Provider 可完全替换 | 先迁移所有 Consumer，再移除 |
| 有制造孤儿的风险 | 停止——以消费方保全为原则重新设计 |
| 无法回答第 10 问 | 停止——先调查完整消费方链条 |

### 11.17 能力归属检查（所有功能开发强制）

在完成 11 问准入后、做出任何实现决策之前，agent 必须回答这个问题：

“这项能力属于谁？”

### 11.18 能力归属图

| 能力 | 归属 | 边界 |
| --- | --- | --- |
| 线路/车站身份 | RailwayDB | resolveLineName, resolveStationName |
| 显示名（i18n） | RailwayDB | resolveLineName(currentLang) |
| 运营商显示 | RailwayDB | tOp(operatorId) |
| 运行时缓存 / 位置 | DataLayer | positions, regions |
| 实时融合 | DataFusion | 来自多源的数据统一 |
| 原始规范数据 | UNIFIED_LINES | db-loader.js 输入 |
| 运行系统分组 | LineOperationSystems (LOS) | lineIds 分组 + 系统名 (i18n) + 官方 HEX + 路线记号；系统卡唯一权威 |
| 搜索交互 | SearchUI | 表单处理、结果展示 |
| 历史记录 | History | 消费 SearchUI 输出，不拥有搜索逻辑 |
| 路线搜索 UI | Route 页 | 核心功能：“我怎么去？” |
| 实时状态 | Realtime 页 | 核心功能：“现在能坐吗？” |
| 观光 / 景点 | Tourism 页 | 核心功能：“到达后去哪玩？” |

### 11.19 逻辑挪用规则

如果模块 B 需要位于模块 A 内部代码中的能力：

情形 1：该能力属于 A 的职责

A 应将其暴露为公共方法 / Provider

B 调用公共 API，而不是 A 的内部实现

如果 A 无法合理暴露，扩展 A 的职责图

情形 2：该能力不属于 A

B 依赖错了模块

在上面的归属图中找到正确归属

将 B 的依赖改指向正确归属

绝不让 B 以捷径方式“潜入”A 的内部实现

### 11.20 反模式：B 借用 A 的逻辑却不回馈

以下模式绝不允许发生：
B 需要 X→ B 从 A 的内部复制/重写 X→ B 正常工作了→ A 从未获得 X→ A 的 Consumer 失去了对 X 的访问→ 未来的 AI 发现 A 的旧 X 代码，误以为仍是最新的→ 新功能 C 挂接到 A 的孤儿 X 上→ A+B+C 框架崩塌

每次变更都用这个问题检查：

如果答案是否定的，变更被拒绝。

### 11.21 已知债务（不需要自动修复）

| 债务 | 优先级 | 延期理由 |
| --- | --- | --- |

## 12. 架构基线（Architecture Baselines）

### 12.1 架构基线（Architecture Baselines）

### 12.2 数据不变规则・显示同一性・其他硬规则

### 12.3 规范数据冻结规则（Canonical Data Freeze Rule）

以下数据为锁定状态（默认冻结）。正常开发流程中不得直接修改；确需修改时必须走 Freeze 例外流程（见下），禁止绕过。

• data/core/railway_data.json：线路（ODPT 推送 + 手工新增，以数据文件实际为准）、车站（含坐标/站序/换乘）、LOS 运行系统、站台/检票口/出口等关联

• data/core/station_i18n.json：车站多语言文本（ja/zh/ko/en），与线路库同源

• data/core/line-operation-systems.js：线路运行系统卡（显示分组）

Freeze 例外流程（SOP）：①修订记录追加条目，标注「Freeze 例外」；②修改冻结文件（源 JSON，非构建产物）；③重跑构建 node data/core/gen-file-data.js；④验证（node --check 全部 JS + node scripts/verify_transfer_pairs.js 换乘配对规则五/七/九校验，退出码须为 0 + 渲染检查）；⑤提交（git 仓库即备份，随仓库版本管理）。

任何缺失的数据字段属于数据阻断（DATA-BLOCKED）：标注 DATA-BLOCKED 说明缺失字段与原因，不凭空编造内容兜底；确需补数据时按 Freeze 例外流程处理。

### 12.4 显示身份规则（Display Identity Rule）

RailwayDB.resolveLineName / resolveStationName / tOp 是唯一允许的显示名路径。
绝不实现第二个解析器。绝不在用户可见输出中直接使用 line.name / line.nameJa / line.nameEn。

### 12.5 三层数据架构规则（Three-Layer Data Architecture Rule）

| 层级 | 归属 | 职责 |
| --- | --- | --- |
| UNIFIED_LINES | db-loader.js | 原始规范线路对象（DataFusion 输入） |
| DataLayer | data-layer.js | 运行时缓存（positions、分组访问） |
| RailwayDB | db-loader.js | 规范查询 + 显示身份（i18n） |
| 每层有明确的职责。按正确的关注点使用正确的层。 |  |  |

项目使用三个有意的层级。不得合并它们：

### 12.6 无孤儿迁移规则（No Orphan-Generating Migration Rule）

将能力从模块 A 迁移到模块 B 时：

1. 找出 A 的全部消费方

2. 将每个消费方迁移到 B

3. 验证每个消费方与 B 正常工作

4. 然后才移除 A

5. 移除后执行全局孤儿清扫
消费方仍在引用时，绝不删除 Provider。

### 12.7 只读优先规则（Read-Only First Rule）

每个评审/审计阶段都以只读分析开始。只有在明确批准后才修改代码。

### 12.8 模块核心规则（Module Main-Heart Rule）

| 页面 | 核心 |
| --- | --- |
| Home | 路线搜索 |
| 路线搜索 | 我怎么去？ |
| 实时 | 现在能坐这条线吗？ |
| 线路详情 | 这条线是什么？ |
| 历史 | 我之前搜过什么？ |
| 观光 | 目的地有什么值得逛的？ |
| 任何模块不得劫持另一个模块的核心。 |  |

每个页面有且仅有一个核心：

### 12.9 发布门规则（Release Gate Rule）

打版本标签前：

1. 运行预检（Preflight）：git 状态、规范数据、脚本完整性、Provider 健康

2. 如果架构演进，先更新系统优先变更规则

3. 先提交规则更新，再打标签

4. 在新提交上打标签（不是旧 HEAD）

5. main 分支与标签一起推送

### 12.10 运行契约（Runtime Contract）

规范数据由 db-loader.js 通过 fetch 加载（railway_data.json / station_i18n.json / tourism_data.json）。

运行时常量由 data/config-bundle.js 一次性 <script> 引入（构建产物，禁止手改）。它由 data/core/gen-config-bundle.js 按序拼接 7 个源表生成：transfer-hints → runtime-config → through-service → line-operation-systems → platform-data → line-service-relations → train-type-defs。改任一源表后必须重跑 
ode data/core/gen-config-bundle.js。大三件（railway/tourism/i18n）保持独立文件以保留细粒度缓存，不并入 bundle。旧的 data-core-bundle.js 已删除。

file:// 协议会阻断 fetch（CORS），因此双击打开页面无法工作。项目必须通过 HTTP 服务：

python serve.py（本地静态服务器 + /api-proxy/ 官方 API 代理替代 python -m http.server 8017），然后打开 http://localhost:8017/pages/home.html

官方源代理：ODPT 未提供运行状况的线路（小田急 3 线/百合海鸥号）由 data/api/official-railway.js（window.OfficialRailway）经本地代理抓取官方 API——小田急 d6oynijiy33tb.cloudfront.net（x-api-key 公开 key）、百合海鸥号 cms-2.yurikamome.co.jp/api/operation/（无 key）。两个官方 API 均无 CORS 头，浏览器必须经 serve.py 的 /api-proxy/ 白名单端点转发（防 SSRF）。DataFusion 融合优先级：official（按 line.id）> ODPT > localStatus > fallback。

数据加载成功信号：console 输出 线路/车站/观光条目计数（数量以数据文件实际为准）。

唯一入口页面是 pages/home.html。不得在其他位置创建或恢复第二个 home.html。

## 13. 线路服务关系层设计（Line-to-Line Service Relation Layer）

> 任务：只读架构设计（READ-ONLY ARCHITECTURE DESIGN）

### 13.1 问题陈述

#### 12.1.1 三层架构的缺口

第 1 层：线路身份（railway_data.json lines[id]）
第 2 层：物理拓扑（stationLines + lineStationOrder）
第 3 层：显示分组（LineOperationSystems）

缺失：线路间服务关系（Line-to-Line Service Relation）

#### 12.1.2 具体缺口

| 缺口 | 症状 | 影响 |
| --- | --- | --- |
| 无直通运行表达 | Saikyo→Sotetsu→MinatoMirai→Rinkai：0 个共用站 | Realtime/Trains 无法展示实际服务关系 |
| 线路区间不完整 | Yokosuka 仅有 8 站（南段） | 无法从 stationLines 证明 Yokosuka–SobuRapid 直通 |
| 支线数据缺口 | Ome/Itsukaichi/ChuoKonosu/Sotobo/Uchibo：与父线 0 共用站 | branchOf 存在但 stationLines 未反映连接 |
| 别名歧义 | TobuIsesaki（code=TI）vs Isesaki（code=TIS） | 重复显示 |
| REGIONAL 语义模糊 | 52 线混杂，maxShared=54 来自 3 条别名线 | 无法区分真正相连的线路 |

#### 12.1.3 核心矛盾

LineOperationSystems 承载两个概念：

显示分组（UI 排序/徽章）

直通服务关系（运营意图，未实现）

这导致无法判断一个多线 OS 究竟是纯显示分组还是真实直通服务。

### 13.2 关系类型定义

| 类型 | 常量 | 含义 | 示例 |
| --- | --- | --- | --- |
| THROUGH_SERVICE | TS | 同一列车连续运行跨越两条线 | Saikyo <-> Kawagoe（Omiya） |
| PHYSICAL_CONNECT | PC | 线路共用车站/轨道连接 | Saikyo <-> ShonanShinjuku（共用 Omiya/Urawa） |
| BRANCH_OF | BR | 子线是父线的支线 | Ome -> ChuoRapid |
| ALIAS_OF | AL | 同一物理线路的不同命名 | TobuIsesaki <-> Isesaki（存疑） |
| DISPLAY_GROUP | DG | 仅 UI 分组，无运营含义 | JR_EAST/JO 徽章 |
| UNKNOWN | UN | 数据不足以判定 | TobuNikko <-> Nikkoku |

关键原则：SHARED_STATION >= 1 并不蕴含 THROUGH_SERVICE，仅蕴含 PHYSICAL_CONNECT（且仍需验证）。

### 13.3 数据模型 line-service-relations.js

新文件：data/core/line-service-relations.js

每条关系条目的结构：

id：string（唯一）

lineA：string（railway_data.json 的 line_id）

lineB：string（railway_data.json 的 line_id）

type：THROUGH_SERVICE | PHYSICAL_CONNECT | BRANCH_OF | ALIAS_OF | DISPLAY_GROUP | UNKNOWN

confidence：HIGH | MEDIUM | LOW | UNKNOWN

evidence：string（该关系的证明依据）

source：string（railway_data.branchOf / stationLines / manual）

active：boolean

与既有数据的关系：

railway_data.json（冻结 FROZEN）：lines[].branchOf → 映射为 BRANCH_OF 关系

stationLines[]：推导 PHYSICAL_CONNECT 证据

LineOperationSystems（保持不变）：继续作为显示分组来源

### 13.4 全部线路关系映射

#### 13.4.1 BRANCH_OF 关系（来自 branchOf 字段）

| 支线 | 父线 | 共用站 | 问题 |
| --- | --- | --- | --- |
| Ome | ChuoRapid | 0 | 数据缺口：Ome 仅 18 站，缺少连接站 |
| Itsukaichi | ChuoRapid | 0 | 数据缺口：Itsukaichi 仅 6 站 |
| ChuoKonosu | ChuoRapid | 0 | 数据缺口：ChuoKonosu 仅 6 站 |
| Agatsuma | Takasaki | 1（Takasaki） | 正常 |
| Sotobo | SobuRapid | 0 | 数据缺口：Sotobo 仅 3 站 |
| SuigunBranch | Suigun | 1（Kami-Sugaya） | 正常 |
| Uchibo | SobuRapid | 0 | 数据缺口：Uchibo 仅 4 站 |

结论：7 条支线关系中 5 条存在 stationLines 数据缺口。关系层以 confidence=LOW 记录。

#### 13.4.2 已验证的 THROUGH_SERVICE 关系

| 线路对 | 证据 | 置信度 |
| --- | --- | --- |
| Saikyo <-> Kawagoe | 共用 Omiya（1 站），LOS JA 系统 | HIGH |
| TobuSkytree <-> Skytree | 共用 21 站，LOS TS 系统 | HIGH |
| TobuSkytree <-> TobuNoda | 共用 7 站，LOS TS 系统 | MEDIUM |
| Skytree <-> TobuNoda | 共用 7 站，LOS TS 系统 | MEDIUM |
| Marunouchi <-> MarunouchiBranch | 共用 7 站，LOS M 系统 | HIGH |
| SeibuIkebukuro <-> Ikebukuro | 共用 18 站（子集），LOS SI 系统 | HIGH |

#### 13.4.3 跨运营者直通（数据缺口）

| 链 | 当前数据 | 缺口 |
| --- | --- | --- |
| Saikyo -> SotetsuMain | 0 共用 | Saikyo 使用 Urawa、SotetsuMain 使用 Minami-Urawa（同一车站不同 ID） |
| SotetsuMain -> MinatoMirai | 共用 Yokohama（1） | 正常 |
| MinatoMirai -> Rinkai | 0 共用 | Rinkai 数据不完整 |
| Yokosuka <-> SobuRapid | 0 共用 | Yokosuka 仅有 8 个南部车站，缺少东京—横滨北段 |

以上：THROUGH_SERVICE + confidence=LOW + evidence 车站数据不完整。

#### 13.4.4 TYPE-C 详细分类

| OS | 线路 | 分类 | 理由 |
| --- | --- | --- | --- |
| JR_EAST/JC | ChuoRapid <-> ChuoKonosu | BRANCH_OF（LOW） | branchOf=ChuoRapid，stationLines 缺少连接 |
| JR_EAST/JO | Yokosuka <-> SobuRapid | THROUGH_SERVICE（LOW） | 实际 Yokosuka–Sobu Rapid 线数据不完整 |
| TOBU/TI | TobuIsesaki <-> Isesaki | ALIAS_OF（MEDIUM） | 日文名相同，代码 TI vs TIS 不同 |
| TOBU/TN | TobuNikko <-> Nikkoku | UNKNOWN | 站集 21 vs 9 差异不明确 |
| TOBU/TTJ | Tojo <-> Utsunomiya | THROUGH_SERVICE（UNKNOWN） | 实际存在直通服务，数据 0 共用站 |

#### 13.4.5 REGIONAL 重新分类

REGIONAL 52 线不应是单一直通服务簇。

| 子组 | 线路 | 类型 | 依据 |
| --- | --- | --- | --- |
| 别名组 | Yonezawa / Tsugaru / TohokuMain | ALIAS_OF | 共用 54 站同一物理轨道 |
| 相连 | Shinetsu <-> Shinonoi | PHYSICAL_CONNECT | 共用 41 站 |
| 相连 | Senseki <-> Yamagata | PHYSICAL_CONNECT | 共用 31 站 |
| 相连 | Kiryu <-> Sagami <-> Sano | PHYSICAL_CONNECT | 各共用 18 站 |
| 孤立 | 其余约 40 线 | 无关系 | 0 共用站 |

### 13.5 架构集成设计

#### 13.5.1 新五层架构

第 1 层：线路身份（railway_data.json lines[id]）
第 2 层：物理拓扑（stationLines + lineStationOrder）
第 3 层：服务关系（line-service-relations.js）〔新增〕
第 4 层：运行系统（LineOperationSystems 不变）
第 5 层：展示（LinePresentationService 扩展）

#### 13.5.2 LinePresentationService 扩展

当前 API：

getDisplayOrder(allLines) → 按 LOS 排序后的线路 ID 列表

扩展 API（向后兼容）：

getServiceChains → [{lineIds 数组，type TS，confidence HIGH}]

getRelatedLines(lineId) → [{lineId，type，confidence，evidence}]

isThroughService(lineA, lineB) → boolean

#### 13.5.3 DataState.renderList 影响

当前渲染：
按 OPERATOR 分组 → 按 LOS 顺序排序 → 渲染卡片

扩展渲染（可选增强，非必需）：
按 OPERATOR 分组
→ 按 OS 系统（LOS）分组
→ 系统内先显示 THROUGH_SERVICE 链
→ 再显示其余线路
→ 渲染带链指示的卡片

### 13.6 文件结构

data/core/
railway_data.json（冻结 FROZEN）
line-operation-systems.js（不变 — 显示分组）
line-service-relations.js（新增 — 服务关系层）

js/
line-presentation-service.js（扩展 — 添加 getServiceChains / getRelatedLines）
data-state.js（基础功能无需变更）

### 13.7 风险评估

| 风险 | 级别 | 缓解措施 |
| --- | --- | --- |
| 新文件加载顺序问题 | 低 | 在 db-loader.js 中按正确顺序加载 |
| LinePresentationService 扩展影响既有排序 | 中 | 无关系时向后兼容回退到 LOS 顺序 |
| 关系层与 LOS 重复 | 低 | 明确分离：LOS=显示，Relations=服务 |
| 数据质量依赖 | 高 | confidence 字段 + evidence 描述，不伪造确定性 |

### 13.8 后续阶段计划

| 阶段 | 内容 | 是否修改数据？ |
| --- | --- | --- |
| 1 | 实施影响审计 | 否 |
| 2 | line-service-relations.js 数据填充 | 是（新文件） |
| 3 | LinePresentationService 扩展 | 是（JS） |
| 4 | DataState/Realtime/Trains 渲染增强 | 是（JS+CSS） |
| 5 | stationLines 数据质量修复（独立任务） | 是（数据治理） |

### 13.9 结论

设计完成。

核心交付物：

1. 六种关系类型定义（THROUGH_SERVICE / PHYSICAL_CONNECT / BRANCH_OF / ALIAS_OF / DISPLAY_GROUP / UNKNOWN）

2. line-service-relations.js 文件结构设计

3. 全部线路关系映射（区分已验证 / 数据缺口 / 别名）

4. 职责分离清晰的新五层架构

5. 后续阶段实施路线图

下一步：实施影响审计

本文档为只读设计产物，不修改任何代码或数据文件。

## 附录 B 基本信息（README，参考）

> 面向日本全国，提供铁路路线检索・运行状况・观光景点信息的像素风 Web 应用；目前仅完成东部地区线路。

> |（注：部分内容可能由 AI 生成）
