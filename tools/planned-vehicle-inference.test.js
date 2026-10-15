const fs=require('fs'),vm=require('vm'),assert=require('assert');
const read=p=>fs.readFileSync(p,'utf8');
let clock=Date.parse('2026-10-15T12:01:00+09:00');
class Clock extends Date {constructor(...a){super(...(a.length?a:[clock]));}static now(){return clock;}}
const w={};const c={window:w,Date:Clock,Intl,console:{debug(){},warn(){}},setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},document:{addEventListener(){},readyState:'loading'}};
vm.createContext(c);
function load(p){vm.runInContext(read(p),c,{filename:p});Object.assign(c,w);}
load('js/common.js');load('js/train-vehicle.js');
const api=w.TrainVehicle,day='2026-10-15';
function decide(label,lineId='ChuoSobuLocal',operator='JR-East',run={}){
 const tt={_positionSource:'supabase-train-run',_sqlVehicleCandidateLabel:label};
 return api.resolveTimetableRun(Object.assign({trainNumber:'1200C',calendar:'odpt.Calendar:Weekday'},run),tt,lineId,{operator},day).vehicleResult;
}
const planned=decide('E231系500番台 / E231系0番台');
assert.notEqual(planned.identityStatus,'EXACT');
assert.equal(planned.vehiclePlan.models.length,2);
assert.equal(planned.vehiclePlan.formationId,'');
assert(planned.vehiclePlan.models[0].includes('500番台'));
const position={vehiclePlan:planned.vehiclePlan,vehicleResolvedUpstream:false,vehicleIdentityStatus:'UNKNOWN'};
assert(api.selectMarkerArtwork(position,false).iconSrc.endsWith('JR東日本_E231系_0番台_中央・総武線各駅停車.png'));
assert.equal(api.selectMarkerArtwork(position,false).planned,true);
assert.equal(api.selectMarkerArtwork(position,true).kind,'unresolved');
assert.equal(api.selectMarkerArtwork({...position,vehiclePlan:JSON.parse(JSON.stringify(planned.vehiclePlan))},false).kind,'unresolved','only the unified resolver issues plans');
assert.equal(api.selectMarkerArtwork({vehicleIdentityStatus:'UNKNOWN'},false).kind,'unresolved');
assert.equal(decide('E233系2000番台','Keisei','Keisei').vehiclePlan.iconPath,'','do not borrow JR stock for an unqualified Keisei label');
assert.equal(decide('Unknown9000系','Unmapped','Unmapped').vehiclePlan.iconPath,'');
assert.equal(decide('こだま','TokaidoShinkansen','JR-Central').vehiclePlan.iconPath,'','service names are not vehicle models');
const metro=decide('東京メトロ8000系 / 08系 / 18000系','Hanzomon','TokyoMetro').vehiclePlan;
assert.deepEqual(Array.from(metro.models),['東京メトロ8000系','東京メトロ08系','東京メトロ18000系']);
for(const model of metro.models)assert(w.TrainIcons.resolveCanonicalVehicle(model));
assert.equal(decide('701系','TohokuMain','JR-East').vehiclePlan.iconPath,'','generic model must not pick a regional variant');
const actual=api.resolveRealtime({lineId:'ChuoSobuLocal',operator:'JR-East',serviceDate:day,trainNumber:'1200C',realtimeVehicleType:'E353系'}).vehicleResult;
assert.equal(actual.identityStatus,'EXACT');assert(!actual.vehiclePlan);
assert(api.selectMarkerArtwork({...position,vehicleResolvedUpstream:true,vehicleIconPath:actual.iconPath,vehicleType:actual.name},false).iconSrc.endsWith('JR東日本_E353系.png'));
const cachedRun={trainNumber:'1200C',calendar:'odpt.Calendar:Weekday'};
const cachedTt={_positionSource:'supabase-train-run',_sqlVehicleCandidateLabel:'E231系500番台 / E231系0番台'};
const before=api.resolveTimetableRun(cachedRun,cachedTt,'ChuoSobuLocal',{operator:'JR-East'},day);
cachedTt._sqlVehicleCandidateLabel='E353系';
const after=api.resolveTimetableRun(cachedRun,cachedTt,'ChuoSobuLocal',{operator:'JR-East'},day);
assert.notEqual(before,after);assert.equal(after.vehicleResult.vehiclePlan.models[0],'E353系');
// Renderers show planned candidates, even if the real-time source has no model.
load('js/trains-render.js');
w.currentLang='zh';const title=c._trainMarkerTitle({...position,estimated:true,positionSource:'supabase-train-run'},'ChuoSobuLocal');
assert(title.includes('计划候选车型'));assert(title.includes('500番台'));assert(!title.includes('未判定'));assert(!title.includes('未提供'));
// SQL plan -> estimated position -> unique live timetable join uses the same plan.
const db=JSON.parse(read('data/core/railway_data.json')).lines;
w.DataLayer={getAllLines:()=>db};
load('js/train-position-estimator.js');
function row(no='1200C',end='12:10',label='E231系500番台 / E231系0番台'){
 return {'@id':'plan-'+no+'-'+end,'odpt:trainNumber':no,'odpt:railway':'odpt.Railway:JR-East.ChuoSobuLocal',
 'odpt:calendar':'odpt.Calendar:Weekday','odpt:railDirection':'odpt.RailDirection:Eastbound',
 'odpt:destinationStation':['odpt.Station:JR-East.ChuoSobuLocal.Kichijoji'],
 _positionSource:'supabase-train-run',_sqlLineId:'ChuoSobuLocal',_serviceDate:day,_sqlVehicleCandidateLabel:label,
 'odpt:trainTimetableObject':[{'odpt:departureStation':'odpt.Station:JR-East.ChuoSobuLocal.Mitaka','odpt:departureTime':'12:00'},
 {'odpt:arrivalStation':'odpt.Station:JR-East.ChuoSobuLocal.Kichijoji','odpt:arrivalTime':end}]};
}
const est=w.TrainPositionEstimator;est.registerManualTimetable('ChuoSobuLocal',[row()]);
let positions=est.estimateAllPositions(db,{}, {},null);
assert.equal(positions.ChuoSobuLocal.length,1);
assert(api.selectMarkerArtwork(positions.ChuoSobuLocal[0],false).planned);
const live={positionSource:'realtime-api',trainNumber:'1200C',serviceDate:day,railDirection:'Eastbound'};
let matched=est.matchRealtimeVehicleEvidence('ChuoSobuLocal',live,db);
assert(matched&&matched.vehiclePlan&&!matched.model);
assert(api.selectMarkerArtwork({vehiclePlan:matched.vehiclePlan},false).planned);
assert.equal(est.matchRealtimeVehicleEvidence('ChuoSobuLocal',{...live,serviceDate:'2026-10-14'},db),null);
est.registerManualTimetable('ChuoSobuLocal',[row(),row('1200C','12:11')]);
est.estimateAllPositions(db,{}, {},null);
assert.equal(est.matchRealtimeVehicleEvidence('ChuoSobuLocal',live,db),null,'different itineraries remain ambiguous');
est.registerManualTimetable('ChuoSobuLocal',[row(),row('1200C','12:10','E353系')]);
est.estimateAllPositions(db,{}, {},null);
assert.equal(est.matchRealtimeVehicleEvidence('ChuoSobuLocal',live,db),null,'duplicate itineraries cannot hide conflicting plans');
for(const record of Object.values(w.TrainIcons.CANONICAL_VEHICLES))if(record.asset)assert(fs.existsSync(record.asset.replace(/^\.\.\//,'')),record.asset);
console.log('planned candidates, Sobu livery, owner isolation, actual priority, plan cache invalidation, passenger tooltip, SQL positions, unique live join and ambiguity PASS');
