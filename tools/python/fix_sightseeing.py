"""修复观光数据"""

﻿# -*- coding: utf-8 -*-
import os

# Fix sightseeing.js
sightseeing_content = """(function() {
  'use strict';
  const SPOTS = window.TOURISM_DATA || {};
  const TAG_LABELS = {
    all: 'tourism.tag_all',
    night: 'tourism.tag_night',
    history: 'tourism.tag_history',
    nature: 'tourism.tag_nature',
    shrine: 'tourism.tag_shrine',
    food: 'tourism.tag_food',
    seasonal: 'tourism.tag_seasonal'
  };
  let state = { lang: 'ja', selectedStation: 'Asakusa', activeTag: 'all' };
  let dom = {};
  
  function cacheDom() {
    dom.container = document.getElementById('smModule');
    dom.grid = document.getElementById('smGrid');
    dom.stationSelect = document.getElementById('smStationSelect');
    dom.tagFilters = document.getElementById('smTagFilters');
    dom.header = document.getElementById('smHeader');
    dom.empty = document.getElementById('smEmpty');
  }
  
  function t(key) { return (typeof window.t === 'function') ? window.t(key) : key; }
  
  function translateSpotName(name) {
    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    return t('spots.' + key) || name;
  }
  
  function translateDist(dist) {
    const match = dist.match(/(\d+)/);
    if (!match) return dist;
    const num = match[1];
    if (dist.includes('步行') || dist.includes('도보')) return num + ' ' + t('spot_dist.walk') + ' ' + t('spot_dist.min');
    if (dist.includes('巴士') || dist.includes('버스')) return num + ' ' + t('spot_dist.bus') + ' ' + t('spot_dist.min');
    if (dist.includes('接驳') || dist.includes('shuttle')) return num + ' ' + t('spot_dist.shuttle') + ' ' + t('spot_dist.min');
    return dist;
  }
  
  function translateDir(dir) {
    if (!dir) return '';
    const mappings = {
      '东口': 'spot_dir.east_exit',
      '西口': 'spot_dir.west_exit',
      '北口': 'spot_dir.north_exit',
      '旁边': 'spot_dir.adjacent',
      '对面': 'spot_dir.opposite',
      '北边': 'spot_dir.north_of',
      '步行可达': 'spot_dir.walking_distance',
      '巴士': 'spot_dir.bus_from'
    };
    for (const [key, tk] of Object.entries(mappings)) {
      if (dir.includes(key)) return t(tk) + ' ' + dir.replace(key, '').trim();
    }
    return dir;
  }
  
  function translateDesc(desc) {
    return desc; // Use the desc from data directly
  }
  
  function renderHeader() {
    if (dom.header) dom.header.innerHTML = '<h2>' + t('tourism.title') + '</h2>';
  }
  
  function renderStationSelect() {
    if (!dom.stationSelect) return;
    const stations = Object.keys(SPOTS);
    dom.stationSelect.innerHTML = stations.map(function(k) {
      const label = t('station_names.' + k) || (SPOTS[k] ? SPOTS[k].name : k);
      return '<option value="' + k + '">' + label + '</option>';
    }).join('');
    dom.stationSelect.value = state.selectedStation;
  }
  
  function renderTagFilters() {
    if (!dom.tagFilters) return;
    const tags = ['all', 'night', 'history', 'nature', 'shrine', 'food', 'seasonal'];
    dom.tagFilters.innerHTML = tags.map(function(tag) {
      const label = t(TAG_LABELS[tag]);
      const active = state.activeTag === tag ? ' active' : '';
      return '<button class="sm-tag-btn' + active + '" data-tag="' + tag + '">' + label + '</button>';
    }).join('');
    dom.tagFilters.querySelectorAll('.sm-tag-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        state.activeTag = btn.dataset.tag;
        renderTagFilters();
        renderGrid();
      });
    });
  }
  
  function renderGrid() {
    if (!dom.grid) return;
    const station = SPOTS[state.selectedStation];
    if (!station) { 
      if (dom.empty) dom.empty.classList.remove('hidden');
      dom.grid.innerHTML = '';
      return; 
    }
    if (dom.empty) dom.empty.classList.add('hidden');
    
    let spots = station.spots || [];
    if (state.activeTag !== 'all') {
      spots = spots.filter(function(s) { return s.tags && s.tags.includes(state.activeTag); });
    }
    
    if (spots.length === 0) {
      dom.grid.innerHTML = '';
      if (dom.empty) { dom.empty.classList.remove('hidden'); dom.empty.textContent = t('tourism.no_spots'); }
      return;
    }
    
    dom.grid.innerHTML = spots.map(function(s) {
      const name = translateSpotName(s.name);
      const dist = translateDist(s.dist);
      const dir = translateDir(s.dir);
      const desc = translateDesc(s.desc);
      const tagsHtml = (s.tags || []).map(function(tag) {
        const label = t(TAG_LABELS[tag] || 'tourism.tag_' + tag);
        return '<span>' + label + '</span>';
      }).join('');
      return '<div class="sm-card"><div class="sm-thumb">' + s.emoji + '</div><div class="sm-body"><h3>' + name + '</h3><p class="sm-dist">' + dist + ' &middot; ' + dir + '</p><p class="sm-desc">' + desc + '</p><div class="sm-card-tags">' + tagsHtml + '</div></div></div>';
    }).join('');
  }
  
  function renderAll() { 
    cacheDom();
    renderHeader(); 
    renderStationSelect(); 
    renderTagFilters(); 
    renderGrid(); 
  }
  
  function bindEvents() {
    if (dom.stationSelect) {
      dom.stationSelect.addEventListener('change', function() {
        state.selectedStation = dom.stationSelect.value;
        state.activeTag = 'all';
        renderGrid();
      });
    }
  }
  
  function init(config) {
    config = config || {};
    cacheDom();
    if (config.lang) state.lang = config.lang;
    if (config.station && SPOTS[config.station]) state.selectedStation = config.station;
    bindEvents();
    renderAll();
  }
  
  function setLang(lang) { 
    if (SPOTS[state.selectedStation]) { 
      state.lang = lang; 
      renderAll(); 
    } 
  }
  
  function setStation(stationKey) { 
    if (SPOTS[stationKey]) { 
      state.selectedStation = stationKey; 
      renderGrid(); 
    } 
  }
  
  window.SightseeingModule = { init: init, setLang: setLang, setStation: setStation };
  window.onLanguageChange = window.onLanguageChange || [];
  window.onLanguageChange.push(function() { renderAll(); });
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
"""

path = r'C:\Users\80996\Documents\项目\像素铁道\js\sightseeing.js'
with open(path, 'w', encoding='utf-8') as f:
    f.write(sightseeing_content)
print('sightseeing.js updated')

