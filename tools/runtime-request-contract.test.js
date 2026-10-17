const fs = require('fs'), vm = require('vm'), assert = require('node:assert/strict');
const source = fs.readFileSync('data/api/odpt-unified.js','utf8');
let now = Date.parse('2026-10-17T12:00:01+09:00'), calls = [], intervals = [];
class Clock extends Date { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } }
let respond = async () => ({ok:true,json:async()=>[]});
const window = {RuntimeConfig:{API_RATE_LIMIT:-1},addEventListener(){},location:{pathname:'/pages/trains.html'}};
const context = {window,Date:Clock,Intl,URL,URLSearchParams,AbortController,AbortSignal,
  console:{debug(){},warn(){},error(){}},document:{addEventListener(){},hidden:false},
  localStorage:{getItem(){return null;},setItem(){}},setTimeout,clearTimeout,
  setInterval(fn,ms){intervals.push({fn,ms});return intervals.length;},clearInterval(){},
  fetch(url){calls.push(url);return respond(url);},atob:x=>Buffer.from(x,'base64').toString()};
vm.createContext(context);
vm.runInContext(source.slice(0,source.lastIndexOf('    if (window.ODPT_LAZY === true)'))+
  'window.test={fetchODPT,extractData,startRealtimePolling,stopRealtimePolling};})();', context);
const api = window.test, url = 'https://api-challenge.odpt.org/api/v4/odpt:Train?fixture=1';
async function main() {
  let release;
  respond = () => new Promise(resolve => {release=resolve;});
  const requests = Array.from({length:20},()=>api.fetchODPT(url));
  assert.equal(calls.length,1,'20 concurrent consumers share one network request');
  release({ok:true,json:async()=>[{'@id':'train-1','dc:date':'2026-10-17T03:00:00Z',station:'A'}]});
  await Promise.all(requests);
  await api.fetchODPT(url); assert.equal(calls.length,1,'same refresh window shares completed response');
  now+=30000;
  respond=async()=>({ok:true,json:async()=>[{'@id':'train-1','dc:date':'2026-10-17T02:59:00Z',station:'previous'}]});
  assert.equal((await api.fetchODPT(url))[0].station,'A','older source time cannot pull train backwards');
  now+=30000;
  respond=async()=>({ok:false,status:503});
  await assert.rejects(api.fetchODPT(url),/503/);
  respond=async()=>({ok:true,json:async()=>[]});
  assert.equal((await api.fetchODPT(url)).length,0,'failure retries and confirmed empty removes old snapshot');
  now+=30000;
  respond=async()=>({ok:true,json:async()=>({error:'not a collection'})});
  await assert.rejects(api.fetchODPT(url),/Invalid ODPT/);
  api.startRealtimePolling();api.startRealtimePolling();
  assert.equal(intervals.length,2,'exactly one timer for each independent live resource');
  api.stopRealtimePolling();
  const stats=window.ODPTClient.getRequestMetrics();
  assert.equal(stats.joined,19);assert.equal(stats.staleRows,1);assert.equal(stats.failed,2);
  assert.equal(stats.cacheHits,1);
  const fixtures=JSON.parse(fs.readFileSync('tests/fixtures/guards/sql-har-contract.json','utf8'));
  for (const body of fixtures) {
    respond=async()=>({ok:true,json:async()=>body});
    const rows=await window.ODPTClient.getCachedTrainRuns(body.line_id);
    assert.equal(rows.length,1,body.line_id+' captured row reaches existing adapter');
    assert.equal(rows[0]._sqlLineId,body.line_id);
    assert.equal(rows[0]._serviceDate,body.service_date);
    if(body.partial) assert.equal(rows[0]._timetableCoverage,'partial');
  }
  respond=async()=>({ok:true,json:async()=>({...fixtures[0],line_id:'wrong'})});
  assert.equal((await window.ODPTClient.getCachedTrainRuns('invalid-line')).length,0);
  assert.equal(window.ODPTClient.getTrainRunStatus('invalid-line').source,'SOURCE_ERROR');
  now=Date.parse('2026-10-18T03:59:59+09:00');
  let finishOld;
  respond=()=>new Promise(resolve=>{finishOld=resolve;});
  const oldRequest=window.ODPTClient.getCachedTrainRuns('Boundary');
  now+=2000;
  const newBody={...fixtures[0],line_id:'Boundary',service_date:'2026-10-18',runs:[]};
  respond=async()=>({ok:true,json:async()=>newBody});
  await window.ODPTClient.getCachedTrainRuns('Boundary');
  finishOld({ok:true,json:async()=>({...newBody,service_date:'2026-10-17'})});
  await oldRequest;
  assert.equal(window.ODPTClient.getTrainRunStatus('Boundary').serviceDate,'2026-10-18','late old service day cannot replace current status');
  assert.equal(window.ODPTClient.getTrainRunStatus('Boundary').source,newBody.source);
  const detail={window:{ODPTClient:{LINE_TO_OPERATOR:{Test:'Fixture'},getTrainInformation(){return Promise.reject(new Error('offline'));}}},
    localStorage:{getItem(){return null;},setItem(){}},console};
  vm.runInNewContext(fs.readFileSync('js/runinfo-api.js','utf8'),detail);
  await assert.rejects(detail.window.RunInfoAPI.query('Test',{id:'Test',operator:'Fixture',status:'normal'}),/offline/,
    'detail consumer must preserve failure rather than cache local normal as a fresh official response');
  console.log('captured SQL contracts: '+fixtures.length+' lines; partial coverage and cross-line rejection PASS');
  console.log('runtime-request-contract: 20 consumers → 1 request; refresh windows, errors, retry, source version and independent timers PASS');
}
const watchdog = setTimeout(() => { console.error('request contract did not settle'); process.exit(1); }, 10000);
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>clearTimeout(watchdog));


// Resource initialization alone must preserve positions during information refresh.
const begin=source.indexOf('    function loadRealtimeData('),end=source.indexOf('        var ops =',begin);
const snapshot={JR:['existing-position']};
const setup={window:{ODPT_TRAIN_POSITIONS:snapshot},validateAuthoritativeRealtimeConfig(){}};
vm.runInNewContext(source.slice(begin,end)+'}',setup);
setup.loadRealtimeData(true);
assert.equal(setup.window.ODPT_TRAIN_POSITIONS,snapshot,'TrainInformation refresh must never clear the Train snapshot');
