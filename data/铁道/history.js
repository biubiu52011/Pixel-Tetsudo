/** * Pixel Tetsudo - Search History Module * Saves and displays search history in localStorage */(function() {  'use strict';  const STORAGE_KEY = 'pixel_tetsudo_search_history';  const MAX_HISTORY = 50;  function getHistory() {    try {      const data = localStorage.getItem(STORAGE_KEY);      return data ? JSON.parse(data) : [];    } catch (e) {      return [];    }  }  function saveToHistory(from, to, result) {    const history = getHistory();    const rid = window.RailwayDB ? window.RailwayDB.resolveStationName : null;
    const lang = window.currentLang || 'ja';
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
    };    history.unshift(entry);    if (history.length > MAX_HISTORY) {      history.pop();    }    try {      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));    } catch (e) {      console.warn('[History] Failed to save:', e);    }    return entry;  }  function clearHistory() {    localStorage.removeItem(STORAGE_KEY);    renderHistory();  }  function removeEntry(id) {    const history = getHistory();    const filtered = history.filter(e => e.id !== id);    try {      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));    } catch (e) {      console.warn('[History] Failed to delete:', e);    }    renderHistory();  }  function formatTime(isoString, t) {    const date = new Date(isoString);    const now = new Date();    const diff = now - date;    var lang = window.currentLang || 'ja';        if (diff < 60000) return t('history.just_now');    if (diff < 3600000) return Math.floor(diff / 60000) + ' ' + t('unit.minute') + ' ' + t('time.ago');    if (diff < 86400000) return Math.floor(diff / 3600000) + ' ' + t('unit.hour') + ' ' + t('time.ago');    return date.toLocaleDateString(lang === 'ja' ? 'ja-JP' : lang === 'zh' ? 'zh-CN' : lang === 'ko' ? 'ko-KR' : 'en-US');  }  function renderHistory() {    const container = document.getElementById('tab-history');    if (!container) return;    const history = getHistory();    const t = window.t || function(key) { return key; };    if (history.length === 0) {      container.innerHTML = '<div class="history-empty">' + t('history.empty') + '</div>';      return;    }    let html = '<div class="history-container">';    html += '<div class="history-header">';    html += '<h3>' + t('history.title') + '</h3>';    html += '<button class="history-clear-btn" id="clearHistoryBtn">' + t('history.clear') + '</button>';    html += '</div>';    history.forEach(function(entry) {      const timeStr = formatTime(entry.timestamp, t);      const lines = entry.lineInfo ? [...new Set(entry.lineInfo.flat())].join(', ') : '';            html += '<div class="history-entry" data-id="' + entry.id + '">';      html += '<div class="history-route">';      html += '<span class="history-from">' + escapeHtml(window.RailwayDB ? window.RailwayDB.resolveStationName(entry.from, window.currentLang) || entry.from : entry.from) + '</span>';      html += '<span class="history-arrow">→</span>';      html += '<span class="history-to">' + escapeHtml(window.RailwayDB ? window.RailwayDB.resolveStationName(entry.to, window.currentLang) || entry.to : entry.to) + '</span>';      html += '</div>';      html += '<div class="history-meta">';      if (entry.durationMin > 0) {        html += '<span class="history-duration">' + entry.durationMin + ' ' + t('unit.minute') + '</span>';      }      if (lines) {        html += '<span class="history-lines">' + escapeHtml(lines) + '</span>';      }      html += '<span class="history-time">' + timeStr + '</span>';      html += '<button class="history-delete-btn" data-id="' + entry.id + '">✕</button>';      html += '</div>';      html += '</div>';    });    html += '</div>';    container.innerHTML = html;    // Bind events using delegation - only once per container    if (!container.dataset.eventsBound) {      container.dataset.eventsBound = '1';      container.addEventListener('click', function(e) {        var clearBtn = e.target.closest('.history-clear-btn');        if (clearBtn) {          clearHistory();          return;        }        var delBtn = e.target.closest('.history-delete-btn');        if (delBtn) {          e.stopPropagation();          removeEntry(parseInt(delBtn.dataset.id));
          return;
        }
        var entry = e.target.closest('.history-entry');
        if (entry) {
          var id = parseInt(entry.dataset.id);
          var hist = getHistory();
          var item = hist.find(function(e) { return e.id === id; });
          if (item) {
            window.location.href = 'home.html?from=' + encodeURIComponent(item.from) + '&to=' + encodeURIComponent(item.to);
          }
        }
      });         if (item) {
            window.location.href = 'home.html?from=' + encodeURIComponent(item.from) + '&to=' + encodeURIComponent(item.to);
          }
        }
      });  }  }  function init() {    renderHistory();    // Intercept SearchUI results    const originalPerformSearch = window.SearchUI ? window.SearchUI.performSearch : null;    if (originalPerformSearch) {      window.SearchUI.performSearch = function() {        const result = originalPerformSearch.apply(this, arguments);        // Save to history after a short delay to capture the result        // Store result for history capture
        var _searchResult = result;
        setTimeout(() => {          const from = this.fromInput ? this.fromInput.value.trim() : '';          const to = this.toInput ? this.toInput.value.trim() : '';          if (from && to) {
            // P2-1: Skip saving if search failed
            if (_searchResult && _searchResult.error) { return; }
            const history = getHistory();
            const lastEntry = history[0];
            // P2-2: Dedup by resolved station_id
            const rid = window.RailwayDB ? window.RailwayDB.resolveStationName : null;
            const lang = window.currentLang || 'ja';
            const dfrom = rid ? (rid(from, lang) || from) : from;
            const dto = rid ? (rid(to, lang) || to) : to;
            // Use fromId/toId for dedup if available, fallback to resolved names
            const lastFrom = lastEntry && lastEntry.fromId ? lastEntry.fromId : (rid ? (rid(lastEntry.from, lang) || lastEntry.from) : lastEntry.from);
            const lastTo = lastEntry && lastEntry.toId ? lastEntry.toId : (rid ? (rid(lastEntry.to, lang) || lastEntry.to) : lastEntry.to);
            if (!lastEntry || lastFrom !== dfrom || lastTo !== dto) {
              saveToHistory(from, to, _searchResult);
              renderHistory();
            }
          }        }, 100);        // Store result for history capture
        this._lastSearchResult = result;
        return result;      };    }    if (typeof window.onLanguageChange === "function") { window.onLanguageChange(() => renderHistory()); }  }  function getRecentRoutes(n) {
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
    var lang = window.currentLang || 'ja';
    if (db && db.resolveStationName) {
      var fromName = db.resolveStationName(fromId, lang) || fromId;
      var toName = db.resolveStationName(toId, lang) || toId;
      if (window.SearchUI.fromInput) window.SearchUI.fromInput.value = fromName;
      if (window.SearchUI.toInput) window.SearchUI.toInput.value = toName;
      if (window.SearchUI.fromInput) window.SearchUI.fromInput.dispatchEvent(new Event('input'));
      if (window.SearchUI.toInput) window.SearchUI.toInput.dispatchEvent(new Event('input'));
    }
  }
  window.SearchHistory = {    init: init,    getHistory: getHistory,    saveToHistory: saveToHistory,    clearHistory: clearHistory,    removeEntry: removeEntry,    renderHistory: renderHistory,    getRecentRoutes: getRecentRoutes,    restoreFromRecent: restoreFromRecent  };  if (document.readyState === 'loading') {    document.addEventListener('DOMContentLoaded', () => SearchHistory.init());  } else {    SearchHistory.init();  }})();