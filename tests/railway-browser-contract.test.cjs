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
  assert.ok(registered.length >= 32);
  assert.deepEqual(registered, configuredLines(bundled));
  for (const id of ['Arakawa', 'Asakusa', 'ChuoRapid', 'KeihinTohoku', 'KeioMain', 'Mita', 'TobuSkytree', 'Yamanote']) {
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

test('realtime ODPT source repair never resets railway registry or timetable roles', () => {
  const sql = read('supabase/migrations/20261012162155_restore_missing_odpt_runtime_mappings_no_overwrite.sql');
  assert.match(sql, /UPDATE public\.railway_lines l/);
  assert.match(sql, /l\.realtime_position_api_enabled IS TRUE/);
  assert.match(sql, /l\.odpt_operator IS NULL AND l\.odpt_railway IS NULL/);
  assert.doesNotMatch(sql, /UPDATE public\.railway_lines\s+SET\s+odpt_operator\s*=\s*null/i);
  for (const id of ['Arakawa', 'KeioMain', 'Kawagoe', 'SaikyoKawagoe', 'SobuRapid', 'Tokaido', 'UtsunomiyaJR']) {
    assert.ok(sql.includes("'" + id + "'"), id + ' missing from source repair');
  }
});

test('ODPT FULL runtime lines with exact IDs bypass SQL and remain registered', () => {
  const source = read('data/core/runtime-config.js');
  const bundle = read('data/core/data-config-bundle.js');
  const migration = read('supabase/migrations/20261012231749_align_existing_full_odpt_train_routes_with_runtime.sql');
  for (const id of ['KeioInokashira','KeioKeibajo','KeioTakao','Noda','Tojo','Ogose']) {
    assert.ok(source.includes('"' + id + '": true'), id + ' missing in runtime capability registry');
    assert.ok(bundle.includes('"' + id + '": true'), id + ' missing in deployed runtime registry');
    assert.ok(migration.includes("('" + id + "','"), id + ' missing in database source alignment');
  }
  assert.match(migration, /l\.realtime_position_api_enabled IS FALSE/);
  assert.match(migration, /l\.odpt_operator IS NULL/);
  assert.doesNotMatch(migration, /DELETE FROM public\.manual_timetable_templates/i);
  for (const alias of ['KeioSagami','KeioShin','KeioZoo']) {
    assert.ok(!migration.includes("('" + alias + "','"), alias + ' requires separate realtime verification');
  }
});

test('Toden Arakawa live vehicle numbers resolve all 33 cars to exact models and matching gallery PNGs', () => {
  const vm = require('node:vm');
  const window = {};
  vm.runInNewContext(read('js/train-vehicle.js'), {window, console:{debug(){}}}, {filename:'train-vehicle.js'});
  const groups = [
    ['7701 7702','都電7700形（みどり）','7700形_みどり.png'],
    ['7703 7704 7705','都電7700形（あお）','7700形_あお.png'],
    ['7706 7707 7708','都電7700形（えんじ）','7700形_えんじ.png'],
    ['8501','都電8500形（8501号車・リニューアル）',null],
    ['8502 8503 8504 8505','都電8500形','8500形.png'],
    ['8801 8802 8803 8804 8805','都電8800形（ローズレッド）','8800形_ローズレッド.png'],
    ['8806 8807','都電8800形（バイオレット）','8800形_バイオレット.png'],
    ['8808 8809','都電8800形（オレンジ）','8800形_オレンジ.png'],
    ['8810','都電8800形（イエロー）','8800形_イエロー.png'],
    ['8901 8902','都電8900形（オレンジ）','8900形_オレンジ.png'],
    ['8903 8904','都電8900形（ブルー）','8900形_ブルー.png'],
    ['8905 8906','都電8900形（ローズピンク）','8900形_ローズピンク.png'],
    ['8907 8908','都電8900形（イエロー）','8900形_イエロー.png'],
    ['9001','都電9000形（9001号車・赤色）','9000形_9001号車_赤色.png'],
    ['9002','都電9000形（9002号車・青色）','9000形_9002号車_青色.png']
  ];
  const context = {lineId:'Arakawa',operator:'Toei',railway:'odpt.Railway:Toei.Arakawa'};
  let count = 0;
  for (const [list, name, imageFile] of groups) {
    for (const number of list.split(' ')) {
      const resolved = window.TrainVehicle.resolve({...context,realtimeCarNumber:number,trainNumber:number});
      assert.equal(resolved.identityStatus,'EXACT',number);
      assert.equal(resolved.name,name,number);
      assert.equal(resolved.verifiedCarNumber,number);
      assert.equal(resolved.identityReason,'verified-toden-realtime-car-number');
      assert.ok(resolved.sources.includes('official-realtime-car-number'));
      if (imageFile) {
        assert.ok(resolved.iconPath.endsWith('/都営地下鉄_' + imageFile),number);
        assert.ok(fs.existsSync(path.join(root,resolved.iconPath.replace('../',''))),number);
      } else {
        assert.equal(resolved.iconPath,'',number + ' must not claim the retired 8501 livery');
      }
      count++;
    }
  }
  assert.equal(count,33);
  for (const number of ['0000','7007','7501','7700','7709','8506','8811','8909','9000','9003','ODPT0059','7701F','07701','']) {
    assert.equal(window.TrainVehicle.resolve({...context,realtimeCarNumber:number}).identityStatus,'UNKNOWN',number);
  }
  for (const change of [
    {lineId:'Mita'}, {operator:'JR-East'}, {railway:'odpt.Railway:Toei.Asakusa'}
  ]) {
    const r = window.TrainVehicle.resolve({...context,...change,realtimeCarNumber:'7701'});
    assert.equal(r.identityStatus,'UNKNOWN');
  }
  assert.equal(window.TrainVehicle.resolve({...context,trainNumber:'7701'}).identityStatus,'UNKNOWN');
  const conflict = window.TrainVehicle.resolve({...context,realtimeCarNumber:'7701',realtimeVehicleType:'都電8900形（オレンジ）'});
  assert.equal(conflict.identityStatus,'NARROWED');
  assert.equal(conflict.iconPath,'');
  const fusion = read('js/data-fusion.js');
  assert.match(fusion, /realtimeCarNumber: lid === "Arakawa"/);
  assert.match(fusion, /railway: railway,/);
  assert.match(fusion, /lid !== "Arakawa" && window\.TrainOperationEvidence/);
});
