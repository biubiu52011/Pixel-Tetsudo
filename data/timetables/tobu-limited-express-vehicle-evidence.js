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
      { vehicleType: "JR東日本E253系", service: "日光21号", direction: "down" },
      { vehicleType: "東武100系", service: "スペーシア日光21号", direction: "down", validFrom: "2026-09-19", validUntil: "2026-09-23" }
    ],
    "5026M": [
      { vehicleType: "JR東日本E253系", service: "日光26号", direction: "up" },
      { vehicleType: "東武100系", service: "スペーシア日光26号", direction: "up", validFrom: "2026-09-19", validUntil: "2026-09-23" }
    ],
    "5111M": { vehicleType: "東武100系", service: "スペーシアきぬがわ11号", direction: "down" },
    "5112M": { vehicleType: "東武100系", service: "スペーシアきぬがわ12号", direction: "up" },
    "1263": [
      { vehicleType: "東武634型", service: "スカイツリートレイン63号", direction: "down" },
      { vehicleType: "東武N100系", service: "スペーシアX909号", direction: "down" }
    ],
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

  function resolve(trainNumber, trainName, direction, serviceDate, context) {
    var key = String(trainNumber || "").trim();
    var entry = records[key];
    if (!entry) return "";
    var candidates = Array.isArray(entry) ? entry : [entry];
    var name = String(trainName || "");
    var matched = candidates.filter(function(rec) {
      if (rec.servicePattern && !rec.servicePattern.test(name)) return false;
      if (name && (rec.service || rec.services)) {
        var actual = _normServiceName(name);
        var expectedList = (rec.services || [rec.service]).map(_normServiceName);
        if (actual && expectedList.length && expectedList.indexOf(actual) < 0) return false;
      }
      if (direction && rec.direction &&
          String(direction).toLowerCase() !== String(rec.direction).toLowerCase()) return false;
      if (serviceDate) {
        var d = String(serviceDate).slice(0, 10);
        if (rec.validFrom && d < rec.validFrom) return false;
        if (rec.validUntil && d > rec.validUntil) return false;
      }
      var ctx = context || {};
      if (rec.operator && String(ctx.operator || "").indexOf(rec.operator) < 0) return false;
      if (rec.lineId && String(ctx.lineId || "") !== rec.lineId) return false;
      return true;
    });
    return matched.length === 1 ? (matched[0].vehicleType || "") : "";
  }

  window.TOBU_LIMITED_EXPRESS_VEHICLE_EVIDENCE = {
    effectiveDate: "2026-03-14",
    source: "Tobu Railway official limited-express timetable",
    policy: "exact-verified-columns-only",
    records: records,
    resolve: resolve
  };
})();