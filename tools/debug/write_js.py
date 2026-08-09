with open(r'"'"'C:\Users\80996\Documents\项目\像素铁道\js\sightseeing.js'"'"', '"'"'w'"'"', encoding='"'"'utf-8'"'"') as f:
    f.write("""/**
 * Sightseeing Module - Coordinate-based Recommendation
 */

(function() {
  '"'"'use strict'"'"';

  const TAG_LABELS = {
    all: '"'"'tourism.tag_all'"'"',
    night: '"'"'tourism.tag_night'"'"',
    history: '"'"'tourism.tag_history'"'"',
    nature: '"'"'tourism.tag_nature'"'"',
    shrine: '"'"'tourism.tag_shrine'"'"',
    food: '"'"'tourism.tag_food'"'"',
    seasonal: '"'"'tourism.tag_seasonal'"'"'
  };

  const TAG_ICONS = {
    all: '"'"'\\uD83D\\uDCCC'"'"',
    night: '"'"'\\uD83C\\uDF19'"'"',
    history: '"'"'\\uD83C\\uDFDB\\uFE0F'"'"',
    nature: '"'"'\\uD83C\\uDF3F'"'"',
    shrine: '"'"'\\u26E9\\uFE0F'"'"',
    food: '"'"'\\uD83C\\uDF5C'"'"',
    seasonal: '"'"'\\uD83C\\uDF38'"'"'
  };

  const RIVERS = [
    { name: '"'"'Sumida'"'"', lat: 35.710, lng: 139.803, width: 120 }
  ];

  let state = {
    lang: '"'"'ja'"'"',
    userLat: null,
    userLng: null,
    selectedStation: null,
    activeTags: new Set(),
    autoDetected: false
  };

  let dom = {};

  function cacheDom() {
    dom.container = document.getElementById('"'"'smModule'"'"');
    dom.grid = document.getElementById('"'"'smGrid'"'"');
    dom.tagFilters = document.getElementById('"'"'smTagFilters'"'"');
    dom.empty = document.getElementById('"'"'smEmpty'"'"');
    dom.autoBadge = document.getElementById('"'"'smAutoBadge'"'"');
    dom.stationDisplay = document.getElementById('"'"'smStationDisplay'"'"');
    dom.relocateBtn = document.getElementById('"'"'smRelocateBtn'"'"');
    dom.header = document.querySelector('"'"'.sm-header'"'"');
  }

  function t(key) {
    return (typeof window.t === '"'"'function'"'"') ? window.t(key) : key;
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
    if (meters < 1000) return Math.round(meters) + '"'"'m'"'"';
    return (meters / 1000).toFixed(1) + '"'"'km'"'"';
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
    let html = '"'"'<h2 data-i18n="tourism.title">'"'"' + t('"'"'tourism.title'"'"') + '"'"'</h2>'"'"';
    if (state.autoDetected && state.selectedStation) {
      const stationLabel = t('"'"'station_names.'"'"' + state.selectedStation) || state.selectedStation;
      html += '"'"'<div id=\"smAutoBadge\" class=\"sm-auto-badge\"><span>'"'"' + 
              t('"'"'tourism.auto_detected'"'"') + '"'"': '"'"' + stationLabel + '"'"'</span></div>'"'"';
    }
    dom.header.innerHTML = html;
  }

  function renderTagFilters() {
    if (!dom.tagFilters) return;
    const tags = ['"'"'all'"'"', '"'"'night'"'"', '"'"'history'"'"', '"'"'nature'"'"', '"'"'shrine'"'"', '"'"'food'"'"', '"'"'seasonal'"'"'];
    dom.tagFilters.innerHTML = tags.map(function(tag) {
      const label = t(TAG_LABELS[tag]) || tag;
      const icon = TAG_ICONS[tag] || '"'"''"'"';
      return '"'"'<button class=\"sm-tag-btn'"'"' + (state.activeTags.size === 0 || state.activeTags.has(tag) ? '"'"' active'"'"' : '"'"''"'"') + 
             '"'"'\" data-tag=\"'"'"' + tag + '"'"'\"'"'"' + '"'"'><span class=\"tag-icon\">'"'"' + icon + '"'"'</span><span class=\"tag-label\">'"'"' + label + '"'"'</span></button>'"'"';
    }).join('"'"''"'"');

    dom.tagFilters.querySelectorAll('"'"'.sm-tag-btn'"'"').forEach(function(btn) {
      btn.addEventListener('"'"'click'"'"', function(e) {
        e.preventDefault();
        const tag = btn.getAttribute('"'"'data-tag'"'"');
        if (tag === '"'"'all'"'"') {
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
    });
  }
""'"'"')
print('"'"'Part 1 written'"'"')
