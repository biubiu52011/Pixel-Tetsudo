/* trains-data.js: 列车页数据读取（全局） */

// 全局缓存
var _routeGeometryCache = {};
var _transferMapCache = null;

function getLinesData() {
  if (window.DataFusion) {
    var fused = window.DataFusion.getFusedData();
    if (fused && fused.lines && Object.keys(fused.lines).length > 0) {
      return fused.lines;
    }
  }
  var rawLines = window.DataLayer ? window.DataLayer.getAllLines() : (window.UNIFIED_LINES || {});
  var ul = Array.isArray(rawLines) ? (function() { var d = {}; rawLines.forEach(function(l) { d[l.id || l.line_id] = l; }); return d; })() : rawLines;
  if (!ul) return {};
  var lines = {};
  var ids = Object.keys(ul);
  for (var i = 0; i < ids.length; i++) {
    var l = ul[ids[i]];
    if (!l) continue;
    lines[ids[i]] = {
      id: ids[i],
      name: l.name || ids[i],
      nameEn: l.nameEn || l.name || ids[i],
      code: l.code || ids[i],
      color: (window.LineOperationSystemsResolveColor && window.LineOperationSystemsResolveColor(ids[i])) || l.color || (window.TrainsColors ? window.TrainsColors.LINE_UNKNOWN : "#888888"),
      operator: l.operator || "Unknown",
      region: l.region || "",
      type: l.type || "straight",
      image: l.image || "",
      stations: l.stations || [],
      durations: l.durations || [],
      realtimePositions: [],
      nameJa: l.nameJa || l.name || ids[i],
      branchOf: l.branchOf || null,
      isSixShapedLoop: l.isSixShapedLoop === true,
      isDoubleColumnLoop: l.isDoubleColumnLoop === true,
      loopJunction: l.loopJunction || null
    };
  }
  return lines;
}

function getRealtimePositions(lineId) {
  var positions = _getBasePositions(lineId);
  var ext = _fusionExtensionLines(lineId);
  if (ext && ext.length > 0) {
    var all = positions.slice();
    for (var ei = 0; ei < ext.length; ei++) {
      var ep = _getBasePositions(ext[ei].lid);
      for (var ej = 0; ej < ep.length; ej++) {
        var np = {};
        for (var pk in ep[ej]) { if (ep[ej].hasOwnProperty(pk)) np[pk] = ep[ej][pk]; }
        np.fusionLineId = ext[ei].lid;
        all.push(np);
      }
    }
    return all;
  }
  var _src = (window.RailwayDB && window.RailwayDB.getAllLines) ? window.RailwayDB.getAllLines() : getLinesData();
  var _brs = [];
  if (_src && _src[lineId] && _src[lineId].branches) {
    _brs = _src[lineId].branches;
  } else if (_src) {
    for (var _bk in _src) {
      if (_src[_bk].branchOf === lineId && _bk !== lineId) _brs.push(_bk);
    }
  }
  if (_brs.length > 0) {
    var _all2 = positions.slice();
    for (var _bi2 = 0; _bi2 < _brs.length; _bi2++) {
      var _blid = _brs[_bi2];
      if (!_src[_blid] || !_src[_blid].stations || _src[_blid].stations.length === 0) continue;
      var _bp = _getBasePositions(_blid);
      for (var _bj = 0; _bj < _bp.length; _bj++) {
        var _np2 = {};
        for (var _pk2 in _bp[_bj]) { if (_bp[_bj].hasOwnProperty(_pk2)) _np2[_pk2] = _bp[_bj][_pk2]; }
        _np2.fusionLineId = _blid;
        _all2.push(_np2);
      }
    }
    return _all2;
  }
  return positions;
}

function _getBasePositions(lineId) {
  try {
    if (window.DataFusion && window.DataFusion.getRealtimePositions) {
      var pos = window.DataFusion.getRealtimePositions(lineId);
      if (pos && pos.length > 0) return pos;
    }
    if (window.DataLayer && window.DataLayer.getCachedPositions) {
      var cp = window.DataLayer.getCachedPositions(lineId);
      if (cp && cp.length > 0) return cp;
    }
    var ul = window.UNIFIED_LINES;
    if (ul && ul[lineId] && ul[lineId].cachedPositions) {
      return ul[lineId].cachedPositions;
    }
  } catch(e) {}
  return [];
}

function _fusionExtensionLines(lineId) {
  try {
    var src = (window.RailwayDB && window.RailwayDB.getAllLines) ? window.RailwayDB.getAllLines() : getLinesData();
    var own = src[lineId];
    if (!own || !own.stations || own.stations.length < 2) return null;
    var first = own.stations[0], last = own.stations[own.stations.length - 1];
    var out = [];
    var sysLineIds = null;
    if (window.LineOperationSystems) {
      var ops = window.LineOperationSystems;
      for (var ok in ops) {
        var list = ops[ok];
        if (!Array.isArray(list)) continue;
        for (var si = 0; si < list.length; si++) {
          var sys = list[si];
          if (sys && sys.lineIds && sys.lineIds.indexOf(lineId) >= 0 && sys.lineIds.length > 1) {
            sysLineIds = sys.lineIds;
            break;
          }
        }
        if (sysLineIds) break;
      }
    }
    if (sysLineIds) {
      var thr = (window.ThroughService && window.ThroughService.getDirectThroughLines) ? window.ThroughService.getDirectThroughLines(lineId) : [];
      if (thr && thr.length > 0) {
        for (var i = 0; i < sysLineIds.length; i++) {
          var lid2 = sysLineIds[i];
          if (lid2 === lineId) continue;
          if (thr.indexOf(lid2) < 0) continue;
          var l2 = src[lid2];
          if (!l2 || !l2.stations || l2.stations.length < 2) continue;
          if (l2.stations[0] === last) {
            out.push({ lid: lid2, joinAtEnd: true, baseIdx: own.stations.length - 1 });
          } else if (l2.stations[l2.stations.length - 1] === first) {
            out.push({ lid: lid2, joinAtEnd: false, baseIdx: 0 });
          }
        }
      }
    }
    var trunk = (window.DataState && window.DataState.TRUNK_MAIN_LINE_IDS) || [];
    var _TRUNK_EXTENSION_ALLOW = (window.RuntimeConfig && window.RuntimeConfig.TRUNK_EXTENSION_ALLOW) || {};
    for (var ti = 0; ti < trunk.length; ti++) {
      var tlid = trunk[ti];
      if (!_TRUNK_EXTENSION_ALLOW[tlid]) continue;
      var tl = src[tlid];
      if (!tl || !tl.stations || tl.stations.length < 2) continue;
      var already = false;
      for (var ai = 0; ai < out.length; ai++) { if (out[ai].lid === tlid) { already = true; break; } }
      if (already) continue;
      if (tl.stations[0] === last) {
        out.push({ lid: tlid, joinAtEnd: true, baseIdx: own.stations.length - 1 });
      } else if (tl.stations[tl.stations.length - 1] === first) {
        out.push({ lid: tlid, joinAtEnd: false, baseIdx: 0 });
      }
    }
    return out.length ? out : null;
  } catch(e) { return null; }
}

function _fusionBaseIdx(lineId, fusionLineId) {
  try {
    var g = _routeGeometryCache[_geomKey(lineId)];
    if (g && g.fusionMap && g.fusionMap[fusionLineId]) return g.fusionMap[fusionLineId].baseIdx;
    var allLines = getLinesData();
    var own = allLines[lineId], ext = allLines[fusionLineId];
    if (own && ext && ext.stations && own.stations) {
      if (ext.stations[0] === own.stations[own.stations.length - 1]) return own.stations.length - 1;
      if (ext.stations[ext.stations.length - 1] === own.stations[0]) return 0;
    }
  } catch(e) {}
  return -1;
}

function _throughDirForStation(lineId, stationId, throughLineId) {
  var thrIds = (window.ThroughService && window.ThroughService.getDirectThroughLines) ? window.ThroughService.getDirectThroughLines(lineId) : [];
  if (!thrIds.length) return null;
  var src2 = (window.RailwayDB && window.RailwayDB.getAllLines) ? window.RailwayDB.getAllLines() : getLinesData();
  var own2 = src2[lineId];
  var sts2 = (own2 && own2.stations) ? own2.stations : [];
  var idx2 = sts2.indexOf(stationId);
  if (idx2 < 0) return null;
  var targetIds = throughLineId ? [throughLineId] : thrIds;
  for (var ti = 0; ti < targetIds.length; ti++) {
    var tl = src2[targetIds[ti]];
    if (!tl || !tl.stations) continue;
    if (tl.stations.indexOf(stationId) < 0) continue;
    if (idx2 === 0) return "up";
    if (idx2 === sts2.length - 1) return "down";
    var allAfterOnThrough = true;
    var afterCount = 0;
    for (var ai = idx2 + 1; ai < sts2.length; ai++) {
      if (tl.stations.indexOf(sts2[ai]) < 0) { allAfterOnThrough = false; break; }
      afterCount++;
    }
    if (allAfterOnThrough && afterCount >= 2) return "down";
    var allBeforeOnThrough = true;
    var beforeCount = 0;
    for (var bi = 0; bi < idx2; bi++) {
      if (tl.stations.indexOf(sts2[bi]) < 0) { allBeforeOnThrough = false; break; }
      beforeCount++;
    }
    if (allBeforeOnThrough && beforeCount >= 2) return "up";
    return "middle";
  }
  return null;
}

function _getTransferMap(lineId) {
  var _langNow = window.currentLang || "ja";
  if (_transferMapCache && _transferMapCache.lineId === lineId && _transferMapCache.lang === _langNow) return _transferMapCache.map;
  var src = (window.RailwayDB && window.RailwayDB.getAllLines) ? window.RailwayDB.getAllLines() : getLinesData();
  var map = {};
  var own = src[lineId];
  var declared = (own && Array.isArray(own.transferStations)) ? own.transferStations : [];
  var ownStations = (own && own.stations) ? own.stations : [];
  for (var di = 0; di < declared.length; di++) {
    var t = declared[di];
    if (!t || !t.station || !t.lineId) continue;
    if (t.lineId === lineId) continue;
    // v4.3.943: 共线区间不画换乘标记 + v4.3.960: 自动判断共线线
    if (window.SharedTrackPairs && window.SharedTrackPairs.isSharedStation) {
      if (window.SharedTrackPairs.isSharedStation(lineId, t.station)) continue;
    }
    var tl = src[t.lineId];
    if (!tl) continue;
    var _placeholderRe = /(グループ|ロゴ|マーク|アイコン|シンボル)/;
    var _losIcon = (window.LineOperationSystemsResolveIcon && window.LineOperationSystemsResolveIcon(t.lineId)) || "";
    var img = (_losIcon && !_placeholderRe.test(_losIcon)) ? _losIcon :
              (tl.image && !_placeholderRe.test(tl.image) ? tl.image : "");
    var nm = (window.RailwayDB && window.RailwayDB.resolveLineName) ? window.RailwayDB.resolveLineName(t.lineId, window.currentLang) : (tl.name || t.lineId);
    if (!map[t.station]) map[t.station] = [];
    map[t.station].push({
      lineId: t.lineId, image: img, name: nm, operator: tl.operator || "",
      code: tl.code || "",
      color: (window.LineOperationSystemsResolveColor && window.LineOperationSystemsResolveColor(t.lineId)) || tl.color || "", type: t.type === "out" ? "out" : "in", note: t.note || "", toStation: t.toStation || ""
    });
  }
  var throughLines = (window.ThroughService && window.ThroughService.getDirectThroughLines) ? window.ThroughService.getDirectThroughLines(lineId) : [];
  if (throughLines.length > 0) {
    for (var i2 = 0; i2 < ownStations.length; i2++) {
      var stArr = map[ownStations[i2]];
      if (!stArr) continue;
      for (var j2 = 0; j2 < stArr.length; j2++) {
        if (throughLines.indexOf(stArr[j2].lineId) >= 0) {
          var _js = (window.ThroughService && window.ThroughService.getJoinStations) ? window.ThroughService.getJoinStations(lineId, stArr[j2].lineId) : null;
          if (_js === null || _js.indexOf(ownStations[i2]) >= 0) {
            stArr[j2].through = true;
            stArr[j2].dir = _throughDirForStation(lineId, ownStations[i2], stArr[j2].lineId) || "middle";
          }
        }
      }
    }
  }
  _transferMapCache = { lineId: lineId, lang: _langNow, map: map };
  return map;
}

function _losGroupKey(t) {
  var los = window.LineOperationSystems;
  if (!los || !t) return null;
  var found = null;
  for (var g in los) {
    var arr = los[g];
    if (!Array.isArray(arr)) continue;
    for (var i = 0; i < arr.length; i++) {
      var sys = arr[i];
      if (sys.lineIds && sys.lineIds.indexOf(t.lineId) !== -1) { found = sys; break; }
    }
    if (found) break;
  }
  if (!found) return null;
  return found.code + "|" + (found.icon || "");
}
