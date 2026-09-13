/**
 * Pixel Tetsudo - Search History Module
 * Saves and displays search history in localStorage
 */
(function() {
  "use strict";

  const STORAGE_KEY = "pixel_tetsudo_search_history";
  const MAX_HISTORY = 50;

  function getHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveToHistory(from, to, result) {
    const history = getHistory();
    const rid = window.RailwayDB ? window.RailwayDB.resolveStationName : null;
    const lang = window.currentLang || "ja";
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      from: from,
      to: to,
      fromId: rid ? rid(from, lang) : from,
      toId: rid ? rid(to, lang) : to,
      fromName: rid ? (rid(from, lang) || from) : from,
      toName: rid ? (rid(to, lang) || to) : to,
      durationMin: result ? result.durationMin : 0,
      path: result ? result.path : [],
      lineInfo: result ? result.lineInfo : []
    };
    history.unshift(entry);
    if (history.length > MAX_HISTORY) {
      history.pop();
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn("[History] Failed to save:", e);
    }
    renderHistory();
    return entry;
  }

  function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
    renderHistory();
  }

  function removeEntry(id) {
    const history = getHistory();
    const filtered = history.filter(function(e) { return e.id !== id; });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.warn("[History] Failed to delete:", e);
    }
    renderHistory();
  }

  function escapeHtml(s) {
    if (!s) return "";
    if (typeof s !== "string") return "";
    if (s.indexOf("&") < 0 && s.indexOf("<") < 0 && s.indexOf(">") < 0 && s.indexOf('"') < 0 && s.indexOf("'") < 0) return s;
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function formatTime(isoString, t) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;
    var lang = window.currentLang || "ja";
    if (diff < 60000) return t("history.just_now");
    if (diff < 3600000) return Math.floor(diff / 60000) + " " + t("unit.minute") + " " + t("time.ago");
    if (diff < 86400000) return Math.floor(diff / 3600000) + " " + t("unit.hour") + " " + t("time.ago");
    return date.toLocaleDateString(lang === "ja" ? "ja-JP" : lang === "zh" ? "zh-CN" : lang === "ko" ? "ko-KR" : "en-US");
  }

  function renderHistory() {
    const container = document.getElementById("tab-history");
    if (!container) return;
    const history = getHistory();
    const t = window.t || function(key) { return key; };

    if (history.length === 0) {
      container.innerHTML = '<div class="history-empty">' + t("history.empty") + "</div>";
      return;
    }

    let html = '<div class="history-container">';
    html += '<div class="history-header">';
    html += "<h3>" + t("history.title") + "</h3>";
    html += '<button class="history-clear-btn" id="clearHistoryBtn">' + t("history.clear") + "</button>";
    html += "</div>";

    history.forEach(function(entry) {
      const timeStr = formatTime(entry.timestamp, t);
      const _lang = window.currentLang || "ja";
      // 4.3.560: lineInfo 为对象数组 [{from,to,lines:[...]}]，flat() 不展开对象导致 [object Object]
      // 修复：提取每条记录的 lines 数组（兼容纯字符串数组的旧数据）
      function _extractLines(lineInfo) {
        var out = [];
        if (!Array.isArray(lineInfo)) return out;
        lineInfo.forEach(function(x) {
          if (x && Array.isArray(x.lines)) out = out.concat(x.lines);
          else if (typeof x === "string") out.push(x);
        });
        return out;
      }
      // 4.3.592: lineInfo.lines 存 lineId；旧历史条目（4.3.592 前）存 line.name——
      // name 字段不一致（UtsunomiyaJR.name="Utsunomiya Line" 等英文名），resolveLineName
      // 查不到会原样返回英文。反查 name→ID 兜底后再解析。
      function _resolveLineIdOrName(lid, lang) {
        var nm = (window.RailwayDB && window.RailwayDB.resolveLineName) ? window.RailwayDB.resolveLineName(lid, lang) : lid;
        if (nm !== lid) return nm;
        // resolveLineName 原样返回（未知 ID）——若输入是某线的 name 字段，反查为 ID
        if (window.RailwayDB && window.RailwayDB.getLine && !window.RailwayDB.getLine(lid)) {
          var all = (window.RailwayDB.getAllLines && window.RailwayDB.getAllLines()) || {};
          for (var _k in all) {
            var _l = all[_k];
            if (_l && (_l.name === lid || _l.nameEn === lid || _l.nameJa === lid)) {
              var _r = window.RailwayDB.resolveLineName(_k, lang);
              if (_r && _r !== _k) { nm = _r; break; }
            }
          }
        }
        return nm;
      }
      const lines = entry.lineInfo ? [...new Set(_extractLines(entry.lineInfo))].map(function(lid){ return _resolveLineIdOrName(lid, _lang); }).join(", ") : "";

      html += '<div class="history-entry" data-id="' + entry.id + '">';
      html += '<div class="history-route">';
      html += '<span class="history-from">' + escapeHtml(window.RailwayDB ? window.RailwayDB.resolveStationName(entry.from, window.currentLang) || entry.from : entry.from) + "</span>";
      html += '<span class="history-arrow">→</span>';
      html += '<span class="history-to">' + escapeHtml(window.RailwayDB ? window.RailwayDB.resolveStationName(entry.to, window.currentLang) || entry.to : entry.to) + "</span>";
      html += "</div>";
      html += '<div class="history-meta">';
      if (entry.durationMin > 0) {
        html += '<span class="history-duration">' + entry.durationMin + " " + t("unit.minute") + "</span>";
      }
      if (lines) {
        html += '<span class="history-lines">' + escapeHtml(lines) + "</span>";
      }
      html += '<span class="history-time">' + timeStr + "</span>";
      html += '<button class="history-delete-btn" data-id="' + entry.id + '">✕</button>';
      html += "</div>";
      html += "</div>";
    });

    html += "</div>";
    container.innerHTML = html;

    // Bind events using delegation - only once per container
    if (!container.dataset.eventsBound) {
      container.dataset.eventsBound = "1";
      container.addEventListener("click", function(e) {
        var clearBtn = e.target.closest(".history-clear-btn");
        if (clearBtn) {
          clearHistory();
          return;
        }
        var delBtn = e.target.closest(".history-delete-btn");
        if (delBtn) {
          e.stopPropagation();
          removeEntry(parseInt(delBtn.dataset.id));
          return;
        }
        var entryEl = e.target.closest(".history-entry");
        if (entryEl && entryEl.classList.contains("rs-loading")) return;
        if (entryEl) {
          var id = parseInt(entryEl.dataset.id);
          var hist = getHistory();
          var item = hist.find(function(e) { return e.id === id; });
          if (!item) { console.warn("[History] Item not found:", id); return; }
          if (item) {
            entryEl.classList.add("rs-loading");
            setTimeout(function() {
              window.location.href = "home.html?from=" + encodeURIComponent(item.from) + "&to=" + encodeURIComponent(item.to);
            }, 150);
          }
        }
      });
    }
  }

  function init() {
    renderHistory();

    // NOTE (4.3.557): search persistence is now done inside SearchUI.performSearch
    // -> SearchHistory.saveToHistory (single Provider -> Consumer path). The old
    // monkey-patch below wrapped window.SearchUI.performSearch, which is the
    // constructor property, while real calls run through SearchUI.prototype.
    // performSearch — so it never fired and search history stayed empty. It has
    // been removed rather than kept as dead code.

    if (typeof window.onLanguageChange === "function") {
      window.onLanguageChange(function() { renderHistory(); });
    }
  }

  function getRecentRoutes(n) {
    n = n || 5;
    const history = getHistory();
    return history.slice(0, n).map(function(e) {
      return {
        fromId: e.fromId || e.from,
        toId: e.toId || e.to,
        fromName: e.fromName || e.from,
        toName: e.toName || e.to,
        durationMin: e.durationMin || 0,
        timestamp: e.timestamp
      };
    });
  }

  function restoreFromRecent(fromId, toId) {
    if (!window.SearchUI) return;
    var db = window.RailwayDB;
    var lang = window.currentLang || "ja";
    if (db && db.resolveStationName) {
      var fromName = db.resolveStationName(fromId, lang) || fromId;
      var toName = db.resolveStationName(toId, lang) || toId;
      if (window.SearchUI.fromInput) {
        window.SearchUI.fromInput.value = fromName;
        window.SearchUI.fromInput.setAttribute("data-station-id", fromId || "");
      }
      if (window.SearchUI.toInput) {
        window.SearchUI.toInput.value = toName;
        window.SearchUI.toInput.setAttribute("data-station-id", toId || "");
      }

      if (window.SearchUI.fromInput) window.SearchUI.fromInput.dispatchEvent(new Event("input"));
      if (window.SearchUI.toInput) window.SearchUI.toInput.dispatchEvent(new Event("input"));
    }
  }

  window.SearchHistory = {
    init: init,
    getHistory: getHistory,
    saveToHistory: saveToHistory,
    clearHistory: clearHistory,
    removeEntry: removeEntry,
    renderHistory: renderHistory,
    getRecentRoutes: getRecentRoutes,
    restoreFromRecent: restoreFromRecent
  };

  // v4.3.592: 除 window.t 外还需等 RailwayDB 数据就绪（DataLoader.isLoaded）——
  // 原实现只等 translations，db 异步加载完成前渲染会把站名/线路名解析成 ID/英文
  // （resolveLineName 对未知 ID 原样返回）。db 加载失败或超时（15s）也放行兜底。
  function safeInit(tries) {
    tries = tries || 0;
    var dbReady = !!(window.DataLoader && window.DataLoader.isLoaded && window.DataLoader.isLoaded());
    var dbErr = !!(window.DataLoader && window.DataLoader.getError && window.DataLoader.getError());
    if (typeof window.t === "function" && (dbReady || dbErr || tries > 300)) {
      SearchHistory.init();
    } else {
      setTimeout(function() { safeInit(tries + 1); }, 50);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", safeInit);
  } else {
    safeInit();
  }
})();

