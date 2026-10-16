const fs=require('fs'),vm=require('vm'),assert=require('assert');
const c={window:{},console:{debug(){}}};vm.createContext(c);
for(const f of ['js/train-vehicle.js','data/timetables/vehicle-operation-evidence-data.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
const api=c.window.TrainVehicle, ev=c.window.TrainOperationEvidence;
function decide(line,no,extra={}){
 return api.resolveRealtime({lineId:line,trainNumber:no,calendarType:'weekday',serviceDate:'2026-10-16',...extra}).vehicleResult;
}
const cases=[
 ['Yurakucho','A1375S',['東京メトロ10000系','東京メトロ17000系']],
 ['Yurakucho','A1321T',['東武50070系','東武9000系','東武9050系']],
 ['Yurakucho','B1228M',['西武6000系','西武40000系']],
 ['Fukutoshin','A1301S',['東京メトロ17000系']],
 ['Fukutoshin','A1353K',['東急5050系']],
 ['Fukutoshin','A1315K',['東急5050系','東急5000系','横浜高速Y500系']],
 ['Fukutoshin','A1391G',['相鉄20000系']],
 ['Fukutoshin','B526K2',['東急5050系','東急5000系','横浜高速Y500系']],
 ['Fukutoshin','A1371M',['西武40000系']]
];
for(const [line,no,models]of cases){
 const tt=api.resolveTimetableRun({trainNumber:no,calendar:'odpt.Calendar:Weekday'},{_positionSource:'supabase-train-run',_sqlVehicleCandidateLabel:'東京メトロ10000系 / 17000系 / 7000系'},line,{operator:'TokyoMetro'},'2026-10-16').vehicleResult;
 assert.deepEqual(Array.from(tt.vehiclePlan.models),models,'SQL adapter must receive the same working constraint');
 const v=decide(line,no);assert.deepEqual(Array.from(v.vehiclePlan.models),models);
 assert.equal(v.identityStatus,'UNKNOWN');assert.equal(v.vehiclePlan.formationId,'');
 assert(fs.existsSync(v.vehiclePlan.iconPath.replace(/^\.\.\//,'')));
 for(const m of models)assert(c.window.TrainIcons.resolveVehicleArtwork(m),m);
 const e=ev.resolveEvidence(no,{lineId:line,trainNumber:no,calendarType:'weekday',serviceDate:'2026-10-16'},'planned');
 assert.equal(e.observedDate,'');assert(!e.decisive);
}
assert(!decide('Yurakucho','A1315K').vehiclePlan,'Tokyu cannot be assigned to independent Y route');
assert(!decide('Fukutoshin','unknown').vehiclePlan,'no blanket type-wide fallback');
assert(!decide('Marunouchi','A1375S').vehiclePlan);
assert(!decide('Yurakucho','A1375S',{serviceDate:'2026-03-13'}).vehiclePlan);
assert(decide('Yurakucho','A1375S',{calendarType:'holiday'}).vehiclePlan);
const actual=decide('Yurakucho','A1375S',{realtimeVehicleType:'東京メトロ17000系'});
assert.equal(actual.name,'東京メトロ17000系');assert(!actual.vehiclePlan);
const rules=c.window.VEHICLE_FAMILY_RULES.filter(r=>r.codePattern.startsWith('PLAN:MF'));
assert.equal(rules.length,12);assert(rules.every(r=>r.planScope.planOnly&&r.planScope.operationPatterns.length));
console.log('Metro Y/F 12 SQL working plans: owner/car-length families, PNG paths, no retired7000/foreign-owner leakage, plan/actual isolation PASS');

let total=0;
for(const line of ['Yurakucho','Fukutoshin']){
 vm.runInContext(fs.readFileSync('data/timetables/'+line+'-manual.js','utf8'),c);
 for(const source of c.window[line+'_MANUAL_TIMETABLES']){
  const tt={...source,_positionSource:'supabase-train-run',_sqlVehicleCandidateLabel:source.vehicleType||''}; delete tt.vehicleType;
  const no=tt['odpt:trainNumber'];
  const v=api.resolveTimetableRun({trainNumber:no,calendar:tt['odpt:calendar']},tt,line,{operator:'TokyoMetro'},'2026-10-16').vehicleResult;
  assert(v.vehiclePlan?.iconPath,line+' '+no+' drawable plan');
  assert(!v.vehiclePlan.models.some(m=>/7000系|30000系/.test(m.replace('17000系',''))),line+' '+no+' retired/incompatible family');
  assert(fs.existsSync(v.vehiclePlan.iconPath.replace(/^\.\.\//,'')),no+' file');
  total++;
 }
}
assert.equal(total,1836);console.log('All '+total+' Y/F weekday/holiday timetable rows resolve planned models and existing PNGs PASS');
