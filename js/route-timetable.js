/**
 * Pixel Tetsudo - Route Timetable Enrichment (搜索时刻推算, v4.3.590)
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

  // v4.3.590: ODPT 站 ID 无连字符（ShinKawasaki），本地 key 带连字符（Shin-Kawasaki）——
  // 归一化（去连字符）后比较，避免同站因拼写风格不一致匹配失败
  function normStationKey(s) {
    return String(s || '').replace(/-/g, '');
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
  // v4.3.590: trainFilter 存在时仅匹配指定车次集合内的列车（直通段贯通匹配用）
  function findNextTrain(ttList, fromKey, toKey, nowMin, cals, trainFilter) {
    if (!ttList || ttList.length === 0) return null;
    var best = null;
    for (var i = 0; i < ttList.length; i++) {
      var cal = getCal(ttList[i]);
      if (cals && cals.length > 0 && cal && cals.indexOf(cal) < 0) continue;
      var trainNo = ttList[i]['odpt:trainNumber'] || '';
      if (trainFilter && !trainFilter[trainNo]) continue;
      var tto = getTto(ttList[i]);
      var fromIdx = -1, toIdx = -1;
      var normFrom = normStationKey(fromKey), normTo = normStationKey(toKey);
      for (var j = 0; j < tto.length; j++) {
        var st = tto[j]['odpt:departureStation'] || tto[j]['odpt:arrivalStation'] || '';
        var key = normStationKey(stripStationId(st));
        if (fromIdx < 0 && key === normFrom) fromIdx = j;
        else if (fromIdx >= 0 && toIdx < 0 && key === normTo) { toIdx = j; break; }
      }
      if (fromIdx < 0 || toIdx < 0) continue;
      var dep = tto[fromIdx]['odpt:departureTime'] || '';
      var depMin = parseTime(dep);
      if (depMin == null || depMin < nowMin) continue;
      var arr = tto[toIdx]['odpt:arrivalTime'] || tto[toIdx]['odpt:departureTime'] || '';
      var arrMin = parseTime(arr);
      if (!best || depMin < best.depMin) {
        best = { dep: dep, arr: arr, depMin: depMin, arrMin: arrMin, train: trainNo };
      }
    }
    return best;
  }

  // 在时刻表列表中找指定车次在 fromKey 站的发车时刻（直通段同车次接续）
  function findTrainByNumber(ttList, trainNo, fromKey, cals) {
    if (!ttList || !trainNo) return null;
    var normFrom = normStationKey(fromKey);
    for (var i = 0; i < ttList.length; i++) {
      var cal = getCal(ttList[i]);
      if (cals && cals.length > 0 && cal && cals.indexOf(cal) < 0) continue;
      if ((ttList[i]['odpt:trainNumber'] || '') !== trainNo) continue;
      var tto = getTto(ttList[i]);
      for (var j = 0; j < tto.length; j++) {
        var st = tto[j]['odpt:departureStation'] || tto[j]['odpt:arrivalStation'] || '';
        if (normStationKey(stripStationId(st)) !== normFrom) continue;
        var dep = tto[j]['odpt:departureTime'] || '';
        if (!dep) continue;
        var arr = tto[j]['odpt:arrivalTime'] || dep;
        return { dep: dep, arr: arr, depMin: parseTime(dep), arrMin: parseTime(arr), train: trainNo };
      }
    }
    return null;
  }

  // 提取线表全部车次集合（直通贯通匹配过滤器用）
  function buildTrainSet(ttList) {
    var s = {};
    (ttList || []).forEach(function(tt) {
      if (tt && tt['odpt:trainNumber']) s[tt['odpt:trainNumber']] = true;
    });
    return s;
  }

  // 换乘缓冲（分钟）：下一段发车不得早于上一段到达 + 此值
  var TRANSFER_BUFFER = 3;

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
      var downgrade = [];
      // v4.3.590: 顺序推算保证衔接——下一段发车 >= 上一段到达 + TRANSFER_BUFFER；
      // 直通（transfer 段 through:true 标记相邻两 ride 段同一列车接续）不加缓冲（到达即发车）。
      // 跨 railway 直通 ODPT 分表无贯通车次（横須賀↔湘南新宿等实测 inSk=false）——
      // 同车次匹配失败时降级为换乘衔接，并标记该 transfer 段由"乗換不要"降为换乘文案。
      var rides = [];
      var throughFlags = [];  // throughFlags[i] = 第 i 段与第 i+1 段是否直通
      var txIdxs = [];        // txIdxs[i] = 第 i 段与第 i+1 段之间 transfer 段的 routeSegments 索引（无则 null）
      routeSegments.forEach(function(seg, idx) {
        if (seg && seg.type === 'ride') {
          rides.push({ seg: seg, idx: idx });
          throughFlags.push(false);
          txIdxs.push(null);
        } else if (seg && seg.type === 'transfer' && rides.length > 0) {
          if (seg.through) throughFlags[rides.length - 1] = true;
          txIdxs[rides.length - 1] = idx;
        }
      });
      var cursorMin = nowMin;
      var prevTrainNo = null;
      rides.forEach(function(item, i) {
        var seg = item.seg;
        var list = byLine[seg.lineId];
        if (!list) { prevTrainNo = null; return; }
        var hit = null;
        // 直通段（与上一段直通）：优先同车次在接续站的发车时刻（同一列车贯通）
        if (i > 0 && throughFlags[i - 1] && prevTrainNo) {
          hit = findTrainByNumber(list, prevTrainNo, seg.fromStation, cals);
          if (!hit) hit = findTrainByNumber(list, prevTrainNo, seg.fromStation, []);
          if (!hit && txIdxs[i - 1] != null && downgrade.indexOf(txIdxs[i - 1]) < 0) downgrade.push(txIdxs[i - 1]);  // 贯通失败 → 换乘段降级
        }
        if (!hit) {
          // 与下一段直通时，本段只匹配贯通列车（trainNumber 同时存在于下一线表）
          var filter = null;
          if (throughFlags[i] && i + 1 < rides.length) {
            var nextList = byLine[rides[i + 1].seg.lineId];
            if (nextList) filter = buildTrainSet(nextList);
          }
          hit = findNextTrain(list, seg.fromStation, seg.toStation, cursorMin, cals, filter);
          if (!hit) hit = findNextTrain(list, seg.fromStation, seg.toStation, cursorMin, [], filter);
          // 直通候选被 filter 全部排除（ODPT 分表无贯通车次）→ 降级为换乘：去 filter 重试 + 标记该 transfer 段
          if (!hit && filter) {
            hit = findNextTrain(list, seg.fromStation, seg.toStation, cursorMin, cals, null);
            if (!hit) hit = findNextTrain(list, seg.fromStation, seg.toStation, cursorMin, [], null);
            if (hit && txIdxs[i] != null && downgrade.indexOf(txIdxs[i]) < 0) downgrade.push(txIdxs[i]);
          }
        }
        if (hit) {
          out[item.idx] = { dep: hit.dep, arr: hit.arr };
          // v4.3.594: 発着番線——PLATFORM_DATA（wiki のりば手建库）按 线路+起点站+方向 解析；
          // 查不到（该站/线未收录）时省略，不误导
          if (window.PlatformResolver && window.PlatformResolver.resolve) {
            try {
              var _plat = window.PlatformResolver.resolve(seg.lineId, seg.fromStation, seg.direction);
              if (_plat) out[item.idx].platform = _plat;
            } catch (_e) {}
          }
          // v4.3.595: 改札口——EXIT_DATA（wiki 改札口手建精选版）按 出发站 解析主要改札口；
          // 无数据（多口无主站）时省略，不误导
          if (window.PlatformResolver && window.PlatformResolver.resolveExit) {
            try {
              var _exit = window.PlatformResolver.resolveExit(seg.fromStation);
              if (_exit) out[item.idx].exit = _exit;
            } catch (_e) {}
          }
          prevTrainNo = hit.train || null;
          // 有到达时刻才推进换乘游标（无到达时刻的段不阻塞下一段）
          if (hit.arrMin != null) cursorMin = throughFlags[i] ? hit.arrMin : hit.arrMin + TRANSFER_BUFFER;
        } else {
          prevTrainNo = null;
        }
      });
      return { times: out, downgrade: downgrade };
    });
  }

  window.RouteTimetable = { enrichSegments: enrichSegments, findNextTrain: findNextTrain };
})();
