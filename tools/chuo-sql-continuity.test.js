const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const snapshot=JSON.parse(read('data/timetables/vehicle-operation-evidence.json'));
const references=snapshot.referenceRules.filter(r=>r.networkKey==='ChuoRapid');
assert.equal(references.length,1081);
const evidenceCtx={window:{},console:{debug(){}}};vm.createContext(evidenceCtx);
for(const p of ['data/timetables/vehicle-operation-evidence-data.js','data/timetables/train-operation-evidence.js','js/train-vehicle.js'])vm.runInContext(read(p),evidenceCtx,{filename:p});
for(const r of references){
 const ctx={lineId:'ChuoRapid',operator:'JR-East',railway:'odpt.Railway:JR-East.ChuoRapid',serviceDate:r.calendarType==='weekday'?'2026-10-14':'2026-10-17',calendarType:r.calendarType};
 const fact=evidenceCtx.window.TrainOperationEvidence.resolveEvidence(r.trainNumber,ctx,'fallback');
 assert.equal(fact.vehicleType,'E233系0番台');assert.equal(fact.evidenceRole,'timetable-reference');assert.equal(fact.formationId,'');
 const vehicle=evidenceCtx.window.TrainVehicle.resolve({...ctx,trainNumber:r.trainNumber,timetableVehicleType:fact.vehicleType});
 assert.equal(vehicle.identityStatus,'EXACT');assert(vehicle.iconPath.endsWith('JR東日本_E233系_0番台.png'));
}
const base={lineId:'ChuoRapid',operator:'JR-East',railway:'odpt.Railway:JR-East.ChuoRapid',serviceDate:'2026-10-14',calendarType:'weekday'};
const facts=evidenceCtx.window.TrainOperationEvidence;
assert.equal(facts.resolveEvidence('9999T',base,'fallback'),null,'suffix never supplies a model');
assert.equal(facts.resolveEvidence('1081T',{...base,serviceDate:'2026-12-01'},'fallback'),null);
assert.equal(facts.resolveEvidence('1081T',{...base,lineId:'ChuoMain',railway:'odpt.Railway:JR-East.ChuoMain'},'fallback'),null,'rapid model must not leak to mixed mainline');
const live=evidenceCtx.window.TrainVehicle.resolve({...base,trainNumber:'1081T',realtimeVehicleType:'E233系2000番台',timetableVehicleType:'E233系0番台'});
assert.notEqual(live.name,'E233系0番台','conflicting live model keeps priority');
const png=fs.readFileSync(path.join(root,'images/列车/JR東日本/JR東日本_E233系_0番台.png'));assert.equal(png.readUInt32BE(16),82);assert.equal(png.readUInt32BE(20),98);
const fixture=JSON.parse(read('tests/fixtures/chuo-verified-continuation.json'));
const lines=JSON.parse(read('data/core/railway_data.json')).lines;
function at(number,hour,minute,lineId='ChuoRapid',serviceDate='2026-10-14'){
 const fixed=Date.UTC(2026,9,Number(serviceDate.slice(-2)),hour-9,minute);
 class FixedDate extends Date{constructor(...a){super(...(a.length?a:[fixed]));}static now(){return fixed;}}
 const ctx={window:{RuntimeConfig:{},ODPTClient:{LINE_RAILWAY_CODE:{Joban:'JobanRapid',JobanMain:'Joban'},LINE_TO_OPERATOR:{ChuoRapid:'JR-East',ChuoMain:'JR-East',Ome:'JR-East',Joban:'JR-East',JobanMain:'JR-East'}}},Date:FixedDate,Intl,console:{debug(){}}};
 vm.createContext(ctx);for(const p of ['data/timetables/vehicle-operation-evidence-data.js','data/timetables/train-operation-evidence.js','js/train-vehicle.js','js/train-position-estimator.js'])vm.runInContext(read(p),ctx);
 const src=read('data/api/odpt-unified.js'),start=src.indexOf('    function _trainRunToTimetable(run) {'),end=src.indexOf('    // One timetable identity',start);
 ctx._plannedTrainRunIdentity=()=> 'fixture';ctx._dbStopClock=t=>t;ctx.LINE_TO_OPERATOR={};ctx.LINE_RAILWAY_CODE={};vm.runInContext(src.slice(start,end),ctx);
 const row=fixture.find(r=>r.train_number===number&&r.service_date===serviceDate),tt=ctx._trainRunToTimetable(row);
 const result=ctx.window.TrainPositionEstimator.estimateLinePositions(lineId,lines[lineId],[tt],{},'JR-East',lines);
 return {result,row,tt};
}
const before=at('1087T',11,36).result;
assert.equal(before.length,1);assert.equal(before[0].vehicleIdentityStatus,'EXACT');assert(before[0].vehicleIconPath.endsWith('JR東日本_E233系_0番台.png'));
assert.equal(at('1087T',11,41).result.length,0,'Ome branch must leave Chuo view after Tachikawa departure');
const parking=at('1081T',11,35);
assert.equal(parking.result.length,1);assert.equal(parking.result[0].stationIndex,lines.ChuoRapid.stations.indexOf('Takao'));
assert.equal(parking.tt._canonicalGroupEvidence,'verified_continuation');assert.equal(parking.tt._timetableDateVerified,false,'retrieval never promotes timetable validity');
assert.equal(at('1081T',11,38).result.length,0,'Otsuki run leaves Chuo view after Takao departure');
assert(at('1223H',13,50).result.length,'same-number regional service must not replace the sourced Chuo run');
console.log('Chuo exact SQL/calendar model -> E233 native PNG; scoped source-linked branches and Takao dwell: PASS');

const incoming=fixture.find(r=>r.train_number==='1280T');
const arrival=incoming.stops.find(s=>s.station_urn.endsWith('.Takao')).arrival_time.split(':').map(Number);
assert.equal(at('1280T',arrival[0],arrival[1]-1).result.length,0,'inbound mainline run remains outside Chuo view before Takao arrival');
assert.equal(at('1280T',arrival[0],arrival[1]).result[0].stationIndex,lines.ChuoRapid.stations.indexOf('Takao'));
const weekend=at('525T',5,42,'ChuoRapid','2026-10-17');
assert.equal(weekend.result[0].stationIndex,lines.ChuoRapid.stations.indexOf('Takao'));
assert.equal(weekend.result[0].vehicleIdentityStatus,'EXACT');
assert.equal(at('525T',5,45,'ChuoRapid','2026-10-17').result.length,0);
assert.deepEqual(lines.ChuoRapid.presentation.lineIds,['ChuoRapid']);
console.log('Inbound/holiday boundary clipping and independent Chuo presentation: PASS');
