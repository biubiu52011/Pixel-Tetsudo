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
        branchOf: l.branchOf || null
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
  
  /**
   * Compute route geometry for a line - single source of truth for all station coordinates.
   * Result is cached and only recomputed when line changes.
   * @param {Object} line - Line object with stations, type, color, etc.
   * @param {string} lineId - Line ID
   * @returns {Object} Geometry object with stations, svgW, svgH, isLoop, isSixShapedLoop, etc.
   */
  function computeRouteGeometry(line, lineId) {
    // Check cache first
    if (_routeGeometryCache[lineId] && _routeGeometryCache[lineId].lineHash === _computeLineHash(line)) {
      return _routeGeometryCache[lineId];
    }
    
    var stations = line.stations || [];
    var color = line.color || "#008803";
    var isLoop = line.type === "loop";
    var isSixShapedLoop = line.isSixShapedLoop === true;
    var sp = 30, topP = 16, botP = 14;
    
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
      var spLoop6 = 26;
      var loopRectW = 150;
      var loopRectH = Math.max(loopStations.length * spLoop6 - 40, 200);
      
      var marginRight = 30;
      var marginTopBot = 40;
      var tailAreaWidth = 140;
      var leftMargin = 10;
      
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
      var stubLen = 35;
      var stubX = junctionX - stubLen;
      var stubY = junctionY;
      
      // Tail: vertical line going up, stations arranged along vertical line
      var tailCount = hikarigaokaStations.length - 1;
      var tailTotalHeight = tailCount > 0 ? Math.min(loopRectH * 0.85, tailCount * spLoop6) : 0;
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
      var loopRectH = Math.max(stations.length * 36 / 2 - 80, 140);
      svgW = 260;
      svgH = loopRectH + 80;
      var cx = svgW / 2, cy = svgH / 2;
      var rectW = 80, rectH = loopRectH;
      var halfW = rectW / 2, halfH = rectH / 2;
      var perimeter = 2 * (rectW + rectH);
      var startOffset = rectW / 2;
      
      var loopPts = [];
      for (var i = 0; i < stations.length; i++) {
        var pos = ((i / stations.length) * perimeter + startOffset) % perimeter;
        var lx, ly, side;
        if (pos < rectW) { lx = cx - halfW + pos; ly = cy - halfH; side = "top"; }
        else if (pos < rectW + rectH) { lx = cx + halfW; ly = cy - halfH + (pos - rectW); side = "right"; }
        else if (pos < 2 * rectW + rectH) { lx = cx + halfW - (pos - rectW - rectH); ly = cy + halfH; side = "bottom"; }
        else { lx = cx - halfW; ly = cy + halfH - (pos - 2 * rectW - rectH); side = "left"; }
        loopPts.push({ x: lx, y: ly, side: side, stationId: stations[i] });
      }
      stationCoords = loopPts;
      
      routeElements.push({
        type: 'rect',
        attrs: { x: cx - halfW, y: cy - halfH, width: rectW, height: rectH, rx: 10, ry: 10, stroke: color, 'stroke-width': 5, fill: 'none', opacity: 0.35 }
      });
      
    } else {
      // Standard linear line
      svgW = 190 + branchOffset;
      svgH = topP + stations.length * sp + botP;
      var mainCx = svgW / 2 - branchOffset / 2;
      
      for (var i = 0; i < stations.length; i++) {
        stationCoords.push({ x: mainCx, y: topP + i * sp, side: 'right', stationId: stations[i] });
      }
      
      var y1 = topP, y2 = topP + (stations.length - 1) * sp;
      routeElements.push({
        type: 'line',
        attrs: { x1: mainCx, y1: y1, x2: mainCx, y2: y2, stroke: color, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.35 }
      });
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
      color: color,
      branchLines: branchLines,
      branchOffset: branchOffset,
      routeElements: routeElements,
      junctionStation: isSixShapedLoop ? stations[0] : null
    };
    
    // Cache it
    _routeGeometryCache[lineId] = geometry;
    
    return geometry;
  }
  
  function _computeLineHash(line) {
    // Simple hash based on stations and type
    return (line.stations || []).join('|') + '|' + (line.type || '') + '|' + (line.isSixShapedLoop ? '6' : '0');
  }
  
  function invalidateRouteGeometryCache(lineId) {
    if (lineId) {
      delete _routeGeometryCache[lineId];
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
      var color = geometry.color;
      
      // Check if we need full rebuild (line changed) or just train layer update
      var existingSvg = el.querySelector('svg');
      var isSameLine = existingSvg && existingSvg.getAttribute('data-line-id') === lineId;
      
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
      svg.setAttribute("data-line-id", lineId);
      
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
        else if (side === "left") { tx = sc.x - (isJunction ? 12 : 8); ty = sc.y + (isJunction ? 4 : 3); anchor = "end"; }
        else { tx = sc.x + (isJunction ? 10 : 8); ty = sc.y + 3; anchor = "start"; }
        label.setAttribute("x", tx);
        label.setAttribute("y", ty);
        label.setAttribute("font-size", isJunction ? "9" : "7.5");
        label.setAttribute("fill", isJunction ? color : "#555");
        label.setAttribute("font-family", "sans-serif");
        label.setAttribute("font-weight", isJunction ? "700" : "500");
        label.setAttribute("text-anchor", anchor);
        label.textContent = _rS(stationId);
        staticLayer.appendChild(label);
      }
      
      // Add branch lines (if any)
      for (var bi = 0; bi < geometry.branchLines.length; bi++) {
        var branch = geometry.branchLines[bi];
        var bColor = branch.color || color;
        var junctionIdx = 0; // Simplified: branch starts at first station
        if (geometry.isLoop && stationCoords.length > junctionIdx) {
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
      
      // === Train layer: empty initially, populated by updateTrainLayer ===
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
        var iconSrc = (window.TrainIcons && typeof window.TrainIcons.getTrainIcon === "function") ? window.TrainIcons.getTrainIcon(lineId, line.operator) : "";
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
      renderList(listEl);
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
        // Restore hash-based navigation
        var hash = window.location.hash;
        if (hash && hash.length > 1) {
          var lid = hash.substring(1);
          var lines = getLinesData();
          if (lines[lid]) showLineView(lid);
        }
        if (backBtn) backBtn.textContent = "\u2190 " + t("line_map.back");
      });
      // Subscribe to DataState changes to handle late data loading
      if (window.DataState) {
        window.DataState.subscribe(function(lines, delayData, positions) {
          if (!lines || Object.keys(lines).length === 0 || !listEl) return;
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
          } else if (posHash !== _lastPositionsHash) {
            _lastPositionsHash = posHash;
            renderList(listEl);
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
