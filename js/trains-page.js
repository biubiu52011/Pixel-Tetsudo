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
  var mapEl = null;
  var backBtn = null;
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

  // JSON base path (relative to trains.html)
  var JSON_DATA_PATH = "../data/railway_data.json?v=" + Date.now();

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
    var ul = window.UNIFIED_LINES;
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
    } catch(e) {}
    return [];
  }

  function renderCard(line, lineId) {
    try {
      var color = line.color || "#888888";
      var name = line.nameJa || line.nameEn || line.name || lineId;
      var sel = currentLine === lineId ? " selected" : "";
      var loopBadge = line.type === "loop" ? '<span class="rs-loop-badge">' + escapeHtml(t("line.loop")) + '</span>' : "";
      var branchCls = line.branchOf ? " rs-branch" : "";
      var branchHtml = line.branchOf ? '<span class="rs-branch-indicator">&#9733;</span>' : "";
      var iconHtml = "";
      if (line.image) {
        iconHtml = '<img class="rs-line-icon" src="' + escapeHtml(line.image) + '" alt="" loading="lazy">';
      } else {
        iconHtml = '<div class="rs-code-badge" style="background:' + escapeHtml(color) + '"><span>' + escapeHtml(line.code) + '</span></div>';
      }
      return '<div class="rs-line-card' + sel + branchCls + '" data-line="' + escapeHtml(lineId) + '"'
        + ' style="--line-color:' + escapeHtml(color) + '"'
        + '>'
        + '<div class="rs-line-header">'
        + iconHtml
        + '<div class="rs-line-info">'
        + '<div class="rs-line-name">' + branchHtml + escapeHtml(name) + '</div>' + loopBadge
        + '</div></div></div>';
    } catch(e) { return ""; }
  }

  function renderList(el) {
    if (!el) return;
    try {
      var lines = getLinesData();
      if (!lines || Object.keys(lines).length === 0) {
        el.innerHTML = '<div class="tp-no-data">No line data available</div>';
        return;
      }
      var groups = {};
      var ids = Object.keys(lines);
      for (var i = 0; i < ids.length; i++) {
        var l = lines[ids[i]];
        var opKey = l.operator || "Unknown";
        var op = (window.tOp && window.tOp(opKey)) || opKey;
        if (!groups[op]) groups[op] = [];
        groups[op].push({ id: ids[i], line: l });
      }
      var html = "";
      var ops = Object.keys(groups).sort();
      for (var j = 0; j < ops.length; j++) {
        html += '<div class="rs-operator-group">'
          + '<div class="rs-cards-container">';
        var items = groups[ops[j]];
        items.sort(function(a, b) { return (a.line.code || "").localeCompare(b.line.code || ""); });
        var sorted = [];
        var added = {};
        for (var k = 0; k < items.length; k++) { added[items[k].id] = false; }
        for (var k = 0; k < items.length; k++) {
          var l = items[k].line;
          if (!l.branchOf && !added[l.id]) {
            sorted.push(items[k]);
            added[l.id] = true;
            for (var m = 0; m < items.length; m++) {
              if (items[m].line.branchOf === l.id && !added[items[m].id]) {
                sorted.push(items[m]);
                added[items[m].id] = true;
              }
            }
          }
        }
        for (var k = 0; k < items.length; k++) { if (!added[items[k].id]) sorted.push(items[k]); }
        for (var k = 0; k < sorted.length; k++) { html += renderCard(sorted[k].line, sorted[k].id); }
        html += '</div></div>';
      }
      el.innerHTML = html;
    } catch(e) {
      el.innerHTML = '<div class="tp-no-data">Error: ' + escapeHtml(e.message) + '</div>';
    }
  }

  function renderTrainMap(el, line, lineId) {
    try {
      var positions = getRealtimePositions(lineId);
      var color = line.color || "#008803";
      var stations = line.stations || [];
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
      var svgW = isLoop ? 200 : 190 + branchOffset;
      var svgH = topP + stations.length * sp + botP;
      if (isLoop) { svgH = 200; }
      var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 " + svgW + " " + svgH + "\" preserveAspectRatio=\"xMidYMid meet\">";
      svg += "<defs><filter id=\"tg_" + escapeHtml(lineId) + "\"><feGaussianBlur stdDeviation=\"2\" result=\"b\"/><feMerge><feMergeNode in=\"b\"/><feMergeNode in=\"SourceGraphic\"/></feMerge></filter></defs>";
      svg += "<rect width=\"" + svgW + "\" height=\"" + svgH + "\" fill=\"var(--bg)\" rx=\"8\"/>";
      var loopPts = [];
      var mainCx = svgW / 2 - branchOffset / 2;
      if (isLoop && stations.length > 2) {
        var cx = svgW / 2, cy = svgH / 2;
        var rx = Math.min(cx - 18, 70), ry = Math.min(cy - 12, 80);
        for (var i = 0; i < stations.length; i++) {
          var angle = (i / stations.length) * 2 * Math.PI - Math.PI / 2;
          loopPts.push({ x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle), angle: angle });
        }
        svg += "<ellipse cx=\"" + cx + "\" cy=\"" + cy + "\"" rx=\"" + rx + "\"" ry=\"" + ry + "\"" stroke=\"" + escapeHtml(color) + "\"" stroke-width=\"5\" fill=\"none\" opacity=\"0.35\"/>";
        for (var i = 0; i < stations.length; i++) {
          var p = loopPts[i];
          var st = stations[i];
          var hasTrain = positions.some(function(pp) { return pp.stationIndex === i; });
          svg += "<circle cx=\"" + p.x + "\" cy=\"" + p.y + "\"" r=\"" + (hasTrain ? 6 : 4) + "\"" fill=\"" + (hasTrain ? escapeHtml(color) : "#fff") + "\"" stroke=\"" + escapeHtml(color) + "\"" stroke-width=\"" + (hasTrain ? 2.5 : 2) + "\"/>";
          var dn = st;
          var tx = p.x + 12 * Math.cos(p.angle);
          var ty = p.y + 12 * Math.sin(p.angle);
          var anchor = Math.cos(p.angle) > 0.1 ? "start" : (Math.cos(p.angle) < -0.1 ? "end" : "middle");
          svg += "<text x=\"" + tx + "\" y=\"" + (ty + 3.5) + "\"" font-size=\"9\" fill=\"#444\" font-family=\"sans-serif\" font-weight=\"500\" text-anchor=\"" + anchor + "\">" + escapeHtml(dn) + "</text>";
        }
      } else {
        var y1 = topP, y2 = topP + (stations.length - 1) * sp;
        svg += "<line x1=\"" + mainCx + "\" y1=\"" + y1 + "\" x2=\"" + mainCx + "\" y2=\"" + y2 + "\"" stroke=\"" + escapeHtml(color) + "\"" stroke-width=\"5\" stroke-linecap=\"round\" opacity=\"0.35\"/>";
        for (var i = 0; i < stations.length; i++) {
          var st = stations[i];
          var y = topP + i * sp;
          var hasTrain = positions.some(function(p) { return p.stationIndex === i; });
          svg += "<circle cx=\"" + mainCx + "\" cy=\"" + y + "\"" r=\"" + (hasTrain ? 6 : 4) + "\"" fill=\"" + (hasTrain ? escapeHtml(color) : "#fff") + "\"" stroke=\"" + escapeHtml(color) + "\"" stroke-width=\"" + (hasTrain ? 2.5 : 2) + "\"/>";
          svg += "<text x=\"" + (mainCx + 14) + "\" y=\"" + (y + 3.5) + "\"" font-size=\"9\" fill=\"#444\" font-family=\"sans-serif\" font-weight=\"500\">" + escapeHtml(st) + "</text>";
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
        svg += "<line x1=\"" + (isLoop ? loopPts[junctionIdx].x : mainCx) + "\" y1=\"" + by + "\" x2=\"" + bx + "\" y2=\"" + by + "\"" stroke=\"" + escapeHtml(bColor) + "\"" stroke-width=\"3\" opacity=\"0.5\"/>";
        svg += "<line x1=\"" + bx + "\" y1=\"" + branchTop + "\" x2=\"" + bx + "\" y2=\"" + branchBot + "\"" stroke=\"" + escapeHtml(bColor) + "\"" stroke-width=\"4\" stroke-linecap=\"round\" opacity=\"0.4\"/>";
        for (var bsi = 0; bsi < bStations.length; bsi++) {
          var bsy = branchTop + bsi * sp;
          var isJunc = (bsi === 0 && junctionIdx >= 0 && stations[junctionIdx] === bStations[0]);
          svg += "<circle cx=\"" + bx + "\" cy=\"" + bsy + "\"" r=\"" + (isJunc ? 5 : 4) + "\"" fill=\"" + (isJunc ? escapeHtml(bColor) : "#fff") + "\"" stroke=\"" + escapeHtml(bColor) + "\"" stroke-width=\"2\"/>";
        }
        svg += "<text x=\"" + bx + "\" y=\"" + (branchTop - 6) + "\"" font-size=\"8\" fill=\"" + escapeHtml(bColor) + "\"" font-family=\"sans-serif\" font-weight=\"600\" text-anchor=\"middle\">" + escapeHtml(branch.name) + "</text>";
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
        svg += "<circle cx=\"" + px + "\" cy=\"" + py + "\"" r=\"8\" fill=\"" + escapeHtml(color) + "\"" filter=\"url(#tg_" + escapeHtml(lineId) + "")\" opacity=\"0.9\"/>";
        svg += "<circle cx=\"" + px + "\" cy=\"" + py + "\"" r=\"3\" fill=\"#fff\"/>";
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
      if (detailEl) detailEl.classList.remove("hidden");
      if (titleEl) titleEl.textContent = fusedLine.nameEn || fusedLine.name;
      if (mapEl) renderTrainMap(mapEl, fusedLine, lineId);
    } catch(e) {}
  }

  function hideLineView() {
    try {
      currentLine = null;
      if (listEl) listEl.classList.remove("hidden");
      if (detailEl) detailEl.classList.add("hidden");
      renderList(listEl);
    } catch(e) {}
  }

  // ========== New data loading: merge JSON stations with JS metadata ==========
  function loadJsonData(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", JSON_DATA_PATH, true);
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var data = JSON.parse(xhr.responseText);
          var lines = data.lines || {};
          var merged = {};
          var ul = window.UNIFIED_LINES || {};
          var ids = Object.keys(lines);
          for (var i = 0; i < ids.length; i++) {
            var jid = ids[i];
            var meta = ul[jid] || {};
            merged[jid] = {
              name: meta.name || jid,
              nameEn: meta.nameEn || meta.name || jid,
              nameJa: meta.nameJa || meta.name || jid,
              code: meta.code || jid,
              color: meta.color || "#888888",
              operator: meta.operator || "Unknown",
              region: meta.region || "",
              type: meta.type || "straight",
              image: meta.image || "",
              stations: lines[jid].stations || [],
              durations: lines[jid].durations || [],
              durationTotalMin: meta.durationTotalMin || 0,
              branchOf: meta.branchOf || null
            };
          }
          window.UNIFIED_LINES = merged;
          console.log("[trains] Loaded " + Object.keys(merged).length + " lines from JSON + metadata");
          if (callback) callback();
        } catch(e) {
          console.error("[trains] Failed to parse JSON data:", e);
          if (callback) callback();
        }
      } else {
        console.warn("[trains] Failed to load JSON data, status:", xhr.status);
        if (callback) callback();
      }
    };
    xhr.onerror = function() {
      console.error("[trains] Network error loading JSON data");
      if (callback) callback();
    };
    xhr.send();
  }

  function init() {
    try {
      listEl = document.getElementById("trainsLineListContent");
      detailEl = document.getElementById("trainsDetailView");
      titleEl = document.getElementById("trainsDetailTitle");
      mapEl = document.getElementById("trainsMapContainer");
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
      // Load JSON data first, then render
      loadJsonData(function() {
        renderList(listEl);
        if (backBtn) backBtn.textContent = "\u2190 " + t("line_map.back");
      });
    } catch(e) {}
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
