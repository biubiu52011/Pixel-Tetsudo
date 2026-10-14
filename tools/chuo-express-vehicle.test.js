const fs=require('fs'),vm=require('vm'),assert=require('assert');
const read=p=>fs.readFileSync(p,'utf8'),ctx={window:{},console:{debug(){}}};vm.createContext(ctx);
for(const file of ['data/timetables/vehicle-operation-evidence-data.js','data/timetables/train-operation-evidence.js','js/train-vehicle.js','js/train-position-estimator.js'])vm.runInContext(read(file),ctx);
const snapshot=JSON.parse(read('data/timetables/vehicle-operation-evidence.json'));
const rules=snapshot.referenceRules.filter(r=>r.vehicleType==='E353系'&&['ChuoRapid','ChuoMain'].includes(r.networkKey));
assert.equal(rules.length,208);
for(const r of rules){
 const c={lineId:r.networkKey,operator:'JR-East',railway:'odpt.Railway:JR-East.'+r.networkKey,serviceDate:r.calendarType==='weekday'?'2026-10-14':'2026-10-17',calendarType:r.calendarType};
 const fact=ctx.window.TrainOperationEvidence.resolveEvidence(r.trainNumber,c,'fallback');
 assert.equal(fact.vehicleType,'E353系');assert.equal(fact.evidenceRole,'timetable-reference');assert.equal(fact.formationId,'');
 const v=ctx.window.TrainVehicle.resolve({...c,trainNumber:r.trainNumber,timetableVehicleType:fact.vehicleType});
 assert.equal(v.identityStatus,'EXACT');assert(v.iconPath.endsWith('JR東日本_E353系.png'));
 assert.equal(ctx.window.TrainVehicle.selectMarkerArtwork({vehicleResolution:v,vehicleIdentityStatus:v.identityStatus,vehicleIconPath:v.iconPath,vehicleResolvedUpstream:true}).kind,'vehicle');
}
const base={lineId:'ChuoRapid',operator:'JR-East',railway:'odpt.Railway:JR-East.ChuoRapid',serviceDate:'2026-10-14',calendarType:'weekday'};
for(const n of ['9999M','8293M'])assert.equal(ctx.window.TrainOperationEvidence.resolveEvidence(n,base,'fallback'),null,'unknown/temporary numbers are not regular E353 by suffix');
assert.notEqual(ctx.window.TrainOperationEvidence.resolveEvidence('18M',{...base,lineId:'Joban',railway:'odpt.Railway:JR-East.Joban'},'fallback')?.vehicleType,'E353系','same-number Joban service keeps its own model');
assert.equal(ctx.window.TrainOperationEvidence.resolveEvidence('18M',{...base,serviceDate:'2026-12-01'},'fallback'),null);
const live=ctx.window.TrainVehicle.resolve({...base,trainNumber:'18M',realtimeVehicleType:'E233系0番台',timetableVehicleType:'E353系'});
assert.notEqual(live.name,'E353系','planned reference does not override conflicting observed model');
const png=fs.readFileSync('images/列车/JR東日本/JR東日本_E353系.png');assert(png.readUInt32BE(16)>0&&png.readUInt32BE(20)>0);
console.log('208 scoped E353 references to native PNG, expiry, unknown/temp isolation and realtime priority: PASS');

const lines=JSON.parse(read('data/core/railway_data.json')).lines;
for(const row of JSON.parse(read('tests/fixtures/chuo-shinjuku-express.json'))){
 const final=row.stops.at(-1).arrival_time.split(':').map(Number),now=Date.UTC(2026,9,14,final[0]-9,final[1]-2);
 class FixedDate extends Date{constructor(...a){super(...(a.length?a:[now]));}static now(){return now;}}
 const box={window:{RuntimeConfig:{},ODPTClient:{LINE_RAILWAY_CODE:{ChuoRapid:'ChuoRapid',ChuoMain:'Chuo'},LINE_TO_OPERATOR:{ChuoRapid:'JR-East',ChuoMain:'JR-East'}}},Date:FixedDate,Intl,console:{debug(){}}};vm.createContext(box);
 for(const f of ['data/timetables/vehicle-operation-evidence-data.js','data/timetables/train-operation-evidence.js','js/train-vehicle.js','js/train-position-estimator.js'])vm.runInContext(read(f),box);
 const src=read('data/api/odpt-unified.js'),start=src.indexOf('    function _trainRunToTimetable(run) {'),end=src.indexOf('    // One timetable identity',start);
 box._plannedTrainRunIdentity=()=>row.id;box._dbStopClock=t=>t;box.LINE_TO_OPERATOR={};box.LINE_RAILWAY_CODE={};
 vm.runInContext(src.slice(start,end),box);
 const tt=box._trainRunToTimetable(row),pos=box.window.TrainPositionEstimator.estimateLinePositions('ChuoMain',lines.ChuoMain,[tt],{},'JR-East',lines);
 assert.equal(pos.length,1);assert.equal(pos[0].destinationStation,'Shinjuku');assert.equal(pos[0].vehicleIdentityStatus,'EXACT');assert.equal(pos[0].trainClass,'E353系');
 assert.equal(box.window.TrainVehicle.selectMarkerArtwork(pos[0]).kind,'vehicle');
 assert.equal(pos[0].vehicleFormationId,'','model reference does not claim coupled carsets');
}
console.log('Actual Shinjuku-bound azusa/kaiji SQL rows through estimator and PNG selector: PASS');
