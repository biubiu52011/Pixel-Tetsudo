/* trains-utils.js: 列车页工具函数（全局） */

function _isMobileView() { return typeof window !== "undefined" && window.innerWidth < 600; }

function _geomKey(lineId) { return lineId + (_isMobileView() ? "__m" : "__d"); }

function _badgeW(it, isMobile) {
  var txt = (it.name || it.lineId || "").slice(0, 4);
  return txt.length * (isMobile ? 7 : 5) + 8;
}

function _throughBadgeText(lineObj) {
  var opName = (lineObj.operator && window.tOp) ? window.tOp(lineObj.operator) : "";
  var base = (opName ? opName + " " : "") + lineObj.name;
  if (lineObj.through) {
    var thru = (window.t ? window.t("train.throughService", "相互直通運転") : "相互直通運転");
    base = base + "（" + thru + "）";
  } else if (lineObj.type === "out") {
    var outLbl = (window.t ? window.t("train.transferOut", "站外換乘") : "站外換乘");
    var _note = lineObj.note || "";
    var _walkM = _note.match(/徒歩約(\d+)分/);
    if (_walkM) {
      var _n = parseInt(_walkM[1], 10);
      var _lng = window.currentLang || "ja";
      var _wl = _lng === "en" ? ("approx " + _n + " min walk")
        : _lng === "zh" ? ("步行約" + _n + "分")
        : _lng === "ko" ? ("도보 약 " + _n + "분")
        : ("徒歩約" + _n + "分");
      _note = _note.replace(/，?徒歩約\d+分/, "，" + _wl);
    }
    base = base + "（" + outLbl + (_note ? " " + _note : "") + "）";
  }
  return base;
}

function _throughShortName(lineObj, mobile) {
  if (lineObj && lineObj.overflowCount) return "+" + lineObj.overflowCount;
  var nm = String(lineObj.name || lineObj.lineId || "").replace(/直通|직통|Through Service/gi, "").replace(/\s+/g, " ").trim();
  var m = nm.match(/[（(]([^）)]*(?:ライン|路線|路线))[）)]/);
  nm = m ? m[1] : nm.split(/[（(]/)[0].trim();
  return nm;
}

function _throughChipSize(lineObj, mobile, maxWidth) {
  var nm = _throughShortName(lineObj, mobile);
  var throughLbl = (window.t ? window.t("train.through") : "直通").trim();
  var label = throughLbl + (/^[A-Za-z]/.test(throughLbl) ? " " : "") + nm;
  var fontSize = mobile ? 11 : 9;
  var narrow = maxWidth && maxWidth < 100;
  var arrowSlot = narrow ? 8 : (mobile ? 12 : 11), gap = narrow ? 4 : (mobile ? 10 : 8);
  var padX = mobile ? 5 : 4, padEnd = narrow ? 5 : (mobile ? 8 : 6);
  var maxW = Math.max(48, Math.min(maxWidth || (mobile ? 148 : 124), mobile ? 148 : 124));
  var overhead = padX + arrowSlot + gap + padEnd;
  var available = maxW - overhead;
  var wrapped = _measureThroughLabelWidth(label, fontSize) > available;
  var lines = wrapped ? [throughLbl] : [], current = "";
  Array.from(wrapped ? nm : label).forEach(function(ch) {
    if (current && _measureThroughLabelWidth(current + ch, fontSize) > available) {
      lines.push(current.trim()); current = "";
    }
    current += ch;
  });
  if (current.trim()) lines.push(current.trim());
  var textW = Math.max.apply(null, lines.map(function(x) { return _measureThroughLabelWidth(x, fontSize); }));
  var h = Math.max(fontSize + 8, lines.length * (fontSize + 2) + 8);
  return {w: Math.min(maxW, overhead + textW), h: h, label: label, lines: lines,
    fontSize: fontSize, rowH: h + 4, arrowX: padX + arrowSlot / 2,
    textX: padX + arrowSlot + gap};
}

// Reserve the same stacked height during geometry and during rendering.
function _throughChipHeight(items, mobile, maxWidth, dir) {
  return _normalizeThroughChipList(items).filter(function(it) { return !dir || it.dir === dir; })
    .reduce(function(h, it) { return h + _throughChipSize(it, mobile, maxWidth).h + 4; }, 0);
}

// Place an entire station-owned group before any bounds adjustment.
function _layoutThroughChipGroup(items, mobile, maxWidth, x, y, align, bounds) {
  var sizes = items.map(function(it) { return _throughChipSize(it, mobile, maxWidth); });
  var width = Math.max.apply(null, sizes.map(function(sz) { return sz.w; }));
  if (!items.length) return [];
  var left = align === "end" ? x - width : align === "middle" ? x - width / 2 : x;
  left = Math.max(bounds.minX, Math.min(left, bounds.maxX - width));
  return items.map(function(it, i) {
    var sz = sizes[i];
    var itemX = left + (align === "end" ? width - sz.w : align === "middle" ? (width - sz.w) / 2 : 0);
    var placed = {item:it, x:itemX, y:y, size:sz};
    y += sz.h + 4;
    return placed;
  });
}

var _throughLabelMeasureCache = {};
function _estimateThroughLabelWidth(label, fontSize) {
  var w = 0;
  var s = String(label || "");
  for (var i = 0; i < s.length; i++) {
    var code = s.charCodeAt(i);
    if (/\s/.test(s.charAt(i))) w += fontSize * 0.5;
    else if (code >= 0x3000 || code === 0x2026) w += fontSize;
    else w += fontSize * 0.68;
  }
  return Math.ceil(w);
}

function _measureThroughLabelWidth(label, fontSize) {
  var key = fontSize + "|" + label;
  if (_throughLabelMeasureCache[key] != null) return _throughLabelMeasureCache[key];
  var fallback = _estimateThroughLabelWidth(label, fontSize);
  try {
    if (typeof document === "undefined" || !document.body) {
      _throughLabelMeasureCache[key] = fallback;
      return fallback;
    }
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    var text = document.createElementNS(ns, "text");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.style.position = "absolute";
    svg.style.left = "-9999px";
    svg.style.top = "-9999px";
    svg.style.visibility = "hidden";
    text.setAttribute("font-family", "Fusion Pixel, 'Courier New', monospace");
    text.setAttribute("font-size", fontSize);
    text.setAttribute("font-weight", "700");
    text.textContent = label;
    svg.appendChild(text);
    document.body.appendChild(svg);
    var measured = Math.ceil(text.getComputedTextLength ? text.getComputedTextLength() : fallback);
    document.body.removeChild(svg);
    _throughLabelMeasureCache[key] = measured || fallback;
    return _throughLabelMeasureCache[key];
  } catch (e) {
    _throughLabelMeasureCache[key] = fallback;
    return fallback;
  }
}

function _normalizeThroughChipList(items) {
  var seen = {}, out = [];
  (items || []).forEach(function(it) {
    if (!it || !it.through) return;
    var dir = it.dir === "up" || it.dir === "down" ? it.dir : "middle";
    var key = dir + "|" + (it.lineId || it.name || "");
    if (seen[key]) return;
    seen[key] = true;
    out.push(Object.assign({}, it, {dir:dir}));
  });
  return out.sort(function(a, b) {
    return a.dir.localeCompare(b.dir) || String(a.lineId || a.name).localeCompare(String(b.lineId || b.name));
  });
}

function _hexToRgba(hex, a) {
  var h = String(hex || "#555").replace("#", "");
  if (h.length === 3) h = h.split("").map(function(c){ return c + c; }).join("");
  var n = parseInt(h, 16);
  if (isNaN(n)) { h = "555"; n = parseInt(h, 16); }
  return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
}
