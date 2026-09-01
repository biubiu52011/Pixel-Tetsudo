/*
 * Pixel Tetsudo - DataFusion v11 (Position Support)
 */
(function() {
  "use strict";

  var FUSION_VERSION = 11;
  var REFRESH_INTERVAL = 30000;
  var POSITION_INTERVAL = 60000;

  var odptData = { trains: {}, stations: {}, delayInfo: {}, realtimePositions: {} };
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

  function mapLineCodeToLineId(lineCode, tripId) {
    try {
      if (!lineCode) return null;
      var knownLines = (window.DataLayer && window.DataLayer.getAllLines) ? window.DataLayer.getAllLines() : (window.UNIFIED_LINES || {});
      if (!knownLines || Object.keys(knownLines).length === 0) return null;
      var ids = Object.keys(knownLines);
      for (var i = 0; i < ids.length; i++) {
        if (knownLines[ids[i]].operator === lineCode) return ids[i];
      }
      return null;
    } catch(e) { return null; }
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

  function getFusionDelay(opId) {
    try {
      if (window.DATA_FUSION_DELAY && window.DATA_FUSION_DELAY[opId]) return window.DATA_FUSION_DELAY[opId];
      if (window.ODPTClient && window.ODPTClient.LINE_TO_OPERATOR) {
        var norm = TransitConstants ? (TransitConstants.NORMALIZE[opId] || opId) : opId;
        if (window.DATA_FUSION_DELAY && window.DATA_FUSION_DELAY[norm]) return window.DATA_FUSION_DELAY[norm];
      }
    } catch(e) {}
    return null;
  }

  function parseODPTDelay(raw) {
    var result = { status: "normal", maxDelay: 0, interval: null, cause: null };
    if (!raw) return result;
    try {
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
      var fusionDelay = op ? getFusionDelay(op) : null;
      if (fusionDelay) return fusionDelay;
      if (!odptData.delayInfo || !op || !odptData.delayInfo[op]) return null;
      return parseODPTDelay(odptData.delayInfo[op]);
    } catch(e) { return null; }
  }

  function fuseLine(lineId) {
    try {
      var line = (window.DataLayer && window.DataLayer.getLine ? window.DataLayer.getLine(lineId) : null) || (localData.lines && localData.lines[lineId]) || (window.UNIFIED_LINES && window.UNIFIED_LINES[lineId]) || null;
      if (!line) return null;
      var apiInfo = getApiDelayInfo(line);
      var localStatus = localData.statusMap && localData.statusMap[lineId];
      var delayInfo = apiInfo || (localStatus && { status: localStatus.status, maxDelay: localStatus.maxDelay, interval: localStatus.interval, cause: localStatus.cause }) || (window.ODPTClient && window.ODPTClient.LINE_TO_OPERATOR && (window.ODPTClient.LINE_TO_OPERATOR[lineId] || window.ODPTClient.LINE_TO_OPERATOR[line.name]) ? { status: "normal", maxDelay: 0, interval: null, cause: null } : { status: "no_odpt", maxDelay: 0, interval: null, cause: null });
      return { id: lineId, name: line.name, nameEn: line.nameEn || line.name, code: line.code, color: line.color, operator: line.operator, region: line.region, type: line.type, image: line.image, stations: line.stations || [], durations: line.durations || [], intervalTotal: line.durationTotalMin || 0, realtimePositions: odptData.realtimePositions[lineId] || [], delayInfo: delayInfo };
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

  async function loadTrainPositions() { try { return; } catch(e) {} }

  
  function saveToCache() {
    try {
      if (!window.RailwayRTC || !_lastFusedData) return;
      window.RailwayRTC.savePositions(_lastFusedData.positions || []);
      window.RailwayRTC.saveDelayInfo(_lastFusedData.delayInfo || {});
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
    getOperatorTrains: function(operator) { return odptData.trains[operator] || []; },
    getOperatorStations: function(operator) { return odptData.stations[operator] || []; },
    getRealtimePositions: function(lineId) { return odptData.realtimePositions[lineId] || []; },
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