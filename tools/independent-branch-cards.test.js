const fs=require('fs'),vm=require('vm'),assert=require('assert');
const db=JSON.parse(fs.readFileSync('data/core/railway_data.json','utf8'));
const ctx={window:{UNIFIED_LINES:db.lines,currentLang:'ja',innerWidth:390,addEventListener:()=>{},
 RailwayDB:{getAllLines:()=>db.lines,resolveLineName:id=>db.lines[id]?.nameJa||id,resolveStationName:id=>id}},
 document:{addEventListener:()=>{},getElementById:()=>null,querySelectorAll:()=>[]},console};
ctx.window.t=k=>k;ctx.window.tOp=x=>x;
vm.createContext(ctx);
for(const f of ['data/core/runtime-config.js','js/line-presentation-service.js','js/line-card.js','js/data-state.js','js/trains-config.js','js/trains-utils.js','js/trains-data.js','js/trains-geometry.js','js/trains-render.js'])
 vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
ctx.GEOM=ctx.window.GEOM;
const branches=Object.entries(db.lines).filter(([id,l])=>l.branchOf);
for(const mode of ['trains','realtime']){
 const host={innerHTML:'',querySelectorAll:()=>[]};
 ctx.window.DataState.renderList(host,db.lines,{mode});
 for(const [id]of branches){
  assert.equal((host.innerHTML.match(new RegExp('class="rs-line-card[^"]*" data-line="'+id+'"','g'))||[]).length,1,id+' must own exactly one card in '+mode);
 }
 assert(!host.innerHTML.includes('rs-branch-chip'),'no nested branch pills');
}
const base={};for(const [id]of branches)base[id]=[{trainId:id,stationIndex:1}];
for(const [id,l]of branches)base[l.branchOf]=[{trainId:l.branchOf,stationIndex:1}];
ctx.window.DataFusion={getFusedData:()=>({lines:db.lines}),getRealtimePositions:id=>base[id]||[]};
for(const [id,l]of branches){
 assert.equal(ctx.window.LinePresentationService.getMapBranchIds(l.branchOf,db.lines).length,0);
 const g=ctx.computeRouteGeometry(db.lines[l.branchOf],l.branchOf);
 assert.equal(g.branchLines.length,0,l.branchOf+' must not expand branches');
 assert(!ctx.getRealtimePositions(l.branchOf).some(p=>p.trainId===id),id+' must not leak into parent map');
 assert(ctx.getRealtimePositions(id).some(p=>p.trainId===id),id+' keeps its own train');
 const own=ctx.computeRouteGeometry(l,id);assert.equal(own.stationCoords.length,l.stations.length,id+' standalone station count');
 const shared=l.stations.filter(s=>db.lines[l.branchOf].stations.includes(s));
 if(shared.length===1){
  const parentMap=ctx._getTransferMap(l.branchOf);
  assert((parentMap[shared[0]]||[]).some(x=>x.lineId===id),id+' keeps connection entry');
 }
}
const node={attrs:{},style:{},handlers:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,f){this.handlers[k]=f;}};
ctx.window.location={hash:''};
ctx._bindLineMapNavigation(node,{lineId:'KeikyuAirport',name:'空港線'});
node.handlers.click({});assert.equal(ctx.window.location.hash,'KeikyuAirport');
ctx.window.location.hash='';node.handlers.keydown({key:'Enter'});assert.equal(ctx.window.location.hash,'KeikyuAirport');
assert.equal(node.attrs.role,'link');
console.log('Independent '+branches.length+' branches: both card lists, own station/train scope, parent connections, keyboard navigation: PASS');
