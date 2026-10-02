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


// Busy-station regression: official realtime rows must not be capped by station capacity.
const renderSrc = fs.readFileSync(path.join(root,'js/trains-render.js'),'utf8');
assert.ok(/if \(_trainPositionRank\(_epPos\) === 0\)[\s\S]*?_filtered\.push\(_epPos\)[\s\S]*?continue/.test(renderSrc), 'official realtime trains at the same station must bypass estimated capacity limiting');
assert.ok(!/_STATION_MAX_ENDPOINT\s*=\s*1/.test(renderSrc), 'terminal stations must not be hard-capped to one train');
const layoutSrc = fs.readFileSync(path.join(root,'js/train-track-layout.js'),'utf8');
assert.ok(/runningChainId \|\| p\.trainId \|\| p\.trainNumber/.test(layoutSrc), 'station slot ordering must use stable train identity');
assert.ok(/groups\[key\]\.sort/.test(layoutSrc), 'multi-train station slots must be stable across source reorder');
console.log('busy-station-layout: 4 PASS');
