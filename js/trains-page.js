/*
 * Pixel Tetsudo - Trains Page Controller
 * 髫ｰ・ｾ繝ｻ・ｯ髫ｰ謔ｶ繝ｻhash 髯ｷﾂ郢晢ｽｻ陟暮斡諱ｪ繝ｻ・ｳ鬮ｴ髮｣・ｽ・ｬ - 鬩包ｽｶ鬮｢ﾂ鬯ｮ繝ｻ豸慕ｹ晢ｽｻ繝ｻ・ｱ・つ
 */
(function() {
  'use strict';

  const LOCAL_DATA_URL = '../data/api/trains.json';

  let apiSupported = false;
  let localTrains = {};
  let referenceTime = Math.floor(new Date().getHours() * 60 + new Date().getMinutes());
  let simulationRunning = false;
  let tickInterval = null;
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

    if (!window.UNIFIED_LINES) {
      console.error('[TrainsPage] UNIFIED_LINES not found');
      return;
    }

    if (!window.TRAINS) {
      window.TRAINS = {};
    }

    if (backBtn) {
      backBtn.addEventListener('click', function() {
        window.location.hash = '';
      });
      backBtn.textContent = '驕ｶ鄙ｫ繝ｻ' + t('line_map.back');
    }

    var hash = window.location.hash;
    if (hash && hash.length > 1) {
      var lineId = hash.substring(1);
      if (window.UNIFIED_LINES[lineId]) {
        loadTrainData().then(function() {
          showLineView(lineId);
        });
        return;
      }
    }

    loadTrainData().then(function() {
      referenceTime = Math.floor(new Date().getHours() * 60 + new Date().getMinutes());
      renderLineList(container);
    }).catch(function(err) {
      console.error('[TrainsPage] Failed to load train data:', err);
      renderLineList(container);
    });

    window.addEventListener('hashchange', handleHashChange);

    if (typeof window.onLanguageChange === 'function') {
      window.onLanguageChange(function() {
        refreshUI();
      });
    }

    console.log('[TrainsPage] Initialized with', Object.keys(window.UNIFIED_LINES).length, 'lines');
  }

  function handleHashChange() {
    var hash = window.location.hash;
    if (hash && hash.length > 1) {
      var lineId = hash.substring(1);
      if (window.UNIFIED_LINES[lineId] && !currentLine) {
        showLineView(lineId);
      }
    } else if (!hash && currentLine) {
      hideLineView();
    }
  }

  function loadTrainData() {
    return window.DataLayer.fetchJSON(LOCAL_DATA_URL, 'trains_data')
      .then(function(data) {
        apiSupported = true;
        console.log('[TrainsPage] Using API train data');
        if (data && data.trains) {
          Object.keys(data.trains).forEach(function(lineId) {
            localTrains[lineId] = data.trains[lineId];
          });
          window.TRAINS = localTrains;
        }
        return localTrains;
      })
      .catch(function() {
        apiSupported = false;
        console.log('[TrainsPage] API not available, using local simulation data');
        if (window.TRAINS && Object.keys(window.TRAINS).length > 0) {
          localTrains = window.TRAINS;
        } else {
          generateSimulatedData();
        }
        return localTrains;
      });
  }

  function generateSimulatedData() {
    console.log('[TrainsPage] Generating simulated train data');
    localTrains = {};
    var lines = window.UNIFIED_LINES || {};
    var codes = {
      'Yamanote': 'JY', 'KeihinTohoku': 'JK', 'Yokosuka': 'JO', 'ChuoRapid': 'JC',
      'Saikyo': 'JA', 'Joban': 'JJ', 'SobuLocal': 'JB', 'Keiyo': 'JE',
      'Musashino': 'JM', 'ShonanShinjuku': 'JS', 'Takasaki': 'JT', 'Tsurumi': 'JV',
      'Nambu': 'JN', 'Tokaido': 'JD', 'JobanLocal': 'JJ', 'Ginza': 'G',
      'Marunouchi': 'M', 'Hibiya': 'H', 'Yurakucho': 'Y', 'Tozai': 'T',
      'Asakusa': 'A', 'Mita': 'I', 'Shinjuku': 'S', 'Oedo': 'E',
      'Yurikamome': 'U', 'SeibuShinjuku': 'SK', 'Odawara': 'OH', 'Keio': 'KO',
      'TobuIsesaki': 'TI', 'TobuSkytree': 'TS', 'TobuNikko': 'TN',
      'TokyuToyoko': 'TY', 'YokohamaBlue': 'BL', 'Keisei': 'KS',
      'SeibuIkebukuro': 'SI', 'SeibuChichibu': 'SC', 'SeibuTamako': 'ST',
      'SeibuTamagawa': 'SM', 'OdakyuEnoshima': 'OE', 'TobuNoda': 'SN',
      'TamaMonorail': 'TM', 'Rinko': 'R', 'HitachiNakaKaimin': 'TX'
    };
    
    for (var lineId in lines) {
      var line = lines[lineId];
      var code = codes[lineId] || 'XX';
      localTrains[lineId] = [];
      for (var i = 1; i <= 5; i++) {
        localTrains[lineId].push({
          id: code + String(i).padStart(2, '0'),
          type: line.type === 'loop' ? 'Loop' : 'Local',
          destination: line.stations[Math.floor(Math.random() * line.stations.length)] || 'via',
          cars: 6 + Math.floor(Math.random() * 6),
          delay: Math.floor(Math.random() * 5),
          departAt: 360 + Math.floor(Math.random() * 600)
        });
      }
    }
    window.TRAINS = localTrains;
  }

  function renderLineList(container) {
    var lines = window.UNIFIED_LINES || {};
    var trains = window.TRAINS || {};

    var html = '';

    var operatorGroups = {};
    for (var lineId in lines) {
      var line = lines[lineId];
      var op = line.operator || t('line.other');
      if (!operatorGroups[op]) operatorGroups[op] = [];
      operatorGroups[op].push(lineId);
    }

    var operators = Object.keys(operatorGroups).sort();
    for (var opIdx = 0; opIdx < operators.length; opIdx++) {
      var op = operators[opIdx];
      html += '<div class="tp-operator-group">';
      html += '<div class="tp-operator-title">' + escapeHtml(op) + '</div>';
      var lineIds = operatorGroups[op];
      for (var i = 0; i < lineIds.length; i++) {
        var lid = lineIds[i];
        var line = lines[lid];
        var lineTrains = trains[lid] || [];
        var color = line.color || '#888';
        var name = line.nameEn || line.name || lid;
        var trainCount = lineTrains.length;

        html += '<a href="#' + escapeHtml(lid) + '" class="tp-line-card" style="--line-color: ' + color + ';">';
        html += '<img src="' + escapeHtml(line.image) + '" class="tp-line-icon" alt="' + escapeHtml(name) + '" loading="lazy">';
        html += '<div class="tp-line-info">';
        html += '<div class="tp-line-name"><span class="tp-live-dot"></span>' + escapeHtml(name) + '</div>';
        html += '<div class="tp-line-detail">';
        html += '<span class="tp-line-operator">' + escapeHtml(line.operator || t('line.other')) + '</span>';
        var lineType = line.type === 'loop' ? t('line.loop') : t('line.straight');
        html += '<span class="tp-line-type">' + escapeHtml(lineType) + '</span>';
        html += '<span class="tp-train-count">' + trainCount + ' ' + t('unit.car') + '</span>';
        html += '</div></div>';
        html += '<span class="tp-line-arrow">驕ｯ・ｶ繝ｻ・ｺ</span>';
        html += '</a>';
      }
      html += '</div>';
    }

    container.innerHTML = html;
  }

  function showLineView(lineId) {
    currentLine = lineId;
    var line = window.UNIFIED_LINES && window.UNIFIED_LINES[lineId];
    if (!line) return;

    window.location.hash = lineId;

    if (container) { container.classList.add('hidden'); }
    if (viewElement) { viewElement.classList.remove('hidden'); }
    if (titleElement) titleElement.innerHTML = '<span class="tp-live-dot"></span>' + escapeHtml(line.nameEn || line.name);


    startSimulation();
    renderTrainMap(mapElement, line, lineId);
  }

  function hideLineView() {
    if (currentLine) {
      stopSimulation();
      currentLine = null;
    }
    if (window.location.hash) {
      window.location.hash = '';
    }
    if (container) { container.classList.remove('hidden'); }
    if (viewElement) { viewElement.classList.add('hidden'); }
  }

  function renderTrainMap(container, line, lineId) {
    var trains = window.TRAINS && window.TRAINS[lineId] ? window.TRAINS[lineId] : [];

    if (!trains || trains.length === 0) {
      container.innerHTML = '<div class="tp-empty-state">No train data</div>';
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

    trains.forEach(function(train) {
      var pos = computePosition(line, train, referenceTime);
      if (pos) {
        var y = 60 + pos.stationIndex * stationSpacing + pos.progress * stationSpacing;
        var delayClass = (train.delay || 0) > 0 ? ' tp-train-delayed' : '';
        svg += '<circle cx="70" cy="' + y + '" r="8" fill="' + (line.color || '#00a04e') + '" class="tp-train' + delayClass + '" filter="url(#glow)"/>';
        svg += '<title>' + escapeHtml(train.id) + ' 驕ｶ鄙ｫ繝ｻ' + escapeHtml(train.destination) + (train.delay > 0 ? ' (+' + train.delay + 'min)' : '') + '</title>';
      }
    });

    svg += '</svg>';
    container.innerHTML = svg;
  }

  function computePosition(line, train, refTime) {
    var stations = line.stations || [];
    var durations = line.durations || [];
    if (!stations.length || stations.length < 2) return null;

    var isLoop = line.type === 'loop';
    var totalDuration = durations.reduce(function(a, b) { return a + b; }, 0);
    if (totalDuration === 0) return null;

    var departMinutes = train.departAt || 0;
    var delayMinutes = train.delay || 0;
    var elapsed = refTime + delayMinutes - departMinutes;
    var wrapElapsed = isLoop ? ((elapsed % totalDuration) + totalDuration) % totalDuration : Math.max(0, Math.min(elapsed, totalDuration));

    var cumulative = 0;
    for (var i = 0; i < durations.length; i++) {
      cumulative += durations[i];
      if (wrapElapsed <= cumulative) {
        var segElapsed = wrapElapsed - (cumulative - durations[i]);
        var progress = durations[i] > 0 ? segElapsed / durations[i] : 0;
        return {
          stationIndex: i,
          nextStationIndex: Math.min(i + 1, stations.length - 1),
          progress: Math.min(1, Math.max(0, progress)),
          station: stations[i],
          nextStation: stations[i + 1] || stations[0]
        };
      }
    }

    return {
      stationIndex: stations.length - 1,
      nextStationIndex: 0,
      progress: 1,
      station: stations[stations.length - 1],
      nextStation: stations[0]
    };
  }

  function startSimulation() {
    if (simulationRunning) return;
    simulationRunning = true;
    tickInterval = setInterval(tick, 2000);
  }

  function stopSimulation() {
    if (tickInterval) {
      clearInterval(tickInterval);
      tickInterval = null;
    }
    simulationRunning = false;
  }

  function tick() {
    if (!currentLine) return;
    referenceTime += 1;
    var line = window.UNIFIED_LINES && window.UNIFIED_LINES[currentLine];
    if (!line) return;
    if (mapElement) renderTrainMap(mapElement, line, currentLine);

  }



  function refreshUI() {
    if (backBtn) {
      backBtn.textContent = '驕ｶ鄙ｫ繝ｻ' + t('line_map.back');
    }
    if (!currentLine && container && !container.classList.contains('hidden')) {
      renderLineList(container);
    }
    if (currentLine && window.UNIFIED_LINES[currentLine]) {
      showLineView(currentLine);
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