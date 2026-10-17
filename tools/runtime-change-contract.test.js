const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('js/data-fusion.js','utf8');
const a=src.indexOf('  function classifyPositionChanges('),b=src.indexOf('  function emitUpdate(',a);
const c={_positionIdentity:p=>p.trainId};vm.createContext(c);vm.runInContext(src.slice(a,b),c);
const original={trainId:'r1',stationIndex:0,segmentToIndex:1,segmentProgress:.25,sourceUpdatedAt:'old',sourceValidUntil:'old'};
function diff(before,after){return JSON.parse(JSON.stringify(c.classifyPositionChanges(before,after)));}
assert.deepEqual(diff([original],[{...original}]),{position:false,display:false,metadata:false});
assert.deepEqual(diff([original],[{...original,sourceUpdatedAt:'new',sourceValidUntil:'new'}]),{position:false,display:false,metadata:true});
assert.equal(diff([original],[{...original,segmentProgress:.5}]).position,true);
assert.equal(diff([original],[{...original,vehicleIconPath:'new.png'}]).display,true);
const second={...original,trainId:'r2'};
assert.deepEqual(diff([original,second],[second,original]),{position:false,display:false,metadata:false},'source order is not movement');
assert.equal(diff([original],[]).position,true,'removed train is a position change');
// The existing DataState propagates the event without becoming a new state owner.
const state={window:{},document:{readyState:'loading',addEventListener(){},querySelectorAll(){return[];}}};
vm.runInNewContext(fs.readFileSync('js/data-state.js','utf8'),state);
let delivered;state.window.DataState.subscribe((lines,delay,pos,event)=>{delivered=event;});
const event={kind:'positions',lines:{Test:{position:false,display:false,metadata:true}}};
state.window.DataState.setLines({Test:{}},event);assert.equal(delivered,event);
const page=fs.readFileSync('js/trains-page.js','utf8');
const hash=page.slice(page.indexOf("var posHash = ''"),page.indexOf('var detailStateHash'));
assert(!hash.includes('_tp.sourceUpdatedAt'),'metadata must not invalidate the movement hash');
assert(!hash.includes('_tp.sourceValidUntil'),'expiry is scheduled separately');
assert(hash.includes('_scheduleRealtimeExpiryRefresh'),'metadata must renew the expiry schedule');
console.log('runtime change contract: no-op/reorder, metadata, movement, display, removal and DataState propagation PASS');

// Repeated foreground transitions must retain one official-web listener/timer.
const web=fs.readFileSync('js/runinfo-web.js','utf8');
let handlers=[],starts=0,stops=0;
const lifecycle={_timer:null,REFRESH_INTERVAL_MS:300000,refreshAllIfStale(){},
 document:{hidden:false,addEventListener(name,fn){handlers.push(fn);}},
 setInterval(){starts++;return starts;},clearInterval(){stops++;}};
vm.createContext(lifecycle);
vm.runInContext(web.slice(web.indexOf('  var _visibilityBound'),web.indexOf('  function refreshAllIfStale()')),lifecycle);
lifecycle.startPolling();lifecycle.startPolling();
for(let i=0;i<10;i++){lifecycle.document.hidden=true;handlers[0]();lifecycle.document.hidden=false;handlers[0]();}
assert.equal(handlers.length,1);assert.equal(starts,11);assert.equal(stops,10);
console.log('official web lifecycle: 10 foreground cycles retain one listener and one timer PASS');
