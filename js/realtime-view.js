/*
 * Pixel Tetsudo - Realtime View
 * 直接读取 RAILWAY_DATA，无需 DataFusion 依赖
 */
(function() {
  "use strict";

  const t = window.t || ((k) => k);
  const tLine = (code) => (window.tLine ? window.tLine(code) : code) || code;
  const tOp = (name) => (window.tOp ? window.tOp(name) : name) || name;
  const tStation = (name) => (window.tStation ? window.tStation(name) : name) || name;

  // STATUS_META is defined in data-state.js; use DataState.STATUS_META
  const STATUS_META = window.DataState ? window.DataState.STATUS_META : {
    normal:    { icon: "\u25cb", color: "green"  },
    delayed:   { icon: "\u25b3", color: "orange" },
    suspended: { icon: "\u00d7", color: "red"  },
    no_data:   { icon: "\u25cc", color: "gray"   },
  };

  function getDelayInfo(line) {
    if (line.delayInfo) return line.delayInfo;
    if (line.status) return { status: line.status, interval: line.interval, cause: line.cause };
    return null;
  }

  function clearSelectedCards() {
    document.querySelectorAll(".rs-line-card.selected").forEach(function(c) { c.classList.remove("selected"); });
  }

  function renderCard(line, lineId) {
    return DataState.renderCard(line, lineId, { mode: "realtime" });
  }

  function renderLines(container, linesObj, lineOrderArr) {
    DataState.renderList(container, linesObj, { mode: "realtime", lineOrder: lineOrderArr });
  }

  function openModal(lineId, linesObj) {
    var modal = document.getElementById("lineDetailModal");
    if (!modal || !linesObj || !linesObj[lineId]) return;
    var line = linesObj[lineId];
    var delayInfo = getDelayInfo(line) || {};
    // Use DataState.getStatus for consistent NO_DATA handling
    var status = delayInfo && delayInfo.status ? delayInfo.status : (delayInfo ? "normal" : "no_data");
    var interval = delayInfo.interval || "";
    var cause = delayInfo.cause || "";
    var s = window.DataState ? window.DataState.getStatus(status) : STATUS_META[status] || STATUS_META.no_data;
    var statusText = t("status." + status) || status;
    // Title
    modal.querySelector(".rs-modal-title").textContent = tLine(line.id) || line.name;
    // Status section
    var statusSection = modal.querySelector(".rs-status-section");
    statusSection.className = "rs-status-section rs-status-" + status;
    statusSection.innerHTML = '<span class="rs-status-indicator"><span style="background:var(--' + s.color + ')"></span>' + statusText + '</span>';
    // Interval section
    var intervalSection = modal.querySelector(".rs-interval-section");
    intervalSection.querySelector(".rs-info-label").textContent = t("status.interval");
    var intervalHtml;
    if (!interval || status === "normal" || status === "no_data") {
      intervalHtml = '<span class="rs-station-text">' + t("status.all_lines") + '</span>';
    } else {
      var parts = interval.split("\u2192");
      if (parts.length >= 2) {
        intervalHtml = '<span class="rs-station-start">' + escapeHtml(tStation(parts[0])) + '</span>'
          + '<span class="rs-interval-arrow">\u2192</span>'
          + '<span class="rs-station-end">' + escapeHtml(tStation(parts[1])) + '</span>';
      } else {
        intervalHtml = '<span class="rs-station-text">' + escapeHtml(interval) + '</span>';
      }
    }
    intervalSection.querySelector(".rs-interval-stations").innerHTML = intervalHtml;
    // Cause section
    var causeSection = modal.querySelector(".rs-cause-section");
    causeSection.querySelector(".rs-section-title").textContent = t("status.delay_cause");
    var causeHtml;
    if (status === "no_data") {
      causeHtml = '<span style="color:var(--text-muted)">' + t("status.no_data") + '</span>';
    } else if (cause) {
      causeHtml = escapeHtml(cause);
    } else {
      causeHtml = '<span style="color:var(--text-muted)">' + t("status.none") + '</span>';
    }
    causeSection.querySelector(".rs-cause-text").innerHTML = causeHtml;
    // Updated time section
    var updatedSection = modal.querySelector(".rs-updated-section");
    updatedSection.querySelector(".rs-info-label").textContent = t("status.updated");
    var fused = window.DataFusion ? window.DataFusion.getFusedData() : null;
    var updateTime = "";
    if (fused && fused.lastUpdate) {
      var d = new Date(fused.lastUpdate);
      updateTime = d.getHours().toString().padStart(2,"0") + ":" + d.getMinutes().toString().padStart(2,"0");
    } else if (status === "no_data") {
      updateTime = t("status.no_data");
    } else {
      updateTime = t("status.unknown");
    }
    updatedSection.querySelector(".rs-updated-time").textContent = updateTime;
    // Show modal
    modal.classList.add("active");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    var modal = document.getElementById("lineDetailModal");
    if (!modal) return;
    modal.classList.remove("active");
    document.body.classList.remove("modal-open");
  }

  let _latestLines = null;
  let _latestOrder = null;

  function init() {
    const container = document.getElementById("realtimeStatusContainer");
    if (!container) return;

    function renderLinesList(container, linesObj, lineOrderArr) {
      DataState.renderList(container, linesObj, { mode: "realtime", lineOrder: lineOrderArr });
    }

    function getLines() {
      // Priority 1: DataFusion fused data (has delay info)
      if (window.DataFusion) {
        var fused = window.DataFusion.getFusedData();
        if (fused && fused.lines && Object.keys(fused.lines).length > 0) return fused;
      }
      // Priority 2: Direct UNIFIED_LINES (raw data, no delay info)
      if (window.UNIFIED_LINES && Object.keys(window.UNIFIED_LINES).length > 0) {
        var lpsOrder = (window.LinePresentationService && window.UNIFIED_LINES) ? window.LinePresentationService.getDisplayOrder(window.UNIFIED_LINES) : []; return { lines: window.UNIFIED_LINES, lineOrder: lpsOrder };
      }
      return null;
    }

    function render() {
      var fused = getLines();
      if (!fused || !fused.lines || Object.keys(fused.lines).length === 0) {
        container.innerHTML = '<div class="rs-loading"><div class="rs-loading-spinner"></div><span>' + t("status.loading") + '</span></div>';
        return;
      }
      _latestLines = fused.lines;
      _latestOrder = fused.lineOrder || [];
      try {
        renderLinesList(container, fused.lines, _latestOrder);
      } catch (e) {
        container.innerHTML = '<div class="rs-error">' + t('status.render_error') + '</div>';
      }
    }

    // Immediate check first
    render();

    // Poll for UNIFIED_LINES (handles async data loading)
    var _pollCount = 0;
    var _pollTimer = setInterval(function() {
      _pollCount++;
      var fused = getLines();
      if (fused && fused.lines && Object.keys(fused.lines).length > 0) {
        clearInterval(_pollTimer);
        render();
      } else if (_pollCount > 20) {
        // After 6 seconds, give up polling
        clearInterval(_pollTimer);
        if (!container.querySelector(".rs-line-card")) {
          container.innerHTML = '<div class="rs-empty">' + t("status.load_error") + '</div>';
        }
      }
    }, 300);

    // Subscribe to DataFusion updates for live status
    if (window.DataFusion) {
      window.DataFusion.subscribe(function(fusedData) {
        if (fusedData && fusedData.lines && Object.keys(fusedData.lines).length > 0) {
          render();
        }
      });
    }

    // Setup modal handlers
    var modal = document.getElementById('lineDetailModal');
    if (modal) {
      modal.querySelector('.rs-modal-close').addEventListener('click', closeModal);
      modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
      });
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
      });
    }

    // Card click handler
    container.addEventListener('click', function(e) {
      var card = e.target.closest('.rs-line-card');
      if (card && _latestLines) {
        clearSelectedCards();
        card.classList.add('selected');
        openModal(card.dataset.line, _latestLines);
      }
    });
    }
    if (typeof window.onLanguageChange === "function") { window.onLanguageChange(function() { render(); }); }
  init();
})();