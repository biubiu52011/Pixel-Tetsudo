/*
 * Pixel Tetsudo - Train Location Page Controller
 * v4 - 从 railway_data.json 加载 stations/durations + line-control.js 元数据
 */
(function() {
  "use strict";
  var currentLine = null;
  var currentLineIdentity = "";
  var listEl = null;
  var detailEl = null;
  var titleEl = null;
  var filterBarEl = null;
  var mapEl = null;
  var backBtn = null;
  var _selectedOperator = null;
  var _lastPositionsHash = '';
  var _lastDetailStateHash = '';
  var _realtimeExpiryTimer = null;
  var currentSystemLineIds = null;
  var t = window.t || function(k) { return k; };
  var escapeHtml = window.escapeHtml || function(s) {
    if (!s) return "";
    if (typeof s !== "string") return "";
    if (s.indexOf("&") < 0 && s.indexOf("<") < 0 && s.indexOf(">") < 0 && s.indexOf('"') < 0 && s.indexOf("'") < 0) return s;
    var d = document.createElement("div"); d.textContent = s; return d.innerHTML;
  };

  // === GEOM 设计令牌 → trains-config.js ===
  var GEOM = window.TrainsConfig.GEOM;

  // 色块徽章宽度（无图标线的统一徽章，v4.3.613）
  // v4.3.614: 徽章文字改线名（当前语言）而非记号——HAC 等记号普通用户看不懂，
  // 图片徽章内含线名可读，色块徽章同理显示线名（截 4 字）

  
  function _systemIdsForRoute(lineId) {
    if (!lineId || !window.LineOperationSystems) return null;
    for (var opKey in window.LineOperationSystems) {
      var systems = window.LineOperationSystems[opKey];
      if (!Array.isArray(systems)) continue;
      for (var si = 0; si < systems.length; si++) {
        var ids = systems[si] && systems[si].lineIds;
        // System-card routes are keyed by their first member (data-line=firstId).
        // Restore that exact LOS context for refresh/direct deep links without
        // turning secondary members or branch deep links into the parent system.
        if (Array.isArray(ids) && ids.length > 1 && ids[0] === lineId) return ids.slice();
      }
    }
    return null;
  }

  function _scheduleRealtimeExpiryRefresh(lineId, fusedLine) {
    if (_realtimeExpiryTimer) {
      clearTimeout(_realtimeExpiryTimer);
      _realtimeExpiryTimer = null;
    }
    if (!lineId || !fusedLine || !Array.isArray(fusedLine.realtimePositions)) return;
    var now = Date.now();
    var nextExpiry = 0;
    fusedLine.realtimePositions.forEach(function(p) {
      if (!p || p.positionSource !== "realtime-api" || !p.sourceValidUntil) return;
      var ts = Date.parse(p.sourceValidUntil);
      if (!isNaN(ts) && ts >= now && (!nextExpiry || ts < nextExpiry)) nextExpiry = ts;
    });
    if (!nextExpiry) return;
    // Re-render once immediately after the nearest ODPT dct:valid boundary.
    // The renderer will filter the expired realtime row even if no new API
    // snapshot has arrived yet.
    _realtimeExpiryTimer = setTimeout(function() {
      _realtimeExpiryTimer = null;
      if (currentLine !== lineId || !detailEl || detailEl.classList.contains("hidden")) return;
      var latest = getLinesData()[lineId];
      if (latest && mapEl) {
        renderTrainMap(mapEl, latest, lineId);
        _scheduleRealtimeExpiryRefresh(lineId, latest);
      }
    }, Math.max(50, nextExpiry - now + 50));
  }

  function showLineView(lineId, systemLineIds, expectedIdentity, expectedMemberIdentities) {
    if (Array.isArray(systemLineIds) && systemLineIds.length > 1) currentSystemLineIds = systemLineIds.slice();
    else if (systemLineIds === null) currentSystemLineIds = null;
    window.TrainsActiveSystemLineIds = currentSystemLineIds ? currentSystemLineIds.slice() : null;
    try {
      var lines = getLinesData();
      var fusedLine = lines[lineId];
      if (!fusedLine) return;
      var actualIdentity = (window.DataState && window.DataState.getLineIdentity) ? window.DataState.getLineIdentity(fusedLine, lineId) : "";
      expectedIdentity = expectedIdentity || "";
      if (expectedIdentity && actualIdentity && expectedIdentity !== actualIdentity) return;
      if (expectedMemberIdentities && Array.isArray(systemLineIds)) {
        var renderedMembers = String(expectedMemberIdentities).split("|");
        for (var _emi = 0; _emi < systemLineIds.length; _emi++) {
          var _elid = systemLineIds[_emi], _eline = lines[_elid];
          var _ekey = (window.DataState && window.DataState.getLineIdentity && _eline) ? window.DataState.getLineIdentity(_eline, _elid) : "";
          if (renderedMembers.indexOf(_elid + "=" + _ekey) < 0) return;
        }
      }
      // Route application is idempotent. DataState can emit several times while
      // the same line is open; those emissions must update the map through the
      // subscriber below, not re-enter the detail initialization path.
      if (currentLine === lineId && currentLineIdentity === actualIdentity &&
          detailEl && !detailEl.classList.contains("hidden")) return;
      currentLine = lineId;
      currentLineIdentity = actualIdentity;
      // Activate network work only after the user opens a line. Through-service
      // members are activated together so one physical run can remain continuous.
      if (window.ODPTClient && window.ODPTClient.activateRealtimeLines) {
        var _requestedLines = currentSystemLineIds && currentSystemLineIds.length
          ? currentSystemLineIds.slice() : [lineId];
        window.ODPTClient.activateRealtimeLines(_requestedLines).catch(function(e) {
          console.debug("[trains] on-demand realtime skip:", lineId, e && e.message);
        });
      }
      if (listEl) listEl.classList.add("hidden");
      if (filterBarEl) filterBarEl.classList.add("hidden");
      if (detailEl) detailEl.classList.remove("hidden");
      var _title = (window.RailwayDB && window.RailwayDB.resolveLineName ? window.RailwayDB.resolveLineName(lineId, window.currentLang) : (fusedLine.nameEn || fusedLine.nameJa || lineId));
      if (window.LineOperationSystems) {
        for (var _opKey2 in window.LineOperationSystems) {
          var _opSys2 = window.LineOperationSystems[_opKey2];
          if (!Array.isArray(_opSys2)) continue;
          var _found = false;
          for (var _si2 = 0; _si2 < _opSys2.length; _si2++) {
            var _sys2 = _opSys2[_si2];
            var _matchesActiveSystem = currentSystemLineIds && currentSystemLineIds.length > 1
              ? (_sys2.lineIds && _sys2.lineIds.length === currentSystemLineIds.length &&
                 currentSystemLineIds.every(function(_id) { return _sys2.lineIds.indexOf(_id) >= 0; }))
              : (_sys2.lineIds && _sys2.lineIds.indexOf(lineId) >= 0);
            if (_matchesActiveSystem) {
              var _lang2 = window.currentLang || "ja";
              if (_lang2 === "zh" && _sys2.nameZh) _title = _sys2.nameZh;
              else if (_lang2 === "en" && _sys2.nameEn) _title = _sys2.nameEn;
              else if (_lang2 === "ko" && _sys2.nameKo) _title = _sys2.nameKo;
              else if (_sys2.nameJa) _title = _sys2.nameJa;
              _found = true;
              break;
            }
          }
          if (_found) break;
        }
      }
      if (titleEl) titleEl.textContent = _title;
      if (mapEl) renderTrainMap(mapEl, fusedLine, lineId);
      _scheduleRealtimeExpiryRefresh(lineId, fusedLine);
      // v4.3.528: 手动时刻表按需加载——ODPT 无数据的 JR 地方线打开时才注入该线文件。
      // 加载完成后 DataFusion 内部已重推定+重融合；此处按结果归属检查后重渲染当前线路，
      // 用户切走线路时旧结果不覆盖新状态；加载失败保持首次渲染（与无数据现状一致）。
      if (window.DataFusion && window.DataFusion.ensureTimetable) {
        window.DataFusion.ensureTimetable(lineId).then(function(changed) {
          // Cached/missing manual data is a no-op. Its Promise resolving must not
          // cause a second map paint immediately after opening the detail.
          if (!changed || currentLine !== lineId) return;
          var fused2 = getLinesData()[lineId];
          if (fused2 && mapEl) {
            renderTrainMap(mapEl, fused2, lineId);
            _scheduleRealtimeExpiryRefresh(lineId, fused2);
          }
        }).catch(function(e) {
          console.debug("[trains] timetable fallback skip:", lineId, e.message);
        });
      }
    } catch(e) {}
  }

  function hideLineView() {
    try {
      currentLine = null;
      currentLineIdentity = "";
      if (_realtimeExpiryTimer) {
        clearTimeout(_realtimeExpiryTimer);
        _realtimeExpiryTimer = null;
      }
      currentSystemLineIds = null;
      window.TrainsActiveSystemLineIds = null;
      if (window.ODPTClient && window.ODPTClient.clearRealtimeLines) window.ODPTClient.clearRealtimeLines();
      if (listEl) listEl.classList.remove("hidden");
      if (filterBarEl) filterBarEl.classList.remove("hidden");
      if (detailEl) detailEl.classList.add("hidden");
      // The overview DOM was only hidden while detail was open. Do not rebuild
      // it on back navigation; preserve scroll position, filter state and cards.
      if (listEl) setFilter(_selectedOperator);
    } catch(e) {}
  }

  // ========== Load cached real-time positions from IndexedDB ==========
  function loadCachedPositions(callback) {
    try {
      if (window.RailwayRTC && window.RailwayRTC.loadPositions) {
        window.RailwayRTC.loadPositions().then(function(positions) {
          if (positions && Object.keys(positions).length > 0) {
            // Store cached positions in DataLayer
            if (window.DataLayer && window.DataLayer.setCachedPositions) {
              Object.keys(positions).forEach(function(lid) {
                if (positions[lid] && positions[lid].length > 0) {
                  window.DataLayer.setCachedPositions(lid, positions[lid]);
                }
              });
            } else {
              // Compat fallback: merge into UNIFIED_LINES
              var ul = window.UNIFIED_LINES;
              if (ul) {
                Object.keys(positions).forEach(function(lid) {
                  if (ul[lid] && positions[lid].length > 0) {
                    ul[lid].cachedPositions = positions[lid];
                  }
                });
              }
            }
          }
          if (callback) callback();
        }).catch(function(e) { console.warn("[trains] Cache load error:", e.message); if (callback) callback(); });
      } else {
        if (callback) callback();
      }
    } catch(e) { if (callback) callback(); }
  }

  function renderList(el, linesSnapshot) {
    if (!el || !window.DataState) return;
    // Once DataState emits a canonical snapshot, render that exact snapshot.
    // getLinesData() remains startup fallback only; mixing the two inside one
    // notification caused the first render to differ from a later filter render.
    var ul = linesSnapshot || getLinesData();
    if (!ul || Object.keys(ul).length === 0) {
      // Sync loading animation with the realtime page (rs-loading spinner)
      window.DataState.renderPageState(el, "loading");
      return;
    }
    var lineOrder = (window.LinePresentationService && window.UNIFIED_LINES) ? window.LinePresentationService.getDisplayOrder(window.UNIFIED_LINES) : []; try { window.DataState.renderList(el, ul, { mode: "trains", lineOrder: lineOrder }); } catch(e) { window.DataState.renderPageState(el, "render_error"); }
  }

  function init() {
    try {
      listEl = document.getElementById("trainsLineListContent");
      detailEl = document.getElementById("trainsDetailView");
      titleEl = document.getElementById("trainsDetailTitle");
      mapEl = document.getElementById("trainsMapContainer");
      filterBarEl = document.getElementById("trainsFilterBar");
      backBtn = document.getElementById("trainsBackBtn");
      if (!listEl) return;
      // Sync loading animation with the realtime page (rs-loading spinner)
      window.DataState.renderPageState(listEl, "loading");
      listEl.addEventListener("click", function(e) {
        // 支线 chip：从父线卡片进入支线详情（Line Hierarchy Rule）
        var chip = e.target.closest(".rs-branch-chip");
        if (chip && chip.dataset.line) {
          window.location.hash = chip.dataset.line;
          return;
        }
        var card = e.target.closest(".rs-line-card");
        if (card && card.dataset.line) {
          window.location.hash = card.dataset.line;
        }
      });
      if (backBtn) {
        backBtn.addEventListener("click", function() {
          // v4.3.556: 统一回到线路一览（用户："所有返回统一回到一览"）——
          // 反转 4.3.552 纯退回（history.back()）：清 hash 触发 hashchange 兜底
          // hideLineView()，无论从哪进入详情（列表/主页/上一详情/直开），
          // 点返回一律回到线路一览页。
          window.location.hash = "";
        });
      }
      // hash 路由兜底：history.back() 后 hash 变化时恢复对应视图
      // （与 tourism 详情页的 history.back() 行为同步，避免页内返回后停留在详情）
      function _applyRoute() {
        var h = (window.location.hash || "").replace(/^#/, "");
        if (!h) {
          if (currentLine || (detailEl && !detailEl.classList.contains("hidden"))) hideLineView();
          return false;
        }
        var lines = getLinesData();
        if (!lines || !lines[h]) return false;
        if (h === currentLine && detailEl && !detailEl.classList.contains("hidden")) return true;
        try { showLineView(h, _systemIdsForRoute(h)); return true; } catch(e) { return false; }
      }
      window.addEventListener("hashchange", _applyRoute);
      loadCachedPositions(function() {
        renderList(listEl);
        renderFilterBar(document.getElementById("trainsFilterBar"));
        // Data-ready poll: db-loader fetch is async; the first render may run before
        // network data arrives (IndexedDB positions usually resolve first), leaving the
        // list empty with no later re-render trigger. Same pattern as the realtime page.
        // Respect an already-selected operator filter instead of overwriting it.
        (function ensureDataReady() {
          var _tries = 0;
          (function tick() {
            var _d = getLinesData();
            if (_d && Object.keys(_d).length > 0) {
              if (_selectedOperator === null) { renderList(listEl); } else { renderFiltered(listEl); }
              renderFilterBar(document.getElementById("trainsFilterBar"));
              return;
            }
            if (++_tries > 120) {
              // Match realtime page state semantics: loading must terminate in a
              // visible error state instead of leaving an endless spinner.
              if (!listEl.querySelector(".rs-line-card")) {
                window.DataState.renderPageState(listEl, "error");
              }
              return;
            } // ~60s cap (mobile GitHub Pages can be slow)
            setTimeout(tick, 500);
          })();
        })();
        // Route restoration is centralized in _applyRoute; this one bounded poll
        // only waits for initial async data and cannot initialize the detail twice.
        (function waitForInitialRoute() {
          var attempts = 0;
          (function tick() {
            if (_applyRoute()) return;
            if (window.location.hash && ++attempts < 25) setTimeout(tick, 400);
          })();
        })();
        // Arrow is structural UI; only the nested label is translated by lang-init.
      });
      // Subscribe to DataState changes to handle late data loading
      if (window.DataState) {
        window.DataState.subscribe(function(lines, delayData, positions) {
          if (!lines || Object.keys(lines).length === 0 || !listEl) return;
          // A pending deep link may become resolvable when data arrives.
          _applyRoute();
          // The trains overview is structural (operator/line/termini) and does not
          // render live train positions. Do not scan every line/train on each DataState
          // emission just to decide whether to rebuild the overview. Position change
          // detection is scoped to the currently open detail line below.
          var posHash = '';
          if (currentLine && lines[currentLine]) {
            try {
              var _cl = lines[currentLine];
              var _pos = (_cl.realtimePositions && _cl.realtimePositions.length > 0)
                ? _cl.realtimePositions : (_cl.cachedPositions || []);
              posHash = currentLine + ":" + _pos.length + ":";
              for (var _pi = 0; _pi < _pos.length; _pi++) {
                var _tp = _pos[_pi];
                posHash += (_tp.runningChainId || _tp.trainId || ("t" + _pi)) + "@"
                  + (_tp.stationIndex || 0) + ">"
                  + (_tp.segmentToIndex == null ? "" : _tp.segmentToIndex) + ":"
                  + (_tp.segmentProgress == null ? "" : Math.round(_tp.segmentProgress * 100)) + ":"
                  + (_tp.sourceUpdatedAt || "") + ":"
                  + (_tp.sourceValidUntil || "") + ":"
                  + (_tp.positionSource || "") + ":"
                  + (_tp.estimated === true ? "estimated" : "observed") + ","
                  ;
              }
            } catch(e) {}
          }
          // Detail rendering also depends on non-position state (delay/status,
          // through/branch relation context and fused line metadata). A position-only
          // hash left the detail SVG stale after a transient state removed an element:
          // when the state recovered without train movement, no render was triggered.
          var detailStateHash = '';
          if (currentLine && lines[currentLine]) {
            try {
              var _dl = lines[currentLine];
              var _dd = _dl.delayInfo || {};
              var _cm = _dl._chainMeta || {};
              detailStateHash = JSON.stringify({
                id: currentLine,
                identity: currentLineIdentity,
                status: _dl.status || '',
                interval: _dl.interval || '',
                cause: _dl.cause || '',
                delayStatus: _dd.status || '',
                delay: _dd.maxDelay == null ? '' : _dd.maxDelay,
                delayCause: _dd.cause || '',
                chain: _cm.identity || _cm.runningChainId || '',
                related: _cm.relatedLines || [],
                through: _cm.isThroughService || false,
                branch: _cm.isBranch || false,
                alias: _cm.isAlias || false
              });
            } catch(e) {}
          }
          var currentLen = listEl.innerHTML.length;
          // Always render if list is empty (initial load), otherwise render list on
          // position changes; detail additionally reacts to its state signature.
          if (currentLen === 0) {
            if (_selectedOperator === null) {
              renderList(listEl, lines);
            } else {
              renderFiltered(listEl, lines);
            }
            renderFilterBar(document.getElementById("trainsFilterBar"));
            _lastPositionsHash = posHash;
            _lastDetailStateHash = detailStateHash;
            // Route restoration is handled once at subscriber entry.
          } else if (posHash !== _lastPositionsHash || detailStateHash !== _lastDetailStateHash) {
            var _positionsChanged = posHash !== _lastPositionsHash;
            var _detailStateChanged = detailStateHash !== _lastDetailStateHash;
            _lastPositionsHash = posHash;
            _lastDetailStateHash = detailStateHash;
            // Live position changes only affect the open detail map. The overview
            // cards contain no train-position content, so rebuilding the full list here
            // is pure DOM churn.
            // (through-service info now lives inside the train map interchange icons)
            // Update train positions on map if detail view is open (incremental update for smooth animation)
            if (currentLine && detailEl && !detailEl.classList.contains("hidden")) {
              var _lines = getLinesData();
              var _fusedLine = _lines[currentLine];
              if (_fusedLine) {
                renderTrainMap(mapEl, _fusedLine, currentLine);
                _scheduleRealtimeExpiryRefresh(currentLine, _fusedLine);
              }
            }
          }
        });
      }
      // Language changes are presentation-only. Preserve the mounted overview
      // and its scroll/filter state; refresh individual cards/groups in place.
      if (typeof window.onLanguageChange === "function") {
        window.onLanguageChange(function() {
          renderFilterBar(document.getElementById("trainsFilterBar"));
          if (listEl && detailEl && detailEl.classList.contains("hidden")) {
            var _scrollY = window.scrollY || window.pageYOffset || 0;
            var _oldGroups = listEl.querySelectorAll(".rs-operator-group[data-operator]");
            var _freshHost = document.createElement("div");
            var _linesNow = getLinesData();
            if (_linesNow && Object.keys(_linesNow).length) {
              var _orderNow = (window.LinePresentationService && window.UNIFIED_LINES) ? window.LinePresentationService.getDisplayOrder(window.UNIFIED_LINES) : [];
              window.DataState.renderList(_freshHost, _linesNow, { mode: "trains", lineOrder: _orderNow });
              var _freshGroups = _freshHost.querySelectorAll(".rs-operator-group[data-operator]");
              var _freshByOp = {};
              Array.prototype.slice.call(_freshGroups).forEach(function(g) { _freshByOp[g.getAttribute("data-operator") || ""] = g; });
              Array.prototype.slice.call(_oldGroups).forEach(function(g) {
                var op = g.getAttribute("data-operator") || "";
                if (_freshByOp[op]) g.replaceWith(_freshByOp[op]);
              });
              setFilter(_selectedOperator);
              if (_scrollY) window.scrollTo(0, _scrollY);
            }
          }
        });
      }
    } catch(e) {}
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

  function renderFilterBar(container) {
    if (!container) return;
    var lines = (window.DataLayer && window.DataLayer.getAllLines) ? window.DataLayer.getAllLines() : {};
    var ops = {};
    if (Array.isArray(lines)) {
      lines.forEach(function(l) { if (l.operator) ops[l.operator] = true; });
    } else {
      Object.keys(lines).forEach(function(id) {
        var line = lines[id];
        if (line && line.operator) ops[line.operator] = true;
      });
    }
    var opList = sortOperators(Object.keys(ops));
    var html = '';
    var allLabel = (typeof window.t === "function" && window.t("filter.all")) ? window.t("filter.all") : "All";
    html += '<button class="rs-filter-btn' + (_selectedOperator === null ? ' active' : '') + '" data-operator="">' + allLabel + '</button>';
    opList.forEach(function(op) {
      var label = (typeof window.t === "function" && window.t("op." + op)) ? window.t("op." + op) : op;
      html += '<button class="rs-filter-btn' + (_selectedOperator === op ? ' active' : '') + '" data-operator="' + op + '">' + label + '</button>';
    });
    container.innerHTML = html;
    container.querySelectorAll('.rs-filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { setFilter(btn.dataset.operator || null); });
    });
  }

  function setFilter(op) {
    _selectedOperator = op;
    var container = document.getElementById('trainsFilterBar');
    // Filtering is a view-state change, not a data lifecycle event. Keep the
    // existing cards/SVG-ready DOM alive and only toggle the relevant operator
    // groups. Rebuilding both the filter bar and full line list made every click
    // look and feel like an initial page load.
    if (container) {
      Array.prototype.slice.call(container.querySelectorAll('.rs-filter-btn')).forEach(function(btn) {
        btn.classList.toggle('active', (btn.dataset.operator || null) === _selectedOperator);
      });
    }
    if (listEl) {
      var groups = listEl.querySelectorAll('.rs-operator-group[data-operator]');
      if (groups.length) {
        Array.prototype.slice.call(groups).forEach(function(group) {
          var groupOp = group.getAttribute('data-operator') || '';
          var visible = !_selectedOperator || groupOp === _selectedOperator ||
            (_selectedOperator === "JR-East" && groupOp === "JR-East");
          group.classList.toggle('hidden', !visible);
        });
      } else {
        // Compatibility fallback for DOM rendered before data-operator existed.
        renderFiltered(listEl);
      }
    }
  }

  function renderFiltered(el, linesSnapshot) {
    if (!el || !window.DataState) return;
    var allLines = linesSnapshot || getLinesData(); // dict: lineId -> line
    var filtered = allLines;
    if (_selectedOperator) {
      filtered = {};
      Object.keys(allLines).forEach(function(id) {
        var _ln = allLines[id];
        if (_ln && (_selectedOperator === "JR-East"
          ? (window.TransitConstants && window.TransitConstants.isJRERoute ? window.TransitConstants.isJRERoute(_ln) : _ln.operator === "JR-East")
          : _ln.operator === _selectedOperator)) {
          filtered[id] = allLines[id];
        }
      });
    }
    if (!filtered || Object.keys(filtered).length === 0) { el.innerHTML = ''; return; }
    var lineOrder = (window.LinePresentationService && window.UNIFIED_LINES) ? window.LinePresentationService.getDisplayOrder(window.UNIFIED_LINES) : []; try { window.DataState.renderList(el, filtered, { mode: "trains", lineOrder: lineOrder }); } catch(e) { window.DataState.renderPageState(el, "render_error"); }
  }
  window.TrainsPage = {
    init: init,
    refreshUI: function() { renderList(listEl); },
    showLineView: showLineView,
    hideLineView: hideLineView
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
