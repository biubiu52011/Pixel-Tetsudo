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

  // 4.3.561: 无图景点按类别显示语义图标（替代统一齿轮）
  const SPOT_ICON_BY_TAG = {
    shrine: '&#x26E9;&#xFE0F;',
    history: '&#x1F3DB;&#xFE0F;',
    nature: '&#x1F333;',
    food: '&#x1F35C;',
    seasonal: '&#x1F386;',
    night: '&#x1F319;',
    shopping: '&#x1F6CD;&#xFE0F;',
    park: '&#x1F332;',
    landmark: '&#x1F5FC;',
    modern: '&#x1F3D9;&#xFE0F;'
  };
  function iconForTags(tags) {
    if (Array.isArray(tags)) {
      for (var i = 0; i < tags.length; i++) {
        if (SPOT_ICON_BY_TAG[tags[i]]) return SPOT_ICON_BY_TAG[tags[i]];
      }
    }
    return '&#x2699;';
  }

  function getMajorStations() {
    if (window.TOURISM_STATIONS && window.TOURISM_STATIONS.length > 0) return Array.from(window.TOURISM_STATIONS);
    // 4.3.559: 按 3km 内景点数降序取前 12（替换旧键序遍历——键序 + 劣质估算坐标会导致假站/漏真站）
    // 排除路面电车（都电荒川线）：其停留场无出入口概念，与出口算法不匹配
    var tramIds = {};
    try {
      // 4.3.560: 线上 https 场景 db-loader 从 railway_data.json 加载（applyData 不设置 window.RAILWAY_DATA），
      // 必须用 UNIFIED_LINES（applyData 已设置 = data.lines）才能正确排除都电荒川线停留场
      var arakawaLine = (window.UNIFIED_LINES && window.UNIFIED_LINES['Arakawa'])
        || (window.RAILWAY_DATA && window.RAILWAY_DATA.lines && window.RAILWAY_DATA.lines['Arakawa']);
      if (arakawaLine && arakawaLine.stations) {
        arakawaLine.stations.forEach(function(sid) { tramIds[sid] = true; });
      }
    } catch (e) {}
    var withSpots = [];
    try {
      Object.keys(getStationCoords()).forEach(function(k) {
        if (tramIds[k]) return;
        var cnt = 0, near = Infinity;
        try {
          var nearby = (window.TourismProximity && window.TourismProximity.getNearbySpotsByStation)
            ? window.TourismProximity.getNearbySpotsByStation(k, { radius: 3000, limit: 30 }) : [];
          cnt = nearby.length;
          if (cnt > 0 && nearby[0]) near = nearby[0].distance;
        } catch (e) { return; }
        if (cnt > 0) withSpots.push({ id: k, cnt: cnt, near: near });
      });
      // 4.3.559: 景点数降序；景点数相同 → 距最近景点更近的站优先（避免北千住等中心站被并列截断）
      withSpots.sort(function(a, b) {
        if (b.cnt !== a.cnt) return b.cnt - a.cnt;
        return a.near - b.near;
      });
      withSpots = withSpots.slice(0, 12).map(function(x) { return x.id; });
    } catch (e) {}
    if (withSpots.length > 0) return withSpots;
    // Last-resort fallback (4.3.557): derive default stations FROM the spot
    // catalogue instead of hard-coding one. 'Shinjuku' has no registered spots,
    // so it left the tourism grid blank whenever the coordinate index was not
    // ready yet. Reverse-lookup each spot's nearest station guarantees a
    // default that actually has data.
    var fromSpots = [];
    try {
      var spots = window.TOURISM_SPOTS || [];
      for (var i = 0; i < spots.length && fromSpots.length < 12; i++) {
        var sp = spots[i];
        if (sp && sp.coord && sp.coord.length >= 2 && window.TourismProximity && window.TourismProximity.getNearestStation) {
          var ns = window.TourismProximity.getNearestStation(sp.coord[0], sp.coord[1]);
          if (ns && ns.stationId && fromSpots.indexOf(ns.stationId) < 0) fromSpots.push(ns.stationId);
        }
      }
    } catch(e) {}
    return fromSpots.length > 0 ? fromSpots : ['Shinjuku'];
  }
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
    dom.locationBar = document.querySelector('.sm-location-bar');
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
      nearby = TourismProximity.getNearbySpotsByStation(stationKey, { radius: 3500, limit: 30 });
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
        exitDirection: item.exitDirection,
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
  // Localize station exit direction labels (東口/西口/南口/北口/駅直結)
  function localizeExitDirection(dir) {
    if (!dir) return '';
    if (dir === '駅直結') return t('tourism.station_direct');
    var dirKeys = { '東口': 'tourism.east', '西口': 'tourism.west', '南口': 'tourism.south', '北口': 'tourism.north' };
    var key = dirKeys[dir];
    if (key) {
      var lang = state.lang || 'ja';
      var suffix = t('tourism.exit_suffix');
      return (lang === 'en') ? t(key) + ' ' + suffix : t(key) + suffix;
    }
    return dir;
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
    // Limit to top 30 (39 registered spots; keep far sights like Asakusa/Skytree visible)
    spotList = spotList.slice(0, 30);

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

    var _escSpot = window.escapeHtml || function(x) { return String(x); };
    dom.grid.innerHTML = spotList.map(function(s, idx) {
      const lang = state.lang || 'ja';
      const name = (s.name_i18n && s.name_i18n[lang]) || s.name || '';
      const desc = (s.desc_i18n && s.desc_i18n[lang]) || s.desc || '';
      const tags = s.tags || [];
      const image = s.image || '';

      const thumbHtml = image ? 
        '<img class="sm-thumb-img" src="' + encodeURI(image) + '" alt="' + _escSpot(name) + '">' :
        '<span class="sm-thumb-icon">' + iconForTags(tags) + '</span>';
      
      // Localize distance text with current language (cached distanceText is ja-only)
      let distText = '';
      if (s.distM !== null && s.distM !== undefined && !isNaN(s.distM)) {
        distText = TourismProximity.formatWalkMinutes(s.distM, { at_station: t('tourism.at_station'), min_walk: t('tourism.min_walk') }) || '';
      }
      if (!distText) distText = s.distText || '';
      // Localize exit direction (東口/西口/南口/北口/駅直結)
      let exitText = localizeExitDirection(s.exitDirection || '');
      // Dedupe: at-station distance text already says 駅直結 in some languages
      if (distText && exitText && distText === exitText) exitText = '';
      const distRowHtml = (distText || exitText) ? '<p class="sm-dist">' + (distText ? _escSpot(distText) : '') + (distText && exitText ? ' · ' : '') + (exitText ? _escSpot(exitText) : '') + '</p>' : '';
      
      const tagsHtml = tags.filter(function(tag) { return tag !== 'all'; }).map(function(tag) {
        return '<span>' + t('tourism.tag_' + tag) + '</span>';
      }).join('');

      const detailUrl = 'tourism-detail.html?station=' + encodeURIComponent(stationKey) + '&index=' + idx + '&name=' + encodeURIComponent(name);

      return '<a href="' + detailUrl + '" class="sm-card" data-index="' + idx + '">' +
        '<div class="sm-thumb">' + thumbHtml + '</div>' +
        '<div class="sm-body">' +
          '<h3>' + _escSpot(name) + '</h3>' +
          distRowHtml +
          '<p class="sm-desc">' + _escSpot(desc) + '</p>' +
          '<div class="sm-card-tags">' + tagsHtml + '</div>' +
        '</div>' +
      '</a>';
    }).join('');
  }

  function renderAll() {
    cacheDom();
    if (dom.relocateBtn) dom.relocateBtn.classList.remove('loading');
    renderHeader();
    renderTagFilters();
    renderGrid();
    updateStationDisplay();
  }
  
  function updateStationDisplay() {
    if (!dom.stationDisplay) return;
    if (state.locStatus === 'error') {
      // Geolocation failed: if a station is still shown (default/manual), say so explicitly
      if (state.selectedStation) {
        var _defLabel = state.selectedStation;
        if (window.RailwayDB && window.RailwayDB.resolveStationName) {
          _defLabel = window.RailwayDB.resolveStationName(state.selectedStation, state.lang) || state.selectedStation;
        }
        dom.stationDisplay.textContent = (t('tourism.loc_error_default') || '').replace('{station}', _defLabel);
      } else {
        dom.stationDisplay.textContent = t('tourism.loc_error');
      }
      dom.stationDisplay.classList.remove('sm-station-detected');
      return;
    }
    if (state.selectedStation) {
      var _snLabel = state.selectedStation;
      if (window.RailwayDB && window.RailwayDB.resolveStationName) {
        _snLabel = window.RailwayDB.resolveStationName(state.selectedStation, state.lang) || state.selectedStation;
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
      if (window.RailwayDB && window.RailwayDB.resolveStationName) {
        label = window.RailwayDB.resolveStationName(s, state.lang) || s;
      }
      html += '<button class="sm-picker-btn" data-station="' + s + '">' + (window.escapeHtml ? window.escapeHtml(label) : label) + '</button>';
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
    if (dom.relocateBtn) dom.relocateBtn.classList.add('loading');
    renderHeader();
    var guard = setTimeout(function() {
      if (state.locStatus === 'locating') {
        state.locStatus = 'error';
        if (!state.selectedStation) {
          state.selectedStation = (getMajorStations().length > 0) ? getMajorStations()[0] : 'Shinjuku';
        }
        state.autoDetected = false;
        renderAll();
      }
    }, 4000);
    function locFallback() {
      state.locStatus = 'error';
      if (!state.selectedStation) {
        state.selectedStation = (getMajorStations().length > 0) ? getMajorStations()[0] : 'Shinjuku';
      }
      state.autoDetected = false;
      renderAll();
    }
    // 4.3.561: file:// 本地打开无 geolocation 权限，直接降级（不等 8 秒）
    if (typeof location !== 'undefined' && location.protocol === 'file:') {
      clearTimeout(guard);
      locFallback();
      return;
    }
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      clearTimeout(guard);
      locFallback();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      function(position) {
        clearTimeout(guard);
        state.userLat = position.coords.latitude;
        state.userLng = position.coords.longitude;
        findNearestStation();
      },
      function(err) {
        clearTimeout(guard);
        locFallback();
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
    if (dom.relocateBtn) {
      dom.relocateBtn.title = t('tourism.relocate');
      dom.relocateBtn.setAttribute('aria-label', t('tourism.relocate'));
    }
    state.lang = config.lang || window.currentLang || 'ja';
    if (config.station) {
      state.selectedStation = config.station;
      state.autoDetected = false;
    }
    bindEvents();
    updateStationDisplay();
    renderAll();
    // 4.3.560: 等待数据就绪后再定位——数据未就绪时 getMajorStations() 兜底 ['Shinjuku']，
    // 且 db-loader 无数据就绪事件通知，导致默认站永远锁定无景点的 Shinjuku。
    // 就绪判定：DataLoader.isLoaded() 或 STATION_COORDS 已有键；最多等 6s（24 次 x 250ms），超时仍走 initLocation。
    var _attempt = 0;
    function _dataReady() {
      return (window.DataLoader && window.DataLoader.isLoaded && window.DataLoader.isLoaded())
        || (window.STATION_COORDS && Object.keys(window.STATION_COORDS).length > 0);
    }
    function _startWhenReady() {
      if (_dataReady() || ++_attempt >= 24) {
        setTimeout(initLocation, 50);
        return;
      }
      setTimeout(_startWhenReady, 250);
    }
    _startWhenReady();
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
    state.locStatus = 'found';
    state.activeTags.clear();
    renderAll();
  }

  window.SightseeingModule = { init: init, setLang: setLang, setStation: setStation };

  if (typeof window.onLanguageChange === 'function') {
    window.onLanguageChange(function() {
      state.lang = window.currentLang || 'ja';
      renderAll();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();









