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
    var cls = state === "render_error" || state === "error" ? "rs-error" : "rs-empty";
    var detailKey = state === "render_error" ? "status.display_unavailable_hint"
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

  function setPageStateRetry(container, callback) {
    if (!container) return;
    container._pageStateRetry = typeof callback === "function" ? callback : null;
  }

  // Severity rank for system-level status aggregation (higher = more severe)
  function statusRank(s) {
    if (s === "suspended") return 5;
    if (s === "delayed") return 4;
    if (s === "notice") return 3.5;
    if (s === "info") return 3;
    if (s === "no_odpt") return 3;
    if (s === "loading") return 2;
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
    var allLoop = false;
    var intervalSegments = []; // 收集所有线路的起终点用于合并
    for (var i = 0; i < memberIds.length; i++) {
      var lid = memberIds[i];
      if (firstId === null) firstId = lid;
      var line = linesObj[lid] || {};
      var dInfo = getDelayInfo(line) || {};
      var status = dInfo.status ? dInfo.status : "loading";
      // A system card may only claim normal when every member is confirmed.
      // Keep loading/no-data visible unless a real disruption has higher priority.
      if (!worst) worst = status;
      else if ((status === "loading" || status === "no_data" || status === "no_odpt") && worst === "normal") worst = status;
      else if (!(worst === "loading" || worst === "no_data" || worst === "no_odpt") && statusRank(status) > statusRank(worst)) worst = status;
      else if ((worst === "loading" || worst === "no_data" || worst === "no_odpt") && status !== "normal" && statusRank(status) > 3) worst = status;
      if (mode === "trains") {
        var stations = line.stations || [];
        // Loop lines (Yamanote / Oedo) have no meaningful termini: their drawn
        // first/last stations are adjacent on the ring and mislead users
        // (山手線 figure order starts 東京→有楽町). Skip them; a pure-loop card
        // falls back to "環状" below (4.3.557).
        var isLoopLine = !!(line.isDoubleColumnLoop || line.isSixShapedLoop);
        if (isLoopLine) allLoop = true;
        if (stations.length >= 2 && !isLoopLine) {
          intervalSegments.push({ from: stations[0], to: stations[stations.length - 1] });
        }
      }
    }
    // 合并连续线路的区间（前一条终点 == 后一条起点）
    // Card subtitles describe the passenger-facing route interval only.
    // Through-service/subName metadata belongs to relationship badges/details
    // and must never replace origin/destination.
    var chipsHtml = "";
    if (mode === "trains" && intervalSegments.length === 0 && allLoop) {
      // Whole card is loop lines only: show 環状 instead of a meaningless
      // first↔last interval (Yamanote/Oedo LOS cards).
      chipsHtml = '<span class="rs-sys-chip">' + escapeHtml(t('line.loop')) + '</span>';
    } else if (mode === "trains" && intervalSegments.length > 0) {
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
      if (String(sys.icon).indexOf("JRグループ.png") !== -1) {
        iconHtml = '<div class="rs-line-icon-fallback"><img src="' + escapeHtml(sys.icon) + '" alt="JR"></div>';
      } else {
        iconHtml = '<img class="rs-line-icon" src="' + escapeHtml(sys.icon) + '" alt="" loading="lazy">';
      }
    } else {
      var _firstLine = memberIds.length > 0 ? (linesObj[memberIds[0]] || {}) : {};
      var _sysOp = _firstLine.operator || sys.operator || "";
      if (window.TransitConstants && window.TransitConstants.isJRERoute && window.TransitConstants.isJRERoute(_firstLine)) {
        iconHtml = '<div class="rs-line-icon-fallback"><img src="../images/鉄道/JR東日本/JRグループ.png" alt="JR"></div>';
      } else {
        iconHtml = '<div class="rs-system-badge">' + escapeHtml(code || "?") + '</div>';
      }
    }
    var _memberIdentities = [];
    for (var _mi = 0; _mi < memberIds.length; _mi++) {
      var _mid = memberIds[_mi];
      _memberIdentities.push(_mid + "=" + getLineIdentity(linesObj[_mid] || {}, _mid));
    }
    return '<div class="rs-line-card rs-system-card" data-line="' + escapeHtml(firstId) + '" data-line-identity="' + escapeHtml(getLineIdentity(linesObj[firstId] || {}, firstId)) + '" data-line-identities="' + escapeHtml(_memberIdentities.join("|")) + '" data-system="' + escapeHtml(code) + '" data-lines="' + escapeHtml(memberIds.join(",")) + '" data-line-color="' + escapeHtml(color) + '">'
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
    var status = delayInfo && delayInfo.status ? delayInfo.status : "loading";
    var interval = delayInfo.interval || "";
    var _presentation = (window.LinePresentationService && window.LinePresentationService.getPresentation)
      ? window.LinePresentationService.getPresentation(lineId, linesObj || window.UNIFIED_LINES)
      : null;
    var lineColor = (_presentation && _presentation.color) || line.color || "#00b643";
    var displayName = (window.RailwayDB && window.RailwayDB.resolveLineName) ? window.RailwayDB.resolveLineName(lineId, window.currentLang) : (line.nameEn || line.name || lineId);
    // Fallback: RailwayDB unavailable (e.g., test/sandbox) — use raw fields

    // Icon
    var iconHtml = "";
    // Operator-generic logos (JRグループ.png etc.) are not line icons;
    // skip them so per-line cards never borrow another operator's logo.
    var _losIcon = (_presentation && _presentation.icon) || "";
    var _imgOk = _losIcon || (line.image && !/(グループ|ロゴ|マーク|アイコン|シンボル)/.test(line.image));
    if (_losIcon) {
      if (String(_losIcon).indexOf("JRグループ.png") !== -1) {
        iconHtml = '<div class="rs-line-icon-fallback"><img src="' + escapeHtml(_losIcon) + '" alt="JR"></div>';
      } else {
        iconHtml = '<img class="rs-line-icon" src="' + escapeHtml(_losIcon) + '" alt="" loading="lazy">';
      }
    } else if (_imgOk) {
      iconHtml = '<img class="rs-line-icon" src="' + escapeHtml(line.image) + '" alt="" loading="lazy">';
    } else if (line && window.TransitConstants && window.TransitConstants.isJRERoute && window.TransitConstants.isJRERoute(line)) {
      iconHtml = '<div class="rs-line-icon-fallback"><img src="../images/鉄道/JR東日本/JRグループ.png" alt="JR"></div>';
    } else if (line.code) {
      iconHtml = '<div class="rs-code-badge">' + escapeHtml(line.code) + '</div>';
    } else if (line.symbol) {
      iconHtml = '<div class="rs-code-badge">' + escapeHtml(line.symbol) + '</div>';
    } else {
      // Canonical presentation code fallback.
      var osCode = (_presentation && _presentation.code) || "";
      iconHtml = '<div class="rs-code-badge">' + escapeHtml(osCode || line.code || line.symbol || line.id || "?") + '</div>';
    }

    // Interval text (realtime mode)
    var intervalHtml = "";
    if (mode === "realtime" && interval) {
      intervalHtml = '<div class="rs-line-interval">' + escapeHtml(_localizeInterval(interval)) + '</div>';
    }

    // Status icon
    var s = getStatus(status);
    var statusIconHtml = "";
    if (mode === "realtime") {
      statusIconHtml = '<span class="rs-status-icon ' + s.cls + '">' + s.icon + '</span>';
    }
    // Route interval subtitle (trains mode): always describe this line's
    // origin/destination. presentation.subName is relationship/presentation
    // metadata and must not replace the route interval.
    var subHtml = "";
    if (mode === "trains") {
      var intervalText = "";
      try {
        var stations = (window.RailwayDB && window.RailwayDB.getLineStations) ? window.RailwayDB.getLineStations(lineId) : [];
        // Loop lines (Yamanote/Oedo): drawn first↔last stations are adjacent on
        // the ring and mislead users, so show 環状 instead.
        var _isLoop = !!(line && (line.isDoubleColumnLoop || line.isSixShapedLoop));
        if (_isLoop) {
          intervalText = t('line.loop');
        } else if (stations && stations.length >= 2) {
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
        subHtml = '<div class="rs-line-interval">' + escapeHtml(intervalText) + '</div>';
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
    // Line Hierarchy Rule: 支线（branches）在父线卡片内展示，不独立出现在一级列表
    var branchHtml = "";
    if (line.branches && line.branches.length > 0 && linesObj) {
      var blang = window.currentLang || "ja";
      var bItems = [];
      for (var bi = 0; bi < line.branches.length; bi++) {
        var blid = line.branches[bi];
        var bline = linesObj[blid];
        if (!bline) continue;
        var bName = bline.nameJa || bline.name || blid;
        if (window.RailwayDB && window.RailwayDB.resolveLineName) bName = window.RailwayDB.resolveLineName(blid, blang) || bName;
        bItems.push('<span class="rs-branch-chip" data-line="' + escapeHtml(blid) + '" data-line-identity="' + escapeHtml(getLineIdentity(bline, blid)) + '" data-parent="' + escapeHtml(lineId) + '">' + escapeHtml(bName) + '</span>');
      }
      if (bItems.length > 0) {
        branchHtml = '<div class="rs-branch-row">' + bItems.join("") + '</div>';
      }
    }
    return '<div class="rs-line-card" data-line="' + escapeHtml(lineId) + '" data-line-identity="' + escapeHtml(getLineIdentity(line, lineId)) + '" data-line-color="' + escapeHtml(lineColor) + '">' + _chainBadgeHtml
      + '<div class="rs-line-header">'
      + iconHtml
      + '<div class="rs-line-info">'
      + '<div class="rs-line-name">' + escapeHtml(displayName) + '</div>'
      + subHtml
      + intervalHtml
      + '</div>'
      + statusIconHtml
      + '</div>'
      + branchHtml
      + '</div>';
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
            html += renderSystemCard(pres, memberIds, linesObj, { mode: mode });
            continue;
          }
        }
        html += renderCard(g.line, g.id, { mode: mode });
      }
      html += "</div></div>";
    }
    container.innerHTML = html;
    // Apply line colors via DOM API (CSP-safe, bypasses style-src restriction)
    Array.prototype.slice.call(container.querySelectorAll('.rs-line-card')).forEach(function(card) {
      var color = card.getAttribute('data-line-color');
      if (color) card.style.setProperty('--line-color', color);
    });
  }

  function renderSystemCardByCode(code, linesObj, options) {
    if (!code || !linesObj) return "";
    var ids = Object.keys(linesObj);
    for (var i = 0; i < ids.length; i++) {
      var line = linesObj[ids[i]];
      var sys = (window.LinePresentationService && window.LinePresentationService.getPrimaryPresentation)
        ? window.LinePresentationService.getPrimaryPresentation(ids[i], linesObj)
        : null;
      if (!sys || String(sys.code || "") !== String(code)) continue;
      var memberIds = window.LinePresentationService.getPresentationMembers(ids[i], linesObj);
      if (memberIds.length === 0) return "";
      return renderSystemCard(sys, memberIds, linesObj, options || { mode: "realtime" });
    }
    return "";
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
    renderCard: renderCard,
    renderList: renderList,
    renderSystemCardByCode: renderSystemCardByCode,
    renderPageState: renderPageState,
    setPageStateRetry: setPageStateRetry,
    localizeInterval: _localizeInterval,
    getLineIdentity: getLineIdentity,
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

