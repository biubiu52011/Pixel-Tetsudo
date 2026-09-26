/*
 * TrainTrackLayout
 * Converts train positions to display coordinates with directional lanes.
 */
(function () {
  "use strict";

  var DEFAULTS = {
    laneGap: 11,
    stackGap: 8,
    iconW: 14,
    iconH: 18
  };

  function clamp(n, min, max) {
    n = Number(n);
    if (!isFinite(n)) n = min;
    return Math.max(min, Math.min(max, n));
  }

  function loopPosToXY(pos, rect) {
    var cx = rect.cx, cy = rect.cy, halfW = rect.halfW, halfH = rect.halfH;
    var rectW = rect.rectW, rectH = rect.rectH, perimeter = rect.perimeter;
    var p = ((pos % perimeter) + perimeter) % perimeter;
    if (p < rectW) return { x: cx - halfW + p, y: cy - halfH };
    if (p < rectW + rectH) return { x: cx + halfW, y: cy - halfH + (p - rectW) };
    if (p < 2 * rectW + rectH) return { x: cx + halfW - (p - rectW - rectH), y: cy + halfH };
    return { x: cx - halfW, y: cy + halfH - (p - 2 * rectW - rectH) };
  }

  function tangentAt(points, idx, nextIdx) {
    var a = points[idx] || points[0] || { x: 0, y: 0 };
    var b = points[nextIdx] || points[idx + 1] || points[idx - 1] || a;
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: dx / len, y: dy / len };
  }

  function normalFromTangent(t) {
    return { x: -t.y, y: t.x };
  }

  function laneSign(moveDir, railDirection) {
    var rd = String(railDirection || "");
    if (/Inner/.test(rd)) return -1;
    if (/Outer/.test(rd)) return 1;
    if (moveDir === "up") return -1;
    if (moveDir === "down") return 1;
    return 0;
  }

  function interpolate(a, b, progress) {
    progress = clamp(progress, 0, 1);
    return {
      x: a.x + (b.x - a.x) * progress,
      y: a.y + (b.y - a.y) * progress
    };
  }

  function trackKey(position, idx, nextIdx, lane) {
    return [
      position && position.fusionLineId ? position.fusionLineId : "main",
      Math.min(idx, nextIdx),
      Math.max(idx, nextIdx),
      lane
    ].join("|");
  }

  function buildOccupancy(positions, resolver) {
    var counts = {};
    var ordinals = {};
    for (var i = 0; i < positions.length; i++) {
      var r = resolver(positions[i], i, true);
      if (!r) continue;
      counts[r.key] = (counts[r.key] || 0) + 1;
    }
    return {
      next: function (key) {
        var n = ordinals[key] || 0;
        ordinals[key] = n + 1;
        return { ordinal: n, total: counts[key] || 1 };
      }
    };
  }

  function resolveBase(position, stationCoords, geometry, lineId, opts) {
    opts = opts || {};
    var branchGeom = (geometry && geometry.branchGeom) || null;
    var idx = position && position.stationIndex != null ? position.stationIndex : 0;
    var points = stationCoords || [];

    if (position && position.fusionLineId && branchGeom && branchGeom[position.fusionLineId]) {
      points = branchGeom[position.fusionLineId];
      idx = clamp(idx, 0, points.length - 1);
    } else if (position && position.fusionLineId && opts.fusionBaseIdx) {
      var base = opts.fusionBaseIdx(lineId, position.fusionLineId);
      idx = base >= 0 ? base + idx : idx;
      idx = clamp(idx, 0, points.length - 1);
    } else {
      idx = clamp(idx, 0, points.length - 1);
    }

    var toIdx = position && position.segmentToIndex != null ? position.segmentToIndex : null;
    if (toIdx != null && position && position.fusionLineId && branchGeom && branchGeom[position.fusionLineId]) {
      toIdx = clamp(toIdx, 0, points.length - 1);
    } else if (toIdx != null && position && position.fusionLineId && opts.fusionBaseIdx) {
      var base2 = opts.fusionBaseIdx(lineId, position.fusionLineId);
      toIdx = base2 >= 0 ? base2 + toIdx : toIdx;
      toIdx = clamp(toIdx, 0, points.length - 1);
    }
    if (toIdx == null) {
      var moveDir = opts.getMoveDir ? opts.getMoveDir(position, lineId) : null;
      toIdx = moveDir === "up" ? Math.max(0, idx - 1) : Math.min(points.length - 1, idx + 1);
    }

    var progress = position && position.segmentProgress != null ? clamp(position.segmentProgress, 0, 1) : 0;
    var a = points[idx] || { x: 0, y: 0 };
    var b = points[toIdx] || a;
    var basePt = progress > 0 && toIdx !== idx ? interpolate(a, b, progress) : { x: a.x, y: a.y };
    var canonicalIdx = Math.min(Math.max(0, idx), Math.max(0, points.length - 2));
    var t = tangentAt(points, canonicalIdx, canonicalIdx + 1);
    return { point: basePt, idx: idx, nextIdx: toIdx, tangent: t, points: points };
  }

  function resolve(position, positions, index, stationCoords, geometry, lineId, opts, occupancy) {
    opts = opts || {};
    var base = resolveBase(position, stationCoords, geometry, lineId, opts);
    if (!base) return null;
    var moveDir = opts.getMoveDir ? opts.getMoveDir(position, lineId) : null;
    var lane = laneSign(moveDir, position && position.railDirection);
    var normal = normalFromTangent(base.tangent);
    var key = trackKey(position, base.idx, base.nextIdx, lane);
    var slot = occupancy ? occupancy.next(key) : { ordinal: 0, total: 1 };
    var stackOffset = (slot.ordinal - (slot.total - 1) / 2) * (opts.stackGap || DEFAULTS.stackGap);
    var laneGap = opts.laneGap || DEFAULTS.laneGap;
    var lateral = lane * laneGap + stackOffset;
    var px = base.point.x + normal.x * lateral;
    var py = base.point.y + normal.y * lateral;
    return {
      x: px,
      y: py,
      idx: base.idx,
      nextIdx: base.nextIdx,
      lane: lane,
      key: key,
      moveDir: moveDir,
      tangent: base.tangent,
      normal: normal
    };
  }

  function resolveAll(positions, stationCoords, geometry, lineId, opts) {
    positions = positions || [];
    var resolver = function (p, i) { return resolveBase(p, stationCoords, geometry, lineId, opts); };
    var synthetic = function (p, i) {
      var base = resolver(p, i);
      if (!base) return null;
      var moveDir = opts && opts.getMoveDir ? opts.getMoveDir(p, lineId) : null;
      var lane = laneSign(moveDir, p && p.railDirection);
      return { key: trackKey(p, base.idx, base.nextIdx, lane) };
    };
    var occupancy = buildOccupancy(positions, synthetic);
    return positions.map(function (p, i) {
      return resolve(p, positions, i, stationCoords, geometry, lineId, opts, occupancy);
    });
  }

  window.TrainTrackLayout = {
    resolveAll: resolveAll,
    loopPosToXY: loopPosToXY
  };
})();
