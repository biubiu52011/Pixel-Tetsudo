const fs = require("fs");
const assert = require("assert");
const fusion = fs.readFileSync("js/data-fusion.js", "utf8");
const realtime = fs.readFileSync("js/realtime-view.js", "utf8");
assert.ok(!/loadTrainPositions\._calib\s*=\s*setTimeout/.test(fusion),
  "DataFusion must not schedule unconditional position recalibration");
const marker = "window.DataFusion.subscribe(function(fusedData)";
const start = realtime.indexOf(marker);
assert.ok(start >= 0, "realtime DataFusion subscription missing");
const block = realtime.slice(start, realtime.indexOf("// Setup modal handlers", start));
assert.ok(/reconcileRealtimeList\(container, _latestLines\)[\s\S]*scheduleListStatusRefresh\(_latestLines, false\)/.test(block),
  "realtime subscription must reconcile the mounted list and schedule one status refresh");
assert.ok(!/renderFiltered\(\)|render\(\)/.test(block),
  "realtime subscription must not rebuild the full or filtered list on every live snapshot");
const trains = fs.readFileSync("js/trains-page.js", "utf8");
assert.ok(!/if \(_positionsChanged\) renderList\(listEl\)/.test(trains),
  "trains overview must not rebuild on live position-only changes");
assert.ok(!/var ids = Object\.keys\(lines\);[\s\S]{0,1200}realtimePositions/.test(trains),
  "trains subscriber must not hash positions across every line");
console.log("performance-lifecycle: 5 PASS");
