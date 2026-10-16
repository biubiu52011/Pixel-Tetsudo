const fs=require('fs'),vm=require('vm'),assert=require('assert');
const db=JSON.parse(fs.readFileSync('data/core/railway_data.json')).lines,c={window:{},console:{debug(){}}};
vm.createContext(c);
for(const f of ['js/train-vehicle.js','data/timetables/vehicle-operation-evidence-data.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
const api=c.window.TrainVehicle;
const counts={};for(const id of ['Keiyo','Musashino']){
 vm.runInContext(fs.readFileSync('data/timetables/'+id+'-manual.js','utf8'),c);
 let total=0;for(const source of c.window[id+'_MANUAL_TIMETABLES']){
  const tt={...source,_positionSource:'supabase-train-run',_sqlVehicleCandidateLabel:''};delete tt.vehicleType;
  const v=api.resolveTimetableRun({trainNumber:source['odpt:trainNumber'],calendar:source['odpt:calendar']},tt,id,db[id],'2026-10-16').vehicleResult;
  assert(v.vehiclePlan,'SQL-null candidate must receive sourced plan '+id+'/'+source['odpt:trainNumber']);
  assert(fs.existsSync((v.iconPath||v.vehiclePlan.iconPath).slice(3)),id+'/'+source['odpt:trainNumber']+' '+(v.iconPath||v.vehiclePlan.iconPath));
  if(/E$/.test(source['odpt:trainNumber']))assert(v.vehiclePlan.models.includes('E231系0番台（武蔵野線）')&&!v.vehiclePlan.models.some(x=>/233/.test(x)));
  if(/M$/.test(source['odpt:trainNumber']))assert(v.vehiclePlan.models.every(x=>/E257/.test(x)));
  total++;
 }counts[id]=total;
}
function live(no,type='Local',extra={}){
 return api.resolveRealtime({lineId:'Keiyo',operator:'JR-East',trainNumber:no,trainType:'odpt.TrainType:JR-East.'+type,serviceDate:'2026-10-16',...extra}).vehicleResult;
}
assert.equal(counts.Keiyo,1127);assert.equal(counts.Musashino,536);
assert.deepEqual(Array.from(live('2083A','Rapid').vehiclePlan.models),['E233系5000番台']);
assert.deepEqual(Array.from(live('2082A','Rapid').vehiclePlan.models),['E233系5000番台']);
assert.equal(live('700Y').vehiclePlan.models.length,3);
assert.equal(live('1027Y').vehiclePlan.models.length,3);
assert.equal(live('1105E').vehiclePlan.models.length,3);
assert(!live('1105E').vehiclePlan.iconPath.includes('209'));
assert.equal(c.window.TrainIcons.resolveVehicleArtwork('E233系1000番台（京葉線）'),null,'blue stock is not red Keiyo artwork');
assert(!live('1234Z').vehiclePlan,'unrecognized working stays unresolved');
assert.equal(live('1027Y','Local',{realtimeVehicleType:'209系500番台（京葉線）'}).name,'209系500番台（京葉線）');
console.log('Keiyo/Musashino1663 reference rows + live/SQL plan parity, split and fleet isolation: PASS');
