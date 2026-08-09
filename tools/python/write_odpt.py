"""写入 ODPT 数据"""

﻿#!/usr/bin/env python3\n# -*- coding: utf-8 -*-\n# ============================================================================\n# 文件：write_odpt.py\n# 功能：生成 ODPT API JavaScript 模块\n# 描述：从 ODPT API 获取列车数据并写入 js/odpt-api.js 文件\n#\n# 作者：Pixel Tetsudo 开发团队\n# 日期：2026\n# ============================================================================\n
js_code = '''(function() {
'use strict';

const ODPT_BASE_URL = 'https://api.odpt.org/api/v4';

function getConsumerKey() {
  return localStorage.getItem('odpt_consumer_key') || '';
}

async function fetchTrainsForLine(lineId, operator) {
  operator = operator || 'JR-East';
  const key = getConsumerKey();
  const url = ODPT_BASE_URL + '/odpt:Train?odpt:operator=odpt.Operator=' + operator + '&acl:consumerKey=' + encodeURIComponent(key) + '&format=json';
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    return data.patterns || [];
  } catch (error) {
    console.log('[ODPTAPI] Failed to fetch trains for ' + lineId + ':', error.message);
    return null;
  }
}

function formatTrainsFromODPT(lineId, odptTrains) {
  if (!odptTrains || !Array.isArray(odptTrains)) return [];
  return odptTrains.map(function(train) {
    return {
      id: train['odpt:trainNumber'] || train.id || lineId + '-T' + Math.floor(Math.random() * 1000),
      type: train['odpt:trainType'] || train.type || '普通',
      destination: train['odpt:destination'] || train.destination || 'Unknown',
      cars: train['odpt:carCount'] || parseInt(train.cars) || 8,
      delay: Math.floor(Math.random() * 10),
      departAt: Math.floor(Math.random() * 1440)
    };
  });
}

async function populateTrainsFromAPI() {
  const linesToFetch = ['yamanote', 'keihintohoku'];
  for (var i = 0; i < linesToFetch.length; i++) {
    var lineId = linesToFetch[i];
    var odptTrains = await fetchTrainsForLine(lineId);
    if (odptTrains) {
      var formattedTrains = formatTrainsFromODPT(lineId, odptTrains);
      window.TRAINS = window.TRAINS || {};
      window.TRAINS[lineId] = formattedTrains;
      console.log('[ODPTAPI] Fetched ' + formattedTrains.length + ' trains for ' + lineId);
    }
  }
}

ensureTrainsHaveData = function() {
  window.TRAINS = window.TRAINS || {};
  var nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  if (!window.TRAINS['yamanote'] || window.TRAINS['yamanote'].length === 0) {
    window.TRAINS['yamanote'] = [
      { id: 'YH01', type: '普通', destination: '池袋', cars: 8, delay: 0, departAt: nowMinutes - 15 },
      { id: 'YH02', type: '普通', destination: '渋谷', cars: 8, delay: 2, departAt: nowMinutes - 8 },
      { id: 'YH03', type: '快速', destination: '新宿', cars: 10, delay: 0, departAt: nowMinutes - 25 },
      { id: 'YH04', type: '普通', destination: '品川', cars: 8, delay: 5, departAt: nowMinutes - 35 }
    ];
  }
}

window.ODPT_API = {
  fetchTrains: populateTrainsFromAPI,
  getTrains: function(lineId) {
    return window.TRAINS && window.TRAINS[lineId] ? window.TRAINS[lineId].slice() : [];
  },
  ensureData: ensureTrainsHaveData
};

ensureTrainsHaveData();
populateTrainsFromAPI().catch(function(err) { console.log('[ODPTAPI] Initial fetch failed:', err); });

setInterval(function() {
  populateTrainsFromAPI();
}, 30000);
})();'''
with open('js/odpt-api.js', 'w', encoding='utf-8') as f:
    f.write(js_code)
print('Written successfully')

