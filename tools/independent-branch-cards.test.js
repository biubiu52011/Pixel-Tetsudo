const fs=require('fs'),vm=require('vm'),assert=require('assert');
const db=JSON.parse(fs.readFileSync('data/core/railway_data.json','utf8'));
const ctx={window:{UNIFIED_LINES:db.lines,currentLang:'ja',innerWidth:390,addEventListener:()=>{},
 RailwayDB:{getAllLines:()=>db.lines,resolveLineName:id=>db.lines[id]?.nameJa||id,resolveStationName:id=>id}},
 document:{addEventListener:()=>{},getElementById:()=>null,querySelectorAll:()=>[]},console};
ctx.window.t=k=>k;ctx.window.tOp=x=>x;
vm.createContext(ctx);
for(const f of ['data/core/runtime-config.js','js/line-presentation-service.js','js/line-card.js','js/data-state.js','js/trains-config.js','js/trains-utils.js','js/trains-data.js','js/through-chip.js','js/trains-geometry.js','js/trains-render.js'])
 vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
ctx.GEOM=ctx.window.GEOM;
const branches=Object.entries(db.lines).filter(([id,l])=>l.branchOf);
const internal=['SuigunBranch','MarunouchiBranch','ChiyodaBranch','ChuoTatsuno','TsurumiUmiShibaura','TsurumiOkawa','NaritaAbikoBranch','NaritaAirportBranch','NambuBranch'];
for(const mode of ['trains','realtime']){
 const host={innerHTML:'',querySelectorAll:()=>[]};
 ctx.window.DataState.renderList(host,db.lines,{mode});
 for(const [id]of branches){
  const count=(host.innerHTML.match(new RegExp('class="rs-line-card[^"]*" data-line="'+id+'"','g'))||[]).length;
  assert.equal(count,internal.includes(id)?0:1,id+' card scope in '+mode);
 }
}
const base={};for(const [id]of branches)base[id]=[{trainId:id,stationIndex:1}];
for(const [id,l]of branches)base[l.branchOf]=[{trainId:l.branchOf,stationIndex:1}];
ctx.window.DataFusion={getFusedData:()=>({lines:db.lines}),getRealtimePositions:id=>base[id]||[]};
for(const [id,l]of branches){
 const g=ctx.computeRouteGeometry(db.lines[l.branchOf],l.branchOf);
 const inParent=internal.includes(id);
 assert.equal(g.branchLines.some(b=>b.id===id),inParent,id+' diagram ownership');
 assert.equal(ctx.getRealtimePositions(l.branchOf).some(p=>p.trainId===id),inParent,id+' train ownership');
 assert(ctx.getRealtimePositions(id).some(p=>p.trainId===id),id+' retains its source identity');
 if(inParent){
  const coords=g.branchGeom[id];
  assert.equal(coords.length,l.stations.length);
  l.stations.forEach((sid,i)=>assert.equal(coords[i].stationId,sid,id+' source index '+i));
 }
}
assert(!ctx.computeRouteGeometry(db.lines.KyushuShinkansen,'KyushuShinkansen').branchLines.some(b=>b.id==='NishiKyushuShinkansen'));
assert.deepEqual(Array.from(db.lines.MarunouchiBranch.stations),['Nakano-Sakaue','Nakano-Shimbashi','Nakano-fujimicho','Honancho']);
assert(!db.stationLines['Nishi-Shinjuku-Gochome'].includes('MarunouchiBranch'));
function svgNode(){return {attrs:{},children:[],style:{},handlers:{},setAttribute(k,v){this.attrs[k]=v;},appendChild(n){this.children.push(n);},addEventListener(k,f){this.handlers[k]=f;}};}
ctx.document.createElementNS=svgNode;const layer=svgNode();ctx.window.location={hash:''};
ctx.window.ThroughChip.render(layer,'svg',0,0,{lineId:'KeikyuAirport',name:'空港線'},16,false,148);
const node=layer.children[0];
assert.equal(node.handlers.click,undefined,'through labels are display-only');
assert.equal(node.handlers.keydown,undefined,'display-only labels are not keyboard links');
assert.equal(node.attrs.role,undefined);
assert.equal(node.attrs.tabindex,undefined);
assert.equal(ctx.window.location.hash,'','rendering must not navigate');
assert(node.children.some(n=>n.children&&n.children.some(t=>t.textContent==='空港線')),'through-line name remains visible');
console.log('Branch presentation scope: 9 internal branches in parent, 9 official lines independent, canonical indices and display-only through labels: PASS');
