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
   * Format distance as walking minutes (user-facing display)
   * Assumes average walking speed of 80m/min
   */
  function formatWalkMinutes(meters, i18n) {
    if (meters === Infinity || meters === null || isNaN(meters)) return null;
    var atStation = i18n && i18n.at_station ? i18n.at_station : '駅前';
    var minWalk = i18n && i18n.min_walk ? i18n.min_walk : '分徒歩';
    if (meters < 100) return atStation;
    var mins = Math.round(meters / 80);
    return mins + ' ' + minWalk;
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

    var spots = window.TOURISM_SPOTS || [];
    var sc = window.STATION_COORDS || {};
    if (!stationId) return [];

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

    // Collect all spots from global pool and compute distances
    var results = [];
    for (var i = 0; i < spots.length; i++) {
      var spot = spots[i];
      if (!spot || !spot.coord || !spot.coord[0] || !spot.coord[1]) continue;
      var dist = haversine(sLat, sLng, spot.coord[0], spot.coord[1]);
      if (dist === Infinity) continue;
      if (dist <= radius) {
        results.push({
          spot: spot,
          distance: dist,
          distanceText: formatWalkMinutes(dist),
          stationId: stationId,
            exitDirection: mapDirectionToExit(getExitDirection(sLat, sLng, spot.coord[0], spot.coord[1]), stationId),
        });
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

  /**
   * Calculate exit direction from station to spot (8-direction compass)
   * @param {number} stationLat - Station latitude
   * @param {number} stationLng - Station longitude
   * @param {number} spotLat - Spot latitude
   * @param {number} spotLng - Spot longitude
   * @returns {string} Direction key: N/NE/E/SE/S/SW/W/NW or null if too close
   */
  function getExitDirection(stationLat, stationLng, spotLat, spotLng) {
    if (stationLat == null || stationLng == null || spotLat == null || spotLng == null) return null;
    var dLat = spotLat - stationLat;
    var dLng = spotLng - stationLng;
    // If spot is very close to station, consider it station direct
    var dist = haversine(stationLat, stationLng, spotLat, spotLng);
    if (dist < 80) return 'STATION';
    // Calculate bearing (0=N, 90=E, 180=S, 270=W)
    var bearing = (Math.atan2(dLng, dLat) * 180 / Math.PI + 360) % 360;
    // 8-direction compass
    if (bearing >= 337.5 || bearing < 22.5) return 'N';
    if (bearing >= 22.5 && bearing < 67.5) return 'NE';
    if (bearing >= 67.5 && bearing < 112.5) return 'E';
    if (bearing >= 112.5 && bearing < 157.5) return 'SE';
    if (bearing >= 157.5 && bearing < 202.5) return 'S';
    if (bearing >= 202.5 && bearing < 247.5) return 'SW';
    if (bearing >= 247.5 && bearing < 292.5) return 'W';
    return 'NW';
  }


  /**
   * Find nearest station from user location
   * @param {number} userLat - User latitude
   * @param {number} userLng - User longitude
   * @returns {Object|null} { stationId, distance, coord } or null
   */

  /**
   * Map 8-direction to actual exit name based on station available exits
   * Only returns exits that actually exist at the station
   */
  function mapDirectionToExit(directionKey, stationId) {
    if (!directionKey || directionKey === 'STATION') return '駅直結';
    var stationExits = (window.STATION_EXITS && window.STATION_EXITS[stationId]) || [];
    if (stationExits.length === 0) return null;
    var priorityMap = {
      'N': ['北口', '東口', '西口'],
      'NE': ['東口', '北口', '南口'],
      'E': ['東口', '北口', '南口', '西口'],
      'SE': ['東口', '南口', '西口'],
      'S': ['南口', '西口', '東口'],
      'SW': ['西口', '南口', '東口'],
      'W': ['西口', '北口', '南口', '東口'],
      'NW': ['西口', '北口', '東口']
    };
    var priorities = priorityMap[directionKey] || ['東口', '西口'];
    for (var i = 0; i < priorities.length; i++) {
      if (stationExits.indexOf(priorities[i]) >= 0) {
        return priorities[i];
      }
    }
    return stationExits[0] || null;
  }

  function getNearestStation(userLat, userLng) {
    if (userLat == null || userLng == null) return null;
    var sc = window.STATION_COORDS || {};
    var nearest = null;
    var minDist = Infinity;
    Object.keys(sc).forEach(function(stationId) {
      var coord = sc[stationId];
      if (!coord || !coord[0] || !coord[1]) return;
      if (coord[0] === 0 && coord[1] === 0) return;
      var dist = haversine(userLat, userLng, coord[0], coord[1]);
      if (dist < minDist) {
        minDist = dist;
        nearest = { stationId: stationId, distance: dist, coord: coord };
      }
    });
    return nearest;
  }
  var _proximityCache = {};

  window.TourismProximity = {
    getNearbySpotsByStation: getNearbySpotsByStation,
    getDistance: getDistance,
    getNearestStation: getNearestStation,
    getExitDirection: getExitDirection,
    mapDirectionToExit: mapDirectionToExit,
    formatDistance: formatDistance,
    formatWalkMinutes: formatWalkMinutes,
    invalidateCache: invalidateCache,
    // Expose constants for backward compatibility
    DEFAULT_RADIUS: DEFAULT_RADIUS,
    DEFAULT_LIMIT: DEFAULT_LIMIT,
    CACHE_TTL_MS: CACHE_TTL_MS,
    CACHE_MIN_MOVE_M: CACHE_MIN_MOVE_M
  };

})();

