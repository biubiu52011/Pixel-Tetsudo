(function(){"use strict";
function tr(k,f){try{var v=typeof window.t==="function"?window.t(k):"";return v||f;}catch(e){return f;}}
function label(op){try{if(typeof window.tOp==="function"){var translated=window.tOp(op);if(translated&&translated!==op)return translated;}return window.TransitConstants&&typeof window.TransitConstants.operatorLabel==="function"?window.TransitConstants.operatorLabel(op):op;}catch(e){return op;}}
function sort(ops){var fallback=(ops||[]).slice().sort();try{var ordered=window.LinePresentationService&&typeof window.LinePresentationService.orderOperators==="function"?window.LinePresentationService.orderOperators(ops):null;return Array.isArray(ordered)&&ordered.length===fallback.length?ordered:fallback;}catch(e){return fallback;}}
function operators(lines){var found={};if(Array.isArray(lines)){lines.forEach(function(l){if(l&&l.operator)found[l.operator]=true;});}else{Object.keys(lines||{}).forEach(function(id){var l=lines[id];if(l&&l.operator)found[l.operator]=true;});}return sort(Object.keys(found));}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function create(containerOrId,opts){opts=opts||{};var el=typeof containerOrId==="string"?document.getElementById(containerOrId):containerOrId;var selected=opts.selected||null;
 function available(v){if(!el)return;el.classList.toggle("hidden",!v);el.setAttribute("aria-hidden",v?"false":"true");}
 function select(v,notify){selected=v||null;if(el)Array.prototype.slice.call(el.querySelectorAll(".rs-filter-btn")).forEach(function(b){var on=(b.dataset.operator||null)===selected;b.classList.toggle("active",on);b.setAttribute("aria-pressed",on?"true":"false");});if(notify!==false&&el){try{el.dispatchEvent(new CustomEvent("pt:operator-filter-change",{detail:{operator:selected}}));}catch(e){}}return selected;}
 function render(lines){if(!el)return;var availableOps=operators(lines);if(!availableOps.length){var groups=document.querySelectorAll(".rs-line-list-content .rs-operator-group[data-operator]");var found={};Array.prototype.forEach.call(groups,function(g){var op=g.getAttribute("data-operator");if(op)found[op]=true;});availableOps=sort(Object.keys(found));}if(!availableOps.length){available(false);return;}available(true);var html='<button type="button" class="rs-filter-btn'+(selected===null?' active':'')+'" data-operator="" aria-pressed="'+(selected===null?'true':'false')+'">'+tr("filter.all","All")+"</button>";availableOps.forEach(function(op){html+='<button type="button" class="rs-filter-btn'+(selected===op?' active':'')+'" data-operator="'+esc(op)+'" aria-pressed="'+(selected===op?'true':'false')+'">'+label(op)+"</button>";});el.innerHTML=html;Array.prototype.slice.call(el.querySelectorAll(".rs-filter-btn")).forEach(function(b){b.addEventListener("click",function(){select(b.dataset.operator||null,true);});});}
 return{render:render,setAvailable:available,setSelected:select,getSelected:function(){return selected;},getElement:function(){return el;}};}
var mounted={};
function mount(id,opts){if(mounted[id])return mounted[id];var instance=create(id,opts||{});mounted[id]=instance;return instance;}
function get(id){return mounted[id]||null;}
function autoMount(){
 var page=document.body&&document.body.dataset?document.body.dataset.page:"";
 var id=page==="realtime"?"realtimeFilterBar":page==="trains"?"trainsFilterBar":null;
 if(id&&document.getElementById(id))mount(id,{});
}
window.OperatorFilterBar={create:create,mount:mount,get:get,operatorsFromLines:operators};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",autoMount);else autoMount();
})();