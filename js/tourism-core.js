/*
 * Tourism Detail Core (4.3.802) - 三类型详情页公共底座
 * 由 tourism-event.js / tourism-spot.js / tourism-shop.js 共享：
 *   - 数据加载流程（DataLoader / 轮询兜底）
 *   - 条目查找 / 距离·出站指引计算（跨站最优出口融合口径 4.3.621）
 *   - 公共章节构建（about / map / 徽章 / 字段）
 *   - 地图初始化（MapLibre + MapTiler → Leaflet 兜底）
 *   - 翻译 / 语言切换
 * 三类型各自的渲染（快速信息条 / 信息网格 / 正文顺序 / 菜单板块）在三个类型 JS 中独立实现。
 */
(function() {
  "use strict";

  var THEME_GRADIENTS = {
    history:  "linear-gradient(135deg, #8B4513 0%, #D2691E 100%)",
    nature:   "linear-gradient(135deg, #228B22 0%, #32CD32 100%)",
    food:     "linear-gradient(135deg, #FF6347 0%, #FFA500 100%)",
    shrine:   "linear-gradient(135deg, #DC143C 0%, #FF6B6B 100%)",
    night:    "linear-gradient(135deg, #191970 0%, #4169E1 100%)",
    seasonal: "linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%)",
    event:    "linear-gradient(135deg, #FF4500 0%, #FFD700 100%)",
    museum:   "linear-gradient(135deg, #4A4A4A 0%, #8B8B8B 100%)",
    landmark: "linear-gradient(135deg, #008803 0%, #00AA00 100%)",
    park:     "linear-gradient(135deg, #2E8B57 0%, #3CB371 100%)",
    local:    "linear-gradient(135deg, #8B7355 0%, #D2B48C 100%)",
    shopping: "linear-gradient(135deg, #FF6347 0%, #FFA500 100%)",
    mall:     "linear-gradient(135deg, #7B68EE 0%, #9370DB 100%)",
    temple:   "linear-gradient(135deg, #B8860B 0%, #DAA520 100%)",
    default:  "linear-gradient(135deg, #008803 0%, #006600 100%)"
  };

  var MAPTILER_KEY = 'tYRNv4akrEAKTL5ORzUm';  // MapTiler 免费 key（origin 白名单：GitHub Pages + 本地开发端口 8017，防盗用）

  var state = {
    currentSpotIndex: 0,
    allSpots: [],
    currentStationKey: null,
    scopedSpots: [],
    lang: window.currentLang || 'ja'
  };

  function t(key) {
    return (typeof window.t === "function") ? window.t(key) : key;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function getStationLabel(key) {
    if (window.RailwayDB && window.RailwayDB.resolveStationName) {
      return window.RailwayDB.resolveStationName(key, state.lang) || key;
    }
    return key;
  }

  // Get spot display name based on language
  function getSpotName(spot) {
    if (!spot) return '';
    var l = state.lang || 'ja';
    if (spot.name_i18n && spot.name_i18n[l]) return spot.name_i18n[l];
    if (spot['name_' + l]) return spot['name_' + l];
    return '';
  }

  // Get i18n field value with fallback
  function getI18nField(spot, field) {
    if (!spot) return '';
    var i18nField = field + '_i18n';
    if (spot[i18nField] && spot[i18nField][state.lang]) return spot[i18nField][state.lang];
    if (spot[i18nField] && spot[i18nField].ja) return spot[i18nField].ja;
    return spot[field] || '';
  }

  // Translate common Japanese terms in hours/fee fields
  function translateCommonTerms(text) {
    if (!text) return text;
    var translations = {
      '無料': { zh: '免费', en: 'Free', ko: '무료' },
      '年中無休': { zh: '全年无休', en: 'Open year-round', ko: '연중무휴' },
      '定休日': { zh: '定期休息日', en: 'Regular holiday', ko: '정기휴일' },
      '火曜定休': { zh: '周二休息', en: 'Closed Tuesdays', ko: '화요일 휴무' },
      '外観のみ公開': { zh: '仅外观开放', en: 'Exterior only', ko: '외관만 공개' },
      '内部非公開': { zh: '内部不开放', en: 'Interior not open', ko: '내부 비공개' },
      '24時間営業': { zh: '24小时营业', en: 'Open 24 hours', ko: '24시간 영업' },
      '24時間開放': { zh: '24小时开放', en: 'Open 24 hours', ko: '24시간 개방' }
    };
    var result = text;
    Object.keys(translations).forEach(function(term) {
      if (translations[term][state.lang]) {
        result = result.replace(new RegExp(term, 'g'), translations[term][state.lang]);
      }
    });
    return result;
  }

  // Get all spots from global TOURISM_SPOTS pool (no station binding)
  function getAllSpots() {
    return window.TOURISM_SPOTS || [];
  }

  // Get scoped spots: global pool, sorted by distance from station if stationKey set
  function getScopedSpots() {
    if (state.currentStationKey && window.TourismProximity) {
      var nearby = TourismProximity.getNearbySpotsByStation(state.currentStationKey, { radius: 50000, limit: 100 });
      if (nearby && nearby.length > 0) {
        return nearby.map(function(item) { return item.spot; });
      }
    }
    return state.allSpots;
  }

  // Find spot by name or index
  function findSpotByName(name) {
    if (!name || state.allSpots.length === 0) return null;
    return state.allSpots.find(function(s) {
      return s.name === name
        || (s.name_i18n && (s.name_i18n[state.lang] === name || s.name_i18n.ja === name || s.name_i18n.zh === name || s.name_i18n.en === name))
        || (s['name_' + state.lang] === name) || (s.name_ja === name) || (s.name_zh === name);
    }) || null;
  }

  function getGradientForTags(tags) {
    if (!tags || tags.length === 0) return THEME_GRADIENTS.default;
    for (var i = 0; i < tags.length; i++) {
      if (THEME_GRADIENTS[tags[i]]) return THEME_GRADIENTS[tags[i]];
    }
    return THEME_GRADIENTS.default;
  }

  function getHeroClassForGradient(gradient) {
    var norm = gradient.replace(/\s+/g, " ").trim();
    var order = ["default","landmark","history","nature","food","shrine","night","seasonal","event","museum","park","local","temple","mall"];
    for (var i = 0; i < order.length; i++) {
      var ref = THEME_GRADIENTS[order[i]];
      if (ref && norm.indexOf(ref.replace(/\s+/g, " ").trim().substring(0, 25)) >= 0) {
        return "article-hero--" + order[i];
      }
    }
    return "article-hero--landmark";
  }

  // 条目三类型判定（活动/店铺/景点）——列表路由与详情渲染共用
  // 4.3.817: 玩乐·体验（play）归店铺口径（用户指示：吃喝玩乐都算店，百货商店按景点）
  function getSpotType(spot) {
    if (window.TourismType && window.TourismType.getSpotType) {
      return window.TourismType.getSpotType(spot);
    }
    var tags = (spot && spot.tags) || [];
    if (tags.indexOf('event') >= 0) return 'event';
    if (tags.indexOf('food') >= 0 || tags.indexOf('shopping') >= 0 || tags.indexOf('play') >= 0) return 'shop';
    return 'spot';
  }

  // 距离/出站指引计算（4.3.621 跨站最优出口融合口径）→ {stationName, distMain, distSub, distText}
  function computeDistance(spot, stationKey) {
    var ctx = { stationName: '', distText: '', distMain: '', distSub: '' };
    var mapLat = (spot.coord && spot.coord[0]) || 35.71;
    var mapLng = (spot.coord && spot.coord[1]) || 139.80;
    var stationCoords = window.STATION_COORDS || {};
    var spotStation = spot.station || state.currentStationKey || '';
    if (stationKey || state.currentStationKey) {
      ctx.stationName = getStationLabel(stationKey || state.currentStationKey);
    } else if (spotStation && stationCoords[spotStation]) {
      ctx.stationName = getStationLabel(spotStation);
    }
    var exitReco = null;
    if (window.TourismProximity && TourismProximity.recommendExitStation) {
      exitReco = TourismProximity.recommendExitStation(mapLat, mapLng, stationKey || state.currentStationKey || null, 2000);
    }
    if (exitReco && exitReco.best) {
      var _bestLabel = getStationLabel(exitReco.best.stationId);
      var _bestDistM = TourismProximity.formatDistance(exitReco.best.distance);
      ctx.distMain = _bestLabel + ' ' + exitReco.best.exitName + '・' + (_bestDistM || '');
      if (exitReco.best.distance >= 100) {
        ctx.distSub = TourismProximity.formatWalkMinutes(exitReco.best.distance, { at_station: t('detail.at_station'), min_walk: t('detail.min_walk') }) || '';
      }
    }
    if (!ctx.distMain) {
      if (spotStation && stationCoords[spotStation]) {
        var sc = stationCoords[spotStation];
        var sLat = sc[0] || 0, sLng = sc[1] || 0;
        if (sLat && sLng) {
          var dist = TourismProximity.getDistance(sLat, sLng, mapLat, mapLng);
          ctx.distText = TourismProximity.formatWalkMinutes(dist, { at_station: t('detail.at_station'), min_walk: t('detail.min_walk') });
        }
      }
      if (!ctx.distText && spot.dist) ctx.distText = spot.dist;
    }
    return ctx;
  }

  // 快速信息条·距离项（三种类型共用）
  function distValueHtml(dist) {
    return dist.distMain
      ? '<span class="qi-main">' + escapeHtml(dist.distMain) + '</span>' + (dist.distSub ? '<br><span class="qi-sub">' + escapeHtml(dist.distSub) + '</span>' : '')
      : escapeHtml(dist.distText || t('detail.near_station'));
  }

  // 公共上下文：字段/徽章/章节/坐标（类型 JS 基于它构建专属部分）
  function buildContext(spot, stationKey) {
    var spotName = getSpotName(spot);
    var desc = (spot.desc_i18n && spot.desc_i18n[state.lang]) || spot['desc_' + state.lang] || spot.desc || '';
    var tags = spot.tags || ['all'];
    var gradient = getGradientForTags(tags);
    var coord = spot.coord || [35.71, 139.80];
    var mapLat = coord[0] || 35.71;
    var mapLng = coord[1] || 139.80;
    var dist = computeDistance(spot, stationKey);
    var imageHtml = spot.image
      ? '<div class="article-hero-img"><img src="' + escapeHtml(spot.image) + '" alt="' + escapeHtml(spotName) + '"></div>'
      : '';
    var tagsHtml = '';
    for (var i = 0; i < tags.length; i++) {
      var tagKey = 'tourism.tag_' + tags[i].replace(/-/g, '_');
      tagsHtml += '<span class="tag-badge ' + escapeHtml(tags[i]) + '">' + escapeHtml(t(tagKey)) + '</span>';
    }
    var spotType = getSpotType(spot);
    var typeBadge = '<span class="type-badge type-badge--' + spotType + '">' + escapeHtml(t('detail.type_' + spotType)) + '</span>';
    var stationBadge = dist.stationName
      ? '<span class="station-badge"><img src="../images/icon-metro-station.svg" alt="" class="station-icon">' + escapeHtml(dist.stationName) + '</span>'
      : '';
    var spotHours = getI18nField(spot, 'hours') || t('detail.i18n_missing');
    spotHours = translateCommonTerms(spotHours);
    var spotFee = getI18nField(spot, 'fee') || t('detail.i18n_missing');
    spotFee = translateCommonTerms(spotFee);
    var spotBestTime = getI18nField(spot, 'bestTime') || t('detail.fallback_best_time');
    spotBestTime = translateCommonTerms(spotBestTime);
    var spotAddress = spot.address || '';
    var addressRow = spotAddress
      ? '<div class="info-row info-row--full"><span class="info-label">' + t('detail.address') + '</span><span class="info-value">' + escapeHtml(spotAddress) + '</span></div>'
      : '';
    var aboutSection = '<div class="article-section">'
      + '<h3 class="section-heading">' + t('detail.about') + '</h3>'
      + '<p class="article-text">' + escapeHtml(desc) + '</p>'
      + '</div>';
    var mapHtml = '<div id="tourismMap" class="map-container"><div class="map-loading">' + t('detail.map_loading') + '</div></div>';
    var mapSection = '<div class="article-section">'
      + '<h3 class="section-heading">' + t('detail.location') + '</h3>'
      + '<div class="map-info">' + mapHtml + '</div>'
      + '</div>';
    return {
      spot: spot, spotName: spotName, desc: desc, tags: tags, gradient: gradient,
      mapLat: mapLat, mapLng: mapLng, dist: dist,
      imageHtml: imageHtml, tagsHtml: tagsHtml, typeBadge: typeBadge, stationBadge: stationBadge,
      spotHours: spotHours, spotFee: spotFee, spotBestTime: spotBestTime, spotAddress: spotAddress, addressRow: addressRow,
      aboutSection: aboutSection, mapSection: mapSection,
      heroClass: getHeroClassForGradient(gradient)
    };
  }

  // 组装框架（hero + 快速信息条 + 正文）并挂载地图
  function renderInto(ctx, quickInfo, bodySections) {
    var container = document.getElementById("articleContainer");
    if (!container) return;
    var html = '<div class="article-hero ' + ctx.heroClass + '">'
      + ctx.imageHtml
      + '<div class="article-hero-overlay"></div>'
      + '<div class="article-hero-content">'
      + '<div class="hero-meta">' + ctx.stationBadge + ctx.typeBadge + ctx.tagsHtml + '</div>'
      + '<h1 class="article-title">' + escapeHtml(ctx.spotName) + '</h1>'
      + '</div></div>'
      + quickInfo
      + '<div class="article-body">' + bodySections + '</div>';
    container.innerHTML = '<div class="article-content article-content--' + getSpotType(ctx.spot) + '">' + html + '</div>';
    setTimeout(function() { initMap(ctx.mapLat, ctx.mapLng, ctx.spotName); }, 50);
    var pageTitle = ctx.spotName + ' | ' + (ctx.dist.stationName || '') + ' | PIXEL TETSUDO';
    if (document.title) document.title = pageTitle;
  }

  // 贴士/推荐列表（标题与附加类由类型 JS 传入）
  function buildTipsHtml(spot, titleKey, extraClass) {
    var html = '<div class="article-section">'
      + '<h3 class="section-heading">' + t(titleKey) + '</h3>'
      + '<ul class="tips-list' + (extraClass ? ' ' + extraClass : '') + '">';
    if (spot.tips && spot.tips.length > 0) {
      for (var ti = 0; ti < spot.tips.length; ti++) {
      var tipText = (spot.tips_i18n && spot.tips_i18n[state.lang] && spot.tips_i18n[state.lang][ti])
          || spot.tips[ti] || t('detail.i18n_missing');
        html += '<li>' + escapeHtml(tipText) + '</li>';
      }
    } else {
      html += '<li>' + escapeHtml(t('detail.fallback_best_time')) + '</li>';
    }
    return html + '</ul></div>';
  }

  // 4.3.840: 返回按钮语义责任 = 回到来源一览页（home 观光模块），不再依赖浏览器历史状态
  function handleBack() {
    location.href = 'home.html';
  }

  function translateUI() {
    var backBtnText = document.getElementById("backBtnText");
    if (backBtnText) backBtnText.textContent = t("detail.back");
  }

  // 通用数据加载流程：加载完成后调用类型 JS 提供的 renderArticle
  function start(renderArticle) {
    state.lang = window.currentLang || 'ja';
    translateUI();
    var ct = document.getElementById('articleContainer');
    if (ct) ct.innerHTML = '<div class="td-loading-state"><div class="td-loading-dots">&bull;&bull;&bull;</div><div class="td-loading-text">' + t('detail.loading') + '</div></div>';

    function boot() {
      state.allSpots = getAllSpots();
      var params = new URLSearchParams(window.location.search);
      var spotName = decodeURIComponent(params.get('name'));
      var stationKey = params.get('station');
      var spotIndex = parseInt(params.get('index')) || 0;
      state.currentStationKey = stationKey;

      // Guard: station coords 未就绪时延后，避免 index 错位
      if (stationKey && window.TourismProximity) {
        var probe = TourismProximity.getNearbySpotsByStation(stationKey, { radius: 50000, limit: 100 });
        if (!probe || probe.length === 0) { setTimeout(boot, 200); return; }
      }

      state.scopedSpots = getScopedSpots();

      var backBtn = document.getElementById('detailBackBtn');
      if (backBtn) backBtn.addEventListener('click', handleBack);

      var targetSpot = null;
      if (spotName) targetSpot = findSpotByName(spotName);
      if (!targetSpot && state.scopedSpots.length > 0) {
        targetSpot = state.scopedSpots[spotIndex] || state.scopedSpots[0];
      }
      if (targetSpot) {
        state.currentSpotIndex = state.scopedSpots.indexOf(targetSpot);
        if (state.currentSpotIndex < 0) state.currentSpotIndex = 0;
        renderArticle(targetSpot, stationKey);
      } else if (state.allSpots.length > 0) {
        state.currentSpotIndex = 0;
        renderArticle(state.allSpots[0], stationKey);
      }

      if (typeof window.onLanguageChange === 'function') {
        window.onLanguageChange(function() {
          state.lang = window.currentLang || 'ja';
          translateUI();
          state.scopedSpots = getScopedSpots();
          if (state.scopedSpots.length > 0 && state.currentSpotIndex >= 0 && state.currentSpotIndex < state.scopedSpots.length) {
            renderArticle(state.scopedSpots[state.currentSpotIndex], state.currentStationKey);
          } else if (state.allSpots.length > 0) {
            renderArticle(state.allSpots[0], state.currentStationKey);
          }
        });
      }
    }

    if (window.DataLoader && window.DataLoader.isLoaded && window.DataLoader.isLoaded()) {
      boot();
    } else if (window.DataLoader && window.DataLoader.load) {
      window.DataLoader.load().then(boot).catch(function(err) {
        console.error('[TourismDetail] Data load failed:', err.message);
      });
    } else {
      var paramsProbe = new URLSearchParams(window.location.search);
      var stationKeyProbe = paramsProbe.get('station');
      var pollCount = 0;
      var pollInterval = setInterval(function() {
        var spReady = window.TOURISM_SPOTS && window.TOURISM_SPOTS.length > 0;
        var coordReady = !stationKeyProbe ||
          (window.RailwayDB && window.RailwayDB.getStationLocation && window.RailwayDB.getStationLocation(stationKeyProbe)) ||
          (window.STATION_COORDS && window.STATION_COORDS[stationKeyProbe]);
        if (spReady && coordReady) {
          clearInterval(pollInterval);
          boot();
        } else if (pollCount >= 200) {
          clearInterval(pollInterval);
          console.error('[TourismDetail] Data never loaded');
          var ct = document.getElementById('articleContainer');
          if (ct) ct.innerHTML = '<p class="td-error-msg">' + t('detail.unavailable') + '</p>';
        }
      }, 50);
    }
  }

  // MapLibre + MapTiler vector（语言跟随）→ Leaflet 兜底
  function initMap(lat, lng, name) {
    var mapEl = document.getElementById("tourismMap");
    if (!mapEl) return;
    if (window.maplibregl && window.MAPTILER_STREETS_V2_JSON) {
      _initMapMaplibre(mapEl, lat, lng, name);
    } else {
      _initMapLeaflet(mapEl, lat, lng, name);
    }
  }

  function _initMapMaplibre(mapEl, lat, lng, name) {
    if (mapEl._tdMap) { mapEl._tdMap.remove(); mapEl._tdMap = null; }
    var lang = { ja: 'ja', zh: 'zh', ko: 'ko', en: 'en' }[window.currentLang] || 'en';
    var style = null;
    try {
      style = JSON.parse(window.MAPTILER_STREETS_V2_JSON.split('name:__LANG__').join('name:' + lang));
    } catch (e) { /* fallthrough */ }
    if (!style) { _initMapLeaflet(mapEl, lat, lng, name); return; }
    var map;
    try {
      map = new maplibregl.Map({
        container: mapEl,
        style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=' + MAPTILER_KEY,
        center: [lng, lat],
        zoom: 15,
        attributionControl: { compact: true },
        scrollZoom: false,
        boxZoom: false,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        canvasContextAttributes: { antialias: true }
      });
    } catch (e) { _initMapLeaflet(mapEl, lat, lng, name); return; }
    mapEl._tdMap = map;
    map.on('style.load', function () {
      if (mapEl._tdMap !== map) return;
      try { map.setStyle(style); } catch (e) { /* 保留官方 style */ }
    });
    var mlFailed = false;
    map.on('error', function (e) {
      if (mlFailed) return;
      var msg = (e && e.error && e.error.message) || '';
      if (/sprite/i.test(msg)) return;
      mlFailed = true;
      try { map.remove(); } catch (err) {}
      mapEl._tdMap = null;
      _initMapLeaflet(mapEl, lat, lng, name);
    });
    var dot = document.createElement('div');
    dot.className = 'td-map-marker-dot';
    new maplibregl.Marker({ element: dot, anchor: 'center' })
      .setLngLat([lng, lat])
      .setPopup(new maplibregl.Popup({ closeButton: false, offset: 14 }).setHTML('<b>' + escapeHtml(name || '') + '</b>'))
      .addTo(map);
    setTimeout(function () { map.resize(); }, 120);
  }

  // Leaflet 兜底（MapTiler streets raster + Carto light_all）
  function _initMapLeaflet(mapEl, lat, lng, name) {
    if (typeof L === 'undefined') {
      mapEl.innerHTML = '<div class="map-error">' + escapeHtml(t('detail.unavailable')) + '</div>';
      return;
    }
    if (mapEl._tdLeaflet) { mapEl._tdLeaflet.remove(); mapEl._tdLeaflet = null; }
    var map = L.map(mapEl, { zoomControl: false, scrollWheelZoom: false, attributionControl: true });
    mapEl._tdLeaflet = map;
    var mtLang = { ja: 'ja', zh: 'zh', ko: 'ko', en: 'en' }[window.currentLang] || 'en';
    var mtLayer = L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=' + MAPTILER_KEY + '&language=' + mtLang, {
      attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      tileSize: 512,
      zoomOffset: -1,
      crossOrigin: 'anonymous'
    }).addTo(map);
    var mtFallback = false;
    mtLayer.on('tileerror', function () {
      if (mtFallback) return;
      mtFallback = true;
      try {
        map.removeLayer(mtLayer);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(map);
      } catch (e) { /* noop */ }
    });
    var icon = L.divIcon({ className: 'td-map-marker', html: '<div class="td-map-marker-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });
    L.marker([lat, lng], { icon: icon }).addTo(map).bindPopup('<b>' + escapeHtml(name || '') + '</b>', { closeButton: false });
    map.setView([lat, lng], 15);
    setTimeout(function () { map.invalidateSize(); }, 120);
  }

  window.TourismDetailCore = {
    state: state,
    t: t,
    escapeHtml: escapeHtml,
    getSpotName: getSpotName,
    getI18nField: getI18nField,
    translateCommonTerms: translateCommonTerms,
    getStationLabel: getStationLabel,
    getGradientForTags: getGradientForTags,
    getHeroClassForGradient: getHeroClassForGradient,
    getSpotType: getSpotType,
    computeDistance: computeDistance,
    distValueHtml: distValueHtml,
    buildContext: buildContext,
    renderInto: renderInto,
    buildTipsHtml: buildTipsHtml,
    start: start,
    initMap: initMap
  };
})();
