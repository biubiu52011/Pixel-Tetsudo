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
