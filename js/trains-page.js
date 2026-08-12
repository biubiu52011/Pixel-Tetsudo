/*
 * Pixel Tetsudo - Trains Page Controller
 * 列车位置页面控制器
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

  function formatInterval(mins) {
    if (!mins) return '';
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    if (h > 0) return h + 'h' + (m > 0 ? m + 'm' : '');
    return m + 'm';
  }

  var _baseData = null;

  function buildBaseData() {
    var lines = window.UNIFIED_LINES;
    if (!lines) return null;
    var result = { version: 0, timestamp: new Date().toISOString(), lines: {}, lineOrder: [], totalLines: 0 };
    Object.keys(lines).forEach(function(id) {
      var l = lines[id];
      result.lines[id] = {
        id: id, name: l.name, nameEn: l.nameEn || l.name, code: l.code,
        color: l.color, operator: l.operator, region: l.region, type: l.type,
        image: l.image, stations: l.stations || [], durations: l.durations || [],
        intervalTotal: l.durationTotalMin || 0,
        realtimePositions: []
      };
    });
    result.lineOrder = Object.keys(lines);
    result.totalLines = result.lineOrder.length;
    return result;
  }

  function renderCard(line, lineId) {
    var color = line.color || '#888';
    var name = line.nameEn || line.name || lineId;
    var selectedClass = currentLine === lineId ? ' selected' : '';
    var iconHtml = line.image
      ? '<img class="rs-line-icon" src="' + escapeHtml(line.image) + '" alt="">'
      : '<div class="rs-code-badge" style="background:' + escapeHtml(color) + ';">' + escapeHtml(line.code) + '</div>';
    var interval = formatInterval(line.intervalTotal);
    return '<div class="rs-line-card' + selectedClass + '" data-line="' + escapeHtml(lineId)
      + '" style="--line-color:' + escapeHtml(color) + ';">'
      + '<div class="rs-line-header">'
      + iconHtml
      + '<div class="rs-line-info">'
      + '<div class="rs-line-name">' + escapeHtml(name) + '</div>'
      + (interval ? '<div class="rs-line-interval">' + escapeHtml(interval) + '</div>' : '')
      + '</div>'
      + '</div></div>';
  }

  function renderLineList(el, fusedData) {
    if (!el || !fusedData || !fusedData.lines) return;
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
    el.innerHTML = html;
  }

  function init() {
    container = document.getElementById('trainsLineListContent');
    viewElement = document.getElementById('trainsDetailView');
    titleElement = document.getElementById('trainsDetailTitle');
    mapElement = document.getElementById('trainsMapContainer');
    backBtn = document.getElementById('trainsBackBtn');
    if (!container) return;

    container.addEventListener('click', function(e) {
      var card = e.target.closest('.rs-line-card');
      if (card) showLineView(card.dataset.line);
    });

    _baseData = buildBaseData();
    if (_baseData) renderLineList(container, _baseData);

    if (window.DataFusion) {
      window.DataFusion.subscribe(function(fusedData) {
        if (fusedData && fusedData.lines) {
          renderLineList(container, fusedData);
          if (currentLine) {
            var fl = window.DataFusion.getLine(currentLine);
            if (fl) renderTrainMap(mapElement, fl, currentLine);
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
    if (hash && hash.length > 1) showLineView(hash.substring(1));
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
      if (!currentLine) showLineView(lineId);
    } else if (!hash && currentLine) {
      hideLineView();
    }
  }

  function showLineView(lineId) {
    currentLine = lineId;
    var fusedLine = window.DataFusion ? window.DataFusion.getLine(lineId) : null;
    if (!fusedLine && _baseData && _baseData.lines[lineId]) {
      fusedLine = _baseData.lines[lineId];
    }
    if (!fusedLine) return;
    window.location.hash = lineId;
    if (container) container.classList.add('hidden');
    if (viewElement) viewElement.classList.remove('hidden');
    if (titleElement) titleElement.innerHTML = '' + escapeHtml(fusedLine.nameEn || fusedLine.name);
    if (mapElement) renderTrainMap(mapElement, fusedLine, lineId);
  }

  function hideLineView() {
    currentLine = null;
    if (container) container.classList.remove('hidden');
    if (viewElement) viewElement.classList.add('hidden');
    var fusedData = window.DataFusion ? window.DataFusion.getFusedData() : null;
    if (fusedData) renderLineList(container, fusedData);
  }

  function renderTrainMap(el, line, lineId) {
    var positions = line.realtimePositions || [];
    var color = line.color || '#00a04e';
    var sp = 32, topPad = 18, botPad = 14;
    var h = topPad + line.stations.length * sp + botPad;
    var svgW = 155;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + svgW + ' ' + h + '" preserveAspectRatio="xMidYMid meet">';
    svg += '<defs><filter id="tg_' + lineId + '"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
    var lineY1 = topPad, lineY2 = topPad + (line.stations.length - 1) * sp;
    svg += '<line x1="45" y1="' + lineY1 + '" x2="45" y2="' + lineY2 + '" stroke="' + color + '" stroke-width="4" stroke-linecap="round" opacity="0.4"/>';
    line.stations.forEach(function(st, i) {
      var y = topPad + i * sp;
      svg += '<circle cx="45" cy="' + y + '" r="5" fill="#fff" stroke="' + color + '" stroke-width="2.5"/>';
      var dn = st.length > 9 ? st.substring(0, 9) + '...' : st;
      svg += '<text x="56" y="' + (y + 3.5) + '" font-size="9" fill="#444" font-family="sans-serif" font-weight="500">' + escapeHtml(dn) + '</text>';
    });
    if (positions && positions.length > 0) {
      positions.forEach(function(pos) {
        var py = topPad + (pos.stationIndex || 0) * sp;
        var tx = 45;
        svg += '<circle cx="' + tx + '" cy="' + py + '" r="6" fill="' + color + '" filter="url(#tg_' + lineId + ')" opacity="0.9"/>';
        svg += '<circle cx="' + tx + '" cy="' + py + '" r="2.5" fill="#fff"/>';
      });
    }
    svg += '</svg>';
    var statusHtml = '';
    if (!positions || positions.length === 0) {
      statusHtml = '<div class="tp-no-data">暂无实时数据</div>';
    } else {
      statusHtml = '<div class="tp-no-data tp-running">列车运行中</div>';
    }
    el.innerHTML = '<div class="tp-map-wrap">' + svg + '</div>' + statusHtml;
  }

  function refreshUI() {
    if (backBtn) backBtn.textContent = '\u2190 ' + t('line_map.back');
    if (!currentLine && container && !container.classList.contains('hidden')) {
      var fd = window.DataFusion ? window.DataFusion.getFusedData() : null;
      if (fd) renderLineList(container, fd);
    }
    if (currentLine && window.DataFusion) {
      var fl = window.DataFusion.getLine(currentLine);
      if (fl) showLineView(currentLine);
    }
  }

  window.TrainsPage = { init: init, refreshUI: refreshUI, showLineView: showLineView, hideLineView: hideLineView };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
