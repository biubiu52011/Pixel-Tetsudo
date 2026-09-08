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

**信越本線（Shinetsu）追加排除（2026-09-08，wiki 编译确认）**：北陆新干线开通后信越本線已分断——高崎～横川（JR东）+ 横川～軽井沢（废线）+ 軽井沢～妙高高原（しなの鉄道）+ 妙高高原～直江津（えちごトキめき鉄道）+ 直江津～新潟（JR东）——完整"信越本線"称呼不存在于 JR 东管内。LOS 卡已删除、TRUNK_MAIN_LINE_IDS 追加 Shinetsu；数据保留（横川～直江津区间含第三セクター，站序断裂待 Freeze 例外修正）。

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

Last updated: 2026-09-08
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
  - `python -m http.server 8017` then open `http://localhost:8017/pages/home.html`
- Data load success signal: console log `509 stations, 159 lines, 94 tourism stations`.
- The ONLY entry page is `pages/home.html` (index.html redirects there). Do not create or restore any second home.html elsewhere.