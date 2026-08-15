/**
 * Sightseeing Module - Coordinate-based Recommendation
 */

(function() {
  'use strict';

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

  function cacheDom() {
    dom.container = document.getElementById('smModule');
    dom.grid = document.getElementById('smGrid');
    dom.tagFilters = document.getElementById('smTagFilters');
    dom.empty = document.getElementById('smEmpty');
    dom.autoBadge = document.getElementById('smAutoBadge');
    dom.stationDisplay = document.getElementById('smStationDisplay');
    dom.relocateBtn = document.getElementById('smRelocateBtn');
    dom.header = document.querySelector('.sm-header');
  }

  function t(key) {
    return (typeof window.t === 'function') ? window.t(key) : key;
  }

  function getSPOTS() { return window.TOURISM_DATA || {}; }
  function getStationCoords() { return window.STATION_COORDS || {}; }

  function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function formatDistance(meters) {
    if (meters < 1000) return Math.round(meters) + 'm';
    return (meters / 1000).toFixed(1) + 'km';
  }

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
    if (state.autoDetected && state.selectedStation) {
      const stationLabel = t('station_names.' + state.selectedStation) || state.selectedStation;
      html += '<div id="smAutoBadge" class="sm-auto-badge"><span>' + 
              t('tourism.auto_detected') + ': ' + stationLabel + '</span></div>';
    }
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

  function renderGrid() {
    if (!dom.grid) return;
    const spots = getSPOTS();
    const stationKey = state.selectedStation;
    const station = spots[stationKey];
    if (!station) {
      dom.grid.innerHTML = '';
      if (dom.empty) dom.empty.classList.remove('hidden');
      return;
    }
    
    if (dom.empty) dom.empty.classList.add('hidden');
    
    let spotList = (station.spots || []).map(function(spot, idx) {
      const distText = spot.dist || '';
      const dir = spot.dir || '';
      const isAcross = distText ? isAcrossRiver(station.coord[0], station.coord[1], spot.coord[0], spot.coord[1]) : false;
      return { ...spot, distText, dir, isAcross, idx };
    });

    if (state.activeTags.size > 0) {
      spotList = spotList.filter(function(s) {
        const tags = s.tags || [];
        return tags.indexOf('all') >= 0 || Array.from(state.activeTags).some(function(t) { return tags.indexOf(t) >= 0; });
      });
    }

    spotList = spotList.filter(function(s) { return !s.isAcross; });
    spotList.sort(function(a, b) { return (a.distText || '').localeCompare(b.distText || ''); });

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
      const distBadge = s.distText ? '<span class="sm-dist-badge">' + s.distText + '</span>' : '';
      
      const thumbHtml = image ? 
        '<img class="sm-thumb-img" src="' + image + '" alt="' + name + '">' :
        '<span class="sm-thumb-icon">&#x2699;</span>';
      
      const distRowHtml = s.distText ? '<p class="sm-dist">' + s.distText + (s.dir ? ' · ' + s.dir : '') + '</p>' : '';
      
      const tagsHtml = tags.filter(function(t) { return t !== 'all'; }).map(function(t) {
        return '<span>' + t('tourism.tag_' + t) + '</span>';
      }).join('');

      const detailUrl = 'tourism-detail.html?station=' + encodeURIComponent(stationKey) + '&index=' + idx;

      return '<a href="' + detailUrl + '" class="sm-card" data-index="' + idx + '">' +
        '<div class="sm-thumb">' + thumbHtml + distBadge + '</div>' +
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
    if (state.autoDetected && state.selectedStation) {
      const stationLabel = t('station_names.' + state.selectedStation) || state.selectedStation;
      dom.stationDisplay.textContent = stationLabel;
      dom.stationDisplay.classList.add('sm-station-detected');
    } else {
      dom.stationDisplay.textContent = t('tourism.locating') + '...';
      dom.stationDisplay.classList.remove('sm-station-detected');
    }
  }

  function bindEvents() {
    if (dom.relocateBtn) {
      dom.relocateBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        initLocation();
      });
    }
  }

  function initLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      const spots = getSPOTS();
      state.selectedStation = Object.keys(spots)[0] || 'Asakusa';
      renderAll();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      function(position) {
        state.userLat = position.coords.latitude;
        state.userLng = position.coords.longitude;
        findNearestStation();
      },
      function(error) {
        console.log('[Sightseeing] Location denied:', error.message);
        const spots = getSPOTS();
        state.selectedStation = Object.keys(spots)[0] || 'Asakusa';
        renderAll();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }

  function findNearestStation() {
    // Use station-coords.js for all stations
    var minDistance = Infinity;
    var nearestStation = null;
    var coords = getStationCoords();
    for (const stationKey of Object.keys(coords)) {
      const coord = coords[stationKey];
      const dist = haversineDistance(state.userLat, state.userLng, coord[0], coord[1]);
      if (dist < minDistance) { minDistance = dist; nearestStation = stationKey; }
    }
    if (nearestStation) {
      state.selectedStation = nearestStation;
      state.autoDetected = true;
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
    setTimeout(initLocation, 500);
  }

  function setLang(lang) {
    state.lang = lang;
    renderAll();
  }

  function setStation(stationKey) {
    const spots = getSPOTS();
    if (!spots[stationKey]) return;
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

