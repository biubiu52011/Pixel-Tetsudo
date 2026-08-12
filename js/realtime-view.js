/*
 * Pixel Tetsudo - Realtime View
 * Line Status View
 */
(function() {
  'use strict';

  var t = window.t || function(key) { return key; };

  function escapeHtml(str) {
    if (!str) return '';
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function formatTime(minutes) {
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    return h + ':' + (m < 10 ? '0' : '') + m;
  }

  function getLineStatus(line) {
    return line.delayInfo.status;
  }

  function getStatusIcon(status) {
    var cls = status === 'suspended' ? 'rs-status-icon-suspended' : (status === 'delayed' ? 'rs-status-icon-delayed' : 'rs-status-icon-normal');
    var icon = status === 'suspended' ? '\u2717' : (status === 'delayed' ? '\u25b3' : '\u25cb');
    return '<span class="rs-status-icon ' + cls + '">' + icon + '</span>';
  }

  function renderCard(line, lineId) {
    var status = getLineStatus(line);
    var interval = line.delayInfo.interval || '';
    var lineColor = line.color || '#00b643';
    var iconHtml = line.image
      ? '<img class="rs-line-icon" src="' + escapeHtml(line.image) + '" alt="">'
      : '<div class="rs-code-badge">' + escapeHtml(line.code) + '</div>';

    return '<div class="rs-line-card" data-line="' + escapeHtml(lineId) + '"'
      + ' style="--line-color:' + escapeHtml(lineColor) + ';">'
      + '<div class="rs-line-header">'
      + iconHtml
      + '<div class="rs-line-info">'
      + '<div class="rs-line-name">' + escapeHtml(line.name) + '</div>'
      + '<div class="rs-line-interval">' + escapeHtml(interval) + '</div>'
      + '</div>'
      + getStatusIcon(status)
      + '</div></div>';
  }

  function render(container, fusedData) {
    if (!container || !fusedData || !fusedData.lines) { console.warn("[RealtimeView] Missing data:", {container: !!container, hasFusedData: !!fusedData, hasLines: !!(fusedData && fusedData.lines)}); return; }
    var lines = fusedData.lines;
    var groups = {};
    Object.keys(lines).forEach(function(id) {
      var line = lines[id];
      var op = line.operator || 'Unknown';
      if (!groups[op]) groups[op] = [];
      groups[op].push({ id: id, line: line });
    });
    var html = '';
    Object.keys(groups).sort().forEach(function(op) {
      html += '<div class="rs-operator-group">'
        + '<div class="rs-operator-title">' + escapeHtml(op) + '</div>'
        + '<div class="rs-cards-container">';
      groups[op].forEach(function(item) {
        html += renderCard(item.line, item.id);
      });
      html += '</div></div>';
    });
    container.innerHTML = html;
  }

  function openModal(lineId, fusedData) {
    var modal = document.getElementById('lineDetailModal');
    if (!modal || !fusedData || !fusedData.lines[lineId]) return;
    var line = fusedData.lines[lineId];
    var status = getLineStatus(line);
    var interval = line.delayInfo.interval;
    var cause = line.delayInfo.cause;
    var statusText = status === 'suspended' ? t('status.suspended') : (status === 'delayed' ? t('status.delayed') : t('status.normal'));
    var statusClass = status === 'suspended' ? 'rs-status-suspended' : (status === 'delayed' ? 'rs-status-delayed' : 'rs-status-normal');
    var body = modal.querySelector('.rs-modal-body');
    var title = modal.querySelector('.rs-modal-title');
    title.textContent = line.name;
    var html = '';

    html += '<div class="rs-status-section ' + statusClass + '">'
      + '<span class="rs-status-indicator"><span style="background:var(--'
      + (status === 'suspended' ? 'red' : (status === 'delayed' ? 'orange' : 'green'))
      + ')"></span>' + statusText + '</span></div>';

    html += '<div class="rs-interval-section"><div class="rs-interval-header"><span class="rs-info-label">' + t('status.interval') + '</span></div><div class="rs-interval-stations">';
    if (!interval || status === 'normal') {
      html += '<span class="rs-station-text">' + t('status.all_lines') + '</span>';
    } else {
      var parts = interval.split('\u2192');
      if (parts.length >= 2) {
        html += '<span class="rs-station-start">' + escapeHtml(parts[0]) + '</span>'
          + '<span class="rs-interval-arrow">\u2192</span>'
          + '<span class="rs-station-end">' + escapeHtml(parts[1]) + '</span>';
      } else {
        html += '<span class="rs-station-text">' + escapeHtml(interval) + '</span>';
      }
    }
    html += '</div></div>';

    html += '<div class="rs-cause-section"><div class="rs-section-title">' + t('status.delay_cause') + '</div><div class="rs-cause-text">';
    if (cause && status !== 'normal') {
      html += escapeHtml(cause);
    } else {
      html += '<span style="color:var(--text-muted)">' + t('status.none') + '</span>';
    }
    html += '</div></div>';

    body.innerHTML = html;
    modal.classList.add('active');
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    var modal = document.getElementById('lineDetailModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }

  var _latestFusedData = null;

  function init() {
    var container = document.getElementById('realtimeStatusContainer');
    if (!container) return;
    // Fallback: use cached data from previous load
    var cachedData = (window.DataFusion && window.DataFusion.getCachedData) ? window.DataFusion.getCachedData() : null;
    if (cachedData && cachedData.lines && Object.keys(cachedData.lines).length > 0) {
      try { render(container, cachedData); }
      catch(e) { console.error('[RealtimeView] Cached render error:', e.message); }
    }
    if (window.DataFusion) {
            window.DataFusion.subscribe(function(fusedData) {
          _latestFusedData = fusedData;
          try { render(container, fusedData); }
          catch(e) { console.error('[RealtimeView] Render error:', e.message); }
      });
      container.addEventListener('click', function(e) {
        var card = e.target.closest('.rs-line-card');
        if (card && _latestFusedData) {
          document.querySelectorAll('.rs-line-card.selected').forEach(function(c) {
            c.classList.remove('selected');
          });
          card.classList.add('selected');
          openModal(card.dataset.line, _latestFusedData);
        }
      });
      var modal = document.getElementById('lineDetailModal');
      if (modal) {
        modal.querySelector('.rs-modal-close').addEventListener('click', closeModal);
        modal.addEventListener('click', function(e) {
          if (e.target === modal) closeModal();
          document.querySelectorAll('.rs-line-card.selected').forEach(function(c) {
            c.classList.remove('selected');
          });
        });
        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') {
            closeModal();
            document.querySelectorAll('.rs-line-card.selected').forEach(function(c) {
              c.classList.remove('selected');
            });
          }
        });
      }
      if (typeof window.onLanguageChange === 'function') {
        window.onLanguageChange(function() {
          var data = window.DataFusion.getFusedData();
          if (data) render(container, data);
          var modal = document.getElementById('lineDetailModal');
          if (modal && modal.classList.contains('active') && _latestFusedData) {
            var selectedCard = document.querySelector('.rs-line-card.selected');
            if (selectedCard) openModal(selectedCard.dataset.line, _latestFusedData);
          }
        });
      }
    } else {
      container.innerHTML = '<div class="rs-error">' + t('status.load_error') + '</div>';
      console.error('[RealtimeView] DataFusion not available');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
