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

  function stableTrainKey(p) {
    if (!p) return "";
    return String(p.runningChainId || p.trainId || p.trainNumber || p.sourceTrainId || p.timetableObjectId || "");
  }

  function stableStackOrdinal(p, index) {
    var key = stableTrainKey(p);
    var hash = 2166136261;
    for (var i = 0; i < key.length; i++) {
      hash ^= key.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    // Five deterministic slots around the track centre. Identity, not current
    // occupancy, owns the slot so polling changes cannot reshuffle other trains.
    return ((hash >>> 0) % 5) - 2;
  }

  function buildOccupancy(positions, resolver) {
    var groups = {};
    for (var i = 0; i < positions.length; i++) {
      var r = resolver(positions[i], i, true);
      if (!r) continue;
      var stableId = stableTrainKey(positions[i]);
      if (!stableId) continue;
      (groups[r.key] = groups[r.key] || []).push({ index: i, id: stableId });
    }
    var slots = {};
    Object.keys(groups).forEach(function(key) {
      groups[key].sort(function(a, b) { return a.id.localeCompare(b.id); });
      for (var j = 0; j < groups[key].length; j++) {
        slots[key + "|" + groups[key][j].index] = { ordinal: j, total: groups[key].length };
      }
    });
    return {
      get: function (key, index) {
        return slots[key + "|" + index] || { ordinal: 0, total: 1 };
      }
    };
  }

  function resolveBase(position, stationCoords, geometry, lineId, opts) {
    opts = opts || {};
    var branchGeom = (geometry && geometry.branchGeom) || null;
    var rawIdx = position && position.stationIndex != null ? Number(position.stationIndex) : NaN;
    var points = stationCoords || [];
    // Position evidence is required. Missing/invalid stationIndex must never be
    // coerced to station 0 (Tokyo on Yamanote), otherwise one bad snapshot
    // collapses unrelated trains onto the first station.
    if (!isFinite(rawIdx) || rawIdx < 0) return null;
    var idx = rawIdx;

    if (position && position.fusionLineId && position.fusionRole === "branch" && branchGeom && branchGeom[position.fusionLineId]) {
      points = branchGeom[position.fusionLineId];
      if (idx >= points.length) return null;
    } else if (position && position.fusionLineId && opts.fusionBaseIdx) {
      var base = opts.fusionBaseIdx(lineId, position.fusionLineId);
      idx = base >= 0 ? base + idx : idx;
      if (idx < 0 || idx >= points.length) return null;
    } else if (idx >= points.length) {
      return null;
    }

    var toIdx = position && position.segmentToIndex != null ? Number(position.segmentToIndex) : null;
    if (toIdx != null && (!isFinite(toIdx) || toIdx < 0)) return null;
    if (toIdx != null && position && position.fusionLineId && position.fusionRole === "branch" && branchGeom && branchGeom[position.fusionLineId]) {
      if (toIdx >= points.length) return null;
    } else if (toIdx != null && position && position.fusionLineId && opts.fusionBaseIdx) {
      var base2 = opts.fusionBaseIdx(lineId, position.fusionLineId);
      toIdx = base2 >= 0 ? base2 + toIdx : toIdx;
      if (toIdx < 0 || toIdx >= points.length) return null;
    } else if (toIdx != null && toIdx >= points.length) {
      return null;
    }
    if (toIdx == null) {
      var moveDir = opts.getDisplayMoveDir ? opts.getDisplayMoveDir(position, lineId) : null;
      var _loopDirection = String(position && position.railDirection || "").split(/[:.]/).pop();
      var _closedLoop = !!(stationCoords && stationCoords._loopRect && points === stationCoords);
      if (_closedLoop && /^(InnerLoop|Inner|OuterLoop|Outer)$/.test(_loopDirection)) {
        // A loop has no terminal index. Preserve ODPT loop direction through
        // the last/first station boundary instead of clamping at either end.
        // The station order defines the positive route direction; laneSign keeps
        // Inner/Outer on separate physical lanes.
        var _step = /^(InnerLoop|Inner)$/.test(_loopDirection) ? -1 : 1;
        toIdx = (idx + _step + points.length) % points.length;
      } else {
        toIdx = moveDir === "up" ? Math.max(0, idx - 1) : Math.min(points.length - 1, idx + 1);
      }
    }

    var progress = position && position.segmentProgress != null ? clamp(position.segmentProgress, 0, 1) : 0;
    var a = points[idx] || { x: 0, y: 0 };
    var b = points[toIdx] || a;
    var basePt = progress > 0 && toIdx !== idx ? interpolate(a, b, progress) : { x: a.x, y: a.y };
    var canonicalIdx = Math.min(Math.max(0, idx), Math.max(0, points.length - 2));
    var t = tangentAt(points, canonicalIdx, canonicalIdx + 1);
    return { point: basePt, idx: idx, nextIdx: toIdx, tangent: t, points: points };
  }

  function resolvedMoveDir(position, base, lineId, opts) {
    var rd = String(position && position.railDirection || "").split(/[:.]/).pop();
    if (/^(InnerLoop|Inner)$/.test(rd)) return "up";
    if (/^(OuterLoop|Outer)$/.test(rd)) return "down";
    if (base && base.nextIdx < base.idx) return "up";
    if (base && base.nextIdx > base.idx) return "down";
    return opts && opts.getDisplayMoveDir ? opts.getDisplayMoveDir(position, lineId) : null;
  }

  function resolve(position, positions, index, stationCoords, geometry, lineId, opts, occupancy) {
    opts = opts || {};
    var base = resolveBase(position, stationCoords, geometry, lineId, opts);
    if (!base) return null;
    var moveDir = resolvedMoveDir(position, base, lineId, opts);
    // Geometry direction comes from authoritative loop direction / resolved
    // segment whenever available. Destination heuristics are display fallback.
    var lane = laneSign(moveDir, position && position.railDirection);
    // New Shuttle physical topology: Omiya-Maruyama is double track, while
    // Maruyama-Uchijuku is single track. Do not draw artificial up/down lanes
    // on the single-track section; trains share the same physical centreline.
    // Omiya itself is a loop turnaround, so direction changes there are not a
    // second parallel track either.
    if (lineId === "NewShuttle" && (Math.min(base.idx, base.nextIdx) >= 8 || (base.idx === 0 && base.nextIdx === 0))) {
      lane = 0;
    }
    var normal = normalFromTangent(base.tangent);
    var key = trackKey(position, base.idx, base.nextIdx, lane);
    var slot = occupancy ? occupancy.get(key, index) : { ordinal: 0, total: 1 };
    // Keep an individual train on a stable lateral slot when neighbours enter or
    // leave the same segment. Identity owns the slot; current occupancy does not.
    var stackOrdinal = slot.total > 1 ? stableStackOrdinal(position, index) : 0;
    var stackOffset = stackOrdinal * (opts.stackGap || DEFAULTS.stackGap);
    var laneGap = opts.laneGap || DEFAULTS.laneGap;
    var lateral = lane * laneGap + stackOffset;
    var px = base.point.x + normal.x * lateral;
    var py = base.point.y + normal.y * lateral;

    // Keep train icons readable at stations, especially large interchange /
    // branch-junction nodes. When a train is exactly at a station (progress=0),
    // move it slightly along the track tangent instead of stacking it directly
    // on top of the station dot. This preserves the station reference point
    // while making the train the primary moving visual.
    var stationPt = base.points && base.points[base.idx];
    var atStation = position && (position.segmentProgress == null || Number(position.segmentProgress) <= 0.001);
    if (atStation && stationPt) {
      var stationOffset = opts.stationOffset || DEFAULTS.iconH;
      var stationRadius = (stationPt && stationPt.isJunction) ? 12 : 7;
      var clearDist = Math.max(stationOffset, stationRadius + (DEFAULTS.iconH / 2) + 2);
      var dirSign = moveDir === "up" ? -1 : 1;
      if (lane === 0 && !moveDir) dirSign = (slot.ordinal % 2 === 0) ? 1 : -1;
      px += base.tangent.x * clearDist * dirSign;
      py += base.tangent.y * clearDist * dirSign;
    }

    var routePos = null;
    if (stationCoords && stationCoords._loopRect && base.points === stationCoords) {
      var _from = stationCoords[base.idx];
      var _to = stationCoords[base.nextIdx];
      if (_from && _from._loopPos != null) {
        var _fromPos = Number(_from._loopPos);
        var _toPos = (_to && _to._loopPos != null) ? Number(_to._loopPos) : _fromPos;
        var _perimeter = Number(stationCoords._loopRect.perimeter) || 0;
        var _delta = _toPos - _fromPos;
        if (_perimeter > 0 && Math.abs(_delta) > _perimeter / 2) {
          _delta += _delta > 0 ? -_perimeter : _perimeter;
        }
        routePos = _fromPos + _delta * (position && position.segmentProgress != null ? clamp(position.segmentProgress, 0, 1) : 0);
      }
    }
    return {
      x: px,
      y: py,
      idx: base.idx,
      nextIdx: base.nextIdx,
      routePos: routePos,
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
      var moveDir = resolvedMoveDir(p, base, lineId, opts);
      var lane = laneSign(moveDir, p && p.railDirection);
      if (lineId === "NewShuttle" && (Math.min(base.idx, base.nextIdx) >= 8 || (base.idx === 0 && base.nextIdx === 0))) lane = 0;
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
