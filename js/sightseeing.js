/**
 * Sightseeing Module - Coordinate-based Recommendation
 */

(function() {
  'use strict';
  function getStationCoords() { return window.STATION_COORDS || {}; }

  const TAG_LABELS = {
    all: 'tourism.tag_all',
    night: 'tourism.tag_night',
    history: 'tourism.tag_history',
    nature: 'tourism.tag_nature',
    shrine: 'tourism.tag_shrine',
    food: 'tourism.tag_food',
    seasonal: 'tourism.tag_seasonal'
  };

  const TAG_ICONS = {};

  function getMajorStations() { return (window.TOURISM_STATIONS && window.TOURISM_STATIONS.length > 0) ? Array.from(window.TOURISM_STATIONS) : ['Shinjuku']; }
  const RIVERS = [
    { name: 'Sumida', lat: 35.710, lng: 139.803, width: 120 } // width in meters
  ];
  let state = {
    lang: 'ja',
    userLat: null,
    userLng: null,
    selectedStation: null,
    activeTags: new Set(),
    autoDetected: false
  };

  let dom = {};
  const DIST_CACHE_TTL_MS = 60000;
  const DIST_CACHE_MIN_MOVE_M = 100;
  let _distCache = {};

  function cacheDom() {
    dom.container = document.getElementById('smModule');
    dom.grid = document.getElementById('smGrid');
    dom.tagFilters = document.getElementById('smTagFilters');
    dom.empty = document.getElementById('smEmpty');
    dom.stationDisplay = document.getElementById('smStationDisplay');
    dom.relocateBtn = document.getElementById('smRelocateBtn');
    dom.header = document.querySelector('.sm-header');
    dom.stationPicker = document.getElementById('smStationPicker');
  }

  function t(key) {
    return (typeof window.t === 'function') ? window.t(key) : key;
  }

  function getSPOTS() { return window.TOURISM_SPOTS || []; }
  function isAcrossRiver(stationLat, stationLng, spotLat, spotLng) {
    for (const river of RIVERS) {
      const distToRiver = Math.abs(spotLat - river.lat) * 111000;
      if (distToRiver < river.width && Math.abs(spotLng - river.lng) < 0.005) {
        const stationDistToRiver = Math.abs(stationLat - river.lat) * 111000;
        const onOppositeSide = (spotLat > river.lat && stationLat < river.lat) ||
                               (spotLat < river.lat && stationLat > river.lat);
        if (stationDistToRiver > river.width && onOppositeSide) {
          return true;
        }
      }
    }
    return false;
  }

  function renderHeader() {
    if (!dom.header) return;
    let html = '<h2 data-i18n="tourism.title">' + t('tourism.title') + '</h2>';
    // Phase 43-A: removed sm-auto-badge

    dom.header.innerHTML = html;
  }

  function renderTagFilters() {
    if (!dom.tagFilters) return;
    const tags = ['all', 'night', 'history', 'nature', 'shrine', 'food', 'seasonal'];
    dom.tagFilters.innerHTML = tags.map(function(tag) {
      const label = t(TAG_LABELS[tag]) || tag;
      const icon = TAG_ICONS[tag] || '';
      return '<button class="sm-tag-btn' + (state.activeTags.size === 0 || state.activeTags.has(tag) ? ' active' : '') + 
             '" data-tag="' + tag + '"><span class="tag-icon">' + icon + '</span><span class="tag-label">' + label + '</span></button>';
    }).join('');

    // Event delegation - bind once on the container
    if (!dom.tagFilters.dataset.bound) {
      dom.tagFilters.dataset.bound = '1';
      dom.tagFilters.addEventListener('click', function(e) {
        const btn = e.target.closest('.sm-tag-btn');
        if (!btn) return;
        e.preventDefault();
        const tag = btn.getAttribute('data-tag');
        if (tag === 'all') {
          state.activeTags.clear();
        } else {
          if (state.activeTags.has(tag)) {
            state.activeTags.delete(tag);
          } else {
            state.activeTags.add(tag);
          }
        }
        renderGrid();
        renderTagFilters();
      });
    }
  }

  
  // Collect ALL spots from TOURISM_DATA and compute dynamic distances (cached)
  function getAllSpotsDynamic() {
    const stationKey = state.selectedStation;
    const uLat = state.userLat;
    const uLng = state.userLng;
    const now = Date.now();

    // Check cache validity
    if (_distCache.results &&
        _distCache.station === stationKey &&
        _distCache.userLat === uLat &&
        _distCache.userLng === uLng &&
        (now - _distCache.timestamp) < DIST_CACHE_TTL_MS) {
      return _distCache.results;
    }

    // Recompute if user moved significantly
    if (_distCache.results && stationKey && uLat !== null && uLng !== null) {
      const cachedCoord = getStationCoords()[_distCache.station];
      if (cachedCoord) {
        const moved = TourismProximity.getDistance(uLat, uLng, cachedCoord[0], cachedCoord[1]);
        if (moved < DIST_CACHE_MIN_MOVE_M) {
          return _distCache.results;
        }
      }
    }

    // Delegate to unified TourismProximity API
    let nearby = [];
    try {
      nearby = TourismProximity.getNearbySpotsByStation(stationKey, { radius: 3000, limit: 10 });
    } catch(e) {
      console.warn('[Sightseeing] getNearbySpotsByStation failed:', e);
    }

    const result = nearby.map(function(item) {
      const spot = item.spot;
      const spotLat = spot.coord ? spot.coord[0] : null;
      const spotLng = spot.coord ? spot.coord[1] : null;
      const sCoord = getStationCoords()[stationKey];
      const sLat = sCoord ? sCoord[0] : null;
      const isAcross = sLat ? isAcrossRiver(sLat, sCoord[1], spotLat, spotLng) : false;
      return {
        ...spot,
        stationKey: item.stationId || stationKey,
        distM: item.distance,
        distText: item.distanceText,
        isAcross: isAcross
      };
    });

    _distCache = {
      station: stationKey,
      userLat: uLat,
      userLng: uLng,
      results: result,
      timestamp: now
    };
    return result;
  }
function renderGrid() {
    if (!dom.grid) return;
    const stationKey = state.selectedStation;
    if (!stationKey) {
      dom.grid.innerHTML = '';
      if (dom.empty) dom.empty.classList.remove('hidden');
      return;
    }
    // Dynamic: collect all spots and compute distances from selected station
    const allSpots = getAllSpotsDynamic();
    const stationCoords = getStationCoords();
    const sCoord = stationCoords[stationKey];
    let spotList = allSpots;
    if (sCoord && sCoord[0] && sCoord[1]) {
      spotList = allSpots.filter(function(s) {
        return s.distM !== null && s.distM <= 3000;
      });
    }
    // Apply tag filter
    if (state.activeTags.size > 0 && !state.activeTags.has('all')) {
      spotList = spotList.filter(function(s) {
        return s.tags && s.tags.some(function(t) { return state.activeTags.has(t); });
      });
    }
    // Sort by distance
    spotList.sort(function(a, b) {
      if (a.distM === null) return 1;
      if (b.distM === null) return -1;
      return a.distM - b.distM;
    });
    if (spotList.length === 0) {
      dom.grid.innerHTML = '';
      if (dom.empty) dom.empty.classList.remove('hidden');
      return;
    }
    if (dom.empty) dom.empty.classList.add('hidden');
    // Limit to top 10
    spotList = spotList.slice(0, 10);

    if (state.activeTags.size > 0) {
      spotList = spotList.filter(function(s) {
        const tags = s.tags || [];
        return tags.indexOf('all') >= 0 || Array.from(state.activeTags).some(function(t) { return tags.indexOf(t) >= 0; });
      });
    }

    spotList = spotList.filter(function(s) { return !s.isAcross; });
    spotList.sort(function(a, b) {
      if (a.distM === null || a.distM === undefined) return 1;
      if (b.distM === null || b.distM === undefined) return -1;
      return a.distM - b.distM;
    });

    if (spotList.length === 0) {
      dom.grid.innerHTML = '';
      if (dom.empty) dom.empty.classList.remove('hidden');
      return;
    }

    dom.grid.innerHTML = spotList.map(function(s, idx) {
      const name = s.name || '';
      const desc = s.desc || '';
      const tags = s.tags || [];
      const image = s.image || '';

      const thumbHtml = image ? 
        '<img class="sm-thumb-img" src="' + encodeURI(image) + '" alt="' + name + '">' :
        '<span class="sm-thumb-icon">&#x2699;</span>';
      
      const distRowHtml = s.distText ? '<p class="sm-dist">' + s.distText + (s.dir ? ' · ' + s.dir : '') + '</p>' : '';
      
      const tagsHtml = tags.filter(function(tag) { return tag !== 'all'; }).map(function(tag) {
        return '<span>' + t('tourism.tag_' + tag) + '</span>';
      }).join('');

      const detailUrl = 'tourism-detail.html?station=' + encodeURIComponent(stationKey) + '&index=' + idx + '&name=' + encodeURIComponent(name);

      return '<a href="' + detailUrl + '" class="sm-card" data-index="' + idx + '">' +
        '<div class="sm-thumb">' + thumbHtml + '</div>' +
        '<div class="sm-body">' +
          '<h3>' + name + '</h3>' +
          distRowHtml +
          '<p class="sm-desc">' + desc + '</p>' +
          '<div class="sm-card-tags">' + tagsHtml + '</div>' +
        '</div>' +
      '</a>';
    }).join('');
  }

  function renderAll() {
    cacheDom();
    renderHeader();
    renderTagFilters();
    renderGrid();
    updateStationDisplay();
  }
  
  function updateStationDisplay() {
    if (!dom.stationDisplay) return;
    if (state.locStatus === 'error') {
      dom.stationDisplay.textContent = t('tourism.loc_error');
      dom.stationDisplay.classList.remove('sm-station-detected');
      return;
    }
    if (state.selectedStation) {
    if (state.selectedStation) {
      var _snLabel = state.selectedStation;
      if (window.RailwayDB && window.RailwayDB.resolveStationName) {
        _snLabel = window.RailwayDB.resolveStationName(state.selectedStation, state.lang) || state.selectedStation;
      }
      const stationLabel = _snLabel;
      }
      const stationLabel = _snLabel;
      dom.stationDisplay.textContent = stationLabel;
      dom.stationDisplay.classList.add('sm-station-detected');
    } else {
      dom.stationDisplay.textContent = t('tourism.locating');
      dom.stationDisplay.classList.remove('sm-station-detected');
    }
  }

  function bindEvents() {
    if (dom.relocateBtn) {
      dom.relocateBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        hideStationPicker();
        initLocation();
      });
    }
    if (dom.stationPicker) {
      dom.stationPicker.addEventListener('click', function(e) {
        var btn = e.target.closest('.sm-picker-btn');
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        var station = btn.getAttribute('data-station');
        if (station) {
          hideStationPicker();
          setStation(station);
        }
      });
    }
    if (dom.locationBar) {
      dom.locationBar.style.cursor = 'pointer';
      dom.locationBar.addEventListener('click', function(e) {
        if (e.target.closest('#smRelocateBtn')) return;
        if (state.locStatus === 'error' || state.locStatus === 'found') {
          if (dom.stationPicker.classList.contains('hidden')) {
            showStationPicker();
          } else {
            hideStationPicker();
          }
        }
      });
    }
  }

  // Station picker shown when geolocation is unavailable
  function showStationPicker() {
    if (!dom.stationPicker) return;
    var html = '<div class="sm-picker-label">' + t('tourism.choose_station') + '</div><div class="sm-picker-list">';
    var _stations = getMajorStations();
    for (var i = 0; i < _stations.length; i++) {
      var s = _stations[i];
      var label = s;
      if (window.RailwayDB && window.RailwayDB.getNameMap) {
        var nm = window.RailwayDB.getNameMap();
        if (nm[s]) { label = nm[s]; }
        else { for (var _k in nm) { if (nm[_k] === s) { label = _k; break; } } }
      }
      html += '<button class="sm-picker-btn" data-station="' + s + '">' + label + '</button>';
    }
    html += '</div>';
    dom.stationPicker.innerHTML = html;
    dom.stationPicker.classList.remove('hidden');
  }

  function hideStationPicker() {
    if (dom.stationPicker) dom.stationPicker.classList.add('hidden');
  }

  function initLocation() {
    state.locStatus = 'locating';
    renderHeader();
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      state.locStatus = 'error';
      state.selectedStation = (getMajorStations().length > 0) ? getMajorStations()[0] : 'Shinjuku';
      state.autoDetected = false;
      renderAll();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      function(position) {
        state.userLat = position.coords.latitude;
        state.userLng = position.coords.longitude;
        findNearestStation();
      },
      function(err) {
        // Geolocation failed or denied - show station picker
        if (err.code === err.PERMISSION_DENIED || err.code === err.POSITION_UNAVAILABLE) {
          state.locStatus = 'error';
          state.selectedStation = (getMajorStations().length > 0) ? getMajorStations()[0] : 'Shinjuku';
          state.autoDetected = false;
          renderAll();
        } else {
          // No geolocation API available - show picker directly
          state.locStatus = 'error';
          state.selectedStation = (getMajorStations().length > 0) ? getMajorStations()[0] : 'Shinjuku';
          state.autoDetected = false;
          renderAll();
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }

  function findNearestStation() {
    var nearest = TourismProximity.getNearestStation(state.userLat, state.userLng);
    if (nearest) {
      state.selectedStation = nearest.stationId;
      state.autoDetected = true;
      state.locStatus = 'found';
      renderAll();
    } else {
      state.locStatus = 'error';
      renderAll();
    }
  }

  function init(config) {
    config = config || {};
    cacheDom();
    if (config.lang) state.lang = config.lang;
    if (config.station) {
      state.selectedStation = config.station;
      state.autoDetected = false;
    }
    bindEvents();
    updateStationDisplay();
    renderAll();
    setTimeout(initLocation, 100);
  }

  function setLang(lang) {
    state.lang = lang;
    renderAll();
  }

  function setStation(stationKey) {
    const stationCoords = getStationCoords();
    if (!stationCoords[stationKey]) return;
    state.selectedStation = stationKey;
    state.autoDetected = false;
    state.activeTags.clear();
    renderAll();
  }

  window.SightseeingModule = { init: init, setLang: setLang, setStation: setStation };

  if (typeof window.onLanguageChange === 'function') {
    window.onLanguageChange(function() { renderAll(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();









