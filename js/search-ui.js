/**
 * Pixel Tetsudo - Search UI Module (Optimized)
 */
(function() {
  'use strict';

  const SearchUI = {
    container: null,
    fromInput: null,
    toInput: null,
    searchBtn: null,
    resultsDiv: null,

    init: function() {
      this.container = document.getElementById('searchContainer');
      if (!this.container) {
        console.warn('[SearchUI] Container #searchContainer not found');
        return;
      }

      this.fromInput = document.getElementById('searchFrom');
      this.toInput = document.getElementById('searchTo');
      this.searchBtn = document.getElementById('searchBtn');
      this.resultsDiv = document.getElementById('searchResults');

      this.bindEvents();
      window.onLanguageChange(() => this.refreshUI());
    },

    refreshUI: function() {
      const t = window.t || function(key) { return key; };
      if (this.fromInput) this.fromInput.placeholder = t('search.fromPlaceholder');
      if (this.toInput) this.toInput.placeholder = t('search.toPlaceholder');
      if (this.searchBtn) this.searchBtn.textContent = t('search.btn');
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key, el.textContent);
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key, el.placeholder);
      });
    },

    bindEvents: function() {
      const self = this;

      if (this.searchBtn) {
        this.searchBtn.addEventListener('click', () => self.performSearch());
      }

      if (this.fromInput) {
        this.fromInput.addEventListener('keypress', e => {
          if (e.key === 'Enter') self.performSearch();
        });
        this.fromInput.addEventListener('input', function() {
          self.showSuggestions(this.value, 'fromSuggestions', this);
        });
      }

      if (this.toInput) {
        this.toInput.addEventListener('keypress', e => {
          if (e.key === 'Enter') self.performSearch();
        });
        this.toInput.addEventListener('input', function() {
          self.showSuggestions(this.value, 'toSuggestions', this);
        });
      }

      document.addEventListener('click', e => {
        if (!e.target.closest('.input-group')) {
          document.querySelectorAll('.suggestions').forEach(el => el.classList.remove('active'));
        }
      });
    },

    showSuggestions: function(query, containerId, inputEl) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      if (!query || query.length < 1) {
        container.classList.remove('active');
        container.innerHTML = '';
        return;
      }

      const stations = window.RouteSearch ? window.RouteSearch.findStationsByTerm(query) : [];
      if (stations.length === 0) {
        container.classList.remove('active');
        container.innerHTML = '';
        return;
      }

      container.innerHTML = stations.map(s => '<div class="suggestion-item">' + s + '</div>').join('');
      container.classList.add('active');
      
      container.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
          inputEl.value = item.textContent;
          container.classList.remove('active');
          container.innerHTML = '';
        });
      });
    },

    performSearch: function() {
      const from = (this.fromInput ? this.fromInput.value.trim() : '');
      const to = (this.toInput ? this.toInput.value.trim() : '');
      const t = window.t || function(key) { return key; };

      if (!from || !to) {
        if (this.resultsDiv) {
          this.resultsDiv.innerHTML = '<div class="search-error">' + t('validate.input_required') + '</div>';
        }
        return;
      }

      if (this.resultsDiv) {
        this.resultsDiv.innerHTML = '<div class="rs-loading"><div class="rs-loading-spinner"></div><span>' + t('status.loading') + '</span></div>';
      }

      if (window.RouteSearch) {
        const result = window.RouteSearch.findRoute(from, to);
        if (this.resultsDiv) {
          if (result) {
            this.renderResults(result, t);
          } else {
            this.resultsDiv.innerHTML = '<div class="search-error">' + t('search.no_results') + '</div>';
          }
        }
      }
    },

    renderResults: function(result, t) {
      if (!this.resultsDiv) return;

      let html = '<div class="search-result">';
      html += '<div class="result-header">';
      html += '<span class="result-duration">' + result.durationMin + '分</span>';
      html += '<span class="result-segments">' + result.segments + ' ' + t('search.segments') + '</span>';
      html += '</div>';
      
      html += '<div class="result-stations">';
      result.path.forEach(function(station, i) {
        html += '<div class="station-node">' + station;
        if (i === 0) html += ' <span class="start">' + t('search_result.start') + '</span>';
        if (i === result.path.length - 1) html += ' <span class="end">' + t('search_result.end') + '</span>';
        html += '</div>';
        if (i < result.path.length - 1) {
          html += '<div class="station-connector"></div>';
        }
      });
      html += '</div>';

      if (result.lineInfo && result.lineInfo.length > 0) {
        const lines = new Set();
        result.lineInfo.forEach(seg => seg.lines.forEach(l => lines.add(l)));
        html += '<div class="result-lines">';
        lines.forEach(line => {
          html += '<span class="line-tag">' + line + '</span>';
        });
        html += '</div>';
      }

      html += '</div>';
      this.resultsDiv.innerHTML = html;
    }
  };

  window.SearchUI = SearchUI;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SearchUI.init());
  } else {
    SearchUI.init();
  }
})();
