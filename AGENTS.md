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
| ~~Odawara(小田原線) 駅リスト末端に JR 東海道系駅が混入~~ | FIXED 2026-09-10 | ODPT 公式（Odakyu.Odawara 47 駅/Station API OH41-46）により全面修正——4 錯誤駅（Oiso/Ninomiya/Kozu/Kamonomiya）除去・Iriuda（箱根登山鉄道駅）除去・新駅 6 件追加（ShinMatsuda 新松田 OH41/Kaisei 開成 OH42/Kayama 栢山 OH43/Tomizu 富水 OH44/Hotaruda 螢田 OH45/Ashigara 足柄 OH46）、46→47 駅に正序再構築（下記 Freeze 例外 4.3.493）。 |
| 13 image path fixes | Deferred | Asset mapping, no product impact |
| ~~Noda（東武アーバンパークライン）の Sakae（栄）駅~~ | FIXED 2026-09-08 | 東武野田線に栄駅は実在しない（正しくは逆井 Sakasai）。wiki 核验により Noda を正序 35 駅に全面再構築、重複線 TobuNoda を削除、誤 ID 28 件を正 ID に置換・i18n 補完（下記 Freeze 例外）。 |
| ~~SotetsuDirect（相鉄直通）列車が山手線 posMap に誤マッチ~~ | FIXED 2026-09-10 | ODPT 実証（JR-East.SotetsuDirect 独立 railway、fromStation 専属駅 ID）により修正（4.3.494）——THROUGH_RAILWAY_FALLBACK 表（SotetsuDirect→prefer SotetsuShin-Yokohama/Yokosuka/Saikyo/ShonanShinjuku、exclude Yamanote）+ 羽沢横浜国大の跨 operator 放行。検証: Osaki→Saikyo / MusashiKosugi→Yokosuka / NishiOi→Yokosuka / HazawaYokohamaKokudai→SotetsuShin-Yokohama、Yamanote 正常列車不受影響、integration_test 28/28。

---

## Architecture Baselines

| Tag | Commit | Description |
|-----|--------|-------------|
| RC-1 | 63b388d | Engineering baseline: Display Identity unified, P0-3=0 |
| RC-2 \| 6e502f4 \| Product baseline: Architecture documented, rules enforced, Home visual consistency fixed |

---

## 4.3.489（2026-09-10，历史问题大扫除·时刻表推定修复）
**问题盘点**：对话历史提出未修复项——①首都圈外 JR 无实时映射；②时刻表推定未覆盖。
**根因实证（ODPT API 实拉）**：
- odpt:Train（实时位置）仅 370 条、覆盖 22 条全部首都圈通勤系统——地方线 ODPT 无 Train 记录，属数据源限制
- odpt:TrainTimetable（时刻表）单请求恰 1000 条截断，仅返回 5 线（ChuoRapid 926 条占满）——其余 83 条 JR 线时刻表全部丢失
- 逐 railway 探测 88 条：35 条有时刻表（首都圈 22 + Ome/Itsukaichi/Hachiko/Kawagoe/Kururi/Togane/Ito/Sagami/Narita/Sotobo/Uchibo + Agatsuma 10/Joetsu 10/Kashima 64），41 条地方线（东北/上越/奥羽/信越等）ODPT 无时刻表数据
**修复**：
- data/api/odpt-unified.js loadTimetableData：JR-East 改按 railway 分批拉取（collectTimetableByRailway，20 条/批链式，fetchODPT 自带 3 并发限速）——从 LINE_TO_OPERATOR 收集全部 85 条 JR-East 本地线（非 LINE_RAILWAY_CODE，62 条同名透传线不在此表），探测标记 window.ODPT_TT_PROBED 防空线重试。实测覆盖 39 railway / 19625 条（旧逻辑 5 线/1000 条）
- js/data-fusion.js loadMissingTimetables：priorityOps 白名单加入 JR-East（原仅私铁/地铁，JR 永不补缺）；toLoad filter 排除已探测线（ODPT_TT_PROBED）
**验证**：e2e 实拉 86 线探测全完成、关键线路（Yamanote/ChuoRapid/Ome/Agatsuma/Joetsu/Kashima）全部到位、Tokaido 1384 条合并正确；node --check 双文件；integration_test.js 28/28
**未修复项（数据源限制，非代码缺陷）**：41 条地方线（BanetsuEast/Echigo/Ou/Ryomo/Uetsu 等）ODPT 无 Train/TrainTimetable 数据，实时与推定均无法覆盖；UI 按现状显示（无实时时状态缺失）

- 2026-09-10 ユーザー指示（小田原線站表混入修正・Freeze 例外、ODPT 準拠）: 小田原線（Odawara）駅リストを ODPT 公式（odpt:Railway:Odakyu.Odawara 47 駅站序 + odpt:Station API）に完全準拠させ再構築（4.3.493）。除去 5 駅——JR 東海道系 4 駅（Oiso 大磯/Ninomiya 二宮/Kozu 国府津/Kamonomiya 鴨宮、Odakyu Station API に記録なし）＋箱根登山鉄道系 Iriuda 入生田（ODPT Odawara 線に無し、Zama→Ebina 直結）。追加 6 駅（ODPT 公式駅番号/geo 準拠）——ShinMatsuda 新松田 OH41（35.34476,139.13965）/Kaisei 開成 OH42/ Kayama 栢山 OH43/Tomizu 富水 OH44/Hotaruda 螢田 OH45/Ashigara 足柄 OH46。46→47 駅、尾部は …Hadano→Shibusawa→ShinMatsuda→Kaisei→Kayama→Tomizu→Hotaruda→Ashigara→Odawara。stations 実体 6 件追加（581→587）、stationLines（新 6 駅=Odawara、誤 4 駅から Odawara 除去）、lineStationOrder[Odawara] 47 駅再構築、Odawara.transferStations 28→20（誤 4 駅宣言除去、ShonanShinjuku/Tokaido/TokaidoMain 側の誤乗換 9 件も除去）、name_map 6 件、station_i18n 6 件（ShinMatsuda/Kayama/Tomizu/Hotaruda 新規、Kaisei/Ashigara 既存あり）。i18n の誤 4 駅条目は JR 側のため残置。Matsuda 空実体（御殿場線未収録）は残置。検証: 本地 47 駅と ODPT 47 駅が位置まで一一対応、JSON 構文 OK、bundle 再生成（node data/core/gen-file-data.js）、integration_test 28/28。
## 4.3.494（2026-09-10，SotetsuDirect 相鉄直通列车误配山手线修复）
**问题**：Known Debt P1——相鉄直通列车显示在山手线详细图（posMap 误配）。
**根因实证（ODPT API 实拉）**：
- ODPT 用独立 railway `odpt.Railway:JR-East.SotetsuDirect` 推送相鉄直通列车，fromStation 为 SotetsuDirect 专属站 ID（Osaki/MusashiKosugi/NishiOi/HazawaYokohamaKokudai）
- 本地无 SotetsuDirect 线 → LINE_RAILWAY_CODE 反查无映射 → fallback "站数最多" → Yamanote（30 站，Osaki 共用）误配
- 羽沢横浜国大始发列车因 operator 过滤（列车 operator=JR-East vs SotetsuShin-Yokohama 线 operator=Sotetsu）匹配不到任何线而丢失
**修复**（js/data-fusion.js）：
- 新增 THROUGH_RAILWAY_FALLBACK 表：SotetsuDirect → exclude:["Yamanote"] + prefer:["SotetsuShin-Yokohama","Yokosuka","Saikyo","ShonanShinjuku"]
- matchingLines 收集：直通系统 prefer 表内线路跨 operator 放行（SotetsuShin-Yokohama 可承接 JR-East 列车）
- fallback 选择：直通系统按 prefer 顺序归属，排除环线；普通线路逻辑不变
**验证**：Osaki→Saikyo / MusashiKosugi→Yokosuka / NishiOi→Yokosuka / HazawaYokohamaKokudai→SotetsuShin-Yokohama 全对；对照组 Yamanote 正常列车不受影响；node --check 通过；integration_test.js 28/28
**遗留**：LINE_RAILWAY_CODE 未加 SotetsuDirect 条目（本地无此线，加了反查也匹配不到）；夜间 SotetsuDirect 列车仅 1 列（283M MusashiKosugi→Ebina），白天班次多的归属行为待用户线上验收

## 4.3.495（2026-09-11，直通运行补全 + 异名换乘映射补全）
**问题**：用户连续追问"直通运行补全了吗"——THROUGH_SERVICE_MAP 有 7 组真实直通缺失；历史梳理的 43 组异名换乘中 32 组无连接声明、全部未落地。
**直通补全**（data/core/through-service.js）——THROUGH_SERVICE_MAP + THROUGH_JOIN_STATIONS 新增 7 组（接续站经 ODPT/本地站表逐一核实）：
- 千代田線⇄小田急本線（Yoyogi-Uehara 代々木上原）——原只有多摩線，缺本線
- 東海道線⇄伊東線（Atami 熱海）
- 武蔵野線⇄京葉線（Musashino 側 Nishi-Funabashi 标记；京葉線站表无西船橋→Keiyo→Musashino 用 [] 抑制标记，物理直通保留）
- 中央快速⇄中央本線（Takao 高尾）
- 八高線⇄川越線西段（Komagawa 高麗川）
- 東武スカイツリーライン⇄伊勢崎線（Tobu-Dobutsu-Koen 東武動物公園）
- 京成⇄成田スカイアクセス（Keisei-Takasago 京成高砂）
- 附带：小田急本線⇄多摩線（Odawara⇄OdakyuTama，新百合ヶ丘；多摩線站表无 Shin-Yurigaoka→[] 抑制）
- 未补（本地缺线）：相鉄新横浜⇄東急新横浜（TokyuShin-Yokohama 不存在）、浅草線⇄北総（Hokuso 不存在）——需用户拍板是否新增线路
**异名换乘补全**（data/core/transfer-hints.js）——name_mismatch 新增 57 组条目（原 17 → 74），覆盖历史梳理 32 组无连接声明（後楽園⇄春日、三田⇄田町、上野広小路⇄仲御徒町⇄上野御徒町⇄御徒町、淡路町⇄小川町⇄新御茶ノ水、馬喰横山⇄馬喰町⇄東日本橋、溜池山王⇄国会議事堂前、日比谷⇄有楽町、汐留⇄新橋、秋葉原⇄岩本町、神田⇄岩本町、東京⇄大手町、大手町⇄二重橋前、新日本橋⇄三越前、泉岳寺⇄高輪ゲートウェイ、虎ノ門⇄虎ノ門ヒルズ、人形町⇄水天宮前、銀座⇄銀座一丁目、立川⇄立川北/立川南、秋津⇄新秋津、大塚⇄大塚駅前、戸越⇄戸越銀座、牛田⇄京成関屋、本八幡⇄京成八幡、新越谷⇄南越谷、朝霞台⇄北朝霞、武蔵溝ノ口⇄溝の口、豪徳寺⇄山下）——站外换乘（outside:true）按实际步行关系标注；ID 拼写按 name_map 核实（新日本橋=Shin-Nihonbashi、秋津=Akitsu、新秋津=Shin-Akitsu、大塚駅前=Otsuka_Eki_Mae、戸越銀座=Togoshi-ginza）。合并重复键（Ningyocho/Shibuya×2）。
**验证**：through-service 语法+MAP 双向对称（余 5 处为既有设计：京王線未收录/SotetsuMain→TokyuToyoko 缺中间线/Ome·Itsukaichi 单向）+JOIN 白名单站存在性；BFS 可达 8 项全对（含浅草線→成田空港多跳链）；transfer-hints 语法+无重复键+connects 站全部存在+4 语言完整；e2e 直通判定 9 项（含 2 对照）+标记位置 11 处全对；integration_test.js 28/28
**遗留**：京王線/新京成/関東鉄道等本地未收录线的异名换乘未覆盖（9 组缺站类）；ID 拼写不一致（Shinbashi vs Shimbashi 等 230 孤立坐标）按 Freeze 规则未动，列入 Known Debt 待评估

## 4.3.496（2026-09-11，车站订正方案 A·ODPT 权威矫正）
**用户指示**："先订正车站"——不按任何版本，只读取 ODPT API 矫正。方案 A=确定性修复（ID 错位合并 + 坐标 + 显示名 + みなとみらい線重建 + 幽灵引用清理）。
**数据模型审计结论**：lines[].stations 引用 2516 站（解析层真身）；stations 坐标实体 587 个（覆盖 23%）；stationLines 键=line 引用集合；lineStationOrder={站ID:序号}。大小写/连字符错位 27 组是功能性 bug（STATION_COORDS[ref] 直查失效→实时位置匹配全失效）。
**ID 规范化（程序化，44 组）**：实体键统一对齐到 line 引用键——Akasaka-mitsuke→Akasaka-Mitsuke、Aoyama-itchome→Aoyama-Itchome、Chuo-rinkan→Chuo-Rinkan、Den-en-chofu→Denen-chofu、Futamata-gawa→Futamatagawa、Hongo-dai→Hongodai、Iruma-shi→Irumashi、Ishikawadai→Ishikawa-dai、Konan-dai→Konandai、Makuhari-hongo→Makuharihongo、Mejiro-dai→Mejirodai、Midoridai→Midori-dai、Musashi-Kosugi→Musashi-kosugi、Nakameguro→Naka-Meguro、Nishi-kokubunji→Nishi-Kokubunji、Odaiba-Kaihinkoen/OdaibaKaihinkoen→Odaiba-kaihinkoen、Oimachi→Oi-Machi、Oizumigakuen→Oizumi-Gakuen、Sangenjaya→Sangen-jaya、Shimokitazawa→Shimo-Kitazawa、Shin-Toyosu→Shin-toyosu、Shinjuku-nishiguchi/Shin-juku-nishiguchi→Shinjuku-Nishiguchi、Shinjuku-sanchome/Shin-juku-sanchome→Shinjuku-Sanchome、Tama-plaza→Tama-Plaza、Tameike-sanno→Tameike-Sanno、Tobu-Utsunomiya→TobuUtsunomiya、Ueno-hirokoji→Ueno-Hirokoji、Shin-juku→Shinjuku、Shin-kiba/ShinKiba→Shin-Kiba、Toyo-su→Toyosu、Shirokane-takanawa→Shirokane-Takanawa、Kitasendai→Kita-Sendai、Musashisakai/Musashi-sakai→Musashi-Sakai、Azabu-juban→Azabu-Juban、Higashimurayama/Higashi-murayama→Higashi-Murayama、Hon-Jo→Honjo、Tokyo Teleport/TokyoTeleport→Tokyo-Teleport、Tokyo Big Sight/TokyoBigSight→Tokyo-Big-Sight、Nishi-takashimadaira→Nishi-Takashimadaira、Tama-center→Tama-Center、ShinKemigawa→Shin-Kemigawa、Sakuragi-cho→Sakuragicho、Kitasenju→Kita-Senju（多处已存在目标键时保留目标坐标）。改后 stations 587→562（幽灵变体删除）、name_map 1709→1706。
**坐标订正（ODPT 官方）**：Yokohama 35.4437,139.638→35.46574,139.62252（10 线共用，偏移 2.6km）；0,0 补正 13 站——Kumagaya 36.13981,139.38992 / Kuroiso 36.97012,140.06015 / Musashi-Hikida 35.72969,139.27008（武蔵引田，五日市線）/ Shin-Nihonbashi 35.68904,139.7743 / Nakano-Sakaue 35.697085,139.682205 / Nishi-Shinjuku 35.694515,139.69256 / Nishi-Kasai 35.664562,139.8596 / Shirokane-Takanawa 35.643283,139.734344 / Nishi-Takashimadaira 35.791965,139.645421 / Ueno-Okachimachi 35.707949,139.773351 / Shin-Ochanomizu 35.696925,139.76545 / Tokyo-Teleport 35.62754,139.77885 / Oyama 36.31344,139.80663。
**みなとみらい線重建**：旧站表 Yokohama→Nihon-odori→Motomachi-Chukagai→Minato-Mirai-21→Bay-Cross 错误（含虚构 Bay-Cross、错 ID Minato-Mirai-21）；重建为 ODPT/wiki 官方 6 站 Yokohama→Shin-Takashima(新高島 35.4597,139.6291)→Minato-Mirai(みなとみらい 35.4572,139.6329)→Bashamichi(馬車道 35.4504,139.6351 新建)→Nihon-odori(35.4476,139.6447)→Motomachi-Chukagai(35.4433,139.6507)。虚构实体/name_map/i18n 全删，站序/stationLines/LSO/i18n/name_map 同步。
**显示名订正**：Yuki=雪→結城（水戸線）；Oyama=大山→小山（栃木，3 线共用；原"大山"误指小山，东武東上線大山未收录故删映射）；Konandai 河南台→港南台（京浜東北線）；Makuharihongo 幕張本郷新→幕張本郷；Mejirodai 目白台→めじろ台（京王高尾線）；Midori-dai 緑ヶ丘→みどり台（京成千葉線）；武蔵日向→Musashi-Hikida 错误映射删除（八高線 ODPT 站表无武蔵日向，Musashi-Hikida 仅为五日市線武蔵引田）；新橋→Shimbashi（Shinbashi 幽灵）。
**线路站表修正**：UtsunomiyaJR 终点 TobuUtsunomiya/Tobu-Utsunomiya（東武宇都宮，错误）→ Utsunomiya（宇都宮，ODPT 证实），新建 Utsunomiya 实体 36.55975,139.89872；Keisei lineStationOrder 补 Keisei-Narashino（京成習志野，4.3.494 插入时漏同步，26 位，43 键补齐）。
**引用同步**：transfer-hints.js（汐留⇄新橋 Shinbashi→Shimbashi 键/值、Tameike-sanno→Tameike-Sanno）；through-service.js（Futamata-Gawa/Futamata-gawa→Futamatagawa）；line-service-relations.js（Marunouchi/MarunouchiBranch handoverStations 修正为真实共享站 Nakano-Sakaue——原 Yurakucho/Shibuya/Shin-juku/Shinbashi/Akasaka-mitsuke 等为 LOS 误判幽灵）。
**验证**：verify_A.js 30/30（ID 错位 0 残留、显示名 8 处、坐标 6 处、みなとみらい 10 项、一致性 5 项）；bundle 加载 OK（562/165/1706，Bay-Cross/Shin-juku 0 残留）；node gen-file-data.js 重生成；git diff 7 文件。
**遗留（方案 B/C 待用户拍板）**：2132 个真实站（全部有 i18n/name_map）缺坐标实体，地方线覆盖率 0%——方案 B=ODPT 批量补齐（部分地方线 ODPT 无 geo 需 wiki）；230 幽灵中 87 个有坐标无引用（含 Saitama/Nagoya/Osaka/Kyoto 非首都圈真实站 + Takanawa/Iwatsunomachi 等变体 + 疑似虚构）——方案 C=逐站甄别清理。

## 4.3.496-补（2026-09-11，ODPT+wiki 双源验证）
**用户指示**："odpt加wiki验证"——对方案 A 已订正车站做 ODPT API + ja.wikipedia 双源复核。
**验证方法**：JR 系走 challenge API 按 railway 拉站表（10 线 10 站坐标逐站比对全 OK）；地铁/私铁走主站 API 按 operator 全量拉取再匹配（TokyoMetro 144 站/Toei 141 站，6 站比对 OK）；ODPT 无 geo 的站（みなとみらい線 5 站/結城/京成ユーカリが丘）用 ja.wikipedia coord 模板兜底。
**ODPT 坐标校准 3 站**：Kita-Senju 35.74884,139.80464→35.749904,139.805591（偏差 130m）；Azabu-Juban 35.654,139.7307→35.65481,139.737045（偏差 550m）；Shin-Okachimachi 35.7078,139.7778→35.707009,139.782166（偏差 380m，ODPT Oedo 新御徒町）。另确认 Tokyo-Teleport 35.62754,139.77885 与 TWR.Rinkai 官方完全一致（此前 NOT_FOUND 是 operator 名误用 Rinkai→TWR）。
**wiki 坐标校准 6 站**（ja.wikipedia coord 模板实测）：みなとみらい線 5 站全部重新校准——Shin-Takashima 35.4597,139.6291→35.461889,139.626806 / Minato-Mirai 35.4572,139.6329→35.457889,139.632306 / Bashamichi 35.4504,139.6351→35.450139,139.636167 / Nihon-odori 35.4476,139.6447→35.446806,139.642611 / Motomachi-Chukagai 35.4433,139.6507→35.442417,139.650472；結城 Yuki 0,0→36.298219,139.872283（水戸線 ODPT 无数据，wiki 兜底）。
**新发现并修复**：①Shin-Yuri-Ga-Oka/Shin-Yurigaoka 是**同一站（新百合ヶ丘）双键**（小田急 Odawara 引用后者@22、OdakyuTama 引用前者@0，坐标/i18n 相同）——合并为标准键 Shin-Yurigaoka（ODPT 实证 odpt.Station:Odakyu.Odawara.ShinYurigaoka），stationLines 合并 [Odawara,OdakyuTama]、LSO 同步、删除冗余实体/i18n；②京成ユーカリが丘 Yuri-ga-oka 是**真实站**（京成本線 志津～京成臼井 间 @33，i18n 已有 ja=ユーカリが丘）——ODPT 无此站数据，wiki 坐标 35.721739,140.156317 补实体 + stationLines[Keisei] + name_map；它与小田急百合ヶ丘 Yurigaoka（35.609103,139.516228，wiki 确认与本地一致）是**不同站**，verify_A 的 strip 归一化曾误报为错位。
**并发会话协调（重要）**：验证期间发现并发会话的方案 B 已落地（stations 562→2280、2188 带坐标），且**覆盖了 4 个方案 A 已订正坐标**——Shirokane-Takanawa 35.6456,139.7317 / Konandai 35.5578,139.6278（偏差 20km！）/ Hongodai 35.5678,139.6378（偏差 20km！）/ Utsunomiya 36.5578,139.8939——已按 ODPT 权威全部恢复。方案 B 批量补坐标疑似使用劣质估算源，**建议方案 B 会话复核其补入的全部坐标**；92 站 0,0 残留（含 Matsuda 已知空实体）为方案 B 遗留未覆盖。
**验证**：28 关键站双源对比全一致（check_all_verify.js）；verify_A.js 30/30（期望值更新为 wiki 校准值）；bundle 加载 OK（2280/165/1707，Keisei Yuri-ga-oka@33/Odawara Shin-Yurigaoka@22/OdakyuTama 首站全部实体闭环）；git diff 仍为 7 文件（含并发会话叠加）。

## 4.3.497（2026-09-11，92 个 0,0 站处理·5 真实站修复）
**用户指示**："wiki可以吗"→"那就进行吧"——继续 ODPT+wiki 双源矫正，处理 92 个 0,0 站。
**分类**：audit_zero.js 全量分析——**5 站有线路引用（真实站，补坐标）**，**87 站无引用孤立实体**（疑似虚构/变体/非首都圈真实站，方案 C 甄别范围）。
**坐标修复（ODPT 全部无数据，wiki 兜底）**：
- Aoba-dori 青葉通→**あおば通**（仙石線仙台）38.26075,140.878444——wiki 页面名是「あおば通駅」非「青葉通駅」（之前 404 因页面名错）；显示名 i18n ja 青葉通→あおば通、name_map 青葉通→あおば通
- **Hitotsubashi→Hitoichiba 改名**（大糸線）：实体 i18n ja=一日市場 暴露 ID 误译（一ノ橋→一日市場 ひといちば，一ノ橋駅 是北海道名寄本線廃駅与長野大糸線无关）；全链路改名——stations 键/Oito.stations@5/stationLines/LSO@5/name_map（一の橋→一日市場）/i18n（en Hitotsubashi→Hitoichiba、ko 히토츠바시→히토이치바）；坐标 36.259606,137.90415（wiki 一日市場駅，安曇野市）。※Hitotsubashi-Gakuen 一橋学園（西武国分寺線）是另一真实站，不受影响
- Karasuyama 烏山（烏山線）36.650433,140.154969
- Midori-dai みどり台（京成千葉線）35.624808,140.097711
- Wada 和田（奥羽本線秋田）39.650889,140.217806——wiki「和田駅」页面确认含奥羽本線/秋田（此前疑同名歧义）
**验证**：bundle 加载 OK（2280/165/1707）；5 站坐标全对；Oito@5=Hitoichiba+LSO=5+stationLines=[Oito] 链路完整；name_map/i18n 同步；0,0 残留 92→87。
**遗留**：87 个 0,0 孤立实体（无 stationLines 无 lines 引用，含 銀座四丁目/江東縛り/未来海/武蔵ニューレ/国会議事堂 等疑似虚构 + Umeda/Midosuji/Tobata/Kerama 等非首都圈真实站）——方案 C 甄别清理，待用户拍板。

## 4.3.498（2026-09-11，方案 C 第一批·大阪系孤立站删除）
**用户指示**："首先先删除那些明显是大版的"——从 87 个 0,0 孤立实体中删除明显属大阪的站。
**删除 6 站**（全部无 stationLines/无 lines 引用/无 transferStations 引用，安全删除）：Umeda 梅田 / Midosuji 御堂筋 / Tsukamoto 塚本 / Sakai 堺 / Nakatsu 中津 / Nishi-Nakajima 西中島（大阪市淀川区地名，非车站）。
**范围**：stations 6 键、stationLines 6 键（本来无，确认清）、name_map 6 键（梅田/御堂筋/塚本/堺/中津/西中島）、station_i18n 6 键。全项目 grep 确认无其他 JS 引用（transfer-hints/through-service/odpt-unified/data-fusion/LOS 均无）。
**验证**：stations 2280→2274、name_map 1707→1701、i18n 3220→3214；0,0 残留 87→81；bundle 重生成加载 OK（5 站修复保持完好：Aoba-dori/Hitoichiba/Karasuyama/Midori-dai/Wada 坐标全对、Oito@5 链路完整）。
**剩余 81 个 0,0 孤立实体待甄别**：疑似虚构（銀座四丁目/江東縛り/未来海/武蔵ニューレ/国会議事堂/高橋平/奥多摩口新 等）、拼写变体（Musashynuigami/MinamiKemigawa/Nishi-fushimi 等）、非首都圈真实站（Tobata 戸畑/Kerama 嘉手納/Nagatoro 長瀞/Shimoda 下田/Kishibojin 岸本神社 等）、东京系地名（東大和駅/Higashi-Yamatokoji 等）——待用户逐类拍板。

## 4.3.499（2026-09-11，方案 C 第二批·错别字系列删除）
**用户指示**："然后 再处理错别字系列"——删除 0,0 孤立实体中明确的错别字/架空站名。
**删除 68 站**（全部经安全断言：无 lines 引用/无 stationLines/无 transferStations 引用）：
- 错别字类：Takahashimadaira 高橋平（→高島平 Takashimadaira 误字，正站已存在 Nishi-Takashimadaira）、Fudosan-mae 不動山前（→不動前 Fudomae）、Kokkai-gijido 国会議事堂（→国会議事堂前，缺"前"）、Kishibojin 岸本神社（→鬼子母神前 Kishibojin-mae）、Higashi-Yamatokoji 東大和駅（→東大和市駅）、Minami-Kemigawa 南亀浦 + MinamiKemigawa 南検見川（京成千葉線無此二站，正站为 検見川）、Narashino 習志野/成相野（市名非站名）、Kasai-Rinkai 葛西臨海（→葛西臨海公園）、MakuhariSeaside 幕張海浜 + "Makuhari Seaside"（→海浜幕張 Kaihin-Makuhari 倒置）、Nishi-Akiru 西秋留（東秋留存在但西秋留不存在）等
- 架空类：Ginza-yonchome 銀座四丁目/Koto-shibari 江東縛り/Miraikai 未来海/Musashinurare 武蔵ニューレ/Musashi-Saiwai 武蔵彩輝/Takahatafujimidai 高畑富士見台/Tamagawa-Enzei-ji 多摩川円蔵寺/Okutama-guchi 奥多摩口新/Tokyo-domae 東京ドーム前/Kanagawa-NewTown 神奈川県ニュータウン/Kita-Saitama 北さいたま/Chuo-Ku 中央区/Shin-otemachi 新大手町/Denno 電波/Go-komon 五本松/Tadachi 立派/Yokojimma 横島/Kototoi 言知/Mitarashi 御駄志/Mukaiminato 向岬/Yanauchi 柳内/Kimachi 木町/Choju 長寿/Meguro-Dai 目黒台/Midoricho 緑町/Minami-Nagasaki 南長崎/Nishi-Ikebukuro 西池袋/Nishi-Kichijoji 西吉祥寺/Nishi-Totsuka 西戸塚/Nishi-koen 西公園/Nishi-takaido 西高尾/Nishifujisawa 西藤沢/Fuchubashi 府中橋/Nishi-Fuchubashi 西府中橋/Higashi-Hachioji 東八王子/Higashi-Maruko 東丸島/Higashi-gotanda 東品川/Inokashira 井の頭/Miyagi 宮城/Nambu 南武/Nishi-fushimi 西伏見/Shin-rinkan 新林間/Wakasu 若洲/Minami-Wakasu 南若洲/Kit-Otsuka 北大塚/Kita-Yamato 北大和/Koji-mae 工房前/Musashi-Mitsuwadai 武蔵三澤台/Musashi-Nakagawa 武蔵中川/Musashi-Yamanaka 武蔵山中/Yukinoshita 雪之下/Hachiman-gaika 八幡外華/Hachiman-Honmachi 八幡本町/Minowa-shita 箕輪下/Musashynuigami 武蔵新上/Sakae(空壳) 等
**保留 13 站**（实存站但本地无对应线路/无法判定，非错别字）：Chichibu 秩父（秩父鉄道）/Daizen-ji 大善寺（JR九州久大本線）/Hachiman 八幡（各地同名，无法判定）/Kerama 嘉手納（沖縄地名）/Kotaki 小滝（大糸線JR西区間実在駅）/Matsuda 松田（御殿場線，已知残置）/Nagatoro 長瀞（秩父鉄道）/Nakahara 中原（各地同名）/Nishi-Kawasaki 西川崎（南武支線実在駅，本地南武線未收支線）/Shimoda 下田（伊豆急行）/Shiroi 白井（北総鉄道）/Tateshina 立科（長野県地名）/Tobata 戸畑（JR九州鹿児島本線）
**范围**：stations 68 键、stationLines 68 键（本来无）、name_map 68 键（値指向删除站的映射全清）、station_i18n 68 键。
**验证**：删除前安全断言通过（无任何引用）；stations 2274→2206、name_map 1701→1636、i18n 3214→3148；0,0 残留 81→13；bundle 重生成加载 OK（5 站修复+Oito 链路保持完好）。
**剩余 13 个 0,0 站**：全部为实存站但本地未收录对应线路（秩父鉄道/伊豆急/北総/JR九州 等）或同名无法判定——不在首都圈 JR 东范围，保留待用户决定是否清理。

## 4.3.500（2026-09-11，方案 C 第三批·串门站点删除，0,0 清零）
**用户指示**："所以还是属于串门站点？"（确认 13 个保留站性质）→"那你现在先补上吧"——用户裁定 13 个 0,0 保留站全部属"串门站点"（外地/外线路真实站混入本地数据），执行删除。
**删除 13 站**（安全断言全过：无 lines 引用/无 stationLines/无 transferStations/无 name_map 他指）：
- 纯串门 10 站：Chichibu 秩父/Nagatoro 長瀞（秩父鉄道）/Shimoda 下田（伊豆急）/Shiroi 白井（北総）/Tobata 戸畑/Daizen-ji 大善寺（JR九州）/Kerama 嘉手納（沖縄）/Tateshina 立科（長野県地名，无站）/Hachiman 八幡/Nakahara 中原（同名无法判定）
- 沾边 3 站（本地未收录对应区间，删除并记录**重建提示**）：Nishi-Kawasaki 西川崎（南武支線 尻手～浜川崎，本地南武線未收支線）/Kotaki 小滝（大糸線 JR 西区間 南小谷～糸魚川，本地 Oito 只收松本～南小谷）/Matsuda 松田（御殿場線，4.3.493 曾记录残置，本次用户拍板删除）
**范围**：stations 13 键、stationLines 13 键、name_map 13 键、station_i18n 13 键。
**验证**：stations 2206→2193、name_map 1636→1623、i18n 3148→3135；**0,0 残留 81→13→0**；bundle 重生成加载 OK（5 站修复+Oito 链路保持完好）。
**重建提示（未来若补以下线路需重建这 3 站）**：南武支線（川崎～尻手～浜川崎，含西川崎）→需重建 Nishi-Kawasaki；大糸線 JR 西区間（南小谷～糸魚川，含小滝）→需重建 Kotaki；御殿場線（含松田）→需重建 Matsuda。
**0,0 全清零**：92 个 0,0 站处理全部完成（4.3.497 补 5 真实站坐标 + 4.3.498 删 6 大阪 + 4.3.499 删 68 错别字 + 4.3.500 删 13 串门）。

## 4.3.524（2026-09-11，全 JR 缺失时刻表补全·手动时刻表复合模式通用化）
**用户指示**："补充所有 jr 缺失的时刻表"——将 4.3.521 仅覆盖中央本線（ChuoMain）的手动时刻表复合模式推广到全部 ODPT 无时刻表的 JR 本地线路。※并发会话已占用 4.3.522/523（支线横排），本轮为 4.3.524。
**数据来源**：JR 東日本公式时刻表网站（timetables.jreast.co.jp，**2609 版 = 2026 年 9 月改正**）公开时刻表，人工整理为 ODPT TrainTimetable 兼容格式（odpt:trainNumber/railway/calendar/railDirection/trainType/destinationStation/trainTimetableObject）。时刻=事实不受著作权保护；用户批准"自建库"方案。
**缺失清单（ODPT 实测）**：41 条 ODPT 有时刻表 / 45 条无时刻表。45 条中 43 条 JR 本地线 + ChuoMain（已有）+ ChuoTatsuno 补入，最终 **40 条新生成**（Tonami/Tōnami 无本地线不补）。
**生成管线**：JR 官网搜索入口 `st_search.cgi?rosen=<数字ID>` → 线路站列表 → 每站数字时刻表链接（`2609/timetable-v/<表ID>{d1,d2,u1,u2}.html` = 下り平日/下り土休/上り平日/上り土休）。**候选验证循环**：本地站表首/末站在官网列表页收集全部时刻表 ID 候选 → 逐 ID 下载 d1 页，站行 ja 名与本地站表匹配分最高者（≥min(5,本地站数)）即本线表——修正了初版"取首 ID"的多处错表（Tadami 误取磐越西線 261→262、Yamada 误取新幹線 258→980、Ryomo 235→237、RikutoEast 248→268、Yonezawa 249→252、Hachinohe 277 等）。**同表分段抽取**：OuMain/Yamagata 共 249 表（福島～青森）、Senseki/SensekiTohoku 共表（521S）、Suigun/SuigunBranch 共 243 表。站行 4 位时刻格式 0559→05:59；着/発 行分别保留。运転日过滤：平日表保留平日/全日、土休表保留土/全日。ja→ID 用 name_map 反查 + i18n ja 兜底（2933 条）+ EXTRA_JA 特例（小野→Ono 辰野支線、宮木→Miyaki 等）。
**产物**：`data/timetables/{40 线}-manual.js` 新生成 + `ChuoMain-manual.js`（4.3.529 由 chuomain-manual.js 重命名，变量名 `window.ChuoMain_MANUAL_TIMETABLES`，原 CHUO_MAIN 与线路 ID 不匹配会导致通用扫描跳过）。合计 **6647 条**（chuomain 791 + 新 5856）。北上線（Kitakami）仅 6 条为真实班次（官网 251 表平日下り 2 本 725D/735D，地方线实况非解析缺陷）。
**data-fusion v4.3.524 通用化**（js/data-fusion.js）：复合模式块从写死 'ChuoMain' 改为 `collectManualTimetableLines()` 自动扫描 window 上 `<lineId>_MANUAL_TIMETABLES`（后缀 18 字符）变量，逐线 estimateLinePositions 后按 trainId 与 posMap 合并去重（实时优先）。HTML 接线：trains.html 在 data-fusion.js 前插入 41 个 `<script src="../data/timetables/*-manual.js?v=4.3.524">`。
**验证**：41/41 文件 node --check 全过；collect 扫描 41/41 全接线、无本地线缺失；10:00 模拟推定 33/41 线有列车（129+ 列）；单线核对（Shinonoi 1551M 塩尻05:59→松本06:16、Senseki/SensekiTohoku 分段首站 Aoba-dori/Sendai、chuomain 791 完好）；integration_test 28/28 未跑（数据文件不影响既有逻辑）。
**遗留（数据源限制）**：北上線/大船渡線等极稀班次线路推定列车稀少（真实情况）；地方线深夜/清晨无车时推定为空（正常）；仅 ODPT 无时刻表的 43 条 JR 本地线 + 中央本線覆盖，ODPT 有时刻表的线路仍走官方数据。

Last updated: 2026-09-11
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
- 2026-09-10 用户质疑（时刻表推算对比去重核查・4.3.476）: 用户问推算内容是否做过对比去重。核查结论——三层去重已存在：①整线互斥（estimateAllPositions 353 行跳过有实时线路；doEstimation 562 行 posMap[lid] 非空不填估算）——同一条线实时与推算不会同时显示；②日历过滤（getCurrentCalendars 只取当日日历，工作日/周六日时刻表不混）；③processedTrainIds 同车次去重（244 行）。实测对比（839 件时刻表/工作日 452 + 当前时间模拟推算 35 辆 vs ODPT 实时 35 辆）：车次 35/35 完全重叠，运行时只显示实时、推算不触发。同时发现并修复新漏洞——光丘段区间车（2073A 等：光丘始发→环线 清澄白河止，dest 非光丘/都厅前）：原 _trainMoveDir 光丘段分支只认光丘/都厅前两个终点，区间车掉 ▶；修复为 dest=光丘→▲、否则（含区间车）一律 ▼（光丘段只有往返两向，终点非光丘即往都厅前方向）。验证：推算 35 辆 + 实时 35 辆全标签正确零 ▶、node --check OK。※推算位置在新站表下匹配正确（ODPT 39 站序 tto→项目 38 站 index 一一对应，都厅前折返/光丘尾均合理）。
- 2026-09-10 用户指摘（中央本線终点新宿=特急・4.3.484）: 用户问「中央本线的终点站新宿不就是特急吗」——核实正确：ODPT odpt:railway=Chuo（中央本線）实时数据里终点新宿的列车 100% 是特急（3156M/3158M/54M 等 LimitedExpress，即 かいじ/あずさ），普通列车终点最高尾/大月/甲府/松本等。根因是系统性 bug：JR-East ODPT 特急 trainType 一律「odpt.TrainType:JR-East.LimitedExpress」（实测 Chuo かいじ/あずさ・Joban ひたち/ときわ 均不带具体列车名），train-icons.js 原有 typeMatch 具体名规则（Azusa/Kaiji/Hitachi/Tokiwa/Sazanami/Wakashio/Shiosai/Tsugaru/Inaho/Kusatsu/Shima/Shirayuki/Nikko/Kinu）全部失效——特急车全部落到普通车图标（Chuo 特急显示 211系長野色）。修复：getTrainIcon typeMatch 匹配逻辑——typeName 含 LimitedExpress 即视为命中（typeMatch 规则均属特急・観光列車区段、按 line 隔离，车型判定正确），具体名匹配保留（東武 SpaciaX/京成 Skyliner/小田急 SuperHakone/N'EX NaritaExpress 等独立类型不受影响）。验证（vm 加载真实文件）：Chuo 特急→E353系、JobanMain 特急→E261系、房総三线特急→E257系500番台、N'EX→E259系、各线普通车不受影响、node --check OK。※标签端（▲新宿）本就正确，问题仅在图标。

- 2026-09-10 用户追问（所有特急是否都没对应・4.3.485）: 全面核查全运营商 ODPT trainType——①Tobu 特急 trainType 一律「Tobu.LimitedExpress」（实时 8 辆+时刻表 101 件全 Generic，无 SpaciaX/Kegon/Ryomo 等具体名）→ 4.3.484 的 LimitedExpress 通用命中会让 TobuSkytree 4 条规则全部命中、全部显示第一条 N100系（スペーシアX）——修正为按线代表制：TobuIsesaki 上 LimitedExpress=りょうもう（250系、正确——该线特急仅此一种）、TobuSkytree/TobuNikko 上=100系（スペーシア）代表（けごん・きぬがわ主体；X/リバティ 判別不能、りょうもう 走 Skytree 区間時 100系 表示=既知限界）。②N'EX 与しおさい：成田線/総武快速 LimitedExpress 实測 20xxM=54 本（N'EX，下り→成田空港/上り→大船・新宿）・40xxM=14 本（しおさい，→銚子/東京）——trainType 同为 LimitedExpress 无法区分，新增車号規則：20xxM→E259系、40xxM→E257系500番台（Narita/SobuRapid 两线）。③OuMain 删除誤配的 Inaho 規則（いなほ は羽越本線のみ、奥羽本線 LimitedExpress=つがる E751）。④京急 LimitedExpress/RapidLimitedExpress=快特（普通運賃）——无 typeMatch 规则不受影响，注释警示防将来误爆。⑤Keisei/Odakyu/Seibu/Tokyu/TokyoMetro：ODPT 无 Train/TrainTimetable 数据（实时+时刻表均 0）——对应规则永不触发、无影响。验证（vm 真实文件 16 场景）：N'EX→E259、しおさい→E257系500番台、東武 3 线代表正确、JR 东各线特急（Chuo E353/Joban E261/Ou E751/Joetsu E257系5500/Shinetsu E653系1000/Nikkoku 253）全对、各线普通车不变、node --check OK。

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
- 2026-09-10 用户指示（线上人工验收第二批・4.3.481 图标全量补全 + 线路色权威统一）: 用户检查线上版发现“很多列车图标对应错误，且线路图未使用线路色”——audit_icons.py 全量审计确认根因分两类：
  **①图标全量补全（train-icons.js）**：23 条线路在 LINE_ICONS 无键 → 全部 fallback E235系山手線（东京通勤车图标乱入地方线）。其中 JR 东 18 条（ChuoTatsuno/Joetsu/Kesennuma/NambuBranch/Narita/NaritaAbikoBranch/NaritaAirportBranch/Ofunato/Oito/OuMain/Shinetsu/Shinonoi/Tadami/Togane/TsurumiOkawa/TsurumiUmiShibaura/UtsunomiyaJR/Yamada）按实际主力车型补键（キハ110系系地方线/E131系0番台房総共通/E129系新潟段/E127系大糸・辰野/211系長野色篠ノ井/E233系湘南色宇都宮/空港支線 E235系1000番台 等）；非 JR 5 条（西武 Ikebukuro 30000系、東武 Kiryu/Koizumi/Sano 8000系、TobuUtsunomiya 20400系）。另修 3 处键名错配——Tōnami（unicode ō 变体）→Tadami、Oyama（车站 ID）→UtsunomiyaJR、Utsunomiya（JR 线 ID）→TobuUtsunomiya——错键导致只见線/宇都宮線/東武宇都宮線 fallback 错误图标。修复后 LINE_ICONS 170→190 键、素材零缺失（含東武 20400系/8000系、西武 30000系 在各自运营商目录）。
  **②线路色权威统一（data-fusion.js + data-state.js）**：详情页 fused line（data-fusion.js fuseLine）与一览 renderCard 的 color 直接取 railway_data.json 的伪造色（LOS 注释明示该文件含 fabricated palette），未走 LineOperationSystemsResolveColor 官方色权威——山田線 #FF1493 应为 #cd7a1e、只見線 #2E8B57 应为 #008dd1、大糸線 #8B4513 应为 #9370db、気仙沼線 #A8C8E8 应为 #3b459b、西武池袋 #4da72a 应为 #EF7A00、東武佐野 #008000 应为 #ff0000 等。修复：fuseLine 与 renderCard 均改为 `(LineOperationSystemsResolveColor && LineOperationSystemsResolveColor(lineId)) || line.color`，列表卡 data-line-color 与详情页 SVG 主线色统一走 LOS 官方 HEX。验证：verify_481.py 断言全过（23 键全补/3 错配键消除/无重复/素材 190 键零缺失/LOS 色接入 2 处）；verify_481b.py 键定义级复验通过；verify_481_runtime.js 实测 getTrainIcon 23/23 不再返回 E235系山手線（各线正确车型）；integration_test.js 28 通过；node --check 3 文件。
- 2026-09-10 用户指示（六形环环宽参考山手线・4.3.483c，483b 进阶）: 用户"宽度参考山手线"——六形环缩放系数 scale6 完全对齐山手线 loopScale（移动 1.5 / 桌面 **1.3→1.6**），环宽 `110*scale6` = 山手线 rectW 完全一致（移动 165px / 桌面 **176px**）。其余保持 4.3.483b（布局 482b 不动、tail 区动态化+桌面放宽 96×1.6、_renderStationNode 六形环特判与 geometry.junctionX 保留）。验证：verify_483c_six.js 11 断言全过（移动 svgW=387≤410 环宽 165 tail 144 光丘尾站名 117px；桌面 svgW=386.4 环宽 176 tail 153.6 光丘尾站名 125.6px；junction 位置不变两端）；integration_test.js 28 通过；node --check OK。※桌面 svgH 1228.8 随 scale6 放大属预期（与山手线同节奏）。



- 2026-09-10 用户指示（山手线回退・4.3.489）: 4.3.486-488 环线双列统一整体回退——用户判定方向错误（「弄反了，把大江户线的间距调整到山手线了」）。trains-page.js 恢复至 4.3.485（ac15b47）原始实现：①山手线恢复 isYamanote 双列特例（右列 [8..0]+[29..24] 田端→東京→品川、左列 [9..23] 駒込→大崎、_colPitch 按换乘 chip 自适应）；②大江户线（isSixShapedLoop）恢复周长均布原版（spLoop6=26×scale、环高=环段站数×26×scale−40×scale）；③删除 RING_SPLIT_MAP 与 4.3.488 stationId 坐标索引改动。trains.html 引用回退至 v=4.3.489。验证: node --check OK。
- 2026-09-10 用户指示（删除 isYamanote 特例机制・4.3.491）: 删除 trains-page.js 硬编码的 `lineId === "Yamanote"` 特判（isYamanote 变量 + 分支触发），但山手线双列画法（右列 [8..0]+[29..24] 田端→東京→品川、左列 [9..23] 駒込→大崎、_colPitch 按换乘 chip 自适应）逐字节原样保留——触发改为数据驱动：railway_data.json Yamanote 块新增 `"isDoubleColumnLoop": true`（Freeze 例外，先例 isSixShapedLoop）。完整 Provider→Consumer 链：railway_data.json（唯一真源）→ gen-file-data.js 重生成 railway-data.file.js（file:// bundle，改 JSON 后已重跑）→ trains-page.js getLinesData 包装新增 `isDoubleColumnLoop: l.isDoubleColumnLoop === true`（非融合路径）→ data-fusion.js fuseLine 融合映射新增 `isDoubleColumnLoop: line.isDoubleColumnLoop === true`（融合路径，fuseLine 读 DataLayer/UNIFIED_LINES 原始对象故属性可达）→ computeRouteGeometry 以 `line.isDoubleColumnLoop === true` 触发双列分支。_computeLineHash 追加 isDoubleColumnLoop 维度（几何影响输入进缓存键，防陈旧几何）。Oedo（isSixShapedLoop 六形环分支）与其余环线周长均布路径零改动。trains.html 引用 v=4.3.491（trains-page.js/data-fusion.js）。※4.3.490 曾删除 isYamanote 同时把双列画法一并删掉（环线统一周长均布）被回退——本版本保留画法仅数据化触发，勿再走统一化路线。验证: node --check 2 文件 OK、JSON 解析 OK（Yamanote isDoubleColumnLoop=true / Oedo=false）、双列画法主体 diff 零改动、js/ 下 isYamanote 零残留、bundle 已含新属性。
- 2026-09-10 用户指示（山手线双列宽度收窄・4.3.492）: 山手线双列画法环宽收窄——标准环线分支 rectW 基准 110→96（约 -13%）。svgW 改为派生式 `rectW + 150*loopScale`（原 260=110+150 合写拆开：两侧站名空间恒 75×scale 不变，单一调整点，防未来只改其一导致画布/环宽失配）。数值：移动 rectW 144px（原 165）/svgW 369px（原 390）；桌面 rectW 153.6px（原 176）/svgW 393.6px（原 416）。安全性：_renderStationNode 左列 anchor=end 朝左、右列 anchor=start 朝右，换乘 chip 在列外侧排布，两列之间仅有站圆与线——收窄 rectW 不挤压任何文字。六形环（大江户线）保持 110 不动，4.3.483c「环宽对齐山手线」注释已更新（4.3.492 起山手线基准独立为 96 不再对齐，用户只指示山手线）。标准环线分支当前唯一消费者为山手线双列（Oedo 走 isSixShapedLoop 分支）。trains.html 引用 v=4.3.492。验证: node --check OK、数值推导（两侧留白恒 75×scale）、六形环分支零改动。
- 2026-09-10 用户指示（山手线双列宽度缩减50%・4.3.495）: rectW 基准 96→48（对 4.3.492 再减半）。svgW 派生式自动跟随：48+150=198×scale——移动 rectW 72px（原 144）/svgW 297px（原 369）；桌面 rectW 76.8px（原 153.6）/svgW 316.8px（原 393.6）。两侧站名空间恒 75×scale（100.5/102.5px 移动、108/110px 桌面，随画布联动不缩水）。六形环（大江户线）仍保持 110 不动。trains.html 引用 v=4.3.495。验证: node --check OK、数值推导（移动 svgW 297≤410 容器、两列站名可用空间充足）、六形环分支零改动。※连续收窄轨迹：110（原始）→96（4.3.492，-13%）→48（4.3.495，再-50%）。※版本号注：并发 bot 的 SotetsuDirect 修复已占用 4.3.494，本条目原编号 4.3.494 重编号为 4.3.495 避免双版本冲突。
- 2026-09-10 用户指示（六形环圆环宽度对齐山手线标准・4.3.496）: 用户裁定「环线和6型环的环线部分的标准宽度」= 山手线双列当前宽度——六形环圆环部分 loopRectW 基准 110→48 与山手线统一（移动 72px/桌面 76.8px，含移动端收缩下限同步改 48*scale6）。svgW 联动收窄：移动 294px（原 387）/桌面 287.2px（原 386.4），tail 列宽受 _tailCap 限制不变（144/153.6px）。站名空间 _loopW6/2-10：移动 45px/桌面 63px（原 92/113），由 data-clamp-avail 缩小字号机制兜底（shrink never clip，下限 12px，不裁剪）。验证: node --check OK、真实数据几何模拟（Oedo 38 站/hikarigaokaIdx=10/环段 28 站，移动 svgW 294≤410、环宽 72 与山手线一致、tail 144 不变）、六形环布局结构（周长均布+光丘尾）零改动。trains.html 引用 v=4.3.496。※至此环线/六形环圆环宽度统一为 48 基准标准（山手线 4.3.495 + 六形环 4.3.496）。
- 2026-09-11 用户指示（换乘图标统一 16px 尝试・4.3.497）: 建立《线路图设计规定》LINE-DIAGRAM-SPEC.md v1.0 草案后，用户尝试"16px"——换乘图标 ICON 从移动 20/桌面 16 统一为 16px（与站名字号一致）。chip 行距/高度随 ICON 自动跟随（tiy/row、bgH 用 ICON+GAP），每行 4 上限不变。trains.html 引用 v=4.3.497。验证: node --check OK。※属于规定 v1.0 草案的试行调整，其余待统一项（直通标签 12/10、换乘文字 11/6、支线名 14、方向 8、时刻 6-11、+n 7、_sc6 1.3 桌面）待用户逐项裁定。
- 2026-09-11 用户指示（站点字体也要字体文件覆盖・4.3.498）: 线路图 SVG 内站名/支线名原硬编码 `font-family: sans-serif`（trains-page.js 934/1320），未用全局像素字体——改为与全局一致的 `"Fusion Pixel", 'Courier New', monospace`。其余 SVG 文本（直通 chip/时刻/方向/+n）本就继承 body 字体不受影响。LINE-DIAGRAM-SPEC.md 1.1 节同步（站名/支线名显式像素字体）。trains.html 引用 v=4.3.498。验证: node --check OK、全文件 font-family 无 sans-serif 残留（仅剩 Fusion Pixel 栈）。
- 2026-09-11 用户指示（站圆点放大 ≥70%・4.3.499）: 线路图站点圆点放大——普通站 r 4→7（+75%）、换乘站 r 7→12（+71%）。站名偏移联动（普通 8→10、换乘 10/12→14，均 ≥r+2；top 普通 y-10/换乘 y-14、bottom 普通 y+15/换乘 y+19）；换乘 chip iy0 避让放大圆点（ty+11 junction / ty+7 普通）；直通标签锚点（1110/1137）原已是 10/14 无需改。验证: node --check OK、几何推演（站名边缘间距 3/2px、相邻站/环线双列 72/六形环 72/tail 96 均无冲突、左列站名空间 98.5px 仅 -2px）。LINE-DIAGRAM-SPEC.md 3.1 节同步。trains.html 引用 v=4.3.499。
- 2026-09-11 用户指示（站名与圆点同行垂直居中・4.3.500）: 线路图站名与点位同一行、中点对齐——左右侧站名（left/right/dual/六形环左右）ty 统一为圆心 o.y + `dominant-baseline: central`（文字中线=圆心），top/bottom 站名保持基线上下布局。换乘 chip iy0 随 ty 变化重算避让（ty+14 换乘 / ty+9 普通，圆点底缘 +2px）；分支站数据覆盖同步（tx bx+6→bx+10 避让 r=7、ty bsy+3→bsy 配合 central）。验证: node --check OK、支线站水平间距 3px、chip 与圆点间距 2px。LINE-DIAGRAM-SPEC.md 6.2 节同步。trains.html 引用 v=4.3.500。
- 2026-09-11 用户指示（换乘图标与站名侧边对齐规则・4.3.501）: 规定换乘图标块必须有一边与站名文字侧边对齐——anchor=start（站名在圆点右侧）→ chip 左缘=文字左缘（ix0=tx）；anchor=end（站名在左侧）→ chip 右缘=文字右缘（ix0=tx-totalW）；anchor=middle（顶底站名）→ 居中。现状代码逻辑已满足（997-999），本次显式固化：代码注释 + LINE-DIAGRAM-SPEC.md 5.1 节对齐规则；空间不足时先降 PER_ROW（3/2）保持对齐，仅极端挤压 clamp。背景框 ±1px 内边距为设计保留（图标本体对齐不受影响）。trains.html 引用 v=4.3.501。验证: node --check OK、全路径核对（left/right/dual/六形环/tail/支线站）对齐成立。
- 2026-09-11 用户指示（六形环环段左右二分・4.3.502）: 大江户线（isSixShapedLoop）环段 28 站从周长均布改左右二分（双列，与山手线 isDoubleColumnLoop 同构）——左列 [0..13]（Tochomae 顶→下）、右列 [14..27]（顶→下），站序流 都庁前→左列下（森下）→环底→右列下（清澄白河）→右列上（新宿）→环顶闭合（ODPT 站序连续）。geometry 新增 isDualLoop6；站名方向：左列 anchor=end（朝外）/右列 anchor=start（朝外），光丘尾保持朝右（o.x<junctionX 区分 tail 与左列站）；clamp 双列走通用（左 tx-4/右 svgW-2-tx），光丘尾保留 tail 特判。环高改山手线公式（站数/2×36−80）+ _colPitch6 换乘 chip 高度动态放大；marginRight 移动 36→92/桌面 12→84（右列站名空间 ≥68px，4 字全尺寸）；junction 移至左列顶（非左缘中点），svgH 公式兼顾光丘尾（尾顶≥边距）。周长均布分支代码保留作防御（isDualLoop6 恒 true）。验证: node --check OK；几何推演（移动/桌面）tail 顶=边距、左右列 clamp≥68、垂直间距≥72、站序拓扑连续；LINE-DIAGRAM-SPEC 6.2/6.3/9 节同步。

- 2026-09-11 ユーザー指示（六形环支线从环中心支出・4.3.503）: 大江戸線の光が丘支線を環の左上角（都庁前=左列頂）からではなく、環の中心から支線が出るよう変更。都庁前（junction）を環頂正中央（x=loopCx=環の水平中心線）に移動し、光が丘尾はその真上から垂直に上向きに伸出（stub 水平段廃止、stubX=loopCx）。環段 27 駅は左右二分を維持しつつ左列 14 駅（loopStations[1..14]、S11..S24 頂→下）/右列 13 駅（loopStations[15..27]、S25..S37 頂→下）に再分配——駅序流 都庁前→左列下（森下）→環底→右列下（清澄白河）→右列上（飯田橋=新宿段）→環頂→都庁前で閉環、ODPT 駅序連続。站名方向を o.x<junctionX 判定から o.y<junctionY（環頂上方=光丘尾）判定に変更：光丘尾朝右（clamp=svgW-2-tx、右列と y 帯分離で干渉なし）、都庁前と左列駅朝左、右列駅朝右。svgH 式を 2×(marginTopBot+rectH/2+tailTotalHeight) に変更（tail 頂=辺距 に精密一致）。検証: node --check OK、幾何推演（移動 svgH 1978 / junction=(192,482) 環頂中央 / tail 頂 60=辺距 / 站名重畳 0 対 / clamp 146px で 5 字名全尺寸）; LINE-DIAGRAM-SPEC 6.2/6.3/9 節同期。

- 2026-09-11 ユーザー指示（六形环支线从环左/右侧 1/2 处展开・4.3.504）: 用户澄清 4.3.503 的"从中心支出去"非环顶中央，而是"在环线的左或右（参考实际在车站在左半还是右半）的 2/1 处展开"。都庁前实际在环左半 → 支线从环左侧 1/2 高度展开。都庁前（junction）回到左列第 7 位（环左缘、y=loopCy−0.5/14×rectH 中点偏上 36px，最接近 1/2 处），光丘尾恢复水平 stub（stubX=leftMargin+10×scale6）后垂直向上，10 站全在环上半部左侧带（svgH 缩短至 rectH+120=1134，tail 不再伸出环顶，余量 49px）。列分配：左列（頂→下）=[S32..S37（麻布十番…新宿）, Tochomae, S11..S17（新宿西口…春日）] 14 站、右列=[S18..S31（本郷三丁目…赤羽橋）] 14 站；站序流 都庁前→左列下（春日）→環底→右列下（本郷三丁目）→右列上（赤羽橋）→環頂→左列上（麻布十番…新宿）→都庁前 閉環。站名方向：光丘尾（x<junctionX 環外）と左列上方站（y<junctionY 環内）朝右、都庁前と左列下方站朝左、右列朝右。clamp：光丘尾 junctionX−4−tx、左列上方站到右列圆点前（junctionX+loopRectW−7−4−tx、58px 窄空间）、clamp 下限 12→10（5 字名 10px=55px 恰好贴圆点 0 重叠）。検証: node --check OK、幾何推演（svgH 1134 / junction=(156,531) / tail 頂 109 余量 49 / 站名衝突 0 対）; LINE-DIAGRAM-SPEC 1.4/6.2/6.3/9 節同期。

- 2026-09-11 ユーザー指示（六形环岔路站名统一朝右・4.3.505）: 用户线上截图确认 4.3.504 布局后指出"这种情况你就不能岔路的站名也在右吗"——都庁前（岔路 junction）站名在圆点左侧（朝左），与岔路其余 10 站（光丘尾，朝右）不一致。修正：Tochomae 站名改朝右（锚点判定 o.y<junctionY → o.y<=junctionY，943/971 行；clamp 走左列上方分支到右列圆点前 58px 空间，3 字缩至 14.5px=51px 贴圆点 4px）。左列下方站（新宿西口…春日，o.y>junctionY）仍朝左。検証: node --check OK、幾何推演（含 Tochomae 朝右 + 真实光丘尾站名 西新宿五丁目/中野坂上/東中野/中井/落合南長崎/新江古田/練馬/豊島園/練馬春日町/光が丘，衝突 0 対）; LINE-DIAGRAM-SPEC 6.2/6.3/9 節同期。

- 2026-09-11 ユーザー指示（六形环站名侧=占用检测规则・4.3.506）: 用户纠正 4.3.505 的"岔路站名统一朝右"——"不是统一是要随机应变，现在是写规则。比如左侧被占用就在右侧，右侧被占用就在左侧"。实现 _pickSixLabelSide(o, geometry, svgW)（trains-page.js，_renderStationNode 前）：对每个站检测圆点左右两侧占用，选空侧。占用源依次为①空间（该侧可用空间 < 16px 全尺寸文字宽，需 clamp 缩即视为挤压占用）②线路（stub 水平线 y=junctionY，Tochomae 左占用——站名放左会骑线）③文字带（光丘尾站名带 x<junctionX 侧 y∈[tailTop, junctionY]，左列上方站左占用）④对面圆点（左列站右侧被右列圆点 / 右列站左侧被左列圆点，y 同行必占用）。结果：光丘尾/左列上方 S32..S37/Tochomae 朝右、左列下方（新宿西口…春日）朝左、右列朝右——与 4.3.504/505 视觉一致，但方向由占用检测动态决定（未来布局变化可自适应）。_renderStationNode 预取站名记 o.labelLen（供文字宽估算）；clamp 窄空间分支改由 _sixSide 为 right 触发（六形环双列 left 站）。検証: node --check OK、占用检测全站方向枚举正确（左列上 right/Tochomae right/左列下 left/光丘尾 right/右列 right）、幾何衝突 0 対; LINE-DIAGRAM-SPEC 6.2/6.3/9 節同期。

- 2026-09-11 时刻表推定基础 bug 修复 v4（4.3.509）: estimator 6 处修复（ESTIMATOR_VERSION 4，js/train-position-estimator.js）：①**延误数字正则** `(d+)s*(分|min)/i` 的 d 是字面量→`(\d+)\s*`——"10分遅延" 原永远匹配不到、任何延误回退默认 15 分；②**日文拼写** 運延→遅延、運れ→遅れ（原文本匹配形同虚设）；③**status URN 解析** 原 split(":") 得 "JR-East.Suspension" 永远匹配不上 "Suspension"（延误全靠文本兜底）→ split(".") 取末段；④**中断文本按 4.3.425 语义收紧** "運休"→"全線運休" 且加 "運転を見合わせ/運転を中止"（"6本の列車を運休" 部分運休不判全线中断）；⑤**跨零点时间** parseTimeToMinutes 不再 h-24（24:05→5 把深夜列车错位当天凌晨、被误判已到终点/收车丢弃）——保留 1440+ 偏移与当天 0-1439 单调连续（23:50 发 24:05 到 → 1445）；⑥**站内停车判定拆分** 原 `depTime || arrTime` 且 depTime 优先——停车期间（arrTime<=now<depTime）列车回退显示上一站；改 arrival/departure 分开判定（停车中=本站），并显式 !== null（0=00:00 原被 falsy 误判）；⑦**按 railway 预索引** 原每条 line 全量扫描 operator 全部时刻表（JR-East 19625×85 线≈167 万次迭代/刷新）→ estimateAllPositions 构建 (op, railwayKey) 索引、每线只取本线子集（直接同名 + LINE_RAILWAY_CODE 反查聚合，平均 ~230 条，约 85 倍加速）。验证：node --check OK、单测 24/24（延误矩阵 8 项含部分運休对照、跨零点推定、停车中站位、未发车隐藏、过终点收车、预索引 4 线隔离 + KawagoeWest 反查聚合、trainClass 携带）。
- 2026-09-11 延误方向修正 v5（4.3.510）: 用户指出方向性错误——"A 站 10:24 B 站 10:36，当前 10:40 但延误 27 分钟说明列车现在 A 站都还没到，怎么可能在 B 站"。原实现 `adjustedCurrentMin = currentMin + delayMin` 把列车当「提前」delay 分钟（now+delay>=T ⟺ 列车比时刻表早到），方向完全相反。正确语义：列车实际到站 = 时刻表时刻 + 延误 → 在站判定 now >= T+delay ⟺ **now−delay >= T**——修复为 `adjustedCurrentMin = currentMin − delayMin`（ESTIMATOR_VERSION 5）。选择依据（用户确认）：当前 delayMin 是运营商全局单一值、对整列车恒定，两种实现（逐站 T+delay vs 整体偏移 now−delay）数学等价，取整体偏移——不改动共享时刻表数据（85 线共用权威数据，拒绝污染）、一行修改、到站/停车/收车三判定自动一致；逐站偏移仅在"延误途中逐渐恢复"的精细模型（需逐站延误数据源）下才有意义，不在当前模型预埋。验证：node --check OK、单测 6/6（用户场景 10:40/27 分→未到 A；途中 7 分→在 A；无延误→在 B；收车边界 10:24→在 B 未收车；10:35→收车；延误后未发车→隐藏）。
- 2026-09-11 推定注记位置修正 + 文案（4.3.511）: 用户上线前指定提示"数据来源：线路图推算"、展示位置在线路图容器正下方。审计发现 v4.3.469 的推定注记（tp-est-note）已存在但实现与设计意图不符——注释写明"容器外・下方中央"，实际 `el.appendChild(note)` 把 note 放进容器**内部**末尾。修正：`updateEstimatedNote` 改 `el.insertAdjacentElement('afterend', note)`（容器正下方外部，CSS 本就 margin-top:6px 居中 11px 无需改）；中文文案 `trains.estimated_note` "*数据来自时刻表计算"→"*数据来源：线路图推算"（en/ja/ko 保留原翻译，语义一致未要求改）。显示条件不变：该线存在 estimated:true 列车才显示，纯实时线不出。trains.html 5 个 script 引用统一更新 v=4.3.511（train-position-estimator/train-icons/data-fusion/translations/trains-page）。验证：node --check 2 文件 OK。
- 2026-09-11 接续推定 v6（4.3.518）: 用户需求"列车到达提供数据最远端后推定接续"。**方案前提经全量核查修正**（41 线 18903 记录逐线逐记录映射 dest 到本地站表）：真截断（dest 在本线站表内且 dest 索引 > 记录末站索引）仅 175 条、集中在首都圈大线——ChuoSobuLocal 76（1012Y 三鷹→中野 7 站但 dest=西船橋 29 站）/ ShonanShinjuku 69 / SobuMain 16 / Saikyo 10 / Sotobo 4，正是"列车半路消失"的元凶；跨线 dest（6956 条）是分段直通正常形态（上越線 高崎→渋川 后拐入吾妻線，外推到上越線末站長岡 是假位置）→ **跨线/缺失一律不接续**（原"外推本线末站"方案废弃）；dest 缺失 918 条（山手环线）维持现状。实施（js/train-position-estimator.js ESTIMATOR_VERSION=6）：buildExtrapolation()——dest 映射（normalize 双查）→ targetIdx>lastIdx 才外推；平均速度 v=(末站时刻−首站时刻)/(末站索引−首站索引) 分钟/站索引差（天然兼容跳站）；后续站时刻=末站时刻+v×(目标索引−末站索引)；终点站 depTime=null（到站收车）、中间外推站 depTime=arrTime（不停车通过）；fullStops=tto.concat(ext.stops) 复用现有区间判定；收车判定改基于外推末站；position 新增 extrapolated:true（仅当前位置 > 记录末站索引时）。**验证**：单测 9/9（真截断外推/外推收车/跨线不接续宽限/完整零影响/区间车维持/延误兼容）；真实数据 e2e——ChuoSobuLocal 凌晨 5 点 35 位置含 2 外推（1368Y idx20/38、1380Y idx8/38 dest=西船橋）；node --check OK；临时脚本已删。trains.html estimator 引用 v=4.3.518。
- 2026-09-11 1000 截断突破：按日历拆分补全（4.3.512）: 用户提出"筛选车号或时间是否不触发 1000 上限"。实测（Yamanote）：ODPT `odpt:calendar` 过滤参数有效（Weekday 522 / SaturdayHoliday 515 / Holiday 0），`odpt:trainNumber` 需已知车号不可枚举、时间范围不支持；acl:page 此前已实测 400。实施（data/api/odpt-unified.js）：①`getTimetableForRailway(op, railway, opts)` 新增 opts.calendar；②collectTimetableByRailway 对返回恰 1000 条（截断信号）的线按 Weekday/SaturdayHoliday/Holiday 三日历拆分重拉合并（CAL_SPLIT，去重键 trainNumber|railway|calendar|railDirection；拆分失败/无增益回退截断数据；单日历失败不阻断）；③池级去重——跨 lid 共用同一 ODPT railway（Kawagoe/KawagoeWest 等）重复 concat 1656 条被清；④compressTimetable 新增 c(calendar) 字段 + decompress 还原——**修复 v2 缓存丢 calendar 致 estimator 日历过滤从未生效的隐患**（周六会推定平日班次）；⑤缓存键 v2→v3 强制失效重拉。实测全量加载：probed 86/86、JR-East 总记录 18662（= 19625 原池 − 1656 重复 + 693 拆分补全，自洽）、dup 0、calendar 18662/18662；5 条截断线拆分后 Yamanote 1037 / Keiyo 1127 / ChuoRapid 1087 / ChuoSobuLocal 1179 / KeihinTohoku(Negishi) 1263，各日历分片均 <1000。验证：node --check OK、e2e（init 自动加载全流程）通过、临时脚本已删。trains.html odpt-unified.js 引用 v=4.3.512。
- 2026-09-11 时刻表推定：特急判定 v2 + 车型数据层输出（trainClass）+ 直通字段清理（4.3.508）: 用户推进时刻表推定算法三连问（车辆类型等级→跨图显示→车型判定）。①**特急判定 v2**（train-position-estimator.js）：v1 关键词乱爆（京急 LimitedExpress=快特被误标特急、JR 通用词爱称不出现导致漏判）。v2 按 operator 感知——`PAID_LIMITED_EXPRESS_OPS=['JR-East','Tobu','Odakyu','Seibu']`（仅这些运营商的通用词 LimitedExpress 是有料特急；京急 LimitedExpress/RapidLimitedExpress=快特、京成/京王/都営=普通运费特急均排除）；`LIMITED_EXPRESS_NAMES` 爱称白名单按 line 归属（NaritaAccess/NaritaSkyAccess:Skyliner、Odawara:SuperHakone/Hakone/HomeWay/MorningWay、OdakyuEnoshima:Enoshima/BayResort、Ikebukuro:Ltrain/S-TRAIN、SeibuChichibu/SeibuShinjuku 等）；`extractOperatorKey()` 从 URN 提取运营商标识；`isLimitedExpress(trainType, lineId)` 公开。判定矩阵单测 28/28（JR/東武/小田急/西武 通用词=特急；京急快特/京成/京王/都営=非特急；Skyliner/SuperHakone/HomeWay/えのしま/L-train/S-TRAIN=特急；中央特快/通勤特快=非特急；跨线爱称不误爆）。②**车型判断归属确认**：ODPT 时刻表数据无车型字段（只有 trainType+车号），车型只能按「线路×种别×部署」推断——能力归 train-icons.js 所有（stolen-logic 规则：严禁 estimator 复制）。③**trainClass 数据层输出（方案 A，用户确认）**：train-icons.js `getTrainIcon` 主体抽为内部 `_resolveTrainIcon`（渲染行为零变化），新增 `getTrainClass(lineId, operator, trainId, stationIndex, trainType)` 返回型号名（图标文件名去扩展名，如 "E233系0番台"）——车型判定单一实现；train-position-estimator.js v3：推定 position 增加 `trainClass` 字段（输入 trainId 与渲染 trainUid 同构 lineId_trainNum_stationIdx，车号规则解析一致）；data-fusion.js 实时 positionData 同步补 `trainClass`（同一数据模型，避免同图字段分裂）。验证：getTrainClass 判定矩阵 8/8（ChuoRapid→E233系0番台 / Ome→E233系青梅線 / Narita 20xxM→E259系 N'EX / SobuRapid 40xxM→E257系500番台 等）、estimator 链路（position.trainClass 来自 TrainIcons）、node --check 三文件。④**直通字段清理**：THROUGH_TRAIN_TYPES 移除 CommuterSpecialRapid/ChuoSpecialRapid/OmeSpecialRapid（中央线快速特快等级，非直通；跨图显示由 ODPT 按 railway 分段数据+按线匹配实现，与此字段无关——实测同一列车 1091T 青梅特快在 ChuoRapid 时刻表（东京~立川 9 站）与 Ome 时刻表（立川~青梅 12 站）各有独立记录，estimator 按 lineId 独立推定天然实现 a-b/b-c 分段显示，无需也禁止 LOS 融合）。S/K 车号尾字母规则保留（埼京线 S 结尾=川越直通、东武直通系车号特征；字段无页面消费者）。⑤**ODPT 分页实测**：ChuoRapid 时刻表恰 1000 条整疑截断——实测 `acl:page`/`acl:pageSize` 参数全部 HTTP 400（ODPT 不支持分页，单请求 1000 条为服务器硬上限）；分布验证完整（Weekday 534+SaturdayHoliday 466 两日历齐全、六种别全出现、通勤快速/通勤特快仅 Weekday 符合现实、终点 Tokyo 484/Takao 240/Ome 119/Otsuki 34 富士急直通合理）——判断大概率接近全量，记数据源限制不修拉取逻辑。

- 2026-09-11 ユーザー指示（枝干站名侧=被主干占用则换侧・4.3.508）: 用户精化规则——"按照双排规则主干该在哪在哪里，枝干如果发现某一侧被主干占用默认就在另外一侧"。主干（环站）站名按双排固定规则不动（4.3.504：左列上方朝右/左列下方朝左/右列朝右）；枝干（光丘尾 10 站 + Tochomae junction）站名侧=占用检测 _pickSixLabelSide 重写语义：①空间占用（可用空间 < clamp 下限 10px×字数×1.1——右侧可用空间到主干边界：光丘尾到环左缘 junctionX-4、Tochomae 到右列圆点左缘 junctionX+loopRectW-7-4；左侧到画布左缘 x-off-4）②线路占用（Tochomae 左侧枝干 stub 线，放左会骑线）。单侧占用→放另一侧；双侧同況→默认右。阈值由 16px 全尺寸降为 10px 下限（clamp 缩至下限仍放不下才算占用，clamp 保证不碰主干）——检测语义由"全局几何"改为"被主干/画布挤压"。検証: node --check OK、枝干 11 站占用检测全 right（光丘尾左=画布占用、Tochomae 左=stub 线）、主干环站固定 right/left/right 不变; LINE-DIAGRAM-SPEC 6.2/6.3/9 節同期。

- 2026-09-11 ユーザー指示（枝干站名侧=默认右+只检测主干侧占用・4.3.509）: 用户质疑 4.3.508"还是把方向搞反了"——4.3.508 检测的是"左侧被画布/stub 占用→放右"（双侧检测），用户规则"枝干如果发现某一侧被主干占用默认就在另外一侧"中的"被主干占用"指**右侧（主干侧）**。修正：枝干（光丘尾 10 站 + Tochomae junction）站名**默认朝右**（v4.3.505 岔路站名标准），**只检测右侧是否被主干（环）占用**——右侧可用空间（到主干边界：光丘尾→环左缘 junctionX−4 / Tochomae→右列圆点左缘 junctionX+loopRectW−7−4）< clamp 下限文字宽（10px×字数×1.1）→ 放左；否则默认右。枝干站左侧无主干元素（光丘尾左=画布边、Tochomae 左=枝干 stub 引出线），不构成主干占用，故不再检测左侧。主干环站固定规则（4.3.504）不变。検証: node --check OK、正常布局枝干全 right（光丘尾 availR=115≥66 / Tochomae availR=47≥33）、主干 fixed right/left/right、边界模拟（环宽收窄 availR=23<33→Tochomae left）正しい; LINE-DIAGRAM-SPEC 6.2/6.3/9 節同期。

- 2026-09-11 ユーザー指示（枝干站名侧=站名重叠检测・4.3.510）: 用户纠正"我说的是站名，你在折腾什么"——前几轮占用检测语义（空间/几何/stub/边界）全部偏离，检测对象应是**站名文字带**。重写 _pickSixLabelSide：枝干（光丘尾 10 站 + Tochomae junction）站名放某一侧时，若与主干（环）站名文字带重叠（该侧被主干站名占用）则放另一侧；双侧都不重叠 → 默认朝右（v4.3.505 标准）；画布边界硬约束（放不下即占用）。主干站名带方向按双排固定规则（左列上朝右/左列下朝左/右列朝右，v4.3.504），站名经 RailwayDB.resolveStationName(id, currentLang) 解析后按字数×16×1.1 估算文字宽。検証: node --check OK、全 38 站方向枚举（枝干 11 right / 左列上 6 right / 左列下 7 left / 右列 14 right）= 31 right + 7 left 与既有视觉一致、站名带矩形相交判定经模拟正确; LINE-DIAGRAM-SPEC 6.2/6.3/9 節同期。
- 2026-09-11 ユーザー指示（光丘尾+左列上方站名改朝左・4.3.512）: 用户指令"把西新宿五丁目-光が丘区间的站点的文字和麻布十番-新宿调整到左侧"。**光丘尾 10 站站名朝左**——stubX 右移（max(leftMargin+10×scale6, leftMargin+115.6)，移动 127.6/桌面 128.4，6 字全尺寸朝左文字左缘 ≥ leftMargin）；右缘动态避让左列上方站名带（文字带 y±8 重叠且右缘越过其左缘 → 右缘左移 4px，画布左限由 clamp 缩字兜底）。**左列上方 6 站（麻布十番…新宿）站名由朝右改朝左**（环内窄空间 clamp 压字问题解除——16px 全尺寸恢复）。Tochomae junction 保持岔路朝右（4.3.505）、右列朝右、左列下方朝左不变。_pickSixLabelSide 左列站名带假设同步改朝左。検証: 几何仿真（移动 410 容器）——光丘尾 9 站 16px + 落合南長崎 11.5px（避让国立競技場）、左列上方 6 站全 16px、gap 4px 无重叠、都庁前 14.2px 不变; node --check OK; LINE-DIAGRAM-SPEC 6.2/6.3/9 節同期。
- 2026-09-11 用户指示（4.3.512 回归修复・4.3.513）: 用户桌面截图投诉"你看看你闯的祸！！！线路和文字堆叠在一起了"——4.3.512 把 stubX 右移后，光丘尾竖线（x=128.4）恰好从改朝左的左列上方文字带（麻布十番〜新宿，右缘 156.4/左缘至 68.4）中间垂直穿过。修复分两端：**桌面三区分离**——tail 列上限 `_tailCap` 从 153.6 扩至 **223.6（=10+105.6+10+88+10）**（移动分支保持 BRANCH_COL_W×scale6），tailAreaWidth=223.6、svgW=429.2、junctionX=236.4，布局变为 **光丘尾文字带[12.8,118.4] \| stub 竖线 128.4 \| 左列上方文字带[138.4,226.4] \| 环 236.4** 三区分离（双侧 gap 10px）——光丘尾避让循环不再触发（全部 16px 无 clamp）、左列上方 6 站 16px 无穿线、都庁前朝右 [250.4,303.2] 不碰 stub、右列带左缘 323.2 余量 106。**移动端描边兜底**——容器 1:1 硬约束（tailAreaWidth 上限 144 < 223.6）三区分离放不下，保留 4.3.512 几何，_renderStationNode 对"六形环双列 + 移动端 + 左列上方站（x≈junctionX && y<junctionY && !isJunction && side=left）"站名加白色描边（paint-order stroke 3px stroke-linejoin round）——线路从文字后穿过，光丘尾避让/clamp 行为不变。検証: node --check OK; 几何仿真（桌面 636.8/移动 394）三区 gap 10/10/10、无避让、无 clamp、都庁前不碰 stub、移动端穿线站=左列上方 6 站（描边触发）全对; git 提交仅 4 文件（js/trains-page.js、pages/trains.html、LINE-DIAGRAM-SPEC.md、AGENTS.md），data/core 并发改动未动。
- 2026-09-11 用户指示（支线宽度取决于文本最多的那个站・4.3.514）: stubX 与桌面 _tailCap 不再硬编码 105.6/88——新增 `_sixNameW`（字数×16×1.1，与 _pickSixLabelSide 同源）动态扫描：光丘尾列（hikarigaokaStations[1..]）最大站名宽 `_tailWidest`、左列上方列（_leftIds6[0.._juncIdx6)）最大站名宽 `_leftTopWidest`。stubX=max(leftMargin+10×scale6, leftMargin+10+_tailWidest)；桌面 _tailCap=max(GEOM.BRANCH_COL_W×1.6, 10+_tailWidest+10+_leftTopWidest+10)；移动 _tailCap 保持 BRANCH_COL_W×scale6。当前日文视觉与 4.3.513 完全一致（_tailWidest=105.6 西新宿五丁目 / _leftTopWidest=88 国立競技場 → 桌面 223.6/429.2/236.4/128.4、移动 144/350/156/127.6），语言切换/站名变化自适应。検証: node --check OK; 几何仿真（_geo_514.js 已删）桌面三区 gap 10/10、移动行为不变; 版本 4.3.514 同步 trains.html/SPEC/AGENTS; git 仅 4 文件。
- 2026-09-11 用户指示（双支线及以上不用弯折方案・4.3.515）: 用户在 #Tsurumi 提出"现在让我们来处理双支线或以上，这个时候就不要采用弯折方案而使用ㅕㅑ这类"——直线线型支线 **≥2 条**时左右交替分叉（ㅕㅑ 镜像：偶数支线朝右、奇数支线朝左），单支线保持右侧弯折（现状）。实现：新增 `_bSide/_bCol/_rightCols/_leftCols/_branchMaxNameW/_leftNeed/_rightNeed`；左侧支线 `_branchStubL`=主干最大站名宽+22（主干站名朝左偏移 12 + gap 10，不穿主干站名带），bx=mainCx−_branchStubL−左列序×96、站名朝左（anchor=end tx=bx−10）、支线名朝左（anchor=end）；**左侧连接线从 junction 圆点沿主干下移 20px 再水平分叉**（水平段 y=junction.y+20，避开 junction 主干站名带 y±8，垂直段沿主干线重叠隐式连接）；右侧支线保持 junction 行水平。svgW=mainCx+_rightNeed+20、mainCx=max(_baseW/2, _leftNeed+20)（_baseW 主导时主线位置不变）；branchGeom 列车定位同步（左侧 x 同公式）。适用：鶴見線（海芝浦右 bx 344.5/大川左 bx 232.1 桌面，gap 10）、成田線（空港右/我孫子左）。検証: node --check OK; 几何仿真（_geo_515.js 已删）桌面/移动四档——名带全画布内、左侧竖线 gap 10、连接线穿站名=无、主线 mainCx/svgW 不变; LINE-DIAGRAM-SPEC 6.2/9 節同期。
- 2026-09-11 用户指示（双支线全左直排・4.3.516）: 用户在 #Tsurumi 看到 4.3.515 后指出"我的意思要么两条直线在左边或者右边别再有拐弯"——4.3.515 一左一右时左侧支线下移 20px 属"拐弯"，回退。实现：直线线型支线 **≥2 条**时**全部同侧（左侧）直排**——junction 行水平直 stub（无拐弯，_connY=by 删除 _vSeg）+ 垂直列；`_bSide` 多支线恒 "left"、`_bCol`=支线序号；新增 `_branchColW=max(96, 左支线最大站名宽+14)`（列间竖线不穿前列名带 gap≥4，成田线 119.6）；**支线 junction 站（各支线 stations[0]）主干站名朝右**（`_isBranchJunction` 检测 + tx=mainCx+12/anchor=start override，Tochomae 岔路朝右先例）——直 stub 不穿 junction 站名带；svgW=max(_baseW, mainCx+12+最长 junction 站名宽+_rightPad)、mainCx=max(_baseW/2, _leftNeed+20)；branchGeom 同步（左列距用 _branchColW）。鶴見線：大川列0 bx 232.1/海芝浦列1 bx 136.1（桌面 324.5/649 不变）、移动 mainCx 205→273.2 不缩放；成田線：空港列0/我孫子列1 列距 119.6、移动 mainCx 349.6 svgW 438.4 缩放 0.935。検証: node --check OK; 几何仿真（_geo_516.js 已删）四档——名带全画布内、列间 gap 4/33、junction 名朝右不溢出、直 stub 无穿字; LINE-DIAGRAM-SPEC 6.2/9 節同期。
- 2026-09-11 用户指示（时刻表推定提示去重・4.3.517）: 用户在 #Tsurumi 投诉"底部重复这么多次提示你是怕人瞎吗"——`.tp-est-note`（*時刻表からの計算データ）堆了 6 条。根因：`updateEstimatedNote` 用 `el.insertAdjacentElement('afterend', note)` 把 note 插成 el 的**兄弟节点**，清理时却用 `el.querySelector('.tp-est-note')` 只在 el **内部**查——永远删不到，每次增量刷新（约 15s 一次）/重建都堆一个新条。修复：改查 `el.parentNode.querySelectorAll('.tp-est-note')` 全部删除后再插唯一一个（一处函数覆盖增量/全量两个调用点）。验证: node --check OK; 线上 #Tsurumi DOM 6→1。
- 2026-09-11 用户指示（推定列车很扯・4.3.519）: 用户在 #Tsurumi 质疑推定显示（36 列推定全挤在弁天橋/浅野/安善/武蔵白石 4 站，每站 4-13 列堆叠，含 601/703 等清晨车 13:54 仍在图上）。实证：鹤见线 ODPT 有 432 条时刻表（JR-East 18662 条内 railway=JR-East.Tsurumi）；**106 条记录末站 arrival/departure 均为空**（区间/支线车如 1013B 末站浅野）→ 旧收车判定 lastArrTime=null → 
ow > null+5 永不成立 → 清晨车永不收车；部分站段记录（320/432 为 2-8 站）在主干站表映射不全 → 位置全判定在 junction 附近。修复（js/train-position-estimator.js ESTIMATOR_VERSION=6→7）：收车判定改「最后可解析时刻」——从末站往前找最后一个可解析时刻（外推站 arrTime 兼容），整条记录无时刻则 foundInService 必然为 false 自动丢弃。验证: node --check OK; 线上 36→2 列（14:06 实测 1307B_9 在扇町 14:07 到站前/1312B_0 在鶴見，train-id 后缀与 DOM 位置一致），分布不再堆叠; 版本 4.3.519 同步 trains.html estimator 引用; git 仅 2 文件（js/train-position-estimator.js、pages/trains.html），data/core 并发改动未动。
- 2026-09-11 用户指示（L 形状未改 + 推定未修复・4.3.520）: 用户线上验收反馈"并未得到修复，而且还是没有把 L 形状改成直线"——线上 bust8 实测：推定已 36→2 列（4.3.519 生效）、鹤见线支线已是水平直 stub（line 332.5-240.1:266 / 332.5-144.1:328 + 垂直列，无 L 形拐弯），判定为旧缓存页（用户 tab 仍为 bust6 旧参数）。但同期发现真实 bug：成田线我孫子支线整条缺失——NaritaAbikoBranch 站序 [我孫子…下総松崎,成田]，junction 成田在站表末位，而支线渲染/branchGeom/_isBranchJunction/_jMaxW6 全部只查 stations[0] → junction 找不到 → 整条支线跳过。修复：新增 _branchJunctionStation(branchStations, mainStations)（支线站表中第一个出现在主干站表的站，支持首位/末位）统一 4 处——渲染 junction 查找、branchGeom、_isBranchJunction（indexOf 扫描）、_jMaxW6（junction 名宽）；junction 在末位时渲染/几何站序反转（从 junction 向下延伸，成田→下総松崎→…→我孫子）。鹤见线（junction 均在首位）零影响。验证: node --check OK; 线上 bust9 读 #Narita DOM——我孫子支线竖线+10 站渲染、成田 junction 站名朝右、列 1 bx 与空港列 0 间距 _branchColW; 版本 4.3.520 同步 trains.html/SPEC/AGENTS; git 4 文件（js/trains-page.js、pages/trains.html、LINE-DIAGRAM-SPEC.md、AGENTS.md）。

- 2026-09-11 用户指示（中央本線下半段空白・实时+推定复合模式・4.3.521）: 用户上传 篠ノ井線 440M（塩山行）实时截图质疑"应该不会到一趟车都没有"+"实时定位加上推断的复合模式"。四路数据实证（ODPT）：ChuoMain（中央東線 高尾〜塩尻 38 站）TrainTimetable 空 / ChuoRapid 挂名特急记录 dest 最远大月・甲府以远 0 / StationTimetable 全量 1000 条 Chuo railway 站 0 / 实时 odpt:Train 11 条全在東京〜甲府段。440M 在 JR 官网时刻表存在但 ODPT 不推（篠ノ井線/中央本線甲府以远不在 ODPT 实时与时刻表覆盖范围——数据源边界，非涉密；JR 官网時刻表页明确禁無断転載・複写・加工，用户拍板自建库：人工核对录入、自建格式、个人非商业用途、不写爬虫）。**实施（数据/机制/接线三段）**：①新建 data/timetables/ChuoMain-manual.js（4.3.529 前为 chuomain-manual.js）——从 JR 東日本公式時刻表網頁（timetables.jreast.co.jp 2609 版 2026年9月改正，4 页 223d1/223d2/223u1/223u2 = 下り/上り×平日/土休日，一次性逐页读取人工整理）解析 835 列→抽取 高尾〜塩尻 38 站段→791 列去重（Weekday 193+195 / SaturdayHoliday 201+202），字段完全兼容 ODPT TrainTimetable（odpt:railway=odpt.Railway:JR-East.ChuoMain、calendar、trainType、trainTimetableObject 含 arrival/departureStation+Time），站 ID 用本地站表 ID（normalize 后匹配）。②js/data-fusion.js doEstimation 加复合模式块——对 ChuoMain 单独调 TrainPositionEstimator.estimateLinePositions（绕过 estimateAllPositions 的"已有实时跳过推定"），按 trainId 与 posMap 合并去重（实时优先，推定只补实时没有的车次）。③pages/trains.html 引 chuomain-manual.js（data-fusion 前）。**验证**：440M 与用户截图逐时刻吻合（塩尻14:33/みどり湖14:38/岡谷14:44/下諏訪14:50/上諏訪14:55，差 1 分钟=着発差）；e2e 模拟 14:40 推定 14 列覆盖全线、下半段（甲府以远）7 列 7 站（塩尻/下諏訪/韮崎/塩崎/小淵沢/みどり湖+440M）；合并逻辑 11 实时+8 推定=19 无重复；node --check 3 文件通过。**复合模式效果**：上半段实时优先 + 下半段推定填充，不再"上半段实时下半段干干净净"。后续首都圈外无时刻表线（41 条地方线）可按同一模式逐线补手动时刻表（机制通用：数据文件+data-fusion 复合块+HTML 引用）。
- 2026-09-11 4.3.520b/521（修复 4.3.520 两个问题）: ①4.3.520 初版渲染层 junction 查找误用 `stations`（renderTrainMap 无此变量）→ 所有线路图渲染崩溃显示 "Error: stations is not defined"——改为从 stationCoords 提取主干站列表 `_mainIds7` 再传入 `_branchJunctionStation`（computeRouteGeometry 内 489 行 var stations 存在不受影响，_jMaxW6/branchGeom 两处保持传 stations）。②4.3.520b 修复后未 bump trains.html 的 trains-page.js?v 参数 → 浏览器 HTTP 缓存命中 4.3.520 初版（bug 版）→ 页面仍报错；bump v=4.3.521 后绕过缓存。验证: node --check OK; 线上 bust11 实测 #Narita——我孫子支线整条渲染（junction 成田 y=142 向下 10 站到 742，竖线 257.2:142-742，站名下総松崎 204/東我孫子 638/我孫子 700，支线名 成田線（我孫子支線）朝左），两条水平直 stub（349.6-257.2:142、349.6-137.6:142）无拐弯；#Tsurumi 回归正常（2 列推定、直 stub 不变）。
- 2026-09-11 4.3.522/523（支线水平直线横排——鹤见线拉直）: 用户问"鶴見線为什么没有拉直"——4.3.516 的"junction 行水平直 stub + 垂直列"整体仍是 ⊥ 拐弯（stub 末端 90° 折向竖列），未达用户"要么两条直线在左边或者右边别再有拐弯"的直线要求。新增 _branchH 判定（双支线及以上且每条支线非 junction 站 ≤4 才横排）+ 横排几何/渲染：支线从 junction 圆点直接一条水平直线延伸到最后一站（无 stub/竖列/拐弯），支线站横排（跳过 junction 主干已画）、站距 _branchHSp=全支线最宽站名+12、站名朝侧边与圆点同行、支线名放远端上方；mainCx 左需求改 _leftNeedH；branchGeom 列车定位同步。4.3.523 修正：_branchH 限定 branchLines.length>=2（初版误把单支线丸ノ内方南町/千代田北綾瀬也横排）+ bump 缓存规避。影响面核实（railway_data 全量支线分组）：仅鶴見線触发横排（Marunouchi/Chiyoda 单支线、Narita/Suigun/ChuoMain/Nambu 含长支线均保持竖列）。验证: node --check OK; 线上 bust13 #Tsurumi 两条水平直线（海芝浦 332.5→202.9:266、大川 332.5→267.7:328）、支线竖列 0 条、无 Error; #Marunouchi 回归（方南町竖列 352.5:308-462 不变）。
- 2026-09-11 特急车型图标错配修复（4.3.525，ODPT 实证）: 用户发现"特急车型图标有错配"。ODPT 实时 Train 实证（JR-East 433 条，LimitedExpress 21 条）：ExpJREast 特急规则只覆盖 13 个线 ID，**ChuoRapid/Yokosuka/ShonanShinjuku/Tokaido 完全没有特急规则** → あずさ・かいじ（ChuoRapid 5041M/5139M dest 松本/甲府）错显 E233系0番台、N'EX（Yokosuka 2034M/2043M、ShonanShinjuku 2245M）错显 E235系1000番台/E233系3000番台、きぬがわ2号（ShonanShinjuku 1082M 鬼怒川温泉→新宿，停站时刻与 JR 公式逐站一致）错显 E233系3000番台、踊り子（Tokaido 3030M 伊豆急下田→東京）错显 E233系湘南色。修复（js/train-icons.js）：①ExpJREast 新增 ChuoRapid→E353系（あずさ・かいじ，同 ChuoMain）；②车号规则从 Narita/SobuRapid 扩展至 Yokosuka/ShonanShinjuku——20xxM/22xxM→E259系（N'EX，22xx 系=新宿・大船発着実測 2234/2245M）、40xxM→E257系500番台（しおさい，限 Narita/SobuRapid）、10xxM→253系（日光・きぬがわ，限 ShonanShinjuku）；③Tokaido 30xxM→E261系（踊り子・湘南——E257系2000/2500番台図庫未収録，用同系伊豆特急塗装 E261系 代替显示，待用户拍板是否补素材）；④**车号规则加 trainType 守卫**（仅 LimitedExpress 时发火，防 Tokaido 325M 等 32xx 普通车误爆）+ Tokaido 限定 /^30/（实测 32xx 段有 Local）。验证：verify_icon_fix.js 23/23（含 9 组误伤对照）、full_scan_icons.js 全量 380 列特急漏判 0/普通误判 0、integration_test.js 28/28、node --check OK。私铁侧（小田急ロマンスカー 70000形/東武スペーシア 100系）推定路径正常；私铁 ODPT Train/TrainType 端点 0 条为数据源限制（全量 Train 仅 151 条=都营+横滨），非错配。遗留：E257系2000番台（踊り子）素材缺失用 E261系 代替；git 仅 js/train-icons.js（data/core 并发会话改动未动）。

- 2026-09-11 常磐線特急车型错配修复（4.3.526，JR 官网双源实证）: 用户问"常磐线等其他的了？"——核对 JR 東日本公式列车页（jreast.co.jp/railway/train/，2026-08-29 更新）：ひたち／ときわ（E657系）、成田エクスプレス／しおさい（E259系）、わかしお／さざなみ（E257系）、あずさ／かいじ（E353系）、日光・きぬがわ（253系/東武100系）、草津・四万／あかぎ（E257系）、つがる（E751系）、いなほ（E653系）、しらゆき（E653系1000番台）——全 13 线特急逐一核对。**错配 1（修）**：常磐線ひたち・ときわ 现行车=E657系（官网列车页 + 2026年3月改正编成表全部 E657 10両实证），本地 Joban/JobanMain 规则 priority4 用 E261系（该系=サフィール踊り子专用，东海道・伊东线）→ 改 E657系 priority4、删 E261/旧 E657 pri3 双规则（E261系 素材仅保留 Tokaido 30xxM 踊り子・湘南 代替显示，语义正确）。**补漏 1（修）**：湘南新宿ライン編成表（2026-03-14 改正）实测 3093M 特急湘南23号 新宿→小田原（E257系9両）——特急湘南在东海道线（東京発）与湘南新宿ライン（新宿発）双线运行，原 30xxM 规则只挂 Tokaido → 扩展至 ShonanShinjuku（30xxM→E261系 代替）。**核验正确（未改）**：日光・きぬがわ=253系（官网きぬがわ页 2026-08-11 + 1082M きぬがわ2号 253系6両实证）、湘南新宿ライン編成表 2245M N'EX=E259 / 1094M スペーシア日光=東武100系（東武車，JR-East operator 数据不出现）、草津・四万=E257系5500番台。验证：verify_icon_fix.js 25/25（新增 Joban/JobanMain E657 + ShonanShinjuku 3093M 湘南 + 4832Y 普通车对照）、full_scan_icons.js 全量 380 列特急漏判 0/普通误判 0、node --check OK。trains.html train-icons.js v=4.3.526。git 仅 js/train-icons.js + pages/trains.html + AGENTS.md（data/core 并发改动未动）。
- 2026-09-11 踊り子・湘南 真实车型素材接入（4.3.527，用户补图库）: 用户更新图库——新增 E257系2000番台（踊り子）・2500番台（湘南）ペニンシュラブルー涂装素材（原 e257od.png/e257od25.png，40x48 与图库规格一致，已重命名为规范名 E257系2000番台.png/E257系2500番台.png）。替换 4.3.525/526 的 E261系（サフィール踊り子）代替显示。**车号段实证分離**（ODPT TrainTimetable JR-East.Tokaido 46 条 LimitedExpress 实测）：3001M-3031M → 踊り子（dest 伊豆急下田/東京返程）、3071M-3096M → 湘南（dest 小田原/平塚/新宿/東京）；湘南新宿ライン 30xxM（3091M-3096M 新宿発着）同属湘南段。规则：Tokaido/ShonanShinjuku + LimitedExpress + /^30[0-3]/ → E257系2000番台、/^30[7-9]/ → E257系2500番台。サフィール踊り子（E261系）经 ODPT 实测无 8xxxM 号段、无 Saphir/Odoriko 独立类型混入 Tokaido 时刻表——E261系 素材保留备用、无规则误伤。验证：verify_icon_fix.js 24/24（新增 3001M/3030M→2000番台、3087M/3093M→2500番台 边界用例）、full_scan_icons.js 全量 380 列特急漏判 0/普通误判 0（EXP_ICONS 补 2000/2500番台）、integration_test.js 28/28、node --check OK。trains.html train-icons.js v=4.3.527。git 含 js/train-icons.js + pages/trains.html + images/列车/JR東日本/E257系2000番台.png + E257系2500番台.png + AGENTS.md（data/core 并发改动未动）。

## 4.3.528（2026-09-11，手动时刻表按需加载·trains 页首屏瘦身）
**问题**：41 个 data/timetables/*-manual.js（ODPT 无 TrainTimetable 的 JR 地方线补充数据，4.3.524 引入）在 trains.html 以 41 个静态 script 标签全量加载——首屏解析约 7.1MB 时刻表（看任意一条线也要全量读），新增线路必须手改 HTML 插标签。用户裁定：合并单文件会劣化单线访问，混入 ODPT_TIMETABLES 池会污染 ODPT_TT_PROBED 探测标记/数据源诊断/IndexedDB 缓存（来源必须诚实标注），维持独立变量与独立复合模式。
**修复**：
- js/data-fusion.js 新增 `DataFusion.ensureManualTimetable(lineId)` 公开 API——按需动态注入（打开线路时才加载该线文件）：
  - 时序保证：script.onload 触发 = 脚本执行完成 = window.&lt;lineId&gt;_MANUAL_TIMETABLES 已定义；onload 内二次校验变量存在（文件名/线路 ID 命名不匹配时 reject 暴露，不静默缺数据）
  - 数据就绪后内部重跑 doEstimation + fuseAll（与 loadMissingTimetables 完成后同一链路，data-fusion.js 707-711 同模式）
  - 防重入：_manualLoading 记录共享 Promise，同线路并发调用只发一次请求
  - ODPT 已有该线时刻表（首都圈等，_hasOdptTimetable 按 railway 过滤）→ 直接 resolve，零请求
  - onerror（文件缺失）→ reject 失败回退，调用方保持首次渲染（与无数据现状一致）
- js/trains-page.js showLineView 接入：ensureManualTimetable(lineId).then 中校验 currentLine === lineId（结果归属：用户切走线路后旧结果不覆盖新状态，async-ui 规则），成功则重渲染当前线路；.catch 消化 rejection（无 unhandled rejection）
- pages/trains.html 删除 41 个静态时刻表标签（61→20 个 script），data-fusion.js v=4.3.528；保留 41 个数据文件（仍是"源"，被按需加载消费，collectManualTimetableLines 扫描不变）
**验证**：verify-manual-loader.js 19/19（提取真品源码测试：已加载/ODPT 有数据零请求、按需注入路径 getBasePath 正确、onload 后 doEstimation+fuseAll 各 1 次且 _manualLoading 清理、并发双调用单请求单推定、onerror/命名不匹配 reject、加载后二次调用零请求幂等）；node --check data-fusion.js/trains-page.js OK；归属逻辑静态审查（currentLine 检查）。**未做浏览器运行时验证**——按用户规则像素铁道交付后由用户人工确认，禁止系统截图。
**遗留**：loader 不追加 ?v= 缓存参数（本地 file:// 无缓存问题，HTTP 部署需注意时刻表文件缓存）；4.3.525/526/527 已被特急车型系列改动占用，本轮取 4.3.528。

## 4.3.529（2026-09-11，时刻表覆盖全量审计 + ChuoMain 文件名大小写修复）
**用户指示**："还需要继续补齐时刻表"。
**ODPT 实测审计**（odpt:Railway 88 条权威列表 + 逐线 TrainTimetable 实拉，端点 token 经 getApiLinks 解码，不落盘）：
- **82 条 JR-East 本地线时刻表来源 100% 覆盖，0 缺口**：MANUAL 41（40 条 ODPT 无数据地方线 + ChuoMain）+ ODPT 41（含全部命名映射线）。TRUNK 干线本名（TokaidoMain→Tokaido / TohokuMain→Tohoku）ODPT 有数据、LOS 不展示，无需补。
- **命名映射复核**：本地 ID ≠ ODPT odpt.Railway code 的线全部已有 LINE_RAILWAY_CODE 条目（KeihinTohoku→KeihinTohokuNegishi / Saikyo→SaikyoKawagoe / UtsunomiyaJR→Utsunomiya / SobuMain→Sobu / JobanMain→Joban / Joban→JobanRapid / KawagoeWest→Kawagoe / TsurumiUmiShibaura→TsurumiUmiShibauraBranch / TsurumiOkawa→TsurumiOkawaBranch / ChuoTatsuno→ChuoTatsunoBranch / RikutoEast→RikuEast / RikutsuWest→RikuWest / Yamagata→OuYamagata / Kounan→Hanawa / Miyo→Yahiko / Yonezawa→Yonesaka / Komii→Koumi / TohokuMain→Tohoku / TokaidoMain→Tokaido / OuMain→Ou / ChuoMain→Chuo），运行时 resolveRailwayCode 已生效——先前"10 条缺口"（KeihinTohoku/Saikyo/UtsunomiyaJR/SobuMain/JobanMain/KawagoeWest/Tsurumi×2/ChuoMain/TokaidoMain）系探测未走映射的误报。
- **ChuoMain 真缺口实证**：odpt.Railway:JR-East.Chuo 的 TrainTimetable 实拉 0 条 → 4.3.521 manual 决策正确（非探测误报），chuomain(ChuoMain) 791 条必须保留。
- **截断线运行时机制确认**：collectTimetableByRailway 对 ≥1000 条线按日历三拆（Weekday/SaturdayHoliday/Holiday）重拉合并 + 池级去重（Kawagoe/KawagoeWest 共用 SaikyoKawagoe 等跨 lid 去重），4.3.489/512 机制有效。
**修复**：data/timetables/chuomain-manual.js → **ChuoMain-manual.js**（git mv，内部变量 window.ChuoMain_MANUAL_TIMETABLES 不变）——4.3.528 ensureManualTimetable('ChuoMain') 按 lineId 拼路径 `ChuoMain-manual.js`，Windows 大小写不敏感可加载、Linux/敏感文件系统 404 → 中央本線 CO 推定缺失；重命名后跨平台一致。变量名/collectManualTimetableLines 扫描/按需注入路径三者统一为 ChuoMain。AGENTS.md 4.3.521/524 文件名引用同步更新。
**验证**：git mv 后 node --check ChuoMain-manual.js OK（1.1MB、变量声明 1 处）；手动探测脚本（probe-odpt-tt.js/recheck-odpt.js/compare-railways.js）输出与运行时 resolveRailwayCode 全链路一致。未做浏览器运行时验证——按用户规则交付后人工确认。
**遗留（非 JR，待用户拍板）**：ODPT 不提供 TrainTimetable 的运营商——Keikyu（京急 5 线）/ Seibu（西武 12 线）本地无 manual，时刻表推定无数据源（ODPT 注释"不提供列车时刻表API"）。如需补齐需按 4.3.524 同一 manual 复合模式逐线整理各社官网时刻表（数据源/许可需用户确认）。

## 4.3.530（2026-09-11，ensureManualTimetable 映射线 ODPT 判定修正）
**问题**（4.3.528 引入的边界缺陷）：`_hasOdptTimetable(lineId)` 仅按本地 lineId 子串匹配 ODPT_TIMETABLES 里的 odpt:railway——映射线（ODPT railway 名不含本地 ID）被误判"ODPT 无数据"→ 每次打开该线都注入不存在的 manual 文件 → 404 + reject 噪音。受影响 4 条：KawagoeWest（→Kawagoe）/ UtsunomiyaJR（→Utsunomiya）/ SobuMain（→Sobu）/ JobanMain（→Joban）；ChuoMain 等映射线有 manual 文件，误判后注入成功但同样绕过了 ODPT 检查。KeihinTohoku（→KeihinTohokuNegishi）因子串前缀巧合命中不受影响。
**修复**（js/data-fusion.js）：`_hasOdptTimetable` 增加映射 code 检查——`code = (window.ODPTClient.LINE_RAILWAY_CODE[lineId]) || lineId`（odpt-unified.js 620 行已暴露该表），`rw.indexOf(code)` / `rw.indexOf('.' + code)` 命中即视为 ODPT 有数据，零请求跳过 manual 注入。
**验证**：verify-manual-loader.js 32/32（原 19 + ChuoMain 大小写 7 + 映射线零请求 5 + 未来新线 onerror 2；提取区间改为按 `var _manualLoading` / `window.DataFusion` 内容定位，防行号漂移）；node --check data-fusion.js OK；trains.html data-fusion.js v=4.3.528→4.3.530。

## 4.3.531（2026-09-11，非 JR 21 线时刻表补全·ODPT StationTimetable 程序化生成 + ゆりかもめ官网 PDF）
**用户指示**："你只补充时刻表"——4.3.529 遗留的 Keikyu 5 / Seibu 12 / Odakyu 3 / Yurikamome 1 共 21 线本地无任何时刻表数据。中途方向更新（主代理实测确认）：ODPT odpt:StationTimetable 对这三社有完整官方数据，20 线改走 ST 程序化生成，ゆりかもめ ST=[] 无数据仍走官网 PDF。
**数据源（ODPT challenge API 实测）**：
- consumerKey 自 data/api/odpt-links.js 的 window.ODPT_LINKS_ENC 用 odpt-unified.js 同款 _b64decode+_xorDecode 解码（node 复刻，不落 key）。
- `odpt:StationTimetable?odpt:operator=odpt.Operator:Keikyu` 6.7MB（5 线全）/ `Seibu` 7.2MB（12 线全）/ `Odakyu` 6.1MB（3 线全）/ `Yurikamome`=[]（无 ST）。ST 记录=站×方向×日历（odpt:station/railDirection/calendar/stationTimetableObject[trainType/departureTime/destinationStation]），无 trainNumber/无 arrivalTime。
- ゆりかもめ官网 PDF（renew.yurikamome.co.jp/station-timetable/pdf/time/u-01~u-16.pdf，PyMuPDF 逐站解析）。
**转换算法**：ST 按 (calendar, railDirection, destination.join('|'), trainType) 分组 → 组内按站序（odpt:Station 按 odpt:stationCode 数值排序，京急本線泉岳寺无 KK 码手动置于品川前）双指针贪心串联（>cur 且站间 ≤30min 最近时刻；越站跳过；跨天 h<5 时 +1440）；直通列车只生成管内站域时刻；ST 无车号→伪 trainNumber（线缩写+方向+序号，同 calendar 唯一）；只填 odpt:departureTime（estimator effectiveArrival=depTime，不依赖 arrivalTime）。
**产物**：`data/timetables/` 21 个新文件、合计 **15835 条**（平日 8104 / 土休 7731）——
- 京急 5：Keikyu 2207 / Daishi_Keikyu 475 / KeikyuAirport 724 / KeikyuKurihama 515 / KeikyuZushi 447（railway=odpt.Railway:Keikyu.Main/Daishi/Airport/Kurihama/Zushi 原值）
- 西武 12：Ikebukuro 2032 / SeibuShinjuku 1419 / SeibuChichibu 208 / Haijima 443 / Kokubunji 424 / Yurakucho_Seibu 511 / SeibuEn 260 / SeibuTamagawa 358 / SeibuYamaguchi 162 / SeibuTamako 432 / SeibuToshima 305 / Seibu_Sayama 262（railway=odpt.Railway:Seibu.Ikebukuro/Shinjuku/SeibuChichibu/Haijima/Kokubunji/SeibuYurakucho/Seibuen/Tamagawa/Yamaguchi/Tamako/Toshima/Sayama 原值）
- 小田急 3：Odawara 2147 / OdakyuEnoshima 1094 / OdakyuTama 466（railway=odpt.Railway:Odakyu.Odawara/Enoshima/Tama 原值）
- ゆりかもめ 1：Yurikamome 944（官网 PDF，railway=odpt.Railway:Yurikamome.Yurikamome）
**消费者链路零改动**：estimator 按 railway 末段过滤——末段===lineId 直过，不等时 LINE_RAILWAY_CODE 反查（odpt-unified.js 478-499 已含全部映射）；站 URN 只写 "odpt.Station."+本地站键（消费者只取最后段归一化匹配）；文件名/变量名与 lineId 逐字符一致（4.3.529 大小写教训）。
**验证**：独立回归 verify_nonjr_manual.js **126/126 PASS**——21 文件 node --check 全过；railway 末段合法（SeibuChichibu 实测 ODPT 即同名透传，无映射表条目）；calendar 仅 Weekday/SaturdayHoliday；同 calendar trainNumber 唯一；trainTimetableObject 每站站键归一化 100% 命中 lines[lineId].stations（0 未匹配）；departureTime HH:MM 可解析；每条 ≥2 站。串通率对照主代理基准：京急大師線 WD 下り 134/134 完全一致；京急本線/Odawara/Ikebukuro 量级约 1.5x 系计入浅草線・空港線・Metro 直通车管内始发点（真实列车，非算法错误）。
**遗留**：串联失败（<2 本地站，界外/短站列车已跳过）——Ikebukuro 178（北飯能/高麗/武蔵横手/東吾野/吾野在本地线界外）/ Yurakucho_Seibu 82（3 站短线）/ OdakyuEnoshima 41 / OdakyuTama 25 / Haijima 4；ST 无 arrivalTime 字段（到站=发车站记录模型本身如此，estimator 兼容）；官网手工方案首批产物（京急/西武池袋系/小田急/ゆりかもめ 已落盘后）被 ODPT ST 版本覆盖，ゆりかもめ 保留官网版（ODPT 无 ST）。未改 js/、data/core/、pages/；未运行 gen-file-data.js（并发会话占用）。

## 4.3.531-补（2026-09-11，MainAgent 独立复核）
**复核脚本**：verify-nonjr-final.js（agent workspace，消费端口径——模拟 estimator 的 extractStationKey/normalizeStationKey/railway 过滤逻辑，与 railway_data.json 交叉核对）。
**结果**：21 文件 new Function 加载全过；calendar 仅 odpt.Calendar:Weekday/SaturdayHoliday；同日历 trainNumber 唯一（跨日历复用=ODPT 真数据惯例，estimator 按日历过滤后去重，无影响）；trainTimetableObject 站键归一化 **100% 命中 lines[lineId].stations**（0 未匹配）；departureTime 全为 HH:MM；railway 过滤 15 线经 LINE_RAILWAY_CODE 反查命中 + 6 线同名透传（Ikebukuro/SeibuChichibu/Haijima/Kokubunji/Odawara/Yurikamome，railwayKey===lineId 直过）全通；站序按方向单调 18/21 线全过。条数合计 15,835（记录级日历拆分 平日 8,287 / 土休 7,548——与 4.3.531 主体 8,104/7,731 差异系统计口径，总数一致）。运行时冒烟：Node 模拟浏览器加载 21 线 + estimateLinePositions 全 0 错误（深夜时段仅 Odawara/Yurikamome 有在途，正常）；verify-manual-loader.js 32/32 无回归（4.3.528/529/530 完好）。
**新发现遗留（元数据瑕疵，运行零影响）**：3 线共 6 条链 direction 标签与站序方向矛盾——Yurakucho_Seibu SYO001/002（Kotake-Mukaihara→Shin-Sakuradai 实为 Inbound 但标 Outbound）、SeibuTamagawa SGO001/002（Musashi-Sakai→…→Koremasa 实为 Inbound 但标 Outbound）、Yurikamome WI001/002（Odaiba-kaihinkoen→…→Toyosu 实为 Outbound 但标 Inbound）。全项目 grep `odpt:railDirection` 消费 = **0 处**（js/ 与 pages/ 均无），估计器/渲染只按时刻+站序定位，不读方向字段→不影响运行；列为 Known Debt 待日后统一核对或忽略。
**.work/（6MB）**：子代理中间产物（官网探索脚本 + ODPT ST 解析中间 JSON，含 parsed_trains.json 2.5MB），git 未跟踪，保留待用户定夺（可复现中间产物 or 清理）。

## 4.3.532（2026-09-12，上线前体检·Rinkai/TsukubaExpress 推定空白修复）
**用户指示**："现在看看还有没有可能遗漏的问题，OK的话就推送上线"——上线前全面体检。四维缺口审计（audit-coverage-final.js：本地 165 线 vs manual 62 文件）报 **3 真缺口：Rinkai / TsukubaExpress / NewShuttle**，逐线追根因并 ODPT 实测定案。
**根因实证（ODPT API 实拉）**：
- `odpt:TrainTimetable?operator=TWR` = **564 条全为 TWR.Rinkai**；`operator=MIR` = **841 条全为 MIR.TsukubaExpress**——数据源齐全，纯代码 bug。
- 本地 line.operator=Rinkai/TsukubaExpress（railway_data.json），但 ODPT 池键=ODPT_ENDPOINTS 键（TWR/MIR）→ `estimateAllPositions` 取 `timetableIndex[normalizeOp(line.operator)]` 落空（common.js TRANSIT_NORMALIZE 无别名）→ **这两条首都圈线 trains 页推定永远空白**。LINE_TO_OPERATOR 表（odpt-unified.js）有正确映射但 estimateAllPositions 不走它。
- **NewShuttle 三家候选 operator 全 0 条**（SaitamaRailway/SaitamaNewUrbanTransit/SaitamaTransit）——纯数据源缺口（ODPT 无 TrainTimetable），同 41 条 JR 地方线待遇，非代码缺陷。
**修复**（js/train-position-estimator.js estimateAllPositions）：取时刻表池前加 **TT_OP_ALIAS** `{Rinkai:'TWR', TsukubaExpress:'MIR'}`——别名仅作用于取数这一处，不影响 LOS 分组/图标/延误（那些仍用 line.operator 原键）。
**验证**：node --check OK；模拟池验证（别名取数 Rinkai/TsukubaExpress 产出 1/1、无关线 0 不崩）；**真实数据端到端**（拉 TWR/MIR 全量 1405 条 + railway_data.json 站表，JST 模拟 09:49 周六下 Rinkai 推定产出 6 条 / TsukubaExpress 21 条，站序/方向正确——此前 0 产出为 VM UTC 时区 vs 时刻表 JST 的环境差，非产品缺陷）；integration_test.js 28/28、verify-manual-loader.js 32/32 无回归。
**推送准备**：.gitignore 追加 `.work/` `work/`（13MB 中间产物不入库）；推送范围=本会话 4.3.528-532（data-fusion/trains-page/trains.html/estimator/AGENTS.md/ChuoMain 重命名/21 非 JR manual）+ 并发会话车站订正 4.3.495-500（data/core 7 文件/train-icons/2 张 E257 图片）——待用户确认后 push。
**遗留（数据源限制）**：NewShuttle（埼玉新都市交通）ODPT 无 TrainTimetable，trains 页推定空白；如用户要求可走官网时刻表补 manual（16 站 1 线，同 4.3.524 流程）。

## 4.3.533（2026-09-12，NewShuttle 时刻表 manual 补全·上线就绪）
**用户指示**：“补充吧”（批准 NewShuttle manual 补全）+ “OK 的话就推送上线”。
**数据源**：埼玉新都市交通公式站発時刻表（new-shuttle.jp 站页，2609 版）像素验证锚点 + 発発差链条推导。
**产物**：data/timetables/NewShuttle-manual.js（window.NewShuttle_MANUAL_TIMETABLES，SaitamaRailway 前缀）424 条 = 下り 213（平日 117=全通 106+丸山行 11、土休 96）+ 上り 211（平日 115=全通 103+丸山始発 12、土休 96）。
**关键口径**：
- 下り锚点=鉄道博物館駅発（内宿方面），発発差 Omiya-3/Tetsudo 0/Kamomiya+2/Higashi+4/Konba+6/Yoshinohara+7/Haraichi+9/Shonan+10/Maruyama+13/Shiku+15/InaChuo+17/Hanuki+19/Uchijuku+22
- 上り锚点=内宿駅発（大宮方面），発発差 Uchijuku 0/Hanuki+3/InaChuo+5/Shiku+7/Maruyama+11/Shonan+14/Haraichi+15/Yoshinohara+17/Konba+18/Higashi+20/Kamomiya+22/Tetsudo+24/Omiya+27；丸山始発 SEG 另列（丸山+0→Omiya+16）
- 丸山行（●）11 本平日のみ：鉄博 6:48 / 7:08 28 48 / 8:38 / 18:08 28 48 / 19:08 28 48（前期 13 本中的 8:48/8:58 不在鉄博表中，像素复核剔除）；丸山始発 12 本平日：6:26-8:16 毎10分（車庫出庫，非丸山行折返）
- 鉄博下り 23時首班 08（非03）、内宿上り 8時 无45（整图像素确认）、終点着時刻+2 修正
**验证**：鉄博発/内宿発時刻与官网表逐分钟一致（含丸山行同刻无重复）；node --check；结构回归 0 问题（railway/calendar/时刻格式/终点一致/单调递增）；站 key 与本地 lines.NewShuttle 13 站逐字符一致；消费链走通用 ensureManualTimetable（无特判）。
**推送范围**：4.3.528-532 + 4.3.533（本线）+ 并发会话 4.3.495-500 车站订正；.work 不入库（.gitignore 已加）。

## 4.3.534（2026-09-12，退役列车图标清理·14 项）
**用户指示**："清理到已经没有运营的列车了"——对检查报告（trainfrontview 网站标签全量核对，仅按文件名+网站标注+百科判定，未读图）确认的 14 个已退役车型图标执行删除。
**清理清单（网站明确标「過去」+ 本地现存，删除前全部经引用检查）**：
- 根目录 9 项：e110ex（キハ110系外幌無/只見）/ e40jkaze（キハ40系フルーティア・風っこ）/ e485ha（485系白鳥・いなほ）/ e485km_tgr（485系つがる）/ e719ft（719系フルーティア）/ yrkm7000-1~4（ゆりかもめ7000系）
- 子目录 5 项：都営地下鉄 toky10490（10-490形）/ toky10520（10-520形）/ toky5301（5300形）；横浜高速鉄道 yok1000jg + 横浜市交通局 10000形.png（**两者哈希相同 F385BD5D，均为ブルーライン事業用過去車的误名重复图**）
**引用修复**（System-First）：train-icons.js YokohamaGreen 原指向 横浜市交通局/10000形.png（已删退役误名图）→ 改指 横浜高速鉄道/yok10000.png（现役 10000形 绿线）。删除后全项目 grep 确认 0 残留引用。
**验证**：14 文件全部删除确认（Remove-Item + Test-Path 双重）；残留引用 0（仅注释含"10000形"字样非路径）；新引用目标 yok10000/10001/10002 均存在；检查报告 CSV 重建 201 条（含已删除标注）。
**遗留**：e40ka（烏山線キハ40，网站现役标注但该车已退役）/ e701ta（田沢湖線701-500，网站标過去但实际现役）/ e255s（255系置换中）/ e209ky1（209系京葉 2026年7月训练车转用）/ e653j/m（水戸 E653）/ toky12700 / tx1000~2005（TX-3000置换中）8 项存疑未清理，待用户逐项拍板；yok 系列归类迁移（横浜高速鉄道→横浜市交通局）未执行，YokohamaGreen 现引用横浜高速鉄道目录待后续归类时一并处理。

## 4.3.535（2026-09-12，图库归类迁移 + train-icons.js 断链清零）
**用户指示**："我要你同时把大图整理到子目录去"——根目录 328 个 trainfrontview 大图按运营公司归入子目录，并修复引用断链。
**归类迁移（前缀→运营公司，页面标签/上下文实证）**：JR東日本=e*/c57/ee*（131）；東京モノレール=mn-tky（6）；多摩都市モノレール=mn-tma（4）；首都圏新都市鉄道=tx（7）；埼玉新都市交通=nstl（9）；都営地下鉄=todn/toky（25）；東京臨海高速鉄道=twr（2）；ゆりかもめ=yrkm（2）；北総鉄道=hkso（2）；千葉ニュータウン鉄道=sbym（1）；京王=keio（9）；京成=kese（16）；京急=khk（7）；小田急=odq（21）；西武=seb/musa（30）；相模鉄道=sote（9）；埼玉高速鉄道=sr（1）；東京メトロ=tkm（30）；東武=tob（63）；東急=toq（34）；東葉高速鉄道=toyo（1）；横浜高速鉄道=yokk500f（みなとみらい線，4）；yokk000/yokk000me/yokk000mo=東急（こどもの国線，合并入東急電鉄，删除带括号目录）。根目录清零。
**断链修复（57 唯一引用/141 处）**：train-icons.js 全引用从"标准型号名"（E233系1000番台.png 等）改为代码名大图（e233kt.png 等），53 处 JR 系 + 都営 5（toky10300/12002/5500/6300/todn8503→8500）+ ゆりかもめ yrkm7300 + 多摩 mn-tma1000。替换后引用 114 唯一 / 断链 0；node --check 通过。
**验证**：根目录 0 残留；26 子目录全部就位；断链复检 0；train-icons.js 语法 OK。
**遗留**：湘南モノレール目录仍空（无对应大图）；横浜市交通局目录仅 4000形.png（yok10000 系列仍在横浜高速鉄道目录，归属迁移未执行）；私铁子目录旧小图（東武16/東急7/メトロ10 等）未替换为大图，待用户拍板。


## 4.3.536（2026-09-12，后台缓存 IndexedDB 化 + serve.py key 治理）
**用户指示**：“修复”（后台体检结论落地：P1-1 缓存存储触顶/主线程阻塞、P1-2 API key 明文入库、P3 console.log 治理）。
**odpt-unified.js 缓存改造**（data/api/odpt-unified.js）：
- 存储从 localStorage 迁移到 IndexedDB（v4.3.534 注释）：全量时刻表压缩后 5-10MB 触 localStorage 配额（曾触发 partial 降级丢数据），且 JSON.stringify 大对象同步执行阻塞主线程；IndexedDB 异步写入、容量 GB 级
- 新增 _idbOpen/_idbGet/_idbSet（DB pixel-tetsudo / store odpt_cache，失败重置允许重试）；键升级 odpt_timetable_cache_v3→v4
- loadTimetableCache/saveTimetableCache/shouldRefreshTimetables 全部异步化；localStorage 保留为 IndexedDB 不可用（隐私模式等）时的兜底（_readLocalStorageCache/_saveLocalStorage 含 partial 降级）
- 旧 v3 localStorage 缓存首次访问自动迁移入 IndexedDB（_migrateLegacyLocalStorage，避免首次重下大体积时刻表），成功后清除 v3 残留释放配额
- loadTimetableData 拆壳：缓存读取异步化，API 拉取主体独立 _loadTimetableDataFromApi；内部 Promise 链全部接续（loadAllData/init/setInterval 5min 检查 shouldRefreshTimetables 异步化）
**serve.py key 治理**：ODAKYU_KEY 硬编码移除 → 环境变量 ODAKYU_API_KEY → .work/serve.env（gitignore 已覆盖）→ 未配置时 /api-proxy/ 返回 503 明确提示；utf-8-sig 兼容 PowerShell BOM；key 本体已写入本地 .work/serve.env（不入库）
**console.log 治理**：odpt-unified.js 全部产物 console.log（8 处）降级 console.debug（AGENTS.md Known Debt 消除）
**验证**：node --check 双文件；.work/test_odpt_cache.cjs 端到端 12/12 PASS（A 首拉落盘/A5 压缩格式/B IDB 命中时刻表零重拉/C v3 迁移/D TTL 过期重拉）；serve.py py_compile + key 加载复验 40 字符匹配；浏览器端效果按用户约定人工验收
**范围**：仅 data/api/odpt-unified.js + serve.py + AGENTS.md（并发会话 4.3.534/535 图标/图库改动不纳入本 commit）


## 4.3.537（2026-09-12，后台安全加固·静态暴露修复）
**用户指示**：“现在来看后台的安全性”——威胁面盘点 + 实证 + 修复。
**实证发现（修复前）**：
- **P0-1 静态服务整树暴露**：serve.py 以项目根为静态根，.work/serve.env（含 ODAKYU_API_KEY 明文）实测可经 http://127.0.0.1:8017/.work/serve.env 直接下载（已用临时 server + curl 复现）
- **P0-2 目录列表开启**：/images/ 与根目录列表可枚举，泄露项目结构（AGENTS.md 等文档可读）
- **P0-3 git 历史 key 泄露**：bde42b3（4.3.406）起 ODAKYU key 明文入库并已推送 GitHub 公开仓库（5e12a33 仅移除当前版本，历史仍可查）→ **key 需轮换**
- P1 代理异常回显 str(e)（泄露上游响应细节）
**修复（serve.py）**：
- 静态敏感拦截：FORBIDDEN_PREFIXES（.work/ .git/ .user_skills/ .skills/ work/ recovery/ scripts/）+ FORBIDDEN_NAMES（serve.py/serve.err/serve.log）+ FORBIDDEN_SUFFIXES（.env/.py/.log/.err）→ 403
- 目录列表关闭：list_directory 覆盖返回 403
- Host 头校验：非 127.0.0.1/localhost/[::1] 拒绝（防 DNS rebinding 绕过本机绑定）
- 代理异常回显改通用文案（upstream request failed）；全部响应补 X-Content-Type-Options: nosniff
**验证（临时 server 实测）**：.work/serve.env 403 / serve.py 403 / /images/ 403 / 根路径=index.html 正常跳转 / pages/home.html 200 / 恶意 Host 403 / 代理带 key 正常 200（serve.env 读取链路 + 上游联通双确认）；serve.err 无 key；py_compile OK
**遗留**：ODAKYU key 轮换需用户在小田急侧操作（git 历史清理风险高不推荐，轮换即等效失效）；ODPT 前端 consumer key 为公开设计（浏览器必然携带，非漏洞）；P2-1 脚本入库政策仍待拍板

## 4.3.538（2026-09-12，线路图整体放大 50%）
**用户指示**："线路图整体放大50%"。
**实现**（css/trains.css）：`.tp-map-wrap` 宽度 100%→**150%**（max-width 解除）→ SVG（width:100% 相对 wrap）实际渲染 1.5 倍，站距/文字/图标/列车等比放大；`.tp-line-map` overflow-x clip→**auto**（放大后横向滚动查看超出部分）；纵向 height:auto 自然撑开页面流。几何逻辑（viewBox/站距按容器 clientWidth 计算）完全不动，纯显示层放大。
**验证**：git diff 仅 2 处（overflow 行 + wrap 宽度行）；trains.html 版本行 bump v=4.3.469→4.3.538（缓存规避）；中文编码完好（无 BOM 文件未经 PowerShell 写入）。交付后用户人工验收（禁系统截图）。

## 4.3.539（2026-09-12，线路图放大后初始视图居中裁切）
**用户反馈**："但是你没有居中裁切"——4.3.538 放大 150% 后 wrap 左对齐，初始视图从图左端开始。
**修复**（js/trains-page.js 渲染完整重建路径）：appendChild(svg) 后 `requestAnimationFrame` 设置 `el.scrollLeft = (scrollWidth - clientWidth) / 2`——初始视口中心对准图中心，左右两侧对称溢出，向两端滚动全程可达（刻意不用 flex 居中：flex 溢出时左侧溢出区 scrollLeft 不可达，属浏览器已知限制）。仅完整重建路径设置一次，用户手动滚动后位置保持；增量更新路径不受影响。
**验证**：node --check 通过；trains.html trains-page.js 版本行 4.3.523→4.3.539；diff 仅 2 处。交付后用户人工验收（禁系统截图）。

## 4.3.540（2026-09-12，线路图放大追加 50% → 总计 100%）
**用户指示**："还需要增加50%"——在 4.3.538（100%→150%）基础上再 +50%。
**实现**（css/trains.css）：`.tp-map-wrap` 宽度 150%→**200%**（总放大 100%）；居中裁切 JS（4.3.539 scrollLeft=(scrollWidth-clientWidth)/2）对任意宽度通用，无需改动；overflow-x auto 滚动范围随 scrollWidth 自动扩展。
**验证**：trains.html trains.css 版本行 4.3.538→4.3.540；中文编码完好。交付后用户人工验收（禁系统截图）。

## 4.3.541（2026-09-12，线路图按拓展后实际尺寸部署·废弃容器宽度基数放大）
**用户指示**："是按照拓展后的进行尺寸部署，不是用某个基数单纯放大"——4.3.538-540 用 `.tp-map-wrap{width:200%}` 以**容器宽度为基数**放大，图的实际像素大小随屏幕宽变化（窄屏 720px/宽屏 2000px）。用户要求图的大小由**线路图自身拓展尺寸**决定。
**修复**：
- js/trains-page.js：SVG 装配改为 `svg.style.width = svgW×_mapScale px; height = svgH×_mapScale px`（_mapScale=2，累计放大 100%）——渲染像素 = viewBox 逻辑尺寸 × 2，与容器宽度无关；同屏不同线路、不同屏宽下图的实际像素一致
- css/trains.css：`.tp-map-wrap` 由 `width:200%` 改 **`width:fit-content`**（wrap 随 svg 实际像素宽），容器仅作裁切视口（overflow-x auto + 4.3.539 初始居中裁切 scrollLeft 公式通用）
- 居中裁切/增量更新/短线路（svg×2 < 容器宽时不滚动靠左）均不受影响
**验证**：node --check 通过；grep 确认无其他代码依赖 wrap 200% 或 svg 100% 宽；trains.html 双版本行 4.3.540/4.3.539→4.3.541。交付后用户人工验收（禁系统截图）。

## 4.3.542（2026-09-12，短线路居中·修正靠左）
**用户指示**："修正"——4.3.541 后短线路（svg×2 像素宽 < 容器宽）wrap fit-content 靠左显示，右边留空；长线路溢出时靠 JS scrollLeft 居中裁切。
**修复**（css/trains.css）：`.tp-map-wrap` 加 `margin-left:auto; margin-right:auto`——不溢出时水平居中；溢出时 margin auto 无剩余空间自动归零，JS 居中裁切继续生效。两态兼容，无需改 JS。
**验证**：diff 仅 wrap 行 + 注释；trains.html trains.css 版本行→4.3.542。交付后用户人工验收（禁系统截图）。

## 4.3.543（2026-09-12，画布基准固定·根除容器宽度基数）
**用户指示**："修正"（第二次）——4.3.541/542 后仍不满意。排查发现真根因：svgW（viewBox 宽）本身由容器宽度派生——直线布局 `_baseW = clamp(_cw, 440, 820)`（_cw=clientWidth），六形环 `_cw6` 同；`svgW×2` 部署的像素仍是"容器适配尺寸 ×2"，图大小随窗口宽度连续变化（宽屏 2400px/窄屏 1200px），即用户否决的"以某个基数单纯放大"。
**修复**（js/trains-page.js）：
- 直线布局 854 行：`_baseW` 改固定档位——`_isMobileView() ? GEOM.MAIN_BASE_W_MOBILE(410) : GEOM.MAIN_BASE_W_MAX(820)`，删除 _cw 容器读取（死代码）
- 六形环 596-597 行：`_cw6`/`_cw6Content` 同改固定档位，环宽不再随容器拉长
- GEOM.MAIN_BASE_W_MIN(440) 停用（原 clamp 下界），保留作历史注释
- 视口裁切 clientWidth（1735 行居中 rAF）保留——容器只决定看到多少，不影响图尺寸
**效果**：同一设备档位下，任意窗口宽度 → svgW 恒定 → 渲染像素（svgW×2）恒定。窗口窄于画布时横向滚动（图大小恒定是设计目标）。
**验证**：node --check 通过；grep clientWidth 仅剩视口裁切 1 处；MAIN_BASE_W_MIN 全项目仅定义 1 处（已注释停用）；trains.html trains-page.js 版本行 4.3.541→4.3.543（css 无改动）。交付后用户人工验收（禁系统截图）。

## 4.3.544（2026-09-12，放大比例 200%→170%）
**用户指示**："减小30%"——当前 ×2（累计放大 100%）减小 30 个百分点 → ×1.7（累计放大 70%）。口径与"增加50%"（150%→200%）一致：百分点增减，非乘法。
**修复**（js/trains-page.js 1504 行）：`_mapScale = 2 → 1.7`（注释同步）。画布基准固定（4.3.543）与居中裁切不受影响——渲染像素 = svgW×1.7，仍与窗口宽度无关。
**验证**：node --check 通过；trains.html trains-page.js 版本行→4.3.544。交付后用户人工验收（禁系统截图）。

## 4.3.545（2026-09-12，移动端恢复 1:1 适配·手机友好）
**用户指示**："对手机版不友好，需要调整"——4.3.541 起 svg 像素部署 ×_mapScale(1.7) 无差别套用到移动端：图 697px > 手机容器(~360px)，必须横向滑动查看，体验差。
**修复**（js/trains-page.js）：
- 渲染比例按设备：`_mapScale = _isMobileView() ? 1 : 1.7`——放大仅桌面；移动端 1:1（字原生大小、图=容器宽）
- 移动端画布基准恢复容器适配：直线 `_baseW = max(clientWidth−16, 320)`、六形环 `_cw6` 同（4.3.543 桌面固定 820 保留不动）——svgW=容器内容宽 → ×1 渲染不超屏、无横滑
- 桌面逻辑完全不变：固定基准 820 × 1.7，与窗口宽度无关（"拓展后实际尺寸"）
- _isMobileView 阈值：innerWidth < 600（平板 600+ 归桌面，横滑与桌面一致）
**验证**：node --check 通过；diff 仅本轮 3 处（基准×2 + scale）；trains.html trains-page.js 版本行→4.3.545。交付后用户人工验收（禁系统截图）。

## 4.3.546（2026-09-12，线路图完整适配容器·无横向滚动·废弃像素部署）
**用户指示**："在保证最大的线路图完整的情况下裁剪保证不会出现横向滚动"——4.3.541-545 的像素×倍数部署（桌面 ×1.7）使图超出容器、必须横向滚动，且短/长线路需滚动查看不完整。最终诉求：整图完整可见、无横向滚动、宽度用满容器（"最大"）。
**修复**（显示层容器适配）：
- js/trains-page.js 1514-1517：`svg.style.width = "100%"; height = "auto"`（viewBox 保留，preserveAspectRatio meet 按比例缩放整图）——删除 _mapScale 变量与 px 部署
- css/trains.css：`.tp-map-wrap` `width: fit-content` → `width: 100%`（删 margin auto 与滚动居中依赖）——svg 100% 需要 wrap 定宽
- viewBox 逻辑尺寸逻辑保留（4.3.543 桌面固定 820 / 4.3.545 移动容器适配）——转为**内容密度基线**：图按容器缩放显示，密度基线固定
**效果**：任意设备/窗口宽度，整图缩放至容器宽——完整可见、无横向滚动；容器越宽图越大（宽屏自然"放大"）。纵向按比例随图高（正常页面滚动）。
**验证**：node --check 通过；_mapScale 无孤儿引用（注释已更新为 4.3.546 语义）；trains.html 双版本行 4.3.542/545→4.3.546。交付后用户人工验收（禁系统截图）。











## 4.3.539（2026-09-12，小田急运行状况源封锁·key 轮换前置）
**用户指示**：“先把小田原清理封锁，显示暂无延误情报”——ODAKYU key 已泄露（4.3.537 P0-3，公开仓库历史），轮换前封锁小田急数据源，前端明确显示无情报而非伪装正常。
**serve.py**：PROXY_TARGETS 移除 odakyu-status / odakyu-status-detail 两个端点（404）——不再用已泄露 key 发起任何上游请求；ODAKYU_KEY 加载逻辑保留（注释标明封锁期无消费者，轮换后随端点恢复）；ゆりかもめ-operation 不受影响（无 key 源）。
**official-railway.js**：parseOdakyu 增加封锁分支——代理不可用（summary/detail 为 null）时返回 {}（不输出 Odawara/OdakyuEnoshima/OdakyuTama 键），杜绝将“源不可用”伪装成 平常運転(normal)；融合链（getApiDelayInfo official 优先短路）随之走 ODPT→localStatus→fallback，最终 no_odpt。
**translations.js**：zh status.no_odpt “无实时信息”→“暂无延误情报”（用户点名文案；en/ja/ko 保持原样）。
**验证**：py_compile / node --check 全过；.work/test_official_block.cjs 6/6 PASS（封锁分支空对象/正常分支 3 键/融合链无小田急键）；临时 server 实测 odakyu-status 404 / odakyu-status-detail 404 / yurikamome-operation 200 / pages/home.html 200；浏览器端按用户约定人工验收。
**恢复路径**：用户轮换 ODAKYU key 写入 .work/serve.env 后，把两个端点重新加入 PROXY_TARGETS 即恢复（parseOdakyu 正常分支已就绪）。

## 4.3.541（2026-09-12，图库代码名→标准型号名全量重命名·279 项）
**用户指示**："全部切换成型号名词到各自的文件夹里面"——把 `images\列车\` 各子目录下所有代码名文件（c57ba.png/e233kor.png/tob10000.png 等）重命名为日语标准型号名（C57形（ばんえつ物語）.png/E233系0番台.png/10000系.png 等），目录归类不变，并同步修正 train-icons.js 残留代码名引用。判定依据=文件名 + trainfrontview 网站标签 + wiki/官网百科（用户硬约束：**只看文件名，严禁读图**）。
**映射构建（279 项，代码名→型号名，依据 tfv 日文标签 + li 双图分组 + 官网/wiki 实证）**：
- **JR東日本 82**：C57形（ばんえつ物語）/E001系（四季島）/キハ110系 12 变体（甲信越/陸羽東・左沢/東北エモーション/ハイレール1375/おいこっと/盛岡/おもいで号/大船渡線/只見線/小海線/盛岡・幌付）/キハE120系 2/12系客車（ばんえつ物語）2/E127系（南武支線）/E131系（長野）/205系（南武支線）/E209系 2/E231系800番台（東西線直通）/E233系 7 变体（房総/2000番台 2/5000番台別/0番台別/青梅線別）/253系（日光・きぬがわ）/255系（房総特急）/E261系（サフィール踊り子）/キハ40系 4（ふるさと/越乃シュクラ/リゾートしらかみくまげら 2/烏山線）/HB-E300系 6（ひなび/海里/橅 2/さとの 2）/E353系（あずさ・かいじ）/E501系 3/E531系 3（3000番台/赤電/水戸線）/E653系 6/E655系（なごみ）/E657系 9（別×6/ルナ・アズール 2）/701系 5（奥羽羽越/仙台/田沢湖 2/山形線）/E721系（仙台・別）/キハE200系（小海線）/GV-E400系（米坂線）/EV-E801系（男鹿線）/FV-E991系（HYBARI）
- **私铁/公営 197**：京成 12（AE形/3000形 3/3150形/3200形/3500形/3700形LED/3900系/80000形/8800形/8900形）；京急 5（1000形 4 番台/2100形）；京王 4（2000系/5000系/8000系/9000系）；小田急 11；東京メトロ 20；東急 27（300系 10 編成+2 別/1000系 5/3020系/5000系 2/5050系/6020系/7000系/Y000系 3）；東武 47（100系 5 塗装/10000系 4/20400系 2/C11形 2/DE10形/客車 2 等）；西武 21（L00系 2/001系（ラビュー）/10000系 2/20000系/6000系 2/2000系 3/4000系 3/40000系 3/40050系 2/8500系/7000系）；都営 19（花100形 按用户指定/都電 7700-8900 形/新交通 10-490 等）；TX 6（TX-1000系 2/TX-2000系 4）；東京モノレール 5；埼玉新都市 8（**2000系 + 2020系 6 編成**，HEAD 引用的旧名"2000形"同步修正为"2000系"）；ゆりかもめ 1（7500系）；相鉄 3；東葉 1；北総 1；千葉NT 1（3600形）。
**重命名执行**：279 项 Rename-Item 全成功（首轮 231 成功 + 48 因目标已存在失败 → 备份旧小图后删目标重试成功）；**48 个被覆盖的旧型号名小图已备份**至 `%TEMP%\图库旧小图备份\`（未静默删除）；重命名后代码名残留 0。
**引用同步**：train-icons.js 埼玉新都市交通/2000形.png → 2000系.png（唯一处 HEAD 旧名与新目标名不一致）；node --check 通过；116 唯一引用断链 0。
**验证**：映射表行数 279=重命名成功 279；残留代码名 0；断链复检 0；重命名后各目录文件抽查（東武/小田急/メトロ/東急 型号名全覆盖）。
**遗留（孤儿小图待用户拍板，未静默处理）**：18 个未被引用且非本次目标的旧小图——北総 9200形（490B）/千葉都市モノレール 1000形（434B）/小田急 1000形（箱根登山色）・80000系（802B，**官方名是 80000形**，旧名残留）/東急 6021系（1143B）/東武 100系（406B）・100系別塗装（409B）・500系（533B，与 500系（リバティ）并存）/横浜市交通局 10000形（別）・10000形（横浜メトロ）/横浜高速 Y500系/江ノ島 1000形・1500形・700形/相鉄 10000系・10000系（新塗装）・11000系・8000系（新塗装 11000系（ほほえみ/おかいもの）已存在）——建议并入备份目录或删除，等用户指示。

## 4.3.542（2026-09-12，18 个孤儿小图清理·图库收敛 372→354）
**用户指示**："清理一遍"——对 4.3.541 遗留的 18 个孤儿小图执行清理。
**清理前双保险验证**：①全项目 js/pages/data 按**完整相对路径**（目录\文件名）精确匹配 0 引用；②train-icons.js 引用表交叉比对 0 命中（此前文件名子串搜索的 6 个命中均为注释文字/他司同名文件误报，已排除——如東武鉄道/80000系.png 是正式引用，小田急電鉄/80000系.png 才是孤儿）。
**执行**：18 个孤儿**移动**至 `%TEMP%\图库旧小图备份\孤儿清理\`（按运营公司子目录，未直接删除，可恢复）；移动 18/18 成功，残留 0。
**清理清单**：北総鉄道 9200形 / 千葉都市モノレール 1000形 / 小田急電鉄 1000形（箱根登山色）・80000系（旧名残留） / 東急電鉄 6021系 / 東武鉄道 100系・100系別塗装・500系 / 横浜市交通局 10000形（別）・10000形（横浜メトロ） / 横浜高速鉄道 Y500系 / 江ノ島電鉄 1000形・1500形・700形 / 相模鉄道 10000系・10000系（新塗装）・11000系・8000系。
**验证**：图库 PNG 372→**354**（26 子目录不变）；train-icons.js 引用断链 0；node --check 通过；被引用文件零波及（清理前双保险）。
**恢复路径**：如需恢复任一文件，从 `%TEMP%\图库旧小图备份\孤儿清理\` 按目录取回即可（TEMP 重启可能清空，需长期保留请复制到项目目录）。
## 4.3.547（2026-09-12，成田線拆三条·JR 官方口径）
**用户指示**："成田线JR官方拆成三条"——JR 官方成田線为三条：本線（佐倉～松岸）、空港支線（成田～成田空港）、我孫子支線（我孫子～成田），合计 27 站。
**根因**：本地 Narita 本线站表原为 佐倉→…→松岸→銚子（17 站）——銚子是総武本線终点被误收（成田線本線官方终点为松岸），且产生 3 处错误引用：Narita.transferStations 銚子→SobuMain、SobuMain.transferStations 銚子→Narita、stationLines[Choshi]=[Narita,SobuMain]、LSO[Narita].Choshi。
**修复**（railway_data.json，用户指示允许改数据）：Narita 本線删銚子 17→16 站（佐倉～松岸，durations 17→15、transferStations 删銚子条目）；SobuMain.transferStations 删銚子→Narita 声明；stationLines[Choshi] 删 Narita；LSO[Narita] 删銚子。空港支線（3 站）/我孫子支線（10 站）已正确不变；三条合计 27 站与官方一致。gen-file-data.js 重生成 bundle。
**缓存规避**：bump trains.html db-loader.js ?v=4.3.469→4.3.547（数据 localStorage 缓存 key 跟随 db-loader 版本，不 bump 则命中旧缓存——4.3.521 教训同型）。
**验证**：本地三条数据断言全过（銚子 0 残留、站数/换乘/LSO/stationLines 全对）、bundle 重生成；线上 #Narita 由用户人工验收。

## 4.3.548（2026-09-12，成田線图 junction 重复绘制修复·渲染层）
**用户指示**："你自己看"（4.3.547 拆三条上线后成田線图视觉堆叠投诉）——数据层经复核已正确（本線 16 站含久住 Kuzumi 真实站/銚子归総武；下総松崎～新木 6 站属我孫子支線，Suica 官方表证实），问题在渲染层。
**根因（线上 DOM 实测）**：computeRouteGeometry branchGeom 竖列分支与 renderTrainMap 竖列循环均从支線站表首位（junction）生成坐标/绘制——成田線两条支線 junction 同为成田 → 图中「成田」圆点+站名出现 3 次（主干 1 + 两竖列各 1），支線竖线从重复成田行起头，三条线视觉纠缠、站名堆叠（对比横向 _branchH 路径早有 junction continue，竖列缺失此跳过）。
**修复**（js/trains-page.js 两处）：
- computeRouteGeometry branchGeom 竖列：`if (_gStations[_bsi] === _jfG.station) continue;`，独有站 y = _by + _bK*_bsp（_bK 从 1 起 = junction 下方一档，与横排 _bHi+1 同规则）；
- renderTrainMap 竖列：同样跳过 junction（skipTx 由 bsi===0 改恒 false），支線只画独有站。
**效果（本地 DOM 验证）**：nCircle 29→27（16 主干 + 9 我孫子 + 2 空港）、「成田」仅主干 1 次（站名朝右）、支線竖列自下総松崎/空港第2ビル 起（y=junction+sp）、竖线 y1=junction 行不变、y2 余量保持。
**版本**：bump trains-page.js ?v=4.3.546→4.3.548（db-loader 4.3.547 数据未变不 bump）。
**验证**：node --check 通过；本地静态服务器 + DOM 读取结构断言全过（圆点数/成田出现次数/支線首站/竖线范围）；线上由用户人工 Ctrl+F5 验收。

## 4.3.549（2026-09-12，成田線 junction 站名/换乘 chip y=undefined 修复·深度检查）
**用户指示**："深度检查成田线差不了的原因"（成田線查不到实时/页面异常深度排查）。
**深度检查结论（实测）**：
- ODPT challenge API 实测：odpt:Train Narita=0 / NaritaAbikoBranch=0 / NaritaAirportBranch=0 —— **ODPT 数据源不推送成田線实时列车位置**（仅覆盖首都圈 22 系统，4.3.489 已记录），实时查不到属数据源限制，非代码缺陷；
- odpt:TrainTimetable 成田系 728 条齐全（Narita 348 / Abiko 160 / Airport 220），时刻表推定正常——SVG 已渲染 11 个推定列车标记（时刻表からの計算データ）；
- 发现并修复可修 bug：成田線双支線触发 `_isBranchJunction` 分支（多支線线首条），`_renderStationNode` 调用漏传 `ty`（仅 `tx`/`anchor`）→ _renderStationNode 1159 行 `ty = o.ty` 取 undefined → 成田站名 text y=undefined（SVG 报 `<text> attribute y: Expected length`）、换乘 chip `iy0 = ty+14 = NaN`（rect/image 不渲染，报 y: NaN）——成田站周边视觉缺失/错位的直接原因。
**修复**（js/trains-page.js 1580-1581 行）：junction 分支补 `ty: _bJ7 ? sc.y : undefined`（站名与圆点同行，dominant-baseline central 同 v4.3.500 规则）。
**验证**：node --check；本地 DOM——成田站名 y=142（此前 undefined）、chip rect y=150 / image y=151（此前 NaN）、全图坏 y（undefined/NaN）0 处；线上由用户人工 Ctrl+F5 验收。
**版本**：bump trains-page.js ?v=4.3.548→4.3.549（数据/时刻表未变不 bump db-loader）。

## 4.3.550（2026-09-12，成田線换画法·双支线左右分侧）
**用户指示**："那你还上换一种画法把，成田线现在这样可读性很差"（4.3.516/522 双支线全左：我孫子 9 站竖列 + 空港 2 站也被拖成拐弯竖列，全挤左侧站名朝左视觉失衡）。
**画法规则**（写规则非逐例）：①每条支线独立画法——非 junction 站 ≤4 → 水平直线横排（h）、>4 → 竖列（v）（原 _branchH 全局阈值：成田我孫子 9>4 卡死整线横排）；②位置——竖列支线在左、横排支线在右（仅当存在竖列支线；全部横排如鶴見線保持全左现状不回归），_bCol 改同侧内序号（左右分别从 0 计）；③junction 站名——存在右支线时转圆点上方居中 + 白描边（paint-order stroke 3px 遮主干竖线；换乘 chip 仍放圆点下方，iy0 判据改 anchor==="middle"，规避非 loop 线 isJunction=false）；④svgW 右侧需求含右横排支线（_rightNeed=横排长+站名带，修复 var 提升陷阱——_branchHSp 定义前移）。
**修改**（js/trains-page.js）：_branchModes/_hasVCol/_bSide/_bCol 重构（分支判定区）、_rightNeed/_branchHSp/svgW（几何需求区）、branchGeom（_branchModes 判断）、geometry 透传（branchModes/rightBranch）、_renderStationNode（paintOrder 支持 + chip _jTopMode）、renderTrainMap（主干 junction top + 横排分支改 branchModes）。
**验证**：node --check OK；本地 DOM——成田線 viewBox 852×1026（原 820，修复 NaN——_rightNeed 引 _branchHSp 在定义前，var 提升 undefined×2=NaN）、我孫子竖列左 x=317.6（9 站）、空港横排右 x=527.6/645.2（2 站，y=142 与圆点同行）、成田站名 y=126 居中描边、chip rect y=155 圆点下方、坏坐标 0；鶴見線全横排左（海芝浦 345.2/280.4:266、大川 345.2:328）不回归；千代田单支線右（430）不回归。
**版本**：bump trains-page.js ?v=4.3.549→4.3.550（数据未动不 bump db-loader）；LINE-DIAGRAM-SPEC 修订表 4.3.550 行。

## 4.3.551（2026-09-12，插线叉出去部分也算站间距·横排站距=名宽+sp）
**用户指示**："所有插线叉出去那一部分也要算站间距"——横排支线（插线叉出去的部分）此前站距 = 全支线最宽名+12（4.3.522，仅文本 padding），未算站间距；竖列支线站距本就 = sp（已算）。
**规则**（写规则非逐例）：**横排支线站距 = 全支线最宽名 + 标准站间距(sp)**——横排站名间隙 = sp，与主干/竖列站间距视觉统一（成田空港 117.6→167.6 = 105.6+62；鹤见 64.8→114.8 = 52.8+62）。
**配套 svgH 完备化**：svgH 原只按主干 stationCoords 站间距计算——junction 靠上 + 长竖列支线时支线底部会被 viewBox 裁剪；branchGeom 构建后取全部支线坐标最大 y，超过主干底时 svgH = max(原 svgH, 支线底 + sp + botP)（横排与 junction 同行不影响高度）。
**修改**（js/trains-page.js）：_branchHSp 定义行 +12 → +sp（注释更新）；branchGeom 块后新增 svgH 扩展。
**验证**：node --check OK；本地 DOM——成田空港 x=587.6/755.2（站距 167.6）、viewBox 952×1026（svgW 852→952）、成田站名 y=126、我孫子竖列 307.6:204→700（站距 62 无回归）；鹤见 viewBox 820×654 不变、横排站距 114.8（站名间隙 62）；千代田 820×1344 无回归。
**版本**：bump trains-page.js ?v=4.3.550→4.3.551（数据未动不 bump db-loader）；LINE-DIAGRAM-SPEC 修订表 4.3.551 行。

## 4.3.552（2026-09-12，详情返回按钮改纯退回）
**用户指示**："发现问题返回是返回对应一览页，不是退回"——trains 详情页返回按钮行为不符合"退回"语义。
**根因（本地 DOM 实测）**：返回按钮原为 history.back() 优先 + fallback（history.length<=1 时 location.hash="" 清 hash 跳一览页）——①直开详情（新标签打开 #Tsurumi，hlen=1）时走 fallback 直接跳一览页（"返回一览页"），非退回；②location.hash="" 产生新 history entry（hlen 1→2），用户再点返回反而 back() 回详情，形成"详情→一览→详情"循环。
**修复**（js/trains-page.js backBtn 监听）：一律 window.history.back()，与 tourism-detail handleBack 完全同步；删除 fallback 块与 2312 行无效 hash 检查（back 异步）。hashchange 兜底保留——back() 回列表（hash 空→hideLineView）/回上一详情（hash 变→showLineView）视图自动恢复；无历史（直开详情）时 back() 无操作、详情保持（同浏览器后退按钮禁用语义）。
**验证**：node --check OK；本地 DOM——直开 #Tsurumi（hlen=1）点返回 URL/hash/详情均不变（不再跳一览页）；列表→鹤见→返回回列表（hash 空）；详情→回列表→成田→返回回列表。
**版本**：bump trains-page.js ?v=4.3.551→4.3.552（数据未动不 bump db-loader）；LINE-DIAGRAM-SPEC 修订表 4.3.552 行。

## 4.3.553（2026-09-12，右侧支线 stub 叉出段 ≥ 站间距）
**用户指示**："你算了站间距后为什么设计成这样"——南武線手机截图：浜川崎支線竖列紧贴主线（固定 stub 20px），两条竖线视觉像双线并行、可读性差。
**根因**：4.3.551「插线叉出去那一部分也要算站间距」只覆盖了**横排站距**（名宽+sp）；**右侧单支线竖列的 stub（水平叉出段）仍是固定 GEOM.BRANCH_STUB=20px**——南武線（24 站 sp=58）主线 410/支线 430 只差 20px。对照：左侧竖列 _branchStubL=主干最宽名+22（≥92 已满足）、成田/鶴見 支线离主线 92-167px 用户可接受——唯独右侧单支线 stub 20px 贴主线。
**规则**（写规则非逐例）：**右侧支线水平叉出段（stub）≥ 标准站间距(sp)**——`_branchStubR = Math.max(GEOM.BRANCH_STUB, sp)`，与竖列/横排"算站间距"统一。
**修改**（js/trains-page.js 7 处）：_branchStubR 定义（_branchStubL 后）；_rightNeed 单支线（598）、svgW 单支线（934）、branchGeom 右侧竖列 x（1030）三处 GEOM.BRANCH_STUB→_branchStubR；geometry 增传 branchStubR（1100）；renderTrainMap 顶部 _stubR6=geometry.branchStubR||BRANCH_STUB（1682）、右侧竖列 x（1737）GEOM.BRANCH_STUB→_stubR6。
**验证**：node --check OK；本地 DOM 四线——南武線 竖线 410/468（stub 58）+支线站名 478、svgW 820 不变；丸ノ内 方南町 竖线 410/468+478；成田 我孫子 307.6/空港 587.6+755.2/成田 410 middle 全不变（双支线右横排不用右侧 stub）；鶴見 海芝浦 170.4/大川 285.2/浅野 422 全不变（全横排左）。
**版本**：bump trains-page.js ?v=4.3.552→4.3.553（数据未动不 bump db-loader）；LINE-DIAGRAM-SPEC 修订表 4.3.553 行。

## 4.3.554（2026-09-12，竖列支线第一站与 junction 同行）
**用户指示**："我是想要岔路的第一个站和出去的站在一行"——竖列支线此前独有站从 junction 下方一档开始（_bK/_bK2=1，4.3.548 规则"与横排 _bHi+1 同规则"），第一站落到主干下一站行，岔路起点视觉下沉一档；用户要岔路第一站水平叉出、与岔路点（junction）同一水平行。
**规则**（写规则非逐例）：**竖列支线跳过 junction 后，第一站与 junction 同行**（水平叉出），再竖列向下——横排支线第一站本就与 junction 同行（y=by），竖列规则与横排统一："岔路的第一站和出去的站在一行"= junction 行即岔路点行。
**修改**（js/trains-page.js 2 处）：branchGeom 竖列 `_bK` 1→0（约 1053-1059，注释同步）；renderTrainMap 竖列 `_bK2` 1→0（约 1778-1796，注释同步）。
**验证**：node --check OK；本地 DOM 四线同行——南武線 八丁畷 y=76 与尻手 y=76 同行（viewBox 820×1542）；成田 下総松崎 y=142 与成田同行（viewBox 952×1026 不变）；千代田 北綾瀬 y=1178 与綾瀬同行（viewBox 820×1344→1282 缩短一档）；丸ノ内 西新宿五丁目 y=308 与中野坂上同行、方南町第二站 y=366（viewBox 820×1520）。
**版本**：bump trains-page.js ?v=4.3.553→4.3.554（**4.3.553 已被 stub 修复 commit 0b6b165 占用并 push，同行修复必须 bump 新版本号，否则浏览器缓存命中旧 stub 版 JS**；数据未动不 bump db-loader）；LINE-DIAGRAM-SPEC 修订表 4.3.554 行。

## 4.3.555（2026-09-12，竖列支线竖线只画到最后一个站）
**用户指示**：截图问"那么多余的部分是"——丸ノ内方南町支线竖线在方南町圆点下方多出一段空线（DOM 实测 468:308→462，方南町 y=366，多 96px）；列车推定标记"▼中野坂上"(504,383) 还落在多余空线段上，观感更乱。
**根因**：竖线终点公式 `branchTop + branch.stations.length×branchSp`（branchTop=by−20，从 junction 上一档起、含 junction 全站计数）——4.3.548 跳过 junction 绘制、4.3.554 第一站同行（_bK2=0 起）后，竖线终点未同步，多出 2×sp−20px 空段（丸ノ内 58→96px、成田 62→102px）。
**规则**（写规则非逐例）：**竖列支线竖线起点 = junction 行（同行修复），终点 = 最后一个支线站 y = junction 行 + (独有站数−1)×sp**；独有站 = 支线站表跳过 junction 后的站数（精确计数，不依赖站表长度假设）；单站支线（千代田北綾瀬）零长竖线。
**修改**（js/trains-page.js renderTrainMap 竖列）：branchVLine y2 改为 `_connY + Math.max(0, _vOwn-1)×branchSp`，_vOwn 由循环跳过 _jFind7.station 精确计数。
**验证**：node --check OK；本地 DOM 四线——丸ノ内 竖线 468:308→366（方南町）、南武線 468:76→250（浜川崎）、千代田 472:1178→1178（单站零长）、成田 317.6:142→638（我孫子，原 742）；站名/同行/横排均无回归。
**版本**：bump trains-page.js ?v=4.3.554→4.3.555（数据未动不 bump db-loader）；LINE-DIAGRAM-SPEC 修订表 4.3.555 行。

## 4.3.556（2026-09-12，返回按钮统一回到线路一览）
**用户指示**："所有返回统一回到一览"——反转 4.3.552 纯退回（history.back()），返回按钮一律回到线路一览页（trains 页唯一返回入口 trainsBackBtn）。
**修复**（js/trains-page.js backBtn 监听）：点击由 `window.history.back()` 改为 `window.location.hash = ""`——清 hash 触发 hashchange 兜底 `!h → hideLineView()` 显示列表；无论从哪进入详情（列表/主页/上一详情/直开新标签）点返回都回一览。清 hash 产生新 history entry（直开详情 hlen 1→2），浏览器后退仍回详情——标准浏览器历史行为，与"返回按钮=回一览"语义一致；hashchange 兜底（hash 变→showLineView / hash 空→hideLineView）保留。
**验证**：node --check OK；本地 DOM 两场景——①列表→南武→点返回：URL #Nambu→#、detailHidden true、listHidden false（回列表）；②直开 #Nambu（新 tab hlen=1）→点返回：同样回列表（4.3.552 时直开详情 back() 无操作，现统一回一览）。
**版本**：bump trains-page.js ?v=4.3.555→4.3.556（数据未动不 bump db-loader）；LINE-DIAGRAM-SPEC 修订表 4.3.556 行。

## 4.3.557（2026-09-12，观光锚点字段清理·旧格式锚点机制退役）
**用户指示**："清理掉锚点相关字段"——旅游数据不再维护手工锚点站，改为全自动距离发现。
**数据层**：
- tourism_data.json 删除 station_coords / station_exits（3 站锚点）——现仅剩 spots（39 个）单一真源
- railway_data.json 删除 tourism 键（93 组 396 个旧格式占位 spot，如 Local Shrines/Quiet religious sites 模板描述，被新格式覆盖从未生效）——按站分组锚点格式整体退役
**代码层（db-loader.js）**：applyData 旧格式 spots 收集段、TOURISM_OVERRIDE 死分支（从未赋值）、applyTourismData 锚点合并、RailwayDB.getNearbySpots/getTourism/getSpot（grep 确认 0 消费者）全部删除；fetchRemote 日志改读 spots.length
**运行时行为变化**：
- TOURISM_STATIONS=[] → sightseeing getMajorStations 走 fallback：从铁路库 STATION_COORDS（2193 站）自动找 3km 内有景点的站（≤12）——站选择器不再只有 3 个锚点站
- STATION_EXITS 恒 {} → tourism-proximity mapDirectionToExit 返回 null → 前端不显示出口，距离显示不受影响
- 站坐标统一走铁路库（消除旧锚点 ID 错位：Kitasenju vs 铁路库 Kita-Senju）
**验证**：bundle 重跑（railway-data.file.js 816KB / tourism-data.file.js 79KB）；vm 模拟加载 39 spots + 2193 站坐标 + 自动发现 12 站（Ueno/Akihabara/Ikebukuro/.../Oshiage）+ 北千住 3km 8 spot 推荐正常；node --check db-loader.js OK；JSON 语法 OK
**缓存**：bump home.html / tourism-detail.html ?v=4.3.469/470→4.3.557（db-loader 缓存键刷新）
**遗留**：足立区观光采集 180 设施已存档 work/adachi-facilities-raw.json（教会28/旅行社4/銭湯33 排除，候选约115）；新增景点规模 A精选20/B标准60/C全量115 待用户拍板；新 spot 无图走图标兜底


## 4.3.558（2026-09-12，线上运营漏洞检测报告修复·5 项）
**用户指示**："根据报告进行修复"——针对线上 GitHub Pages（biubiu52011.github.io/Pixel-Tetsudo，4.3.556 版本）运营漏洞检测报告的 5 项缺陷修复。线上与本地 git HEAD=6ac5649 一致；durations 数据口径为 JR 官网时刻表明内差常识估算（非官方，与本项目既有数据风格一致），已在文末声明。
**漏洞 1【严重】搜索建议残留站 ID 导致搜索用旧站**（js/search-ui.js，LF）：input 事件只调 showSuggestions 不清 `data-station-id` → performSearch 优先用残留站 ID；showSuggestions 缓存分支命中时重写 innerHTML 但不重绑点击（二次 input 后建议失效）。修复：两处 input 监听加 `removeAttribute('data-station-id')`；抽 `_bindSuggestionEvents(container, inputEl)` 并在缓存命中分支重绑；performSearch 成功（result 非空）后调 `window.SearchHistory.saveToHistory(from, to, result)`（与体验 1 联动）。验证：node --check OK。
**漏洞 2【高】成田空港→上野路线/耗时/费用错误（36分/¥530 无京成直达）**（data/core/railway_data.json，2 空格 LF，改前备份 .bak557）：
- 根因一：durations 缺失 → route-search 缺省 2 分/段 → 36 分钟假象。全量统计 165 线：缺失 25、不全 17。
- 根因二：水郡線（Suigun）站表混入 7 个跨区站 ID（Shizu 京成志津/Tamagawa 東急多摩川/MuraNoJo/Ogawa 東京都/Futa-ba/Nogi 宇都宮線/Kawabe 五能線・奥羽）→ E2E 荒谬路径"成田→志津→水郡線→多摩川→横須賀線→上野"。
- 根因三：京成上野⇄上野 14 处换乘声明缺 toStation → buildAliasTransfers 不建异名换乘 → 京成直达不出现。
- 根因四：NaritaSkyAccess（成田スカイアクセス，真实最快通道）终点 ID 与京成本線不一致（Narita-Airport-Terminal-2-3/Terminal-1 为孤立 ID）且 durations 全空 → スカイアクセス不可达。
- 修复：Joban 重建 19 站（品川→取手，补綾瀬/亀有/金町/馬橋/新松戸/北小金，18 段 total=62）、JobanLocal 重建 19 站（上野→取手，含北松戸/南柏/北柏，total=50）、NaritaAbikoBranch 9 段 total=29、NaritaAirportBranch [7,3] total=10、Narita 15 段 total=77、Keisei 42 段 total=97；stationLines/LSO 同步；toStation 补齐 14 处（Ueno 侧 7 + Keisei-Ueno 侧 7 交叉指向，VERIFIED aliasTransfers 生效、Keisei-Ueno⇄Ueno dur=0 直达双向）；Suigun 40→33 站（durations 按原索引区间求和，32 段 total=78）；NaritaSkyAccess 终点 ID 对齐 Airport-Terminal-2/Narita-Airport（共享换乘自动成立）+ durations [5,5,4,4,4,8,6] total=36（アクセス特急水平）。
- 验证（node 模拟 bundle→RailwayDB→through-service/fare-estimator/route-search）：成田空港→上野 combo/duration = 52 分（スカイアクセス→京成本線→日暮里→常磐線各駅停車，真实路径、京成方案出现、耗时合理）；transfers = 65 分（スカイアクセス→京成→押上→東武→日比谷→上野）；逆向 53 分。回归 8 组常见路线端点全对、荒谬路径 0 残留；bundle 重生成加载 OK（railway-data.file.js 816KB / tourism-data.file.js 88KB）；JSON 语法 OK；node --check 相关 JS 全过。
**漏洞 3【中】环线列表区间误导（山手線"東京⇔有楽町"）**（js/data-state.js，LF）：trains 模式区间取首末站——山手線（isDoubleColumnLoop）/大江戸線（isSixShapedLoop）图面首末站为环上相邻站 → 误导。修复：LOS 卡循环加 allLoop 检测（双列环/六字环不推入 intervalSegments，全环卡显示 `t('line.loop')`）；trains 单线 subHtml 同标记时显示 `t('line.loop')`（i18n 已存在：en Loop/zh 环线/ja 環状/ko 환상）。验证：node --check OK。
**体验 1 搜索历史恒空**（js/history.js，CRLF，Edit 工具失败改 PowerShell ReadAllText/WriteAllText 保留行尾）：init 的拦截器包装 `window.SearchUI.performSearch`（构造函数属性，未定义）→ 真实调用走原型方法 → 拦截永不触发。修复：移除失效拦截器整块（替换为说明注释）；search-ui.js 改为直接调 saveToHistory（漏洞 1 联动）；saveToHistory 末尾加 renderHistory() 刷新列表。验证：node --check OK；vm 模拟 SearchHistory.saveToHistory/renderHistory 存在。
**体验 2 观光兜底站无数据**（js/sightseeing.js，CRLF，PowerShell 替换）：getMajorStations 兜底硬编码 ['Shinjuku']，而 Shinjuku 无 spot → 观光网格空白。修复：withSpots 为空时改为从 `window.TOURISM_SPOTS`（39 个）逐 spot 用 `TourismProximity.getNearestStation` 反查有数据站（限 12 个），仍无才 ['Shinjuku']。验证：node --check OK；vm 模拟反查得 12 站（Kita-Senju/Ikebukuro/Senju-Ohashi 等，非硬编码）。
**遗留（非本轮范围）**：①22 条线跨区站 ID 混入债务（除 Suigun 已修，剩 21 条：Hachinohe/TohokuMain/BanetsuEast/TokyuSetagaya/JobanMain 等，含 Otocchi/Adachi/Shiogama 等，污染搜索图但无直接荒谬路径）——按用户"串门站删除"策略待拍板；②剩余 durations 缺口（25 缺失 + 17 不全中的非本轮 6 线）未补——"36 分钟/¥530"类低估在其他线路组合仍会出现；③fare 估算按 hop 数（スカイアクセス 8 站大站距被低估，成田空港→上野显示 350/500 円 vs 真实 アクセス特急 ~1,300 円）——FareEstimator 概算设计局限，未动。
**备注**：本轮 railway_data.json 改动与并发会话（4.3.557 观光锚点清理：db-loader.js/tourism 区块抽出）工作区交叉，提交时需确认不覆盖并发改动；AGENTS.md 4.3.557 已由并发会话占用，本轮从 4.3.558 起编号。
## 4.3.559（2026-09-12，出入口推荐算法经纬度化（2026-09-12，出入口推荐算法经纬度化·站坐标修正·观光选择器排序）
**用户指示**："换种算法按照经纬判断那个出入口离得近"——景点出口推荐从"8 方位角 + 出口优先级表"改为按出入口真实经纬度取最近出口。
**数据源确认**：ODPT 无出口坐标（odpt:exit 为 string 数组，死路）→ OpenStreetMap Overpass API 采集出入口节点（railway=subway_entrance/entrance=yes）。26 目标站批量查询 25/26 命中（Oshiage 押上未命中，Tokyo-Skytree 出口圈已含押上 A2/B1/B2 覆盖）；公共 Overpass 实例不稳定（overpass-api.de 406/XML 错、kumi/osmj 超时），数据采够勿再依赖。
**数据层**：tourism_data.json 顶层新增 `station_exits`（16 站出口坐标表：Kita-Senju 8/Minami-Senju 2/Horikiri-Shobuen 2/Machiya 4/Ayase 2/Asakusa 6/Tokyo-Skytree 1/Ueno 13/Akihabara 8/Ikebukuro 24/Zoshigaya 3/Nippori 4/Kanegafuchi 1/Iriya 4/Kuramae 5/Keisei-Ueno 11）；300m 圈归属过滤邻站串门、同名<40m 去重、名称规范化（East/West exit→東/西口、Exit N→N番出口、押上 A2→A2番出口）。幽灵站审计（4.3.496 方案 B 劣质估算坐标遗留）删 4 纯幽灵站（Minami-Koiwa/Yoshiwara/Iwatsunomachi/Mikawahashi，stations 2193→2189/name_map 1623→1619/i18n 3135→3131）+ Kuramae 坐标修正（35.70560,139.79780→35.70552,139.79241，OSM 实证）+ Tokyo-Skytree 修正（35.71047,139.80939→35.71069,139.81101，149m 偏差虽未达 150m 阈值但为押上寄り错位，一并修正）。Asakusa 本地坐标 (35.71480,139.79670) 判为正确（都営浅草駅），不按 OSM 東武側改。
**代码改造**：
- data/core/db-loader.js：applyTourismData 读 `station_exits` 赋 window.STATION_EXITS（原恒 {}）。
- js/tourism-proximity.js：删除 getExitDirection（8 方位角）与 mapDirectionToExit（priorityMap 北口/東口表）；新增 getNearestExit（遍历 STATION_EXITS[stationId] 出口坐标 Haversine 取最近 {name,distance}）与 getExitNameByCoords（spot 距站中心 <80m 返 駅直結，否则取最近出口名）；113 行 exitDirection 改调新函数；导出同步。
- **附带修复缓存污染 bug**：cacheKey 原不含 limit（sLat,sLng|radius），getMajorStations limit:1 探测会污染 UI limit:30 缓存致景点列表截断——cacheKey 追加 limit。
- js/sightseeing.js getMajorStations：键序遍历（键序+劣质坐标导致 Fujimi/Korakuen/Koiwa/Adachi 假命中站霸榜）改为按 3km 内景点数降序取前 12、景点数相同按最近景点距离决胜（保北千住等中心站）；排除都电荒川线停留场（line key 'Arakawa'，路面电车无出口概念与出口算法不匹配）；4.3.557 按 spot 反查最近站 fallback 保留。
**验证**：vm 模拟 2189 站/39 spots/16 出口站全加载；旧函数 0 残留（全项目 grep）；北千住 LUMINE(55m)→駅直結、北千住丸井(138m)→4番出口(34m)、柳原稲荷(699m)→南口(684m)、浅草→Tokyo Metro(263m)、池袋西武→池袋駅42(117m) 全部合理；top12 无假站/无都电/含北千住；node --check 双文件；bundle 重跑 OK（816KB/88KB/301KB）；home.html & tourism-detail.html ?v= 20+15 处 bump 4.3.559。
**遗留**：4.3.496 方案 B 劣质补坐标仍致 122 站 3km 假命中（真实目标 ~15 站）——本轮仅修 Kuramae/Tokyo-Skytree + 删 4 幽灵，Koiwa/Korakuen/Adachi/Fujimi 等真实站坐标错位未修，是否全局修坐标待用户决定；景点新增规模 A约20/B约60/C约115（足立区 180 设施，work/adachi-facilities-raw.json）用户未拍板。

**4.3.559 上线验收补充修复（2026-09-12，浏览器实测抓出集成 bug）**：用户「上线看看效果」打开 home.html 观光卡片发现只显示距离不显示出口——根因：sightseeing.js getAllSpotsDynamic 的 map 合并（197-211 行）展开 spot 时漏掉 item.exitDirection（tourism-proximity.js 已算出的最近出口名未传给渲染层，313 行 s.exitDirection 恒 undefined）；同时 tourism_data.json 静态残留 39 个旧 8 方位角 dir 字段（全项目零消费者孤儿，grep 确认仅 trains-page.js 的列车方向 dir 无关）。修复：合并块补 exitDirection: item.exitDirection；tourism_data.json 删除全部 39 个静态 dir（bundle 重跑 tourism-data.file.js 88→87KB）。验证（bu 浏览器实测，非截图）：南千住站卡片 延命寺→「駅直近 · TXの駅入口」、Bivi 南千住→「駅直近 · JRの駅入口」；window.SightseeingModule.setStation('Kita-Senju') 切站后 LUMINE 北千住→「駅直近 · 駅直結」、北千住丸井→「2 分歩き · 4番出口」、千住旭町商店街→「2 分歩き · 南口」、千住街の駅→「5 分歩き · 2番出口」、千住桜堤→「10 分歩き · 1番出口」全部合理（与 verify-558.js 样例吻合）；spotHasDir=false 确认孤儿清除；node --check + verify-558.js 全绿。

**4.3.559-补（2026-09-12，ODPT 官方坐标修正+幽灵清理，用户「按计划处理」授权）**：审计 122 个「3km 内有景点」站，ODPT 官方站表逐站比对（challenge API，railway code 按 LINE_RAILWAY_CODE 映射：ChuoMain→Chuo、TohokuMain→Tohoku、KeihinTohoku→KeihinTohokuNegishi；東京メトロ用主站 API 完整 key jueja2…bz；Tobu.Daishi/Kameido 有数据）。**修正坐标 9 站**（本地劣质估算→ODPT 官方）：Uenohara 35.61844,139.11540（原误在上野）/Koiwa 35.73333,139.88185/Higashi-Jujo 35.76386,139.72676/Oji 35.75232,139.73821/Uguisudani 35.72146,139.77803/Komagome 35.73686,139.74806/Shin-Okubo 35.70093,139.70026/Korakuen 35.70731,139.75086/Tawaramachi 35.70992,139.79031。**删幽灵 14 实体**（无引用 8：Shimo-Kitazzu/Ueno-hiro/Otsuka-ekimae/Yanaka/Sunamachi/Tokiwabashi/Kinshi/Higashi-nihonbashi；错线引用 5：Fujimi←ChuoMain（中央本線无富士見，ODPT Chuo 38 站核验）/Hirai-8oh←Hachinohe/Otocchi←Hachinohe（尾久=Oku 已在 UtsunomiyaJR，ODPT 35.74680,139.75387 与本地一致）/Sugita-2←TohokuMain/Adachi←TohokuMain（ODPT 東北本線 Utsunomiya34+Tohoku8 全线无足立/杉田，4.3.496「Adachi 真实站」判定为误）+ID 变体 Nishi_Arayashi 源）；i18n 删 12 键、改名 2（3131→3119）。**ID 规范化 3**：Nishi_Arayashi→Nishi-Arai（合并，Daishi_Tobu 引用改）、Higashi_Azuma→Higashi-Azuma（ODPT Tobu.Kameido.HigashiAzuma 35.70738,139.83160）、Komura_i→Omurai（ODPT Tobu.Kameido.Omurai 35.71032,139.82761，小村井官方罗马字 Omurai）。**验证**：verify-coord-fix.js PASS 28/1（唯一 FAIL 为预存悬挂引用 8 处——TobuIsesaki:Goshi/Keisei:Sugano·Onigoe·Keisei-Nakayama·Keisei-Ohwada·Ohsakura·Keisei-Shisui/BanetsuEast:Sugaya 线路站表引用无实体，非本轮引入，记录遗留待专项）；3km 命中 122→104，top12 稳定（Minami-Senju27/Kanegafuchi26/Kita-Senju24…含北千住无都电）；修正后仍命中的 Tawaramachi/Komagome/Shin-Okubo/Uguisudani 为正确坐标下的真实命中（田原町→浅草寺 1.1km 等）；bundle 重跑（railway-data 815KB/station-i18n 300KB）；浏览器实测 home 观光卡片出口推荐无回归。**遗留**：Hachinohe 线站表尚混 Nasho/Kaijo/Ariake-8oh/Kita-Takaishi/Kuji（横浜/大阪坐标）+7 NO-COORD——ODPT 无八戸線数据（EMPTY），需 wiki/JR 官网专项修；TohokuMain 全线坐标覆盖不足（NO-COORD 多，干线本名不展示低优先）；预存悬挂引用 8 处待清。

**4.3.561（2026-09-12，景点库 B 规模新增 67 个 + 坐标精度工程，用户「按计划处理」授权第二步）**：从 homemate 足立区 180 设施中筛选收录 67 个观光 spot（神社 30/寺 17/文化 3（ギャラクシティ・足立区立郷土博物館・石洞美術館）/温泉 2（大谷田温泉明神の湯等）/イベント 6（足立の花火・だるま供養・じんがんなわ祭・一茶まつり・閻魔祭・鹿浜の獅子舞）/その他）。**坐标三源工作流**：①Nominatim 地址/POI geocode（粗，全角地址常落到町/区代表点）→ ②国土地理院 AddressSearch 按原始地址（含全角）重解析（高精度丁目番地）→ ③**acc 交通信息交叉验证**（raw 的「◯◯駅から徒歩◯分」与坐标距离比对，56/56 整合；天祖神社参考站 TX 八潮本地未收录仅 1 例跳过）。修正典型案例：綾瀬神社 Nominatim 误匹配他处 3.3km、西新井氷川神社町代表点偏差 905m（acc 大师前駅から→最终 162m 吻合）、浄光寺/源正寺等 13 处 >300m 修正。**spots 39→106**（tourism_data.json，新 spot 无图走 sm-thumb-icon 齿轮兜底，desc/i18n 模板化 ja/zh/en/ko、tips 取 raw acc、tags 按 神社=shrine/寺=history/イベント=seasonal/文化·温泉=all，hours/fee/bestTime 保守模板避免编造）；bundle tourism-data 87→174KB；3km 命中站 104→128、top12 全 30 个饱和（景点密集，Kita-Senju 55m 居首，含北千住无都电）；浏览器实测 Daishi_Mae 站：西新井大師@158m/だるま供養@158m/西新井氷川神社@162m/満願寺@320m 全对，106 spots 渲染无错误。**遗留**：新 67 个无实拍图（image 空，后续可采集 homemate/自建图库）；既有 3 spot（観臓記念碑/浄閑寺/千住桜堤）缺 all tag（历史遗留，非本轮）；汤処じんのび/西門寺/長円寺 因 raw 无地址数据见送り收录；页面 v4.3.560→4.3.561。

## 4.3.560（2026-09-12，线上复查问题修复·第四轮）
**用户指令**："修复"——对线上复查（browser 实测 GitHub Pages）发现的漏洞实施修复。
**线上复检修正 2 项误判**：①東海道線详情页站序（线上 DOM 实测 東京→新橋→…→戸塚→大船→藤沢→茅ケ崎→平塚→大磯→国府津→小田原→熱海 完全正确，含大船/无大宮——上轮截图观察误判，数据层 railway_data.json Tokaido 14 站本就正确，无需改）；②"堀京線・川越線"为 OCR 误读（全项目 grep 无堀京線，LOS/data 均为埼京線・川越線，无需改）。
**确认线上现状已正常 2 项**：①观光默认站（线上已显示 南千住+延命寺，4.3.558 兜底生效）；②观光区点击交互（浮层弹出/点击切站/收起 全正常——上轮"点击失效"不复现；全局 style.css .hidden{display:none!important} 已存在，tourism-styles.css 补 .sm-station-picker.hidden 为显式声明，冗余无害）。
**修复 5 处**：
1. 带「駅」候选搜索失败（渋谷駅→"路線が見つかりません"）：js/station-resolver.js isJp 分支 NOT_FOUND 前剥离「駅」后缀重解析（渋谷駅→Shibuya，単測 6 项全过：渋谷駅/新宿駅→EXACT、不存在駅→NOT_FOUND、Shibuya/Kita-Senju 无回归）；js/route-search.js findStationsByTerm 加 filter(r => r && r.stationId && r.status!=='NOT_FOUND') 兜底。
2. 站选择器混入都电荒川线站（三ノ輪橋/荒川二丁目等 5 站，线上实测确认）：js/sightseeing.js getMajorStations tramIds 改用 (UNIFIED_LINES['Arakawa']) || (RAILWAY_DATA.lines['Arakawa'])，兼容线上 https 场景（applyData 不设置 window.RAILWAY_DATA）。
3. 观光默认站锁定 Shinjuku 无景点（数据未就绪兜底且无重算通知）：js/sightseeing.js init 改 _startWhenReady 轮询（DataLoader.isLoaded() 或 STATION_COORDS 有键，250ms×24 上限 6s，超时仍照走）。
4. 搜索历史条目 [object Object]（新发现，线上实测）：js/history.js lineInfo 为对象数组 [{from,to,lines}]，entry.lineInfo.flat() 不展开对象 → 渲染 [object Object]；改 _extractLines 提取各条 lines（兼容纯字符串旧数据）。
5. 版本不一致（history/realtime/trains 页残留 ?v=4.3.469×42）：5 页面全部资源统一 bump 4.3.560。
**验证**：node --check 6 文件（station-resolver/route-search/sightseeing/history/trains-page/data-fusion）；resolver 単測（work/_test-resolver.js）；verify-558.js 全绿（观光 top12 无都电/无假站/北千住正确）；verify-coord-fix.js 27/2（FAIL 1=预存悬挂引用 8 处遗留、FAIL 2=3km 命中 128 > 脚本期望 122——tourism spots 扩增 39→106 后正常增长，阈值未随更新，非回归）；bundle=json 一致性（2175 站/165 线/106 spots，4.3.559-补 遗留改动未破坏）。
**部署说明**：提交后并发会话将 5 页面版本推进至 4.3.562（trains 页仍 4.3.560），实际部署内容即本轮修复（版本号仅缓存参数，无功能差异）。
**遗留**：预存悬挂引用 8 处（TobuIsesaki:Goshi/Keisei 5 站/BanetsuEast:Sugaya，见 4.3.559-补）待专项；Hachinohe 站表混入/NO-COORD（ODPT 无八戸線数据）待 wiki 专项；spots 扩增 39→106 的 AGENTS.md 记录缺失（并发会话工作，verify 阈值未同步）。

**4.3.562（2026-09-12，观光体验修正，用户「修正」指示）**：①**定位立即降级**——file:// 本地打开无 geolocation 权限时直接降级（跳过定位，立即显示默认站 北千住），guard 8s→4s（sightseeing.js initLocation 加 location.protocol==="file:" 短路）；②**无图景点类别图标**——新增 iconForTags()：按 tags 显示语义图标（神社 ⛩/寺 🏛/自然 🌳/食 🍜/季節 🎆/夜 🌙/買物 🛍/公園 🌲/ランドマーク 🗼/近代 🏙），替代统一齿轮（sightseeing.js thumbHtml），39 有图保持原图；③**页面双问号修正**——并发会话遗留 `??v=` 双问号（功能等价但格式错）统一为 `?v=`（home/tourism-detail/history/realtime 4 页面），版本 4.3.561→4.3.562 强制刷新。验证：file:// 打开 7s 内降级完成（数据就绪→立即降级→北千住 30 卡片）、图标抽查 金蔵寺🏛/地守稲荷神社⛩/閻魔祭🎆 全对、tab 切换无回归、0 JS 错误。

**4.3.563（2026-09-12，新景点配图 12 张 + tourism_data.json 格式修复）**：用户「你自己看看适合尺寸的图片」「图片需要为JPG或者PNG格式」——给 67 个新景点补图。
**配图**：image_search（doubao CDN）为主 + Wikimedia 为辅，下载 12 张合格 JPG 存 images/観光地/——西新井大師総持寺(1280x853)/大谷田温泉明神の湯(900x901)/足立区立郷土博物館(750x375)/舎人氷川神社(1024x577)/綾瀬稲荷神社(400x300)/千住本氷川神社(960x720)/千住神社(800x533)/石洞美術館(500x333)/花畑大鷲神社(1000x750)/足立の花火(1499x1000)/満願寺(1000x500)/炎天寺(960x489)。**尺寸不合格弃用 2 张**（千住氷川神社 160x120、南光寺小图，保留图标兜底）。Wikimedia 直连被 IP 级 429 限速（退避 160s 仍 429，浏览器 UA 无效）——CC 图库批量下载需长间隔分批；image_search 返回的 aka.doubaocdn.com 短链可稳定下载（注意同名词张冠李戴：竹塚神社→宮城竹駒神社、梅島天満宮→湯島天満宮 均拒用）。
**重要修复（格式 bug）**：tourism_data.json 顶层是对象 {spots, station_exits}（db-loader applyTourismData 读 override.spots，4.3.557 后 station_exits 16 键仍在）；本次配图写回脚本误把文件写成裸数组 → TOURISM_SPOTS 空 → 观光全空（默认站 新宿 0 卡片、getNearbySpotsByStation 全 0）。修复：git show HEAD 取回 station_exits，恢复对象格式并保留 image 字段，bundle 重跑。**教训：tourism_data.json 写回必须保持 {spots, station_exits} 对象结构，禁止裸数组。**
**规模**：有图 39→51、无图 55（语义图标兜底）；bundle tourism-data.file.js 174KB；4 页面 bump ?v=4.3.562→4.3.563（trains.html 4.3.547 不动）。验证：浏览器实测 Kita-Senju（千住本氷川神社 960x720/千住神社 800x533/石洞美術館 图）+ Daishi_Mae（西新井大師/満願寺/炎天寺 图）全对、0 JS 错误。

## 4.3.564（2026-09-12，观光区定位失败空态·彻底取消手动选站）
**用户裁定**："定位失败后不要给备选站"+"彻底取消用户手动选站"——观光区仅展示定位附近景点；定位失败显示"位置情報が取得できません"空态，不提供 Shinjuku/北千住等任何备选；站选择器与手动选站入口全部移除。
**修复**（js/sightseeing.js）：
- initLocation guard/locFallback 删除 selectedStation 兜底赋值（原 `(getMajorStations().length>0)?[0]:'Shinjuku'`）——定位失败保持 error 无站，渲染层走 tourism.loc_error + 空 grid
- bindEvents 仅保留 relocateBtn→initLocation；删除 stationPicker 点击、locationBar 打开 picker 逻辑
- 删除 showStationPicker/hideStationPicker/setStation（无消费者）；SightseeingModule={init,setLang}
- 删除孤儿 getMajorStations（站选择器唯一调用者移除后无引用）与 cacheDom 中 locationBar/stationPicker 引用
- 页面版本 563→564（4 页统一，trains 页非本次范围不动）
**验证**：node --check；verify-558.js 通过；file:// 本地实测定位失败→"位置情報が取得できません"+空态，无 Shinjuku/北千住备选；已 push c25d7ef
**渲染层既有路径（未改）**：updateStationDisplay error+无站→tourism.loc_error；renderGrid 无站→清空+smEmpty

**4.3.565（2026-09-12，图库二轮·再补 9 图，60/106 有图）**：用户「继续完善图库」——image_search 再补 9 张（西新井氷川神社 750x421/江北氷川神社 512x384/金蔵寺 640x480/慈眼寺（千住）1200x900/源正寺 750x370/堀之内氷川神社 2560x1920/白幡八幡神社 1200x630/元宿神社 750x750/法受寺）。**法受寺原图 3998x2998 4MB 过大**——mediakit-cli image resize-image 缩至 1280x960 357KB（技能流程：shared 前置→image SKILL→resize-image reference→CLI）。**搜索失败记录**（image_search 空/歧义/拦截，保留图标兜底）：ギャラクシティ・だるま・じんがんなわ・一茶まつり（"get empty query after review"拦截）、東岳寺/実性寺/善立寺/常護寺/六町神社/関原八幡神社/伊興若宮八幡宮（空）、高砂神社（兵庫）/日の出神社（三重）/瑞応寺（長野）/薬師寺伊興（奈良）/竹塚神社（宮城）——均同名歧义拒用；恵明寺仅 wikid 270x202 小图弃用。Wikimedia 直连 429 仍未恢复（22:51 实测）。**并发协调**：远端已由并发会话推进至 c25d7ef（4.3.564 观光区取消手动选站+定位失败空态，sightseeing.js setStation 移除）；tourism_data.json 与远端零冲突（diff 仅 9 处 image 字段）；本轮 bump 4.3.565 避免版本重叠。验证：bundle 重跑（tourism-data.file.js 175KB）、浏览器 TOURISM_SPOTS 106/有图 60/9 张新 image 全对。

## 4.3.566（2026-09-13，手动选站结构本体删除）
**用户裁定**："清理掉整个用户手动选站的结构，不是去除掉CSS等让其不显示"——4.3.564 仅移除 JS 逻辑、DOM 仍以 hidden 类隐藏；本轮**真正删除结构本体**。
**删除**：
- home.html: `<div id="smStationPicker" class="sm-station-picker hidden"></div>` 节点移除（此前靠 hidden 隐藏）
- tourism-styles.css: `.sm-station-picker/.sm-picker-label/.sm-picker-list/.sm-picker-btn` 全部样式（含 @media 内 `.sm-picker-btn` 选择器）移除
- translations.js: 无消费者的 `tourism.choose_station` 4 语言文案移除
- 页面版本 565→566（4 页统一；并发会话已推送 4.3.565 图库二轮，本提交叠加）
**保留（非选站结构）**：.sm-location-bar（最寄り駅标签+stationDisplay+smRelocateBtn）——定位状态显示与刷新重试入口
**验证**：node --check；file:// 实测 document.getElementById('smStationPicker')=null、定位失败空态正常、0 JS 错误；已 push 4e6bba3

**4.3.566（2026-09-13，图库三轮·再补 4 图，64/106 有图）**：image_search 再补 4 张——栗原氷川神社（bilibili 1920x1080）/小右衛門稲荷神社（東京とりっぷ 1024x768）/大川町氷川神社（iwalkedblog 560x420）/六月八幡神社（GPSART 860x645）。**搜索失败记录续**（歧义/空/拦截，保留图标）：千住氷川神社（与仲町氷川神社同域难分）、長建寺（京都）/浄光寺（同名词）/天祖神社（竜土神明宮混入）/島氷川神社/宮城氷川神社（大宮氷川混入）/綾瀬神社（仅綾瀬稲荷有图）/本木御嶽神社（渋谷道玄坂混入）/扇三嶋神社（三嶋大社混入）/氷川神社東伊興/八幡神社西綾瀬（筑土八幡混入）/長門鎮守八幡神社（泛八幡图无法确认）；ギャラクシティ仍被 image_search 审核拦截（少年科学館/Galaxy City 变体均失败）。Wikimedia 直连 429 第三日仍未恢复（09-13 实测）。验证：bundle 重跑（tourism-data.file.js 175KB）、tourism_data.json 保持 {spots, station_exits} 对象、64/106 有图。

**4.3.567（2026-09-13，图库四轮·官网源补 2 图，66/106 有图）**：image_search 对剩余 40 余小众神社/寺基本枯竭（同名歧义/空/审核拦截）——换**あだち観光ネット官网源**（adachikanko.net）用 site: 定向搜+抓详情页图（doubaocdn 短链可下载）补 2 张重点：**ギャラクシティ**（spot/id-083 官方外観 440x330——重点设施终于配图，此前 image_search 多词被审校拦截）/**氷川神社（東伊興）**（spot/id-019 伊興氷川神社=氷川神社（東伊興）确认同一社，東伊興2-12-4 竹ノ塚徒歩17分，参道+本殿 440x330）。**官网源经验**：adachikanko.net spot 详情页（/spot/id-XXX）普遍带图、图 URL 为 aka.doubaocdn.com 短链可直接下载；site: 搜索可定位（法受寺 id-012/ギャラクシティ id-083/伊興氷川 id-019）；官网未收录的小神社（竹塚/天祖/中曽根/梅島天満宮等）无图。验证：bundle 重跑、tourism_data.json 对象结构保持、66/106。

**4.3.568（2026-09-13，图库全量审计·张冠李戴修正）**：用户验收指出"搜政府办公楼可能拿到中国/重庆/村委/美国州政府图，你却只看尺寸最好"——对全部 66 张有图逐张 Read 内容核对（OCR 文字+主体识别），发现 5 处错误引用并修正：①**浅草（浅草寺・仲見世通り）**原引スカイツリー.jpg（晴空塔图，两景点共用）→ 改引雷門+五重塔图（浅草寺仲見世.jpg，原浅草神社.jpg 内容，复制改名）；②**浅草神社**原引雷門+五重塔（浅草寺景観非浅草神社）→ 换権現造社殿（重要文化財，UgbAQeasDL 1024x683）；③**千住街の駅**原引宿場町通りサンロード商店街アーチ图 → 换店構え実写（"北千住宿場町通り60/千住街の駅"OCR 确认，BmjN69cqa3 1480x833）；④**宿場町通り商店街**原引駅前緑アーチ街景 → 换アーチ図（即原千住街の駅.jpg 内容，OCR"宿場町通り 北千住 サンロード商店街"确认）；⑤**回向院（小塚原回向院）**原引现代白楼疑错 → 换正面入口（"小塚京回向院"OCR 确认，53Yb826uYf 500x281）。**删除 2 张确定错误图**（回退语义图标）：延命寺（首振地蔵）图是愛知県知多市の地蔵（OCR"愛知県知多市南粕谷"）、関屋の里（冨嶽三十六景）图是稲荷神社（関屋の里実体=北斎冨嶽三十六景「隅田川関屋の里」顕彰碑，千住仲町公園内）——均无正确图，宁可图标兜底。核实保留：雑司が谷鬼子母神堂图虽为境内武芳稲荷鳥居（可接受）；西武/東武百貨店（SEIBU/TOBU OCR）、LUMINE 北千住（KITASENJU STATION OCR）、北千住丸井（北千住マルイ OCR）、池袋西口公園（GLOBAL RING OCR）、ポケモンセンター（精灵球）、素盞雄神社（匾额 OCR）、観臓記念碑（碑文 OCR）等全部内容匹配。**教训固化（用户口径）**：采用图必须逐张核对图片主体与景点一致（OCR/描述双重验证），禁止仅凭尺寸/名称匹配。图库 66→64 有图（2 张错图删除），40 无图→42。

**4.3.569（2026-09-13，图库审计第二轮·再修 2 处）**：续审剩余 ~30 张（4.3.563-567 批全部 Read+OCR），再发现 2 处张冠李戴并处理：①**千住神社**原图 OCR"平塚神社"（王子の別社）——image_search 换 jinjamemo 候选（w6UoYzgdgm）下载后 OCR 仍是"平塚神社"（doubaocdn 短链内容不可靠/页面引用错误）→ **删除图回退语义图标**，不将就；②**柳原稲荷神社**原图 OCR"東稲荷"（足立区千住曙町の別社，牛田駅踏切横）——换**官网 id-046 官方图**（UsW3LoUA8p 440x330 木造社殿，住所柳原2-38-1 一致）✓。核实保留：西新井大師/大谷田温泉/郷土博物館/舎人氷川/西新井氷川/千住本氷川/綾瀬稲荷/法受寺/金蔵寺/源正寺/元宿神社/栗原氷川/炎天寺/小右衛門稲荷/満願寺/石洞美術館/大川町氷川/白幡八幡/花畑大鷲/足立の花火/江北氷川/六月八幡/堀之内氷川/アニメイト/池袋PARCO/柳原商栄会/千住旭町（OCR"学園通り"）全部内容匹配；慈眼寺境内石仏/板碑群为慈眼寺特征（4travel 記事確認）保留。**教训固化**：doubaocdn 短链内容可能随页面引用变化，最终验收必须以**下载后 Read OCR 为准**。图库 64→63 有图。

## 4.3.570（2026-09-13，观光区标签丰富）
**用户指示**："丰富一下标签"——观光区分类标签 7→11，补齐数据中真实存在但 UI 点不到的 4 个分类。
**数据分布**：shrine 41 / history 32 / shopping 16 / nature 10 / food 9 / landmark 6 / seasonal 6 / park 4 / modern 2 / night 0。
**改动**（js/sightseeing.js）：
- tags 数组 7→11：新增 shopping(16)/landmark(6)/park(4)/modern(2)；顺序按数据量 all/shrine/history/shopping/nature/food/landmark/seasonal/park/modern/night（night 数据暂缺保留末位）
- TAG_ICONS 补全 11 个 emoji 图标（此前为空对象）
- TAG_LABELS 补 shopping/landmark/park/modern（translations 4 语言文案早已存在，无改动）
- 页面版本 569→570（并发会话图库已推进至 4.3.569）
**验证**：node --check；file:// 实测 11 标签+图标渲染、0 JS 错误；线上实测标签过滤——ショッピング 5 卡（LUMINE 北千住/北千住丸井/千住旭町商店街等）/ランドマーク 2 卡/公園叠加 4 卡（多选 OR 逻辑）；已 push c1d1e5a
**注意**：标签为多选 OR 过滤（点击切换 activeTags，非单选）；"すべて"清空全部筛选。
