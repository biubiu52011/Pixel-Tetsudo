/*
 * Pixel Tetsudo — Station Resolver
 * Multi-language station name ↔ station_id resolution
 */
(function() {
  "use strict";

  var _jpToEn = {};
  var _enToJp = {};
  var _lineStationIds = null;

  function _hasJapanese(s) { return /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/.test(s); }

  /**
   * Normalize a resolved station ID to the canonical casing used in line.stations.
   * Fixes case-mismatch where entity key differs from line references.
   * E.g. "Azabu-juban" -> "Azabu-Juban", "Tama-center" -> "Tama-Center"
   * Returns the original id if no canonical form is found (entity-only stations).
   */
  function _normalizeId(id) {
    var lower = id.toLowerCase();
    var arr = Array.from(_lineStationIds);
    for (var j = 0; j < arr.length; j++) {
      if (arr[j].toLowerCase() === lower) return arr[j];
    }
    return id;
  }

  function _buildIndex() {
    if (_lineStationIds !== null) return;
    _lineStationIds = new Set();
    var lines = window.RailwayDB && window.RailwayDB.getAllLines
      ? window.RailwayDB.getAllLines()
      : (window.UNIFIED_LINES || {});
    for (var lid in lines) {
      var line = lines[lid];
      if (line && line.stations) {
        for (var i = 0; i < line.stations.length; i++) {
          _lineStationIds.add(line.stations[i]);
        }
      }
    }
    var nm = window.STATION_NAME_MAP || {};
    for (var jpKey in nm) {
      var v = nm[jpKey];
      if (typeof v === "string") {
        _jpToEn[jpKey] = v;
        if (!_enToJp[v.toLowerCase()]) _enToJp[v.toLowerCase()] = jpKey;
      } else if (v && typeof v === "object") {
        var enVal = v.en || v.ja || "";
        if (enVal) {
          _jpToEn[jpKey] = enVal;
          if (!_enToJp[enVal.toLowerCase()]) _enToJp[enVal.toLowerCase()] = jpKey;
        }
      }
    }
  }

  var _MAJOR_STATION_FALLBACK = {
    "\u6771\u4eac": "Tokyo",
    "\u4e0a\u91ce": "Ueno",
    "\u5927\u962a": "Osaka",
    "\u4eac\u90fd": "Kyoto",
    "\u540d\u53e4\u5c4b": "Nagoya",
    "\u672d\u5e4c": "Sapporo",
    "\u798f\u5ca1": "Fukuoka",
    "\u5e83\u5cf6": "Hiroshima",
    "\u7984\u5c71": "Kobe",
    "\u5bbe\u9999": "Sendai",
    "\u79cb\u8449\u539f": "Akihabara",
    "\u65b0\u5bbf": "Shinjuku",
    "\u6e0b\u8c37": "Shibuya",
    "\u6c60\u888b": "Ikebukuro",
    "\u54c1\u5ddd": "Shinagawa",
    "\u9280\u5ea7": "Ginza"
  };

  function resolve(query) {
    if (!query || !query.trim()) return [];
    _buildIndex();
    var q = query.trim();
    var isJp = _hasJapanese(q);
    var qLower = q.toLowerCase();

    if (isJp) {
      if (_MAJOR_STATION_FALLBACK[q]) {
        var fid = _MAJOR_STATION_FALLBACK[q];
        var normFid = _normalizeId(fid);
        return [{ stationId: normFid, displayName: fid, status: "EXACT" }];
      }
      if (_jpToEn[q]) {
        var normJp = _normalizeId(_jpToEn[q]);
        return [{ stationId: normJp, displayName: _jpToEn[q], status: "EXACT" }];
      }
      var jpMatches = [];
      for (var jpKey in _jpToEn) {
        if (jpKey.indexOf(q) !== -1) {
          jpMatches.push({ stationId: _jpToEn[jpKey], displayName: jpKey, status: "ALIAS" });
        }
      }
      if (jpMatches.length > 0) return jpMatches;
      return [{ stationId: null, displayName: q, status: "NOT_FOUND" }];
    }

    if (_lineStationIds.has(qLower)) {
      return [{ stationId: qLower, displayName: qLower, status: "EXACT" }];
    }
    if (_enToJp[qLower]) {
      var jk = _enToJp[qLower];
      var jid = _normalizeId(_jpToEn[jk] || qLower);
      return [{ stationId: jid, displayName: jid, status: "ALIAS" }];
    }
    var partial = [];
    for (var sid in _lineStationIds) {
      if (sid.toLowerCase().indexOf(qLower) !== -1) {
        partial.push({ stationId: sid, displayName: sid, status: "FUZZY_SINGLE" });
      }
    }
    if (partial.length > 0) return partial;
    return [{ stationId: null, displayName: q, status: "NOT_FOUND" }];
  }

  function findStationIds(term, limit) {
    limit = limit || 10;
    var results = resolve(term);
    if (results.length === 0) return [];
    if (results[0].status === "NOT_FOUND") return [];
    if (results.length === 1 && results[0].stationId) return [results[0].stationId];
    var ids = [];
    for (var i = 0; i < results.length && ids.length < limit; i++) {
      if (results[i].stationId) ids.push(results[i].stationId);
    }
    return ids;
  }

  function isKnownStation(query) {
    var r = resolve(query);
    return r.length > 0 && r[0].stationId !== null;
  }

  window.StationResolver = {
    resolve: resolve,
    findStationIds: findStationIds,
    isKnownStation: isKnownStation
  };

})();

