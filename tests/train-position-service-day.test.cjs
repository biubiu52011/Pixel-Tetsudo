const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../js/train-position-estimator.js'), 'utf8');

function estimatorAt(year, month, day, hour, minute, overrides) {
  const fixed = new Date(year, month - 1, day, hour, minute);
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
