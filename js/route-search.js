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
    
    for (const lineId of Object.keys(window.UNIFIED_LINES)) {
      const line = window.UNIFIED_LINES[lineId];
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
          graph.get(next).add(station);
        }
      }
      
      // Also add transfer connections between lines
      if (line.transferStations) {
        for (const transfer of line.transferStations) {
          const station = transfer.station;
          if (graph.has(station)) {
            for (const connectLineId of (transfer.connects || [])) {
              const connectLine = window.UNIFIED_LINES[connectLineId];
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
    if (fromStation === toStation) {
      return { path: [fromStation], durationMin: 0, lineInfo: [] };
    }

    const graph = buildStationGraph();
    
    // Check if both stations exist in the graph
    if (!graph.has(fromStation) || !graph.has(toStation)) {
      return null;
    }

    // BFS initialization
    const queue = [[fromStation]]; // Each item is a path (array of stations)
    const visited = new Set([fromStation]);
    
    while (queue.length > 0) {
      const currentPath = queue.shift();
      const currentStation = currentPath[currentPath.length - 1];
      
      // Check if destination reached
      if (currentStation === toStation) {
        // Calculate actual duration using line duration data
        let durationMin = 0;
        for (let i = 0; i < currentPath.length - 1; i++) {
          const segLines = getLinesForSegment(currentPath[i], currentPath[i+1]);
          if (segLines.length > 0) {
            const line = window.UNIFIED_LINES[segLines[0]];
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

  function getLinesForSegment(station1, station2) {
    const key = station1 + '||' + station2;
    if (_lineCache.has(key)) return _lineCache.get(key);
    const lines = [];
    for (const lineId of Object.keys(window.UNIFIED_LINES)) {
      const line = window.UNIFIED_LINES[lineId];
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
    
    const query = term.toLowerCase().trim();
    const matches = new Set();
    
    for (const lineId of Object.keys(window.UNIFIED_LINES)) {
      const line = window.UNIFIED_LINES[lineId];
      if (line && line.stations) {
        for (const station of line.stations) {
          if (station.toLowerCase().includes(query)) {
            matches.add(station);
          }
        }
      }
    }
    
    return Array.from(matches).slice(0, 10); // Return top 10
  }

  // Public API
  window.RouteSearch = {
    findRoute: findRoute,
    findStationsByTerm: findStationsByTerm,
    buildStationGraph: buildStationGraph,
    getLinesForSegment: getLinesForSegment,
    invalidateGraphCache: function() { _graphCache = null; }
  };

})();
