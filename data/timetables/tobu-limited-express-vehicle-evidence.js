/**
 * Tobu official limited-express vehicle evidence.
 * Effective: 2026-03-14 timetable revision.
 * Source: Tobu Railway official limited-express timetable.
 *
 * This table is evidence only: exact train numbers transcribed from rows where
 * train number and vehicle class are unambiguous. Never infer ranges/prefixes.
 */
(function(){
  "use strict";
  var byTrainNumber = {
    // Nikko/Kinugawa direction — down services, verified official table samples.
    "1025": "東武100系",
    "1027": "東武500系",
    "1127": "東武500系",
    "1031": "東武N100系",
    "1131": "東武500系",
    "1033": "東武100系",
    "1035": "東武100系",
    "1037": "東武500系",
    "1139": "東武500系",

    // Nikko/Kinugawa direction — up services, verified official table samples.
    "1034": "東武100系",
    "1036": "東武500系",
    "1136": "東武500系",
    "1038": "東武100系",
    "1140": "東武N100系",
    "1042": "東武500系",
    "1142": "東武500系",
    "1144": "東武N100系",
    "1046": "東武500系",
    "1048": "東武N100系",
    "1050": "東武500系"
  };

  window.TOBU_LIMITED_EXPRESS_VEHICLE_EVIDENCE = {
    effectiveDate: "2026-03-14",
    source: "Tobu Railway official limited-express timetable",
    byTrainNumber: byTrainNumber,
    resolve: function(trainNumber) {
      return byTrainNumber[String(trainNumber || "").trim()] || "";
    }
  };
})();