/**
 * Pixel Tetsudo - Unified Data State Module
 * 统一的数据状态管理 + 线路卡片渲染
 * 供 realtime.html 和 trains.html 共享使用
 */
(function() {
  "use strict";

  // ========== Status definitions ==========
  var STATUS_META = {
    normal:    { icon: "\u25cb", cls: "rs-status-icon-normal",    label: "normal"    },
    delayed:   { icon: "\u25b3", cls: "rs-status-icon-delayed",  label: "delayed"   },
    suspended: { icon: "\u00d7", cls: "rs-status-icon-suspended", label: "suspended" },
    no_data:   { icon: "\u25cc", cls: "rs-status-icon-no-data",   label: "no_data"  },
    no_odpt:   { icon: "\u25cf", cls: "rs-status-icon-no-odpt",   label: "no_odpt"  }
  };

  // ========== Internal state ==========
  var _lines = {};
  var _delayData = {};
  var _positions = {};
  var _listeners = [];
  var _initialized = false;

  // ========== Helpers ==========
  function escapeHtml(s) {
    if (!s) return "";
    if (typeof s !== "string") return "";
    if (s.indexOf("&") < 0 && s.indexOf("<") < 0 && s.indexOf(">") < 0 && s.indexOf('"') < 0 && s.indexOf("'") < 0) return s;
    var d = document.createElement("div"); d.textContent = s; return d.innerHTML;
  }

  function getDelayInfo(line) {
    if (line.delayInfo) return line.delayInfo;
    if (line.status) return { status: line.status, interval: line.interval, cause: line.cause }
// Through-service chain delay aggregation (read-only, UI layer only)
function getAggregatedDelay(lineId, line) {
  try {
    if (!window.RunningChainResolver) return null;
    var ctx = window.RunningChainResolver.getResolutionContext(lineId, Object.keys(window.UNIFIED_LINES || {}));
    if (!ctx || !ctx.isThroughService || !ctx.relatedLines || ctx.relatedLines.length === 0) return null;
    var maxDelay = 0;
    var maxReason = null;
    ctx.relatedLines.forEach(function(relId) {
      var relLine = (window.DataState && window.DataState.getLine) ? window.DataState.getLine(relId) : null;
      if (!relLine || !relLine.delayInfo) return;
      var d = relLine.delayInfo;
      if (d && d.maxDelay != null && d.maxDelay > maxDelay) {
        maxDelay = d.maxDelay;
        maxReason = d.cause || null;
      }
    });
    if (maxDelay > 0) {
      return { status: "delayed", maxDelay: maxDelay, interval: null, cause: maxReason };
    }
  } catch(e) {}
  return null;
}
;
    return null;
  }

  function getStatus(status) {
    if (!status) return STATUS_META.no_data;
    if (status === 'normal') return STATUS_META.normal;
    return STATUS_META[status] || STATUS_META.no_data;
  }

  function t(key) {
    return (typeof window.t === "function") ? window.t(key) : (key || "");
  }

  // tLine removed: use RailwayDB.resolveLineName(lineId, lang) instead

  function tOp(name) {
    return (window.tOp && window.tOp(name)) || name || "";
  }

  // ========== Render functions ==========

  /**
   * Render a single line card
   * @param {Object} line - line data object
   * @param {String} lineId - line identifier
   * @param {Object} options - { mode: "realtime"|"trains" }
   */
  function renderCard(line, lineId, options) {
    options = options || {};
    var mode = options.mode || "realtime";
    var delayInfo = getDelayInfo(line) || {};
    var _aggDelay = getAggregatedDelay(lineId, line);
    if (_aggDelay) delayInfo = _aggDelay;
    var status = delayInfo && delayInfo.status ? delayInfo.status : (delayInfo ? "normal" : "no_data");
    var interval = delayInfo.interval || "";
    var lineColor = line.color || "#00b643";
    var displayName = (window.RailwayDB && window.RailwayDB.resolveLineName) ? window.RailwayDB.resolveLineName(lineId, window.currentLang) : (line.nameEn || line.name || lineId);
    // Fallback: RailwayDB unavailable (e.g., test/sandbox) — use raw fields

    // Icon
    var iconHtml = "";
    if (line.image) {
      iconHtml = '<img class="rs-line-icon" src="' + escapeHtml(line.image) + '" alt="" loading="lazy">';
    } else if (line.operator === "JR-East") {
      iconHtml = '<div class="rs-line-icon-fallback"><img src="../images/鉄道/JR東日本/JRグループ.png" alt="JR"></div>';
    } else if (line.code) {
      iconHtml = '<div class="rs-code-badge">' + escapeHtml(line.code) + '</div>';
    } else if (line.symbol) {
      iconHtml = '<div class="rs-code-badge">' + escapeHtml(line.symbol) + '</div>';
    } else {
      // OS symbol fallback: look up LineOperationSystems
      var osCode = "";
      if (window.LineOperationSystems) {
        var _ops = window.LineOperationSystems;
        var _opKeys = Object.keys(_ops);
        for (var _oi = 0; _oi < _opKeys.length; _oi++) {
          var _sysList = _ops[_opKeys[_oi]];
          for (var _si = 0; _si < _sysList.length; _si++) {
            if (_sysList[_si].lineIds && _sysList[_si].lineIds.indexOf(lineId) >= 0) {
              osCode = _sysList[_si].code || "";
              break;
            }
          }
          if (osCode) break;
        }
      }
      iconHtml = '<div class="rs-code-badge">' + escapeHtml(osCode || line.code || line.symbol || line.id || "?") + '</div>';
    }

    // Interval text (realtime mode)
    var intervalHtml = "";
    if (mode === "realtime" && interval) {
      intervalHtml = '<div class="rs-line-interval">' + escapeHtml(interval) + '</div>';
    }

    // Status icon
    var s = getStatus(status);
    var statusIconHtml = "";
    if (mode === "realtime") {
      statusIconHtml = '<span class="rs-status-icon ' + s.cls + '">' + s.icon + '</span>';
    }
    // Route interval subtitle (trains mode)
    var subHtml = "";
    if (mode === "trains") {
      var intervalText = "";
      try {
        var stations = (window.RailwayDB && window.RailwayDB.getLineStations) ? window.RailwayDB.getLineStations(lineId) : [];
        if (stations && stations.length >= 2) {
          var lang = window.currentLang || 'ja';
          var resolveName = (window.RailwayDB && window.RailwayDB.resolveStationName) ? window.RailwayDB.resolveStationName : null;
          if (resolveName) {
            var first = resolveName(stations[0], lang) || stations[0];
            var last = resolveName(stations[stations.length - 1], lang) || stations[stations.length - 1];
            intervalText = first + '\u2194 ' + last;
          }
        }
      } catch(e) {}
      if (intervalText) {
        subHtml = '<div class="rs-line-name-en">' + escapeHtml(intervalText) + '</div>';
      }
    }

    // Read chain metadata for badge display (transient, runtime-only)
    var _chainMeta = line._chainMeta || null;
    var _chainBadgeHtml = "";
    if (_chainMeta) {
      if (_chainMeta.isThroughService) {
        _chainBadgeHtml = "<span class=\"rs-chain-badge rs-chain-badge-through\" title=\"Through Service\"></span>";
      } else if (_chainMeta.isAlias) {
        _chainBadgeHtml = "<span class=\"rs-chain-badge rs-chain-badge-alias\" title=\"Alias\"></span>";
      } else if (_chainMeta.isBranch) {
        _chainBadgeHtml = "<span class=\"rs-chain-badge rs-chain-badge-branch\" title=\"Branch\"></span>";
      } else if (_chainMeta.identity === "SEPARATE" && _chainMeta.reason === "CODE_COLLISION_DIFF_OP") {
        _chainBadgeHtml = "<span class=\"rs-chain-badge rs-chain-badge-collision\" title=\"Code collision\"></span>";
      } else if (_chainMeta.identity === "UNKNOWN") {
        _chainBadgeHtml = "<span class=\"rs-chain-badge rs-chain-badge-unknown\" title=\"Unknown relation\"></span>";
      }
    }
    return '<div class="rs-line-card" data-line="' + escapeHtml(lineId) + '" data-line-color="' + escapeHtml(lineColor) + '">' + _chainBadgeHtml
      + '<div class="rs-line-header">'
      + iconHtml
      + '<div class="rs-line-info">'
      + '<div class="rs-line-name">' + escapeHtml(displayName) + '</div>'
      + subHtml
      + intervalHtml
      + '</div>'
      + statusIconHtml
      + '</div></div>';
  }

  /**
   * Render a full line list grouped by operator
   * @param {HTMLElement} container - target DOM element
   * @param {Object} linesObj - line ID -> line data map
   * @param {Object} options - { mode, lineOrder }
   */
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
      var op = line.operator || "Unknown";
      // Skip branch lines - not shown as separate entries
      if (line.branchOf) {
        var _skip = true;
        if (window.LineOperationSystems) {
          Object.keys(window.LineOperationSystems).some(function(_op) {
            return window.LineOperationSystems[_op].some(function(_sys) {
              if (_sys.isStandalone && _sys.lineIds && _sys.lineIds.indexOf(lid) >= 0) { _skip = false; return true; }
            });
          });
        }
        if (_skip) continue;
      }
      if (!groups[op]) {
        groups[op] = [];
        opOrder.push(op);
      }
      groups[op].push({ id: lid, line: line, sortIdx: insertMap[lid] || 99999 });
    }

    // Sort operator groups by OP_ORDER, unknown ops appended at end
    var knownOps = TransitConstants.OP_ORDER || [];
    var unknownOps = opOrder.filter(function(op){ return knownOps.indexOf(op) === -1; });
    opOrder = knownOps.filter(function(op){ return groups[op]; }).concat(unknownOps);

    // Sort lines within each operator group by lineOrder
    // Secondary: use LinePresentationService for JR code order, metro order, etc.
    var presentationOrderMap = (window.LinePresentationService && window.UNIFIED_LINES)
      ? window.LinePresentationService.getDisplayOrderMap(window.UNIFIED_LINES) : {};
    for (var op in groups) {
      if (groups.hasOwnProperty(op)) {
        groups[op].sort(function(a, b) {
          var idxA = a.sortIdx;
          var idxB = b.sortIdx;
          if (idxA !== idxB) return idxA - idxB;
          // Secondary sort by presentation service order
          var pA = presentationOrderMap[a.id] || 99999;
          var pB = presentationOrderMap[b.id] || 99999;
          return pA - pB;
        });
      }
    }

    var html = "";
    for (var o = 0; o < opOrder.length; o++) {
      var op = opOrder[o];
      html += '<div class="rs-operator-group"><div class="rs-operator-title">' + escapeHtml(tOp(op)) + '</div>'
        + '<div class="rs-cards-container">';
      for (var k = 0; k < groups[op].length; k++) {
        html += renderCard(groups[op][k].line, groups[op][k].id, { mode: mode });
      }
      html += "</div></div>";
    }
    container.innerHTML = html;
    // Apply line colors via DOM API (CSP-safe, bypasses style-src restriction)
    container.querySelectorAll('.rs-line-card').forEach(function(card) {
      var color = card.getAttribute('data-line-color');
      if (color) card.style.setProperty('--line-color', color);
    });
  }

  // ========== Data management ==========

  function setLines(lines) { _lines = lines || {}; notify(); }
  function setDelayData(data) { _delayData = data || {}; notify(); }
  function setPositions(positions) { _positions = positions || {}; notify(); }

  function getLine(lineId) { return _lines[lineId] || null; }
  function getDelayInfo(lineId) { return _delayData[lineId] || null; }
  function getPositions(lineId) { return _positions[lineId] || []; }

  function subscribe(listener) {
    if (_listeners.indexOf(listener) === -1) {
      _listeners.push(listener);
      try { listener(_lines, _delayData, _positions); } catch(e) {}
    }
  }

  function unsubscribe(listener) {
    var idx = _listeners.indexOf(listener);
    if (idx >= 0) _listeners.splice(idx, 1);
  }

  function notify() {
    for (var i = 0; i < _listeners.length; i++) {
      try { _listeners[i](_lines, _delayData, _positions); } catch(e) {}
    }
  }

  function initLangSupport() {
    if (typeof window.onLanguageChange === "function") {
      window.onLanguageChange(function() { notify(); });
    }
  }

  // ========== Public API ==========
  window.DataState = {
    STATUS_META: STATUS_META,
    renderCard: renderCard,
    renderList: renderList,
    setLines: setLines,
    setDelayData: setDelayData,
    setPositions: setPositions,
    getLine: getLine,
    getDelayInfo: getDelayInfo,
    getPositions: getPositions,
    subscribe: subscribe,
    unsubscribe: unsubscribe,
    init: function() {
      if (_initialized) return;
      _initialized = true;
      if (window.UNIFIED_LINES) setLines(window.UNIFIED_LINES);
      if (window.ODPT_DELAY_DATA) setDelayData(window.ODPT_DELAY_DATA);
      if (window.DataFusion) {
        var fused = window.DataFusion.getFusedData();
        if (fused && fused.lines) setLines(fused.lines);
        window.DataFusion.subscribe(function(fd) {
          if (fd && fd.lines) setLines(fd.lines);
          if (fd && fd.delayInfo) setDelayData(fd.delayInfo);
        });
      }
      initLangSupport();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { window.DataState.init(); });
  } else {
    window.DataState.init();
  }
})();


