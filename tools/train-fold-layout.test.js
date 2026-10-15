const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('js/train-track-layout.js','utf8'),ctx);
const api=ctx.window.TrainTrackLayout;
for(const line of ['ChuoRapid','Joban','JobanMain']){
 const trains=Array.from({length:15},(_,i)=>({trainId:line+i,stationIndex:1,segmentToIndex:2,segmentProgress:.3,railDirection:'Outbound'}));
 const coords=[{x:150,y:20},{x:150,y:90},{x:150,y:160}];
 const anchors=api.resolveAll(trains,coords,{},line,{});
 assert(anchors.every(x=>x.x===anchors[0].x),'one direction lane; no lateral slots');
 const labels=anchors.map((x,i)=>({id:trains[i].trainId,x:x.x-24,y:x.y-9,width:48,height:50,foldKey:'down'}));
 const bounds={x:0,y:0,width:300,height:300};
 const out=api.resolveLabels(labels,[],bounds,{maxShift:72});
 const visible=labels.filter(x=>!out[x.id].collapsedInto),hidden=labels.filter(x=>out[x.id].collapsedInto);
 assert(hidden.length>0,'dense group must fold');
 assert.equal(visible.length+hidden.length,15,'folding retains every identity');
 visible.forEach(x=>{assert.equal(out[x.id].x,0);assert(Math.abs(out[x.id].y)<=72);});
 hidden.forEach(x=>assert(visible.some(v=>v.id===out[x.id].collapsedInto),'fold parent must be visible'));
 for(let i=0;i<visible.length;i++)for(let j=i+1;j<visible.length;j++)
  assert(Math.abs((visible[i].y+out[visible[i].id].y)-(visible[j].y+out[visible[j].id].y))>=54);
 assert.equal(JSON.stringify(out),JSON.stringify(api.resolveLabels(labels.slice().reverse(),[],bounds,{maxShift:72})),'poll order stable');
}
const opposite=[{id:'down',x:60,y:60,width:40,height:40,foldKey:'down'},{id:'up',x:60,y:60,width:40,height:40,foldKey:'up'}];
const out=api.resolveLabels(opposite,[],{x:0,y:0,width:200,height:100},{maxShift:10});
assert(!out.up.collapsedInto,'opposite directions do not fold together');

const source=fs.readFileSync('js/trains-render.js','utf8');
const start=source.indexOf('  function _openTrainFoldList'),end=source.indexOf('  // v4.3.454:',start);
class Node {
 constructor(tag){this.tagName=tag;this.attrs={};this.children=[];this.listeners={};this.style={};this.isConnected=true;}
 setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k]||null;}
 appendChild(x){this.children.push(x);x.parentNode=this;}
 addEventListener(k,f){this.listeners[k]=f;} remove(){this.removed=true;}
 focus(){this.focused=true;}contains(x){return this===x||this.children.some(c=>c.contains(x));}
 querySelector(s){return s==='title'?this.title:null;}
 querySelectorAll(){return [];} cloneNode(){const n=new Node(this.tagName);n.textContent=this.textContent;return n;}
 dispatchEvent(){this.selected=true;}
 set textContent(v){this.text=v;this.children=[];}get textContent(){return (this.text||'')+this.children.map(c=>c.textContent||'').join('');}
}
const body=new Node('body');body.classList={add(){this.locked=true;},remove(){this.locked=false;}};
const document={body,querySelector:()=>body.children.find(n=>!n.removed&&n.className.includes('rs-modal active')),createElement:t=>new Node(t)};
const popupctx={document,window:{currentLang:'zh',TRAIN_TYPE_NAMES:{Rapid:{zh:'快速',ja:'快速'}}},_resolveStationLoose:s=>s};
vm.runInNewContext(source.slice(start,end)+'\nthis.open=_openTrainFoldList;',popupctx);
const ids=['a','b','c'],groups={},markers={};
ids.forEach(id=>{groups[id]=new Node('g');markers[id]=new Node('image');markers[id].setAttribute('data-train-id',id);markers[id].setAttribute('href','train.png');markers[id].title={textContent:'SQL evidence internal model'};markers[id]._trainPosition={destinationStation:'成田',trainNumber:id,typeName:'普通',estimated:true,delayMin:2};});
const anchor=new Node('g');anchor.getBoundingClientRect=()=>({x:100,y:120,width:34,bottom:136});
const layer={isConnected:true,querySelectorAll:()=>Object.values(markers)};popupctx.open(layer,ids,groups,markers,anchor);
const panel=layer._trainFoldPopover,list=panel.children[0].children[1],entries=list.children;
assert.equal(panel.getAttribute('aria-modal'),'true');assert(body.classList.locked);
assert.equal(entries.length,3);
entries.forEach(e=>{assert.equal(e.children[0].tagName,'img');assert(e.textContent.includes('普通 · 开往 成田'));assert(e.textContent.includes('晚点 2 分'));assert(!e.textContent.includes('SQL'));});
markers.b._trainPosition.destinationStation='上野';delete markers.c;layer._refreshTrainFoldPopover();
assert.equal(list.children.length,2);assert(list.textContent.includes('上野'));assert(!list.textContent.includes('internal'));
markers.b._trainPosition.typeName='JR-East.Rapid';markers.b._trainPosition.trainType='Rapid';layer._refreshTrainFoldPopover();
assert(list.textContent.includes('快速 · 开往 上野'));assert(!list.textContent.includes('JR-East.Rapid'),'raw ODPT type code is not passenger information');
panel.listeners.keydown({key:'Escape',stopPropagation(){}});
assert.equal(layer._trainFoldPopover,null);assert(anchor.focused);
assert(!body.classList.locked);
popupctx.open(layer,ids,groups,markers,anchor);delete markers.a;delete markers.b;layer._refreshTrainFoldPopover();
assert.equal(layer._trainFoldPopover,null,'departed trains cannot survive as stale popup rows');
console.log('paired train layout, direction isolation, passenger modal and current-data refresh: PASS');
