const fs = require("fs");
const path = "js/data-state.js";
let content = fs.readFileSync(path, "utf8");

// Find position after the getDelayInfo helper function
const helperIdx = content.indexOf("function getDelayInfo(line) {");
if (helperIdx < 0) { console.error("getDelayInfo not found"); process.exit(1); }
const insertAfter = content.indexOf("}", helperIdx) + 1;

// New helper: getAggregatedDelay
const newHelper = `
// Through-service chain delay aggregation (read-only, UI layer only)
function getAggregatedDelay(lineId, line) {
  try {
    if (!window.RunningChainResolver) return null;
    var ctx = window.RunningChainResolver.getResolutionContext(lineId, Object.keys(window.UNIFIED_LINES || {}));
    if (!ctx || !ctx.isThroughService || !ctx.relatedLines || ctx.relatedLines.length === 0) return null;
    var maxDelay = 0;
    var maxReason = null;
    ctx.relatedLines.forEach(function(relId) {
      var relLine = (window.DataState && window.DataState.getLine) ? window.DataState.getLine(relId) : null;
      if (!relLine || !relLine.delayInfo) return;
      var d = relLine.delayInfo;
      if (d && d.maxDelay != null && d.maxDelay > maxDelay) {
        maxDelay = d.maxDelay;
        maxReason = d.cause || null;
      }
    });
    if (maxDelay > 0) {
      return { status: "delayed", maxDelay: maxDelay, interval: null, cause: maxReason };
    }
  } catch(e) {}
  return null;
}
`;

content = content.substring(0, insertAfter) + newHelper + content.substring(insertAfter);

// Now modify renderCard: after delayInfo assignment, check aggregation
// Find: var delayInfo = getDelayInfo(line) || {};
// Replace with: + aggregation check
const oldLine = '    var delayInfo = getDelayInfo(line) || {};';
const newLine = '    var delayInfo = getDelayInfo(line) || {};\\n    var _aggDelay = getAggregatedDelay(lineId, line);\\n    if (_aggDelay) delayInfo = _aggDelay;';

if (content.indexOf(oldLine) < 0) { console.error("Original line not found"); process.exit(1); }
content = content.replace(oldLine, newLine);

fs.writeFileSync(path, content, "utf8");
console.log("OK: data-state.js patched");
