'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const lines=JSON.parse(fs.readFileSync('data/core/railway_data.json','utf8')).lines;
const c={window:{},console:{debug(){},warn(){}}};vm.createContext(c);
for(const f of ['data/timetables/vehicle-operation-evidence-data.js','js/train-vehicle.js','data/timetables/ChuoMain-manual.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
const api=c.window.TrainVehicle;
function resolve(number,type,label,date='2026-10-16'){
 const tt={'odpt:trainNumber':number,'odpt:trainType':'odpt.TrainType:JR-East.'+type,_positionSource:'supabase-train-run',_sqlVehicleCandidateLabel:label};
 return api.resolveTimetableRun({trainNumber:number},tt,'ChuoMain',lines.ChuoMain,date).vehicleResult;
}
for(const number of ['421M','327M','555M','1467M']){
 const v=resolve(number,'Local','211系 / E233系0番台');
 assert.deepEqual(Array.from(v.vehiclePlan.models),['211系（長野地区）','E131系（長野地区）']);
 assert(v.vehiclePlan.iconPath.endsWith('JR東日本_211系_長野色.png'));
 assert.equal(v.vehiclePlan.source,'operation-family-plan');
 assert.equal(v.vehiclePlan.formationId,'');
}
for(const number of ['1081T','525T','1223H']){
 const v=resolve(number,'Local','211系 / E233系0番台');
 assert.deepEqual(Array.from(v.vehiclePlan.models),['E233系0番台'],'through working outranks mixed legacy label');
}
const green=resolve('1081M','Local','E233系0番台');
assert.deepEqual(Array.from(green.vehiclePlan.models),['E233系0番台'],'Green-equipped sourced M segment retains E233');
const limited=resolve('9999M','LimitedExpress','E353系');
assert.deepEqual(Array.from(limited.vehiclePlan.models),['E353系'],'explicit published model remains planned');
const temporary=resolve('8293M','Local','211系 / E233系0番台');
assert.notEqual(temporary.vehiclePlan?.source,'operation-family-plan','unlisted temporary M cannot inherit regular Nagano family');
assert.equal(c.window.TrainIcons.resolveVehicleArtwork('E131系（長野地区）'),null,'representative not precise observed body');
const actual=api.resolveRealtime({lineId:'ChuoMain',trainNumber:'421M',serviceDate:'2026-10-16',realtimeVehicleType:'E233系0番台'}).vehicleResult;
assert.equal(actual.name,'E233系0番台');assert(!actual.vehiclePlan);
let checked=0;
for(const source of c.window.ChuoMain_MANUAL_TIMETABLES){
 const tt={...source,_positionSource:'supabase-train-run',_sqlVehicleCandidateLabel:source.vehicleType||''};delete tt.vehicleType;
 const v=api.resolveTimetableRun({trainNumber:source['odpt:trainNumber'],calendar:source['odpt:calendar']},tt,'ChuoMain',lines.ChuoMain,'2026-10-16').vehicleResult;
 const icon=v.iconPath||v.vehiclePlan?.iconPath;assert(icon&&fs.existsSync(icon.slice(3)),source['odpt:trainNumber']+' native PNG');
 checked++;
}
assert.equal(checked,791);
console.log('Chuo Main: 791 references have native PNG; regular Nagano, rapid working, E353, sourced Green M, temporary-number isolation and observed priority PASS');
