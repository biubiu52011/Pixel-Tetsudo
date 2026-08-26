/**
 * TourismProximity — Unified proximity API
 * Centralized Haversine + caching for all Tourism-related distance queries.
 *
 * Usage:
 *   var results = TourismProximity.getNearbySpotsByStation(stationId, { radius: 3000, limit: 10 });
 *
 * Returns: Array of { spot, distance, distanceText, stationId } or [] on failure.
 */
(function() {
  'use strict';

  var R = 6371000; // Earth radius in meters
  var DEFAULT_RADIUS = 3000; // 3km
  var DEFAULT_LIMIT = 10;
  var CACHE_TTL_MS = 60000; // 60 seconds
  var CACHE_MIN_MOVE_M = 100; // Recompute only if user moved >= 100m

  /**
   * Haversine distance in meters between two lat/lng points.
   * Returns Infinity if either point is invalid (0,0 or missing).
   */
  function haversine(lat1, lng1, lat2, lng2) {
    if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return Infinity;
    // Guard against (0,0) coordinates
    if ((lat1 === 0 && lng1 === 0) || (lat2 === 0 && lng2 === 0)) return Infinity;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLng = (lng2 - lng1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Format distance for display
   */
  function formatDistance(meters) {
    if (meters === Infinity || meters === null || isNaN(meters)) return null;
    if (meters < 1000) return Math.round(meters) + 'm';
    return (meters / 1000).toFixed(1) + 'km';
  }

  /**
   * Build or return cached nearby spots for a station.
   * @param {string} stationId - Station identifier
   * @param {Object} options - { radius: number, limit: number }
   * @returns {Array<{spot, distance, distanceText, stationId}>}
   */
  function getNearbySpotsByStation(stationId, options) {
    options = options || {};
    var radius = (options.radius > 0) ? options.radius : DEFAULT_RADIUS;
    var limit = (options.limit > 0) ? options.limit : DEFAULT_LIMIT;

    var td = window.TOURISM_DATA;
    var sc = window.STATION_COORDS || {};
    if (!td || !stationId) return [];

    // Resolve station coords — use RailwayDB if available, else STATION_COORDS
    var stationCoord = null;
    if (window.RailwayDB && window.RailwayDB.getStationLocation) {
      stationCoord = window.RailwayDB.getStationLocation(stationId);
    }
    if (!stationCoord) {
      stationCoord = sc[stationId];
    }
    if (!stationCoord || !stationCoord[0] || !stationCoord[1]) return [];

    var sLat = stationCoord[0];
    var sLng = stationCoord[1];

    // Build cache key from station coords + radius (not stationId, to handle name variations)
    var cacheKey = sLat.toFixed(6) + "," + sLng.toFixed(6) + '|' + radius;
    var now = Date.now();

    // Check cache
    if (_proximityCache[cacheKey]) {
      var cached = _proximityCache[cacheKey];
      if ((now - cached.timestamp) < CACHE_TTL_MS) {
        // TTL not expired — return cached results
        return cached.results;
      }
      // TTL expired — fall through to recompute
    }

    // Collect all spots and compute distances
    var results = [];
    for (var sk in td) {
      var st = td[sk];
      if (!st || !st.spots) continue;
      for (var i = 0; i < st.spots.length; i++) {
        var spot = st.spots[i];
        if (!spot || !spot.coord || !spot.coord[0] || !spot.coord[1]) continue;
        var dist = haversine(sLat, sLng, spot.coord[0], spot.coord[1]);
        if (dist === Infinity) continue;
        if (dist <= radius) {
          results.push({
            spot: spot,
            distance: dist,
            distanceText: formatDistance(dist),
            stationId: sk
          });
        }
      }
    }

    // Sort by distance ascending
    results.sort(function(a, b) { return a.distance - b.distance; });
    results = results.slice(0, limit);

    // Update cache
    _proximityCache[cacheKey] = {
      timestamp: now,
      results: results
    };

    return results;
  }

  /**
   * Invalidate cache (call when data changes)
   */
  function invalidateCache() {
    _proximityCache = {};
  }

  /**
   * Get haversine distance directly (for modules that need raw distance)
   */
  function getDistance(lat1, lng1, lat2, lng2) {
    return haversine(lat1, lng1, lat2, lng2);
  }

  var _proximityCache = {};

  window.TourismProximity = {
    getNearbySpotsByStation: getNearbySpotsByStation,
    getDistance: getDistance,
    formatDistance: formatDistance,
    invalidateCache: invalidateCache,
    // Expose constants for backward compatibility
    DEFAULT_RADIUS: DEFAULT_RADIUS,
    DEFAULT_LIMIT: DEFAULT_LIMIT,
    CACHE_TTL_MS: CACHE_TTL_MS,
    CACHE_MIN_MOVE_M: CACHE_MIN_MOVE_M
  };

})();
