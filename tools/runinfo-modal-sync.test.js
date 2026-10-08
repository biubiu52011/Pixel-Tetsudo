const fs = require("fs");
const assert = require("assert");

const src = fs.readFileSync(require("path").join(__dirname, "../js/realtime-view.js"), "utf8");

assert.ok(
  src.includes('var resolvedStatus = r.status || fallbackStatus || "no_data";'),
  "async RunInfoAPI result must become the modal status authority"
);
assert.ok(
  src.includes('if (resolvedStatus === "normal")'),
  "normal async result must clear stale disruption interval semantics"
);
assert.ok(
  !src.includes('if (!r || !r.text) return;'),
  "structured status with empty text must not leave stale modal state"
);
assert.ok(
  src.includes('if (!r.text) {'),
  "empty official detail must render an explicit empty-detail state"
);
assert.ok(
  src.includes("function _translationOpts(lineId, status, source)"),
  "modal translation must receive structured RunInfo/DataFusion semantics"
);
assert.ok(
  src.includes("function _untranslatedOfficialText(text)"),
  "untranslated free text must preserve the official Japanese source with a localized hint"
);

console.log("runinfo-modal-sync: 6 PASS");

assert.ok(
  src.includes("function refreshListStatuses(linesObj)"),
  "realtime list cards must reconcile against RunInfoAPI"
);
assert.ok(
  src.includes("target.delayInfo = Object.assign({}, old"),
  "resolved list status must be written back before rerender"
);
assert.ok(
  src.includes('interval: r.status === "normal" ? null : old.interval'),
  "normal list status must clear stale disruption interval"
);
assert.ok(
  src.includes("scheduleListStatusRefresh(fused.lines, true);"),
  "list reconciliation must run after the immediate DataFusion render"
);

assert.ok(
  src.includes("function patchRealtimeCards(container, linesObj, changedIds)"),
  "live status changes must have an incremental card patch path"
);
assert.ok(
  src.includes("if (!force && now - _lastListStatusRefreshAt < 10000) return;"),
  "whole-list RunInfo reconciliation must be throttled across fusion emissions"
);
assert.ok(
  src.includes('card.classList.contains("rs-system-card")'),
  "aggregated system cards must not be patched as ordinary single-line cards"
);
assert.ok(
  src.includes("lineCard.updateSystem(systemCard, linesObj"),
  "aggregated system status changes must rerender only the affected system card"
);
console.log("runinfo-list-sync: 8 PASS");

assert.ok(
  src.includes("var scopeSummary = _scopeSummary(interval, impacts);") &&
    src.includes("var refreshedScope = _scopeSummary(r.interval || \"\", refreshedImpacts);"),
  "modal impact rendering must use concise scope summaries instead of empty effect fragments"
);
console.log("runinfo-impact-scope: PASS");


assert.ok(src.includes("function _scopeSummary(interval, impacts)"), "modal must derive one concise operational scope");
assert.ok(src.includes("if (explicitRanges.length) return explicitRanges[0];"), "explicit station range must win");
assert.ok(src.includes("if (direction) return (_impactLabels().dir[direction] || direction);"), "direction is fallback only when no station range exists");
assert.ok(src.includes('if (interval === "全線" || list.some'), "whole-line label requires explicit whole-line scope");
assert.ok(!src.includes('rs-impact-effect'), "scope summary must not duplicate operational effects");
console.log("runinfo-scope-summary: PASS");

const style = fs.readFileSync(require("path").join(__dirname, "../css/style.css"), "utf8");
assert.ok(style.includes(".rs-status-section.rs-status-info,.rs-status-section.rs-status-notice"), "notice/info modal status colors must be defined");
console.log("runinfo-modal-status-colors: PASS");
