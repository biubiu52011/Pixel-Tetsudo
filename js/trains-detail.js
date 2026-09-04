/**
 * Pixel Tetsudo - Trains Detail View (inline)
 */
(function(){
  "use strict";
  var t = window.t || function(k){ return k; };
  var escapeHtml = window.escapeHtml || function(s){
    if(!s) return "";
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  };  var currentLineId = null;

  function getStatusText(status) {
    if(status === "normal") return t("status.normal");
    if(status === "delayed") return t("status.delayed");
    if(status === "suspended") return t("status.suspended");
    return t("status.none");
  }

  function getStatusClass(status) {
    if(status === "normal") return "status-normal";
    if(status === "delayed") return "status-delayed";
    if(status === "suspended") return "status-suspended";
    return "status-none";
  }

  function getLineData(lineId) {
    var fused = window.DATA_FUSION;
    if (fused && fused.lines && fused.lines[lineId]) return fused.lines[lineId];
    // RailwayDB/DataLayer-first fallback
    if (window.DataLayer && window.DataLayer.getLine) {
      var rdb = window.DataLayer.getLine(lineId);
      if (rdb) return rdb;
    }
    // Compat fallback
    return (window.UNIFIED_LINES && window.UNIFIED_LINES[lineId]) || null;
  }

  function renderStationMap(el, line) {
    var stations = line.stations || [];
    var color = line.color || "#008803";
    var isLoop = line.type === "loop";
    var sp = 28, topP = 20, botP = 16;
    var loopRectH = Math.max(stations.length * 36 / 2 - 80, 140);
    var svgH = isLoop ? loopRectH + 80 : topP + stations.length * sp + botP;
    var svgW = isLoop ? 260 : 160;

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + svgW + ' ' + svgH + '" preserveAspectRatio="xMidYMid meet" class="tp-line-map">';
    svg += '<defs><filter id="tg_' + escapeHtml(line.id) + '"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></defs>';
    svg += '<rect width="' + svgW + '" height="' + svgH + '" fill="var(--bg)" rx="8"/>';

    if(isLoop && stations.length > 2) {
      var spLoop = 36;
      var rectW = 80;
      var rectH = loopRectH;
      var halfW = rectW / 2, halfH = rectH / 2;
      var perimeter = 2 * (rectW + rectH);
      var startOffset = rectW / 2;
      var cx = svgW / 2, cy = svgH / 2;
      for(var i = 0; i < stations.length; i++) {
        var pos = ((i / stations.length) * perimeter + startOffset) % perimeter;
        var x, y;
        if (pos < rectW) { x = cx - halfW + pos; y = cy - halfH; }
        else if (pos < rectW + rectH) { x = cx + halfW; y = cy - halfH + (pos - rectW); }
        else if (pos < 2 * rectW + rectH) { x = cx + halfW - (pos - rectW - rectH); y = cy + halfH; }
        else { x = cx - halfW; y = cy + halfH - (pos - 2 * rectW - rectH); }
        svg += '<circle cx="' + x + '" cy="' + y + '" r="4" fill="#fff" stroke="' + color + '" stroke-width="2.5"/>';
        var tx = x + 12, ty = y + 3;
        var anchor = "start";
        if (pos >= rectW && pos < rectW + rectH) { tx = x + 12; anchor = "start"; }
        else if (pos >= 2 * rectW + rectH) { tx = x - 12; anchor = "end"; ty = y + 3; }
        else if (pos < rectW) { ty = y - 10; tx = x; anchor = "middle"; }
        else { ty = y + 16; tx = x; anchor = "middle"; }
        svg += '<text x="' + tx + '" y="' + ty + '" font-size="8" fill="#444" font-family="sans-serif" text-anchor="' + anchor + '">' + escapeHtml(_rS(stations[i])) + '</text>';
      }
      svg += '<rect x="' + (cx - halfW) + '" y="' + (cy - halfH) + '" width="' + rectW + '" height="' + rectH + '" rx="12" ry="12" stroke="' + color + '" stroke-width="4" fill="none" opacity="0.4"/>';
      // Branch stations
      if(line.branchStations && line.branchStations.length > 0) {
        var bx = cx + halfW + 15, by = cy;
        svg += '<line x1="' + (cx + halfW) + '" y1="' + cy + '" x2="' + bx + '" y2="' + by + '" stroke="' + color + '" stroke-width="2" stroke-dasharray="3,2" opacity="0.6"/>';
        for(var bi = 0; bi < line.branchStations.length; bi++) {
          var bs = line.branchStations[bi];
          var sx = bx + bi * 18;
          var sy = by + (bi % 2 === 0 ? -8 : 8);
          svg += '<circle cx="' + sx + '" cy="' + sy + '" r="3" fill="#fff" stroke="' + color + '" stroke-width="1.5"/>';
          svg += '<text x="' + (sx + 6) + '" y="' + (sy + 2) + '" font-size="7" fill="#666" font-family="sans-serif">' + escapeHtml(tStation(bs)) + '</text>';
        }
      }
    } else {
      var cx2 = 30;
      var y1 = topP, y2 = topP + (stations.length - 1) * sp;
      svg += '<line x1="' + cx2 + '" y1="' + y1 + '" x2="' + cx2 + '" y2="' + y2 + '" stroke="' + color + '" stroke-width="4" stroke-linecap="round" opacity="0.4"/>';
      for(var i = 0; i < stations.length; i++) {
        var y = topP + i * sp;
        svg += '<circle cx="' + cx2 + '" cy="' + y + '" r="4" fill="#fff" stroke="' + color + '" stroke-width="2.5"/>';
        svg += '<text x="' + (cx2 + 12) + '" y="' + (y + 3) + '" font-size="9" fill="#444" font-family="sans-serif" font-weight="500">' + escapeHtml(_rS(stations[i])) + '</text>';
      }
    }
    svg += '</svg>';
    el.innerHTML = '<div class="tp-map-wrap">' + svg + '</div>';
  }

  function showDetail(lineId) {
    var line = getLineData(lineId);
    if(!line) return;

    currentLineId = lineId;
    var d = line.delayInfo || line.delay || {};
    var ds = d.status || "none";
    var dm = d.maxDelay || d.delay_min || 0;
    var dt = d.cause || d.text || "";
    var rawOp = line.operator || "";
    var opNorm = TransitConstants.NORMALIZE[rawOp] || rawOp;
    var opDisplay = window.tOp ? window.tOp(opNorm) : (TransitConstants.OP_NAMES[opNorm] || rawOp);

    var headerHtml = '<div class="detail-header">' +
      '<div class="detail-code" style="background:' + escapeHtml(line.color || "#888") + '">' +
        '<span class="detail-code-text">' + escapeHtml(line.code || "") + '</span>' +
      '</div>' +
      '<div class="detail-title-wrap">' +
        '<h2 class="detail-title">' + window.RailwayDB && window.RailwayDB.resolveLineName ? window.RailwayDB.resolveLineName(line.id, _lang) : line.id + '</h2>' +
      '</div>' +
      '<span class="status-badge ' + getStatusClass(ds) + '">' + getStatusText(ds) + (ds === "delayed" ? " +" + dm + "min" : "") + '</span>' +
    '</div>';
    if(dt) headerHtml += '<div class="detail-delay-text">' + escapeHtml(dt) + '</div>';
    document.getElementById("trainsDetailHeader").innerHTML = headerHtml;

    var stations = line.stations || [];
    var dur = line.intervalTotal || line.durationTotalMin || 0;
    var infoHtml =
      '<div class="info-row"><span class="info-label">' + t("detail.info_code") + '</span><span class="info-value">' + escapeHtml(line.code || "") + '</span></div>' +
      '<div class="info-row"><span class="info-label">' + t("detail.info_operator") + '</span><span class="info-value">' + escapeHtml(opDisplay) + '</span></div>' +
      '<div class="info-row"><span class="info-label">' + t("detail.info_region") + '</span><span class="info-value">' + escapeHtml(line.region || "") + '</span></div>' +
      '<div class="info-row"><span class="info-label">' + t("detail.info_type") + '</span><span class="info-value">' + (line.type === "loop" ? t("line.loop") : t("line.straight")) + '</span></div>' +
      '<div class="info-row"><span class="info-label">' + t("detail.info_stations") + '</span><span class="info-value">' + stations.length + '</span></div>' +
      '<div class="info-row"><span class="info-label">' + t("detail.info_duration") + '</span><span class="info-value">' + dur + ' min</span></div>';
    document.getElementById("trainsDetailInfo").innerHTML = infoHtml;

    renderStationMap(document.getElementById("trainsDetailMap"), line);

    document.getElementById("trainsCard").classList.add("hidden");
    var dv = document.getElementById("trainsDetailView"); dv.classList.remove("tp-fade-in"); void dv.offsetWidth; dv.classList.remove("hidden"); dv.classList.add("tp-fade-in");
    window.location.hash = lineId;
  }

  function hideDetail() {
    currentLineId = null;
    document.getElementById("trainsCard").classList.remove("hidden");
    var dv = document.getElementById("trainsDetailView"); dv.classList.add("hidden"); dv.classList.remove("tp-fade-in");
    window.location.hash = "";
  }

  function init() {
    document.getElementById("trainsBackBtn").addEventListener("click", hideDetail);
    function checkHash() {
      var hash = window.location.hash.substring(1);
      if(hash) showDetail(hash);
    }
    window.addEventListener("hashchange", checkHash);
    checkHash();
  }

  if (typeof window.onLanguageChange === "function") {
    window.onLanguageChange(function() {
      if (currentLineId) showDetail(currentLineId);
    });
  }
  // Subscribe to DataFusion updates for live detail refresh
  if (window.DataFusion && window.DataFusion.subscribe) {
    window.DataFusion.subscribe(function(fusedData) {
      if (fusedData && fusedData.lines && currentLineId && fusedData.lines[currentLineId]) {
        showDetail(currentLineId);
      }
    });
  }

  window.TrainsDetail = { show: showDetail, hide: hideDetail };

  if(document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();