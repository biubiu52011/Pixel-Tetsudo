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
        return;
      }

      this.fromInput = document.getElementById('searchFrom');
      this.toInput = document.getElementById('searchTo');
      this.searchBtn = document.getElementById('searchBtn');
      this.resultsDiv = document.getElementById('searchResults');

      // Phase 42-D: Parse ?from=StationKey URL param
      var _params = null;
      try { _params = new URLSearchParams(window.location.search); } catch(e) {}
      var _fromParam = _params ? _params.get('from') : null;
      if (_fromParam) {
        var _resolvedName = null;
        if (window.RailwayDB && window.RailwayDB.resolveStationName) {
          _resolvedName = window.RailwayDB.resolveStationName(_fromParam, window.currentLang || 'ja');
        }
        if (this.fromInput) {
          this.fromInput.value = _resolvedName || _fromParam;
        }
        this._setFromSourceHint(_fromParam, _resolvedName);
        // Only clean URL when to param is absent — preserve both params for refresh
        var _hasTo = _params ? !!_params.get('to') : false;
        if (!_hasTo) {
          var _cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', _cleanUrl);
        }
      }

      // Phase 42-E: Parse ?to=StationKey URL param
      var _toParam = _params ? _params.get('to') : null;
      if (_toParam && this.toInput) {
        var _toResolvedName = null;
        if (window.RailwayDB && window.RailwayDB.resolveStationName) {
          _toResolvedName = window.RailwayDB.resolveStationName(_toParam, window.currentLang || 'ja');
        }
        this.toInput.value = _toResolvedName || _toParam;
      }

      this.lastRouteResult = null;
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
      // Re-render route results if a search has been performed
      if (this.lastRouteResult && this.resultsDiv && this.resultsDiv.innerHTML.trim() !== '') {
        this.renderResults(this.lastRouteResult, t);
      }
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

    _suggestionCache: {},
    _suggestionBindDone: {},

    showSuggestions: function(query, containerId, inputEl) {
      const container = document.getElementById(containerId);
      if (!container) return;

      if (!query || query.length < 1) {
        container.classList.remove('active');
        container.innerHTML = '';
        return;
      }

      // Cache suggestions to avoid re-querying
      if (!this._suggestionCache[query]) {
        this._suggestionCache[query] = window.RouteSearch ? window.RouteSearch.findStationsByTerm(query) : [];
      }
      const stations = this._suggestionCache[query];
      if (stations.length === 0) {
        container.classList.remove('active');
        container.innerHTML = '';
        return;
      }

      // Use cached DOM if available for this query
      const cachedKey = containerId + '_' + query;
      if (this._suggestionBindDone[cachedKey]) {
        container.innerHTML = this._suggestionCacheDOM[cachedKey] || '';
        container.classList.add('active');
        return;
      }

      container.innerHTML = stations.map(function(s) {
				var did = s.stationId || s;
				var dn = s.displayName || s;
				return "<div class=\"suggestion-item\" data-station-id=\"" + window.escapeHtml(did) + "\">" + window.escapeHtml(dn) + "</div>";
			}).join("");

      container.classList.add('active');

      // Cache the rendered HTML
      this._suggestionCacheDOM = this._suggestionCacheDOM || {};
      this._suggestionCacheDOM[cachedKey] = container.innerHTML;
      this._suggestionBindDone[cachedKey] = true;

      container.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
          var did = item.getAttribute('data-station-id');
          var dn = item.textContent;
          inputEl.value = dn;
          inputEl.setAttribute('data-station-id', did || '');
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

      let result = null;
      if (window.RouteSearch) {
        result = window.RouteSearch.findRoute(from, to);
        if (this.resultsDiv) {
          if (result) {
            this.renderResults(result, t);
            this.lastRouteResult = result;
          } else {
            this.resultsDiv.innerHTML = '<div class="search-error">' + t('search.no_results') + '</div>';
          }
        }
      }
      return result;
    },

    getRouteRealtime: function(result) {
      if (!result || !result.routeSegments || result.routeSegments.length === 0) return null;
      var cacheKey = result.routeSegments.map(function(seg) {
        return seg.lineId || seg.lineName || '';
      }).join('||');
      if (!this._routeRealtimeCache) this._routeRealtimeCache = {};
      if (this._routeRealtimeCache[cacheKey]) return this._routeRealtimeCache[cacheKey];
      var rtData = null;
      try { rtData = window.DATA_FUSION ? window.DATA_FUSION.getDelayInfoForLineIds(result.routeSegments.map(function(s){return s.lineId}).filter(Boolean)) : null; } catch(e) {}
      this._routeRealtimeCache[cacheKey] = rtData;
      return rtData;
    },

    renderResults: function(result, t) {
      if (!this.resultsDiv) return;
      var lang = window.currentLang || 'ja';
      var dur = result.durationMin || 0;
      var transfers = 0;
      var segs = result.routeSegments || result.lineInfo || [];
      for (var i = 0; i < segs.length; i++) { if (segs[i].type === 'transfer') transfers++; }

      var origin = window.RailwayDB && window.RailwayDB.resolveStationName ? window.RailwayDB.resolveStationName(result.path[0], lang) : (result.path[0] || '');
      var dest = window.RailwayDB && window.RailwayDB.resolveStationName ? window.RailwayDB.resolveStationName(result.path[result.path.length - 1], lang) : (result.path[result.path.length - 1] || '');

      var html = '<div class="search-result journey-card">';
      // Header: total duration + transfer count
      html += '<div class="journey-header">';
      html += '<span class="journey-duration">' + dur + ' ' + t('search.min_unit') + '</span>';
      if (transfers > 0) { html += '<span class="journey-transfers">' + transfers + ' ' + t('search_result.transfer_count') + '</span>'; }
      html += '</div>';
      // Timeline: origin -> segments -> destination
      html += '<div class="journey-timeline">';
      // Origin node
      html += '<div class="journey-node journey-node--origin">';
      html += '<span class="journey-node-dot"></span>';
      html += '<span class="journey-node-label">' + window.escapeHtml(origin) + '</span>';
      html += '</div>';
      // Segments
      if (segs.length > 0) {
        html += '<div class="journey-segments">';
        for (var i = 0; i < segs.length; i++) {
          var seg = segs[i];
          if (seg.type === 'transfer') {
            var txSt = window.RailwayDB && window.RailwayDB.resolveStationName ? window.RailwayDB.resolveStationName(seg.station, lang) : (seg.station || '');
            var fromLineName = seg.fromLine ? (window.RailwayDB && window.RailwayDB.resolveLineName ? window.RailwayDB.resolveLineName(seg.fromLine, window.currentLang) : seg.fromLine) : null;
            var toLineNames = seg.toLines ? seg.toLines.map(function(lid) {
              return window.RailwayDB && window.RailwayDB.resolveLineName ? window.RailwayDB.resolveLineName(lid, window.currentLang) : lid;
            }).join(', ') : null;
            var lineChange = '';
            if (fromLineName || toLineNames) {
              lineChange = '<span class="journey-transfer-lines">' + window.escapeHtml(fromLineName || '') + ' &rarr; ' + window.escapeHtml(toLineNames || '') + '</span>';
            }
            html += '<div class="journey-transfer">';
            html += '<span class="journey-transfer-icon">' + String.fromCharCode(0x21bb) + '</span>';
            html += '<span class="journey-transfer-station">' + window.escapeHtml(txSt) + '</span>';
            html += '<span class="journey-transfer-text">' + t('search_result.transfer') + '</span>';
            if (lineChange) { html += lineChange; }
            html += '</div>';
          } else {
            var lineId = seg.lineId || null;
            var lineName = lineId ? (window.RailwayDB && window.RailwayDB.resolveLineName ? window.RailwayDB.resolveLineName(lineId, window.currentLang) : null) : null;
            var lineColor = (window.RailwayDB && window.RailwayDB.getLine(lineId)) ? (window.RailwayDB.getLine(lineId).color || null) : null;
            var fromSt = window.RailwayDB && window.RailwayDB.resolveStationName ? window.RailwayDB.resolveStationName(seg.fromStation, lang) : (seg.fromStation || '');
            var toSt = window.RailwayDB && window.RailwayDB.resolveStationName ? window.RailwayDB.resolveStationName(seg.toStation, lang) : (seg.toStation || '');
            html += '<div class="journey-seg" style="border-left-color:' + window.escapeHtml(lineColor || 'var(--border)') + ';">';
            html += '<span class="journey-seg-name">' + window.escapeHtml(lineName || '') + '</span>';
            html += '<span class="journey-seg-route">' + window.escapeHtml(fromSt) + ' &rarr; ' + window.escapeHtml(toSt) + '</span>';
            html += '</div>';
          }
        }
        html += '</div>';
      }
      // Destination node
      html += '<div class="journey-node journey-node--dest">';
      html += '<span class="journey-node-dot"></span>';
      html += '<span class="journey-node-label">' + window.escapeHtml(dest) + '</span>';
      html += '</div>';
      html += '</div>';
      html += '</div>';

      var destStation = result.path[result.path.length - 1];
      var spotsHtml = '';
      if (destStation) { spotsHtml = this.renderNearbySpots(destStation, t); }
      this.resultsDiv.innerHTML = html;
      if (spotsHtml) { this.resultsDiv.insertAdjacentHTML('beforeend', spotsHtml); }
    },




    _setFromSourceHint: function(stationKey, displayName) {
      var existing = document.getElementById('fromSourceHint');
      if (existing) existing.remove();
      if (!this.fromInput) return;
      var hint = document.createElement('div');
      hint.id = 'fromSourceHint';
      hint.className = 'from-source-hint';
      var _t = window.t || function(k) { return k; };
      hint.textContent = _t('search.from_source_hint', '来自观光景点') + ': ' + (displayName || stationKey);
      this.fromInput.parentNode.appendChild(hint);
    },
  };

  window.SearchUI = SearchUI;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SearchUI.init());
  } else {
    SearchUI.init();
  }
})();
