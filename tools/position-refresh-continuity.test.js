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
