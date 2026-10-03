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
    "5021M": [
      { vehicleType: "JR東日本E253系", service: "日光21号", direction: "down", validDates: ["2026-10-16","2026-10-17","2026-10-18","2026-10-19","2026-10-22","2026-10-23","2026-10-24","2026-10-25","2026-10-26","2026-10-29","2026-10-30","2026-10-31","2026-11-01","2026-11-02","2026-11-03","2026-11-04","2026-11-05","2026-11-06","2026-11-07","2026-11-08","2026-11-09","2026-11-12","2026-11-13","2026-11-14","2026-11-15","2026-11-16","2026-11-17","2026-11-18","2026-11-19","2026-11-20","2026-11-21","2026-11-22","2026-11-23","2026-11-27","2026-11-28","2026-11-29"] },
      { vehicleType: "東武100系", service: "スペーシア日光21号", direction: "down", validFrom: "2026-09-19", validUntil: "2026-09-23" }
    ],
    "5026M": [
      { vehicleType: "JR東日本E253系", service: "日光26号", direction: "up", validDates: ["2026-10-16","2026-10-19","2026-10-22","2026-10-23","2026-10-26","2026-10-29","2026-10-30","2026-11-02","2026-11-04","2026-11-05","2026-11-06","2026-11-09","2026-11-12","2026-11-13","2026-11-16","2026-11-17","2026-11-18","2026-11-19","2026-11-20","2026-11-27"] },
      { vehicleType: "東武100系", service: "スペーシア日光26号", direction: "up", validFrom: "2026-09-19", validUntil: "2026-09-23" }
    ],
    "5111M": { vehicleType: "東武100系", service: "スペーシアきぬがわ11号", direction: "down", validDates: ["2026-03-14","2026-03-15","2026-03-20","2026-03-21","2026-03-22","2026-03-28","2026-03-29","2026-08-08","2026-08-09","2026-08-10","2026-08-11","2026-08-12","2026-08-13","2026-08-14","2026-08-15"] },
    "5112M": [
      { vehicleType: "東武100系", service: "スペーシアきぬがわ12号", direction: "up", validDates: ["2026-03-15","2026-03-21","2026-03-22","2026-03-29","2026-08-09","2026-08-10","2026-08-11","2026-08-12","2026-08-13","2026-08-14","2026-08-15","2026-08-16"] },
      { vehicleType: "JR東日本E253系", service: "きぬがわ34号", direction: "up", validDates: ["2026-07-20"] }
    ],
    "5113M": { vehicleType: "JR東日本E253系", service: "きぬがわ13号", direction: "down", validDates: ["2026-05-02","2026-05-03","2026-05-04","2026-05-05","2026-05-06","2026-07-18","2026-08-08","2026-11-21","2026-11-22"] },
    "1261": { vehicleType: "東武100系", service: "けごん61号", direction: "down", validDates: ["2026-07-04","2026-07-05","2026-07-11","2026-07-12","2026-07-18","2026-07-19","2026-07-20","2026-07-25","2026-07-26","2026-08-01","2026-08-02","2026-08-08","2026-08-09","2026-08-11","2026-08-15","2026-08-16","2026-08-22","2026-08-23","2026-08-29","2026-08-30"] },
    "1262": [
      { vehicleType: "東武634型", service: "スカイツリートレイン62号", direction: "up", validDates: ["2026-07-04","2026-08-01","2026-08-22"] },
      { vehicleType: "東武N100系", service: "スペーシアX62号", direction: "up", validDates: ["2026-07-18","2026-07-19","2026-07-20","2026-08-08","2026-08-09","2026-08-15","2026-08-16"] }
    ],
    "1263": [
      { vehicleType: "東武634型", service: "スカイツリートレイン63号", direction: "down", validDates: ["2026-07-04","2026-08-01","2026-08-22"] },
      { vehicleType: "東武N100系", service: "スペーシアX909号", direction: "down", validDates: ["2026-07-18","2026-07-19","2026-07-20","2026-08-08","2026-08-09","2026-08-15","2026-08-16"] }
    ],
    "1264": { vehicleType: "東武100系", service: "けごん64号", direction: "up", validDates: ["2026-07-04","2026-07-05","2026-07-11","2026-07-12","2026-07-18","2026-07-19","2026-07-20","2026-07-25","2026-07-26","2026-08-01","2026-08-02","2026-08-08","2026-08-09","2026-08-11","2026-08-12","2026-08-13","2026-08-14","2026-08-15","2026-08-16","2026-08-22","2026-08-23","2026-08-29","2026-08-30"] },
    // JR East current timetable (2026-10): direct structured vehicle evidence.
    "1083M": { vehicleType: "JR東日本E253系", service: "きぬがわ3号", direction: "down", validFrom: "2026-03-14" },
    "1082M": { vehicleType: "JR東日本E253系", service: "きぬがわ2号", direction: "up", validFrom: "2026-03-14" },
    "1094M": { vehicleType: "東武100系", service: "スペーシア日光4号", direction: "up", validFrom: "2026-03-14" },
    "1091M": { vehicleType: "東武100系", service: "スペーシア日光1号", direction: "down", validFrom: "2026-03-14" },
    "9121M": { vehicleType: "東武100系", service: "スペーシア日光21号", direction: "down", validFrom: "2026-09-19", validUntil: "2026-09-23" },

    // Nikko/Kinugawa regular services — official 2026-03-14 up timetable.
    // These train numbers and service identities are exposed in the same table.
    "444N": { vehicleType: "東武100系", service: "けごん32号", direction: "up" },
    "446N": { vehicleType: "東武100系", service: "けごん34号", direction: "up" },
    "1032": { vehicleType: "東武100系", service: "けごん12号", direction: "up" },
    "1034": { vehicleType: "東武100系", service: "けごん32号", direction: "up" },
    "1136": { vehicleType: "東武500系", services: ["リバティ会津136号", "リバティけごん136号"], direction: "up" },
    "1036": { vehicleType: "東武100系", service: "けごん34号", direction: "up" },
    "1038": { vehicleType: "東武100系", service: "けごん38号", direction: "up" },
    "1140": { vehicleType: "東武500系", service: "リバティけごん40号", direction: "up" },
    "1142": { vehicleType: "東武500系", service: "リバティけごん42号", direction: "up" },
    "1042": { vehicleType: "東武100系", service: "けごん42号", direction: "up" },

    // Isesaki/Kiryu/Sano regular limited expresses — 2026-03-14 official table.
    // Down
    "1801": { vehicleType: "東武500系", service: "リバティりょうもう1号", direction: "down" },
    "1803": { vehicleType: "東武200系", service: "りょうもう3号", direction: "down" },
    "1805": { vehicleType: "東武200系", service: "りょうもう5号", direction: "down" },
    "1807": { vehicleType: "東武200系", service: "りょうもう7号", direction: "down" },
    "1409": { vehicleType: "東武500系", service: "リバティりょうもう9号", direction: "down" },
    "1811": { vehicleType: "東武200系", service: "りょうもう11号", direction: "down" },
    "1813": { vehicleType: "東武500系", service: "リバティりょうもう13号", direction: "down" },
    "1815": { vehicleType: "東武500系", service: "リバティりょうもう15号", direction: "down" },
    "1817": { vehicleType: "東武200系", service: "りょうもう17号", direction: "down" },
    "1819": { vehicleType: "東武200系", service: "りょうもう19号", direction: "down" },
    "1421": { vehicleType: "東武200系", service: "りょうもう21号", direction: "down" },
    "1823": { vehicleType: "東武200系", service: "りょうもう23号", direction: "down" },
    "1425": { vehicleType: "東武500系", service: "リバティりょうもう25号", direction: "down" },
    "1827": { vehicleType: "東武500系", service: "リバティりょうもう27号", direction: "down" },
    "1429": { vehicleType: "東武500系", service: "リバティりょうもう29号", direction: "down" },
    "1831": { vehicleType: "東武500系", service: "リバティりょうもう31号", direction: "down" },
    "1433": { vehicleType: "東武200系", service: "りょうもう33号", direction: "down" },
    "1835": { vehicleType: "東武200系", service: "りょうもう35号", direction: "down" },
    "1837": { vehicleType: "東武200系", service: "りょうもう37号", direction: "down" },
    "1339": { vehicleType: "東武500系", service: "リバティりょうもう39号", direction: "down" },
    "1841": { vehicleType: "東武200系", service: "りょうもう41号", direction: "down" },
    "1643": { vehicleType: "東武500系", service: "リバティりょうもう43号", direction: "down" },
    "371E": { vehicleType: "東武500系", service: "リバティりょうもう45号", direction: "down" },
    "1845": { vehicleType: "東武200系", service: "りょうもう47号", direction: "down" },
    "1447": { vehicleType: "東武500系", service: "リバティりょうもう49号", direction: "down" },

    // Up
    "1502": { vehicleType: "東武500系", service: "リバティりょうもう2号", direction: "up" },
    "1404": { vehicleType: "東武200系", service: "りょうもう4号", direction: "up" },
    "1806": { vehicleType: "東武200系", service: "りょうもう6号", direction: "up" },
    "1808": { vehicleType: "東武500系", service: "リバティりょうもう8号", direction: "up" },
    "1310": { vehicleType: "東武200系", service: "りょうもう10号", direction: "up" },
    "1612": { vehicleType: "東武500系", service: "リバティりょうもう12号", direction: "up" },
    "1814": { vehicleType: "東武500系", service: "リバティりょうもう14号", direction: "up" },
    "1816": { vehicleType: "東武200系", service: "りょうもう16号", direction: "up" },
    "1818": { vehicleType: "東武500系", service: "リバティりょうもう18号", direction: "up" },
    "1820": { vehicleType: "東武200系", service: "りょうもう20号", direction: "up" },
    "1822": { vehicleType: "東武200系", service: "りょうもう22号", direction: "up" },
    "1824": { vehicleType: "東武200系", service: "りょうもう24号", direction: "up" },
    "1826": { vehicleType: "東武200系", service: "りょうもう26号", direction: "up" },
    "1828": { vehicleType: "東武500系", service: "リバティりょうもう28号", direction: "up" },
    "1830": { vehicleType: "東武500系", service: "リバティりょうもう30号", direction: "up" },
    "1432": { vehicleType: "東武500系", service: "リバティりょうもう32号", direction: "up" },
    "1834": { vehicleType: "東武200系", service: "りょうもう34号", direction: "up" },
    "1436": { vehicleType: "東武200系", service: "りょうもう36号", direction: "up" },
    "1838": { vehicleType: "東武200系", service: "りょうもう38号", direction: "up" },
    "1440": { vehicleType: "東武500系", service: "リバティりょうもう40号", direction: "up" },
    "1842": { vehicleType: "東武200系", service: "りょうもう42号", direction: "up" },
    "1444": { vehicleType: "東武500系", service: "リバティりょうもう44号", direction: "up" },
    "1846": { vehicleType: "東武500系", service: "リバティりょうもう46号", direction: "up" },
    "1448": { vehicleType: "東武200系", service: "りょうもう48号", direction: "up" },
    "1850": { vehicleType: "東武500系", service: "リバティりょうもう50号", direction: "up" }
  };

  function _normServiceName(value) {
    return String(value || "")
      .replace(/^特急/, "")
      .replace(/[\s　・]/g, "")
      .replace(/スペーシア(\d+)号X/i, "スペーシアX$1号")
      .toLowerCase();
  }

  // Precompile immutable lookup helpers once; records stays serializable/debuggable.
  Object.keys(records).forEach(function(key) {
    var list = Array.isArray(records[key]) ? records[key] : [records[key]];
    list.forEach(function(rec) {
      if (rec.validDates && rec.validDates.length) {
        Object.defineProperty(rec, "_validDateSet", {
          value: new Set(rec.validDates), enumerable: false
        });
      }
      if (rec.service || rec.services) {
        Object.defineProperty(rec, "_serviceSet", {
          value: new Set((rec.services || [rec.service]).map(_normServiceName)), enumerable: false
        });
      }
    });
  });

  function resolveEvidence(trainNumber, trainName, direction, serviceDate, context) {
    var key = String(trainNumber || "").trim();
    var entry = records[key];
    if (!entry) return null;
    var candidates = Array.isArray(entry) ? entry : [entry];
    var name = String(trainName || "");
    var actualService = name ? _normServiceName(name) : "";
    var d = serviceDate ? String(serviceDate).slice(0, 10) : "";
    var ctx = context || {};
    // Reused train numbers are not sufficient identity on their own. If any
    // candidate is service-qualified, require the caller to supply that
    // service identity instead of collapsing by date/direction/operator.
    if (!actualService && candidates.some(function(rec) {
      return !!(rec.servicePattern || (rec._serviceSet && rec._serviceSet.size));
    })) return null;
    var matched = candidates.filter(function(rec) {
      if (rec.servicePattern && !rec.servicePattern.test(name)) return false;
      if (actualService && rec._serviceSet && !rec._serviceSet.has(actualService)) return false;
      if (direction && rec.direction &&
          String(direction).toLowerCase() !== String(rec.direction).toLowerCase()) return false;
      if (d) {
        if (rec._validDateSet && !rec._validDateSet.has(d)) return false;
        if (rec.validFrom && d < rec.validFrom) return false;
        if (rec.validUntil && d > rec.validUntil) return false;
      }
      if (rec.operator && String(ctx.operator || "").indexOf(rec.operator) < 0) return false;
      if (rec.lineId && String(ctx.lineId || "") !== rec.lineId) return false;
      return true;
    });
    return matched.length === 1 ? matched[0] : null;
  }

  function resolve(trainNumber, trainName, direction, serviceDate, context) {
    var rec = resolveEvidence(trainNumber, trainName, direction, serviceDate, context);
    return rec ? (rec.vehicleType || "") : "";
  }

  var provider = {
    id: "tobu-official-limited-express-2026",
    effectiveDate: "2026-03-14",
    source: "Tobu Railway official limited-express timetable",
    policy: "exact-verified-columns-only",
    records: records,
    resolveEvidence: resolveEvidence,
    resolve: resolve
  };
  window.TOBU_LIMITED_EXPRESS_VEHICLE_EVIDENCE = provider;
  // Generic provider registry: other operators can add exact per-train evidence
  // without adding operator-specific branches to the estimator.
  window.TRAIN_VEHICLE_EVIDENCE_PROVIDERS = window.TRAIN_VEHICLE_EVIDENCE_PROVIDERS || [];
  if (!window.TRAIN_VEHICLE_EVIDENCE_PROVIDERS.some(function(p){ return p && p.id === provider.id; })) {
    window.TRAIN_VEHICLE_EVIDENCE_PROVIDERS.push(provider);
  }
})();