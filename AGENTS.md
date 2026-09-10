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
| SotetsuDirect（相鉄直通）列車が山手線 posMap に誤マッチ | P1 | Osaki 等共用駅のため fromStation 一致で山手線に誤配（railway フィールド無視）。湘南新宿ライン/相鉄直通線の車が山手線詳細図に表示される。

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
- 2026-09-09 ユーザー指示（路線検索 三モード＋費用＋種別・4.3.452）: route-search.js を三モード対応に——findRoute(from,to,mode) は MODE_PENALTY（combo 6 / duration 3 / transfers 1000 分の乗換ペナルティ、直通 0）でパラメータ化、乗換案内式の「おすすめ/最速/乗換最少」を実現。search-ui.js 結果カード冒頭にモードタブ（search.mode.combo/duration/transfers、4 言語）を追加、クリックで currentMode を変えて再検索（innerHTML コミット後にバインド——コミット前バインドだと要素不在で無効）。ride セグメントに種別バッジ（TRAIN_TYPE_BY_LINE 保守マッピング：ChuoRapid/Saikyo/Tokaido/Yokosuka 等→rapid、Yamanote/JobanLocal/ChuoSobuLocal→local、未マップは非表示）と方向表示（search.direction「{s}方面/方向/bound for/방면」、direction フィールドから算出）。ヘッダーに総費用（新規 js/fare-estimator.js=window.FareEstimator：operator 別グループ JR-East/地下鉄/私鉄 の距離別運賃梯子、駅間数×平均駅距→km→概算、search.fare_tag「概算/参考/est./예상」で注記）。検証: 新宿→品川 combo=湘南新宿→横須賀 0 乗換 12 分 / duration=埼京→山手 1 乗換 8 分 / transfers=0 乗換 12 分（三モード分岐正しい）、新橋→池袋 ¥470 概算・種別「快速」・「新橋方面」表示、zh 界面 推荐/最快/最少换乘＋新桥方向＋参考、console 0 エラー。料金は概算（データ凍結のため公式運賃表なし）。
- 2026-09-09 ユーザー指示（线上翻译失效・双路径修复）: 4.3.443 を GitHub Pages（biubiu52011.github.io）にデプロイ後、モーダルの運行情報が日文原文のまま——原因: 翻訳エンドポイントがローカル serve.py（/api-proxy/translate）にのみ存在し、静的ホスティングの線上では 404 → 原文へフォールバック。診断: MyMemory は Origin 付きでも 200 + Access-Control-Allow-Origin: * を返す（ブラウザ直結可能）ことを curl で確認；ただしローカル沙箱ブラウザからは当該ドメインへのアクセスがネットワーク出口で遮断される（no-cors でも Failed to fetch、ODPT 外域は正常）＝沙箱環境固有の制限でありユーザー実環境は影響なし。4.3.444 で translate-service.js を二経路化——①ローカル /api-proxy/translate 優先（サーバ側 7 日キャッシュ）、②代理不可（線上 404/ネットワークエラー）時は MyMemory 直結（CORS 許容・登録不要・結果はクライアントキャッシュ）、③全失敗時は原文へ。検証: 構文 OK、ローカル経路は代理優先のまま回帰なし、MyMemory の Origin 付き実測 200+ACAO:*。※沙箱ブラウザでは MyMemory 直結を実測不可のため、ユーザー実環境での確認を要する。
- 2026-09-09 ユーザー指示（丸ノ内線支線のリアルタイム配備・Freeze 例外）: 丸ノ内線支線（MarunouchiBranch 方南町支線）を単独生成せず丸ノ内線体系に統合したままリアルタイムデータを配備（4.3.446）。①odpt-unified.js LINE_RAILWAY_CODE に Marunouchi→Marunouchi / MarunouchiBranch→MarunouchiBranch を追加（ODPT は TokyoMetro.MarunouchiBranch を独立 railway で配信、逆引き集合マッチで共用駅 中野坂上 の列車が支線側に正しく帰属）。②LOS 丸ノ内線カード lineIds=["Marunouchi","MarunouchiBranch"]——システムカに支線を統合（独立カード化しない）、データは branchOf ネストのまま（規則二）。③train-icons.js に MarunouchiBranch=2000系 を追加（本線と同車両、誤 fallback 山手線 E235 防止）。④trains-page.js 支線融合——computeRouteGeometry に branchGeom（支線駅列の座標 bx=junction.x+20+70*idx）を追加、renderTrainMap で svg.__branchGeom に保持、getRealtimePositions が branchOf 子線の列車を fusionLineId 付きで本線詳細図に併合、updateTrainLayer は branchGeom 座標で支線列車を描画（主線と距離を確保）。⑤data-fusion.js 時刻表按需ロード（loadMissingTimetables）で linesNeedingTimetable に支線（line.branches）を追加、toLoad 上限 12→24——支線時刻表（ODPT TokyoMetro.MarunouchiBranch 658 件）を確実に取得（4.3.447）。⑥4.3.448 支線描画スタイルを主線に統一——支線駅ラベルが独立簡略描画（12px/#666）だったのを主線駅と同じ 16px/#555/500 に、支線名を 14px に変更（全支線共通コードのため 1 箇所で全支線に反映）。⑦4.3.449 詳細図の駅・乗換・直通描画を一本化——renderTrainMap の主線駅ループと支線駅ループを新設の統一関数 `_renderStationNode(staticLayer, svgNS, o)` に集約。主線/支線の区別は geometry（座標・side・色・branchGeom）のみに残し、駅円・ラベル（16px/#555/500）・乗換チップ・直通チップは全駅共通パスで描画（支線駅は tx/ty/anchor を bx+6/bsy+3/start で上書き、分岐駅 bsi=0 のみ skipTx で乗換重複を防止）。検証: 丸ノ内線詳細図で支線駅ラベルが主線駅と同一スタイル、山手線 95 換乗アイコン・横須賀線直通チップ（直通湘南新宿線等）が従来どおり描画、ノード構文 OK。
- 2026-09-09 ユーザー指示（直通列車の車両形式・Freeze 例外）: ODPT 列車ロケーション（odpt:Train）に車両形式フィールドが無いことを確認（フィールドは trainType 運行種類・carComposition 編組数のみ）——直通列車の車両は車号規則で識別する方針に。4.3.450 で train-icons.js に THROUGH_SUFFIX_RULES を追加——京葉線上の E 末尾車号＝武蔵野線直通（E231系0番台）、武蔵野線上の Y 末尾＝京葉線直通（E233系5000番台）——JR 社内直通（京葉↔武蔵野）の直通車を車籍どおり表示。検証: 京葉線詳細図で E 号=E231系0番台・Y 号=E233系5000番台 が共存、ノード構文 OK。
- 2026-09-09 ユーザー指示訂正（4.3.452）: 4.3.450 で行った常磐線各駅停車（JobanLocal）のデフォルト車両変更（18000系→E231系0番台）は誤りとして撤回——2026-09-08 のユーザー指示「常磐各停＝千代田線車輛直通担当（18000系）に統一」を維持する。常磐緩行線は全列車が千代田線直通体系の看板口径であるため、自社車と区別せず 18000系 表示を継続。直通列車の車号規則（THROUGH_SUFFIX_RULES）は京葉↔武蔵野のみ有効のまま。
- 2026-09-09 ユーザー指示（开源翻译方案调研・离线模板引擎最终打磨）: 调研结论——浏览器端离线 NMT（OPUS-MT 无 ja→zh/ko 模型、NLLB/M2M-100 200-600MB 与加载性能冲突）、Chrome/Edge 内置 Translator API（Chrome 147 实测 canTranslate 仍不可用）、LibreTranslate（需自托管后端，GitHub Pages 无法承载）、Google gtx 网页端点（数据中心出口被反爬拦截）均不可行；业界/开源无"免费无额度、无注册、线上可用、加载快、覆盖 ja→zh/ko/en"的现成方案，离线模板引擎为当前约束下最优解。4.3.445→450 打磨：①模板顺序修正——運転再開（"見合わせていましたが…再開"）模板前置，避免被運転見合わせ误匹配（東北本線運転再開回归 normal）。②词级替换重写——出现位置收集+长词优先+区间去重，防止连锁替换（"上下線"→"上下行线"后被"上下"再命中成"上下行行线"）；允许空串删除助词（の/を）。③站名候选来源扩展——getStations 实体 + 全线路站表 + 换乘站合并收集（長野原草津口/大前/千倉等仅有 i18n/线路引用、无站实体的站也覆盖）；数据未就绪时不缓存避免空缓存污染。④_normTime 增加 lang 参数（ko 界面"19:10경"）。⑤serve.py 删除 4.3.443 /api-proxy/translate 端点、js/translate-service.js 删除（API 方案废弃清理，realtime-view.js 全部改走 DelayTranslator）。验证: 12 个全量真实样本（zh/ko）全部模板命中、站名/线路/原因全替换、时间规范化正确、console 0 错误。
- 2026-09-09 用户指示（file:// 双击打开搜索不可用修复・4.3.453）: 用户"无法读取路径"根因=双击 home.html 时 fetch 被 CORS 阻断（file:// protocol），db-loader 抛 "No data source available under file:// protocol"，RailwayDB 为空、搜索完全失效。修复：①新生成器 data/core/gen-file-data.js（node data/core/gen-file-data.js）把冻结 JSON（railway_data.json/station_i18n.json/tourism_data.json）序列化为 script 可加载的 .file.js bundle（railway-data.file.js=window.RAILWAY_DATA / station-i18n.file.js=window.RAILWAY_I18N / tourism-data.file.js=window.RAILWAY_TOURISM，含 </script 转义）——JSON 仍是唯一真源，bundle 是派生副本；②db-loader.js file:// 分支改为 loadFileBundles()（顺序 <script> 注入 3 bundle，<script src> 不受 CORS 限制）后 applyData(RAILWAY_DATA, RAILWAY_I18N)+applyTourismData(RAILWAY_TOURISM)——补齐原分支缺失的 i18n/tourism；③HTTP 下不加载 bundle、fetch 路径不变（回归零）。验证: file:// 双击 162 线・北千住→池袋 14 分・¥370 概算・观光 32 处・resolveStationName 正常・console 0 エラー；localhost 5 组搜索回归通过。※改 JSON 后须重跑 gen-file-data.js（AGENTS.md 已记录生成命令）。

- 2026-09-09 ユーザー指示（半蔵門線 直通列車の車籍を車号プレフィックスで判定・4.3.453）: 車号プレフィックスが車籍系統と一致することを実測確認（半蔵門線 ODPT 時刻表 994 件: B プレフィックス 492 件の起点が全て東武側＝南栗橋/久喜/東武動物公園/押上、A プレフィックス 502 件の起点が全て東急側＝中央林間/長津田/二子玉川）。train-icons.js に THROUGH_PREFIX_RULES を追加（Hanzomon: B→東武50000系、A→既定の東急2020系）、getTrainIcon でプレフィックス→サフィックス（京葉 E/武蔵野 Y は 4.3.450 のまま）の順に判定。trainId は「車号_駅idx」と「lineId_車号_駅idx」の2形式に対応（車号＝後ろから2番目のトークン）。検証: 半蔵門線詳細図で B 号=東武50000系・A 号=東急2020系 が共存、京葉線 E/E231系0番台・Y/E233系5000番台 は回帰なし。
- 2026-09-10 ユーザー指示（ODPT railway ID 映射全面修正・4.3.470）: 22 operator の odpt:Railway API 全量（178 ID）をローカル 161 line と対比——JR 系は全数命中（湘南新宿/横須賀・総武 JO 分離/常磐 3 粒度/川越双切点/房総反転/支線帰属すべて正しい）だが、私鉄系の LINE_RAILWAY_CODE が ODPT 公式 ID と命名不一致のまま默認透传 404 だった 25 件を修正。①LINE_RAILWAY_CODE に 24 件追加/修正——京急 5（Keikyu→Main・KeikyuAirport→Airport・KeikyuKurihama→Kurihama・KeikyuZushi→Zushi・Daishi_Keikyu→Daishi）、京成 4（Keisei→Main・KeiseiChiba→Chiba・KeiseiKanamachi→Kanamachi・KeiseiOshiage→Oshiage）、西武 9（Hamura→Haijima（拝島線！ローカル ID は終点駅名誤命名）・Seibu_Sayama→Sayama・SeibuEn→Seibuen・SeibuShinjuku→Shinjuku・SeibuTamagawa→Tamagawa・SeibuTamako→Tamako・SeibuToshima→Toshima・SeibuYamaguchi→Yamaguchi・Yurakucho_Seibu→SeibuYurakucho）、小田急 2（OdakyuEnoshima→Enoshima・OdakyuTama→Tama）、相鉄 1（SotetsuShin-Yokohama→SotetsuShinYokohama）、東京モノレール 1（TokyoMonorail→HanedaAirport）、埼玉新都市 1（NewShuttle→SaitamaRailway）、東北地方線 2（Kamiishi→Kitakami・Sanriku→Yamada——ローカル ID 自体が誤命名（北上線/山田線）、映射層で先に ODPT 公式 ID を垫、改名は Freeze 例外待ち）。②LINE_TO_OPERATOR 修正 1 件（NewShuttle: SaitamaTransit→SaitamaRailway）。③ODPT に真に存在しない 2 線（MinatoMirai 港未来線・KeiseiChihara 京成千原線）は無リアルタイムを受け入れる（LOS カードは静的表示継続）。検証: 命中 134→159/161、残り不整合は港未来・千原の 2 のみ、node --check OK、data-fusion/train-position-estimator の LINE_RAILWAY_CODE 逆引き集合マッチは動的読取のため追加映射が自動適用（消費者変更ゼロ）、他ファイルの旧 ID 参照は全てローカル line ID（凍結層）で影響なし。- 2026-09-09 用户指示（景点详情页首入语言修复）: tourism-detail 页从旅游页进入后首屏固定日语，需再点一次语言按钮才变对——根因: 模块级 `var lang = window.currentLang || 'ja'` 在脚本加载时快照（此时 lang-init 尚未初始化，恒为 ja），首次渲染用该闭包变量；点语言按钮才触发 onLanguageChange 刷新。修复（4.3.451）: init() 首行刷新 `lang = window.currentLang || 'ja'`（渲染前），translateUI/renderArticle 及 getSpotName/getStationLabel 等全部立即用对语言。全局排查确认其他页面（realtime-view/sightseeing/search-ui/trains-page/data-state/history/route-search/translations）均为函数内实时读 currentLang，无模块级快照问题。验证: ko/zh 界面带真实跳转参数直接打开详情页——currentLang 正确、全文对应语言、无日文假名残留、无需再点语言按钮。

- 2026-09-10 ユーザー指示（3 line ID 正名・4.3.471、Freeze 例外）: 4.3.470 で映射層に垫いた 3 つの誤命名 line ID をユーザー拍板で本名へ改名（railway_data.json 凍結層 + 全庫参照同期）。①Hamura→Haijima（西武拝島線——旧 ID は終点駅名 Hamura/羽村 の誤命名、正は拝島駅 Haijima）: lines key/nameEn（Hamura Line→Haijima Line）、終点駅 Hamura→Haijima、lineStationOrder、transferStations 5 件（Kodaira 2 系統・Ogawa 3 線）、stationLines[Haijima] に Haijima 追加。②Kamiishi→Kitakami（JR 北上線——旧 ID は路線名誤写、正は北上）: 首站 Kamiichi/上市 誤引用→Kitakami/北上 修正、transferStations 1 件（OuMain Yokote）、stationLines[Kitakami] に Kitakami 追加。③Sanriku→Yamada（JR 山田線——旧 ID は三陸鉄道と混同、正は山田線）: transferStations 2 件（Tazawako/TohokuMain Morioka）。④幽灵站清理: stationLines/i18n の Hamura（羽村重複、正は Hamu）・Kamiichi（上市）を削除、name_map 羽村→Hamu。⑤同期: odpt-unified.js（LINE_TO_OPERATOR 3 key 改名 + LINE_RAILWAY_CODE の 3 垫片削除——Haijima/Kitakami/Yamada は同名透传で ODPT 命中）、line-operation-systems.js（3 カード lineIds + SAN nameEn Sanriku Line→Yamada Line）、train-icons.js（Hamura→Haijima・Kamiishi→Kitakami キハ110系）。⑥JSON はテキストレベル精确替换で実施（json.dump 全量重写は浮動小数 35.7900→35.79 の 590 行偽 diff を生むため不可、rename_lines.py の json.dump 写法は棄用）、改後 `node data/core/gen-file-data.js` 重跑。検証: ODPT 命中 159/161 不変（3 線透传命中）・全庫一致性エラー 2 件のみ（Keisei lineStationOrder 42≠43 と TobuNoda 残留——いずれも既存・非本次引入）・旧 ID 残留 0（i18n Hamu.en=Hamura の羽村ローマ字 2 箇所は正しく残置）・node --check 全過。

- 2026-09-09 ユーザー指示（図庫整理後の車両アイコンマッピング更新・4.3.457）: images/列車/ が命名規則（型番系/形 + 塗装用途括弧）で整理され 159 ファイルに更新されたため、train-icons.js のマッピングを型番確認の上更新——ChiyodaBranch→05系（北綾瀬）.png（北綾瀬支線専用車、db-loader.js LINE_IMAGE_FIXES も改名追随）、Chiyoda→16000系.png（千代田線本線主力）、JobanRapid→E231系常磐LED.png（常磐線快速主力）、TobuTojo/Tojo→60000系.png（東上線現主力、90000系はデビュー直後）、Keisei系→80000形.png（京成本線系新主力、3200形は引退進行、NaritaAccess/SkyAccess は AE形 維持）、TokyoMonorail→mn-tky10000.png（10000形現役）、TWR/Rinkai→twr71000.png（71-000形現役）、NipporiToneri/Nippori_Toneri→toky330.png（330形実車図）、ExpTobu きぬ・けごん・日光→100系（スペーシア）.png（塗装）、ExpJREast に Nikkoku 特急日光・きぬがわ（253系）追加。検証: 断链 0・ブラウザ実測マッピング値正しい。未接入（データに線なし/重複/旧型）: 北総 9200形・江ノ島電鉄・箱根登山 1000形・千葉都市モノレール 1000形（線削除済み）、相鉄 10000/11000系・都営 todn- 別名・TX 1000系/3000系・東武 10000/30000系 等は図庫に留置。

- 2026-09-09 ユーザー指示（都電・新型号の見落とし補接・4.3.458）: 4.3.457 で見落とした新素材を補接——Arakawa（都電荒川線）→todn8503.png（都電8500形）、NaritaAccess/NaritaSkyAccess→3900系.png（スカイアクセス線の普通列車）＋ExpKeisei 新設でスカイライナー（AE形）を typeMatch 判定（Skyliner→AE形/Rapid・Local→3900系 実測）、SotetsuShin-Yokohama→11000系（新塗装）.png（相鉄新横浜線主力）、Odawara→5000系.png（小田急5000形 2025年新型）、TsukubaExpress→tx3000.png（TX-3000系、OPERATOR/LINE 両方）。NaritaAccess はデータに無い旧 ID（LINE_ICONS に残置）。未接続: todn8903（8500形を代表採用のため予備）、東急6021系（6020系2次車・外観同一）、小田急2000形/8000系・相鉄10000系/8000系・京成3200形・JR 211系甲信越/701系仙台/E127系100番台/E501系/E655系・TX旧型・mn-tma編成別・todn100f/todn5500（旧型/同型別名/接続先なし）——図庫に留置。データに線なし: 北総9200形/江ノ島電鉄/箱根登山1000形/千葉都市モノレール。- 2026-09-09 ユーザー指示（詳細図 列車の終点・方向ラベル・4.3.454）: 直通・推定列車の終点と方向を詳細図に表示。①データ層——posMap（実位置）と推定器 positions の両方に destinationStation（odpt:destinationStation の末段 ID）を追加。②描画層——updateTrainLayer が各列車に 2 行ラベル（上＝方向 ▶+railDirection 端点駅名 7px/#999、下＝終点駅名 8px/#666）を data-train-label-for で付与し、アイコン移動に追従・列車消滅で同一 uid クリーン。③駅名正規化——ODPT のハイフン無し ID（KiyosumiShirakawa）とプロジェクトのハイフン付き ID（Kiyosumi-Shirakawa）を「ハイフン除去+小文字」で突合して表示名解決（直通終点 南栗橋/久喜/東武動物公園/中央林間 等も正しく表示）。検証: 半蔵門線 B 号=東武50000系+▶渋谷/中央林間・長津田、A 号=東急2020系+▶押上/押上・南栗橋・久喜、京葉線 ▶Inbound/東京、E/Y 車号規則は回帰なし。※中央林間（ChuoRinkan）はプロジェクトに駅実体が無く i18n 参照のみ（東急田園都市線欠落は別途）。

- 2026-09-09 ユーザー指示（都電荒川線のリアルタイム配備・4.3.459）: API 线路 ID=Toei.Arakawa / 日文名=都電荒川線。稼働確認の結果、**ODPT 時刻表キャッシュの圧縮バグ**を発見・修正——compressTimetable が stop の `odpt:station` のみ保存するが、現行 ODPT は `odpt:departureStation`/`odpt:arrivalStation` で返すため、キャッシュ解凍後は全 stop の駅が空→時刻表推定位置が全線で 0 になる（都電荒川線 879 条・23041 stop 全滅）。修正: 圧縮時は station/departureStation/arrivalStation の三種をフォールバック、解凍時は departureStation/arrivalStation を復元、キャッシュキー odpt_timetable_cache_v1→v2 に昇格（旧空駅キャッシュ強制失効）。Arakawa への専用マッピング追加は不要（LINE_RAILWAY_CODE 未定義時は self-match フォールバック＋駅名マッチで機能）。検証: キャッシュ非ヒット（API 新規取得）で pos=11、ヒット（v2 解凍）でも pos=11・詳細図 trainLayer=11・アイコン=todn8503（都電8500形、4.3.458 マッピング）。同時に 4.3.457/458 で参照開始した新規画像素材（todn8503/todn8903/toky330/tx3000/mn-tky10000/twr71000/mn-tma*/todn100f/todn5500/横浜高速鉄道 yok*）を初回コミット（これまで未追跡で線上 404 のリスク）。

- 2026-09-10 ユーザー指示（Toei odpt:Train 有効化・4.3.468）: ユーザー提示の ODPT URL 実測で Toei の odpt:Train が返却されることを確認（浅草/新宿/三田/大江戸、深夜 0:26 でも 26 件）——コード側は ODPT_ENDPOINTS["Toei"].train=null で取得していなかったため、train エンドポイントを有効化。検証: ODPT_TRAIN_POSITIONS["Toei"]=25、Asakusa pos=4・Oedo 8・Shinjuku 5・Mita 4 が全て estimated:false（真のリアルタイム位置）、詳細図に列車描画。**ただし都電荒川線（Arakawa）は Toei の odpt:Train に含まれない**（25 件すべて地下鉄線）——都電は ODPT が Train リアルタイム位置を提供しないため、荒川線は従来どおり時刻表推定（estimated:true）のまま。- 2026-09-09 ユーザー指示（方向ラベルを進行方向に・4.3.455）: 列車の方向矢印を進行方向に向ける——方向端点駅名の站表 index と現在位置を比較（端点が下＝▼でアイコン下、上＝▲でアイコン上）。Inbound/Outbound は起点/終点方向で上下判定（Inbound=▲、Outbound=▼）。環線 Inner/Outer 等は判定不能のため ▶ 固定。▼ 時は終点ラベルを 1 行下げて重複回避、ラベル追従も移動方向に再配置。検証: 半蔵門線 A 号（押上方向）=▼下・B 号（渋谷方向）=▲上、京葉線 Inbound/Outbound 語義判定。---

- 2026-09-10 ユーザー指示（推定データの提示方法変更・4.3.469）: 詳細図の推定ラインの提示を再設計。①容器内に「時刻表で推定中...」（trains.no_data、positions=0 時に表示されていた tp-no-data ブロック）を出さない——推定データはページ読込と一緒に初期化し、容器内はリアルタイムと同一見た目（.train-icon.estimated の opacity 0.65 半透明を廃止、opacity 1 に統一）。②データが推定由来の場合は容器外（.tp-map-wrap の後、下方中央）に `*データは時刻表からの計算` 注記（.tp-est-note、trains.estimated_note を 4 言語で追加: zh=*数据来自时刻表计算 / ja=*時刻表からの計算データ / en=*Data calculated from timetable / ko=*시간표 기반 계산 데이터）。③判定: その路線の realtimePositions に estimated:true が 1 つでもあれば注記表示（リアルタイム位置のみの路線には出さない）。実装: trains-page.js に updateEstimatedNote(el, positions) を新設し増分・全再構築の両パスから呼ぶ（冪等）。検証: Nippori_Toneri（6 両全推定）容器内 noData なし・注記 zh「*数据来自时刻表计算」/ ja「*時刻表からの計算データ」・全アイコン opacity 1、Yamanote（17 両リアルタイム）注記なし。
- 2026-09-09 ユーザー指示（環状線の方向ラベル・4.3.456）: 環状線（山手線等）の InnerLoop/OuterLoop を言語別にローカライズ（内回り/外回り、内环/外环、Inner/Outer、내선/외선）し、上下矢印なし・終点ラベル非表示（ODPT 環状線の終点は大崎等の折返点で実終点でない）。基点方向詞 Northbound/Southbound/Eastbound/Westbound も北行/南行/東行/西行（4 言語）に。検証: 山手線 28 車=内環/外環で終点なし、274M=▶北行/新宿、半蔵門線 ▲渋谷/▼押上 は回帰なし。※相鉄直通（SotetsuDirect）列車が山手線 posMap に誤マッチする既存問題を確認（Osaki 共用駅のため）——Known Debt 化（要ユーザー判断）。
- 2026-09-09 用户指示（景点详情页地图换简洁底图・4.3.459）: 用户嫌 OSM 官方 embed（mapnik）信息太杂，要求"常用的或信息简洁一点的"地图——方案: Leaflet（业界标准，本地化以满足 CSP script-src 'self'）+ Carto Positron 浅色极简底图（免费无 key，仅灰白底+主干道路，无 POI 噪音）。改动: ①curl 下载 leaflet@1.9.4 到 js/leaflet/leaflet.min.js（147KB）+ css/leaflet/leaflet.css（14.8KB，新目录需纳入 git）；②tourism-detail.html CSP img-src 追加 https://*.basemaps.cartocdn.com（瓦片走 img 标签，无需 connect-src），head 注入 leaflet.css、body 注入 leaflet.min.js（tourism-proximity 之前），页面全量 v=4.3.459；③tourism-detail.js initMap 由 OSM iframe 重写为 L.map + L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png')（subdomains abcd、maxZoom 20、attribution OSM+CARTO），zoomControl:false（手势缩放）、scrollWheelZoom:false（防滚动劫持）、divIcon 像素风绿点 marker（.td-map-marker-dot 13px #008803+白边+阴影，无外域图片依赖）、popup 显示景点名、mapEl._tdLeaflet 缓存实例以在切换景点/语言时 remove() 防重复初始化、setTimeout invalidateSize() 修正挂载后尺寸；④tourism-styles.css .map-container 圆角 8→12px + 柔和阴影，新增 .leaflet-container 底色/.td-map-marker*/.map-error（Leaflet 缺失时兜底文案 detail.unavailable）。验证（浏览器 DOM 实测，不用截图）: 瓦片 6/6 全加载（retina @2x）、marker/popup（LUMINE 北千住）正常、attribution 正确、zoom 控件无、OSM iframe 已移除、ko/zh 重载后地图重建无重复实例、console 0 错误。※CSP 仍只放行 self + Carto 瓦片域，未引入任何外域脚本。
- 2026-09-09 用户指示（景点地图底图演进 4.3.460→461）: 用户嫌 Carto light_all 英文地名标签与多语言界面不协调——①4.3.460 试 light_nolabels（无文字版）：Carto 语言变体 light_ja/zh/ko/en 已废弃全 404、OpenFreeMap raster 403/404 不可用，仅 light_nolabels（200）可达；但用户实测"找不到位置"→ ②4.3.461 换回 light_all。Wikimedia osm-intl 实测 403（需 UA/已限制）不可用。
- 2026-09-09 用户指示（MapTiler 接入・4.3.462）: 用户主动提供 MapTiler（wiki.openstreetmap.org/wiki/MapTiler）并登录控制台，由助手在浏览器（用户登录态下用户授权）创建 key：name=pixel-tetsudo、Allowed user-agent header=pixel-tetsudo-static、Allowed HTTP Origins=biubiu52011.github.io/localhost/localhost:8017/127.0.0.1:8017（格式必须无协议，带 https:// 报 Invalid）。Key=tYRNv4akrEAKTL5ORzUm（20 字符完整，frontend key 模式靠 origin 防盗用；免费层 10 万请求/月，超限当月停服）。tourism-detail.js initMap 瓦片层改 MapTiler Basic 极简样式: 'https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=' + MAPTILER_KEY + '&language=' + langMap[currentLang]（ja/zh/ko/en，中文界面中文地名），tileLayer crossOrigin:'anonymous'（MapTiler origin 校验需浏览器带 Origin 头）、maxZoom 19；tileerror 兜底自动移除 MapTiler 层回退 Carto light_all（key 失效/额度超/校验异常时地图不空白）；MAPTILER_KEY 常量声明在 IIFE 顶部（key 属前端可公开，靠 origin 白名单防盗）。tourism-detail.html CSP img-src 追加 https://api.maptiler.com。验证: 浏览器实测 ko 界面 6/6 瓦片 language=ko、zh 界面 6/6 language=zh、loadedOK 全过、console 0 错误（curl 带 Origin 仍 403=UA 校验差异，浏览器 UA 通过，以浏览器实测为准）。※origin 规则变更需 5 分钟生效；创建时用 JS 直改 textarea.value 会绕过 React state，本 key origins 实际保存成功（页面回读确认）。
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


---

## 2026-09-09 用户指示（景点位置漂移修正・站坐标批量修复・Freeze 例外・4.3.456）

用户反馈"很多景点位置漂移，需要重新确认"。排查结论：**32 个景点 coord 全部正常**（距真实位置 <500m），漂移根因是**站坐标错误 + 虚构站**——景点关联（TourismProximity Haversine 最近站）被错误站坐标污染，导致南千住一带景点被关联到"西馬込"（其坐标错位 17km）等。

修复（railway_data.json stations 坐标 30 站 + 补站 13 个 + 删虚构站 4 个 + db-loader approx 1 站）：

1. **坐标修正 30 站**（Wikipedia/公开源核验后写入）：Nishi-Magome→35.5869,139.7059（原错至南千住）、Minami-Senju→35.7333,139.7990（原错 7km）、Otsuka→35.7314,139.7293、Mejiro→35.7207,139.7066、Nishi-Koiwa→35.7283,139.8793、Musashi-Sakai→35.7022,139.5456（原 42km 错位）、Nakagami→35.7090,139.3757、Akishima→35.7068,139.3597、Haijima→35.7213,139.3435、Ome→35.7928,139.2614、Miyanohira→35.7846,139.2506、Sawai→35.8007,139.2302、Mitake→35.8063,139.1908、Higashi-Akiru→35.7219,139.3239、Hakusan→37.9119,139.0297（原为东京白山坐标，越后线新潟白山应在此）、Nagatsuta→35.5319,139.4944、Naruse→35.5331,139.5005、Tama→35.6381,139.4990、Isogo→35.4000,139.6181、Shin-Koyasu→35.4887,139.6552、Ofuna→35.3543,139.5316、Oi→35.6062,139.7349、Tochomae→35.6895,139.6917、Wakoshi→35.7878,139.6678、Urawa→35.8617,139.6450、Akabane→35.7776,139.7209、Kawaguchi→35.7976,139.7206、Higashi-Ome→35.7898,139.2661、Ishigamimae→35.7858,139.2003、Futamatao→35.7900,139.1725、Hinatawada→35.7833,139.2440。

2. **删除虚构站 4 个**（真实不存在的站，坐标在荒川区、干扰景点关联）：Shin-Machiya（新町屋）、Minami-Magome（南馬込）、Tobu-Dozui-Michi（土居道）、Koji（工房）——stations/name_map/station_i18n 三处引用全清。

3. **补站 13 个**：Mikawashima 三河島（常磐線挂线但 stations 表无定义）→35.7334,139.7764 + i18n 4 语言；青梅線数据补全 12 站（挂线但 MISSING）：Higashi-Nakagami/Ushihama/Fussa/Hamu/Kosaku/Kabe/Ikusabata/Kawai/Furusato/Hatonosu/Shiromaru/Okutama。

4. **db-loader STATION_FIX_DATA**：Kawagishi 川岸 36.077,138.005→35.9727,137.9870（approx 坐标修正）。

5. **景点 coord 修正 2 处**：乙女ロード→35.7302,139.7160（原东偏 550m）、雑司が谷鬼子母神堂→35.7237,139.7166。

验证：全量相邻站检测 >12km 仅剩 2 对（Tokaido Odawara-Atami 19km=真实远距 / Saikyo Kawaguchi-Omiya 15km=线路归属问题另行记录）；32 景点全部正确关联（南千住组→Minami-Senju、池袋组→Ikebukuro）；浏览器实测 localhost + file:// 390 站/32 景点/console 0 错误；bundle 已重跑（改 JSON 后须重跑 `node data/core/gen-file-data.js`）。

遗留：**埼京線（Saikyo）stations 混入京浜東北線系駅**（Urawa/Naka-Urawa/Minami-Urawa/Warabi/Nishi-Kawaguchi/Kawaguchi 等，埼京線実経路は赤羽→北赤羽→武蔵浦和→中浦和→南与野→与野本町→北与野→大宮）——线路站序重构风险大，另立任务待用户指示。


---

## 2026-09-09 用户指示（观光景点全量审计・方案A千住桜堤・Freeze 例外・4.3.466）

用户反馈"景点名称明显不是日语""名称可能有出入""定位有问题"，并拍板方案 A（以现坐标为准改名）+ 授权 32 景点全量审计。根因：**观光数据以中文为基底生成**（images/観光地/ 40 张图片文件名全部简体中文），日语名后补翻译产生造词与事实错误。

### 方案 A：隅田川 尾久橋付近歩道 → 千住桜堤
- 原名称"隅田川 尾久橋付近歩道"为编造词（"付近歩道"非正常日语）；真尾久橋在 35.75404,139.77007（荒川区東尾久↔足立区小台），与原坐标 35.743122,139.803011（千住関屋町・隅田川東岸）差 3.3km。
- 现坐标属于**千住桜堤**（足立区千住関屋町〜曙町的隅田川东岸樱并木游步道，あだち桜マップ记载"千住大踏切から荒川土手までの桜並木 約800m・約100本"，足立区千住桜堤中学校=千住河原町4-7 佐证）——名称/desc/i18n（4 语言）/图片文件名（隅田川 尾久桥附近步道.jpg→千住桜堤.jpg）全部改为千住桜堤，coord 维持（千住関屋町エリア）。

### 审计修正（tourism_data.json 32→31 スポット）
- **名称修正 9 处**（全部核实为真实存在）：千住 街之驛→**千住街の駅**（足立区千住3-69・北千住駅西口）、宿場町通商店街→**宿場町通り商店街**、荒川 虹之広場→**虹の広場（荒川河川敷）**、杉田玄白「解体新書」記念碑→**観臓記念碑（解体新書）**（小塚原回向院）、迭翠軒 (関屋の里碑)→**関屋の里（冨嶽三十六景）**（北斎画題実在）、吾妻稲荷神社→**柳原稲荷神社**（足立区千住柳原町・家康由緒）、隅田川堤防遊歩道 (千住発着場)→**隅田川テラス（千住発着場）**（東京都親水テラス・千住汐入大橋たもと）、堀切大橋 (荒川河川敷)→**堀切橋（荒川）**、学園通り旭町商店街→**千住旭町商店街（学園通り）**。
- **坐标修正 3 处**：虹の広場 35.75705,139.804111→35.7572771,139.805376、柳原稲荷神社 35.744111,139.812361→35.7478199,139.8128981（柳原二丁目）、堀切橋 35.746111,139.8225→35.7457846,139.8192654（堀切四丁目・橋東詰）。
- **削除 1 处**：ダイエー千住曙町店（超市非观光地，与另 4 处购物设施性质重复）。
- **dist/dir 补完 5 处**：柳原千草園/柳原商栄会商店街/隅田川テラス/堀切橋/関屋の里（Haversine 実測補入）。
- **desc 修正 6 处**：千住桜堤/観臓記念碑/関屋の里/柳原稲荷神社/隅田川テラス/堀切橋（4 语言同步，史实・位置核实）。

### 图片文件名日语化（images/観光地/ 40 张）
- 上一轮已日语化 10 张（千住桜堤・千住街の駅・宿場町通り・虹の広場・観臓記念碑・関屋の里・柳原稲荷神社・隅田川テラス・堀切橋・千住旭町商店街），本轮剩余 16 张全部日语化（阳光城→サンシャインシティ、西武百货→西武百貨店、东武百货→東武百貨店、Animate→アニメイト、乙女路→乙女ロード、池袋西口公园→池袋西口公園、杂司谷鬼子母神堂→雑司が谷鬼子母神堂、汐入公园→汐入公園、延命寺 (首振地藏)→延命寺（首振地蔵）、回向院 (小冢原回向院)→回向院（小塚原回向院）、瑞光公园→瑞光公園、净闲寺 (投込寺)→浄閑寺（投込寺）、尾花鳗鱼饭→尾花 (Obana) うなぎ料理、素盏雄神社→素盞雄神社、柳原千草园→柳原千草園、柳原商荣会→柳原商栄会）。
- 未引用孤立文件 8 个（LUMINE 池袋/スカイツリー/宝可梦中心/池袋 PARCO/南池袋公园/浅草フォルダ/浅草神社/唐吉诃德 池袋東口駅前店）**未处理**——不在 31 スポット引用内，待用户判断（删除/注册/保留）。

### 验证
31 スポット・4 语言欠损 0（name/desc/hours/fee/bestTime/tips 全 i18n）・图片 31/31 加载成功・console 0 エラー・ko 界面実測（센주 사쿠라 츠츠미）・bundle 重跑済み（gen-file-data.js）。版本 4.3.466。

- 2026-09-09 ユーザー指示（8枚孤立画像の観光スポット登録・Freeze 例外）: images/観光地 の未引用8枚を観光スポットとして登録（4.3.467）——LUMINE 池袋（35.7288134,139.7091823 ルミネ池袋・西口直結）、東京スカイツリー（35.7100543,139.8107141 押上）、ポケモンセンターMEGA TOKYO（サンシャインシティ内 35.728917,139.719389）、池袋PARCO（OSM 35.7308476,139.7123177・南池袋1-28-2・営業中）、南池袋公園（35.7275715,139.7143507）、浅草（浅草寺・仲見世通り 35.7134032,139.7955265）、浅草神社（35.7148087,139.7974977）、ドン・キホーテ池袋東口駅前店（OSM 35.729333,139.7124613・南池袋1-22-5・24時間営業）。spots 31→39、全17フィールド+4言語 i18n 完備。中文ファイル名5枚を日本語化（宝可梦中心→ポケモンセンター MEGA TOKYO／唐吉诃德→ドン・キホーテ 池袋東口駅前店／南池袋公园→南池袋公園／池袋 PARCO→池袋PARCO）。sightseeing.js 表示制限拡張——getAllSpotsDynamic limit 10→30・radius 3000→3500、renderGrid slice(0,10)→slice(0,30)（limit 10 では新スポットが表示されない問題を解消；池袋12件/南千住27件表示）。千住旭町商店街の欠損 dist/dir 補完（4 min walk/南東）。検証: 39 spots・4言語欠損0・画像39/39・池袋12カード（新5件）・南千住27カード（浅草/スカイツリー表示）・ko界面実測（돈키호테/루미네/파르코 等）・詳細ページ画像ロード・console 0エラー。※並行セッション 7eac172（MapLibre OMT 修复）と同一コミットに同居、AGENTS 記録は本行で補完。

- 2026-09-10 用户指示（Inbound/Outbound 方向词本地化・4.3.470）: ODPT odpt:railDirection 官方枚举——JR 干线用 Inbound/Outbound（上り/下り 抽象方向）、京浜東北線 Northbound/Southbound、中央・総武緩行 Eastbound/Westbound、山手線 InnerLoop/OuterLoop、東京メトロは具体终点站名。trains-page.js _trainDirText 原来仅 Inbound/Outbound 直接返回英文 tail（其他方向词均已 4 语言本地化）——中文/日文界面出现 "Outbound"。新增 DIR_BASE_NAMES（Inbound=上り/上行/Inbound/상행、Outbound=下り/下行/Outbound/하행）并置于分支首位。验证: 常磐線 Joban 详情页 4 语言实测——ja ▼下り / zh ▼下行 / en ▼Outbound / ko ▼하행，浏览器缓存绕过（?r= 随机参数）确认加载 v=4.3.470。

- 2026-09-10 用户指示（列车标签单化・4.3.471）: 列车图标标签改为单标签——图标下方/上方显示 "▼大宫"/"▲大宫"（箭头+方向端点站名），不再单独显示"上下行"方向词与终点标签。trains-page.js appendTrainLabels 重构：①抽象方向词（Inbound/Outbound/Northbound/Southbound/Eastbound/Westbound，ODPT odpt:railDirection 官方枚举）→ 用终点站名（_trainDestText）代替（上り=往线路终点=▲终点、下り=▼终点）；②具体站名方向词（TokyoMetro.YoyogiUehara 等）→ 显示该站名（_resolveStationLoose）；③环线（InnerLoop/OuterLoop）→ 保留内回り/外回り（4.3.456 用户决定）；④单标签 8px/#666（原 dest 样式），dir 位置（▼下 py+17 / ▲上 py-14）。删除 _trainDirText/DIR_BASE_NAMES/COMPASS_DIR_NAMES（4.3.470 的 Inbound/Outbound 本地化被本需求取代——不再显示上下行文字）。验证: 中央快速 ChuoRapid zh 界面 ▲东京/▼高尾、ko ▲도쿄/▼타카오、dest 标签 0；山手线环线 내선/외선 保留；夜间无车线路（常磐/半蔵門 0 列）无标签属正常。

- 2026-09-10 用户指示（都電荒川線实时列车只有2条・4.3.472）: 用户实測发现荒川線详情页只有 2 条实时列车。根因——ODPT 站 ID 与本地站表命名体系不同：ODPT 驼峰（ArakawaShakomae/OjiEkimae/Kishibojimmae 等）vs 本地下划线+异拼写（Arakawa_Shako_Mae/Oji_Eki_Mae/Onishimogami_Mae 等），17 条 odpt:Train（Center API 实测，深夜亦有）仅 Kajiwara/Asukayama/Waseda 3 站 ID 恰好一致能匹配。修复：data-fusion.js STATION_ALIAS 追加 26 条荒川線站 ID 别名（odpt→本地），验证 17/17 全命中；odpt-unified.js 4.3.460 注释「荒川線提供外」系误认已订正（実測 17 件/昼、30 駅全駅、TrainTimetable 879 件）。附带数据问题（待拍板）：本地第29站 Kataomo_Bashi（片倉橋）为错误站名，荒川線正式第 29 站是面影橋（ODPT Omokagebashi，别名已先映射保证位置匹配，改冻结数据需 Freeze 例外）。
- 2026-09-10 用户指示（方位词方向映射表・4.3.473）: "线上很多 ▶新宿"根因——_trainMoveDir 只映射 Inbound(▲)/Outbound(▼)，ODPT 官方方位词 Northbound/Southbound/Eastbound/Westbound（JR-East 367 辆中 107 辆、Toei 93 辆中 48 辆）落入"站表查找同名站"失败 → 全部兜底 ▶+终点站名（埼京線 Southbound→新宿 显示"▶新宿"、京浜東北 Northbound→大宮、中央総武緩行 Eastbound→千葉 等）。修复：js/trains-page.js 新增 DIR_AXIS_MAP（8 线 13 条目：KeihinTohoku/ChuoSobuLocal/Saikyo/Kawagoe/ShonanShinjuku/Asakusa/Mita/Shinjuku；+1=站表正向→▼、-1=反向→▲），判定依据 2026-09-10 ODPT odpt:Train 实时样本 odpt:fromStation→toStation 沿冻结站表 index 增减、每条目样本 100% 一致；未建表线路保持 ▶ 兜底（不猜测方向）。验证：155 辆方位词车 ▲/▼ 全覆盖、▶ 仅剩荒川線 Minowabashi 6 辆（站名 ID 对齐由并发 4.3.472 STATION_ALIAS 覆盖，trains-page 站表查找不受其影响属遗留）、node --check OK。※Kawagoe 站表顺序 大宮→日進→西大宮（西大宮在日進后），Southbound=大宮方向=-1 与 ODPT 一致；SotetsuDirect 直通车无独立 lineId、融合到宿主线时用宿主线映射（埼京線南北端语义恰好吻合）。
- 2026-09-10 用户指示（大江户线 6 字形标签 + 站表修正・4.3.475）: 用户指出大江户线不是普通环线（环线+光丘放射段复合体）。①站表修正（Freeze 例外，ODPT odpt:Railway:Toei.Oedo stationOrder 39 项核验）——删 8 个混入他线站（東練馬/中野富士見町/西新宿/曙橋/赤坂見附/表参道/明治神宮前/新宿三丁目）、补 7 个缺失真站（落合南長崎/若松河田/築地市場/赤羽橋/麻布十番/六本木/国立競技場）、按官方序重排为 [0]=Tochomae 枢纽 + 光丘段(1-10) + 环线段(11-37)，38 站（Tochomae 不重复，渲染自动闭合）；stationLines/换乘同步（Oedo 换乘 43→35，删错站 9 条，六本木↔日比谷/麻布十番↔南北 双向换乘新增；他线→Oedo 删 10 增 2）；station_i18n 新增 4 站、修 Azabu-Juban/Roppongi ko 错字、删 Higashi-Nerima；durationTotalMin 80→76。②标签规则——ODPT 把光丘段列车也标 InnerLoop/OuterLoop（实时 30 辆各 15），trains-page.js 新增 _isOedoBranchTrain（stationIndex 1-10 或都厅前出发 dest=光丘）+ _trainMoveDir 光丘段分支（往光丘=▲、往都厅前=▼，tail 屏幕方向与站表 index 相反）——光丘段列车显示真实终点（光丘/都厅前）+方向箭头，环线段列车保持内回り/外回り（含绕环线后去光丘的 1211B 类车）。验证：30 辆 ODPT 实时车 10 光丘段（5▲5▼）全部终点正确、20 环线车内回/外回、新站全部命中 index、数据一致性 8 项全过、node --check OK。※ODPT 无显式支线字段，光丘段判定靠站序区间+destinationStation 推断；ODPT ascendingRailDirection=OuterLoop/descendingRailDirection=InnerLoop。

- 2026-09-10 用户指示（面影橋正名・4.3.473，Freeze 例外）: 荒川線第29站 Kataomo_Bashi（片倉橋）为错误站名，正式为面影橋（ODPT 官方站 ID Omokagebashi，owl:sameAs 实证）。冻结层 railway_data.json 文本级替换 3 处（lines.Arakawa.stations[28] / stationLines key / lineStationOrder）为 Omokagebashi；station_i18n.json 键+4语言值（ja 面影橋/zh 面影桥/ko 오모카게바시/en Omokagebashi）；name_map['面影橋'] 原已指向 Omokagebashi（此前为悬空引用，改后自动生效）。data-fusion.js 删除 STATION_ALIAS 的 Omokagebashi→Kataomo_Bashi（站 ID 现直接一致）；db-loader.js Data Correction Layer 1-3 号（Kataomo_Bashi→Omokage_Bashi 运行时补丁）使命完成删除（保留 4-5 号 Tōnami/MarunouchiBranch）。重跑 gen-file-data.js。验证: 17/17 Train 命中、ODPT 30 站可映射 30/30、全库 Kataomo_Bashi 残留 0（仅注释/历史记录）、JSON/JS 语法通过、git diff 干净。※荒川線 30 站仅 Waseda 有坐标对象（既有缺坐标状态，属 F-清单类，非本次引入）。

- 2026-09-10 用户指示（白天全量通查・4.3.474）: 趁白天各线 ODPT 数据齐全，全量拉取 620+ 条 odpt:Train 模拟项目 loadTrainPositions 匹配逻辑（含 STATION_ALIAS/归一化/LINE_RAILWAY_CODE 反向集合/主线选优）。发现并修复：①A 类命名差异 25 条——STATION_ALIAS 追加 24 条（Kasumigaseki/Shimbamba/Umeyashiki/Futamatashimmachi/KasaiRinkaiPark/KitaKonosu/ShinNihombashi/Ozaku/Kawasakidaishi/YrpNobi/Misakiguchi/ShimMatsudo/HanedaAirportTerminal1and2/Yaita/Konosu/Kojimashinden/Jimmuji/Ryugasakishi/Omurai/ShimMisato/Kojiya/Motohasunuma/Daishimae/Hamura/HanedaAirportTerminal3/Suzukicho/Daishibashi 共 28 条）——本地有同站仅 ID 拼写差异，alias 兜底不动冻结数据；②新增 STATION_ALIAS_BY_RAILWAY（railway 感知别名，优先于全局）——ODPT Oyama 双义（Tojo 大山=本地 Ooyama / Utsunomiya 小山=本地 Oyama），全局 alias 会误伤，按 railway 区分（loadTrainPositions 中 railway 提取提前至 alias 转换前）。修复后通查：主流线路全部 100% 命中（Main 45/45、Tojo 33/33、Utsunomiya 20/20、SaikyoKawagoe 18/18、Mita 17/17、Joban 7/7、Ome 7/7、Kurihama 5/5、Daishi 4/4、Airport 4/4），残余 miss 全部为 B 类缺站/缺线。③B 类（Freeze 例外待用户批准，未改数据）：Oedo 大江户线缺 7 站（若松河田/国立競技場/六本木/麻布十番/赤羽橋/築地市場/落合南長崎）+混入 8 站（東練馬/中野富士見町/西新宿/曙橋/赤坂見附/表参道/明治神宮前/新宿三丁目）；Saikyo 埼京線缺 4 站（浮間舟渡/武蔵浦和/与野本町/北与野）+混入 4 站（浦和/蕨/西川口/川口=京浜東北線站）；Ogose 越生線 8 站整体错（埼玉→坂戸/一ツ松→一本松/西太田→西大家/川角 ID/武蔵長瀬→武州長瀬/武蔵唐沢→武州唐沢）；Keiyo 缺幕張豊砂（2023 新站）；Takasaki 缺神保原；Kurihama 缺三浦海岸；Itsukaichi 缺熊川；Kameido 缺亀戸水神；TobuNikko 缺幸手；SotetsuDirect 相铁直通 ODPT 归 JR-East 本地无线归属（关联 Known Debt P1 相铁直通误配山手線）。

- 2026-09-10 用户指示（ODPT 大扫除批量修复・4.3.476，Freeze 例外）: 基于 ODPT/官方权威站表重建/修正本地 161 线错乱站表，分 3 步执行并全量回归。
  **Step1（sweep_fix_rd.py，railway_data.json 主体）**：21 线站表重建全部命中——Saikyo 19（缺 4 补 4：浮間舟渡/武蔵浦和/与野本町/北与野，去 4 京浜東北混入：浦和/蕨/西川口/川口）、Ogose 8 站整体官方化（坂戸/一本松/西大家/川角/武州長瀬/武州唐沢等）、Nikkoku 9 站官方序、ShonanShinjuku 20→24（+西大井/新川崎/東戸塚/保土ヶ谷）、Sotobo 30→32、Narita 22→17、Ryomo 23→22（官方 22 站：删 Manmada/Nogi/Koga/Inubushi/Tanuma/Konaka/Higashi-Kiryu/Shimo-Shinden，补 Kunikada/Isesaki/Komagata/Maebashi-Oshima）、Joetsu 34→36、TobuUtsunomiya 9→11（東武宇都宮線整线改造）、TobuNikko 25→26、Keiyo 17→18、KeikyuKurihama 8→9、Nippori_Toneri 12→13 等。站 ID 正名：Hamura→Haijima（4.3.471 已做）、Musashi-Hikita→Musashi-Hikida、Iwaya→Iwajuku（岩宿，両毛線真站非幽灵"岩屋"）、Ryubai→Ryumai（竜舞，东武公式 Ryūmai）；LINE_RENAME Utsunomiya→TobuUtsunomiya（東武宇都宮線，与 JR UtsunomiyaJR 彻底解耦）。40 个新站坐标落位（42 库中 2 个本就存在）、stationLines 孤儿清 27 条（含 Echigo-Iwasaki/Narashima/Kassemba/Nishi-Akiru/Shibayama/Kashima-Ono）、lso 161 线、name_map 1704 键、写回 43314 行。
  **Step1b（sweep_fix_rd2.py）**：TobuUtsunomiya 站序官方化（Yashu-Hirakawa 野州平川移至第 2 位，11 站：[Shin-Tochigi,Yashu-Hirakawa,Yashu-Otsuka,Mibu,Kuniya,Omochanomachi,Yasuzuka,Nishi-Kawada,Esojima,Minami-Utsunomiya,Tobu-Utsunomiya]）；両毛線⇔東武伊勢崎線 Isesaki 相互换乘声明（type:in，参照川越先例；Isesaki stationLines=['TobuIsesaki','Ryomo']）。
  **Step2（sweep_fix_i18n.py，station_i18n.json）**：45 个缺失站 4 语补全（43 新增+2 键改名 Ryubai→Ryumai/Iwaya→Iwajuku）+ 内容修正 3 处（Ryumai 竜舞・Iwajuku 岩宿・Miura-Kaigan 三崎港→三浦海岸，ko 错字 미우라카이가ㄴ→미우라카이간）。站表 2510 站 i18n 缺失 0。
  **D 类（odpt-unified.js LINE_RAILWAY_CODE）**：补 TobuUtsunomiya→Utsunomiya（ODPT Tobu.Utsunomiya 独立 railway，与 JR UtsunomiyaJR→Utsunomiya 并存、operator 不同不冲突）、Shinjuku→Shinjuku 显式文档化（都営新宿線，透传已命中）；data-fusion.js STATION_ALIAS MusashiHikida→Musashi-Hikida（站 ID 正名后语义同值）。
  **验证**：站表/TS/name_map/stationLines/lso 全量交叉检查 0 悬空；ODPT 审计 21 修复线真缺 0（残余仅 Saikyo 川越段分割口径与已知 B 类）；浮点保护验证备份 754 个 4 位小数 token 零丢失（伪 diff 0）；integration_test.js 28 断言通过；node --check 全过；重跑 gen-file-data.js（railway-data.file.js 864KB/station-i18n.file.js 312KB）。※両毛線 Iwajuku/Kunikada/Isesaki/Komagata/Maebashi-Oshima 等 19 站无坐标实体（ODPT Ryomo 站表仅 9 站且 geo 全 None，待第三方坐标源）。

- 2026-09-10 用户指示（両毛線按 ODPT API 实时数据收窄・4.3.477，Freeze 例外）: 用户明确"不按照任何版本，只读取 ODPT 的 API 来进行矫正"——両毛線站表不再按 wiki 官方 22 站（4.3.476 曾按 wiki 补全），改为 ODPT API 实测为准。实测（api-challenge.odpt.org，KEY_C）：`odpt:Railway:JR-East.Ryomo` stationOrder 为空数组（ODPT 对両毛線站序数据缺失）、`odpt:Station` 按该 railway 过滤仅 9 站且 geo:lat/long 全 None。据此収窄：両毛線 22→9 站 [Oyama,Tochigi,Sano,Isesaki,Maebashi,Shin-Maebashi,Ino,Takasaki-Tonyamachi,Takasaki]（物理序 小山→高崎）；删 13 站（Omoigawa/Ohiroshita/Iwafune/Tomita/Ashikaga-Flower-Park/Ashikaga/Yamagoe/Omata/Kiryu/Iwajuku/Kunikada/Komagata/Maebashi-Oshima）及其 stationLines 键/name_map 4 键（岩宿/国定/駒形/前橋大島）/i18n 13 条；durations/lso 同步重建。验证：13 站零残留（Kiryu 残留 12 处均为東武桐生線 line ID/lineId 引用，合法）；站表 2497 站、i18n 缺失 0、TS 悬空 0、浮点零丢失（754 token）；integration_test.js 28 断言通过；gen-file-data.js 重跑（862KB/311KB）。※両毛線现仅 9 站是 ODPT 数据现状（实际 22 站为客观事实，ODPT 未收录）——后续若 ODPT 补齐站表可再扩回；両毛線伊勢崎仍与東武伊勢崎線共用 Isesaki ID（川越先例）。

- 2026-09-10 用户指示（JR 东全量对比矫正・4.3.478，Freeze 例外）: 基于 ODPT 两个 API（`odpt:Railway?odpt:operator=JR-East` 88 条 + `odpt:Station?odpt:operator=JR-East` 887 条，KEY_C 实测）对本地 161 线 JR 东部分做线路/车站名称对比矫正，重点名称错误。全量审计结果（odpt_name_audit.py）：
  **①房総 2 线 ID 语义互换**（swap_sotobo_uchibo.py）——本地 ID 与官方语义相反（本地 `Sotobo`=内房線 32 站/`Uchibo`=外房線 27 站，ODPT 中 Sotobo=外房線/Uchibo=内房線；odpt-unified.js 4.3.430 曾加反转映射兜底）。互换：lines/lso 键互换、stationLines 引用 51 处、TS lineId 11 处、LOS lineIds（UCH→["Uchibo"]、SOT→["Sotobo"]）、删除 odpt-unified 反转映射（ID 一致后透传）。互换后 Sotobo=外房線 27 站、Uchibo=内房線 32 站、nameJa/nameEn 同步对齐。train-icons typeMatch 本已正确（Sazanami=内房/Uchibo、Wakashio=外房/Sotobo）仅注释修正。
  **②i18n 名称错字修正 18 处**（对照 ODPT 权威值）：Yokodai 洋光台（原错填横浜/Yokohama——京浜東北線第 43 位、name_map 已正确、仅 i18n 错位）、Nirasaki 韭崎→韮崎、Shinano-Sakai 信納境→信濃境、Sendagaya 千駄ヶ谷→千駄ケ谷、Hakonegasaki 箱根ヶ崎→箱根ケ崎、Myokaku 妙覚→明覚、Yodo 余戸→用土、Hisanohama 久之浜→久ノ浜、Hodogaya 保土ヶ谷→保土ケ谷、Iwane 岩根→巌根、Hacchobori→Hatchobori、Makuharihongo→Makuharihongo（原 Makuhari-Hong）、Tachikawa→Tachikawa（原 Tatekawa 错字）、Yakura→Yagura、Kawahara-yu-Onsen→Kawarayu-Onsen、Sohijima→Ubashima、Gohara→Gobara、Ryugasaki→Ryugasakishi。
  **③线路 nameEn 错字修正 8 条**：Ofunato 大船渡線（原 Karasuyama 复制错误）、Tadami 只見線（原 Tōnami）、Yonezawa 米坂線→Yonesaka、Kounan 花輪線→Hanawa、Miyo 弥彦線→Yahiko、RikutoEast→Riku East、RikutsuWest→Riku West、Komii 小海線→Koumi。
  **④审计发现待决**：JobanMain 仙台侧 6 站（Tatekoshi/Minami-Sendai/Nagamachi/Natori/Sendai/Taishido）ODPT Joban 收录但本地 JobanMain 止于岩沼（i18n 已有、被 TohokuMain/Senseki 等引用，补站需用户确认）；Kairakuen 偕楽園（常磐線臨時駅，本地完全无 i18n/站实体）未收录；東金線（Togane 5 站福俵/求名/成東/大網/東金）本地未建模；成田線支線（我孫子支線/空港支線）与南武線浜川崎支線站（川崎新町/小田栄等）ODPT 有独立 railway、本地按主干线收录（Narita 17 站不含支線站）——均等用户决定。验证：TS 悬空 0、lso 齐、stationLines 空键 0、i18n 缺失 0、浮点零丢失；integration_test.js 28 断言通过；node --check 3 文件；gen-file-data.js 重跑（862/311/79KB）。

- 2026-09-10 用户指示（补站/未建模线综合修复・4.3.479，Freeze 例外）: 基于 ODPT API 实测（JR-East Railway 88 条 + Station 887 条，KEY_C），完成 4.3.478 第④项待决 4 组补站/未建模 + 2 处双义 ID 分拆 + 1 处旧 ID 合并：
  **①JobanMain 62→69 站**（对齐 ODPT Joban 69 站）：中段补 Kairakuen 偕楽園（赤塚-水戸間、ODPT geo 36.37303,140.45634、新 i18n 4 语、name_map 偕楽園）；尾部补 Tatekoshi 館腰/Natori 名取/Minami-Sendai 南仙台/Taishido 太子堂/Nagamachi 長町/Sendai 仙台（均 ODPT 坐标落位，Natori 等 5 站 i18n 既有复用）。**立小路 ID 错配矫正**——本地 Tatekoshi 原指陆羽东线立小路（i18n ja=立小路、en 却写 Tatekoshi 错拼、正确罗马字 Tatekoji），现 RikutoEast 站 ID 改名 Tatekoji（stations/lso/stationLines/i18n 键/en 同步），Tatekoshi 让位给常磐線館腰（正名）。**TohokuMain 舊館腰 ID 合并**——478 前 TohokuMain 用 Tatekoshi-Tohoku（当时 Tatekoshi 被立小路占用），立小路改名后合并为 Tatekoshi（stationLines/i18n/TS 同步清理 Tatekoshi-Tohoku 零残留）。
  **②東金線 Togane 新建**（规则一：独立运营名"東金線"=平级顶级、branchOf=null）：5 站 [Oami,Fukutawara,Togane,Gumyo,Naruto]（ODPT 站序）、color #B31C31（ODPT 官方）、新站实体+i18n 3 个（Fukutawara 福俵/Togane 東金/Gumyo 求名）、Oami/Naruto 复用（外房線/総武本線）；name_map 求名 加回（4.3.472 曾删野田線架空求名，東金線真实站需重建）；LOS 新增 TGN 卡（東金線 order 26、NRT 25 后 SAG 28 前空缺位、JR 色枠 fallback 图标）；换乘 Oami⇔外房線/成東⇔総武本線 双向。
  **③成田線我孫子支線 NaritaAbikoBranch 新建**（规则二：官方"成田線我孫子支線"=嵌套 Narita、branchOf=Narita、Narita.branches 登记）：10 站 [Abiko,Higashi-Abiko,Kohoku-Narita,Araki,Fusa,Kioroshi,Kobayashi,Ajiki,Shimosa-Manzaki,Narita]（ODPT 站序）；新站实体+i18n 6 个（Higashi-Abiko 東我孫子/Kohoku-Narita 湖北/Araki 新木/Fusa 布佐/Ajiki 安食/Shimosa-Manzaki 下総松崎），Kioroshi 木下/Kobayashi 小林（i18n 既有、原无归属）归线；**Kohoku 湖北/江北 ID 分拆**——ODPT 我孫子支線.Kohoku=湖北（千葉）vs 本地 Kohoku=江北（日暮里舎人線、東京）两个不同站，新 ID Kohoku-Narita（按 Osawa-Yamagata 分 ID 先例）、name_map 湖北 改指 Kohoku-Narita、data-fusion STATION_ALIAS_BY_RAILWAY["NaritaAbikoBranch"]={"Kohoku":"Kohoku-Narita"}（railway 感知防江北误伤）；换乘 Abiko⇔常磐線快速/各停、成田駅⇔成田線 双向。
  **④成田線空港支線 NaritaAirportBranch 新建**（规则二嵌套 Narita）：3 站 [Narita,Airport-Terminal-2,Narita-Airport]——JR 空港支線 空港第２ビル/成田空港 与京成成田空港線 空港第2ビル/成田空港 是同一物理站，复用京成站实体（stationLines 加 NaritaAirportBranch、无新实体）；name_map 修正 2 处异常值（成田空港→Narita-Airport（原 'Narita Airport Terminal 1' 带空格非 ID）/空港第２ビル→Airport-Terminal-2（原 'Narita Airport Terminal 2 and 3'））；data-fusion STATION_ALIAS 加 NaritaAirportTerminal1→Narita-Airport / NaritaAirportTerminal2and3→Airport-Terminal-2。
  **⑤南武線浜川崎支線 NambuBranch 新建**（规则二嵌套 Nambu、Nambu.branches 登记）：5 站 [Hama-Kawasaki,Odasakae,Kawasakishimmachi,Hatchonawate,Shitte]（ODPT 站序）、color #FFE400（ODPT 官方）；新站实体+i18n 2 个（Odasakae 小田栄/Kawasakishimmachi 川崎新町），Hama-Kawasaki（鶴見線）/Hatchonawate（京急）/Shitte（南武線）复用；data-fusion STATION_ALIAS 加 HamaKawasaki→Hama-Kawasaki；换乘 浜川崎⇔鶴見/八丁畷⇔京急/尻手⇔南武線 双向。
  **⑥映射/展示层同步**：LOS NRT 卡 lineIds=["Narita","NaritaAbikoBranch","NaritaAirportBranch"]、JN 卡 lineIds=["Nambu","NambuBranch"]（支线并入父卡、不独立展示，MarunouchiBranch 先例）；odpt-unified LINE_TO_OPERATOR 加 4 新线=JR-East、LINE_RAILWAY_CODE 同名透传文档化（Togane/NaritaAbikoBranch/NaritaAirportBranch/NambuBranch）；renderList/LinePresentationService 无需改（branchOf 自动排除支线、LOS lineIds 自动覆盖）。验证：新线结构/支线排除/LOS 融合/换乘双向/立小路館腰/湖北江北/空港复用/ODPT 别名/全局一致性 45 断言全过；integration_test.js 28 断言通过；TS 悬空 0、lso 165 全、i18n 缺失 0、浮点零丢失（754 token）；LOS code 无新增冲突（TGN 唯一）；node --check 5 文件；gen-file-data.js 重跑（871/312/79KB）。※160→165 线；Oedo/Keisei/Mito/Noda 的 lso 与站表不一致为 478 前既有问题（Keisei 42 vs 43、Oedo 39 vs 38、Noda Kita-Omiya 缺失等），未触碰。

- 2026-09-10 用户指示（线上人工验收两问题修复・4.3.480）: 用户检查线上版（biubiu52011.github.io）发现两处展示缺陷，均为 4.3.479 新增 JobanMain 后的映射缺口——
  **①常磐線本線列车图标错误**（train-icons.js）：JobanMain（取手〜仙台 中距離）在 LINE_ICONS 无配置 → fallback E235系山手線（绿色山手线车误显示）；且 Joban（快速 品川〜取手 13 站）错配 E531系（中距離车型）、正确快速车型 E231系常磐LED 挂在死键 JobanRapid（本地无此 line ID）。修复：LINE_ICONS Joban→E231系常磐LED.png、JobanMain→E531系.png（4.3.480 新增键）、删除死键 JobanRapid；VEHICLE_DEPLOYMENTS ExpJREast 特急ひたち/ときわ 增补 JobanMain 路由（E261系 priority4 / E657系 priority3，Joban 原有两条保留）。
  **②一览区间文字不统一**（data-state.js）：JobanMain 无 LOS 卡 → renderList 走 renderCard 分支，区间 subtitle 用 `rs-line-name-en` class——全项目 CSS 无定义（默认黑色）；LOS 卡区间用 `rs-sys-chip`（var(--text-muted) 灰 #606060）。截图实测 津軽/羽越/山形/米坂 区间灰、常磐線「取手⇔仙台」黑。修复：renderCard trains 模式 subtitle 改用 `rs-line-interval`（已有灰色 CSS 定义），全览区间统一灰。验证：verify_480.js 断言全过（图标映射/死键清除/特急 2 条/class 替换/CSS 灰定义）；integration_test.js 28 通过；node --check 2 文件。
