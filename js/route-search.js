/**
 * Pixel Tetsudo - Route Search Module
 * Implements Breadth-First Search (BFS) to find routes between stations
 * based on the UNIFIED_LINES data structure.
 */

(function() {
  'use strict';

  let _graphCache = null;
  let _graphVersion = 0;

  /**
   * Build a bidirectional adjacency list from UNIFIED_LINES
   * Returns: Map<stationName, Set<connectedStationNames>>
   */
  // 干线本名（与 js/data-state.js TRUNK_MAIN_LINE_IDS 同步；home 页不加载 DataState，故本地内置）
  // 4.3.616: 干线本名不进搜索图——与 LOS 展示层规则一致（4.3.5xx"干线本名不进展示层"）；
  // 否则并行线（Tokaido/TokaidoMain 等）会被随机选中并显示"東海道本線"等本名
  const _TRUNK_MAIN_LINE_IDS = ["Shinetsu", "TokaidoMain", "TohokuMain"];
  function _isTrunk(lineId) { return _TRUNK_MAIN_LINE_IDS.indexOf(lineId) >= 0; }

  function buildStationGraph() {
    if (_graphCache) return _graphCache;
    const graph = new Map();
    
    for (const [lineId, line] of Object.entries(window.RailwayDB ? window.RailwayDB.getAllLines() : (window.DataLayer ? window.DataLayer.getAllLines() : window.UNIFIED_LINES || {}))) {
      if (!line || !line.stations) continue;
      if (_isTrunk(lineId)) continue;
      
      // Add all stations in this line to the graph (sequential connections)
      for (let i = 0; i < line.stations.length; i++) {
        const station = line.stations[i];
        if (!graph.has(station)) {
          graph.set(station, new Set());
        }
        
        // Connect to previous station (if exists)
        if (i > 0) {
          const prev = line.stations[i - 1];
          graph.get(station).add(prev);
          graph.get(prev).add(station);
        }
        
        // Connect to next station (if exists)
        if (i < line.stations.length - 1) {
          const next = line.stations[i + 1];
          graph.get(station).add(next);
          if (graph.has(next)) { graph.get(next).add(station); }
        }
      }
      
      // Cross-line interchanges are NOT built here: they are established by
      // shared station IDs (buildLayerGraph.stationLines) plus explicit
      // transferStations (penalty) / transferStations[].toStation (異名換乘)
      // consumed in the Dijkstra transfer step below.
    }
    
    _graphCache = graph;
    return graph;
  }

  /**
   * Get cached graph, rebuilding if necessary between two stations
   * @param {string} fromStation - Starting station name
   * @param {string} toStation - Destination station name
   * @returns {Object|null} { path: string[], durationMin: number, lineInfo: Array[] } or null if no route
   */
  // Search-mode transfer penalties (minutes). Three modes mirror 乗換案内:
  // combo(おすすめ)=balanced, duration(最速)=low penalty, transfers(乗換最少)=penalty dominates.
  const MODE_PENALTY = {
    combo: { transfer: 6, through: 0 },
    duration: { transfer: 3, through: 0 },
    transfers: { transfer: 1000, through: 0 }
  };

  // v4.3.602: 快速/特急通過駅——LSO 站表包含「線路经过但不站站停」的通过站，
  // durations 按各站停车基准累加会高估快速线时间（常磐快速 北千住→取手 38分 vs 实际 ~31分）。
  // 通过站只计运行时间（省去停站+加减速），按 EXPRESS_PASS_RATIO 折扣。
  // 值 0.5 经常磐快速实时间校准（4 个通过站 3+3+3+4=13分 → 6.5分，合计 ~31.5分）。
  // 数据源：各线公式停站表（wiki）。Joban=常磐快速 松戸〜柏间ノンストップ（通过 亀有/馬橋/新松戸/北小金）。
  const EXPRESS_PASS_RATIO = 0.5;
  const EXPRESS_SKIP_STATIONS = {
    'Joban': { 'Kameari': 1, 'Mabashi': 1, 'Shin-Matsudo': 1, 'Kita-Kogane': 1 }
  };

  // Minimal binary min-heap for Dijkstra priority queue.
  function _MinHeap() {
    this.a = [];
  }
  _MinHeap.prototype.push = function(item) {
    const a = this.a;
    a.push(item);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      // Compare (cost, transfers): prefer fewer transfers when cost is equal
      if (a[p][0] < a[i][0] || (a[p][0] === a[i][0] && a[p][1] <= a[i][1])) break;
      const t = a[p]; a[p] = a[i]; a[i] = t;
      i = p;
    }
  };
  _MinHeap.prototype.pop = function() {
    const a = this.a;
    if (a.length === 0) return undefined;
    const top = a[0];
    const last = a.pop();
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1, r = l + 1;
        let m = i;
        if (l < a.length && (a[l][0] < a[m][0] || (a[l][0] === a[m][0] && a[l][1] < a[m][1]))) m = l;
        if (r < a.length && (a[r][0] < a[m][0] || (a[r][0] === a[m][0] && a[r][1] < a[m][1]))) m = r;
        if (m === i) break;
        const t = a[m]; a[m] = a[i]; a[i] = t;
        i = m;
      }
    }
    return top;
  };
  _MinHeap.prototype.size = function() { return this.a.length; };

  // Layered graph cache: (station, line) states.
  // stationLines: Map<station, Set<lineId>>; lineMeta: lineId -> {stations, positions, durations}
  let _layerCache = null;
  function buildLayerGraph() {
    if (_layerCache) return _layerCache;
    const lines = window.RailwayDB ? window.RailwayDB.getAllLines() :
                  (window.DataLayer ? window.DataLayer.getAllLines() : window.UNIFIED_LINES || {});
    const lineIds = Object.keys(lines);
    const stationLines = new Map();
    const lineMeta = {};
    for (const lid of lineIds) {
      const l = lines[lid];
      if (!l || !l.stations || !l.stations.length) continue;
      // 干线本名不进层图（与 buildStationGraph 一致）
      if (_isTrunk(lid)) continue;
      const positions = new Map();
      l.stations.forEach(function(st, i) {
        positions.set(st, i);
        if (!stationLines.has(st)) stationLines.set(st, new Set());
        stationLines.get(st).add(lid);
      });
      lineMeta[lid] = { stations: l.stations, positions: positions, durations: l.durations || [] };
    }
    _layerCache = { stationLines: stationLines, lineMeta: lineMeta, transferPenalty: buildTransferPenalty(lines), aliasTransfers: buildAliasTransfers(lines) };
    return _layerCache;
  }

  // Transfer penalty lookup from the explicit transferStations declaration.
  // The user rule is: "不是线路经过就可以换乘" — a shared station ID alone does
  // NOT make an interchange. Out-of-station (type: "out") transfers cost extra
  // walk minutes; unlisted shared stations keep the default penalty.
  function buildTransferPenalty(lines) {
    const m = new Map(); // "station\u0001lineA\u0001lineB" -> { out: bool, walk: int }
    for (const lid of Object.keys(lines)) {
      const l = lines[lid];
      if (!l || !Array.isArray(l.transferStations)) continue;
      for (const t of l.transferStations) {
        if (!t || !t.station || !t.lineId || !lines[t.lineId]) continue;
        const a = lid, b = t.lineId;
        const key = t.station + '\u0001' + (a < b ? a : b) + '\u0001' + (a < b ? b : a);
        if (!m.has(key)) m.set(key, { out: t.type === 'out', walk: walkMin(t.note) });
      }
    }
    return m;
  }

  // Name-mismatch (異名) transfer declarations: transferStations[].toStation names
  // the target line's station ID when the same physical interchange carries a
  // different ID on each line (JR 原宿 Harajuku ↔ 千代田線 明治神宮前 Meiji-Jingumae).
  // Returns Map<"fromStation\u0001fromLine", Map<toLineId, toStation>>.
  function buildAliasTransfers(lines) {
    const m = new Map();
    for (const lid of Object.keys(lines)) {
      const l = lines[lid];
      if (!l || !Array.isArray(l.transferStations)) continue;
      for (const t of l.transferStations) {
        if (!t || !t.station || !t.lineId || !t.toStation) continue;
        const tl = lines[t.lineId];
        if (!tl || !Array.isArray(tl.stations) || tl.stations.indexOf(t.toStation) < 0) continue;
        const key = t.station + '\u0001' + lid;
        if (!m.has(key)) m.set(key, new Map());
        m.get(key).set(t.lineId, t.toStation);
      }
    }
    return m;
  }

  // Extract walk minutes from the canonical note text ("徒歩約5分" etc).
  function walkMin(note) {
    if (!note) return 0;
    const mt = String(note).match(/徒歩約(\d+)分/);
    return mt ? parseInt(mt[1], 10) : 0;
  }

  function isThroughConnected(a, b) {
    try {
      // Single Provider first: data/core/through-service.js
      if (window.ThroughService && window.ThroughService.getDirectThroughLines) {
        return window.ThroughService.getDirectThroughLines(a).indexOf(b) >= 0;
      }
      if (window.DataFusion && window.DataFusion.getDirectThroughLines) {
        return window.DataFusion.getDirectThroughLines(a).indexOf(b) >= 0;
      }
      return false;
    } catch(e) { return false; }
  }

  // v4.3.622: 直通判定按 THROUGH_JOIN_STATIONS 声明的接续站收窄——
  // 湘南新宿⇄横須賀 只在 大船 直通，西大井/武蔵小杉/東戸塚 等共站并非直通接续；
  // 若任何共站都按 through(0 惩罚) 切线，Dijkstra 会在同路廊反复免费换线拼跳数，
  // 产生 新宿→西大井→武蔵小杉→東戸塚→鎌倉 式锯齿路径。
  function isThroughAtStation(a, b, st) {
    if (!isThroughConnected(a, b)) return false;
    try {
      if (window.ThroughService && window.ThroughService.getJoinStations) {
        var joins = window.ThroughService.getJoinStations(a, b);
        // null = 未声明（保持宽松，任何共站算直通）；[] = 声明"无接续站"（不通过）
        if (joins && joins.length > 0 && joins.indexOf(st) < 0) return false;
      }
    } catch(e) {}
    return true;
  }

  /**
   * Find a route minimizing (ride time + transfer penalty) via Dijkstra
   * over (station, line) states. Returns the same shape as before:
   * { path, durationMin, segments, lineInfo, routeSegments }
   */
  function findRoute(fromStation, toStation, mode) {
    const pen = MODE_PENALTY[mode] || MODE_PENALTY.combo;
    if (!fromStation || !toStation) return null;
    if (fromStation.toLowerCase() === toStation.toLowerCase()) {
      return { path: [fromStation], durationMin: 0, segments: 0, lineInfo: [] };
    }

    const layer = buildLayerGraph();
    const stationLines = layer.stationLines;
    let fromKey = null, toKey = null;
    for (const st of stationLines.keys()) {
      if (st.toLowerCase() === fromStation.toLowerCase()) fromKey = st;
      if (st.toLowerCase() === toStation.toLowerCase()) toKey = st;
      if (fromKey && toKey) break;
    }
    if (!fromKey || !toKey) return null;

    const startLines = Array.from(stationLines.get(fromKey) || []);
    if (startLines.length === 0) return null;

    const heap = new _MinHeap();
    const dist = new Map(); // key -> [cost, transfers]
    const prev = new Map(); // key -> { key, station, line }
    const rideDur = new Map(); // accumulated ride-only minutes (excludes penalty)
    for (const lid of startLines) {
      const k = fromKey + '\u0001' + lid;
      dist.set(k, [0, 0]);
      rideDur.set(k, 0);
      heap.push([0, 0, k]);
    }

    let endKey = null;
    while (heap.size() > 0) {
      const top = heap.pop();
      const cost = top[0], transfers = top[1], key = top[2];
      const dcur = dist.get(key);
      if (!dcur || dcur[0] < cost || (dcur[0] === cost && dcur[1] < transfers)) continue;
      const sep = key.indexOf('\u0001');
      const st = key.slice(0, sep), lid = key.slice(sep + 1);
      if (st === toKey) { endKey = key; break; }

      const meta = layer.lineMeta[lid];
      if (!meta) continue;
      const pos = meta.positions.get(st);

      // Ride to adjacent stations on the same line
      const adj = [];
      if (pos > 0) adj.push(pos - 1);
      if (pos < meta.stations.length - 1) adj.push(pos + 1);
      for (const ai of adj) {
        const nst = meta.stations[ai];
        const nk = nst + '\u0001' + lid;
        let d = (meta.durations && meta.durations[pos] != null) ? meta.durations[pos] : 2;
        // v4.3.602: 快速通过站折扣（见 EXPRESS_SKIP_STATIONS）
        const sk = EXPRESS_SKIP_STATIONS[lid];
        if (sk && sk[nst]) d = d * EXPRESS_PASS_RATIO;
        const nc = cost + d;
        const rc = dist.get(nk);
        if (!rc || nc < rc[0] || (nc === rc[0] && transfers < rc[1])) {
          dist.set(nk, [nc, transfers]);
          rideDur.set(nk, (rideDur.get(key) || 0) + d);
          prev.set(nk, { key: key, station: st, line: lid });
          heap.push([nc, transfers, nk]);
        }
      }

      // Transfer to other lines at the same station
      const otherLines = stationLines.get(st) || new Set();
      // Name-mismatch interchanges (異名換乘): transferStations[].toStation connects
      // this station to a differently-ID'd station on the target line, e.g.
      // JR 原宿 Harajuku ↔ 千代田線 明治神宮前〈原宿〉 Meiji-Jingumae.
      const aliasMap = (layer.aliasTransfers && layer.aliasTransfers.get(st + '\u0001' + lid)) || null;
      const txTargets = new Set(otherLines);
      if (aliasMap) { for (const ol of aliasMap.keys()) { if (ol !== lid) txTargets.add(ol); } }
      for (const ol of txTargets) {
        if (ol === lid) continue;
        const txSt = (aliasMap && aliasMap.has(ol)) ? aliasMap.get(ol) : st;
        const nk = txSt + '\u0001' + ol;
        // v4.3.622: through 惩罚仅限声明接续站（大船/大宮/東京 等）；非接续共站按普通换乘
        const through = isThroughAtStation(lid, ol, st);
        let txCost = through ? pen.through : pen.transfer;
        // Out-of-station interchange: add the real walk minutes declared in
        // transferStations (user rule: "不是线路经过就可以换乘").
        if (!through && layer.transferPenalty) {
          const pk = st + '\u0001' + (lid < ol ? lid : ol) + '\u0001' + (lid < ol ? ol : lid);
          const p = layer.transferPenalty.get(pk);
          if (p && p.out) txCost += (p.walk || 0);
        }
        const nc = cost + txCost;
        const nt = transfers + 1;
        const tc = dist.get(nk);
        if (!tc || nc < tc[0] || (nc === tc[0] && nt < tc[1])) {
          dist.set(nk, [nc, nt]);
          rideDur.set(nk, rideDur.get(key) || 0);
          prev.set(nk, { key: key, station: st, line: lid });
          heap.push([nc, nt, nk]);
        }
      }
    }
    if (!endKey) return null;

    // Reconstruct the state chain (start -> end)
    const states = [];
    let cur = endKey;
    while (cur) {
      states.push(cur);
      cur = prev.get(cur) ? prev.get(cur).key : null;
    }
    states.reverse();

    // Build path (unique stations) + lineInfo (per adjacent-pair with chosen line id)
    const path = [];
    const lineInfo = [];
    let lastSt = null, lastLine = null, segFrom = null;
    for (const k of states) {
      const sep = k.indexOf('\u0001');
      const st = k.slice(0, sep), lid = k.slice(sep + 1);
      if (lastSt === null) {
        lastSt = st; lastLine = lid; segFrom = st; path.push(st);
        continue;
      }
      if (lid === lastLine && st !== lastSt) {
        // ride advance on the same line
        path.push(st);
        lastSt = st;
      } else if (lid !== lastLine) {
        // transfer at this station (station unchanged) — close the previous ride segment
        if (segFrom !== null && lastSt !== null && segFrom !== lastSt) {
          // v4.3.592: lines 存 lineId（真实 ID）而非 line.name——name 字段不一致
          // （UtsunomiyaJR.name="Utsunomiya Line" 等英文名），消费方（search-ui._lineBadge /
          // history）都按 ID 解析，name 会导致 resolveLineName 查不到而原样显示英文。
          lineInfo.push({ from: segFrom, to: lastSt, lines: [lastLine] });
        }
        lastLine = lid;
        segFrom = st;
        // Name-mismatch interchange: the station ID changed across the transfer
        // (原宿 → 明治神宮前), so the new ID must appear in the path.
        if (st !== lastSt) path.push(st);
        lastSt = st;
      } else {
        lastSt = st;
      }
    }
    if (segFrom !== null && lastSt !== null && segFrom !== lastSt) {
      lineInfo.push({ from: segFrom, to: lastSt, lines: [lastLine] });
    }

    return {
      path: path,
      durationMin: rideDur.get(endKey) || 0,
      segments: path.length - 1,
      lineInfo: lineInfo,
      mode: mode || "combo",
      routeSegments: buildRouteSegments({ lineInfo: lineInfo })
    };
  }

  /**
   * Get which lines connect two adjacent stations
   */
  const _lineCache = new Map();
  /**
   * Convert a BFS route result into RouteSegment[] array.
   */
  // 運行系統が示す種別（保守的マッピング：確実な系統のみ表示、他は null）
  const TRAIN_TYPE_BY_LINE = {
    ChuoRapid: "rapid", SobuRapid: "rapid", Joban: "rapid", JobanLocal: "local",
    Saikyo: "rapid", ShonanShinjuku: "rapid", Tokaido: "rapid", Yokosuka: "rapid",
    Utsunomiya: "rapid", Takasaki: "rapid", KeihinTohoku: "rapid", Yamanote: "local",
    Ome: "rapid", Itsukaichi: "rapid", Kawagoe: "rapid", KawagoeWest: "rapid",
    Nambu: "rapid", Yokohama: "rapid", Musashino: "rapid", Keiyo: "rapid",
    ChuoSobuLocal: "local", Negishi: "rapid"
  };

  function buildRouteSegments(route) {
    if (!route || !route.lineInfo || route.lineInfo.length === 0) return [];
    const segments = [];
    const lineOrder = window.LINE_STATION_ORDER || {};
    for (let i = 0; i < route.lineInfo.length; i++) {
      const seg = route.lineInfo[i];
      // v4.3.592: lineInfo.lines[0] 为 lineId（真实 ID）；lineName 仅作兼容字段
      const lineId = seg.lines[0] || null;
      const lineName = lineId ? ((window.RailwayDB && window.RailwayDB.getLine && window.RailwayDB.getLine(lineId)) || {}).name || lineId : null;
      let direction = 0;
      if (lineId && lineOrder[lineId]) {
        const o = lineOrder[lineId];
        const fromIdx = o[seg.from], toIdx = o[seg.to];
        direction = toIdx > fromIdx ? 1 : (toIdx < fromIdx ? -1 : 0);
      }
      let duration = null;
      if (lineId && window.RailwayDB && lineOrder[lineId]) {
        const durArr = window.RailwayDB.getLineDurations(lineId);
        const o = lineOrder[lineId];
        if (durArr && durArr.length > 0 && o[seg.from] != null && o[seg.to] != null) {
          const fi = o[seg.from], ti = o[seg.to];
          if (ti > fi && ti <= durArr.length) {
            let d = 0;
            for (let j = fi; j < ti; j++) d += durArr[j] || 2;
            duration = d;
          }
        }
      }
      const lo = (lineId && lineOrder[lineId]) ? lineOrder[lineId] : null;
      const hopCount = (lo && lo[seg.from] != null && lo[seg.to] != null) ? Math.abs(lo[seg.to] - lo[seg.from]) : 1;
      const fare = (lineId && window.FareEstimator) ? window.FareEstimator.estimateSegment(lineId, hopCount) : null;
      segments.push({ type: 'ride', lineId, lineName, fromStation: seg.from, toStation: seg.to, duration, direction, trainType: TRAIN_TYPE_BY_LINE[lineId] || null, fare, walking: null });
      if (i < route.lineInfo.length - 1) {
        const nextLid = route.lineInfo[i+1].lines[0] || null;
        if (nextLid && nextLid !== lineId) {
          // v4.3.622: 直通徽章同样按接续站判定（避免在非接续共站显示"乗換不要"）
          const through = !!(lineId && nextLid && isThroughAtStation(lineId, nextLid, seg.to));
          segments.push({ type: 'transfer', station: seg.to, fromLine: lineId, toLines: [nextLid], walking: null, walkingDuration: null, through: through });
        }
      }
    }
    return segments;
  }


  function getLinesForSegment(station1, station2) {
    const key = station1 + '||' + station2;
    if (_lineCache.has(key)) return _lineCache.get(key);
    const lines = [];
    for (const [lineId, line] of Object.entries(window.RailwayDB ? window.RailwayDB.getAllLines() : (window.DataLayer ? window.DataLayer.getAllLines() : window.UNIFIED_LINES || {}))) {
      if (line && line.stations) {
        const idx1 = line.stations.indexOf(station1);
        const idx2 = line.stations.indexOf(station2);
        if ((idx1 >= 0 && idx2 >= 0 && Math.abs(idx1 - idx2) === 1)) {
          lines.push(line.name);
        }
      }
    }
    _lineCache.set(key, lines);
    return lines;
  }

  /**
   * Find all stations that contain a search term (for autocomplete)
   * @param {string} term - Search term (partial station name)
   * @returns {Array<string>} Matching station names
   */
  function findStationsByTerm(term) {
    if (!term || term.trim() === '') return [];
    // Use StationResolver if available (supports JP/EN/mixed input)
    if (window.StationResolver) {
      var results = window.StationResolver.resolve(term);
      var lang = window.currentLang || 'en';
      // 4.3.560: 过滤 NOT_FOUND/null stationId 结果，防止无 ID 建议项进入渲染层
      return results
        .filter(function(r) { return r && r.stationId && r.status !== 'NOT_FOUND'; })
        .slice(0, 10).map(function(r) {
        var did = r.stationId;
        var dn = r.displayName || did;
        if (window.RailwayDB && window.RailwayDB.resolveStationName) {
          var ln = window.RailwayDB.resolveStationName(did, lang);
          if (ln && ln !== did) dn = ln;
        }
        return { stationId: did, displayName: dn };
      });
    }
    // Fallback: substring match on line station IDs
    const query = term.toLowerCase().trim();
    const matches = new Set();
    for (const [lineId, line] of Object.entries(window.RailwayDB ? window.RailwayDB.getAllLines() : (window.DataLayer ? window.DataLayer.getAllLines() : window.UNIFIED_LINES || {}))) {
      if (line && line.stations) {
        for (const station of line.stations) {
          if (station.toLowerCase().includes(query)) {
            matches.add(station);
          }
        }
      }
    }
    var lang = window.currentLang || 'en';
    return Array.from(matches).slice(0, 10).map(function(sid) {
      var dn = sid;
      if (window.RailwayDB && window.RailwayDB.resolveStationName) {
        var ln = window.RailwayDB.resolveStationName(sid, lang);
        if (ln && ln !== sid) dn = ln;
      }
      return { stationId: sid, displayName: dn };
    });
  }

  // Public API
  window.RouteSearch = {
    findRoute: findRoute,
    findStationsByTerm: findStationsByTerm,
    buildStationGraph: buildStationGraph,
    getLinesForSegment: getLinesForSegment,
    invalidateGraphCache: function() { _graphCache = null; },
    buildRouteSegments: buildRouteSegments
  };

})();
