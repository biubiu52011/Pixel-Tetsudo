const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }

const context = {
  console: { debug() {}, log() {}, warn() {}, error() {} },
  window: {
    TransitConstants: {
      normalizeOp(op) { return String(op || '').replace(/^odpt\.Operator:/, ''); }
    },
    VEHICLE_OPERATION_EVIDENCE: [{
      networkKey: 'keiyo',
      validDate: '2026-04-01',
      operationCode: '19',
      operator: 'JR-East',
      vehicleType: 'JR 209系500番台',
      formationIds: [],
      observedDate: '2026-04-01',
      grade: 'C',
      sourceUrl: 'https://loo-ool.com/rail/B/'
    }]
  }
};
context.self = context.window;
vm.createContext(context);
[
  'js/train-icons.js',
  'data/timetables/train-operation-evidence.js',
  'js/train-vehicle.js'
].forEach(rel => vm.runInContext(read(rel), context, { filename: rel }));

const ev = context.window.TrainOperationEvidence.resolveEvidence('anything', {
  lineId: 'Keiyo',
  railway: 'odpt.Railway:JR-East.Keiyo',
  operator: 'JR-East',
  serviceDate: '2026-04-01',
  operationCode: '19'
}, 'fallback');
assert.ok(ev && ev.vehicleType === 'JR 209系500番台',
  'canonical operation evidence must resolve the dated vehicle fact');

const resolved = context.window.TrainVehicle.resolve({
  lineId: 'Keiyo',
  trainNumber: 'anything',
  timetableVehicleType: ev.vehicleType,
  timetableEvidence: [ev]
});
assert.strictEqual(resolved.identityStatus, 'EXACT');
assert.strictEqual(resolved.source, 'timetable');
assert.strictEqual(resolved.name, 'JR 209系500番台');
assert.ok(!resolved.iconPath || typeof resolved.iconPath === 'string');

const unknown = context.window.TrainVehicle.resolve({
  lineId: 'Keiyo', operator: 'JR-East', trainNumber: '19'
});
assert.strictEqual(unknown.identityStatus, 'UNKNOWN');
assert.strictEqual(unknown.iconPath, '');

assert.ok(!fs.existsSync(path.join(ROOT, 'data/timetables/vehicle-type-map.js')),
  'deleted parallel vehicle-type map must not be reintroduced');

console.log('train-run operation evidence -> exact vehicle -> artwork projection: PASS');
