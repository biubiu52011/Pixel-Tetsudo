/*
 * Pixel Tetsudo - Trains Page Controller
 */
(function() {
  "use strict";

  var currentLine = null;
  var container = null;
  var viewElement = null;
  var titleElement = null;
  var mapElement = null;
  var backBtn = null;
  var _hashTimer = null;
  var _renderScheduled = false;
  var t = window.t || function(key) { return key; };

  function escapeHtml(str) {
    if (!str) return "";
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function formatInterval(mins) {
    if (!mins || mins <= 0) return "";
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    if (h > 0) return h + "h" + (m > 0 ? m + "m" : "");
    return m + "m";
  }

  function safeGet(obj, path, fallback) {
    try {
      var parts = path.split(".");
      var cur = obj;
      for (var i = 0; i < parts.length; i++) {
        if (cur == null) return fallback;
        cur = cur[parts[i]];
      }
      return cur !== undefined ? cur : fallback;
    } catch(e) { return fallback; }
  }

  var _baseData = null;

  function buildBaseData() {
    try {
      var lines = window.UNIFIED_LINES;
      if (!lines) return null;
      var result = { version: 0, timestamp: new Date().toISOString(), lines: {}, lineOrder: [], totalLines: 0 };
      var ids = Object.keys(lines);
      for (var i = 0; i < ids.length; i++) {
        var l = lines[ids[i]];
        if (!l) continue;
        result.lines[ids[i]] = {
          id: ids[i], name: l.name, nameEn: l.nameEn || l.name, code: l.code,
          color: l.color, operator: l.operator, region: l.region, type: l.type,
          image: l.image, stations: l.stations || [], durations: l.durations || [],
          intervalTotal: l.durationTotalMin || 0,
          realtimePositions: [],
          delayInfo: { status: "normal", maxDelay: 0, interval: null, cause: null }
        };
      }
      result.lineOrder = ids;
      result.totalLines = ids.length;
      return result;
    } catch(e) {
      console.error("[TrainsPage] buildBaseData error:", e.message);
      return null;
    }
  }

  function getSafeFusedData() {
    try {
      if (window.DataFusion) {
        var d = window.DataFusion.getFusedData();
        if (d) return d;
      }
    } catch(e) {}
    return _baseData;
  }

  function scheduleRender() {
    if (_renderScheduled) return;
    _renderScheduled = true;
    setTimeout(function() {
      _renderScheduled = false;
      var fd = getSafeFusedData();
      if (fd && container && !container.classList.contains("hidden")) {
        renderLineList(container, fd);
      }
    }, 50);
  }

  function renderCard(line, lineId) {
    try {
      var color = line.color || "#888";
      var name = line.nameEn || line.name || lineId;
      var selectedClass = currentLine === lineId ? " selected" : "";
      var iconHtml = line.image
        ? '<img class="rs-line-icon" src="' + escapeHtml(line.image) + '" alt="" loading="lazy">'
        : '<div class="rs-code-badge" style="background:' + escapeHtml(color) + ';">' + escapeHtml(line.code) + "</div>";
      var interval = formatInterval(safeGet(line, "intervalTotal", 0));
      return '<div class="rs-line-card' + selectedClass + '" data-line="' + escapeHtml(lineId)
        + '" style="--line-color:' + escapeHtml(color) + ';">'
        + '<div class="rs-line-header">'
        + iconHtml
        + '<div class="rs-line-info">'
        + '<div class="rs-line-name">' + escapeHtml(name) + "</div>"
        + (interval ? '<div class="rs-line-interval">' + escapeHtml(interval) + "</div>" : "")
        + "</div></div></div>";
    } catch(e) { return ""; }
  }

  function renderLineList(el, fusedData) {
    if (!el || !fusedData || !fusedData.lines) return;
    try {
      var lines = fusedData.lines;
      var groups = {};
      var ids = Object.keys(lines);
      for (var i = 0; i < ids.length; i++) {
        var line = lines[ids[i]];
        var op = line.operator || "Unknown";
        if (!groups[op]) groups[op] = [];
        groups[op].push({ id: ids[i], line: line });
      }
      var html = "";
      var ops = Object.keys(groups).sort();
      for (var j = 0; j < ops.length; j++) {
        html += '<div class="rs-operator-group">'
          + '<div class="rs-operator-title">' + escapeHtml(ops[j]) + "</div>"
          + '<div class="rs-cards-container">';
        var items = groups[ops[j]];
        for (var k = 0; k < items.length; k++) {
          html += renderCard(items[k].line, items[k].id);
        }
        html += "</div></div>";
      }
      el.innerHTML = html;
    } catch(e) { console.error("[TrainsPage] renderLineList error:", e.message); }
  }

  function init() {
    try {
      container = document.getElementById("trainsLineListContent");
      viewElement = document.getElementById("trainsDetailView");
      titleElement = document.getElementById("trainsDetailTitle");
      mapElement = document.getElementById("trainsMapContainer");
      backBtn = document.getElementById("trainsBackBtn");
      if (!container) return;

      container.addEventListener("click", function(e) {
        var card = e.target.closest(".rs-line-card");
        if (card) showLineView(card.dataset.line);
      });

      if (backBtn) {
        backBtn.addEventListener("click", function() { window.location.hash = ""; });
        backBtn.textContent = "\u2190 " + t("line_map.back");
      }

      // Build base data and initial render
      _baseData = buildBaseData();
      if (_baseData) renderLineList(container, _baseData);

      // Subscribe to real-time data updates
      if (window.DataFusion) {
        window.DataFusion.subscribe(function(fusedData) {
          if (!fusedData || !fusedData.lines) return;
          scheduleRender();
          if (currentLine) {
            var fl = window.DataFusion.getLine(currentLine);
            if (fl) renderTrainMap(mapElement, fl, currentLine);
          }
        });
      }

      // Restore line from URL hash
      var hash = window.location.hash;
      if (hash && hash.length > 1) {
        clearTimeout(_hashTimer);
        _hashTimer = setTimeout(function() { showLineView(hash.substring(1)); }, 100);
      }
      window.addEventListener("hashchange", handleHashChange);

      // Language change handler
      if (typeof window.onLanguageChange === "function") {
        window.onLanguageChange(function() { refreshUI(); });
      }
    } catch(e) { console.error("[TrainsPage] init error:", e.message); }
  }

  function handleHashChange() {
    var hash = window.location.hash;
    clearTimeout(_hashTimer);
    _hashTimer = setTimeout(function() {
      if (hash && hash.length > 1) {
        var lineId = hash.substring(1);
        if (!currentLine) showLineView(lineId);
      } else if (!hash && currentLine) {
        hideLineView();
      }
    }, 80);
  }

  function showLineView(lineId) {
    try {
      currentLine = lineId;
      var fusedLine = null;
      if (window.DataFusion) fusedLine = window.DataFusion.getLine(lineId);
      if (!fusedLine && _baseData && _baseData.lines[lineId]) fusedLine = _baseData.lines[lineId];
      if (!fusedLine) return;
      window.location.hash = lineId;
      if (container) container.classList.add("hidden");
      if (viewElement) viewElement.classList.remove("hidden");
      if (titleElement) titleElement.innerHTML = escapeHtml(fusedLine.nameEn || fusedLine.name);
      if (mapElement) renderTrainMap(mapElement, fusedLine, lineId);
    } catch(e) { console.error("[TrainsPage] showLineView error:", e.message); }
  }

  function hideLineView() {
    try {
      currentLine = null;
      if (container) container.classList.remove("hidden");
      if (viewElement) viewElement.classList.add("hidden");
      var fd = getSafeFusedData();
      if (fd) renderLineList(container, fd);
    } catch(e) { console.error("[TrainsPage] hideLineView error:", e.message); }
  }

  function renderTrainMap(el, line, lineId) {
    try {
      var positions = line.realtimePositions || [];
      var color = line.color || "#00a04e";
      var stations = line.stations || [];
      var isLoop = line.type === "loop";
      var sp = 30, topPad = 16, botPad = 14;
      var h = topPad + stations.length * sp + botPad;
      var svgW = isLoop ? 200 : 190;
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + svgW + " " + h + '" preserveAspectRatio="xMidYMid meet">';
      svg += '<defs><filter id="tg_' + escapeHtml(lineId) + '"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
      svg += '<rect width="' + svgW + '" height="' + h + '" fill="var(--bg)" rx="8"/>';
      var cx = svgW / 2;
      var lineY1 = topPad, lineY2 = topPad + (stations.length - 1) * sp;
      svg += '<line x1="' + cx + '" y1="' + lineY1 + '" x2="' + cx + '" y2="' + lineY2 + '" stroke="' + escapeHtml(color) + '" stroke-width="5" stroke-linecap="round" opacity="0.35"/>';
      for (var i = 0; i < stations.length; i++) {
        var st = stations[i];
        var y = topPad + i * sp;
        var isTrain = positions.some(function(p) { return p.stationIndex === i; });
        svg += '<circle cx="' + cx + '" cy="' + y + '" r="' + (isTrain ? 6 : 4) + '" fill="' + (isTrain ? escapeHtml(color) : "#fff") + '" stroke="' + escapeHtml(color) + '" stroke-width="' + (isTrain ? 2.5 : 2) + '"/>';
        var dn = st.length > 10 ? st.substring(0, 10) + "\u2026" : st;
        var tx = cx + 14;
        svg += '<text x="' + tx + '" y="' + (y + 3.5) + '" font-size="9" fill="#444" font-family="sans-serif" font-weight="500">' + escapeHtml(dn) + '</text>';
      }
      for (var j = 0; j < positions.length; j++) {
        var pos = positions[j];
        var py = topPad + Math.min(pos.stationIndex || 0, stations.length - 1) * sp;
        svg += '<circle cx="' + cx + '" cy="' + py + '" r="8" fill="' + escapeHtml(color) + '" filter="url(#tg_' + escapeHtml(lineId) + ')" opacity="0.9"/>';
        svg += '<circle cx="' + cx + '" cy="' + py + '" r="3" fill="#fff"/>';
      }
      svg += "</svg>";
      var noDataText = t("trains.no_data");
      var loadingText = t("trains.loading");
      var runningText = t("trains.running");
      var trainCountText = t("trains.train_count");
      var statusHtml = "";
      if (positions.length === 0) {
        statusHtml = '<div class="tp-no-data">' + noDataText + '<br><span style="font-size:11px;color:var(--text-muted)">' + loadingText + "</span></div>";
      } else {
        statusHtml = '<div class="tp-no-data tp-running">' + runningText + " (" + positions.length + " " + trainCountText + ")</div>";
      }
      el.innerHTML = '<div class="tp-map-wrap">' + svg + "</div>" + statusHtml;
    } catch(e) {
      console.error("[TrainsPage] renderTrainMap error:", e.message);
      el.innerHTML = '<div class="tp-no-data">' + t("trains.map_error") + "</div>";
    }
  }

  function refreshUI() {
    try {
      if (backBtn) backBtn.textContent = "\u2190 " + t("line_map.back");
      if (!currentLine && container && !container.classList.contains("hidden")) {
        var fd = getSafeFusedData();
        if (fd) renderLineList(container, fd);
      }
      if (currentLine && mapElement) {
        var fusedLine = null;
        if (window.DataFusion) fusedLine = window.DataFusion.getLine(currentLine);
        if (!fusedLine && _baseData && _baseData.lines[currentLine]) fusedLine = _baseData.lines[currentLine];
        if (fusedLine) renderTrainMap(mapElement, fusedLine, currentLine);
      }
    } catch(e) { console.error("[TrainsPage] refreshUI error:", e.message); }
  }

  window.TrainsPage = { init: init, refreshUI: refreshUI, showLineView: showLineView, hideLineView: hideLineView };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
