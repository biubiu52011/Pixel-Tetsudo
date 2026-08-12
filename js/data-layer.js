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
  const cache = {};
  const cacheTime = {};
  const cacheOrder = [];

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
    if (cache.hasOwnProperty(key)) {
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

  // JSON fetch with caching
  function fetchJSON(url, fallbackKey) {
    return fetch(url, { signal: AbortSignal.timeout(5000) })
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function(data) {
        if (fallbackKey) setCache(fallbackKey, data);
        return data;
      })
      .catch(function(err) {
        console.warn('[DataLayer] Fetch failed:', err.message);
        if (fallbackKey && isCacheValid(fallbackKey)) {
          console.warn('[DataLayer] Using cached fallback');
          return cache[fallbackKey];
        }
        throw err;
      });
  }

  // Line data helpers
  function getAllLines() {
    var lines = [];
    Object.keys(window.UNIFIED_LINES).forEach(function(id) {
      var l = window.UNIFIED_LINES[id];
      if (l) lines.push(l);
    });
    return lines;
  }

  function getLine(lineId) {
    return window.UNIFIED_LINES[lineId] || null;
  }

  function getGroupedLines() {
    var result = { grouped: {}, regionOrder: [] };
    var lines = getAllLines();
    lines.forEach(function(line) {
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
  window.DataLayer = {
    isCacheValid: isCacheValid,
    setCache: setCache,
    fetchJSON: fetchJSON,
    getAllLines: getAllLines,
    getLine: getLine,
    getGroupedLines: getGroupedLines,
    getCacheSize: function() { return Object.keys(cache).length; },
    clearCache: function() {
      for (var key in cache) delete cache[key];
      for (var key in cacheTime) delete cacheTime[key];
      cacheOrder.length = 0;
    }
  };

  console.log('[DataLayer] Initialized');
})();
