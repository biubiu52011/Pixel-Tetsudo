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

  // ========== Train type classification ==========
  // 特急列车类型关键词
  var LIMITED_EXPRESS_KEYWORDS = ['LimitedExpress', 'Limited Express', '特急', '快特', 'RapidLimitedExpress', 'AirportRapidLimitedExpress'];
  
  // 直通运行列车类型
  var THROUGH_TRAIN_TYPES = {
    'TH-LINER': 'Tobu-TokyoMetro through',
    'TJ-LINER': 'Tobu Tojo line reserved',
    'S-TRAIN': 'Seibu-TokyoMetro-Tokyu through',
    'F-Liner': 'Tokyu-TokyoMetro-Seibu through',
    'KeioLiner': 'Keio reserved train',
    'CommuterSpecialRapid': 'JR commuter special rapid',
    'ChuoSpecialRapid': 'JR Chuo special rapid',
    'OmeSpecialRapid': 'JR Ome special rapid'
  };

  // 判断是否为特急列车
  function isLimitedExpress(trainType) {
    try {
      if (!trainType) return false;
      var typeStr = typeof trainType === 'object' ? JSON.stringify(trainType) : String(trainType);
      for (var i = 0; i < LIMITED_EXPRESS_KEYWORDS.length; i++) {
        if (typeStr.indexOf(LIMITED_EXPRESS_KEYWORDS[i]) >= 0) return true;
      }
      return false;
    } catch(e) { return false; }
  }

  // 判断是否为直通运行列车
  function isThroughTrain(trainType, trainNumber) {
    try {
      var typeStr = typeof trainType === 'object' ? JSON.stringify(trainType) : String(trainType);
      // 检查列车类型
      for (var key in THROUGH_TRAIN_TYPES) {
        if (typeStr.indexOf(key) >= 0) return true;
      }
      // 检查列车编号（东武直通列车通常以特定字母结尾）
      if (trainNumber) {
        var numStr = String(trainNumber);
        // 东武晴空塔线直通日比谷线的列车通常以S结尾
        // 东武伊势崎线直通半藏门线的列车通常以K结尾
        if (/[SK]$/.test(numStr)) return true;
      }
      return false;
    } catch(e) { return false; }
  }

  // 获取列车类型分类
  function classifyTrain(trainType, trainNumber) {
    try {
      var result = {
        isLimitedExpress: isLimitedExpress(trainType),
        isThroughTrain: isThroughTrain(trainType, trainNumber),
        typeName: ''
      };
      var typeStr = typeof trainType === 'object' ? (trainType['odpt:trainType'] || JSON.stringify(trainType)) : String(trainType);
      // 提取类型名称
      var parts = typeStr.split(':');
      result.typeName = parts.length > 1 ? parts[parts.length - 1] : typeStr;
      return result;
    } catch(e) {
      return { isLimitedExpress: false, isThroughTrain: false, typeName: 'unknown' };
    }
  }

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

  // Normalize station key for matching (remove hyphens, handle common variants)
  function normalizeStationKey(key) {
    try {
      if (!key) return "";
      var k = String(key).toLowerCase();
      // Remove hyphens and spaces
      k = k.replace(/[-_\s]/g, "");
      // Handle common naming variants
      var aliases = {
        "kokusaitenjijo": "tokyoshowacenter",
        "tennozuisle": "tennozuise",
        "shinagawaseaside": "shinagawaseaside",
        "oimachi": "oimachi",
        "tokyoteleport": "tokyoteleport",
        "shinkiba": "shinkiba",
        "shinonome": "shinonome"
      };
      return aliases[k] || k;
    } catch(e) { return String(key || "").toLowerCase().replace(/[-_\s]/g, ""); }
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

      // Build station index map for this line (using normalized keys)
      var stationIndexMap = {};
      for (var i = 0; i < line.stations.length; i++) {
        var normKey = normalizeStationKey(line.stations[i]);
        stationIndexMap[normKey] = i;
        // Also store original key for fallback
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
          var normStationKey = normalizeStationKey(stationKey);
          var idx = stationIndexMap[normStationKey];
          if (idx === undefined) idx = stationIndexMap[stationKey]; // fallback to original key

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
          var trainClassification = classifyTrain(tt['odpt:trainType'], trainNumber);
          positions.push({
            stationIndex: currentStationIndex,
            trainId: trainNumber,
            delayMin: delayMin,
            estimated: true,
            trainType: tt['odpt:trainType'] || '',
            typeName: trainClassification.typeName,
            isLimitedExpress: trainClassification.isLimitedExpress,
            isThroughTrain: trainClassification.isThroughTrain
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
    getCurrentMinutes: getCurrentMinutes,
    normalizeStationKey: normalizeStationKey
  };

  console.log("[PositionEstimator] v" + ESTIMATOR_VERSION + " initialized");
})();
