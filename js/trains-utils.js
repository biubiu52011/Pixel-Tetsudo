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
  var nm = lineObj.name;
  var m = nm.match(/[（(]([^）)]*ライン)[）)]/);
  if (m) nm = m[1];
  var maxN = mobile ? 6 : 10;
  return nm.length > maxN ? nm.slice(0, maxN) + "…" : nm;
}

function _throughChipSize(lineObj, mobile) {
  var nm = _throughShortName(lineObj, mobile);
  var throughLbl = (typeof window.t === "function" && window.t("train.through")) ? window.t("train.through") : "直通";
  var label = throughLbl + nm;
  var fs = mobile ? 12 : 10;
  var w = label.length * (mobile ? 12 : 10) + 8 + (mobile ? 12 : 10);
  var h = (mobile ? 19 : 12) + 4;
  return { w: w + 2, h: h, label: label };
}

function _hexToRgba(hex, a) {
  var h = String(hex || "#555").replace("#", "");
  if (h.length === 3) h = h.split("").map(function(c){ return c + c; }).join("");
  var n = parseInt(h, 16);
  if (isNaN(n)) { h = "555"; n = parseInt(h, 16); }
  return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
}
