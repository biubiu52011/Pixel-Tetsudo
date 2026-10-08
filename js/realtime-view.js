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

  function _impactLabels() {
    var lang = window.currentLang || "ja";
    var all = {
      ja: { dir:{up:"上り",down:"下り",both:"上下線",inner:"内回り",outer:"外回り"}, effect:{delay:"遅延",suspension:"運転見合わせ",partial_cancellation:"一部運休",through_suspension:"直通運転中止",normal:"平常運転"} },
      zh: { dir:{up:"上行",down:"下行",both:"上下行",inner:"内环",outer:"外环"}, effect:{delay:"延误",suspension:"暂停运行",partial_cancellation:"部分列车停运",through_suspension:"停止直通运行",normal:"正常运行"} },
      ko: { dir:{up:"상행",down:"하행",both:"상하행",inner:"내선 순환",outer:"외선 순환"}, effect:{delay:"지연",suspension:"운전 중단",partial_cancellation:"일부 열차 운휴",through_suspension:"직통 운전 중단",normal:"정상 운행"} },
      en: { dir:{up:"Upbound",down:"Downbound",both:"Both directions",inner:"Inner loop",outer:"Outer loop"}, effect:{delay:"Delayed",suspension:"Service suspended",partial_cancellation:"Some trains cancelled",through_suspension:"Through service suspended",normal:"Normal service"} }
    };
    return all[lang] || all.ja;
  }

  function _scopeSummary(interval, impacts) {
    var list = Array.isArray(impacts) ? impacts : [];
    var explicitRanges = list.map(function(x){ return x && x.interval; }).filter(function(x){ return x && x !== "全線"; });
    if (explicitRanges.length) return explicitRanges[0];
    if (interval && interval !== "全線") return interval;
    var direction = list.map(function(x){ return x && x.direction; }).find(function(x){ return !!x; });
    if (direction) return (_impactLabels().dir[direction] || direction);
    if (interval === "全線" || list.some(function(x){ return x && x.interval === "全線"; })) return "全線";
    return "";
  }

  function getDelayInfo(line) {
    if (line.delayInfo) return line.delayInfo;
    if (line.status) return { status: line.status, interval: line.interval, cause: line.cause };
    return null;
  }

  function clearSelectedCards() {
    var list = document.getElementById("realtimeStatusContainer");
    if (list) list.querySelectorAll(".rs-line-card.selected").forEach(function(c) { c.classList.remove("selected"); });
  }

  function renderCard(line, lineId) {
    return window.LineCard.render(line, lineId, { mode: "realtime", linesObj: _latestLines || window.UNIFIED_LINES || {} });
  }

  function renderLines(container, linesObj, lineOrderArr) {
    window.DataState.renderList(container, linesObj, { mode: "realtime", lineOrder: lineOrderArr });
  }

  function openModal(lineId, linesObj, expectedIdentity, displayTitle) {
    var modal = document.getElementById("lineDetailModal");
    if (!modal || !linesObj || !linesObj[lineId]) return;
    var line = linesObj[lineId];
    var actualIdentity = (window.DataState && window.DataState.getLineIdentity) ? window.DataState.getLineIdentity(line, lineId) : "";
    if (expectedIdentity && actualIdentity && expectedIdentity !== actualIdentity) return;
    _currentModalLine = lineId;
    _currentModalTitle = displayTitle || "";
    _currentModalIdentity = actualIdentity;
    var delayInfo = getDelayInfo(line) || {};
    // Use window.DataState.getStatus for consistent NO_DATA handling
    var status = delayInfo && delayInfo.status ? delayInfo.status : "loading";
    var interval = delayInfo.interval || "";
    var impacts = Array.isArray(delayInfo.impacts) ? delayInfo.impacts : [];
    var scopeSummary = _scopeSummary(interval, impacts);
    var cause = delayInfo.cause || "";
    var s = window.DataState && window.DataState.STATUS_META && window.DataState.STATUS_META[status] ? window.DataState.STATUS_META[status] : STATUS_META[status] || STATUS_META.no_data;
    var statusText = t("status." + status) || status;
    // Title
    modal.querySelector(".rs-modal-title").textContent = displayTitle || getDisplayName(line) || tLine(line.id) || line.name;
    // Status section
    var statusSection = modal.querySelector(".rs-status-section");
    statusSection.className = "rs-status-section rs-status-" + status;
    // v4.3.629: 状态行 = 官方 status 词（分级翻译）+ 官方 cause（原因；非 ja 界面经 DelayTranslator 翻译）
    var _causeInline = "";
    if (cause && status !== "normal") {
      var _cTxt = cause;
      if ((window.currentLang || "ja") !== "ja" && window.DelayTranslator && _needsJaTranslate(cause)) {
        try { _cTxt = window.DelayTranslator.translateFragment(cause, window.currentLang); } catch(e) {}
      }
      _causeInline = " <span class=\"rs-cause-inline\">\uff08" + escapeHtml(_cTxt) + "\uff09</span>";
    }
    statusSection.innerHTML = "<span class=\"rs-status-indicator\"><span class=\"rs-status-dot\"></span>" + statusText + "</span>" + _causeInline;
    // Apply status dot color via DOM API (CSP-safe)
    var dot = statusSection.querySelector(".rs-status-dot");
    if (dot) dot.style.background = "var(--" + (s.color || ({ normal: "green", info: "yellow", notice: "yellow", delayed: "orange", suspended: "red", no_data: "gray", no_odpt: "gray", loading: "gray" }[status] || "gray")) + ")";
    // Interval section
    var intervalSection = modal.querySelector(".rs-interval-section");
    intervalSection.querySelector(".rs-info-label").textContent = t("status.interval");
    var intervalHtml;
    var _singleEndInterval = false;
    if (!scopeSummary || status === "normal" || status === "no_data") {
      intervalHtml = '<span class="rs-station-text">' + t("status.all_lines") + '</span>';
    } else {
      var intervalRanges = scopeSummary.split("、");
      var parsedRanges = intervalRanges.map(function (item) { return item.split("\u2192"); });
      var allStationRanges = parsedRanges.length > 0 && parsedRanges.every(function (parts) { return parts.length === 2; });
      if (allStationRanges) {
        intervalHtml = parsedRanges.map(function (parts) {
          return '<span class="rs-station-start">' + escapeHtml(tStation(parts[0])) + '</span>'
            + '<span class="rs-interval-arrow">\u2192</span>'
            + '<span class="rs-station-end">' + escapeHtml(tStation(parts[1])) + '</span>';
        }).join('<span class="rs-interval-separator">、</span>');
      } else {
        var _int = scopeSummary;
        if (String(_int).indexOf("\u5168\u7dda") >= 0) {
          // v4.3.628: ODPT Range="全線" 复用 status.all_lines 多语言（非 ja 界面不显示日文原样）
          intervalHtml = "<span class=\"rs-station-text\">" + escapeHtml(t("status.all_lines")) + "</span>";
        } else {
          // Single-ended interval ("東京方面"): localize the "方面" suffix per language
          if (window.DataState && typeof window.DataState.localizeInterval === "function") _int = window.DataState.localizeInterval(_int);
          intervalHtml = "<span class=\"rs-station-text\">" + escapeHtml(_int) + "</span>";
          _singleEndInterval = true;
        }
        _singleEndInterval = true;
      }
    }
    intervalSection.querySelector(".rs-interval-stations").innerHTML = intervalHtml;
    // 4.3.443: 单端/文本兜底区间（如"京急線内"）在非 ja 界面翻译
    // 4.3.445: 改为离线 DelayTranslator.translateFragment（同步替换，不再走异步 API）
    if (_singleEndInterval && (window.currentLang || "ja") !== "ja") {
      var _intEl = intervalSection.querySelector(".rs-interval-stations .rs-station-text");
      if (_intEl && _needsJaTranslate(interval) && window.DelayTranslator) {
        _intEl.textContent = window.DelayTranslator.translateFragment(interval, window.currentLang);
      }
    }
    // Cause section -> 運行情報（v4.3.389: 直接显示 ODPT text 原文，不解析碎片；
    // 4.3.443: 非 ja 界面译文为主显示，原文折叠保留，翻译失败自动回退原文；
    // 4.3.445: 改用离线模板翻译引擎 DelayTranslator（同步、无网络、线上可用））
    var causeSection = modal.querySelector(".rs-cause-section");
    var _detailTitles = { ja: "運行情報", en: "Service Info", zh: "运行信息", ko: "운행 정보" };
    causeSection.querySelector(".rs-section-title").textContent = _detailTitles[(window.currentLang || "ja")] || "運行情報";
    var causeHtml;
    var _transSource = "";
    // v4.3.969: 官网网页源只保留正文，不再展示 URL 链接行。
    var _srcText = delayInfo.detail || cause || "";
    var _exLinks = [];
    var _cleanSrc = _srcText;
    var _isWebSource = (delayInfo && delayInfo.source === "web")
      || (window.WebRunInfo && typeof window.WebRunInfo.isWebLine === "function" && window.WebRunInfo.isWebLine(lineId));
    if (window.RunInfoAPI && typeof window.RunInfoAPI.extractLinks === "function") {
      try {
        var _ex = window.RunInfoAPI.extractLinks(_srcText);
        _cleanSrc = _ex.cleanText;
        _exLinks = _isWebSource ? [] : (_ex.links || []);
      } catch(e) {}
    }
    if (status === "loading") {
      causeHtml = '<span class="rs-text-muted">' + t("status.loading") + '</span>';
    } else if (status === "no_data" || status === "no_odpt") {
      causeHtml = '<span class="rs-text-muted">' + t("status.no_data") + '</span>';
    } else if (_cleanSrc) {
      _transSource = _cleanSrc;
      causeHtml = _translatedText(_cleanSrc, window.currentLang || "ja", _translationOpts(lineId, status, Object.assign({}, delayInfo, { cause: cause })));
    } else {
      causeHtml = '<span class="rs-text-muted">' + t("status.none") + '</span>';
    }
    var _bodyTextEl = causeSection.querySelector(".rs-cause-text");
    if (_bodyTextEl) {
      _bodyTextEl.innerHTML = causeHtml;
      if (_cleanSrc) _upgradeBodyTranslation(_bodyTextEl, _cleanSrc, window.currentLang || "ja", _translationOpts(lineId, status, Object.assign({}, delayInfo, { cause: cause })), lineId);
    }
    // v4.3.964: 非官网来源的 URL 渲染为可点击链接行（正文保持纯文字）
    if (_exLinks.length > 0) {
      try {
        var _linksWrap = document.createElement("div");
        _linksWrap.className = "rs-cause-links";
        var _lh = "";
        for (var _i = 0; _i < _exLinks.length; _i++) {
          _lh += '<a class="rs-cause-link" href="' + escapeHtml(_exLinks[_i]) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(_exLinks[_i]) + '</a>';
        }
        _linksWrap.innerHTML = _lh;
        causeSection.appendChild(_linksWrap);
      } catch(e) {}
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
    // v4.3.968: 弹窗统一设计——打开后经 RunInfoAPI.query() 异步刷新運行情報正文（ODPT/官网同一通道，不区分接口）
    try { refreshCauseFromAPI(modal, lineId, line, delayInfo, cause, status); } catch(e) {}
  }

  // v4.3.964: 经 RunInfoAPI.query() 拉取官方接口文字，更新弹窗「運行情報」正文（纯文字 + 链接行）
  function refreshCauseFromAPI(modal, lineId, line, fallbackDelayInfo, fallbackCause, fallbackStatus) {
    if (!modal || !window.RunInfoAPI || typeof window.RunInfoAPI.query !== "function") return;
    try {
      window.RunInfoAPI.query(lineId, line).then(function(r) {
        if (!r) return;                                // 查询失败：保留现有显示

        // RunInfoAPI is the final authority after the async refresh. Keep the
        // modal status, interval semantics and detail text on the same snapshot
        // instead of mixing stale DataFusion state with fresh official text.
        var resolvedStatus = r.status || fallbackStatus || "no_data";
        var statusSection = modal.querySelector(".rs-status-section");
        if (statusSection) {
          var meta = window.DataState && window.DataState.STATUS_META && window.DataState.STATUS_META[resolvedStatus]
            ? window.DataState.STATUS_META[resolvedStatus]
            : STATUS_META[resolvedStatus] || STATUS_META.no_data;
          statusSection.className = "rs-status-section rs-status-" + resolvedStatus;
          statusSection.innerHTML = "<span class=\\\"rs-status-indicator\\\"><span class=\\\"rs-status-dot\\\"></span>" +
            escapeHtml(t("status." + resolvedStatus) || resolvedStatus) + "</span>";
          var statusDot = statusSection.querySelector(".rs-status-dot");
          if (statusDot) statusDot.style.background = "var(--" + (meta.color || "gray") + ")";
        }

        var refreshedImpacts = Array.isArray(r.impacts) ? r.impacts : [];
        var refreshedScope = _scopeSummary(r.interval || "", refreshedImpacts);
        var refreshedIntervalEl = modal.querySelector(".rs-interval-stations");
        if (refreshedIntervalEl && resolvedStatus !== "normal" && refreshedScope) {
          refreshedIntervalEl.innerHTML = '<span class="rs-station-text">' + escapeHtml(
            refreshedScope === "全線" ? t("status.all_lines") : refreshedScope
          ) + "</span>";
        }

        // A normal result applies to the whole line; never retain an old
        // disruption interval beside a freshly resolved normal status.
        if (resolvedStatus === "normal") {
          var intervalEl = modal.querySelector(".rs-interval-stations");
          if (intervalEl) intervalEl.innerHTML = '<span class="rs-station-text">' + escapeHtml(t("status.all_lines")) + "</span>";
        }

        var causeSection = modal.querySelector(".rs-cause-section");
        if (!causeSection) return;
        // Empty official text is still meaningful (e.g. structured Normal).
        // Render status.none rather than aborting and leaving stale detail text.
        var lang = window.currentLang || "ja";
        var causeHtml;
        if (!r.text) {
          causeHtml = '<span class="rs-text-muted">' + t("status.none") + "</span>";
        } else if (lang === "ja" || !_needsJaTranslate(r.text)) {
          causeHtml = escapeHtml(r.text);
        } else {
          causeHtml = _translatedText(r.text, lang, _translationOpts(lineId, resolvedStatus, Object.assign({}, r, { cause: r.cause || fallbackCause || "" })));
        }
        var textEl = causeSection.querySelector(".rs-cause-text");
        if (textEl) {
          textEl.innerHTML = causeHtml;
          if (r.text) _upgradeBodyTranslation(textEl, r.text, lang, _translationOpts(lineId, resolvedStatus, Object.assign({}, r, { cause: r.cause || fallbackCause || "" })), lineId);
        }
        // 清理旧的链接行再渲染
        var oldLinks = causeSection.querySelector(".rs-cause-links");
        if (oldLinks) oldLinks.remove();
        if (r.links && r.links.length > 0) {
          var linksWrap = document.createElement("div");
          linksWrap.className = "rs-cause-links";
          var lh = "";
          for (var i = 0; i < r.links.length; i++) {
            lh += '<a class="rs-cause-link" href="' + escapeHtml(r.links[i]) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(r.links[i]) + '</a>';
          }
          linksWrap.innerHTML = lh;
          causeSection.appendChild(linksWrap);
        }
      }).catch(function() {});
    } catch(e) {}
  }


  function closeModal() {
    _currentModalLine = null;
    _currentModalIdentity = "";
    var modal = document.getElementById("lineDetailModal");
    if (!modal) return;
    modal.classList.remove("active");
    document.body.classList.remove("modal-open");
    clearSelectedCards();
  }

  let _latestLines = null;
  let _latestOrder = null;
  let _selectedOperator = null;
  var _filterBar = null;

  let _currentModalLine = null;
  let _currentModalTitle = "";
  let _currentModalIdentity = "";
  var _listStatusRefreshToken = 0;

  // Keep list-card status on the same RunInfoAPI snapshot used by the modal.
  // DataFusion remains the immediate render source; RunInfoAPI then reconciles
  // status asynchronously without requiring the user to open each line.
  function refreshListStatuses(linesObj) {
    if (!linesObj || !window.RunInfoAPI || typeof window.RunInfoAPI.query !== "function") return;
    var token = ++_listStatusRefreshToken;
    var ids = Object.keys(linesObj);
    var pending = {};
    var flushScheduled = false;

    // Reconcile each returned status promptly; a slow operator must not hold
    // every other line hostage behind Promise.all().
    function flushChanges() {
      flushScheduled = false;
      if (token !== _listStatusRefreshToken) return;
      var changedIds = Object.keys(pending);
      pending = {};
      if (!changedIds.length) return;
      var container = document.getElementById("realtimeStatusContainer");
      var visible = getFilteredLines();
      var visibleChanged = changedIds.filter(function(id) { return !!visible[id]; });
      if (!visibleChanged.length) return;
      if (!patchRealtimeCards(container, visible, visibleChanged)) renderFiltered();
    }
    function queueChange(lineId) {
      pending[lineId] = true;
      if (flushScheduled) return;
      flushScheduled = true;
      setTimeout(flushChanges, 100);
    }

    ids.forEach(function(lineId) {
      var line = linesObj[lineId];
      try {
        Promise.resolve(window.RunInfoAPI.query(lineId, line)).then(function(r) {
          if (!r || !r.status || token !== _listStatusRefreshToken || !_latestLines || !_latestLines[lineId]) return;
          var target = _latestLines[lineId];
          var old = getDelayInfo(target) || {};
          if (old.status === r.status) return;
          target.delayInfo = Object.assign({}, old, {
            status: r.status,
            // A fresh normal result must not retain stale disruption metadata.
            interval: r.status === "normal" ? null : old.interval,
            cause: r.status === "normal" ? null : old.cause,
            detail: r.text != null ? r.text : old.detail,
            source: r.source || old.source,
            updatedAt: r.updatedAt || old.updatedAt
          });
          queueChange(lineId);
        }).catch(function() {});
      } catch (e) { /* One failing provider must not block other lines. */ }
    });
  }


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

  function _translationOpts(lineId, status, source) {
    source = source || {};
    return {
      lineId: lineId,
      status: status,
      cause: source.cause || source.text || "",
      interval: source.interval || null,
      direction: source.direction || null,
      effect: source.effect || null,
      impacts: Array.isArray(source.impacts) ? source.impacts : [],
      serviceLevel: source.serviceLevel || null,
      resume: source.resume || null
    };
  }

  function _untranslatedOfficialText(text) {
    return '<div class="rs-cause-untranslated">'
      + '<div class="rs-text-muted">' + escapeHtml(t("status.translation_unavailable") || t("status.no_data")) + '</div>'
      + '<div class="rs-cause-original">' + escapeHtml(text) + '</div>'
      + '</div>';
  }

  // Non-Japanese UI renders the translated body only. The official Japanese
  // source is shown only when the local structured/template translator cannot
  // safely translate the free text.
  function _translatedText(text, lang, opts) {
    var safe = escapeHtml(text);
    if (lang === "ja" || !_needsJaTranslate(text)) return safe;
    if (!window.DelayTranslator) return _untranslatedOfficialText(text);
    var r = window.DelayTranslator.translate(text, opts || {}, lang);
    var tr = r && r.translated ? r.translated : "";
    if (!tr || _needsJaTranslate(tr)) {
      return _untranslatedOfficialText(text);
    }
    return '<div class="rs-cause-translated">' + escapeHtml(tr) + '</div>';
  }

  function _upgradeBodyTranslation(textEl, text, lang, opts, lineId) {
    if (!textEl || lang === "ja" || !_needsJaTranslate(text) || !window.DelayTranslator || typeof window.DelayTranslator.translateRemote !== "function") return;
    window.DelayTranslator.translateRemote(text, opts || {}, lang).then(function(r) {
      if (!r || r.provider !== "lingva" || !r.translated || _needsJaTranslate(r.translated)) return;
      if (_currentModalLine !== lineId || !document.body.contains(textEl)) return;
      textEl.innerHTML = '<div class="rs-cause-translated">' + escapeHtml(r.translated) + '</div>';
    }).catch(function(){});
  }

  function renderFilterBar(linesObj) {
    if (!_filterBar && window.OperatorFilterBar) {
      _filterBar = window.OperatorFilterBar.get("realtimeFilterBar") || window.OperatorFilterBar.mount("realtimeFilterBar");
      _filterBar.setSelected(_selectedOperator, false);
    }
    if (_filterBar) _filterBar.render(linesObj);
  }

  function setFilter(operator) {
    _selectedOperator = operator || null;
    if (_filterBar && _filterBar.getSelected() !== _selectedOperator) _filterBar.setSelected(_selectedOperator, false);
    var container = document.getElementById("realtimeStatusContainer");
    if (!container) return;
    if (!window.DataState.setOperatorVisibility(container, _selectedOperator)) {
      if (_latestLines) renderFiltered();
      return;
    }
    // Force the next live snapshot to reconcile the newly visible cards.
    // The former structure-signature call referenced a nonexistent function.
    _renderedStatusSignatures = {};
  }

  function getFilteredLines() {
    if (!_latestLines) return {};
    if (!_selectedOperator) return _latestLines;
    return window.DataState.filterLinesByOperator(_latestLines, _selectedOperator);
  }

  function statusSignature(line) {
    var d = getDelayInfo(line) || {};
    return [d.status || "loading", d.interval || "", JSON.stringify(d.impacts || []), d.cause || "", d.detail || "", d.source || ""].join("|");
  }

  function patchRealtimeCards(container, linesObj, changedIds) {
    if (!container || !changedIds || changedIds.length === 0) return true;
    var lineCard = window.LineCard;
    if (!lineCard || typeof lineCard.update !== "function" || typeof lineCard.updateSystem !== "function") return false;
    var needsFullRender = false;

    changedIds.forEach(function(lineId) {
      var line = linesObj[lineId];
      if (!line) { needsFullRender = true; return; }

      var card = container.querySelector('.rs-line-card[data-line="' + String(lineId).replace(/"/g, '\\"') + '"]');
      if (!card || card.classList.contains("rs-system-card")) {
        var systemCards = container.querySelectorAll(".rs-system-card[data-lines]");
        var systemCard = card && card.classList.contains("rs-system-card") ? card : null;
        if (!systemCard) {
          for (var i = 0; i < systemCards.length; i++) {
            var members = (systemCards[i].dataset.lines || "").split(",");
            if (members.indexOf(lineId) >= 0) { systemCard = systemCards[i]; break; }
          }
        }
        if (systemCard) {
          if (!lineCard.updateSystem(systemCard, linesObj, { mode: "realtime" })) needsFullRender = true;
          return;
        }
        if (!card) return;
        needsFullRender = true;
        return;
      }

      if (!lineCard.update(card, line, lineId, { mode: "realtime" })) needsFullRender = true;
    });
    return !needsFullRender;
  }

  function renderFiltered() {
    if (!_latestLines) return;
    var filtered = getFilteredLines();
    var container = document.getElementById("realtimeStatusContainer");
    if (!container) return;
    window.DataState.renderList(container, filtered, { mode: "realtime", lineOrder: _latestOrder || [] });
    // Keep the full operator choices available even when the selection has no lines.
    renderFilterBar(_latestLines);
  }

  var _renderedStatusSignatures = {};
  var _lastListStatusRefreshAt = 0;
  function scheduleListStatusRefresh(linesObj, force) {
    var now = Date.now();
    // RunInfoAPI itself caches results, but mapping every line to a Promise on
    // every DataFusion emission still creates avoidable main-thread churn.
    if (!force && now - _lastListStatusRefreshAt < 10000) return;
    _lastListStatusRefreshAt = now;
    refreshListStatuses(linesObj);
  }

  function reconcileRealtimeList(container, linesObj) {
    var _perfStart = (window.performance && performance.now) ? performance.now() : Date.now();
    var cards = container ? container.querySelectorAll(".rs-line-card") : [];
    if (!cards || cards.length === 0) {
      renderFiltered();
      _renderedStatusSignatures = {};
      return;
    }
    var changed = [];
    var next = {};
    var visibleLines = window.DataState.filterLinesByOperator(linesObj, _selectedOperator);
    Object.keys(visibleLines || {}).forEach(function(id) {
      next[id] = statusSignature(visibleLines[id]);
      if (_renderedStatusSignatures[id] !== next[id]) changed.push(id);
    });
    var oldIds = Object.keys(_renderedStatusSignatures);
    var structureChanged = oldIds.length !== Object.keys(next).length || oldIds.some(function(id) { return !next.hasOwnProperty(id); });
    if (structureChanged || !patchRealtimeCards(container, linesObj, changed)) renderFiltered();
    _renderedStatusSignatures = next;
    var _perfMs = (((window.performance && performance.now) ? performance.now() : Date.now()) - _perfStart);
    if (_perfMs >= 50 && window.console && console.warn) {
      console.warn("[PixelPerf] realtimeReconcile", Math.round(_perfMs * 10) / 10 + "ms", { changed: changed.length, structureChanged: structureChanged });
    }
  }

  function init() {
    const container = document.getElementById("realtimeStatusContainer");
    if (!container) return;

    // Mount the structural filter immediately. Data readiness only populates it;
    // it must not control whether the component exists at all.
    // Subscribe independently of the data loading lifecycle.
    var filterElement = document.getElementById("realtimeFilterBar");
    if (filterElement) filterElement.addEventListener("pt:operator-filter-change", function(event) {
      setFilter(event.detail && event.detail.operator);
    });

    renderFilterBar({});

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
       return null;
    }

    function render(refreshStatuses) {
      var fused = getLines();
      if (!fused || !fused.lines || Object.keys(fused.lines).length === 0) {
        window.DataState.renderPageState(container, "loading");
        return;
      }
      _latestLines = fused.lines;
      _latestOrder = fused.lineOrder || [];
      try {
        var visibleLines = getFilteredLines();
        renderLinesList(container, visibleLines, _latestOrder);
        renderFilterBar(fused.lines);
        // Initial/data-ready render may reconcile official status. Pure UI
        // changes (notably language switching) must not fan out into one
        // RunInfoAPI.query Promise per line.
        if (refreshStatuses !== false) scheduleListStatusRefresh(fused.lines, true);
      } catch (e) {
        window.DataState.renderPageState(container, "render_error");
      }
    }

    if (window.DataState && window.DataState.setPageStateRetry) {
      window.DataState.setPageStateRetry(container, function() {
        window.DataState.renderPageState(container, "loading");
        if (!window.DataLoader || typeof window.DataLoader.retry !== "function") {
          return Promise.reject(new Error("DataLoader retry unavailable"));
        }
        return window.DataLoader.retry().then(function() {
          render(true);
        });
      });
    }

    // Immediate check first
    render(true);

    // Canonical loader events are the sole startup lifecycle. DataState/DataFusion
    // render usable snapshots; loader failure terminates loading immediately.
    // Canonical railway data may arrive after the startup poll has already
    // terminated in an error/timeout state. Recover the list immediately from the
    // same canonical readiness signal instead of waiting for a later fusion emission.
    window.addEventListener("pt:railway-ready", function() {
      if (container.querySelector(".rs-line-card")) {
        if (!_latestLines) { var snapshot = getLines(); if (snapshot) _latestLines = snapshot.lines; }
        if (_latestLines) renderFilterBar(_latestLines);
        return;
      }
      render(true);
    });
    window.addEventListener("pt:railway-error", function() {
      if (container.querySelector(".rs-line-card")) return;
      window.DataState.renderPageState(container, navigator.onLine === false ? "offline" : "fetch_error");
    });

    // Subscribe to DataFusion updates for live status
    if (window.DataFusion) {
      window.DataFusion.subscribe(function(fusedData) {
        if (fusedData && fusedData.lines && Object.keys(fusedData.lines).length > 0) {
          _latestLines = fusedData.lines;
          _latestOrder = fusedData.lineOrder || [];
          // One DataFusion emission must cause at most one full list rebuild.
          // Previously selected-operator mode rendered the full list first and
          // immediately replaced it with the filtered list, doubling DOM work.
          // Live snapshots normally change only status/interval data. Keep
          // the operator/line shell mounted and patch affected cards in place.
          reconcileRealtimeList(container, _latestLines);
          renderFilterBar(_latestLines);
          scheduleListStatusRefresh(_latestLines, false);
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
        openModal(card.dataset.line, _latestLines, card.dataset.lineIdentity || "", (card.querySelector(".rs-line-name") || {}).textContent || "");
      }
    });
    if (typeof window.onLanguageChange === "function") {
      window.onLanguageChange(function() {
        // Language is presentation state. Rebuild card contents in place rather
        // than sending the page through render()/loading-style list replacement.
        if (_latestLines) {
          var ids = Object.keys(_latestLines);
          patchRealtimeCards(container, _latestLines, ids);
          renderFilterBar(_latestLines);
          setFilter(_selectedOperator);
        }
        if (_currentModalLine && _latestLines) {
          openModal(_currentModalLine, _latestLines, _currentModalIdentity, _currentModalTitle);
        }
      });
    }
    // v4.3.963: WebRunInfo 数据更新（自动抓取/手动输入）后重开弹窗
    document.addEventListener("pt-runinfo-updated", function() {
      if (_currentModalLine && _latestLines) {
        try { openModal(_currentModalLine, _latestLines, _currentModalIdentity); } catch(e) {}
      }
    });
  }
  init();
})();
