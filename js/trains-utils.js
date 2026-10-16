/* trains-utils.js: 列车页工具函数（全局）
 * 直通标签相关实现已收敛至 js/through-chip.js（window.ThroughChip），
 * 此处仅保留同名转发壳以兼容既有调用，后续调用点可直接走 window.ThroughChip。
 */

function _isMobileView() { return typeof window !== "undefined" && window.innerWidth < 600; }

function _geomKey(lineId) { return lineId + (_isMobileView() ? "__m" : "__d"); }

function _badgeW(it, isMobile) {
  var txt = (it.name || it.lineId || "").slice(0, 4);
  return txt.length * (isMobile ? 7 : 5) + 8;
}

/* ---- 直通标签：实现收敛至 js/through-chip.js，以下为转发壳 ---- */
function _throughBadgeText(lineObj) { return window.ThroughChip ? window.ThroughChip.badgeText(lineObj) : ""; }
function _throughShortName(lineObj, mobile) { return window.ThroughChip ? window.ThroughChip.shortName(lineObj, mobile) : ""; }
function _throughChipSize(lineObj, mobile, maxWidth) { return window.ThroughChip ? window.ThroughChip.size(lineObj, mobile, maxWidth) : null; }
function _throughChipHeight(items, mobile, maxWidth, dir) { return window.ThroughChip ? window.ThroughChip.height(items, mobile, maxWidth, dir) : 0; }
function _layoutThroughChipGroup(items, mobile, maxWidth, x, y, align, bounds) { return window.ThroughChip ? window.ThroughChip.layoutGroup(items, mobile, maxWidth, x, y, align, bounds) : []; }
function _normalizeThroughChipList(items) { return window.ThroughChip ? window.ThroughChip.normalize(items) : []; }

function _hexToRgba(hex, a) {
  var h = String(hex || "#555").replace("#", "");
  if (h.length === 3) h = h.split("").map(function(c){ return c + c; }).join("");
  var n = parseInt(h, 16);
  if (isNaN(n)) { h = "555"; n = parseInt(h, 16); }
  return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
}
