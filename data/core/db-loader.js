/**
 * Pixel Tetsudo - Database Loader
 * 从 railway_data.json 加载所有数据到全局变量
 * 替代原来的 station-coords.js, station-name-map.js, tourism-data.js, line-control.js
 */
(function() {
  "use strict";

  var DATA_FILE = "railway_data.json";
  var loaded = false;
  var error = null;

  function load() {
    if (loaded) return Promise.resolve();
    return fetch(DATA_FILE)
      .then(function(res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function(data) {
        // Station coordinates
        window.STATION_COORDS = {};
        Object.keys(data.stations).forEach(function(id) {
          var s = data.stations[id];
          window.STATION_COORDS[id] = [s.lat, s.lng];
        });

        // Station name maps
        window.STATION_NAME_MAP = data.name_map || {};
        window.EN_STATION_NAME_MAP = {};
        Object.keys(window.STATION_NAME_MAP).forEach(function(jp) {
          window.EN_STATION_NAME_MAP[window.STATION_NAME_MAP[jp]] = jp;
        });

        // Railway lines
        window.UNIFIED_LINES = data.lines || {};
        Object.keys(window.UNIFIED_LINES).forEach(function(lid) {
          var l = window.UNIFIED_LINES[lid];
          if (!l.durations) l.durations = [2] * (l.stations ? l.stations.length : 0);
          if (!l.throughServices) l.throughServices = [];
          if (!l.transferStations) l.transferStations = [];
        });

        // Tourism data
        window.TOURISM_DATA = data.tourism || {};
        window.TOURISM_STATIONS = Object.keys(window.TOURISM_DATA);

        // Raw data access for advanced features
        window.RailwayDB = {
          getStation: function(id) { return data.stations[id] || null; },
          getNameMap: function() { return data.name_map; },
          getLine: function(id) { return data.lines[id] || null; },
          getAllLines: function() { return data.lines; },
          getTourism: function() { return data.tourism; },
          getSpot: function(station, spotName) {
            var ts = data.tourism[station];
            if (!ts) return null;
            return ts.spots.find(function(s) { return s.name === spotName; }) || null;
          }
        };

        loaded = true;
        console.log("[DbLoader] Data loaded: " +
          Object.keys(data.stations).length + " stations, " +
          Object.keys(data.lines).length + " lines, " +
          Object.keys(data.tourism).length + " tourism stations");
      })
      .catch(function(err) {
        error = err;
        console.error("[DbLoader] Failed to load:", err.message);
        throw err;
      });
  }

  window.DataLoader = {
    load: load,
    isLoaded: function() { return loaded; },
    getError: function() { return error; }
  };

  // Auto-load on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
