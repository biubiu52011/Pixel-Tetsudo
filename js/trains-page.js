/*
 * Pixel Tetsudo - Train Location Page Controller
 * v4 - 从 railway_data.json 加载 stations/durations + line-control.js 元数据
 */
(function() {
  "use strict";
  var currentLine = null;
  var listEl = null;
  var detailEl = null;
  var titleEl = null;
  var filterBarEl = null;
  var mapEl = null;
  var backBtn = null;
  var _selectedOperator = null;
  var _lastPositionsHash = '';
  var t = window.t || function(k) { return k; };
  var escapeHtml = window.escapeHtml || function(s) {
    if (!s) return "";
    if (typeof s !== "string") return "";
    if (s.indexOf("&") < 0 && s.indexOf("<") < 0 && s.indexOf(">") < 0 && s.indexOf('"') < 0 && s.indexOf("'") < 0) return s;
    var d = document.createElement("div"); d.textContent = s; return d.innerHTML;
  };

  // === GEOM 设计令牌（v4.3.482：统一线路图度量，行业惯例网格）===
  // 所有线路共用一套宽度语义，不再一条线一套魔法数字。
  var GEOM = {
    // 支线列宽：站名 16px（最长 6 字≈106px）+ 换乘 chip 余量，统一全支线
    BRANCH_COL_W: 96,
    // 分叉引出长度（主线列 → 支线列的水平 stub）
    BRANCH_STUB: 20,
    // 主线基准画布宽（无支线时）
    MAIN_BASE_W_MOBILE: 410,
    MAIN_BASE_W_MIN: 440,
    MAIN_BASE_W_MAX: 820
  };

  function getLinesData() {
    // Priority 1: DataFusion fused data (has realtimePositions for train location)
    if (window.DataFusion) {
      var fused = window.DataFusion.getFusedData();
      if (fused && fused.lines && Object.keys(fused.lines).length > 0) {
        return fused.lines;
      }
    }
    // Priority 2: DataLayer (RailwayDB-first) raw data, no realtime positions
    var rawLines = window.DataLayer ? window.DataLayer.getAllLines() : (window.UNIFIED_LINES || {});
    var ul = Array.isArray(rawLines) ? (function() { var d = {}; rawLines.forEach(function(l) { d[l.id || l.line_id] = l; }); return d; })() : rawLines;
    if (!ul) return {};
    var lines = {};
    var ids = Object.keys(ul);
    for (var i = 0; i < ids.length; i++) {
      var l = ul[ids[i]];
      if (!l) continue;
      lines[ids[i]] = {
        id: ids[i],
        name: l.name || ids[i],
        nameEn: l.nameEn || l.name || ids[i],
        code: l.code || ids[i],
        color: (window.LineOperationSystemsResolveColor && window.LineOperationSystemsResolveColor(ids[i])) || l.color || "#888888",
        operator: l.operator || "Unknown",
        region: l.region || "",
        type: l.type || "straight",
        image: l.image || "",
        stations: l.stations || [],
        durations: l.durations || [],
        realtimePositions: [],
        nameJa: l.nameJa || l.name || ids[i],
        branchOf: l.branchOf || null,
        isSixShapedLoop: l.isSixShapedLoop === true,
        isDoubleColumnLoop: l.isDoubleColumnLoop === true,
        loopJunction: l.loopJunction || null
      };
    }
    return lines;
  }

  function getRealtimePositions(lineId) {
    var positions = _getBasePositions(lineId);
    // v4.3.409: 融合机制——横須賀線・総武快速線等直通运行系统（LOS 同系统 + 直通相接）
    // 详情页显示主线 + 延伸线列车；延伸线列车带 fusionLineId，渲染层按延伸几何偏移定位
    var ext = _fusionExtensionLines(lineId);
    if (ext && ext.length > 0) {
      var all = positions.slice();
      for (var ei = 0; ei < ext.length; ei++) {
        var ep = _getBasePositions(ext[ei].lid);
        for (var ej = 0; ej < ep.length; ej++) {
          var np = {};
          for (var pk in ep[ej]) { if (ep[ej].hasOwnProperty(pk)) np[pk] = ep[ej][pk]; }
          np.fusionLineId = ext[ei].lid;
          all.push(np);
        }
      }
      return all;
    }
    // v4.3.446: 支线融合——本线的 branchOf 子线（如丸ノ内線→方南町支線）列车并入本线详情图，
    // 列车带 fusionLineId，渲染层按支线几何（branchGeom）定位，与主线留出距离。
    var _src = (window.RailwayDB && window.RailwayDB.getAllLines) ? window.RailwayDB.getAllLines() : getLinesData();
    var _brs = [];
    if (_src && _src[lineId] && _src[lineId].branches) {
      _brs = _src[lineId].branches;
    } else if (_src) {
      for (var _bk in _src) {
        if (_src[_bk].branchOf === lineId && _bk !== lineId) _brs.push(_bk);
      }
    }
    if (_brs.length > 0) {
      var _all2 = positions.slice();
      for (var _bi2 = 0; _bi2 < _brs.length; _bi2++) {
        var _blid = _brs[_bi2];
        if (!_src[_blid] || !_src[_blid].stations || _src[_blid].stations.length === 0) continue;
        var _bp = _getBasePositions(_blid);
        for (var _bj = 0; _bj < _bp.length; _bj++) {
          var _np2 = {};
          for (var _pk2 in _bp[_bj]) { if (_bp[_bj].hasOwnProperty(_pk2)) _np2[_pk2] = _bp[_bj][_pk2]; }
          _np2.fusionLineId = _blid;
          _all2.push(_np2);
        }
      }
      return _all2;
    }
    return positions;
  }
  function _getBasePositions(lineId) {
    try {
      if (window.DataFusion && window.DataFusion.getRealtimePositions) {
        var pos = window.DataFusion.getRealtimePositions(lineId);
        if (pos && pos.length > 0) return pos;
      }
      // Fallback: check cached positions from IndexedDB
      if (window.DataLayer && window.DataLayer.getCachedPositions) {
        var cp = window.DataLayer.getCachedPositions(lineId);
        if (cp && cp.length > 0) return cp;
      }
      // Compat fallback: check UNIFIED_LINES cachedPositions
      var ul = window.UNIFIED_LINES;
      if (ul && ul[lineId] && ul[lineId].cachedPositions) {
        return ul[lineId].cachedPositions;
      }
    } catch(e) {}
    return [];
  }
  // 融合延伸线识别：lineId 所属 LOS 系统内、且与 lineId 直通相接（ThroughService 双向）
  // 的线路作为延伸段（如 Yokosuka ↔ SobuRapid，東京站直通）
  function _fusionExtensionLines(lineId) {
    try {
      var src = (window.RailwayDB && window.RailwayDB.getAllLines) ? window.RailwayDB.getAllLines() : getLinesData();
      var own = src[lineId];
      if (!own || !own.stations || own.stations.length < 2) return null;
      var first = own.stations[0], last = own.stations[own.stations.length - 1];
      var out = [];
      // 1) LOS 同系统直通延伸（如 Yokosuka ↔ SobuRapid）
      var sysLineIds = null;
      if (window.LineOperationSystems) {
        var ops = window.LineOperationSystems;
        for (var ok in ops) {
          var list = ops[ok];
          if (!Array.isArray(list)) continue;
          for (var si = 0; si < list.length; si++) {
            var sys = list[si];
            if (sys && sys.lineIds && sys.lineIds.indexOf(lineId) >= 0 && sys.lineIds.length > 1) {
              sysLineIds = sys.lineIds;
              break;
            }
          }
          if (sysLineIds) break;
        }
      }
      if (sysLineIds) {
        var thr = (window.ThroughService && window.ThroughService.getDirectThroughLines) ? window.ThroughService.getDirectThroughLines(lineId) : [];
        if (thr && thr.length > 0) {
          for (var i = 0; i < sysLineIds.length; i++) {
            var lid2 = sysLineIds[i];
            if (lid2 === lineId) continue;
            if (thr.indexOf(lid2) < 0) continue;
            var l2 = src[lid2];
            if (!l2 || !l2.stations || l2.stations.length < 2) continue;
            if (l2.stations[0] === last) {
              out.push({ lid: lid2, joinAtEnd: true, baseIdx: own.stations.length - 1 });
            } else if (l2.stations[l2.stations.length - 1] === first) {
              out.push({ lid: lid2, joinAtEnd: false, baseIdx: 0 });
            }
          }
        }
      }
      // 2) 干线本名（TRUNK）延伸——4.3.421 起改为显式白名单（当前为空，即不延伸任何干线本名）。
      //    原自动判定（端点相接）导致横須賀線（東京）误延伸整条東海道本線（東京→熱海 并行线非直通）；
      //    中央本線已独立 CO 卡（4.3.414），TRUNK_MAIN_LINE_IDS 余项（Shinetsu/TokaidoMain/TohokuMain）
      //    均非运行系统的直通延伸段。未来确有需要时在此显式登记，例：{ ChuoRapid: ["ChuoMain"] }。
      var trunk = (window.DataState && window.DataState.TRUNK_MAIN_LINE_IDS) || [];
      var _TRUNK_EXTENSION_ALLOW = {};
      for (var ti = 0; ti < trunk.length; ti++) {
        var tlid = trunk[ti];
        if (!_TRUNK_EXTENSION_ALLOW[tlid]) continue;
        var tl = src[tlid];
        if (!tl || !tl.stations || tl.stations.length < 2) continue;
        var already = false;
        for (var ai = 0; ai < out.length; ai++) { if (out[ai].lid === tlid) { already = true; break; } }
        if (already) continue;
        if (tl.stations[0] === last) {
          out.push({ lid: tlid, joinAtEnd: true, baseIdx: own.stations.length - 1 });
        } else if (tl.stations[tl.stations.length - 1] === first) {
          out.push({ lid: tlid, joinAtEnd: false, baseIdx: 0 });
        }
      }
      return out.length ? out : null;
    } catch(e) { return null; }
  }
  // 融合机制：延伸线列车的全局索引基准（主线末站 = 延伸线起点站）
  function _fusionBaseIdx(lineId, fusionLineId) {
    try {
      var g = _routeGeometryCache[_geomKey(lineId)];
      if (g && g.fusionMap && g.fusionMap[fusionLineId]) return g.fusionMap[fusionLineId].baseIdx;
      var allLines = getLinesData();
      var own = allLines[lineId], ext = allLines[fusionLineId];
      if (own && ext && ext.stations && own.stations) {
        if (ext.stations[0] === own.stations[own.stations.length - 1]) return own.stations.length - 1;
        if (ext.stations[ext.stations.length - 1] === own.stations[0]) return 0;
      }
    } catch(e) {}
    return -1;
  }
  // ========== Route Geometry Cache (Single source of truth for coordinates) ==========
  var _routeGeometryCache = {};
  function _isMobileView() { return typeof window !== "undefined" && window.innerWidth < 600; }
  function _geomKey(lineId) { return lineId + (_isMobileView() ? "__m" : "__d"); }

  // ========== Transfer map cache: stationId -> interchange lines (excluding the line itself) ==========
  var _transferMapCache = null;
  // Through-service direction at a given station of `lineId`:
  //   first station of the line → "up" (∧, label above the station),
  //   last station            → "down" (∨, label below the station),
  //   any mid-line junction   → "middle" (label on the left of the station).
  // Returns null when the station is not a through boundary.
  function _throughDirForStation(lineId, stationId) {
    var thrIds = (window.ThroughService && window.ThroughService.getDirectThroughLines) ? window.ThroughService.getDirectThroughLines(lineId) : [];
    if (!thrIds.length) return null;
    var src2 = (window.RailwayDB && window.RailwayDB.getAllLines) ? window.RailwayDB.getAllLines() : getLinesData();
    var own2 = src2[lineId];
    var sts2 = (own2 && own2.stations) ? own2.stations : [];
    var idx2 = sts2.indexOf(stationId);
    if (idx2 < 0) return null;
    for (var ti = 0; ti < thrIds.length; ti++) {
      var tl = src2[thrIds[ti]];
      if (tl && tl.stations && tl.stations.indexOf(stationId) >= 0) {
        if (idx2 === 0) return "up";
        if (idx2 === sts2.length - 1) return "down";
        return "middle";
      }
    }
    return null;
  }
  // Explicit-transfer map: built ONLY from the line's declared transferStations
  // (station / lineId / type: in|out / note), never by inferring from shared
  // station ids across all lines ("not every station a line passes is an
  // interchange"). Through-service (直通運転) partners are still marked via the
  // ThroughService JOIN gate, which reflects actual 接続駅 semantics.
  function _getTransferMap(lineId) {
    var _langNow = window.currentLang || "ja";
    if (_transferMapCache && _transferMapCache.lineId === lineId && _transferMapCache.lang === _langNow) return _transferMapCache.map;
    var src = (window.RailwayDB && window.RailwayDB.getAllLines) ? window.RailwayDB.getAllLines() : getLinesData();
    var map = {};
    var own = src[lineId];
    var declared = (own && Array.isArray(own.transferStations)) ? own.transferStations : [];
    var ownStations = (own && own.stations) ? own.stations : [];
    for (var di = 0; di < declared.length; di++) {
      var t = declared[di];
      if (!t || !t.station || !t.lineId) continue;
      if (t.lineId === lineId) continue;
      var tl = src[t.lineId];
      if (!tl) continue;
      var img = (tl.image && !/(グループ|ロゴ|マーク|アイコン|シンボル)/.test(tl.image)) ? tl.image : "";
      var nm = (window.RailwayDB && window.RailwayDB.resolveLineName) ? window.RailwayDB.resolveLineName(t.lineId, window.currentLang) : (tl.name || t.lineId);
      if (!map[t.station]) map[t.station] = [];
      map[t.station].push({
        lineId: t.lineId, image: img, name: nm, operator: tl.operator || "",
        color: (window.LineOperationSystemsResolveColor && window.LineOperationSystemsResolveColor(t.lineId)) || tl.color || "", type: t.type === "out" ? "out" : "in", note: t.note || ""
      });
    }
    // Mark through-service (直通運転) partner lines that join this line at one of its own stations
    var throughLines = (window.ThroughService && window.ThroughService.getDirectThroughLines) ? window.ThroughService.getDirectThroughLines(lineId) : [];
    if (throughLines.length > 0) {
      for (var i2 = 0; i2 < ownStations.length; i2++) {
        var stArr = map[ownStations[i2]];
        if (!stArr) continue;
        for (var j2 = 0; j2 < stArr.length; j2++) {
          if (throughLines.indexOf(stArr[j2].lineId) >= 0) {
            // 接続駅 gate: only mark the through partner at its real join station(s).
            // null = not defined (fall back to all shared stations), [] = no marker,
            // [s1, s2] = marker only at these stations.
            var _js = (window.ThroughService && window.ThroughService.getJoinStations) ? window.ThroughService.getJoinStations(lineId, stArr[j2].lineId) : null;
            if (_js === null || _js.indexOf(ownStations[i2]) >= 0) {
              stArr[j2].through = true;
              // Direction the through train continues: first station → up (∧),
              // last station → down (∨), mid-line junction → middle (label on the left).
              stArr[j2].dir = _throughDirForStation(lineId, ownStations[i2]) || "middle";
            }
          }
        }
      }
    }
    _transferMapCache = { lineId: lineId, lang: _langNow, map: map };
    return map;
  }

  // Industry-standard through-service affordance (mirrors JR/Tokyo Metro
  // "相互直通運転" station signage):
  //   - boxed label "∨/∧直通〇〇線" (arrow = direction the through train continues)
  //   - title: "Operator Line（相互直通運転）" with i18n operator + through label
  function _throughBadgeText(lineObj) {
    var opName = (lineObj.operator && window.tOp) ? window.tOp(lineObj.operator) : "";
    var base = (opName ? opName + " " : "") + lineObj.name;
    if (lineObj.through) {
      var thru = (window.t ? window.t("train.throughService", "相互直通運転") : "相互直通運転");
      base = base + "（" + thru + "）";
    } else if (lineObj.type === "out") {
      // Out-of-station interchange: mark explicitly so users know a gates-out
      // walk is required, with any note (e.g. "東武浅草，徒歩約5分").
      var outLbl = (window.t ? window.t("train.transferOut", "站外換乘") : "站外換乘");
      var _note = lineObj.note || "";
      // Localize the walk-time fragment ("徒歩約N分") to the active language;
      // station names inside the note stay as canonical Japanese (proper nouns).
      var _walkM = _note.match(/徒歩約(\d+)分/);
      if (_walkM) {
        var _n = parseInt(_walkM[1], 10);
        var _lng = window.currentLang || "ja";
        var _wl = _lng === "en" ? ("approx " + _n + " min walk")
          : _lng === "zh" ? ("步行約" + _n + "分")
          : _lng === "ko" ? ("도보 약 " + _n + "분")
          : ("徒歩約" + _n + "分");
        _note = _note.replace(/，?徒歩約\d+分/, "，" + _wl);
      }
      base = base + "（" + outLbl + (_note ? " " + _note : "") + "）";
    }
    return base;
  }
  // Short display name for a through-partner line: prefer the "○○ライン" alias in
  // parentheses (e.g. 伊勢崎線（スカイツリーライン）→ スカイツリーライン), then truncate.
  function _throughShortName(lineObj, mobile) {
    var nm = lineObj.name;
    var m = nm.match(/[（(]([^）)]*ライン)[）)]/);
    if (m) nm = m[1];
    var maxN = mobile ? 6 : 10;
    return nm.length > maxN ? nm.slice(0, maxN) + "…" : nm;
  }
  // Size (w/h in px) of the boxed through-service label, used both for layout
  // anchoring (position calculation) and by the renderer itself.
  function _throughChipSize(lineObj, mobile) {
    var nm = _throughShortName(lineObj, mobile);
    // 方向箭头改为 SVG 矢量绘制（不受字体字形影响），文本不再含 ∧/∨/< 字符。
    // 4.3.442: "直通" prefix localized (ja 直通 / zh 直通 / ko 직통 / en Through )
    var throughLbl = (typeof window.t === "function" && window.t("train.through")) ? window.t("train.through") : "直通";
    var label = throughLbl + nm;
    var fs = mobile ? 12 : 10;
    var w = label.length * (mobile ? 12 : 10) + 8 + (mobile ? 12 : 10);
    var h = (mobile ? 19 : 12) + 4;
    return { w: w + 2, h: h, label: label };
  }
  // Industry-standard through-service affordance (mirrors JR/Tokyo Metro station
  // signage "相互直通運転"): a rounded boxed label reading "∨直通〇〇線" / "∧直通〇〇線",
  // where the arrow points in the direction the through train continues on the map
  // (up=∧, down=∨). Returns the consumed width so flow layouts can advance.
  function _hexToRgba(hex, a) {
    var h = String(hex || "#555").replace("#", "");
    if (h.length === 3) h = h.split("").map(function(c){ return c + c; }).join("");
    var n = parseInt(h, 16);
    if (isNaN(n)) { h = "555"; n = parseInt(h, 16); }
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
  }
  function _renderThroughChip(layer, ns, x, y, lineObj, iconSize, mobile) {
    var sz = _throughChipSize(lineObj, mobile);
    var label = sz.label;
    var w = sz.w - 2, h = sz.h;
    var lc = lineObj.color || "#555";
    var bg = document.createElementNS(ns, "rect");
    bg.setAttribute("x", x - 1);
    bg.setAttribute("y", y - 2);
    bg.setAttribute("width", w);
    bg.setAttribute("height", h);
    bg.setAttribute("rx", "3");
    bg.setAttribute("fill", _hexToRgba(lc, 0.16));
    bg.setAttribute("stroke", lc);
    bg.setAttribute("stroke-width", "1");
    layer.appendChild(bg);
    // Direction arrow drawn as an inline SVG path (vector, immune to font
    // glyph availability): up=∧ / down=∨ / middle=<, stroke in the line colour.
    var dir = lineObj.dir || "middle";
    var ay = y + (mobile ? 9 : 6);
    var _ax = x + 5;
    var arrowD = "";
    if (dir === "up") {
      arrowD = "M" + (_ax - 3) + "," + (ay + 4) + " L" + _ax + "," + (ay - 3) + " L" + (_ax + 3) + "," + (ay + 4);
    } else if (dir === "down") {
      arrowD = "M" + (_ax - 3) + "," + (ay - 3) + " L" + _ax + "," + (ay + 4) + " L" + (_ax + 3) + "," + (ay - 3);
    } else {
      arrowD = "M" + (_ax + 3) + "," + (ay - 3) + " L" + (_ax - 3) + "," + ay + " L" + (_ax + 3) + "," + (ay + 3);
    }
    var arr = document.createElementNS(ns, "path");
    arr.setAttribute("d", arrowD);
    arr.setAttribute("fill", "none");
    arr.setAttribute("stroke", lc);
    arr.setAttribute("stroke-width", mobile ? 2 : 1.8);
    arr.setAttribute("stroke-linecap", "round");
    arr.setAttribute("stroke-linejoin", "round");
    layer.appendChild(arr);
    var txt = document.createElementNS(ns, "text");
    txt.setAttribute("x", x + 12);
    txt.setAttribute("y", y + (mobile ? 12 : 9));
    txt.setAttribute("font-size", mobile ? 12 : 10);
    txt.setAttribute("fill", lc);
    txt.setAttribute("font-weight", "700");
    txt.textContent = label;
    layer.appendChild(txt);
    return w + 2; // consumed width (for flow layout advance)
  }
  
  /**
   * Compute route geometry for a line - single source of truth for all station coordinates.
   * Result is cached and only recomputed when line changes.
   * @param {Object} line - Line object with stations, type, color, etc.
   * @param {string} lineId - Line ID
   * @returns {Object} Geometry object with stations, svgW, svgH, isLoop, isSixShapedLoop, etc.
   */
  /**
   * Find shared (parallel track) sections with other lines.
   * Industry standard (Tokyo Metro official map): shared sections are drawn as
   * twin parallel lines in each line's own colour.
   */
  // 真正線路共用（同一軌道を複数路線が運行）——站点重合 ≠ 共线。
  // 只有以下线对才画并行双线（industry-standard 線路共用区間）:
  //   Yurakucho x Fukutoshin : 和光市-池袋（氷川台・小竹向原含む全9駅、公式駅順、2026-09-07 データ修正）
  //   Namboku x Mita        : 目黒-白金高輪
  var _SHARED_TRACK_PAIRS = {
    'Yurakucho': ['Fukutoshin'],
    'Fukutoshin': ['Yurakucho'],
    'Namboku': ['Mita'],
    'Mita': ['Namboku']
  };
  function _findSharedSegments(line, allLines) {
    var lineId = line.id || line.lineId || line.name;
    var stLines = {};
    var lids = Object.keys(allLines);
    for (var li = 0; li < lids.length; li++) {
      var ll = allLines[lids[li]];
      if (!ll || !ll.stations) continue;
      for (var si = 0; si < ll.stations.length; si++) {
        (stLines[ll.stations[si]] = stLines[ll.stations[si]] || []).push(lids[li]);
      }
    }
    var stations = line.stations || [];
    var segs = [], cur = null;
    for (var i = 0; i < stations.length - 1; i++) {
      var la = stLines[stations[i]] || [], lb = stLines[stations[i + 1]] || [];
      var allowed = _SHARED_TRACK_PAIRS[lineId] || [];
      var shared = null;
      for (var k = 0; k < la.length; k++) {
        if (la[k] !== lineId && allowed.indexOf(la[k]) >= 0 && lb.indexOf(la[k]) >= 0) { shared = la[k]; break; }
      }
      if (shared) {
        if (cur && cur.partner === shared && cur.end === i) { cur.end = i + 1; }
        else { if (cur) segs.push(cur); cur = { partner: shared, start: i, end: i + 1 }; }
      } else { if (cur) { segs.push(cur); cur = null; } }
    }
    if (cur) segs.push(cur);
    return segs;
  }

  function computeRouteGeometry(line, lineId) {
    // Check cache first
    if (_routeGeometryCache[_geomKey(lineId)] && _routeGeometryCache[_geomKey(lineId)].lineHash === _computeLineHash(line)) {
      return _routeGeometryCache[_geomKey(lineId)];
    }
    
    var stations = line.stations || [];
    var color = line.color || "#008803";
    var isLoop = line.type === "loop";
    var isSixShapedLoop = line.isSixShapedLoop === true;
    // Transfer map for interchange station icons (single source; read-only)
    var transferMap = _getTransferMap(lineId);
    // Room for boxed through-service labels at line ends: ∧ label sits ABOVE the
    // start station, ∨ label BELOW the last station.
    var thrTopPad = 0, thrBotPad = 0;
    if (stations.length > 1) {
      if (_throughDirForStation(lineId, stations[0])) thrTopPad = 26;
      if (_throughDirForStation(lineId, stations[stations.length - 1])) thrBotPad = 26;
    }
    var _stN = stations.length;
    var sp = (_isMobileView()
      ? (_stN <= 20 ? 72 : _stN <= 30 ? 66 : _stN <= 50 ? 60 : 56)
      : (_stN <= 20 ? 62 : _stN <= 30 ? 58 : _stN <= 50 ? 54 : 50)),
      topP = 18 + thrTopPad, botP = 16 + thrBotPad;
    
    // Get branch lines
    var allLines = getLinesData();
    var branchLines = [];
    for (var bid in allLines) {
      if (allLines[bid].branchOf === lineId && bid !== lineId) {
        var bl = allLines[bid];
        branchLines.push({ id: bid, name: bl.name || bid, color: (window.LineOperationSystemsResolveColor && window.LineOperationSystemsResolveColor(bid)) || bl.color || color, stations: bl.stations });
      }
    }
    var branchOffset = branchLines.length > 0 ? GEOM.BRANCH_COL_W * branchLines.length : 0;
    // Branch name label sits 26px above the junction station (industry-standard
    // branch annotation). Reserve headroom when the junction is the first station.
    if (branchLines.length > 0) {
      for (var _b1 = 0; _b1 < branchLines.length; _b1++) {
        if (branchLines[_b1].stations && branchLines[_b1].stations.length > 0 && stations.indexOf(branchLines[_b1].stations[0]) === 0) {
          topP += 26; break;
        }
      }
    }
    
    var svgW, svgH;
    var stationCoords = []; // Array of {x, y, side, stationId}
    var routeElements = []; // SVG elements for route lines (static layer)
    
    if (isSixShapedLoop && stations.length > 2) {
      // Six-shaped loop: "loop + tail" structure (not two loops)
      // Hikarigaoka direction = open vertical tail, Tochomae direction = closed rectangular loop
      var hikarigaokaIdx = stations.indexOf("Hikarigaoka");
      if (hikarigaokaIdx === -1) hikarigaokaIdx = Math.floor(stations.length / 3);
      
      var hikarigaokaStations = stations.slice(0, hikarigaokaIdx + 1); // [0]=Tochomae (junction)
      var loopStations = [stations[0]].concat(stations.slice(hikarigaokaIdx + 1));
      
      // ============ Size calculation ============
      // Mobile-first: viewBox width must equal container width so the SVG renders 1:1
      // (no squeeze -> real font size == declared font size). Vertical params stay fixed.
      var _cw6 = ((typeof document !== "undefined" && document.querySelector("#trainsMapContainer")) || {}).clientWidth || 410;
      var _cw6Content = _isMobileView() ? Math.max(_cw6 - 16, 320) : _cw6;
      // v4.3.483c: 缩放系数对齐山手线 loopScale（移动 1.5 / 桌面 1.6）。
      // v4.3.496: 用户裁定环线标准宽度——六形环圆环部分与山手线统一（48 基准，移动 72px/桌面 76.8px）。
      var scale6 = _isMobileView() ? 1.5 : 1.6;
      var spLoop6 = 26 * scale6;
      var loopRectW = 48 * scale6; // v4.3.496: 环宽对齐山手线标准（48 基准），给光丘尾留水平空间
      var loopRectH = Math.max(loopStations.length * spLoop6 - 40 * scale6, 200 * scale6);
      
      var leftMargin = 8 * scale6;
      var marginRight = 20 * scale6 + (_isMobileView() ? 36 : 12);
      var marginTopBot = 40 * scale6;
      // v4.3.482: tail 列宽与直线支线同源（GEOM.BRANCH_COL_W × 本图缩放系数）。
      // 移动端容器是 1:1 硬约束，tail 列让位给环（保底 BRANCH_COL_W×1.1 ≈ 现状 105px）。
      var _tailCap = _isMobileView() ? GEOM.BRANCH_COL_W * scale6 : GEOM.BRANCH_COL_W * 1.6;
      var tailAreaWidth = Math.min(_tailCap,
                                   Math.max(GEOM.BRANCH_COL_W * 1.1,
                                            _cw6Content - leftMargin - loopRectW - marginRight));
      
      var naturalW = leftMargin + tailAreaWidth + loopRectW + marginRight;
      if (_isMobileView() && naturalW > _cw6Content) {
        loopRectW = Math.max(_cw6Content - leftMargin - tailAreaWidth - marginRight, 48 * scale6);
      }
      svgW = leftMargin + tailAreaWidth + loopRectW + marginRight;
      svgH = loopRectH + marginTopBot * 2;
      
      // ============ Geometry calculation ============
      // Loop center - derived from svg size, not independently set
      var loopCx = svgW - marginRight - loopRectW / 2;
      var loopCy = svgH / 2;
      var loopHalfW = loopRectW / 2;
      var loopHalfH = loopRectH / 2;
      
      // Junction (Tochomae) - MUST be derived from loop rectangle position formula
      // = loop left edge + vertical midpoint (guarantees perfect alignment, no gaps)
      var junctionX = loopCx - loopHalfW;
      var junctionY = loopCy;
      
      // Stub: short horizontal segment from loop side (creates "branching from loop side" realism)
      // stubX = tail 列 x 位置（画布左缘 + 边距 10px），分叉引出段 = junctionX→stubX 水平线
      var stubX = leftMargin + 10 * scale6;
      var stubY = junctionY;
      
      // Tail: vertical line going up, stations arranged along vertical line
      var tailCount = hikarigaokaStations.length - 1;
      var tailTotalHeight = tailCount > 0 ? Math.min(loopRectH * 0.85, tailCount * spLoop6) + 32 : 0;
      var tailStep = tailCount > 0 ? tailTotalHeight / tailCount : 0;
      
      // Tail station coordinates: first = junction, rest = along vertical line at stubX
      var hikarigaokaLinePts = [{ x: junctionX, y: junctionY, side: 'left', stationId: hikarigaokaStations[0] }];
      for (var i = 1; i < hikarigaokaStations.length; i++) {
        hikarigaokaLinePts.push({ 
          x: stubX, 
          y: stubY - i * tailStep, 
          side: 'left', 
          stationId: hikarigaokaStations[i] 
        });
      }
      
      // Loop station coordinates (perimeter calculation)
      var perimeter = 2 * (loopRectW + loopRectH);
      var startOffset = 2 * loopRectW + 1.5 * loopRectH;
      var loopPts6 = [];
      for (var i = 0; i < loopStations.length; i++) {
        var pos = ((i / loopStations.length) * perimeter + startOffset) % perimeter;
        var lx, ly, side;
        if (pos < loopRectW) { 
          lx = loopCx - loopHalfW + pos; 
          ly = loopCy - loopHalfH; 
          side = "top"; 
        } else if (pos < loopRectW + loopRectH) { 
          lx = loopCx + loopHalfW; 
          ly = loopCy - loopHalfH + (pos - loopRectW); 
          side = "right"; 
        } else if (pos < 2 * loopRectW + loopRectH) { 
          lx = loopCx + loopHalfW - (pos - loopRectW - loopRectH); 
          ly = loopCy + loopHalfH; 
          side = "bottom"; 
        } else { 
          lx = loopCx - loopHalfW; 
          ly = loopCy + loopHalfH - (pos - 2 * loopRectW - loopRectH); 
          side = "left"; 
        }
        loopPts6.push({ x: lx, y: ly, side: side, stationId: loopStations[i] });
      }
      // Override first station (junction) with exact coordinates derived from loop formula
      loopPts6[0].x = junctionX;
      loopPts6[0].y = junctionY;
      loopPts6[0].side = "left";
      
      // Combine all station coords (tail stations first, then loop stations excluding junction)
      stationCoords = hikarigaokaLinePts.concat(loopPts6.slice(1));
      
      // ============ Route elements for static layer ============
      // Main loop rectangle (heavier visual weight = primary)
      routeElements.push({
        type: 'rect',
        attrs: { 
          x: loopCx - loopHalfW, 
          y: loopCy - loopHalfH, 
          width: loopRectW, 
          height: loopRectH, 
          rx: 12, 
          ry: 12, 
          stroke: color, 
          'stroke-width': 5, 
          fill: 'none', 
          opacity: 0.4 
        }
      });
      
      // Stub: short horizontal line from loop side (lighter visual weight)
      routeElements.push({
        type: 'line',
        attrs: { 
          x1: junctionX, 
          y1: junctionY, 
          x2: stubX, 
          y2: stubY, 
          stroke: color, 
          'stroke-width': 3, 
          opacity: 0.5 
        }
      });
      
      // Tail: vertical line (lighter visual weight = secondary)
      if (hikarigaokaLinePts.length > 1) {
        var tailTopY = hikarigaokaLinePts[hikarigaokaLinePts.length - 1].y;
        routeElements.push({
          type: 'line',
          attrs: { 
            x1: stubX, 
            y1: stubY, 
            x2: stubX, 
            y2: tailTopY, 
            stroke: color, 
            'stroke-width': 4, 
            'stroke-linecap': 'round', 
            opacity: 0.4 
          }
        });
      }
      
    } else if (isLoop && stations.length > 2) {
      // Standard loop
      var loopScale = _isMobileView() ? 1.5 : 1.6;
      var loopRectH = Math.max(stations.length * 36 / 2 - 80, 140) * loopScale;
      // v4.3.495: 双列基准再缩减 50%（96→48）；svgW 派生式（rectW+150×scale）自动跟随，
      // 两侧站名空间恒 75×scale 不变。移动 rectW 72px/svgW 297px，桌面 76.8px/316.8px。
      var rectW = 48 * loopScale, rectH = loopRectH;
      svgW = rectW + 150 * loopScale;
      svgH = loopRectH + 80 * loopScale;
      var cx = svgW / 2, cy = svgH / 2;
      var isDoubleColumnLoop = line.isDoubleColumnLoop === true;
      var halfW = rectW / 2, halfH = rectH / 2;
      var loopPts = [];
      var i, _t;
      if (isDoubleColumnLoop) {
        // JR-official: 30 stations split 15 per column, no station at the
        // bottom center — wide open middle. Right column (top->bottom):
        // Tabata..Tokyo..Shinagawa. Left column (top->bottom): Komagome..Osaki.
        // Vertical pitch adapts to the tallest interchange chip in each column
        // (name 16 + 3px gap + chip rows + 6px margin) so nothing overlaps.
        var _rightSeq = [8,7,6,5,4,3,2,1,0,29,28,27,26,25,24];
        var _colPitch = function(ids) {
          var mx = 16 + 6 + 22 + 12;
          for (var k = 0; k < ids.length; k++) {
            var _txN = (transferMap[ids[k]] || []).filter(function(t) { return !t.through; }).length;
            var _rows = Math.ceil(Math.min(_txN, 8) / 4);
            mx = Math.max(mx, 16 + 6 + _rows * 22 + 12);
          }
          return mx;
        };
        var _rightIds = _rightSeq.map(function(si) { return stations[si]; });
        var _leftIds = [];
        for (var _li0 = 0; _li0 < 15; _li0++) _leftIds.push(stations[9 + _li0]);
        var _pitch = Math.max(_colPitch(_rightIds), _colPitch(_leftIds));
        var _needH = _pitch * 14;
        if (_needH > loopRectH) {
          rectH = _needH;
          halfH = rectH / 2;
          svgH = rectH + 100 * loopScale;
          cy = svgH / 2;
        }
        for (var ri = 0; ri < _rightSeq.length; ri++) {
          var _tR = (ri + 0.5) / _rightSeq.length;
          loopPts.push({ x: cx + halfW, y: cy - halfH + _tR * rectH, side: "right", stationId: stations[_rightSeq[ri]] });
        }
        for (var li = 0; li < 15; li++) {
          var _tL = (li + 0.5) / 15;
          loopPts.push({ x: cx - halfW, y: cy - halfH + _tL * rectH, side: "left", stationId: stations[9 + li] });
        }
      } else {
        var perimeter = 2 * (rectW + rectH);
        var startOffset = rectW / 2;
        for (i = 0; i < stations.length; i++) {
          var pos = ((i / stations.length) * perimeter + startOffset) % perimeter;
          var lx, ly, side;
          if (pos < rectW) { lx = cx - halfW + pos; ly = cy - halfH; side = "top"; }
          else if (pos < rectW + rectH) { lx = cx + halfW; ly = cy - halfH + (pos - rectW); side = "right"; }
          else if (pos < 2 * rectW + rectH) { lx = cx + halfW - (pos - rectW - rectH); ly = cy + halfH; side = "bottom"; }
          else { lx = cx - halfW; ly = cy + halfH - (pos - 2 * rectW - rectH); side = "left"; }
          loopPts.push({ x: lx, y: ly, side: side, stationId: stations[i] });
        }
      }
      stationCoords = loopPts;
      
      routeElements.push({
        type: 'rect',
        attrs: { x: cx - halfW, y: cy - halfH, width: rectW, height: rectH, rx: 10, ry: 10, stroke: color, 'stroke-width': 5, fill: 'none', opacity: 0.35 }
      });
      
    } else {
      // Standard linear line: widen the canvas so left (names) and right (icons) both get used
      var isMobileView = _isMobileView();
      var _cw = ((typeof document !== "undefined" && document.querySelector("#trainsMapContainer")) || {}).clientWidth || 820;
      // v4.3.482: 主线中心固定（不随支线数左移），画布 = 主线区 + 支线区。
      // 支线列宽统一 GEOM.BRANCH_COL_W；画布只扩到实际需要，避免移动端整体缩放变小。
      var _baseW = (_isMobileView() ? GEOM.MAIN_BASE_W_MOBILE : Math.min(Math.max(_cw, GEOM.MAIN_BASE_W_MIN), GEOM.MAIN_BASE_W_MAX));
      var mainCx = _baseW / 2;
      var _rightPad = isMobileView ? 24 : 40;
      svgW = Math.max(_baseW, mainCx + GEOM.BRANCH_STUB + branchOffset + _rightPad);
      
      var _iconStep = (isMobileView ? 20 : 16) + 2;
      var _extraY = 0;
      for (var i = 0; i < stations.length; i++) {
        var _txs = (transferMap[stations[i]] || []).filter(function(t) { return !t.through; });
        var _rowsN = Math.ceil(Math.min(_txs.length, 8) / 4);
        stationCoords.push({ x: mainCx, y: topP + i * sp + _extraY, side: 'dual', stationId: stations[i] });
        if (_rowsN > 1) _extraY += (_rowsN - 1) * _iconStep;
      }
      // svgH must be computed AFTER stationCoords is populated (with the
      // per-station 2-row chip compensation) or the viewBox clips the line.
      svgH = (stationCoords.length ? stationCoords[stationCoords.length - 1].y : topP) + sp + botP;
      var y1 = topP, y2 = stationCoords.length ? stationCoords[stationCoords.length - 1].y : (topP + (stations.length - 1) * sp);
      routeElements.push({
        type: 'line',
        attrs: { x1: mainCx, y1: y1, x2: mainCx, y2: y2, stroke: color, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.35 }
      });
      // v4.3.409/4.3.422: 融合机制——直通运行系统延伸段几何（如横須賀線・総武快速線）
      // 延伸线接主线端点（東京站）后沿同一垂直方向、同一列继续排布（一条连续线）；
      // 列车索引 = baseIdx + 延伸线站表索引
      var fusionMap = {};
      var _extLines = _fusionExtensionLines(lineId);
      if (_extLines && _extLines.length > 0) {
        var extOffsetX = 0; // 4.3.422: 同列延伸（用户指示"为一条线"），不再另起右列
        var yBase = stationCoords.length ? stationCoords[stationCoords.length - 1].y : topP;
        var yStartRef = topP;
        for (var exi = 0; exi < _extLines.length; exi++) {
          var exl = _extLines[exi];
          var exLine = allLines[exl.lid];
          if (!exLine || !exLine.stations) continue;
          var exSt = exLine.stations;
          var exColor = (window.LineOperationSystemsResolveColor && window.LineOperationSystemsResolveColor(exl.lid)) || exLine.color || "#888";
          // 延伸站 = 去掉与主线共享的接续站（主线末站/首站）
          var extStations = exl.joinAtEnd ? exSt.slice(1) : exSt.slice(0, -1);
          if (extStations.length === 0) continue;
          var extStartY = exl.joinAtEnd ? yBase : yStartRef;
          var extBaseIdx = stationCoords.length;
          for (var exk = 0; exk < extStations.length; exk++) {
            var exY = exl.joinAtEnd ? (extStartY + (exk + 1) * sp) : (extStartY - (exk + 1) * sp);
            stationCoords.push({ x: mainCx + extOffsetX, y: exY, side: 'right', stationId: extStations[exk], fusionLineId: exl.lid });
          }
          // 连接线：主线端点 → 延伸段第一站（同列时即为垂直连续线）
          var jx = mainCx, jy = exl.joinAtEnd ? yBase : yStartRef;
          var exFirstY = exl.joinAtEnd ? (yBase + sp) : (yStartRef - sp);
          routeElements.push({ type: 'line', attrs: { x1: jx, y1: jy, x2: mainCx + extOffsetX, y2: jy, stroke: exColor, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.5 } });
          routeElements.push({ type: 'line', attrs: { x1: mainCx + extOffsetX, y1: jy, x2: mainCx + extOffsetX, y2: exFirstY, stroke: exColor, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.5 } });
          // 延伸段站内连线
          for (var exk2 = 0; exk2 < extStations.length - 1; exk2++) {
            var yA = exl.joinAtEnd ? (extStartY + (exk2 + 1) * sp) : (extStartY - (exk2 + 1) * sp);
            var yB = exl.joinAtEnd ? (extStartY + (exk2 + 2) * sp) : (extStartY - (exk2 + 2) * sp);
            routeElements.push({ type: 'line', attrs: { x1: mainCx + extOffsetX, y1: yA, x2: mainCx + extOffsetX, y2: yB, stroke: exColor, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.5 } });
          }
          // 延伸段标题标签
          var _exName = (window.RailwayDB && window.RailwayDB.resolveLineName) ? window.RailwayDB.resolveLineName(exl.lid, window.currentLang) || exl.lid : exl.lid;
          routeElements.push({ type: 'text', attrs: { x: mainCx + extOffsetX, y: exl.joinAtEnd ? (extStartY + (extStations.length + 1) * sp) : (extStartY - (extStations.length + 1) * sp), 'text-anchor': 'middle', 'font-size': '12', fill: exColor, 'font-weight': '600' }, text: _exName });
          fusionMap[exl.lid] = { baseIdx: extBaseIdx, joinAtEnd: exl.joinAtEnd, stationCount: extStations.length };
        }
        // svg 尺寸扩展：同列延伸只扩展高度（站名沿用主线站名区宽度）
        if (stationCoords.length) {
          var _lastY = stationCoords[stationCoords.length - 1].y;
          svgH = Math.max(svgH, _lastY + sp + botP);
          var _minY = Math.min.apply(null, stationCoords.map(function(c) { return c.y; }));
          svgH = Math.max(svgH, _minY + sp * 2 + botP);
        }
      }
      // Twin parallel line for shared sections (industry standard)
      var sharedSegs = _findSharedSegments(line, allLines);
      for (var si = 0; si < sharedSegs.length; si++) {
        var sseg = sharedSegs[si];
        var pColor = (window.LineOperationSystemsResolveColor && window.LineOperationSystemsResolveColor(sseg.partner)) || (allLines[sseg.partner] && allLines[sseg.partner].color) || "#888";
        routeElements.push({
          type: 'line',
          attrs: { x1: mainCx - 7, y1: topP + sseg.start * sp, x2: mainCx - 7, y2: topP + sseg.end * sp, stroke: pColor, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.55 }
        });
      }
    }
    
    // Branch geometry for realtime train placement (kept separate from main line
    // so branch trains render on their own station column, visually distanced)
    var branchGeom = null;
    if (branchLines.length > 0 && stationCoords.length > 0) {
      branchGeom = {};
      for (var bgi = 0; bgi < branchLines.length; bgi++) {
        var _br = branchLines[bgi];
        if (!_br.stations || _br.stations.length === 0) continue;
        var _jIdx = -1;
        for (var _ji2 = 0; _ji2 < stationCoords.length; _ji2++) {
          if (stationCoords[_ji2].stationId === _br.stations[0]) { _jIdx = _ji2; break; }
        }
        if (_jIdx < 0) continue;
        var _bx = stationCoords[_jIdx].x + GEOM.BRANCH_STUB + bgi * GEOM.BRANCH_COL_W;
        var _by = stationCoords[_jIdx].y;
        var _bsp = sp || 24;
        var _bcoords = [];
        for (var _bsi = 0; _bsi < _br.stations.length; _bsi++) {
          _bcoords.push({ stationId: _br.stations[_bsi], x: _bx, y: _by + _bsi * _bsp });
        }
        branchGeom[_br.id] = _bcoords;
      }
    }

    // Build geometry object
    var geometry = {
      lineId: lineId,
      lineHash: _computeLineHash(line),
      stations: stations,
      stationCoords: stationCoords,
      svgW: svgW,
      svgH: svgH,
      isLoop: isLoop,
      isSixShapedLoop: isSixShapedLoop,
      sp: sp,
      color: color,
      branchLines: branchLines,
      branchOffset: branchOffset,
      branchGeom: branchGeom,
      routeElements: routeElements,
      junctionStation: isSixShapedLoop ? stations[0] : null,
      junctionX: isSixShapedLoop ? junctionX : null,
      fusionMap: fusionMap || null
    };
    
    // Cache it
    _routeGeometryCache[_geomKey(lineId)] = geometry;
    
    return geometry;
  }
  
  function _computeLineHash(line) {
    // Simple hash based on stations and type
    return (line.stations || []).join('|') + '|' + (line.type || '') + '|' + (line.isSixShapedLoop ? '6' : '0') + '|' + (line.isDoubleColumnLoop ? 'D' : '0');
  }
  
  function invalidateRouteGeometryCache(lineId) {
    if (lineId) {
      delete _routeGeometryCache[_geomKey(lineId)];
    } else {
      _routeGeometryCache = {};
    }
  }
  
  // === Unified station renderer (main line & branch share the same style) ===
  // v4.3.449: 主線/支線の区別は geometry（座標・side・色）のみに残し、駅・ラベル・
  // 乗換チップ・直通チップの描画はこの関数一本で統一。支線駅も主線駅と同一スタイル。
  function _renderStationNode(staticLayer, svgNS, o) {
    var color = o.color;
    var isJunction = !!o.isJunction;
    var isMobileView = o.isMobileView;
    var side = o.side || "right";
    var geometry = o.geometry || {};
    var svgW = o.svgW;
    var svgH = o.svgH;

    // Station circle
    var circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", o.x);
    circle.setAttribute("cy", o.y);
    circle.setAttribute("r", isJunction ? "12" : "7"); // v4.3.499: 站圆点放大 ≥70%（普通 4→7 / 换乘 7→12）
    circle.setAttribute("fill", isJunction ? color : "#fff");
    circle.setAttribute("stroke", isJunction ? "#fff" : color);
    circle.setAttribute("stroke-width", isJunction ? "2.5" : "2");
    circle.setAttribute("data-station-index", o.si);
    staticLayer.appendChild(circle);

    // Station label position (o.tx/o.ty/o.anchor overrides win; otherwise derive from side)
    var tx, ty, anchor;
    // v4.3.500: 站名与圆点同行，垂直居中对齐（dominant-baseline central，ty=圆心）
    if (o.tx != null) { tx = o.tx; ty = o.ty; anchor = o.anchor || "start"; }
    else if (side === "top") { tx = o.x; ty = o.y - (isJunction ? 14 : 10); anchor = "middle"; }
    else if (side === "bottom") { tx = o.x; ty = o.y + (isJunction ? 19 : 15); anchor = "middle"; }
    else if (side === "left" && geometry.isSixShapedLoop) { tx = o.x + (isJunction ? 14 : 10); ty = o.y; anchor = "start"; }
    else if (side === "left") { tx = o.x - (isJunction ? 14 : 10); ty = o.y; anchor = "end"; }
    else if (side === "dual") { tx = o.x - (isJunction ? 16 : 12); ty = o.y; anchor = "end"; }
    else if (side === "right" && geometry.isSixShapedLoop) { tx = o.x - (isJunction ? 14 : 10); ty = o.y; anchor = "end"; }
    else { tx = o.x + (isJunction ? 14 : 10); ty = o.y; anchor = "start"; }

    var label = document.createElementNS(svgNS, "text");
    label.setAttribute("x", tx);
    label.setAttribute("y", ty);
    var _pcFsC = "16";
    var _pcFsJ = "16";
    var _pcFs = "16";
    var _lblCompact = (side === "top" || side === "bottom");
    label.setAttribute("font-size", _lblCompact ? (isMobileView ? "16" : _pcFsC) : (isJunction ? (isMobileView ? "16" : _pcFsJ) : (isMobileView ? "16" : _pcFs)));
    label.setAttribute("fill", isJunction ? color : "#555");
    label.setAttribute("font-family", "Fusion Pixel, 'Courier New', monospace"); // v4.3.498: 站名用像素字体（与全局一致）
    label.setAttribute("font-weight", isJunction ? "700" : "500");
    label.setAttribute("text-anchor", anchor);
    // v4.3.500: 左右侧站名垂直居中于圆点（top/bottom 保持基线在圆点上下方）
    if (side !== "top" && side !== "bottom") label.setAttribute("dominant-baseline", "central");
    var _clampAvail = (side === "dual" || side === "left") ? (tx - 4) : ((side === "right") ? (svgW - 2 - tx) : 0);
    if (geometry.isSixShapedLoop) {
      if (geometry.junctionX === null || o.x >= geometry.junctionX) {
        // Loop stations: name area = half the loop width (shared by both sides)
        var _sc6 = isMobileView ? 1.5 : 1.3;
        var _m6r = isMobileView ? 66 : (20 * _sc6 + 12);
        var _tw6 = 70 * _sc6;
        var _lm6 = 8 * _sc6;
        var _loopW6 = svgW - _lm6 - _tw6 - _m6r;
        _clampAvail = Math.max(40, Math.floor(_loopW6 / 2) - 10);
      } else if (side === "left") {
        // v4.3.482: Tail stations (光丘方向) name flows RIGHT from stubX toward
        // the loop's left edge. The generic branch above wrongly used tx-4
        // (space to the left, ~31px) which crushed every tail label to 40px.
        _clampAvail = Math.max(40, Math.floor(geometry.junctionX - tx - 4));
      }
    }
    if (_clampAvail > 0) label.setAttribute("data-clamp-avail", String(Math.max(40, Math.round(_clampAvail))));

    // Station name
    var stationName = (o.rS || function(id){ return id; })(o.stationId);
    var nameTspan = document.createElementNS(svgNS, "tspan");
    nameTspan.textContent = stationName;
    label.appendChild(nameTspan);
    staticLayer.appendChild(label);

    // Interchange line icons (grouped in a rounded background chip below the label)
    if (o.skipTx) return;
    var transferMap = o.transferMap || {};
    var txLines = transferMap[o.stationId] || [];
    if (txLines.length > 0) {
      var isCompact = (side === "top" || side === "bottom");
      var ICON = 16; // v4.3.497: 换乘图标统一 16px（与站名字号一致，用户尝试）
      var GAP = 2;
      var PER_ROW = 4;
      var MAX_ROWS = 2;
      var maxShow = PER_ROW * MAX_ROWS;
      var nonThru = txLines.filter(function(t) { return !t.through; });
      var shown = nonThru.slice(0, maxShow);
      var rows = Math.ceil(shown.length / PER_ROW);
      var _rowWAt = function(r) {
        var acc = 0;
        var from = r * PER_ROW, to = Math.min((r + 1) * PER_ROW, shown.length);
        for (var k = from; k < to; k++) {
          var it = shown[k];
          acc += (it.image ? ICON : (((it.name || "").length) * (isMobileView ? 11 : 6) + 4)) + GAP;
        }
        return acc > 0 ? acc - GAP : 0;
      };
      var maxRowW = 0;
      for (var rw_ = 0; rw_ < rows; rw_++) maxRowW = Math.max(maxRowW, _rowWAt(rw_));
      var rowW = rows > 0 ? _rowWAt(rows - 1) : 0;
      var moreText = nonThru.length > maxShow ? "+" + (nonThru.length - maxShow) : "";
      var totalW = maxRowW + (moreText ? 12 : 0);
      var ix0, iy0;
      iy0 = (side === "top") ? (o.y + 14) : (ty + (isJunction ? 14 : 9)); // v4.3.500: chip 在站名下方，避让圆点底缘（+2px）
      if (iy0 < 2) iy0 = 2;
      // v4.3.501 对齐规则（用户规定）：换乘图标块必须有一边与站名文字侧边对齐——
      // 站名在圆点右侧（anchor=start）→ chip 左缘=文字左缘；站名在左侧（anchor=end）→
      // chip 右缘=文字右缘；顶底站名（anchor=middle）→ chip 居中于文字。
      if (anchor === "end") { ix0 = tx - totalW; }
      else if (anchor === "start") { ix0 = tx; }
      else { ix0 = tx - totalW / 2; }
      if ((side === "left" || side === "dual") && ix0 < 2) {
        PER_ROW = 3;
        shown = nonThru.slice(0, PER_ROW * MAX_ROWS);
        rows = Math.ceil(shown.length / PER_ROW);
        maxRowW = 0;
        for (var rw_2 = 0; rw_2 < rows; rw_2++) maxRowW = Math.max(maxRowW, _rowWAt(rw_2));
        moreText = nonThru.length > PER_ROW * MAX_ROWS ? "+" + (nonThru.length - PER_ROW * MAX_ROWS) : "";
        totalW = maxRowW + (moreText ? 12 : 0);
        ix0 = tx - totalW;
        if (ix0 < 2) {
          PER_ROW = 2;
          shown = nonThru.slice(0, PER_ROW * MAX_ROWS);
          rows = Math.ceil(shown.length / PER_ROW);
          maxRowW = 0;
          for (var rw_2 = 0; rw_2 < rows; rw_2++) maxRowW = Math.max(maxRowW, _rowWAt(rw_2));
          moreText = nonThru.length > PER_ROW * MAX_ROWS ? "+" + (nonThru.length - PER_ROW * MAX_ROWS) : "";
          totalW = maxRowW + (moreText ? 12 : 0);
          ix0 = tx - totalW;
        }
        if (ix0 < 2) ix0 = 2;
      }
      if ((side === "right" || side === "dual") && ix0 + totalW > svgW - 2) {
        PER_ROW = 3;
        shown = nonThru.slice(0, PER_ROW * MAX_ROWS);
        rows = Math.ceil(shown.length / PER_ROW);
        maxRowW = 0;
        for (var rw_2 = 0; rw_2 < rows; rw_2++) maxRowW = Math.max(maxRowW, _rowWAt(rw_2));
        moreText = nonThru.length > PER_ROW * MAX_ROWS ? "+" + (nonThru.length - PER_ROW * MAX_ROWS) : "";
        totalW = maxRowW + (moreText ? 12 : 0);
        ix0 = tx;
        if (ix0 + totalW > svgW - 2) {
          PER_ROW = 2;
          shown = nonThru.slice(0, PER_ROW * MAX_ROWS);
          rows = Math.ceil(shown.length / PER_ROW);
          maxRowW = 0;
          for (var rw_2 = 0; rw_2 < rows; rw_2++) maxRowW = Math.max(maxRowW, _rowWAt(rw_2));
          moreText = nonThru.length > PER_ROW * MAX_ROWS ? "+" + (nonThru.length - PER_ROW * MAX_ROWS) : "";
          totalW = maxRowW + (moreText ? 12 : 0);
          ix0 = tx;
        }
        if (ix0 + totalW > svgW - 2) ix0 = svgW - 2 - totalW;
      }
      var bgH = 0;
      for (var r_ = 0; r_ < rows; r_++) {
        var _rowImg = false;
        for (var c_ = r_ * PER_ROW; c_ < Math.min((r_ + 1) * PER_ROW, shown.length); c_++) {
          if (shown[c_].image) { _rowImg = true; break; }
        }
        bgH += (_rowImg ? ICON + 2 : 15);
      }
      if (rows > 1) bgH += (rows - 1) * GAP;
      var bg = document.createElementNS(svgNS, "rect");
      bg.setAttribute("x", ix0 - 1);
      bg.setAttribute("y", iy0 - 1);
      bg.setAttribute("width", totalW + 2);
      bg.setAttribute("height", bgH);
      bg.setAttribute("rx", "3");
      bg.setAttribute("fill", "rgba(255,255,255,0.72)");
      staticLayer.appendChild(bg);
      {
        var _rowCur = null;
        for (var ti2 = 0; ti2 < shown.length; ti2++) {
          var txl = shown[ti2];
          var row = Math.floor(ti2 / PER_ROW);
          var col = ti2 % PER_ROW;
          if (col === 0) _rowCur = ix0;
          var tix = _rowCur;
          var tiy = iy0 + row * (ICON + GAP);
          if (txl.image) {
            var tImg = document.createElementNS(svgNS, "image");
            tImg.setAttribute("href", txl.image);
            tImg.setAttribute("xlink:href", txl.image);
            tImg.setAttribute("x", tix);
            tImg.setAttribute("y", tiy);
            tImg.setAttribute("width", ICON);
            tImg.setAttribute("height", ICON);
            tImg.setAttribute("opacity", "0.95");
            var tTitle = document.createElementNS(svgNS, "title");
            tTitle.textContent = _throughBadgeText(txl);
            tImg.appendChild(tTitle);
            staticLayer.appendChild(tImg);
          } else {
            var tTxt = document.createElementNS(svgNS, "text");
            tTxt.setAttribute("x", tix);
            tTxt.setAttribute("y", tiy + 10);
            tTxt.setAttribute("font-size", isCompact ? (isMobileView ? "9" : "6") : (isMobileView ? "11" : "6"));
            tTxt.setAttribute("fill", "#999");
            tTxt.textContent = ((txl.name || "").length > 4 ? (txl.name || "").slice(0, 4) + "…" : (txl.name || ""));
            staticLayer.appendChild(tTxt);
          }
          _rowCur += (txl.image ? ICON : (((txl.name || "").length) * (isMobileView ? 11 : 6) + 4)) + GAP;
        }
      }
      if (moreText) {
        var more = document.createElementNS(svgNS, "text");
        var moreX = ix0 + rowW + GAP;
        var moreY = iy0 + 8;
        more.setAttribute("x", moreX);
        more.setAttribute("y", moreY);
        more.setAttribute("font-size", "7");
        more.setAttribute("fill", "#777");
        more.textContent = moreText;
        staticLayer.appendChild(more);
      }

      // Through-service boxed labels anchored to the station in the through direction
      var thruList = [];
      for (var tI = 0; tI < txLines.length; tI++) {
        if (txLines[tI] && txLines[tI].through) thruList.push(txLines[tI]);
      }
      var thruTotalW = 0;
      for (var tW = 0; tW < thruList.length; tW++) thruTotalW += _throughChipSize(thruList[tW], isMobileView).w;
      if (thruList.length > 1) thruTotalW += (thruList.length - 1) * 6;
      var _nrx = o.x - (isJunction ? 14 : 10);
      var _nmW = (stationName || "").length * (isMobileView ? 16 : 14);
      var _grpCx = (side === "dual" || side === "left") ? (_nrx - _nmW / 2) : o.x;
      var thruCursor = _grpCx - thruTotalW / 2;
      var _scs = o.stationCoords || [];
      for (var tI2 = 0; tI2 < thruList.length; tI2++) {
        var tt = thruList[tI2];
        var sz = _throughChipSize(tt, isMobileView);
        var lx, ly;
        if (tt.dir === "up") {
          lx = thruCursor;
          ly = o.y - sz.h - (side === "top" ? 28 : 16);
        }
        else if (tt.dir === "down") {
          var _extLast = null;
          if (geometry.fusionMap && _scs.length) {
            for (var _ei = _scs.length - 1; _ei >= 0; _ei--) {
              if (_scs[_ei].fusionLineId) { _extLast = _scs[_ei]; break; }
            }
          }
          var _scD = _extLast || { x: o.x, y: o.y };
          var _chipBot = iy0 + rows * ICON + (rows - 1) * GAP + 2;
          lx = thruCursor;
          ly = Math.max(_chipBot + 4, _scD.y + sz.h + 6);
        }
        else {
          if (anchor === "start") { lx = o.x - sz.w - 8; }
          else { lx = o.x + (isJunction ? 14 : 10) + 4; }
          ly = o.y - sz.h / 2 + tI2 * (sz.h + 4);
        }
        thruCursor += sz.w + 6;
        lx = Math.max(2, Math.min(lx, svgW - sz.w - 2));
        ly = Math.max(2, Math.min(ly, svgH - sz.h - 2));
        _renderThroughChip(staticLayer, svgNS, lx, ly, tt, ICON, isMobileView);
      }
    }
  }

  // v4.3.469: 推定データ注記（容器外・下方中央）——いずれかの列車が時刻表推定なら表示。
  // リアルタイム位置のみの路線には出さない。増分・全再構築の両パスから呼ばれる（冪等）。
  function updateEstimatedNote(el, positions) {
    try {
      var old = el.querySelector('.tp-est-note');
      if (old) old.remove();
      if (!positions || !positions.length) return;
      var anyEst = false;
      for (var _ei = 0; _ei < positions.length; _ei++) {
        if (positions[_ei] && positions[_ei].estimated === true) { anyEst = true; break; }
      }
      if (!anyEst) return;
      var note = document.createElement("div");
      note.className = "tp-est-note";
      note.textContent = t("trains.estimated_note") || "*Data calculated from timetable";
      el.appendChild(note);
    } catch(e) { /* note is best-effort */ }
  }

  function renderTrainMap(el, line, lineId) {
    try {
      var positions = getRealtimePositions(lineId);
      var _lang = window.currentLang || "ja";
      var _rS = (window.RailwayDB && window.RailwayDB.resolveStationName) ? function(id){ return window.RailwayDB.resolveStationName(id, _lang) || id; } : function(id){ return id; };
      
      // Get route geometry from cache (single source of truth for coordinates)
      var geometry = computeRouteGeometry(line, lineId);
      var stationCoords = geometry.stationCoords;
      var svgW = geometry.svgW;
      var svgH = geometry.svgH;
      var isMobileView = _isMobileView();
      var color = geometry.color;
      
      // Check if we need full rebuild (line changed) or just train layer update.
      // Language is part of the static layer identity: switching language must
      // trigger a full rebuild (station names / interchange titles are i18n).
      var existingSvg = el.querySelector('svg');
      var isSameLine = existingSvg && existingSvg.getAttribute('data-line-id') === lineId
        && existingSvg.getAttribute('data-lang') === _lang;
      
      if (isSameLine) {
        // === Incremental update: only update train layer using cached geometry ===
        updateTrainLayer(existingSvg, positions, stationCoords, lineId, line);
        updateRunningInfo(el, positions);
        updateEstimatedNote(el, positions);
        // Sync loading placeholder with the realtime page: hide it as soon as train
        // positions are available (the full-rebuild path re-inserts it when empty).
        if (positions.length > 0) {
          var _noDataEl = el.querySelector('.tp-no-data');
          if (_noDataEl) _noDataEl.remove();
        }
        return;
      }
      
      // === Full rebuild: create new SVG with separated layers ===
      var svgNS = "http://www.w3.org/2000/svg";
      var svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("xmlns", svgNS);
      svg.setAttribute("viewBox", "0 0 " + svgW + " " + svgH);
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      svg.style.width = "100%";
      svg.setAttribute("data-line-id", lineId);
      svg.setAttribute("data-lang", _lang);
      // Branch geometry for train placement (branch trains render on branch column)
      svg.__branchGeom = geometry.branchGeom || null;
      
      // Background
      var bgRect = document.createElementNS(svgNS, "rect");
      bgRect.setAttribute("width", svgW);
      bgRect.setAttribute("height", svgH);
      bgRect.setAttribute("fill", "var(--bg)");
      bgRect.setAttribute("rx", "8");
      svg.appendChild(bgRect);
      
      // === Static layer: route lines, stations, labels (only built once per line) ===
      var staticLayer = document.createElementNS(svgNS, "g");
      staticLayer.setAttribute("class", "static-layer");
      
      // Transfer map for interchange station icons (interchange lines on this line)
      var transferMap = _getTransferMap(lineId);
      
      // Add route elements (lines/rects/polylines)
      for (var re = 0; re < geometry.routeElements.length; re++) {
        var routeEl = geometry.routeElements[re];
        var svgEl = document.createElementNS(svgNS, routeEl.type);
        for (var attr in routeEl.attrs) {
          if (routeEl.attrs.hasOwnProperty(attr)) {
            svgEl.setAttribute(attr, routeEl.attrs[attr]);
          }
        }
        if (routeEl.text) svgEl.textContent = routeEl.text;
        staticLayer.appendChild(svgEl);
      }
      
      // Add station circles and labels（主線駅も支線駅も _renderStationNode で統一描画）
      for (var si = 0; si < stationCoords.length; si++) {
        var sc = stationCoords[si];
        var stationId = sc.stationId;
        var isJunction = geometry.junctionStation && stationId === geometry.junctionStation;
        _renderStationNode(staticLayer, svgNS, {
          x: sc.x, y: sc.y, stationId: stationId, isJunction: isJunction, color: color,
          si: si, side: sc.side || "right", geometry: geometry, isMobileView: isMobileView,
          svgW: svgW, svgH: svgH, transferMap: transferMap, stationCoords: stationCoords,
          rS: _rS,
          skipTx: false
        });
      }
      
      // Add branch lines (if any) - supports both loop and linear lines
      for (var bi = 0; bi < geometry.branchLines.length; bi++) {
        var branch = geometry.branchLines[bi];
        var bColor = branch.color || color;
        // Find junction station: first station of branch that exists in main line
        var junctionIdx = -1;
        if (branch.stations && branch.stations.length > 0 && stationCoords.length > 0) {
          for (var _ji = 0; _ji < stationCoords.length; _ji++) {
            if (stationCoords[_ji].stationId === branch.stations[0]) {
              junctionIdx = _ji;
              break;
            }
          }
        }
        if (junctionIdx >= 0 && stationCoords.length > junctionIdx) {
          var bx = stationCoords[junctionIdx].x + GEOM.BRANCH_STUB + bi * GEOM.BRANCH_COL_W;
          var by = stationCoords[junctionIdx].y;
          var branchTop = by - 20;
          
          // Branch line
          var branchLine = document.createElementNS(svgNS, "line");
          branchLine.setAttribute("x1", stationCoords[junctionIdx].x);
          branchLine.setAttribute("y1", by);
          branchLine.setAttribute("x2", bx);
          branchLine.setAttribute("y2", by);
          branchLine.setAttribute("stroke", bColor);
          branchLine.setAttribute("stroke-width", "3");
          branchLine.setAttribute("opacity", "0.5");
          staticLayer.appendChild(branchLine);
          
          // Branch vertical line
          var branchSp = geometry.sp || 24;
          var branchVLine = document.createElementNS(svgNS, "line");
          branchVLine.setAttribute("x1", bx);
          branchVLine.setAttribute("y1", by);
          branchVLine.setAttribute("x2", bx);
          branchVLine.setAttribute("y2", branchTop + (branch.stations ? branch.stations.length * branchSp : 50));
          branchVLine.setAttribute("stroke", bColor);
          branchVLine.setAttribute("stroke-width", "3");
          branchVLine.setAttribute("opacity", "0.5");
          staticLayer.appendChild(branchVLine);
          
          // Branch stations（主線と同じ _renderStationNode で統一描画——スタイルは完全に同一）
          if (branch.stations) {
            for (var bsi = 0; bsi < branch.stations.length; bsi++) {
              var bsy = by + bsi * branchSp;
              _renderStationNode(staticLayer, svgNS, {
                x: bx, y: bsy, stationId: branch.stations[bsi], isJunction: false, color: bColor,
                si: bsi, side: "right", geometry: geometry, isMobileView: isMobileView,
                svgW: svgW, svgH: svgH, transferMap: transferMap, stationCoords: stationCoords,
                rS: _rS,
                tx: bx + 10, ty: bsy, anchor: "start", // v4.3.500: 支线站名避让 r=7 圆点 + 垂直居中
                skipTx: (bsi === 0)
              });
            }
          }
          
          // Branch name
          var branchName = document.createElementNS(svgNS, "text");
          branchName.setAttribute("x", bx + 6);
          branchName.setAttribute("y", branchTop - 6);
          // v4.3.448: 支線名も主線の文字階層に合わせ 13→14px（独立簡略値のまま残さない）
          branchName.setAttribute("font-size", "14");
          branchName.setAttribute("fill", bColor);
          branchName.setAttribute("font-family", "Fusion Pixel, 'Courier New', monospace"); // v4.3.498: 支线名用像素字体（与全局一致）
          branchName.setAttribute("font-weight", "600");
          branchName.setAttribute("text-anchor", "start");
          var branchDisplayName = (window.RailwayDB && typeof window.RailwayDB.resolveLineName === "function") ? window.RailwayDB.resolveLineName(branch.id, window.currentLang) : (branch.nameJa || branch.name);
          branchName.textContent = branchDisplayName;
          staticLayer.appendChild(branchName);
        }
      }
      
      svg.appendChild(staticLayer);

    // === Train layer ===
      var trainLayer = document.createElementNS(svgNS, "g");
      trainLayer.setAttribute("class", "train-layer");
      svg.appendChild(trainLayer);
      
      // Replace content
      // v4.3.469: 容器内に"時刻表で推定中"等の提示を出さない——推定データはページ読込と
      // 一緒に初期化し、容器内はリアルタイムと同じ見た目に。データ出所の注記は容器外
      // （tp-est-note、下・中央）に置く。
      el.innerHTML = '<div class="tp-map-wrap"></div>';
      el.querySelector('.tp-map-wrap').appendChild(svg);
      
      // Clamp over-long station names into available width (industry practice:
      // shrink, never clip). Runs after mount so getBBox is accurate.
      try {
        var _clampTexts = staticLayer.querySelectorAll("text[data-clamp-avail]");
        for (var _cI = 0; _cI < _clampTexts.length; _cI++) {
          var _ct = _clampTexts[_cI];
          var _av = parseFloat(_ct.getAttribute("data-clamp-avail"));
          var _f = parseFloat(_ct.getAttribute("font-size"));
          var _t = _ct.textContent || "";
          var _cjkN = (_t.match(/[\u4e00-\u9fff\u3040-\u30ff]/g) || []).length;
          var _othN = _t.length - _cjkN;
          var _estW = (_cjkN * 1.1 + _othN * 0.55) * _f;
          var _bb = _ct.getBBox();
          // Trust getBBox only when it agrees with the estimate; otherwise the
          // font was not loaded and the measured width is unreliable.
          var _useW = (_bb.width > 0 && Math.abs(_bb.width - _estW) < _estW * 0.5) ? _bb.width : _estW;
          if (_useW > _av) {
            var _nf = Math.max(12, _f * _av / _useW);
            _ct.setAttribute("font-size", String(Math.round(_nf * 10) / 10));
          }
        }
      } catch (e2) { /* clamp is a best-effort readability guard */ }
      
      // Now populate train layer
      updateTrainLayer(svg, positions, stationCoords, lineId, line);
      updateRunningInfo(el, positions);
      updateEstimatedNote(el, positions);
      
    } catch(e) {
      el.innerHTML = '<div class="tp-no-data">Error: ' + escapeHtml(e.message) + '</div>';
    }
  }
  
  /**
   * Update train layer using DOM diff (update existing, create new, remove missing)
   * Uses cached stationCoords - never recomputes geometry
   */
  function updateTrainLayer(svg, positions, stationCoords, lineId, line) {
    var trainLayer = svg.querySelector('.train-layer');
    if (!trainLayer) return;
    
    var svgNS = "http://www.w3.org/2000/svg";
    var isLoop = stationCoords.length > 2 && (line.type === "loop" || line.isSixShapedLoop);
    
    // Count trains per station for offset
    var stationCount = {};
    var stationIdx = {};
    for (var pi0 = 0; pi0 < positions.length; pi0++) {
      var idx0 = Math.min(positions[pi0].stationIndex || 0, stationCoords.length - 1);
      stationCount[idx0] = (stationCount[idx0] || 0) + 1;
    }
    
    var updatedIds = {};
    
    for (var pi = 0; pi < positions.length; pi++) {
      var p = positions[pi];
      // v4.3.446: 支线融合列车——画在支线站列（branchGeom）上，与主线留出距离
      var coord = null;
      if (p.fusionLineId) {
        var _bg = svg.__branchGeom || null;
        if (_bg && _bg[p.fusionLineId]) {
          var _bii = Math.min(p.stationIndex || 0, _bg[p.fusionLineId].length - 1);
          coord = _bg[p.fusionLineId][_bii];
        }
      }
      if (!coord) {
        // v4.3.409: 融合机制——延伸线（fusionLineId）列车按延伸几何 baseIdx 偏移
        var idx;
        if (p.fusionLineId) {
          var fm = _fusionBaseIdx(lineId, p.fusionLineId);
          idx = fm >= 0 ? fm + (p.stationIndex || 0) : (p.stationIndex || 0);
        } else {
          idx = p.stationIndex || 0;
        }
        idx = Math.min(idx, stationCoords.length - 1);
        coord = stationCoords[idx];
      }
      if (!coord) continue;
      
      var px = coord.x;
      var py = coord.y;
      
      // Offset multiple trains at same station
      var trainIdxAt = stationIdx[idx] || 0;
      stationIdx[idx] = trainIdxAt + 1;
      var totalAt = stationCount[idx] || 1;
      var direction = p.railDirection || '';
      var offX = 0, offY = 0;
      
      if (isLoop) {
        if (direction.indexOf('Inner') >= 0) offY = -8;
        else if (direction.indexOf('Outer') >= 0) offY = 8;
        offX = (trainIdxAt - (totalAt - 1) / 2) * 20;
      } else {
        if (direction.indexOf('Inbound') >= 0 || direction.indexOf('Inner') >= 0) offX = -10;
        else if (direction.indexOf('Outbound') >= 0 || direction.indexOf('Outer') >= 0) offX = 10;
        offX += (trainIdxAt - (totalAt - 1) / 2) * 18;
      }
      
      px += offX;
      py += offY;
      
      var trainUid = (p.trainId || ("train_" + pi)) + "_" + (p.stationIndex || 0);
      updatedIds[trainUid] = true;
      
      var existingIcon = trainLayer.querySelector('[data-train-id="' + String(trainUid).replace(/"/g, '') + '"]');
      
      if (existingIcon) {
        // Update existing icon position
        var oldX = parseFloat(existingIcon.getAttribute('x'));
        var oldY = parseFloat(existingIcon.getAttribute('y'));
        var newX = px - 7;
        var newY = py - 9;
        if (Math.abs(oldX - newX) > 0.5 || Math.abs(oldY - newY) > 0.5) {
          existingIcon.setAttribute('x', newX);
          existingIcon.setAttribute('y', newY);
        }
        // v4.3.454/455: 终点/方向标签跟随列车移动（位置随移动方向）
        var _mvDir = _trainMoveDir(p, lineId);
        var _lb = trainLayer.querySelectorAll('[data-train-label-for="' + String(trainUid).replace(/"/g, '') + '"]');
        for (var _li = 0; _li < _lb.length; _li++) {
          _lb[_li].setAttribute('x', px);
          _lb[_li].setAttribute('y', _trainLabelY(_lb[_li].getAttribute('data-label-pos'), py, _mvDir));
        }
      } else {
        // Create new train icon
        var iconSrc = (window.TrainIcons && typeof window.TrainIcons.getTrainIcon === "function") ? window.TrainIcons.getTrainIcon(p.fusionLineId || lineId, line.operator, trainUid, p.stationIndex, p.trainType) : "";
        var isEst = p.estimated === true;
        var iconCls = isEst ? "train-icon estimated" : "train-icon";
        
        if (iconSrc) {
          var newIcon = document.createElementNS(svgNS, "image");
          newIcon.setAttribute("data-train-id", String(trainUid));
          newIcon.setAttribute("x", String(px - 7));
          newIcon.setAttribute("y", String(py - 9));
          newIcon.setAttribute("width", "14");
          newIcon.setAttribute("height", "18");
          newIcon.setAttribute("href", iconSrc);
          newIcon.setAttribute("class", iconCls);
          newIcon.setAttribute("preserveAspectRatio", "xMidYMid meet");
          trainLayer.appendChild(newIcon);
          appendTrainLabels(trainLayer, svgNS, trainUid, px, py, p, lineId);
        } else {
          // Fallback: circle icon
          var newCircle = document.createElementNS(svgNS, "g");
          newCircle.setAttribute("data-train-id", String(trainUid));
          newCircle.setAttribute("class", iconCls);
          
          var outerCircle = document.createElementNS(svgNS, "circle");
          outerCircle.setAttribute("cx", px);
          outerCircle.setAttribute("cy", py);
          outerCircle.setAttribute("r", "8");
          outerCircle.setAttribute("fill", color);
          outerCircle.setAttribute("opacity", "0.9");
          newCircle.appendChild(outerCircle);
          
          var innerCircle = document.createElementNS(svgNS, "circle");
          innerCircle.setAttribute("cx", px);
          innerCircle.setAttribute("cy", py);
          innerCircle.setAttribute("r", "3");
          innerCircle.setAttribute("fill", "#fff");
          newCircle.appendChild(innerCircle);
          
          trainLayer.appendChild(newCircle);
          appendTrainLabels(trainLayer, svgNS, trainUid, px, py, p, lineId);
        }
      }
    }
    
    // Remove icons for trains that no longer exist
    // v4.3.454: 兼容终点/方向标签（data-train-label-for 与图标同 uid 清理）
    var allIcons = trainLayer.querySelectorAll('[data-train-id], [data-train-label-for]');
    for (var ii = 0; ii < allIcons.length; ii++) {
      var tid = allIcons[ii].getAttribute('data-train-id') || allIcons[ii].getAttribute('data-train-label-for');
      if (!updatedIds[tid]) {
        allIcons[ii].parentNode.removeChild(allIcons[ii]);
      }
    }
  }

  // v4.3.454: 列车终点/方向标签——方向在上（7px #999）、终点在下（8px #666）
  // 站名解析带归一化兜底：ODPT 站 ID 无连字符（KiyosumiShirakawa）vs 项目站 ID 连字符
  // （Kiyosumi-Shirakawa）——去连字符+小写匹配项目站表后按项目 ID 解析显示名
  function _resolveStationLoose(id) {
    if (!id) return '';
    var db = window.RailwayDB;
    var direct = (db && db.resolveStationName) ? db.resolveStationName(id, window.currentLang) : id;
    if (direct && direct !== id) return direct;
    var norm = String(id).replace(/-/g, '').toLowerCase();
    var hit = '';
    if (db && typeof db.getStations === 'function') {
      try {
        var sts = db.getStations();
        for (var k in sts) {
          if (String(k).replace(/-/g, '').toLowerCase() === norm) { hit = k; break; }
        }
      } catch(e) {}
    }
    if (!hit && window.UNIFIED_LINES) {
      for (var lid in window.UNIFIED_LINES) {
        var arr = (window.UNIFIED_LINES[lid] || {}).stations || [];
        for (var i = 0; i < arr.length; i++) {
          if (String(arr[i]).replace(/-/g, '').toLowerCase() === norm) { hit = arr[i]; break; }
        }
        if (hit) break;
      }
    }
    if (hit && db && db.resolveStationName) {
      var name = db.resolveStationName(hit, window.currentLang);
      if (name && name !== hit) return name;
    }
    return direct;
  }

  function _trainDestText(destStation) {
    if (!destStation) return '';
    return _resolveStationLoose(destStation) || destStation;
  }

  // v4.3.455: 列车方向标签朝移动方向——方向端点站名在站表中位于当前位置下方＝向下▼（标签在图标下方）、
  // 上方＝向上▲（标签在图标上方）；Inbound/Outbound 按往起点/终点判断；环线 InnerLoop/OuterLoop 等无上下概念返回 null
  // 环线方向词：内回り/外回り（按语言本地化）
  var LOOP_DIR_NAMES = {
    InnerLoop: { ja: "内回り", zh: "内环", en: "Inner", ko: "내선" },
    OuterLoop: { ja: "外回り", zh: "外环", en: "Outer", ko: "외선" },
    Inner: { ja: "内回り", zh: "内环", en: "Inner", ko: "내선" },
    Outer: { ja: "外回り", zh: "外环", en: "Outer", ko: "외선" }
  };

  // v4.3.473: 方位词（Northbound/Southbound/Eastbound/Westbound）→ 站表方向映射。
  // +1 = 该方位词的列车沿站表正向行驶（方向端点在站表后部）→ ▼（标签在图标下方）
  // -1 = 沿站表反向行驶（方向端点在站表前部）→ ▲（标签在图标上方）
  // 判定依据：2026-09-10 ODPT odpt:Train 实时样本（odpt:fromStation→odpt:toStation 沿站表 index 增减，
  // 各条目样本 100% 一致）。站表方向以 railway_data.json 冻结站表为准。
  // 未列入的线路/方向保持 ▶ 兜底（不猜测方向）。
  var DIR_AXIS_MAP = {
    // ---- JR-East ----
    KeihinTohoku:   { Northbound: -1, Southbound: +1 }, // 站表 大宮→大船：北行=大宮（站表前）
    ChuoSobuLocal:  { Eastbound: +1, Westbound: -1 },   // 站表 三鷹→千葉：東行=千葉（站表后）
    Saikyo:         { Northbound: +1, Southbound: -1 }, // 站表 大崎→大宮：北行=大宮（站表后）
    Kawagoe:        { Southbound: -1 },                 // 站表 大宮→日進→西大宮→…→川越：南行=大宮方向（站表前）
    ShonanShinjuku: { Northbound: -1, Southbound: +1 }, // 站表 大宮→小田原：北行=大宮（站表前）
    // ---- Toei ----
    Asakusa:        { Northbound: +1, Southbound: -1 }, // 站表 西馬込→押上：北行=押上（站表后）
    Mita:           { Northbound: +1, Southbound: -1 }, // 站表 目黒→西高島平：北行=高島平（站表后）
    Shinjuku:       { Eastbound: +1, Westbound: -1 }    // 站表 新宿→本八幡：東行=本八幡（站表后）
  };

  function _isLoopDirName(dirName) {
    if (!dirName) return false;
    return !!LOOP_DIR_NAMES[String(dirName).split('.').pop()];
  }

  // v4.3.475: 大江户线（6字形）光丘段列车识别。
  // 站表 [0]=Tochomae（环线/光丘段枢纽）、[1..10]=光丘段（西新宿五丁目→光丘，竖直开放尾）。
  // 光丘段列车虽被 ODPT 标成 InnerLoop/OuterLoop，但没有"回り"语义——应显示真实终点（光丘/都厅前）。
  function _isOedoBranchTrain(lineId, p) {
    if (lineId !== 'Oedo' || !p) return false;
    var si = p.stationIndex || 0;
    if (si >= 1 && si <= 10) return true; // 当前位置在光丘段
    if (si === 0) {
      // 都厅前枢纽出发的车：dest=光丘 则进入光丘段；dest=都厅前 是环线折返
      var _d0 = String(p.destinationStation || '').split('.').pop();
      if (/^Hikarigaoka$/i.test(_d0)) return true;
    }
    return false;
  }

  function _trainMoveDir(p, lineId) {
    var dn = String(p.railDirection || '').split('.').pop();
    // v4.3.475: 大江户线光丘段列车先于环线判定——tail 从都厅前竖直向上延伸到光丘，
    // 屏幕方向与站表 index 相反：往光丘=屏幕上方=▲、往都厅前=屏幕下方=▼。
    // v4.3.476: 光丘段区间车（光丘始发→环线，dest 为环线站如 清澄白河/都厅前 而非光丘）——
    // 终点非光丘即沿光丘段往都厅前方向移动（光丘段只有往返两向），一律 ▼。
    if (_isOedoBranchTrain(lineId, p)) {
      var _dest = String(p.destinationStation || '').split('.').pop();
      if (/^Hikarigaoka$/i.test(_dest)) return 'up';
      return 'down';
    }
    if (/^(InnerLoop|Inner|OuterLoop|Outer)$/.test(dn)) return null;
    if (/^Inbound$/.test(dn)) return 'up';
    if (/^Outbound$/.test(dn)) return 'down';
    // v4.3.473: 方位词用线路映射表判定（未建表线路返回 null → ▶ 兜底）
    if (/^(Northbound|Southbound|Eastbound|Westbound)$/.test(dn)) {
      var axis = (DIR_AXIS_MAP[lineId] && DIR_AXIS_MAP[lineId][dn]);
      if (axis === undefined) return null;
      return axis > 0 ? 'down' : 'up';
    }
    if (!dn) return null;
    var cur = p.stationIndex || 0;
    var sts = (window.UNIFIED_LINES && window.UNIFIED_LINES[lineId]) ? (window.UNIFIED_LINES[lineId].stations || []) : [];
    var normTail = String(dn).replace(/-/g, '').toLowerCase();
    for (var _di = 0; _di < sts.length; _di++) {
      if (String(sts[_di]).replace(/-/g, '').toLowerCase() === normTail) {
        return _di > cur ? 'down' : 'up';
      }
    }
    return null;
  }

  // 方向/终点标签的垂直位置：dir='down' 时方向▼在图标下、终点下移一行；否则方向▲/▶在上、终点在下
  function _trainLabelY(labelPos, py, moveDir) {
    if (labelPos === 'dir') return moveDir === 'down' ? py + 17 : py - 14;
    return moveDir === 'down' ? py + 28 : py + 25;
  }

  function appendTrainLabels(trainLayer, svgNS, trainUid, px, py, p, lineId) {
    var moveDir = _trainMoveDir(p, lineId);
    var isLoopDir = _isLoopDirName(p.railDirection);
    var dn = String(p.railDirection || '').split('.').pop();
    var lang = window.currentLang || 'ja';
    // v4.3.471: 单标签——箭头 + 方向端点站名；不再单独显示"上下行"方向词与终点。
    // 抽象方向词（Inbound/Outbound/Northbound 等无方向端点站）→ 用终点站名；环线 → 内回/外回。
    var labelText = '';
    // v4.3.475: 大江户线光丘段列车显示真实终点（光丘/都厅前），不走环线"内回/外回"标签
    if (_isOedoBranchTrain(lineId, p)) {
      labelText = _trainDestText(p.destinationStation);
    } else if (isLoopDir) {
      labelText = (LOOP_DIR_NAMES[dn] && LOOP_DIR_NAMES[dn][lang]) || (LOOP_DIR_NAMES[dn] ? LOOP_DIR_NAMES[dn].ja : '');
    } else if (/^(Inbound|Outbound|Northbound|Southbound|Eastbound|Westbound)$/.test(dn)) {
      labelText = _trainDestText(p.destinationStation);
    } else if (dn) {
      labelText = _resolveStationLoose(dn) || dn;
    }
    if (!labelText) return;
    var dirSym = moveDir === 'down' ? '▼' : (moveDir === 'up' ? '▲' : ((isLoopDir && !_isOedoBranchTrain(lineId, p)) ? '' : '▶'));
    var ldir = document.createElementNS(svgNS, "text");
    ldir.setAttribute("data-train-label-for", String(trainUid));
    ldir.setAttribute("data-label-pos", "dir");
    ldir.setAttribute("x", String(px));
    ldir.setAttribute("y", String(_trainLabelY('dir', py, moveDir)));
    ldir.setAttribute("text-anchor", "middle");
    ldir.setAttribute("font-size", "8");
    ldir.setAttribute("fill", "#666");
    ldir.setAttribute("class", "train-label-dir");
    ldir.textContent = dirSym + labelText;
    trainLayer.appendChild(ldir);
  }
  
  function updateRunningInfo(el, positions) {
    var runningEl = el.querySelector('.tp-running');
    if (runningEl) {
      var running = t("trains.running");
      var cntText = t("trains.train_count");
      runningEl.innerHTML = running + " (" + positions.length + " " + cntText + ")";
    }
  }
  
  function showLineView(lineId) {
    try {
      var lines = getLinesData();
      var fusedLine = lines[lineId];
      if (!fusedLine) return;
      currentLine = lineId;
      window.location.hash = lineId;
      if (listEl) listEl.classList.add("hidden");
      if (filterBarEl) filterBarEl.classList.add("hidden");
      if (detailEl) detailEl.classList.remove("hidden");
      var _title = (window.RailwayDB && window.RailwayDB.resolveLineName ? window.RailwayDB.resolveLineName(lineId, window.currentLang) : (fusedLine.nameEn || fusedLine.nameJa || lineId));
      if (window.LineOperationSystems) {
        for (var _opKey2 in window.LineOperationSystems) {
          var _opSys2 = window.LineOperationSystems[_opKey2];
          if (!Array.isArray(_opSys2)) continue;
          var _found = false;
          for (var _si2 = 0; _si2 < _opSys2.length; _si2++) {
            var _sys2 = _opSys2[_si2];
            if (_sys2.lineIds && _sys2.lineIds.indexOf(lineId) >= 0) {
              var _lang2 = window.currentLang || "ja";
              if (_lang2 === "zh" && _sys2.nameZh) _title = _sys2.nameZh;
              else if (_lang2 === "en" && _sys2.nameEn) _title = _sys2.nameEn;
              else if (_lang2 === "ko" && _sys2.nameKo) _title = _sys2.nameKo;
              else if (_sys2.nameJa) _title = _sys2.nameJa;
              _found = true;
              break;
            }
          }
          if (_found) break;
        }
      }
      if (titleEl) titleEl.textContent = _title;
      if (mapEl) renderTrainMap(mapEl, fusedLine, lineId);
    } catch(e) {}
  }

  function hideLineView() {
    try {
      currentLine = null;
      if (listEl) listEl.classList.remove("hidden");
      if (filterBarEl) filterBarEl.classList.remove("hidden");
      if (detailEl) detailEl.classList.add("hidden");
      renderFiltered(listEl);
    } catch(e) {}
  }

  // ========== Load cached real-time positions from IndexedDB ==========
  function loadCachedPositions(callback) {
    try {
      if (window.RailwayRTC && window.RailwayRTC.loadPositions) {
        window.RailwayRTC.loadPositions().then(function(positions) {
          if (positions && Object.keys(positions).length > 0) {
            // Store cached positions in DataLayer
            if (window.DataLayer && window.DataLayer.setCachedPositions) {
              Object.keys(positions).forEach(function(lid) {
                if (positions[lid] && positions[lid].length > 0) {
                  window.DataLayer.setCachedPositions(lid, positions[lid]);
                }
              });
            } else {
              // Compat fallback: merge into UNIFIED_LINES
              var ul = window.UNIFIED_LINES;
              if (ul) {
                Object.keys(positions).forEach(function(lid) {
                  if (ul[lid] && positions[lid].length > 0) {
                    ul[lid].cachedPositions = positions[lid];
                  }
                });
              }
            }
          }
          if (callback) callback();
        }).catch(function(e) { console.warn("[trains] Cache load error:", e.message); if (callback) callback(); });
      } else {
        if (callback) callback();
      }
    } catch(e) { if (callback) callback(); }
  }

  function renderList(el) {
    if (!el || !window.DataState) return;
    var lines = window.DataLayer ? window.DataLayer.getAllLines() : (window.UNIFIED_LINES || {});
    var ul = Array.isArray(lines) ? (function(){ var d={}; lines.forEach(function(l){ d[l.id||l.line_id]=l; }); return d; })() : lines;
    if (!ul || Object.keys(ul).length === 0) {
      // Sync loading animation with the realtime page (rs-loading spinner)
      el.innerHTML = '<div class="rs-loading"><div class="rs-loading-spinner"></div><span>' + t("trains.loading") + '</span></div>';
      return;
    }
    var lineOrder = (window.LinePresentationService && window.UNIFIED_LINES) ? window.LinePresentationService.getDisplayOrder(window.UNIFIED_LINES) : []; try { window.DataState.renderList(el, ul, { mode: "trains", lineOrder: lineOrder }); } catch(e) { el.innerHTML = "<div class=\"rs-error\">Render failed</div>"; }
  }

  function init() {
    try {
      listEl = document.getElementById("trainsLineListContent");
      detailEl = document.getElementById("trainsDetailView");
      titleEl = document.getElementById("trainsDetailTitle");
      mapEl = document.getElementById("trainsMapContainer");
      filterBarEl = document.getElementById("trainsFilterBar");
      backBtn = document.getElementById("trainsBackBtn");
      if (!listEl) return;
      // Sync loading animation with the realtime page (rs-loading spinner)
      listEl.innerHTML = '<div class="rs-loading"><div class="rs-loading-spinner"></div><span>' + t("trains.loading") + '</span></div>';
      listEl.addEventListener("click", function(e) {
        // 支线 chip：从父线卡片进入支线详情（Line Hierarchy Rule）
        var chip = e.target.closest(".rs-branch-chip");
        if (chip && chip.dataset.line) {
          showLineView(chip.dataset.line);
          return;
        }
        var card = e.target.closest(".rs-line-card");
        if (card) showLineView(card.dataset.line);
      });
      if (backBtn) {
        backBtn.addEventListener("click", function() {
          // 与 tourism-detail 返回按钮同步：优先浏览器历史回退（回到来源页/列表态）
          if (window.history.length > 1) {
            window.history.back();
            // 若当前已无 hash（页内列表态误触返回），直接恢复列表视图
            if (!window.location.hash) hideLineView();
          } else {
            // 无历史（直接打开详情页）：清 hash 回列表
            window.location.hash = "";
            hideLineView();
          }
        });
      }
      // hash 路由兜底：history.back() 后 hash 变化时恢复对应视图
      // （与 tourism-detail 的 history.back() 行为同步，避免页内返回后停留在详情）
      window.addEventListener("hashchange", function() {
        var h = (window.location.hash || "").replace(/^#/, "");
        if (!h) {
          hideLineView();
        } else if (h !== currentLine) {
          try { showLineView(h); } catch(e) {}
        }
      });
      loadCachedPositions(function() {
        renderList(listEl);
        renderFilterBar(document.getElementById("trainsFilterBar"));
        // Data-ready poll: db-loader fetch is async; the first render may run before
        // network data arrives (IndexedDB positions usually resolve first), leaving the
        // list empty with no later re-render trigger. Same pattern as the realtime page.
        // Respect an already-selected operator filter instead of overwriting it.
        (function ensureDataReady() {
          var _tries = 0;
          (function tick() {
            var _d = getLinesData();
            if (_d && Object.keys(_d).length > 0) {
              if (_selectedOperator === null) { renderList(listEl); } else { renderFiltered(listEl); }
              renderFilterBar(document.getElementById("trainsFilterBar"));
              return;
            }
            if (++_tries > 120) return; // ~60s cap (mobile GitHub Pages can be slow)
            setTimeout(tick, 500);
          })();
        })();
        // Restore hash-based navigation (poll until line data is ready; async load timing)
        (function tryHash() {
          var hash = window.location.hash;
          if (!hash || hash.length <= 1) return;
          var lid = hash.substring(1);
          var lines = getLinesData();
          if (lines[lid]) {
            showLineView(lid);
            return;
          }
          setTimeout(tryHash, 400);
        })();
        if (backBtn) backBtn.textContent = "\u2190 " + t("line_map.back");
      });
      // Subscribe to DataState changes to handle late data loading
      if (window.DataState) {
        window.DataState.subscribe(function(lines, delayData, positions) {
          if (!lines || Object.keys(lines).length === 0 || !listEl) return;
          // Unified hash-restore: whenever line data is present, honor a #lineId deep link
          var _h3 = window.location.hash;
          if (_h3 && _h3.length > 1) {
            var _lid3 = _h3.substring(1);
            if (lines[_lid3] && (!currentLine || detailEl.classList.contains("hidden"))) {
              try { showLineView(_lid3); } catch(e) {}
            }
          }
          // Build hash of positions to detect changes (check both realtimePositions and cachedPositions)
          var posHash = '';
          try {
            var ids = Object.keys(lines);
            for (var i = 0; i < ids.length; i++) {
              var l = lines[ids[i]];
              var _pos = null;
              if (l && l.realtimePositions && l.realtimePositions.length > 0) {
                _pos = l.realtimePositions;
              } else if (l && l.cachedPositions && l.cachedPositions.length > 0) {
                _pos = l.cachedPositions;
              }
              if (_pos) {
                posHash += ids[i] + ":" + _pos.length + ":";
                for (var _pi = 0; _pi < _pos.length; _pi++) {
                  var _tp = _pos[_pi];
                  posHash += (_tp.trainId || ("t" + _pi)) + "@" + (_tp.stationIndex || 0) + ",";
                }
                posHash += ";";
              }
            }
          } catch(e) {}
          var currentLen = listEl.innerHTML.length;
          // Always render if list is empty (initial load), otherwise only render if positions changed
          if (currentLen === 0) {
            renderList(listEl);
            renderFilterBar(document.getElementById("trainsFilterBar"));
            _lastPositionsHash = posHash;
            // (through-service info now lives inside the train map interchange icons)
            // Restore hash-based navigation once data is ready (async load timing)
            var _h = window.location.hash;
            if (_h && _h.length > 1) {
              var _lid = _h.substring(1);
              var _lns = getLinesData();
              if (_lns[_lid] && (!currentLine || detailEl.classList.contains("hidden"))) {
                try { showLineView(_lid); } catch(e) {}
              }
            }
          } else if (posHash !== _lastPositionsHash) {
            _lastPositionsHash = posHash;
            renderList(listEl);
            // Restore hash-based navigation once data is ready (posHash changed = data arrived)
            var _h2 = window.location.hash;
            if (_h2 && _h2.length > 1) {
              var _lid2 = _h2.substring(1);
              var _lns2 = getLinesData();
              if (_lns2[_lid2] && (!currentLine || detailEl.classList.contains("hidden"))) {
                try { showLineView(_lid2); } catch(e) {}
              }
            }
            // (through-service info now lives inside the train map interchange icons)
            // Update train positions on map if detail view is open (incremental update for smooth animation)
            if (currentLine && detailEl && !detailEl.classList.contains("hidden")) {
              var _lines = getLinesData();
              var _fusedLine = _lines[currentLine];
              if (_fusedLine) renderTrainMap(mapEl, _fusedLine, currentLine);
            }
          }
        });
      }
      // Refresh filter bar, list, and line detail view on language switch
      if (typeof window.onLanguageChange === "function") {
        window.onLanguageChange(function() {
          renderFilterBar(document.getElementById("trainsFilterBar"));
          // Re-render list to update line names and operator titles (only if list is visible)
          if (listEl && detailEl && detailEl.classList.contains("hidden")) {
            renderList(listEl);
          }
          // Re-render line detail view if open
          if (currentLine && detailEl && !detailEl.classList.contains("hidden")) {
            showLineView(currentLine);
          }
        });
      }
    } catch(e) {}
  }


  function sortOperators(ops) {
    var order = (window.TransitConstants && window.TransitConstants.OP_ORDER) ? window.TransitConstants.OP_ORDER : [];
    return ops.sort(function(a, b) {
      var ia = order.indexOf(a), ib = order.indexOf(b);
      if (ia >= 0 && ib >= 0) return ia - ib;
      if (ia >= 0) return -1;
      if (ib >= 0) return 1;
      return a.localeCompare(b);
    });
  }

  function renderFilterBar(container) {
    if (!container) return;
    var lines = window.DataLayer ? window.DataLayer.getAllLines() : (window.UNIFIED_LINES || {});
    var ops = {};
    if (Array.isArray(lines)) {
      lines.forEach(function(l) { if (l.operator) ops[l.operator] = true; });
    } else {
      Object.keys(lines).forEach(function(id) {
        var line = lines[id];
        if (line && line.operator) ops[line.operator] = true;
      });
    }
    var opList = sortOperators(Object.keys(ops));
    var html = '';
    var allLabel = (typeof window.t === "function" && window.t("filter.all")) ? window.t("filter.all") : "All";
    html += '<button class="rs-filter-btn' + (_selectedOperator === null ? ' active' : '') + '" data-operator="">' + allLabel + '</button>';
    opList.forEach(function(op) {
      var label = (typeof window.t === "function" && window.t("op." + op)) ? window.t("op." + op) : op;
      html += '<button class="rs-filter-btn' + (_selectedOperator === op ? ' active' : '') + '" data-operator="' + op + '">' + label + '</button>';
    });
    container.innerHTML = html;
    container.querySelectorAll('.rs-filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { setFilter(btn.dataset.operator || null); });
    });
  }

  function setFilter(op) {
    _selectedOperator = op;
    var container = document.getElementById('trainsFilterBar');
    if (container) renderFilterBar(container);
    if (listEl) renderFiltered(listEl);
  }

  function renderFiltered(el) {
    if (!el || !window.DataState) return;
    var allLines = getLinesData(); // dict: lineId -> line
    var filtered = allLines;
    if (_selectedOperator) {
      filtered = {};
      Object.keys(allLines).forEach(function(id) {
        var _ln = allLines[id];
        if (_ln && (_selectedOperator === "JR-East"
          ? (window.TransitConstants && window.TransitConstants.isJRERoute ? window.TransitConstants.isJRERoute(_ln) : _ln.operator === "JR-East")
          : _ln.operator === _selectedOperator)) {
          filtered[id] = allLines[id];
        }
      });
    }
    if (!filtered || Object.keys(filtered).length === 0) { el.innerHTML = ''; return; }
    var lineOrder = (window.LinePresentationService && window.UNIFIED_LINES) ? window.LinePresentationService.getDisplayOrder(window.UNIFIED_LINES) : []; try { window.DataState.renderList(el, filtered, { mode: "trains", lineOrder: lineOrder }); } catch(e) { el.innerHTML = "<div class=\"rs-error\">Render failed</div>"; }
  }
  window.TrainsPage = {
    init: init,
    refreshUI: function() { renderList(listEl); },
    showLineView: showLineView,
    hideLineView: hideLineView
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
