/*
 * Pixel Tetsudo - DataFusion v11 (Position Support)
 */
(function() {
  "use strict";

  var FUSION_VERSION = 11;
  var REFRESH_INTERVAL = 15000;
  var POSITION_INTERVAL = 60000;

  var odptData = { trains: {}, delayInfo: {}, realtimePositions: {} };
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
      // Direct delay field first: odpt:Train responses carry odpt:delay (minutes)
      if (raw["odpt:delay"] != null) {
        var dMin0 = parseInt(raw["odpt:delay"], 10);
        if (!isNaN(dMin0) && dMin0 > 0) { result.status = "delayed"; result.maxDelay = dMin0; }
      }
      var ti = raw["odpt:trainInformationText"] || "";
      var text = typeof ti === "string" ? ti : (typeof ti === "object" && ti !== null ? (ti.ja || ti.en || ti.zh || JSON.stringify(ti)) : "");
      if (!text) return result;
      if (text.indexOf("\u904b\u4f11") >= 0 || text.toLowerCase().indexOf("suspended") >= 0) result.status = "suspended";
      else if (text.indexOf("\u904b\u5ef6") >= 0 || text.indexOf("\u904b\u308c") >= 0 || text.toLowerCase().indexOf("delay") >= 0) result.status = "delayed";
      else if (text.indexOf("\u5e73\u5e38") >= 0 || text.indexOf("\u901a\u5e38") >= 0 || text.toLowerCase().indexOf("normal") >= 0 || text.toLowerCase().indexOf("schedule") >= 0) result.status = "normal";
      else if (text.indexOf("\u7d42\u4e86") >= 0 || text.toLowerCase().indexOf("finished") >= 0) result.status = "suspended";
      var m = text.match(/(\d+)\s*(\u5206|min)/i);
      if (m) result.maxDelay = parseInt(m[1], 10);
      var im = text.match(/([^\s\-]+)\s*[-\uff5e\u81f3\u2192]\s*([^\s\-]+)/);
      if (im) result.interval = im[1] + "\u2192" + im[2];
    } catch(e) {}
    return result;
  }

  function getApiDelayInfo(line) {
    try {
      var op = getOperatorForLine(line.id, line.name);
      if (!odptData.delayInfo || !op) return null;
      var norm = TransitConstants && typeof TransitConstants.normalizeOp === "function" ? TransitConstants.normalizeOp(op) : op;
      var raw = odptData.delayInfo[norm] || odptData.delayInfo[op];
      if (!raw) return null;
      return parseODPTDelay(raw);
    } catch(e) { return null; }
  }

  function fuseLine(lineId) {
    try {
      var line = (window.DataLayer && window.DataLayer.getLine ? window.DataLayer.getLine(lineId) : null) || (localData.lines && localData.lines[lineId]) || (window.UNIFIED_LINES && window.UNIFIED_LINES[lineId]) || null;
      if (!line) return null;
      var apiInfo = getApiDelayInfo(line);
      var localStatus = localData.statusMap && localData.statusMap[lineId];
      var delayInfo = apiInfo || (localStatus && { status: localStatus.status, maxDelay: localStatus.maxDelay, interval: localStatus.interval, cause: localStatus.cause }) || (window.ODPTClient && window.ODPTClient.LINE_TO_OPERATOR && (window.ODPTClient.LINE_TO_OPERATOR[lineId] || window.ODPTClient.LINE_TO_OPERATOR[line.name]) ? { status: "normal", maxDelay: 0, interval: null, cause: null } : { status: "no_odpt", maxDelay: 0, interval: null, cause: null });
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
      return { id: lineId, name: line.name, nameEn: line.nameEn || line.name, code: line.code, color: line.color, operator: line.operator, region: line.region, type: line.type, image: line.image, stations: line.stations || [], durations: line.durations || [], intervalTotal: line.durationTotalMin || 0, realtimePositions: odptData.realtimePositions[lineId] || [], delayInfo: delayInfo, _chainMeta: _chainMeta };
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

  function loadTrainPositions() {
    try {
      var positionSource = window.ODPT_TRAIN_POSITIONS || window.ODPT_TRAINS;
      if (!positionSource) return;
      var allLines = (window.DataLayer && window.DataLayer.getAllLines) ? window.DataLayer.getAllLines() : (window.UNIFIED_LINES || {});
      if (!allLines || Object.keys(allLines).length === 0) return;
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
          var delayMin = t["odpt:delay"] != null ? (parseInt(t["odpt:delay"], 10) || 0) : 0;
          var trainId = t["odpt:trainNumber"] || t["odpt:train"] || "";
          Object.keys(allLines).forEach(function(lid) {
            var line = allLines[lid];
            var lop = TransitConstants && typeof TransitConstants.normalizeOp === "function" ? TransitConstants.normalizeOp(line.operator) : line.operator;
            if (!line || lop !== top || !line.stations) return;
            var idx = line.stations.indexOf(stationKey);
            if (idx < 0) return;
            if (!posMap[lid]) posMap[lid] = [];
            posMap[lid].push({ stationIndex: idx, trainId: trainId, delayMin: delayMin });
          });
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
    } catch(e) { console.debug("[DataFusion] loadTrainPositions error:", e.message); }
  }

  
  // ========== 直通运行关系配置 ==========
  var THROUGH_SERVICE_MAP = {
    "TobuSkytree": ["Hibiya", "Hanzomon", "Namboku"],
    "Skytree": ["Hibiya", "Hanzomon", "Namboku"],
    "Hibiya": ["TobuSkytree", "TobuIsesaki"],
    "Hanzomon": ["TobuSkytree", "TobuIsesaki", "TokyuDenEn"],
    "Namboku": ["TobuSkytree", "TobuIsesaki"],
    "TokyuToyoko": ["MinatoMirai", "Fukutoshin"],
    "Toyoko": ["MinatoMirai", "Fukutoshin"],
    "MinatoMirai": ["TokyuToyoko", "Fukutoshin"],
    "Fukutoshin": ["TokyuToyoko", "MinatoMirai", "SeibuIkebukuro", "Tojo"],
    "SeibuIkebukuro": ["Fukutoshin"],
    "Ikebukuro": ["Fukutoshin"],
    "Tojo": ["Fukutoshin"],
    "Asakusa": ["KeikyuMain", "Keisei", "Hokuso"],
    "KeikyuMain": ["Asakusa", "Keisei"],
    "Keikyu": ["Asakusa", "Keisei"],
    "Keisei": ["Asakusa", "KeikyuMain", "Hokuso"],
    "Mita": ["TokyuMeguro"],
    "TokyuMeguro": ["Mita", "TokyuTamagawa"],
    "Saikyo": ["Kawagoe", "Rinkai"],
    "Kawagoe": ["Saikyo"],
    "Rinkai": ["Saikyo"],
    "ShonanShinjuku": ["Utsunomiya", "Takasaki", "Yokosuka"],
    "ChuoRapid": ["Ome", "Itsukaichi"],
    "SobuRapid": ["Yokosuka"],
    "Yokosuka": ["SobuRapid"],
    "Joban": ["JobanLocal"],
    "JobanLocal": ["Joban", "Chiyoda"],
    "Chiyoda": ["JobanLocal", "OdakyuTama"],
    "OdakyuTama": ["Chiyoda"],
    "Tozai": ["ChuoSobuLocal"],
    "Yurakucho": ["SeibuIkebukuro", "TokyuToyoko"],
    "TokyuDenEn": ["Hanzomon"],
    "DenEn": ["Hanzomon"],
    "Keio": ["Shinjuku"],
    "KeioMain": ["Shinjuku"],
    "Shinjuku": ["Keio", "KeioMain"],
    "SotetsuMain": ["TokyuToyoko"],
    "TokyuTamagawa": ["TokyuMeguro"]
  };

  function getThroughServiceLines(lineId) {
    try {
      var result = [];
      var visited = {};
      var queue = [lineId];
      visited[lineId] = true;
      while (queue.length > 0) {
        var current = queue.shift();
        var through = THROUGH_SERVICE_MAP[current];
        if (through && Array.isArray(through)) {
          through.forEach(function(lid) {
            if (!visited[lid]) {
              visited[lid] = true;
              result.push(lid);
              queue.push(lid);
            }
          });
        }
      }
      return result;
    } catch(e) { return []; }
  }

  // ========== 按需加载缺失线路的时刻表 ==========
  var _timetableLoading = {};

  function loadMissingTimetables(linesNeedingEstimation) {
    try {
      if (!window.ODPTClient || !linesNeedingEstimation || linesNeedingEstimation.length === 0) return Promise.resolve();

      var priorityOps = ['TokyoMetro', 'Toei', 'YokohamaMunicipal', 'Keio', 'Sotetsu', 'Tokyu', 'Tobu', 'TWR', 'MIR', 'TamaMonorail'];
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
        return priorityOps.indexOf(l.operator) >= 0 && !_timetableLoading[l.lineId];
      });

      toLoad = toLoad.slice(0, 12);

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
  }function init() {
    if (_initialized) return;
    _initialized = true;
    loadLocalData();
    syncStatusMap();
    checkCacheStale();
    fuseAll();
    _refreshTimer = setInterval(function() { try { fuseAll(); } catch(e) { console.debug("[DataFusion] fuseAll error:", e.message); } }, REFRESH_INTERVAL);
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