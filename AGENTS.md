# Pixel-Tetsudo - Agent Development Rules

This file defines the hard rules for any AI agent working on this project.
These rules take precedence over any per-task instructions.

---

## Line Hierarchy Rule (HARD RULE) — 线路层级规则

**规则一：平级独立运营线（Peer Independent Service Line）的排他定义**
满足以下任意一个条件的线路，即使共享同一路线记号（JC/JU 等）、即使物理上分叉或直通，也 MUST 是完全平级、独立的顶级节点（Parent Line），严禁被当作另一条的"支线（Branch）"嵌套合并：
1. 独立爱称：拥有官方和乘客公认的不同运营线名称（例：中央線快速 JC / 青梅線 JC / 五日市線 JC 是三条独立主线；宇都宮線 JU / 高崎線 JU 是两条独立主线）。
2. 独立大列表：拥有独立、完整的长途运行区间和独立车站大列表，不是依附主线的盲肠。
Line_ID 必须彻底解耦（JC_Chuo_Rapid / JC_Ome / JC_Itsukaichi 级别），并在"线路一览"一级大列表并列独立展示。

**规则二：真正的内部支线（Branch Line）的嵌套规则**
仅当线路在日常运营和向导看板上没有独立于父线的宏观运营系统名称（官方即称"XX線XX支線"，如：中央本線辰野支線、水郡線常陸太田支線、丸ノ内線方南町支線、千代田線北綾瀬支線、鶴見線海芝浦支線/大川支線）时，才判定为支线并强制执行嵌套：
- 数据模型：line 带 branchOf=<父线ID>，父线带 branches=[子线ID...]；严禁在一级总列表独立展示。
- 支线只能在父线详情/系统卡片内展示。

**判定流程（禁止用物理线覆盖）**：先问"乘客看板/运营系统叫什么"→ 独立运营名 = 平级顶级；官方叫"XX支線" = 嵌套。任何合并/嵌套前必须显式声明依据规则一还是规则二。

**Agatsuma（吾妻線）、Miyo（弥彦線）等拥有独立运营名的线路均为平级顶级，branchOf 必须为 null。**

**干线本名不进展示层（2026-09-08）**：中央本線（ChuoMain）/東海道本線（TokaidoMain）/東北本線（TohokuMain）是国鉄大干线本名（类比京沪铁路/成渝铁路），不是運行系統——LOS 系统卡已删除、data-state renderList 排除（TRUNK_MAIN_LINE_IDS）；数据保留作换乘锚点/支线父线（ChuoTatsuno 的 branchOf 不变）。

**干线本名展示规则修订（2026-09-09，wiki 编译确认 + 用户指示）**：
- **中央本線（ChuoMain）恢复进展示层**——wiki 确认中央東線（高尾～塩尻）是 JR 东管内独立运行系统：车站编号 CO33-61、路线色 #007ac0、中距离列车（211 系等）独立运行，与中央快速（JC，東京～高尾 24 站）记号/运行系统不同。ODPT odpt:Train 亦按 odpt:railway=Chuo 独立推送（与 ChuoRapid 分开）。LOS 新增 CO 系统卡（中央本線，order 20——**CO 是干线记号，不属于 JA-JY 东京近郊通勤记号序列，置于 JY（19）之后**）；TRUNK_MAIN_LINE_IDS 移除 ChuoMain，现为 ["Shinetsu","TokaidoMain","TohokuMain"]。
- **中央快速 / 中央本线 = 两个独立运行系统**（wiki 中央線快速词条：通勤铁路运行系统 東京～高尾；wiki 中央本線词条：干线本名，JR 东管内高尾～塩尻为中央東線）——各自独立卡、列车数据分开显示（4.3.413 拆分实施，4.3.414 修正 CO 记号与 #007ac0 官方色）。
- **横須賀線・総武快速線 = 官方同一运行系统**（wiki 横须贺·总武快速线词条：JR 东日本通勤列车运行系统之一，久里滨→东京→千叶，路线记号 JO，1980 年 SM 分离后一体化互相直通）——LOS JO 系统卡 lineIds=[Yokosuka, SobuRapid] 融合显示、trains 详情延伸段聚合正确（4.3.409）。
- **TRUNK 延伸白名单化（4.3.421）**：trains 详情页延伸段原按"端点相接"自动判定干线本名延伸——横須賀線（東京）误延伸整条東海道本線（東京→熱海 并行线非直通，线路图右列混入有楽町/川崎/熱海等）。改为显式白名单 `_TRUNK_EXTENSION_ALLOW`（当前为空，不延伸任何干线本名）；中央本線已独立 CO 卡、Shinetsu 分断排除、TokaidoMain/TohokuMain 均为并行非直通。LOS 同系统直通延伸（Yokosuka↔SobuRapid、Tokaido↔Ito 等）保留不受影响。
- **运行状态判定收紧 + 日文用词修正（4.3.425）**：①文本兜底不再因出现"運休"二字判全线中断——八戸線"設備メンテナンスのため…6本の列車を運休します"（部分运休通知）曾被误判为断线；现仅明确"運転を見合わせ/運転を中止/全線運休"才 suspended（data-fusion.js parseODPTDelay + official-railway.js ゆりかもめ同步收紧）。②日文 status.suspended 翻译 "運航中断"（船舶/航空用词）→"運転見合わせ"（铁路标准用语）。验证：部分運休→normal、真見合わせ/全線運休→suspended。
- **notice 状态（黄色惊叹号，4.3.426）**：有运行通知但非延误/非中断时显示 ⚠（黄色）而非正常○/中断×——data-fusion.js parseODPTDelay 在 status=normal 且有实质文本（非"平常運転/遅延なし"类否定宣言）时置 notice；STATUS_META/statusRank（3.5，介于 normal 与 delayed）新增 notice；realtime-view 颜色映射 notice=yellow；translations status.notice 4 语言（Notice/通知/運行情報/안내）；CSS --yellow:#f5b301。验证：部分運休→notice、平常運転→normal、真見合わせ→suspended、15分遅延→delayed、遅延なし→normal。

**東武スカイツリーライン / 伊勢崎線 切割（2026-09-09，用户指示）**：ODPT 分开推送两个 railway ID（Tobu.TobuSkytree 浅草～東武動物公園 愛称線 / Tobu.Isesaki 東武動物公園以遠 本線）——LOS TOBU 组 TI 合并卡（伊勢崎線（スカイツリーライン）lineIds=[TobuSkytree,TobuIsesaki]）拆为 **TS 卡（東武スカイツリーライン，TobuSkytree）** + **TI 卡（伊勢崎線，TobuIsesaki）** 两张独立卡（4.3.417）。符合规则一（独立运营爱称=平级顶级）；列车数据各自独立不融合。

**信越本線（Shinetsu）追加排除（2026-09-08，wiki 编译确认）**：北陆新干线开通后信越本線已分断——高崎～横川（JR东）+ 横川～軽井沢（废线）+ 軽井沢～妙高高原（しなの鉄道）+ 妙高高原～直江津（えちごトキめき鉄道）+ 直江津～新潟（JR东）——完整"信越本線"称呼不存在于 JR 东管内。LOS 卡已删除、TRUNK_MAIN_LINE_IDS 追加 Shinetsu；数据保留（横川～直江津区间含第三セクター，站序断裂待 Freeze 例外修正）。

**trains 详情返回按钮与 tourism-detail 同步（4.3.439）**：trains 详情返回从"清 hash + 强制回列表"改为 `history.back()`（与 tourism-detail 的 handleBack 一致）——外部跳入详情页返回时回到来源页，页内切换返回时回到列表。因 trains 为 hash 路由且原无 hashchange 监听，补 hashchange 兜底：hash 变空 → hideLineView()，hash 变为未匹配线路 → showLineView()。无历史（新标签直开详情、history.length===1）时 fallback 清 hash + hideLineView 回列表。验证：页内/外部跳入/新标签直开 三场景均正确。

## System-First Change Rule (HARD RULE)

Any add, modify, or delete operation MUST start from the current full system state, never from the target file alone.

### Before any change
1. Identify the user task this change serves
2. Confirm the current architecture boundary (which module owns what)
3. List all existing Provider/Consumer relationships involved
4. Check for historical implementations, orphan entries, or deprecated paths
5. Design the modification within the system model - not by adapting existing code

### After any structural change
Re-check ALL of the following:
- Provider -> Consumer chain is complete
- No new orphans created
- No old entry point re-referenced
- No duplicate implementation introduced
- No existing module capability degraded
- No A+B temporary fusion forming new ambiguous boundary
- New feature does not incorrectly inherit old framework
- Old feature still retains its original capability after the change

### Critical principle
Can run does not equal correctly integrated into the system.
If a local change conflicts with the system-wide design, redesign the change - never force-adapt the existing code.
---


---

## Rule 9 - Whole-System Consumer Preservation (HARD RULE)

Any add, modify, migrate, or delete operation MUST start from the current full system Provider-Consumer-Boundary map, not from the target file alone.

### Pre-change questionnaire (answer ALL before touching code)
1. Which existing Provider currently supplies this capability?
2. Who are all current Consumers (direct and indirect)?
3. What is the main heart of each affected page?
4. Which module does this feature belong to?
5. Does an implementation already exist?
6. Does a historical/abandoned implementation exist?
7. Why was the historical implementation not used?
8. Which Consumers will this change affect?
9. Will this create new orphans?
10. Will this create a second implementation of the same responsibility?
11. What will the system responsibility map look like after this change?

### Migration rule
When moving a capability from Provider A to Provider B:
- Migrate ALL Consumers from A to B first
- Verify each Consumer works with B
- Only THEN remove A
- Run global orphan sweep

### Deletion rule
When removing a capability:
- Confirm zero Consumers remain
- Confirm no historical file can be mistaken for current implementation by future AI
- Document the removal

### No parallel implementation rule
Never create a second Provider for the same responsibility just because it is convenient.
If the existing Provider cannot serve the new requirement, EXTEND it - do not duplicate it.

### Task prompt rule
Future task prompts MUST be written as:
Complete feature X using the current system as the reference. The target file is a candidate modification point, not the final implementation location.

Never write: Modify xxx.js to implement xxx.

---

## Development Workflow for New Features (Post RC-2)

Every new feature MUST follow this chain:

1. Read-only system audit (current state from baseline)
2. Check if existing capability can be reused
3. If new capability needed: define Provider boundary clearly
4. Define which module main-heart owns this feature
5. Implement within system boundaries
6. Consumer Chain Audit (all Consumers verified)
7. Future AI Trap Scan (no new misleading entries)
8. Global product walkthrough (no cross-module regression)
9. Release Gate check

Do not skip steps. Do not treat file-level changes as sufficient.

---

---

## 4.3.0 Feature Intake / System Impact Review (MANDATORY)

Before ANY new feature development, the agent MUST complete this intake questionnaire.
This is the fixed entry point for all future feature work.

### Intake Questionnaire (answer ALL before touching code)

1. **User task**: Which user task does this feature serve?
2. **Page ownership**: Which page does this belong to?
3. **Main-heart check**: What is the main heart of that page? Does this feature strengthen or dilute it?
4. **Capability classification**: Is this a main-heart capability, auxiliary capability, or background capability?
5. **Provider impact**: Which existing Provider will this affect? Will it extend or replace?
6. **Consumer impact**: Which Consumers will be affected? List each one.
7. **New data entry**: Will this create a new data entry point? If yes, which layer (UNIFIED_LINES / DataLayer / RailwayDB)?
8. **Display resolver**: Will this create a new display name resolver? If yes, must it route through RailwayDB.
9. **Orphan risk**: Could this cause any existing module to become orphaned?
10. **A-for-B degradation**: After this change, does Module A still have all its original capabilities?
11. **Legacy cleanup**: Which old code should be migrated, preserved, or deleted after this change?

### A-for-B Degradation Check (CRITICAL)

This is the most important rule. It prevents the pattern where:
- B is built to work with a modified A
- A's original Consumer is broken in the process
- Later, AI finds A's old code and assumes it is still the current framework
- New features attach to the orphaned A instead of the correct path

**Check template**:
`
Before: A -> Provider -> Consumer_X, Consumer_Y
After:  A -> Provider -> Consumer_X   (must still work)
        A -> NewPath                   (B's new path)
        Consumer_Y -> ?                (MUST NOT be orphaned)
`

If any Consumer loses access to its capability, the change is REJECTED until fixed.

### Decision tree

| Finding | Action |
|---------|--------|
| Existing Provider can serve the need | EXTEND existing Provider, do NOT create new |
| New Provider needed | Define boundary explicitly, document in AGENTS.md |
| Old Provider can be fully replaced | Migrate all Consumers first, then remove |
| Risk of orphan creation | STOP - redesign with Consumer Preservation in mind |
| Cannot answer question 10 | STOP - investigate full Consumer chain first |

### 4.3.0 Post-Intake Workflow

After intake is complete and approved:

1. Read-only system audit (confirm baseline state)
2. Check if existing capability can be reused
3. If new capability needed: define Provider boundary clearly
4. Define which module main-heart owns this feature
5. Implement within system boundaries
6. Consumer Chain Audit (all Consumers verified)
7. Future AI Trap Scan (no new misleading entries)
8. Global product walkthrough (no cross-module regression)
9. Release Gate check

Do not skip steps.

---

## Capability Ownership Check (MANDATORY for all feature development)

After the 11-question intake, before any implementation decision, the agent MUST answer this question:

**"Who does this capability belong to?"**

### Capability ownership map (current RC-2 baseline)

| Capability | Owner | Boundary |
|-----------|-------|----------|
| Line/station identity | RailwayDB | resolveLineName(), resolveStationName() |
| Display name (i18n) | RailwayDB | resolveLineName(currentLang) |
| Operator display | RailwayDB | tOp(operatorId) |
| Runtime cache / position | DataLayer | positions, regions |
| Realtime fusion | DataFusion | unified data from multiple sources |
| Raw canonical data | UNIFIED_LINES | db-loader.js input |
| Running-system grouping | LineOperationSystems (LOS) | lineIds grouping + system name (i18n) + official HEX + 路線記号; single authority for system cards |
| Search interaction | SearchUI | form handling, results display |
| History tracking | History | consumes SearchUI output, does NOT own search logic |
| Route search UI | Route page | own main-heart: "How do I get there?" |
| Realtime status | Realtime page | own main-heart: "Can I ride now?" |
| Tourism / sights | Tourism page | own main-heart: "What to visit after arrival?" |

### The stolen-logic rule

If module B needs a capability that lives inside module A's internal code:

**Case 1: The capability belongs to A's responsibility**
- A SHOULD expose it as a public method / provider
- B calls the public API, not A's internals
- If A cannot reasonably expose it, extend A's responsibility map

**Case 2: The capability does NOT belong to A**
- B is depending on the wrong module
- Find the correct owner in the map above
- Redirect B's dependency to the correct owner
- Never let B "sneak in" to A's internals as a shortcut

### Anti-pattern: B borrows A's logic without giving back

This pattern must never happen:
`
B needs X
→ B copies/rewrites X from A's internals
→ B works
→ A never gains X
→ A's Consumer loses access to X
→ Future AI finds A's old X code, assumes it is still current
→ New feature C attaches to A's orphaned X
→ A+B+C framework collapse
`

**Check every change against this question:**
> After this change, does the owning module still provide the same capability to all its original consumers?

If the answer is NO, the change is REJECTED.

## Known Debt (Do Not Auto-Fix)

| Debt | Priority | Reason for defer |
|------|----------|-----------------|
| History <-> SearchUI coupling (P2) | P2 | Requires SearchUI public API redesign |
| ~~data/铁道/ directory~~ | REMOVED 2026-09-06 | Historical archive deleted on explicit user instruction (git history preserves everything; restored once by concurrent workflow 63114dd, then removed again on user approval). Twin home.html with broken relative paths eliminated — entry is exclusively pages/home.html |
| ~~data/api/line-operation-systems.js~~ | REMOVED 4.3.41 | Orphan duplicate of data/core (zero page refs, missing isStandalone) — removed, keep data/core/line-operation-systems.js as single source |
| CSS orphan classes (5) | P3 | Low risk, covered by inheritance |
| console.log in odpt-unified.js (2) | P3 | Non-product debug output |
| js/trains-detail.js orphan | P3 | Zero consumers (not referenced by any page); contains unresolved _rS/tStation/_lang refs — do not enable |
| LOS isStandalone / REGIONAL pseudo-group | REMOVED 4.3.42 | Running-system rendering retired the branch-skip mechanism; LOS regenerated from authoritative 運行系統 table (branch lines live inside their system group, e.g. Ome/Itsukaichi in JC) |
| ~~Yurakucho/Fukutoshin 駅順ねじれ~~ | FIXED 2026-09-07 | 公式駅順 和光市-成増-赤塚-平和台-氷川台-小竹向原-千川-要町-池袋。旧データは有楽町線に小竹向原が、副都心線に氷川台が欠落。ユーザー指摘+公式証拠により railway_data.json を修正（Yurakucho +Kotake-Mukaihara / Fukutoshin +Hikawadai）。両線最初の9駅が一致し、共有区間は 和光市〜池袋 の1セグメント。 |
| Odawara(小田原線) 駅リスト末端に JR 東海道系駅が混入 | P1 | 小田原線 stations が …Hadano→Shibusawa→Oiso→Ninomiya→Kozu→Kamonomiya→Odawara と JR 東海道系駅（Oiso/Ninomiya/Kozu/Kamonomiya）を誤って含む（小田急は国府津・鴨宮を通らない）。テレポートの温床のため要修正だが、駅数削減を伴い凍結データに触れるためユーザー判断待ち。2026-09-08 時点では Kamonomiya 分離のみ実施（下記 Freeze 例外）。 |
| 13 image path fixes | Deferred | Asset mapping, no product impact |
| ~~Noda（東武アーバンパークライン）の Sakae（栄）駅~~ | FIXED 2026-09-08 | 東武野田線に栄駅は実在しない（正しくは逆井 Sakasai）。wiki 核验により Noda を正序 35 駅に全面再構築、重複線 TobuNoda を削除、誤 ID 28 件を正 ID に置換・i18n 補完（下記 Freeze 例外）。 |

---

## Architecture Baselines

| Tag | Commit | Description |
|-----|--------|-------------|
| RC-1 | 63b388d | Engineering baseline: Display Identity unified, P0-3=0 |
| RC-2 \| 6e502f4 \| Product baseline: Architecture documented, rules enforced, Home visual consistency fixed |

---

Last updated: 2026-09-09
Version: RC-2
---

## Canonical Data Freeze Rule
The following data is LOCKED. Never modify for any reason:
- data/core/railway_data.json: 156 lines / 509 stations / 1703 name_map / 93 tourism
- Any missing data field is DATA-BLOCKED, not a reason to fabricate content.
- 2026-09-07 ユーザー指示による修正: Yurakucho +Kotake-Mukaihara / Fukutoshin +Hikawadai（公式駅順に整合）。氷川台・小竹向原は両線の駅として扱う。
- 2026-09-08 ユーザー指示（東海道線換乘問題）による修正: 同名駅 ID 衝突が引き起こす検索テレポートを解消。伊奈線加茂宮 Kamonomiya→Kamomiya に分離（stations/transferStations/stationLines/lineStationOrder/表示名マップ/station_i18n を一括更新）、東海道本線鴨宮は Kamonomiya のまま i18n(ja:鴨宮) 新設。Odawara/NewShuttle/TokaidoMain 間の Kamonomiya 誤乗換宣言 6 件を除去（加茂宮・鴨宮での小田原線/ニューシャトル乗換は実在しない）。
- 2026-09-08 ユーザー指示（東海道線乗換マーク過剰、京浜東北線詳細図）による修正: 京浜東北線/山手線/横須賀線/鶴見線/有楽町線/横浜線/東急多摩川線/東急池上線 の transferStations から、東海道線が停車しない駅（有楽町・浜松町・田町・高輪ゲートウェイ・大森・蒲田・鶴見・新子安・東神奈川・東戸塚・保土ヶ谷等）への TokaidoMain(東海道本線) 乗換宣言 22 件を除去。東京モノレール浜松町⇔JR浜松町 の駅外乗換から東海道本線を除外（山手・京浜東北のみ、浜松町に東海道線は停車しないため）。東海道線運行系統停車駅（東京・新橋・品川・川崎・横浜・戸塚・大船・藤沢・茅ヶ崎・平塚・大磯・国府津・小田原・熱海＋熱海以遠 早川・根府川・真鶴・湯河原）への宣言は維持。湘南新宿ライン辻堂・二宮の TokaidoMain 宣言は東海道本線の駅として残置（東海道線普通列車停車）。小田原線 Ninomiya の TokaidoMain 宣言は Odawara 誤駅問題（Known Debt P1）に属するため残置。
- 2026-09-08 ユーザー指示（羽田空港乗換情報）による修正: 東京モノレール羽田空港線（TokyoMonorail）と京急空港線（KeikyuAirport）の間の乗換宣言 8 件を双方向で追加。天空橋（Tenkubashi⇔Tenku-Bashi、駅内 in）、羽田空港第1ターミナル（Haneda Airport Terminal 1⇔Haneda-Kuko-T1T2、駅外 out 徒歩約5分）、羽田空港第2ターミナル（Haneda Airport Terminal 2⇔Haneda-Kuko-T1T2、駅外 out 徒歩約3分）、羽田空港第3ターミナル（Haneda Airport Terminal 3⇔Haneda-Kuko-T3、駅外 out 徒歩約4分）。
- 2026-09-08 ユーザー指示（常磐線補充・wiki 確認）: 常磐線本線（JobanMain、取手～岩沼 62 駅）を新規追加。wiki 確認により運転系統は 快速（品川～取手 JJ）/各駅停車（綾瀬～取手 JL）/中距离・特急（取手～岩沼→仙台）に区分され、中距离区間が欠落していたため補充。同時に JobanLocal から北千住を削除（各駅停車は綾瀬起点、北千住は快速線/千代田線の駅）、Joban の Kita-Senju→JobanLocal 誤乗換宣言を除去。新駅 52 件（うち Ono-Fukushima 大野・Yamashita-Miyagi 山下 は既存ID衝突回避のため別ID）。双方向乗換 7 組追加（取手⇔快速/各停、友部⇔水戸線、水戸⇔水郡線、勝田⇔ひたちなか海浜鉄道湊線、いわき⇔磐越東線、岩沼⇔東北本線）。
- 2026-09-08 ユーザー指示（常磐線各駅停車修正）: 車両アイコンを千代田線（東京メトロ18000系）に統一——train-icons.js の JobanLocal 特急 typeMatch（E657系 ひたち/ときわ）誤マッチを削除（常磐線各駅停車にひたち/ときわ特急は存在しない）。綾瀬駅に北綾瀬支線（ChiyodaBranch）への乗換宣言を追加：JobanLocal/Chiyoda の transferStations に Ayase→ChiyodaBranch、ChiyodaBranch の transferStations に Ayase→Chiyoda / Ayase→JobanLocal（綾瀬は千代田線・常磐線各駅停車・北綾瀬支線の3線接続点）。
- 2026-09-08 ユーザー指示（奥羽本線收窄・wiki 確認）: 奥羽本線（OuMain）100→66 駅（新庄～青森）に收窄。wiki 確認により 福島～新庄 は山形線（山形新幹線）運行区間であり、OuMain の先頭 34 駅（福島～舟形）を除去、同区間は山形線（Yamagata）が独占。重複登録されていた同名駅 ID を削除（Sakinoko/Mokichi-Kinenkan-mae/Zao/Minami-Tendo/Jimmachi を削除、山形線側の Sasanogawa/Mogami-Kinenkan-mae/Za-o/Tendo-Minami/Jimba が既存）、Ashisawa/Funagata は山形線の駅として stationLines に Yamagata を追加。Yamagata.transferStations の OuMain 乗換宣言を Shinjo 以外すべて削除（新庄のみ両線接続、Shinjo→OuMain 維持）。OuMain.transferStations は新範囲内 13 件のみ、lineStationOrder/durations も 66 駅に再構築。
- 2026-09-08 ユーザー指示（総武本線 成田→成東 修正・wiki 確認）: 総武本線（SobuMain）の駅順が 八街→日向→成田→松尾 と誤っていたのを修正。wiki 確認により正しい駅順は 八街→日向（Hyuga、実在）→成東（Naruto）→松尾。成田駅は成田線の駅であり総武本線には属さないため、SobuMain.stations の Narita を Naruto（成東）に置換、SobuMain.transferStations の Narita 宣言を除去、Narita.stationLines から SobuMain を除去、Naruto.stationLines に SobuMain を追加。i18n.Naruto を 鳴門→成東 に修正（外房線成東駅と共用、外房線表示も同時に正しくなる）。Hyuga（日向）は総武本線の実在駅として維持。
- 2026-09-08 ユーザー指示（水戸線 Yamato 誤乗換除去）: 水戸線（Mito）の大和駅（茨城県筑西市）が神奈川県大和市の相鉄線/小田急/高座渋谷（弘南）の大和駅と同名 ID 衝突し、誤乗換宣言 3 件（Yamato→OdakyuEnoshima / SotetsuMain / Kounan）が入っていたのを除去。水戸線大和は単独駅（乗換なし）。ID 共有自体は未分離（Kamonomiya 前例のような ID 分離は別途検討）。
- 2026-09-08 ユーザー指示（外房線站表大混入・wiki 確認）: 外房線（Uchibo）の駅リストを全面書き換え（25駅→正しい 27駅）。混入していた総武本線/成田線/野田線の駅（Sakura 佐倉・Yachimata 八街・Enokido 榎戸・Yokaichiba 八日市場・Matsuo 松尾・Naruto 成東・Sakae 栄・Namegawa 滑河）を除去し、新駅 13 件を追加（Kamatori 鎌取・Nagata 永田・Honno 本納・Shim-Mobara 新茂原・Torami 東浪見・Taito 太東・Chojamachi 長者町・Mikado 三門・Ohara 大原・Namihana 浪花・Onjuku 御宿・Ubara 鵜原・Namegawa-Island 行川アイランド）。行川アイランド駅は遊園地閉園後も JR 駅として存続（wiki/鉄道LOD 確認、旧表記 行川島 から正名）。i18n.Namegawa 滑川→滑河（成田線の正表記）、Iikura.en typo 修正、Iigura は Iikura の重複 ID として削除。Narita/Noda/SobuMain から Uchibo への残留誤乗換宣言 8 件を除去。無所属駅 Kujukuri 九十九里・Kasugacho 春日町・Daijima 大島 は stationLines 空で残置（実在性不明・要調査）。転換駅は 千葉（総武快速/中央総武/成田/都市モノレール/総武本線）・蘇我（京葉/内房）・安房鴨川（内房）のみ。
- 2026-09-08 ユーザー指示（Yamato ID 分離）: 水戸線大和を Yamato-Mito に分離（下館→新治→大和→岩瀬）。花輪線（Kounan）の大和は実在しないため駅リストから除去（26→25 駅）。stationLines.Yamato は [OdakyuEnoshima, SotetsuMain] に縮小。Kounan の lineStationOrder を再構築。
- 2026-09-08 ユーザー指示（Osawa ID 分離）: 奥羽本線（山形線）大沢を Osawa-Yamagata に分離、上越線大沢は Osawa を維持。Joetsu→OuMain/Yamagata・Yamagata→Joetsu の同名テレポート乗換宣言 3 件を除去。
- 2026-09-08 ユーザー指示（山形線駅補完・wiki 確認）: 山形線（Yamagata）に芦沢（Ashisawa）・舟形（Funagata）を追加（正順 北大石田→芦沢→舟形→新庄）、34→36 駅。※楯山は仙山線（Senzan）の駅であり山形線には存在しないため追加しない。
- 2026-09-08 ユーザー指示（東武野田線 栄駅誤登録修正・wiki 確認）: 東武野田線（Noda）を wiki 正序 35 駅（大宮～船橋 TD-01〜35）に全面再構築。重複線 TobuNoda（29 駅、別線混入/架空駅多数）を削除。架空駅 栄（Sakae）→逆井（Sakasai）に訂正。誤 ID 28 件（Kita_Omiya/Omiya_Koen/Higashi_Iwatsuki/Shimizu_Koen/Shichiri/Kasugabe/Fujino_Shima/Kawa/Nanakouen/Ichihashi/Umon/Hajime/Nagareyama/Ohtakano_Mori/Toyotoki/Shin_Kashiwa/Shin_Kamagaya/Shin_Funabashi/Sakae/Rokkoku/Matsumizawa/Tsuka/Tohyu/Nanodai/Ohanabatake/Gumyo/Maezaki/Unane）を削除・正 ID に置換。正 ID 9 駅（Toyoharu/Fujino-Ushijima/Nanakodai/Nodashi/Umesato/Unga/Hatsuishi/Toyoshiki/Magomezawa）＋ Shin-Funabashi の i18n を新規追加。name_map を正 ID に統一（流山おおたかの森→Nagareyama-Otakanomori 等）、架空キー 栄/求名 削除。TobuNoda 残存宣言 17 件を処理（正駅 11 件→Noda 置換、非 Noda 駅 6 件＝西船橋/東船橋/谷津/栄町 を削除）。京成習志野（Keisei-Narashino）は京成本線の駅として Keisei に挿入（42→43 駅）、北習志野（Kita-Narashino）は無所属残置。LOS 野田線カード lineIds → ["Noda"]、train-icons.js の TobuNoda キー削除。
- 2026-09-08 ユーザー指示（JRグループ アイコン路線色・ラインカラー修正）による修正: 房総4線のラインカラーを公式色に修正——内房線（Sotobo/UCH）#fcc60d→#0071C5（青）、外房線（Uchibo/SOT）#fcc60d→#F22335（朱）、成田線（Narita/NRT）#fcc60d→#00BB85（黄緑）。総武本線（SobuMain/SOB）は #fcc60d（黄）を維持。railway_data.json と line-operation-systems.js（LOS システムカ）を同期。併せて data-state.js の renderSystemCard/renderCard で JRグループ.png アイコンを「路線色枠＋白地JR」の fallback コンテナ（.rs-line-icon-fallback）で描画するよう変更（従来は画像直出しで枠なし、ユーザー提示の JR 公式ロゴデザイン＝路線色角丸枠＋白地 JR に整合）。
- 2026-09-09 ユーザー指示（誤添加路線の一括削除・Freeze 例外）: 過去の他セッション作業で混入した非 JR 東首都圏路線 4 線を削除——青い森鉄道線（Aoimori/第三セク）、IGRいわて銀河鉄道線（IGR/第三セク）、ひたちなか海浜鉄道湊線（HitachiNakaKaimin/第三セク、op 誤り MIR は TX の operator）、JR山口線（JR_Yamaguchi/JR 西）。削除範囲：lines 4 件・専属駅 77 件（Metoki は清掃後無主のため削除）・stationLines/lineStationOrder/name_map/station_i18n 参照・LOS システムカ（AO/IGR/MIR-湊線/JR_WEST）・common.js OP_ORDER の JR West/IGR/Aoimori・translations op.Aoimori/op.IGR・odpt-unified の JR_Yamaguchi オペレータマップ・train-icons/db-loader 画像参照・他線 transferStations の当該線換乗宣言 8 件（八戸/野辺地/青森/盛岡/勝田 等の共用駅は駅自体を残し参照のみ除去）。削除後 162 線。odpt-links.js は ODPT 公式全量リンク庫（生成器産出・手改禁止）のため IGR リンク残置（削除線はリクエストされない）。JR 東北地方線（大湊線等）はユーザー判断で保留。
- 2026-09-09 ユーザー指示（千葉都市モノレール・湘南モノレール削除・Freeze 例外）: ユーザーが他モデルの駅データ編集中に追加されたものと判断した首都圏単軌 2 線を削除——千葉都市モノレール（ChibaUrbanMonorail/18 駅、4.3.94 で"缺失线路"として追加されたが現在はユーザー判断で範囲外扱い）、湘南モノレール江の島線（ShonanMonorailE/8 駅、canonical 60→156 線時収録）。東京モノレール・多摩都市モノレール等の同類はユーザー指示により**保留**（方案 A）。削除範囲：lines 2 件・専属駅 22 件（千葉15+湘南7）・共用駅 4 件（Chiba-Minato/Chiba/Tsuga/Ofuna）は stationLines からの参照のみ除去・自身 transferStations 13 件随線削除・LOS システムカ（SHONAN_MONORAIL/CHIBA_URBAN_MONORAIL）・common.js TRANSIT_NORMALIZE/LOS_KEY_MAP/OP_ORDER・lang-init _opIds・translations op.ShonanMonorail/op.ChibaUrbanMonorail（4言語8行）・train-icons OPERATOR_ICONS/LINE_ICONS・db-loader 画像参照・odpt-unified LINE_OPERATOR_CODE（ShonanMonorailE→ShonanMonorail / ChibaUrbanMonorail→ChibaMonorail）。削除後 160 線（4.3.434）。
- 2026-09-09 ユーザー指示（川越線を2運転系統に分割・Freeze 例外）: 川越線を公式運転系統どおり分割——Kawagoe（大宮〜川越 6 駅）は JA カード「埼京線・川越線」に維持（埼京線と大宮で直通、E233系7000番台 deployment 継続）、新設 KawagoeWest（川越〜高麗川 6 駅、code JA、#00ac47）は新 LOS カード「川越線（川越〜高麗川）」（order 1.1、専用アイコンなし→JR色枠 fallback、E209系3500番台）。川越駅は両線共用（stationLines: Kawagoe/KawagoeWest/Tojo）。through-service.js に川越駅 Kawagoe↔KawagoeWest 直通（THROUGH_JOIN: 川越）追加、両線 transferStations に川越駅相互接続宣言（直通マーカー用）、高麗川八高線乗換宣言を KawagoeWest へ移動（Hachiko 側 lineId も KawagoeWest に修正）。line-service-relations.js に THROUGH_SERVICE 記録追加。検索 大宮→高麗川 は川越駅直通 0 乗換。分割後 161 線（4.3.436）。
- 2026-09-09 ユーザー指示（川越線 ODPT データ帰属修正）: ODPT 公式定義により JR-East.Kawagoe=川越線（川越-高麗川間）、JR-East.SaikyoKawagoe=埼京線・川越線（大崎〜川越・大宮〜川越含む）。odpt-unified.js LINE_RAILWAY_CODE 修正——Kawagoe（大宮〜川越段）→SaikyoKawagoe（埼京線API）、KawagoeWest（川越〜高麗川）→Kawagoe；LINE_TO_OPERATOR に KawagoeWest=JR-East 追加。data-fusion.js posMap マッチと train-position-estimator.js の railway フィルタを LINE_RAILWAY_CODE 逆引き（集合マッチ）に変更——川越〜高麗川の Kawagoe データが大宮〜川越段に誤配されるのを防止、房総 ID 逆転（Sotobo/Uchibo）の潜在誤マッチも同時に解消（4.3.437）。
- 2026-09-09 ユーザー指示（川越線（川越〜高麗川）を JA-JY 序列から移動）: LOS の川越線（川越〜高麗川）カード order を 19.1→22.1 に変更——東京近郊通勤記号列（JA 1〜JY 19）の直後（JY 直後の 19.1）ではまだ通勤列に隣接するため、郊外地方線区域の八高線（HAC order 22、高麗川接続）の直後に配置。code JA は川越線の路線記号として維持（CO 中央本線と同じ扱い：記号は残すが序列外）。分割後 161 線のまま（4.3.438）。
- 2026-09-09 ユーザー指示（多言語欠損修復・Freeze 例外）: 韓国語 ko の欠損を全面修復（4.3.441）——①station_i18n.json 34 駅（奥羽/羽越/陸羽/津軽等東北地方線の駅）に ko 駅名を追加（日文音訳規範：大館→오다테、湯沢→유자와 等）。②LOS システムカ 148/149 に nameKo を追加（元は多摩モノレール1枚のみ；ko 界面でシステムカが全て日本語にフォールバックしていた）——日文音訳+선 規範、括弧/・は保持（埼京線・川越線→사이쿄선・가와고에선、中央・総武線（各駅停車）→주오・소부선（각역정차）等）。③railway_data.json lines 161 本に nameZh+nameKo を追加（154 本は LOS マップから流用、LOS 外 7 本＝Shinetsu/TohokuMain/TokaidoMain/MarunouchiBranch/ChiyodaBranch/ChuoTatsuno/JobanMain は手訳）——resolveLineName の zh/ko フォールバック（日本語表示）を解消。検証: 駅 ko 欠損 0、LOS nameKo 空 0/149、線 nameZh/nameKo 161/161、ko 界面ブラウザ実測でシステムカ/詳細タイトル/駅名とも韓国語表示、console 0 エラー。
- 2026-09-09 ユーザー指示（リアルタイム内容の多言語化）: 4.3.442 でリアルタイム系の 3 欠損を修復——①data-fusion.js の片端駅 interval「東京方面」の日文「方面」が zh/ko/en 界面に残留 → translations に status.toward 4 言語（en" bound for"/zh"方向"/ja"方面"/ko" 방면"）追加、data-state.js に localizeInterval() を新設し公開 API 化、realtime カード/モーダルの interval 描画で置換。②trains-page.js の直通チップ「直通○○線」が日文固定 → translations に train.through 4 言語（en"Through "/zh"直通"/ja"直通"/ko"직통"）追加、_throughChipSize が t() を使用。③言語切替後 interval が再融合されず旧言語のまま（DataState は再レンダのみ）→ data-state.js の言語リスナで先に DataFusion.refresh() を呼び再融合してから notify()。検証: 各キー 4 言語×4 箇所、node --check 4 ファイル、ko 界面でモーダル（운행 정보/정상/전 노선）と直通チップ（직통）を実測、console 0 エラー。
- 2026-09-09 ユーザー指示（全ページ全言語・リアルタイム正文の翻訳）: 4.3.443 で「どのページも全言語（リアルタイム含む）」を実現——ODPT 日文運行情報正文を登録不要の翻訳 API で多言語化。①serve.py に /api-proxy/translate エンドポイント追加：MyMemory（公式公開・登録不要・500 文字制限）主力 + Google gtx エンドポイント兜底（尽力、自動化ブロック時は catch して原文へ）；ホワイトリスト固定ターゲットで SSRF 防止；サーバ側 7 日テキストキャッシュ（30 秒自動更新+複数カード再利用で無料枠消費を防止）。②js/translate-service.js 新規（Provider: window.TranslateService）——currentLang に従い動的日文テキストを翻訳、クライアント二次キャッシュ、ja 界面は常に原文、失敗/オフライン時は原文に自動フォールバック；翻訳対象は動的テキスト（運行情報）のみで駅名/線名には触れない（二重翻訳による改変防止）。③realtime-view.js モーダル：運行情報正文/原因を訳文主体表示 + 原文 details 折りたたみ（要約文言は 4 言語インライン）、片端/テキスト兜底区間（京急線内/取手〜上野駅間 類）は非 ja 界面で自動翻訳。④css/style.css に .rs-cause-translated（pre-wrap で原文改行保持）+ .rs-cause-original 折りたたみスタイル。検証: curl 3 言語+キャッシュヒット、ブラウザ ko/zh 界面で常磐線快速 notice モーダル——正文/原因/区間がすべて対応言語、原文折りたたみ展開可、console 0 エラー。※Google gtx は当環境から自動化ブロックを受けるため実運用は MyMemory 依存（gtx は失敗時原文へ）。
- 2026-09-09 ユーザー指示（线上翻译失效・双路径修复）: 4.3.443 を GitHub Pages（biubiu52011.github.io）にデプロイ後、モーダルの運行情報が日文原文のまま——原因: 翻訳エンドポイントがローカル serve.py（/api-proxy/translate）にのみ存在し、静的ホスティングの線上では 404 → 原文へフォールバック。診断: MyMemory は Origin 付きでも 200 + Access-Control-Allow-Origin: * を返す（ブラウザ直結可能）ことを curl で確認；ただしローカル沙箱ブラウザからは当該ドメインへのアクセスがネットワーク出口で遮断される（no-cors でも Failed to fetch、ODPT 外域は正常）＝沙箱環境固有の制限でありユーザー実環境は影響なし。4.3.444 で translate-service.js を二経路化——①ローカル /api-proxy/translate 優先（サーバ側 7 日キャッシュ）、②代理不可（線上 404/ネットワークエラー）時は MyMemory 直結（CORS 許容・登録不要・結果はクライアントキャッシュ）、③全失敗時は原文へ。検証: 構文 OK、ローカル経路は代理優先のまま回帰なし、MyMemory の Origin 付き実測 200+ACAO:*。※沙箱ブラウザでは MyMemory 直結を実測不可のため、ユーザー実環境での確認を要する。
- 2026-09-09 ユーザー指示（丸ノ内線支線のリアルタイム配備・Freeze 例外）: 丸ノ内線支線（MarunouchiBranch 方南町支線）を単独生成せず丸ノ内線体系に統合したままリアルタイムデータを配備（4.3.446）。①odpt-unified.js LINE_RAILWAY_CODE に Marunouchi→Marunouchi / MarunouchiBranch→MarunouchiBranch を追加（ODPT は TokyoMetro.MarunouchiBranch を独立 railway で配信、逆引き集合マッチで共用駅 中野坂上 の列車が支線側に正しく帰属）。②LOS 丸ノ内線カード lineIds=["Marunouchi","MarunouchiBranch"]——システムカに支線を統合（独立カード化しない）、データは branchOf ネストのまま（規則二）。③train-icons.js に MarunouchiBranch=2000系 を追加（本線と同車両、誤 fallback 山手線 E235 防止）。④trains-page.js 支線融合——computeRouteGeometry に branchGeom（支線駅列の座標 bx=junction.x+20+70*idx）を追加、renderTrainMap で svg.__branchGeom に保持、getRealtimePositions が branchOf 子線の列車を fusionLineId 付きで本線詳細図に併合、updateTrainLayer は branchGeom 座標で支線列車を描画（主線と距離を確保）。⑤data-fusion.js 時刻表按需ロード（loadMissingTimetables）で linesNeedingTimetable に支線（line.branches）を追加、toLoad 上限 12→24——支線時刻表（ODPT TokyoMetro.MarunouchiBranch 658 件）を確実に取得（4.3.447）。⑥4.3.448 支線描画スタイルを主線に統一——支線駅ラベルが独立簡略描画（12px/#666）だったのを主線駅と同じ 16px/#555/500 に、支線名を 14px に変更（全支線共通コードのため 1 箇所で全支線に反映）。⑦4.3.449 詳細図の駅・乗換・直通描画を一本化——renderTrainMap の主線駅ループと支線駅ループを新設の統一関数 `_renderStationNode(staticLayer, svgNS, o)` に集約。主線/支線の区別は geometry（座標・side・色・branchGeom）のみに残し、駅円・ラベル（16px/#555/500）・乗換チップ・直通チップは全駅共通パスで描画（支線駅は tx/ty/anchor を bx+6/bsy+3/start で上書き、分岐駅 bsi=0 のみ skipTx で乗換重複を防止）。検証: 丸ノ内線詳細図で支線駅ラベルが主線駅と同一スタイル、山手線 95 換乗アイコン・横須賀線直通チップ（直通湘南新宿線等）が従来どおり描画、ノード構文 OK。
- 2026-09-09 ユーザー指示（直通列車の車両形式・Freeze 例外）: ODPT 列車ロケーション（odpt:Train）に車両形式フィールドが無いことを確認（フィールドは trainType 運行種類・carComposition 編組数のみ）——直通列車の車両は車号規則で識別する方針に。4.3.450 で train-icons.js に THROUGH_SUFFIX_RULES を追加——京葉線上の E 末尾車号＝武蔵野線直通（E231系0番台）、武蔵野線上の Y 末尾＝京葉線直通（E233系5000番台）——JR 社内直通（京葉↔武蔵野）の直通車を車籍どおり表示。併せて常磐線各駅停車（JobanLocal）のデフォルト車両を 18000系→E231系0番台 に訂正（常磐緩行線 綾瀬〜取手 の自社車は松戸車両センター E231系0番台が主体；千代田線直通車は Chiyoda 側 18000系）。検証: 京葉線詳細図で E 号=E231系0番台・Y 号=E233系5000番台 が共存、常磐緩行線詳細図が E231系0番台 表示、ノード構文 OK。
- 2026-09-09 ユーザー指示（开源翻译方案调研・离线模板引擎最终打磨）: 调研结论——浏览器端离线 NMT（OPUS-MT 无 ja→zh/ko 模型、NLLB/M2M-100 200-600MB 与加载性能冲突）、Chrome/Edge 内置 Translator API（Chrome 147 实测 canTranslate 仍不可用）、LibreTranslate（需自托管后端，GitHub Pages 无法承载）、Google gtx 网页端点（数据中心出口被反爬拦截）均不可行；业界/开源无"免费无额度、无注册、线上可用、加载快、覆盖 ja→zh/ko/en"的现成方案，离线模板引擎为当前约束下最优解。4.3.445→450 打磨：①模板顺序修正——運転再開（"見合わせていましたが…再開"）模板前置，避免被運転見合わせ误匹配（東北本線運転再開回归 normal）。②词级替换重写——出现位置收集+长词优先+区间去重，防止连锁替换（"上下線"→"上下行线"后被"上下"再命中成"上下行行线"）；允许空串删除助词（の/を）。③站名候选来源扩展——getStations 实体 + 全线路站表 + 换乘站合并收集（長野原草津口/大前/千倉等仅有 i18n/线路引用、无站实体的站也覆盖）；数据未就绪时不缓存避免空缓存污染。④_normTime 增加 lang 参数（ko 界面"19:10경"）。⑤serve.py 删除 4.3.443 /api-proxy/translate 端点、js/translate-service.js 删除（API 方案废弃清理，realtime-view.js 全部改走 DelayTranslator）。验证: 12 个全量真实样本（zh/ko）全部模板命中、站名/线路/原因全替换、时间规范化正确、console 0 错误。
- 2026-09-09 用户指示（景点详情页首入语言修复）: tourism-detail 页从旅游页进入后首屏固定日语，需再点一次语言按钮才变对——根因: 模块级 `var lang = window.currentLang || 'ja'` 在脚本加载时快照（此时 lang-init 尚未初始化，恒为 ja），首次渲染用该闭包变量；点语言按钮才触发 onLanguageChange 刷新。修复（4.3.451）: init() 首行刷新 `lang = window.currentLang || 'ja'`（渲染前），translateUI/renderArticle 及 getSpotName/getStationLabel 等全部立即用对语言。全局排查确认其他页面（realtime-view/sightseeing/search-ui/trains-page/data-state/history/route-search/translations）均为函数内实时读 currentLang，无模块级快照问题。验证: ko/zh 界面带真实跳转参数直接打开详情页——currentLang 正确、全文对应语言、无日文假名残留、无需再点语言按钮。

---

## Display Identity Rule
RailwayDB.resolveLineName() / resolveStationName() / tOp() are the ONLY allowed display name paths.
Never implement a second resolver. Never use line.name / line.nameJa / line.nameEn directly in user-visible output.

---

## Three-Layer Data Architecture Rule
The project uses three intentional layers. Do NOT merge them:
| Layer | Owner | Responsibility |
|-------|-------|---------------|
| UNIFIED_LINES | db-loader.js | Raw canonical line objects (DataFusion input) |
| DataLayer | data-layer.js | Runtime cache (positions, grouped access) |
| RailwayDB | db-loader.js | Canonical query + display identity (i18n) |
Each layer has a distinct responsibility. Use the correct layer for the correct concern.

---

## No Orphan-Generating Migration Rule
When moving a capability from module A to module B:
1. Identify ALL consumers of A
2. Migrate each consumer to B
3. Verify each consumer works with B
4. Only THEN remove A
5. Run global orphan sweep after removal
Never delete a provider while consumers still reference it.
---

## Read-Only First Rule
Every review/audit phase starts with read-only analysis. Code changes only after explicit approval.

---

## Module Main-Heart Rule
Each page has exactly ONE main heart:
| Page | Main Heart |
|------|-----------|
| Home | Route Search |
| Route Search | How do I get there? |
| Realtime | Can I ride this line now? |
| Trains | What is this line? |
| History | What did I search before? |
| Tourism | What is worth visiting at the destination? |
No module may hijack another module main heart.

---

## Release Gate Rule
Before tagging a release:
1. Run Preflight check (git status, canonical data, script integrity, provider health)
2. Write System-First Change Rule update if architecture evolved
3. Commit rule update BEFORE tagging
4. Tag on the new commit (not on old HEAD)
5. Push main branch + tag together

---

## Runtime Contract (运行契约)
- Canonical data is loaded by db-loader.js via `fetch` (railway_data.json / station_i18n.json / tourism_data.json).
- `file://` protocol blocks fetch (CORS), so pages CANNOT work when opened by double-click. The project MUST be served over HTTP:
  - `python serve.py`（本地静态服务器 + `/api-proxy/` 官方 API 代理，4.3.405 起替代 `python -m http.server 8017`）then open `http://localhost:8017/pages/home.html`
- **官方源代理（4.3.405）**：ODPT 未提供運行状況的线路（小田急 3 线/ゆりかもめ）由 `data/api/official-railway.js`（window.OfficialRailway）经本地代理抓取官方 API——小田急 `d6oynijiy33tb.cloudfront.net`（x-api-key 公开 key）、ゆりかもめ `cms-2.yurikamome.co.jp/api/operation/`（无 key）。两官方 API 均无 CORS 头，浏览器必须经 `serve.py` 的 `/api-proxy/` 白名单端点转发（防 SSRF）。DataFusion 融合优先级：official（按 line.id）> ODPT > localStatus > fallback。
- Data load success signal: console log `509 stations, 159 lines, 94 tourism stations`.
- The ONLY entry page is `pages/home.html` (index.html redirects there). Do not create or restore any second home.html elsewhere.