/**
 * Line Presentation Service
 * Bridges LineOperationSystems data to UI rendering order.
 * Reads from window.LineOperationSystems and provides:
 *   - getDisplayOrder(lines)    -> ordered array of line IDs
 *   - getDisplayOrderMap(lines) -> map of line ID -> display index
 *
 * DO NOT modify railway_data.json — this is a pure presentation layer.
 */
(function() {
  "use strict";

  // Normalize OP_ORDER key (e.g. "JR-East") to LOS key (e.g. "JR_EAST")
  function normalizeOpKey(op) {
    return (op || "").replace(/-/g, "_").toUpperCase();
  }

  function getDisplayOrder(allLines) {
    if (!window.LineOperationSystems) return Object.keys(allLines || {});
    var result = [];
    var seen = {};
    var ops = window.TransitConstants && window.TransitConstants.OP_ORDER
      ? window.TransitConstants.OP_ORDER : [];
    // Ensure JR-East comes first, then others in OP_ORDER, then remaining ops alphabetically
    var allOps = [];
    var osKeys = Object.keys(window.LineOperationSystems);
    osKeys.forEach(function(k) {
      if (ops.indexOf(k) === -1 && allOps.indexOf(k) === -1) allOps.push(k);
    });
    ops.forEach(function(op) {
      if (allOps.indexOf(op) === -1) allOps.push(op);
    });
    allOps.forEach(function(op) {
      var losKey = normalizeOpKey(op);
      if (!window.LineOperationSystems[losKey]) return;
      var systems = window.LineOperationSystems[losKey];
      systems.sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
      systems.forEach(function(sys) {
        if (!sys.lineIds) return;
        sys.lineIds.forEach(function(lid) {
          if (!seen[lid] && allLines && allLines[lid]) {
            seen[lid] = true;
            result.push(lid);
          }
        });
      });
    });
    // Append any unmapped lines
    if (allLines) {
      Object.keys(allLines).forEach(function(lid) {
        if (!seen[lid]) result.push(lid);
      });
    }
    return result;
  }

  function getDisplayOrderMap(allLines) {
    var order = getDisplayOrder(allLines);
    var map = {};
    for (var i = 0; i < order.length; i++) {
      map[order[i]] = i;
    }
    return map;
  }

  window.LinePresentationService = {
    getDisplayOrder: getDisplayOrder,
    getDisplayOrderMap: getDisplayOrderMap
  };
})();
