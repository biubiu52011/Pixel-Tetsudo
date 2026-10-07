/**
 * Pixel Tetsudo - canonical LineCard / SystemCard component.
 * Owns card DOM templates and card-internal updates for realtime + trains.
 */
(function() {
  "use strict";

  var STATUS_META = {
    normal:{icon:"○",cls:"rs-status-icon-normal"}, info:{icon:"！",cls:"rs-status-icon-notice"},
    notice:{icon:"！",cls:"rs-status-icon-notice"}, delayed:{icon:"△",cls:"rs-status-icon-delayed"},
    suspended:{icon:"×",cls:"rs-status-icon-suspended"}, no_data:{icon:"◌",cls:"rs-status-icon-no-data"},
    no_odpt:{icon:"●",cls:"rs-status-icon-no-odpt"}, loading:{icon:"◐",cls:"rs-status-icon-loading"}
  };
  function escapeHtml(s) {
    if (!s || typeof s !== "string") return "";
    return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  }
  function getDelayInfo(line) {
    if (line && line.delayInfo) return line.delayInfo;
    if (line && line.status) return {status:line.status,interval:line.interval,cause:line.cause};
    return null;
  }
  function getLineIdentity(line,lineId) {
    line=line||{};
    if (line.lineIdentity && line.lineIdentity.key) return String(line.lineIdentity.key);
    var operator=line.operator||"", railwayCode="";
    if (window.ODPTClient && window.ODPTClient.LINE_RAILWAY_CODE && lineId) railwayCode=window.ODPTClient.LINE_RAILWAY_CODE[lineId]||"";
    return operator && railwayCode ? String(operator)+"::"+String(railwayCode) : "";
  }
  function getStatus(status) { return STATUS_META[status] || STATUS_META.no_data; }
  function t(key) { return typeof window.t==="function" ? window.t(key) : (key||""); }
  function localizeInterval(str) {
    if (!str || String(str).indexOf("方面")===-1) return str;
    var dir=t("status.toward");
    return String(str).split("方面").join(dir||"方面");
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
    var linesObj = options.linesObj || window.UNIFIED_LINES || {};
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
      intervalHtml = '<div class="rs-line-interval">' + escapeHtml(localizeInterval(interval)) + '</div>';
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

  function elementFromHtml(html) {
    var wrap=document.createElement("div"); wrap.innerHTML=html||""; return wrap.firstElementChild||null;
  }
  function applyColor(card) {
    if (!card) return;
    var color=card.getAttribute("data-line-color");
    if (color) card.style.setProperty("--line-color",color);
  }
  function renderSystemByCode(code,linesObj,options) {
    if (!code || !linesObj) return "";
    var ids=Object.keys(linesObj);
    for (var i=0;i<ids.length;i++) {
      var sys=(window.LinePresentationService && window.LinePresentationService.getPrimaryPresentation)
        ? window.LinePresentationService.getPrimaryPresentation(ids[i],linesObj) : null;
      if (!sys || String(sys.code||"")!==String(code)) continue;
      var members=window.LinePresentationService.getPresentationMembers(ids[i],linesObj);
      if (!members.length) return "";
      return renderSystemCard(sys,members,linesObj,options||{mode:"realtime"});
    }
    return "";
  }
  function update(card,line,lineId,options) {
    if (!card || !line) return false;
    options=options||{};
    var fresh=elementFromHtml(renderCard(line,lineId,options));
    if (!fresh) return false;
    applyColor(fresh);
    if ((options.mode||"realtime")!=="realtime") { card.replaceWith(fresh); return true; }
    var oldStatus=card.querySelector(".rs-status-icon"), newStatus=fresh.querySelector(".rs-status-icon");
    if (oldStatus && newStatus) { oldStatus.className=newStatus.className; oldStatus.textContent=newStatus.textContent; }
    else if (oldStatus && !newStatus) oldStatus.remove();
    else if (!oldStatus && newStatus) { var header=card.querySelector(".rs-line-header"); if(header) header.appendChild(newStatus); }
    var oldInterval=card.querySelector(".rs-line-interval"), newInterval=fresh.querySelector(".rs-line-interval");
    if (oldInterval && newInterval) oldInterval.textContent=newInterval.textContent;
    else if (oldInterval && !newInterval) oldInterval.remove();
    else if (!oldInterval && newInterval) { var info=card.querySelector(".rs-line-info"); if(info) info.appendChild(newInterval); }
    return true;
  }
  function updateSystem(card,linesObj,options) {
    if (!card || !linesObj) return false;
    var fresh=elementFromHtml(renderSystemByCode(card.dataset.system||"",linesObj,options||{mode:"realtime"}));
    if (!fresh) return false;
    applyColor(fresh); card.replaceWith(fresh); return true;
  }

  window.LineCard = {
    render: renderCard,
    renderSystem: renderSystemCard,
    renderSystemByCode: renderSystemByCode,
    update: update,
    updateSystem: updateSystem,
    applyColor: applyColor,
    localizeInterval: localizeInterval,
    getLineIdentity: getLineIdentity
  };
})();
