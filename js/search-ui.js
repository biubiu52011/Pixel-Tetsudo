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

    // Public API: fill from/to inputs by station ID. Single source for both
    // ?from=&to= URL restore (init) and history restore (SearchHistory.restoreFromRecent).
    // Sets value + authoritative data-station-id; callers do not poke internals.
    setRoute: function(fromId, toId) {
      var fill = function(input, id) {
        if (!input || !id) return;
        input.value = id;
        // Dispatch input first so the listener's stale-ID cleanup + suggestion
        // refresh runs, then stamp the authoritative station ID after.
        input.dispatchEvent(new Event('input'));
        input.setAttribute('data-station-id', id);
      };
      fill(this.fromInput, fromId);
      fill(this.toInput, toId);
    },

    init: function() {
      this.container = document.getElementById('searchContainer');
      if (!this.container) {
        return;
      }

      this.fromInput = document.getElementById('searchFrom');
      this.toInput = document.getElementById('searchTo');
      this.searchBtn = document.getElementById('searchBtn');
      this.swapBtn = document.getElementById('swapBtn');
      this.resultsDiv = document.getElementById('searchResults');

      // Parse ?from=/&to= URL params and fill inputs via the public setRoute().
      var _params = null;
      try { _params = new URLSearchParams(window.location.search); } catch(e) {}
      var _fromParam = _params ? _params.get('from') : null;
      var _toParam = _params ? _params.get('to') : null;
      if (_fromParam || _toParam) {
        this.setRoute(_fromParam, _toParam);
      }


      // Clean URL after both params are parsed — inputs are already filled, no need to preserve
      if (_fromParam || _toParam) {
        var _cleanUrl = window.location.pathname;
        window.history.replaceState({}, '' , _cleanUrl);
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
      // Clear suggestion caches so re-query resolves names in the new language
      this._suggestionCache = {};
      this._suggestionCacheDOM = {};
      this._suggestionBindDone = {};
      // Re-resolve selected station names in input boxes (only when stationId is known)
      var _lang = window.currentLang || 'ja';
      if (this.fromInput) {
        var _fid = this.fromInput.getAttribute('data-station-id');
        if (_fid && window.RailwayDB && window.RailwayDB.resolveStationName) {
          var _fn = window.RailwayDB.resolveStationName(_fid, _lang);
          if (_fn) this.fromInput.value = _fn;
        }
      }
      if (this.toInput) {
        var _tid = this.toInput.getAttribute('data-station-id');
        if (_tid && window.RailwayDB && window.RailwayDB.resolveStationName) {
          var _tn = window.RailwayDB.resolveStationName(_tid, _lang);
          if (_tn) this.toInput.value = _tn;
        }
      }
      // Re-render route results if a search has been performed
      if (this.lastRouteResult && this.resultsDiv && this.resultsDiv.innerHTML.trim() !== '') {
        this.renderResults(this.lastRouteResult, t);
      }
    },


    _swapInputs: function() {
      var fromVal = this.fromInput ? this.fromInput.value : '';
      var toVal = this.toInput ? this.toInput.value : '';
      var fromId = this.fromInput ? (this.fromInput.getAttribute('data-station-id') || '') : '';
      var toId = this.toInput ? (this.toInput.getAttribute('data-station-id') || '') : '';
      if (this.fromInput) {
        this.fromInput.value = toVal;
        this.fromInput.setAttribute('data-station-id', toId || '');
      }
      if (this.toInput) {
        this.toInput.value = fromVal;
        this.toInput.setAttribute('data-station-id', fromId || '');
      }
      // Trigger suggestion refresh
      if (this.fromInput && this.fromInput.value) {
        this.showSuggestions(this.fromInput.value, 'fromSuggestions', this.fromInput);
      }
      if (this.toInput && this.toInput.value) {
        this.showSuggestions(this.toInput.value, 'toSuggestions', this.toInput);
      }
    },

    bindEvents: function() {
      const self = this;

      if (this.swapBtn) {
        this.swapBtn.addEventListener('click', () => this._swapInputs());
      }
      if (this.searchBtn) {
        this.searchBtn.addEventListener('click', () => self.performSearch());
      }

      if (this.fromInput) {
        this.fromInput.addEventListener('keypress', e => {
          if (e.key === 'Enter') self.performSearch();
        });
        this.fromInput.addEventListener('input', function() {
          // Manual edit invalidates any previously selected station: without this
          // removal, data-station-id still points to the OLD station while the
          // input shows a new name, and performSearch resolves to the stale station.
          this.removeAttribute('data-station-id');
          self.showSuggestions(this.value, 'fromSuggestions', this);
        });
      }

      if (this.toInput) {
        this.toInput.addEventListener('keypress', e => {
          if (e.key === 'Enter') self.performSearch();
        });
        this.toInput.addEventListener('input', function() {
          // Same stale data-station-id invalidation as the from input above.
          this.removeAttribute('data-station-id');
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
        // Rebind click handlers: re-writing innerHTML destroys the previous nodes
        // and their listeners, so a later input event would leave items unclickable.
        this._bindSuggestionEvents(container, inputEl);
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

      this._bindSuggestionEvents(container, inputEl);
    },

    _bindSuggestionEvents: function(container, inputEl) {
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
      // Prefer station ID from data-station-id (set by suggestion click); fall back to display name for direct input
      const rawFrom = (this.fromInput ? (this.fromInput.getAttribute('data-station-id') || this.fromInput.value.trim()) : '');
      const rawTo = (this.toInput ? (this.toInput.getAttribute('data-station-id') || this.toInput.value.trim()) : '');
      // Direct-input fallback: display names must be resolved to canonical station IDs (Kitasenju -> Kita-Senju etc.)
      var _resolveId = function(v) {
        if (!v) return '';
        if (window.StationResolver) {
          var r = window.StationResolver.resolve(v);
          if (r && r.length > 0 && r[0].stationId) return r[0].stationId;
        }
        return v;
      };
      const from = _resolveId(rawFrom);
      const to = _resolveId(rawTo);
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

      this.currentMode = this.currentMode || 'combo';
      let result = null;
      if (window.RouteSearch) {
        result = window.RouteSearch.findRoute(from, to, this.currentMode);
        if (this.resultsDiv) {
          if (result) {
            this.renderResults(result, t);
            this.lastRouteResult = result;
            // Persist the completed search to History (History consumes SearchUI
            // output via its public API; the old monkey-patch in history.js
            // wrapped the constructor property and never fired — fixed 4.3.557).
            if (window.SearchHistory && window.SearchHistory.saveToHistory) {
              window.SearchHistory.saveToHistory(from, to, result);
            }
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

    // Line badge: icon image from RailwayDB line.image (provider-owned field),
    // falling back to the resolved display name so a missing icon never blanks out.
    _lineBadge: function(lid) {
      if (!lid) return '';
      var nm = (window.RailwayDB && window.RailwayDB.resolveLineName) ? window.RailwayDB.resolveLineName(lid, window.currentLang) : lid;
      var line = (window.RailwayDB && window.RailwayDB.getLine) ? window.RailwayDB.getLine(lid) : null;
      var img = (window.LineOperationSystemsResolveIcon && window.LineOperationSystemsResolveIcon(lid)) || (line && line.image && !/(グループ|ロゴ|マーク|アイコン|シンボル)/.test(line.image) ? line.image : '');
      if (!img && line && window.TransitConstants && window.TransitConstants.isJRERoute && window.TransitConstants.isJRERoute(line)) img = "../images/鉄道/JR東日本/JRグループ.png";
      if (img) {
        return '<span class="journey-line-badge"><img class="journey-line-icon" src="' + window.escapeHtml(img) + '" alt="' + window.escapeHtml(nm) + '" title="' + window.escapeHtml(nm) + '" loading="lazy"><span class="journey-line-name">' + window.escapeHtml(nm) + '</span></span>';
      }
      return '<span class="journey-line-name-fallback">' + window.escapeHtml(nm) + '</span>';
    },

    renderResults: function(result, t) {
      if (!this.resultsDiv) return;
      var lang = window.currentLang || 'ja';
      var dur = result.durationMin || 0;
      var transfers = 0;
      var segs = result.routeSegments || result.lineInfo || [];
      for (var i = 0; i < segs.length; i++) { if (segs[i].type === 'transfer' && !segs[i].through) transfers++; }

      var origin = window.RailwayDB && window.RailwayDB.resolveStationName ? window.RailwayDB.resolveStationName(result.path[0], lang) : (result.path[0] || '');
      var dest = window.RailwayDB && window.RailwayDB.resolveStationName ? window.RailwayDB.resolveStationName(result.path[result.path.length - 1], lang) : (result.path[result.path.length - 1] || '');

      var html = '<div class="search-result journey-card">';
      // Mode tabs (おすすめ / 最速 / 乗換最少), mirroring 乗換案内
      var _modes = [['combo', t('search.mode.combo')], ['duration', t('search.mode.duration')], ['transfers', t('search.mode.transfers')]];
      html += '<div class="journey-modes">';
      for (var _mi = 0; _mi < _modes.length; _mi++) {
        var _mCls = (_modes[_mi][0] === this.currentMode) ? 'mode-tab active' : 'mode-tab';
        html += '<button type="button" class="' + _mCls + '" data-mode="' + _modes[_mi][0] + '">' + window.escapeHtml(_modes[_mi][1]) + '</button>';
      }
      html += '</div>';
      // Header: total duration + transfer count + estimated fare
      html += '<div class="journey-header">';
      html += '<span class="journey-duration">' + dur + ' ' + t('search.min_unit') + '</span>';
      if (transfers > 0) { html += '<span class="journey-transfers">' + transfers + ' ' + t('search_result.transfer_count') + '</span>'; }
      var _totalFare = (window.FareEstimator && result.routeSegments) ? window.FareEstimator.estimateTotal(result.routeSegments) : null;
      if (_totalFare) { html += '<span class="journey-fare">¥' + _totalFare.toLocaleString() + ' <span class="journey-fare-tag">' + window.escapeHtml(t('search.fare_tag')) + '</span></span>'; }
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
            var lineChange = '';
            if (seg.fromLine || (seg.toLines && seg.toLines.length)) {
              var badgeParts = [];
              if (seg.fromLine) badgeParts.push(this._lineBadge(seg.fromLine));
              if (seg.toLines && seg.toLines.length) {
                if (badgeParts.length) badgeParts.push('<svg class="journey-line-arrow" viewBox="0 0 14 14" width="12" height="12" fill="currentColor" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" transform="rotate(90 7 7)" d="M6.646.146a.5.5 0 0 1 .708 0l3.5 3.5a.5.5 0 0 1-.354.854H8V13a1 1 0 1 1-2 0V4.5H3.5a.5.5 0 0 1-.354-.854z"/></svg>');
                for (var bi = 0; bi < seg.toLines.length; bi++) badgeParts.push(this._lineBadge(seg.toLines[bi]));
              }
              lineChange = '<span class="journey-line-icons">' + badgeParts.join('') + '</span>';
            }
            html += '<div class="journey-transfer';
            if (seg.through) { html += ' journey-transfer--through'; }
            html += '" data-tx-idx="' + i + '">';
            var _txIconSvg = seg.through
              ? '<svg class="journey-tx-icon" viewBox="0 0 14 14" width="13" height="13" fill="currentColor" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.354.146A.5.5 0 0 0 8.5.5V2h-6A2.5 2.5 0 0 0 0 4.5V6a1 1 0 0 0 2 0V4.5a.5.5 0 0 1 .5-.5h6v1.5a.5.5 0 0 0 .854.354l2.5-2.5a.5.5 0 0 0 0-.708zM5.19 8.038a.5.5 0 0 1 .31.462V10h6a.5.5 0 0 0 .5-.5V8a1 1 0 1 1 2 0v1.5a2.5 2.5 0 0 1-2.5 2.5h-6v1.5a.5.5 0 0 1-.854.354l-2.5-2.5a.5.5 0 0 1 0-.708l2.5-2.5a.5.5 0 0 1 .545-.108"/></svg>'
              : '<svg class="journey-tx-icon" viewBox="0 0 14 14" width="13" height="13" fill="currentColor" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.998 1.068a1 1 0 0 1-.29.64l-2 2-7 7A1 1 0 0 1 .292 9.292L6.586 3 5.293 1.707A1 1 0 0 1 6 0h4a1 1 0 0 1 .674.261M7.414 11l6.293-6.293a1 1 0 0 0-1.414-1.414l-7 7-2 2a.996.996 0 0 0-.05 1.36q.038.045.083.086A1 1 0 0 0 4 14h4a1 1 0 0 0 .707-1.707z"/></svg>';
            html += '<span class="journey-transfer-icon">' + _txIconSvg + '</span>';
            html += '<span class="journey-transfer-station">' + window.escapeHtml(txSt) + '</span>';
            html += '<span class="journey-transfer-text';
            if (seg.through) { html += ' journey-transfer-text--through'; }
            html += '">' + t(seg.through ? 'search_result.through' : 'search_result.transfer') + '</span>';
            if (lineChange) { html += lineChange; }
            if (!seg.through && seg.station && window.getTransferHint) {
              var hintTxt = window.getTransferHint(seg.station, lang);
              if (hintTxt) { html += '<span class="journey-transfer-hint">' + window.escapeHtml(hintTxt) + '</span>'; }
            }
            html += '</div>';
          } else {
            var lineId = seg.lineId || null;
            var lineName = lineId ? (window.RailwayDB && window.RailwayDB.resolveLineName ? window.RailwayDB.resolveLineName(lineId, window.currentLang) : null) : null;
            var lineColor = (window.LineOperationSystemsResolveColor && window.LineOperationSystemsResolveColor(lineId)) || (window.RailwayDB && window.RailwayDB.getLine(lineId) ? (window.RailwayDB.getLine(lineId).color || null) : null) || null;
            var fromSt = window.RailwayDB && window.RailwayDB.resolveStationName ? window.RailwayDB.resolveStationName(seg.fromStation, lang) : (seg.fromStation || '');
            var toSt = window.RailwayDB && window.RailwayDB.resolveStationName ? window.RailwayDB.resolveStationName(seg.toStation, lang) : (seg.toStation || '');
            html += '<div class="journey-seg" data-seg-color="' + window.escapeHtml(lineColor || '') + '" data-seg-idx="' + i + '">';
            html += '<div class="journey-seg-head">';
            html += '<span class="journey-seg-name">' + window.escapeHtml(lineName || '') + '</span>';
            if (seg.trainType) { html += '<span class="journey-seg-type">' + window.escapeHtml(t('train_type.' + seg.trainType)) + '</span>'; }
            // Running-status badge synced with Realtime page (delayed / suspended only)
            var _stBadge = '';
            if (lineId && window.DataFusion) {
              try {
                var _fused = window.DataFusion.getFusedData();
                var _fl = _fused && _fused.lines && _fused.lines[lineId];
                var _di = _fl && _fl.delayInfo;
                if (_di && (_di.status === 'delayed' || _di.status === 'suspended')) {
                  var _stCls = _di.status === 'delayed' ? 'delayed' : 'suspended';
                  var _stIcon = _di.status === 'delayed' ? '\u25b3' : '\u00d7';
                  var _stLabel = (window.t && window.t('status.' + _di.status)) || _di.status;
                  _stBadge = ' <span class="route-status-badge ' + _stCls + '">' + _stIcon + ' ' + window.escapeHtml(_stLabel) + '</span>';
                }
              } catch(_e) {}
            }
            if (_stBadge) { html += _stBadge; }
            // 方向徽章：乗車情報（行先）掛在乗車段頂部——Yahoo式乗車駅直下挂位；恒取段终点（行进方向）
            // （线路站序反向乘车段曾误显示起点站名，例：新宿→渋谷 显示"新宿方面"，乘客视角应始终是驶向的站）
            if (seg.direction !== 0 && lineId) {
              var _dirSt = seg.toStation;
              var _dirName = (window.RailwayDB && window.RailwayDB.resolveStationName) ? window.RailwayDB.resolveStationName(_dirSt, lang) : _dirSt;
              html += '<span class="journey-seg-direction-badge">' + window.escapeHtml(t('search.direction').replace('{s}', _dirName)) + '</span>';
            }
            html += '<span class="journey-seg-times" data-seg-times="' + i + '"></span>';
            html += '</div>';
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
      if (destStation && typeof this.renderNearbySpots === 'function') { spotsHtml = this.renderNearbySpots(destStation, t); }
      this.resultsDiv.innerHTML = html;
      // Apply journey segment border colors via DOM API (CSP-safe; inline style attributes are blocked by style-src 'self').
      this.resultsDiv.querySelectorAll('.journey-seg').forEach(function(seg) {
        var color = seg.getAttribute('data-seg-color');
        if (color) seg.style.setProperty('border-left-color', color);
      });
      if (spotsHtml) { this.resultsDiv.insertAdjacentHTML('beforeend', spotsHtml); }
      // v4.3.589: 発着時刻推算（异步回填）——ODPT 时刻表/手动表查询完成后把 "14:05発 14:12着"
      // 注入各乗車段右侧（数据未就绪时不阻塞首屏，查询失败静默降级为无时刻展示）
      if (window.RouteTimetable && result.routeSegments) {
        var _rtSelf = this;
        var _rtDP = t('search.time_dep') || '\u767a';
        var _rtAR = t('search.time_arr') || '\u7740';
        window.RouteTimetable.enrichSegments(result.routeSegments).then(function(res) {
          if (!_rtSelf.resultsDiv) return;
          // v4.3.590: enrich 返回 { times, downgrade }；downgrade = 直通贯通失败需降级为换乘的 transfer 段索引
          var _times = (res && res.times) ? res.times : (res || {});
          for (var _ridx in _times) {
            var _slot = _rtSelf.resultsDiv.querySelector('[data-seg-times="' + _ridx + '"]');
            if (!_slot || !_times[_ridx]) continue;
            var _tm = _times[_ridx];
            var _platHtml = _tm.platform ? '<span class="journey-seg-platform">' + window.escapeHtml(t('search.platform').replace('{p}', _tm.platform)) + '</span>' : '';
            _slot.innerHTML = '<span class="journey-seg-time-dep">' + window.escapeHtml(_tm.dep) + _rtDP + '</span>' +
                              _platHtml +
                              '<span class="journey-seg-time-arr">' + window.escapeHtml(_tm.arr) + _rtAR + '</span>';
          }
          // 直通降级：ODPT 分表无贯通车次时，"乗換不要"改回换乘文案并去除直通样式（避免误导）
          var _dg = (res && res.downgrade) || [];
          for (var _d2 = 0; _d2 < _dg.length; _d2++) {
            var _tr = _rtSelf.resultsDiv.querySelector('[data-tx-idx="' + _dg[_d2] + '"]');
            if (!_tr) continue;
            _tr.classList.remove('journey-transfer--through');
            var _txt = _tr.querySelector('.journey-transfer-text');
            if (_txt) {
              _txt.classList.remove('journey-transfer-text--through');
              _txt.textContent = t('search_result.transfer');
            }
          }
        }).catch(function() {});
      }
      // Mode tab switching: re-run the search with the new mode (bind AFTER innerHTML commit)
      var _self = this;
      var _modeTabs = this.resultsDiv ? this.resultsDiv.querySelectorAll('.mode-tab') : [];
      for (var _ti = 0; _ti < _modeTabs.length; _ti++) {
        _modeTabs[_ti].addEventListener('click', function() {
          _self.currentMode = this.getAttribute('data-mode');
          _self.performSearch();
        });
      }
    },




  };

  window.SearchUI = SearchUI;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SearchUI.init());
  } else {
    SearchUI.init();
  }
})();
