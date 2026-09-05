/**
 * Pixel Tetsudo - Route Search Module
 * Implements Breadth-First Search (BFS) to find routes between stations
 * based on the UNIFIED_LINES data structure.
 */

(function() {
  'use strict';

  let _graphCache = null;
  let _graphVersion = 0;

  /**
   * Build a bidirectional adjacency list from UNIFIED_LINES
   * Returns: Map<stationName, Set<connectedStationNames>>
   */
  function buildStationGraph() {
    if (_graphCache) return _graphCache;
    const graph = new Map();
    
    for (const [lineId, line] of Object.entries(window.RailwayDB ? window.RailwayDB.getAllLines() : (window.DataLayer ? window.DataLayer.getAllLines() : window.UNIFIED_LINES || {}))) {
      if (!line || !line.stations) continue;
      
      // Add all stations in this line to the graph (sequential connections)
      for (let i = 0; i < line.stations.length; i++) {
        const station = line.stations[i];
        if (!graph.has(station)) {
          graph.set(station, new Set());
        }
        
        // Connect to previous station (if exists)
        if (i > 0) {
          const prev = line.stations[i - 1];
          graph.get(station).add(prev);
          graph.get(prev).add(station);
        }
        
        // Connect to next station (if exists)
        if (i < line.stations.length - 1) {
          const next = line.stations[i + 1];
          graph.get(station).add(next);
          if (graph.has(next)) { graph.get(next).add(station); }
        }
      }
      
      // Also add transfer connections between lines
      if (line.transferStations) {
        for (const transfer of line.transferStations) {
          const station = transfer.station;
          if (graph.has(station)) {
            for (const connectLineId of (transfer.connects || [])) {
              const connectLine = window.DataLayer ? window.DataLayer.getLine(connectLineId) : (window.UNIFIED_LINES ? window.UNIFIED_LINES[connectLineId] : null);
              // Transfer stations are already in the graph via line stations
              // No need to add self-loops - BFS visited set handles this
            }
          }
        }
      }
    }
    
    _graphCache = graph;
    return graph;
  }

  /**
   * Get cached graph, rebuilding if necessary between two stations
   * @param {string} fromStation - Starting station name
   * @param {string} toStation - Destination station name
   * @returns {Object|null} { path: string[], durationMin: number, lineInfo: Array[] } or null if no route
   */
  function findRoute(fromStation, toStation) {
    if (!fromStation || !toStation) return null;
    if (fromStation.toLowerCase() === toStation.toLowerCase()) {
      return { path: [fromStation], durationMin: 0, segments: 0, lineInfo: [] };
    }

    const graph = buildStationGraph();
    
    // Check if both stations exist in the graph
    const fromLower = fromStation.toLowerCase();
    const toLower = toStation.toLowerCase();
    const fromMatch = Array.from(graph.keys()).find(s => s.toLowerCase() === fromLower);
    const toMatch = Array.from(graph.keys()).find(s => s.toLowerCase() === toLower);
    if (!fromMatch || !toMatch) return null;
    const queue = [[fromMatch]];
    const visited = new Set([fromMatch]);
    
    while (queue.length > 0) {
      const currentPath = queue.shift();
      const currentStation = currentPath[currentPath.length - 1];
      
      // Check if destination reached
      if (currentStation === toMatch) {
        // Calculate actual duration using line duration data
        let durationMin = 0;
        for (let i = 0; i < currentPath.length - 1; i++) {
          const segLines = getLinesForSegment(currentPath[i], currentPath[i+1]);
          if (segLines.length > 0) {
            const line = window.DataLayer ? window.DataLayer.getLine(segLines[0]) : (window.UNIFIED_LINES ? window.UNIFIED_LINES[segLines[0]] : null);
            if (line && line.durations) {
              const segIdx = line.stations.indexOf(currentPath[i]);
              if (segIdx >= 0 && segIdx < line.durations.length) {
                durationMin += line.durations[segIdx];
              } else {
                durationMin += 2;
              }
            } else {
              durationMin += 2;
            }
          } else {
            durationMin += 2;
          }
        }
        
        // Determine which lines are involved in each segment
        const lineInfo = [];
        for (let i = 0; i < currentPath.length - 1; i++) {
          const segmentLines = getLinesForSegment(currentPath[i], currentPath[i+1]);
          lineInfo.push({
            from: currentPath[i],
            to: currentPath[i+1],
            lines: segmentLines
          });
        }
        
        return {
          path: currentPath,
          durationMin: durationMin,
          segments: currentPath.length - 1,
          lineInfo: lineInfo
        };
      }
      
      // Explore neighbors
      const neighbors = graph.get(currentStation) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          const newPath = [...currentPath, neighbor];
          queue.push(newPath);
        }
      }
    }
    
    // No route found
    return null;
  }

  /**
   * Get which lines connect two adjacent stations
   */
  const _lineCache = new Map();
  /**
   * Build a reverse map: lineName -> lineId (for first match)
   */
  let _nameToIdCache = null;
  function getNameToIdMap() {
    if (_nameToIdCache) return _nameToIdCache;
    _nameToIdCache = {};
    for (const [lineId, line] of Object.entries(window.RailwayDB ? window.RailwayDB.getAllLines() : (window.DataLayer ? window.DataLayer.getAllLines() : window.UNIFIED_LINES || {}))) {
      if (line && line.name) { _nameToIdCache[line.name] = lineId; }
    }
    return _nameToIdCache;
  }

  /**
   * Convert a BFS route result into RouteSegment[] array.
   */
  function buildRouteSegments(route) {
    if (!route || !route.lineInfo || route.lineInfo.length === 0) return [];
    const segments = [];
    const nameToId = getNameToIdMap();
    const lineOrder = window.LINE_STATION_ORDER || {};
    for (let i = 0; i < route.lineInfo.length; i++) {
      const seg = route.lineInfo[i];
      const lineName = seg.lines[0] || null;
      const lineId = lineName ? (nameToId[lineName] || null) : null;
      let direction = 0;
      if (lineId && lineOrder[lineId]) {
        const o = lineOrder[lineId];
        const fromIdx = o[seg.from], toIdx = o[seg.to];
        direction = toIdx > fromIdx ? 1 : (toIdx < fromIdx ? -1 : 0);
      }
      let duration = null;
      if (lineId && window.RailwayDB && lineOrder[lineId]) {
        const durArr = window.RailwayDB.getLineDurations(lineId);
        const o = lineOrder[lineId];
        if (durArr && durArr.length > 0 && o[seg.from] != null && o[seg.to] != null) {
          const fi = o[seg.from], ti = o[seg.to];
          if (ti > fi && ti <= durArr.length) {
            let d = 0;
            for (let j = fi; j < ti; j++) d += durArr[j] || 2;
            duration = d;
          }
        }
      }
      segments.push({ type: 'ride', lineId, lineName, fromStation: seg.from, toStation: seg.to, duration, direction, fare: null, walking: null });
      if (i < route.lineInfo.length - 1) {
        const nextLineName = route.lineInfo[i+1].lines[0] || null;
        if (nextLineName && nextLineName !== lineName) {
          segments.push({ type: 'transfer', station: seg.to, fromLine: lineName, toLines: route.lineInfo[i+1].lines, walking: null, walkingDuration: null });
        }
      }
    }
    return segments;
  }


  function getLinesForSegment(station1, station2) {
    const key = station1 + '||' + station2;
    if (_lineCache.has(key)) return _lineCache.get(key);
    const lines = [];
    for (const [lineId, line] of Object.entries(window.RailwayDB ? window.RailwayDB.getAllLines() : (window.DataLayer ? window.DataLayer.getAllLines() : window.UNIFIED_LINES || {}))) {
      if (line && line.stations) {
        const idx1 = line.stations.indexOf(station1);
        const idx2 = line.stations.indexOf(station2);
        if ((idx1 >= 0 && idx2 >= 0 && Math.abs(idx1 - idx2) === 1)) {
          lines.push(line.name);
        }
      }
    }
    _lineCache.set(key, lines);
    return lines;
  }

  /**
   * Find all stations that contain a search term (for autocomplete)
   * @param {string} term - Search term (partial station name)
   * @returns {Array<string>} Matching station names
   */
  function findStationsByTerm(term) {
    if (!term || term.trim() === '') return [];
    // Use StationResolver if available (supports JP/EN/mixed input)
    if (window.StationResolver) {
      var results = window.StationResolver.resolve(term);
      var lang = window.currentLang || 'en';
      return results.slice(0, 10).map(function(r) {
        var did = r.stationId;
        var dn = r.displayName || did;
        if (window.RailwayDB && window.RailwayDB.resolveStationName) {
          var ln = window.RailwayDB.resolveStationName(did, lang);
          if (ln && ln !== did) dn = ln;
        }
        return { stationId: did, displayName: dn };
      });
    }
    // Fallback: substring match on line station IDs
    const query = term.toLowerCase().trim();
    const matches = new Set();
    for (const [lineId, line] of Object.entries(window.RailwayDB ? window.RailwayDB.getAllLines() : (window.DataLayer ? window.DataLayer.getAllLines() : window.UNIFIED_LINES || {}))) {
      if (line && line.stations) {
        for (const station of line.stations) {
          if (station.toLowerCase().includes(query)) {
            matches.add(station);
          }
        }
      }
    }
    var lang = window.currentLang || 'en';
    return Array.from(matches).slice(0, 10).map(function(sid) {
      var dn = sid;
      if (window.RailwayDB && window.RailwayDB.resolveStationName) {
        var ln = window.RailwayDB.resolveStationName(sid, lang);
        if (ln && ln !== sid) dn = ln;
      }
      return { stationId: sid, displayName: dn };
    });
  }

  // Public API
  window.RouteSearch = {
    findRoute: findRoute,
    findStationsByTerm: findStationsByTerm,
    buildStationGraph: buildStationGraph,
    getLinesForSegment: getLinesForSegment,
    invalidateGraphCache: function() { _graphCache = null; },
    buildRouteSegments: buildRouteSegments
  };

})();
