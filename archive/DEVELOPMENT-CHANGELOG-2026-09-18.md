# 5. 变更日志

> **使用说明**：
> - 变更日志按主题分节（5.1 / 5.2），条目按「版本号（日期，主题）」组织。
> - 项目开发存在**并发会话**，同一版本号可能出现多次（对应不同主题），判断先后一律以「日期 + 标题」为准；重复条目已加〔并发会话〕标注。
> - 新增条目追加到对应小节末尾，正文建议按「问题 → 修复 → 验证 → 遗留」组织。
> - **本部分是历史登记，不是规则正文**：规则以第 2 章（线路图绘制）/ 第 4 章（通用规范）/ 特殊规则部分为准，与规则章节重复记载时以规则章节为准。
> - **新增规则必须先写入规则章节、再登记变更**（见 1.1 规则沉淀）；禁止以笔录体书写规则正文。

## 5.1 4.3.841（数据冻结・临海线站点坐标订正）

## 4.3.841（2026-09-18，临海线站点坐标订正・Freeze 例外）
**问题**：用户报告"临海线站点缺少坐标"。对照 TWR 官方 GTFS（项目根目录 twr-gtfs.zip 的 stops.txt，仅读取）核验临海线（Rinkai）8 站——3 站坐标错误/缺失：第 3 站被误登记为幽灵站 Tokyo-Showa-Center（i18n=东京昭和纪念馆，坐标误为东京站 35.68111111,139.76666667，偏移约 5km）、新木场（35.6606,139.8253）偏移约 1.6km、东云（35.6378,139.7978）偏移约 570m；另 Tokyo-Teleport 站 i18n 名称被误写为百合海鸥线 テレコムセンター。
**修复（Freeze 例外）**：
- Rinkai 第 3 站改键为国际展示场 KokusaiTenjijo（官方 35.63457,139.79163）：lines.Rinkai.stations[2] / stationLines / lineStationOrder.Rinkai 同步；幽灵站 Tokyo-Showa-Center 与连字符孤儿实体 Kokusai-Tenjijo 在 stations / station_i18n / tourism station_exits 三处清除（name_map 与别名表的罗马字别名保留）
- 坐标订正：Shin-Kiba → 35.64604,139.82678；Shinonome → 35.64060,139.80328（railway_data.json 与 tourism 出口锚点同步）
- i18n 订正：KokusaiTenjijo zh=国际展示场 / ko=코쿠사이텐지조（错字）；Tokyo-Teleport → ja=東京テレポート / zh=东京电讯站 / en=Tokyo Teleport（ko 维持）
- Oimachi 现有坐标（35.60681,139.73499）与官方差约 70m，在容差内不改；Kokusai-Tenjijo-Seimon（国際展示場正門）仅 i18n 引用、无关临海线，不动
**实施**：JSON 以文本级精确替换（railway 7+/15-、i18n 5+/17-、tourism 7+/14- 行，无浮点伪 diff）；重跑 node data/core/gen-file-data.js（bundle 全量同步——railway-data.file.js 此前已落后 JSON 约 143KB、缩进 1 空格 vs 现行 2 空格，本次一并对齐）；7 页面 db-loader.js?v= 与 home.html station-i18n.file.js?v= bump 至 4.3.841（db-loader 的 localStorage 数据缓存键随 script 的 ?v= 自动失效）。
**验证**：临海线 8 站坐标全部与官方 GTFS 一致、Rinkai 链路（stations/stationLines/lineStationOrder）一致、Tokyo-Showa-Center / Kokusai-Tenjijo 残留 0、3 JSON 解析 OK、node --check 3 bundle OK、name_map 别名保留。数据层验证完成；页面显示由用户人工确认。
**遗留**：Kokusai-Tenjijo-Seimon 仍为 i18n-only 引用（无站实体，历史遗留，与本次无关）。
