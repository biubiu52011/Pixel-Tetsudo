/**
 * Sightseeing Module - Coordinate-based Recommendation
 */

(function() {
  'use strict';
  function getStationCoords() { return window.STATION_COORDS || {}; }

  const TAG_LABELS = {
    all: 'tourism.tag_all',
    shrine: 'tourism.tag_shrine',
    history: 'tourism.tag_history',
    shopping: 'tourism.tag_shopping',
    nature: 'tourism.tag_nature',
    food: 'tourism.tag_food',
    landmark: 'tourism.tag_landmark',
    seasonal: 'tourism.tag_seasonal',
    park: 'tourism.tag_park',
    modern: 'tourism.tag_modern'
  };

  // 4.3.572: 无图景点按类别显示概括性文字（替代 emoji 图标——用户指示"别出现拉面这种"）
  function labelForTags(tags) {
    if (Array.isArray(tags)) {
      for (var i = 0; i < tags.length; i++) {
        if (tags[i] !== 'all' && TAG_LABELS[tags[i]]) return t(TAG_LABELS[tags[i]]) || tags[i];
      }
    }
    return '';
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
    dom.header = document.querySelector('.sm-header');
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
    // 4.3.575: 分类按数据量排序（night 数据为 0 已移除——点开即空白；未来补夜景数据可加回）
    const tags = ['all', 'shrine', 'history', 'shopping', 'nature', 'food', 'landmark', 'seasonal', 'park', 'modern'];
    dom.tagFilters.innerHTML = tags.map(function(tag) {
      const label = t(TAG_LABELS[tag]) || tag;
      // 4.3.571: 标签纯文字（emoji 图标已移除）
      return '<button class="sm-tag-btn' + (state.activeTags.size === 0 || state.activeTags.has(tag) ? ' active' : '') + 
             '" data-tag="' + tag + '"><span class="tag-label">' + label + '</span></button>';
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
    // 4.3.575: 有图优先 + 距离排序（无图卡压缩缩略区后排后，避免列表前部出现空白块）
    spotList.sort(function(a, b) {
      const ai = a.image ? 0 : 1;
      const bi = b.image ? 0 : 1;
      if (ai !== bi) return ai - bi;
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

      // 4.3.575: 无图卡片缩略区压缩（sm-thumb-noimg 56px 类别文字卡，替代 140px 空白块）
      const thumbHtml = image ? 
        '<img class="sm-thumb-img" src="' + encodeURI(image) + '" alt="' + _escSpot(name) + '">' :
        '<span class="sm-thumb-icon">' + labelForTags(tags) + '</span>';
      
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
        '<div class="sm-thumb' + (image ? '' : ' sm-thumb-noimg') + '">' + thumbHtml + '</div>' +
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
    // 4.3.564: 彻底取消手动选站（站选择器）——观光区仅展示定位附近景点，定位失败不提供备选站
    if (dom.relocateBtn) {
      dom.relocateBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        initLocation();
      });
    }
  }

  function initLocation() {
    state.locStatus = 'locating';
    if (dom.relocateBtn) dom.relocateBtn.classList.add('loading');
    renderHeader();
    var guard = setTimeout(function() {
      if (state.locStatus === 'locating') {
        state.locStatus = 'error';
        // 4.3.564: 定位失败不给备选站——保持"定位失败"状态，用户点刷新重试
        state.autoDetected = false;
        renderAll();
      }
    }, 4000);
    function locFallback() {
      state.locStatus = 'error';
      // 4.3.564: 定位失败不给备选站
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

  // 4.3.564: 手动选站已彻底取消（setStation 移除）
  window.SightseeingModule = { init: init, setLang: setLang };

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









