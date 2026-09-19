/*
 * Pixel Tetsudo - Train Location Page Controller
 * v4 - 从 railway_data.json 加载 stations/durations + line-control.js 元数据
 */
(function() {
  "use strict";
  var currentLine = null;
  var listEl = null;
  var detailEl = null;
  var titleEl = null;
  var filterBarEl = null;
  var mapEl = null;
  var backBtn = null;
  var _selectedOperator = null;
  var _lastPositionsHash = '';
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

  
  function showLineView(lineId) {
    try {
      var lines = getLinesData();
      var fusedLine = lines[lineId];
      if (!fusedLine) return;
      currentLine = lineId;
      window.location.hash = lineId;
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
            if (_sys2.lineIds && _sys2.lineIds.indexOf(lineId) >= 0) {
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
      // v4.3.528: 手动时刻表按需加载——ODPT 无数据的 JR 地方线打开时才注入该线文件。
      // 加载完成后 DataFusion 内部已重推定+重融合；此处按结果归属检查后重渲染当前线路，
      // 用户切走线路时旧结果不覆盖新状态；加载失败保持首次渲染（与无数据现状一致）。
      if (window.DataFusion && window.DataFusion.ensureManualTimetable) {
        window.DataFusion.ensureManualTimetable(lineId).then(function() {
          if (currentLine !== lineId) return;
          var fused2 = getLinesData()[lineId];
          if (fused2 && mapEl) renderTrainMap(mapEl, fused2, lineId);
        }).catch(function(e) {
          console.debug("[trains] manual timetable skip:", lineId, e.message);
        });
      }
    } catch(e) {}
  }

  function hideLineView() {
    try {
      currentLine = null;
      if (listEl) listEl.classList.remove("hidden");
      if (filterBarEl) filterBarEl.classList.remove("hidden");
      if (detailEl) detailEl.classList.add("hidden");
      renderFiltered(listEl);
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

  function renderList(el) {
    if (!el || !window.DataState) return;
    var lines = window.DataLayer ? window.DataLayer.getAllLines() : (window.UNIFIED_LINES || {});
    var ul = Array.isArray(lines) ? (function(){ var d={}; lines.forEach(function(l){ d[l.id||l.line_id]=l; }); return d; })() : lines;
    if (!ul || Object.keys(ul).length === 0) {
      // Sync loading animation with the realtime page (rs-loading spinner)
      el.innerHTML = '<div class="rs-loading"><div class="rs-loading-spinner"></div><span>' + t("trains.loading") + '</span></div>';
      return;
    }
    var lineOrder = (window.LinePresentationService && window.UNIFIED_LINES) ? window.LinePresentationService.getDisplayOrder(window.UNIFIED_LINES) : []; try { window.DataState.renderList(el, ul, { mode: "trains", lineOrder: lineOrder }); } catch(e) { el.innerHTML = "<div class=\"rs-error\">Render failed</div>"; }
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
      listEl.innerHTML = '<div class="rs-loading"><div class="rs-loading-spinner"></div><span>' + t("trains.loading") + '</span></div>';
      listEl.addEventListener("click", function(e) {
        // 支线 chip：从父线卡片进入支线详情（Line Hierarchy Rule）
        var chip = e.target.closest(".rs-branch-chip");
        if (chip && chip.dataset.line) {
          showLineView(chip.dataset.line);
          return;
        }
        var card = e.target.closest(".rs-line-card");
        if (card) showLineView(card.dataset.line);
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
      window.addEventListener("hashchange", function() {
        var h = (window.location.hash || "").replace(/^#/, "");
        if (!h) {
          hideLineView();
        } else if (h !== currentLine) {
          try { showLineView(h); } catch(e) {}
        }
      });
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
            if (++_tries > 120) return; // ~60s cap (mobile GitHub Pages can be slow)
            setTimeout(tick, 500);
          })();
        })();
        // Restore hash-based navigation (poll until line data is ready; async load timing)
        (function tryHash() {
          var hash = window.location.hash;
          if (!hash || hash.length <= 1) return;
          var lid = hash.substring(1);
          var lines = getLinesData();
          if (lines[lid]) {
            showLineView(lid);
            return;
          }
          setTimeout(tryHash, 400);
        })();
        if (backBtn) backBtn.textContent = "\u2190 " + t("line_map.back");
      });
      // Subscribe to DataState changes to handle late data loading
      if (window.DataState) {
        window.DataState.subscribe(function(lines, delayData, positions) {
          if (!lines || Object.keys(lines).length === 0 || !listEl) return;
          // Unified hash-restore: whenever line data is present, honor a #lineId deep link
          var _h3 = window.location.hash;
          if (_h3 && _h3.length > 1) {
            var _lid3 = _h3.substring(1);
            if (lines[_lid3] && (!currentLine || detailEl.classList.contains("hidden"))) {
              try { showLineView(_lid3); } catch(e) {}
            }
          }
          // Build hash of positions to detect changes (check both realtimePositions and cachedPositions)
          var posHash = '';
          try {
            var ids = Object.keys(lines);
            for (var i = 0; i < ids.length; i++) {
              var l = lines[ids[i]];
              var _pos = null;
              if (l && l.realtimePositions && l.realtimePositions.length > 0) {
                _pos = l.realtimePositions;
              } else if (l && l.cachedPositions && l.cachedPositions.length > 0) {
                _pos = l.cachedPositions;
              }
              if (_pos) {
                posHash += ids[i] + ":" + _pos.length + ":";
                for (var _pi = 0; _pi < _pos.length; _pi++) {
                  var _tp = _pos[_pi];
                  posHash += (_tp.trainId || ("t" + _pi)) + "@" + (_tp.stationIndex || 0) + ",";
                }
                posHash += ";";
              }
            }
          } catch(e) {}
          var currentLen = listEl.innerHTML.length;
          // Always render if list is empty (initial load), otherwise only render if positions changed
          if (currentLen === 0) {
            renderList(listEl);
            renderFilterBar(document.getElementById("trainsFilterBar"));
            _lastPositionsHash = posHash;
            // (through-service info now lives inside the train map interchange icons)
            // Restore hash-based navigation once data is ready (async load timing)
            var _h = window.location.hash;
            if (_h && _h.length > 1) {
              var _lid = _h.substring(1);
              var _lns = getLinesData();
              if (_lns[_lid] && (!currentLine || detailEl.classList.contains("hidden"))) {
                try { showLineView(_lid); } catch(e) {}
              }
            }
          } else if (posHash !== _lastPositionsHash) {
            _lastPositionsHash = posHash;
            renderList(listEl);
            // Restore hash-based navigation once data is ready (posHash changed = data arrived)
            var _h2 = window.location.hash;
            if (_h2 && _h2.length > 1) {
              var _lid2 = _h2.substring(1);
              var _lns2 = getLinesData();
              if (_lns2[_lid2] && (!currentLine || detailEl.classList.contains("hidden"))) {
                try { showLineView(_lid2); } catch(e) {}
              }
            }
            // (through-service info now lives inside the train map interchange icons)
            // Update train positions on map if detail view is open (incremental update for smooth animation)
            if (currentLine && detailEl && !detailEl.classList.contains("hidden")) {
              var _lines = getLinesData();
              var _fusedLine = _lines[currentLine];
              if (_fusedLine) renderTrainMap(mapEl, _fusedLine, currentLine);
            }
          }
        });
      }
      // Refresh filter bar, list, and line detail view on language switch
      if (typeof window.onLanguageChange === "function") {
        window.onLanguageChange(function() {
          renderFilterBar(document.getElementById("trainsFilterBar"));
          // Re-render list to update line names and operator titles (only if list is visible)
          if (listEl && detailEl && detailEl.classList.contains("hidden")) {
            renderList(listEl);
          }
          // Re-render line detail view if open
          if (currentLine && detailEl && !detailEl.classList.contains("hidden")) {
            showLineView(currentLine);
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
    var lines = window.DataLayer ? window.DataLayer.getAllLines() : (window.UNIFIED_LINES || {});
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
    if (container) renderFilterBar(container);
    if (listEl) renderFiltered(listEl);
  }

  function renderFiltered(el) {
    if (!el || !window.DataState) return;
    var allLines = getLinesData(); // dict: lineId -> line
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
    var lineOrder = (window.LinePresentationService && window.UNIFIED_LINES) ? window.LinePresentationService.getDisplayOrder(window.UNIFIED_LINES) : []; try { window.DataState.renderList(el, filtered, { mode: "trains", lineOrder: lineOrder }); } catch(e) { el.innerHTML = "<div class=\"rs-error\">Render failed</div>"; }
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
