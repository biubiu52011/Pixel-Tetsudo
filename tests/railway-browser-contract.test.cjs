// Cross-page DOM ownership guard. Run: node --test tests/railway-browser-contract.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

for (const [page, filterId, listId] of [
  ['realtime', 'realtimeFilterBar', 'realtimeStatusContainer'],
  ['trains', 'trainsFilterBar', 'trainsLineListContent']
]) {
  test(page + ': filter and list have one shared layout owner', () => {
    const html = read('pages/' + page + '.html');
    const opening = html.indexOf('data-railway-browser');
    const filter = html.indexOf('id="' + filterId + '"');
    const shell = html.indexOf('class="pixel-card rs-line-list-shell"');
    const list = html.indexOf('id="' + listId + '"');
    assert.ok(opening > 0 && filter > opening && shell > filter && list > shell);
    assert.equal((html.match(/data-railway-browser/g) || []).length, 1);
    assert.match(html, new RegExp('id="' + listId + '"[^>]*data-state-host="railway-lines"'));
  });
}

test('filter bar does not inspect list internals globally', () => {
  const js = read('js/operator-filter-bar.js');
  assert.doesNotMatch(js, /document\.querySelectorAll\(["']\.rs-line-list-content/);
  assert.match(js, /operators\(lines\)/);
});

test('page controllers use shared list visibility and data filtering', () => {
  const data = read('js/data-state.js');
  assert.match(data, /function setOperatorVisibility\(/);
  assert.match(data, /function filterLinesByOperator\(/);
  for (const page of ['js/realtime-view.js', 'js/trains-page.js']) {
    const js = read(page);
    assert.match(js, /DataState\.setOperatorVisibility\(/);
    assert.match(js, /DataState\.filterLinesByOperator\(/);
    assert.doesNotMatch(js, /group\.style\.display\s*=/);
  }
});

test('realtime selection is scoped and history mount is stable', () => {
  assert.doesNotMatch(read('js/realtime-view.js'), /document\.querySelectorAll\(["']\.rs-line-card\.selected/);
  assert.match(read('js/history.js'), /getElementById\("historyContainer"\)/);
  const html = read('pages/history.html');
  assert.match(html, /id="historyContainer"/);
  assert.doesNotMatch(html, /id="historyEmpty"|id="historyList"/);
});

test('trains detail hides the whole browser and restores it on return', () => {
  const js = read('js/trains-page.js');
  assert.match(js, /browser\.classList\.add\("hidden"\)/);
  assert.match(js, /browser\.classList\.remove\("hidden"\)/);
  assert.match(js, /filterLinesByOperator\(getLinesData\(\), _selectedOperator\)/);
  assert.doesNotMatch(js, /_oldGroups|_freshGroups|_freshByOp/);
});

test('canonical trains refresh and realtime status reconciliation honor operator selection', () => {
  const trains = read('js/trains-page.js');
  const realtime = read('js/realtime-view.js');
  assert.match(trains, /renderFiltered\(el, ul\)/);
  assert.match(realtime, /var visibleLines = window\.DataState\.filterLinesByOperator\(linesObj, _selectedOperator\)/);
  assert.match(realtime, /Object\.keys\(visibleLines \|\| \{\}\)/);
});

test('shared list tolerates missing mount and filter bar clears stale choices', () => {
  const data = read('js/data-state.js');
  const filter = read('js/operator-filter-bar.js');
  assert.match(data, /function renderList\(container, linesObj, options\) \{\s*if \(!container\) return;/);
  assert.match(filter, /if\(!availableOps\.length\)\{el\.innerHTML="";available\(false\);return;\}/);
});

test('realtime operator selection never invokes an undefined structure signature', () => {
  const realtime = read('js/realtime-view.js');
  assert.doesNotMatch(realtime, /structureSignature\(/);
  assert.match(realtime, /_renderedStatusSignatures = \{\};/);
});

test('trains language refresh replaces stale cards even for an empty selection', () => {
  const js = read('js/trains-page.js');
  assert.doesNotMatch(js, /if \(_linesNow && Object\.keys\(_linesNow\)\.length\)/);
  assert.match(js, /DataState\.renderList\(_freshHost, _linesNow,/);
  assert.match(js, /listEl\.innerHTML = _freshHost\.innerHTML;/);
});

test('realtime empty selection still refreshes operator choices', () => {
  const js = read('js/realtime-view.js');
  const start = js.indexOf('function renderFiltered()');
  const end = js.indexOf('var _renderedStatusSignatures', start);
  assert.ok(start >= 0 && end > start);
  const body = js.slice(start, end);
  assert.match(body, /DataState\.renderList\(container, filtered,/);
  assert.match(body, /renderFilterBar\(_latestLines\)/);
  assert.doesNotMatch(body, /Object\.keys\(filtered\)\.length === 0/);
});

test('realtime empty-card reconciliation clears stale status signatures', () => {
  const js = read('js/realtime-view.js');
  const start = js.indexOf('function reconcileRealtimeList(container, linesObj)');
  assert.ok(start >= 0);
  const body = js.slice(start, js.indexOf('function init()', start));
  assert.match(body, /if \(!cards \|\| cards\.length === 0\) \{\s*renderFiltered\(\);\s*_renderedStatusSignatures = \{\};\s*return;/);
});

test('realtime official statuses update incrementally instead of waiting for every operator', () => {
  const js = read('js/realtime-view.js');
  const start = js.indexOf('function refreshListStatuses(linesObj)');
  const end = js.indexOf('function escapeHtml(s)', start);
  assert.ok(start >= 0 && end > start);
  const body = js.slice(start, end);
  assert.doesNotMatch(body, /Promise\.all\(/);
  assert.match(body, /Promise\.resolve\(window\.RunInfoAPI\.query\(lineId, line\)\)/);
  assert.match(body, /queueChange\(lineId\)/);
  assert.match(body, /setTimeout\(flushChanges, 100\)/);
  assert.match(body, /token !== _listStatusRefreshToken/);
});


test('a line with an active Train API never queries Supabase timetables', () => {
  const api = read('data/api/odpt-unified.js');
  const fusion = read('js/data-fusion.js');
  const config = read('data/core/data-config-bundle.js');
  assert.match(api, /function hasRealtimePositionApi\(lineId\)/);
  assert.match(api, /if \(hasRealtimePositionApi\(lineId\)\) return Promise\.resolve\(\[\]\)/);
  assert.match(api, /var sourcePromise = hasRealtimePositionApi\(lineId\)/);
  assert.match(fusion, /if \(liveApi\) \{/);
  assert.match(config, /"SaikyoKawagoe": true/);
  assert.match(config, /"Kawagoe": true/);
});

test('SQL train-runs cannot serve realtime lines or a vehicle image catalog', () => {
  const edge = read('supabase/functions/train-runs/index.ts');
  const vehicle = read('js/train-vehicle.js');
  assert.match(edge, /source\?\.realtime_position_api_enabled/);
  assert.doesNotMatch(edge, /catalog=vehicle-artwork|vehicle_artwork_exact_locked/);
  assert.doesNotMatch(vehicle, /functions\/v1\/train-runs\?catalog=vehicle-artwork/);
  assert.doesNotMatch(vehicle, /refreshVerifiedArtworkCatalog\(/);
});


test('Supabase timetable importer cannot ingest an API-backed realtime railway', () => {
  const importer = read('supabase/functions/timetable-ingest/index.ts');
  const serving = read('supabase/functions/train-runs/index.ts');
  assert.match(importer, /realtime_position_api_enabled/);
  assert.match(importer, /REALTIME_API_LINE_NOT_ELIGIBLE_FOR_SQL_TIMETABLE/);
  assert.match(importer, /line\.realtime_position_api_enabled === true/);
  assert.match(serving, /if \(source\?\.realtime_position_api_enabled\)/);
  assert.doesNotMatch(importer, /getCachedTrainRuns/);
});


test('Rinkai candidates never fabricate JR E233; dated exact carsets use same-model PNG', () => {
  const vm = require('node:vm');
  const window = {};
  vm.runInNewContext(read('js/train-vehicle.js'), { window, console: { debug() {} } });
  const ambiguous = window.TrainVehicle.resolve({ timetableVehicleType: '70-000形 / 71-000形' });
  assert.equal(ambiguous.identityStatus, 'NARROWED');
  assert.equal(ambiguous.iconPath, '');

  const exact = window.TrainVehicle.resolve({
    timetableVehicleType: '東京臨海高速鉄道70-000形', serviceDate: '2026-04-03',
    formationId: 'Z2', formationCandidates: ['Z2']
  });
  assert.equal(exact.identityStatus, 'EXACT');
  assert.match(exact.iconPath, /東京臨海高速鉄道_70-000形\.png$/);
  assert.doesNotMatch(exact.iconPath, /E233/);

  const estimator = read('js/train-position-estimator.js');
  const fusion = read('js/data-fusion.js');
  assert.match(estimator, /_resolvedEvidence\.decisive === true/);
  assert.match(estimator, /if \(_compatible\) _timetableVehicleInput = _operationModels\[0\]/);
  assert.match(fusion, /_allowedCandidates\.indexOf\(v\.resolution\.name\) < 0/);
  assert.match(fusion, /\(v\.evidenceRank \|\| 0\) < 5/);
});

test('direct through railway loads its timetable evidence and shares one estimator', () => {
  const page = read('js/trains-page.js');
  const fusion = read('js/data-fusion.js');
  const estimator = read('js/train-position-estimator.js');
  assert.match(page, /RunningChainResolver\.getDirectThroughLines\(lineId\)/);
  assert.match(page, /if \(!lines\[id\]\) return/);
  assert.match(page, /_requestedLines\.indexOf\(id\) < 0/);
  assert.match(page, /!window\.ODPTClient\.hasRealtimePositionApi\(id\)/);
  assert.match(page, /_timetablePartners\.map\(function\(id\)/);
  assert.match(fusion, /if \(_hasOdptTimetable\(lineId\)\) \{/);
  assert.match(estimator, /scheduledItineraryKey: run\.scheduledItineraryKey/);
  assert.match(fusion, /var fingerprint = _ep\.scheduledItineraryKey/);
  assert.match(fusion, /_scheduledEstimateItineraries\[k\]\[fingerprint\]/);
  assert.doesNotMatch(page, /Rinkai.*vehicleType.*=.*70-000/);
});

test('SaikyoKawagoe and Kawagoe use ODPT/JS without loading legacy manual timetables', () => {
  const source = read('data/core/runtime-config.js');
  const bundle = read('data/core/data-config-bundle.js');
  const fusion = read('js/data-fusion.js');
  const api = read('data/api/odpt-unified.js');
  for (const line of ['SaikyoKawagoe', 'Kawagoe']) {
    const policy = new RegExp('"' + line + '":\\s*\\{\\s*mode:\\s*"(?:FULL|HYBRID)",\\s*manualTimetableEvidence:\\s*false\\s*\\}');
    assert.match(source, policy);
    assert.match(bundle, policy);
    assert.match(bundle, new RegExp('"' + line + '":\\s*true'));
    assert.match(api, new RegExp('"' + line + '":\\s*"JR-East"'));
  }
  assert.match(fusion, /if \(_manualEvidenceDisabled\(lineId\)\) return Promise\.resolve\(false\)/);
  assert.match(fusion, /if \(_manualEvidenceDisabled\(lineId\)\) \{ resolve\(false\); return; \}/);
  assert.match(api, /if \(hasRealtimePositionApi\(lineId\)\) return Promise\.resolve\(\[\]\)/);
});

test('live API capabilities survive config regeneration and remain SQL-bypass only', () => {
  const original = read('data/core/runtime-config.js');
  const bundled = read('data/core/data-config-bundle.js');
  const api = read('data/api/odpt-unified.js');
  const edge = read('supabase/functions/train-runs/index.ts');
  const importer = read('supabase/functions/timetable-ingest/index.ts');
  function configuredLines(text) {
    const marker = 'var REALTIME_POSITION_API_LINES = Object.freeze({';
    const start = text.indexOf(marker);
    assert.ok(start >= 0, 'missing source capability registry');
    const end = text.indexOf('});', start);
    assert.ok(end > start, 'unterminated capability registry');
    return Array.from(text.slice(start, end).matchAll(/"([^"]+)":\s*true/g), m => m[1]).sort();
  }
  const registered = configuredLines(original);
  assert.ok(registered.length >= 24);
  assert.deepEqual(registered, configuredLines(bundled));
  for (const id of ['Asakusa', 'ChuoRapid', 'KeihinTohoku', 'Mita', 'TobuSkytree', 'Yamanote']) {
    assert.ok(registered.includes(id), id + ' lost its realtime capability');
  }
  assert.match(original, /REALTIME_POSITION_API_LINES:\s*REALTIME_POSITION_API_LINES/);
  assert.match(bundled, /REALTIME_POSITION_API_LINES:\s*REALTIME_POSITION_API_LINES/);
  assert.match(api, /if \(hasRealtimePositionApi\(lineId\)\) return Promise\.resolve\(\[\]\)/);
  assert.match(api, /var sourcePromise = hasRealtimePositionApi\(lineId\)/);
  assert.match(edge, /if \(source\?\.realtime_position_api_enabled\)/);
  assert.match(importer, /if \(line\.realtime_position_api_enabled === true\)/);
});

test('runtime configuration source matches the deployed config-bundle section', () => {
  const source = read('data/core/runtime-config.js').replace(/^\uFEFF/, '').trimEnd();
  const bundle = read('data/core/data-config-bundle.js');
  const startMarker = '// ===== runtime-config.js =====\n';
  const endMarker = '\n// ===== platform-data.js =====';
  const start = bundle.indexOf(startMarker);
  assert.ok(start >= 0);
  const end = bundle.indexOf(endMarker, start + startMarker.length);
  assert.ok(end > start);
  assert.equal(source, bundle.slice(start + startMarker.length, end).trimEnd());
});
