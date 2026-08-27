/**
 * Pixel Tetsudo - Train Timetable Module
 * Fetches odpt:TrainTimetable and odpt:Train, computes simulated positions
 * from schedule + current time. Does NOT modify existing realtime modules.
 */
(function() {
  "use strict";

  var t = window.t || function(k) { return k; };

  // ========== ODPT Timetable Endpoints ==========
  // Standard API (v4) - uses odpt:TrainTimetable


  // Operator -> endpoint config
  // type: "TrainTimetable" or "Train"
  // api: "standard" or "challenge"
  var TT_ENDPOINTS = [
    { id: "TokyoMetro", name: "Tokyo Metro", type: "TrainTimetable", api: "standard" },
    { id: "TWR",          name: "TWR",         type: "TrainTimetable", api: "standard" },
    { id: "YokohamaMunicipal", name: "Yokohama Municipal", type: "TrainTimetable", api: "standard" },
    { id: "MIR",          name: "MIR",         type: "TrainTimetable", api: "standard" },
    { id: "TamaMonorail", name: "Tama Monorail", type: "TrainTimetable", api: "standard" },
    { id: "Toei",         name: "Toei",        type: "TrainTimetable", api: "standard" },
    { id: "JREast",       name: "JR East",     type: "Train",        api: "challenge" },
    { id: "Tobu",         name: "Tobu",        type: "Train",        api: "challenge" },
    { id: "Keio",         name: "Keio",        type: "TrainTimetable", api: "challenge" },
    { id: "Keikyu",       name: "Keikyu",      type: "Train",        api: "challenge" }
  ];

  // ========== Timetable Cache ==========
  var _timetableCache = {};   // operatorId -> [{tripId, stations, times}]
  var _trainPositions = {};   // lineId -> [{trainId, currentStation, nextStation, simulated}] (legacy, populated from operator data)
  var _trainPositionsByOp = {}; // operatorId -> [{trainId, currentStation, nextStation, simulated}]
  var _subscribers = [];
  var _lastFetchTime = {};

  // ========== Fetch ==========
  function fetchTimetable(endpoint) {
    var url = window.ODPTClient && window.ODPTClient.ENDPOINTS ? window.ODPTClient.ENDPOINTS[endpoint.id] : null;
    console.log("[ODPT] Requesting " + endpoint.name + " timetable");
    return fetch(url, { signal: AbortSignal.timeout(12000) })
      .then(function(res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function(data) {
        console.log("[ODPT] " + endpoint.name + ": OK (" + (data ? data.length : 0) + " entries)");
        return { endpoint: endpoint, success: true, data: data || [] };
      })
      .catch(function(err) {
        console.warn("[ODPT] " + endpoint.name + " timetable failed: " + err.message);
        return { endpoint: endpoint, success: false, error: err.message, data: [] };
      });
  }

  // ========== Parse Timetable into TrainModels ==========
  function parseTimetable(endpoint, entries) {
    if (!entries || !Array.isArray(entries) || entries.length === 0) return [];
    var trains = [];
    // Group by trip (train running direction + time slot)
    var tripMap = {};
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      var tripId = e["odpt:isAccordingToTimetable"] ? null : null;
      // Use a composite key: direction + destination
      var direction = e["odpt:destinationStation"] || e["odpt:direction"] || "unknown";
      var dest = e["odpt:destinationStationName"] || e["odpt:directionName"] || direction;
      var key = direction + "|" + dest;
      if (!tripMap[key]) tripMap[key] = [];
      tripMap[key].push(e);
    }
    // For each trip, build a TrainModel
    var keys = Object.keys(tripMap);
    for (var k = 0; k < keys.length; k++) {
      var tripEntries = tripMap[keys[k]];
      // Sort by time
      tripEntries.sort(function(a, b) {
        var ta = a["odpt:arrivalTime"] || a["odpt:departureTime"] || "";
        var tb = b["odpt:arrivalTime"] || b["odpt:departureTime"] || "";
        return ta.localeCompare(tb);
      });
      var stations = [];
      var times = [];
      for (var j = 0; j < tripEntries.length; j++) {
        var te = tripEntries[j];
        stations.push(te["odpt:stationName"] || te["odpt:station"] || "Unknown");
        var arr = te["odpt:arrivalTime"] || te["odpt:departureTime"] || "";
        times.push(arr);
      }
      var trainId = "TT-" + endpoint.id + "-" + k;
      trains.push({
        id: trainId,
        operator: endpoint.id,
        operatorName: endpoint.name,
        trainNumber: tripEntries[0]["odpt:trainNumber"] || tripEntries[0]["odpt:trainName"] || "",
        trainName: tripEntries[0]["odpt:trainName"] || "",
        trainType: tripEntries[0]["odpt:trainType"] || "",
        direction: tripEntries[0]["odpt:direction"] || "",
        originStation: tripEntries[0]["odpt:originStationName"] || tripEntries[0]["odpt:originStation"] || stations[0],
        destinationStation: tripEntries[tripEntries.length - 1]["odpt:destinationStationName"] || dest,
        stations: stations,
        times: times,
        simulated: true,
        delayMinutes: 0,
        status: "scheduled",
        statusSource: "timetable",
        updatedAt: Date.now()
      });
    }
    return trains;
  }

  // ========== Simulated Position ==========
  function calculateSimulatedPositions(trains) {
    var now = new Date();
    var result = {};
    for (var ti = 0; ti < trains.length; ti++) {
      var train = trains[ti];
      var times = train.times;
      if (!times || times.length === 0) continue;
      var stations = train.stations;
      var currentIdx = 0;
      var nextIdx = 1;
      var nowStr = padTime(now.getHours()) + ':' + padTime(now.getMinutes());
      for (var si = 0; si < times.length; si++) {
        if (times[si] <= nowStr) {
          currentIdx = si;
          nextIdx = Math.min(si + 1, times.length - 1);
        } else {
          break;
        }
      }
      var opNorm = TransitConstants ? (TransitConstants.NORMALIZE[train.operator] || train.operator) : train.operator;
      if (!_trainPositionsByOp[opNorm]) _trainPositionsByOp[opNorm] = [];
      var lineIds = getOperatorLines(opNorm);
      if (lineIds.length === 0) lineIds = [opNorm];
      for (var li = 0; li < lineIds.length; li++) {
        var lid = lineIds[li];
        var pos = {
          trainId: train.id,
          lineId: lid,
          currentStation: stations[currentIdx] || '',
          currentStationIdx: currentIdx,
          nextStation: stations[nextIdx] || '',
          nextStationIdx: nextIdx,
          simulated: true,
          status: currentIdx >= times.length - 1 ? 'completed' : 'running'
        };
        _trainPositionsByOp[opNorm].push(pos);
        if (!_trainPositions[lid]) _trainPositions[lid] = [];
        _trainPositions[lid].push(pos);
      }
    }
    return result;
  }
function padTime(n) { return n < 10 ? "0" + n : "" + n; }

  // Multi-line operators: one operator ID maps to multiple line IDs
  var _operatorToLines = {
    "JREast": ["Yamanote","Saikyo","ChuoRapid","SobuLocal","Keiyo","Yokohama","Joban","KeihinTohoku","Nambu","Yokosuka","Takasaki","ShonanShinjuku","Narita","Ome","Gotsu","Tsurumi"],
    "Tobu": ["TobuSkytree","TobuNikko","TobuNoda","TobuTojo","TobuIsesaki"],
    "TokyoMetro": ["Ginza","Marunouchi","Hibiya","Tozai","Chiyoda","Yurakucho","Hanzomon","Namboku","Fukutoshin"]
  };
  function operatorToLine(opId) {
    var map = {
      "TokyoMetro": "Ginza", "TWR": "TwrLinereg", "YokohamaMunicipal": "BlueLine",
      "MIR": "TsukubaExpress", "TamaMonorail": "TamaMonorail", "Toei": "Oedo",
      "JREast": "Yamanote", "Tobu": "TobuSkytree", "Keio": "Keio", "Keikyu": "Keikyu"
    };
    return map[opId] || opId;
  }
  function getOperatorLines(opId) {
    var norm = TransitConstants ? (TransitConstants.NORMALIZE[opId] || opId) : opId;
    return _operatorToLines[norm] || [operatorToLine(norm)];
  }

  // ========== Public API ==========
  function fetchAllTimetables() {
    console.log("[TT] Fetching train timetables...");
    var promises = TT_ENDPOINTS.map(function(ep) { return fetchTimetable(ep); });
    return Promise.allSettled(promises).then(function(results) {
      var okCount = 0;
      var allTrains = [];
      results.forEach(function(r) {
        if (r.status === "fulfilled" && r.value.success && r.value.data.length > 0) {
          okCount++;
          var parsed = parseTimetable(r.value.endpoint, r.value.data);
          allTrains = allTrains.concat(parsed);
          _lastFetchTime[r.value.endpoint.id] = Date.now();
        }
      });
      _timetableCache = allTrains;
      // Calculate simulated positions
      _trainPositions = calculateSimulatedPositions(allTrains);
      console.log("[TT] Loaded " + allTrains.length + " trains from " + okCount + "/" + TT_ENDPOINTS.length + " endpoints");
      notifySubscribers();
      return { total: allTrains.length, endpoints: TT_ENDPOINTS.length, ok: okCount };
    });
  }

  function getTrainPositions(lineId) {
    // Check direct line ID first (legacy)
    if (_trainPositions[lineId]) return _trainPositions[lineId];
    // Fallback: find by operator
    var lines = getOperatorLines(lineId);
    for (var i = 0; i < lines.length; i++) {
      if (_trainPositions[lines[i]]) return _trainPositions[lines[i]];
    }
    return [];
  }
  function getTrainPositionsForLine(lineId) {
    // Get all positions for this line by matching its operator, then filter by lineId
    var line = (window.DataLayer && window.DataLayer.getLine) ? window.DataLayer.getLine(lineId) : ((window.UNIFIED_LINES && window.UNIFIED_LINES[lineId]) ? window.UNIFIED_LINES[lineId] : null);
    var op = line ? line.operator : "";
    var opNorm = TransitConstants ? (TransitConstants.NORMALIZE[op] || op) : op;
    var allPos = _trainPositionsByOp[opNorm] || [];
    // Filter: keep only positions that belong to this specific line
    return allPos.filter(function(p) { return p.lineId === lineId; });
  }

  function getAllTrains() {
    return _timetableCache;
  }

  function isTimetableLoaded() {
    return _timetableCache.length > 0;
  }

  function subscribe(callback) {
    _subscribers.push(callback);
    return function unsubscribe() {
      var idx = _subscribers.indexOf(callback);
      if (idx >= 0) _subscribers.splice(idx, 1);
    };
  }

  function notifySubscribers() {
    var snapshot = {
      trains: _timetableCache.slice(),
      positions: JSON.parse(JSON.stringify(_trainPositions)),
      loaded: isTimetableLoaded()
    };
    _subscribers.forEach(function(cb) { try { cb(snapshot); } catch(e) {} });
  }

  window.TTManager = {
    fetchAll: fetchAllTimetables,
    getTrainPositions: getTrainPositions,
    getTrainPositionsForLine: getTrainPositionsForLine,
    getAllTrains: getAllTrains,
    isLoaded: isTimetableLoaded,
    subscribe: subscribe,
    getEndpoints: function() { return TT_ENDPOINTS; }
  };

  console.log("[TT] Timetable module initialized (" + TT_ENDPOINTS.length + " endpoints)");
})();

