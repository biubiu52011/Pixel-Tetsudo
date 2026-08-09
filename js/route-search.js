/**
 * Pixel Tetsudo - Route Search Module
 * Implements Breadth-First Search (BFS) to find routes between stations
 * based on the UNIFIED_LINES data structure.
 */

(function() {
  'use strict';

  /**
   * Build a bidirectional adjacency list from UNIFIED_LINES
   * Returns: Map<stationName, Set<connectedStationNames>>
   */
  function buildStationGraph() {
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
            for (const connectLine of (transfer.connects || [])) {
              // Find the line that has this connected station name
              // For simplicity, we'll add cross-line transfers by adding edges
              // In a real implementation, you'd match station names across lines
            }
          }
        }
      }
    }
    
    return graph;
  }

  /**
   * BFS to find shortest path between two stations
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
        // Calculate approximate duration (assume 2 min per segment as in data)
        const durationMin = (currentPath.length - 1) * 2;
        
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
  function getLinesForSegment(station1, station2) {
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
    getLinesForSegment: getLinesForSegment
  };

})();
