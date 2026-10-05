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
assert.ok(/JR東日本_209系_500番台_京葉線\.png$/.test(resolved.iconPath), resolved.iconPath);

assert.ok(/相模鉄道_12000系_YOKOHAMA_NAVYBLUE\.png$/.test(
  context.window.TrainIcons.resolveVehicleArtwork('相鉄12000系') || ''
));
assert.ok(/小田急電鉄_5000形_標準色\.png$/.test(
  context.window.TrainIcons.resolveVehicleArtwork('小田急5000形') || ''
));

const unknown = context.window.TrainVehicle.resolve({
  lineId: 'Keiyo', operator: 'JR-East', trainNumber: '19'
});
assert.strictEqual(unknown.identityStatus, 'UNKNOWN');
assert.strictEqual(unknown.iconPath, '');

assert.ok(!fs.existsSync(path.join(ROOT, 'data/timetables/vehicle-type-map.js')),
  'deleted parallel vehicle-type map must not be reintroduced');

console.log('train-run operation evidence -> exact vehicle -> artwork projection: PASS');

[
 ['JR E233系5000番台','JR東日本_E233系_5000番台.png'],
 ['京急600形','京浜急行電鉄_600形.png'],
 ['京成3100形','京成電鉄_3100形.png'],
 ['東京メトロ15000系(10両)','東京メトロ_15000系.png'],
 ['東急2020系(10両)','東急電鉄_2020系.png'],
 ['東武50050系(10両)','東武鉄道_50050型.png'],
 ['相鉄13000系(8両)','相模鉄道_13000系_YOKOHAMA_NAVYBLUE.png'],
 ['相鉄21000系','相模鉄道_21000系.png']
].forEach(([identity, asset]) => {
  const icon = context.window.TrainIcons.resolveVehicleArtwork(identity) || '';
  assert.ok(icon.endsWith(asset), identity + ' -> ' + icon);
});
assert.strictEqual(context.window.TrainIcons.resolveVehicleArtwork('小田急8000形 / 小田急3000形'), null,
  'ambiguous multi-vehicle evidence must not project concrete artwork');
console.log('expanded evidence-backed artwork: 9 PASS');

const formationExact = context.window.TrainVehicle.resolve({
  timetableVehicleType:'埼玉新都市交通2000系',
  formationId:'01',
  formationCandidates:['01']
});
assert.strictEqual(formationExact.identityStatus,'EXACT');
assert.ok(/2000系_01編成_レッドパープル\.png$/.test(formationExact.iconPath), formationExact.iconPath);

const formationMissing = context.window.TrainVehicle.resolve({
  timetableVehicleType:'埼玉新都市交通2000系',
  formationId:'99',
  formationCandidates:['99']
});
assert.strictEqual(formationMissing.identityStatus,'EXACT');
assert.strictEqual(formationMissing.iconPath,'',
  'known formation without canonical artwork must not fall back to type artwork');

const formationAmbiguous = context.window.TrainVehicle.resolve({
  timetableVehicleType:'埼玉新都市交通2000系',
  formationId:'',
  formationCandidates:['01','02']
});
assert.strictEqual(formationAmbiguous.iconPath,'',
  'multiple formation candidates must not select formation artwork');
console.log('formation artwork uniqueness: 3 PASS');

[
 { formationId:'01', formationCandidates:[], why:'formationId alone' },
 { formationId:'', formationCandidates:['01'], why:'candidate alone' },
 { formationId:'01', formationCandidates:['02'], why:'contradictory formation evidence' },
 { formationId:'01', formationCandidates:['01','02'], why:'multiple formation candidates' }
].forEach((x) => {
  const r = context.window.TrainVehicle.resolve(Object.assign({
    timetableVehicleType:'埼玉新都市交通2000系'
  }, x));
  assert.strictEqual(r.iconPath,'', x.why + ' must not project artwork');
});
console.log('formation consistency gate: 4 PASS');

const hohoemiIdentity = '相鉄11000系(10両)（11003F）';
assert.strictEqual(context.window.TrainIcons.resolveVehicleArtwork(hohoemiIdentity), null,
  'dated artwork must not resolve without serviceDate');
assert.strictEqual(context.window.TrainIcons.resolveVehicleArtwork(hohoemiIdentity, '2026-04-08'), null,
  'future livery must not leak into historical service date');
assert.ok(/11003編成_ほほえみ号\.png$/.test(
  context.window.TrainIcons.resolveVehicleArtwork(hohoemiIdentity, '2026-08-30') || ''
));
const historical11003 = context.window.TrainVehicle.resolve({
  timetableVehicleType:'相鉄11000系(10両)',
  formationId:'11003F',
  formationCandidates:['11003F'],
  serviceDate:'2026-04-08'
});
assert.strictEqual(historical11003.iconPath,'',
  'historical formation must not receive a later dated livery');
console.log('dated formation artwork validity: 4 PASS');

const current11003 = context.window.TrainVehicle.resolve({
  timetableVehicleType:'相鉄11000系(10両)',
  formationId:'11003F',
  formationCandidates:['11003F'],
  serviceDate:'2026-08-30'
});
assert.ok(/11003編成_ほほえみ号\.png$/.test(current11003.iconPath), current11003.iconPath);
const sounyanNoAsset = context.window.TrainVehicle.resolve({
  timetableVehicleType:'相鉄11000系(10両)',
  formationId:'11004F',
  formationCandidates:['11004F'],
  serviceDate:'2026-09-15'
});
assert.strictEqual(sounyanNoAsset.iconPath,'',
  '11004F must not fall back to generic 11000 artwork when dedicated artwork is absent');
console.log('Sotetsu dated formation projection: 2 PASS');
