/*
 * Tourism Detail Page - Decoupled Architecture
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
    if (spot['name_' + l]) return spot['name_' + l];
    if (spot.name) return spot.name;
    return '';
  }

  // Get all spots from TOURISM_DATA (handles nested array [[]])
  function getAllSpots() {
    var td = window.TOURISM_DATA;
    if (!td) return [];
    if (Array.isArray(td.spots)) return td.spots;
    var result = [];
    if (td && typeof td === 'object') {
      Object.keys(td).forEach(function(key) {
        var entry = td[key];
        if (entry && entry.spots && Array.isArray(entry.spots)) {
          entry.spots.forEach(function(spot) {
            result.push(spot);
          });
        }
      });
    }
    return result;
  }

  // Filter spots by current station (scoped for station-specific view)
  function getScopedSpots() {
    if (currentStationKey && window.TOURISM_DATA && window.TOURISM_DATA[currentStationKey] && window.TOURISM_DATA[currentStationKey].spots) {
      return window.TOURISM_DATA[currentStationKey].spots;
    }
    return allSpots;
  }

  // Find spot by name or index
  function findSpotByName(name) {
    if (!name || allSpots.length === 0) return null;
    return allSpots.find(function(s) { return s.name === name || (s['name_' + lang] === name) || (s.name_ja === name) || (s.name_zh === name); }) || null;
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

  // Find nearest station ID to a lat/lng (excludes 0,0 stations)
  function getNearestStationId(lat, lng) {
    var coords = window.STATION_COORDS || {};
    var bestId = null;
    var bestDist = Infinity;
    for (var sid in coords) {
      var c = coords[sid];
      if (!c || !c[0] || !c[1]) continue;
      var dlat = c[0] - lat;
      var dlng = c[1] - lng;
      var d = dlat * dlat + dlng * dlng;
      if (d < bestDist) { bestDist = d; bestId = sid; }
    }
    return bestId;
  }


  function renderArticle(spot, stationKey) {
    if (!spot) return;
    var container = document.getElementById("articleContainer");
    if (!container) return;

    var spotName = getSpotName(spot);
    var desc = spot['desc_' + lang] || spot.desc || '';
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
      ? '<span class="station-badge">\u{26A1} ' + escapeHtml(stationName) + '</span>'
      : '';

    // Highlights: break description into key points
    var highlightsHtml = '';
    if (desc) {
      var sentences = desc.split(/[.。！？]+/).filter(function(s) { return s.trim().length > 10; });
      // Only show highlights if at least 2 distinct sentences (avoids duplicate with about section)
      if (sentences.length >= 2) {
        var highlightItems = sentences.slice(0, 3);
        highlightsHtml = '<div class="article-section">'
          + '<h3 class="section-heading">' + t('detail.highlights') + '</h3>'
          + '<ul class="highlights-list">';
        for (var h = 0; h < highlightItems.length; h++) {
          highlightsHtml += '<li>' + escapeHtml(highlightItems[h].trim()) + '</li>';
        }
        highlightsHtml += '</ul></div>';
      }
    }

    // Tips section
    var tipsHtml = '<div class="article-section">'
      + '<h3 class="section-heading">' + t('detail.tips') + '</h3>'
      + '<ul class="tips-list">';
    if (distText) tipsHtml += '<li>' + escapeHtml(t('detail.distance') + ': ' + distText) + '</li>';
    if (spot.tips && spot.tips.length > 0) {
      for (var ti = 0; ti < spot.tips.length; ti++) {
        tipsHtml += '<li>' + escapeHtml(spot.tips[ti]) + '</li>';
      }
    } else {
      tipsHtml += '<li>' + escapeHtml(t('detail.fallback_best_time')) + '</li>';
    }
    tipsHtml += '</ul></div>';

    var spotHours = spot.hours || t('detail.unavailable');
    var spotFee = spot.fee || t('detail.unavailable');
    // Info grid (hours, fees)
    var infoHtml = '<div class="article-section">'
      + '<h3 class="section-heading">' + t('detail.info_hours') + '</h3>'
      + '<div class="info-grid">'
      + '<div class="info-row"><span class="info-label">' + t('detail.info_hours') + '</span><span class="info-value">' + escapeHtml(spotHours) + '</span></div>'
      + '<div class="info-row"><span class="info-label">' + t('detail.info_fee') + '</span><span class="info-value">' + escapeHtml(spotFee) + '</span></div>'
      + '</div></div>';

    // Map container (OSM iframe)
    var mapHtml = '<div id="tourismMap" class="map-container"><div class="map-loading">' + (typeof t === 'function' ? t('detail.map_loading') : 'Loading map...') + '</div></div>';

    // Quick info bar
    var spotBestTime = spot.bestTime || t('detail.fallback_best_time');
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
      + '<div class="article-tags">' + tagsHtml + '</div>'
      + '</div>'
      + highlightsHtml
      + tipsHtml
      + infoHtml
      + '<div class="article-section">'
      + '<h3 class="section-heading">' + t('detail.location') + '</h3>'
      + '<div class="map-info">'
      + '<div class="map-distance"><span class="map-icon">\u2192</span><div><div class="map-label">' + t('detail.distance') + '</div><div class="map-value">' + escapeHtml(distText || t('detail.walking_distance')) + '</div></div></div>'
      + mapHtml
      + '</div>'
      + '</div>';

    container.innerHTML = '<div class="article-content">' + html + '</div>';
    updateNavigation();
    // Go-here button: find nearest station to spot and navigate to route search
    var goHereBtn = document.createElement('button');
    goHereBtn.className = 'go-here-btn';
    goHereBtn.textContent = t('detail.go_here') || 'Go there';
    goHereBtn.addEventListener('click', function() {
      var spotCoord = spot.coord || [mapLat, mapLng];
      var fromId = currentStationKey || spotStation;
      var toId = getNearestStationId(spotCoord[0], spotCoord[1]);
      if (!fromId || !toId) return;
      var url = '../pages/home.html?from=' + encodeURIComponent(fromId) + '&to=' + encodeURIComponent(toId);
      window.location.href = url;
    });
    var btnContainer = document.createElement('div');
    btnContainer.className = 'go-here-container';
    btnContainer.appendChild(goHereBtn);
    container.appendChild(btnContainer);
    // Initialize map after DOM is ready
    setTimeout(function() { initMap(mapLat, mapLng, spotName); }, 50);
    var pageTitle = spotName + ' | ' + (stationName || '') + ' | PIXEL TETSUDO';
    if (document.title) document.title = pageTitle;
  }
  function updateNavigation() {
    var prevBtn = document.getElementById("prevSpotBtn");
    var nextBtn = document.getElementById("nextSpotBtn");
    var prevNameEl = document.getElementById("prevSpotName");
    var nextNameEl = document.getElementById("nextSpotName");

    if (prevBtn) {
      if (currentSpotIndex > 0 && currentSpotIndex < scopedSpots.length) {
        prevBtn.classList.remove("disabled");
        if (prevNameEl) prevNameEl.textContent = getSpotName(scopedSpots[currentSpotIndex - 1]);
        prevBtn.addEventListener("click", function() {
          currentSpotIndex--;
          renderArticle(scopedSpots[currentSpotIndex], currentStationKey);
          window.scrollTo(0, 0);
        });
      } else {
        prevBtn.classList.add("disabled");
        if (prevNameEl) prevNameEl.textContent = '';
      }
    }

    if (nextBtn) {
      if (currentSpotIndex < scopedSpots.length - 1) {
        nextBtn.classList.remove("disabled");
        if (nextNameEl) nextNameEl.textContent = getSpotName(scopedSpots[currentSpotIndex + 1]);
        nextBtn.addEventListener("click", function() {
          currentSpotIndex++;
          renderArticle(scopedSpots[currentSpotIndex], currentStationKey);
          window.scrollTo(0, 0);
        });
      } else {
        nextBtn.classList.add("disabled");
        if (nextNameEl) nextNameEl.textContent = '';
      }
    }
  }

  function handleBack() { window.history.back(); }

  function translateUI() {
    var backBtnText = document.getElementById("backBtnText");
    if (backBtnText) backBtnText.textContent = t("detail.back");
    var prevLabel = document.getElementById("prevLabel");
    if (prevLabel) prevLabel.textContent = t("detail.prev");
    var nextLabel = document.getElementById("nextLabel");
    if (nextLabel) nextLabel.textContent = t("detail.next");
  }

function init() {
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
        if (window.TOURISM_DATA && Object.keys(window.TOURISM_DATA).length > 0) {
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

  // OpenStreetMap iframe (no external JS dependency, CSP-approved)
  function initMap(lat, lng, name) {
    var mapEl = document.getElementById("tourismMap");
    if (!mapEl) return;
    var bbox = (lng - 0.006) + ',' + (lat - 0.004) + ',' + (lng + 0.006) + ',' + (lat + 0.004);
    var iframeUrl = 'https://www.openstreetmap.org/export/embed.html?bbox=' + bbox + '&layer=mapnik&marker=' + lat + ',' + lng;
    mapEl.innerHTML = '<iframe src="' + iframeUrl + '" class="osm-iframe" loading="lazy" title="' + escapeHtml(name || 'Map') + '"></iframe>';
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



