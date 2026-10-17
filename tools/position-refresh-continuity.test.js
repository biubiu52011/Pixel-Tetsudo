const fs=require('fs'),vm=require('vm'),assert=require('assert');
const read=p=>fs.readFileSync(p,'utf8'),db=JSON.parse(read('data/core/railway_data.json')).lines;
let clock=Date.parse('2026-10-15T12:01:00+09:00');
class Clock extends Date{constructor(...a){super(...(a.length?a:[clock]));}static now(){return clock;}}
const timers=[],events={};
const w={ODPT_LAZY:true,location:{pathname:'/pages/trains.html',hash:'#SotetsuJRDirect'},addEventListener(k,f){events[k]=f;},dispatchEvent(){}};
const c={window:w,Date:Clock,Intl,performance,console:{debug(){},warn(){},error(){}},document:{readyState:'loading',hidden:false,body:{dataset:{page:'trains'}},addEventListener(k,f){events[k]=f;}},localStorage:{getItem(){return null;},setItem(){}},setTimeout(f,ms){timers.push({f,ms});return timers.length;},clearTimeout(){},setInterval(){return 1;},clearInterval(){},CustomEvent:function(){},AbortController,AbortSignal,URL,URLSearchParams,fetch(){throw Error('test must stay offline');},atob:x=>Buffer.from(x,'base64').toString()};
vm.createContext(c);
function load(f){vm.runInContext(read(f),c,{filename:f});Object.assign(c,w);}
load('js/common.js');load('data/core/data-config-bundle.js');load('data/api/odpt-links.js');
let odpt=read('data/api/odpt-unified.js');vm.runInContext(odpt.slice(0,odpt.lastIndexOf('    if (window.ODPT_LAZY === true)'))+'})();',c);Object.assign(c,w);
w.DataLayer={getAllLines:()=>db,getLine:id=>db[id]};
load('js/train-position-estimator.js');
function tt(id,source,no,start='12:00',end='12:10'){
 const stations=db[id].stations;
 return {'@id':'fixture-'+id+'-'+no,'odpt:trainNumber':no,'odpt:railway':source,
 'odpt:calendar':'odpt.Calendar:Weekday','odpt:destinationStation':['odpt.Station:Fixture.Route.'+stations[1]],
 _positionSource:'supabase-train-run',_sqlLineId:id,_serviceDate:'2026-10-15',
 'odpt:trainTimetableObject':[{'odpt:departureStation':'odpt.Station:Fixture.Route.'+stations[0],'odpt:departureTime':start},{'odpt:arrivalStation':'odpt.Station:Fixture.Route.'+stations[1],'odpt:arrivalTime':end}]};
}
// Captured SQL source identities: the canonical line id survives all source
// operator/code spellings, including standalone cards missing legacy aliases.
const sources=JSON.parse(read('tests/fixtures/sql-position-source-identities.json'));
for(const [id,source] of sources)w.TrainPositionEstimator.registerManualTimetable(id,[tt(id,source,'SQL-'+id)]);
const positions=w.TrainPositionEstimator.estimateAllPositions(db,{}, {},null);
for(const [id]of sources)assert.equal(positions[id]?.length,1,id+' canonical SQL position');
assert.equal(w.TrainPositionEstimator.estimateLinePositions('SaikyoKawagoe',db.SaikyoKawagoe,[tt('SotetsuJRDirect','odpt.Railway:JR-East.SaikyoKawagoe','wrong')],{},'JR-East',db).length,0);
const adapterStart=odpt.indexOf('    function _trainRunToTimetable(run) {'),adapterEnd=odpt.indexOf('    // One timetable identity',adapterStart);
const adapter={window:{},_plannedTrainRunIdentity:()=> 'fixture',_dbStopClock:x=>x,LINE_TO_OPERATOR:{},LINE_RAILWAY_CODE:{}};
vm.runInNewContext(odpt.slice(adapterStart,adapterEnd),adapter);
assert.equal(adapter._trainRunToTimetable({line_id:'SotetsuJRDirect',stops:[]})._sqlLineId,'SotetsuJRDirect');
// Isolate the active connector timetable for a same-tab sequential replay.
const clean={window:{},Date:Clock,Intl,console:{debug(){}}};vm.createContext(clean);
clean.window.ODPTClient=w.ODPTClient;vm.runInContext(read('js/train-position-estimator.js'),clean);w.TrainPositionEstimator=clean.window.TrainPositionEstimator;
w.TrainPositionEstimator.registerManualTimetable('SotetsuJRDirect',[
 tt('SotetsuJRDirect','odpt.Railway:JR-East.SotetsuDirect','early'),
 tt('SotetsuJRDirect','odpt.Railway:JR-East.SotetsuDirect','later','13:00','13:10')]);
w.TrainsActivePositionLineIds=['SotetsuJRDirect','SaikyoKawagoe'];
w.ODPT_TRAIN_POSITIONS={'JR-East':[{'owl:sameAs':'odpt.Train:JR-East.SaikyoKawagoe.live','odpt:trainNumber':'LIVE','odpt:railway':'odpt.Railway:JR-East.SaikyoKawagoe','odpt:fromStation':'odpt.Station:JR-East.SaikyoKawagoe.Osaki','odpt:toStation':'odpt.Station:JR-East.SaikyoKawagoe.Ebisu','dc:date':'2026-10-15T12:01:00+09:00','dct:valid':'2026-10-15T12:06:00+09:00'}]};
load('js/data-fusion.js');
function advance(at){clock=Date.parse(at);w.DataFusion.loadTrainPositions();return w.DataFusion.getRealtimePositions('SotetsuJRDirect');}
const a=advance('2026-10-15T12:01:00+09:00');assert.equal(a[0]?.trainNumber,'early');
const b=advance('2026-10-15T12:01:30+09:00');assert.equal(b[0]?.trainNumber,'early','same-minute realtime poll must keep active SQL service');
assert(b[0].segmentProgress>a[0].segmentProgress,'seconds advance position within one minute');
const d=advance('2026-10-15T12:02:00+09:00');assert(d[0].segmentProgress>a[0].segmentProgress,'clock advances coordinates');
assert.equal(advance('2026-10-15T12:11:00+09:00').length,0,'terminal service leaves the map');
assert.equal(advance('2026-10-15T13:01:00+09:00')[0]?.trainNumber,'later','one hour later is a new run');
assert.equal(w.DataFusion.getRealtimePositions('SaikyoKawagoe').length,0,'expired realtime cannot survive an hour');
clock=Date.parse('2026-10-15T13:11:00+09:00');events.visibilitychange();const resume=timers.filter(t=>t.ms===1500).at(-1);assert(resume);resume.f();
assert.equal(w.DataFusion.getRealtimePositions('SotetsuJRDirect').length,0,'foreground fallback recalculates after terminal');
console.log('SQL position identities: '+sources.length+' lines; same-tab 30s/minute/hour progression, terminus removal, realtime expiry and foreground recovery PASS');

// Drive the production local timer: every tick derives fresh wall-clock state;
// a hidden document must not advance or launch timetable work.
const fusionSource=read('js/data-fusion.js'),pollStart=fusionSource.indexOf('  function startFusionPolling()'),pollEnd=fusionSource.indexOf('  function stopFusionPolling()',pollStart);
const intervals=[];let ticks=0;
const polling={window:{location:{pathname:'/pages/trains.html',hash:'#Test'},TrainPositionEstimator:{getCurrentServiceDate:()=> '2026-10-15'}},document:{hidden:false},_cacheTimer:null,_positionTimer:null,_refreshIntervalMs:30000,_positionServiceDate:{},setInterval(f,ms){intervals.push({f,ms});return intervals.length;},loadTrainPositions(){ticks++;},saveToCache(){}};
vm.runInNewContext(fusionSource.slice(pollStart,pollEnd)+'startFusionPolling();',polling);
const positionTick=intervals.find(x=>x.ms===15000);assert(positionTick);
positionTick.f();assert.equal(ticks,1);
polling.document.hidden=true;positionTick.f();assert.equal(ticks,1);
console.log('local position timer and background suspension PASS');

// Published JR East October2026 seasonal plans: exact operating dates and
// clocks survive the real SQL adapter; a cancellation never erases the plan.
const published=JSON.parse(read('tests/fixtures/uchibo-published-seasonal.json'));
const realAdapter={window:{},LINE_TO_OPERATOR:{Uchibo:'JR-East'},LINE_RAILWAY_CODE:{Uchibo:'Uchibo'}};
vm.runInNewContext(odpt.slice(odpt.indexOf('    function _dbStopClock('),adapterEnd),realAdapter);
let seasonalChecks=0;
for(const plan of published){
 assert.equal(plan.dates.length,28);assert.equal(plan.stops.length,10);
 assert(!plan.dates.includes('2026-10-19'));assert(!plan.dates.includes('2026-11-30'));
 for(const date of plan.dates){
  const run={service_date:date,line_id:'Uchibo',operator:'JR-East',network_key:'odpt.Railway:JR-East.Uchibo',train_number:plan.trainNumber,calendar_type:'saturday_holiday',rail_direction:'odpt.RailDirection:'+plan.railDirection,train_type:'odpt.TrainType:JR-East.LimitedExpress',destination_station:'odpt.Station:JR-East.Uchibo.'+plan.destination,
    operation_status:plan.cancelledDates.includes(date)?'cancelled':'scheduled',
    stops:plan.stops.map(s=>({station_urn:'odpt.Station:JR-East.Uchibo.'+s.station,arrival_time:s.arrival,departure_time:s.departure}))};
  const snapshot=JSON.stringify(run),tt=realAdapter._trainRunToTimetable(run);
  assert.equal(JSON.stringify(run),snapshot,'cancellation keeps published source clocks');
  if(run.operation_status==='cancelled'){assert.equal(tt,null);seasonalChecks++;continue;}
  const active=plan.trainNumber==='9043M'?'09:30':'16:30',finished=plan.trainNumber==='9043M'?'10:07':'17:24';
  clock=Date.parse(date+'T'+active+':00+09:00');
  const estimator=clean.window.TrainPositionEstimator;
  const activeRows=estimator.estimateLinePositions('Uchibo',db.Uchibo,[tt],{},'JR-East',db);
  assert.equal(activeRows[0]?.trainNumber,plan.trainNumber,'sourced seasonal train appears in its own service interval');
  clock=Date.parse(date+'T'+finished+':00+09:00');
  assert.equal(estimator.estimateLinePositions('Uchibo',db.Uchibo,[tt],{},'JR-East',db).length,0);
  seasonalChecks++;
 }
}
// Execute the server's actual scope resolver, never a train-number-only filter.
const edge=read('supabase/functions/train-runs/index.ts');
const cs=edge.indexOf('function isCancelled('),ce=edge.indexOf('/**',cs);
const scopeCode=edge.slice(cs,ce).replace(/: any\[\]|: any|: string/g,'')+'this.cancel=isCancelled;';
function cancelled(exceptions,run){const scope={exceptions,lineId:'Uchibo'};vm.runInNewContext(scopeCode,scope);return scope.cancel(run,'Uchibo',exceptions);}
const run={id:10,operator:'JR-East'};
assert(cancelled([{train_run_id:10,line_id:'Uchibo',operator:'JR-East'}],run));
assert(!cancelled([{train_run_id:11,line_id:'Uchibo',operator:'JR-East'}],run),'another run cannot cancel the whole line');
assert(!cancelled([{line_id:'Sotobo',operator:'JR-East'}],run),'another line cannot cancel the operator');
assert(cancelled([{line_id:'Uchibo',operator:'JR-East'}],run));
assert(cancelled([{operator:'JR-East'}],run));
assert(!cancelled([{}],run),'unscoped record cannot suppress the network');
console.log('published seasonal dates/clocks/terminal checks '+seasonalChecks+'; scoped cancellation PASS');

(async()=>{
 clock=Date.parse('2026-10-15T12:01:00+09:00');
 w.ODPT_TIMETABLES={};
 const client=w.ODPTClient;let reads=0;
 client.getTrainRunStatus=()=>({serviceDate:'2026-10-15',complete:true,partial:false,updatedAt:clock});
 client.getCachedTrainRuns=async()=>{reads++;return reads===1?[tt('SotetsuJRDirect','odpt.Railway:JR-East.SotetsuDirect','fresh','12:00','13:00')]:[];};
 await w.DataFusion.ensureTimetable('SotetsuJRDirect');
 assert.equal(reads,1,'initial SQL load');
 const stale=tt('SotetsuJRDirect','odpt.Railway:JR-East.SotetsuDirect','stale','12:00','13:00');
 const other=tt('Ito','odpt.Railway:JR-East.Ito','other');
 w.ODPT_TIMETABLES={'JR-East':[stale,other]};
 clock+=300000;
 await w.DataFusion.ensureTimetable('SotetsuJRDirect');
 assert.equal(reads,1,'same-day SQL snapshot reuses its bounded cache');
 clock+=300001;
 await w.DataFusion.ensureTimetable('SotetsuJRDirect');
 assert.equal(reads,2,'same-day plan refreshes at TTL without waiting for next day');
 assert.equal(w.TrainPositionEstimator.getRegisteredManualTimetable('SotetsuJRDirect').length,0,'confirmed empty/all-cancelled result replaces the old plan');
 assert.equal(w.ODPT_TIMETABLES['JR-East'].length,1,'old railway copy evicted, other source retained');
 assert.equal(w.ODPT_TIMETABLES['JR-East'][0],other);
 w.DataFusion.loadTrainPositions();
 assert.equal(w.DataFusion.getRealtimePositions('SotetsuJRDirect').length,0,'stale shared pool cannot resurrect cancelled position');
 w.TrainPositionEstimator.registerManualTimetable('SotetsuJRDirect',[tt('SotetsuJRDirect','odpt.Railway:JR-East.SotetsuDirect','keep','12:00','13:00')]);
 client.getCachedTrainRuns=async()=>[];
 client.getTrainRunStatus=()=>({serviceDate:'2026-10-15',complete:false,partial:false,source:'SOURCE_ERROR'});
 clock+=600001;
 assert.equal(await w.DataFusion.ensureTimetable('SotetsuJRDirect'),false);
 assert.equal(w.TrainPositionEstimator.getRegisteredManualTimetable('SotetsuJRDirect').length,1,'SQL error cannot masquerade as confirmed empty or activate legacy files');
 console.log('same-day SQL TTL, confirmed-empty replacement, stale-pool eviction and error isolation PASS');
})().catch(e=>{console.error(e);process.exitCode=1;});
