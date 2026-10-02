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
    // JR/Tobu mutual through limited expresses — official 2026-03 timetable.
    // Train number, service and vehicle are exposed in the same official column.
    "5021M": { vehicleType: "JR東日本E253系", service: "日光21号", direction: "down" },
    "5026M": { vehicleType: "JR東日本E253系", service: "日光26号", direction: "up" },
    "5111M": { vehicleType: "東武100系", service: "スペーシアきぬがわ11号", direction: "down" },
    "5112M": { vehicleType: "東武100系", service: "スペーシアきぬがわ12号", direction: "up" }
  };

  function resolve(trainNumber, trainName) {
    var key = String(trainNumber || "").trim();
    var rec = records[key];
    if (!rec) return "";
    var name = String(trainName || "");
    if (rec.servicePattern && !rec.servicePattern.test(name)) return "";
    return rec.vehicleType || "";
  }

  window.TOBU_LIMITED_EXPRESS_VEHICLE_EVIDENCE = {
    effectiveDate: "2026-03-14",
    source: "Tobu Railway official limited-express timetable",
    policy: "exact-verified-columns-only",
    records: records,
    resolve: resolve
  };
})();