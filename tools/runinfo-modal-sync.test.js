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

console.log("runinfo-modal-sync: 4 PASS");

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
  src.includes("refreshListStatuses(fused.lines);"),
  "list reconciliation must run after the immediate DataFusion render"
);

console.log("runinfo-list-sync: 4 PASS");
