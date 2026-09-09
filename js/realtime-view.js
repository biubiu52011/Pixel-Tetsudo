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
  const getDisplayName = (line) => {
    if (!line) return "";
    // Display Identity Rule: route through RailwayDB.resolveLineName
    if (line.id && window.RailwayDB && window.RailwayDB.resolveLineName) {
      var _n = window.RailwayDB.resolveLineName(line.id, window.currentLang);
      if (_n) return _n;
    }
    return line.nameJa || line.nameEn || line.name || line.id || "";
  };


  // STATUS_META is defined in data-state.js; use window.DataState.STATUS_META
  const STATUS_META = window.DataState ? window.DataState.STATUS_META : {
    normal:    { icon: "\u25cb", color: "green"  },
    notice:    { icon: "\uff01", color: "yellow" },
    delayed:   { icon: "\u25b3", color: "orange" },
    suspended: { icon: "\u00d7", color: "red"  },
    no_data:   { icon: "\u25cc", color: "gray"   },
    no_odpt:   { icon: "\u25cc", color: "gray"   },
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
    return window.DataState.renderCard(line, lineId, { mode: "realtime" });
  }

  function renderLines(container, linesObj, lineOrderArr) {
    window.DataState.renderList(container, linesObj, { mode: "realtime", lineOrder: lineOrderArr });
  }

  function openModal(lineId, linesObj) {
    _currentModalLine = lineId;
    var modal = document.getElementById("lineDetailModal");
    if (!modal || !linesObj || !linesObj[lineId]) return;
    var line = linesObj[lineId];
    var delayInfo = getDelayInfo(line) || {};
    // Use window.DataState.getStatus for consistent NO_DATA handling
    var status = delayInfo && delayInfo.status ? delayInfo.status : (delayInfo ? "normal" : "no_data");
    var interval = delayInfo.interval || "";
    var cause = delayInfo.cause || "";
    var s = window.DataState && window.DataState.STATUS_META && window.DataState.STATUS_META[status] ? window.DataState.STATUS_META[status] : STATUS_META[status] || STATUS_META.no_data;
    var statusText = t("status." + status) || status;
    // Title
    modal.querySelector(".rs-modal-title").textContent = getDisplayName(line) || tLine(line.id) || line.name;
    // Status section
    var statusSection = modal.querySelector(".rs-status-section");
    statusSection.className = "rs-status-section rs-status-" + status;
    statusSection.innerHTML = '<span class="rs-status-indicator"><span class="rs-status-dot"></span>' + statusText + '</span>';
    // Apply status dot color via DOM API (CSP-safe)
    var dot = statusSection.querySelector(".rs-status-dot");
    if (dot) dot.style.background = "var(--" + (s.color || ({ normal: "green", notice: "yellow", delayed: "orange", suspended: "red", no_data: "gray", no_odpt: "gray", loading: "gray" }[status] || "gray")) + ")";
    // Interval section
    var intervalSection = modal.querySelector(".rs-interval-section");
    intervalSection.querySelector(".rs-info-label").textContent = t("status.interval");
    var intervalHtml;
    var _singleEndInterval = false;
    if (!interval || status === "normal" || status === "no_data") {
      intervalHtml = '<span class="rs-station-text">' + t("status.all_lines") + '</span>';
    } else {
      var parts = interval.split("\u2192");
      if (parts.length >= 2) {
        intervalHtml = '<span class="rs-station-start">' + escapeHtml(tStation(parts[0])) + '</span>'
          + '<span class="rs-interval-arrow">\u2192</span>'
          + '<span class="rs-station-end">' + escapeHtml(tStation(parts[1])) + '</span>';
      } else {
        // Single-ended interval ("東京方面"): localize the "方面" suffix per language
        var _int = interval;
        if (window.DataState && typeof window.DataState.localizeInterval === "function") _int = window.DataState.localizeInterval(_int);
        intervalHtml = '<span class="rs-station-text">' + escapeHtml(_int) + '</span>';
        _singleEndInterval = true;
      }
    }
    intervalSection.querySelector(".rs-interval-stations").innerHTML = intervalHtml;
    // 4.3.443: 单端/文本兜底区间（如"京急線内"）在非 ja 界面翻译
    if (_singleEndInterval && (window.currentLang || "ja") !== "ja") {
      var _intEl = intervalSection.querySelector(".rs-interval-stations .rs-station-text");
      if (_intEl && _needsJaTranslate(interval)) {
        window.TranslateService.applyToElement(_intEl, interval, window.currentLang);
      }
    }
    // Cause section -> 運行情報（v4.3.389: 直接显示 ODPT text 原文，不解析碎片；
    // 4.3.443: 非 ja 界面译文为主显示，原文折叠保留，翻译失败自动回退原文）
    var causeSection = modal.querySelector(".rs-cause-section");
    var _detailTitles = { ja: "運行情報", en: "Service Info", zh: "运行信息", ko: "운행 정보" };
    causeSection.querySelector(".rs-section-title").textContent = _detailTitles[(window.currentLang || "ja")] || "運行情報";
    var causeHtml;
    var _transSource = "";
    if (status === "loading") {
      causeHtml = '<span class="rs-text-muted">' + t("status.loading") + '</span>';
    } else if (status === "no_data" || status === "no_odpt") {
      causeHtml = '<span class="rs-text-muted">' + t("status.no_data") + '</span>';
    } else if (delayInfo.detail) {
      _transSource = delayInfo.detail;
      causeHtml = _translatedText(delayInfo.detail, window.currentLang || "ja");
    } else if (cause) {
      _transSource = cause;
      causeHtml = _translatedText(cause, window.currentLang || "ja");
    } else {
      causeHtml = '<span class="rs-text-muted">' + t("status.none") + '</span>';
    }
    causeSection.querySelector(".rs-cause-text").innerHTML = causeHtml;
    if (_transSource && (window.currentLang || "ja") !== "ja") {
      var _trEl = causeSection.querySelector(".rs-cause-translated");
      if (_trEl) window.TranslateService.applyToElement(_trEl, _transSource, window.currentLang);
    }
    // Updated time section
    var updatedSection = modal.querySelector(".rs-updated-section");
    updatedSection.querySelector(".rs-info-label").textContent = t("status.updated");
    var fused = window.DataFusion ? window.DataFusion.getFusedData() : null;
    var updateTime = "";
    if (fused && fused.timestamp) {
      var d = new Date(fused.timestamp);
      updateTime = d.getHours().toString().padStart(2,"0") + ":" + d.getMinutes().toString().padStart(2,"0");
    } else if (status === "loading") {
      updateTime = t("status.loading");
    } else if (status === "no_data" || status === "no_odpt") {
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
    _currentModalLine = null;
    var modal = document.getElementById("lineDetailModal");
    if (!modal) return;
    modal.classList.remove("active");
    document.body.classList.remove("modal-open");
  }

  let _latestLines = null;
  let _latestOrder = null;
  let _selectedOperator = null;
  let _currentModalLine = null;


  function escapeHtml(s) {
    if (!s) return "";
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  // 4.3.443: 判断文本是否含日文特征（假名/駅/線内）——只对动态日文原文做翻译，
  // 已按语言融合的站名/线路名不进入该路径（防止站名被二次翻译改写）
  function _needsJaTranslate(s) {
    if (!s) return false;
    return /[\u3041-\u3096\u30A1-\u30FA\u30FC]/.test(s) || /[駅]/.test(s) || /線内/.test(s);
  }

  var _origLabels = { ja: "日本語原文", zh: "查看日文原文", en: "View Japanese original", ko: "일본어 원문 보기" };

  // 译文为主 + 原文折叠（非 ja 界面）；ja 界面或原文即目标语言时直出
  function _translatedText(text, lang) {
    var safe = escapeHtml(text);
    if (lang === "ja" || !_needsJaTranslate(text)) return safe;
    return '<div class="rs-cause-translated">' + safe + '</div>'
      + '<details class="rs-cause-original"><summary>' + (_origLabels[lang] || _origLabels.en) + '</summary><div>' + safe + '</div></details>';
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

  function renderFilterBar(linesObj) {
    var bar = document.getElementById("realtimeFilterBar");
    if (!bar || !linesObj) return;
    var ops = {};
    Object.keys(linesObj).forEach(function(id) {
      var line = linesObj[id];
      if (line && line.operator) ops[line.operator] = true;
    });
    var opList = sortOperators(Object.keys(ops));
    var html = '<button class="rs-filter-btn' + (_selectedOperator === null ? ' active' : '') + '" data-operator="">';
    html += (typeof window.t === "function" && window.t("filter.all")) ? window.t("filter.all") : "All";
    html += "</button>";
    opList.forEach(function(op) {
      var label = (typeof window.t === 'function' && window.t('op.' + op)) || op;
      html += '<button class="rs-filter-btn' + (_selectedOperator === op ? ' active' : '') + '" data-operator="' + op + '">' + label + '</button>';
    });
    bar.innerHTML = html;
    bar.querySelectorAll(".rs-filter-btn").forEach(function(btn) {
      btn.addEventListener("click", function() {
        setFilter(this.dataset.operator || null);
      });
    });
  }

  function setFilter(operator) {
    _selectedOperator = operator;
    if (_latestLines) {
      renderFiltered();
      renderFilterBar(_latestLines);
    }
  }

  function renderFiltered() {
    if (!_latestLines) return;
    var filtered = _latestLines;
    if (_selectedOperator) {
      var f = {};
      Object.keys(_latestLines).forEach(function(id) {
        var _ln = _latestLines[id];
        if (_ln && (_selectedOperator === "JR-East"
          ? (window.TransitConstants && window.TransitConstants.isJRERoute ? window.TransitConstants.isJRERoute(_ln) : _ln.operator === "JR-East")
          : _ln.operator === _selectedOperator)) {
          f[id] = _latestLines[id];
        }
      });
      filtered = f;
    }
    var container = document.getElementById("realtimeStatusContainer");
    if (!container) return;
    if (Object.keys(filtered).length === 0) {
      container.innerHTML = '<div class="rs-empty">' + (typeof window.t === "function" ? window.t("status.no_lines") : "No lines") + "</div>";
      return;
    }
    window.DataState.renderList(container, filtered, { mode: "realtime", lineOrder: _latestOrder || [] });
  }

  function init() {
    const container = document.getElementById("realtimeStatusContainer");
    if (!container) return;

    function renderLinesList(container, linesObj, lineOrderArr) {
      window.DataState.renderList(container, linesObj, { mode: "realtime", lineOrder: lineOrderArr });
    }

    function getLines() {
      // Priority 1: DataFusion fused data (has delay info)
      if (window.DataFusion) {
        var fused = window.DataFusion.getFusedData();
        if (fused && fused.lines && Object.keys(fused.lines).length > 0) return fused;
      }
      // Priority 2: DataLayer (RailwayDB-first) raw data, no delay info
      var dlLines = window.DataLayer ? window.DataLayer.getAllLines() : null;
      if (dlLines) {
        var dlDict = Array.isArray(dlLines) ? (function(){ var d={}; dlLines.forEach(function(l){ d[l.id||l.line_id]=l; }); return d; })() : dlLines;
        if (Object.keys(dlDict).length > 0) {
          var lpsOrder = (window.LinePresentationService && dlDict) ? window.LinePresentationService.getDisplayOrder(dlDict) : Object.keys(dlDict);
          return { lines: dlDict, lineOrder: lpsOrder };
        }
      }
      // Priority 3: Direct UNIFIED_LINES compat fallback
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
        renderFilterBar(fused.lines);
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
          if (_selectedOperator) {
            renderFiltered();
            renderFilterBar(_latestLines);
          }
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
    if (typeof window.onLanguageChange === "function") { window.onLanguageChange(function() { render(); if (_selectedOperator) renderFiltered(); if (_currentModalLine && _latestLines) { openModal(_currentModalLine, _latestLines); } }); }
    }
  init();
})();