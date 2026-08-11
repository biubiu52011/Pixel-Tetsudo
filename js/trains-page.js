/*
 * Pixel Tetsudo - Trains Page Controller
 * 使用 GTFS Realtime 实时位置数据
 */
(function() {
  'use strict';

  let currentLine = null;

  let container = null;
  let viewElement = null;
  let titleElement = null;
  let mapElement = null;
  let backBtn = null;

  var t = window.t || function(key) { return key; };

  function escapeHtml(str) {
    if (!str) return '';
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function init() {
    container = document.getElementById('trainsLineListContent');
    viewElement = document.getElementById('trainsDetailView');
    titleElement = document.getElementById('trainsDetailTitle');
    mapElement = document.getElementById('trainsMapContainer');
    backBtn = document.getElementById('trainsBackBtn');

    if (!container) return;

    // 订阅 DataFusion 融合数据
    if (window.DataFusion) {
      window.DataFusion.subscribe(function(fusedData) {
        if (fusedData && fusedData.lines) {
          renderLineList(container, fusedData);
          if (currentLine) {
            var fusedLine = DataFusion.getLine(currentLine);
            if (fusedLine) {
              renderTrainMap(mapElement, fusedLine, currentLine);
            }
          }
        }
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', function() {
        window.location.hash = '';
        hideLineView();
      });
      backBtn.textContent = '\u2190 ' + t('line_map.back');
    }

    var hash = window.location.hash;
    if (hash && hash.length > 1) {
      var lineId = hash.substring(1);
      showLineView(lineId);
    }

    window.addEventListener('hashchange', handleHashChange);
    if (typeof window.onLanguageChange === 'function') {
      window.onLanguageChange(function() { refreshUI(); });
    }

    console.log('[TrainsPage] Initialized');
  }

  function handleHashChange() {
    var hash = window.location.hash;
    if (hash && hash.length > 1) {
      var lineId = hash.substring(1);
      if (!currentLine) {
        showLineView(lineId);
      }
    } else if (!hash && currentLine) {
      hideLineView();
    }
  }

  function renderLineList(container, fusedData) {
    if (!container || !fusedData || !fusedData.lines) return;
    var lines = fusedData.lines;
    var html = '';
    var lineIds = Object.keys(lines).sort();
    for (var i = 0; i < lineIds.length; i++) {
      var lid = lineIds[i];
      var line = lines[lid];
      var color = line.color || '#888';
      var name = line.nameEn || line.name || lid;
      var activeClass = currentLine === lid ? ' active' : '';

      html += '<a href="#' + escapeHtml(lid) + '" class="tp-line-card' + activeClass + '" style="--line-color: ' + color + ';">';
      html += '<img src="' + escapeHtml(line.image) + '" class="tp-line-icon" alt="' + escapeHtml(name) + '" loading="lazy">';
      html += '<div class="tp-line-info">';
      html += '<div class="tp-line-name">' + escapeHtml(name) + '</div>';
      html += '</div></div>';
      html += '</a>';
    }

    container.innerHTML = html;
  }

  function showLineView(lineId) {
    currentLine = lineId;
    var fusedLine = window.DataFusion ? DataFusion.getLine(lineId) : null;
    if (!fusedLine) return;

    window.location.hash = lineId;

    if (container) { container.classList.add('hidden'); }
    if (viewElement) { viewElement.classList.remove('hidden'); }
    if (titleElement) titleElement.innerHTML = '' + escapeHtml(fusedLine.nameEn || fusedLine.name);

    if (mapElement) renderTrainMap(mapElement, fusedLine, lineId);
  }

  function hideLineView() {
    currentLine = null;
    if (container) container.classList.remove('hidden');
    if (viewElement) viewElement.classList.add('hidden');
    var fusedData = window.DataFusion ? DataFusion.getFusedData() : null;
    if (fusedData) renderLineList(container, fusedData);
  }

  function renderTrainMap(container, line, lineId) {
    var positions = line.realtimePositions || [];
    var delayInfo = line.delayInfo || {};

    if (!positions || positions.length === 0) {
      // Show delay info instead of empty state
      var statusText = delayInfo.status === 'suspended' ? '运休' : (delayInfo.status === 'delayed' ? '延误' : '正常运行');
      var statusColor = delayInfo.status === 'suspended' ? '#ff4757' : (delayInfo.status === 'delayed' ? '#ffa502' : '#00a04e');
      var html = '<div class="tp-delay-info">';
      html += '<div class="tp-status-badge" style="color:' + statusColor + ';border:1px solid ' + statusColor + ';">' + statusText + '</div>';
      if (delayInfo.maxDelay > 0) {
        html += '<div class="tp-delay-text">最大延误 +' + delayInfo.maxDelay + '分</div>';
      }
      if (delayInfo.interval) {
        html += '<div class="tp-interval-text">区间: ' + escapeHtml(delayInfo.interval) + '</div>';
      }
      if (delayInfo.cause) {
        html += '<div class="tp-cause-text">' + escapeHtml(delayInfo.cause) + '</div>';
      }
      html += '</div>';
      container.innerHTML = html;
      return;
    }

    var stationSpacing = 45;
    var totalHeight = 60 + line.stations.length * stationSpacing + 30;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 ' + totalHeight + '" preserveAspectRatio="xMidYMid meet">';
    svg += '<defs><filter id="glow"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';

    svg += '<line x1="70" y1="60" x2="70" y2="' + (60 + (line.stations.length - 1) * stationSpacing) + '" stroke="#e0e0e0" stroke-width="4" stroke-linecap="round"/>';

    line.stations.forEach(function(station, i) {
      var y = 60 + i * stationSpacing;
      svg += '<circle cx="70" cy="' + y + '" r="6" fill="#fff" stroke="' + (line.color || '#00a04e') + '" stroke-width="2"/>';
      var displayName = station.length > 10 ? station.substring(0, 10) + '...' : station;
      svg += '<text x="85" y="' + (y + 4) + '" font-size="10" fill="#555" font-family="sans-serif">' + escapeHtml(displayName) + '</text>';
    });

    positions.forEach(function(pos) {
      var trainY = 60 + 5 * stationSpacing;
      svg += '<circle cx="70" cy="' + trainY + '" r="8" fill="' + (line.color || '#00a04e') + '" class="tp-train" filter="url(#glow)"/>';
      svg += '<text x="85" y="' + (trainY) + '" font-size="8" fill="#333">' + escapeHtml(pos.id) + '</text>';
      svg += '<title>' + escapeHtml(pos.id) + (pos.stopId ? ' @ ' + escapeHtml(pos.stopId) : '') + '</title>';
    });

    svg += '</svg>';
    container.innerHTML = svg;
  }

  function refreshUI() {
    if (backBtn) {
      backBtn.textContent = '\u2190 ' + t('line_map.back');
    }
    if (!currentLine && container && !container.classList.contains('hidden')) {
      var fusedData = window.DataFusion ? DataFusion.getFusedData() : null;
      if (fusedData) renderLineList(container, fusedData);
    }
    if (currentLine && window.DataFusion) {
      var fusedLine = DataFusion.getLine(currentLine);
      if (fusedLine) showLineView(currentLine);
    }
  }

  window.TrainsPage = {
    init: init,
    refreshUI: refreshUI,
    showLineView: showLineView,
    hideLineView: hideLineView
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();