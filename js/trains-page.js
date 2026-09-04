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
    detectBranches(lines);
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
  function renderTrainMap(el, line, lineId) {
    try {
      var positions = getRealtimePositions(lineId);
      var color = line.color || "#008803";
      var stations = line.stations || [];
      var _lang = window.currentLang || 'ja';
      var _rS = (window.RailwayDB && window.RailwayDB.resolveStationName) ? function(id){ return window.RailwayDB.resolveStationName(id, _lang) || id; } : function(id){ return id; };
      var branchLines = [];
      var allLines = getLinesData();
      for (var lid in allLines) {
        if (allLines[lid].branchOf === lineId && lid !== lineId) {
          var bl = allLines[lid];
          if (bl.stations && bl.stations.length > 0) {
            branchLines.push({ id: lid, name: bl.name || lid, color: bl.color || color, stations: bl.stations });
          }
        }
      }
      var isLoop = line.type === "loop";
      var sp = 30, topP = 16, botP = 14;
      var numBranches = branchLines.length;
      var branchOffset = numBranches > 0 ? 70 * numBranches : 0;
      var loopRectH = Math.max(stations.length * 28 / 2 - 80, 120);
      var svgW = isLoop ? 260 : 190 + branchOffset;
      var svgH = isLoop ? loopRectH + 80 : topP + stations.length * sp + botP;
      var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 " + svgW + " " + svgH + "\" preserveAspectRatio=\"xMidYMid meet\">";
      svg += "<defs><filter id=\"tg_" + escapeHtml(lineId) + "\"><feGaussianBlur stdDeviation=\"2\" result=\"b\"/><feMerge><feMergeNode in=\"b\"/><feMergeNode in=\"SourceGraphic\"/></feMerge></filter></defs>";
      svg += "<rect width=\"" + svgW + "\" height=\"" + svgH + "\" fill=\"var(--bg)\" rx=\"8\"/>";
      var loopPts = [];
      var mainCx = svgW / 2 - branchOffset / 2;
      if (isLoop && stations.length > 2) {
        var spLoop = 28;
        var rectW = 80;
        var rectH = loopRectH;
        var halfW = rectW / 2, halfH = rectH / 2;
        var perimeter = 2 * (rectW + rectH);
        var startOffset = rectW / 2;
        var cx = svgW / 2, cy = svgH / 2;
        for (var i = 0; i < stations.length; i++) {
          var pos = ((i / stations.length) * perimeter + startOffset) % perimeter;
          var lx, ly;
          if (pos < rectW) { lx = cx - halfW + pos; ly = cy - halfH; }
          else if (pos < rectW + rectH) { lx = cx + halfW; ly = cy - halfH + (pos - rectW); }
          else if (pos < 2 * rectW + rectH) { lx = cx + halfW - (pos - rectW - rectH); ly = cy + halfH; }
          else { lx = cx - halfW; ly = cy + halfH - (pos - 2 * rectW - rectH); }
          var side = (pos < rectW) ? "top" : (pos < rectW + rectH ? "right" : (pos < 2 * rectW + rectH ? "bottom" : "left"));
          loopPts.push({ x: lx, y: ly, angle: 0, side: side });
        }
        svg += "<rect x=\"" + (cx - halfW) + "\" y=\"" + (cy - halfH) + "\" width=\"" + rectW + "\" height=\"" + rectH + "\" rx=\"10\" ry=\"10\" stroke=\"" + escapeHtml(color) + "\" stroke-width=\"5\" fill=\"none\" opacity=\"0.35\"/>";
        for (var i = 0; i < stations.length; i++) {
          var p = loopPts[i];
          var st = stations[i];
          var hasTrain = positions.some(function(pp) { return pp.stationIndex === i; });
          svg += "<circle cx=\"" + p.x + "\" cy=\"" + p.y + "\""+ "  r=\"" + (hasTrain ? 6 : 4) + "\""+ "  fill=\"" + (hasTrain ? escapeHtml(color) : "#fff") + "\""+ "  stroke=\"" + escapeHtml(color) + "\""+ "  stroke-width=\"" + (hasTrain ? 2.5 : 2) + "\"/>";
          var dn = st;
          var side = p.side || "right";
          var tx = p.x + (side === "left" ? -12 : 12);
          var ty = p.y + (side === "top" ? -6 : (side === "bottom" ? 12 : 3.5));
          var anchor = side === "left" ? "end" : "start";
          svg += "<text x=\"" + tx + "\" y=\"" + ty + "\""+ "  font-size=\"9\" fill=\"#444\" font-family=\"sans-serif\" font-weight=\"500\" text-anchor=\"" + anchor + "\">" + escapeHtml(_rS(dn)) + "</text>";
        }
      } else {
        var y1 = topP, y2 = topP + (stations.length - 1) * sp;
        svg += "<line x1=\"" + mainCx + "\" y1=\"" + y1 + "\" x2=\"" + mainCx + "\" y2=\"" + y2 + "\""+ "  stroke=\"" + escapeHtml(color) + "\""+ "  stroke-width=\"5\" stroke-linecap=\"round\" opacity=\"0.35\"/>";
        for (var i = 0; i < stations.length; i++) {
          var st = stations[i];
          var y = topP + i * sp;
          var hasTrain = positions.some(function(p) { return p.stationIndex === i; });
          svg += "<circle cx=\"" + mainCx + "\" cy=\"" + y + "\""+ "  r=\"" + (hasTrain ? 6 : 4) + "\""+ "  fill=\"" + (hasTrain ? escapeHtml(color) : "#fff") + "\""+ "  stroke=\"" + escapeHtml(color) + "\""+ "  stroke-width=\"" + (hasTrain ? 2.5 : 2) + "\"/>";
          svg += "<text x=\"" + (mainCx + 14) + "\" y=\"" + (y + 3.5) + "\""+ "  font-size=\"9\" fill=\"#444\" font-family=\"sans-serif\" font-weight=\"500\">" + escapeHtml(_rS(st)) + "</text>";
        }
      }
      for (var bi = 0; bi < branchLines.length; bi++) {
        var branch = branchLines[bi];
        var bColor = branch.color || color;
        var bStations = branch.stations;
        var junctionIdx = -1;
        for (var si = 0; si < bStations.length; si++) {
          var bs = bStations[si];
          for (var mi = 0; mi < stations.length; mi++) {
            if (stations[mi] === bs) { junctionIdx = mi; break; }
          }
          if (junctionIdx >= 0) break;
        }
        if (junctionIdx < 0) junctionIdx = 0;
        var bx, by;
        if (isLoop && loopPts.length > junctionIdx) {
          bx = loopPts[junctionIdx].x + 20 + bi * 70;
          by = loopPts[junctionIdx].y;
        } else {
          var bjy = topP + junctionIdx * sp;
          bx = mainCx + 20 + bi * 70;
          by = bjy;
        }
        var branchTop = isLoop ? by : topP;
        var branchBot = isLoop ? by : topP + (bStations.length - 1) * sp;
        svg += "<line x1=\"" + (isLoop ? loopPts[junctionIdx].x : mainCx) + "\" y1=\"" + by + "\" x2=\"" + bx + "\" y2=\"" + by + "\""+ "  stroke=\"" + escapeHtml(bColor) + "\""+ "  stroke-width=\"3\" opacity=\"0.5\"/>";
        svg += "<line x1=\"" + bx + "\" y1=\"" + branchTop + "\" x2=\"" + bx + "\" y2=\"" + branchBot + "\""+ "  stroke=\"" + escapeHtml(bColor) + "\""+ "  stroke-width=\"4\" stroke-linecap=\"round\" opacity=\"0.4\"/>";
        for (var bsi = 0; bsi < bStations.length; bsi++) {
          var bsy = branchTop + bsi * sp;
          var isJunc = (bsi === 0 && junctionIdx >= 0 && stations[junctionIdx] === bStations[0]);
          svg += "<circle cx=\"" + bx + "\" cy=\"" + bsy + "\""+ "  r=\"" + (isJunc ? 5 : 4) + "\""+ "  fill=\"" + (isJunc ? escapeHtml(bColor) : "#fff") + "\""+ "  stroke=\"" + escapeHtml(bColor) + "\""+ "  stroke-width=\"2\"/>";
        }
        svg += "<text x=\"" + bx + "\" y=\"" + (branchTop - 6) + "\""+ "  font-size=\"8\" fill=\"" + escapeHtml(bColor) + "\""+ "  font-family=\"sans-serif\" font-weight=\"600\" text-anchor=\"middle\">" + escapeHtml(branch.name) + "</text>";
      }
      for (var j = 0; j < positions.length; j++) {
        var p = positions[j];
        var idx = Math.min(p.stationIndex || 0, stations.length - 1);
        var px, py;
        if (isLoop && loopPts.length > idx) {
          px = loopPts[idx].x;
          py = loopPts[idx].y;
        } else {
          px = mainCx;
          py = topP + idx * sp;
        }
        svg += "<circle cx=\"" + px + "\" cy=\"" + py + "\""+ "  r=\"8\" fill=\"" + escapeHtml(color) + "\""+ "  filter=\"url(#tg_" + escapeHtml(lineId) + ")\" opacity=\"0.9\"/>";
        svg += "<circle cx=\"" + px + "\" cy=\"" + py + "\""+ "  r=\"3\" fill=\"#fff\"/>";
      }
      svg += "</svg>";
      var noData = t("trains.no_data");
      var loading = t("trains.loading");
      var running = t("trains.running");
      var cntText = t("trains.train_count");
      var info = "";
      if (positions.length === 0) {
        info = '<div class="tp-no-data">' + noData + '<br><span style="font-size:11px;color:var(--text-muted)">' + loading + '</span></div>';
      } else {
        info = '<div class="tp-no-data tp-running">' + running + " (" + positions.length + " " + cntText + ")" + '</div>';
      }
      el.innerHTML = '<div class="tp-map-wrap">' + svg + "</div>" + info;
    } catch(e) {
      el.innerHTML = '<div class="tp-no-data">Error: ' + escapeHtml(e.message) + '</div>';
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
      if (titleEl) titleEl.textContent = (window.RailwayDB && window.RailwayDB.resolveLineName ? window.RailwayDB.resolveLineName(lineId, window.currentLang) : (fusedLine.nameEn || fusedLine.nameJa || lineId));
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
          if (lines && Object.keys(lines).length > 0 && listEl) {
            var currentLen = listEl.innerHTML.length;
            if (currentLen === 0) {
              renderList(listEl);
              renderFilterBar(document.getElementById("trainsFilterBar"));
            }
          }
        });
      }
      // Refresh filter bar labels on language switch
      if (typeof window.onLanguageChange === "function") {
        window.onLanguageChange(function() {
          renderFilterBar(document.getElementById("trainsFilterBar"));
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
