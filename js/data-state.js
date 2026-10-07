/**
 * Pixel Tetsudo - Unified Data State Module
 * 统一的数据状态管理 + 线路列表编排
 * 供 realtime.html 和 trains.html 共享使用
 */
(function() {
  "use strict";

  // ========== Status definitions ==========
  var STATUS_META = {
    normal:    { icon: "\u25cb", cls: "rs-status-icon-normal",    label: "normal"    },
    info:      { icon: "\uff01", cls: "rs-status-icon-notice",    label: "info"      },
    notice:    { icon: "\uff01", cls: "rs-status-icon-notice",    label: "notice"    },
    delayed:   { icon: "\u25b3", cls: "rs-status-icon-delayed",  label: "delayed"   },
    suspended: { icon: "\u00d7", cls: "rs-status-icon-suspended", label: "suspended" },
    no_data:   { icon: "\u25cc", cls: "rs-status-icon-no-data",   label: "no_data"  },
    no_odpt:   { icon: "\u25cf", cls: "rs-status-icon-no-odpt",   label: "no_odpt"  },
    loading:   { icon: "\u25d0", cls: "rs-status-icon-loading",   label: "loading"  }
  };

  // ========== Internal state ==========
  var _lines = {};
  var _positions = {};
  var _listeners = [];
  var _initialized = false;

  // ========== Helpers ==========
  function escapeHtml(s) {
    if (!s) return "";
    if (typeof s !== "string") return "";
    if (s.indexOf("&") < 0 && s.indexOf("<") < 0 && s.indexOf(">") < 0 && s.indexOf('"') < 0 && s.indexOf("'") < 0) return s;
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function getDelayInfo(line) {
    if (line.delayInfo) return line.delayInfo;
    if (line.status) return { status: line.status, interval: line.interval, cause: line.cause };
    return null;
  }

  function getLineIdentity(line, lineId) {
    line = line || {};
    if (line.lineIdentity && line.lineIdentity.key) return String(line.lineIdentity.key);
    var operator = line.operator || "";
    var railwayCode = "";
    if (window.ODPTClient && window.ODPTClient.LINE_RAILWAY_CODE && lineId) railwayCode = window.ODPTClient.LINE_RAILWAY_CODE[lineId] || "";
    if (!operator || !railwayCode) return "";
    return String(operator) + "::" + String(railwayCode);
  }

  // Operational status is line-owned. Through-service topology must not copy
  // another line's delay/status onto this line; explicit through-service impacts
  // are represented by RunInfoEvaluator instead.

  function getStatus(status) {
    if (!status) return STATUS_META.no_data;
    if (status === 'normal') return STATUS_META.normal;
    return STATUS_META[status] || STATUS_META.no_data;
  }

  function t(key) {
    return (typeof window.t === "function") ? window.t(key) : (key || "");
  }

  // Localize the direction suffix "方面" (e.g. "東京方面") produced by data-fusion
  // when ODPT provides only a one-sided station. Station names inside interval are
  // already fused in the active language; only the system-generated suffix needs
  // per-language substitution (ja 方面 / zh 方向 / ko 방면 / en bound for).
  function _localizeInterval(str) {
    if (!str || String(str).indexOf("\u65b9\u9762") === -1) return str;
    var dir = t("status.toward");
    return String(str).split("\u65b9\u9762").join(dir || "\u65b9\u9762");
  }

  // tLine removed: use RailwayDB.resolveLineName(lineId, lang) instead

  function tOp(name) {
    return (window.tOp && window.tOp(name)) || name || "";
  }

  // ========== Render functions ==========

  /**
   * Shared page-level state renderer for realtime/trains list containers.
   * Keeps loading/empty/error semantics and DOM structure identical across pages.
   */
  function renderPageState(container, state, messageKey) {
    if (!container) return;
    var key = messageKey || (state === "loading" ? "status.loading"
      : state === "render_error" ? "status.display_unavailable"
      : state === "fetch_error" ? "status.load_error"
      : state === "timeout" ? "status.timeout"
      : state === "offline" ? "status.offline"
      : "status.fetch_unavailable");
    var message = t(key);
    container.dataset.pageState = state;
    container.dataset.pageStateKey = key;
    if (state === "loading") {
      container.innerHTML = '<div class="rs-loading" role="status" aria-live="polite"><div class="rs-loading-spinner" aria-hidden="true"></div><span data-i18n="' + escapeHtml(key) + '">' + escapeHtml(message) + '</span></div>';
      return;
    }
    var cls = state === "render_error" || state === "fetch_error" || state === "error" ? "rs-error" : "rs-empty";
    var detailKey = state === "render_error" ? "status.display_unavailable_hint"
      : state === "fetch_error" ? "status.load_error_hint"
      : state === "timeout" ? "status.timeout_hint"
      : state === "offline" ? "status.offline_hint"
      : "status.fetch_unavailable_hint";
    container.innerHTML = '<div class="' + cls + '" role="status" aria-live="polite">'
      + '<div data-i18n="' + escapeHtml(key) + '">' + escapeHtml(message) + '</div>'
      + '<div class="rs-state-hint" data-i18n="' + detailKey + '">' + escapeHtml(t(detailKey)) + '</div>'
      + '<button type="button" class="rs-state-retry" data-i18n="status.retry">' + escapeHtml(t("status.retry")) + '</button>'
      + '</div>';
    var retry = container.querySelector(".rs-state-retry");
    if (retry) retry.addEventListener("click", function() {
      if (retry.disabled) return;
      retry.disabled = true;
      var fallbackReload = function() { window.location.reload(); };
      if (typeof container._pageStateRetry === "function") {
        try {
          var result = container._pageStateRetry();
          if (result && typeof result.then === "function") {
            result.catch(function(err) {
              console.error("[DataState] page retry failed", err);
              fallbackReload();
            });
          }
          return;
        } catch (err) {
          console.error("[DataState] page retry failed", err);
          fallbackReload();
          return;
        }
      }
      fallbackReload();
    });
  }

  function railwayStateHosts() {
    return Array.prototype.slice.call(document.querySelectorAll('[data-state-host="railway-lines"]'));
  }

  function setRailwayHostState(state) {
    railwayStateHosts().forEach(function(container) { renderPageState(container, state); });
  }

  function initRailwayStateHosts() {
    var hosts = railwayStateHosts();
    if (!hosts.length) return;
    hosts.forEach(function(container) {
      if (!container.dataset.pageState && !container.children.length) renderPageState(container, "loading");
    });
    window.addEventListener("pt:railway-error", function() {
      setRailwayHostState(navigator.onLine === false ? "offline" : "fetch_error");
    });
  }

  function setPageStateRetry(container, callback) {
    if (!container) return;
    container._pageStateRetry = typeof callback === "function" ? callback : null;
  }

  function retryVisibleFailedStates() {
    if (!navigator.onLine || !window.DataLoader || typeof window.DataLoader.retry !== "function") return;
    var containers = Array.prototype.slice.call(document.querySelectorAll("[data-page-state]")).filter(function(container) {
      return ["offline", "fetch_error", "timeout"].indexOf(container.dataset.pageState) !== -1 &&
        typeof container._pageStateRetry === "function";
    });
    if (!containers.length) return;
    // One canonical retry reloads shared railway data. Page callbacks then render
    // their own view; do not create a second loader/recovery path.
    try {
      var result = containers[0]._pageStateRetry();
      if (result && typeof result.catch === "function") {
        result.catch(function(err) { console.error("[DataState] automatic recovery failed", err); });
      }
    } catch (err) {
      console.error("[DataState] automatic recovery failed", err);
    }
  }


  /**
   * Render a full line list grouped by operator
   * @param {HTMLElement} container - target DOM element
   * @param {Object} linesObj - line ID -> line data map
   * @param {Object} options - { mode, lineOrder }
   */
  // 干线本名（非運行系統）不进线路一览；数据保留作换乘锚点/支线父线
  var TRUNK_MAIN_LINE_IDS = (window.RuntimeConfig && window.RuntimeConfig.TRUNK_MAIN_LINE_IDS) || [];

  function renderList(container, linesObj, options) {
    if (!container || !linesObj || typeof linesObj !== "object" || Object.keys(linesObj).length === 0) {
      container.innerHTML = '<div class="rs-empty">' + (typeof window.t === "function" ? window.t("status.no_trains") : "No data") + '</div>';
      return;
    }
    options = options || {};
    var mode = options.mode || "realtime";
    var lineOrder = options.lineOrder || (window.LinePresentationService ? window.LinePresentationService.getDisplayOrder(window.UNIFIED_LINES) : []);

    var insertMap = {};
    for (var i = 0; i < lineOrder.length; i++) { insertMap[lineOrder[i]] = i; }

    var groups = {};
    var opOrder = [];
    var ids = Object.keys(linesObj);
    for (var i = 0; i < ids.length; i++) {
      var lid = ids[i];
      var line = linesObj[lid];
      if (!line) continue;
      // Line Hierarchy Rule: 真支线（branchOf 非空）严禁在一级总列表独立展示，
      // 只在父线卡片/详情内展示。平级独立运营线（branchOf=null）照常平铺。
      if (window.LinePresentationService && window.LinePresentationService.isBranch &&
          window.LinePresentationService.isBranch(lid, linesObj)) continue;
      // 国鉄幹線本名（类比京沪铁路/成渝铁路）不是運行系統：中央本線/東海道本線/東北本線 不进入线路一览，
      // 数据保留作换乘锚点/支线父线。
      if (TRUNK_MAIN_LINE_IDS.indexOf(lid) >= 0) continue;
      var op = line.operator || "Unknown";
      if (!groups[op]) {
        groups[op] = [];
        opOrder.push(op);
      }
      groups[op].push({ id: lid, line: line, sortIdx: insertMap[lid] !== undefined ? insertMap[lid] : 99999 });
    }

    // Sort operator groups via the unified LinePresentationService comparator
    // (global category order JR > Metro > Private > Other), unknown ops appended at end
    if (window.LinePresentationService && typeof window.LinePresentationService.orderOperators === "function") {
      opOrder = window.LinePresentationService.orderOperators(opOrder);
    } else {
      var knownOps = (window.TransitConstants && window.TransitConstants.OP_ORDER) || [];
      var unknownOps = opOrder.filter(function(op){ return knownOps.indexOf(op) === -1; });
      opOrder = knownOps.filter(function(op){ return groups[op]; }).concat(unknownOps);
    }

    // Sort fallback lines within each operator group by lineOrder
    var presentationOrderMap = (window.LinePresentationService && window.UNIFIED_LINES)
      ? window.LinePresentationService.getDisplayOrderMap(window.UNIFIED_LINES) : {};
    for (var op in groups) {
      if (groups.hasOwnProperty(op)) {
        groups[op].sort(function(a, b) {
          var idxA = a.sortIdx;
          var idxB = b.sortIdx;
          if (idxA !== idxB) return idxA - idxB;
          var pA = presentationOrderMap[a.id] !== undefined ? presentationOrderMap[a.id] : 99999;
          var pB = presentationOrderMap[b.id] !== undefined ? presentationOrderMap[b.id] : 99999;
          return pA - pB;
        });
      }
    }

    var html = "";
    for (var o = 0; o < opOrder.length; o++) {
      var op = opOrder[o];
      html += '<div class="rs-operator-group" data-operator="' + escapeHtml(op) + '"><div class="rs-operator-title">' + escapeHtml(tOp(op)) + '</div>'
        + '<div class="rs-cards-container">';
      // Render in the exact unified presentation order. A primary
      // presentation occupies its own sort slot; member records are suppressed
      // only after that primary has rendered. This preserves fractional/system
      // orders such as Ueno-Tokyo 15.5 instead of moving every system ahead of
      // every fallback line in a separate first pass.
      var covered = {};
      for (var k = 0; k < groups[op].length; k++) {
        var g = groups[op][k];
        if (covered[g.id]) continue;
        var pres = (window.LinePresentationService && window.LinePresentationService.getPrimaryPresentation)
          ? window.LinePresentationService.getPrimaryPresentation(g.id, linesObj)
          : null;
        if (pres) {
          var memberIds = window.LinePresentationService.getPresentationMembers(g.id, linesObj);
          if (memberIds.length > 0) {
            memberIds.forEach(function(id) { covered[id] = true; });
            html += window.LineCard.renderSystem(pres, memberIds, linesObj, { mode: mode });
            continue;
          }
        }
        html += window.LineCard.render(g.line, g.id, { mode: mode, linesObj: linesObj });
      }
      html += "</div></div>";
    }
    container.innerHTML = html;
    // Apply line colors via DOM API (CSP-safe, bypasses style-src restriction)
    Array.prototype.slice.call(container.querySelectorAll('.rs-line-card')).forEach(window.LineCard.applyColor);
  }


  // ========== Data management ==========

  function setLines(lines) { _lines = lines || {}; notify(); }
  function setPositions(positions) { _positions = positions || {}; notify(); }

  function getLine(lineId) { return _lines[lineId] || null; }
  function getPositions(lineId) { return _positions[lineId] || []; }

  function subscribe(listener) {
    if (_listeners.indexOf(listener) === -1) {
      _listeners.push(listener);
      try { listener(_lines, null, _positions); } catch(e) {}
    }
  }

  function unsubscribe(listener) {
    var idx = _listeners.indexOf(listener);
    if (idx >= 0) _listeners.splice(idx, 1);
  }

  function notify() {
    for (var i = 0; i < _listeners.length; i++) {
      try { _listeners[i](_lines, null, _positions); } catch(e) {}
    }
  }

  function initLangSupport() {
    if (typeof window.onLanguageChange === "function") {
      window.onLanguageChange(function() {
        // Fusion data is language-neutral. Translation happens in DataState/view
        // renderers, so a language switch must not trigger a full-network fuse.
        notify();
      });
    }
  }

  // ========== Public API ==========
  window.DataState = {
    STATUS_META: STATUS_META,
    TRUNK_MAIN_LINE_IDS: TRUNK_MAIN_LINE_IDS,
    renderList: renderList,
    renderPageState: renderPageState,
    setPageStateRetry: setPageStateRetry,
    localizeInterval: function(str) { return window.LineCard.localizeInterval(str); },
    getLineIdentity: function(line, lineId) { return window.LineCard.getLineIdentity(line, lineId); },
    setLines: setLines,
    setPositions: setPositions,
    getLine: getLine,
    getPositions: getPositions,
    subscribe: subscribe,
    unsubscribe: unsubscribe,
    init: function() {
      if (_initialized) return;
      _initialized = true;
      if (window.UNIFIED_LINES) setLines(window.UNIFIED_LINES);

      window.addEventListener("pt:railway-ready", function() {
        if (window.UNIFIED_LINES) setLines(window.UNIFIED_LINES);
      });

      // Mobile Chrome can restore a frozen page from BFCache or regain network
      // without re-running DOMContentLoaded. Recover a visible failed state as soon
      // as the page becomes usable again, through the existing page retry callback.
      window.addEventListener("online", retryVisibleFailedStates);
      window.addEventListener("pageshow", function(event) {
        if (event.persisted) retryVisibleFailedStates();
      });

      if (window.DataFusion) {
        var fused = window.DataFusion.getFusedData();
        if (fused && fused.lines) setLines(fused.lines);
        window.DataFusion.subscribe(function(fd) {
          if (fd && fd.lines) setLines(fd.lines);

        });
      }
      initRailwayStateHosts();
      initLangSupport();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { window.DataState.init(); });
  } else {
    window.DataState.init();
  }
})();

