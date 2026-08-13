/*
 * Pixel Tetsudo - Train Location Page Controller
 * v2 - 完全独立于 DataFusion，直接从 UNIFIED_LINES 渲染
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

  // 直接从 UNIFIED_LINES 构建线路数据，不依赖 DataFusion
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
        realtimePositions: []
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
    } catch(e) {}
    return [];
  }

  function renderCard(line, lineId) {
    try {
      var color = line.color || "#888888";
      var name = (window.tLine && window.tLine(line.code)) || line.nameEn || line.name || lineId;
      var sel = currentLine === lineId ? " selected" : "";
      var icon = "";
      if (line.image) {
        icon = '<img class="rs-line-icon" src="' + escapeHtml(line.image) + '" alt="" loading="lazy">';
      } else {
        icon = '<div class="rs-code-badge" style="background:' + escapeHtml(color) + ';">' + escapeHtml(line.code) + '</div>';
      }
      return '<div class="rs-line-card' + sel + '" data-line="' + escapeHtml(lineId) + '"'
        + ' style="--line-color:' + escapeHtml(color) + ';">'
        + '<div class="rs-line-header">'
        + icon
        + '<div class="rs-line-info">'
        + '<div class="rs-line-name">' + escapeHtml(name) + '</div>'
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
          + '<div class="rs-operator-title">' + escapeHtml(ops[j]) + '</div>'
          + '<div class="rs-cards-container">';
        var items = groups[ops[j]];
        for (var k = 0; k < items.length; k++) {
          html += renderCard(items[k].line, items[k].id);
        }
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
      var color = line.color || "#00a04e";
      var stations = line.stations || [];
      var isLoop = line.type === "loop";
      var sp = 30, topP = 16, botP = 14;
      var h = topP + stations.length * sp + botP;
      var svgW = isLoop ? 200 : 190;
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + svgW + ' ' + h + '" preserveAspectRatio="xMidYMid meet">';
      svg += '<defs><filter id="tg_' + escapeHtml(lineId) + '"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
      svg += '<rect width="' + svgW + '" height="' + h + '" fill="var(--bg)" rx="8"/>';
      var cx = svgW / 2;
      var y1 = topP, y2 = topP + (stations.length - 1) * sp;
      svg += '<line x1="' + cx + '" y1="' + y1 + '" x2="' + cx + '" y2="' + y2 + '" stroke="' + escapeHtml(color) + '" stroke-width="5" stroke-linecap="round" opacity="0.35"/>';
      for (var i = 0; i < stations.length; i++) {
        var st = stations[i];
        var y = topP + i * sp;
        var hasTrain = positions.some(function(p) { return p.stationIndex === i; });
        svg += '<circle cx="' + cx + '" cy="' + y + '" r="' + (hasTrain ? 6 : 4) + '" fill="' + (hasTrain ? escapeHtml(color) : "#fff") + '" stroke="' + escapeHtml(color) + '" stroke-width="' + (hasTrain ? 2.5 : 2) + '"/>';
        var dn = tStation(st);
        svg += '<text x="' + (cx + 14) + '" y="' + (y + 3.5) + '" font-size="9" fill="#444" font-family="sans-serif" font-weight="500">' + escapeHtml(dn) + '</text>';
      }
      for (var j = 0; j < positions.length; j++) {
        var p = positions[j];
        var py = topP + Math.min(p.stationIndex || 0, stations.length - 1) * sp;
        svg += '<circle cx="' + cx + '" cy="' + py + '" r="8" fill="' + escapeHtml(color) + '" filter="url(#tg_' + escapeHtml(lineId) + ')" opacity="0.9"/>';
        svg += '<circle cx="' + cx + '" cy="' + py + '" r="3" fill="#fff"/>';
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
      if (titleEl) titleEl.textContent = (window.tLine && window.tLine(fusedLine.code)) || fusedLine.nameEn || fusedLine.name;
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
      renderList(listEl);
      var hash = window.location.hash;
      if (hash && hash.length > 1) {
        var lid = hash.substring(1);
        var lines = getLinesData();
        if (lines[lid]) showLineView(lid);
      }
      if (backBtn) backBtn.textContent = "\u2190 " + t("line_map.back");
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