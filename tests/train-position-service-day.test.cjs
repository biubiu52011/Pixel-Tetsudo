const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../js/train-position-estimator.js'), 'utf8');

function estimatorAt(year, month, day, hour, minute, overrides) {
  const fixed = new Date(Date.UTC(year, month - 1, day, hour, minute) - 9 * 60 * 60 * 1000);
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : [fixed.getTime()])); }
    static now() { return fixed.getTime(); }
  }
  const window = { RuntimeConfig: { SERVICE_DAY_CALENDAR: overrides || {} } };
  vm.runInNewContext(source, { window, Date: FixedDate, console: { debug() {} } });
  return window.TrainPositionEstimator;
}

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
async function readSqlRuns(runs, stops) {
  const edge = fs.readFileSync(path.join(__dirname, '../supabase/functions/train-runs/index.ts'), 'utf8');
  const begin = edge.lastIndexOf('  async function pages(');
  const body = edge.slice(begin, edge.lastIndexOf('\n});'))
    .replace('makeQuery: (first: number, last: number) => any', 'makeQuery')
    .replace('const result: any[]', 'const result')
    .replace('new Map<number, any[]>()', 'new Map()')
    .replace(/\(s: any\)/g, '(s)');
  const db = { from(table) {
    let rows = table === 'train_runs' ? runs : stops;
    const query = {
      select() { return query; }, eq() { return query; }, order() { return query; },
      in(key, ids) { rows = rows.filter(row => ids.includes(row[key])); return query; },
      range(first, last) { return Promise.resolve({ data: rows.slice(first, last + 1), error: null }); }
    };
    return query;
  } };
  return vm.runInNewContext('(async function() {' + body + '})()', {
    db, lineId: 'Test', serviceDate: '2026-10-13', console,
    json(value) { return value; }, readManualTemplateRuns() { throw Error('unexpected template fallback'); }
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
    _positionServiceDate: dates, allLines: {},
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

test('line activation includes visible SQL branches without changing presentation membership', () => {
  const page = fs.readFileSync(path.join(__dirname, '../js/trains-page.js'), 'utf8');
  const start = page.indexOf('      var _requestedLines = currentSystemLineIds');
  const end = page.indexOf('      _requestedLines.forEach(function(id)', start);
  const context = { currentSystemLineIds: null, lineId: 'Main', window: {},
    lines: { Main: { branches: ['Branch'] }, Branch: {}, OtherBranch: { branchOf: 'Main' } },
    _fusionExtensionLines() { return []; }
  };
  vm.runInNewContext(page.slice(start, end), context);
  assert.deepEqual(Array.from(context.window.TrainsActivePositionLineIds), ['Main', 'Branch', 'OtherBranch']);
  assert.equal(context.currentSystemLineIds, null);
});
