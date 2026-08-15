/**
 * Pixel Tetsudo - Database Loader
 * 从 railway_data.json 加载所有数据到全局变量
 * 新增：IndexedDB 实时数据缓存（train positions + delay info）
 */
(function() {
  "use strict";

  // ========== IndexedDB Real-Time Cache ==========
  var RT_DB_NAME = "PixelTetsudoRT";
  var RT_STORE_NAME = "realtime";
  var _rtDb = null;

  function openRTDb() {
    return new Promise(function(resolve, reject) {
      if (_rtDb) { resolve(_rtDb); return; }
      var req = indexedDB.open(RT_DB_NAME, 1);
      req.onupgradeneeded = function(e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(RT_STORE_NAME)) {
          db.createObjectStore(RT_STORE_NAME, { keyPath: "key" });
        }
      };
      req.onsuccess = function(e) { _rtDb = e.target.result; resolve(_rtDb); };
      req.onerror = function() { reject(req.error); };
    });
  }

  function rtPut(key, value) {
    return openRTDb().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(RT_STORE_NAME, "readwrite");
        tx.objectStore(RT_STORE_NAME).put({ key: key, value: value, ts: Date.now() });
        tx.oncomplete = function() { resolve(); };
        tx.onerror = function() { reject(tx.error); };
      });
    });
  }

  function rtGet(key) {
    return openRTDb().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(RT_STORE_NAME, "readonly");
        var req = tx.objectStore(RT_STORE_NAME).get(key);
        req.onsuccess = function() { resolve(req.result ? req.result.value : null); };
        req.onerror = function() { reject(req.error); };
      });
    });
  }

  window.RTCache = {
    put: rtPut,
    get: rtGet,
    savePositions: function(positions) { return rtPut("positions", positions); },
    saveDelayInfo: function(delayInfo) { return rtPut("delayInfo", delayInfo); },
    loadPositions: function() { return rtGet("positions"); },
    loadDelayInfo: function() { return rtGet("delayInfo"); }
  };

  var DATA_FILE = "../data/core/railway_data.json";
  var loaded = false;
  var error = null;

  function load() {
    if (loaded) return Promise.resolve();
    return fetch(DATA_FILE)
      .then(function(res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function(data) {
        // Station coordinates
        window.STATION_COORDS = {};
        Object.keys(data.stations).forEach(function(id) {
          var s = data.stations[id];
          window.STATION_COORDS[id] = [s.lat, s.lng];
        });

        // Station name maps
        window.STATION_NAME_MAP = data.name_map || {};
        window.EN_STATION_NAME_MAP = {};
        Object.keys(window.STATION_NAME_MAP).forEach(function(jp) {
          window.EN_STATION_NAME_MAP[window.STATION_NAME_MAP[jp]] = jp;
        });

        // Railway lines
        window.UNIFIED_LINES = data.lines || {};
        Object.keys(window.UNIFIED_LINES).forEach(function(lid) {
          var l = window.UNIFIED_LINES[lid];
          if (!l.durations) l.durations = [2] * (l.stations ? l.stations.length : 0);
          if (!l.throughServices) l.throughServices = [];
          if (!l.transferStations) l.transferStations = [];
        });

        // Tourism data
        window.TOURISM_DATA = data.tourism || {};
        window.TOURISM_STATIONS = Object.keys(window.TOURISM_DATA);

        // Raw data access for advanced features
        window.RailwayDB = {
          getStation: function(id) { return data.stations[id] || null; },
          getNameMap: function() { return data.name_map; },
          getLine: function(id) { return data.lines[id] || null; },
          getAllLines: function() { return data.lines; },
          getTourism: function() { return data.tourism; },
          getSpot: function(station, spotName) {
            var ts = data.tourism[station];
            if (!ts) return null;
            return ts.spots.find(function(s) { return s.name === spotName; }) || null;
          }
        };

        loaded = true;
        console.log("[DbLoader] Data loaded: " +
          Object.keys(data.stations).length + " stations, " +
          Object.keys(data.lines).length + " lines, " +
          Object.keys(data.tourism).length + " tourism stations");
      })
      .catch(function(err) {
        error = err;
        console.error("[DbLoader] Failed to load:", err.message);
        throw err;
      });
  }

  window.DataLoader = {
    load: load,
    isLoaded: function() { return loaded; },
    getError: function() { return error; }
  };

  // Expose RT cache helpers
  window.RailwayRTC = {
    savePositions: function(positions) { return window.RTCache.savePositions(positions); },
    saveDelayInfo: function(delayInfo) { return window.RTCache.saveDelayInfo(delayInfo); },
    loadPositions: function() { return window.RTCache.loadPositions(); },
    loadDelayInfo: function() { return window.RTCache.loadDelayInfo(); }
  };

  // Auto-load on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
