const fs=require('fs'),vm=require('vm'),assert=require('assert');
const read=f=>fs.readFileSync(f,'utf8');
const source=read('js/train-vehicle.js'),snapshot=read('data/timetables/vehicle-operation-evidence-data.js');
function context(){const c={window:{},console:{debug(){}}};vm.createContext(c);vm.runInContext(source,c);return c;}
const train={lineId:'ChuoRapid',railway:'odpt.Railway:JR-East.ChuoRapid',operator:'JR-East',
 serviceDate:'2026-10-15',calendarType:'weekday',trainNumber:'5003M'};
const c=context(),api=c.window.TrainVehicle;
assert.equal(api.resolveRealtime(train).vehicleResult.identityStatus,'UNKNOWN');
const run={trainNumber:train.trainNumber,calendar:'odpt.Calendar:Weekday',railDirection:'Outbound',
 destinationStationUrn:'odpt.Station:JR-East.Chuo.Matsumoto',timetableIdentity:'late-data',trainType:'odpt.TrainType:JR-East.LimitedExpress'};
const tt={'odpt:railway':train.railway,_positionSource:'supabase-train-run',_sqlVehicleCandidateLabel:'E353系（あずさ・かいじ）'};
const before=api.resolveTimetableRun(run,tt,'ChuoRapid',{operator:'JR-East'},train.serviceDate);
assert.equal(before.vehicleResult.identityStatus,'UNKNOWN');
vm.runInContext(snapshot,c);
const live=api.resolveRealtime(train);
assert.equal(live.vehicleResult.name,'E353系');assert.equal(live.isPlannedReference,true);
assert.equal(live.formationId,'','reference model never proves a physical formation');
assert(live.vehicleResult.iconPath.endsWith('JR東日本_E353系.png'));
const after=api.resolveTimetableRun(run,tt,'ChuoRapid',{operator:'JR-East'},train.serviceDate);
assert.equal(after.vehicleResult.name,'E353系','late data must invalidate the cached UNKNOWN');
assert.notEqual(after.evidenceRevision,before.evidenceRevision);
assert.equal(after.key.slice(-10),'2026-10-15','position service-day contract is unchanged');
assert.equal(api.resolveTimetableRun(run,tt,'ChuoRapid',{operator:'JR-East'},train.serviceDate),after,'unchanged evidence reuses the identity');

// All regular Chuo model references pass through the merged LIVE entry, not
// just the evidence-table lookup. Include both coupled published numbers.
const refs=c.window.VEHICLE_REFERENCE_RULES.filter(r=>r.vehicleType==='E353系'&&['ChuoRapid','ChuoMain'].includes(r.networkKey));
assert.equal(refs.length,272);
for(const r of refs){
 const decision=api.resolveRealtime({...train,lineId:r.networkKey,trainNumber:r.trainNumber,
  calendarType:r.calendarType,serviceDate:r.calendarType==='weekday'?'2026-10-15':'2026-10-17'});
 assert.equal(decision.vehicleResult.identityStatus,'EXACT',r.trainNumber);
 assert.equal(decision.vehicleResult.name,'E353系');assert.equal(decision.formationCandidates.length,0);
 assert(decision.vehicleResult.iconPath.endsWith('JR東日本_E353系.png'));
}
assert.equal(api.resolveRealtime({...train,trainNumber:'9999M'}).vehicleResult.identityStatus,'UNKNOWN');
assert.equal(api.resolveRealtime({...train,serviceDate:'2026-12-01'}).vehicleResult.identityStatus,'UNKNOWN');
assert.notEqual(api.resolveRealtime({...train,lineId:'Joban',railway:'odpt.Railway:JR-East.Joban'}).vehicleResult.name,'E353系');
const observed=api.resolveRealtime({...train,realtimeVehicleType:'E233系0番台'});
assert.equal(observed.evidence,null,'explicit live model does not consume a planned fallback');
assert.equal(observed.vehicleResult.name,'E233系0番台');

const provider={id:'late-custom-line',grade:'C',resolveEvidence:(number,ctx)=>number==='SOURCED'&&ctx.serviceDate==='2026-10-15'
 ?{vehicleType:'E353系',formationId:'S101',sourceUrl:'https://example.test/dated-run',observedDate:ctx.serviceDate}:null};
c.window.TrainOperationEvidence.register(provider);
const sourced=api.resolveRealtime({...train,trainNumber:'SOURCED'});
assert.equal(sourced.formationId,'S101');assert.equal(sourced.evidence.providerId,provider.id);
const registry=c.window.TrainOperationEvidence.providers;
vm.runInContext(source,c);
assert.equal(c.window.TrainVehicle,api,'repeat imports cannot reset the vehicle authority');
assert.equal(c.window.TrainOperationEvidence.providers,registry);
assert.equal(registry.filter(p=>p.id===provider.id).length,1);

// Replacing/removing canonical rows must revoke old cached identities while
// preserving separately registered line providers and their provenance.
c.window.VEHICLE_REFERENCE_RULES=[];
assert.equal(api.resolveRealtime(train).vehicleResult.identityStatus,'UNKNOWN');
assert.equal(api.resolveTimetableRun(run,tt,'ChuoRapid',{operator:'JR-East'},train.serviceDate).vehicleResult.identityStatus,'UNKNOWN');
assert.equal(api.resolveRealtime({...train,trainNumber:'SOURCED'}).evidence.providerId,provider.id);
vm.runInContext(snapshot,c);
assert.equal(api.resolveRealtime(train).vehicleResult.name,'E353系');
assert(!fs.existsSync('data/timetables/train-operation-evidence.js'),'retired implementation must stay removed');
for(const page of ['trains','realtime']){
 const html=read('pages/'+page+'.html');
 assert.equal((html.match(/src="\.\.\/js\/train-vehicle\.js/g)||[]).length,1);
 assert(!html.includes('train-operation-evidence.js'));
}
assert(!read('js/data-fusion.js').includes('TrainOperationEvidence.resolveEvidence'));
assert(!read('js/train-position-estimator.js').includes('TrainOperationEvidence.resolveEvidence'));
console.log('merged live/SQL pipeline, 272 E353 decisions, late data, cache invalidation, revocation, provenance and one-script loading: PASS');
