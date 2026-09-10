/*
 * Pixel Tetsudo - DataFusion v11 (Position Support)
 */
(function() {
  "use strict";

  var FUSION_VERSION = 11;
  var REFRESH_INTERVAL = 15000;
  var POSITION_INTERVAL = 60000;

  var odptData = { trains: {}, delayInfo: {}, realtimePositions: {} };
  // v4.3.405: 官方源（小田急/ゆりかもめ）delayInfo——按 line.id 直查，优先级高于 ODPT
  var officialData = { delayInfo: null };
  var subscribers = [];
  var localData = { lines: {}, statusMap: {} };
  var _lastFusedData = null;
  var _lineControlVersion = null;
  var _positionTimer = null;
  var _initialized = false;
  var _refreshTimer = null;
  var _cacheTimer = null;

  // ========== Station coordinate matching ==========
  function findStationIndex(line, lat, lon) {
    try {
      if (!line || !line.stations || !window.STATION_COORDS) return 0;
      var bestIdx = 0;
      var bestDist = Infinity;
      for (var i = 0; i < line.stations.length; i++) {
        var stName = line.stations[i];
        var coords = window.STATION_COORDS[stName];
        if (!coords) continue;
        var dlat = lat - coords[0];
        var dlon = lon - coords[1];
        var dist = dlat * dlat + dlon * dlon;
        if (dist < bestDist) { bestDist = dist; bestIdx = i; }
      }
      return bestIdx;
    } catch(e) { return 0; }
  }

  // ========== Data Loading ==========
  function emitUpdate(fusedData) {
    if (fusedData) { _lastFusedData = fusedData; }
    try { subscribers.forEach(function(cb) { cb(fusedData); }); } catch(e) { console.debug("[DataFusion] Subscriber error:", e.message); }
    try { window.DATA_FUSION = fusedData; } catch(e) {}
  }

  function subscribe(callback) {
    if (typeof callback !== "function") return function() {};
    subscribers.push(callback);
    var existing = window.DATA_FUSION || _lastFusedData;
    if (existing) { try { callback(existing); } catch(e) { console.debug("[DataFusion] Immediate callback error:", e.message); } }
    return function unsubscribe() { var idx = subscribers.indexOf(callback); if (idx >= 0) subscribers.splice(idx, 1); };
  }

  function loadLocalData() {
    try { localData = window.LOCAL_RAILWAY_DATA || { lines: {}, statusMap: {} }; } catch(e) { localData = { lines: {}, statusMap: {} }; }
  }

  function syncStatusMap() {
    try {
      var allLines = (window.DataLayer && window.DataLayer.getAllLines) ? window.DataLayer.getAllLines() : (window.UNIFIED_LINES || {});
      if (!allLines || Object.keys(allLines).length === 0) return;
      var statusMap = localData.statusMap || {};
      Object.keys(allLines).forEach(function(id) {
        if (!statusMap[id]) statusMap[id] = { status: "normal", maxDelay: 0, interval: null, cause: null };
      });
      localData.statusMap = statusMap;
    } catch(e) {}
  }

  function checkCacheStale() {
    try {
      var rdbLines = (window.DataLayer && window.DataLayer.getAllLines) ? window.DataLayer.getAllLines() : (window.UNIFIED_LINES || {});
      if (!rdbLines || Object.keys(rdbLines).length === 0) return;
      var currentVersion = Object.keys(rdbLines).length;
      if (_lineControlVersion !== null && _lineControlVersion !== currentVersion) { _lastFusedData = null; }
      _lineControlVersion = currentVersion;
    } catch(e) {}
  }

  function getOperatorForLine(lineId, lineName) {
    try {
      if (!window.ODPTClient || !window.ODPTClient.LINE_TO_OPERATOR) return null;
      return window.ODPTClient.LINE_TO_OPERATOR[lineId] || window.ODPTClient.LINE_TO_OPERATOR[lineName] || null;
    } catch(e) { return null; }
  }

  function parseODPTDelay(raw) {
    var result = { status: "normal", maxDelay: 0, interval: null, cause: null };
    if (!raw) return result;
    try {
      // v4.3.388: 权威状态字段优先（odpt:trainInformationStatus: Delay/Suspension/Normal）
      // v4.3.430: 字段可为对象 {ja:"自由文本"}（如 直通運転中止/運転見合わせ）——提取，标准枚举直接采用，自由文本并入 text 统一判定
      var _stRaw = raw["odpt:trainInformationStatus"];
      var _stF = "";
      if (_stRaw != null) {
        if (typeof _stRaw === "string") _stF = String(_stRaw).split(":").pop();
        else if (typeof _stRaw === "object") _stF = (_stRaw.ja || _stRaw.en || _stRaw.zh || "");
      }
      if (_stF === "Suspension") result.status = "suspended";
      else if (_stF === "Delay") result.status = "delayed";
      // Direct delay field first: odpt:Train responses carry odpt:delay (minutes)
      if (raw["odpt:delay"] != null) {
        var dMin0 = parseInt(raw["odpt:delay"], 10);
        if (!isNaN(dMin0) && dMin0 > 0) { result.status = "delayed"; result.maxDelay = dMin0; }
      }
      var ti = raw["odpt:trainInformationText"] || "";
      var text = typeof ti === "string" ? ti : (typeof ti === "object" && ti !== null ? (ti.ja || ti.en || ti.zh || JSON.stringify(ti)) : "");
      // v4.3.430: 状态字段为自由文本（非标准枚举）时并入 text 统一判定（如 直通運転中止）
      if (_stF && _stF !== "Normal" && _stF !== "Suspension" && _stF !== "Delay" && !/^odpt\./.test(_stF)) {
        text = (text ? text + "\u3002" : "") + _stF;
      }
      // v4.3.390: 结构化字段优先（ODPT v4 schema 提供 Cause/Range/stationFrom/stationTo/resumeEstimate）
      var _cF = raw["odpt:trainInformationCause"];
      if (_cF != null) {
        var _cS = typeof _cF === "string" ? _cF : (_cF.ja || _cF.en || "");
        if (_cS) result.cause = _cS;
      }
      if (!result.interval) {
        var _rF = raw["odpt:trainInformationRange"];
        if (_rF != null) {
          var _rS = typeof _rF === "string" ? _rF : (_rF.ja || _rF.en || "");
          if (_rS) result.interval = _rS;
        }
      }
      if (!result.interval) {
        var _fS = raw["odpt:stationFrom"];
        var _tS = raw["odpt:stationTo"];
        if (_fS || _tS) {
          var _fId = _fS ? extractRailwayShort({ "odpt:railway": _fS }) : "";
          var _tId = _tS ? extractRailwayShort({ "odpt:railway": _tS }) : "";
          var _fN = _fId, _tN = _tId;
          try {
            if (_fId && window.RailwayDB && window.RailwayDB.resolveStationName) _fN = window.RailwayDB.resolveStationName(_fId) || _fId;
            if (_tId && window.RailwayDB && window.RailwayDB.resolveStationName) _tN = window.RailwayDB.resolveStationName(_tId) || _tId;
          } catch(e) {}
          if (_fN && _tN) result.interval = _fN + "\u2192" + _tN;
          else if (_fN) result.interval = _fN + "\u65b9\u9762";
          else if (_tN) result.interval = _tN + "\u65b9\u9762";
        }
      }
      var _rs = raw["odpt:resumeEstimate"];
      if (_rs) {
        var _rm = String(_rs).match(/(\d{2}):(\d{2})/);
        if (_rm) result.resume = _rm[1] + ":" + _rm[2];
      }
      if (!text) return result;
      // v4.3.389: 保留原文全文（弹窗直接显示，不依赖碎片解析）
      result.detail = text;
      // 状态字段缺失/为 Normal 时用文本关键词补充（ダイヤ乱れ = 遅延）
      if (result.status === "normal") {
        // v4.3.392: 否定句排除——「現在、１５分以上の遅延はありません/遅延なし/平常運転」不是延误
        // v4.3.401: 恢复完成式排除——「運転を見合わせていましたが…再開しました/運転を再開しました」= 已恢复，不是運休
        // v4.3.428: 删除裸"運転再開"——「運転再開は7時30分頃を見込んでいます」（未来将恢复）≠ 已恢复，不得跳过中断判定
        var _neg = /\u3042\u308a\u307e\u305b\u3093|\u3054\u3056\u3044\u307e\u305b\u3093|\u306a\u3057|\u89e3\u6d88|\u5e73\u5e38\u904b\u8ee2|\u5e73\u5e38\u904b\u884c|\u5e73\u5e38\u3067\u3059|\u9589\u9381|\u518d\u958b\u3057\u307e\u3057\u305f|\u3092\u518d\u958b/.test(text);
        if (!_neg) {
          // v4.3.430: 直通终止/他线影响引述 ≠ 本线中断——直通对象线停运、本线折返/站台拥堵 = 运行情报（！）
          // 例：武蔵野線"京葉線内での信号確認の影響で…直通運転を中止"→ notice；内房線"…運転を見合わせます"→ suspended
          var _otherImpact = /(?:\u7dda\u5185\u3067\u306e|\u7dda\u306e\u904b\u8ee2\u898b\u5408\u308f\u305b|\u904b\u8ee2\u898b\u5408\u308f\u305b\u306e\u5f71\u97ff|\u904b\u8ee2\u898b\u5408\u308f\u305b\u306b\u4f34\u3044|\u306e\u5f71\u97ff\u3067)/.test(text) && !/(?:\u5f53\u7dda|\u81ea\u7dda|\u672c\u7dda|\u5168\u7dda|\u4e0a\u4e0b\u7dda).*(?:\u898b\u5408\u308f\u305b|\u4e2d\u6b62)/.test(text);
          var _diversion = /\u76f4\u901a\u904b\u8ee2\u3092\u4e2d\u6b62|\u76f4\u901a\u904b\u8ee2\u4e2d\u6b62|\u6298\u308a\u8fd4\u3057\u904b\u8ee2|\u6298\u8fd4\u3057\u904b\u8ee2|\u30db\u30fc\u30e0\u304c\u6df7\u96d1|\u99c5\u69cb\u5185\u304c\u6df7\u96d1/.test(text);
          if (_otherImpact || _diversion) {
            result.status = "notice";
          } else if (text.indexOf("\u898b\u5408\u308f\u305b") >= 0 || text.indexOf("\u904b\u8ee2\u3092\u4e2d\u6b62") >= 0 || text.indexOf("\u5168\u7dda\u904b\u4f11") >= 0 || text.toLowerCase().indexOf("suspended") >= 0) result.status = "suspended";
          else if (text.indexOf("\u904b\u5ef6") >= 0 || text.indexOf("\u9045\u5ef6") >= 0 || text.indexOf("\u9045\u308c") >= 0 || text.indexOf("\u904b\u308c") >= 0 || text.indexOf("\u4e71\u308c") >= 0 || text.toLowerCase().indexOf("delay") >= 0) result.status = "delayed";
          else if (text.indexOf("\u7d42\u4e86") >= 0 || text.toLowerCase().indexOf("finished") >= 0) result.status = "suspended";
          // v4.3.426: 有实质运行通知 → notice（黄色感叹号）
          // v4.3.429: 收紧——字段 Normal 时仅"明确通知类"文本才标！，其余跟随字段显示正常（权威字段主导，避免文本兜底占领）
          if (result.status === "normal" && /\u904b\u4f11|\u6642\u523b\u5909\u66f4|\u30e1\u30f3\u30c6\u30ca\u30f3\u30b9|\u5de5\u4e8b|\u70b9\u691c|\u81e8\u6642\u5217\u8eca|\u632f\u66ff\u8f38\u9001|\u4ee3\u884c\u8f38\u9001|\u304a\u77e5\u3089\u305b/.test(text)) result.status = "notice";
        }
      }
      // 延迟分钟：排除时刻（18時08分頃 的 "08分" 不是延迟）
      var m = text.match(/(?:\u7d04|\u304a\u3088\u305d)?\s*(\d{1,3})\s*(?:\u5206\u9593|\u5206|min)(?!\u9803|\u5f8c|\u4ee5)/i);
      if (m) result.maxDelay = parseInt(m[1], 10);
      // 区间（文本回退，仅字段缺失时）：站间（A〜B）优先；其次"○○線内"（如 京急線内）
      if (!result.interval) {
        var im = text.match(/([^\s\-。，,、]+?)\s*[\u301c\uff5e\uff0d\u2212\u81f3\u2192-]\s*([^\s\-。，,、]+?)(?:\u99c5|\u9593|(?=[。，,、\s]))/);
        if (im) result.interval = im[1] + "\u2192" + im[2];
        else {
          var inM = text.match(/([^\s。，,、]{1,8}?\u7dda\u5185)/);
          if (inM) result.interval = inM[1];
        }
      }
      // 原因（文本回退，仅字段缺失时）：优先"発生した/発生し"之后，其次通用模式
      if (!result.cause) {
        var cm = text.match(/(?:\u767a\u751f\u3057\u305f|\u767a\u751f\u3057)([^。\n，,、\s\u3067\u301c\uff5e\uff0d\u2212\u81f3\u2192-]+?)(?:\u306e\u305f\u3081|\u306e\u5f71\u97ff|\u306b\u3088\u308a|\u306b\u3088\u308b)/);
        if (!cm) cm = text.match(/(?:\u3067|、|，|,|\s|^)([^。\n，,、\s\u3067\u301c\uff5e\uff0d\u2212\u81f3\u2192-]+?)(?:\u306e\u305f\u3081|\u306e\u5f71\u97ff|\u306b\u3088\u308a|\u306b\u3088\u308b|\u304c\u539f\u56e0|\u306e\u767a\u751f|\u306b\u4f34\u3044)/);
        if (cm && cm[1]) result.cause = cm[1];
      }
    } catch(e) {}
    return result;
  }

  // ========== v4.3.386: TrainInformation full-record matching ==========
  // ODPT "odpt.Railway:TokyoMetro.Ginza" -> "Ginza"
  function extractRailwayShort(rec) {
    try {
      var rw = (rec && rec["odpt:railway"]) || "";
      if (!rw) return "";
      var parts = String(rw).split(":");
      if (parts.length < 2) return "";
      var dots = parts[parts.length - 1].split(".");
      return dots[dots.length - 1] || "";
    } catch(e) { return ""; }
  }

  // v4.3.391: 聚合只接受无 railway 归属的记录（全网/多线报文）。
  // 有 odpt:railway 的记录专属其线——不得把 A 线的报文聚合显示到 B 线弹窗
  // （修复：都営新宿線无记录时误显浅草線报文）。
  function aggregateDelayRecords(records) {
    var rank = { suspended: 3, delayed: 2, normal: 1 };
    var worst = null;
    for (var i = 0; i < records.length; i++) {
      if (!records[i]) continue;
      if (extractRailwayShort(records[i])) continue;
      var parsed = parseODPTDelay(records[i]);
      if (!worst || (rank[parsed.status] || 0) > (rank[worst.status] || 0)) worst = parsed;
    }
    return worst;
  }

  function getApiDelayInfo(line) {
    try {
      // v4.3.405: 官方源优先——按 line.id 直查（小田急 3 线 / ゆりかもめ）
      if (officialData.delayInfo && line && line.id && officialData.delayInfo[line.id]) {
        return officialData.delayInfo[line.id];
      }
      var op = getOperatorForLine(line.id, line.name);
      if (!odptData.delayInfo || !op) return null;
      var norm = TransitConstants && typeof TransitConstants.normalizeOp === "function" ? TransitConstants.normalizeOp(op) : op;
      var raw = odptData.delayInfo[norm] || odptData.delayInfo[op];
      if (!raw) return null;
      // v4.3.386: full-record array (one per running system) -> match by line's ODPT railway code
      if (Array.isArray(raw)) {
        if (raw.length === 0) return null;
        var code = line.id;
        if (window.ODPTClient && window.ODPTClient.LINE_RAILWAY_CODE && window.ODPTClient.LINE_RAILWAY_CODE[line.id]) {
          code = window.ODPTClient.LINE_RAILWAY_CODE[line.id];
        }
        var matched = null;
        for (var i = 0; i < raw.length; i++) {
          if (!raw[i]) continue;
          var shortCode = extractRailwayShort(raw[i]);
          if (shortCode && String(shortCode).toLowerCase() === String(code).toLowerCase()) {
            matched = raw[i];
            break;
          }
        }
        if (matched) return parseODPTDelay(matched);
        // no own record -> aggregate worst state of this operator (no loss, no false normal)
        return aggregateDelayRecords(raw);
      }
      // legacy single-record path
      return parseODPTDelay(raw);
    } catch(e) { return null; }
  }


  function fuseLine(lineId) {
    try {
      var line = (window.DataLayer && window.DataLayer.getLine ? window.DataLayer.getLine(lineId) : null) || (localData.lines && localData.lines[lineId]) || (window.UNIFIED_LINES && window.UNIFIED_LINES[lineId]) || null;
      if (!line) return null;
      // v4.3.398: localData 兜底对象可能缺 id 字段——补齐，否则 getApiDelayInfo 的
      // railway code 匹配（code=line.id）得到 undefined，matched 永远失败 → 有归属延误记录
      // 全部走聚合→null→误判 normal（4.3.391 聚合收紧后即出现此回归）
      if (!line.id) line.id = lineId;
      var apiInfo = getApiDelayInfo(line);
      var localStatus = localData.statusMap && localData.statusMap[lineId];
      // v4.3.386: effective local status only (default-normal init must not mask missing source)
      var _hasLocal = !!(localStatus && (localStatus.status !== "normal" || (localStatus.maxDelay || 0) > 0 || localStatus.interval || localStatus.cause));
      var fallbackDelay = { status: "no_odpt", maxDelay: 0, interval: null, cause: null };
      try {
        var _opLine = window.ODPTClient && window.ODPTClient.LINE_TO_OPERATOR ? (window.ODPTClient.LINE_TO_OPERATOR[lineId] || window.ODPTClient.LINE_TO_OPERATOR[line.name]) : null;
        if (_opLine && window.ODPTClient.supports && window.ODPTClient.supports(_opLine, 'trainInformation')) {
          // v4.3.394: 三态 fallback——获取失败(null)→情報なし(no_odpt)；尚未完成首次加载(undefined)→情報取得中(loading)；成功但无记录→正常(normal)。绝不把"还在加载"伪装成"正常"
          var _opKey = TransitConstants && typeof TransitConstants.normalizeOp === "function" ? TransitConstants.normalizeOp(_opLine) : _opLine;
          var _opState = odptData.delayInfo && _opKey ? odptData.delayInfo[_opKey] : undefined;
          var _opFailed = _opState === null;
          var _opLoading = _opState === undefined;
          fallbackDelay = _opFailed ? { status: "no_odpt", maxDelay: 0, interval: null, cause: null }
            : (_opLoading ? { status: "loading", maxDelay: 0, interval: null, cause: null }
              : { status: "normal", maxDelay: 0, interval: null, cause: null });
        }
      } catch(_e) {}
      var delayInfo = apiInfo || (_hasLocal && { status: localStatus.status, maxDelay: localStatus.maxDelay, interval: localStatus.interval, cause: localStatus.cause }) || fallbackDelay;
      // Attach running-chain resolution context (transient, not persistent)
      var _chainCtx = null;
      try {
        if (window.RunningChainResolver && window.UNIFIED_LINES) {
          _chainCtx = window.RunningChainResolver.getResolutionContext(lineId, Object.keys(window.UNIFIED_LINES));
        }
      } catch(_e) {}
      var _chainMeta = _chainCtx ? {
        chainIdentity: _chainCtx.identity,
        chainConfidence: _chainCtx.confidence,
        chainReason: _chainCtx.reason,
        isThroughService: _chainCtx.isThroughService,
        isAlias: _chainCtx.isAlias,
        isBranch: _chainCtx.isBranch,
        relatedLines: _chainCtx.relatedLines || [],
        throughServiceGroup: _chainCtx.throughServiceGroup || null
      } : null;
      return { id: lineId, name: line.name, nameEn: line.nameEn || line.name, code: line.code, color: (window.LineOperationSystemsResolveColor && window.LineOperationSystemsResolveColor(lineId)) || line.color, operator: line.operator, region: line.region, type: line.type, image: line.image, stations: line.stations || [], durations: line.durations || [], intervalTotal: line.durationTotalMin || 0, realtimePositions: odptData.realtimePositions[lineId] || [], delayInfo: delayInfo, branchOf: line.branchOf || null, isSixShapedLoop: line.isSixShapedLoop === true, isDoubleColumnLoop: line.isDoubleColumnLoop === true, loopJunction: line.loopJunction || null, _chainMeta: _chainMeta };
    } catch(e) { console.debug("[DataFusion] fuseLine error for " + lineId + ":", e.message); return null; }
  }

  function fuseAll() {
    try {
      var fusedLines = {};
      var allLineIds = {};
      var dlLines = (window.DataLayer && window.DataLayer.getAllLines) ? window.DataLayer.getAllLines() : null;
      if (dlLines) Object.keys(dlLines).forEach(function(k) { allLineIds[k] = true; });
      if (window.UNIFIED_LINES) Object.keys(window.UNIFIED_LINES).forEach(function(k) { allLineIds[k] = true; });
      if (localData.lines) Object.keys(localData.lines).forEach(function(k) { allLineIds[k] = true; });
      Object.keys(allLineIds).forEach(function(lineId) {
        var fused = fuseLine(lineId);
        if (fused) fusedLines[fused.id] = fused;
      });
      var fusedData = { version: FUSION_VERSION, timestamp: new Date().toISOString(), lines: fusedLines, lineOrder: (window.LinePresentationService && (dlLines || window.UNIFIED_LINES)) ? window.LinePresentationService.getDisplayOrder(dlLines || window.UNIFIED_LINES) : Object.keys(allLineIds), odptOperatorsLoaded: Object.keys(odptData.delayInfo).length, totalLines: Object.keys(allLineIds).length };
      emitUpdate(fusedData);
      return fusedData;
    } catch(e) { console.error("[DataFusion] fuseAll error:", e.message); if (_lastFusedData) { emitUpdate(_lastFusedData); return _lastFusedData; } return null; }
  }

  // v4.3.416: ODPT 站 ID 与项目站表拼写差异别名（项目冻结数据不动，仅匹配层转换）
  // 五日市線 武蔵引田：ODPT MusashiHikida（官方罗马音 Hikida）→ 项目 Musashi-Hikita（历史拼写 d/t 混淆，冻结待用户决定是否修数据）
  // v4.3.472: 都電荒川線 26 站——ODPT 驼峰 ID vs 本地下划线 ID 命名体系不同，导致 17 条 odpt:Train 仅 Kajiwara/Asukayama/Waseda 3 站命中（页面只显示 2 条实时列车）
  // v4.3.473: 面影橋 Freeze 例外——本地第 29 站 Kataomo_Bashi(片倉橋) 已正名为 Omokagebashi(面影橋)，Omokagebashi 别名随之移除（站 ID 现已直接一致）
  var STATION_ALIAS = {
    "MusashiHikida": "Musashi-Hikida", // v4.3.475: 本地站 ID 已正名 Musashi-Hikida（ODPT MusashiHikida 驼峰→本地连字符，语义同值）
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
    // v4.3.474: 全量通查（白天 621 条 odpt:Train）追加 14 条命名映射——
    // 东武东上/京急/京叶/高崎/总武快速/青梅/武藏野/常磐缓行 等站 ID 拼写差异
    // （Oyama 不在此列：Tojo 大山与 Utsunomiya 小山共用 ODPT ID，走下方 STATION_ALIAS_BY_RAILWAY）
    "Kasumigaseki": "Kasumigaseki-Tojo",     // Tobu Tojo 霞ヶ関（本地加线后缀防冲突）
    "Shimbamba": "Shin-Baba",                // Keikyu Main 新馬場
    "Umeyashiki": "Umayabashi",              // Keikyu Main 梅屋敷（本地 ID 误拼，alias 兜底）
    "Futamatashimmachi": "Futamata-Shinmachi", // JR Keiyo 二俣新町
    "KasaiRinkaiPark": "Kasai-Rinkai-Koen",  // JR Keiyo 葛西臨海公園
    "KitaKonosu": "Kita-Kounosu",            // JR Takasaki 北鴻巣
    "ShinNihombashi": "Shin-Nihonbashi",     // JR SobuRapid 新日本橋
    "Ozaku": "Kosaku",                       // JR Ome 小作（ODPT Ozaku 旧式拼写）
    "Kawasakidaishi": "Kawasaki_Daishi",     // Keikyu Daishi 川崎大師
    "YrpNobi": "YRP-Nohbi",                  // Keikyu Kurihama YRP野比
    "Misakiguchi": "Misasaki-Guchi",         // Keikyu Kurihama 三崎口（本地 ID 误拼，alias 兜底）
    "ShimMatsudo": "Shin-Matsudo",           // JR Musashino/JobanLocal 新松戸
    "HanedaAirportTerminal1and2": "Haneda-Kuko-T1T2", // Keikyu Airport 羽田空港第1・第2ターミナル
    // v4.3.474 追加（第 2 批，全量通查继续暴露）
    "Yaita": "Yaida",                        // JR Utsunomiya 矢板（本地 ID 误拼 Yaida，alias 兜底）
    "Konosu": "Kounosu",                     // JR Takasaki 鴻巣
    "Kojimashinden": "Kojima_Shinden",       // Keikyu Daishi 小島新田
    "Jimmuji": "Jinmuji",                    // Keikyu Zushi 神武寺（ODPT Jimmuji 误拼）
    "Ryugasakishi": "Ryugasaki",             // JR Joban 龍ケ崎市
    "Omurai": "Komura_i",                    // Tobu Kameido 小村井
    "ShimMisato": "Shin-Misato",             // JR Musashino 新三郷（ODPT Shim 少 n）
    "Kojiya": "Kokuji",                      // Keikyu Airport 糀谷（本地 ID 误拼，alias 兜底）
    "Motohasunuma": "Hon-Hasuneuma",         // Toei Mita 本蓮沼（本地 ID 误拼，alias 兜底）
    "Daishimae": "Daishi_Mae",               // Tobu Daishi 大師前
    "Hamura": "Hamu",                        // JR Ome 羽村（本地 ID 截断误拼，alias 兜底）
    "HanedaAirportTerminal3": "Haneda-Kuko-T3", // Keikyu Airport 羽田空港第3ターミナル
    "Suzukicho": "Suzukimachi",              // Keikyu Daishi 鈴木町（本地 ID 误拼，alias 兜底）
    "Daishibashi": "Daishi_Bashi",           // Keikyu Daishi 大師橋
    // v4.3.479: 常磐線仙台側・東金線・成田線支線・南武線浜川崎支線（ODPT 驼峰/同值差异）
    "MinamiSendai": "Minami-Sendai",          // JR Joban 南仙台
    "HigashiAbiko": "Higashi-Abiko",          // JR NaritaAbikoBranch 東我孫子
    "ShimosaManzaki": "Shimosa-Manzaki",      // JR NaritaAbikoBranch 下総松崎
    "NaritaAirportTerminal2and3": "Airport-Terminal-2", // JR NaritaAirportBranch 空港第２ビル（京成共用物理站）
    "NaritaAirportTerminal1": "Narita-Airport",          // JR NaritaAirportBranch 成田空港（京成共用物理站）
    "HamaKawasaki": "Hama-Kawasaki"           // JR NambuBranch 浜川崎（Tsurumi 共用站）
  };
  // v4.3.474: railway 感知别名（优先于全局 STATION_ALIAS）——ODPT 同名站 ID 在不同线指向不同本地站
  // Oyama：Tojo=大山(本地 Ooyama) / Utsunomiya=小山(本地 Oyama)，必须按 railway 区分
  // v4.3.479: Kohoku——Nippori_Toneri=江北(本地 Kohoku) / NaritaAbikoBranch=湖北(本地 Kohoku-Narita 分 ID)
  var STATION_ALIAS_BY_RAILWAY = {
    "Tojo": { "Oyama": "Ooyama" },
    "NaritaAbikoBranch": { "Kohoku": "Kohoku-Narita" }
  };

  // v4.3.494: 直通系统（ODPT 独立 railway 推送、本地无同名线）的列车归属表。
  // 根因: 相鉄直通(SotetsuDirect)列车 railway=JR-East.SotetsuDirect, fromStation 为专属站 ID
  //   (Osaki/武蔵小杉/西大井/羽沢横浜国大) —— 本地无 SotetsuDirect 线 → 反查无映射 →
  //   fallback 站数最多 → Yamanote(30站) 误配山手线详情图。
  // 处理: prefer 顺序选择归属线(跨 operator 放行 SotetsuShin-Yokohama), exclude 排除环线。
  var THROUGH_RAILWAY_FALLBACK = {
    "SotetsuDirect": {
      exclude: ["Yamanote"],
      prefer: ["SotetsuShin-Yokohama", "Yokosuka", "Saikyo", "ShonanShinjuku"]
    }
  };

  function loadTrainPositions() {
    try {
      var positionSource = window.ODPT_TRAIN_POSITIONS || window.ODPT_TRAINS;
      if (!positionSource) return;
      var allLines = (window.DataLayer && window.DataLayer.getAllLines) ? window.DataLayer.getAllLines() : (window.UNIFIED_LINES || {});
      if (!allLines || Object.keys(allLines).length === 0) {
        // v4.3.413: DataLayer/UNIFIED_LINES 未就绪时延迟重试（最多 30 次），
        // 避免 ODPT 列车位置先于线路数据到达导致静默 return、实时位置永久丢失
        if (!loadTrainPositions._retry) loadTrainPositions._retry = 0;
        if (loadTrainPositions._retry < 30) {
          loadTrainPositions._retry++;
          setTimeout(loadTrainPositions, 300);
        }
        return;
      }
      loadTrainPositions._retry = 0;
      var posMap = {};
      odptData.trains = {};
      Object.keys(window.ODPT_TRAINS).forEach(function(op) {
        var trains = window.ODPT_TRAINS[op] || [];
        odptData.trains[op] = trains;
        var top = TransitConstants && typeof TransitConstants.normalizeOp === "function" ? TransitConstants.normalizeOp(op) : op;
        trains.forEach(function(t) {
          if (!t) return;
          var fromId = t["odpt:fromStation"] || "";
          var stationKey = String(fromId).split(".").pop();
          if (!stationKey) return;
          var railway = t["odpt:railway"] || "";
          var railwayName = "";
          if (railway) {
            var railParts = String(railway).split(":");
            railwayName = railParts.length > 1 ? railParts[railParts.length - 1] : String(railway);
          }
          // v4.3.416: 别名转换（ODPT 拼写差异站 ID → 项目站表 ID）
          // v4.3.474: railway 感知别名优先（Oyama=Tojo 大山/Oyama=Utsunomiya 小山 双义），再回退全局
          if (STATION_ALIAS_BY_RAILWAY[railwayName] && STATION_ALIAS_BY_RAILWAY[railwayName][stationKey]) {
            stationKey = STATION_ALIAS_BY_RAILWAY[railwayName][stationKey];
          } else if (STATION_ALIAS[stationKey]) {
            stationKey = STATION_ALIAS[stationKey];
          }
          var delayMin = t["odpt:delay"] != null ? (parseInt(t["odpt:delay"], 10) || 0) : 0;
          var trainId = t["odpt:trainNumber"] || t["odpt:train"] || "";
          var railDirection = t["odpt:railDirection"] || "";
          var directionName = "";
          if (railDirection) {
            var dirParts = String(railDirection).split(":");
            directionName = dirParts.length > 1 ? dirParts[dirParts.length - 1] : String(railDirection);
          }
          // v4.3.454: 终点站提取（odpt:destinationStation）——供详情图列车标签显示终点/方向
          var destStations = t["odpt:destinationStation"] || [];
          var destStation = destStations.length > 0 ? String(destStations[0]).split(".").pop() : "";
          var matchingLines = [];
          Object.keys(allLines).forEach(function(lid) {
            var line = allLines[lid];
            var lop = TransitConstants && typeof TransitConstants.normalizeOp === "function" ? TransitConstants.normalizeOp(line.operator) : line.operator;
            if (!line || !line.stations) return;
            // v4.3.494: 直通系统（SotetsuDirect）列车 operator=JR-East，但羽沢横浜国大归属
            // SotetsuShin-Yokohama 线（operator=Sotetsu）——prefer 表内线路跨 operator 放行，
            // 否则该站始发列车匹配不到任何线而丢失。
            var _thruCfg = THROUGH_RAILWAY_FALLBACK[railwayName];
            if (lop !== top && !(_thruCfg && _thruCfg.prefer.indexOf(lid) >= 0)) return;
            var idx = line.stations.indexOf(stationKey);
            // v4.3.407: ODPT 站 ID 与项目站表差异（连字符 Musashi-Nakahara→MusashiNakahara、
            // 大小写 Inagi-Naganuma→Inaginaganuma）——归一化（去连字符+小写）兜底匹配
            if (idx < 0) {
              var normKey = String(stationKey).replace(/-/g, "").toLowerCase();
              for (var _si = 0; _si < line.stations.length; _si++) {
                if (String(line.stations[_si]).replace(/-/g, "").toLowerCase() === normKey) { idx = _si; break; }
              }
            }
            if (idx < 0) return;
            matchingLines.push({ lid: lid, idx: idx, line: line });
          });
          var targetLine = null;
          if (matchingLines.length === 1) {
            targetLine = matchingLines[0];
          } else if (matchingLines.length > 1) {
            // 1. 优先使用railway字段精确匹配
            if (railwayName) {
              // v4.3.437: 先用 LINE_RAILWAY_CODE 反查 odpt railway 短名 → 项目线 key 列表
              // （如 SaikyoKawagoe→[Saikyo,Kawagoe]、Kawagoe→[KawagoeWest]），集合匹配比
              // 子串猜测更准——避免川越〜高麗川的 Kawagoe 数据错配到大宮〜川越段。
              var mappedLids = [];
              var _rwc = window.ODPTClient && window.ODPTClient.LINE_RAILWAY_CODE;
              if (_rwc) {
                Object.keys(_rwc).forEach(function(k) {
                  if (_rwc[k] === railwayName) mappedLids.push(k);
                });
              }
              for (var i = 0; i < matchingLines.length; i++) {
                var ml = matchingLines[i];
                if (mappedLids.length > 0) {
                  if (mappedLids.indexOf(ml.lid) >= 0) { targetLine = ml; break; }
                } else if (ml.lid === railwayName || ml.lid.indexOf(railwayName) >= 0 || railwayName.indexOf(ml.lid) >= 0) {
                  targetLine = ml;
                  break;
                }
              }
            }
            // 2. 直通系统（v4.3.494）: 按 prefer 归属表顺序选择，排除环线
            if (!targetLine && THROUGH_RAILWAY_FALLBACK[railwayName]) {
              var _thru = THROUGH_RAILWAY_FALLBACK[railwayName];
              for (var _pi = 0; _pi < _thru.prefer.length; _pi++) {
                var _plid = _thru.prefer[_pi];
                if (_thru.exclude && _thru.exclude.indexOf(_plid) >= 0) continue;
                for (var _mi2 = 0; _mi2 < matchingLines.length; _mi2++) {
                  if (matchingLines[_mi2].lid === _plid) { targetLine = matchingLines[_mi2]; break; }
                }
                if (targetLine) break;
              }
            }
            // 3. 如果没有精确匹配，只选择主要线路（车站数量>=10）
            if (!targetLine) {
              var mainLines = matchingLines.filter(function(ml) {
                return ml.line.stations && ml.line.stations.length >= 10;
              });
              if (mainLines.length > 0) {
                mainLines.sort(function(a, b) {
                  return (b.line.stations ? b.line.stations.length : 0) - (a.line.stations ? a.line.stations.length : 0);
                });
                targetLine = mainLines[0];
              } else {
                // 如果没有主要线路，选择车站数量最多的线路
                matchingLines.sort(function(a, b) {
                  return (b.line.stations ? b.line.stations.length : 0) - (a.line.stations ? a.line.stations.length : 0);
                });
                targetLine = matchingLines[0];
              }
            }
          }
          if (targetLine) {
            var lid = targetLine.lid;
            var idx = targetLine.idx;
            if (!posMap[lid]) posMap[lid] = [];
            var existingIdx = posMap[lid].findIndex(function(p) { return p.trainId === trainId; });
            var rawType = t["odpt:trainType"] || "";
            var typeName = "";
            if (rawType) {
              var tp = String(rawType).split(":");
              typeName = tp.length > 1 ? tp[tp.length - 1] : String(rawType);
            }
            var positionData = { 
              stationIndex: idx, 
              trainId: trainId, 
              delayMin: delayMin,
              railDirection: directionName,
              destinationStation: destStation,
              trainType: rawType,
              typeName: typeName,
              estimated: false
            };
            if (existingIdx >= 0) {
              posMap[lid][existingIdx] = positionData;
            } else {
              posMap[lid].push(positionData);
            }
          }
        });
      });
      odptData.realtimePositions = posMap;

      // ===== Estimate positions for lines without realtime data =====
      function doEstimation() {
        try {
          if (window.TrainPositionEstimator && typeof window.TrainPositionEstimator.estimateAllPositions === "function") {
            var timetableSource = window.ODPT_TIMETABLES || window.ODPT_TRAINS || {};
            var estimated = window.TrainPositionEstimator.estimateAllPositions(
              allLines,
              timetableSource,
              odptData.delayInfo,
              posMap
            );
            var estCount = 0;
            Object.keys(estimated).forEach(function(lid) {
              if (!posMap[lid] || posMap[lid].length === 0) {
                posMap[lid] = estimated[lid];
                estCount += estimated[lid].length;
              }
            });
            if (estCount > 0) {
              console.debug("[DataFusion] Estimated", estCount, "train positions for", Object.keys(estimated).length, "lines");
            }
          }
        } catch(estErr) { console.debug("[DataFusion] Position estimation error:", estErr.message); }
      }

      // 先进行一次估算（使用已有的时刻表数据）
      doEstimation();

      // 识别需要估算但可能没有时刻表的线路，按需加载
      try {
        var timetableOps = Object.keys(window.ODPT_TIMETABLES || {});
        var linesNeedingTimetable = [];
        Object.keys(allLines).forEach(function(lid) {
          var line = allLines[lid];
          if (!line || !line.operator) return;
          var hasRealtime = posMap[lid] && posMap[lid].length > 0;
          var hasTimetable = timetableOps.indexOf(line.operator) >= 0;
          // 检查该线路是否有时刻表数据（按railway过滤）
          if (hasTimetable && window.ODPT_TIMETABLES[line.operator]) {
            var lineTimetables = window.ODPT_TIMETABLES[line.operator].filter(function(t) {
              var railway = t['odpt:railway'] || '';
              return railway.indexOf(lid) >= 0 || railway.indexOf('.' + lid) >= 0;
            });
            hasTimetable = lineTimetables.length > 0;
          }
          if (!hasRealtime && !hasTimetable && window.ODPTClient && window.ODPTClient.supports(line.operator, 'trainTimetable')) {
            linesNeedingTimetable.push({ lineId: lid, operator: line.operator, name: line.name || line.nameJa });
          }
          // v4.3.446: 支線（branchOf 子線、丸ノ内線支線等）の時刻表も本体と同じく必要——
          // 支線は単独カード化せず体系内でリアルタイム配備するため、本体の需要に依存せず常に確保する
          if (line && line.branches) {
            line.branches.forEach(function(bid3) {
              var bl3 = allLines[bid3];
              if (!bl3 || !bl3.operator) return;
              var hasRt3 = posMap[bid3] && posMap[bid3].length > 0;
              var hasTt3 = false;
              if (window.ODPT_TIMETABLES && window.ODPT_TIMETABLES[bl3.operator]) {
                var lt3 = window.ODPT_TIMETABLES[bl3.operator].filter(function(t) {
                  var railway = t['odpt:railway'] || '';
                  return railway.indexOf(bid3) >= 0 || railway.indexOf('.' + bid3) >= 0;
                });
                hasTt3 = lt3.length > 0;
              }
              if (!hasRt3 && !hasTt3 && window.ODPTClient && window.ODPTClient.supports(bl3.operator, 'trainTimetable')) {
                linesNeedingTimetable.push({ lineId: bid3, operator: bl3.operator, name: bl3.name || bl3.nameJa });
              }
            });
          }
        });

        if (linesNeedingTimetable.length > 0 && typeof loadMissingTimetables === 'function') {
          loadMissingTimetables(linesNeedingTimetable).then(function() {
            // 时刻表加载完成后，重新进行估算
            doEstimation();
            try { fuseAll(); } catch(e) { console.debug("[DataFusion] reload->fuseAll error:", e.message); }
          });
        }
      } catch(timetableErr) { console.debug("[DataFusion] Missing timetable detection error:", timetableErr.message); }

      try { fuseAll(); } catch(e) { console.debug("[DataFusion] loadTrainPositions->fuseAll error:", e.message); }

      // v4.3.416: 延迟二次校准——ODPT_TRAINS 分批写入 / DataLayer 晚构建时，
      // 首次调用可能漏掉部分线路（实测 Ome/Itsukaichi 偶发 0 而 ChuoRapid 正常），
      // 3 秒后重跑一次补齐（幂等；每次 posPromises 完成后由 odpt-unified 重置 _calibrated）
      if (!loadTrainPositions._calibrated) {
        loadTrainPositions._calibrated = true;
        clearTimeout(loadTrainPositions._calib);
        loadTrainPositions._calib = setTimeout(function() {
          loadTrainPositions._retry = 0;
          try { loadTrainPositions(); } catch(e) {}
        }, 3000);
      }
    } catch(e) { console.debug("[DataFusion] loadTrainPositions error:", e.message); }
  }

  
  // ========== 直通运行关系 ==========
  // Data moved to data/core/through-service.js (single Provider: window.ThroughService).
  function getThroughServiceLines(lineId) {
    return (window.ThroughService && window.ThroughService.getThroughServiceLines) ? window.ThroughService.getThroughServiceLines(lineId) : [];
  }

    // ========== 按需加载缺失线路的时刻表 ==========
  var _timetableLoading = {};

  function loadMissingTimetables(linesNeedingEstimation) {
    try {
      if (!window.ODPTClient || !linesNeedingEstimation || linesNeedingEstimation.length === 0) return Promise.resolve();

      // v4.3.489: 加入 JR-East——ODPT JR-East 时刻表已按 railway 分批入库，
      // 此白名单只控制"缺时刻表的线是否补拉"，JR 地方线（东北/上越/奥羽等）无实时位置，
      // 必须靠按需补时刻表推定才能显示
      var priorityOps = ['JR-East', 'TokyoMetro', 'Toei', 'YokohamaMunicipal', 'Keio', 'Sotetsu', 'Tokyu', 'Tobu', 'TWR', 'MIR', 'TamaMonorail'];
      var allLines = (window.DataLayer && window.DataLayer.getAllLines) ? window.DataLayer.getAllLines() : {};

      // 扩展需要加载的线路，包括直通运行的线路
      var expandedLines = [];
      var seenLineIds = {};
      linesNeedingEstimation.forEach(function(l) {
        if (!seenLineIds[l.lineId]) {
          seenLineIds[l.lineId] = true;
          expandedLines.push(l);
        }
        var throughLines = getThroughServiceLines(l.lineId);
        throughLines.forEach(function(tlid) {
          if (!seenLineIds[tlid]) {
            var throughLine = allLines && allLines[tlid];
            var throughOp = throughLine ? throughLine.operator : (window.ODPTClient && window.ODPTClient.LINE_TO_OPERATOR ? window.ODPTClient.LINE_TO_OPERATOR[tlid] : null);
            if (throughOp) {
              seenLineIds[tlid] = true;
              expandedLines.push({ lineId: tlid, operator: throughOp, name: throughLine ? (throughLine.name || throughLine.nameJa) : tlid });
            }
          }
        });
      });

      var toLoad = expandedLines.filter(function(l) {
        // v4.3.489: 已由初始分批探测（ODPT_TT_PROBED）的线路不再重复请求——
        // JR 地方线 41 条 ODPT 无时刻表数据，标记后避免每次刷新都重试
        var probed = window.ODPT_TT_PROBED && window.ODPT_TT_PROBED[l.lineId];
        return priorityOps.indexOf(l.operator) >= 0 && !_timetableLoading[l.lineId] && !probed;
      });

      // v4.3.446: 上限 12→24——支線（丸ノ内線支線等）を含めても主線の時刻表ロードを阻まない
      // （ODPT 150ms 間隔・3 並行、24 リクエストでも 1 秒前後に収まる）
      toLoad = toLoad.slice(0, 24);

      if (toLoad.length === 0) return Promise.resolve();

      console.debug("[DataFusion] Loading missing timetables for", toLoad.length, "lines");

      var promises = toLoad.map(function(lineInfo) {
        _timetableLoading[lineInfo.lineId] = true;
        return window.ODPTClient.getTimetableForRailwayFiltered(lineInfo.operator, lineInfo.lineId, 90).then(function(data) {
          if (data && data.length > 0) {
            if (!window.ODPT_TIMETABLES[lineInfo.operator]) {
              window.ODPT_TIMETABLES[lineInfo.operator] = [];
            }
            var existingIds = {};
            window.ODPT_TIMETABLES[lineInfo.operator].forEach(function(t) {
              var id = t['odpt:trainNumber'] || t['odpt:train'] || JSON.stringify(t);
              existingIds[id] = true;
            });
            data.forEach(function(t) {
              var id = t['odpt:trainNumber'] || t['odpt:train'] || JSON.stringify(t);
              if (!existingIds[id]) {
                window.ODPT_TIMETABLES[lineInfo.operator].push(t);
              }
            });
            if (!window.ODPT_TRAINS[lineInfo.operator]) {
              window.ODPT_TRAINS[lineInfo.operator] = window.ODPT_TIMETABLES[lineInfo.operator];
            }
          }
        }).catch(function(e) {
          console.debug("[DataFusion] Failed to load timetable for", lineInfo.lineId, ":", e.message);
        });
      });

      return Promise.all(promises);
    } catch(e) {
      console.debug("[DataFusion] loadMissingTimetables error:", e.message);
      return Promise.resolve();
    }
  }

  function saveToCache() {
    try {
      if (!window.RailwayRTC || !_lastFusedData) return;
      var posList = [];
      var delayMap = {};
      var fusedLines = _lastFusedData.lines || {};
      Object.keys(fusedLines).forEach(function(lid) {
        var fl = fusedLines[lid];
        if (fl && fl.realtimePositions && fl.realtimePositions.length > 0) {
          posList.push({ lineId: lid, positions: fl.realtimePositions });
        }
        if (fl && fl.delayInfo) {
          delayMap[lid] = { status: fl.delayInfo.status, maxDelay: fl.delayInfo.maxDelay, interval: fl.delayInfo.interval, cause: fl.delayInfo.cause };
        }
      });
      window.RailwayRTC.savePositions(posList);
      window.RailwayRTC.saveDelayInfo(delayMap);
    } catch(e) {}
  }
  // v4.3.405: 官方源（小田急/ゆりかもめ）delay 加载——通过本地代理，30s TTL
  function loadOfficialDelay() {
    try {
      if (!window.OfficialRailway || typeof window.OfficialRailway.fetchDelayInfo !== "function") return;
      window.OfficialRailway.fetchDelayInfo().then(function(info) {
        if (info && typeof info === "object") {
          officialData.delayInfo = info;
          try { fuseAll(); } catch(e) { console.debug("[DataFusion] official->fuseAll error:", e.message); }
        }
      }).catch(function(e) { console.debug("[DataFusion] official delay error:", e.message); });
    } catch(e) { console.debug("[DataFusion] loadOfficialDelay error:", e.message); }
  }

  function init() {
    if (_initialized) return;
    _initialized = true;
    loadLocalData();
    syncStatusMap();
    checkCacheStale();
    fuseAll();
    loadOfficialDelay();
    _refreshTimer = setInterval(function() { loadOfficialDelay(); try { fuseAll(); } catch(e) { console.debug("[DataFusion] fuseAll error:", e.message); } }, REFRESH_INTERVAL);
    _cacheTimer = setInterval(function() { try { saveToCache(); } catch(e) {} }, REFRESH_INTERVAL);
    (function pollUnified() {
      var checkLines = (window.DataLayer && window.DataLayer.getAllLines) ? window.DataLayer.getAllLines() : (window.UNIFIED_LINES || {});
      if (checkLines && Object.keys(checkLines).length > 0) {
        return;
      }
      setTimeout(pollUnified, 500);
    })();
  }

  window.DataFusion = {
    init: init, fuseAll: fuseAll, subscribe: subscribe,
    getFusedData: function() { return window.DATA_FUSION || _lastFusedData || null; },
    getLine: function(lineId) { var data = window.DATA_FUSION || _lastFusedData; return data && data.lines ? data.lines[lineId] : null; },
    getOdptData: function() { return odptData; },
    getRealtimePositions: function(lineId) { return odptData.realtimePositions[lineId] || []; },
    loadTrainPositions: loadTrainPositions,
    getCachedData: function() { return _lastFusedData; },
    saveToCache: saveToCache, refresh: function() { return fuseAll(); },
    // Through-service (直通運転) providers: direct neighbours + BFS closure
    getThroughServiceLines: getThroughServiceLines,
    getDirectThroughLines: function(lineId) {
      return (window.ThroughService && window.ThroughService.getDirectThroughLines) ? window.ThroughService.getDirectThroughLines(lineId) : [];
    },
    updateOdptData: function(delayData) {
      if (delayData && typeof delayData === 'object') { odptData.delayInfo = delayData; try { fuseAll(); } catch(e) { console.debug('[DataFusion] updateOdptData->fuseAll error:', e.message); } }
    }
  };

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init); } else { init(); }
  window.addEventListener("beforeunload", function() {
    if (_positionTimer) clearInterval(_positionTimer);
    if (_refreshTimer) clearInterval(_refreshTimer);
    if (_cacheTimer) clearInterval(_cacheTimer);
  });
})();