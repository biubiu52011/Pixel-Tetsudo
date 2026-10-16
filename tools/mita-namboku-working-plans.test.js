const fs=require('fs'),vm=require('vm'),assert=require('assert');
const c={window:{},console:{debug(){}}};vm.createContext(c);
for(const f of ['js/train-vehicle.js','data/timetables/vehicle-operation-evidence-data.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
const api=c.window.TrainVehicle,ev=c.window.TrainOperationEvidence;
const samples=[
 ['Mita','1012K',['東急5080系','東急3020系','東急3000系']],
 ['Mita','1020T',['都営6300形','都営6500形']],
 ['Mita','1030G',['相鉄21000系']],
 ['Namboku','A540S',['東京メトロ9000系']],
 ['Namboku','A1280M',['埼玉高速2000系']],
 ['Namboku','B1238G2',['相鉄21000系']]
];
for(const [line,no,models]of samples){
 const ctx={lineId:line,trainNumber:no,serviceDate:'2026-10-16',calendarType:'weekday'};
 const live=api.resolveRealtime(ctx).vehicleResult;
 const mapped=api.resolveRealtime({...ctx,operationCode:'201'}).vehicleResult;
 assert.deepEqual(Array.from(mapped.vehiclePlan.models),models,'numeric source operation must not bypass published train working');
 const sql=api.resolveTimetableRun({trainNumber:no,calendar:'odpt.Calendar:Weekday'},
 {_positionSource:'supabase-train-run',_sqlVehicleCandidateLabel:'東京メトロ9000系 / 相鉄20000系 / 21000系'},
 line,{operator:line==='Mita'?'Toei':'TokyoMetro'},'2026-10-16').vehicleResult;
 for(const v of [live,sql]){
  assert.deepEqual(Array.from(v.vehiclePlan.models),models);
  assert(fs.existsSync(v.vehiclePlan.iconPath.replace(/^\.\.\//,'')));
  assert.equal(v.identityStatus,'UNKNOWN');assert.equal(v.vehiclePlan.formationId,'');
 }
 const e=ev.resolveEvidence(no,ctx,'planned');assert.equal(e.observedDate,'');assert(!e.decisive);
}
assert(!api.resolveRealtime({lineId:'Namboku',trainNumber:'1020T',serviceDate:'2026-10-16'}).vehicleResult.vehiclePlan,'no Toei route leakage');
assert(!api.resolveRealtime({lineId:'Mita',trainNumber:'A540S',serviceDate:'2026-10-16'}).vehicleResult.vehiclePlan,'no Metro route leakage');
let total=0;
for(const line of ['Mita','Namboku']){
 vm.runInContext(fs.readFileSync('data/timetables/'+line+'-manual.js','utf8'),c);
 for(const source of c.window[line+'_MANUAL_TIMETABLES']){
  const tt={...source,_positionSource:'supabase-train-run',_sqlVehicleCandidateLabel:source.vehicleType||''};delete tt.vehicleType;
  const no=source['odpt:trainNumber'];
  const v=api.resolveTimetableRun({trainNumber:no,calendar:source['odpt:calendar']},tt,line,{operator:line==='Mita'?'Toei':'TokyoMetro'},'2026-10-16').vehicleResult;
  assert(v.vehiclePlan?.iconPath,line+' '+no);assert(!v.vehiclePlan.models.some(m=>m.includes('20000系')),no+' wrong Sotetsu model');
  assert(fs.existsSync(v.vehiclePlan.iconPath.replace(/^\.\.\//,'')));total++;
 }
}
assert.equal(total,1502);
const actual=api.resolveRealtime({lineId:'Mita',trainNumber:'1020T',serviceDate:'2026-10-16',realtimeVehicleType:'都営6500形'}).vehicleResult;
assert.equal(actual.name,'都営6500形');assert(!actual.vehiclePlan);
console.log('Mita/Namboku: 1502 SQL plans and PNGs; hour/working/occurrence parsing, owner constraints, Sotetsu21000 and plan/actual isolation PASS');
