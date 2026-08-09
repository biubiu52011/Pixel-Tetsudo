/**
 * Pixel Tetsudo - Search History Module
 * Saves and displays search history in localStorage
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'pixel_tetsudo_search_history';
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
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      from: from,
      to: to,
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
      console.warn('[History] Failed to save:', e);
    }
    return entry;
  }

  function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
    renderHistory();
  }

  function removeEntry(id) {
    const history = getHistory();
    const filtered = history.filter(e => e.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.warn('[History] Failed to delete:', e);
    }
    renderHistory();
  }

  function formatTime(isoString, t) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return t('history.just_now');
    if (diff < 3600000) return Math.floor(diff / 60000) + ' ' + t('unit.minute') + ' 前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' ' + t('unit.hour') + ' 前';
    return date.toLocaleDateString(window.currentLang === 'ja' ? 'ja-JP' : window.currentLang === 'zh' ? 'zh-CN' : window.currentLang === 'ko' ? 'ko-KR' : 'en-US');
  }

  function renderHistory() {
    const container = document.getElementById('tab-history');
    if (!container) return;

    const history = getHistory();
    const t = window.t || function(key) { return key; };

    if (history.length === 0) {
      container.innerHTML = '<div class="history-empty">' + t('history.empty') + '</div>';
      return;
    }

    let html = '<div class="history-container">';
    html += '<div class="history-header">';
    html += '<h3>' + t('history.title') + '</h3>';
    html += '<button class="history-clear-btn" id="clearHistoryBtn">' + t('history.clear') + '</button>';
    html += '</div>';

    history.forEach(function(entry) {
      const timeStr = formatTime(entry.timestamp, t);
      const lines = entry.lineInfo ? [...new Set(entry.lineInfo.flat())].join(', ') : '';
      
      html += '<div class="history-entry" data-id="' + entry.id + '">';
      html += '<div class="history-route">';
      html += '<span class="history-from">' + escapeHtml(entry.from) + '</span>';
      html += '<span class="history-arrow">→</span>';
      html += '<span class="history-to">' + escapeHtml(entry.to) + '</span>';
      html += '</div>';
      html += '<div class="history-meta">';
      if (entry.durationMin > 0) {
        html += '<span class="history-duration">' + entry.durationMin + ' ' + t('unit.minute') + '</span>';
      }
      if (lines) {
        html += '<span class="history-lines">' + escapeHtml(lines) + '</span>';
      }
      html += '<span class="history-time">' + timeStr + '</span>';
      html += '<button class="history-delete-btn" data-id="' + entry.id + '">✕</button>';
      html += '</div>';
      html += '</div>';
    });

    html += '</div>';
    container.innerHTML = html;

    // Bind events
    document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);
    container.querySelectorAll('.history-delete-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        removeEntry(parseInt(this.dataset.id));
      });
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function init() {
    renderHistory();

    // Intercept SearchUI results
    const originalPerformSearch = window.SearchUI ? window.SearchUI.performSearch : null;
    if (originalPerformSearch) {
      window.SearchUI.performSearch = function() {
        const result = originalPerformSearch.apply(this, arguments);
        // Save to history after a short delay to capture the result
        setTimeout(() => {
          const from = this.fromInput ? this.fromInput.value.trim() : '';
          const to = this.toInput ? this.toInput.value.trim() : '';
          if (from && to) {
            const history = getHistory();
            const lastEntry = history[0];
            // Only save if different from last entry
            if (!lastEntry || lastEntry.from !== from || lastEntry.to !== to) {
              saveToHistory(from, to, null);
              renderHistory();
            }
          }
        }, 100);
        return result;
      };
    }

    window.onLanguageChange(() => renderHistory());
  }

  window.SearchHistory = {
    init: init,
    getHistory: getHistory,
    saveToHistory: saveToHistory,
    clearHistory: clearHistory,
    removeEntry: removeEntry,
    renderHistory: renderHistory
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SearchHistory.init());
  } else {
    SearchHistory.init();
  }
})();
