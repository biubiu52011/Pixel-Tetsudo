const fs=require('fs'),vm=require('vm'),assert=require('assert');
const read=f=>fs.readFileSync(f,'utf8');
const estimator=read('js/train-position-estimator.js');
const line={id:'Test',operator:'JR-East',stations:['A','B','C','D']};
const station=s=>'odpt.Station:JR-East.Test.'+s;
const stop=(s,a,d)=>({'odpt:arrivalStation':station(s),'odpt:departureStation':station(s),'odpt:arrivalTime':a,'odpt:departureTime':d});
function timetable(dest,stops){return {'@id':'fixture','odpt:trainNumber':'101','odpt:railway':'odpt.Railway:JR-East.Test','odpt:railDirection':'Outbound','odpt:destinationStation':[station(dest)],'odpt:trainTimetableObject':stops};}
function at(tt,h,m,extra={},delay={}){
 const fixed=Date.UTC(2026,9,15,h-9,m);
 class Clock extends Date{constructor(...args){super(...(args.length?args:[fixed]));}static now(){return fixed;}}
 const ctx={window:{RuntimeConfig:{}},Date:Clock,console:{debug(){}}};vm.runInNewContext(estimator,ctx);
 return ctx.window.TrainPositionEstimator.estimateLinePositions('Test',{...line,...extra},[tt],delay,'JR-East',{Test:line});
}
const overrun=timetable('B',[stop('A',null,'10:00'),stop('B','10:10','10:11'),stop('C','10:20','10:21'),stop('D','10:30',null)]);
assert.equal(at(overrun,10,5).length,1);
assert.equal(at(overrun,10,10)[0].stationIndex,1);
assert.equal(at(overrun,10,11).length,0,'destination arrival ends the positioning service');
assert.equal(at(overrun,10,25).length,0,'later imported stops cannot extend the advertised run');
assert.equal(overrun['odpt:trainTimetableObject'].length,4,'source evidence is not mutated');
assert.equal(at(JSON.parse(JSON.stringify(overrun)),10,25,{type:'loop'}).length,1,'a loop segment is not a linear terminal service');
const reverse=timetable('C',[stop('D',null,'10:00'),stop('C','10:10','10:11'),stop('B','10:20',null)]);
assert.equal(at(reverse,10,11).length,0,'terminal bound also applies in reverse direction');
const truncated=timetable('D',[stop('A',null,'10:00'),stop('B','10:10',null)]);
assert.equal(at(truncated,10,15).length,0,'a distant destination cannot manufacture missing passage times');
const untimed=timetable('B',[stop('A',null,'10:00'),stop('B',null,null),stop('C','10:20',null)]);
assert.equal(at(untimed,10,5).length,0,'untimed terminus must not retain a train indefinitely');
const branch=timetable('D',[stop('A',null,'10:00'),stop('Branch','10:10','10:11'),stop('C','10:20','10:21'),stop('D','10:30',null)]);
assert.equal(at(branch,10,15).length,0,'unknown branch cannot bridge through the displayed mainline');
assert.equal(at(branch,10,20)[0].stationIndex,2,'a published later arrival may reenter the view');
const overnight=timetable('B',[stop('A',null,'23:55'),stop('B','24:10','24:11'),stop('C','24:20',null)]);
assert.equal(at(overnight,0,5).length,1);assert.equal(at(overnight,0,11).length,0);

// Exercise the actual merge block: an exact source observation owns position,
// while ambiguous timetables must not supply a chain or destination identity.
const ctx={window:{},console:{debug(){}}};vm.runInNewContext(read('js/running-chain-resolver.js'),ctx);
const resolver=ctx.window.RunningChainResolver;
const live={trainNumber:'101',serviceDate:'2026-10-15',railDirection:'Outbound',sourceRailway:'odpt.Railway:JR-East.Test'};
const fusion=read('js/data-fusion.js'),start=fusion.indexOf('              function _sameLineNumberKey'),end=fusion.indexOf('              estCount += _addN;',start);
function merge(est,observed=[live]){
 const c={window:{RunningChainResolver:resolver},lid:'Test',_est:est,posMap:{Test:observed.slice()},mayUseTimetableEstimate:()=>true,_chainBridgeKey:resolver.scheduledMatchKey,_positionIdentity:p=>p.id||''};
 vm.runInNewContext(fusion.slice(start,end),c);return c.posMap.Test;
}
assert.equal(merge([{...live,id:'sql1',estimated:true},{...live,id:'sql2',estimated:true}]).length,1);
assert.equal(merge([{...live,sourceRailway:'odpt.Railway:Other.Test',estimated:true}]).length,2,'railway namespaces never collapse');
assert.equal(merge([{...live,serviceDate:'2026-10-14',estimated:true}]).length,2,'service days never collapse');
assert.equal(merge([{...live,railDirection:'Inbound',estimated:true}]).length,2,'opposite directions never collapse');
assert.equal(merge([{...live,estimated:true}], [{...live,estimated:true}]).length,1,'existing identical schedule guard still applies');
assert.equal(resolver.sourcePositionMatchKey('Test',{...live,sourceRailway:''}),'','missing provenance cannot claim source precedence');

// Run TWO real renderer animation blocks in one function-scoped loop. Queued
// callbacks must keep each icon, caption, position and RAF owner together.
const render=read('js/trains-render.js');
const a=render.indexOf('          (function(_icon, trainUid'),b=render.indexOf('\n        }\n      } else {',a);
assert(a>0&&b>a);
let queue=[],labels={},icons=[{},{}];
const anim={icons,trainLayer:{},svgNS:'svg',lineId:'Test',isLoop:false,performance:{now:()=>0},
 requestAnimationFrame:fn=>(queue.push(fn),queue.length),
 _syncTrainLabels:(l,ns,id,x,y,p)=>{labels[id]={x,y,p};},
 _moveTrainLabels:(l,id,x,y,p)=>{labels[id]={x,y,p};},
 _setTrainIconPosition:(icon,x,y,p)=>{icon.actual={x,y,p};},_resolveTrainLabelCollisions:()=>{}};
vm.runInNewContext('for(var i=0;i<2;i++){var existingIcon=icons[i],trainUid="t"+i,p={trainNumber:trainUid},_startX=i*20,_startY=i*100,_targetX=_startX,_targetY=_startY+40,_targetIdx=i,_targetNextIdx=i+1,_targetRoutePos=NaN,_useLoopRoute=false,_startRoutePos=0,_routeDiff=0,_loopRect=null,_dx=0,_dy=40,_distance=40;'+render.slice(a,b)+'}',anim);
let pending=queue;queue=[];pending.forEach(fn=>fn(700));
assert.equal(icons[0].actual.y,20);assert.equal(icons[1].actual.y,120);
assert.equal(labels.t0.y,20);assert.equal(labels.t1.y,120);
pending=queue;queue=[];pending.forEach(fn=>fn(1400));
icons.forEach((icon,i)=>{assert.equal(icon.actual.y,i*100+40);assert.equal(icon.actual.p.trainNumber,'t'+i);assert.equal(icon._moveRaf,0);assert.equal(icon._displayNextStationIdx,i+1);});
const gateStart=render.indexOf('  function _resolveTrainLabelCollisions('),gateEnd=render.indexOf('    var matrix =',gateStart);
const moving=[{_moveRaf:1},{_moveRaf:2}],layer={ownerSVGElement:{},querySelectorAll:()=>moving};
const gate={window:{TrainTrackLayout:{resolveLabels(){}}}};
vm.runInNewContext(render.slice(gateStart,gateEnd)+'return true;} this.resolve=_resolveTrainLabelCollisions;',gate);
assert.equal(gate.resolve(layer,100),undefined,'first moving marker cannot lay out stale peers');
moving[0]._moveRaf=0;
assert.equal(gate.resolve(layer,100),true,'last marker lays out the complete frame, including a peer just finished');
assert.equal(gate.resolve(layer,100),undefined,'one layout pass per complete frame');
assert.equal(gate.resolve(layer,200),true,'remaining single animation continues to get layout');
console.log('terminal bounds, no fabricated extension, scoped live precedence and simultaneous marker/caption animation: PASS');
