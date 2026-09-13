/**
 * Pixel Tetsudo - Route Timetable Enrichment (搜索时刻推算, v4.3.589)
 *
 * 能力归属：数据查询消费 ODPTClient（Provider，odpt-unified.js，惰性模式）
 *          + data/timetables/*-manual.js（ODPT 无时刻表的地方线补充，动态注入）
 * 产出：routeSegments 各 ride 段的 { dep, arr } 发到时刻（"14:05" 格式）
 *
 * 规则：
 * - 站 ID 匹配：ODPT "odpt.Station:JR-East.ChuoRapid.Takao" 取末段 "Takao" 对本地站 key
 * - 班次选择：起点站 departureTime >= 当前时间的最近班次；
 *   arr = 同班次 tto 中终点站时刻（末站用 arrivalTime，中间站用该站 departureTime）
 * - 日历：按今天（Weekday/Saturday/SaturdayHoliday/Holiday）过滤，无候选时放宽全日历
 * - 手动表：ODPT 空数据 → 注入 <lineId>-manual.js（404 容忍，失败返回 null 降级）
 *
 * Consumer：SearchUI.renderResults（search-ui.js）——异步 enrich 后回填时刻徽章
 */
(function() {
  'use strict';

  var _manualLoading = {};

  // 今天适用的 ODPT 日历值（按优先级）
  function todayCalendars() {
    var day = new Date().getDay();
    if (day === 0) return ['odpt.Calendar:Holiday', 'odpt.Calendar:SaturdayHoliday'];
    if (day === 6) return ['odpt.Calendar:Saturday', 'odpt.Calendar:SaturdayHoliday'];
    return ['odpt.Calendar:Weekday'];
  }

  // ODPT station ID → 本地站 key："odpt.Station:JR-East.ChuoRapid.Takao" → "Takao"
  function stripStationId(id) {
    if (!id) return '';
    var s = String(id);
    var i = s.lastIndexOf('.');
    return i >= 0 ? s.slice(i + 1) : s;
  }

  function parseTime(t) {
    if (!t) return null;
    var p = String(t).split(':');
    if (p.length < 2) return null;
    var h = parseInt(p[0], 10);
    var m = parseInt(p[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    if (h >= 24) h -= 24;  // 跨午夜
    return h * 60 + m;
  }

  function getTto(tt) {
    return (tt && tt['odpt:trainTimetableObject']) || [];
  }

  function getCal(tt) {
    return (tt && tt['odpt:calendar']) || '';
  }

  // 在时刻表列表中找起点站发车 >= now 的最近班次
  function findNextTrain(ttList, fromKey, toKey, nowMin, cals) {
    if (!ttList || ttList.length === 0) return null;
    var best = null;
    for (var i = 0; i < ttList.length; i++) {
      var cal = getCal(ttList[i]);
      if (cals && cals.length > 0 && cal && cals.indexOf(cal) < 0) continue;
      var tto = getTto(ttList[i]);
      var fromIdx = -1, toIdx = -1;
      for (var j = 0; j < tto.length; j++) {
        var st = tto[j]['odpt:departureStation'] || tto[j]['odpt:arrivalStation'] || '';
        var key = stripStationId(st);
        if (fromIdx < 0 && key === fromKey) fromIdx = j;
        else if (fromIdx >= 0 && toIdx < 0 && key === toKey) { toIdx = j; break; }
      }
      if (fromIdx < 0 || toIdx < 0) continue;
      var dep = tto[fromIdx]['odpt:departureTime'] || '';
      var depMin = parseTime(dep);
      if (depMin == null || depMin < nowMin) continue;
      var arr = tto[toIdx]['odpt:arrivalTime'] || tto[toIdx]['odpt:departureTime'] || '';
      if (!best || depMin < best.depMin) {
        best = { dep: dep, arr: arr, depMin: depMin };
      }
    }
    return best;
  }

  // 动态注入手动时刻表（ODPT 无数据的地方线）；404 容忍返回 null
  function loadManual(lineId) {
    return new Promise(function(resolve) {
      var varName = lineId + '_MANUAL_TIMETABLES';
      if (window[varName]) { resolve(window[varName]); return; }
      if (_manualLoading[lineId]) { _manualLoading[lineId].then(resolve); return; }
      var p = new Promise(function(res) {
        try {
          var s = document.createElement('script');
          var base = (typeof window.getBasePath === 'function' && window.getBasePath()) || '..';
          s.src = base + '/data/timetables/' + lineId + '-manual.js';
          s.onload = function() { res(window[varName] || null); };
          s.onerror = function() { res(null); };  // 该线无手动表 → 降级
          document.head.appendChild(s);
        } catch (e) { res(null); }
      });
      _manualLoading[lineId] = p;
      p.then(resolve);
    });
  }

  // 为 routeSegments 推算各 ride 段发到时刻 → { segIdx: { dep, arr } }
  function enrichSegments(routeSegments) {
    if (!routeSegments || !window.ODPTClient) return Promise.resolve({});
    var lines = [];
    routeSegments.forEach(function(seg) {
      if (seg && seg.type === 'ride' && seg.lineId && seg.fromStation && seg.toStation && lines.indexOf(seg.lineId) < 0) {
        lines.push(seg.lineId);
      }
    });
    if (lines.length === 0) return Promise.resolve({});

    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var cals = todayCalendars();

    var promises = lines.map(function(lid) {
      var line = (window.RailwayDB && window.RailwayDB.getLine) ? window.RailwayDB.getLine(lid) : null;
      var op = (line && line.operator) || '';
      if (!op) return Promise.resolve({ lineId: lid, list: null });
      return window.ODPTClient.getCompleteTimetable(op, lid).then(function(rows) {
        if (rows && rows.length > 0) return { lineId: lid, list: rows };
        return loadManual(lid).then(function(m) { return { lineId: lid, list: m || null }; });
      }, function() {
        // ODPT 查询失败（网络/限流）→ 尝试手动表
        return loadManual(lid).then(function(m) { return { lineId: lid, list: m || null }; });
      });
    });

    return Promise.all(promises).then(function(results) {
      var byLine = {};
      results.forEach(function(r) { byLine[r.lineId] = r.list; });
      var out = {};
      routeSegments.forEach(function(seg, idx) {
        if (!seg || seg.type !== 'ride') return;
        var list = byLine[seg.lineId];
        if (!list) return;
        var hit = findNextTrain(list, seg.fromStation, seg.toStation, nowMin, cals);
        if (!hit) {
          // 日历过滤无候选 → 放宽全日历再试
          hit = findNextTrain(list, seg.fromStation, seg.toStation, nowMin, []);
        }
        if (hit) out[idx] = { dep: hit.dep, arr: hit.arr };
      });
      return out;
    });
  }

  window.RouteTimetable = { enrichSegments: enrichSegments, findNextTrain: findNextTrain };
})();
