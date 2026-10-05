/*
 * Pixel Tetsudo - Through Service (直通運転) Provider
 *
 * Thin compatibility provider over canonical line archives.
 * Source of truth: UNIFIED_LINES[lineId].throughServices / serviceBoundaries.
 */
(function() {
  "use strict";

  function getLine(lineId) {
    return (window.UNIFIED_LINES && window.UNIFIED_LINES[lineId]) || null;
  }

  function getBoundary(lineId, partnerId) {
    var line = getLine(lineId);
    var boundaries = line && Array.isArray(line.serviceBoundaries) ? line.serviceBoundaries : [];
    for (var i = 0; i < boundaries.length; i++) {
      if (boundaries[i] && boundaries[i].lineId === partnerId) return boundaries[i];
    }
    return null;
  }

  function getDirectThroughLines(lineId) {
    try {
      var line = getLine(lineId);
      return line && Array.isArray(line.throughServices) ? line.throughServices.slice() : [];
    } catch(e) { return []; }
  }

  function getJoinStations(lineId, partnerId) {
    try {
      var boundary = getBoundary(lineId, partnerId);
      return boundary && Array.isArray(boundary.handoverStations)
        ? boundary.handoverStations.slice() : null;
    } catch(e) { return null; }
  }

  function getDisplayAnchors(lineId, partnerId) {
    return getJoinStations(lineId, partnerId);
  }

  window.ThroughService = {
    getDirectThroughLines: getDirectThroughLines,
    getJoinStations: getJoinStations,
    getDisplayAnchors: getDisplayAnchors
  };
})();
