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
  var nm = lineObj.name;
  var m = nm.match(/[（(]([^）)]*ライン)[）)]/);
  if (m) nm = m[1];
  var maxN = mobile ? 5 : 7;
  return nm.length > maxN ? nm.slice(0, maxN) + "…" : nm;
}

function _throughChipSize(lineObj, mobile) {
  var nm = _throughShortName(lineObj, mobile);
  var throughLbl = (typeof window.t === "function" && window.t("train.through")) ? window.t("train.through") : "直通";
  var label = lineObj && lineObj.overflowCount ? (throughLbl + nm) : (throughLbl + nm);
  var fontSize = mobile ? 11 : 9;
  var charW = mobile ? 10 : 8;
  var arrowSlot = mobile ? 12 : 11;
  var gap = mobile ? 3 : 3;
  var padX = mobile ? 5 : 4;
  var maxW = mobile ? 148 : 124;
  var textW = label.length * charW;
  var rawW = padX * 2 + arrowSlot + gap + textW;
  var contentH = Math.max(fontSize + 8, mobile ? 20 : 16);
  var w = Math.min(maxW, rawW);
  var contentW = arrowSlot + gap + textW;
  var contentX = Math.max(padX, Math.floor((w - contentW) / 2));
  return {
    w: w,
    h: contentH,
    label: label,
    fontSize: fontSize,
    rowH: contentH + (mobile ? 4 : 4),
    arrowX: contentX + arrowSlot / 2,
    textX: contentX + arrowSlot + gap
  };
}

function _normalizeThroughChipList(items) {
  var byDir = { up: [], down: [], middle: [] };
  for (var i = 0; i < (items || []).length; i++) {
    var it = items[i];
    if (!it || !it.through) continue;
    var dir = it.dir === "up" || it.dir === "down" ? it.dir : "middle";
    byDir[dir].push(it);
  }
  var out = [];
  ["up", "down", "middle"].forEach(function(dir) {
    byDir[dir].sort(function(a, b) {
      return String(a.lineId || a.name || "").localeCompare(String(b.lineId || b.name || ""));
    });
    var maxVisible = 2;
    for (var j = 0; j < byDir[dir].length && j < maxVisible; j++) {
      byDir[dir][j]._throughSlot = j;
      byDir[dir][j]._throughDirGroup = dir;
      out.push(byDir[dir][j]);
    }
    if (byDir[dir].length > maxVisible) {
      out.push({
        through: true,
        dir: dir,
        _throughSlot: maxVisible,
        _throughDirGroup: dir,
        overflowCount: byDir[dir].length - maxVisible,
        name: "+" + (byDir[dir].length - maxVisible),
        color: "#6e6e73",
        title: byDir[dir].slice(maxVisible).map(function(x) { return x.name || x.lineId || ""; }).join(" / ")
      });
    }
  });
  return out;
}

function _throughChipRows(items, dir) {
  var n = 0;
  var hasUp = false;
  var hasDown = false;
  var middle = 0;
  for (var i = 0; i < (items || []).length; i++) {
    if (!items[i] || !items[i].through) continue;
    var d = items[i].dir === "up" || items[i].dir === "down" ? items[i].dir : "middle";
    if (dir) {
      if (d === dir) n++;
    } else if (d === "up") {
      hasUp = true;
    } else if (d === "down") {
      hasDown = true;
    } else {
      middle++;
    }
  }
  if (dir) return n ? 1 : 0;
  return (hasUp ? 1 : 0) + (hasDown ? 1 : 0) + Math.min(middle, 3);
}

function _hexToRgba(hex, a) {
  var h = String(hex || "#555").replace("#", "");
  if (h.length === 3) h = h.split("").map(function(c){ return c + c; }).join("");
  var n = parseInt(h, 16);
  if (isNaN(n)) { h = "555"; n = parseInt(h, 16); }
  return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
}
