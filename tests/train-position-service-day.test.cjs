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
