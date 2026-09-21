/*
 * Pixel Tetsudo - DataFusion v11 (Position Support)
 */
(function() {
  "use strict";

  var FUSION_VERSION = 11;
  // v4.3.x: 实时轮询间隔 — 见 runtime-config.js REFRESH_INTERVAL
  // v4.3.x: 位置轮询间隔 — 见 runtime-config.js POSITION_INTERVAL

  var odptData = { trains: {}, delayInfo: {}, realtimePositions: {} };
  var subscribers = [];
  var localData = { lines: {}, statusMap: {} };
  var _lastFusedData = null;
  var _lineControlVersion = null;
  var _positionTimer = null;
  var _initialized = false;
  var _refreshTimer = null;
  var _cacheTimer = null;
  // v4.3.9xx (E1): 融合/缓存轮询间隔（init 时从 RuntimeConfig 读取，回前台恢复时复用）
  var _refreshIntervalMs = 15000;

  // ========== 融合轮询生命周期（v4.3.9xx E1: visibilitychange 暂停/恢复） ==========
  // 后台标签页暂停 15s fuseAll + saveToCache；回前台立即融合一次再恢复周期——
  // 后台页不再产生计算与 IDB 写入开销（配合 odpt-unified 的拉取暂停双管齐下）。
  function startFusionPolling() {
    if (_refreshTimer || _cacheTimer) return;
    _refreshTimer = setInterval(function() { try { fuseAll(); } catch(e) { console.debug("[DataFusion] fuseAll error:", e.message); } }, _refreshIntervalMs);
    _cacheTimer = setInterval(function() { try { saveToCache(); } catch(e) {} }, _refreshIntervalMs);
  }
  function stopFusionPolling() {
    if (_refreshTimer) { clearInterval(_refreshTimer); _refreshTimer = null; }
    if (_cacheTimer) { clearInterval(_cacheTimer); _cacheTimer = null; }
  }
  document.addEventListener('visibilitychange', function() {
    try {
      if (document.hidden) {
        stopFusionPolling();
      } else {
        try { fuseAll(); } catch(e) { console.debug("[DataFusion] visible->fuseAll error:", e.message); }
        startFusionPolling();
      }
    } catch(e) { console.debug("[DataFusion] visibilitychange handler error:", e.message); }
  });

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
    // v4.3.842: 先提交 DATA_FUSION 再通知订阅者——原顺序为「先 cb 后赋值」，
    // 订阅回调内 getFusedData() 经 window.DATA_FUSION || _lastFusedData 读到
    // 上一次的旧值（首屏空融合后为 truthy 空对象），Priority 1 判空失败回退
    // DataLayer 基线 → 延误状态在 15s REFRESH_INTERVAL 二次融合前永不显示。
    try { window.DATA_FUSION = fusedData; } catch(e) {}
    try { subscribers.forEach(function(cb) { cb(fusedData); }); } catch(e) { console.debug("[DataFusion] Subscriber error:", e.message); }
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
      // v4.3.629: 官方 status 自由文本值映射（官方给什么用什么，不读正文）——
      // JR东: 運転見合わせ→中断 / 遅延→延误 / 一部運休→部分停运；私铁: 運行情報あり→info
      if (_stF && result.status === "normal") {
        if (/(?:\u904b\u8ee2\u898b\u5408\u308f\u305b|\u904b\u8ee2\u3092\u4e2d\u6b62|\u904b\u8ee2\u4e2d\u6b62|\u5168\u7dda\u904b\u4f11)/.test(_stF)) result.status = "suspended";
        else if (/(?:\u9045\u5ef6|\u30c0\u30a4\u30e4\u4e71\u308c)/.test(_stF)) result.status = "delayed";
        else if (/\u4e00\u90e8\u904b\u4f11/.test(_stF)) result.status = "notice";
      }
      result.statusText = _stF;
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
          if (_rS) {
            // v4.3.626: 清理 Range 原文——去"駅間/間"尾缀、〜～－−统一为→（"全線"保留原样）
            result.interval = _rS.replace(/\u99c5\u9593$/, "").replace(/\u9593$/, "").replace(/[\u301c\uff5e\uff0d\u2212]/g, "\u2192");
          }
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
      // v4.3.623: 状态不再做文本关键词判定（用户裁定：不好判断就清理掉，只识别区间）。
      // 状态仅采用 ODPT 结构化字段（Suspension/Delay/odpt:delay）；自由文本状态字段
      // （如"運行情報あり"）统一归为 info = 有运行情报，不细分中断/延误——
      // 区间/原因仍走结构化字段优先 + 文本兜底（概览用），原文全文照常展示。
      // 仅排除"正常声明"文本（平常どおり/遅延なし/ありません等）→ 保持 normal，避免把正常当情报误报黄色。
      if (result.status === "normal" && text && !(_stF === "Normal" || /^odpt\./.test(_stF))) {
        var _normalDecl = /\u5e73\u5e38|\u9045\u5ef6\u306a\u3057|\u3042\u308a\u307e\u305b\u3093|\u3054\u3056\u3044\u307e\u305b\u3093|\u306a\u3057|\u89e3\u6d88|\u9589\u9381|\u518d\u958b\u3057\u307e\u3057\u305f|\u3092\u518d\u958b/;
        if (!_normalDecl.test(text)) result.status = "info";
      }
      // 延迟分钟：排除时刻（18時08分頃 的 "08分" 不是延迟）
      var m = text.match(/(?:\u7d04|\u304a\u3088\u305d)?\s*(\d{1,3})\s*(?:\u5206\u9593|\u5206|min)(?!\u9803|\u5f8c|\u4ee5)/i);
      if (m) result.maxDelay = parseInt(m[1], 10);
      // v4.3.628: 区间仅认 ODPT 结构化字段（Range/stationFrom/stationTo，见上）；不做文本兜底提取（写不好就不猜）
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
      // v4.3.957: 共线区间共用数据——副都心线视图里，共线区间（和光市→小竹向原，站索引0-5）的列车从有乐町线数据里拉
      var _rtPositions = odptData.realtimePositions[lineId] || [];
      if (lineId === 'Fukutoshin') {
        var _ylPositions = odptData.realtimePositions['Yurakucho'] || [];
        var _sharedStations = ['Wakoshi', 'Chikatetsu-Narimasu', 'Chikatetsu-Akatsuka', 'Heiwadai', 'Hikawadai', 'Kotake-mukaihara'];
        var _ownStations = line.stations || [];
        // 把有乐町线共线区间的列车合并进来（去重：同 trainId 只保留一条）
        var _existingIds = {};
        _rtPositions.forEach(function(p) { _existingIds[p.trainId] = true; });
        _ylPositions.forEach(function(p) {
          if (_existingIds[p.trainId]) return; // 已有，跳过
          // 只保留共线区间的列车（站在共线站列表里）
          var _stName = (p.stationId || '').split('.').pop();
          if (_sharedStations.indexOf(_stName) < 0) return;
          // 映射站索引：有乐町线站索引 → 副都心线站索引
          var _ylIdx = _ownStations.indexOf(_stName);
          if (_ylIdx >= 0) {
            p.stationIndex = _ylIdx;
            p.fusionLineId = 'Yurakucho';
            _rtPositions.push(p);
          }
        });
      }
      return { id: lineId, name: line.name, nameEn: line.nameEn || line.name, code: line.code, color: (window.LineOperationSystemsResolveColor && window.LineOperationSystemsResolveColor(lineId)) || line.color, operator: line.operator, region: line.region, type: line.type, image: line.image, stations: line.stations || [], durations: line.durations || [], intervalTotal: line.durationTotalMin || 0, realtimePositions: _rtPositions, delayInfo: delayInfo, branchOf: line.branchOf || null, isSixShapedLoop: line.isSixShapedLoop === true, isDoubleColumnLoop: line.isDoubleColumnLoop === true, loopJunction: line.loopJunction || null, _chainMeta: _chainMeta };
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
  // v4.3.416+: ODPT 站 ID 与本地冻结站表拼写差异别名——见 data/core/runtime-config.js STATION_ALIAS
  // v4.3.474: railway 感知别名（优先于全局 STATION_ALIAS）——ODPT 同名站 ID 在不同线指向不同本地站
  // Oyama：Tojo=大山(本地 Ooyama) / Utsunomiya=小山(本地 Oyama)，必须按 railway 区分
  // v4.3.479: Kohoku——Nippori_Toneri=江北(本地 Kohoku) / NaritaAbikoBranch=湖北(本地 Kohoku-Narita 分 ID)
  // v4.3.474+: Railway 感知别名——见 data/core/runtime-config.js STATION_ALIAS_BY_RAILWAY

  // v4.3.494: 直通系统（ODPT 独立 railway 推送、本地无同名线）的列车归属表。
  // 根因: 相鉄直通(SotetsuDirect)列车 railway=JR-East.SotetsuDirect, fromStation 为专属站 ID
  //   (Osaki/武蔵小杉/西大井/羽沢横浜国大) —— 本地无 SotetsuDirect 线 → 反查无映射 →
  //   fallback 站数最多 → Yamanote(30站) 误配山手线详情图。
  // 处理: prefer 顺序选择归属线(跨 operator 放行 SotetsuShin-Yokohama), exclude 排除环线。
  // v4.3.904: 提到外层作用域（ensureManualTimetable 需要访问）
  var allLines = null;
  var doEstimation = null;
  var posMap = {};
  var THROUGH_RAILWAY_FALLBACK = (window.RuntimeConfig && window.RuntimeConfig.THROUGH_RAILWAY_FALLBACK) || {"SotetsuDirect":{"exclude":["Yamanote"],"prefer":["SotetsuShin-Yokohama","Yokosuka","Saikyo","ShonanShinjuku"]}};

  function loadTrainPositions() {
    try {
      var positionSource = window.ODPT_TRAIN_POSITIONS || window.ODPT_TRAINS;
      if (!positionSource) return;
      allLines = (window.DataLayer && window.DataLayer.getAllLines) ? window.DataLayer.getAllLines() : (window.UNIFIED_LINES || {});
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
      posMap = {};
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
          if (window.RuntimeConfig.STATION_ALIAS_BY_RAILWAY[railwayName] && window.RuntimeConfig.STATION_ALIAS_BY_RAILWAY[railwayName][stationKey]) {
            stationKey = window.RuntimeConfig.STATION_ALIAS_BY_RAILWAY[railwayName][stationKey];
          } else if (window.RuntimeConfig.STATION_ALIAS[stationKey]) {
            stationKey = window.RuntimeConfig.STATION_ALIAS[stationKey];
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
            // v4.3.6xx: 双向直通列车处理
            // 1. 临海线的车（operator=TWR）开到JR区间了 → 在JR线路图上显示临海线车型
            var trainOperator = t["odpt:operator"] || "";
            // v4.3.939: 存车自己的 operator（渲染层判断直通车、按车籍选图标，治跨线"变身"）
            positionData.trainOperator = trainOperator.replace('odpt.Operator:', '') || '';
            var isRinkaiTrain = (trainOperator === 'odpt.Operator:TWR' || trainOperator === 'TWR');
            if (isRinkaiTrain && (lid === 'Saikyo' || lid === 'Kawagoe')) {
              // 这是临海线的车，现在开到埼京线/川越线区间了
              positionData.trainClass = window.TrainIcons.getTrainClass(
                'Rinkai', 'TWR',
                trainId + '_' + idx, idx, rawType
              );
              positionData.isRinkaiThrough = true;
            } else {
              // v5: 车型判断（数据层）——用列车自己的operator判断，不是当前线路的operator
              // 这样直通过来的车（比如东急的车开到半藏门线）就会显示东急的车型，而不是地铁的车型
              try {
                if (window.TrainIcons && typeof window.TrainIcons.getTrainClass === "function") {
                  // 从odpt:operator提取operator简称（去掉odpt.Operator:前缀）
                  var trainOpShort = trainOperator.replace('odpt.Operator:', '') || '';
                  positionData.trainClass = window.TrainIcons.getTrainClass(
                    lid, trainOpShort,
                    trainId + '_' + idx, idx, rawType
                  );
                }
              } catch(e) {}
            }
            // 2. JR的车开往新木场（destinationStation=ShinKiba）→ 也加到临海线posMap
            if (destStation === 'ShinKiba' || destStation === 'Shin-Kiba') {
              // 这是JR的车，终点是临海线的新木场站
              // 如果它已经到大崎站附近了，就把它加到临海线的posMap里
              var rinkaiLine = allLines['Rinkai'];
              if (rinkaiLine && rinkaiLine.stations) {
                var rinkaiOsakiIdx = rinkaiLine.stations.indexOf('Osaki');
                if (rinkaiOsakiIdx >= 0) {
                  if (!posMap['Rinkai']) posMap['Rinkai'] = [];
                  var rinkaiExistingIdx = posMap['Rinkai'].findIndex(function(p) { return p.trainId === trainId; });
                  var rinkaiPositionData = {
                    stationIndex: rinkaiOsakiIdx, // 大崎站
                    trainId: trainId,
                    delayMin: delayMin,
                    railDirection: directionName,
                    destinationStation: destStation,
                    trainType: rawType,
                    typeName: typeName,
                    estimated: false,
                    isJRThrough: true,
                    trainClass: window.TrainIcons.getTrainClass('Rinkai', 'JR-East', trainId + '_' + idx, idx, rawType)
                  };
                  if (rinkaiExistingIdx >= 0) {
                    posMap['Rinkai'][rinkaiExistingIdx] = rinkaiPositionData;
                  } else {
                    posMap['Rinkai'].push(rinkaiPositionData);
                  }
                }
              }
            }
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
      doEstimation = function() {
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
              } else if (estimated[lid]) {
                // v4.3.929: 实时位置有列车但无 destinationStation → 从推定位置补终点站
                var _estById = {};
                estimated[lid].forEach(function(p) { if (p && p.trainId) _estById[p.trainId] = p; });
                posMap[lid].forEach(function(p) {
                  if (p && p.trainId && _estById[p.trainId] && !p.destinationStation) {
                    p.destinationStation = _estById[p.trainId].destinationStation;
                  }
                });
              }
            });
            if (estCount > 0) {
              console.debug("[DataFusion] Estimated", estCount, "train positions for", Object.keys(estimated).length, "lines");
            }

            // v4.3.524: 复合模式——手动时刻表补充线（全部 ODPT 无 TrainTimetable 的 JR 本地线）。
            // 用户诉求（2026-09-11）："不要出现中央本线那样上半段实时的下半段干干净净的"——
            // 实时定位 + 推断复合：即使线路已有实时列车（ODPT 只推上半段），仍用手动时刻表
            // 跑推定补全其余区段，按 trainId 合并去重（实时优先，推定只填实时没有的车次）。
            // 数据文件 data/timetables/*-manual.js 为 JR 官网公开时刻表人工整理（ODPT 兼容格式）。
            // 通用化：collectManualTimetableLines() 自动扫描 window.<lineId>_MANUAL_TIMETABLES（后缀 18 字符）。
            function collectManualTimetableLines() {
              var out = [];
              try {
                Object.keys(window).forEach(function(k) {
                  if (k.slice(-18) === '_MANUAL_TIMETABLES' && window[k] && window[k].length > 0) {
                    out.push(k.slice(0, -18));
                  }
                });
              } catch(e) { console.debug("[DataFusion] collectManualTimetableLines error:", e.message); }
              return out;
            }
            var manualLines = collectManualTimetableLines();
            manualLines.forEach(function(manualLineId) {
              var manualTT = window[manualLineId + '_MANUAL_TIMETABLES'];
              if (!manualTT || !Array.isArray(manualTT) || manualTT.length === 0) return;
              try {
                var mLine = allLines[manualLineId];
                if (mLine && mLine.stations) {
                  var mEst = window.TrainPositionEstimator.estimateLinePositions(
                    manualLineId, mLine, manualTT, odptData.delayInfo, mLine.operator
                  );
                  if (mEst && mEst.length > 0) {
                    if (!posMap[manualLineId]) posMap[manualLineId] = [];
                    var haveId = {};
                    posMap[manualLineId].forEach(function(p) { if (p && p.trainId) haveId[p.trainId] = true; });
                    var mAdded = 0;
                    mEst.forEach(function(p) {
                      if (p && p.trainId && !haveId[p.trainId]) {
                        posMap[manualLineId].push(p);
                        haveId[p.trainId] = true;
                        mAdded++;
                      }
                    });
                    if (mAdded > 0) {
                      console.debug("[DataFusion] Composite mode: " + manualLineId + " +" + mAdded + " estimated (realtime " + (posMap[manualLineId].length - mAdded) + " + estimated " + mAdded + ")");
                    }
                  }
                }
              } catch(mErr) {
                console.debug("[DataFusion] Composite mode error:", manualLineId, mErr.message);
              }
            });
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

        // v4.3.590: 惰性模式（home 搜索页 ODPT_LAZY=true）跳过时刻表补缺——时刻表推定是
        // realtime/trains 页功能，home 仅需实时延误徽章；补缺会按 operator 逐线拉取造成
        // 数百个 ODPT 请求拖慢首屏。loadTrainPositions（实时延误）与 fuseAll 不受影响。
        if (!window.ODPT_LAZY && linesNeedingTimetable.length > 0 && typeof loadMissingTimetables === 'function') {
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
      var priorityOps = (window.RuntimeConfig && window.RuntimeConfig.PRIORITY_OPS) || ['JR-East', 'TokyoMetro', 'Toei', 'YokohamaMunicipal', 'Keio', 'Sotetsu', 'Tokyu', 'Tobu', 'TWR', 'MIR', 'TamaMonorail'];
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
      toLoad = toLoad.slice(0, (window.RuntimeConfig && window.RuntimeConfig.TIMETABLE_LOAD_BATCH) || 24);

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
  function init() {
    if (_initialized) return;
    _initialized = true;
    loadLocalData();
    syncStatusMap();
    checkCacheStale();
    fuseAll();
    _refreshIntervalMs = (window.RuntimeConfig && window.RuntimeConfig.REFRESH_INTERVAL) || 15000;
    startFusionPolling();
    (function pollUnified() {
      var checkLines = (window.DataLayer && window.DataLayer.getAllLines) ? window.DataLayer.getAllLines() : (window.UNIFIED_LINES || {});
      if (checkLines && Object.keys(checkLines).length > 0) {
        // v4.3.6xx: 数据就绪后，如果当前在 trains.html 线路详情页（hash 有 lineId），
        // 自动触发一次 ensureManualTimetable——showLineView 可能在 DataFusion 未就绪时
        // 已从 DataLayer 渲染站表并跳过了手动时刻表加载。
        try {
          var h = (window.location.hash || "").replace(/^#/, "");
          var isTrainsPage = (window.location.pathname || "").indexOf("trains.html") >= 0;
          if (isTrainsPage && h && window.DataFusion && window.DataFusion.ensureManualTimetable) {
            window.DataFusion.ensureManualTimetable(h).catch(function(e) {
              console.debug("[DataFusion] auto-ensure manual skip:", h, e.message);
            });
          }
          // v4.3.6xx: 后台预加载常用线路的手动时刻表（Warm-up）
          // 用户大概率会切换的几条线，提前在后台加载，不用等到用户点击才加载
          if (isTrainsPage && window.DataFusion && window.DataFusion.ensureManualTimetable) {
            setTimeout(function() {
              // v4.3.6xx: 后台预加载线路白名单 — 见 runtime-config.js TRAIN_WARMUP_LINES
              var warmupLines = (window.RuntimeConfig && window.RuntimeConfig.TRAIN_WARMUP_LINES) || ['Yamanote', 'ChuoRapid', 'KeihinTohoku', 'SeibuEn', 'Keikyu', 'Odawara'];
              warmupLines.forEach(function(lid) {
                window.DataFusion.ensureManualTimetable(lid).catch(function(){});
              });
            }, 2000);  // 2秒后后台开始预加载，不阻塞首屏
          }
        } catch(e) {}
        return;
      }
      setTimeout(pollUnified, 500);
    })();
  }

  // ========== 手动时刻表按需加载（v4.3.528） ==========
  // 41 个 data/timetables/*-manual.js（ODPT 无 TrainTimetable 的 JR 地方线补充数据）
  // 由 HTML 静态标签改为按需动态注入：打开线路时才加载该线文件，
  // trains 页首屏不再全量解析约 7.1MB 时刻表数据（首都圈线 ODPT 有时刻表，全程零加载）。
  // 时序保证：script.onload 触发 = 脚本执行完成 = window.<lineId>_MANUAL_TIMETABLES 已定义，
  //   onload 内二次校验变量存在（文件名/线路 ID 命名不匹配时 reject 暴露，不静默缺数据）；
  //   数据就绪后内部重跑 doEstimation + fuseAll（与 loadMissingTimetables 完成后同一链路）。
  // 防重入：_manualLoading 记录共享 Promise，同线路并发调用只发一次请求。
  // 结果归属：调用方（trains-page）在 .then 中校验 currentLine，用户切走线路后旧结果不覆盖新状态。
  var _manualLoading = {};

  function _hasOdptTimetable(lineId) {
    try {
      var tt = window.ODPT_TIMETABLES || {};
      // v4.3.530: 映射后 code 一并检查——KawagoeWest→Kawagoe / UtsunomiyaJR→Utsunomiya /
      // SobuMain→Sobu / JobanMain→Joban 等 ODPT railway 名不含本地 lineId 子串，
      // 原判断误判"ODPT 无数据"→ 每次打开该线都注入不存在的 manual → 404 + reject 噪音
      var code = (window.ODPTClient && window.ODPTClient.LINE_RAILWAY_CODE &&
        window.ODPTClient.LINE_RAILWAY_CODE[lineId]) || lineId;
      for (var op in tt) {
        var arr = tt[op];
        if (!Array.isArray(arr)) continue;
        for (var i = 0; i < arr.length; i++) {
          var rw = (arr[i] && arr[i]['odpt:railway']) || '';
          if (rw.indexOf(lineId) >= 0 || rw.indexOf('.' + lineId) >= 0 ||
              rw.indexOf(code) >= 0 || rw.indexOf('.' + code) >= 0) return true;
        }
      }
    } catch(e) {}
    return false;
  }

  function ensureManualTimetable(lineId) {
    return new Promise(function(resolve, reject) {
      try {
        var varName = lineId + '_MANUAL_TIMETABLES';
        if (window[varName]) { resolve(true); return; }
        // ODPT 已有该线时刻表（首都圈等）→ 无需 manual，零请求
        if (window.ODPT_TIMETABLES && _hasOdptTimetable(lineId)) { resolve(true); return; }
        // 加载中：复用同一 Promise，避免并发重复请求
        if (_manualLoading[lineId]) { _manualLoading[lineId].then(resolve, reject); return; }
        var s = document.createElement('script');
        var base = (typeof window.getBasePath === 'function' && window.getBasePath()) || '..';
        s.src = base + '/data/timetables/' + lineId + '-manual.js';
        var p = new Promise(function(res, rej) {
          s.onload = function() {
            if (!window[varName]) { rej(new Error(varName + ' undefined (naming mismatch?)')); return; }
            // v4.3.6xx: 手动时刻表加载后，立即合并到posMap（原来只在初始化时合并一次）
            try {
              var manualTT = window[varName];
              var mLine = allLines[lineId];
              if (mLine && mLine.stations && manualTT && manualTT.length > 0) {
                var mEst = window.TrainPositionEstimator.estimateLinePositions(
                  lineId, mLine, manualTT, odptData.delayInfo, mLine.operator
                );
                if (mEst && mEst.length > 0) {
                  if (!posMap[lineId]) posMap[lineId] = [];
                  var haveId = {};
                  posMap[lineId].forEach(function(p) { if (p && p.trainId) haveId[p.trainId] = true; });
                  var mAdded = 0;
                  mEst.forEach(function(p) {
                    if (p && p.trainId && !haveId[p.trainId]) {
                      posMap[lineId].push(p);
                      haveId[p.trainId] = true;
                      mAdded++;
                    }
                  });
                  if (mAdded > 0) {
                    console.debug("[DataFusion] ensureManual: " + lineId + " +" + mAdded + " estimated trains");
                  }
                }
              }
            } catch(mErr) { console.debug("[DataFusion] ensureManual->mergeManual error:", mErr.message); }
            try { if (typeof doEstimation === 'function') doEstimation(); } catch(e) { console.debug("[DataFusion] ensureManual->doEstimation error:", e.message); }
            try { fuseAll(); } catch(e) { console.debug("[DataFusion] ensureManual->fuseAll error:", e.message); }
            res(true);
          };
          s.onerror = function() { rej(new Error('manual file not found (ODPT 无数据且无 manual 文件?)')); };
        });
        _manualLoading[lineId] = p;
        p.then(function() { delete _manualLoading[lineId]; }, function() { delete _manualLoading[lineId]; });
        document.head.appendChild(s);
        p.then(resolve, reject);
      } catch(e) { reject(e); }
    });
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
    // v4.3.528: 手动时刻表按需加载（ODPT 无时刻表的 JR 地方线，打开线路时才注入该线文件）
    ensureManualTimetable: ensureManualTimetable,
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
