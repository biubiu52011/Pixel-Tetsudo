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

      let html = '<div class="search-result">';
      html += '<div class="result-header">';
      html += '<span class="result-duration">' + result.durationMin + ' ' + t('search.min_unit') + '</span>';
      html += '<span class="result-segments">' + result.segments + ' ' + t('search.segments') + '</span>';
      html += '</div>';
      
      // Phase 44-D: Sort mode buttons
      html += '<div class="search-sort-mode">';
      var modes = ['transfers','duration','combo'];
      var modeLabels = [t('search.mode.transfers'), t('search.mode.duration'), t('search.mode.combo')];
      var currentMode = window.RouteEvaluator ? window.RouteEvaluator.getMode() : 'transfers';
      modes.forEach(function(mode, i) {
        var active = mode === currentMode ? ' active' : '';
        html += '<button class="sort-mode-btn"' + active + ' data-mode="' + mode + '">' + window.escapeHtml(modeLabels[i]) + '</button>';
      });
      html += '</div>';

      html += '<div class="result-stations">';
      result.path.forEach(function(station, i) {
        var _r1 = (window.RailwayDB && window.RailwayDB.resolveStationName) ? window.RailwayDB.resolveStationName(station, window.currentLang || 'ja') : null;
        html += '<div class="station-node">' + (window.escapeHtml(_r1 || station));
        if (i === 0) html += ' <span class="start">' + t('search_result.start') + '</span>';
        if (i === result.path.length - 1) html += ' <span class="end">' + t('search_result.end') + '</span>';
        html += '</div>';
        if (i < result.path.length - 1) {
          html += '<div class="station-connector"></div>';
        }
      });
      html += '</div>';

      var renderSegs = (result.routeSegments && result.routeSegments.length > 0) ? result.routeSegments : result.lineInfo;
      if (renderSegs && renderSegs.length > 0) {
        html += '<div class="result-segments">';
        var rtCache = this.getRouteRealtime(result);
        renderSegs.forEach(function(seg) {
          if (seg.type === 'transfer') {
            var _r2 = (window.RailwayDB && window.RailwayDB.resolveStationName) ? window.RailwayDB.resolveStationName(seg.station, window.currentLang || 'ja') : null;
            html += '<div class="transfer-node">' + t('search_result.transfer') + ' @ ' + window.escapeHtml(_r2 || seg.station) + '</div>';
          } else {
            var lineId = seg.lineId || null;
            var lineName = seg.lineName || (seg.lines && seg.lines[0]) || '';
            var lineColor = (window.RailwayDB && window.RailwayDB.getLine(lineId)) ? (window.RailwayDB.getLine(lineId).color || null) : null;
            html += '<div class="ride-seg"' + (lineColor ? ' style="border-left:4px solid ' + lineColor + '"' : '') + '>';
            html += '<span class="line-name">' + window.escapeHtml(lineName) + '</span>';
            if (seg.direction === 1) {
              html += '<span class="line-direction">\u2191</span>';
            } else if (seg.direction === -1) {
              html += '<span class="line-direction">\u2193</span>';
            }
            var _r3f = (window.RailwayDB && window.RailwayDB.resolveStationName) ? window.RailwayDB.resolveStationName(seg.fromStation, window.currentLang || 'ja') : null;
            var _r3t = (window.RailwayDB && window.RailwayDB.resolveStationName) ? window.RailwayDB.resolveStationName(seg.toStation, window.currentLang || 'ja') : null;
            html += '<span class="ride-route">' + window.escapeHtml(_r3f || seg.fromStation) + ' → ' + window.escapeHtml(_r3t || seg.toStation) + '</span>';
            if (seg.duration != null) {
              html += '<span class="line-duration">' + seg.duration + ' ' + t('search.min_unit') + '</span>';
            }
            if (lineId && window.DATA_FUSION) {
              var delayInfo = window.DATA_FUSION.getDelayInfo(lineId);
              if (delayInfo) {
                var status = delayInfo.status || 'no_data';
                var meta = (window.DataState && window.DataState.STATUS_META) ? window.DataState.STATUS_META[status] : null;
                var icon = meta ? meta.icon : '\u25cc';
                var label = t('status.' + status) || status;
                html += '<span class="route-status-badge ' + status + '">' + icon + ' ' + window.escapeHtml(label) + '</span>';
              }
            }
            html += '</div>';
          }
        });
        html += '</div>';
      }

      html += '</div>';

      // Phase 42-A: Nearby attractions for destination station
      var destStation = result.path[result.path.length - 1];
      if (destStation) {
        var spotsHtml = this.renderNearbySpots(destStation, t);
        if (spotsHtml) {
          html += spotsHtml;
        }
      }

      html += '</div>';
      this.resultsDiv.innerHTML = html;

      // Phase 44-D: Sort mode button click handler (event delegation)
      var sortModeContainer = this.resultsDiv.querySelector('.search-sort-mode');
      if (sortModeContainer) {
        sortModeContainer.addEventListener('click', function(e) {
          var btn = e.target.closest('.sort-mode-btn');
          if (btn && window.RouteEvaluator) {
            var mode = btn.getAttribute('data-mode');
            if (mode) {
              window.RouteEvaluator.setMode(mode);
              self.performSearch();
            }
          }
        });
      }

      // Phase 42-D: Bind route button handlers
      this.resultsDiv.querySelectorAll('.btn-nearby-route').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var sk = btn.getAttribute('data-station');
          if (sk) window.location.href = 'home.html?from=' + encodeURIComponent(sk);
        });
      });
    },

    /**
     * Phase 42-A/C: Render nearby tourism spots using unified TourismProximity API
     */
    renderNearbySpots: function(stationName, t) {
      // Resolve station name to tourism key
      var stationKey = null;
      var td = window.TOURISM_DATA;
      if (td && td[stationName]) {
        stationKey = stationName;
      } else if (td) {
        for (var k in td) {
          if (k.toLowerCase() === stationName.toLowerCase()) {
            stationKey = k;
            break;
          }
        }
      }
      if (!stationKey) return null;

      // Use unified proximity API
      var nearby = null;
      try {
        nearby = window.TourismProximity ? window.TourismProximity.getNearbySpotsByStation(stationKey, { radius: 3000, limit: 10 }) : null;
      } catch(e) {
        console.warn('[SearchUI] getNearbySpotsByStation failed:', e);
      }
      if (!nearby || nearby.length === 0) return null;

      var html = '<div class="nearby-spots-section">';
      html += '<div class="nearby-spots-header">';
      html += '<span class="nearby-spots-icon">&#x1F3DF;</span>';
      html += '<span class="nearby-spots-title">' + t('search.nearby_spots') + '</span>';
      html += '<span class="nearby-spots-count">' + nearby.length + '</span>';
      html += '<span class="nearby-spots-station">' + window.escapeHtml(stationName) + '</span>';
      html += '</div>';

      html += '<div class="nearby-spots-grid">';
      for (var j = 0; j < nearby.length; j++) {
        var sp = nearby[j];
        var spot = sp.spot;
        var distText = sp.distanceText || '';
        var tagsHtml = '';
        if (spot.tags && spot.tags.length > 0) {
          tagsHtml = '<div class="nearby-spot-tags">' + spot.tags.slice(0, 2).map(function(tag) {
            return '<span class="nearby-tag">' + window.escapeHtml(tag) + '</span>';
          }).join('') + '</div>';
        }
        var detailUrl = 'tourism-detail.html?station=' + encodeURIComponent(sp.stationId) + '&name=' + encodeURIComponent(spot.name) + '&index=0';
        html += '<a href="' + detailUrl + '" class="nearby-spot-card" data-station="' + window.escapeHtml(sp.stationId) + '" data-spot="' + window.escapeHtml(spot.name) + '">';
        html += '<div class="nearby-spot-rank">#' + (j + 1) + '</div>';
        html += '<div class="nearby-spot-info">';
        html += '<div class="nearby-spot-name">' + window.escapeHtml(spot.name) + '</div>';
        html += '<div class="nearby-spot-meta">' + distText + '</div>';
        html += tagsHtml;
        html += '</div>';
        html += '<span class="nearby-spot-arrow">&#x203A;</span>';
        html += '</a>';
      }
      html += '</div>';

      html += '<div class="nearby-spots-actions">';
      html += '<a href="tourism-detail.html?station=' + encodeURIComponent(stationKey) + '&index=0" class="btn-nearby-viewall" data-i18n="search.view_all_spots">' + window.escapeHtml(t('search.view_all_spots')) + '</a>';
      html += '<button class="btn-nearby-route" data-station="' + window.escapeHtml(stationKey) + '">' + window.escapeHtml(t('search.route_from_here')) + '</button>';
      html += '</div>';

      html += '</div>';
      return html;
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
