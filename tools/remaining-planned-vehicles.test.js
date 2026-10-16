'use strict';
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const lines = JSON.parse(fs.readFileSync('data/core/railway_data.json', 'utf8')).lines;
const c = { window: {}, console: { debug() {}, warn() {} } };
vm.createContext(c);
for (const f of ['js/train-vehicle.js', 'data/timetables/vehicle-operation-evidence-data.js']) {
  vm.runInContext(fs.readFileSync(f, 'utf8'), c);
}
const api = c.window.TrainVehicle;
function resolve(line, type = 'Local', number = 'PLAN001', label = '') {
  const source = {
    'odpt:trainNumber': number,
    'odpt:trainType': 'odpt.TrainType:' + lines[line].operator + '.' + type,
    _positionSource: 'supabase-train-run',
    _sqlVehicleCandidateLabel: label
  };
  return api.resolveTimetableRun({ trainNumber: number }, source, line, lines[line], '2026-10-16').vehicleResult;
}
function artwork(v) { return v.iconPath || v.vehiclePlan?.iconPath; }
function models(v) { return Array.from(v.vehiclePlan?.models || [v.name]); }
const cases = [
 ['Nambu', 'Local'], ['NambuBranch', 'Local'], ['Yokosuka', 'Local'],
 ['SobuRapid', 'LimitedExpress'], ['Tokaido', 'Local'], ['Agatsuma', 'LimitedExpress'],
 ['JobanMain', 'Local'], ['JobanMain', 'LimitedExpress'], ['Echigo', 'Local'],
 ['Karasuyama', 'Local'], ['Oga', 'Local'], ['SensekiTohoku', 'Local'],
 ['Suigun', 'Local'], ['Kururi', 'Local'], ['Hachinohe', 'Local'],
 ['Yamagata', 'Local'], ['Tazawako', 'Local'], ['Yurikamome', 'Local'],
 ['ChibaMonorail1', 'Local'], ['ChibaMonorail2', 'Local'],
 ['YokohamaBlue', 'Rapid'], ['YokohamaGreen', 'Local'], ['ShonanMonorail', 'Local'],
 ['NewShuttle', 'Local'], ['TamaMonorail', 'Local'], ['TokyoMonorail', 'AirportRapid'],
 ['Nippori_Toneri', 'Local'], ['Arakawa', 'Local'], ['KeioInokashira', 'Local'],
 ['TokyuSetagaya', 'Local'], ['TokyuKodomonokuni', 'Local'],
 ['TokyuToyoko', 'CommuterLimitedExpress'], ['Keikyu', 'AirportRapidLimitedExpress'],
 ['KeikyuAirport', 'AccessExpress'], ['KeikyuKurihama', 'AirportRapidLimitedExpress'],
 ['AkitaShinkansen', 'Shinkansen'], ['YamagataShinkansen', 'Shinkansen'],
 ['HokkaidoShinkansen', 'Shinkansen'], ['HokurikuShinkansen', 'Shinkansen'],
 ['JoetsuShinkansen', 'Shinkansen'], ['TokaidoShinkansen', 'Shinkansen']
];
for (const [line, type] of cases) {
  assert(lines[line], line + ' canonical line');
  const v = resolve(line, type);
  assert(artwork(v), line + ' ' + type + ' planned artwork: ' + JSON.stringify(v));
  assert(fs.existsSync(artwork(v).slice(3)), line + ' native PNG exists');
  assert(v.vehiclePlan, line + ' must stay planned rather than daily observed');
}
assert(models(resolve('Nambu')).includes('E233系8500番台'), 'retain candidates with missing exact PNG');
assert(!models(resolve('Tokaido')).includes('E233系1000番台'), 'Keihin-Tohoku stock is not Tokaido stock');
assert.deepEqual(models(resolve('YamagataShinkansen', 'Shinkansen')), ['E8系'], 'retired E3 must not persist');
for (const line of ['Keikyu', 'KeikyuAirport', 'KeikyuKurihama']) {
  assert(!models(resolve(line, 'AccessExpress')).includes('京急2100形'), line + ' access stock restriction');
}
assert.deepEqual(models(resolve('Keikyu', 'AccessExpress', 'A1001K')), ['京成3100形'], 'working code narrows native fallback');
assert(models(resolve('TokyuMeguro', 'Local', 'A1031S')).every(x => /東京メトロ/.test(x)), 'Metro working retained on through route');
assert(!models(resolve('SaitamaRapid', 'Local', 'A1031S')).some(x => /都営/.test(x)), 'no Mita stock on Saitama Railway');
assert(!models(resolve('NaritaSkyAccess', 'AccessExpress', 'A1001H')).includes('京急1500形'), 'Sky Access restriction');
for (const label of ['東急6020系(5両)', '東急6020系（5両）']) {
  const v = resolve('TokyuOimachi', 'Local', 'PLAN001', label);
  assert(artwork(v), 'full/half width qualified alias ' + label);
}
assert.equal(c.window.TrainIcons.resolveVehicleArtwork('京王1000系'), null, 'representative does not prove exact paint');
const actual = api.resolveRealtime({
  lineId: 'Tokaido', trainNumber: '123M', serviceDate: '2026-10-16', realtimeVehicleType: 'E233系3000番台'
}).vehicleResult;
assert.equal(actual.name, 'E233系3000番台');
assert(!actual.vehiclePlan, 'supplied model overrides a fleet plan');
console.log('Remaining planned fleet coverage: ' + cases.length + ' line/type cases, native PNGs, through-working narrowing, model priority and representative separation PASS');
