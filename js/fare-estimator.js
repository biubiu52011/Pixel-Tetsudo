/*
 * Pixel Tetsudo — Fare Estimator
 * Route-search fare estimates (概算・参考), grouped by operator type:
 *   JR-East  -> JR East local-fare ladder
 *   Metro/Toei -> subway ladder
 *   other private railways -> generic private ladder
 * Distance is approximated from hop count (站数 × 平均站距), so all amounts
 * are rough reference values, never official fares.
 */
(function() {
  "use strict";

  var KM_PER_SEG = { jr: 1.3, metro: 1.0, private: 1.1 };

  // [maxKm, fareYen] ladder, adult ordinary fare (simplified public structure)
  var FARE_TABLE = {
    jr:      [[3, 150], [6, 170], [10, 190], [15, 230], [20, 290], [25, 350], [30, 410], [40, 500], [50, 580], [Infinity, 680]],
    metro:   [[6, 180], [11, 210], [19, 260], [28, 320], [40, 390], [Infinity, 460]],
    private: [[3, 150], [7, 170], [12, 200], [18, 250], [25, 310], [35, 380], [Infinity, 460]]
  };

  function operatorGroup(op) {
    if (op === 'JR-East') return 'jr';
    if (op === 'TokyoMetro' || op === 'Toei') return 'metro';
    return 'private';
  }

  function fareFor(group, km) {
    var table = FARE_TABLE[group] || FARE_TABLE.private;
    for (var i = 0; i < table.length; i++) {
      if (km <= table[i][0]) return table[i][1];
    }
    return table[table.length - 1][1];
  }

  /**
   * Estimate the fare of one ride segment.
   * @param {string} lineId canonical line id
   * @param {number} hopCount number of station intervals in the segment (>=1)
   * @returns {number} estimated adult fare in yen
   */
  function estimateSegment(lineId, hopCount) {
    var group = 'private';
    var line = null;
    try {
      line = (window.RailwayDB && window.RailwayDB.getLine) ? window.RailwayDB.getLine(lineId) : null;
    } catch (e) {}
    if (line && line.operator) group = operatorGroup(line.operator);
    var km = Math.max(1, hopCount || 1) * KM_PER_SEG[group];
    return fareFor(group, km);
  }

  /**
   * Sum fare over ride segments of a RouteSearch result (routeSegments array).
   * @returns {number|null} total estimated fare or null when no ride segments
   */
  function estimateTotal(segments) {
    if (!segments || !segments.length) return null;
    var total = 0, hasRide = false;
    for (var i = 0; i < segments.length; i++) {
      var s = segments[i];
      if (s && s.type === 'ride' && typeof s.fare === 'number') { total += s.fare; hasRide = true; }
    }
    return hasRide ? total : null;
  }

  window.FareEstimator = {
    estimateSegment: estimateSegment,
    estimateTotal: estimateTotal,
    _groups: operatorGroup
  };
})();
