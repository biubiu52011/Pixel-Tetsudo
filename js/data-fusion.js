/*
 * Pixel Tetsudo - DataFusion v11 (Position Support)
 * 线路数据融合引擎 + GTFS-RT 列车位置
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

  // ========== GTFS-RT Protobuf Parser ==========
  function parseVarint(bytes, pos) {
    var result = 0, shift = 0;
    while (pos < bytes.length && shift < 35) {
      var b = bytes[pos++];
      result |= (b & 0x7F) << shift;
      shift += 7;
      if ((b & 0x80) === 0) break;
    }
    return { value: result, pos: pos };
  }

  function parseFixed64(bytes, pos) {
    if (pos + 8 > bytes.length) return { value: 0, pos: pos };
    var view = new DataView(bytes.buffer, bytes.byteOffset + pos, 8);
    return { value: view.getFloat64(0, true), pos: pos + 8 };
  }

  function parseLengthDelimited(bytes, pos) {
    var lenResult = parseVarint(bytes, pos);
    var len = lenResult.value;
    var end = lenResult.pos + len;
    if (end > bytes.length) end = bytes.length;
    return { value: bytes.slice(lenResult.pos, end), pos: end };
  }

  function decodeStringBytes(bytes) {
    var str = "";
    for (var i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
    return str;
  }

  // Parse Entity message (top-level GTFS-RT entity)
  function parseEntity(bytes, offset, limit) {
    var entity = null;
    var pos = offset;
    while (pos < limit) {
      var fieldResult = parseVarint(bytes, pos);
      var tag = fieldResult.value;
      var fieldNum = tag >>> 3;
      var wireType = tag & 0x07;
      pos = fieldResult.pos;
      if (wireType === 2) {
        var innerResult = parseLengthDelimited(bytes, pos);
        var innerBytes = innerResult.value;
        var innerPos = 0;
        while (innerPos < innerBytes.length) {
          var innerFieldResult = parseVarint(innerBytes, innerPos);
          var innerTag = innerFieldResult.value;
          var innerFieldNum = innerTag >>> 3;
          var innerWireType = innerTag & 0x07;
          innerPos = innerFieldResult.pos;
          if (innerWireType === 2) {
            var subResult = parseLengthDelimited(innerBytes, innerPos);
            if (innerFieldNum === 1) {
              // entityId as string
              entity = entity || {};
              entity.entityId = decodeStringBytes(subResult.value);
            } else if (innerFieldNum === 2) {
              // VehiclePosition submessage
              entity = entity || {};
              entity.vehicle = parseVehicle(subResult.value, subResult.pos);
            }
            innerPos = subResult.pos;
          } else if (innerWireType === 0) {
            innerPos++;
          } else {
            break;
          }
        }
        pos = innerResult.pos;
      } else if (wireType === 0) {
        pos++;
      } else {
        break;
      }
    }
    return entity;
  }

  // Parse VehiclePosition message
  function parseVehicle(bytes, limit) {
    var result = { tripId: null, lineCode: null, lat: null, lon: null };
    var pos = 0;
    while (pos < limit) {
      var fieldResult = parseVarint(bytes, pos);
      var tag = fieldResult.value;
      var fieldNum = tag >>> 3;
      var wireType = tag & 0x07;
      pos = fieldResult.pos;
      if (wireType === 2) {
        var innerResult = parseLengthDelimited(bytes, pos);
        if (fieldNum === 1) {
          // Trip submessage
          var trip = parseTrip(innerResult.value, innerResult.pos);
          result.tripId = trip.tripId;
          result.lineCode = trip.lineCode;
        } else if (fieldNum === 3) {
          // Location submessage
          var loc = parseLocation(innerResult.value, innerResult.pos);
          if (loc) { result.lat = loc.lat; result.lon = loc.lon; }
        }
        pos = innerResult.pos;
      } else if (wireType === 0) {
        pos++;
      } else if (wireType === 5) {
        pos += 4;
      } else {
        break;
      }
    }
    return result;
  }

  // Parse Trip message
  function parseTrip(bytes, limit) {
    var result = { tripId: null, lineCode: null };
    var pos = 0;
    while (pos < limit) {
      var fieldResult = parseVarint(bytes, pos);
      var tag = fieldResult.value;
      var fieldNum = tag >>> 3;
      var wireType = tag & 0x07;
      pos = fieldResult.pos;
      if (wireType === 2) {
        var innerResult = parseLengthDelimited(bytes, pos);
        if (fieldNum === 1) {
          var td = decodeStringBytes(innerResult.value);
          result.tripId = td;
          var lm = td.match(/^(JR-East|TokyoMetro|Toei|YokohamaMunicipal)/);
          if (lm) result.lineCode = lm[1];
        }
        pos = innerResult.pos;
      } else if (wireType === 0) {
        pos++;
      } else {
        break;
      }
    }
    return result;
  }

  // Parse Location message
  function parseLocation(bytes, limit) {
    var result = { lat: null, lon: null };
    var pos = 0;
    while (pos < limit) {
      var fieldResult = parseVarint(bytes, pos);
      var tag = fieldResult.value;
      var fieldNum = tag >>> 3;
      var wireType = tag & 0x07;
      pos = fieldResult.pos;
      if (wireType === 5) {
        if (fieldNum === 3) {
          var lonResult = parseFixed64(bytes, pos);
          result.lon = lonResult.value / 1E7;
          pos = lonResult.pos;
        } else if (fieldNum === 4) {
          var latResult = parseFixed64(bytes, pos);
          result.lat = latResult.value / 1E7;
          pos = latResult.pos;
        } else {
          pos += 8;
        }
      } else if (wireType === 2) {
        var s = parseLengthDelimited(bytes, pos);
        pos = s.pos;
      } else if (wireType === 0) {
        pos++;
      } else {
        break;
      }
    }
    return (result.lat !== null && result.lon !== null) ? result : null;
  }

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
      var knownLines = window.UNIFIED_LINES;
      if (!knownLines) return null;
      var ids = Object.keys(knownLines);
      for (var i = 0; i < ids.length; i++) {
        if (knownLines[ids[i]].operator === lineCode) return ids[i];
      }
      return null;
    } catch(e) { return null; }
  }

  // ========== Data Loading ==========
  function emitUpdate(fusedData) {
    if (fusedData && fusedData.lines && Object.keys(fusedData.lines).length > 0) {
      _lastFusedData = fusedData;
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
      } else {
        localData = { lines: {}, statusMap: {} };
      }
    } catch(e) { localData = { lines: {}, statusMap: {} }; }
  }

  function syncStatusMap() {
    try {
      if (!window.UNIFIED_LINES) return;
      var lineIds = Object.keys(window.UNIFIED_LINES);
      var statusMap = localData.statusMap || {};
      for (var i = 0; i < lineIds.length; i++) {
        if (!statusMap[lineIds[i]]) {
          statusMap[lineIds[i]] = { status: "normal", maxDelay: 0, interval: null, cause: null };
        }
      }
      localData.statusMap = statusMap;
    } catch(e) {}
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

  function fuseAll() {
    try {
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
      return null;
    }
  }

  async function loadTrainPositions() {
    try {
      if (!window.ODPTClient || !window.ODPTClient.gtfsRealtime) return;
      var feeds = [
        { source: "challenge", feedId: "jreast_odpt_train_vehicle" },
        { source: "center", feedId: "toei_odpt_train_vehicle" },
        { source: "center", feedId: "YokohamaMunicipalTrain_vehicle" }
      ];
      var promises = [];
      for (var i = 0; i < feeds.length; i++) {
        (function(feed) {
          var fetcher = feed.source === "challenge"
            ? window.ODPTClient.gtfsRealtime.getChallengeFeed
            : window.ODPTClient.gtfsRealtime.getCenterFeed;
          promises.push(
            fetcher.call(window.ODPTClient.gtfsRealtime, feed.feedId)
              .then(function(data) {
                if (!data) return;
                try { processGTFSFeed(feed.feedId, data); } catch(e) {}
              })
              .catch(function() {})
          );
        })(feeds[i]);
      }
      await Promise.all(promises);
      if (Object.keys(odptData.realtimePositions).length > 0) {
        console.log("[DataFusion] Loaded positions for " + Object.keys(odptData.realtimePositions).length + " lines");
        fuseAll();
      }
    } catch(e) { console.warn("[DataFusion] loadTrainPositions error:", e.message); }
  }

  function processGTFSFeed(feedId, data) {
    try {
      var decoder = new TextDecoder("utf-8");
      var text = decoder.decode(data);
      if (text.charCodeAt(0) < 32 && text.charCodeAt(0) !== 10) {
        processBinaryFeed(feedId, data);
      } else {
        processTextFeed(feedId, text);
      }
    } catch(e) { console.warn("[DataFusion] processGTFSFeed error:", e.message); }
  }

  function processBinaryFeed(feedId, data) {
    try {
      var bytes = new Uint8Array(data);
      var entities = [];
      var pos = 0;
      while (pos < bytes.length) {
        var fieldResult = parseVarint(bytes, pos);
        var tag = fieldResult.value;
        var fieldNum = tag >>> 3;
        var wireType = tag & 0x07;
        pos = fieldResult.pos;
        if (wireType === 2 && fieldNum === 2) {
          var entityResult = parseLengthDelimited(bytes, pos);
          var entity = parseEntity(entityResult.value, 0, entityResult.value.length);
          if (entity && entity.vehicle) entities.push(entity);
          pos = entityResult.pos;
        } else if (wireType === 0) {
          pos++;
        } else {
          break;
        }
      }
      for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var v = entity.vehicle;
        if (!v || !v.lineCode || v.lat === null) continue;
        var lineKey = mapLineCodeToLineId(v.lineCode, v.tripId);
        if (!lineKey) continue;
        if (!odptData.realtimePositions[lineKey]) odptData.realtimePositions[lineKey] = [];
        var line = window.UNIFIED_LINES && window.UNIFIED_LINES[lineKey];
        var stationIndex = findStationIndex(line, v.lat, v.lon);
        odptData.realtimePositions[lineKey].push({
          lat: v.lat, lon: v.lon, stationIndex: stationIndex, tripId: v.tripId || ""
        });
      }
    } catch(e) { console.warn("[DataFusion] processBinaryFeed error:", e.message); }
  }

  function processTextFeed(feedId, text) {
    try {
      var lines = text.split("\n");
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line || line[0] === "#") continue;
        var parts = line.split(",");
        if (parts.length < 8) continue;
        var tripId = parts[1] || "";
        var opMatch = tripId.match(/^(JR-East|TokyoMetro|Toei|YokohamaMunicipal)/);
        if (!opMatch) continue;
        var lat = parseFloat(parts[5]);
        var lon = parseFloat(parts[6]);
        if (isNaN(lat) || isNaN(lon)) continue;
        var lineKey = mapLineCodeToLineId(opMatch[1], tripId);
        if (!lineKey) continue;
        if (!odptData.realtimePositions[lineKey]) odptData.realtimePositions[lineKey] = [];
        var l = window.UNIFIED_LINES && window.UNIFIED_LINES[lineKey];
        var si = findStationIndex(l, lat, lon);
        odptData.realtimePositions[lineKey].push({ lat: lat, lon: lon, stationIndex: si, tripId: tripId });
      }
    } catch(e) { console.warn("[DataFusion] processTextFeed error:", e.message); }
  }

  function init() {
    console.log("[DataFusion] Initializing v" + FUSION_VERSION);
    loadLocalData();
    syncStatusMap();
    checkCacheStale();
    fuseAll();
    loadTrainPositions().catch(function() {});
    if (_positionTimer) clearInterval(_positionTimer);
    _positionTimer = setInterval(function() { loadTrainPositions().catch(function() {}); }, POSITION_INTERVAL);
    setInterval(function() { fuseAll().catch(function() {}); }, REFRESH_INTERVAL);
    console.log("[DataFusion] Ready");
  }

  window.DataFusion = {
    init: init, fuseAll: fuseAll,
    subscribe: subscribe,
    getFusedData: function() { return window.DATA_FUSION || _lastFusedData || null; },
    getLine: function(lineId) {
      var data = window.DATA_FUSION || _lastFusedData;
      return data && data.lines ? data.lines[lineId] : null;
    },
    getOdptData: function() { return odptData; },
    getOperatorTrains: function(operator) { return odptData.trains[operator] || []; },
    getOperatorStations: function(operator) { return odptData.stations[operator] || []; },
    getRealtimePositions: function(lineId) { return odptData.realtimePositions[lineId] || []; },
    getCachedData: function() { return _lastFusedData; },
    refresh: function() { return fuseAll(); }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
