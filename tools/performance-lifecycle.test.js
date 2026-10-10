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
assert.ok(/_activationPromise\.then\(function\(\)[\s\S]{0,300}DataFusion\.ensureTimetable\(lineId\)/.test(trains),
  "timetable fallback must wait for on-demand ODPT activation");
assert.ok(!/activateRealtimeLines\(_requestedLines\)[\s\S]{0,900}DataFusion\.ensureTimetable\(lineId\)\.then/.test(trains),
  "line open must not launch ODPT activation and timetable fallback independently");
console.log("performance-lifecycle: 7 PASS");


// Busy-station regression: official realtime rows must not be capped by station capacity.
const renderSrc = fs.readFileSync('js/trains-render.js','utf8');
assert.ok(/if \(_trainPositionRank\(_epPos\) === 0\)[\s\S]*?_filtered\.push\(_epPos\)[\s\S]*?continue/.test(renderSrc), 'official realtime trains at the same station must bypass estimated capacity limiting');
assert.ok(!/_STATION_MAX_ENDPOINT\s*=\s*1/.test(renderSrc), 'terminal stations must not be hard-capped to one train');
const layoutSrc = fs.readFileSync('js/train-track-layout.js','utf8');
assert.ok(/runningChainId \|\| p\.trainId \|\| p\.sourceTrainId \|\| p\.timetableObjectId/.test(layoutSrc), 'station slot ordering must use stable train identity');
assert.ok(!/runningChainId \|\| p\.trainId \|\| p\.trainNumber/.test(layoutSrc), 'station slot ordering must never fall back to a bare train number');
assert.ok(/groups\[key\]\.sort/.test(layoutSrc), 'multi-train station slots must be stable across source reorder');
console.log('busy-station-layout: 4 PASS');
const fusionVehicleSrc = fs.readFileSync('js/data-fusion.js','utf8');
assert.ok(/_existingRank >= _incomingRank/.test(fusionVehicleSrc), 'running-chain vehicle registry must reject equal or weaker conflicting evidence');
assert.ok(/_sameVehicle = _existingName && _existingName === resolution\.name/.test(fusionVehicleSrc),
  'vehicle continuity guard must compare canonical resolved names (a line/system transition is not vehicle-swap evidence)');
console.log('running-chain-vehicle-continuity: 2 PASS');
assert.ok(/lineId === "NewShuttle"[\s\S]*?Math\.min\(base\.idx, base\.nextIdx\) >= 8/.test(layoutSrc), 'New Shuttle Maruyama-Uchijuku must use single-track layout');
assert.ok(!fs.existsSync('data/timetables/vehicle-type-map.js'),
  'legacy line/train-type vehicle map must stay removed');
const newShuttleTimetableSrc = fs.readFileSync('data/timetables/NewShuttle-manual.js','utf8');
assert.ok(!/1050系は順次引退/.test(newShuttleTimetableSrc), 'New Shuttle timetable must not encode unsupported retirement prose as vehicle identity');
assert.ok(!/vehicleType:\s*"[^"]*1050系/.test(newShuttleTimetableSrc), 'New Shuttle regular timetable must not mix special-event 1050 operation into daily fleet evidence');
console.log('new-shuttle-official-topology: 4 PASS');

const odptUnifiedSrc = fs.readFileSync('data/api/odpt-unified.js','utf8');
const trainRunsFnSrc = fs.readFileSync('supabase/functions/train-runs/index.ts','utf8');
assert.ok(/"odpt:railDirection":run\.rail_direction\|\|""/.test(odptUnifiedSrc),
  'Supabase TrainRun must restore rail direction into the canonical ODPT-shaped input');
assert.ok(/"odpt:trainType":run\.train_type\|\|""/.test(odptUnifiedSrc),
  'Supabase TrainRun must restore train type into the canonical ODPT-shaped input');
assert.ok(/"odpt:destinationStation":run\.destination_station\?\[run\.destination_station\]:\[\]/.test(odptUnifiedSrc),
  'Supabase TrainRun must restore destination into the canonical ODPT-shaped input');
assert.ok(/rail_direction,train_type,destination_station/.test(trainRunsFnSrc),
  'train-runs Edge Function must expose canonical operating fields');
console.log('train-run-operating-fields: 4 PASS');

const trainRunsReadThroughSrc = fs.readFileSync('supabase/functions/train-runs/index.ts','utf8');
assert.ok(/ODPT_CHALLENGE_CONSUMER_KEY/.test(trainRunsReadThroughSrc) && /ODPT_CONSUMER_KEY/.test(trainRunsReadThroughSrc),
  'TrainRun read-through must use server-side ODPT secrets only');
assert.ok(/part\.length >= 1000/.test(trainRunsReadThroughSrc) && /ODPT_TRUNCATED/.test(trainRunsReadThroughSrc),
  'truncated ODPT timetable responses must never be persisted as complete cache');
assert.ok(/readManualTemplateRuns/.test(trainRunsReadThroughSrc) &&
  /manual_timetable_templates/.test(trainRunsReadThroughSrc) &&
  /manual_timetable_template_stops/.test(trainRunsReadThroughSrc) &&
  /train_run_stops/.test(trainRunsReadThroughSrc),
  'no-API fallback must read SQL timetable templates and preserve date-specific train runs');
assert.ok(/\.range\(first, last\)/.test(trainRunsReadThroughSrc),
  'SQL timetable reads must paginate rather than silently truncate stops');
assert.ok(!/req\.method === "POST"/.test(trainRunsReadThroughSrc),
  'public train-runs endpoint must remain GET-only and must not accept browser cache writes');
console.log('train-run-SQL-fallback: 5 PASS');

assert.ok(/fallback_only/.test(trainRunsReadThroughSrc) &&
  /source: "API_AVAILABLE"/.test(trainRunsReadThroughSrc) &&
  /const validRuns = result\.filter\(r => r\.stops\.length >= 2/.test(trainRunsReadThroughSrc) &&
  /omitted_incomplete_runs: omittedIncompleteRuns, runs: validRuns/.test(trainRunsReadThroughSrc) &&
  !/runs: complete \? result : \[\]/.test(
    trainRunsReadThroughSrc.split('async function readManualTemplateRuns')[1].split('Deno.serve')[0]),
  'SQL-only fallback must bypass API-enabled lines and exclude incomplete runs without discarding verified ones');
assert.ok(/fallback_only=1/.test(odptUnifiedSrc) &&
  /vehicleType:run\.vehicle_type_label\|\|null/.test(odptUnifiedSrc) &&
  /body\.partial===true/.test(odptUnifiedSrc) &&
  /_timetableCoverage="partial"/.test(odptUnifiedSrc),
  'client must retain partial-coverage markers, verified runs, and manual vehicle evidence');
console.log('train-run-SQL-completeness: 2 PASS');

const trainPositionEstimatorSrc = fs.readFileSync('js/train-position-estimator.js','utf8');
assert.ok(/"_operationCode":run\.operation_code\|\|""/.test(odptUnifiedSrc),
  'Supabase TrainRun must preserve canonical operation_code into runtime input');
assert.ok(/tt\['_operationCode'\] \|\| tt\['operationCode'\] \|\| tt\['operation_code'\]/.test(trainPositionEstimatorSrc),
  'vehicle evidence must prefer persisted TrainRun operation code before train-number derivation');
assert.ok(/if \(!_baseOperationCtx\.operationCode\)/.test(trainPositionEstimatorSrc),
  'train-number operation normalization must remain fallback-only');
console.log('train-run-vehicle-evidence-bridge: 3 PASS');
