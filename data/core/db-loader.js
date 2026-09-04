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
        req.onerror = function() { reject(tx.error); };
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
  var STATION_I18N_FILE = "../data/core/station_i18n.json";
  var _stationI18n = {};
  var loaded = false;
  var error = null;

  // Apply station data from an object with .stations, .lines, .tourism structure
function applyData(data, i18n) {
    _stationI18n = i18n || {};
    window.STATION_COORDS = {};
    Object.keys(data.stations).forEach(function(id) {
      var s = data.stations[id];
      if (s.lat && s.lng) {
        window.STATION_COORDS[id] = [s.lat, s.lng];
      }
    });

    window.STATION_NAME_MAP = data.name_map || {};
    window.EN_STATION_NAME_MAP = {};
    Object.keys(window.STATION_NAME_MAP).forEach(function(jp) {
      var v = window.STATION_NAME_MAP[jp];
      if (v && v.en) window.EN_STATION_NAME_MAP[v.en] = jp;
    });

    window.UNIFIED_LINES = data.lines || {};
    Object.keys(window.UNIFIED_LINES).forEach(function(lid) {
      var l = window.UNIFIED_LINES[lid];
      if (!l.durations) l.durations = [2] * (l.stations ? l.stations.length : 0);
      if (!l.throughServices) l.throughServices = [];
      if (!l.transferStations) l.transferStations = [];
    });

    window.TOURISM_DATA = data.tourism || {};
    window.TOURISM_STATIONS = Object.keys(window.TOURISM_DATA);

    // Build canonical StationLine relation
    window.STATION_LINES = {};
    if (data.stationLines) {
      Object.assign(window.STATION_LINES, data.stationLines);
    } else {
      Object.keys(window.UNIFIED_LINES).forEach(function(lid) {
        var line = window.UNIFIED_LINES[lid];
        if (line.stations) {
          line.stations.forEach(function(sid, order) {
            if (!window.STATION_LINES[sid]) window.STATION_LINES[sid] = [];
            window.STATION_LINES[sid].push({line_id: lid, station_order: order});
          });
        }
      });
    }

    // Build line->station order map
    window.LINE_STATION_ORDER = {};
    if (data.lineStationOrder) {
      Object.assign(window.LINE_STATION_ORDER, data.lineStationOrder);
    } else {
      Object.keys(window.UNIFIED_LINES).forEach(function(lid) {
        var line = window.UNIFIED_LINES[lid];
        if (line.stations) {
          window.LINE_STATION_ORDER[lid] = {};
          line.stations.forEach(function(sid, order) {
            window.LINE_STATION_ORDER[lid][sid] = order;
          });
        }
      });
    }

    // ========== Unified Railway Data Access Layer ==========
          // Name map cache
      var _nameMapCache = {};

      window.RailwayDB = {
      // Station queries
      getStation: function(id) { return data.stations[id] || null; },
      getStations: function() { return data.stations; },
      getStationLocation: function(id) {
        var s = data.stations[id];
        return s && s.lat && s.lng ? [s.lat, s.lng] : null;
      },
      getStationLines: function(id) { return window.STATION_LINES[id] || []; },
      getStationName: function(id, lang) {
        if (!id) return null;
        var nm = window.STATION_NAME_MAP;
        if (lang === 'en') {
          var enMap = window.EN_STATION_NAME_MAP || {};
          if (nm[id] && nm[id].en) return nm[id].en;
          for (var k in nm) { if (nm[k].en === id) return nm[k].ja || k; }
          return id;
        }
        return nm[id] && nm[id].ja ? nm[id].ja : id;
      },

      // Line queries
      getLine: function(id) { return data.lines[id] || null; },
      getAllLines: function() { return data.lines; },
      getLineStations: function(id) {
        var line = data.lines[id];
        return line ? line.stations || [] : [];
      },
      getLineStationOrder: function(lineId, stationId) {
        var orderMap = window.LINE_STATION_ORDER[lineId];
        return orderMap ? orderMap[stationId] : null;
      },
      getLineColors: function() {
        var colors = {};
        Object.keys(data.lines).forEach(function(k){ colors[k] = data.lines[k].color; });
        return colors;
      },
      // Display name resolution
      resolveLineName: function(id, lang) {
        if (!id) return '';
        lang = (lang || window.currentLang || 'ja').toLowerCase();
        var line = data.lines ? data.lines[id] : null;
        if (!line) return id;
        var nameKey = 'name' + lang.charAt(0).toUpperCase() + lang.slice(1);
        return line[nameKey] || line.nameJa || line.nameEn || line.name || id;
      },
      // Transfer queries
      getTransferStations: function(stationId) {
        var lines = window.STATION_LINES[stationId] || [];
        if (lines.length < 2) return [];
        var transfers = [];
        lines.forEach(function(sl){
          var line = data.lines[sl.line_id];
          if (line && line.transferStations) {
            line.transferStations.forEach(function(ts){
              if (ts.station === stationId) transfers.push(ts.connects || []);
            });
          }
        });
        return transfers.length > 0 ? transfers[0] : [];
      },

      // Nearby queries
      getNearbyStations: function(lat, lng, radiusKm, limit) {
        limit = limit || 10;
        radiusKm = radiusKm || 2;
        var results = [];
        Object.keys(data.stations).forEach(function(id) {
          var s = data.stations[id];
          if (!s.lat || !s.lng) return;
          var d = Math.sqrt(Math.pow(s.lat-lat,2)+Math.pow(s.lng-lng,2))*111;
          if (d <= radiusKm) results.push({id: id, dist: d, name: s});
        });
        results.sort(function(a,b){return a.dist-b.dist;});
        return results.slice(0, limit).map(function(r){return r.id;});
      },
      getNearbySpots: function(lat, lng, radiusKm, limit) {
        limit = limit || 10;
        radiusKm = radiusKm || 5;
        var results = [];
        Object.keys(data.tourism || {}).forEach(function(sid) {
          var ts = data.tourism[sid];
          if (!ts.spots) return;
          ts.spots.forEach(function(sp){
            var spLat = sp.lat || (sp.coord && sp.coord[0]);
            var spLng = sp.lng || (sp.coord && sp.coord[1]);
            if (!spLat || !spLng) return;
            var d = Math.sqrt(Math.pow(spLat-lat,2)+Math.pow(spLng-lng,2))*111;
            if (d <= radiusKm) results.push({stationId: sid, spot: sp, dist: d});
          });
        });
        results.sort(function(a,b){return a.dist-b.dist;});
        return results.slice(0, limit);
      },

      // Name map
      getNameMap: function() { return data.name_map; },
      resolveStationName: function(id, lang) {
        if (!id) return null;
        lang = lang || window.currentLang || 'ja';
        // 0. Check dedicated station_i18n data (zh/ko/ja) first
        if (_stationI18n && _stationI18n[id]) {
          var _i18n = _stationI18n[id];
          if (lang === 'zh' && _i18n.zh) return _i18n.zh;
          if (lang === 'ko' && _i18n.ko) return _i18n.ko;
          if (lang === 'ja' && _i18n.ja) return _i18n.ja;
        }
        var nm = data.name_map;
        var _hasJp = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/.test(id);

        // 0. If id is already Japanese, return it for ja mode;
        //    for other languages try name_map for the English translation.
        if (_hasJp) {
          if (lang === 'ja') return id;
          var direct = nm[id];
          if (direct) {
            if (typeof direct === 'string') return direct;
            if (typeof direct === 'object' && direct[lang]) return direct[lang];
            if (typeof direct === 'object' && direct.en) return direct.en;
          }
          return id;
        }

        // 1. Check station entity name fields (forward-compatible)
        var s = data.stations[id];
        if (s) {
          var n = s['name' + lang.charAt(0).toUpperCase() + lang.slice(1)];
          if (n) return n;
        }

        // 2. Reverse lookup: romanized id -> Japanese key in name_map.
        //    Prefer keys without trailing 駅 (display names omit the suffix).
        var valToKey = _nameMapCache.valToKey;
        if (!valToKey) {
          valToKey = {};
          Object.keys(nm).forEach(function(jpKey) {
            var val = nm[jpKey];
            if (typeof val !== 'string') return;
            var lk = val.toLowerCase();
            // Prefer the key without trailing 駅 when both exist
            if (!valToKey[lk] || (jpKey.slice(-1) !== '\u99c5' && valToKey[lk].slice(-1) === '\u99c5')) {
              valToKey[lk] = jpKey;
            }
          });
          _nameMapCache.valToKey = valToKey;
        }
        var matchedKey = valToKey[id.toLowerCase()];
        if (matchedKey) {
          // Save the original English value before normalizing the key.
          var _enVal = nm[matchedKey];
          // Strip trailing 駅 when a bare station-name key also exists
          // (e.g. "新宿駅" -> "新宿" because display names omit the suffix).
          if (matchedKey.slice(-1) === '\u99c5' && nm[matchedKey.slice(0, -1)]) {
            matchedKey = matchedKey.slice(0, -1);
          }
          if (lang === 'ja') return matchedKey;
          if (lang === 'en') {
            return typeof _enVal === 'string' ? _enVal : matchedKey;
          }
          // zh / ko: no translation data in canonical DB — fall back to
          // Japanese kanji (readable for Chinese users) rather than English.
          return matchedKey;
        }

        // 3. Fallback: return id
        return id;
      },

      // Tourism
      getTourism: function() { return data.tourism; },
      getSpot: function(station, spotName) {
        var ts = data.tourism ? data.tourism[station] : null;
        if (!ts) return null;
        return ts.spots.find(function(s) { return s.name === spotName; }) || null;
      },

      // Line query helpers (compatibility for modules that used window.UNIFIED_LINES)
      getLines: function() { return window.UNIFIED_LINES || {}; },
      getAllLineIds: function() { return window.UNIFIED_LINES ? Object.keys(window.UNIFIED_LINES) : []; },
      hasLine: function(id) { return !!(window.UNIFIED_LINES && window.UNIFIED_LINES[id]); },
      getLineDurations: function(id) {
        var l = window.UNIFIED_LINES ? window.UNIFIED_LINES[id] : null;
        return l ? (l.durations || []) : [];
      },
      getLineTransferStations: function(id) {
        var l = window.UNIFIED_LINES ? window.UNIFIED_LINES[id] : null;
        return l ? (l.transferStations || []) : [];
      },
      getLineOrder: function(id) { return window.LINE_STATION_ORDER ? window.LINE_STATION_ORDER[id] : null; },

      // Schema info
      getSchema: function() {
        return {
          lineCount: Object.keys(data.lines).length,
          stationCount: Object.keys(data.stations).length,
          stationLineCount: Object.keys(window.STATION_LINES).length,
          nameMapCount: Object.keys(data.name_map).length
        };
      }
    };
  }
function load() {
    if (loaded) return Promise.resolve();

    // Strategy A: if file:// protocol, skip fetch (CORS blocks it) and use script-based data directly.
    // Strategy B: if http/https, try fetch first, fall back to script data on failure.
    var isFileProtocol = (window.location.protocol === 'file:');

    if (isFileProtocol) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '../data/core/railway_data.json', false);
      if (window.RAILWAY_DATA && window.RAILWAY_DATA.stations) { applyData(window.RAILWAY_DATA); loaded = true; return Promise.resolve(); }
      error = new Error("No data source available under file:// protocol");
      console.error("[DbLoader] Failed to load data under file:// protocol");
      return Promise.reject(error);
    }

    // HTTP/HTTPS: try fetch first
    return Promise.all([
      fetch(DATA_FILE).then(function(res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      }),
      fetch(STATION_I18N_FILE).then(function(res) {
        if (!res.ok) return {};
        return res.json();
      }).catch(function() { return {}; })
    ])
      .then(function(results) {
        applyData(results[0], results[1]);
        loaded = true;
        console.log(
          Object.keys(data.stations).length + " stations, " +
          Object.keys(data.lines).length + " lines, " +
          Object.keys(data.tourism).length + " tourism stations");
      })
      .catch(function(err) {
        error = err;
        // Dynamic fallback: load railway-data.js only when needed
        if (!window._railwayDataFallbackLoaded) {
          window._railwayDataFallbackLoaded = true;
          var fbScript = document.createElement('script');
          fbScript.src = '../data/core/railway-data.js';
          fbScript.onload = function() {
            if (window.RAILWAY_DATA && window.RAILWAY_DATA.stations) {
              applyData(window.RAILWAY_DATA);
              loaded = true;
              console.log(
                Object.keys(window.STATION_COORDS).length + " stations, " +
                Object.keys(window.UNIFIED_LINES).length + " lines");
            } else {
              console.error("[DbLoader] railway-data.js loaded but RAILWAY_DATA not found");
              throw new Error("Fallback data unavailable");
            }
          };
          fbScript.onerror = function() {
            console.error("[DbLoader] Failed to load fallback railway-data.js");
            throw err;
          };
          document.head.appendChild(fbScript);
          return new Promise(function(resolve, reject) {
            var origOnload = fbScript.onload;
            fbScript.onload = function() { if (origOnload) origOnload(); resolve(); };
            fbScript.onerror = function() { reject(err); };
          });
        }
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

  // Auto-load on DOM ready, deferring one tick to let synchronous scripts finish.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(load, 0); });
  } else {
    setTimeout(load, 0);
  }

  // ========== Unhandled Promise Rejection Listener ==========
  // Catches any ODPT fetch or async errors that escape internal catch blocks
  window.addEventListener('unhandledrejection', function(event) {
    console.warn('[PixelTetsudo] Unhandled promise rejection:', event.reason ? event.reason.message || event.reason : event.reason);
    event.preventDefault();
  });
})();
