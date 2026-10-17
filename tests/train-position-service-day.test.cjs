const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../js/train-position-estimator.js'), 'utf8');

test('live deduplication respects source identity, railway and direction', () => {
  const fusion=fs.readFileSync(path.join(__dirname,'../js/data-fusion.js'),'utf8');
  const start=fusion.indexOf('  function _realtimeSourceIdentity(');
  const end=fusion.indexOf('\n  // Evidence-backed',start);
  const ctx={};
  vm.runInNewContext(fusion.slice(start,end),ctx);
  const key=ctx._realtimeSourceIdentity;
  const row={'odpt:trainNumber':'1004K','odpt:railDirection':'Inbound'};
  assert.notEqual(key(row,'JR-East','SaikyoKawagoe'),key(row,'JR-East','Keiyo'));
  assert.notEqual(key(row,'JR-East','SaikyoKawagoe'),key({...row,'odpt:railDirection':'Outbound'},'JR-East','SaikyoKawagoe'));
  assert.notEqual(key(row,'JR-East','SaikyoKawagoe'),key(row,'TWR','SaikyoKawagoe'));
  const explicit={...row,'owl:sameAs':'odpt.Train:JR-East.SaikyoKawagoe.1004K'};
  assert.equal(key(explicit,'JR-East','SaikyoKawagoe'),key({...explicit,'dc:date':'new snapshot'},'JR-East','SaikyoKawagoe'));
});

test('duplicate realtime rows retain the newest source position', () => {
  const fusion=fs.readFileSync(path.join(__dirname,'../js/data-fusion.js'),'utf8');
  const start=fusion.indexOf('            if (existingIdx >= 0) {');
  const end=fusion.indexOf('            var rawType',start);
  const code='(function(){'+fusion.slice(start,end)+'return "accept";})()';
  const run=incoming=>vm.runInNewContext(code,{existingIdx:0,lid:'Test',
    posMap:{Test:[{sourceUpdatedAt:'2026-10-13T12:01:00+09:00'}]},t:{'dc:date':incoming}});
  assert.equal(run('2026-10-13T12:00:00+09:00'),undefined);
  assert.equal(run('2026-10-13T12:02:00+09:00'),'accept');
  assert.equal(run('invalid timestamp'),undefined);
});

function estimatorAt(year, month, day, hour, minute, overrides) {
  const fixed = new Date(Date.UTC(year, month - 1, day, hour, minute) - 9 * 60 * 60 * 1000);
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : [fixed.getTime()])); }
    static now() { return fixed.getTime(); }
  }
  const window = { RuntimeConfig: { SERVICE_DAY_CALENDAR: overrides || {} }, ODPTClient: {
    LINE_RAILWAY_CODE: {Joban:'JobanRapid',JobanMain:'Joban'},
    LINE_TO_OPERATOR: {Joban:'JR-East',JobanMain:'JR-East'}
  } };
  vm.runInNewContext(source, { window, Date: FixedDate, console: { debug() {} } });
  return window.TrainPositionEstimator;
}

test('published Joban runs continue past Toride and leave the visible map', () => {
  const lines=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/core/railway_data.json'),'utf8')).lines;
  const fixtures=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/joban-published-continuation.json'),'utf8'));
  function at(number,hour,minute,verified=true) {
    const f=fixtures.find(f=>f.number===number);
    const tt={ '@id':'canonical:'+number,'odpt:trainNumber':number,
      'odpt:railway':'odpt.Railway:JR-East.JobanRapid','odpt:calendar':'odpt.Calendar:Weekday',
      'odpt:railDirection':f.direction,'odpt:destinationStation':f.destination,
      _positionSource:'supabase-train-run',_canonicalGroupEvidence:verified?'verified_continuation':'source_only',
      'odpt:trainTimetableObject':f.stops.map(s=>({
        'odpt:arrivalStation':s.arrival_station_urn,'odpt:departureStation':s.departure_station_urn,
        'odpt:arrivalTime':s.arrival_clock,'odpt:departureTime':s.departure_clock
      })) };
    return estimatorAt(2026,10,14,hour,minute).estimateLinePositions('Joban',lines.Joban,[tt],{},'JR-East',lines);
  }
  assert.equal(at('1185M',16,12).length,1);
  assert.equal(at('1185M',16,16)[0].stationIndex,lines.Joban.stations.indexOf('Toride'));
  assert.equal(at('1185M',16,21)[0].stationIndex,lines.Joban.stations.indexOf('Ryugasaki'));
  assert.equal(at('1185M',16,33)[0].stationIndex,lines.Joban.stations.indexOf('Hitachino-Ushiku'));
  assert.equal(at('1185M',16,50).length,0);
  assert.equal(at('1187M',17,4).length,1);
  assert.equal(at('1187M',17,12).length,0,'northbound train must not remain pinned at Tsuchiura');
  const express=at('19M',16,30);
  assert.equal(express.length,1);
  assert(express[0].stationIndex>12 && express[0].stationIndex<18,'express uses timed Ueno-Mito bracket beyond Toride');
  assert.equal(at('19M',16,50).length,0);
  assert.equal(at('8M',11,0).length,1,'southbound express enters map from a timed bracket outside it');
  assert.equal(at('8M',11,0,false).length,0,'unverified run cannot project outside stops');
});

test('service calendar rolls over at 04:00, including weekends', () => {
  assert.equal(estimatorAt(2026, 10, 10, 3, 59).getCurrentCalendar(), 'odpt.Calendar:Weekday');
  assert.equal(estimatorAt(2026, 10, 10, 4, 0).getCurrentCalendar(), 'odpt.Calendar:Saturday');
  assert.equal(estimatorAt(2026, 10, 12, 2, 0).getCurrentCalendar(), 'odpt.Calendar:Holiday');
  assert.equal(estimatorAt(2026, 10, 12, 4, 0).getCurrentCalendar(), 'odpt.Calendar:Holiday');
});

test('explicit holiday override applies to the service date, not wall-clock date', () => {
  const overrides = { '2026-10-12': 'holiday', '2026-10-13': 'weekday' };
  assert.equal(estimatorAt(2026, 10, 13, 3, 59, overrides).getCurrentCalendar(), 'odpt.Calendar:Holiday');
  assert.equal(estimatorAt(2026, 10, 13, 4, 0, overrides).getCurrentCalendar(), 'odpt.Calendar:Weekday');
});

test('overnight minute axis stays continuous until 04:00', () => {
  assert.equal(estimatorAt(2026, 10, 10, 0, 9).getCurrentMinutes(), 1449);
  assert.equal(estimatorAt(2026, 10, 10, 3, 59).getCurrentMinutes(), 1679);
  assert.equal(estimatorAt(2026, 10, 10, 4, 0).getCurrentMinutes(), 240);
});

test('published Japanese holidays and substitute holidays use holiday timetable', () => {
  assert.equal(estimatorAt(2026, 9, 22, 12, 0).getCurrentCalendar(), 'odpt.Calendar:Holiday');
  assert.equal(estimatorAt(2026, 5, 6, 12, 0).getCurrentCalendar(), 'odpt.Calendar:Holiday');
  assert.equal(estimatorAt(2027, 3, 22, 12, 0).getCurrentCalendar(), 'odpt.Calendar:Holiday');
  assert.equal(estimatorAt(2026, 10, 9, 12, 0).getCurrentCalendar(), 'odpt.Calendar:Weekday');
});

test('explicit operator calendar override takes priority over published holidays', () => {
  const overrides = { '2026-10-12': 'weekday', '2026-10-09': 'holiday' };
  assert.equal(estimatorAt(2026, 10, 12, 12, 0, overrides).getCurrentCalendar(), 'odpt.Calendar:Weekday');
  assert.equal(estimatorAt(2026, 10, 9, 12, 0, overrides).getCurrentCalendar(), 'odpt.Calendar:Holiday');
});


const runningChainSource = fs.readFileSync(path.join(__dirname, '../js/running-chain-resolver.js'), 'utf8');

test('handover endpoints must be the same station even when several stations are declared', () => {
  const window = { UNIFIED_LINES: {
    A: { serviceBoundaries: [{lineId:'B',handoverStations:['Ueno','Tokyo','Shinagawa']}] },
    B: { serviceBoundaries: [{lineId:'A',handoverStations:['Ueno','Tokyo','Shinagawa']}] }
  } };
  vm.runInNewContext(runningChainSource, {window,console});
  const a=segment('1161M','odpt.Railway:JR-East.JobanRapid','Shinagawa','11:35','Toride','12:34');
  const b=segment('1159M','odpt.Railway:JR-East.UenoTokyo','Shinagawa','11:17','Ueno','11:32');
  const result=window.RunningChainResolver.resolveTimetableChain(a,'A',[{lineId:'B',timetable:b}]);
  assert.equal(result.evidence,'NO_CONFIRMED_BOUNDARY');
  assert.doesNotMatch(result.runningChainId,/1159M/);
});

test('Ueno-Tokyo corridor is neither a separate line card nor a through train handover', () => {
  const lines=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/core/railway_data.json'),'utf8')).lines;
  const context={window:{UNIFIED_LINES:lines},console};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../data/core/runtime-config.js'),'utf8'),context);
  vm.runInNewContext(runningChainSource,context);
  const resolver=context.window.RunningChainResolver;
  assert.ok(!resolver.getDirectThroughLines('Joban').includes('UenoTokyo'));
  assert.ok(resolver.getDirectThroughLines('Joban').includes('NaritaAbikoBranch'));
  assert.equal(resolver.getDirectThroughLines('UenoTokyo').length,0);
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/line-presentation-service.js'),'utf8'),context);
  const cards=context.window.LinePresentationService.getPresentationOrder(lines).map(e=>e.id);
  assert.ok(!cards.includes('UenoTokyo'));
  assert.ok(cards.includes('Joban'));
  const data=fs.readFileSync(path.join(__dirname,'../js/trains-data.js'),'utf8');
  vm.runInNewContext(data.slice(data.indexOf('function _canonicalThroughLines('),data.indexOf('function _canonicalJoinStations(')),context);
  assert.ok(!context._canonicalThroughLines('Joban').includes('UenoTokyo'));
  assert.ok(context._canonicalThroughLines('Joban').includes('NaritaAbikoBranch'));
  assert.ok(lines.Joban.stations.includes('Shinagawa'));
  assert.ok(lines.Joban.stations.includes('Ueno'));
  assert.equal(lines.Joban.presentation.originStation,'Ueno');
  assert.ok(lines.UenoTokyo, 'corridor source and topology must be retained');
  const names={Ueno:'上野',Shinagawa:'品川',Tsuchiura:'土浦'};
  context.window.RailwayDB={getLineStations:id=>lines[id].stations,
    resolveStationName:id=>names[id]||id,resolveLineName:()=>lines.Joban.name};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/line-card.js'),'utf8'),context);
  const card=context.window.LineCard.render(lines.Joban,'Joban',{mode:'trains'});
  assert.match(card,/上野↔ 土浦/);
  assert.doesNotMatch(card,/品川↔/);
});
function testThroughResolver() {
  const window = {
    UNIFIED_LINES: {
      Metro: { serviceBoundaries: [{ lineId: 'Tobu', handoverStations: ['KitaSenju'] }] },
      Tobu: { serviceBoundaries: [{ lineId: 'Metro', handoverStations: ['KitaSenju'] }] }
    }
  };
  vm.runInNewContext(runningChainSource, { window, console });
  return window.RunningChainResolver;
}
function segment(number, railway, firstStation, firstClock, lastStation, lastClock) {
  return {
    'odpt:trainNumber': number,
    'odpt:railway': railway,
    'odpt:trainTimetableObject': [
      { 'odpt:departureStation': firstStation, 'odpt:departureTime': firstClock },
      { 'odpt:arrivalStation': lastStation, 'odpt:arrivalTime': lastClock }
    ]
  };
}
test('validated Metro-to-Tobu through chain merges unique consecutive train segments', () => {
  const resolver = testThroughResolver();
  const metro = segment('A1000', 'Metro', 'Nakameguro', '10:00', 'KitaSenju', '10:30');
  const tobu = segment('B2200', 'Tobu', 'KitaSenju', '10:30', 'Kuki', '11:12');
  const matched = resolver.resolveTimetableChain(metro, 'Metro', [{ lineId: 'Tobu', timetable: tobu }]);
  assert.equal(matched.segmentCount, 2);
  assert.equal(matched.timeGapMin, 0);
  assert.match(matched.evidence, /TRAIN_NUMBER_CHANGED/);
});
test('through-service evidence rejects two equally possible partner trains', () => {
  const resolver = testThroughResolver();
  const metro = segment('A1000', 'Metro', 'Nakameguro', '10:00', 'KitaSenju', '10:30');
  const tobuA = segment('B2200', 'Tobu', 'KitaSenju', '10:30', 'Kuki', '11:12');
  const tobuB = segment('B3300', 'Tobu', 'KitaSenju', '10:30', 'Kuki', '11:12');
  const result = resolver.resolveTimetableChain(metro, 'Metro', [
    { lineId: 'Tobu', timetable: tobuA }, { lineId: 'Tobu', timetable: tobuB }
  ]);
  assert.equal(result.evidence, 'NO_CONFIRMED_BOUNDARY');
  assert.equal(result.segmentCount, undefined);
});
test('same departure clock cannot imply a physical train without a boundary match', () => {
  const resolver = testThroughResolver();
  const metro = segment('A1000', 'Metro', 'Nakameguro', '10:00', 'KitaSenju', '10:30');
  const unrelated = segment('B2200', 'Tobu', 'Asakusa', '10:00', 'Kuki', '11:12');
  assert.equal(resolver.resolveTimetableChain(metro, 'Metro', [
    { lineId: 'Tobu', timetable: unrelated }
  ]).evidence, 'NO_CONFIRMED_BOUNDARY');
});


test('source-provided train IDs corroborate a uniquely matched through-service boundary', () => {
  const resolver = testThroughResolver();
  const metro = segment('A1000', 'Metro', 'Nakameguro', '10:00', 'KitaSenju', '10:30');
  const tobu = segment('B2200', 'Tobu', 'KitaSenju', '10:30', 'Kuki', '11:12');
  metro._sourceTripId = 'TokyoMetro.Hibiya.A1000.Weekday';
  metro._nextTimetableIds = ['Tobu.Skytree.B2200.Weekday'];
  tobu._sourceTripId = 'Tobu.Skytree.B2200.Weekday';
  tobu._previousTimetableIds = ['TokyoMetro.Hibiya.A1000.Weekday'];
  const result = resolver.resolveTimetableChain(metro, 'Metro', [{ lineId: 'Tobu', timetable: tobu }]);
  assert.equal(result.segmentCount, 2);
  assert.equal(result.evidence, 'CONFIRMED_BOUNDARY+SOURCE_TIMETABLE_LINK');
});

test('one unique source-linked candidate disambiguates two simultaneous transfers', () => {
  const resolver = testThroughResolver();
  const metro = segment('A1000', 'Metro', 'Nakameguro', '10:00', 'KitaSenju', '10:30');
  metro._sourceTripId = 'TokyoMetro.Hibiya.A1000.Weekday';
  metro._nextTimetableIds = ['Tobu.Skytree.B2200.Weekday'];
  const tobu = segment('B2200', 'Tobu', 'KitaSenju', '10:30', 'Kuki', '11:12');
  tobu._sourceTripId = 'Tobu.Skytree.B2200.Weekday';
  const decoy = segment('B3300', 'Tobu', 'KitaSenju', '10:30', 'Kuki', '11:12');
  decoy._sourceTripId = 'Tobu.Skytree.B3300.Weekday';
  const result = resolver.resolveTimetableChain(metro, 'Metro', [
    { lineId: 'Tobu', timetable: decoy }, { lineId: 'Tobu', timetable: tobu }
  ]);
  assert.equal(result.segmentCount, 2);
  assert.equal(result.evidence, 'CONFIRMED_BOUNDARY+SOURCE_TIMETABLE_LINK');
});

test('source link cannot cross an unverified station boundary', () => {
  const resolver = testThroughResolver();
  const metro = segment('A1000', 'Metro', 'Nakameguro', '10:00', 'KitaSenju', '10:30');
  const tobu = segment('B2200', 'Tobu', 'Asakusa', '10:30', 'Kuki', '11:12');
  metro._sourceTripId = 'TokyoMetro.Hibiya.A1000.Weekday';
  metro._nextTimetableIds = ['Tobu.Skytree.B2200.Weekday'];
  tobu._sourceTripId = 'Tobu.Skytree.B2200.Weekday';
  assert.equal(resolver.resolveTimetableChain(metro, 'Metro', [
    { lineId: 'Tobu', timetable: tobu }
  ]).evidence, 'NO_CONFIRMED_BOUNDARY');
});

test('station alias identities from supplied SQL timetables match existing canonical map keys', () => {
  const estimator = estimatorAt(2026, 10, 11, 12, 0);
  assert.equal(estimator.normalizeStationKey('KokuKoen'), estimator.normalizeStationKey('Kokuko-koen'));
  assert.equal(estimator.normalizeStationKey('Shiraitodai'), estimator.normalizeStationKey('Shiroitai'));
});

// Exercise the production SQL read block with a paginated database stub.
async function readSqlRuns(runs, stops, recurringRows = [], exceptions = []) {
  const edge = fs.readFileSync(path.join(__dirname, '../supabase/functions/train-runs/index.ts'), 'utf8');
  const begin = edge.lastIndexOf('  async function pages(');
  const body = edge.slice(begin, edge.lastIndexOf('\n});'))
    .replace('makeQuery: (first: number, last: number) => any', 'makeQuery')
    .replace('const result: any[]', 'const result')
    .replace('new Map<number, any[]>()', 'new Map()')
    .replace(/\(s: any\)/g, '(s)')
    .replace(/\(run: any\)/g, '(run)')
    .replace(/\(s: string\[\]\)/g, '(s)');
  const db = { from(table) {
    let rows = table === 'train_runs' ? runs : table === 'service_exceptions' ? exceptions : stops;
    const query = {
      select() { return query; }, eq() { return query; }, order() { return query; },
      in(key, ids) { rows = rows.filter(row => ids.includes(row[key])); return query; },
      range(first, last) { return Promise.resolve({ data: rows.slice(first, last + 1), error: null }); }
    };
    return query;
  } };
  const helperStart = edge.indexOf('function isCancelled(');
  const helper = edge.slice(helperStart, edge.indexOf('/**', helperStart)).replace(/: any\[\]|: any|: string/g, '');
  return vm.runInNewContext(helper + '(async function() {' + body + '})()', {
    db, lineId: 'Test', serviceDate: '2026-10-13', source: { timetable_operator: 'Test' }, console,
    json(value) { return value; }, readManualTemplateRuns() {
      return Promise.resolve({ json: async () => ({
        ok: true, complete: recurringRows.length > 0, runs: recurringRows,
        source: recurringRows.length ? 'DATABASE_MANUAL_TEMPLATES' : 'NO_API_NO_DATA',
        omitted_incomplete_runs: 0
      }) });
    }
  });
}

test('SQL reads page past 1000 runs and stops without claiming truncated coverage', async () => {
  const runs = Array.from({ length: 1005 }, (_, id) => ({ id, train_number: String(id) }));
  const stops = runs.flatMap(run => Array.from({ length: 8 }, (_, stop_sequence) => ({
    train_run_id: run.id, stop_sequence, station_urn: 'odpt.Station:Test.A', departure_time: '12:00'
  })));
  const result = await readSqlRuns(runs, stops);
  assert.equal(result.complete, true);
  assert.equal(result.runs.length, 1005);
  assert.equal(result.runs.reduce((n, run) => n + run.stops.length, 0), 8040);
  const cancelled = await readSqlRuns(runs, stops, [], runs.map(r => ({ id:r.id, train_run_id:r.id, exception_type:'cancelled' })));
  assert.equal(cancelled.cancelled_runs,1005,'service exception pages also pass the1000row limit');
  assert.equal(cancelled.runs.length,1005,'cancellation retains every planned itinerary');
  assert(cancelled.runs.every(r=>r.operation_status==='cancelled'));
});

test('one incomplete SQL run preserves verified runs and explicitly reports partial coverage', async () => {
  const result = await readSqlRuns([{ id: 1 }, { id: 2 }], [
    { train_run_id: 1, station_urn: 'A', departure_time: '12:00' },
    { train_run_id: 1, station_urn: 'B', arrival_time: '12:10' },
    { train_run_id: 2, station_urn: 'A', departure_time: '12:00' }
  ]);
  assert.equal(result.complete, false);
  assert.equal(result.partial, true);
  assert.equal(result.runs.length, 1);
  assert.equal(result.omitted_incomplete_runs, 1);
});

test('an authoritative empty fusion snapshot cannot resurrect cached trains', () => {
  const context = { window: {
    DataFusion: { getRealtimePositions() { return []; } },
    DataLayer: { getCachedPositions() { throw Error('stale cache must not be read'); } }
  } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/trains-data.js'), 'utf8'), context);
  assert.equal(context._getBasePositions('Test').length, 0);
});

test('realtime source outranks SQL and SQL outranks legacy station estimates', () => {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/trains-data.js'), 'utf8'), context);
  const realtime = { positionSource: 'realtime-api' };
  const sql = { positionSource: 'supabase-train-run', estimated: true };
  const legacy = { positionSource: 'station-timetable', estimated: true };
  assert.equal(context._preferTrainPosition(sql, realtime), realtime);
  assert.equal(context._preferTrainPosition(sql, legacy), sql);
  assert.equal(context._preferTrainPosition(sql, {
    positionSource: 'realtime-api', sourceValidUntil: '2000-01-01T00:00:00Z'
  }), sql);
});

function allowsCoverage(mode, positions) {
  const fusion = fs.readFileSync(path.join(__dirname, '../js/data-fusion.js'), 'utf8');
  const start = fusion.indexOf('      function getRealtimePositionPolicy(lineId)');
  const end = fusion.indexOf('      doEstimation = function', start);
  const context = { window: { RuntimeConfig: { REALTIME_POSITION_POLICY: {
    lines: { Test: { mode } }
  } } }, posMap: { Test: positions }, allLines: { Test: { stations: ['A', 'B'] } } };
  vm.runInNewContext(fusion.slice(start, end), context);
  return context.mayUseTimetableEstimate('Test', { stationIndex: 0 });
}

test('coverage gaps allow SQL while a full live source retains authority', () => {
  assert.equal(allowsCoverage('FULL', []), false);
  assert.equal(allowsCoverage('FULL', [{ positionSource: 'realtime-api' }]), false);
  assert.equal(allowsCoverage('HYBRID', [{ positionSource: 'realtime-api' }]), true);
  assert.equal(allowsCoverage('SEGMENTED', []), true);
});

test('SQL service dates roll over at 04:00 Japan time regardless of host timezone', () => {
  function dateAt(iso) {
    class FixedDate extends Date {
      constructor(...args) { super(...(args.length ? args : [Date.parse(iso)])); }
      static now() { return Date.parse(iso); }
    }
    const window = {};
    vm.runInNewContext(source, { window, Date: FixedDate, console: { debug() {} } });
    return window.TrainPositionEstimator.getCurrentServiceDate();
  }
  assert.equal(dateAt('2026-10-12T18:59:00Z'), '2026-10-12');
  assert.equal(dateAt('2026-10-12T19:00:00Z'), '2026-10-13');
});

test('movement inside one station segment and refreshed validity notify fusion consumers', () => {
  const fusion = fs.readFileSync(path.join(__dirname, '../js/data-fusion.js'), 'utf8');
  const start = fusion.indexOf('        var _positionDirty = {};');
  const end = fusion.indexOf('        // Report aggregate resolver costs', start);
  function changes(before, after) {
    let dirty;
    vm.runInNewContext(fusion.slice(start, end), {
      _previousPosMap: { Test: [before] }, posMap: { Test: [after] },
      _positionIdentity(p) { return p.trainId; }, fuseDirty(ids) { dirty = ids; }
    });
    return Array.from(dirty);
  }
  const row = { trainId: 'run-1', stationIndex: 0, segmentToIndex: 1, segmentProgress: 0.2 };
  assert.deepEqual(changes(row, { ...row }), []);
  assert.deepEqual(changes(row, { ...row, segmentProgress: 0.5 }), ['Test']);
  assert.deepEqual(changes(row, { ...row, sourceValidUntil: '2026-10-13T12:01:00+09:00' }), ['Test']);
});

test('a failed service-date SQL load remains retryable until usable rows arrive', async () => {
  const fusion = fs.readFileSync(path.join(__dirname, '../js/data-fusion.js'), 'utf8');
  const start = fusion.indexOf('  function ensureTimetable(lineId) {');
  const end = fusion.indexOf('  function ensureManualTimetable(lineId) {', start);
  let response = [];
  const dates = {};
  const context = {
    _positionServiceDate: dates, _positionLoadedAt: {}, allLines: {},
    _hasOdptTimetable() { return false; },
    _expandDirtyLines() { return []; }, doEstimation() {}, fuseDirty() {}, console,
    window: {
      ODPTClient: { getCachedTrainRuns() { return Promise.resolve(response); } },
      TrainPositionEstimator: { registerManualTimetable() {} }
    }
  };
  vm.runInNewContext(fusion.slice(start, end), context);
  assert.equal(await context.ensureTimetable('Test'), false);
  assert.equal(dates.Test, undefined);
  response = [{ _serviceDate: '2026-10-13' }];
  assert.equal(await context.ensureTimetable('Test'), true);
  assert.equal(dates.Test, '2026-10-13');
});

test('independent branch activation does not expand parent presentation membership', () => {
  const page = fs.readFileSync(path.join(__dirname, '../js/trains-page.js'), 'utf8');
  const start = page.indexOf('      var _requestedLines = currentSystemLineIds');
  const end = page.indexOf('      _requestedLines.forEach(function(id)', start);
  const context = { currentSystemLineIds: null, lineId: 'Main', window: {},
    lines: { Main: { branches: ['Branch'] }, Branch: {}, OtherBranch: { branchOf: 'Main' } },
    _fusionExtensionLines() { return []; }
  };
  vm.runInNewContext(page.slice(start, end), context);
  assert.deepEqual(Array.from(context.window.TrainsActivePositionLineIds), ['Main']);
  context.lineId = 'Branch';
  vm.runInNewContext(page.slice(start, end), context);
  assert.deepEqual(Array.from(context.window.TrainsActivePositionLineIds), ['Branch']);
  assert.equal(context.currentSystemLineIds, null);
});


test('one through-chain keeps Metro SQL and JR live line segments distinct', () => {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/trains-data.js'), 'utf8'), ctx);
  const metro = { runningChainId: 'chain:ayase:1234K', trainId: 'Chiyoda_1234K',
    positionSource: 'supabase-train-run', stationIndex: 16 };
  const jr = { runningChainId: 'chain:ayase:1234K', trainId: 'JobanLocal_1234K',
    fusionLineId: 'JobanLocal', positionSource: 'realtime-api', stationIndex: 0 };
  const both = ctx._dedupeTrainPositions([metro, jr], 'Chiyoda');
  assert.equal(both.length, 2, 'a live through-line position must not erase Metro timetable segment');
  assert.equal(both[0].positionSource, 'supabase-train-run');
  assert.equal(both[1].positionSource, 'realtime-api');

  const sameLineLive = { ...metro, positionSource: 'realtime-api', stationIndex: 17 };
  const oneLine = ctx._dedupeTrainPositions([metro, sameLineLive], 'Chiyoda');
  assert.equal(oneLine.length, 1, 'same-line duplicate should still be deduplicated');
  assert.equal(oneLine[0].positionSource, 'realtime-api');
});

test('one ODPT timetable identity preserves same-number trips across calendars and departures', () => {
  const source = fs.readFileSync(path.join(__dirname, '../data/api/odpt-unified.js'), 'utf8');
  const start = source.indexOf('    function getTimetableIdentity(');
  const end = source.indexOf('    // Line capability', start);
  assert.ok(start >= 0 && end > start);
  const ctx = {};
  vm.runInNewContext(source.slice(start, end), ctx);
  const mk = ctx.getTimetableIdentity;
  const trip = (calendar, clock) => ({
    'odpt:railway': 'odpt.Railway:TokyoMetro.Chiyoda',
    'odpt:calendar': calendar,
    'odpt:trainNumber': '1234K',
    'odpt:railDirection': 'odpt.RailDirection:Inbound',
    'odpt:trainTimetableObject': [
      { 'odpt:departureStation': 'odpt.Station:TokyoMetro.Chiyoda.YoyogiUehara', 'odpt:departureTime': clock },
      { 'odpt:arrivalStation': 'odpt.Station:TokyoMetro.Chiyoda.Ayase', 'odpt:arrivalTime': '10:45' }
    ]
  });
  const weekday = trip('odpt.Calendar:Weekday', '10:10');
  assert.equal(mk(weekday), mk({ ...weekday }));
  assert.notEqual(mk(weekday), mk(trip('odpt.Calendar:Saturday', '10:10')));
  assert.notEqual(mk(weekday), mk(trip('odpt.Calendar:Weekday', '10:20')));
  assert.equal(mk({ 'odpt:trainNumber': '1234K' }), '', 'a bare train number is not a trip identity');

  const fusion = fs.readFileSync(path.join(__dirname, '../js/data-fusion.js'), 'utf8');
  assert.match(fusion, /window\.ODPTClient\.getTimetableIdentity\(t\)/,
    'lazy-load pool must consume the same ODPT timetable identity');
});

test('Nippori-Toneri canonical line ID maps to the Toei ODPT railway', () => {
  const src = fs.readFileSync(path.join(__dirname, '../data/api/odpt-unified.js'), 'utf8');
  assert.match(src, /"Nippori_Toneri":\s*"Toei"/);
  assert.match(src, /"Nippori_Toneri":\s*"NipporiToneri"/);
  const railway = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/core/railway_data.json'), 'utf8'));
  assert.ok(railway.lines.Nippori_Toneri);
});


test('SQL adapter preserves timetable revision verification without inventing current dates', () => {
  const src = fs.readFileSync(path.join(__dirname, '../data/api/odpt-unified.js'), 'utf8');
  const start = src.indexOf('    function _trainRunToTimetable(run) {');
  const end = src.indexOf('    // One timetable identity', start);
  assert.ok(start >= 0 && end > start);
  const ctx = { _plannedTrainRunIdentity() { return 'planned-trip:test'; },
    _dbStopClock(t) { return t; }, LINE_TO_OPERATOR: {}, LINE_RAILWAY_CODE: {} };
  vm.runInNewContext(src.slice(start, end), ctx);
  const row = {
    line_id: 'Chiyoda', operator: 'TokyoMetro', network_key: 'odpt.Railway:TokyoMetro.Chiyoda',
    train_number: '1234K', service_date: '2026-10-13', calendar_type: 'weekday',
    timetable_validity: 'undated_not_current_verified', timetable_date_verified: false,
    stops: [
      { station_urn: 'odpt.Station:TokyoMetro.Chiyoda.YoyogiUehara', departure_time: '10:10' },
      { station_urn: 'odpt.Station:TokyoMetro.Chiyoda.Ayase', arrival_time: '10:45' }
    ]
  };
  const tt = ctx._trainRunToTimetable(row);
  assert.equal(tt._timetableValidity, 'undated_not_current_verified');
  assert.equal(tt._timetableDateVerified, false);
  assert.equal(tt._sourceRevisionDate, null);
  assert.equal(tt._positionSource, 'supabase-train-run');
  assert.match(fs.readFileSync(path.join(__dirname, '../js/train-position-estimator.js'), 'utf8'),
    /timetableValidity:\s*tt\._positionSource === "supabase-train-run"/);
});


test('date-specific SQL train-run supplements, never hides, the recurring plan', async () => {
  const stopsFor = (id, n) => [
    { train_run_id: id, stop_sequence: 0, station_urn: 'odpt.Station:TokyoMetro.Ginza.A',
      departure_time: '10:0' + n },
    { train_run_id: id, stop_sequence: 1, station_urn: 'odpt.Station:TokyoMetro.Ginza.B',
      arrival_time: '10:2' + n }
  ];
  const recurring = [
    { train_number: 'A1001', plan_source: 'sql-recurring-timetable',
      stops: [{ station_urn: 'odpt.Station:TokyoMetro.Ginza.A', departure_time: '10:01' },
              { station_urn: 'odpt.Station:TokyoMetro.Ginza.B', arrival_time: '10:21' }] },
    { train_number: 'A1003', plan_source: 'sql-recurring-timetable',
      stops: [{ station_urn: 'odpt.Station:TokyoMetro.Ginza.A', departure_time: '10:03' },
              { station_urn: 'odpt.Station:TokyoMetro.Ginza.B', arrival_time: '10:23' }] }
  ];
  const merged = await readSqlRuns([{ id: 1, train_number: 'A1001' }], stopsFor(1, 1), recurring);
  assert.equal(merged.complete, true);
  assert.equal(merged.source, 'DATABASE_PLAN_MERGED');
  assert.equal(merged.recurring_runs, 2);
  assert.equal(merged.dated_runs, 1);
  assert.equal(merged.exact_date_overrides, 1);
  assert.equal(merged.runs.length, 2);
  assert.equal(merged.runs.find(r => r.train_number === 'A1001').plan_source, 'sql-date-specific-run');
  assert.equal(merged.runs.find(r => r.train_number === 'A1003').plan_source, 'sql-recurring-timetable');

  const changed = await readSqlRuns([{ id: 1, train_number: 'A1001' }], stopsFor(1, 2), recurring);
  assert.equal(changed.exact_date_overrides, 0);
  assert.equal(changed.runs.length, 3, 'same number but different itinerary cannot be silently collapsed');
  const seconds = stopsFor(1, 1).map(s=>({...s,arrival_time:s.arrival_time?s.arrival_time+':00':undefined,departure_time:s.departure_time?s.departure_time+':00':undefined}));
  const cancelled = await readSqlRuns([{ id:1,train_number:'A1001' }],seconds,recurring,[{train_run_id:1,exception_type:'cancelled'}]);
  assert.equal(cancelled.runs.length,2,'SQL seconds formatting cannot retain a recurring duplicate');
  assert.equal(cancelled.cancelled_runs,1,'cancelled overlay retires its exact recurring trip');
  assert.equal(cancelled.runs.find(r=>r.train_number==='A1001').operation_status,'cancelled');
});

test('unknown calendar is never silently reinterpreted as no train or a verified weekday service', () => {
  const edge = fs.readFileSync(path.join(__dirname, '../supabase/functions/train-runs/index.ts'), 'utf8');
  assert.match(edge, /"CALENDAR_NOT_VERIFIED"/);
  assert.match(edge, /no_service_confirmed: false/);
  assert.match(edge, /planned\.calendar_status !== "unverified"/);
  assert.doesNotMatch(edge, /if\s*\(!templates\.length\)\s*templates\s*=\s*weekday/i);
});

test('planned timetable candidates retain their source grade without becoming asserted rolling stock', () => {
  const src = fs.readFileSync(path.join(__dirname, '../js/train-position-estimator.js'), 'utf8');
  assert.match(fs.readFileSync(path.join(__dirname, '../js/train-vehicle.js'), 'utf8'), /_sqlSourceCandidates = tt\._positionSource === 'supabase-train-run'/);
  assert.match(src, /plannedVehicleCandidates: _plannedCandidates\.slice\(\)/);
  assert.match(src, /vehicleIdentityStatus: vehResult\.identityStatus \|\| 'UNKNOWN'/);
  assert.match(src, /vehicleIconPath: vehResult\.iconPath \|\| ''/);
  const client = fs.readFileSync(path.join(__dirname, '../data/api/odpt-unified.js'), 'utf8');
  assert.match(client, /"_planSource":run\.plan_source/);
  assert.match(client, /getTrainRunStatus: getTrainRunStatus/);
  const edge = fs.readFileSync(path.join(__dirname, '../supabase/functions/train-runs/index.ts'), 'utf8');
  assert.match(edge, /ownerFromUrn \+ "\\u0000" \+ String\(t\.vehicle_type_label/);
  assert.match(edge, /candidateImages\.length === 1 \? candidateImages\[0\] : null/);
  assert.match(src, /plannedVehicleCandidateArtworkPath: tt\._positionSource === 'supabase-train-run'/);
});


test('every canonical railway and declared through boundary retains a valid timetable network identity', () => {
  const railway = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/core/railway_data.json'), 'utf8'));
  const lines = railway.lines;
  const ids = Object.keys(lines);
  assert.ok(ids.length >= 223, 'the whole canonical railway network must be included in regression coverage');
  let throughEdges = 0;
  for (const id of ids) {
    const line = lines[id];
    assert.ok(Array.isArray(line.stations) && line.stations.length >= 2, 'missing station order: ' + id);
    for (const peer of line.throughServices || []) {
      throughEdges++;
      assert.ok(lines[peer], 'unknown through-service partner ' + id + ' -> ' + peer);
      assert.ok((lines[peer].throughServices || []).includes(id),
        'asymmetric through-service edge ' + id + ' -> ' + peer);
      assert.ok((line.serviceBoundaries || []).some(b =>
        b.lineId === peer && Array.isArray(b.handoverStations) && b.handoverStations.length),
        'through service lacks verified boundary ' + id + ' -> ' + peer);
    }
  }
  assert.ok(throughEdges >= 150, 'expected all known direct through-service edges');

  const config = fs.readFileSync(path.join(__dirname, '../data/core/data-config-bundle.js'), 'utf8');
  const liveBlock = /var REALTIME_POSITION_API_LINES = Object.freeze\(\{([\s\S]*?)\}\);/.exec(config);
  assert.ok(liveBlock, 'canonical realtime capability registry missing');
  const live = [...liveBlock[1].matchAll(/"([^"]+)": true/g)].map(m => m[1]);
  assert.equal(new Set(live).size, live.length, 'duplicate realtime capability keys');
  for (const id of live) assert.ok(lines[id], 'realtime capability references noncanonical line: ' + id);
});


test('all sourced Kawagoe 2026-10 sample trips have a traceable published six-stop service, not inferred stock', () => {
  const source = JSON.parse(fs.readFileSync(path.join(__dirname,
    '../data/sources/jreast-kawagoe-2026-10-verified-partial.json'), 'utf8'));
  const railway = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/core/railway_data.json'), 'utf8'));
  assert.equal(source.line_id, 'Kawagoe');
  assert.equal(source.full_line_coverage, false, 'a handful of verified trains is never full coverage');
  assert.equal(source.source_revision_date, null, 'publication month is not a claimed timetable revision');
  assert.equal(source.records.length, 5);
  const seen = new Set();
  for (const trip of source.records) {
    assert.match(trip.source_trip_id, /^https:\/\/timetables\.jreast\.co\.jp\/2610\/train\//);
    assert.ok(['odpt.Calendar:Weekday', 'odpt.Calendar:SaturdayHoliday'].includes(trip.calendar_urn));
    const key = trip.calendar_urn + '|' + trip.train_number;
    assert.ok(!seen.has(key), 'duplicated verified source train');
    seen.add(key);
    assert.equal(trip.stops.length, 6);
    for (const [i, stop] of trip.stops.entries()) {
      // Official ODPT station URNs use CamelCase; geometry keys use hyphens.
      const stationAliases = { NishiKawagoe: 'Nishi-Kawagoe',
        MusashiTakahagi: 'Musashi-Takahagi' };
      assert.ok(railway.lines.Kawagoe.stations.includes(
        stationAliases[stop.stationId] || stop.stationId), 'unknown Kawagoe stop: ' + stop.stationId);
      const time = stop.arrival || stop.departure;
      assert.match(time, /^\d{2}:\d{2}$/);
      if (i === 5) assert.ok(stop.arrival, 'terminal stop must have arrival clock');
      else assert.ok(stop.departure, 'intermediate sample must have published departure clock');
    }
    assert.ok(!('vehicle_type_label' in trip));
  }
});

test('an explicit SQL-partial HYBRID source can load without overriding FULL realtime priority', () => {
  const runCfg = fs.readFileSync(path.join(__dirname, '../data/core/runtime-config.js'), 'utf8');
  const bundle = fs.readFileSync(path.join(__dirname, '../data/core/data-config-bundle.js'), 'utf8');
  for (const src of [runCfg, bundle]) {
    assert.match(src, /"Kawagoe": \{ mode: "HYBRID", manualTimetableEvidence: false, sqlPlannedFallback: true \}/);
    assert.doesNotMatch(src, /mode: "FULL"[^\n]*sqlPlannedFallback: true/);
  }
  const sql = fs.readFileSync(path.join(__dirname, '../supabase/functions/train-runs/index.ts'), 'utf8');
  assert.match(sql, /source\?\.sql_planned_fallback_enabled !== true/);
  assert.match(sql, /sourceSampleOnly = templates\.some/);
  assert.match(sql, /&& !sourceSampleOnly/);
  assert.match(sql, /verified-partial-sample/);
  const odpt = fs.readFileSync(path.join(__dirname, '../data/api/odpt-unified.js'), 'utf8');
  const fusion = fs.readFileSync(path.join(__dirname, '../js/data-fusion.js'), 'utf8');
  assert.match(odpt, /if \(!usesSqlTimetable\(lineId\)\) return Promise\.resolve\(\[\]\)/);
  assert.match(fusion, /if \(fullCoverage\) \{/);
  assert.match(fusion, /return mode !== "FULL"/);
});


test('all non-FULL railways use SQL and FULL remains isolated from SQL errors or gaps', () => {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../data/core/runtime-config.js'), 'utf8'), context);
  const api = fs.readFileSync(path.join(__dirname, '../data/api/odpt-unified.js'), 'utf8');
  const start = api.indexOf('    function usesSqlTimetable(lineId) {');
  const end = api.indexOf('    function getCachedTrainRuns(lineId) {', start);
  vm.runInNewContext(api.slice(start, end), context);
  const lines = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/core/railway_data.json'), 'utf8')).lines;
  const model = context.window.RuntimeConfig.REALTIME_POSITION_POLICY;
  let sql = 0, full = 0;
  for (const id of Object.keys(lines)) {
    const expected = (model.lines[id]?.mode || model.defaultMode) !== 'FULL';
    assert.equal(context.usesSqlTimetable(id), expected, id);
    expected ? sql++ : full++;
  }
  assert.equal(sql, 210);
  assert.equal(full, 13);
  for (const mode of ['HYBRID', 'COARSE', 'SEGMENTED', 'UNKNOWN']) {
    model.lines.Test = { mode };
    assert.equal(context.usesSqlTimetable('Test'), true);
  }
  model.lines.Test = { mode: 'FULL' };
  assert.equal(context.usesSqlTimetable('Test'), false);
  assert.doesNotMatch(api, /HYBRID SQL plan pending|if \(sqlRows && sqlRows/);
  const fusion = fs.readFileSync(path.join(__dirname, '../js/data-fusion.js'), 'utf8');
  assert.match(fusion, /window\.ODPTClient\.usesSqlTimetable\(id\)/);
  assert.match(fusion, /usesSqlTimetable\(l\.lineId\)\) return false/);
  const page = fs.readFileSync(path.join(__dirname, '../js/trains-page.js'), 'utf8');
  assert.match(page, /api\.usesSqlTimetable\(lineId\)/);
});

test('ODPT StationTimetable is never imported as a full train itinerary for HYBRID', () => {
  const src = fs.readFileSync(path.join(__dirname, '../supabase/functions/timetable-ingest/index.ts'), 'utf8');
  assert.match(src, /const url = new URL\("\.\/odpt:TrainTimetable"/);
  assert.match(src, /UPSTREAM_NOT_TRAIN_TIMETABLE/);
  assert.match(src, /line\.sql_planned_fallback_enabled !== true/);
  assert.doesNotMatch(src, /new URL\("\.\/odpt:StationTimetable"/);
  const edge = fs.readFileSync(path.join(__dirname, '../supabase/functions/train-runs/index.ts'), 'utf8');
  assert.match(edge, /source\?\.realtime_position_api_enabled &&/);
  assert.match(edge, /source\?\.sql_planned_fallback_enabled !== true/);
});

test('source-confirmed train models are not reclassified as old SQL candidates', () => {
  const begin = source.indexOf('  function visibleVehicleCandidates(');
  const end = source.indexOf('  function resolveTrainRunIdentity(', begin);
  assert.ok(begin >= 0 && end > begin, 'position estimator must expose one candidate merge');
  const ctx = {};
  vm.runInNewContext(source.slice(begin, end) + '\nthis.visible = visibleVehicleCandidates;', ctx);
  const visible = (evidence, historical) => Array.from(ctx.visible(evidence, historical));
  assert.deepEqual(
    visible({identityStatus:'EXACT',name:'E353系',candidates:['E353系']}, ['E353系（あずさ・かいじ）']),
    ['E353系'], 'official 5003M/5050M reference cannot be returned as two candidates'
  );
  assert.deepEqual(
    visible({identityStatus:'EXACT',name:'東葉高速2000系',candidates:['東葉高速2000系']},
      ['東葉高速2000系', '東京メトロ15000系']),
    ['東葉高速2000系'], 'exact Tozai/ToyoRapid number must not inherit old line candidate list'
  );
  assert.deepEqual(
    visible({identityStatus:'UNKNOWN',name:'',candidates:[]},['E231系0番台','E231系500番台']),
    ['E231系0番台','E231系500番台'], 'unverified Chuo-Sobu stock must remain unresolved'
  );
  assert.deepEqual(
    visible({identityStatus:'NARROWED',name:'',candidates:['東京メトロ15000系']},
      ['東京メトロ15000系','東京メトロ05系']),
    ['東京メトロ15000系','東京メトロ05系'], 'unverified through stock retains distinct candidates'
  );
  assert.deepEqual(visible({identityStatus:'EXACT',name:'',candidates:[]}, ['E231系0番台']), [],
    'invalid exact evidence must not be completed from a historical candidate');
});
