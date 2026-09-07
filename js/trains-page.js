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

  // Branch map: branch ID -> parent ID
  var _BRANCH_MAP = {
    "KeikyuAirport": "Keikyu", "KeikyuDaishi": "Keikyu", "KeikyuKurihama": "Keikyu", "KeikyuZushi": "Keikyu",
    "TobuSkytreeBranch": "TobuSkytree", "TobuKameido": "TobuSkytree", "TobuDaishi": "TobuIsesaki",
    "TobuKoizumiBranch": "TobuKoizumi",
    "SotetsuIzumino": "SotetsuMain", "SotetsuShinYokohama": "SotetsuMain",
    "MarunouchiBranch": "Marunouchi",
    "TsurumiUmigippu": "Tsurumi", "TsurumiOokawa": "Tsurumi"
  };


  function detectBranches(lines) {
    var byImage = {};
    var ids = Object.keys(lines);
    for (var i = 0; i < ids.length; i++) {
      var img = lines[ids[i]].image || "";
      if (!img) continue;
      if (!byImage[img]) byImage[img] = [];
      byImage[img].push(ids[i]);
    }
    var imageKeys = Object.keys(byImage);
    for (var j = 0; j < imageKeys.length; j++) {
      var group = byImage[imageKeys[j]];
      if (group.length < 2) continue;
      var parentKey = null;
      for (var k = 0; k < group.length; k++) {
        if (_BRANCH_MAP[group[k]]) { parentKey = _BRANCH_MAP[group[k]]; break; }
      }
      if (!parentKey) {
        group.sort(function(a, b) { return lines[a].code.length - lines[b].code.length; });
        parentKey = group[0];
      }
      for (var k = 0; k < group.length; k++) {
        if (group[k] !== parentKey && !lines[group[k]].branchOf) {
          lines[group[k]].branchOf = parentKey;
        }
      }
    }
  }

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
        color: l.color || "#888888",
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
        loopJunction: l.loopJunction || null
      };
    }
    return lines;
  }

  function getRealtimePositions(lineId) {
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
        color: tl.color || "", type: t.type === "out" ? "out" : "in", note: t.note || ""
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
    var label = (lineObj.dir === "up" ? "∧" : (lineObj.dir === "down" ? "∨" : "<")) + "直通" + nm;
    var fs = mobile ? 12 : 10;
    var w = label.length * (mobile ? 12 : 10) + 8;
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
    var txt = document.createElementNS(ns, "text");
    txt.setAttribute("x", x + 3);
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
        branchLines.push({ id: bid, name: bl.name || bid, color: bl.color || color, stations: bl.stations });
      }
    }
    var branchOffset = branchLines.length > 0 ? 70 * branchLines.length : 0;
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
      var scale6 = _isMobileView() ? 1.5 : 1.3;
      var spLoop6 = 26 * scale6;
      var loopRectW = 150 * scale6;
      var loopRectH = Math.max(loopStations.length * spLoop6 - 40 * scale6, 200 * scale6);
      
      var marginRight = 20 * scale6 + (_isMobileView() ? 36 : 12);
      var marginTopBot = 40 * scale6;
      var tailAreaWidth = (_isMobileView() ? 70 : 105) * scale6;
      var leftMargin = 8 * scale6;
      
      var naturalW = leftMargin + tailAreaWidth + loopRectW + marginRight;
      if (_isMobileView() && naturalW > _cw6Content) {
        loopRectW = Math.max(_cw6Content - leftMargin - tailAreaWidth - marginRight, 230);
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
      var stubLen = 35 * scale6;
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
      svgW = 280 * loopScale;
      svgH = loopRectH + 80 * loopScale;
      var cx = svgW / 2, cy = svgH / 2;
      var isYamanote = lineId === "Yamanote";
      var rectW = (isYamanote ? 140 : 110) * loopScale, rectH = loopRectH;
      var halfW = rectW / 2, halfH = rectH / 2;
      var loopPts = [];
      var i, _t;
      if (isYamanote) {
        // JR-official layout: the ring runs as two parallel columns from
        // Komagome/Tabata down. Right column (top->bottom): Tabata..Tokyo..
        // Takahanawadai (14). Left column (top->bottom): Komagome..Osaki (15).
        // Shinagawa sits at bottom center between Osaki and Takahanawadai.
        // Top edge connects Tabata (NE) - Komagome (NW) in parallel.
        var _rightSeq = [8,7,6,5,4,3,2,1,0,29,28,27,26,25];
        for (var ri = 0; ri < _rightSeq.length; ri++) {
          var _tR = (ri + 0.5) / _rightSeq.length;
          loopPts.push({ x: cx + halfW, y: cy - halfH + _tR * rectH, side: "right", stationId: stations[_rightSeq[ri]] });
        }
        for (var li = 0; li < 15; li++) {
          var _tL = (li + 0.5) / 15;
          loopPts.push({ x: cx - halfW, y: cy - halfH + _tL * rectH, side: "left", stationId: stations[9 + li] });
        }
        loopPts.push({ x: cx, y: cy + halfH, side: "bottom", stationId: stations[24] });
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
      svgW = (_isMobileView() ? 410 : Math.min(Math.max(_cw, 440), 820)) + branchOffset;
      svgH = (stationCoords.length ? stationCoords[stationCoords.length - 1].y : topP) + sp + botP;
      var mainCx = svgW / 2 - branchOffset / 2;
      
      var _iconStep = (isMobileView ? 20 : 16) + 2;
      var _extraY = 0;
      for (var i = 0; i < stations.length; i++) {
        var _txs = (transferMap[stations[i]] || []).filter(function(t) { return !t.through; });
        var _rowsN = Math.ceil(Math.min(_txs.length, 8) / 4);
        stationCoords.push({ x: mainCx, y: topP + i * sp + _extraY, side: 'dual', stationId: stations[i] });
        if (_rowsN > 1) _extraY += (_rowsN - 1) * _iconStep;
      }
      var y1 = topP, y2 = stationCoords.length ? stationCoords[stationCoords.length - 1].y : (topP + (stations.length - 1) * sp);
      routeElements.push({
        type: 'line',
        attrs: { x1: mainCx, y1: y1, x2: mainCx, y2: y2, stroke: color, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.35 }
      });
      // Twin parallel line for shared sections (industry standard)
      var sharedSegs = _findSharedSegments(line, allLines);
      for (var si = 0; si < sharedSegs.length; si++) {
        var sseg = sharedSegs[si];
        var pColor = (allLines[sseg.partner] && allLines[sseg.partner].color) || "#888";
        routeElements.push({
          type: 'line',
          attrs: { x1: mainCx - 7, y1: topP + sseg.start * sp, x2: mainCx - 7, y2: topP + sseg.end * sp, stroke: pColor, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.55 }
        });
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
      routeElements: routeElements,
      junctionStation: isSixShapedLoop ? stations[0] : null,
  junctionX: isSixShapedLoop ? junctionX : null
    };
    
    // Cache it
    _routeGeometryCache[_geomKey(lineId)] = geometry;
    
    return geometry;
  }
  
  function _computeLineHash(line) {
    // Simple hash based on stations and type
    return (line.stations || []).join('|') + '|' + (line.type || '') + '|' + (line.isSixShapedLoop ? '6' : '0');
  }
  
  function invalidateRouteGeometryCache(lineId) {
    if (lineId) {
      delete _routeGeometryCache[_geomKey(lineId)];
    } else {
      _routeGeometryCache = {};
    }
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
        staticLayer.appendChild(svgEl);
      }
      
      // Add station circles and labels
      for (var si = 0; si < stationCoords.length; si++) {
        var sc = stationCoords[si];
        var stationId = sc.stationId;
        var isJunction = geometry.junctionStation && stationId === geometry.junctionStation;
        
        // Station circle
        var circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", sc.x);
        circle.setAttribute("cy", sc.y);
        circle.setAttribute("r", isJunction ? "7" : "4");
        circle.setAttribute("fill", isJunction ? color : "#fff");
        circle.setAttribute("stroke", isJunction ? "#fff" : color);
        circle.setAttribute("stroke-width", isJunction ? "2.5" : "2");
        circle.setAttribute("data-station-index", si);
        staticLayer.appendChild(circle);
        
        // Station label
        var label = document.createElementNS(svgNS, "text");
        var side = sc.side || "right";
        var tx, ty, anchor;
        if (side === "top") { tx = sc.x; ty = sc.y - (isJunction ? 12 : 8); anchor = "middle"; }
        else if (side === "bottom") { tx = sc.x; ty = sc.y + (isJunction ? 16 : 13); anchor = "middle"; }
        else if (side === "left" && geometry.isSixShapedLoop) { tx = sc.x + (isJunction ? 10 : 8); ty = sc.y + (isJunction ? 4 : 3); anchor = "start"; }
      else if (side === "left") { tx = sc.x - (isJunction ? 12 : 8); ty = sc.y + (isJunction ? 4 : 3); anchor = "end"; }
        else if (side === "dual") { tx = sc.x - (isJunction ? 14 : 10); ty = sc.y + 3; anchor = "end"; }
        else if (side === "right" && geometry.isSixShapedLoop) { tx = sc.x - (isJunction ? 12 : 8); ty = sc.y + (isJunction ? 4 : 3); anchor = "end"; }
      else { tx = sc.x + (isJunction ? 10 : 8); ty = sc.y + 3; anchor = "start"; }
        label.setAttribute("x", tx);
        label.setAttribute("y", ty);
        var _pcFsC = "16";
      var _pcFsJ = "16";
      var _pcFs = "16";
      var _lblCompact = (side === "top" || side === "bottom");
      label.setAttribute("font-size", _lblCompact ? (isMobileView ? "16" : _pcFsC) : (isJunction ? (isMobileView ? "16" : _pcFsJ) : (isMobileView ? "16" : _pcFs)));
        label.setAttribute("fill", isJunction ? color : "#555");
        label.setAttribute("font-family", "sans-serif");
        label.setAttribute("font-weight", isJunction ? "700" : "500");
        label.setAttribute("text-anchor", anchor);
      var _clampAvail = (side === "dual" || side === "left") ? (tx - 4) : ((side === "right") ? (svgW - 2 - tx) : 0);
      if (geometry.isSixShapedLoop && (side === "left" || side === "right") && (geometry.junctionX === null || sc.x >= geometry.junctionX)) {
        // Inner columns share the loop interior; each side gets half the loop
        // width (minus the 8px name offset and a small gap).
        var _sc6 = isMobileView ? 1.5 : 1.3;
        var _m6r = isMobileView ? 66 : (20 * _sc6 + 12);
        var _tw6 = 70 * _sc6;
        var _lm6 = 8 * _sc6;
        var _loopW6 = svgW - _lm6 - _tw6 - _m6r;
        _clampAvail = Math.max(40, Math.floor(_loopW6 / 2) - 10);
      }
      if (_clampAvail > 0) label.setAttribute("data-clamp-avail", String(Math.max(40, Math.round(_clampAvail))));
        
        // Station name
        var stationName = _rS(stationId);
        var nameTspan = document.createElementNS(svgNS, "tspan");
        nameTspan.textContent = stationName;
        label.appendChild(nameTspan);
        
        staticLayer.appendChild(label);
        
        // Interchange line icons (grouped in a rounded background chip below the label)
        var txLines = transferMap[stationId] || [];
        if (txLines.length > 0) {
          var isCompact = (side === "top" || side === "bottom");
          var isDual = (side === "dual");
          var ICON = isMobileView ? 20 : 16;
          var GAP = 2;
          // Unified icon size: same for every station/line; 4 per row, wrap to second row
          var PER_ROW = 4;
          var MAX_ROWS = 2;
                                        var maxShow = PER_ROW * MAX_ROWS;
          // Through partners are drawn as station-anchored boxed labels (start ∧
          // above / end ∨ below / mid junction on the left) — keep them out of the
          // icon chip so the chip stays a pure interchange-icon grid.
          var nonThru = txLines.filter(function(t) { return !t.through; });
          var shown = nonThru.slice(0, maxShow);
          var rows = Math.ceil(shown.length / PER_ROW);
          var rowW = Math.min(shown.length, PER_ROW) * (ICON + GAP) - GAP;
          var moreText = nonThru.length > maxShow ? "+" + (nonThru.length - maxShow) : "";
          var totalW = rowW + (moreText ? 12 : 0);
          var ix0, iy0;
          // Chip anchored to its station: 3px below the name (left/right/bottom).
          // On the top side the name sits ABOVE the dot, so the chip goes below the dot
          // (y+6) instead — keeping name and chip on opposite sides of the dot avoids overlap.
          if (side === "top") { iy0 = ty + 14; }
          else { iy0 = ty + 3; }
          if (iy0 < 2) iy0 = 2;
          if (side === "left") { ix0 = tx - totalW; }
          else if (side === "dual") { ix0 = sc.x + 12; }
          else if (side === "top" || side === "bottom") { ix0 = tx - totalW / 2; }
          else { ix0 = tx; }
          // Left-side overflow: if the chip would cross the SVG left edge, degrade to a
          // compact 2-row layout (3 per row, then 2 per row) so it stays on-canvas.
          if (side === "left" && ix0 < 2) {
            PER_ROW = 3;
            shown = nonThru.slice(0, PER_ROW * MAX_ROWS);
            rows = Math.ceil(shown.length / PER_ROW);
            rowW = Math.min(shown.length, PER_ROW) * (ICON + GAP) - GAP;
            moreText = nonThru.length > PER_ROW * MAX_ROWS ? "+" + (nonThru.length - PER_ROW * MAX_ROWS) : "";
            totalW = rowW + (moreText ? 12 : 0);
            ix0 = tx - totalW;
            if (ix0 < 2) {
              PER_ROW = 2;
              shown = nonThru.slice(0, PER_ROW * MAX_ROWS);
              rows = Math.ceil(shown.length / PER_ROW);
              rowW = Math.min(shown.length, PER_ROW) * (ICON + GAP) - GAP;
              moreText = nonThru.length > PER_ROW * MAX_ROWS ? "+" + (nonThru.length - PER_ROW * MAX_ROWS) : "";
              totalW = rowW + (moreText ? 12 : 0);
              ix0 = tx - totalW;
            }
            if (ix0 < 2) ix0 = 2;
          }
          // Right-side overflow: same compact degradation (2 rows, stays on-canvas)
          if ((side === "right" || side === "dual") && ix0 + totalW > svgW - 2) {
            PER_ROW = 3;
            shown = nonThru.slice(0, PER_ROW * MAX_ROWS);
            rows = Math.ceil(shown.length / PER_ROW);
            rowW = Math.min(shown.length, PER_ROW) * (ICON + GAP) - GAP;
            moreText = nonThru.length > PER_ROW * MAX_ROWS ? "+" + (nonThru.length - PER_ROW * MAX_ROWS) : "";
            totalW = rowW + (moreText ? 12 : 0);
            ix0 = tx;
            if (ix0 + totalW > svgW - 2) {
              PER_ROW = 2;
              shown = nonThru.slice(0, PER_ROW * MAX_ROWS);
              rows = Math.ceil(shown.length / PER_ROW);
              rowW = Math.min(shown.length, PER_ROW) * (ICON + GAP) - GAP;
              moreText = nonThru.length > PER_ROW * MAX_ROWS ? "+" + (nonThru.length - PER_ROW * MAX_ROWS) : "";
              totalW = rowW + (moreText ? 12 : 0);
              ix0 = tx;
            }
            if (ix0 + totalW > svgW - 2) ix0 = svgW - 2 - totalW;
          }
          // Background chip (white rounded) to visually group the icons
          var bgH = rows * ICON + (rows - 1) * GAP + 2;
          var bg = document.createElementNS(svgNS, "rect");
          bg.setAttribute("x", ix0 - 1);
          bg.setAttribute("y", iy0 - 1);
          bg.setAttribute("width", totalW + 2);
          bg.setAttribute("height", bgH);
          bg.setAttribute("rx", "3");
          bg.setAttribute("fill", "rgba(255,255,255,0.72)");
          staticLayer.appendChild(bg);
          if (isDual) {
            // Flow layout for the wide right lane: icons are fixed width, text items advance by their own width
            var lineY = iy0;
            var curX = ix0;
            var maxLineW = svgW - 2;
            var flowEndX = ix0, flowEndY = iy0;
            for (var fi = 0; fi < shown.length; fi++) {
              var fxl = shown[fi];
              var fName = fxl.name.length > 4 ? fxl.name.slice(0, 4) + "…" : fxl.name;
              var fw = fxl.image ? ICON : (fName.length * (isMobileView ? 11 : 6) + 4);
              if (fi % PER_ROW === 0 && fi > 0) { curX = ix0; lineY += ICON + GAP; }
              if (fxl.image) {
                var fImg = document.createElementNS(svgNS, "image");
                fImg.setAttribute("href", fxl.image);
                fImg.setAttribute("xlink:href", fxl.image);
                fImg.setAttribute("x", curX);
                fImg.setAttribute("y", lineY);
                fImg.setAttribute("width", ICON);
                fImg.setAttribute("height", ICON);
                fImg.setAttribute("opacity", "0.95");
                var fTitle = document.createElementNS(svgNS, "title");
                fTitle.textContent = _throughBadgeText(fxl);
                fImg.appendChild(fTitle);
                staticLayer.appendChild(fImg);
              } else {
                var fTxt = document.createElementNS(svgNS, "text");
                fTxt.setAttribute("x", curX);
                fTxt.setAttribute("y", lineY + 8);
                fTxt.setAttribute("font-size", isMobileView ? "11" : "6");
                fTxt.setAttribute("fill", "#999");
                fTxt.textContent = fxl.name.length > 4 ? fxl.name.slice(0, 4) + "…" : fxl.name;
                staticLayer.appendChild(fTxt);
              }
              curX += fw + GAP;
            }
            flowEndX = curX; flowEndY = lineY;
            // Background chip width follows actual flow extent (grid estimate was too narrow)
            bg.setAttribute("width", (flowEndX - ix0) + (moreText ? 16 : 0) + 2);
          } else {
            // Grid layout for loop/compact sides (through partners are drawn as
            // station-anchored labels, so the chip only carries plain interchange icons).
            for (var ti2 = 0; ti2 < shown.length; ti2++) {
              var txl = shown[ti2];
              var row = Math.floor(ti2 / PER_ROW);
              var col = ti2 % PER_ROW;
              var tix = ix0 + col * (ICON + GAP);
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
                tTxt.setAttribute("y", tiy + 8);
                tTxt.setAttribute("font-size", isCompact ? (isMobileView ? "9" : "6") : (isMobileView ? "11" : "6"));
                tTxt.setAttribute("fill", "#999");
                tTxt.textContent = txl.name.length > 4 ? txl.name.slice(0, 4) + "…" : txl.name;
                staticLayer.appendChild(tTxt);
              }
            }
          }
          if (moreText) {
            var more = document.createElementNS(svgNS, "text");
            var moreX = isDual ? flowEndX + 4 : ix0 + rowW + GAP;
            var moreY = isDual ? flowEndY + 8 : iy0 + 8;
            if (isDual && moreX + 12 > svgW - 2) { moreX = ix0; moreY = flowEndY + ICON + GAP + 8; }
            more.setAttribute("x", moreX);
            more.setAttribute("y", moreY);
            more.setAttribute("font-size", "7");
            more.setAttribute("fill", "#777");
            more.textContent = moreText;
            staticLayer.appendChild(more);
          }

          // Through-service boxed labels anchored to the station in the through
          // direction (industry-standard signage): start station → label ABOVE (∧),
          // last station → label BELOW (∨), mid-line junction → label on the LEFT.
          // Kept outside the icon chip so the chip stays a pure interchange grid.
          // Multiple partners at the same station are laid out side by side
          // (up/down) or stacked vertically (middle) so they never overlap.
          var thruList = [];
          for (var tI = 0; tI < txLines.length; tI++) {
            if (txLines[tI] && txLines[tI].through) thruList.push(txLines[tI]);
          }
          var thruTotalW = 0;
          for (var tW = 0; tW < thruList.length; tW++) thruTotalW += _throughChipSize(thruList[tW], isMobileView).w;
          if (thruList.length > 1) thruTotalW += (thruList.length - 1) * 6;
          // Align the chip group with the station NAME center (industry standard:
          // labels sit over the name, not over the bare track point). Falls back to
          // the track point for loop/top/bottom/right side layouts where names do
          // not hang left of the track.
          var _nrx = sc.x - (isJunction ? 14 : 10);
          var _nmW = (stationName || "").length * (isMobileView ? 16 : 14);
          var _grpCx = (side === "dual" || side === "left") ? (_nrx - _nmW / 2) : sc.x;
          var thruCursor = _grpCx - thruTotalW / 2;
          for (var tI2 = 0; tI2 < thruList.length; tI2++) {
            var tt = thruList[tI2];
            var sz = _throughChipSize(tt, isMobileView);
            var lx, ly;
            if (tt.dir === "up") { lx = thruCursor; ly = sc.y - sz.h - 4; }
            else if (tt.dir === "down") { lx = thruCursor; ly = svgH - sz.h - 4; }
            else {
              // Mid-line junction: label on the LEFT of the station. When the
              // station name also sits on the left (anchor=end), estimate its
              // left edge from the known label anchor + name length so the boxed
              // label never overlaps it (getBBox is unreliable mid-render — the
              // SVG is not laid out yet when this runs).
              if (side === "dual" || side === "left") {
                var nameRightX = sc.x - (isJunction ? 14 : 10);
                var estNameW = (stationName || "").length * (isMobileView ? 16 : 14);
                lx = nameRightX - estNameW - sz.w - 6;
              } else {
                lx = sc.x - sz.w - 8;
              }
              ly = sc.y - sz.h / 2 + tI2 * (sz.h + 4);
            }
            thruCursor += sz.w + 6;
            lx = Math.max(2, Math.min(lx, svgW - sz.w - 2));
            ly = Math.max(2, Math.min(ly, svgH - sz.h - 2));
            _renderThroughChip(staticLayer, svgNS, lx, ly, tt, ICON, isMobileView);
          }
        }
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
          var bx = stationCoords[junctionIdx].x + 20 + bi * 70;
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
          var branchVLine = document.createElementNS(svgNS, "line");
          branchVLine.setAttribute("x1", bx);
          branchVLine.setAttribute("y1", by);
          branchVLine.setAttribute("x2", bx);
          branchVLine.setAttribute("y2", branchTop + (branch.stations ? branch.stations.length * 24 : 50));
          branchVLine.setAttribute("stroke", bColor);
          branchVLine.setAttribute("stroke-width", "3");
          branchVLine.setAttribute("opacity", "0.5");
          staticLayer.appendChild(branchVLine);
          
          // Branch stations (simplified)
          if (branch.stations) {
            for (var bsi = 0; bsi < branch.stations.length; bsi++) {
              var bsy = by + bsi * 24;
              var bCircle = document.createElementNS(svgNS, "circle");
              bCircle.setAttribute("cx", bx);
              bCircle.setAttribute("cy", bsy);
              bCircle.setAttribute("r", "3.5");
              bCircle.setAttribute("fill", "#fff");
              bCircle.setAttribute("stroke", bColor);
              bCircle.setAttribute("stroke-width", "1.8");
              staticLayer.appendChild(bCircle);
              
              var bLabel = document.createElementNS(svgNS, "text");
              bLabel.setAttribute("x", bx + 6);
              bLabel.setAttribute("y", bsy + 3);
              bLabel.setAttribute("font-size", "7");
              bLabel.setAttribute("fill", "#666");
              bLabel.setAttribute("font-family", "sans-serif");
              bLabel.setAttribute("font-weight", "500");
              bLabel.textContent = _rS(branch.stations[bsi]);
              staticLayer.appendChild(bLabel);
            }
          }
          
          // Branch name
          var branchName = document.createElementNS(svgNS, "text");
          branchName.setAttribute("x", bx);
          branchName.setAttribute("y", branchTop - 6);
          branchName.setAttribute("font-size", "8");
          branchName.setAttribute("fill", bColor);
          branchName.setAttribute("font-family", "sans-serif");
          branchName.setAttribute("font-weight", "600");
          branchName.setAttribute("text-anchor", "middle");
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
      var noData = t("trains.no_data");
      var loading = t("trains.loading");
      var info = "";
      if (positions.length === 0) {
        info = '<div class="tp-no-data">' + noData + '<br><span style="font-size:11px;color:var(--text-muted)">' + loading + '</span></div>';
      }
      el.innerHTML = '<div class="tp-map-wrap"></div>' + info;
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
      var idx = Math.min(p.stationIndex || 0, stationCoords.length - 1);
      var coord = stationCoords[idx];
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
      } else {
        // Create new train icon
        var iconSrc = (window.TrainIcons && typeof window.TrainIcons.getTrainIcon === "function") ? window.TrainIcons.getTrainIcon(lineId, line.operator, trainUid, p.stationIndex, p.trainType) : "";
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
        }
      }
    }
    
    // Remove icons for trains that no longer exist
    var allIcons = trainLayer.querySelectorAll('[data-train-id]');
    for (var ii = 0; ii < allIcons.length; ii++) {
      var tid = allIcons[ii].getAttribute('data-train-id');
      if (!updatedIds[tid]) {
        allIcons[ii].parentNode.removeChild(allIcons[ii]);
      }
    }
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
    if (!ul || Object.keys(ul).length === 0) { el.innerHTML = ''; return; }
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
      listEl.addEventListener("click", function(e) {
        var card = e.target.closest(".rs-line-card");
        if (card) showLineView(card.dataset.line);
      });
      if (backBtn) {
        backBtn.addEventListener("click", function() {
          window.location.hash = "";
          hideLineView();
        });
      }
      loadCachedPositions(function() {
        renderList(listEl);
        renderFilterBar(document.getElementById("trainsFilterBar"));
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
        if (allLines[id] && allLines[id].operator === _selectedOperator) {
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
