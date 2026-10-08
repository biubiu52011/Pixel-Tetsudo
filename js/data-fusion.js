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
  // estimates. Only already-EXACT vehicle identity may enter the running-chain
  // registry; confidence/source labels alone never manufacture vehicle identity.
  var _chainVehicleRegistry = {};
  // Keep confirmed realtime evidence across a short source dropout. Position
  // truth still comes from the current snapshot; this bridge only preserves
  // physical-train identity/vehicle evidence while timetable fallback takes over.
  var _CHAIN_EVIDENCE_TTL_MS = 3 * 60 * 1000;
  function _vehicleEvidenceRank(p) {
    if (!p) return 0;
    var r = p.vehicleResolution || null;
    var sources = r && Array.isArray(r.sources) ? r.sources : [];
    var src = p.vehicleSource || (r && r.source) || "";
    if (p.vehicleResolvedFromRealtime === true || sources.indexOf("realtime") >= 0 || src === "realtime") return 5;
    if (p.vehicleResolvedFromRealtimeDerived === true || sources.indexOf("realtime-derived") >= 0 || src === "realtime-derived") return 4;
    if (sources.indexOf("structural") >= 0 || src === "structural" || src === "formation-evidence") return 3;
    if (sources.indexOf("operation-assignment-provider") >= 0 || sources.indexOf("odpt") >= 0 ||
        sources.indexOf("timetable") >= 0 || src === "operation-assignment-provider" || src === "odpt" || src === "timetable") return 2;
    if (sources.indexOf("manual") >= 0 || src === "manual") return 1;
    return 0;
  }
  function _projectVehicleResolution(p, resolution, inherited) {
    if (!p) return p;
    var r = resolution || null;
    p.vehicleResolution = r;
    p.trainClass = r && r.identityStatus === "EXACT" ? (r.name || "") : "";
    p.vehicleType = r && r.identityStatus === "EXACT" ? (r.vehicleTypeStr || r.name || "") : "";
    p.vehicleSource = r ? (r.source || "") : "";
    p.vehicleConfidence = r ? (r.confidence || "none") : "none";
    p.vehicleIdentityStatus = r ? (r.identityStatus || "UNKNOWN") : "UNKNOWN";
    p.vehicleIdentityReason = r ? (r.identityReason || "") : "no-vehicle-evidence";
    p.vehicleIconPath = r && r.identityStatus === "EXACT" ? (r.iconPath || "") : "";
    var _sources = r && Array.isArray(r.sources) ? r.sources : [];
    p.vehicleResolvedFromRealtime = !!(r && r.identityStatus === "EXACT" &&
      (_sources.indexOf("realtime") >= 0 || r.source === "realtime"));
    p.vehicleResolvedFromRealtimeDerived = !!(r && r.identityStatus === "EXACT" &&
      (_sources.indexOf("realtime-derived") >= 0 || r.source === "realtime-derived"));
    p.vehicleResolvedUpstream = !!(r && r.identityStatus === "EXACT");
    p.vehicleInheritedFromRunningChain = inherited === true;
    return p;
  }
  function _rememberChainVehicle(p) {
    if (!p || !p.runningChainId) return;
    var resolution = p.vehicleResolution || null;
    // The registry stores the canonical decision object, not a second mutable
    // copy of all projected vehicle fields.
    if (!resolution || resolution.identityStatus !== "EXACT" || !resolution.name) return;
    var _incomingRank = _vehicleEvidenceRank(p);
    var _existing = _chainVehicleRegistry[p.runningChainId];
    if (_existing) {
      var _existingRank = _existing.evidenceRank || 0;
      var _existingName = _existing.resolution && _existing.resolution.name || "";
      var _sameVehicle = _existingName && _existingName === resolution.name;
      if (!_sameVehicle && _existingRank >= _incomingRank) {
        _existing.lastSeenAt = Date.now();
        return;
      }
    }
    _chainVehicleRegistry[p.runningChainId] = {
      resolution: resolution,
      formationId: p.vehicleFormationId || "",
      formationCandidates: (p.vehicleFormationCandidates || []).slice(),
      evidenceRank: _incomingRank,
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
    var currentResolution = p.vehicleResolution || null;
    if (currentResolution && currentResolution.identityStatus === "EXACT" &&
        _vehicleEvidenceRank(p) >= (v.evidenceRank || 0)) return p;
    _projectVehicleResolution(p, v.resolution, true);
    p.vehicleFormationId = v.formationId || "";
    p.vehicleFormationCandidates = (v.formationCandidates || []).slice();
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

  // Lightweight rolling performance telemetry for runtime diagnosis. Keep only
  // recent samples so instrumentation cannot become its own memory/log problem.
  var _perfSamples = [];
  var _lastEstimationMinute = -1;
  var _lastFusionEmitAt = 0;
  var _resumeFallbackTimer = null;
  // Cache per-operator runinfo signatures. updateOdptData receives fresh
  // payload objects on each poll; serializing both the previous and next
  // payload doubled synchronous work even when nothing changed.
  var _delayInfoSignatures = {};
  var _resolutionLineIdsSource = null;
  var _resolutionLineIds = [];
  var _lastCacheSavedFusionAt = 0;
  var _minuteEstimationGeneration = 0;

  function _getResolutionLineIds() {
    var src = window.UNIFIED_LINES || {};
    if (_resolutionLineIdsSource !== src) {
      _resolutionLineIdsSource = src;
      _resolutionLineIds = Object.keys(src);
    }
    return _resolutionLineIds;
  }
  function _perfNow() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  function _perfRecord(name, startedAt, meta) {
    var ms = Math.round((_perfNow() - startedAt) * 10) / 10;
    _perfSamples.push({ name: name, ms: ms, at: Date.now(), meta: meta || null });
    if (_perfSamples.length > 40) _perfSamples.splice(0, _perfSamples.length - 40);
    if (ms >= 200 && window.console && console.warn) console.warn("[PixelPerf]", name, ms + "ms", meta || "");
    return ms;
  }

  // ========== 融合轮询生命周期（v4.3.9xx E1: visibilitychange 暂停/恢复） ==========
  // 后台标签页暂停 15s fuseAll + saveToCache；回前台立即融合一次再恢复周期——
  // 后台页不再产生计算与 IDB 写入开销（配合 odpt-unified 的拉取暂停双管齐下）。
  function startFusionPolling() {
    if (_cacheTimer) return;
    // Fusion is source-driven: ODPT updates and manual timetable completion
    // use dirty fusion; initialization and explicit refreshes retain fuseAll().
    // A second
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
        // ODPT owns foreground refresh and immediately requests fresh realtime
        // data. Avoid racing it with an eager full-network fuse. Keep a bounded
        // fallback for pages where ODPT is absent or the refresh never emits.
        var resumedAt = Date.now();
        if (_resumeFallbackTimer) clearTimeout(_resumeFallbackTimer);
        _resumeFallbackTimer = setTimeout(function() {
          _resumeFallbackTimer = null;
          if (_lastFusionEmitAt < resumedAt) {
            try { fuseAll(); } catch(e) { console.debug("[DataFusion] visible fallback->fuseAll error:", e.message); }
          }
        }, 1500);
        startFusionPolling();
      }
    } catch(e) { console.debug("[DataFusion] visibilitychange handler error:", e.message); }
  });

  window.addEventListener('pageshow', function(event) {
    if (!event.persisted || document.hidden) return;
    // ODPT requests a fresh snapshot on the same BFCache restore. Give it a
    // bounded window to emit first; otherwise converge the existing sources so
    // the UI cannot remain frozen on the pre-background snapshot.
    var resumedAt = Date.now();
    if (_resumeFallbackTimer) clearTimeout(_resumeFallbackTimer);
    _resumeFallbackTimer = setTimeout(function() {
      _resumeFallbackTimer = null;
      if (_lastFusionEmitAt < resumedAt) {
        try { fuseAll(); } catch(e) { console.debug("[DataFusion] pageshow fallback->fuseAll error:", e.message); }
      }
    }, 1500);
    startFusionPolling();
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
  // One storage snapshot per fusion pass; avoid synchronous localStorage reads
  // for every line in a network-wide or dirty-line reconciliation.
  var _lastGoodFusionSnapshot = null;
  function readLastGoodSnapshot() {
    try {
      var raw = localStorage.getItem(LAST_GOOD_KEY) || "{}";
      if (raw !== _lastGoodCacheRaw) {
        _lastGoodCacheParsed = JSON.parse(raw);
        _lastGoodCacheRaw = raw;
      }
      return _lastGoodCacheParsed;
    } catch(e) { return {}; }
  }
  function getLastGoodDelay(lineId) {
    try {
      var v = (_lastGoodFusionSnapshot || readLastGoodSnapshot())[lineId];
      if (!v || !v.r || !v.r.status || !v.t) return null;
      if ((Date.now() - v.t) > LAST_GOOD_MAX_AGE_MS) return null;
      var st = v.r.status;
      if (st === "loading" || st === "no_data" || st === "no_odpt" || st === "unknown") return null;
      return {
        status: st,
        maxDelay: v.r.maxDelay == null ? null : v.r.maxDelay,
        interval: v.r.interval || null,
        direction: v.r.direction || null,
        effect: v.r.effect || null,
        impacts: Array.isArray(v.r.impacts) ? v.r.impacts : [],
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
    _lastFusionEmitAt = Date.now();
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
    var result = { status: "unknown", maxDelay: null, interval: null, direction: null, effect: null, impacts: [], cause: null };
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

  // Index each ODPT operator snapshot once. A full fusion previously scanned
  // the same TrainInformation array separately for every line.
  var _delayRecordIndex = typeof WeakMap === "function" ? new WeakMap() : null;
  function findScopedDelayRecord(records, op, code) {
    var key = String(op).toLowerCase() + "::" + String(code).toLowerCase();
    if (!_delayRecordIndex) {
      for (var i = 0; i < records.length; i++) {
        var rid = extractRailwayIdentity(records[i]);
        if (rid && String(rid.operator).toLowerCase() + "::" + String(rid.railwayCode).toLowerCase() === key) return records[i];
      }
      return null;
    }
    var index = _delayRecordIndex.get(records);
    if (!index) {
      index = Object.create(null);
      records.forEach(function(record) {
        if (!record) return;
        var rid = extractRailwayIdentity(record);
        if (!rid) return;
        var k = String(rid.operator).toLowerCase() + "::" + String(rid.railwayCode).toLowerCase();
        if (!Object.prototype.hasOwnProperty.call(index, k)) index[k] = record;
      });
      _delayRecordIndex.set(records, index);
    }
    return index[key] || null;
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
        var matched = findScopedDelayRecord(raw, op, code);
        if (matched) return parseODPTDelay(matched);
        // Never project another railway's incident onto this line. Operator-wide
        // TrainInformation arrays can contain unrelated lines; without a matching
        // railway identity there is no line-level evidence for this line.
        // Keep the line unresolved here so WebRunInfo/local/last-good/fallback
        // semantics decide its state instead of manufacturing a cross-line alert.
        return null;
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
      var delayInfo = apiInfo || webInfo || (_hasLocal && { status: localStatus.status, maxDelay: localStatus.maxDelay, interval: localStatus.interval, direction: localStatus.direction || null, effect: localStatus.effect || null, impacts: localStatus.impacts || [], cause: localStatus.cause }) || _lastGood || fallbackDelay;
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
      var _throughLines = (window.RunningChainResolver && typeof window.RunningChainResolver.getDirectThroughLines === "function")
        ? window.RunningChainResolver.getDirectThroughLines(lineId)
        : [];
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
          _chainMeta = window.RunningChainResolver.getResolutionContext(lineId, _getResolutionLineIds());
        }
      } catch(_ce) {}
      var _lineIdentity = buildLineIdentity(line, lineId);
      return { id: lineId, name: line.name, nameEn: line.nameEn || line.name, code: line.code, color: (window.LineOperationSystemsResolveColor && window.LineOperationSystemsResolveColor(lineId)) || line.color, operator: line.operator, region: line.region, type: line.type, image: line.image, stations: line.stations || [], durations: line.durations || [], intervalTotal: line.durationTotalMin || 0, realtimePositions: _rtPositions, delayInfo: delayInfo, lineIdentity: _lineIdentity, _chainMeta: _chainMeta, branchOf: line.branchOf || null, isSixShapedLoop: line.isSixShapedLoop === true, isDoubleColumnLoop: line.isDoubleColumnLoop === true, loopJunction: line.loopJunction || null, presentation: line.presentation || null };
    } catch(e) { console.debug("[DataFusion] fuseLine error for " + lineId + ":", e.message); return null; }
  }

  function _expandDirtyLines(seedIds, lines) {
    var dirty = {};
    (seedIds || []).forEach(function(id) { if (id && lines && lines[id]) dirty[id] = true; });
    var queue = Object.keys(dirty);
    var branches = getBranchIndex(lines || {});
    // A cursor avoids shifting the whole pending array for every dependency.
    for (var cursor = 0; cursor < queue.length; cursor++) {
      var id = queue[cursor];
      var line = lines[id] || {};
      var deps = [];
      try {
        if (window.SharedTrackPairs && window.SharedTrackPairs.getSharedLines) deps = deps.concat(window.SharedTrackPairs.getSharedLines(id) || []);
      } catch(e) {}
      try {
        if (window.RunningChainResolver && typeof window.RunningChainResolver.getDirectThroughLines === "function") {
          deps = deps.concat(window.RunningChainResolver.getDirectThroughLines(id) || []);
        }
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
    var _perfStart = _perfNow();
    try {
      var dlLines = (window.DataLayer && window.DataLayer.getAllLines) ? window.DataLayer.getAllLines() : null;
      if (!_lastFusedData || !_lastFusedData.lines || !dlLines) return fuseAll();
      _lastGoodFusionSnapshot = readLastGoodSnapshot();
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
      _lastGoodFusionSnapshot = null;
      _perfRecord("fuseDirty", _perfStart, { seeds: (seedIds || []).length, dirty: dirtyIds.length });
      return fusedData;
    } catch(e) {
      _lastGoodFusionSnapshot = null;
      _perfRecord("fuseDirty:error", _perfStart, { seeds: (seedIds || []).length });
      console.debug("[DataFusion] fuseDirty fallback:", e.message);
      return fuseAll();
    }
  }

  function fuseAll() {
    var _perfStart = _perfNow();
    try {
      _lastGoodFusionSnapshot = readLastGoodSnapshot();
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
      _lastGoodFusionSnapshot = null;
      _perfRecord("fuseAll", _perfStart, { lines: Object.keys(fusedLines).length });
      return fusedData;
    } catch(e) { _lastGoodFusionSnapshot = null; _perfRecord("fuseAll:error", _perfStart); console.error("[DataFusion] fuseAll error:", e.message); if (_lastFusedData) { emitUpdate(_lastFusedData); return _lastFusedData; } return null; }
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

  // Provider railway identifiers are normalized through the canonical source
  // identity adapter below; through-service topology is never inferred here.
  var allLines = null;
  var doEstimation = null;
  var posMap = {};
  // External provider railway names may differ from the canonical line id.
  // This is identity adaptation only; topology remains in railway_data.json.
  var SOURCE_RAILWAY_CANONICAL_LINE = (window.RuntimeConfig && window.RuntimeConfig.SOURCE_RAILWAY_CANONICAL_LINE) || {};
  var _stationLineIndex = null;
  var _stationLineIndexSource = null;
  var _branchIndex = null;
  var _branchIndexSource = null;
  var _timetablePresenceIndex = {};
  var _timetablePresenceStamp = "";

  function getTimetablePresenceIndex() {
    var src = window.ODPT_TIMETABLES || {};
    var parts = [];
    Object.keys(src).sort().forEach(function(op) {
      parts.push(op + ":" + (Array.isArray(src[op]) ? src[op].length : 0));
    });
    var stamp = parts.join("|");
    if (stamp === _timetablePresenceStamp) return _timetablePresenceIndex;
    var idx = {};
    Object.keys(src).forEach(function(op) {
      var rows = src[op];
      if (!Array.isArray(rows)) return;
      var opIdx = idx[op] = {};
      rows.forEach(function(t) {
        var rw = t && t["odpt:railway"];
        if (!rw) return;
        var raw = String(rw);
        var colon = raw.split(":");
        var tail = colon.length > 1 ? colon[colon.length - 1] : raw;
        var dots = tail.split(".");
        var railwayKey = dots[dots.length - 1] || "";
        if (railwayKey) opIdx[railwayKey] = true;
      });
    });
    _timetablePresenceIndex = idx;
    _timetablePresenceStamp = stamp;
    return idx;
  }

  function hasOdptTimetableForLine(lineId, operator) {
    var idx = getTimetablePresenceIndex();
    var op = operator || "";
    var normalized = TransitConstants && typeof TransitConstants.normalizeOp === "function" ? TransitConstants.normalizeOp(op) : op;
    var aliases = { "Rinkai": "TWR", "TsukubaExpress": "MIR" };
    var candidates = [op, normalized, aliases[op], aliases[normalized]].filter(Boolean);
    var code = (window.ODPTClient && window.ODPTClient.LINE_RAILWAY_CODE &&
      window.ODPTClient.LINE_RAILWAY_CODE[lineId]) || lineId;
    for (var i = 0; i < candidates.length; i++) {
      var oi = idx[candidates[i]];
      if (oi && (oi[lineId] || oi[code])) return true;
    }
    return false;
  }

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

  function _isFreshRealtimeRecord(record) {
    if (!record) return false;
    var now = Date.now();
    var validRaw = record["dct:valid"];
    if (validRaw) {
      var validMs = Date.parse(validRaw);
      // Explicit provider validity is authoritative. Invalid timestamps fail
      // closed because they cannot prove that a dynamic position is current.
      return !isNaN(validMs) && validMs >= now;
    }
    var updatedRaw = record["dc:date"];
    if (!updatedRaw) return true;
    var updatedMs = Date.parse(updatedRaw);
    if (isNaN(updatedMs)) return false;
    var frequency = Number(record["odpt:frequency"]);
    // Without dct:valid, bound freshness by the provider cadence when supplied.
    // Otherwise use 2 minutes: four normal 30s polling cycles, long enough for
    // transient network jitter but short enough not to present an old train as LIVE.
    var maxAgeMs = isFinite(frequency) && frequency > 0
      ? Math.max(60000, Math.min(frequency * 1000 * 4, 5 * 60 * 1000))
      : 2 * 60 * 1000;
    return (now - updatedMs) <= maxAgeMs;
  }

  // Realtime records without fromStation cannot establish position truth, but
  // may still carry train-level evidence (vehicle type, destination, train no).
  // Keep that evidence separate so timetable estimation can consume it later
  // without pretending the incomplete record is a live position.
  var _realtimeEvidenceWithoutPosition = {};

  function loadTrainPositions() {
    var _perfStart = _perfNow();
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
      // Snapshot-local lookup avoids scanning all previously placed trains
      // for every incoming record; preserve the original first-match behavior.
      var _positionIndexByLine = Object.create(null);
      // Service date/calendar are shared by all vehicle-evidence lookups in
      // this snapshot; calculate once instead of allocating a Date per train.
      var _snapshotNow = new Date();
      var _snapshotServiceDate = _snapshotNow.getFullYear() + "-" + String(_snapshotNow.getMonth() + 1).padStart(2, "0") + "-" + String(_snapshotNow.getDate()).padStart(2, "0");
      var _snapshotServiceDay = _snapshotNow.getDay();
      var _snapshotCalendarType = (_snapshotServiceDay === 0 || _snapshotServiceDay === 6) ? "holiday" : "weekday";
      var _vehicleResolveCalls = 0, _vehicleResolveMs = 0;
      var _vehicleEvidenceCalls = 0, _vehicleEvidenceMs = 0;
      // Build the ODPT railway-code reverse lookup once per position snapshot.
      // Keep source key order so ambiguous-code selection remains unchanged.
      var _railwayCodeLines = Object.create(null);
      var _railwayCodes = window.ODPTClient && window.ODPTClient.LINE_RAILWAY_CODE;
      if (_railwayCodes) Object.keys(_railwayCodes).forEach(function(id) {
        var code = _railwayCodes[id];
        if (!_railwayCodeLines[code]) _railwayCodeLines[code] = [];
        _railwayCodeLines[code].push(id);
      });
      odptData.trains = {};
      // Snapshot-scoped: incomplete realtime evidence must not leak into later
      // polls after the source record disappears.
      _realtimeEvidenceWithoutPosition = {};
      Object.keys(positionSource).forEach(function(op) {
        var trains = positionSource[op] || [];
        odptData.trains[op] = trains;
        var top = TransitConstants && typeof TransitConstants.normalizeOp === "function" ? TransitConstants.normalizeOp(op) : op;
        trains.forEach(function(t) {
          if (!t || !_isFreshRealtimeRecord(t)) return;
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
                trainOwner: t["odpt:trainOwner"] || t["trainOwner"] || "",
                observedAt: Date.now()
              };
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
          var trainId = t["odpt:train"] || t["odpt:trainNumber"] || "";
          var trainNumber = String(t["odpt:trainNumber"] || t["odpt:train"] || "");
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
          var _canonicalSourceLine = SOURCE_RAILWAY_CANONICAL_LINE[railwayName] || "";
          var _stationIndex = getStationLineIndex(allLines);
          var _stationCandidates = _stationIndex[String(stationKey).replace(/-/g, "").toLowerCase()] || [];
          _stationCandidates.forEach(function(_candidate) {
            var lid = _candidate.lineId;
            var line = allLines[lid];
            if (!line || !line.stations) return;
            var lop = TransitConstants && typeof TransitConstants.normalizeOp === "function" ? TransitConstants.normalizeOp(line.operator) : line.operator;
            // Cross-operator admission is allowed only for the canonical line
            // explicitly identified by the provider adapter. Through neighbours
            // are discovered from canonical topology, never from this map.
            if (lop !== top && lid !== _canonicalSourceLine) return;
            var idx = _candidate.stationIndex;
            if (idx < 0) return;
            matchingLines.push({ lid: lid, idx: idx, line: line });
          });
          var targetLine = null;
          if (_canonicalSourceLine) {
            for (var _csi = 0; _csi < matchingLines.length; _csi++) {
              if (matchingLines[_csi].lid === _canonicalSourceLine) {
                targetLine = matchingLines[_csi];
                break;
              }
            }
          }
          if (!targetLine && matchingLines.length === 1) {
            targetLine = matchingLines[0];
          } else if (!targetLine && matchingLines.length > 1) {
            // 1. 优先使用railway字段精确匹配
            if (railwayName) {
              // v4.3.437: 先用 LINE_RAILWAY_CODE 反查 odpt railway 短名 → 项目线 key 列表
              // （如 SaikyoKawagoe→[Saikyo,Kawagoe]、Kawagoe→[KawagoeWest]），集合匹配比
              // 子串猜测更准——避免川越〜高麗川的 Kawagoe 数据错配到大宮〜川越段。
              var mappedLids = _railwayCodeLines[railwayName] || [];
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
                trainNumber: trainNumber,
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
            var _linePositionIndex = _positionIndexByLine[lid];
            if (!_linePositionIndex) _linePositionIndex = _positionIndexByLine[lid] = new Map();
            var existingIdx = _linePositionIndex.has(trainId) ? _linePositionIndex.get(trainId) : -1;
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
              trainNumber: trainNumber,
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
            var odptTrainOwner = t["odpt:trainOwner"] || t["trainOwner"] || "";
            positionData.trainOwner = odptTrainOwner;
            positionData.realtimeVehicleType = odptVehicleType;
            // An explicit vehicle type carried by the realtime record is train-level
            // evidence. Register it before resolving so the same train number can
            // reuse that evidence without depending on the current display line.
            if (window.TrainVehicle && typeof window.TrainVehicle.resolve === "function") {
              try {
                var _derivedVehicleEvidence = null;
                if (!odptVehicleType && window.TrainOperationEvidence &&
                    typeof window.TrainOperationEvidence.resolveEvidence === "function") {

                  var _evidenceStart = _perfNow();
                  _vehicleEvidenceCalls++;
                  _derivedVehicleEvidence = window.TrainOperationEvidence.resolveEvidence(positionData.trainNumber, {
                    lineId: lid,
                    railway: railwayName,
                    operator: trainOpShort,
                    trainOwner: odptTrainOwner,
                    trainNumber: positionData.trainNumber,
                    serviceDate: _snapshotServiceDate,
                    calendarType: _snapshotCalendarType
                  }, "realtime-derived");
                  _vehicleEvidenceMs += _perfNow() - _evidenceStart;
                }
                var _derivedVehicleType = _derivedVehicleEvidence && _derivedVehicleEvidence.vehicleType
                  ? _derivedVehicleEvidence.vehicleType
                  : (_derivedVehicleEvidence && _derivedVehicleEvidence.vehicleCandidates || []).join(" / ");
                var _vehicleStart = _perfNow();
                _vehicleResolveCalls++;
                var _rtVehicle = window.TrainVehicle.resolve({
                  lineId: lid,
                  operator: trainOpShort,
                  trainOwner: odptTrainOwner,
                  trainNumber: positionData.trainNumber,
                  stationIndex: idx,
                  trainType: rawType,
                  destinationStation: destStations,
                  trainId: trainId,
                  realtimeVehicleType: odptVehicleType,
                  realtimeDerivedVehicleType: _derivedVehicleType
                });
                _vehicleResolveMs += _perfNow() - _vehicleStart;
                _projectVehicleResolution(positionData, _rtVehicle, false);
              } catch(e) {}
            }
            var _positionCoverage = getRealtimePositionRecordCoverage(lid, positionData);
            positionData.realtimeCoverageMode = _positionCoverage.mode;
            positionData.realtimePositionRecordPresent = _positionCoverage.currentTrainCovered;
            positionData.realtimePositionCoverageReason = _positionCoverage.reason;
            // v4.3.6xx: 双向直通列车处理
            // 1. 临海线的车（operator=TWR）开到JR区间了 → 在JR线路图上显示临海线车型
            // v4.3.939: 存车自己的 operator（渲染层判断直通车、按车籍选图标，治跨线"变身"）
            positionData.trainOperator = trainOperator.replace('odpt.Operator:', '') || '';
            // Zero-fallback vehicle contract: realtime records without explicit
            // vehicle evidence keep trainClass empty. Line/operator/train number,
            // service type and through-service context may not manufacture it.
            // Destination on a partner line is routing intent, not position
            // evidence. Never synthesize a partner-line realtime position from
            // destination alone. Cross-line continuity must be confirmed by
            // timetable/running-chain evidence before rendering on that line.
            if (existingIdx >= 0) {
              posMap[lid][existingIdx] = positionData;
            } else {
              _linePositionIndex.set(trainId, posMap[lid].length);
              posMap[lid].push(positionData);
            }
          }
        });
      });
      // Publish the mutable working map for estimation/through-service logic.
      // _previousPosMap remains the immutable reference to the prior snapshot
      // because posMap is a newly allocated object for this poll.
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

      function getRealtimePositionRecordCoverage(lineId, position) {
        var policy = getRealtimePositionPolicy(lineId);
        var mode = policy.mode || "UNKNOWN";
        if (!position || position.positionSource !== "realtime-api") {
          return { mode: mode, currentTrainCovered: false, reason: "no-current-realtime-record" };
        }
        // A returned realtime row is authoritative evidence for that physical
        // train even on HYBRID/COARSE/SEGMENTED lines. Coverage mode controls
        // whether missing trains/segments may fall back; it never invalidates
        // an actual source row.
        return { mode: mode, currentTrainCovered: true, reason: "current-realtime-record" };
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

      doEstimation = function(requestedLineIds) {
        var _estPerfStart = _perfNow();
        try {
          if (window.TrainPositionEstimator && typeof window.TrainPositionEstimator.estimateAllPositions === "function") {
            // Timetable estimation consumes timetable rows only; never fall back to the
            // Timetable estimation reads only the dedicated timetable store.
            var timetableSource = window.ODPT_TIMETABLES || {};
            var estimated = window.TrainPositionEstimator.estimateAllPositions(
              allLines,
              timetableSource,
              odptData.delayInfo,
              posMap,
              { lineIds: requestedLineIds && requestedLineIds.length ? requestedLineIds : null }
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
            var _chainVehicleCandidates = {};
            function _queueChainVehicle(p) {
              if (!p || !p.runningChainId || !p.vehicleType) return;
              var exact = p.vehicleIdentityStatus === "EXACT" ||
                (p.vehicleResolution && p.vehicleResolution.identityStatus === "EXACT");
              if (!exact) return;
              var cid = p.runningChainId;
              var current = _chainVehicleCandidates[cid];
              if (!current || _vehicleEvidenceRank(p) > _vehicleEvidenceRank(current)) {
                _chainVehicleCandidates[cid] = p;
              }
            }
            Object.keys(posMap).forEach(function(_vlid) {
              (posMap[_vlid] || []).forEach(function(_rp) {
                if (!_rp) return;
                if (!_rp.runningChainId && _rp.trainNumber && _chainsByTrainNumber[String(_rp.trainNumber)]) {
                  var _chainIds = Object.keys(_chainsByTrainNumber[String(_rp.trainNumber)]);
                  if (_chainIds.length === 1) _rp.runningChainId = _chainIds[0];
                }
                _queueChainVehicle(_rp);
              });
            });
            // Positionless realtime rows may contribute vehicle identity only
            // after a unique physical chain is known. They never create position.
            Object.keys(_realtimeEvidenceWithoutPosition).forEach(function(_evKey) {
              var _ev = _realtimeEvidenceWithoutPosition[_evKey];
              if (!_ev || !_ev.trainNumber || !_ev.vehicleType) return;
              var _evChains = _chainsByTrainNumber[String(_ev.trainNumber)] || {};
              var _evChainIds = Object.keys(_evChains);
              if (_evChainIds.length !== 1) return;
              var _evResolution = (window.TrainVehicle && typeof window.TrainVehicle.resolve === "function")
                ? window.TrainVehicle.resolve({trainNumber:_ev.trainNumber,realtimeVehicleType:_ev.vehicleType}) : null;
              var _evSources = _evResolution && Array.isArray(_evResolution.sources) ? _evResolution.sources : [];
              if (!_evResolution || _evResolution.identityStatus !== "EXACT" ||
                  (_evSources.indexOf("realtime") < 0 && _evResolution.source !== "realtime")) return;
              _queueChainVehicle({
                runningChainId:_evChainIds[0], trainClass:_evResolution.name||"",
                vehicleType:_evResolution.vehicleTypeStr||_ev.vehicleType,
                vehicleIconPath:_evResolution.iconPath, vehicleSource:_evResolution.source||"realtime",
                vehicleConfidence:_evResolution.confidence||"high", vehicleResolution:_evResolution,
                vehicleIdentityStatus:_evResolution.identityStatus,
                vehicleIdentityReason:_evResolution.identityReason||"", vehicleResolvedFromRealtime:true
              });
            });
            Object.keys(estimated).forEach(function(_vlid) {
              (estimated[_vlid] || []).forEach(function(_p) {
                _queueChainVehicle(_p);
                // Formation evidence is another candidate for the same physical
                // chain. Queue it before the single registry commit; never write
                // the registry again later in the fusion pass.
                if (window.TrainVehicle && typeof window.TrainVehicle.resolveFormationEvidence === "function" &&
                    typeof window.TrainVehicle.resolve === "function") {
                  var _fe = window.TrainVehicle.resolveFormationEvidence({
                    lineId: _vlid,
                    runningChainId: _p && _p.runningChainId,
                    at: Date.now()
                  });
                  if (_fe) {
                    var _feResolution = {
                      name:_fe.vehicleName||"", vehicleTypeStr:_fe.vehicleName||"", iconPath:_fe.iconPath||"",
                      source:"formation-evidence", sources:["formation-evidence"], confidence:_fe.confidence||"high",
                      identityStatus:_fe.identityStatus||"EXACT",
                      identityReason:_fe.identityReason||"dated-running-chain-vehicle-evidence"
                    };
                    _queueChainVehicle({
                      runningChainId:_p.runningChainId, trainClass:_feResolution.name,
                      vehicleType:_feResolution.vehicleTypeStr, vehicleIconPath:_feResolution.iconPath,
                      vehicleSource:_feResolution.source, vehicleConfidence:_feResolution.confidence,
                      vehicleResolution:_feResolution, vehicleIdentityStatus:_feResolution.identityStatus,
                      vehicleIdentityReason:_feResolution.identityReason,
                      vehicleFormationId:_fe.formationId||"", vehicleFormationCandidates:_fe.formationId?[_fe.formationId]:[]
                    });
                  }
                }
              });
            });
            // One physical chain, one registry commit per fusion pass.
            Object.keys(_chainVehicleCandidates).forEach(function(_cid) {
              _rememberChainVehicle(_chainVehicleCandidates[_cid]);
            });
            // Timetable/SQL EXACT evidence has now seeded the registry.
            // Apply it to realtime-position rows on the same unique running
            // chain only when no stronger realtime vehicle identity already
            // established that chain.
            Object.keys(posMap).forEach(function(_vlid) {
              (posMap[_vlid] || []).forEach(function(_p) {
                _inheritChainVehicle(_p);
              });
            });
            Object.keys(estimated).forEach(function(_vlid) {
              (estimated[_vlid] || []).forEach(function(_p) {
                _inheritChainVehicle(_p);
              });
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
            // Crossing a realtime coverage boundary must not make a physical
            // train forget an already-confirmed vehicle. As long as the canonical
            // running chain is still active (including timetable-only branch
            // segments), refresh identity lifetime without manufacturing position.
            Object.keys(_activeChainIds).forEach(function(_cid) {
              if (_chainVehicleRegistry[_cid]) _chainVehicleRegistry[_cid].lastSeenAt = Date.now();
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
                var _haveTrainNumber = {};
                posMap[lid].forEach(function(p) {
                  if (!p) return;
                  if (_positionIdentity(p)) _haveId[_positionIdentity(p)] = true;
                  if (p.trainNumber) _haveTrainNumber[String(p.trainNumber)] = true;
                });
                var _addN = 0;
                _est.forEach(function(p) {
                  if (!p || !mayUseTimetableEstimate(lid, p)) return;
                  var _pid = _positionIdentity(p);
                  // Canonical runningChainId is primary. Train number is the
                  // conservative secondary guard for the same line when one side
                  // has not yet received its chain id; never render both realtime
                  // and estimated copies of the same physical train.
                  if ((_pid && _haveId[_pid]) || (p.trainNumber && _haveTrainNumber[String(p.trainNumber)])) return;
                  posMap[lid].push(p);
                  if (_pid) _haveId[_pid] = true;
                  if (p.trainNumber) _haveTrainNumber[String(p.trainNumber)] = true;
                  _addN++;
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
            var manualLines = (window.TrainPositionEstimator &&
              typeof window.TrainPositionEstimator.getRegisteredManualLineIds === "function")
              ? window.TrainPositionEstimator.getRegisteredManualLineIds() : [];
            manualLines.forEach(function(manualLineId) {
              if (requestedLineIds && requestedLineIds.length && requestedLineIds.indexOf(manualLineId) < 0) return;
              if (!mayUseTimetablePosition(manualLineId)) return;
              var manualTT = (window.TrainPositionEstimator &&
                typeof window.TrainPositionEstimator.getRegisteredManualTimetable === "function")
                ? window.TrainPositionEstimator.getRegisteredManualTimetable(manualLineId) : null;
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
        finally { _perfRecord("doEstimation", _estPerfStart, { requested: requestedLineIds ? requestedLineIds.length : "all", positionLines: Object.keys(posMap || {}).length }); }
      }

      // Timetable positions advance with wall-clock minutes even when the
      // network payload is identical. Run a full estimation at most once per
      // minute; within the same minute, re-estimate only lines touched by the
      // realtime snapshot plus their dependency neighbourhood.
      var _minuteKey = Math.floor(Date.now() / 60000);
      var _estimationSeeds = [];
      var _seenEstimationSeed = {};
      Object.keys(posMap || {}).forEach(function(id) {
        if (!_seenEstimationSeed[id]) { _seenEstimationSeed[id] = true; _estimationSeeds.push(id); }
      });
      var _minuteAdvanced = _minuteKey !== _lastEstimationMinute;
      var _estimationTargets = _expandDirtyLines(_estimationSeeds, allLines);
      // Keep the current realtime neighbourhood synchronous so the visible
      // snapshot is coherent, but never turn a minute boundary into one
      // full-network main-thread task. Timetable-only lines still need their
      // clock-driven positions advanced once per minute, so process the
      // remainder cooperatively in small batches between browser turns.
      doEstimation(_estimationTargets);
      if (_minuteAdvanced) {
        var _targetSet = {};
        (_estimationTargets || []).forEach(function(id) { _targetSet[id] = true; });
        var _minuteRemainder = Object.keys(allLines || {}).filter(function(id) {
          return !_targetSet[id] && mayUseTimetablePosition(id);
        });
        var _minuteBatchToken = _minuteKey;
        var _minuteBatchGeneration = ++_minuteEstimationGeneration;
        var _minuteBatchSize = 8;
        (function _runMinuteBatch(offset) {
          if (_minuteBatchGeneration !== _minuteEstimationGeneration ||
              _minuteBatchToken !== Math.floor(Date.now() / 60000)) return;
          var batch = _minuteRemainder.slice(offset, offset + _minuteBatchSize);
          if (!batch.length) return;
          setTimeout(function() {
            try {
              doEstimation(batch);
              fuseDirty(batch);
            } catch(e) {
              console.debug("[DataFusion] minute estimation batch error:", e.message);
            }
            _runMinuteBatch(offset + _minuteBatchSize);
          }, 0);
        })(0);
      }
      _lastEstimationMinute = _minuteKey;

      // 识别需要估算但可能没有时刻表的线路，按需加载
      try {
        var linesNeedingTimetable = [];
        Object.keys(allLines).forEach(function(lid) {
          var line = allLines[lid];
          if (!line || !line.operator) return;
          // Full official realtime lines never need timetable position fallback, even when
          // the current API snapshot is legitimately empty (e.g. no trains at this moment).
          if (!mayUseTimetablePosition(lid)) return;
          var hasRealtime = posMap[lid] && posMap[lid].length > 0;
          // Presence lookup is indexed by operator+railway. Do not rescan an
          // operator's entire timetable array for every line on every poll.
          var hasTimetable = hasOdptTimetableForLine(lid, line.operator);
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
              // Branch topology is canonical in line.branchOf / line.branches; load its own timetable directly.
              if (!mayUseTimetablePosition(bid3)) return;
              var hasRt3 = posMap[bid3] && posMap[bid3].length > 0;
              var hasTt3 = hasOdptTimetableForLine(bid3, bl3.operator);
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
          var _requestedTimetableLines = linesNeedingTimetable.map(function(x) { return x.lineId; });
          loadMissingTimetables(linesNeedingTimetable).then(function() {
            // Re-estimation may enrich positions/running-chain evidence, but only
            // requested lines and their dependency neighbourhood need re-fusion.
            doEstimation(_expandDirtyLines(_requestedTimetableLines, allLines));
            try { fuseDirty(_requestedTimetableLines); } catch(e) { console.debug("[DataFusion] reload->fuseDirty error:", e.message); }
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
        // Report aggregate resolver costs without logging individual train identities.
        _perfSamples.push({ name: "vehicleEvidence", ms: Math.round(_vehicleEvidenceMs * 10) / 10, at: Date.now(), meta: { calls: _vehicleEvidenceCalls } });
        _perfSamples.push({ name: "vehicleResolve", ms: Math.round(_vehicleResolveMs * 10) / 10, at: Date.now(), meta: { calls: _vehicleResolveCalls } });
        if (_perfSamples.length > 40) _perfSamples.splice(0, _perfSamples.length - 40);
        _perfRecord("loadTrainPositions", _perfStart, { dirty: Object.keys(_positionDirty).length, positionLines: Object.keys(posMap || {}).length });
      } catch(e) { _perfRecord("loadTrainPositions:error", _perfStart); console.debug("[DataFusion] loadTrainPositions->fuseDirty error:", e.message); }

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
        var throughLines = (window.RunningChainResolver && typeof window.RunningChainResolver.getDirectThroughLines === "function")
          ? window.RunningChainResolver.getDirectThroughLines(l.lineId) : [];
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
      // The timer is a persistence opportunity, not a reason to rewrite the
      // same snapshot. Skip the all-line scan and IndexedDB writes until fusion
      // has actually emitted newer data.
      if (_lastFusionEmitAt && _lastFusionEmitAt <= _lastCacheSavedFusionAt) return;
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
      _lastCacheSavedFusionAt = _lastFusionEmitAt || Date.now();
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
        // pt:railway-ready is the authoritative late-load convergence path.
        // Keep polling only as a compatibility fallback for external/legacy
        // data injection that does not emit the readiness signal.
        var fusedLines = _lastFusedData && _lastFusedData.lines;
        if (!fusedLines || Object.keys(fusedLines).length === 0) {
          syncStatusMap();
          fuseAll();
        }
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
          // No timetable warm-up here. trains.html activates timetable work only
          // after the user opens a line; this keeps first-load CPU/network bounded.
        } catch(e) {}
        return;
      }
      setTimeout(pollUnified, 500);
    })();
  }

  window.addEventListener("pt:railway-ready", function() {
    // Canonical readiness is the single late-load/retry convergence point.
    // Rebuild baseline once even if init ran against an empty DataLayer.
    try {
      syncStatusMap();
      fuseAll();
    } catch(e) {
      console.debug("[DataFusion] railway-ready fuse error:", e.message);
    }
  });

  // ========== 手动时刻表按需加载（v4.3.528） ==========
  // 41 个 data/timetables/*-manual.js（ODPT 无 TrainTimetable 的 JR 地方线补充数据）
  // 由 HTML 静态标签改为按需动态注入：打开线路时才加载该线文件，
  // trains 页首屏不再全量解析约 7.1MB 时刻表数据（首都圈线 ODPT 有时刻表，全程零加载）。
  // 时序保证：script.onload 触发 = 脚本执行完成 = window.<lineId>_MANUAL_TIMETABLES 已定义，
  //   onload 内二次校验变量存在（文件名/线路 ID 命名不匹配时 reject 暴露，不静默缺数据）；
  //   数据就绪后仅重估目标线路依赖并 dirty-fuse；不再触发全网 estimation/fusion。
  // 防重入：_manualLoading 记录共享 Promise，同线路并发调用只发一次请求。
  // 结果归属：调用方（trains-page）在 .then 中校验 currentLine，用户切走线路后旧结果不覆盖新状态。
  var _manualLoading = {};
  // v4.3.1016: ODPT 有时刻表也尝试加载 manual——ODPT 时刻表无 vehicleType（53939 条实测 0 条带车型），
  // manual 时刻表带 vehicleType（172/178 文件）——车型判定需 manual 实证（S0/S2）。
  // 404（该线无 manual 文件）→ 标记 _manualMissing 并回退 ODPT，零重复请求。
  var _manualMissing = {};

  function _hasOdptTimetable(lineId) {
    try {
      var lines = (window.DataLayer && window.DataLayer.getAllLines) ? window.DataLayer.getAllLines() : {};
      var line = lines && lines[lineId];
      if (line && hasOdptTimetableForLine(lineId, line.operator)) return true;
      // Compatibility fallback for a line not yet present in DataLayer: check
      // every indexed operator without rescanning raw timetable rows.
      var idx = getTimetablePresenceIndex();
      var code = (window.ODPTClient && window.ODPTClient.LINE_RAILWAY_CODE &&
        window.ODPTClient.LINE_RAILWAY_CODE[lineId]) || lineId;
      return Object.keys(idx).some(function(op) {
        return !!(idx[op] && (idx[op][lineId] || idx[op][code]));
      });
    } catch(e) {}
    return false;
  }

  function ensureTimetable(lineId) {
    // activateRealtimeLines() owns ODPT network loading. If that path already
    // populated this line, do not start a second timetable source request here;
    // only lazy-load manual evidence (vehicleType etc.) on top of the shared rows.
    if (_hasOdptTimetable(lineId)) return ensureManualTimetable(lineId);
    // One existing source lifecycle: ODPTClient owns the optional Supabase
    // read-through cache; a miss falls through to the existing manual path.
    if (!window.ODPTClient || typeof window.ODPTClient.getCachedTrainRuns !== "function") return ensureManualTimetable(lineId);
    return window.ODPTClient.getCachedTrainRuns(lineId).then(function(rows) {
      // ODPT activation may have completed while the cache request was in flight.
      if (!rows || !rows.length) return ensureManualTimetable(lineId);
      if (window.TrainPositionEstimator && typeof window.TrainPositionEstimator.registerManualTimetable === "function") {
        window.TrainPositionEstimator.registerManualTimetable(lineId, rows);
      }
      var line = allLines[lineId];
      if (line && line.stations) {
        var estimated = window.TrainPositionEstimator.estimateLinePositions(lineId, line, rows, odptData.delayInfo, line.operator);
        if (estimated && estimated.length) {
          if (!posMap[lineId]) posMap[lineId] = [];
          var have = {};
          posMap[lineId].forEach(function(p) { if (p && _positionIdentity(p)) have[_positionIdentity(p)] = true; });
          estimated.forEach(function(p) {
            var id = _positionIdentity(p);
            if (id && !have[id] && mayUseTimetableEstimate(lineId, p)) {
              p.positionSource = "supabase-train-run";
              posMap[lineId].push(p); have[id] = true;
            }
          });
        }
      }
      try {
        var targets = _expandDirtyLines([lineId], allLines);
        if (typeof doEstimation === "function") doEstimation(targets);
        fuseDirty([lineId]);
      } catch(err) { console.debug("[DataFusion] ensureTimetable refresh:", err.message); }
      return true;
    }).catch(function() { return ensureManualTimetable(lineId); });
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
        if (window[varName]) { resolve(false); return; }
        // v4.3.1016: ODPT 已有该线时刻表（首都圈等）→ 仍尝试加载 manual（车型实证）：
        // ODPT 时刻表无 vehicleType，manual 带 vehicleType；文件不存在（404）由 onerror 回退 ODPT。
        if (window.ODPT_TIMETABLES && _hasOdptTimetable(lineId)) {
          if (_manualMissing[lineId]) { resolve(false); return; }
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
              if (window.TrainPositionEstimator && typeof window.TrainPositionEstimator.registerManualTimetable === "function") {
                window.TrainPositionEstimator.registerManualTimetable(lineId, manualTT);
              }
              var mLine = allLines[lineId];
              if (mLine && mLine.stations && manualTT && manualTT.length > 0) {
                manualTT.forEach(function(tt) {
                  if (!tt) return;
                  tt._positionSource = "station-timetable";
                  // Manual timetable vehicleType is train-level evidence even
                  // when FULL realtime policy forbids timetable-derived position.
                  var _mTrainNo = tt["odpt:trainNumber"] || tt["odpt:train"] || "";
                  var _mVehicle = tt["vehicleType"] || tt["odpt:vehicleType"] || "";
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
            try {
              var _manualTargets = _expandDirtyLines([lineId], allLines);
              if (typeof doEstimation === 'function') doEstimation(_manualTargets);
              fuseDirty([lineId]);
            } catch(e) { console.debug("[DataFusion] ensureManual->dirty refresh error:", e.message); }
            res(true);
          };
          s.onerror = function() {
            _manualMissing[lineId] = true;
            // ODPT 有该线时刻表 → 回退 ODPT（零阻断）；否则才报缺数据
            if (window.ODPT_TIMETABLES && _hasOdptTimetable(lineId)) { res(false); }
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
    getPerformanceSamples: function() { return _perfSamples.slice(); },
    saveToCache: saveToCache, refresh: function() { return fuseAll(); },
    // v4.3.528: 手动时刻表按需加载（ODPT 无时刻表的 JR 地方线，打开线路时才注入该线文件）
    ensureManualTimetable: ensureManualTimetable,
    ensureTimetable: ensureTimetable,
    // Direct operational neighbours come from the running-chain authority.
    getDirectThroughLines: function(lineId) {
      return (window.RunningChainResolver && typeof window.RunningChainResolver.getDirectThroughLines === "function")
        ? window.RunningChainResolver.getDirectThroughLines(lineId) : [];
    },
    updateOdptData: function(delayData) {
      if (delayData && typeof delayData === 'object') {
        var previous = odptData.delayInfo || {};
        odptData.delayInfo = delayData;
        try {
          var dirtyOps = {};
          var opKeys = {};
          Object.keys(previous).forEach(function(op) { opKeys[op] = true; });
          Object.keys(delayData).forEach(function(op) { opKeys[op] = true; });
          Object.keys(opKeys).forEach(function(op) {
            var b = delayData[op];
            var sb = b == null ? String(b) : JSON.stringify(b);
            var sa;
            if (Object.prototype.hasOwnProperty.call(_delayInfoSignatures, op)) {
              sa = _delayInfoSignatures[op];
            } else {
              var a = previous[op];
              sa = a == null ? String(a) : JSON.stringify(a);
            }
            if (sa !== sb) dirtyOps[op] = true;
            _delayInfoSignatures[op] = sb;
          });
          // Drop signatures for operators no longer present so the cache cannot
          // retain stale payload strings indefinitely.
          Object.keys(_delayInfoSignatures).forEach(function(op) {
            if (!Object.prototype.hasOwnProperty.call(delayData, op)) delete _delayInfoSignatures[op];
          });
          var lines = (window.DataLayer && window.DataLayer.getAllLines) ? window.DataLayer.getAllLines() : {};
          var dirtyLines = [];
          Object.keys(lines || {}).forEach(function(id) {
            var line = lines[id] || {};
            var op = line.operator || "";
            var normalized = TransitConstants && typeof TransitConstants.normalizeOp === "function" ? TransitConstants.normalizeOp(op) : op;
            if (dirtyOps[op] || dirtyOps[normalized]) dirtyLines.push(id);
          });
          if (dirtyLines.length) fuseDirty(dirtyLines);
        } catch(e) { console.debug('[DataFusion] updateOdptData->fuseDirty error:', e.message); fuseAll(); }
      }
    }
  };

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init); } else { init(); }
  window.addEventListener("beforeunload", function() {
    if (_positionTimer) clearInterval(_positionTimer);
    if (_refreshTimer) clearInterval(_refreshTimer);
    if (_cacheTimer) clearInterval(_cacheTimer);
  });
})();
