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
const renderSrc = fs.readFileSync('js/trains-render.js','utf8');
assert.ok(/if \(_trainPositionRank\(_epPos\) === 0\)[\s\S]*?_filtered\.push\(_epPos\)[\s\S]*?continue/.test(renderSrc), 'official realtime trains at the same station must bypass estimated capacity limiting');
assert.ok(!/_STATION_MAX_ENDPOINT\s*=\s*1/.test(renderSrc), 'terminal stations must not be hard-capped to one train');
const layoutSrc = fs.readFileSync('js/train-track-layout.js','utf8');
assert.ok(/runningChainId \|\| p\.trainId \|\| p\.trainNumber/.test(layoutSrc), 'station slot ordering must use stable train identity');
assert.ok(/groups\[key\]\.sort/.test(layoutSrc), 'multi-train station slots must be stable across source reorder');
console.log('busy-station-layout: 4 PASS');
const fusionVehicleSrc = fs.readFileSync('js/data-fusion.js','utf8');
assert.ok(/_existingRank >= _incomingRank/.test(fusionVehicleSrc), 'running-chain vehicle registry must reject equal or weaker conflicting evidence');
assert.ok(/A line\/system transition is not vehicle-swap evidence/.test(fusionVehicleSrc), 'vehicle continuity guard must explicitly treat line transitions as non-swap evidence');
console.log('running-chain-vehicle-continuity: 2 PASS');
assert.ok(/lineId === "NewShuttle"[\s\S]*?Math\.min\(base\.idx, base\.nextIdx\) >= 8/.test(layoutSrc), 'New Shuttle Maruyama-Uchijuku must use single-track layout');
const vehicleMapSrc = fs.readFileSync('data/timetables/vehicle-type-map.js','utf8');
assert.ok(/'NewShuttle'[\s\S]{0,180}'default': '埼玉新都市交通1050系 \/ 埼玉新都市交通2000系 \/ 埼玉新都市交通2020系'/.test(vehicleMapSrc), 'New Shuttle current fleet candidates must include 1050/2000/2020');
const newShuttleTimetableSrc = fs.readFileSync('data/timetables/NewShuttle-manual.js','utf8');
assert.ok(!/1050系は順次引退/.test(newShuttleTimetableSrc), 'New Shuttle timetable must not mark still-operating 1050 series as retiring');
console.log('new-shuttle-official-topology: 3 PASS');
