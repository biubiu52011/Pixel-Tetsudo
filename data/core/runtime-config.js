/**
 * Pixel Tetsudo - Runtime Configuration
 * 
 * Centralized hardcoded mappings that govern system behavior at runtime.
 * All providers must read from this module; no copy-paste duplication.
 * 
 * Consumers:
 *   data-state.js        → TRUNK_MAIN_LINE_IDS
 *   data-fusion.js       → THROUGH_RAILWAY_FALLBACK, PRIORITY_OPS, STATION_ALIAS,
 *                          STATION_ALIAS_BY_RAILWAY, TRAIN_WARMUP_LINES, REFRESH_INTERVAL,
 *                          POSITION_INTERVAL
 *   odpt-unified.js      → API_RATE_LIMIT, API_MAX_CONCURRENCY, TT_TRUNCATE_LIMIT
 *   trains-page.js       → TRUNK_EXTENSION_ALLOW, TRANSFER_MAX_ROWS
 */
(function() {
  "use strict";

  // ========== 线路层级 ==========

  /**
   * 干线本名（非運行系統）不进线路一览；数据保留作换乘锚点/支线父线。
   * 信越本線(分断)/東海道本線/東北本線 — 类比京沪铁路，不是运行系统。
   * 中央本線已独立 CO 卡（4.3.414），不在此列。
   */
  var TRUNK_MAIN_LINE_IDS = ["Shinetsu", "TokaidoMain", "TohokuMain"];

  /**
   * 干线本名延伸白名单（显式登记，防止自动端点相接误判）。
   * 4.3.421：横須賀線誤延伸整条東海道本線 修复后改为空表，即不延伸任何干线本名。
   */
  var TRUNK_EXTENSION_ALLOW = {};

  // ========== 直通运行 ==========

  /**
   * 直通运行 railway → 归属优先表（跨 operator 放行）。
   * 解决：直通系统列车 fromStation 专属站，LINE_RAILWAY_CODE 反查无映射时 fallback "站数最多"
   * 导致误配（例：SotetsuDirect→Yamanote）。
   * 结构：exclude 排除环线；prefer 按优先级归属。
   */
  var THROUGH_RAILWAY_FALLBACK = {
    "SotetsuDirect": {
      exclude: ["Yamanote"],
      prefer: ["SotetsuShin-Yokohama", "Yokosuka", "Saikyo", "ShonanShinjuku"]
    }
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
   * Kohoku（Nippori_Toneri=江北/Kohoku, NaritaAbikoBranch=湖北/Kohoku-Narita）双义。
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
  var TRAIN_WARMUP_LINES = ['Yamanote', 'ChuoRapid', 'KeihinTohoku', 'SeibuEn', 'Keikyu', 'Odawara'];

  /**
   * 快速通过站白名单——route-search 计算时跳过这些站的停站+加减速时间（按 EXPRESS_PASS_RATIO 折扣）。
   * 数据源：各线公式停站表（wiki）。Joban=常磐快速 松戸〜柏 间ノンストップ（通过 亀有/馬橋/新松戸/北小金）。
   */
  var EXPRESS_SKIP_STATIONS = {
    'Joban': { 'Kameari': 1, 'Mabashi': 1, 'Shin-Matsudo': 1, 'Kita-Kogane': 1 }
  };

  // ========== UI 策略常量 ==========

  /** 换乘 chip 行数上限（per station）。v4.3.613: 2→3 行（JR 大站东京/新宿换乘超 8 条）；v4.3.849: 3→4 行（4×4=16 个图标上限，用户裁定）。 */
  var TRANSFER_MAX_ROWS = 4;

  window.RuntimeConfig = {
    // 线路层级
    TRUNK_MAIN_LINE_IDS: TRUNK_MAIN_LINE_IDS,
    TRUNK_EXTENSION_ALLOW: TRUNK_EXTENSION_ALLOW,
    // 直通运行
    THROUGH_RAILWAY_FALLBACK: THROUGH_RAILWAY_FALLBACK,
    PRIORITY_OPS: PRIORITY_OPS,
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
    // 快速通过站（route-search）
    EXPRESS_SKIP_STATIONS: EXPRESS_SKIP_STATIONS,
    // UI 策略
    TRANSFER_MAX_ROWS: TRANSFER_MAX_ROWS
  };
})();
