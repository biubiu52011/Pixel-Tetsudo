/*
 * Pixel Tetsudo - Unified Data Layer
 * 统一数据层：缓存、本地数据、API数据
 */
(function() {
  'use strict';

  // Cache configuration
  const MAX_CACHE_SIZE = 50;
  const CACHE_TTL = 60000; // 1 minute

  // Cache storage
  const cache = Object.create(null);
  const cacheTime = Object.create(null);
  const cacheOrder = [];
  const inFlight = Object.create(null);

  // Cache management
  function updateCacheOrder(key) {
    const idx = cacheOrder.indexOf(key);
    if (idx > -1) {
      cacheOrder.splice(idx, 1);
      cacheOrder.push(key);
    }
  }

  function evictOldItem() {
    if (cacheOrder.length === 0) return;
    const oldestKey = cacheOrder.shift();
    delete cache[oldestKey];
    delete cacheTime[oldestKey];
  }

  function isCacheValid(key) {
    return cache[key] !== undefined && (Date.now() - cacheTime[key]) < CACHE_TTL;
  }

  function setCache(key, data) {
    if (Object.prototype.hasOwnProperty.call(cache, key)) {
      updateCacheOrder(key);
    } else if (cacheOrder.length >= MAX_CACHE_SIZE) {
      evictOldItem();
    }
    cache[key] = data;
    cacheTime[key] = Date.now();
    if (!cacheOrder.includes(key)) {
      cacheOrder.push(key);
    }
  }

  function fetchWithTimeout(url, ms) {
    ms = ms || 5000;
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
      return fetch(url, { signal: AbortSignal.timeout(ms) });
    }
    if (typeof AbortController === 'undefined') {
      return fetch(url);
    }
    var ctrl = new AbortController();
    var timer = setTimeout(function() { ctrl.abort(); }, ms);
    return fetch(url, { signal: ctrl.signal }).then(
      function(res) { clearTimeout(timer); return res; },
      function(err) { clearTimeout(timer); throw err; }
    );
  }

  // JSON fetch with caching
  function fetchJSON(url, fallbackKey) {
    var cacheKey = fallbackKey || url;
    if (isCacheValid(cacheKey)) {
      updateCacheOrder(cacheKey);
      return Promise.resolve(cache[cacheKey]);
    }
    if (inFlight[cacheKey]) return inFlight[cacheKey];

    inFlight[cacheKey] = fetchWithTimeout(url, 5000)
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function(data) {
        setCache(cacheKey, data);
        return data;
      })
      .catch(function(err) {
        console.warn('[DataLayer] Fetch failed:', err.message);
        if (isCacheValid(cacheKey)) {
          console.warn('[DataLayer] Using cached fallback');
          return cache[cacheKey];
        }
        throw err;
      })
      .finally(function() {
        delete inFlight[cacheKey];
      });
    return inFlight[cacheKey];
  }

  // Line data helpers
  function getAllLines() {
    if (window.RailwayDB && window.DataLoader && window.DataLoader.isLoaded() && window.RailwayDB.getAllLines) {
      return window.RailwayDB.getAllLines();
    }
    var lines = {};
    Object.keys(window.UNIFIED_LINES || {}).forEach(function(id) {
      var l = window.UNIFIED_LINES[id];
      if (l) lines[id] = l;
    });
    return lines;
  }

  function getLine(lineId) {
    if (window.RailwayDB && window.DataLoader && window.DataLoader.isLoaded() && window.RailwayDB.getLine) {
      return window.RailwayDB.getLine(lineId) || null;
    }
    return window.UNIFIED_LINES ? window.UNIFIED_LINES[lineId] : null;
  }

  function getGroupedLines() {
    var result = { grouped: {}, regionOrder: [] };
    var lines = getAllLines();
    Object.keys(lines).forEach(function(id) {
      var line = lines[id];
      var region = line.region || 'Unknown';
      if (!result.grouped[region]) {
        result.grouped[region] = [];
        result.regionOrder.push(region);
      }
      result.grouped[region].push(line);
    });
    return result;
  }

  // Public API

  // Station coordinate accessor
  function getStationCoords() {
    return window.STATION_COORDS || {};
  }

  // Cached train positions (lineId -> [{stationIndex, delayMin, ...}])
var _cachedPositions = {};

function getCachedPositions(lineId) {
  return _cachedPositions[lineId] || [];
}

function setCachedPositions(lineId, positions) {
  if (!positions || !Array.isArray(positions)) return;
  _cachedPositions[lineId] = positions;
}

window.DataLayer = {
    getStationCoords: getStationCoords,
    setCache: setCache,
    fetchJSON: fetchJSON,
    getAllLines: getAllLines,
    getLine: getLine,
    getGroupedLines: getGroupedLines,
    getCacheSize: function() { return Object.keys(cache).length; },
    getCachedPositions: getCachedPositions,
    setCachedPositions: setCachedPositions,
    clearCache: function() {
      for (var key in cache) delete cache[key];
      for (var key in cacheTime) delete cacheTime[key];
      cacheOrder.length = 0;
      for (var reqKey in inFlight) delete inFlight[reqKey];
    }
  };

})();

