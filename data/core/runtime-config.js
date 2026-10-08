/**
 * Pixel Tetsudo - Runtime Configuration
 * 
 * Centralized hardcoded mappings that govern system behavior at runtime.
 * All providers must read from this module; no copy-paste duplication.
 * 
 * Consumers:
 *   data-state.js        → TRUNK_MAIN_LINE_IDS
 *   data-fusion.js       → SOURCE_RAILWAY_CANONICAL_LINE, PRIORITY_OPS, STATION_ALIAS,
 *                          STATION_ALIAS_BY_RAILWAY, TRAIN_WARMUP_LINES, REFRESH_INTERVAL,
 *                          POSITION_INTERVAL
 *   odpt-unified.js      → API_RATE_LIMIT, API_MAX_CONCURRENCY, TT_TRUNCATE_LIMIT
 *   trains-page.js       → TRANSFER_MAX_ROWS
 */
(function() {
  "use strict";

  // ========== 线路层级 ==========

  /**
   * 干线本名（非運行系統）不进线路一览；数据保留作换乘锚点/支线父线。
   * 信越本線(分断)/東海道本線/東北本線 — 类比京沪铁路，不是运行系统。
   * 中央本線已独立 CO 卡（4.3.414），不在此列。
   */
  var TRUNK_MAIN_LINE_IDS = ["Shinetsu", "TokaidoMain", "Tohoku"];

  // ========== 直通运行 ==========

  /**
   * Provider railway identity -> canonical line identity.
   * This adapts an external source name only. It MUST NOT duplicate topology,
   * preference order, or through-service membership. Canonical throughServices
   * and serviceBoundaries own those network facts.
   */
  var SOURCE_RAILWAY_CANONICAL_LINE = {
    "SotetsuDirect": "SotetsuJRDirect"
  };

  /**
   * 时刻表按需加载优先运营商白名单。
   * 只有白名单内的 operator 才会触发 loadMissingTimetables 补拉。
   * JR-East 在 4.3.489 加入（地方线 ODPT 有 Railway 但无 Train/TT）。
   */
  var PRIORITY_OPS = [
    "JR-East", "TokyoMetro", "Toei", "YokohamaMunicipal", "Keio",
    "Sotetsu", "Tokyu", "Tobu", "TWR", "MIR", "TamaMonorail"
  ];

  /**
   * 实时位置覆盖策略（通用能力模型，不在融合算法中硬编码线路）。
   *
   * mode:
   *   FULL      - 已证明完整覆盖；禁止 timetable 生成/补充位置。
   *   HYBRID    - 历史兼容标签；不授权时刻表补位。
   *   SEGMENTED - 声明实时位置覆盖区间；不自动授权时刻表补位。
   *   COARSE    - 实时源只能给出粗粒度位置；不允许 timetable 替换
   *               同一列车已有的实时事实。
   *   UNKNOWN   - 覆盖能力未核实；禁止时刻表生成位置，必须显式指定来源。
   *
   * SEGMENTED fields:
   *   coveredSegments:  [{ fromStation, toStation }]  实时权威覆盖区间；区间内禁止 timetable 造位置。
   *   excludedSegments: [{ fromStation, toStation }]  已知实时缺口；缺口内允许 timetable 补位。
   * 区间仅用于标记 API 能力，不再授权时刻表位置回退。
   *
   * 合并不变量：
   *   1) 同一列车 realtime position 永远优先，timetable 只能补 metadata。
   *   2) HYBRID/UNKNOWN 不得默认补缺；仅明确无实时 API 的线路可授权 SQL 时刻表。
   *   3) SEGMENTED 的区间信息仅描述实时覆盖，不自动授权另一位置来源。
   *   4) COARSE 保留 realtime 为位置事实，不允许时刻表接管。
   *   5) running-chain 可跨覆盖边界传递 identity/service/destination 证据，不改变 positionSource。
   * 规则：线路事实只写配置；DataFusion/Estimator 不得按具体 lineId 写专属分支。
   */
  var REALTIME_POSITION_POLICY = {
    defaultMode: "UNKNOWN",
    staleAfterMs: 90000,
    lines: {
      "Asakusa": { mode: "FULL" },
      "Shinjuku": { mode: "FULL" },
      "Oedo": { mode: "FULL" },
      "Arakawa": { mode: "FULL" },
      "KeioMain": { mode: "FULL" },
      "KeioSagamihara": { mode: "FULL" },
      "KeioDobutsuen": { mode: "FULL" },
      "KeioNew": { mode: "FULL" },
      "KeioInokashira": { mode: "FULL" },
      "KeioKeibajo": { mode: "FULL" },
      "KeioTakao": { mode: "FULL" },
      "TobuSkytree": { mode: "FULL" },
      "TobuNoda": { mode: "FULL" },
      "Noda": { mode: "FULL" },
      "Tojo": { mode: "FULL" },
      "Ogose": { mode: "FULL" },
      "TobuDaishi": { mode: "FULL" },

      // Official source has insufficient positional granularity on part of this railway.
      "TobuKameido": { mode: "COARSE" },
    }
  };

  // ========== ODPT 站 ID 别名映射（补丁式修复，随发现持续追加）==========

  /**
   * 全局站 ID 别名：ODPT 驼峰/连字符/拼写差异 → 本地冻结站表 ID。
   * v4.3.416 起积累，每次全量通查后追加。项目数据冻结（Freeze），不在数据层修，
   * 仅在此匹配层做归一化转换。
   */
  var STATION_ALIAS = {
    "MusashiHikida": "Musashi-Hikida",
    "Minowabashi": "Sannomi_Bashi",
    "ArakawaItchumae": "Arakawa_Ichi_Mae",
    "Arakawakuyakushomae": "Arakawa_Kuyakusho_Mae",
    "ArakawaNichome": "Arakawa_Ni",
    "ArakawaNanachome": "Arakawa_Nana",
    "MachiyaEkimae": "Machiya_Eki_Mae",
    "MachiyaNichome": "Machiya_Ni",
    "HigashiOguSanchome": "Higashi_Oku_San",
    "Kumanomae": "Kuma_Mae",
    "Miyanomae": "Miyano_Mae",
    "Odai": "Kodai",
    "ArakawaYuenchimae": "Arakawa_Yuengiei_Mae",
    "ArakawaShakomae": "Arakawa_Shako_Mae",
    "Sakaecho": "Eimachi",
    "OjiEkimae": "Oji_Eki_Mae",
    "TakinogawaItchome": "Takino_Kawa_Ichome",
    "NishigaharaYonchome": "Nishi_Kbara_Yon",
    "ShinKoshinzuka": "Shin_Kosenzuka",
    "Koshinzuka": "Kosenzuka",
    "Sugamoshinden": "Sugamo_Shimmachi",
    "OtsukaEkimae": "Otsuka_Eki_Mae",
    "Mukohara": "Mukaiohara",
    "HigashiIkebukuroYonchome": "Higashi_Ikebukuro_Yon",
    "TodenZoshigaya": "Toei_Zoshigaya",
    "Kishibojimmae": "Onishimogami_Mae",
    "Gakushuinshita": "Gakuin_Mae",
    "Kasumigaseki": "Kasumigaseki-Tojo",
    "Shimbamba": "Shin-Baba",
    "Umeyashiki": "Umayabashi",
    "Futamatashimmachi": "Futamata-Shinmachi",
    "KasaiRinkaiPark": "Kasai-Rinkai-Koen",
    "KitaKonosu": "Kita-Kounosu",
    "ShinNihombashi": "Shin-Nihonbashi",
    "Ozaku": "Kosaku",
    "Kawasakidaishi": "Kawasaki_Daishi",
    "YrpNobi": "YRP-Nohbi",
    "Misakiguchi": "Misasaki-Guchi",
    "ShimMatsudo": "Shin-Matsudo",
    "HanedaAirportTerminal1and2": "Haneda-Kuko-T1T2",
    "Yaita": "Yaida",
    "Konosu": "Kounosu",
    "Kojimashinden": "Kojima_Shinden",
    "Jimmuji": "Jinmuji",
    "Ryugasakishi": "Ryugasaki",
    "Omurai": "Komura_i",
    "ShimMisato": "Shin-Misato",
    "Kojiya": "Kokuji",
    "Motohasunuma": "Hon-Hasuneuma",
    "Daishimae": "Daishi_Mae",
    "Hamura": "Hamu",
    "HanedaAirportTerminal3": "Haneda-Kuko-T3",
    "Suzukicho": "Suzukimachi",
    "Daishibashi": "Daishi_Bashi",
    "MinamiSendai": "Minami-Sendai",
    "HigashiAbiko": "Higashi-Abiko",
    "ShimosaManzaki": "Shimosa-Manzaki",
    "NaritaAirportTerminal2and3": "Airport-Terminal-2",
    "NaritaAirportTerminal1": "Narita-Airport",
    "NaritaAirportTerminal2": "Airport-Terminal-2",
    "HamaKawasaki": "Hama-Kawasaki"
  };

  /**
   * Railway 感知别名：ODPT 同名站 ID 在不同线路指向不同本地站，需按 railway 区分。
   * Oyama（Tojo=大山/Ooyama, Utsunomiya=小山/Oyama）双义。
   * Kohoku（NipporiToneri=江北/Kohoku, NaritaAbikoBranch=湖北/Kohoku-Narita）双义。
   */
  var STATION_ALIAS_BY_RAILWAY = {
    "Tojo": { "Oyama": "Ooyama" },
    "NaritaAbikoBranch": { "Kohoku": "Kohoku-Narita" }
  };

  // ========== 性能调优参数 ==========

  /** ODPT API 最小请求间隔（毫秒）。实测 12 并发无间隔全 200（248ms），原 1000ms 串行放大 40 倍。v4.3.395 */
  var API_RATE_LIMIT = 150;

  /** ODPT API 每域最大并发数（滑动窗口）。实测 12 并发稳定。 */
  var API_MAX_CONCURRENCY = 3;

  /** ODPT 时刻表单请求 1000 条硬上限。恰 1000 条 = 截断信号，按日历拆分重拉合并。v4.3.589 */
  var TT_TRUNCATE_LIMIT = 1000;

  /** 时刻表按需加载批量上限。ODPT 150ms 间隔 × 3 并发，24 条约 1 秒完成。v4.3.446 */
  var TIMETABLE_LOAD_BATCH = 24;

  /** 实时数据轮询间隔（毫秒）。 */
  var REFRESH_INTERVAL = 15000;

  /** 列车位置轮询间隔（毫秒）。比延误轮询慢，位置变化频率较低。 */
  var POSITION_INTERVAL = 60000;

  // ========== ODPT 缓存 / 轮询 / 存储 key 规则 ==========

  /** 时刻表 IDB 主键（新版 v6） */
  var ODPT_TIMETABLE_CACHE_KEY = 'odpt_timetable_cache_v6';

  /** 旧 localStorage 缓存 key（v3，迁移后清除） */
  var ODPT_LEGACY_LS_CACHE_KEY = 'odpt_timetable_cache_v3';

  /** 时刻表缓存 TTL（毫秒，24h） */
  var ODPT_TIMETABLE_CACHE_TTL = 86400000;

  /** ODPT_TT_PROBED 持久化 key（localStorage，24h 滑动 TTL） */
  var ODPT_TT_PROBED_KEY = 'odpt_tt_probed_v1';

  /** ODPT_TT_PROBED TTL（毫秒，24h） */
  var ODPT_TT_PROBED_TTL = 86400000;

  /** 实时数据轮询间隔（毫秒，ODPTClient 后台刷新） */
  var ODPT_REALTIME_INTERVAL = 30000;

  /** DataLayer 内存缓存条目上限 */
  var DATA_LAYER_MAX_CACHE_SIZE = 50;

  /** DataLayer 内存缓存 TTL（毫秒） */
  var DATA_LAYER_CACHE_TTL = 60000;

  /** trains 页后台预加载线路白名单（用户高频切换的线路）。打开 trains.html 后 2 秒开始后台加载。 */
  var TRAIN_WARMUP_LINES = ['Yamanote', 'ChuoRapid', 'KeihinTohoku', 'Seibuen', 'Keikyu', 'Odawara'];

  // ========== UI 策略常量 ==========

  /** 换乘 chip 行数上限（per station）。v4.3.613: 2→3 行（JR 大站东京/新宿换乘超 8 条）；v4.3.849: 3→4 行（4×4=16 个图标上限，用户裁定）。 */
  var TRANSFER_MAX_ROWS = 4;

  window.RuntimeConfig = {
    // 线路层级
    TRUNK_MAIN_LINE_IDS: TRUNK_MAIN_LINE_IDS,
    // 直通运行
    SOURCE_RAILWAY_CANONICAL_LINE: SOURCE_RAILWAY_CANONICAL_LINE,
    PRIORITY_OPS: PRIORITY_OPS,
    REALTIME_POSITION_POLICY: REALTIME_POSITION_POLICY,
    // ODPT 站 ID 别名
    STATION_ALIAS: STATION_ALIAS,
    STATION_ALIAS_BY_RAILWAY: STATION_ALIAS_BY_RAILWAY,
    // 性能调优
    API_RATE_LIMIT: API_RATE_LIMIT,
    API_MAX_CONCURRENCY: API_MAX_CONCURRENCY,
    TT_TRUNCATE_LIMIT: TT_TRUNCATE_LIMIT,
    TIMETABLE_LOAD_BATCH: TIMETABLE_LOAD_BATCH,
    REFRESH_INTERVAL: REFRESH_INTERVAL,
    POSITION_INTERVAL: POSITION_INTERVAL,
    TRAIN_WARMUP_LINES: TRAIN_WARMUP_LINES,
    // ODPT 缓存 / 轮询 / 存储 key
    ODPT_TIMETABLE_CACHE_KEY: ODPT_TIMETABLE_CACHE_KEY,
    ODPT_LEGACY_LS_CACHE_KEY: ODPT_LEGACY_LS_CACHE_KEY,
    ODPT_TIMETABLE_CACHE_TTL: ODPT_TIMETABLE_CACHE_TTL,
    ODPT_TT_PROBED_KEY: ODPT_TT_PROBED_KEY,
    ODPT_TT_PROBED_TTL: ODPT_TT_PROBED_TTL,
    ODPT_REALTIME_INTERVAL: ODPT_REALTIME_INTERVAL,
    // DataLayer 缓存参数
    DATA_LAYER_MAX_CACHE_SIZE: DATA_LAYER_MAX_CACHE_SIZE,
    DATA_LAYER_CACHE_TTL: DATA_LAYER_CACHE_TTL,
    // UI 策略
    TRANSFER_MAX_ROWS: TRANSFER_MAX_ROWS
  };
})();
