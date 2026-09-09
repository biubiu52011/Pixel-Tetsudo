/*
 * Tourism Detail Page (4.3.464) - Decoupled Architecture
 * Spots are accessed by name/index, not by station association
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
    museum:   "linear-gradient(135deg, #4A4A4A 0%, #8B8B8B 100%)",
    landmark: "linear-gradient(135deg, #008803 0%, #00AA00 100%)",
    park:     "linear-gradient(135deg, #2E8B57 0%, #3CB371 100%)",
    local:    "linear-gradient(135deg, #8B7355 0%, #D2B48C 100%)",
    temple:   "linear-gradient(135deg, #B8860B 0%, #DAA520 100%)",
    default:  "linear-gradient(135deg, #008803 0%, #006600 100%)"
  };

  var MAPTILER_KEY = 'tYRNv4akrEAKTL5ORzUm';  // MapTiler 免费 key（origin 白名单：GitHub Pages + localhost:8017，防盗用）
  var TAG_EMOJI = {};

  var currentSpotIndex = 0;
  var allSpots = [];
var currentStationKey = null;
  var scopedSpots = [];
  var lang = window.currentLang || 'ja';

  function t(key) {
    return (typeof window.t === "function") ? window.t(key) : key;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function getNameMap() {
    return (window.RailwayDB && typeof window.RailwayDB.getNameMap === "function")
      ? window.RailwayDB.getNameMap() : {};
  }

  function getStationLabel(key) {
    if (window.RailwayDB && window.RailwayDB.resolveStationName) {
      return window.RailwayDB.resolveStationName(key, lang) || key;
    }
    return key;
  }

  // Get spot display name based on language
  function getSpotName(spot) {
    if (!spot) return '';
    var l = lang || 'ja';
    if (spot.name_i18n && spot.name_i18n[l]) return spot.name_i18n[l];
    if (spot['name_' + l]) return spot['name_' + l];
    return '';
  }

  // Get i18n field value with fallback
  function getI18nField(spot, field, lang) {
    if (!spot) return '';
    var i18nField = field + '_i18n';
    if (spot[i18nField] && spot[i18nField][lang]) return spot[i18nField][lang];
    if (spot[i18nField] && spot[i18nField].ja) return spot[i18nField].ja;
    return spot[field] || '';
  }

  // Translate common Japanese terms in hours/fee fields
  function translateCommonTerms(text, lang) {
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
      if (translations[term][lang]) {
        result = result.replace(new RegExp(term, 'g'), translations[term][lang]);
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
    if (currentStationKey && window.TourismProximity) {
      var nearby = TourismProximity.getNearbySpotsByStation(currentStationKey, { radius: 50000, limit: 100 });
      if (nearby && nearby.length > 0) {
        return nearby.map(function(item) { return item.spot; });
      }
    }
    return allSpots;
  }

  // Find spot by name or index
  function findSpotByName(name) {
    if (!name || allSpots.length === 0) return null;
    return allSpots.find(function(s) { return s.name === name || (s.name_i18n && (s.name_i18n[lang] === name || s.name_i18n.ja === name || s.name_i18n.zh === name || s.name_i18n.en === name)) || (s['name_' + lang] === name) || (s.name_ja === name) || (s.name_zh === name); }) || null;
  }

  function findSpotByIndex(idx) {
    if (idx < 0 || idx >= allSpots.length) return null;
    return allSpots[idx] || null;
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
    var order = ["default","landmark","history","nature","food","shrine","night","seasonal","museum","park","local","temple"];
    for (var i = 0; i < order.length; i++) {
      var ref = THEME_GRADIENTS[order[i]];
      if (ref && norm.indexOf(ref.replace(/\s+/g, " ").trim().substring(0, 25)) >= 0) {
        return "article-hero--" + order[i];
      }
    }
    return "article-hero--landmark";
  }

  function renderArticle(spot, stationKey) {
    if (!spot) return;
    var container = document.getElementById("articleContainer");
    if (!container) return;

    var spotName = getSpotName(spot);
    var desc = (spot.desc_i18n && spot.desc_i18n[lang]) || spot['desc_' + lang] || spot.desc || '';
    var tags = spot.tags || ['all'];
    var gradient = getGradientForTags(tags);
    var coord = spot.coord || [35.71, 139.80];
    var mapLat = coord[0] || 35.71;
    var mapLng = coord[1] || 139.80;
    var spotStation = spot.station || currentStationKey || '';
    var spotDist = spot.dist || '';
    // Station display name
    var stationCoords = window.STATION_COORDS || {};
    var stationName = '';
    var distText = '';
    if (stationKey || currentStationKey) {
      stationName = getStationLabel(stationKey || currentStationKey);
    } else if (spotStation && stationCoords[spotStation]) {
      stationName = getStationLabel(spotStation);
    }
    if (spotStation && stationCoords[spotStation]) {
      var sc = stationCoords[spotStation];
      var sLat = sc[0] || 0, sLng = sc[1] || 0;
      if (sLat && sLng) {
        var dist = TourismProximity.getDistance(sLat, sLng, mapLat, mapLng);
        distText = TourismProximity.formatWalkMinutes(dist, { at_station: t('detail.at_station'), min_walk: t('detail.min_walk') });
        }
    }
    // Fallback: use spot's own dist/dir
    if (!distText && spotDist) distText = spotDist;

    // Hero image
    var imageHtml = '';
    if (spot.image) {
      imageHtml = '<div class="article-hero-img"><img src="' + escapeHtml(spot.image) + '" alt="' + escapeHtml(spotName) + '"></div>';
    }

    // Tags HTML
    var tagsHtml = '';
    for (var i = 0; i < tags.length; i++) {
      var tagKey = 'tourism.tag_' + tags[i].replace(/-/g,'_'); tagsHtml += '<span class="tag-badge ' + escapeHtml(tags[i]) + '">' + escapeHtml(t(tagKey)) + '</span>';
    }

    // Station badge
    var stationBadge = stationName
      ? '<span class="station-badge"><img src="../images/icon-metro-station.svg" alt="" class="station-icon">' + escapeHtml(stationName) + '</span>'
      : '';

    // Tips section
    var tipsHtml = '<div class="article-section">'
      + '<h3 class="section-heading">' + t('detail.tips') + '</h3>'
      + '<ul class="tips-list">';
    if (spot.tips && spot.tips.length > 0) {
      for (var ti = 0; ti < spot.tips.length; ti++) {
        var tipText = (spot.tips_i18n && spot.tips_i18n[lang] && spot.tips_i18n[lang][ti]) || (spot.tips_i18n && spot.tips_i18n.ja && spot.tips_i18n.ja[ti]) || spot.tips[ti];
        tipsHtml += '<li>' + escapeHtml(tipText) + '</li>';
      }
    } else {
      tipsHtml += '<li>' + escapeHtml(t('detail.fallback_best_time')) + '</li>';
    }
    tipsHtml += '</ul></div>';

    var spotHours = translateCommonTerms(getI18nField(spot, 'hours', lang) || t('detail.unavailable'), lang);
    var spotFee = translateCommonTerms(getI18nField(spot, 'fee', lang) || t('detail.unavailable'), lang);
    // Info grid (hours, fees)
    var infoHtml = '<div class="article-section">'
      + '<h3 class="section-heading">' + t('detail.basic_info') + '</h3>'
      + '<div class="info-grid">'
      + '<div class="info-row"><span class="info-label">' + t('detail.info_hours') + '</span><span class="info-value">' + escapeHtml(spotHours) + '</span></div>'
      + '<div class="info-row"><span class="info-label">' + t('detail.info_fee') + '</span><span class="info-value">' + escapeHtml(spotFee) + '</span></div>'
      + '</div></div>';

    // Map container (OSM iframe)
    var mapHtml = '<div id="tourismMap" class="map-container"><div class="map-loading">' + (typeof t === 'function' ? t('detail.map_loading') : 'Loading map...') + '</div></div>';

    // Quick info bar
    var spotBestTime = translateCommonTerms(getI18nField(spot, 'bestTime', lang) || t('detail.fallback_best_time'), lang);
    var quickInfo = '<div class="detail-quick-info">' + '<div class="qi-item"><div class="qi-label">' + t('detail.distance') + '</div><div class="qi-value">' + escapeHtml(distText || t('detail.near_station')) + '</div></div>' + '<div class="qi-item"><div class="qi-label">' + t('detail.best_time') + '</div><div class="qi-value">' + escapeHtml(spotBestTime) + '</div></div>' + '</div>';

    var heroClass = getHeroClassForGradient(gradient);
    var html = '<div class="article-hero ' + heroClass + '">'
      + imageHtml
      + '<div class="article-hero-overlay"></div>'
      + '<div class="article-hero-content">'
      + '<div class="hero-meta">' + stationBadge + tagsHtml + '</div>'
      + '<h1 class="article-title">' + escapeHtml(spotName) + '</h1>'
      + '</div></div>'
      + quickInfo
      + '<div class="article-body">'
      + '<div class="article-section">'
      + '<h3 class="section-heading">' + t('detail.about') + '</h3>'
      + '<p class="article-text">' + escapeHtml(desc) + '</p>'
      + '</div>'
      + tipsHtml
      + infoHtml
      + '<div class="article-section">'
      + '<h3 class="section-heading">' + t('detail.location') + '</h3>'
      + '<div class="map-info">'
      + mapHtml
      + '</div>'
      + '</div>';

    container.innerHTML = '<div class="article-content">' + html + '</div>';
    // Initialize map after DOM is ready
    setTimeout(function() { initMap(mapLat, mapLng, spotName); }, 50);
    var pageTitle = spotName + ' | ' + (stationName || '') + ' | PIXEL TETSUDO';
    if (document.title) document.title = pageTitle;
  }
  function handleBack() { window.history.back(); }

  function translateUI() {
    var backBtnText = document.getElementById("backBtnText");
    if (backBtnText) backBtnText.textContent = t("detail.back");
  }

function init() {
    // 首次进入时刷新语言快照（lang-init 的 init 在 DOMContentLoaded 才设置 currentLang，
    // 模块级 var lang 在脚本加载时快照到的仍是 ja；不刷新则首次渲染用错语言）
    lang = window.currentLang || 'ja';
    translateUI();
    // Show loading state
    var ct = document.getElementById('articleContainer');
    if (ct) ct.innerHTML = '<div class="td-loading-state"><div class="td-loading-dots">&bull;&bull;&bull;</div><div class="td-loading-text">' + (typeof t === 'function' ? t('detail.loading') : 'Loading...') + '</div></div>';

    function start() {
      allSpots = getAllSpots();
      scopedSpots = getScopedSpots();

      var params = new URLSearchParams(window.location.search);
      var spotName = decodeURIComponent(params.get('name'));
      var stationKey = params.get('station');
      var spotIndex = parseInt(params.get('index')) || 0;

      currentStationKey = stationKey;

      var backBtn = document.getElementById('detailBackBtn');
      if (backBtn) backBtn.addEventListener('click', handleBack);

      var targetSpot = null;
      if (spotName) {
        targetSpot = findSpotByName(spotName);
      }
      // When coming from sightseeing.js, index refers to scopedSpots position
      if (!targetSpot && scopedSpots.length > 0) {
        targetSpot = scopedSpots[spotIndex] || scopedSpots[0];
      }

      if (targetSpot) {
        // Use scopedSpots index for navigation consistency
        currentSpotIndex = scopedSpots.indexOf(targetSpot);
        if (currentSpotIndex < 0) currentSpotIndex = 0;
        renderArticle(targetSpot, stationKey);
      } else if (allSpots.length > 0) {
        currentSpotIndex = 0;
        renderArticle(allSpots[0], stationKey);
      }

      if (typeof window.onLanguageChange === 'function') {
        window.onLanguageChange(function() {
          lang = window.currentLang || 'ja';
          scopedSpots = getScopedSpots();
          if (scopedSpots.length > 0 && currentSpotIndex >= 0 && currentSpotIndex < scopedSpots.length) {
            renderArticle(scopedSpots[currentSpotIndex], currentStationKey);
          } else if (allSpots.length > 0) {
            renderArticle(allSpots[0], currentStationKey);
          }
        });
      }
    }

    if (window.DataLoader && window.DataLoader.isLoaded && window.DataLoader.isLoaded()) {
      start();
    } else if (window.DataLoader && window.DataLoader.load) {
      window.DataLoader.load().then(start).catch(function(err) {
        console.error('[TourismDetail] Data load failed:', err.message);
      });
    } else {
      // Fallback: poll every 50ms until data loads (max 10s)
      var pollCount = 0;
      var pollInterval = setInterval(function() {
        if (window.TOURISM_SPOTS && window.TOURISM_SPOTS.length > 0) {
          clearInterval(pollInterval);
          start();
        } else if (pollCount >= 200) {
          clearInterval(pollInterval);
          console.error('[TourismDetail] Data never loaded');
          var ct = document.getElementById('articleContainer');
          if (ct) ct.innerHTML = '<p class="td-error-msg">' + (typeof t === 'function' ? t('detail.unavailable') : 'Data unavailable. Please refresh.') + '</p>';
        }
      }, 50);
    }
  }

  // Leaflet + Carto Positron 简洁底图（本地化 Leaflet，CSP 兼容；Positron 极简灰白，无 POI 噪音）
  function initMap(lat, lng, name) {
    var mapEl = document.getElementById("tourismMap");
    if (!mapEl) return;
    if (typeof L === 'undefined') {
      mapEl.innerHTML = '<div class="map-error">' + escapeHtml(typeof t === 'function' ? t('detail.unavailable') : 'Map unavailable') + '</div>';
      return;
    }
    // 切换景点时清理旧实例（Leaflet 实例不能被重复初始化在同一容器）
    if (mapEl._tdLeaflet) { mapEl._tdLeaflet.remove(); mapEl._tdLeaflet = null; }
    var map = L.map(mapEl, {
      zoomControl: false,        // 移动端简洁：不用缩放控件，手势缩放足够
      scrollWheelZoom: false,    // 防止滚动页面时被地图劫持
      attributionControl: true
    });
    mapEl._tdLeaflet = map;
    // MapTiler Basic 极简底图（免费 key，origin 白名单防盗用；language 参数跟随界面语言：中文界面中文地名/日文界面日文地名）
    // MapTiler 固定返回 512px 瓦片（tilesize 参数无效）：Leaflet 默认 256 网格会把瓦片压缩一半导致图层错位——tileSize:512 + zoomOffset:-1 正确渲染
    // 兜底：MapTiler 失败（key 失效/额度超限/Origin 校验延迟）时自动回退 Carto light_all
    var mtLang = { ja: 'ja', zh: 'zh', ko: 'ko', en: 'en' }[window.currentLang] || 'en';
    var mtLayer = L.tileLayer('https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=' + MAPTILER_KEY + '&language=' + mtLang, {
      attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      tileSize: 512,      // MapTiler 固定返回 512px 瓦片：tileSize 对齐使 1:1 渲染，zoomOffset -1 保持 256 口径缩放层级
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
    // 像素风圆点 marker（divIcon 本地渲染，无外域图片依赖）
    var icon = L.divIcon({
      className: 'td-map-marker',
      html: '<div class="td-map-marker-dot"></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
    L.marker([lat, lng], { icon: icon }).addTo(map)
      .bindPopup('<b>' + escapeHtml(name || '') + '</b>', { closeButton: false });
    map.setView([lat, lng], 15);
    // 文章渲染后才挂载容器，确保尺寸计算正确
    setTimeout(function () { map.invalidateSize(); }, 120);
  }

  window.TourismDetailPage = {
    init: init,
    renderArticle: renderArticle,
    getAllSpots: getAllSpots,
    setStation: function(stationKey) {
      currentStationKey = stationKey;
      scopedSpots = getScopedSpots();
      if (scopedSpots.length > 0 && currentSpotIndex >= 0 && currentSpotIndex < scopedSpots.length) {
        renderArticle(scopedSpots[currentSpotIndex]);
      } else if (allSpots.length > 0) {
        renderArticle(allSpots[0]);
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();



