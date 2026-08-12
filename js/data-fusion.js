/*
 * Pixel Tetsudo - DataFusion v9 (Stable)
 * 线路数据融合引擎 - 稳定性强化版
 */
(function() {
  "use strict";

  var REFRESH_INTERVAL = 30000;
  var FUSION_VERSION = 9;
  var RETRY_DELAY = 5000;

  var odptData = { trains: {}, stations: {}, delayInfo: {}, realtimePositions: {} };
  var subscribers = [];
  var localData = { lines: {}, statusMap: {} };
  var _lastFusedData = null;
  var _retryCount = 0;
  var _retryTimer = null;
  var _lineControlVersion = null;
  function emitUpdate(fusedData) {
    if (fusedData && fusedData.lines && Object.keys(fusedData.lines).length > 0) {
      _lastFusedData = fusedData;
      _retryCount = 0;
      if (_retryTimer) { clearTimeout(_retryTimer); _retryTimer = null; }
    }
    try {
      subscribers.forEach(function(cb) { cb(fusedData); });
    } catch(e) { console.warn("[DataFusion] Subscriber error:", e.message); }
    try { window.DATA_FUSION = fusedData; } catch(e) {}
  }

  function subscribe(callback) {
    if (typeof callback !== "function") return function() {};
    subscribers.push(callback);
    var existing = window.DATA_FUSION || _lastFusedData;
    if (existing) {
      try { callback(existing); } catch(e) { console.warn("[DataFusion] Immediate callback error:", e.message); }
    }
    return function unsubscribe() {
      var idx = subscribers.indexOf(callback);
      if (idx >= 0) subscribers.splice(idx, 1);
    };
  }

  function loadLocalData() {
    try {
      if (window.LOCAL_RAILWAY_DATA) {
        localData = window.LOCAL_RAILWAY_DATA;
        console.log("[DataFusion] Loaded local data:", Object.keys(localData.statusMap || {}).length, "status entries");
      } else {
        localData = { lines: {}, statusMap: {} };
      }
    } catch(e) {
      console.warn("[DataFusion] loadLocalData error:", e.message);
      localData = { lines: {}, statusMap: {} };
    }
  }

  function syncStatusMap() {
    try {
      if (!window.UNIFIED_LINES) return;
      var lineIds = Object.keys(window.UNIFIED_LINES);
      var statusMap = localData.statusMap || {};
      var missing = [];
      for (var i = 0; i < lineIds.length; i++) {
        if (!statusMap[lineIds[i]]) {
          missing.push(lineIds[i]);
          statusMap[lineIds[i]] = { status: "normal", maxDelay: 0, interval: null, cause: null };
        }
      }
      if (missing.length > 0) {
        localData.statusMap = statusMap;
      }
    } catch(e) { console.warn("[DataFusion] syncStatusMap error:", e.message); }
  }

  function checkCacheStale() {
    try {
      if (!window.UNIFIED_LINES) return;
      var currentVersion = Object.keys(window.UNIFIED_LINES).length;
      if (_lineControlVersion !== null && _lineControlVersion !== currentVersion) {
        _lastFusedData = null;
        _lineControlVersion = currentVersion;
      } else {
        _lineControlVersion = currentVersion;
      }
    } catch(e) {}
  }

  function getOperatorForLine(lineId, lineName) {
    try {
      if (!window.ODPT_CONFIG || !window.ODPT_CONFIG.lineToOperator) return null;
      return window.ODPT_CONFIG.lineToOperator[lineId] || window.ODPT_CONFIG.lineToOperator[lineName] || null;
    } catch(e) { return null; }
  }

  function parseODPTDelay(raw) {
    var result = { status: "normal", maxDelay: 0, interval: null, cause: null };
    if (!raw || !raw.data || raw.data.length === 0) return result;
    try {
      var info = raw.data[0];
      if (!info || typeof info !== "object") return result;
      var text = (info["odpt:informationContent"] || "") + " " + (info["odpt:informationTitle"] || "");
      if (text.indexOf("\u904B\u4F11") >= 0) result.status = "suspended";
      else if (text.indexOf("\u904B\u5EF6") >= 0) result.status = "delayed";
      var m = text.match(/(\d+)\s*(\u5206|min)/i);
      if (m) result.maxDelay = parseInt(m[1], 10);
      var im = text.match(/([^\s\-]+)\s*[-\uff5e\u81F3]\s*([^\s\-]+)/);
      if (im) result.interval = im[1] + "\u2192" + im[2];
      if (info["odpt:informationContent"]) result.cause = info["odpt:informationContent"];
    } catch(e) {}
    return result;
  }

  function getApiDelayInfo(line) {
    try {
      if (!odptData.delayInfo) return null;
      var op = getOperatorForLine(line.id, line.name);
      if (!op || !odptData.delayInfo[op]) return null;
      return parseODPTDelay(odptData.delayInfo[op]);
    } catch(e) { return null; }
  }

  function fuseLine(lineId) {
    try {
      var line = (window.UNIFIED_LINES && window.UNIFIED_LINES[lineId]) || (localData.lines && localData.lines[lineId]) || null;
      if (!line) return null;
      var apiInfo = getApiDelayInfo(line);
      var localStatus = localData.statusMap && localData.statusMap[lineId];
      var delayInfo = apiInfo
        || (localStatus && { status: localStatus.status, maxDelay: localStatus.maxDelay, interval: localStatus.interval, cause: localStatus.cause })
        || { status: "normal", maxDelay: 0, interval: null, cause: null };
      return {
        id: lineId, name: line.name, nameEn: line.nameEn || line.name, code: line.code,
        color: line.color, operator: line.operator, region: line.region, type: line.type,
        image: line.image, stations: line.stations || [], durations: line.durations || [],
        intervalTotal: line.durationTotalMin || 0,
        realtimePositions: odptData.realtimePositions[lineId] || [],
        delayInfo: delayInfo
      };
    } catch(e) {
      console.warn("[DataFusion] fuseLine error for " + lineId + ":", e.message);
      return null;
    }
  }

  async function fuseAll() {
    try {
      var startTime = Date.now();
      var fusedLines = {};
      var allLineIds = {};
      if (window.UNIFIED_LINES) {
        Object.keys(window.UNIFIED_LINES).forEach(function(k) { allLineIds[k] = true; });
      }
      if (localData.lines) {
        Object.keys(localData.lines).forEach(function(k) { allLineIds[k] = true; });
      }
      var lineIds = Object.keys(allLineIds);
      for (var i = 0; i < lineIds.length; i++) {
        var fused = fuseLine(lineIds[i]);
        if (fused) fusedLines[fused.id] = fused;
      }
      var fusedData = {
        version: FUSION_VERSION, timestamp: new Date().toISOString(),
        lines: fusedLines, lineOrder: lineIds,
        odptOperatorsLoaded: Object.keys(odptData.delayInfo).length,
        totalLines: lineIds.length
      };
      emitUpdate(fusedData);
      return fusedData;
    } catch(e) {
      console.error("[DataFusion] fuseAll error:", e.message);
      if (_lastFusedData) { emitUpdate(_lastFusedData); return _lastFusedData; }
      scheduleRetry();
      return null;
    }
  }

  function scheduleRetry() {
    if (_retryTimer) return;
    _retryCount++;
    _retryTimer = setTimeout(function() {
      _retryTimer = null;
      fuseAll().catch(function() {});
    }, Math.min(RETRY_DELAY * _retryCount, 30000));
  }

  async function refresh() { return await fuseAll(); }

  async function init() {
    console.log("[DataFusion] Initializing v" + FUSION_VERSION + "...");
    loadLocalData();
    syncStatusMap();
    checkCacheStale();
    try {
      await fuseAll();
    } catch(e) {
      console.error("[DataFusion] Init error:", e.message);
      scheduleRetry();
    }
    if (typeof initODPT === "function") {
      initODPT().catch(function(e) { console.warn("[DataFusion] ODPT init error:", e.message); });
    }
    setInterval(function() { fuseAll().catch(function() {}); }, REFRESH_INTERVAL);
  }

  window.DataFusion = {
    init: init, fuseAll: fuseAll, refresh: refresh, subscribe: subscribe,
    getFusedData: function() { return window.DATA_FUSION || _lastFusedData || null; },
    getLine: function(lineId) {
      var data = window.DATA_FUSION || _lastFusedData;
      return data && data.lines ? data.lines[lineId] : null;
    },
    getOdptData: function() { return odptData; },
    getOperatorTrains: function(operator) { return odptData.trains[operator] || []; },
    getOperatorStations: function(operator) { return odptData.stations[operator] || []; },
    getRealtimePositions: function(lineId) { return odptData.realtimePositions[lineId] || []; },
    getCachedData: function() { return _lastFusedData; }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
