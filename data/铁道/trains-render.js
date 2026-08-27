/**
 * Pixel Tetsudo - Trains Render (uses DataState for rendering)
 */
(function() {
  var t = window.t || function(k){ return k; };

  function render(data) {
    var grid = document.getElementById("trainsListContent");
    if (!grid) return;
    var L = (data && data.lines) || (function(){ var arr = window.DataLayer ? window.DataLayer.getAllLines() : null; return arr ? (Array.isArray(arr) ? (function(){ var d={}; arr.forEach(function(l){ d[l.id||l.line_id]=l; }); return d; })() : arr) : (window.UNIFIED_LINES || {}); })();
    var lineOrder = (window.LinePresentationService && window.UNIFIED_LINES) ? window.LinePresentationService.getDisplayOrder(window.UNIFIED_LINES) : ((window.RAILWAY_DATA && window.RAILWAY_DATA.lineOrder) || []);
    try {
      DataState.renderList(grid, L, { mode: "trains", lineOrder: lineOrder });
    } catch(e) {
      grid.innerHTML = '<div class="rs-error">' + (t("status.render_error") || "Render failed") + '</div>';
    }
    // Event delegation for card clicks → detail view
    grid.removeEventListener("click", grid._clickHandler);
    var handler = function(e) {
      var card = e.target.closest(".rs-line-card");
      if (!card) return;
      var lineId = card.getAttribute("data-line");
      if (lineId && window.TrainsDetail && window.TrainsDetail.show) {
        window.TrainsDetail.show(lineId);
      }
    };
    grid._clickHandler = handler;
    grid.addEventListener("click", handler);
  }

  function init() {
    var grid = document.getElementById("trainsListContent");
    if (grid) grid.innerHTML = '<div class="rs-loading"><div class="rs-loading-spinner"></div><span>' + t("status.loading") + '</span></div>';
    var fused = window.DATA_FUSION;
    if (fused && fused.lines && Object.keys(fused.lines).length > 0) { render(fused); return; }
    var dlLines = window.DataLayer ? window.DataLayer.getAllLines() : null;
    if ((dlLines && Object.keys(dlLines).length > 0) || (Array.isArray(dlLines) && dlLines.length > 0)) { render({ lines: Array.isArray(dlLines) ? (function(){ var d={}; dlLines.forEach(function(l){ d[l.id||l.line_id]=l; }); return d; })() : dlLines }) ; return; }
    var rendered = false;
    function tryRender() {
      var d = window.DATA_FUSION;
      if (!d) { var _dl = window.DataLayer ? window.DataLayer.getAllLines() : null; d = { lines: _dl ? (Array.isArray(_dl) ? (function(){ var _d={}; _dl.forEach(function(l){ _d[l.id||l.line_id]=l; }); return _d; })() : _dl) : (window.UNIFIED_LINES || {}) } };
      if (d.lines && Object.keys(d.lines).length > 0 && !rendered) {
        rendered = true;
        render(d);
      }
    }
    var pollCount = 0;
    var pollTimer = setInterval(function() {
      pollCount++;
      tryRender();
      if (pollCount >= 120) clearInterval(pollTimer);
    }, 500);
    if (window.DataFusion && window.DataFusion.subscribe) {
      window.DataFusion.subscribe(function(d) {
        if (d && d.lines && Object.keys(d.lines).length > 0) render(d);
        if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
      });
    }
    if (typeof window.onLanguageChange === "function") {
      window.onLanguageChange(function() {
        var d = window.DATA_FUSION;
        if (!d) { var _dl2 = window.DataLayer ? window.DataLayer.getAllLines() : null; d = { lines: _dl2 ? (Array.isArray(_dl2) ? (function(){ var _d2={}; _dl2.forEach(function(l){ _d2[l.id||l.line_id]=l; }); return _d2; })() : _dl2) : (window.UNIFIED_LINES || {}) } };
        if (d && d.lines && Object.keys(d.lines).length > 0) render(d);
      });
    }
  }

  if(document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();