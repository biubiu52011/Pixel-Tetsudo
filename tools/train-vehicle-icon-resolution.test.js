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
assert.strictEqual(resolved.name, '209系500番台（京葉線）',
  'verified aliases must return the canonical model identity, not a second spelling');
assert.ok(/JR東日本_209系_500番台_京葉線\.png$/.test(resolved.iconPath), resolved.iconPath);

assert.ok(/相模鉄道_12000系_YOKOHAMA_NAVYBLUE\.png$/.test(
  context.window.TrainIcons.resolveVehicleArtwork('相模鉄道12000系') || ''
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
 ['JR E233系5000番台','JR東日本_E233系5000番台.png'],
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

// Database artwork rows are verified evidence, not a second train-type resolver.
// A qualified type plus a proven formation is needed to display a SQL-only PNG.
const verifiedSqlArtworks = [
  {
    image_path:'images/列车/埼玉新都市交通/埼玉新都市交通_2020系_21編成_グリーンクリスタル.png',
    vehicle_type:'2020系', formation_id:'21', livery:'グリーンクリスタル',
    valid_from:null, valid_to:null
  },
  {
    image_path:'images/列车/埼玉新都市交通/埼玉新都市交通_2020系_22編成_ブライトアンバー.png',
    vehicle_type:'2020系', formation_id:'22', livery:'ブライトアンバー',
    valid_from:'2026-12-01', valid_to:null
  }
];
assert.strictEqual(context.window.TrainIcons.hydrateVerifiedArtworkCatalog(verifiedSqlArtworks), true);
const sqlFormation = context.window.TrainVehicle.resolve({
  timetableVehicleType:'埼玉新都市交通2020系',
  formationId:'21', formationCandidates:['21']
});
assert.strictEqual(sqlFormation.identityStatus, 'EXACT');
assert.ok((sqlFormation.iconPath || '').endsWith('埼玉新都市交通_2020系_21編成_グリーンクリスタル.png'),
  'certified SQL formation must project through the existing resolver');
const sqlUnconfirmed = context.window.TrainVehicle.resolve({
  timetableVehicleType:'埼玉新都市交通2020系',
  formationId:'', formationCandidates:['21']
});
assert.strictEqual(sqlUnconfirmed.iconPath, '',
  'a candidate without confirmed formation may not select a SQL PNG');
const sqlUndated = context.window.TrainVehicle.resolve({
  timetableVehicleType:'埼玉新都市交通2020系',
  formationId:'22', formationCandidates:['22']
});
assert.strictEqual(sqlUndated.iconPath, '',
  'dated SQL artwork must not be selected without a service date');
const sqlHistorical = context.window.TrainVehicle.resolve({
  timetableVehicleType:'埼玉新都市交通2020系',
  formationId:'22', formationCandidates:['22'], serviceDate:'2026-10-10'
});
assert.strictEqual(sqlHistorical.iconPath, '',
  'future SQL artwork must not leak into prior service dates');
const sqlDated = context.window.TrainVehicle.resolve({
  timetableVehicleType:'埼玉新都市交通2020系',
  formationId:'22', formationCandidates:['22'], serviceDate:'2026-12-02'
});
assert.ok((sqlDated.iconPath || '').endsWith('埼玉新都市交通_2020系_22編成_ブライトアンバー.png'));
// Two certified paint variants for the same formation must not be guessed.
context.window.TrainIcons.hydrateVerifiedArtworkCatalog([
  verifiedSqlArtworks[0],
  Object.assign({}, verifiedSqlArtworks[0], {
    image_path:'images/列车/埼玉新都市交通/埼玉新都市交通_2020系_22編成_ブライトアンバー.png'
  })
]);
assert.strictEqual(context.window.TrainVehicle.resolve({
  timetableVehicleType:'埼玉新都市交通2020系',
  formationId:'21', formationCandidates:['21']
}).iconPath, '', 'conflicting SQL artwork variants must stay unresolved');
context.window.TrainIcons.hydrateVerifiedArtworkCatalog(verifiedSqlArtworks);
console.log('SQL certified formation -> canonical artwork resolver: 7 PASS');

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
assert.strictEqual(context.window.TrainIcons.resolveVehicleArtwork(hohoemiIdentity, '2026-10-10'), null,
  'temporary branded wrapping must not be used as a canonical train asset');
const current11003 = context.window.TrainVehicle.resolve({
  timetableVehicleType:'相鉄11000系(10両)',
  formationId:'11003F',
  formationCandidates:['11003F'],
  serviceDate:'2026-10-10'
});
assert.strictEqual(current11003.iconPath, '',
  'special temporary wrapping must not be inferred from a confirmed formation');
console.log('temporary wrapping excluded: 2 PASS');

// ---- production runtime chain regression (v4.3.1128) ----
// Real evidence data file (includes Yamanote family rule) driven through the
// data-fusion realtime-derived path that production actually uses:
//   ODPT Train (no vehicle field) -> TrainOperationEvidence.resolveEvidence(...,"realtime-derived")
//   -> TrainVehicle.resolve({realtimeDerivedVehicleType}) -> vehicleIconPath
const realCtx = {
  console: { debug() {}, log() {}, warn() {}, error() {} },
  window: {},
  setTimeout, clearTimeout, Date, URL,
  TextEncoder: require('util').TextEncoder
};
realCtx.self = realCtx.window;
vm.createContext(realCtx);
[
  'data/timetables/vehicle-operation-evidence-data.js',
  'data/timetables/train-operation-evidence.js',
  'js/train-vehicle.js'
].forEach(rel => vm.runInContext(read(rel), realCtx, { filename: rel }));

const familyRules = realCtx.window.VEHICLE_FAMILY_RULES || [];
const yamanoteRule = familyRules.find(r => r.networkKey === 'Yamanote' && r.exactVehicleType);
assert.ok(yamanoteRule,
  'real evidence data must carry a Yamanote family rule (E235-0 fleet fact)');
assert.strictEqual(yamanoteRule.effectiveFrom, '2020-01-21',
  'Yamanote E235 rule must start after the E231-500 retirement date');
assert.ok(/^https:\/\//.test(yamanoteRule.sourceUrl),
  'Yamanote family rule must carry a traceable source');

// Real running trains fetched from the ODPT realtime API (2026-10-05)
['1826G', '1866G', '1868G'].forEach(function(tn) {
  const ev = realCtx.window.TrainOperationEvidence.resolveEvidence(tn, {
    lineId: 'Yamanote',
    railway: '山手線',
    operator: 'JR-East',
    trainNumber: tn,
    serviceDate: '2026-10-05',
    calendarType: 'weekday'
  }, 'realtime-derived');
  assert.ok(ev && ev.vehicleType === 'E235系0番台（山手線）',
    tn + ' realtime-derived evidence must resolve to E235-0, got ' + JSON.stringify(ev));
  const rt = realCtx.window.TrainVehicle.resolve({
    lineId: 'Yamanote',
    operator: 'JR-East',
    trainNumber: tn,
    trainType: 'odpt.TrainType:JR-East.Local',
    destinationStation: 'odpt.Station:JR-East.Yamanote.Osaki',
    trainId: tn,
    realtimeVehicleType: '',
    realtimeDerivedVehicleType: ev.vehicleType
  });
  assert.strictEqual(rt.identityStatus, 'EXACT', tn + ' must be EXACT');
  assert.strictEqual(rt.source, 'realtime-derived', tn + ' source must be realtime-derived');
  assert.ok(/JR東日本_E235系_0番台\.png$/.test(rt.iconPath || ''),
    tn + ' must project the E235-0 PNG, got ' + rt.iconPath);
});
console.log('Yamanote realtime chain -> E235 PNG: 3 PASS');

// Real-time and timetable/SQL are evidence channels, not parallel model
// dictionaries. Both descriptions of one E235-0 physical train must converge.
const yamanoteCombined = realCtx.window.TrainVehicle.resolve({
  lineId:'Yamanote', trainNumber:'1826G',
  realtimeVehicleType:'JR E235系0番台',
  timetableVehicleType:'E235系0番台（山手線）'
});
assert.strictEqual(yamanoteCombined.identityStatus,'EXACT');
assert.strictEqual(yamanoteCombined.name,'E235系0番台（山手線）');
assert.strictEqual(yamanoteCombined.source,'realtime+timetable');
assert.ok(yamanoteCombined.iconPath.endsWith('JR東日本_E235系_0番台.png'));
console.log('Yamanote single canonical realtime/SQL mapping: PASS');

// The same verified single-fleet record must resolve identically on the
// timetable + delay estimation path; before this fix those trains used SVG.
['1826G','1866G','1868G'].forEach(function(tn) {
  const estimateEvidence = realCtx.window.TrainOperationEvidence.resolveEvidence(tn, {
    lineId:'Yamanote', railway:'odpt.Railway:JR-East.Yamanote',
    operator:'JR-East', serviceDate:'2026-10-05', calendarType:'weekday'
  }, 'fallback');
  assert.ok(estimateEvidence && estimateEvidence.decisive &&
    estimateEvidence.vehicleType === 'E235系0番台（山手線）',
    tn + ' grade-A timetable evidence must match realtime: ' + JSON.stringify(estimateEvidence));
  const estimateVehicle = realCtx.window.TrainVehicle.resolve({
    timetableVehicleType: estimateEvidence.vehicleType,
    trainNumber:tn, serviceDate:'2026-10-05'
  });
  assert.strictEqual(estimateVehicle.identityStatus,'EXACT');
  assert.ok((estimateVehicle.iconPath || '').endsWith('JR東日本_E235系_0番台.png'),
    tn + ' estimated train must project same confirmed PNG: ' + estimateVehicle.iconPath);
});
const beforeReplacement = realCtx.window.TrainOperationEvidence.resolveEvidence('100G', {
  lineId:'Yamanote', railway:'odpt.Railway:JR-East.Yamanote',
  serviceDate:'2020-01-20'
}, 'fallback');
assert.ok(!beforeReplacement || beforeReplacement.vehicleType !== 'E235系0番台（山手線）',
  'grade-A fleet fact must not apply before effective date');
const gradeBEstimated = realCtx.window.TrainOperationEvidence.resolveEvidence('13', {
  lineId:'setagaya', railway:'TokyuSetagaya',
  serviceDate:'2026-10-05'
}, 'fallback');
assert.ok(!gradeBEstimated || !gradeBEstimated.vehicleType,
  'B-grade family constraints must not invent an estimated vehicle identity');
console.log('Realtime / estimated shared Grade-A PNG identity: 8 PASS');



// zero-fallback: a line with no evidence must stay UNKNOWN / no artwork
const noEvidenceLine = realCtx.window.TrainOperationEvidence.resolveEvidence('9', {
  lineId: 'Karasuyama', railway: '烏山線', operator: 'JR-East',
  trainNumber: '9', serviceDate: '2026-10-05', calendarType: 'weekday'
}, 'realtime-derived');
assert.ok(!noEvidenceLine || !noEvidenceLine.vehicleType,
  'no-evidence line must not gain a concrete vehicle type');
const noEvidenceRt = realCtx.window.TrainVehicle.resolve({
  lineId: 'Karasuyama', operator: 'JR-East', trainNumber: '9',
  realtimeVehicleType: '', realtimeDerivedVehicleType: ''
});
assert.strictEqual(noEvidenceRt.identityStatus, 'UNKNOWN');
assert.strictEqual(noEvidenceRt.iconPath, '');
console.log('zero-fallback no-evidence line: 2 PASS');

// zero-fallback: the Yamanote rule must not leak to other JR-East lines
const otherLineEv = realCtx.window.TrainOperationEvidence.resolveEvidence('1234', {
  lineId: 'SaikyoKawagoe', railway: '埼京線', operator: 'JR-East',
  trainNumber: '1234', serviceDate: '2026-10-05', calendarType: 'weekday'
}, 'realtime-derived');
assert.ok(!otherLineEv || !(otherLineEv.vehicleType === 'E235系0番台（山手線）'),
  'Yamanote rule must not apply to other lines');
console.log('no line-default leakage: 1 PASS');

// ---- TrainMarker artwork contract ----
// The renderer must accept every upstream EXACT vehicle resolution (realtime
// direct AND realtime-derived flow through the same vehicleResolvedUpstream
// projection). The old gate that only read vehicleResolvedFromRealtime would
// have collapsed every derived E235 train back to a neutral marker.
const rendererSrc = read('js/trains-render.js');
const unifiedVehicleSource = read('js/train-vehicle.js');
assert.ok(rendererSrc.includes('window.TrainVehicle.selectMarkerArtwork(p, artworkFailed)'),
  'renderer must delegate icon choice to the single vehicle runtime');
assert.ok(!rendererSrc.includes('window.TrainIcons.resolveVehicleArtwork'),
  'renderer must not implement a second PNG resolver');
assert.ok(unifiedVehicleSource.includes('selectMarkerArtwork: selectMarkerArtwork'),
  'unified runtime must own one PNG/neutral decision');
assert.ok(rendererSrc.includes('marker.addEventListener("error"') &&
          rendererSrc.includes('marker.setAttribute("visibility", "hidden")'),
  'failed certified PNG must hide instead of using a generic image');
assert.ok(!rendererSrc.includes('_hasRealtimeVehicleEvidence'),
  'renderer must not diverge for ODPT versus timetable positions');
assert.ok(!rendererSrc.includes('iconSrc ? "image" : "circle"'),
  'neutral circle fallback must not return');
console.log('TrainMarker single-script contract: 6 PASS');

const catalogEdge = read('supabase/functions/train-runs/index.ts');
const catalogIcons = read('js/train-vehicle.js');
assert.ok(!/catalog=vehicle-artwork/.test(catalogIcons) &&
           !/VERIFIED_SQL_VEHICLE_IDENTITIES|vehicle_artwork_exact_locked/.test(catalogEdge) &&
           /CANONICAL_VEHICLES/.test(catalogIcons) &&
           /hydrateVerifiedArtworkCatalog/.test(catalogIcons),
  'PNG artwork must resolve through the local canonical module, never a runtime Supabase image catalog');
assert.strictEqual(context.window.TrainIcons.hydrateVerifiedArtworkCatalog([
  {image_path:'images/列车/JR東日本/JR東日本_E235系_0番台.png'}]), true);
assert.strictEqual(context.window.TrainIcons.resolveVehicleArtwork('E235系0番台（山手線）'),
  '../images/列车/JR東日本/JR東日本_E235系_0番台.png',
  'optional in-memory gallery evidence must preserve canonical PNG identity');
assert.strictEqual(context.window.TrainIcons.resolveVehicleArtwork('unverified train type'), null,
  'in-memory gallery entries cannot invent vehicle identity');
console.log('local canonical artwork catalog: 3 PASS');

const dbOnlyName = 'DATABASE-VERIFIED-EXACT-TEST-TYPE';
assert.strictEqual(context.window.TrainIcons.resolveVehicleArtwork(dbOnlyName), null);
context.window.TrainIcons.hydrateVerifiedArtworkCatalog([
 {vehicle_type: dbOnlyName, image_path:'images/列车/京王電鉄/京王電鉄_5000系.png'},
 {vehicle_type:'GENERIC-CANDIDATE',formation_id:'01',image_path:'images/列车/埼玉新都市交通/埼玉新都市交通_2000系_01編成_レッドパープル.png'}
]);
assert.ok(/京王電鉄_5000系\.png$/.test(context.window.TrainIcons.resolveVehicleArtwork(dbOnlyName) || ''),
  'one SQL-certified exact vehicle name can project a PNG');
assert.strictEqual(context.window.TrainIcons.resolveVehicleArtwork('GENERIC-CANDIDATE'), null,
  'formation-specific PNG cannot be inferred from an unqualified type');
context.window.TrainIcons.hydrateVerifiedArtworkCatalog([
 {vehicle_type:dbOnlyName,image_path:'images/列车/京王電鉄/京王電鉄_5000系.png'},
 {vehicle_type:dbOnlyName,image_path:'images/列车/東京メトロ/東京メトロ_5000系.png'}
]);
assert.strictEqual(context.window.TrainIcons.resolveVehicleArtwork(dbOnlyName), null,
  'ambiguous exact vehicle names must not select an arbitrary operator artwork');
console.log('in-memory PNG realtime projection safety: 4 PASS');

// Both ODPT realtime and timetable estimates share the same late-bound
// certified PNG projection. Formation uncertainty may never be bypassed.
const pickMarker = context.window.TrainVehicle.selectMarkerArtwork;
const yamanote = { vehicleResolvedUpstream:true, vehicleType:'E235系0番台（山手線）',
  vehicleIconPath:'', vehicleFormationCandidates:[] };
const liveIcon = pickMarker(Object.assign({ estimated:false }, yamanote), false);
const estimatedIcon = pickMarker(Object.assign({ estimated:true }, yamanote), false);
assert.strictEqual(liveIcon.kind,'vehicle');
assert.strictEqual(estimatedIcon.iconSrc,liveIcon.iconSrc);
assert.ok(liveIcon.iconSrc.endsWith('JR東日本_E235系_0番台.png'));
assert.strictEqual(pickMarker(Object.assign({}, yamanote, {vehicleResolvedUpstream:false}),false).kind,'unresolved',
  'UNKNOWN/NARROWED cannot select a concrete PNG');
assert.strictEqual(pickMarker(Object.assign({}, yamanote, {vehicleFormationCandidates:['01','02']}),false).kind,'unresolved',
  'formation ambiguity must prevent late artwork resolution');
assert.strictEqual(pickMarker(yamanote,true).kind,'unresolved','failed PNG remains neutral');
console.log('ODPT realtime and timetable estimation share one marker choice: 6 PASS');

assert.strictEqual(pickMarker(Object.assign({}, yamanote, {
  vehicleResolvedUpstream:false
}),false).iconSrc, '',
  'unknown trains must use the neutral gallery PNG');
assert.strictEqual(pickMarker(yamanote,true).iconSrc,
  '',
  'failed artwork must use the same neutral gallery PNG');
assert.strictEqual(pickMarker(Object.assign({}, yamanote, {
  vehicleIconPath:'https://untrusted.example/vehicle.svg',
  vehicleType:'', vehicleFormationCandidates:['01','02']
}),false).kind,'unresolved',
  'the single artwork authority must reject any SVG or external path');
assert.ok(!rendererSrc.includes('function _createGenericTrainMarker') &&
  !rendererSrc.includes('function _swapTrainMarkerToGeneric') &&
  rendererSrc.includes('document.createElementNS(svgNS, "image")'),
  'train icon renderer must use PNG-only image elements, never self-drawn SVG trains');
console.log('PNG-only one-script train marker: 4 PASS');

assert.ok(!read('js/train-vehicle.js').includes('window.TrainIcons.resolveVehicleArtwork'),
  'production vehicle resolver must not hop back through the legacy TrainIcons facade');
console.log('single internal PNG resolver, no second mapping hop: PASS');


// Regression: recurring Supabase models are reference train types, not
// date-specific carset assignments. The SQL adapter, estimator and one PNG
// resolver must preserve their identity even when historical operation evidence
// exists and happens to disagree with a planned vehicle.
{
  const estimatorSrc = read('js/train-position-estimator.js');
  const edge = read('supabase/functions/train-runs/index.ts');
  const adapter = read('data/api/odpt-unified.js');
  assert.ok(edge.includes('vehicle_type_label: exactScheduleType || null') &&
    edge.includes('vehicle_type_candidates: t.vehicle_type_label || null') &&
    edge.includes('vehicle_mapping_level: scheduleLevel'),
    'Edge SQL response must return verified scheduled model separately from candidate labels');
  assert.ok(adapter.includes('run.vehicle_mapping_level==="dated_schedule_rule"') &&
    adapter.includes('run.vehicle_mapping_level==="verified_scheduled_boundary"') &&
    adapter.includes('vehicleType:(run.vehicle_mapping_level==='),
    'ODPT-shaped SQL adapter must only promote verified scheduled types, never candidate labels');

  let hh = 10, mm = 24, operationLookups = 0;
  class FixedDate extends Date {
    constructor(...args) {
      super(...(args.length ? args : [new Date(2026, 9, 12, hh, mm).getTime()]));
    }
    static now() { return new Date(2026, 9, 12, hh, mm).getTime(); }
  }
  const windowForEstimate = {
    RuntimeConfig: {},
    TrainVehicle: context.window.TrainVehicle,
    TrainIcons: context.window.TrainIcons,
    ODPTClient: { LINE_RAILWAY_CODE: { Rinkai: 'Rinkai' } },
    TrainOperationEvidence: {
      normalizeOperationCode() { operationLookups++; return '00'; },
      resolveEvidence() {
        operationLookups++;
        return { vehicleType: 'E233系7000番台', decisive: true,
          operator: 'JR-East', formationId: 'WRONG-DATED-CARSET' };
      }
    }
  };
  const vmContext = vm.createContext({
    window: windowForEstimate, Date: FixedDate, Intl,
    console: { debug() {} }
  });
  vm.runInContext(estimatorSrc, vmContext, { filename: 'js/train-position-estimator.js' });

  function sqlRinkai(number, model, departure, arrival, first, next) {
    return {
      '@id': 'manual-template:' + number,
      'odpt:trainNumber': number,
      'odpt:railway': 'odpt.Railway:TWR.Rinkai',
      'odpt:calendar': 'odpt.Calendar:SaturdayHoliday',
      'odpt:trainTimetableObject': [
        {'odpt:departureStation': 'odpt.Station:TWR.Rinkai.' + first,
          'odpt:departureTime': departure},
        {'odpt:arrivalStation': 'odpt.Station:TWR.Rinkai.' + next,
          'odpt:arrivalTime': arrival}
      ],
      vehicleType: model, _positionSource: 'supabase-train-run',
      _sqlVehicleMappingLevel: 'verified_scheduled_boundary',
      _serviceDate: '2026-10-12'
    };
  }

  const rows = [
    sqlRinkai('1081F', '東京臨海高速鉄道70-000形', '10:22', '10:26', 'ShinKiba', 'Shinonome'),
    sqlRinkai('1088T', '東京臨海高速鉄道71-000形', '10:45', '10:49', 'Osaki', 'Oimachi')
  ];
  windowForEstimate.TrainPositionEstimator.registerManualTimetable('Rinkai', rows);
  const line = { operator: 'Rinkai', stations: [
    'ShinKiba', 'Shinonome', 'KokusaiTenjijo', 'TokyoTeleport',
    'TennozuIsle', 'ShinagawaSeaside', 'Oimachi', 'Osaki'
  ] };
  function getRunningTrain() {
    const result = windowForEstimate.TrainPositionEstimator.estimateAllPositions(
      {Rinkai: line}, {}, {}, null, {lineIds: ['Rinkai']});
    assert.strictEqual((result.Rinkai || []).length, 1, 'expected one scheduled train at test time');
    return result.Rinkai[0];
  }
  const earlier = getRunningTrain();
  assert.strictEqual(earlier.trainNumber, '1081F');
  assert.strictEqual(earlier.vehicleIdentityStatus, 'EXACT');
  assert.strictEqual(earlier.positionSource, 'supabase-train-run');
  assert.ok(earlier.vehicleIconPath.endsWith('東京臨海高速鉄道_70-000形.png'));
  assert.strictEqual(windowForEstimate.TrainVehicle.selectMarkerArtwork(earlier, false).kind, 'vehicle');

  hh = 10; mm = 47;
  const later = getRunningTrain();
  assert.strictEqual(later.trainNumber, '1088T');
  assert.strictEqual(later.vehicleIdentityStatus, 'EXACT');
  assert.ok(later.vehicleIconPath.endsWith('東京臨海高速鉄道_71-000形.png'));
  assert.strictEqual(later.positionSource, 'supabase-train-run');
  assert.strictEqual(operationLookups, 0,
    'dated operation/formation numbers must not gate SQL reference model icons');

  assert.strictEqual(windowForEstimate.TrainVehicle.resolve({
    timetableVehicleType: '70-000形 / 71-000形'
  }).iconPath, '', 'unresolved SQL candidate must not invent a model');
  console.log('Supabase Rinkai timetable -> estimated train -> exact reference PNG: 2 PASS');
}


// Recurring SQL reference vehicles are *planned train models*, not daily
// operation/carset observations. Verify the entire exported evidence path.
{
  const source=read('tools/export-vehicle-operation-evidence.js');
  assert.ok(source.includes('get("train_vehicle_rules"'),
    'Supabase reference rules must be exported by the existing canonical job');
  const refCtx={console:{debug(){}},window:{}};
  vm.createContext(refCtx);
  vm.runInContext(read('data/timetables/vehicle-operation-evidence-data.js'),refCtx);
  vm.runInContext(read('data/timetables/train-operation-evidence.js'),refCtx);
  vm.runInContext(read('js/train-vehicle.js'),refCtx);
  const facts=refCtx.window.TrainOperationEvidence;
  function resolve(n,day,cal,line='SaikyoKawagoe') {
    return facts.resolveEvidence(n,{
      lineId:line,railway:'odpt.Railway:JR-East.'+line,
      operator:'JR-East',serviceDate:day,calendarType:cal
    },'realtime-derived');
  }
  const holiday70=resolve('1081F','2026-10-12','holiday');
  const holiday71=resolve('1088T','2026-10-12','holiday');
  const weekday71=resolve('1085F','2026-10-13','weekday');
  assert.strictEqual(holiday70.vehicleType,'東京臨海高速鉄道70-000形');
  assert.strictEqual(holiday71.vehicleType,'東京臨海高速鉄道71-000形');
  assert.strictEqual(weekday71.vehicleType,'東京臨海高速鉄道71-000形');
  assert.strictEqual(holiday70.evidenceRole,'timetable-reference');
  for(const [fact,expected] of [[holiday70,'70-000形.png'],[holiday71,'71-000形.png']]){
    const p=refCtx.window.TrainVehicle.resolve({trainNumber:'1081F',realtimeDerivedVehicleType:fact.vehicleType});
    assert.strictEqual(p.identityStatus,'EXACT');
    assert.ok(p.iconPath.endsWith(expected),p.iconPath);
  }
  assert.strictEqual(resolve('1081F','2026-10-12','weekday'),null,
    'Holiday train must not be treated as weekday');
  assert.strictEqual(resolve('1081F','2026-03-13','holiday'),null,
    'Reference model must not predate the timetable revision');
  assert.strictEqual(resolve('9999F','2026-10-12','holiday'),null,
    'Unpublished train numbers must not be guessed');
  assert.strictEqual(resolve('1081F','2026-10-12','holiday','Keiyo'),null,
    'A train number alone never proves a cross-network identity');
  const realtimeE233=refCtx.window.TrainVehicle.resolve({
    trainNumber:'1081F',realtimeVehicleType:'E233系7000番台'
  });
  assert.strictEqual(realtimeE233.identityStatus,'EXACT',
    'Explicit live model should work without a conflicting fallback');
  assert.ok(realtimeE233.iconPath.includes('E233'),realtimeE233.iconPath);
  const fusion=read('js/data-fusion.js');
  assert.ok(fusion.includes('if (!odptVehicleType && window.TrainOperationEvidence'),
    'Only absent API model can invoke planned reference lookup');
  assert.ok(fusion.includes('getCurrentCalendars()'),
    'Realtime vehicles must use the same published railway service calendar');
  console.log('JR ODPT -> exact-number holiday/weekday planned model -> TWR PNG: 12 PASS');
}



// A terminal must never gate a train's planned reference vehicle. Existing
// canonical reference lookup covers dated JR runs to intermediate terminals.
{
  const roster=JSON.parse(read('data/timetables/vehicle-operation-evidence.json')).referenceRules;
  assert.strictEqual(roster.length,826);
  assert.strictEqual(roster.filter(r=>r.vehicleType==='E233系7000番台').length,649);
  const ctx={window:{},console:{debug(){}}};
  vm.createContext(ctx);
  for(const p of ['data/timetables/vehicle-operation-evidence-data.js',
    'data/timetables/train-operation-evidence.js','js/train-vehicle.js']){
    vm.runInContext(read(p),ctx,{filename:p});
  }
  const resolve=(n,day,cal,line='SaikyoKawagoe')=>
    ctx.window.TrainOperationEvidence.resolveEvidence(n,{
      lineId:line,railway:'odpt.Railway:JR-East.'+line,
      operator:'JR-East',serviceDate:day,calendarType:cal
    },'realtime-derived');
  const cases=[
    ['1004K','2026-10-12','holiday','Shinjuku'],
    ['1205K','2026-10-12','holiday','Omiya'],
    ['609K','2026-10-12','holiday','MusashiUrawa'],
    ['609K','2026-10-13','weekday','Omiya'],
    ['1000F','2026-10-12','holiday','ShinKiba'],
    ['4614K','2026-10-12','holiday','Ebina']
  ];
  for(const [num,day,cal,terminal] of cases){
    const fact=resolve(num,day,cal);
    assert.ok(fact && fact.vehicleType==='E233系7000番台',
      num+' '+terminal+': expected reference E233-7000');
    assert.strictEqual(fact.evidenceRole,'timetable-reference');
    const vehicle=ctx.window.TrainVehicle.resolve({
      trainNumber:num,realtimeDerivedVehicleType:fact.vehicleType
    });
    assert.strictEqual(vehicle.identityStatus,'EXACT',num+' '+terminal);
    assert.ok((vehicle.iconPath||'').includes('E233'),num+' '+terminal+' '+vehicle.iconPath);
  }
  assert.strictEqual(resolve('120M','2026-10-12','holiday'),null,
    'Shared Sotetsu/JR M-numbered trains require their own timetable evidence');
  assert.strictEqual(resolve('9999K','2026-10-12','holiday'),null,
    'No open-ended runtime number-range guessing');
  assert.strictEqual(resolve('1004K','2026-03-13','holiday'),null,
    'Do not apply the 2026 timetable before its revision');
  assert.strictEqual(resolve('1004K','2026-10-12','holiday','Keiyo'),null,
    'Do not leak Saikyo model into unrelated railways');
  const twr=resolve('1081F','2026-10-12','holiday');
  assert.strictEqual(twr.vehicleType,'東京臨海高速鉄道70-000形',
    'Existing TWR 70-000 reference must not be replaced by JR E233');
  console.log('Saikyo JR E233 all termini / calendar / TWR-Sotetsu isolation: 11 PASS');
}
