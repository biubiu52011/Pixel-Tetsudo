/*
 * Pixel Tetsudo - Local Railway Data Stub
 * 本地铁路数据存根 - 供 DataFusion 使用
 * 支持从 IndexedDB 缓存加载实时数据
 */
(function() {
  "use strict";
  window.LOCAL_RAILWAY_DATA = {
    lines: {},
    statusMap: {}
  };

  // If DataFusion has cached data, seed local statusMap
  if (window.RTCache) {
    window.RTCache.loadDelayInfo().then(function(delayInfo) {
      if (!delayInfo || Object.keys(delayInfo).length === 0) return;
      var statusMap = {};
      Object.keys(delayInfo).forEach(function(lid) {
        statusMap[lid] = delayInfo[lid];
      });
      window.LOCAL_RAILWAY_DATA.statusMap = statusMap;
    }).catch(function(e) {
      console.warn("[LocalData] Cache seed error:", e.message);
    });
  }
})();
