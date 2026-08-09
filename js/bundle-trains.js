/*
 * 列车信息 bundle 脚本 - 混合数据源版
 * 优先使用API实时数据，无API时使用时刻表模拟
 */

(function() {
  'use strict';

  // Pixel Tetsudo - Data Layer Module
  // ============================================
  const MAX_CACHE_SIZE = 50;
  let cache = {};
  let cacheTime = {};
  let cacheOrder = [];
  let CACHE_TTL = 60000;

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

  window.DataLayer = {
    isCacheValid: isCacheValid,
    setCache: setCache,
    fetchJSON: fetchJSON,
    getAllLines: getAllLines,
    getLine: getLine,
    getGroupedLines: getGroupedLines,
    getCacheSize: function() { return Object.keys(cache).length; },
    clearCache: function() {
      cache = {};
      cacheTime = {};
      cacheOrder = [];
    }
  };
})();


/**
 * Pixel Tetsudo - Trains Page Controller (Mixed Data Source)
 * API优先: 有API数据时使用实时数据, 无API时使用时刻表模拟
 */
(function() {
  'use strict';

  const API_URL = '../data/api/trains.json';
  const API_REFRESH_INTERVAL = 30000;
  let apiSupported = false;
  let localTrains = {};

  const TrainsPage = {
    currentLine: null,
    simulationRunning: false,
    tickInterval: null,
    apiFetchInterval: null,
    referenceTime: Math.floor(new Date().getHours() * 60 + new Date().getMinutes()),
    container: null,
    viewElement: null,
    titleElement: null,
    timeElement: null,
    mapElement: null,
    backBtn: null,

    init: function() {
      // Sync line name aliases
      if (window.UNIFIED_LINES) {
        for (var key in window.UNIFIED_LINES) {
          var line = window.UNIFIED_LINES[key];
          if (line && line.name && !window.UNIFIED_LINES[line.name]) {
            window.UNIFIED_LINES[line.name] = line;
          }
        }
      }

      this.container = document.getElementById('trainsLineListContent');
      this.viewElement = document.getElementById('trainsDetailView');
      this.titleElement = document.getElementById('trainsDetailTitle');
      this.timeElement = document.getElementById('trainsDetailTime');
      this.mapElement = document.getElementById('trainsMapContainer');
      this.backBtn = document.getElementById('trainsBackBtn');

      if (!this.container) return;

      var t = window.t || function(key) { return key; };

      if (this.backBtn) {
        this.backBtn.addEventListener('click', function() { TrainsPage.hideLineView(); });
        this.backBtn.textContent = ' ' + t('line_map.back');
      }

      // Load train data - try API first, fallback to local
      this.loadTrainData().then(function() {
        // Get current time in minutes for simulation
        var now = new Date();
        TrainsPage.referenceTime = now.getHours() * 60 + now.getMinutes();
        
        TrainsPage.renderLineList(TrainsPage.container);

        var params = new URLSearchParams(window.location.search);
        var lineId = params.get('lineId');
        if (lineId && window.UNIFIED_LINES[lineId]) {
          TrainsPage.showLineView(lineId);
        }

        if (typeof window.onLanguageChange === 'function') {
          window.onLanguageChange(function() { TrainsPage.refreshUI(); });
        }
      }).catch(function(err) {
        console.error('[TrainsPage] Failed to load train data:', err);
        TrainsPage.renderLineList(TrainsPage.container);
      });
    },

    loadTrainData: function() {
      var self = this;
      return window.DataLayer.fetchJSON(API_URL, 'trains_data').then(function(data) {
        apiSupported = true;
        console.log('[TrainsPage] Using API train data');
        return data;
      }).catch(function() {
        apiSupported = false;
        console.log('[TrainsPage] API not available, using local simulation data');
        // Use local train data
        if (window.TRAINS) {
          localTrains = window.TRAINS;
        }
        return localTrains;
      }).then(function(data) {
        // Merge API data with local data
        if (data && data.trains) {
          Object.keys(data.trains).forEach(function(lineId) {
            localTrains[lineId] = data.trains[lineId];
          });
        }
        window.TRAINS = localTrains;
      });
    },

    refreshUI: function() {
      var t = window.t || function(key) { return key; };
      if (this.backBtn) {
        this.backBtn.textContent = ' ' + t('line_map.back');
      }
      this.renderLineList(this.container);
      if (this.currentLine && window.UNIFIED_LINES[this.currentLine]) {
        this.renderLineView(this.currentLine);
      }
    },

    renderLineList: function(container) {
      var lines = window.UNIFIED_LINES || {};
      var trains = window.TRAINS || {};
      var t = window.t || function(key) { return key; };
      var html = '';

      // Group by operator
      var operatorGroups = {};
      for (var lineId in lines) {
        var line = lines[lineId];
        var op = line.operator || t('line.other');
        if (!operatorGroups[op]) operatorGroups[op] = [];
        operatorGroups[op].push(lineId);
      }

      for (var op in operatorGroups) {
        html += '<div class="tp-operator-group">';
        html += '<div class="tp-operator-title">' + op + '</div>';
        var lineIds = operatorGroups[op];
        for (var i = 0; i < lineIds.length; i++) {
          var lid = lineIds[i];
          var line = lines[lid];
          var lineTrains = trains[lid] || [];
          var color = line.color || '#888';
          var name = line.nameEn || line.name || lid;
          var trainCount = lineTrains.length;
          var unitText = t('unit.car') || '両';
          html += '<div class="tp-line-card" data-line-id="' + lid + '" style="--line-color: ' + color + ';">';
          html += '<img src="' + line.image + '" class="tp-line-icon" alt="' + name + '">';
          html += '<div class="tp-line-info">';
          html += '<div class="tp-line-name">' + name + '</div>';
          html += '<div class="tp-line-detail">';
          html += '<span class="tp-line-operator">' + (line.operator || t('line.other')) + '</span>';
          var lineType = line.type === 'loop' ? t('line.loop') : t('line.straight');
          html += '<span class="tp-line-type">' + lineType + '</span>';
          html += '<span class="tp-train-count">' + trainCount + ' ' + unitText + '</span>';
          html += '</div></div>';
          html += '<div class="tp-line-arrow"></div></div>';
        }
        html += '</div>';
      }

      // Empty state message
      if (!html) {
        html = '<div class="tp-empty-state">' + t('line.not_found') + '</div>';
      }

      container.innerHTML = html;

      // Attach click handlers
      container.querySelectorAll('.tp-line-card').forEach(function(card) {
        card.addEventListener('click', function() {
          var lineId = this.getAttribute('data-line-id');
          TrainsPage.showLineView(lineId);
        });
      });
    },

    showLineView: function(lineId) {
      this.currentLine = lineId;
      var line = window.UNIFIED_LINES[lineId];
      if (!line) return;
      if (this.container) this.container.style.display = 'none';
      if (this.viewElement) this.viewElement.style.display = 'block';
      if (this.titleElement) {
        var t = window.t || function(key) { return key; };
        this.titleElement.textContent = line.nameEn || line.name || lineId;
      }
      if (this.mapElement) this.renderTrainMap(this.mapElement, line, lineId);
      this.startSimulation();
    },

    renderLineView: function(lineId) {
      if (this.titleElement) {
        var line = window.UNIFIED_LINES[lineId];
        if (line) this.titleElement.textContent = line.nameEn || line.name || lineId;
      }
      if (this.mapElement && lineId) {
        var line = window.UNIFIED_LINES[lineId];
        if (line) this.renderTrainMap(this.mapElement, line, lineId);
      }
    },

    hideLineView: function() {
      if (this.currentLine) {
        this.stopSimulation();
        this.currentLine = null;
      }
      if (this.container) this.container.style.display = 'block';
      if (this.viewElement) this.viewElement.style.display = 'none';
    },

    renderTrainMap: function(container, line, lineId) {
      var trains = window.TRAINS && window.TRAINS[lineId] ? window.TRAINS[lineId] : [];
      var t = window.t || function(key) { return key; };

      // Show message when no trains
      if (!trains || trains.length === 0) {
        container.innerHTML = '<div class="tp-empty-state">' + t('status.no_data') + '</div>';
        return;
      }

      var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="200">';
      svg += '<line x1="50" y1="100" x2="' + (50 + (line.stations.length - 1) * 60) + '" y2="100" stroke="#ccc" stroke-width="2"/>';

      line.stations.forEach(function(station, i) {
        svg += '<circle cx="' + (50 + i * 60) + '" cy="100" r="4" fill="#888"/>';
        var displayName = station.length > 4 ? station.substring(0, 4) + '...' : station;
        svg += '<text x="' + (50 + i * 60) + '" y="80" text-anchor="middle" font-size="10">' + displayName + '</text>';
      });

      trains.forEach(function(train) {
        var pos = this.computePosition(line, train, this.referenceTime);
        if (pos) {
          var x = 50 + pos.stationIndex * 60 + pos.progress * 60;
          var delayClass = (train.delay || 0) > 0 ? ' tp-train-delayed' : '';
          svg += '<circle cx="' + x + '" cy="100" r="6" fill="' + (line.color || '#00a04e') + '" class="tp-train' + delayClass + '"/>';
          // Show train info on hover
          svg += '<title>' + train.id + ' - ' + train.destination + ' (delay: ' + (train.delay || 0) + 'min)</title>';
        }
      }.bind(this));

      svg += '</svg>';
      container.innerHTML = svg;
    },

    computePosition: function(line, train, refTime) {
      var stations = line.stations || [];
      var durations = line.durations || [];
      if (!stations.length || stations.length < 2) return null;
      var isLoop = line.type === 'loop';
      var totalDuration = durations.reduce(function(a, b) { return a + b; }, 0);
      if (totalDuration === 0) return null;
      // Use train's departAt as base time, add current time offset and delay
      var departMinutes = train.departAt || 0;
      var delayMinutes = train.delay || 0;
      var elapsed = refTime + delayMinutes - departMinutes;
      var wrapElapsed = isLoop ? ((elapsed % totalDuration) + totalDuration) % totalDuration : Math.max(0, Math.min(elapsed, totalDuration));
      var cumulative = 0;
      for (var i = 0; i < durations.length; i++) {
        cumulative += durations[i];
        if (wrapElapsed <= cumulative) {
          var segElapsed = wrapElapsed - (cumulative - durations[i]);
          var progress = durations[i] > 0 ? segElapsed / durations[i] : 0;
          return {
            stationIndex: i,
            nextStationIndex: Math.min(i + 1, stations.length - 1),
            progress: Math.min(1, Math.max(0, progress)),
            station: stations[i],
            nextStation: stations[i + 1] || stations[0]
          };
        }
      }
      return {
        stationIndex: stations.length - 1,
        nextStationIndex: 0,
        progress: 1,
        station: stations[stations.length - 1],
        nextStation: stations[0]
      };
    },

    startSimulation: function() {
      if (this.simulationRunning) return;
      this.simulationRunning = true;
      var self = this;
      this.tickInterval = setInterval(function() { self.tick(); }, 1000);
    },

    stopSimulation: function() {
      if (this.tickInterval) {
        clearInterval(this.tickInterval);
        this.tickInterval = null;
      }
      this.simulationRunning = false;
    },

    tick: function() {
      if (!this.currentLine) return;
      this.referenceTime += 1;
      var line = window.UNIFIED_LINES && window.UNIFIED_LINES[this.currentLine];
      if (!line) return;
      if (this.mapElement) this.renderTrainMap(this.mapElement, line, this.currentLine);
      if (this.timeElement) this.timeElement.textContent = this.getCurrentTimeStr();
    },

    getCurrentTimeStr: function() {
      var now = new Date();
      var h = String(now.getHours()).padStart(2, '0');
      var m = String(now.getMinutes()).padStart(2, '0');
      return h + ':' + m;
    }
  };

  window.TrainsPage = TrainsPage;

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { TrainsPage.init(); });
    } else {
      TrainsPage.init();
    }
  }

  function waitForData() {
    if (window.UNIFIED_LINES && Object.keys(window.UNIFIED_LINES).length > 0) {
      init();
    } else {
      setTimeout(waitForData, 100);
    }
  }

  waitForData();
})();
