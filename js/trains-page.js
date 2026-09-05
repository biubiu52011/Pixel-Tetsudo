/*
 * Pixel Tetsudo - Train Location Page Controller
 * v4 - 从 railway_data.json 加载 stations/durations + line-control.js 元数据
 */
(function() {
  "use strict";
  var currentLine = null;
  var listEl = null;
  var detailEl = null;
  var titleEl = null;
  var filterBarEl = null;
  var mapEl = null;
  var backBtn = null;
  var _selectedOperator = null;
  var _lastPositionsHash = '';
  var t = window.t || function(k) { return k; };
  var escapeHtml = window.escapeHtml || function(s) {
    if (!s) return "";
    if (typeof s !== "string") return "";
    if (s.indexOf("&") < 0 && s.indexOf("<") < 0 && s.indexOf(">") < 0 && s.indexOf('"') < 0 && s.indexOf("'") < 0) return s;
    var d = document.createElement("div"); d.textContent = s; return d.innerHTML;
  };

  // Branch map: branch ID -> parent ID
  var _BRANCH_MAP = {
    "KeikyuAirport": "Keikyu", "KeikyuDaishi": "Keikyu", "KeikyuKurihama": "Keikyu", "KeikyuZushi": "Keikyu",
    "TobuSkytreeBranch": "TobuSkytree", "TobuKameido": "TobuSkytree", "TobuDaishi": "TobuIsesaki",
    "TobuKoizumiBranch": "TobuKoizumi",
    "SotetsuIzumino": "SotetsuMain", "SotetsuShinYokohama": "SotetsuMain",
    "MarunouchiBranch": "Marunouchi",
    "TsurumiUmigippu": "Tsurumi", "TsurumiOokawa": "Tsurumi"
  };


  function detectBranches(lines) {
    var byImage = {};
    var ids = Object.keys(lines);
    for (var i = 0; i < ids.length; i++) {
      var img = lines[ids[i]].image || "";
      if (!img) continue;
      if (!byImage[img]) byImage[img] = [];
      byImage[img].push(ids[i]);
    }
    var imageKeys = Object.keys(byImage);
    for (var j = 0; j < imageKeys.length; j++) {
      var group = byImage[imageKeys[j]];
      if (group.length < 2) continue;
      var parentKey = null;
      for (var k = 0; k < group.length; k++) {
        if (_BRANCH_MAP[group[k]]) { parentKey = _BRANCH_MAP[group[k]]; break; }
      }
      if (!parentKey) {
        group.sort(function(a, b) { return lines[a].code.length - lines[b].code.length; });
        parentKey = group[0];
      }
      for (var k = 0; k < group.length; k++) {
        if (group[k] !== parentKey && !lines[group[k]].branchOf) {
          lines[group[k]].branchOf = parentKey;
        }
      }
    }
  }

  function getLinesData() {
    // Priority 1: DataFusion fused data (has realtimePositions for train location)
    if (window.DataFusion) {
      var fused = window.DataFusion.getFusedData();
      if (fused && fused.lines && Object.keys(fused.lines).length > 0) {
        return fused.lines;
      }
    }
    // Priority 2: DataLayer (RailwayDB-first) raw data, no realtime positions
    var rawLines = window.DataLayer ? window.DataLayer.getAllLines() : (window.UNIFIED_LINES || {});
    var ul = Array.isArray(rawLines) ? (function() { var d = {}; rawLines.forEach(function(l) { d[l.id || l.line_id] = l; }); return d; })() : rawLines;
    if (!ul) return {};
    var lines = {};
    var ids = Object.keys(ul);
    for (var i = 0; i < ids.length; i++) {
      var l = ul[ids[i]];
      if (!l) continue;
      lines[ids[i]] = {
        id: ids[i],
        name: l.name || ids[i],
        nameEn: l.nameEn || l.name || ids[i],
        code: l.code || ids[i],
        color: l.color || "#888888",
        operator: l.operator || "Unknown",
        region: l.region || "",
        type: l.type || "straight",
        image: l.image || "",
        stations: l.stations || [],
        durations: l.durations || [],
        realtimePositions: [],
        nameJa: l.nameJa || l.name || ids[i],
        branchOf: l.branchOf || null
      };
    }
    return lines;
  }

  function getRealtimePositions(lineId) {
    try {
      if (window.DataFusion && window.DataFusion.getRealtimePositions) {
        var pos = window.DataFusion.getRealtimePositions(lineId);
        if (pos && pos.length > 0) return pos;
      }
      // Fallback: check cached positions from IndexedDB
      if (window.DataLayer && window.DataLayer.getCachedPositions) {
        var cp = window.DataLayer.getCachedPositions(lineId);
        if (cp && cp.length > 0) return cp;
      }
      // Compat fallback: check UNIFIED_LINES cachedPositions
      var ul = window.UNIFIED_LINES;
      if (ul && ul[lineId] && ul[lineId].cachedPositions) {
        return ul[lineId].cachedPositions;
      }
    } catch(e) {}
    return [];
  }
  function renderTrainMap(el, line, lineId) {
    try {
      var positions = getRealtimePositions(lineId);
      
      // Incremental update: if SVG already exists, only update train icon positions for smooth animation
      var existingSvg = el.querySelector('svg');
      if (existingSvg && positions.length > 0) {
        var _color = line.color || "#008803";
        var _stations = line.stations || [];
        var _isLoop = line.type === "loop";
        var _sp = 30, _topP = 16;
        var _allLines = getLinesData();
        var _branchOffset = 0;
        for (var _bid in _allLines) {
          if (_allLines[_bid].branchOf === lineId && _bid !== lineId) _branchOffset += 70;
        }
        var _mainCx = (_isLoop ? 130 : (190 + _branchOffset) / 2);
        var _loopPts = [];
        if (_isLoop && _stations.length > 2) {
          var _loopRectH = Math.max(_stations.length * 36 / 2 - 80, 140);
          var _svgW = 260, _svgH = _loopRectH + 80;
          var _cx = _svgW / 2, _cy = _svgH / 2;
          var _rectW = 80, _rectH = _loopRectH;
          var _halfW = _rectW / 2, _halfH = _rectH / 2;
          var _perimeter = 2 * (_rectW + _rectH);
          var _startOffset = _rectW / 2;
          for (var _li = 0; _li < _stations.length; _li++) {
            var _pos = ((_li / _stations.length) * _perimeter + _startOffset) % _perimeter;
            var _lx, _ly;
            if (_pos < _rectW) { _lx = _cx - _halfW + _pos; _ly = _cy - _halfH; }
            else if (_pos < _rectW + _rectH) { _lx = _cx + _halfW; _ly = _cy - _halfH + (_pos - _rectW); }
            else if (_pos < 2 * _rectW + _rectH) { _lx = _cx + _halfW - (_pos - _rectW - _rectH); _ly = _cy + _halfH; }
            else { _lx = _cx - _halfW; _ly = _cy + _halfH - (_pos - 2 * _rectW - _rectH); }
            _loopPts.push({ x: _lx, y: _ly });
          }
        }
        var _updatedIds = {};
        var _hasChanges = false;
        for (var _pi = 0; _pi < positions.length; _pi++) {
          var _p = positions[_pi];
          var _idx = Math.min(_p.stationIndex || 0, _stations.length - 1);
          var _px, _py;
          if (_isLoop && _loopPts.length > _idx) { _px = _loopPts[_idx].x; _py = _loopPts[_idx].y; }
          else { _px = _mainCx; _py = _topP + _idx * _sp; }
          var _trainUid = _p.trainId || ("train_" + _pi);
          _updatedIds[_trainUid] = true;
          var _existingIcon = existingSvg.querySelector('[data-train-id="' + String(_trainUid).replace(/"/g, '') + '"]');
          if (_existingIcon) {
            var _oldX = parseFloat(_existingIcon.getAttribute('x'));
            var _oldY = parseFloat(_existingIcon.getAttribute('y'));
            var _newX = _px - 10, _newY = _py - 12;
            if (Math.abs(_oldX - _newX) > 0.5 || Math.abs(_oldY - _newY) > 0.5) {
              _existingIcon.setAttribute('x', _newX);
              _existingIcon.setAttribute('y', _newY);
              _hasChanges = true;
            }
          } else {
            // Create new train icon for newly appeared train
            var _iconSrc = (window.TrainIcons && typeof window.TrainIcons.getTrainIcon === "function") ? window.TrainIcons.getTrainIcon(lineId, line.operator) : "";
            var _isEst = _p.estimated === true;
            var _iconCls = _isEst ? "train-icon estimated" : "train-icon";
            var _newIcon = document.createElementNS("http://www.w3.org/2000/svg", "image");
            _newIcon.setAttribute("data-train-id", String(_trainUid));
            _newIcon.setAttribute("x", String(_px - 10));
            _newIcon.setAttribute("y", String(_py - 12));
            _newIcon.setAttribute("width", "20");
            _newIcon.setAttribute("height", "24");
            if (_iconSrc) _newIcon.setAttribute("href", _iconSrc);
            _newIcon.setAttribute("class", _iconCls);
            _newIcon.setAttribute("preserveAspectRatio", "xMidYMid meet");
            existingSvg.appendChild(_newIcon);
            _hasChanges = true;
          }
        }
        var _allIcons = existingSvg.querySelectorAll('[data-train-id]');
        for (var _ii = 0; _ii < _allIcons.length; _ii++) {
          var _tid = _allIcons[_ii].getAttribute('data-train-id');
          if (!_updatedIds[_tid]) {
            _allIcons[_ii].parentNode.removeChild(_allIcons[_ii]);
            _hasChanges = true;
          }
        }
        var _runningEl = el.querySelector('.tp-running');
        if (_runningEl) {
          var _running = t("trains.running");
          var _cntText = t("trains.train_count");
          _runningEl.innerHTML = _running + " (" + positions.length + " " + _cntText + ")";
        }
        if (positions.length > 0) return;
      }
  
      var color = line.color || "#008803";
      var stations = line.stations || [];
      // Merge stations from same LOS running system
      var _sysInfo = null;
      if (window.LineOperationSystems) {
        for (var _opKey in window.LineOperationSystems) {
          var _opSys = window.LineOperationSystems[_opKey];
          if (!Array.isArray(_opSys)) continue;
          for (var _si = 0; _si < _opSys.length; _si++) {
            if (_opSys[_si].lineIds && _opSys[_si].lineIds.indexOf(lineId) >= 0) {
              _sysInfo = _opSys[_si];
              break;
            }
          }
          if (_sysInfo) break;
        }
      }
      if (_sysInfo) {
        var _allLines = getLinesData();
        var _merged = [];
        var _seen = {};
        for (var _li = 0; _li < _sysInfo.lineIds.length; _li++) {
          var _sub = _allLines[_sysInfo.lineIds[_li]];
          if (!_sub || !_sub.stations) continue;
          for (var _sj = 0; _sj < _sub.stations.length; _sj++) {
            var _stid = _sub.stations[_sj];
            if (!_seen[_stid]) { _seen[_stid] = true; _merged.push(_stid); }
          }
        }
        if (_merged.length > stations.length) { stations = _merged; }
        if (_sysInfo.color) { color = _sysInfo.color; }
      }
      var _lang = window.currentLang || 'ja';
      var _rS = (window.RailwayDB && window.RailwayDB.resolveStationName) ? function(id){ return window.RailwayDB.resolveStationName(id, _lang) || id; } : function(id){ return id; };
      var branchLines = [];
      var allLines = getLinesData();
      for (var lid in allLines) {
        if (allLines[lid].branchOf === lineId && lid !== lineId) {
          var bl = allLines[lid];
          if (bl.stations && bl.stations.length > 0) {
            branchLines.push({ id: lid, name: bl.name || lid, color: bl.color || color, stations: bl.stations });
          }
        }
      }
      var isLoop = line.type === "loop";
      var sp = 30, topP = 16, botP = 14;
      var numBranches = branchLines.length;
      var branchOffset = numBranches > 0 ? 70 * numBranches : 0;
      var loopRectH = Math.max(stations.length * 36 / 2 - 80, 140);
      var svgW = isLoop ? 260 : 190 + branchOffset;
      var svgH = isLoop ? loopRectH + 80 : topP + stations.length * sp + botP;
      var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 " + svgW + " " + svgH + "\" preserveAspectRatio=\"xMidYMid meet\">";
      svg += "<defs><filter id=\"tg_" + escapeHtml(lineId) + "\"><feGaussianBlur stdDeviation=\"2\" result=\"b\"/><feMerge><feMergeNode in=\"b\"/><feMergeNode in=\"SourceGraphic\"/></feMerge></filter></defs>";
      svg += "<rect width=\"" + svgW + "\" height=\"" + svgH + "\" fill=\"var(--bg)\" rx=\"8\"/>";
      var loopPts = [];
      var mainCx = svgW / 2 - branchOffset / 2;
      if (isLoop && stations.length > 2) {
        var spLoop = 36;
        var rectW = 80;
        var rectH = loopRectH;
        var halfW = rectW / 2, halfH = rectH / 2;
        var perimeter = 2 * (rectW + rectH);
        var startOffset = rectW / 2;
        var cx = svgW / 2, cy = svgH / 2;
        for (var i = 0; i < stations.length; i++) {
          var pos = ((i / stations.length) * perimeter + startOffset) % perimeter;
          var lx, ly;
          if (pos < rectW) { lx = cx - halfW + pos; ly = cy - halfH; }
          else if (pos < rectW + rectH) { lx = cx + halfW; ly = cy - halfH + (pos - rectW); }
          else if (pos < 2 * rectW + rectH) { lx = cx + halfW - (pos - rectW - rectH); ly = cy + halfH; }
          else { lx = cx - halfW; ly = cy + halfH - (pos - 2 * rectW - rectH); }
          var side = (pos < rectW) ? "top" : (pos < rectW + rectH ? "right" : (pos < 2 * rectW + rectH ? "bottom" : "left"));
          loopPts.push({ x: lx, y: ly, angle: 0, side: side });
        }
        svg += "<rect x=\"" + (cx - halfW) + "\" y=\"" + (cy - halfH) + "\" width=\"" + rectW + "\" height=\"" + rectH + "\" rx=\"10\" ry=\"10\" stroke=\"" + escapeHtml(color) + "\" stroke-width=\"5\" fill=\"none\" opacity=\"0.35\"/>";
        for (var i = 0; i < stations.length; i++) {
          var p = loopPts[i];
          var st = stations[i];
          var hasTrain = positions.some(function(pp) { return pp.stationIndex === i; });
          svg += "<circle cx=\"" + p.x + "\" cy=\"" + p.y + "\""+ "  r=\"" + (hasTrain ? 6 : 4) + "\""+ "  fill=\"" + (hasTrain ? escapeHtml(color) : "#fff") + "\""+ "  stroke=\"" + escapeHtml(color) + "\""+ "  stroke-width=\"" + (hasTrain ? 2.5 : 2) + "\"/>";
          var dn = st;
          var side = p.side || "right";
          var tx, ty, anchor;
          if (side === "top") { tx = p.x; ty = p.y - 10; anchor = "middle"; }
          else if (side === "bottom") { tx = p.x; ty = p.y + 16; anchor = "middle"; }
          else if (side === "left") { tx = p.x - 10; ty = p.y + 3; anchor = "end"; }
          else { tx = p.x + 10; ty = p.y + 3; anchor = "start"; }
          svg += "<text x=\"" + tx + "\" y=\"" + ty + "\""+ "  font-size=\"9\" fill=\"#444\" font-family=\"sans-serif\" font-weight=\"500\" text-anchor=\"" + anchor + "\">" + escapeHtml(_rS(dn)) + "</text>";
        }
      } else {
        var y1 = topP, y2 = topP + (stations.length - 1) * sp;
        svg += "<line x1=\"" + mainCx + "\" y1=\"" + y1 + "\" x2=\"" + mainCx + "\" y2=\"" + y2 + "\""+ "  stroke=\"" + escapeHtml(color) + "\""+ "  stroke-width=\"5\" stroke-linecap=\"round\" opacity=\"0.35\"/>";
        for (var i = 0; i < stations.length; i++) {
          var st = stations[i];
          var y = topP + i * sp;
          var hasTrain = positions.some(function(p) { return p.stationIndex === i; });
          svg += "<circle cx=\"" + mainCx + "\" cy=\"" + y + "\""+ "  r=\"" + (hasTrain ? 6 : 4) + "\""+ "  fill=\"" + (hasTrain ? escapeHtml(color) : "#fff") + "\""+ "  stroke=\"" + escapeHtml(color) + "\""+ "  stroke-width=\"" + (hasTrain ? 2.5 : 2) + "\"/>";
          svg += "<text x=\"" + (mainCx + 14) + "\" y=\"" + (y + 3.5) + "\""+ "  font-size=\"9\" fill=\"#444\" font-family=\"sans-serif\" font-weight=\"500\">" + escapeHtml(_rS(st)) + "</text>";
        }
      }
      for (var bi = 0; bi < branchLines.length; bi++) {
        var branch = branchLines[bi];
        var bColor = branch.color || color;
        var bStations = branch.stations;
        var junctionIdx = -1;
        for (var si = 0; si < bStations.length; si++) {
          var bs = bStations[si];
          for (var mi = 0; mi < stations.length; mi++) {
            if (stations[mi] === bs) { junctionIdx = mi; break; }
          }
          if (junctionIdx >= 0) break;
        }
        if (junctionIdx < 0) junctionIdx = 0;
        var bx, by;
        if (isLoop && loopPts.length > junctionIdx) {
          bx = loopPts[junctionIdx].x + 20 + bi * 70;
          by = loopPts[junctionIdx].y;
        } else {
          var bjy = topP + junctionIdx * sp;
          bx = mainCx + 20 + bi * 70;
          by = bjy;
        }
        var branchTop = isLoop ? by : topP;
        var branchBot = isLoop ? by : topP + (bStations.length - 1) * sp;
        svg += "<line x1=\"" + (isLoop ? loopPts[junctionIdx].x : mainCx) + "\" y1=\"" + by + "\" x2=\"" + bx + "\" y2=\"" + by + "\""+ "  stroke=\"" + escapeHtml(bColor) + "\""+ "  stroke-width=\"3\" opacity=\"0.5\"/>";
        svg += "<line x1=\"" + bx + "\" y1=\"" + branchTop + "\" x2=\"" + bx + "\" y2=\"" + branchBot + "\""+ "  stroke=\"" + escapeHtml(bColor) + "\""+ "  stroke-width=\"4\" stroke-linecap=\"round\" opacity=\"0.4\"/>";
        for (var bsi = 0; bsi < bStations.length; bsi++) {
          var bsy = branchTop + bsi * sp;
          var isJunc = (bsi === 0 && junctionIdx >= 0 && stations[junctionIdx] === bStations[0]);
          svg += "<circle cx=\"" + bx + "\" cy=\"" + bsy + "\""+ "  r=\"" + (isJunc ? 5 : 4) + "\""+ "  fill=\"" + (isJunc ? escapeHtml(bColor) : "#fff") + "\""+ "  stroke=\"" + escapeHtml(bColor) + "\""+ "  stroke-width=\"2\"/>";
        }
        svg += "<text x=\"" + bx + "\" y=\"" + (branchTop - 6) + "\""+ "  font-size=\"8\" fill=\"" + escapeHtml(bColor) + "\""+ "  font-family=\"sans-serif\" font-weight=\"600\" text-anchor=\"middle\">" + escapeHtml(branch.name) + "</text>";
      }
      for (var j = 0; j < positions.length; j++) {
        var p = positions[j];
        var idx = Math.min(p.stationIndex || 0, stations.length - 1);
        var px, py;
        if (isLoop && loopPts.length > idx) {
          px = loopPts[idx].x;
          py = loopPts[idx].y;
        } else {
          px = mainCx;
          py = topP + idx * sp;
        }
        // Train icon (20x24, centered)
        var iconSrc = (window.TrainIcons && typeof window.TrainIcons.getTrainIcon === "function") ? window.TrainIcons.getTrainIcon(lineId, line.operator) : "";
        var isEstimated = p.estimated === true;
        var iconClass = isEstimated ? "train-icon estimated" : "train-icon";
        if (iconSrc) {
          var trainUid = p.trainId || ("train_" + j);
        svg += "<image data-train-id=\"" + escapeHtml(trainUid) + "\" x=\"" + (px - 10) + "\" y=\"" + (py - 12) + "\" width=\"20\" height=\"24\" href=\"" + escapeHtml(iconSrc) + "\" class=\"" + iconClass + "\" preserveAspectRatio=\"xMidYMid meet\"/>";
        } else {
          svg += "<circle cx=\"" + px + "\" cy=\"" + py + "\""+ "  r=\"8\" fill=\"" + escapeHtml(color) + "\""+ "  filter=\"url(#tg_" + escapeHtml(lineId) + ")\" opacity=\"0.9\"/>";
          
        }
        svg += "<circle cx=\"" + px + "\" cy=\"" + py + "\""+ "  r=\"3\" fill=\"#fff\"/>";
      }
      svg += "</svg>";
      var noData = t("trains.no_data");
      var loading = t("trains.loading");
      var running = t("trains.running");
      var cntText = t("trains.train_count");
      var info = "";
      if (positions.length === 0) {
        info = '<div class="tp-no-data">' + noData + '<br><span style="font-size:11px;color:var(--text-muted)">' + loading + '</span></div>';
      } else {
        info = '<div class="tp-no-data tp-running">' + running + " (" + positions.length + " " + cntText + ")" + '</div>';
      }
      el.innerHTML = '<div class="tp-map-wrap">' + svg + "</div>" + info;
    } catch(e) {
      el.innerHTML = '<div class="tp-no-data">Error: ' + escapeHtml(e.message) + '</div>';
    }
  }

  function showLineView(lineId) {
    try {
      var lines = getLinesData();
      var fusedLine = lines[lineId];
      if (!fusedLine) return;
      currentLine = lineId;
      window.location.hash = lineId;
      if (listEl) listEl.classList.add("hidden");
      if (filterBarEl) filterBarEl.classList.add("hidden");
      if (detailEl) detailEl.classList.remove("hidden");
      var _title = (window.RailwayDB && window.RailwayDB.resolveLineName ? window.RailwayDB.resolveLineName(lineId, window.currentLang) : (fusedLine.nameEn || fusedLine.nameJa || lineId));
      if (window.LineOperationSystems) {
        for (var _opKey2 in window.LineOperationSystems) {
          var _opSys2 = window.LineOperationSystems[_opKey2];
          if (!Array.isArray(_opSys2)) continue;
          var _found = false;
          for (var _si2 = 0; _si2 < _opSys2.length; _si2++) {
            var _sys2 = _opSys2[_si2];
            if (_sys2.lineIds && _sys2.lineIds.indexOf(lineId) >= 0) {
              var _lang2 = window.currentLang || "ja";
              if (_lang2 === "zh" && _sys2.nameZh) _title = _sys2.nameZh;
              else if (_lang2 === "en" && _sys2.nameEn) _title = _sys2.nameEn;
              else if (_lang2 === "ko" && _sys2.nameKo) _title = _sys2.nameKo;
              else if (_sys2.nameJa) _title = _sys2.nameJa;
              _found = true;
              break;
            }
          }
          if (_found) break;
        }
      }
      if (titleEl) titleEl.textContent = _title;
      if (mapEl) renderTrainMap(mapEl, fusedLine, lineId);
    } catch(e) {}
  }

  function hideLineView() {
    try {
      currentLine = null;
      if (listEl) listEl.classList.remove("hidden");
      if (filterBarEl) filterBarEl.classList.remove("hidden");
      if (detailEl) detailEl.classList.add("hidden");
      renderList(listEl);
    } catch(e) {}
  }

  // ========== Load cached real-time positions from IndexedDB ==========
  function loadCachedPositions(callback) {
    try {
      if (window.RailwayRTC && window.RailwayRTC.loadPositions) {
        window.RailwayRTC.loadPositions().then(function(positions) {
          if (positions && Object.keys(positions).length > 0) {
            // Store cached positions in DataLayer
            if (window.DataLayer && window.DataLayer.setCachedPositions) {
              Object.keys(positions).forEach(function(lid) {
                if (positions[lid] && positions[lid].length > 0) {
                  window.DataLayer.setCachedPositions(lid, positions[lid]);
                }
              });
            } else {
              // Compat fallback: merge into UNIFIED_LINES
              var ul = window.UNIFIED_LINES;
              if (ul) {
                Object.keys(positions).forEach(function(lid) {
                  if (ul[lid] && positions[lid].length > 0) {
                    ul[lid].cachedPositions = positions[lid];
                  }
                });
              }
            }
          }
          if (callback) callback();
        }).catch(function(e) { console.warn("[trains] Cache load error:", e.message); if (callback) callback(); });
      } else {
        if (callback) callback();
      }
    } catch(e) { if (callback) callback(); }
  }

  function renderList(el) {
    if (!el || !window.DataState) return;
    var lines = window.DataLayer ? window.DataLayer.getAllLines() : (window.UNIFIED_LINES || {});
    var ul = Array.isArray(lines) ? (function(){ var d={}; lines.forEach(function(l){ d[l.id||l.line_id]=l; }); return d; })() : lines;
    if (!ul || Object.keys(ul).length === 0) { el.innerHTML = ''; return; }
    var lineOrder = (window.LinePresentationService && window.UNIFIED_LINES) ? window.LinePresentationService.getDisplayOrder(window.UNIFIED_LINES) : []; try { window.DataState.renderList(el, ul, { mode: "trains", lineOrder: lineOrder }); } catch(e) { el.innerHTML = "<div class=\"rs-error\">Render failed</div>"; }
  }

  function init() {
    try {
      listEl = document.getElementById("trainsLineListContent");
      detailEl = document.getElementById("trainsDetailView");
      titleEl = document.getElementById("trainsDetailTitle");
      mapEl = document.getElementById("trainsMapContainer");
      filterBarEl = document.getElementById("trainsFilterBar");
      backBtn = document.getElementById("trainsBackBtn");
      if (!listEl) return;
      listEl.addEventListener("click", function(e) {
        var card = e.target.closest(".rs-line-card");
        if (card) showLineView(card.dataset.line);
      });
      if (backBtn) {
        backBtn.addEventListener("click", function() {
          window.location.hash = "";
          hideLineView();
        });
      }
      loadCachedPositions(function() {
        renderList(listEl);
        renderFilterBar(document.getElementById("trainsFilterBar"));
        // Restore hash-based navigation
        var hash = window.location.hash;
        if (hash && hash.length > 1) {
          var lid = hash.substring(1);
          var lines = getLinesData();
          if (lines[lid]) showLineView(lid);
        }
        if (backBtn) backBtn.textContent = "\u2190 " + t("line_map.back");
      });
      // Subscribe to DataState changes to handle late data loading
      if (window.DataState) {
        window.DataState.subscribe(function(lines, delayData, positions) {
          if (!lines || Object.keys(lines).length === 0 || !listEl) return;
          // Build hash of realtimePositions to detect changes (trains page only cares about train positions)
          var posHash = '';
          try {
            var ids = Object.keys(lines);
            for (var i = 0; i < ids.length; i++) {
              var l = lines[ids[i]];
              if (l && l.realtimePositions && l.realtimePositions.length > 0) {
                posHash += ids[i] + ':' + l.realtimePositions.length + ':';
                for (var _pi = 0; _pi < l.realtimePositions.length; _pi++) {
                  var _tp = l.realtimePositions[_pi];
                  posHash += (_tp.trainId || ('t' + _pi)) + '@' + (_tp.stationIndex || 0) + ',';
                }
                posHash += ';';
              }
            }
          } catch(e) {}
          var currentLen = listEl.innerHTML.length;
          // Always render if list is empty (initial load), otherwise only render if positions changed
          if (currentLen === 0) {
            renderList(listEl);
            renderFilterBar(document.getElementById("trainsFilterBar"));
            _lastPositionsHash = posHash;
          } else if (posHash !== _lastPositionsHash) {
            _lastPositionsHash = posHash;
            renderList(listEl);
            // Update train positions on map if detail view is open (incremental update for smooth animation)
            if (currentLine && detailEl && !detailEl.classList.contains("hidden")) {
              var _lines = getLinesData();
              var _fusedLine = _lines[currentLine];
              if (_fusedLine) renderTrainMap(mapEl, _fusedLine, currentLine);
            }
          }
        });
      }
      // Refresh filter bar, list, and line detail view on language switch
      if (typeof window.onLanguageChange === "function") {
        window.onLanguageChange(function() {
          renderFilterBar(document.getElementById("trainsFilterBar"));
          // Re-render list to update line names and operator titles (only if list is visible)
          if (listEl && detailEl && detailEl.classList.contains("hidden")) {
            renderList(listEl);
          }
          // Re-render line detail view if open
          if (currentLine && detailEl && !detailEl.classList.contains("hidden")) {
            showLineView(currentLine);
          }
        });
      }
    } catch(e) {}
  }


  function sortOperators(ops) {
    var order = (window.TransitConstants && window.TransitConstants.OP_ORDER) ? window.TransitConstants.OP_ORDER : [];
    return ops.sort(function(a, b) {
      var ia = order.indexOf(a), ib = order.indexOf(b);
      if (ia >= 0 && ib >= 0) return ia - ib;
      if (ia >= 0) return -1;
      if (ib >= 0) return 1;
      return a.localeCompare(b);
    });
  }

  function renderFilterBar(container) {
    if (!container) return;
    var lines = window.DataLayer ? window.DataLayer.getAllLines() : (window.UNIFIED_LINES || {});
    var ops = {};
    if (Array.isArray(lines)) {
      lines.forEach(function(l) { if (l.operator) ops[l.operator] = true; });
    } else {
      Object.keys(lines).forEach(function(id) {
        var line = lines[id];
        if (line && line.operator) ops[line.operator] = true;
      });
    }
    var opList = sortOperators(Object.keys(ops));
    var html = '';
    var allLabel = (typeof window.t === "function" && window.t("filter.all")) ? window.t("filter.all") : "All";
    html += '<button class="rs-filter-btn' + (_selectedOperator === null ? ' active' : '') + '" data-operator="">' + allLabel + '</button>';
    opList.forEach(function(op) {
      var label = (typeof window.t === "function" && window.t("op." + op)) ? window.t("op." + op) : op;
      html += '<button class="rs-filter-btn' + (_selectedOperator === op ? ' active' : '') + '" data-operator="' + op + '">' + label + '</button>';
    });
    container.innerHTML = html;
    container.querySelectorAll('.rs-filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { setFilter(btn.dataset.operator || null); });
    });
  }

  function setFilter(op) {
    _selectedOperator = op;
    var container = document.getElementById('trainsFilterBar');
    if (container) renderFilterBar(container);
    if (listEl) renderFiltered(listEl);
  }

  function renderFiltered(el) {
    if (!el || !window.DataState) return;
    var allLines = getLinesData(); // dict: lineId -> line
    var filtered = allLines;
    if (_selectedOperator) {
      filtered = {};
      Object.keys(allLines).forEach(function(id) {
        if (allLines[id] && allLines[id].operator === _selectedOperator) {
          filtered[id] = allLines[id];
        }
      });
    }
    if (!filtered || Object.keys(filtered).length === 0) { el.innerHTML = ''; return; }
    var lineOrder = (window.LinePresentationService && window.UNIFIED_LINES) ? window.LinePresentationService.getDisplayOrder(window.UNIFIED_LINES) : []; try { window.DataState.renderList(el, filtered, { mode: "trains", lineOrder: lineOrder }); } catch(e) { el.innerHTML = "<div class=\"rs-error\">Render failed</div>"; }
  }
  window.TrainsPage = {
    init: init,
    refreshUI: function() { renderList(listEl); },
    showLineView: showLineView,
    hideLineView: hideLineView
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
