const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ctx={window:{},console:{debug(){}}};vm.createContext(ctx);
for(const f of ['js/train-vehicle.js','data/timetables/vehicle-operation-evidence-data.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
const api=ctx.window.TrainVehicle;
const refs=ctx.window.VEHICLE_REFERENCE_RULES.filter(r=>/entry-129721(43138|43555|45141|46396)\.html$/.test(r.sourceUrl)&&(/M$/.test(r.trainNumber)||r.trainNumber==='4877K'));
assert.equal(refs.length,185);
for(const r of refs){
 const day=r.calendarType==='weekday'?'2026-10-15':'2026-10-17';
 for(const lineId of ['SaikyoKawagoe','SotetsuJRDirect']){
  if(lineId==='SotetsuJRDirect'&&r.trainNumber==='4877K')continue;
  const raw={lineId,railway:lineId==='SaikyoKawagoe'?'odpt.Railway:JR-East.SaikyoKawagoe':'odpt.Railway:Sotetsu.JRDirect',operator:'JR-East',trainNumber:r.trainNumber,serviceDate:day,calendarType:r.calendarType};
  const live=api.resolveRealtime(raw);
  assert.equal(live.vehicleResult.identityStatus,'EXACT',lineId+' '+r.trainNumber);
  assert.equal(live.vehicleResult.name,r.vehicleType);
  assert.equal(live.isPlannedReference,true);assert.equal(live.formationId,'');
  assert.equal(live.formationCandidates.length,0);
  assert(fs.existsSync(live.vehicleResult.iconPath.replace(/^\.\.\//,'')));
  const run={trainNumber:r.trainNumber,calendar:r.calendarType==='weekday'?'odpt.Calendar:Weekday':'odpt.Calendar:SaturdayHoliday',railDirection:'Southbound',timetableIdentity:lineId+'-'+r.trainNumber+'-'+r.calendarType};
  const tt={'odpt:railway':raw.railway,_positionSource:'supabase-train-run'};
  assert.equal(api.resolveTimetableRun(run,tt,lineId,{operator:'JR-East'},day).vehicleResult.name,r.vehicleType);
 }
}
function decide(number,extra={}){return api.resolveRealtime({lineId:'SaikyoKawagoe',railway:'odpt.Railway:JR-East.SaikyoKawagoe',operator:'JR-East',trainNumber:number,calendarType:'weekday',serviceDate:'2026-10-15',...extra});}
assert.equal(decide('270M').vehicleResult.name,'相鉄12000系');
assert.equal(decide('141M').vehicleResult.name,'E233系7000番台');
assert.equal(decide('127M').vehicleResult.name,'相鉄12000系');
assert.equal(decide('127M',{calendarType:'holiday',serviceDate:'2026-10-17'}).vehicleResult.name,'E233系7000番台');
for(const extra of [{serviceDate:'2026-03-13'},{calendarType:'special'},{lineId:'SotetsuShin-Yokohama',railway:'odpt.Railway:Sotetsu.ShinYokohama'},{lineId:'Yokosuka',railway:'odpt.Railway:JR-East.Yokosuka'}])assert.equal(decide('270M',extra).vehicleResult.identityStatus,'UNKNOWN');
assert.equal(decide('999M',{destinationStation:'Ebina'}).vehicleResult.identityStatus,'UNKNOWN');
assert.equal(decide('270M',{realtimeVehicleType:'E233系7000番台'}).vehicleResult.name,'E233系7000番台');
console.log('Saikyo / Sotetsu JR through: 185 exact calendar references, live + SQL, native PNG, date/network isolation and observed priority PASS');
