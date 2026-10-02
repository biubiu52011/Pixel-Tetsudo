/**
 * Tobu official limited-express vehicle evidence.
 * Effective: 2026-03-14 timetable revision.
 *
 * IMPORTANT:
 * - Exact train-number entries are admitted only when the official timetable
 *   exposes a train number and vehicle class in the same verifiable column.
 * - Never infer a vehicle from number ranges, prefixes, parity, line, or hash.
 * - Service-name evidence is handled separately by train-position-estimator.js.
 */
(function(){
  "use strict";

  // Keep this deliberately sparse. The official PDF text layer is columnar and
  // some pages do not expose every train-number cell reliably. Unverifiable
  // transcriptions are safer as unknown than as false high-confidence evidence.
  var records = {
    // Add only independently re-checkable official timetable columns here.
  };

  function resolve(trainNumber) {
    var key = String(trainNumber || "").trim();
    var rec = records[key];
    return rec && rec.vehicleType ? rec.vehicleType : "";
  }

  window.TOBU_LIMITED_EXPRESS_VEHICLE_EVIDENCE = {
    effectiveDate: "2026-03-14",
    source: "Tobu Railway official limited-express timetable",
    policy: "exact-verified-columns-only",
    records: records,
    resolve: resolve
  };
})();