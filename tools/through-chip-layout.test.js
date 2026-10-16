const fs=require('fs'),vm=require('vm'),assert=require('assert');
const db=JSON.parse(fs.readFileSync('data/core/railway_data.json','utf8'));
class Node {
 constructor(tag){this.tagName=tag;this.attrs={};this.children=[];this.style={};this.listeners={};}
 addEventListener(k,f){this.listeners[k]=f;}
 setAttribute(k,v){this.attrs[k]=String(v);}getAttribute(k){return this.attrs[k];}
 appendChild(n){this.children.push(n);return n;}
}
let checked=0;
for(const mobile of [true,false]){
 const ctx={window:{innerWidth:mobile?390:1000,currentLang:'ja',UNIFIED_LINES:db.lines,
  RailwayDB:{getAllLines:()=>db.lines,resolveLineName:id=>db.lines[id]?.nameJa||id,
   resolveStationName:id=>db.name_map[id]?.ja||id}},document:{createElementNS:(_ns,tag)=>new Node(tag)}};
 ctx.window.t=()=> '直通';
 vm.createContext(ctx);
 for(const f of ['data/core/runtime-config.js','js/trains-config.js','js/trains-utils.js','js/trains-data.js','js/through-chip.js','js/trains-geometry.js','js/trains-render.js'])
  vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
 ctx.GEOM=ctx.window.GEOM;
 for(const [id,line]of Object.entries(db.lines)){
  if(!(line.serviceBoundaries||[]).length)continue;
  const map=ctx._getTransferMap(id),g=ctx.computeRouteGeometry(line,id),layer=new Node('g');
  for(let si=0;si<g.stationCoords.length;si++){
   const p=g.stationCoords[si];if(!(map[p.stationId]||[]).some(x=>x.through))continue;
   const stationLayer=new Node('g');
   ctx._renderStationNode(stationLayer,'svg',{...p,si,stationId:p.stationId,color:line.color,
    geometry:g,isMobileView:mobile,svgW:g.svgW,svgH:g.svgH,
    transferMap:map,stationCoords:g.stationCoords,rS:x=>x});
   const boxes=stationLayer.children.filter(n=>n.attrs.class==='through-chip').map(n=>{
    const [x,y]=n.attrs.transform.match(/[-\d.]+/g).map(Number),r=n.children.find(x=>x.tagName==='rect');
    const text=n.children.find(x=>x.tagName==='text');
    assert(!text.children.map(x=>x.textContent).join('').includes('直通相鉄線直通'),'duplicate prefix');
    return{x,y,w:+r.attrs.width,h:+r.attrs.height};
   });
   for(const b of boxes){
    assert(b.x>=1&&b.x+b.w<=g.svgW-1,id+' horizontal bounds');
    assert(b.y>=0&&b.y+b.h<=g.svgH,id+' vertical bounds at '+p.stationId);
    if(g.isLoop){
     const label=stationLayer.children.find(n=>n.tagName==='text');
     const tx=+label.attrs.x,anchor=label.attrs['text-anchor'];
     const natural=anchor==='end'?tx-b.w:anchor==='start'?tx:tx-b.w/2;
     const expected=Math.max(2,Math.min(g.svgW-2-b.w,natural));
     assert(Math.abs(b.x-expected)<1,id+' loop label follows station-name column with viewport clamp');
    }
   }
   for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
    const a=boxes[i],b=boxes[j];
    assert(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y,id+' through labels overlap');
   }
   checked+=boxes.length;layer.children.push(...stationLayer.children);
  }
 }
 const narrow=ctx._throughChipSize({name:'阪和線'},mobile,69);
 assert(narrow.lines.join('')==='阪和線','complete name retained');
 const connector=ctx._throughChipSize({name:'相鉄線直通（JR接続区間）'},mobile,148);
 assert.equal((connector.label.match(/直通/g)||[]).length,0);
}
console.log('All canonical station-owned through labels: '+checked+' boxes, bounds, station-center anchors, no overlap: PASS');
