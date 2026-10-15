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
entries.forEach(e=>{assert.equal(e.children[0].tagName,'img');assert(e.textContent.includes('普通 · 开往 成田'));assert.equal(e.children[1].children[1].textContent,'晚点 2 分 · 推定位置','passenger details exclude train numbers');assert(!e.textContent.includes('SQL'));});
markers.b._trainPosition.destinationStation='上野';delete markers.c;layer._refreshTrainFoldPopover();
assert.equal(list.children.length,2);assert(list.textContent.includes('上野'));assert(!list.textContent.includes('internal'));
markers.b._trainPosition.typeName='JR-East.Rapid';markers.b._trainPosition.trainType='Rapid';layer._refreshTrainFoldPopover();
assert(list.textContent.includes('快速 · 开往 上野'));assert(!list.textContent.includes('JR-East.Rapid'),'raw ODPT type code is not passenger information');
markers.a._trainPosition.estimated=false;markers.a._trainPosition.delayMin=0;layer._refreshTrainFoldPopover();
assert.equal(list.children[0].children[1].children.length,1,'no empty metadata row for an on-time live train');
panel.listeners.keydown({key:'Escape',stopPropagation(){}});
assert.equal(layer._trainFoldPopover,null);assert(anchor.focused);
assert(!body.classList.locked);
popupctx.open(layer,ids,groups,markers,anchor);delete markers.a;delete markers.b;layer._refreshTrainFoldPopover();
assert.equal(layer._trainFoldPopover,null,'departed trains cannot survive as stale popup rows');
// The shared language outside-click handler must not steal modal focus.
const language=fs.readFileSync('js/lang-init.js','utf8');
const closeStart=language.indexOf('    function closeSwitcher('),closeEnd=language.indexOf('    function selectLanguage',closeStart);
let expanded=false,focuses=0;
const toggle={setAttribute(){},focus(){focuses++;}},switcher={classList:{contains:()=>expanded,remove:()=>{expanded=false;}}};
const languageCtx={document:{getElementById:id=>id==='langSwitcher'?switcher:toggle}};
vm.runInNewContext(language.slice(closeStart,closeEnd)+'this.close=closeSwitcher;',languageCtx);
languageCtx.close();assert.equal(focuses,0,'an already closed language menu cannot steal dialog focus');
expanded=true;languageCtx.close(false);assert.equal(focuses,0,'outside clicks keep focus on the clicked control');
expanded=true;languageCtx.close();assert.equal(focuses,1,'explicit language-menu close still restores its button');
// Chuo-Sobu timetable positions must not silently become a guessed model/icon.
const titleStart=source.indexOf('  function _trainMarkerTitle(p, lineId) {');
const titleEnd=source.indexOf('  // SVG image title attributes',titleStart);
assert(titleStart>=0&&titleEnd>titleStart,'marker tooltip function exists');
const tooltipCtx={window:{currentLang:'zh',TRAIN_TYPE_NAMES:{}}};
vm.runInNewContext(source.slice(titleStart,titleEnd)+'\nthis.markerTitle=_trainMarkerTitle;',tooltipCtx);
const missing=tooltipCtx.markerTitle({
  trainNumber:'721B',estimated:true,positionSource:'supabase-train-run',
  vehicleIdentityStatus:'UNKNOWN',vehicleIdentityReason:'no-vehicle-evidence'
},'ChuoSobuLocal');
assert(missing.includes('时刻表未提供可核验的车型'),'missing evidence is described, not invented');
assert(!missing.includes('E231')&&!missing.includes('E235'),'unknown train stays model-agnostic');
const narrowed=tooltipCtx.markerTitle({
  trainNumber:'805B',vehicleIdentityStatus:'NARROWED',
  vehicleCandidates:['E231系0番台','E231系500番台']
},'ChuoSobuLocal');
assert(narrowed.includes('车型候选（尚未确认）')&&narrowed.includes('E231系0番台')&&narrowed.includes('E231系500番台'),
  'narrowed status retains all candidates, not an arbitrary concrete identity');
const exact=tooltipCtx.markerTitle({
  trainNumber:'805B',vehicleIdentityStatus:'EXACT',vehicleType:'E231系500番台'
},'ChuoSobuLocal');
assert(exact.includes('E231系500番台')&&!exact.includes('候选'),'sourced exact identity remains unchanged');
tooltipCtx.window.currentLang='ja';
assert(tooltipCtx.markerTitle({estimated:true,positionSource:'supabase-train-run',
  vehicleIdentityStatus:'UNKNOWN'},'ChuoSobuLocal').includes('確認済み車両形式なし'),
  'Japanese text also distinguishes missing evidence');

console.log('paired train layout, direction isolation, passenger modal and current-data refresh: PASS');
