const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function loadRuntime() {
  const context = {
    console: { debug() {}, log() {}, warn() {}, error() {} },
    window: {
      TransitConstants: {
        normalizeOp(op) {
          return String(op || '').replace(/^odpt\.Operator:/, '');
        }
      }
    }
  };
  context.self = context.window;
  vm.createContext(context);
  [
    'js/train-icons.js',
    'data/timetables/vehicle-type-map.js',
    'data/timetables/tobu-limited-express-vehicle-evidence.js',
    'js/train-vehicle.js'
  ].forEach((rel) => {
    vm.runInContext(read(rel), context, { filename: rel });
  });
  return context.window;
}

const win = loadRuntime();

const unresolvedNewShuttle = win.TrainVehicle.resolve({
  lineId: 'NewShuttle',
  trainNumber: 'NS-test-unassigned',
  trainType: 'Local',
  destinationStation: 'Uchijuku'
});
assert.strictEqual(unresolvedNewShuttle.identityStatus, 'NARROWED');
assert.deepStrictEqual(Array.from(unresolvedNewShuttle.candidates), [
  '埼玉新都市交通2000系',
  '埼玉新都市交通2020系'
]);
assert.strictEqual(unresolvedNewShuttle.name, '');
assert.strictEqual(unresolvedNewShuttle.iconPath, '');

const jobanMedium = win.TrainVehicle.resolve({
  lineId: 'Joban',
  trainNumber: 'J-test-tsuchiura',
  trainType: 'Local',
  operator: 'JR-East',
  destinationStation: 'odpt.Station:JR-East.Joban.Tsuchiura'
});
assert.strictEqual(jobanMedium.identityStatus, 'EXACT');
assert.strictEqual(jobanMedium.vehicleTypeStr, 'JR E531系');
assert.ok(/JR東日本_E531系\.png$/.test(jobanMedium.iconPath), jobanMedium.iconPath);
assert.ok(!/E231系_0番代_常磐快速線/.test(jobanMedium.iconPath), jobanMedium.iconPath);

console.log('train-vehicle-icon-resolution: PASS');
