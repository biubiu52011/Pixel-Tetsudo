/*
 * Pixel Tetsudo - Train Position Estimator
 * 基于时刻表+延误信息推算没有实时位置的线路的列车位置
 *
 * Provider: TrainPositionEstimator
 * Consumer: DataFusion.loadTrainPositions()
 * Input: ODPT TrainTimetable data + delayInfo + line stations + current time
 * Output: estimated positions [{ stationIndex, trainId, delayMin, estimated: true }]
 */
(function() {
  "use strict";

  var ESTIMATOR_VERSION = 1;

  // ========== Calendar detection ==========
  function getCurrentCalendars() {
    try {
      var now = new Date();
      var day = now.getDay(); // 0=Sunday, 6=Saturday
      // Return array of matching calendar types
      if (day === 6) return ["odpt.Calendar:Saturday", "odpt.Calendar:SaturdayHoliday", "odpt.Calendar:Holiday"];
      if (day === 0) return ["odpt.Calendar:Holiday", "odpt.Calendar:SaturdayHoliday", "odpt.Calendar:Sunday"];
      return ["odpt.Calendar:Weekday"];
    } catch(e) { return ["odpt.Calendar:Weekday"]; }
  }

  // Backward compatibility
  function getCurrentCalendar() {
    var cals = getCurrentCalendars();
    return cals[0];
  }

  // ========== Time parsing ==========
  function parseTimeToMinutes(timeStr) {
    try {
      if (!timeStr) return null;
      var parts = timeStr.split(":");
      if (parts.length < 2) return null;
      var h = parseInt(parts[0], 10);
      var m = parseInt(parts[1], 10);
      // Handle past-midnight times (e.g. 25:00 = 1:00 next day)
      if (h >= 24) h = h - 24;
      return h * 60 + m;
    } catch(e) { return null; }
  }

  function getCurrentMinutes() {
    try {
      var now = new Date();
      return now.getHours() * 60 + now.getMinutes();
    } catch(e) { return 0; }
  }

  // ========== Station name extraction ==========
  function extractStationKey(stationUrn) {
    try {
      if (!stationUrn) return "";
      // "odpt.Station:TokyoMetro.Namboku.Ichigaya" -> "Ichigaya"
      var parts = String(stationUrn).split(".");
      return parts[parts.length - 1] || "";
    } catch(e) { return ""; }
  }

  function extractRailwayKey(railwayUrn) {
    try {
      if (!railwayUrn) return "";
      // "odpt.Railway:TokyoMetro.Namboku" -> "Namboku"
      var parts = String(railwayUrn).split(":");
      if (parts.length < 2) return "";
      var dotParts = parts[1].split(".");
      return dotParts[dotParts.length - 1] || "";
    } catch(e) { return ""; }
  }

  // ========== Delay lookup ==========
  function getDelayForOperator(operatorId, delayInfo) {
    try {
      if (!delayInfo) return 0;
      var info = delayInfo[operatorId];
      if (!info) return 0;
      if (info.status === "normal" || info.status === "no_data") return 0;
      return info.maxDelay || info.delay || 0;
    } catch(e) { return 0; }
  }

  // ========== Core estimation ==========
  /**
   * Estimate train positions for a single line based on timetable + delay
   * @param {string} lineId - Line ID (e.g. "Namboku")
   * @param {object} line - Line object with stations array
   * @param {Array} timetableData - Array of TrainTimetable objects for this line's operator
   * @param {object} delayInfo - Delay info keyed by operator
   * @param {string} operatorId - Normalized operator ID
   * @returns {Array} Estimated positions [{ stationIndex, trainId, delayMin, estimated: true }]
   */
  function estimateLinePositions(lineId, line, timetableData, delayInfo, operatorId) {
    try {
      if (!line || !line.stations || !Array.isArray(line.stations) || line.stations.length === 0) return [];
      if (!timetableData || !Array.isArray(timetableData) || timetableData.length === 0) return [];

      var currentCalendars = getCurrentCalendars();
      var currentMin = getCurrentMinutes();
      var delayMin = getDelayForOperator(operatorId, delayInfo);
      var adjustedCurrentMin = currentMin + delayMin;

      // Build station index map for this line
      var stationIndexMap = {};
      for (var i = 0; i < line.stations.length; i++) {
        stationIndexMap[line.stations[i]] = i;
      }

      var positions = [];
      var processedTrainIds = {};

      for (var t = 0; t < timetableData.length; t++) {
        var tt = timetableData[t];
        if (!tt) continue;

        // Filter by calendar (match any of current calendar types)
        var calendar = tt["odpt:calendar"];
        if (calendar && currentCalendars.indexOf(calendar) < 0) continue;

        // Filter by railway (if lineId matches)
        var railway = tt["odpt:railway"];
        var railwayKey = extractRailwayKey(railway);
        if (railwayKey && railwayKey !== lineId) continue;

        var trainNumber = tt["odpt:trainNumber"] || tt["odpt:train"] || ("est_" + t);
        if (processedTrainIds[trainNumber]) continue; // Avoid duplicates

        var tto = tt["odpt:trainTimetableObject"];
        if (!tto || !Array.isArray(tto) || tto.length === 0) continue;

        // Find current station based on time
        var currentStationIndex = -1;
        var foundInService = false;

        for (var s = 0; s < tto.length; s++) {
          var stop = tto[s];
          if (!stop) continue;

          var depTime = parseTimeToMinutes(stop["odpt:departureTime"]);
          var arrTime = parseTimeToMinutes(stop["odpt:arrivalTime"]);
          var stationKey = extractStationKey(stop["odpt:departureStation"] || stop["odpt:arrivalStation"]);
          var idx = stationIndexMap[stationKey];

          if (idx === undefined || idx < 0) continue;

          // Check if train is currently at or past this station
          var effectiveTime = depTime || arrTime;
          if (effectiveTime !== null && adjustedCurrentMin >= effectiveTime) {
            currentStationIndex = idx;
            foundInService = true;
          }

          // If we've passed the current time, stop looking
          if (effectiveTime !== null && adjustedCurrentMin < effectiveTime) {
            break;
          }
        }

        // Only include trains that are currently in service (have departed at least one station)
        if (foundInService && currentStationIndex >= 0) {
          // Check if train has already terminated (current time past last station arrival)
          var lastStop = tto[tto.length - 1];
          var lastArrTime = parseTimeToMinutes(lastStop["odpt:arrivalTime"] || lastStop["odpt:departureTime"]);
          if (lastArrTime !== null && adjustedCurrentMin > lastArrTime + 5) continue; // 5 min grace

          processedTrainIds[trainNumber] = true;
          positions.push({
            stationIndex: currentStationIndex,
            trainId: trainNumber,
            delayMin: delayMin,
            estimated: true
          });
        }
      }

      return positions;
    } catch(e) {
      console.debug("[PositionEstimator] estimateLinePositions error for", lineId, ":", e.message);
      return [];
    }
  }

  /**
   * Estimate positions for all lines that don't have realtime data
   * @param {object} allLines - All line objects keyed by lineId
   * @param {object} odptTrains - Raw ODPT train/timetable data keyed by operator
   * @param {object} delayInfo - Delay info keyed by operator
   * @param {object} existingPositions - Already-known realtime positions keyed by lineId
   * @returns {object} Estimated positions keyed by lineId
   */
  function estimateAllPositions(allLines, odptTrains, delayInfo, existingPositions) {
    try {
      var estimated = {};
      var lineIds = Object.keys(allLines || {});

      // Build operator -> timetable data map (only TrainTimetable type)
      var timetableByOperator = {};
      Object.keys(odptTrains || {}).forEach(function(op) {
        var data = odptTrains[op];
        if (!Array.isArray(data) || data.length === 0) return;
        // Check if this is timetable data (has trainTimetableObject)
        var first = data[0];
        if (first && first["odpt:trainTimetableObject"]) {
          timetableByOperator[op] = data;
        }
      });

      if (Object.keys(timetableByOperator).length === 0) return estimated;

      // Process each line
      for (var i = 0; i < lineIds.length; i++) {
        var lineId = lineIds[i];
        var line = allLines[lineId];

        // Skip lines that already have realtime positions
        if (existingPositions && existingPositions[lineId] && existingPositions[lineId].length > 0) continue;
        if (!line || !line.operator) continue;

        // Normalize operator ID
        var opId = line.operator;
        if (window.TransitConstants && typeof window.TransitConstants.normalizeOp === "function") {
          opId = window.TransitConstants.normalizeOp(opId);
        }

        // Find timetable data for this operator
        var timetableData = timetableByOperator[opId];
        if (!timetableData) continue;

        var positions = estimateLinePositions(lineId, line, timetableData, delayInfo, opId);
        if (positions.length > 0) {
          estimated[lineId] = positions;
        }
      }

      return estimated;
    } catch(e) {
      console.debug("[PositionEstimator] estimateAllPositions error:", e.message);
      return {};
    }
  }

  // ========== Public API ==========
  window.TrainPositionEstimator = {
    version: ESTIMATOR_VERSION,
    estimateLinePositions: estimateLinePositions,
    estimateAllPositions: estimateAllPositions,
    getCurrentCalendar: getCurrentCalendar,
    getCurrentCalendars: getCurrentCalendars,
    getCurrentMinutes: getCurrentMinutes
  };

  console.log("[PositionEstimator] v" + ESTIMATOR_VERSION + " initialized");
})();
