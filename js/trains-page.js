/*
 * Pixel Tetsudo - Train Location Page Controller
 * v2 - 逶ｴ謗･莉・UNIFIED_LINES DataFusion 貂ｲ譟・
 */
(function() {
  "use strict";
  var currentLine = null;
  var listEl = null;
  var detailEl = null;
  var titleEl = null;
  var mapEl = null;
  var backBtn = null;
  var t = window.t || function(k) { return k; };
  var escapeHtml = window.escapeHtml || function(s) {
    if (!s) return "";
    if (typeof s !== "string") return "";
    if (s.indexOf("&") < 0 && s.indexOf("<") < 0 && s.indexOf(">") < 0 && s.indexOf('"') < 0 && s.indexOf("'") < 0) return s;
    var d = document.createElement("div"); d.textContent = s; return d.innerHTML;
  };
  var tStation = function(s) { return s; };

  // Multilingual line name map
  var LINE_NAMES = {
    "Asakusa": {"ja": "豬・拷郤ｿ", "zh": "豬・拷郤ｿ", "en": "Asakusa", "ko": "・・ぎ・・ｬ・"},
    "Chiyoda": {"ja": "蜊・ｻ｣逕ｰ郤ｿ", "zh": "蜊・ｻ｣逕ｰ郤ｿ", "en": "Chiyoda", "ko": "・們囈・､・"},
    "Fukutoshin": {"ja": "蜑ｯ驛ｽ蠢・ｺｿ", "zh": "蜑ｯ驛ｽ蠢・ｺｿ", "en": "Fukutoshin", "ko": "弡・ｿ奝・・"},
    "Ginza": {"ja": "體ｶ蠎ｧ郤ｿ", "zh": "體ｶ蠎ｧ郤ｿ", "en": "Ginza", "ko": "・ｴ・川│"},
    "Hanzomon": {"ja": "蜊願酪髣ｨ郤ｿ", "zh": "蜊願酪髣ｨ郤ｿ", "en": "Hanzomon", "ko": "﨑懍｡ｰ・ｬ・"},
    "Hibiya": {"ja": "譌･豈碑ｰｷ郤ｿ", "zh": "譌･豈碑ｰｷ郤ｿ", "en": "Hibiya", "ko": "德壱ｹ・幣・"},
    "HitachiNakaKaimin": {"ja": "遲第ｳ｢蠢ｫ郤ｿ", "zh": "遲第ｳ｢蠢ｫ郤ｿ", "en": "Tsukuba Express", "ko": "・・・・・ｵ・､嵓・溢侃"},
    "Joban": {"ja": "蟶ｸ逎千ｺｿ蠢ｫ騾・", "zh": "蟶ｸ逎千ｺｿ蠢ｫ騾・", "en": "Joban Rapid", "ko": "・・們│ ・護・"},
    "KeihinTohoku": {"ja": "莠ｬ貊ｨ荳懷圏郤ｿ", "zh": "莠ｬ貊ｨ荳懷圏郤ｿ", "en": "Keihin-Tohoku", "ko": "・・ｴ德・・・从・・"},
    "Keiyo": {"ja": "莠ｬ蜿ｶ郤ｿ", "zh": "莠ｬ蜿ｶ郤ｿ", "en": "Keiyo", "ko": "・護擽・肥│"},
    "Mita": {"ja": "驛ｽ關･荳臥伐郤ｿ", "zh": "驛ｽ關･荳臥伐郤ｿ", "en": "Mita", "ko": "・ｸ・倩ｷｯ郤ｿ"},
    "Musashino": {"ja": "豁ｦ阯城㍽郤ｿ", "zh": "豁ｦ阯城㍽郤ｿ", "en": "Musashino", "ko": "・ｴ・ｬ・罹・・"},
    "Namboku": {"ja": "蜊怜圏郤ｿ", "zh": "蜊怜圏郤ｿ", "en": "Namboku", "ko": "・ｨ・・│"},
    "Nambu": {"ja": "蜊玲ｭｦ郤ｿ", "zh": "蜊玲ｭｦ郤ｿ", "en": "Nambu", "ko": "・罹ｶ・"},
    "OdakyuEnoshima": {"ja": "豎滉ｹ句ｲ帷ｺｿ", "zh": "豎滉ｹ句ｲ帷ｺｿ", "en": "Odakyu Enoshima", "ko": "・､・､增・・尖・・罹ｧ溢│"},
    "OdakyuTama": {"ja": "螟壽束郤ｿ", "zh": "螟壽束郤ｿ", "en": "Odakyu Tama", "ko": "・､・､増・夋・溢│"},
    "OdawaraLine": {"ja": "蟆冗伐蜴溽ｺｿ", "zh": "蟆冗伐蜴溽ｺｿ", "en": "Odawara", "ko": "・､・､・・ｼ・"},
    "Oedo": {"ja": "驛ｽ關･螟ｧ豎滓姐郤ｿ", "zh": "驛ｽ關･螟ｧ豎滓姐郤ｿ", "en": "Oedo", "ko": "・・乱・ｴ ・､・尖巡・"},
    "Rinko": {"ja": "荳ｴ豬ｷ郤ｿ", "zh": "荳ｴ豬ｷ郤ｿ", "en": "Rinkai", "ko": "・ｰ・ｴ・ｴ・"},
    "Saikyo": {"ja": "蝓ｼ莠ｬ郤ｿ", "zh": "蝓ｼ莠ｬ郤ｿ", "en": "Saikyo", "ko": "・ｬ・ｴ・・│"},
    "SeibuShinjuku": {"ja": "譁ｰ螳ｿ郤ｿ", "zh": "譁ｰ螳ｿ郤ｿ", "en": "Seibu Shinjuku", "ko": "・ｸ・ｴ・ ・・ｼ・・"},
    "SeibuTamagawa": {"ja": "隘ｿ豁ｦ蝗ｽ蛻・ｯｺ郤ｿ", "zh": "隘ｿ豁ｦ蝗ｽ蛻・ｯｺ郤ｿ", "en": "Seibu Kokubunji", "ko": "・ｸ・ｴ・ ・肥ｿ､・・"},
    "SeibuTamako": {"ja": "螟壽束貉也ｺｿ", "zh": "螟壽束貉也ｺｿ", "en": "Seibu Tamako", "ko": "・ｸ・ｴ・ 夋・溢ｽ肥│"},
    "SeibuYamaguchi": {"ja": "螻ｱ蜿｣郤ｿ", "zh": "螻ｱ蜿｣郤ｿ", "en": "Seibu Yamaguchi", "ko": "・ｸ・ｴ・ ・ｼ・一ｵｬ・們│"},
    "Shinjuku": {"ja": "驛ｽ關･譁ｰ螳ｿ郤ｿ", "zh": "驛ｽ關･譁ｰ螳ｿ郤ｿ", "en": "Shinjuku (Toei)", "ko": "・・乱・ｴ ・・ｼ・・"},
    "ShonanShinjuku": {"ja": "貉伜漉譁ｰ螳ｿ繝ｩ繧､繝ｳ", "zh": "貉伜漉譁ｰ螳ｿ郤ｿ", "en": "Shonan-Shinjuku", "ko": "・ｼ・・・・ｼ・・"},
    "SobuLocal": {"ja": "荳ｭ螟ｮﾂｷ諤ｻ豁ｦ郤ｿ蜷・ｫ吝●霓ｦ", "zh": "荳ｭ螟ｮﾂｷ諤ｻ豁ｦ蜷・ｫ吝●霓ｦ", "en": "Sobu Local", "ko": "・誤ｶ 嶸・ｧ・"},
    "SotetsuIzumino": {"ja": "逶ｸ體∵ｳ蛾㍽郤ｿ", "zh": "逶ｸ體∵ｳ蛾㍽郤ｿ", "en": "Sotetsu Izumino", "ko": "・醐・・ ・ｴ・壱ｯｸ・ｸ・"},
    "SotetsuShinYokohama": {"ja": "逶ｸ體∵眠讓ｪ貊ｨ郤ｿ", "zh": "逶ｸ體∵眠讓ｪ貊ｨ郤ｿ", "en": "Sotetsu Shin-Yokohama", "ko": "・醐・・ ・・肥ｽ被葺・溢│"},
    "Takasaki": {"ja": "鬮伜ｴ守ｺｿ", "zh": "鬮伜ｴ守ｺｿ", "en": "Takasaki", "ko": "・､・ｴ・ｬ墲､・"},
    "TamaMonorail": {"ja": "螟壽束ﾐｼﾐｾﾐｽﾐｾ繝ｬ繝ｼ繝ｫ", "zh": "螟壽束蜊戊ｽｨ", "en": "Tama Monorail", "ko": "夋・・・ｨ・ｸ・溢攵"},
    "TobuUtsunomiya": {"ja": "螳・・螳ｫ郤ｿ", "zh": "荳懈ｭｦ螳・・螳ｫ郤ｿ", "en": "Tobu Utsunomiya", "ko": "・・ｶ ・ｰ・・ｸ・ｸ・ｼ・"},
    "Tokaido": {"ja": "荳懈ｵｷ驕鍋ｺｿ", "zh": "荳懈ｵｷ驕鍋ｺｿ", "en": "Tokaido", "ko": "・・ｹｴ・ｴ・・│"},
    "Tozai": {"ja": "荳懆･ｿ郤ｿ", "zh": "荳懆･ｿ郤ｿ", "en": "Tozai", "ko": "・・梵・ｴ・"},
    "Tsurumi": {"ja": "鮖､隗∫ｺｿ", "zh": "鮖､隗∫ｺｿ", "en": "Tsurumi", "ko": "・ｰ・ｨ・ｸ・"},
    "Utsunomiya": {"ja": "螳・・螳ｫ郤ｿ", "zh": "螳・・螳ｫ郤ｿ", "en": "Utsunomiya", "ko": "・ｰ・ｰ・ｸ・ｸ・ｼ・"},
    "Yamanote": {"ja": "螻ｱ謇狗ｺｿ", "zh": "螻ｱ謇狗ｺｿ", "en": "Yamanote", "ko": "・ｼ・壱・奛護│"},
    "Yokosuka": {"ja": "諤ｻ豁ｦ郤ｿ蠢ｫ騾淞ｷ讓ｪ鬘ｻ雍ｺ郤ｿ", "zh": "諤ｻ豁ｦ郤ｿ蠢ｫ騾淞ｷ讓ｪ鬘ｻ雍ｺ郤ｿ", "en": "Yokosuka-Sobu", "ko": "・肥ｽ肥侃・ｴ・"},
    "Yurakucho": {"ja": "譛我ｹ千伴郤ｿ", "zh": "譛我ｹ千伴郤ｿ", "en": "Yurakucho", "ko": "・・ｼ・・溢│"},
    "Yurikamome": {"ja": "逋ｾ蜷域ｵｷ鮑･蜿ｷ", "zh": "逋ｾ蜷域ｵｷ鮑･蜿ｷ", "en": "Yurikamome", "ko": "・・ｬ・ｴ・ｨ・・"},
    "Marunouchi": {"ja": "荳ｸ荵句・郤ｿ", "zh": "荳ｸ荵句・郤ｿ", "en": "Marunouchi", "ko": "・壱｣ｨ・ｸ・ｰ・們│"}
  };

  // Branch detection: groups of lines that share images but have different IDs
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

  function extractJapaneseName(imagePath) {
    if (!imagePath) return "";
    var m = imagePath.match(/\/([^/]+)\.png$/) || imagePath.match(/\/([^/]+)\.jpg$/);
    if (!m) return "";
    var name = m[1];
    if (name.indexOf('JR') >= 0 || name.indexOf(' ') >= 0) return "";
    return name;
  }

  function getLinesData() {
    var ul = window.UNIFIED_LINES;
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
        nameJa: extractJapaneseName(l.image) || LINE_NAMES[ids[i]] && LINE_NAMES[ids[i]].ja || ids[i],
        branchOf: l.branchOf || null
      };
    }
    detectBranches(lines);
    return lines;
  }

  function getRealtimePositions(lineId) {
    try {
      if (window.DataFusion && window.DataFusion.getRealtimePositions) {
        var pos = window.DataFusion.getRealtimePositions(lineId);
        if (pos && pos.length > 0) return pos;
      }
    } catch(e) {}
    return [];
  }

  function renderCard(line, lineId) {
    try {
      var color = line.color || "#888888";
      var name = (window.tLine && window.tLine(line.code)) || line.nameJa || line.nameEn || line.name || lineId;
      var sel = currentLine === lineId ? " selected" : "";
      var loopBadge = line.type === "loop" ? '<span class="rs-loop-badge">' + escapeHtml(t("line.loop")) + '</span>' : "";
      var branchCls = line.branchOf ? " rs-branch" : "";
      var branchHtml = line.branchOf ? '<span class="rs-branch-indicator">\u2608</span>' : "";
      var icon = "";
      if (line.image) {
        icon = '<img class="rs-line-icon" src="' + escapeHtml(line.image) + '" alt="" loading="lazy">';
      } else {
        icon = '<div class="rs-code-badge" style="background:' + escapeHtml(color) + ';">' + escapeHtml(line.code) + '</div>';
      }
      return '<div class="rs-line-card' + sel + branchCls + '" data-line="' + escapeHtml(lineId) + '"'
        + ' style="--line-color:' + escapeHtml(color) + ';">'
        + '<div class="rs-line-header">'
        + icon
        + '<div class="rs-line-info">'
        + '<div class="rs-line-name">' + branchHtml + escapeHtml(name) + '</div>' + loopBadge
        + '</div></div></div>';
    } catch(e) { return ""; }
  }

  function renderList(el) {
    if (!el) return;
    try {
      var lines = getLinesData();
      if (!lines || Object.keys(lines).length === 0) {
        el.innerHTML = '<div class="tp-no-data">No line data available</div>';
        return;
      }
      var groups = {};
      var ids = Object.keys(lines);
      for (var i = 0; i < ids.length; i++) {
        var l = lines[ids[i]];
        var opKey = l.operator || "Unknown";
        var op = (window.tOp && window.tOp(opKey)) || opKey;
        if (!groups[op]) groups[op] = [];
        groups[op].push({ id: ids[i], line: l });
      }
      var html = "";
      var ops = Object.keys(groups).sort();
      for (var j = 0; j < ops.length; j++) {
        html += '<div class="rs-operator-group">'
          + '<div class="rs-cards-container">';
        var items = groups[ops[j]];
        var sorted = [];
        var added = {};
        for (var k = 0; k < items.length; k++) { added[items[k].id] = false; }
        for (var k = 0; k < items.length; k++) {
          var l = items[k].line;
          if (!l.branchOf && !added[l.id]) {
            sorted.push(items[k]);
            added[l.id] = true;
            for (var m = 0; m < items.length; m++) {
              if (items[m].line.branchOf === l.id && !added[items[m].id]) {
                sorted.push(items[m]);
                added[items[m].id] = true;
              }
            }
          }
        }
        for (var k = 0; k < items.length; k++) { if (!added[items[k].id]) sorted.push(items[k]); }
        for (var k = 0; k < sorted.length; k++) { html += renderCard(sorted[k].line, sorted[k].id); }
        html += '</div></div>';
      }
      el.innerHTML = html;
    } catch(e) {
      el.innerHTML = '<div class="tp-no-data">Error: ' + escapeHtml(e.message) + '</div>';
    }
  }

  function renderTrainMap(el, line, lineId) {
    try {
      var positions = getRealtimePositions(lineId);
      var color = line.color || "#00a04e";
      var stations = line.stations || [];
      var branchLines = [];
      var ul = window.UNIFIED_LINES || {};
      for (var lid in ul) {
        if (ul[lid].branchOf === lineId && lid !== lineId) {
          var bl = ul[lid];
          if (bl.stations && bl.stations.length > 0) {
            branchLines.push({ id: lid, name: bl.name || lid, color: bl.color || color, stations: bl.stations });
          }
        }
      }
      var isLoop = line.type === "loop";
      var sp = 30, topP = 16, botP = 14;
      var h = topP + stations.length * sp + botP;
      var numBranches = branchLines.length;
      var branchOffset = numBranches > 0 ? 70 * numBranches : 0;
      var svgW = isLoop ? 200 : 190 + branchOffset;
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + svgW + ' ' + h + '" preserveAspectRatio="xMidYMid meet">';
      svg += '<defs><filter id="tg_' + escapeHtml(lineId) + '"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
      svg += '<rect width="' + svgW + '" height="' + h + '" fill="var(--bg)" rx="8"/>';
      var mainCx = svgW / 2 - branchOffset / 2;
      var y1 = topP, y2 = topP + (stations.length - 1) * sp;
      svg += '<line x1="' + mainCx + '" y1="' + y1 + '" x2="' + mainCx + '" y2="' + y2 + '" stroke="' + escapeHtml(color) + '" stroke-width="5" stroke-linecap="round" opacity="0.35"/>';
      for (var i = 0; i < stations.length; i++) {
        var st = stations[i];
        var y = topP + i * sp;
        var hasTrain = positions.some(function(p) { return p.stationIndex === i; });
        svg += '<circle cx="' + mainCx + '" cy="' + y + '" r="' + (hasTrain ? 6 : 4) + '" fill="' + (hasTrain ? escapeHtml(color) : "#fff") + '" stroke="' + escapeHtml(color) + '" stroke-width="' + (hasTrain ? 2.5 : 2) + '"/>';
        var dn = tStation(st);
        svg += '<text x="' + (mainCx + 14) + '" y="' + (y + 3.5) + '" font-size="9" fill="#444" font-family="sans-serif" font-weight="500">' + escapeHtml(dn) + '</text>';
      }
      // Draw branch lines
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
        var bjy = topP + junctionIdx * sp;
        var bx = mainCx + 20 + bi * 70;
        var branchTop = topP, branchBot = topP + (bStations.length - 1) * sp;
        svg += '<line x1="' + mainCx + '" y1="' + bjy + '" x2="' + bx + '" y2="' + bjy + '" stroke="' + escapeHtml(bColor) + '" stroke-width="3" opacity="0.5"/>';
        svg += '<line x1="' + bx + '" y1="' + branchTop + '" x2="' + bx + '" y2="' + branchBot + '" stroke="' + escapeHtml(bColor) + '" stroke-width="4" stroke-linecap="round" opacity="0.4"/>';
        for (var bsi = 0; bsi < bStations.length; bsi++) {
          var bsy = branchTop + bsi * sp;
          var isJunction = (bsi === 0 && junctionIdx >= 0 && stations[junctionIdx] === bStations[0]);
          svg += '<circle cx="' + bx + '" cy="' + bsy + '" r="' + (isJunction ? 5 : 4) + '" fill="' + (isJunction ? escapeHtml(bColor) : "#fff") + '" stroke="' + escapeHtml(bColor) + '" stroke-width="2"/>';
        }
        svg += '<text x="' + bx + '" y="' + (topP - 6) + '" font-size="8" fill="' + escapeHtml(bColor) + '" font-family="sans-serif" font-weight="600" text-anchor="middle">' + escapeHtml(branch.name) + '</text>';
      }
      for (var j = 0; j < positions.length; j++) {
        var p = positions[j];
        var py = topP + Math.min(p.stationIndex || 0, stations.length - 1) * sp;
        svg += '<circle cx="' + mainCx + '" cy="' + py + '" r="8" fill="' + escapeHtml(color) + '" filter="url(#tg_' + escapeHtml(lineId) + ')" opacity="0.9"/>';
        svg += '<circle cx="' + mainCx + '" cy="' + py + '" r="3" fill="#fff"/>';
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
      if (detailEl) detailEl.classList.remove("hidden");
      if (titleEl) titleEl.textContent = (window.tLine && window.tLine(fusedLine.code)) || fusedLine.nameEn || fusedLine.name;
      if (mapEl) renderTrainMap(mapEl, fusedLine, lineId);
    } catch(e) {}
  }

  function hideLineView() {
    try {
      currentLine = null;
      if (listEl) listEl.classList.remove("hidden");
      if (detailEl) detailEl.classList.add("hidden");
      renderList(listEl);
    } catch(e) {}
  }

  function init() {
    try {
      listEl = document.getElementById("trainsLineListContent");
      detailEl = document.getElementById("trainsDetailView");
      titleEl = document.getElementById("trainsDetailTitle");
      mapEl = document.getElementById("trainsMapContainer");
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
      renderList(listEl);
      var hash = window.location.hash;
      if (hash && hash.length > 1) {
        var lid = hash.substring(1);
        var lines = getLinesData();
        if (lines[lid]) showLineView(lid);
      }
      if (backBtn) backBtn.textContent = "\u2190 " + t("line_map.back");
    } catch(e) {}
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