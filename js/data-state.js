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
    if (line.status) return { status: line.status, interval: line.interval, cause: line.cause };
    return null;
  }

  // Through-service chain delay aggregation (read-only, UI layer only)
  // Module-level function: consumed by renderCard(). Keep outside getDelayInfo.
  function getAggregatedDelay(lineId, line) {
    try {
      if (!window.RunningChainResolver) return null;
      var ctx = window.RunningChainResolver.getResolutionContext(lineId, Object.keys(window.UNIFIED_LINES || {}));
      if (!ctx || !ctx.isThroughService || !ctx.relatedLines || ctx.relatedLines.length === 0) return null;
      var maxDelay = 0;
      var maxReason = null;
      // Include current line in aggregation
      var curDelay = line && line.delayInfo;
      if (curDelay && curDelay.maxDelay != null && curDelay.maxDelay > maxDelay) {
        maxDelay = curDelay.maxDelay;
        maxReason = curDelay.cause || null;
      }
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

  // Severity rank for system-level status aggregation (higher = more severe)
  function statusRank(s) {
    if (s === "suspended") return 5;
    if (s === "delayed") return 4;
    if (s === "no_odpt") return 3;
    if (s === "no_data") return 2;
    if (s === "normal") return 1;
    return 0;
  }

  /**
   * Render a running-system card (one LOS entry as a single card).
   * @param {Object} sys - LOS system entry { code, nameJa/nameZh/nameEn/nameKo, color, lineIds }
   * @param {Array} memberIds - DB line ids present in the current view
   * @param {Object} linesObj - line ID -> line data map
   * @param {Object} options - { mode: "realtime"|"trains" }
   */
  function renderSystemCard(sys, memberIds, linesObj, options) {
    options = options || {};
    var mode = options.mode || "realtime";
    var lang = window.currentLang || "ja";
    var name = sys.nameJa || "";
    if (lang === "zh" && sys.nameZh) name = sys.nameZh;
    else if (lang === "en" && sys.nameEn) name = sys.nameEn;
    else if (lang === "ko" && sys.nameKo) name = sys.nameKo;
    var color = sys.color || "#00b643";
    var code = sys.code || "";

    // Aggregate worst status across member lines for the card-level icon
    var worst = null;
    var firstId = null;
    var intervalSegments = []; // 收集所有线路的起终点用于合并
    for (var i = 0; i < memberIds.length; i++) {
      var lid = memberIds[i];
      if (firstId === null) firstId = lid;
      var line = linesObj[lid] || {};
      var dInfo = getDelayInfo(line) || {};
      var agg = getAggregatedDelay(lid, line);
      if (agg) dInfo = agg;
      var status = dInfo.status ? dInfo.status : (dInfo ? "normal" : "no_data");
      if (!worst || statusRank(status) > statusRank(worst)) worst = status;
      if (mode === "trains") {
        var stations = line.stations || [];
        if (stations.length >= 2) {
          intervalSegments.push({ from: stations[0], to: stations[stations.length - 1] });
        }
      }
    }
    // 合并连续线路的区间（前一条终点 == 后一条起点）
    var chipsHtml = "";
    if (mode === "trains" && intervalSegments.length > 0) {
      var merged = [intervalSegments[0]];
      for (var si = 1; si < intervalSegments.length; si++) {
        var prev = merged[merged.length - 1];
        var curr = intervalSegments[si];
        if (prev.to === curr.from) {
          // 连续，合并：起点保持，终点更新，中间站记录
          prev.to = curr.to;
          prev.mid = (prev.mid ? prev.mid + "↔" : "") + curr.from;
        } else {
          merged.push(curr);
        }
      }
      for (var mi = 0; mi < merged.length; mi++) {
        var seg = merged[mi];
        var sFromName = (window.RailwayDB && window.RailwayDB.resolveStationName) ? window.RailwayDB.resolveStationName(seg.from, lang) || seg.from : seg.from;
        var sToName = (window.RailwayDB && window.RailwayDB.resolveStationName) ? window.RailwayDB.resolveStationName(seg.to, lang) || seg.to : seg.to;
        var midText = "";
        if (seg.mid) {
          var midStations = seg.mid.split("↔");
          var midNames = [];
          for (var msi = 0; msi < midStations.length; msi++) {
            var midName = (window.RailwayDB && window.RailwayDB.resolveStationName) ? window.RailwayDB.resolveStationName(midStations[msi], lang) || midStations[msi] : midStations[msi];
            midNames.push(escapeHtml(midName));
          }
          midText = midNames.join("↔") + "↔";
        }
        var intervalText = escapeHtml(sFromName) + "↔" + midText + escapeHtml(sToName);
        chipsHtml += '<span class="rs-sys-chip">' + intervalText + '</span>';
      }
    }
    var worstS = getStatus(worst);
    var statusHtml = "";
    if (mode === "realtime") {
      statusHtml = '<span class="rs-status-icon ' + worstS.cls + '">' + worstS.icon + '</span>';
    }

    // Icon: gallery image when the system has one (build-time verified to exist),
    // otherwise fall back to the 記号 badge.
    var iconHtml = "";
    if (sys.icon) {
      iconHtml = '<img class="rs-line-icon" src="' + escapeHtml(sys.icon) + '" alt="" loading="lazy">';
    } else {
      var _firstLine = memberIds.length > 0 ? (linesObj[memberIds[0]] || {}) : {};
      var _sysOp = _firstLine.operator || sys.operator || "";
      if (_sysOp === "JR-East") {
        iconHtml = '<div class="rs-line-icon-fallback"><img src="../images/鉄道/JR東日本/JRグループ.png" alt="JR"></div>';
      } else {
        iconHtml = '<div class="rs-system-badge">' + escapeHtml(code || "?") + '</div>';
      }
    }
    return '<div class="rs-line-card rs-system-card" data-line="' + escapeHtml(firstId) + '" data-system="' + escapeHtml(code) + '" data-lines="' + escapeHtml(memberIds.join(",")) + '" data-line-color="' + escapeHtml(color) + '">'
      + iconHtml
      + '<div class="rs-line-info">'
      + '<div class="rs-line-name">' + escapeHtml(name) + '</div>'
      + (mode === "trains" && chipsHtml ? '<div class="rs-system-lines">' + chipsHtml + '</div>' : '')
      + '</div>'
      + statusHtml
      + '</div>';
  }

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
    // Operator-generic logos (JRグループ.png etc.) are not line icons;
    // skip them so per-line cards never borrow another operator's logo.
    var _imgOk = line.image && !/(グループ|ロゴ|マーク|アイコン|シンボル)/.test(line.image);
    if (_imgOk) {
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

    // Sort fallback lines within each operator group by lineOrder
    var presentationOrderMap = (window.LinePresentationService && window.UNIFIED_LINES)
      ? window.LinePresentationService.getDisplayOrderMap(window.UNIFIED_LINES) : {};
    for (var op in groups) {
      if (groups.hasOwnProperty(op)) {
        groups[op].sort(function(a, b) {
          var idxA = a.sortIdx;
          var idxB = b.sortIdx;
          if (idxA !== idxB) return idxA - idxB;
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
      // Running-system cards (LOS authority), then per-line fallback for uncovered lines
      var losKey = null;
      try {
        if (window.TransitConstants && typeof window.TransitConstants.toLosKey === "function") losKey = window.TransitConstants.toLosKey(op);
      } catch(_e) {}
      var systems = (losKey && window.LineOperationSystems && window.LineOperationSystems[losKey]) ? window.LineOperationSystems[losKey] : null;
      var covered = {};
      if (systems) {
        for (var s = 0; s < systems.length; s++) {
          var sys = systems[s];
          var sysIds = sys.lineIds || [];
          var memberIds = [];
          for (var m = 0; m < sysIds.length; m++) {
            if (linesObj[sysIds[m]]) { memberIds.push(sysIds[m]); covered[sysIds[m]] = true; }
          }
          if (memberIds.length === 0) continue;
          html += renderSystemCard(sys, memberIds, linesObj, { mode: mode });
        }
      }
      for (var k = 0; k < groups[op].length; k++) {
        var g = groups[op][k];
        if (covered[g.id]) continue;
        html += renderCard(g.line, g.id, { mode: mode });
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
      window.onLanguageChange(function() { notify(); });
    }
  }

  // ========== Public API ==========
  window.DataState = {
    STATUS_META: STATUS_META,
    renderCard: renderCard,
    renderList: renderList,
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

      if (window.DataFusion) {
        var fused = window.DataFusion.getFusedData();
        if (fused && fused.lines) setLines(fused.lines);
        window.DataFusion.subscribe(function(fd) {
          if (fd && fd.lines) setLines(fd.lines);

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


