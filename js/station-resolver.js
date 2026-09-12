/*
 * Pixel Tetsudo — Station Resolver
 * Multi-language station name ↔ station_id resolution
 */
(function() {
  "use strict";

  var _jpToEn = {};
  var _enToJp = {};
  var _jpToCanon = {};
  var _lineStationIds = null;

  function _hasJapanese(s) { return /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/.test(s); }

  /**
   * Normalize a resolved station ID to the canonical casing used in line.stations.
   * Fixes case-mismatch where entity key differs from line references.
   * E.g. "Azabu-juban" -> "Azabu-Juban", "Tama-center" -> "Tama-Center"
   * Returns the original id if no canonical form is found (entity-only stations).
   */
  function _normalizeId(id) {
    var lower = _asciiLower(id);
    var arr = Array.from(_lineStationIds);
    // 1. exact case-insensitive match against canonical station IDs
    for (var j = 0; j < arr.length; j++) {
      if (_asciiLower(arr[j]) === lower) return arr[j];
    }
    // 2. hyphen-insensitive match: name_map may point to a variant form of a real station
    //    (Kitasenju->Kita-Senju, Shin-juku->Shinjuku, Kotake-mukaihara->Kotake-Mukaihara, ...).
    //    Resolve only when unambiguous; on collision return the original id rather than guessing.
    // Normalize away both hyphens and spaces: name_map variants like "Keikyū Kawasaki"
    // (space + macron) must match canonical "Keikyu-Kawasaki".
    var noHyphen = lower.replace(/[-\s]/g, '');
    var matched = null;
    for (var k = 0; k < arr.length; k++) {
      if (_asciiLower(arr[k]).replace(/[-\s]/g, '') === noHyphen) {
        if (matched) return id;
        matched = arr[k];
      }
    }
    return matched || id;
  }

  /**
   * Lowercase + decompose accents (NFD) + map long-vowel macrons to plain ASCII,
   * so name_map variants like "Keikyū Kawasaki" match canonical "Keikyu-Kawasaki".
   */
  function _asciiLower(id) {
    return String(id).toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, '')
      .replace(/[ūŪ]/g, 'u')  // ū Ū
      .replace(/[ōŌ]/g, 'o')  // ō Ō
      .replace(/[āĀ]/g, 'a')  // ā Ā
      .replace(/[ēĒ]/g, 'e')  // ē Ē
      .replace(/[īĪ]/g, 'i'); // ī Ī
  }

  function _buildIndex() {
    if (_lineStationIds !== null) return;
    _lineStationIds = new Set();
    _jpToCanon = {};
    var lines = window.RailwayDB && window.RailwayDB.getAllLines
      ? window.RailwayDB.getAllLines()
      : (window.UNIFIED_LINES || {});
    for (var lid in lines) {
      var line = lines[lid];
      if (line && line.stations) {
        for (var i = 0; i < line.stations.length; i++) {
          var _sid = line.stations[i];
          _lineStationIds.add(_sid);
          // Reverse index: official ja display name -> canonical id (overrides broken name_map targets)
          if (window.RailwayDB && window.RailwayDB.resolveStationName) {
            var _ja = window.RailwayDB.resolveStationName(_sid, 'ja');
            if (_ja && _ja !== _sid && !_jpToCanon[_ja]) _jpToCanon[_ja] = _sid;
          }
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
      // Official ja display name reverse lookup first: bypasses broken name_map targets
      // (e.g. 新橋 name_map->"Shinbashi" while the real station is Shimbashi; 北千住->Kitasenju vs Kita-Senju)
      if (_jpToCanon[q]) {
        return [{ stationId: _jpToCanon[q], displayName: q, status: "EXACT" }];
      }
      if (_jpToEn[q]) {
        var normJp = _normalizeId(_jpToEn[q]);
        return [{ stationId: normJp, displayName: _jpToEn[q], status: "EXACT" }];
      }
      var jpMatches = [];
      var _seen = {};
      for (var jpKey in _jpToEn) {
        if (jpKey.indexOf(q) !== -1) {
          var _nid = _normalizeId(_jpToEn[jpKey]);
          if (_nid && !_seen[_nid]) { _seen[_nid] = 1; jpMatches.push({ stationId: _nid, displayName: jpKey, status: "ALIAS" }); }
        }
      }
      for (var jaKey in _jpToCanon) {
        if (jaKey.indexOf(q) !== -1) {
          if (!_seen[_jpToCanon[jaKey]]) { _seen[_jpToCanon[jaKey]] = 1; jpMatches.push({ stationId: _jpToCanon[jaKey], displayName: jaKey, status: "ALIAS" }); }
        }
      }
      if (jpMatches.length > 0) return jpMatches;
      // 4.3.560: 带「駅」后缀的日文输入（如「渋谷駅」）容错——剥离后缀后按站名重新解析
      if (q.charAt(q.length - 1) === "駅") {
        var bare = q.slice(0, -1);
        var bareR = resolve(bare);
        if (bareR.length > 0 && bareR[0].stationId) {
          return bareR.map(function(r) {
            return { stationId: r.stationId, displayName: q, status: r.status };
          });
        }
      }
      return [{ stationId: null, displayName: q, status: "NOT_FOUND" }];
    }

    var _arr = Array.from(_lineStationIds);
    var _qAscii = _asciiLower(q);
    // Exact match over canonical IDs with case/accent normalization
    for (var _i = 0; _i < _arr.length; _i++) {
      if (_asciiLower(_arr[_i]) === _qAscii) {
        return [{ stationId: _arr[_i], displayName: _arr[_i], status: "EXACT" }];
      }
    }
    if (_enToJp[qLower]) {
      var jk = _enToJp[qLower];
      var jid = _normalizeId(_jpToEn[jk] || qLower);
      if (jid) return [{ stationId: jid, displayName: jid, status: "ALIAS" }];
    }
    // Substring match over real station IDs (case/accent-insensitive)
    var partial = [];
    for (var _j = 0; _j < _arr.length; _j++) {
      if (_asciiLower(_arr[_j]).indexOf(_qAscii) !== -1) {
        partial.push({ stationId: _arr[_j], displayName: _arr[_j], status: "FUZZY_SINGLE" });
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

