with open(r'"'"'C:\Users\80996\Documents\项目\像素铁道\js\sightseeing.js'"'"', '"'"'a'"'"', encoding='"'"'utf-8'"'"') as f:
    f.write("""
  function renderGrid() {
    if (!dom.grid) return;
    const spots = getSPOTS();
    const stationKey = state.selectedStation;
    const station = spots[stationKey];
    if (!station) {
      dom.grid.innerHTML = '"'"''"'"';
      if (dom.empty) dom.empty.classList.remove('"'"'hidden'"'"');
      return;
    }
    
    if (dom.empty) dom.empty.classList.add('"'"'hidden'"'"');
    
    let spotList = (station.spots || []).map(function(spot, idx) {
      const distText = spot.dist || '"'"''"'"';
      const dir = spot.dir || '"'"''"'"';
      const isAcross = distText ? isAcrossRiver(station.coord[0], station.coord[1], spot.coord[0], spot.coord[1]) : false;
      return { ...spot, distText, dir, isAcross, idx };
    });

    if (state.activeTags.size > 0) {
      spotList = spotList.filter(function(s) {
        const tags = s.tags || [];
        return tags.indexOf('"'"'all'"'"') >= 0 || Array.from(state.activeTags).some(function(t) { return tags.indexOf(t) >= 0; });
      });
    }

    spotList = spotList.filter(function(s) { return !s.isAcross; });
    spotList.sort(function(a, b) { return (a.distText || '"'"''"'"').localeCompare(b.distText || '"'"''"'"'); });

    if (spotList.length === 0) {
      dom.grid.innerHTML = '"'"''"'"';
      if (dom.empty) dom.empty.classList.remove('"'"'hidden'"'"');
      return;
    }

    dom.grid.innerHTML = spotList.map(function(s, idx) {
      const name = s.name || '"'"''"'"';
      const desc = s.desc || '"'"''"'"';
      const tags = s.tags || [];
      const image = s.image || '"'"''"'"';
      const distBadge = s.distText ? '"'"'<span class=\"sm-dist-badge\">'"'"' + s.distText + '"'"'</span>'"'"' : '"'"''"'"';
      
      const thumbHtml = image ? 
        '"'"'<img class=\"sm-thumb-img\" src=\"'"'"' + image + '"'"'\" alt=\"'"'"' + name + '"'"'\">'"'"' :
        '"'"'<span class=\"sm-thumb-icon\">&#x2699;</span>'"'"';
      
      const distRowHtml = s.distText ? '"'"'<p class=\"sm-dist\">'"'"' + s.distText + (s.dir ? '"'"' · '"'"' + s.dir : '"'"''"'"') + '"'"'</p>'"'"' : '"'"''"'"';
      
      const tagsHtml = tags.filter(function(t) { return t !== '"'"'all'"'"'; }).map(function(t) {
        return '"'"'<span>'"'"' + (t.charAt(0).toUpperCase() + t.slice(1)) + '"'"'</span>'"'"';
      }).join('"'"''"'"');

      const detailUrl = '"'"'tourism-detail.html?station='"'"' + encodeURIComponent(stationKey) + '"'"'&index='"'"' + idx;

      return '"'"'<a href=\"'"'"' + detailUrl + '"'"'\" class=\"sm-card\" data-index=\"'"'"' + idx + '"'"'\">'"'"' +
        '"'"'<div class=\"sm-thumb\">'"'"' + thumbHtml + distBadge + '"'"'</div>'"'"' +
        '"'"'<div class=\"sm-body\">'"'"' +
          '"'"'<h3>'"'"' + name + '"'"'</h3>'"'"' +
          distRowHtml +
          '"'"'<p class=\"sm-desc\">'"'"' + desc + '"'"'</p>'"'"' +
          '"'"'<div class=\"sm-card-tags\">'"'"' + tagsHtml + '"'"'</div>'"'"' +
        '"'"'</div>'"'"' +
      '"'"'</a>'"'"';
    }).join('"'"''"'"');
  }

  function renderAll() {
    cacheDom();
    renderHeader();
    renderTagFilters();
    renderGrid();
    updateStationDisplay();
  }
  
  function updateStationDisplay() {
    if (!dom.stationDisplay) return;
    if (state.autoDetected && state.selectedStation) {
      const stationLabel = t('"'"'station_names.'"'"' + state.selectedStation) || state.selectedStation;
      dom.stationDisplay.textContent = stationLabel;
      dom.stationDisplay.classList.add('"'"'sm-station-detected'"'"');
    } else {
      dom.stationDisplay.textContent = t('"'"'tourism.locating'"'"') + '"'"'...'"'"';
      dom.stationDisplay.classList.remove('"'"'sm-station-detected'"'"');
    }
  }

  function bindEvents() {
    if (dom.relocateBtn) {
      dom.relocateBtn.addEventListener('"'"'click'"'"', function(e) {
        e.preventDefault();
        e.stopPropagation();
        initLocation();
      });
    }
  }

  function initLocation() {
    if (typeof navigator === '"'"'undefined'"'"' || !navigator.geolocation) {
      const spots = getSPOTS();
      state.selectedStation = Object.keys(spots)[0] || '"'"'Asakusa'"'"';
      renderAll();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      function(position) {
        state.userLat = position.coords.latitude;
        state.userLng = position.coords.longitude;
        findNearestStation();
      },
      function(error) {
        console.log('"'"'[Sightseeing] Location denied:'"'"', error.message);
        const spots = getSPOTS();
        state.selectedStation = Object.keys(spots)[0] || '"'"'Asakusa'"'"';
        renderAll();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }

  function findNearestStation() {
    const spots = getSPOTS();
    const coords = getStationCoords();
    let nearestStation = null;
    let minDistance = Infinity;

    for (const stationKey of Object.keys(spots)) {
      const station = spots[stationKey];
      if (!station.coord) continue;
      const dist = haversineDistance(state.userLat, state.userLng, station.coord[0], station.coord[1]);
      if (dist < minDistance) { minDistance = dist; nearestStation = stationKey; }
    }

    for (const stationKey of Object.keys(coords)) {
      if (spots[stationKey]) continue;
      const coord = coords[stationKey];
      const dist = haversineDistance(state.userLat, state.userLng, coord[0], coord[1]);
      if (dist < minDistance) { minDistance = dist; nearestStation = stationKey; }
    }

    if (nearestStation) {
      state.selectedStation = nearestStation;
      state.autoDetected = true;
      renderAll();
    } else {
      renderAll();
    }
  }

  function init(config) {
    config = config || {};
    cacheDom();
    if (config.lang) state.lang = config.lang;
    if (config.station) {
      state.selectedStation = config.station;
      state.autoDetected = false;
    }
    bindEvents();
    updateStationDisplay();
    renderAll();
    setTimeout(initLocation, 500);
  }

  function setLang(lang) {
    state.lang = lang;
    renderAll();
  }

  function setStation(stationKey) {
    const spots = getSPOTS();
    if (!spots[stationKey]) return;
    state.selectedStation = stationKey;
    state.autoDetected = false;
    state.activeTags.clear();
    renderAll();
  }

  window.SightseeingModule = { init: init, setLang: setLang, setStation: setStation };

  if (typeof window.onLanguageChange === '"'"'function'"'"') {
    window.onLanguageChange(function() { renderAll(); });
  }

  if (document.readyState === '"'"'loading'"'"') {
    document.addEventListener('"'"'DOMContentLoaded'"'"', init);
  } else {
    init();
  }
})();
""'"'"')
print('"'"'Part 2 written'"'"')
