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
assert.ok(/if \(_selectedOperator\)[\s\S]*renderFiltered\(\)[\s\S]*else[\s\S]*render\(\)/.test(block),
  "realtime subscription must render filtered OR full list once");
console.log("performance-lifecycle: 2 PASS");
