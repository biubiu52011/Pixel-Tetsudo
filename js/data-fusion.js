/*
 * Pixel Tetsudo - DataFusion v11 (Position Support)
 */
(function() {
  "use strict";

  var FUSION_VERSION = 11;
  // v4.3.x: 实时轮询间隔 — 见 runtime-config.js REFRESH_INTERVAL
  // v4.3.x: 位置轮询间隔 — 见 runtime-config.js POSITION_INTERVAL

  var odptData = { trains: {}, delayInfo: {}, realtimePositions: {} };
  function _positionIdentity(p) { return p && (p.runningChainId || p.trainId) || ""; }

  // Evidence-backed vehicle identity follows the physical running chain, not
  // the currently rendered line. Never seed this registry from map/fleet/icon
  // estimates. Accept explicit manual/ODPT high-confidence evidence and
  // train-number evidence only after it has become high-confidence.
  var _chainVehicleRegistry = {};
  // Keep confirmed realtime evidence across a short source dropout. Position
  // truth still comes from the current snapshot; this bridge only preserves
  // physical-train identity/vehicle evidence while timetable fallback takes over.
  var _CHAIN_EVIDENCE_TTL_MS = 3 * 60 * 1000;
  function _rememberChainVehicle(p) {
    if (!p || !p.runningChainId || !p.vehicleIconPath) return;
    var _src = p.vehicleSource || (p.vehicleResolution && p.vehicleResolution.source) || "";
    var _conf = p.vehicleConfidence || (p.vehicleResolution && p.vehicleResolution.confidence) || "none";
    var _eligible = p.vehicleResolvedFromRealtime === true ||
      ((_src === "manual" || _src === "odpt" || _src === "trainNo") && _conf === "high");
    if (!_eligible) return;
    _chainVehicleRegistry[p.runningChainId] = {
      trainClass: p.trainClass || "",
      vehicleType: p.vehicleType || "",
      vehicleIconPath: p.vehicleIconPath || "",
      vehicleSource: p.vehicleSource || "",
      vehicleConfidence: p.vehicleConfidence || "none",
      vehicleResolution: p.vehicleResolution || null,
      lastSeenAt: Date.now()
    };
  }
  function _inheritChainVehicle(p) {
    if (!p || !p.runningChainId) return p;
    var v = _chainVehicleRegistry[p.runningChainId];
    if (!v) return p;
    if (v.lastSeenAt && (Date.now() - v.lastSeenAt) > _CHAIN_EVIDENCE_TTL_MS) {
      delete _chainVehicleRegistry[p.runningChainId];
      return p;
    }
    p.trainClass = v.trainClass || p.trainClass || "";
    p.vehicleType = v.vehicleType || p.vehicleType || "";
    p.vehicleIconPath = v.vehicleIconPath || p.vehicleIconPath || "";
    p.vehicleSource = v.vehicleSource || p.vehicleSource || "";
    p.vehicleConfidence = v.vehicleConfidence || p.vehicleConfidence || "none";
    p.vehicleResolution = v.vehicleResolution || p.vehicleResolution || null;
    p.vehicleInheritedFromRunningChain = true;
    return p;
  }
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
    if (_cacheTimer) return;
    // Fusion is source-driven: ODPT updates, position loads, manual timetable
    // completion and explicit refreshes already call fuseAll().  A second
    // unconditional 15s fuse loop emitted identical snapshots and forced
    // realtime.html to rebuild the full line list between 30s network polls.
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

  var LAST_GOOD_KEY = "pt_runinfo_last_good_v1";
  var LAST_GOOD_MAX_AGE_MS = 10 * 60 * 1000;
  var _lastGoodCacheRaw = null;
  var _lastGoodCacheParsed = {};
  function getLastGoodDelay(lineId) {
    try {
      var raw = localStorage.getItem(LAST_GOOD_KEY) || "{}";
      if (raw !== _lastGoodCacheRaw) {
        _lastGoodCacheParsed = JSON.parse(raw);
        _lastGoodCacheRaw = raw;
      }
      var v = _lastGoodCacheParsed[lineId];
      if (!v || !v.r || !v.r.status || !v.t) return null;
      if ((Date.now() - v.t) > LAST_GOOD_MAX_AGE_MS) return null;
      var st = v.r.status;
      if (st === "loading" || st === "no_data" || st === "no_odpt" || st === "unknown") return null;
      return {
        status: st,
        maxDelay: v.r.maxDelay == null ? null : v.r.maxDelay,
        interval: v.r.interval || null,
        cause: v.r.text || v.r.cause || null,
        updatedAt: v.r.updatedAt || v.t || null,
        source: "last_good",
        stale: true,
        refreshing: true
      };
    } catch(e) { return null; }
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
      var allLines = (window.DataLayer && window.DataLayer.getAllLines) ? window.DataLayer.getAllLines() : {};
      if (!allLines || Object.keys(allLines).length === 0) return;
      var statusMap = localData.statusMap || {};
      Object.keys(allLines).forEach(function(id) {
        if (!statusMap[id]) statusMap[id] = { status: "loading", maxDelay: null, interval: null, cause: null, source: "initial_check" };
      });
      localData.statusMap = statusMap;
    } catch(e) {}
  }

  function checkCacheStale() {
    try {
      var rdbLines = (window.DataLayer && window.DataLayer.getAllLines) ? window.DataLayer.getAllLines() : {};
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
    var result = { status: "unknown", maxDelay: null, interval: null, cause: null };
    if (!raw || !window.RunInfoEvaluator) return result;
    try {
      var stationName = function(v) {
        if (!v) return "";
        var id = extractRailwayShort({ "odpt:railway": v });
        try {
          if (id && window.RailwayDB && window.RailwayDB.resolveStationName) return window.RailwayDB.resolveStationName(id) || id;
        } catch(e) {}
        return id;
      };
      var statusRaw = raw["odpt:trainInformationStatus"];
      var statusText = "";
      if (statusRaw != null && typeof statusRaw === "object") statusText = statusRaw.ja || statusRaw.en || statusRaw.zh || "";
      else if (statusRaw != null) statusText = String(statusRaw);
      var ti = raw["odpt:trainInformationText"] || raw["odpt:text"] || "";
      var text = typeof ti === "string" ? ti : (ti && typeof ti === "object" ? (ti.ja || ti.en || ti.zh || "") : "");
      if (statusText && !/^(?:Normal|Suspension|Delay|odpt\.)/.test(statusText)) text = (text ? text + "。" : "") + statusText;
      result = window.RunInfoEvaluator.evaluate({
        source: "odpt",
        structuredStatus: statusRaw,
        suspension: raw["odpt:suspension"] === true,
        delay: raw["odpt:delay"] === true,
        delayMinutes: (typeof raw["odpt:delay"] === "number") ? raw["odpt:delay"] : null,
        text: text,
        cause: raw["odpt:trainInformationCause"],
        range: raw["odpt:trainInformationRange"],
        stationFromName: stationName(raw["odpt:stationFrom"]),
        stationToName: stationName(raw["odpt:stationTo"]),
        resumeEstimate: raw["odpt:resumeEstimate"]
      });
      result.statusText = statusText ? String(statusText).split(":").pop() : "";
      return result;
    } catch(e) { return result; }
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

  function extractRailwayIdentity(rec) {
    if (window.ODPTClient && typeof window.ODPTClient.parseRailwayIdentity === "function") {
      return window.ODPTClient.parseRailwayIdentity(rec);
    }
    try {
      var rw = String((rec && rec["odpt:railway"]) || "");
      var m = rw.match(/^odpt\.Railway:([^.]+)\.(.+)$/);
      return m ? { operator: m[1], railwayCode: m[2], key: m[1] + "::" + m[2] } : null;
    } catch(e) { return null; }
  }

  function buildLineIdentity(line, lineId) {
    try {
      line = line || {};
      var operator = line.operator || getOperatorForLine(lineId, line.name) || "";
      var railwayCode = "";
      if (window.ODPTClient && window.ODPTClient.LINE_RAILWAY_CODE) railwayCode = window.ODPTClient.LINE_RAILWAY_CODE[lineId] || "";
      if (!operator || !railwayCode) return null;
      return { operator: String(operator), railwayCode: String(railwayCode), key: String(operator) + "::" + String(railwayCode) };
    } catch(e) { return null; }
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
          var rid = extractRailwayIdentity(raw[i]);
          if (rid && String(rid.operator).toLowerCase() === String(op).toLowerCase() &&
              String(rid.railwayCode).toLowerCase() === String(code).toLowerCase()) {
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
      var line = (window.DataLayer && window.DataLayer.getLine ? window.DataLayer.getLine(lineId) : null) || (localData.lines && localData.lines[lineId]) || null;
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
          // RunInfo loading semantics: only explicit source evidence may produce normal. Missing/pending line data stays loading.
          var _opKey = TransitConstants && typeof TransitConstants.normalizeOp === "function" ? TransitConstants.normalizeOp(_opLine) : _opLine;
          var _opState = odptData.delayInfo && _opKey ? odptData.delayInfo[_opKey] : undefined;
          var _opFailed = _opState === null;
          var _opLoading = _opState === undefined;
          fallbackDelay = _opFailed ? { status: "no_odpt", maxDelay: 0, interval: null, cause: null }
            : (_opLoading ? { status: "loading", maxDelay: null, interval: null, cause: null }
              : { status: "loading", maxDelay: null, interval: null, cause: null, source: "awaiting_line_record" });
        }
      } catch(_e) {}
      // v4.3.963: 网页源运行情报（WebRunInfo，千叶/湘南官网渠道）——ODPT 无数据线路经此注入；
      // 优先级 apiInfo(ODPT) > webInfo(官网) > localStatus(手动覆盖) > fallback
      var webInfo = null;
      try {
        if (window.WebRunInfo && window.WebRunInfo.getDelayInfo) {
          webInfo = window.WebRunInfo.getDelayInfo(lineId, line);
        }
      } catch(_we) {}
      var _lastGood = getLastGoodDelay(lineId);
      var delayInfo = apiInfo || webInfo || (_hasLocal && { status: localStatus.status, maxDelay: localStatus.maxDelay, interval: localStatus.interval, cause: localStatus.cause }) || _lastGood || fallbackDelay;
      // Attach running-chain resolution context (transient, not persistent)

      var _rtPositions = (odptData.realtimePositions[lineId] || []).slice();
      var _ownStations = line.stations || [];
      var _existingIds = {};
      _rtPositions.forEach(function(p) { var _id = _positionIdentity(p); if (_id) _existingIds[_id] = true; });

      var _sharedPartners = (window.SharedTrackPairs && window.SharedTrackPairs.getSharedLines) ? window.SharedTrackPairs.getSharedLines(lineId) : [];
      for (var _sp = 0; _sp < _sharedPartners.length; _sp++) {
        var _spLine = _sharedPartners[_sp];
        var _spPositions = odptData.realtimePositions[_spLine] || [];
        _spPositions.forEach(function(p) {
          var _pid = _positionIdentity(p);
          if (_pid && _existingIds[_pid]) return;
          var _stName = (p.stationId || '').split('.').pop();
          if (!window.SharedTrackPairs || !window.SharedTrackPairs.isSharedStation ||
              !window.SharedTrackPairs.isSharedStation(lineId, _stName)) return;
          var _spIdx = _ownStations.indexOf(_stName);
          if (_spIdx >= 0) {
            var _copy = Object.assign({}, p, { stationIndex: _spIdx, fusionLineId: _spLine });
            _rtPositions.push(_copy);
            if (_pid) _existingIds[_pid] = true;
          }
        });
      }

      // Direct canonical through neighbours are independent of shared-track
      // membership.  The old nesting made this path unreachable for lines with
      // no SharedTrackPairs entry (including Keiyo).
      var _throughLines = (window.ThroughService && window.ThroughService.getDirectThroughLines) ?
        (window.ThroughService.getDirectThroughLines(lineId) || []) : [];
      for (var _tl = 0; _tl < _throughLines.length; _tl++) {
        var _tlLine = _throughLines[_tl];
        var _tlPositions = odptData.realtimePositions[_tlLine] || [];
        _tlPositions.forEach(function(p) {
          var _pid = _positionIdentity(p);
          if (_pid && _existingIds[_pid]) return;
          var _stName = (p.stationId || '').split('.').pop();
          var _tlIdx = _ownStations.indexOf(_stName);
          if (_tlIdx >= 0) {
            var _copy = Object.assign({}, p, { stationIndex: _tlIdx, fusionLineId: _tlLine });
            _rtPositions.push(_copy);
            if (_pid) _existingIds[_pid] = true;
          }
        });
      }
      var _chainMeta = null;
      try {
        if (window.RunningChainResolver && window.RunningChainResolver.getResolutionContext) {
          _chainMeta = window.RunningChainResolver.getResolutionContext(lineId, Object.keys((window.UNIFIED_LINES || {})));
        }
      } catch(_ce) {}
      var _lineIdentity = buildLineIdentity(line, lineId);
      return { id: lineId, name: line.name, nameEn: line.nameEn || line.name, code: line.code, color: (window.LineOperationSystemsResolveColor && window.LineOperationSystemsResolveColor(lineId)) || line.color, operator: line.operator, region: line.region, type: line.type, image: line.image, stations: line.stations || [], durations: line.durations || [], intervalTotal: line.durationTotalMin || 0, realtimePositions: _rtPositions, delayInfo: delayInfo, lineIdentity: _lineIdentity, _chainMeta: _chainMeta, branchOf: line.branchOf || null, isSixShapedLoop: line.isSixShapedLoop === true, isDoubleColumnLoop: line.isDoubleColumnLoop === true, loopJunction: line.loopJunction || null };
    } catch(e) { console.debug("[DataFusion] fuseLine error for " + lineId + ":", e.message); return null; }
  }

  function _expandDirtyLines(seedIds, lines) {
    var dirty = {};
    (seedIds || []).forEach(function(id) { if (id && lines && lines[id]) dirty[id] = true; });
    var queue = Object.keys(dirty);
    var branches = getBranchIndex(lines || {});
    while (queue.length) {
      var id = queue.shift();
      var line = lines[id] || {};
      var deps = [];
      try {
        if (window.SharedTrackPairs && window.SharedTrackPairs.getSharedLines) deps = deps.concat(window.SharedTrackPairs.getSharedLines(id) || []);
      } catch(e) {}
      try {
        if (window.ThroughService && window.ThroughService.getDirectThroughLines) deps = deps.concat(window.ThroughService.getDirectThroughLines(id) || []);
      } catch(e) {}
      if (line.branchOf) deps.push(line.branchOf);
      if (line.branches) deps = deps.concat(line.branches);
      if (branches[id]) deps = deps.concat(branches[id]);
      deps.forEach(function(dep) {
        if (dep && lines[dep] && !dirty[dep]) { dirty[dep] = true; queue.push(dep); }
      });
    }
    return Object.keys(dirty);
  }

  function fuseDirty(seedIds) {
    try {
      var dlLines = (window.DataLayer && window.DataLayer.getAllLines) ? window.DataLayer.getAllLines() : null;
      if (!_lastFusedData || !_lastFusedData.lines || !dlLines) return fuseAll();
      var dirtyIds = _expandDirtyLines(seedIds, dlLines);
      if (dirtyIds.length === 0) return _lastFusedData;
      // If dependency expansion reaches most of the network, a single full pass
      // is cheaper and simpler than cloning plus many targeted writes.
      if (dirtyIds.length > Math.max(40, Math.floor(Object.keys(dlLines).length * 0.45))) return fuseAll();
      var fusedLines = Object.assign({}, _lastFusedData.lines);
      dirtyIds.forEach(function(lineId) {
        var fused = fuseLine(lineId);
        if (fused) fusedLines[lineId] = fused;
        else delete fusedLines[lineId];
      });
      var fusedData = Object.assign({}, _lastFusedData, {
        timestamp: new Date().toISOString(),
        lines: fusedLines,
        odptOperatorsLoaded: Object.keys(odptData.delayInfo).length
      });
      emitUpdate(fusedData);
      return fusedData;
    } catch(e) {
      console.debug("[DataFusion] fuseDirty fallback:", e.message);
      return fuseAll();
    }
  }

  function fuseAll() {
    try {
      var fusedLines = {};
      var allLineIds = {};
      var dlLines = (window.DataLayer && window.DataLayer.getAllLines) ? window.DataLayer.getAllLines() : null;
      if (dlLines) Object.keys(dlLines).forEach(function(k) { allLineIds[k] = true; });
      if (localData.lines) Object.keys(localData.lines).forEach(function(k) { allLineIds[k] = true; });
      Object.keys(allLineIds).forEach(function(lineId) {
        var fused = fuseLine(lineId);
        if (fused) fusedLines[fused.id] = fused;
      });
      var fusedData = { version: FUSION_VERSION, timestamp: new Date().toISOString(), lines: fusedLines, lineOrder: (window.LinePresentationService && dlLines) ? window.LinePresentationService.getDisplayOrder(dlLines) : Object.keys(allLineIds), odptOperatorsLoaded: Object.keys(odptData.delayInfo).length, totalLines: Object.keys(allLineIds).length };
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
  // Source railway scope admits canonical candidates across operator boundaries.
  // It never orders candidates or resolves an ambiguous physical-train identity.
  var SOURCE_RAILWAY_LINE_SCOPE = (window.RuntimeConfig && window.RuntimeConfig.SOURCE_RAILWAY_LINE_SCOPE) || {};
  var _stationLineIndex = null;
  var _stationLineIndexSource = null;
  var _branchIndex = null;
  var _branchIndexSource = null;

  function getBranchIndex(lines) {
    if (_branchIndex && _branchIndexSource === lines) return _branchIndex;
    var idx = {};
    Object.keys(lines || {}).forEach(function(id) {
      var line = lines[id];
      if (!line || !line.branchOf) return;
      if (!idx[line.branchOf]) idx[line.branchOf] = [];
      idx[line.branchOf].push(id);
    });
    _branchIndex = idx;
    _branchIndexSource = lines;
    return idx;
  }

  function getStationLineIndex(lines) {
    if (_stationLineIndex && _stationLineIndexSource === lines) return _stationLineIndex;
    var idx = {};
    Object.keys(lines || {}).forEach(function(lid) {
      var line = lines[lid];
      if (!line || !line.stations) return;
      for (var i = 0; i < line.stations.length; i++) {
        var raw = String(line.stations[i] || "");
        if (!raw) continue;
        var norm = raw.replace(/-/g, "").toLowerCase();
        if (!idx[norm]) idx[norm] = [];
        idx[norm].push({ lineId: lid, stationIndex: i });
      }
    });
    _stationLineIndex = idx;
    _stationLineIndexSource = lines;
    return idx;
  }

  // Vehicle identity has one authority. Rendering/icon rules must never infer
  // a train class back into the operational data model.
  function resolveTrainClass(vehCtx) {
    try {
      if (window.TrainVehicle && typeof window.TrainVehicle.resolve === 'function') {
        return window.TrainVehicle.resolve(vehCtx).name || '';
      }
    } catch(e) {}
    return '';
  }

  function _uniqueTimetableRailwayForTrain(operatorKey, trainNumber) {
    if (!operatorKey || !trainNumber) return "";
    var src = window.ODPT_TIMETABLES || {};
    var rows = src[operatorKey] || [];
    // Some loaders store operator aliases differently; compare normalized
    // operator keys, but never cross operator boundaries.
    if (!rows.length) {
      var want = TransitConstants && typeof TransitConstants.normalizeOp === "function"
        ? TransitConstants.normalizeOp(operatorKey) : String(operatorKey);
      Object.keys(src).forEach(function(k) {
        if (rows.length) return;
        var nk = TransitConstants && typeof TransitConstants.normalizeOp === "function"
          ? TransitConstants.normalizeOp(k) : String(k);
        if (nk === want) rows = src[k] || [];
      });
    }
    var railways = {};
    rows.forEach(function(tt) {
      if (!tt) return;
      var n = tt["odpt:trainNumber"] || tt["odpt:train"] || "";
      if (String(n) !== String(trainNumber)) return;
      var rw = tt["odpt:railway"] || "";
      if (!rw) return;
      var parts = String(rw).split(":");
      var shortName = parts.length > 1 ? parts[parts.length - 1] : String(rw);
      if (shortName) railways[shortName] = true;
    });
    var keys = Object.keys(railways);
    return keys.length === 1 ? keys[0] : "";
  }

  // Realtime records without fromStation cannot establish position truth, but
  // may still carry train-level evidence (vehicle type, destination, train no).
  // Keep that evidence separate so timetable estimation can consume it later
  // without pretending the incomplete record is a live position.
  var _realtimeEvidenceWithoutPosition = {};

  function loadTrainPositions() {
    try {
      // Position truth must come only from the dedicated realtime container.
      // Realtime positions come only from the dedicated ODPT position store.
      var positionSource = window.ODPT_TRAIN_POSITIONS;
      if (!positionSource) return;
      allLines = (window.DataLayer && window.DataLayer.getAllLines) ? window.DataLayer.getAllLines() : {};
      if (!allLines || Object.keys(allLines).length === 0) {
        // v4.3.413: DataLayer 未就绪时延迟重试（最多 30 次），
        // 避免 ODPT 列车位置先于线路数据到达导致静默 return、实时位置永久丢失
        if (!loadTrainPositions._retry) loadTrainPositions._retry = 0;
        if (loadTrainPositions._retry < 30) {
          loadTrainPositions._retry++;
          setTimeout(loadTrainPositions, 300);
        }
        return;
      }
      loadTrainPositions._retry = 0;
      var _previousPosMap = odptData.realtimePositions || {};
      posMap = {};
      odptData.trains = {};
      // Snapshot-scoped: incomplete realtime evidence must not leak into later
      // polls after the source record disappears.
      _realtimeEvidenceWithoutPosition = {};
      Object.keys(positionSource).forEach(function(op) {
        var trains = positionSource[op] || [];
        odptData.trains[op] = trains;
        var top = TransitConstants && typeof TransitConstants.normalizeOp === "function" ? TransitConstants.normalizeOp(op) : op;
        trains.forEach(function(t) {
          if (!t) return;
          var fromId = t["odpt:fromStation"] || "";
          var stationKey = String(fromId).split(".").pop();
          var _rawTrainNo = t["odpt:trainNumber"] || t["odpt:train"] || "";
          if (!stationKey) {
            if (_rawTrainNo) {
              var _evKey = String(op) + "::" + String(_rawTrainNo);
              _realtimeEvidenceWithoutPosition[_evKey] = {
                operator: op,
                trainNumber: _rawTrainNo,
                railway: t["odpt:railway"] || "",
                destinationStation: t["odpt:destinationStation"] || "",
                vehicleType: t["odpt:vehicleType"] || t["vehicleType"] || "",
                observedAt: Date.now()
              };
              if ((t["odpt:vehicleType"] || t["vehicleType"]) &&
                  window.TrainVehicle && typeof window.TrainVehicle.registerVehicle === "function") {
                window.TrainVehicle.registerVehicle(_rawTrainNo, t["odpt:vehicleType"] || t["vehicleType"]);
              }
            }
            return;
          }
          var railway = t["odpt:railway"] || "";
          var railwayName = "";
          if (railway) {
            var railParts = String(railway).split(":");
            railwayName = railParts.length > 1 ? railParts[railParts.length - 1] : String(railway);
          }
          // Missing realtime railway identity may be recovered only from a
          // unique timetable match inside the same operator. Train number alone
          // is never treated as proof when it maps to multiple railways.
          if (!railwayName) {
            var _identityTrainNo = t["odpt:trainNumber"] || t["odpt:train"] || "";
            railwayName = _uniqueTimetableRailwayForTrain(op, _identityTrainNo);
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
          if (typeof destStations === "string") destStations = [destStations];
          var destStation = destStations.length > 0 ? String(destStations[0]).split(".").pop() : "";
          // InnerLoop / OuterLoop is direction evidence only. Keep the
          // source destination intact; rendering prefers a real terminal when present.
          var matchingLines = [];
          var _sourceScope = SOURCE_RAILWAY_LINE_SCOPE[railwayName] || [];
          var _stationIndex = getStationLineIndex(allLines);
          var _stationCandidates = _stationIndex[String(stationKey).replace(/-/g, "").toLowerCase()] || [];
          _stationCandidates.forEach(function(_candidate) {
            var lid = _candidate.lineId;
            var line = allLines[lid];
            if (!line || !line.stations) return;
            var lop = TransitConstants && typeof TransitConstants.normalizeOp === "function" ? TransitConstants.normalizeOp(line.operator) : line.operator;
            // v4.3.494: 直通系统（SotetsuDirect）列車 operator=JR-East でも、
            // explicit source scope may admit a cross-operator canonical line.
            if (lop !== top && _sourceScope.indexOf(lid) < 0) return;
            var idx = _candidate.stationIndex;
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
            // 2. Ambiguous source identity must stay unresolved.
            // A shared station, train number, or "longest line" is not evidence
            // of railway/operator ownership. Do not guess a target line when
            // canonical railway identity and verified through fallback cannot
            // disambiguate the realtime record.
            if (!targetLine) {
              console.debug("[DataFusion] ambiguous realtime line identity", {
                trainNumber: trainId,
                railway: railwayName,
                station: stationKey,
                candidates: matchingLines.map(function(ml) { return ml.lid; })
              });
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
              stationId: stationKey,
              sourceRailway: railwayName,
              trainId: trainId,
              trainNumber: trainId,  // v4.3.950: 纯车号——渲染层查 TRAIN_NO_VEHICLE 用（修复 key 不匹配）
              delayMin: delayMin,
              railDirection: directionName,
              destinationStation: destStation,
              trainType: rawType,
              typeName: typeName,
              estimated: false,
              positionSource: "realtime-api",
              // Preserve ODPT dynamic-data freshness metadata for the train UI.
              // Do not synthesize timestamps here: dc:date/dct:valid/frequency belong
              // to the source response and are needed to distinguish fresh vs stale.
              sourceUpdatedAt: t["dc:date"] || null,
              sourceValidUntil: t["dct:valid"] || null,
              sourceFrequency: t["odpt:frequency"] != null ? t["odpt:frequency"] : null
            };
            // Resolve vehicle identity once while the train still has realtime
            // source evidence. The renderer must consume this result rather than
            // independently guessing again from the current display line.
            var trainOperator = t["odpt:operator"] || "";
            var trainOpShort = trainOperator.replace('odpt.Operator:', '') || '';
            var odptVehicleType = t["odpt:vehicleType"] || t["vehicleType"] || "";
            positionData.odptVehicleType = odptVehicleType;
            // An explicit vehicle type carried by the realtime record is train-level
            // evidence. Register it before resolving so the same train number can
            // reuse that evidence without depending on the current display line.
            if (odptVehicleType && window.TrainVehicle && typeof window.TrainVehicle.registerVehicle === "function") {
              window.TrainVehicle.registerVehicle(trainId, odptVehicleType);
            }
            if (window.TrainVehicle && typeof window.TrainVehicle.resolve === "function") {
              try {
                var _rtVehicle = window.TrainVehicle.resolve({
                  lineId: lid,
                  operator: trainOpShort,
                  trainNumber: trainId,
                  stationIndex: idx,
                  trainType: rawType,
                  destinationStation: destStations,
                  trainId: trainId,
                  odptVehicleType: odptVehicleType
                });
                positionData.vehicleResolution = _rtVehicle || null;
                if (_rtVehicle) {
                  positionData.trainClass = _rtVehicle.name || "";
                  positionData.vehicleType = _rtVehicle.vehicleTypeStr || _rtVehicle.name || "";
                  positionData.vehicleSource = _rtVehicle.source || "";
                  positionData.vehicleConfidence = _rtVehicle.confidence || "none";
                  // Only evidence-backed resolutions may become authoritative
                  // realtime vehicle identity. S3 map/fleet/icon rules remain
                  // display estimates and must not be frozen as realtime truth.
                  var _rtEvidenceBacked = _rtVehicle.source === "odpt" ||
                    _rtVehicle.source === "manual" ||
                    _rtVehicle.source === "trainNo";
                  positionData.vehicleResolvedFromRealtime = _rtEvidenceBacked;
                  positionData.vehicleIconPath = _rtEvidenceBacked ? (_rtVehicle.iconPath || "") : "";
                }
              } catch(e) {}
            }
            // v4.3.6xx: 双向直通列车处理
            // 1. 临海线的车（operator=TWR）开到JR区间了 → 在JR线路图上显示临海线车型
            // v4.3.939: 存车自己的 operator（渲染层判断直通车、按车籍选图标，治跨线"变身"）
            positionData.trainOperator = trainOperator.replace('odpt.Operator:', '') || '';
            var isRinkaiTrain = (trainOperator === 'odpt.Operator:TWR' || trainOperator === 'TWR');
            // 临海线（TWR）列车开到了 JR 区间（Saikyo/Kawagoe）→ 用 Rinkai 车型
            // 通过 ThroughService 判断当前 lid 是否与 Rinkai 直通
            var _tsRinkaiPartner = (window.ThroughService && window.ThroughService.getDirectThroughLines) ? (window.ThroughService.getDirectThroughLines(lid) || []) : [];
            if (isRinkaiTrain && _tsRinkaiPartner.indexOf('Rinkai') >= 0) {
              // Keep an explicit realtime resolution authoritative. Rinkai is a
              // fallback context only when the source record itself did not
              // identify a usable vehicle.
              positionData.trainClass = positionData.trainClass || resolveTrainClass(
                { lineId: 'Rinkai', operator: 'TWR', trainNumber: trainId, stationIndex: idx, trainType: rawType, destinationStation: destStations, trainId: trainId + '_' + idx },
                'Rinkai', 'TWR', trainId + '_' + idx, idx, rawType
              );
              positionData.isRinkaiThrough = true;
            } else {
              // v5: 车型判断（数据层）——用列车自己的operator判断，不是当前线路的operator
              // 这样直通过来的车（比如东急的车开到半藏门线）就会显示东急的车型，而不是地铁的车型
              try {
                // 从odpt:operator提取operator简称（去掉odpt.Operator:前缀）
                positionData.trainClass = positionData.trainClass || resolveTrainClass(
                  { lineId: lid, operator: trainOpShort, trainNumber: trainId, stationIndex: idx, trainType: rawType, destinationStation: destStations, trainId: trainId + '_' + idx },
                  lid, trainOpShort, trainId + '_' + idx, idx, rawType
                );
              } catch(e) {}
            }
            // Destination on a partner line is routing intent, not position
            // evidence. Never synthesize a partner-line realtime position from
            // destination alone. Cross-line continuity must be confirmed by
            // timetable/running-chain evidence before rendering on that line.
            if (existingIdx >= 0) {
              posMap[lid][existingIdx] = positionData;
            } else {
              posMap[lid].push(positionData);
            }
          }
        });
      });
      odptData.realtimePositions = posMap;

      // ===== Estimate positions only where official realtime is not authoritative/full =====
      function getRealtimePositionPolicy(lineId) {
        try {
          var cfg = window.RuntimeConfig || {};
          var model = cfg.REALTIME_POSITION_POLICY || {};
          var linePolicy = model.lines && model.lines[lineId];
          if (linePolicy && linePolicy.mode) return linePolicy;
          return { mode: model.defaultMode || "HYBRID" };
        } catch(e) {
          return { mode: "UNKNOWN" };
        }
      }

      function hasAuthoritativeRealtime(lineId) {
        return getRealtimePositionPolicy(lineId).mode === "FULL";
      }

      function mayUseTimetablePosition(lineId) {
        var mode = getRealtimePositionPolicy(lineId).mode;
        return mode !== "FULL";
      }

      // Generic coverage evaluator. Line-specific facts live only in RuntimeConfig.
      // SEGMENTED accepts coveredSegments and/or excludedSegments as station-id ranges.
      // Timetable positions are allowed only where realtime is not authoritative.
      function _policyStationIndex(line, stationId) {
        if (!line || !line.stations || stationId == null) return -1;
        var key = String(stationId).split(".").pop();
        var idx = line.stations.indexOf(key);
        if (idx >= 0) return idx;
        var norm = key.replace(/[-_]/g, "").toLowerCase();
        for (var i = 0; i < line.stations.length; i++) {
          if (String(line.stations[i]).replace(/[-_]/g, "").toLowerCase() === norm) return i;
        }
        return -1;
      }

      function _positionTouchesRange(position, line, range) {
        if (!position || !line || !range) return false;
        var a = _policyStationIndex(line, range.fromStation);
        var b = _policyStationIndex(line, range.toStation);
        if (a < 0 || b < 0) return false; // fail open: never suppress timetable on bad config
        var lo = Math.min(a, b), hi = Math.max(a, b);
        var p0 = Number(position.stationIndex);
        var p1 = position.segmentToIndex == null ? p0 : Number(position.segmentToIndex);
        if (!isFinite(p0)) return false;
        if (!isFinite(p1)) p1 = p0;
        return Math.max(Math.min(p0, p1), lo) <= Math.min(Math.max(p0, p1), hi);
      }

      function mayUseTimetableEstimate(lineId, position) {
        var policy = getRealtimePositionPolicy(lineId);
        var mode = policy.mode || "UNKNOWN";
        if (mode === "FULL") return false;
        if (mode !== "SEGMENTED") return true; // HYBRID / COARSE / UNKNOWN
        var line = allLines[lineId];
        var excluded = policy.excludedSegments || [];
        for (var i = 0; i < excluded.length; i++) {
          if (_positionTouchesRange(position, line, excluded[i])) return true;
        }
        var covered = policy.coveredSegments || [];
        if (!covered.length) return true;
        for (var j = 0; j < covered.length; j++) {
          if (_positionTouchesRange(position, line, covered[j])) return false;
        }
        return true;
      }

      doEstimation = function() {
        try {
          if (window.TrainPositionEstimator && typeof window.TrainPositionEstimator.estimateAllPositions === "function") {
            // Timetable estimation consumes timetable rows only; never fall back to the
            // Timetable estimation reads only the dedicated timetable store.
            var timetableSource = window.ODPT_TIMETABLES || {};
            var estimated = window.TrainPositionEstimator.estimateAllPositions(
              allLines,
              timetableSource,
              odptData.delayInfo,
              posMap
            );

            // Timetable resolution is where canonical runningChainId becomes
            // available. Bridge realtime evidence onto it only when a train
            // number maps to exactly one resolved chain in this estimation pass.
            var _chainsByTrainNumber = {};
            Object.keys(estimated).forEach(function(_vlid) {
              (estimated[_vlid] || []).forEach(function(_ep) {
                if (!_ep || !_ep.trainNumber || !_ep.runningChainId) return;
                var _tn = String(_ep.trainNumber);
                if (!_chainsByTrainNumber[_tn]) _chainsByTrainNumber[_tn] = {};
                _chainsByTrainNumber[_tn][_ep.runningChainId] = true;
              });
            });
            Object.keys(posMap).forEach(function(_vlid) {
              (posMap[_vlid] || []).forEach(function(_rp) {
                if (!_rp || _rp.vehicleResolvedFromRealtime !== true) return;
                if (!_rp.runningChainId && _rp.trainNumber && _chainsByTrainNumber[String(_rp.trainNumber)]) {
                  var _chainIds = Object.keys(_chainsByTrainNumber[String(_rp.trainNumber)]);
                  if (_chainIds.length === 1) _rp.runningChainId = _chainIds[0];
                }
                _rememberChainVehicle(_rp);
              });
            });
            // Realtime rows without fromStation cannot provide position, but an
            // explicit official vehicleType may still bind to a uniquely resolved
            // timetable chain for the same train number. Never create a position
            // from this evidence and never bind when chain identity is ambiguous.
            Object.keys(_realtimeEvidenceWithoutPosition).forEach(function(_evKey) {
              var _ev = _realtimeEvidenceWithoutPosition[_evKey];
              if (!_ev || !_ev.trainNumber || !_ev.vehicleType) return;
              var _evChains = _chainsByTrainNumber[String(_ev.trainNumber)] || {};
              var _evChainIds = Object.keys(_evChains);
              if (_evChainIds.length !== 1) return;
              var _evResolution = (window.TrainVehicle && typeof window.TrainVehicle.resolve === "function")
                ? window.TrainVehicle.resolve({
                    trainNumber: _ev.trainNumber,
                    odptVehicleType: _ev.vehicleType
                  }) : null;
              if (!_evResolution || !_evResolution.iconPath) return;
              _rememberChainVehicle({
                runningChainId: _evChainIds[0],
                trainClass: _evResolution.name || "",
                vehicleType: _evResolution.vehicleTypeStr || _ev.vehicleType,
                vehicleIconPath: _evResolution.iconPath,
                vehicleSource: _evResolution.source || "odpt",
                vehicleConfidence: _evResolution.confidence || "high",
                vehicleResolution: _evResolution,
                vehicleResolvedFromRealtime: true
              });
            });
            // High-confidence timetable/manual resolution can seed the same
            // physical-chain registry before inheritance. This closes the old
            // one-way path where only realtime evidence could survive a line or
            // operator boundary.
            Object.keys(estimated).forEach(function(_vlid) {
              (estimated[_vlid] || []).forEach(_rememberChainVehicle);
            });
            Object.keys(estimated).forEach(function(_vlid) {
              (estimated[_vlid] || []).forEach(_inheritChainVehicle);
            });

            // Keep registry lifetime scoped to chains that still exist in the
            // current realtime/timetable snapshot. This prevents a long-lived
            // browser tab from reusing stale vehicle identity if a chain id is
            // later recycled by upstream timetable data.
            var _activeChainIds = {};
            Object.keys(posMap).forEach(function(_vlid) {
              (posMap[_vlid] || []).forEach(function(_p) {
                if (_p && _p.runningChainId) _activeChainIds[_p.runningChainId] = true;
              });
            });
            Object.keys(estimated).forEach(function(_vlid) {
              (estimated[_vlid] || []).forEach(function(_p) {
                if (_p && _p.runningChainId) _activeChainIds[_p.runningChainId] = true;
              });
            });
            Object.keys(_chainVehicleRegistry).forEach(function(_cid) {
              var _cv = _chainVehicleRegistry[_cid];
              // Do not erase confirmed identity on the first missing realtime
              // poll. A train can enter a no-signal/no-public-position segment
              // while its timetable running chain remains valid. Expire only
              // after a bounded dropout window; never use this cache as position.
              if (!_activeChainIds[_cid] && (!_cv || !_cv.lastSeenAt ||
                  (Date.now() - _cv.lastSeenAt) > _CHAIN_EVIDENCE_TTL_MS)) {
                delete _chainVehicleRegistry[_cid];
              }
            });
            var estCount = 0;
            Object.keys(estimated).forEach(function(lid) {
              // Full official realtime coverage owns position truth. Timetable remains loaded
              // for destination/service/running-chain evidence but must not synthesize positions.
              if (!mayUseTimetablePosition(lid)) return;
              var _est = estimated[lid];
              if (!_est || !_est.length) return;
              // v4.3.1002: 无条件合并（去重：实时/直通插入优先，推定补缺）——
              // 此前 posMap 非空（有实时或直通插入列车）时推定列车全丢，
              // 导致副都心/千代田/日比谷/東西 等直通线页面只剩 1-3 列直通插入车（卡 join/末站），
              // 自社时刻表列车（银座/丸ノ内等无直通实时插入的线推定全量正常）完全缺失。
              if (!posMap[lid] || posMap[lid].length === 0) {
                posMap[lid] = _est.filter(function(p) { return mayUseTimetableEstimate(lid, p); });
                estCount += posMap[lid].length;
              } else {
                var _haveId = {};
                posMap[lid].forEach(function(p) { if (p && _positionIdentity(p)) _haveId[_positionIdentity(p)] = true; });
                var _addN = 0;
                _est.forEach(function(p) {
                  if (p && _positionIdentity(p) && !_haveId[_positionIdentity(p)] && mayUseTimetableEstimate(lid, p)) {
                    posMap[lid].push(p);
                    _haveId[_positionIdentity(p)] = true;
                    _addN++;
                  }
                });
                estCount += _addN;
                // v4.3.929: 实时位置有列车但无 destinationStation → 从推定位置补终点站
                var _estById = {};
                _est.forEach(function(p) { if (p && _positionIdentity(p)) _estById[_positionIdentity(p)] = p; });
                posMap[lid].forEach(function(p) {
                  if (p && _positionIdentity(p) && _estById[_positionIdentity(p)] && !p.destinationStation) {
                    p.destinationStation = _estById[_positionIdentity(p)].destinationStation;
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
              if (!mayUseTimetablePosition(manualLineId)) return;
              var manualTT = window[manualLineId + '_MANUAL_TIMETABLES'];
              if (!manualTT || !Array.isArray(manualTT) || manualTT.length === 0) return;
              try {
                manualTT.forEach(function(tt) { if (tt) tt._positionSource = "station-timetable"; });
                var mLine = allLines[manualLineId];
                if (mLine && mLine.stations) {
                  var mEst = window.TrainPositionEstimator.estimateLinePositions(
                    manualLineId, mLine, manualTT, odptData.delayInfo, mLine.operator
                  );
                  if (mEst && mEst.length > 0) {
                    if (!posMap[manualLineId]) posMap[manualLineId] = [];
                    var haveId = {};
                    posMap[manualLineId].forEach(function(p) { if (p && _positionIdentity(p)) haveId[_positionIdentity(p)] = true; });
                    var mAdded = 0;
                    mEst.forEach(function(p) {
                      if (p && _positionIdentity(p) && !haveId[_positionIdentity(p)] && mayUseTimetableEstimate(manualLineId, p)) {
                        p.positionSource = "station-timetable";
                        posMap[manualLineId].push(p);
                        haveId[_positionIdentity(p)] = true;
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
          // Full official realtime lines never need timetable position fallback, even when
          // the current API snapshot is legitimately empty (e.g. no trains at this moment).
          if (!mayUseTimetablePosition(lid)) return;
          var hasRealtime = posMap[lid] && posMap[lid].length > 0;
          var hasTimetable = timetableOps.indexOf(line.operator) >= 0;
          // Check timetable presence with the same canonical -> ODPT railway
          // identity used by the estimator. Internal branch ids do not have to
          // appear literally in odpt:railway.
          if (hasTimetable && window.ODPT_TIMETABLES[line.operator]) {
            var _ttRailwayCode = (window.ODPTClient && window.ODPTClient.LINE_RAILWAY_CODE &&
              window.ODPTClient.LINE_RAILWAY_CODE[lid]) || lid;
            var lineTimetables = window.ODPT_TIMETABLES[line.operator].filter(function(t) {
              var railway = t['odpt:railway'] || '';
              return railway.indexOf(lid) >= 0 || railway.indexOf('.' + lid) >= 0 ||
                railway.indexOf(_ttRailwayCode) >= 0 || railway.indexOf('.' + _ttRailwayCode) >= 0;
            });
            hasTimetable = lineTimetables.length > 0;
          }
          if (!hasRealtime && !hasTimetable && window.ODPTClient && window.ODPTClient.supports(line.operator, 'trainTimetable')) {
            linesNeedingTimetable.push({ lineId: lid, operator: line.operator, name: line.name || line.nameJa });
          }
          // v4.3.446: 支線（branchOf 子線、丸ノ内線支線等）の時刻表も本体と同じく必要——
          // 支線は単独カード化せず体系内でリアルタイム配備するため、本体の需要に依存せず常に確保する
          var _branchIds3 = [];
          if (line && line.branches) _branchIds3 = line.branches.slice();
          var _indexedBranches3 = getBranchIndex(allLines)[lid] || [];
          _indexedBranches3.forEach(function(_bid3) {
            if (_branchIds3.indexOf(_bid3) < 0) _branchIds3.push(_bid3);
          });
          if (_branchIds3.length > 0) {
            _branchIds3.forEach(function(bid3) {
              var bl3 = allLines[bid3];
              if (!bl3 || !bl3.operator) return;
              // Loading a branch's own timetable is valid for every topology.
              // Parent-data inheritance is a separate concern and is allowed
              // only when LineServiceRelations proves THROUGH_SERVICE.
              var _branchOperationMode3 = (window.LineServiceRelations &&
                typeof window.LineServiceRelations.getBranchOperationMode === "function")
                ? window.LineServiceRelations.getBranchOperationMode(lid, bid3)
                : "UNKNOWN";
              bl3._branchOperationMode = _branchOperationMode3;
              if (!mayUseTimetablePosition(bid3)) return;
              var hasRt3 = posMap[bid3] && posMap[bid3].length > 0;
              var hasTt3 = false;
              if (window.ODPT_TIMETABLES && window.ODPT_TIMETABLES[bl3.operator]) {
                var _brRailwayCode3 = (window.ODPTClient && window.ODPTClient.LINE_RAILWAY_CODE &&
                  window.ODPTClient.LINE_RAILWAY_CODE[bid3]) || bid3;
                var lt3 = window.ODPT_TIMETABLES[bl3.operator].filter(function(t) {
                  var railway = t['odpt:railway'] || '';
                  return railway.indexOf(bid3) >= 0 || railway.indexOf('.' + bid3) >= 0 ||
                    railway.indexOf(_brRailwayCode3) >= 0 || railway.indexOf('.' + _brRailwayCode3) >= 0;
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

      try {
        var _positionDirty = {};
        var _positionKeys = {};
        Object.keys(_previousPosMap || {}).forEach(function(id) { _positionKeys[id] = true; });
        Object.keys(posMap || {}).forEach(function(id) { _positionKeys[id] = true; });
        Object.keys(_positionKeys).forEach(function(id) {
          var before = _previousPosMap[id] || [];
          var after = posMap[id] || [];
          if (before.length !== after.length) { _positionDirty[id] = true; return; }
          for (var pi = 0; pi < after.length; pi++) {
            var a = after[pi] || {}, b = before[pi] || {};
            if (_positionIdentity(a) !== _positionIdentity(b) || a.stationIndex !== b.stationIndex ||
                a.delay !== b.delay || a.destinationStation !== b.destinationStation ||
                a.vehicleIconPath !== b.vehicleIconPath) { _positionDirty[id] = true; break; }
          }
        });
        fuseDirty(Object.keys(_positionDirty));
      } catch(e) { console.debug("[DataFusion] loadTrainPositions->fuseDirty error:", e.message); }

      // Realtime positions are now pushed only after the complete posPromises batch
      // is settled and DataLayer is ready (odpt-unified pushTrainPositions). The old
      // unconditional 3s calibration reran the entire assignment + estimation + fusion
      // pipeline even when no source data changed, doubling main-thread work on mobile.
      // Keep the compatibility flag but do not schedule an evidence-free full rerun.
      loadTrainPositions._calibrated = true;
    } catch(e) { console.debug("[DataFusion] loadTrainPositions error:", e.message); }
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
        // Timetable prefetch is one-hop only. Do not turn graph reachability
        // into an assumed train chain; further segments are loaded when their
        // own evidence requires them.
        var throughLines = (window.ThroughService && window.ThroughService.getDirectThroughLines) ?
          (window.ThroughService.getDirectThroughLines(l.lineId) || []) : [];
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
      var checkLines = (window.DataLayer && window.DataLayer.getAllLines) ? window.DataLayer.getAllLines() : {};
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
  // v4.3.1016: ODPT 有时刻表也尝试加载 manual——ODPT 时刻表无 vehicleType（53939 条实测 0 条带车型），
  // manual 时刻表带 vehicleType（172/178 文件）——车型判定需 manual 实证（S0/S2）。
  // 404（该线无 manual 文件）→ 标记 _manualMissing 并回退 ODPT，零重复请求。
  var _manualMissing = {};

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
        // Position authority and vehicle evidence are separate concerns.
        // FULL realtime lines must still be allowed to lazy-load manual timetable
        // records because those records may carry vehicleType evidence that ODPT
        // TrainTimetable does not. mayUseTimetableEstimate() below remains the
        // gate that prevents manual data from synthesizing positions on FULL lines.
        var varName = lineId + '_MANUAL_TIMETABLES';
        if (window[varName]) { resolve(true); return; }
        // v4.3.1016: ODPT 已有该线时刻表（首都圈等）→ 仍尝试加载 manual（车型实证）：
        // ODPT 时刻表无 vehicleType，manual 带 vehicleType；文件不存在（404）由 onerror 回退 ODPT。
        if (window.ODPT_TIMETABLES && _hasOdptTimetable(lineId)) {
          if (_manualMissing[lineId]) { resolve(true); return; }
          // fall through 到加载流程；onerror 时回退 ODPT
        }
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
                manualTT.forEach(function(tt) {
                  if (!tt) return;
                  tt._positionSource = "station-timetable";
                  // Manual timetable vehicleType is train-level evidence even
                  // when FULL realtime policy forbids timetable-derived position.
                  var _mTrainNo = tt["odpt:trainNumber"] || tt["odpt:train"] || "";
                  var _mVehicle = tt["vehicleType"] || tt["odpt:vehicleType"] || "";
                  if (_mTrainNo && _mVehicle && window.TrainVehicle &&
                      typeof window.TrainVehicle.registerVehicle === "function") {
                    window.TrainVehicle.registerVehicle(_mTrainNo, _mVehicle);
                  }
                });
                var mEst = window.TrainPositionEstimator.estimateLinePositions(
                  lineId, mLine, manualTT, odptData.delayInfo, mLine.operator
                );
                if (mEst && mEst.length > 0) {
                  if (!posMap[lineId]) posMap[lineId] = [];
                  var haveId = {};
                  posMap[lineId].forEach(function(p) { if (p && _positionIdentity(p)) haveId[_positionIdentity(p)] = true; });
                  var mAdded = 0;
                  mEst.forEach(function(p) {
                    if (p && _positionIdentity(p) && !haveId[_positionIdentity(p)] && mayUseTimetableEstimate(lineId, p)) {
                      p.positionSource = "station-timetable";
                      posMap[lineId].push(p);
                      haveId[_positionIdentity(p)] = true;
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
          s.onerror = function() {
            _manualMissing[lineId] = true;
            // ODPT 有该线时刻表 → 回退 ODPT（零阻断）；否则才报缺数据
            if (window.ODPT_TIMETABLES && _hasOdptTimetable(lineId)) { res(true); }
            else { rej(new Error('manual file not found (ODPT 无数据且无 manual 文件?)')); }
          };
        });
        _manualLoading[lineId] = p;
        p.then(function() { delete _manualLoading[lineId]; }, function() { delete _manualLoading[lineId]; });
        document.head.appendChild(s);
        p.then(resolve, reject);
      } catch(e) { reject(e); }
    });
  }

  window.DataFusion = {
    init: init, fuseAll: fuseAll, fuseDirty: fuseDirty, subscribe: subscribe,
    getFusedData: function() { return window.DATA_FUSION || _lastFusedData || null; },
    getLine: function(lineId) { var data = window.DATA_FUSION || _lastFusedData; return data && data.lines ? data.lines[lineId] : null; },
    getOdptData: function() { return odptData; },
    getRealtimePositions: function(lineId) { return odptData.realtimePositions[lineId] || []; },
    loadTrainPositions: loadTrainPositions,
    getCachedData: function() { return _lastFusedData; },
    saveToCache: saveToCache, refresh: function() { return fuseAll(); },
    // v4.3.528: 手动时刻表按需加载（ODPT 无时刻表的 JR 地方线，打开线路时才注入该线文件）
    ensureManualTimetable: ensureManualTimetable,
    // Through-service runtime provider: direct canonical neighbours only.
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
