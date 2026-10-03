/*
 * Pixel Tetsudo - Asakusa dated formation evidence
 * v4.3.1064
 * C-grade loo-ool observation snapshot. Date-scoped; never carry across dates.
 */
(function(){
"use strict";
var BASE="https://loo-ool.com/rail/MA/00/";
var rows={
 "2026-04-12":{
  "15H":["京急1000形","1161F"],"21H":["京急1000形","1201F"],
  "73H":["京急600形","607F"],"81H":["京急600形","601F"],"85H":["京急600形","603F"],
  "61H":["京急1500形","1713F"],
  "01K":["京成3100形","3154F"],"03K":["京成3100形","3152F / 3153F"],
  "05K":["京成3100形","3156F"],"07K":["京成3100形","3153F"],
  "09K":["京成3100形","3151F"],"11K":["京成3100形","3155F"],
  "51K":["京成3000形","3026F / 3037F"],"53K":["京成3000形","3001F"],
  "55K":["京成3000形","3001F"],"59K":["京成3000形","3052F"],
  "69K":["京成3400形","3448F"],"57K":["京成3700形","3758F"],
  "63K":["京成3700形","3868F"],"67K":["京成3700形","3798F"],
  "73K":["京成3700形","3728F"]
 }
};
function network(c){return /Asakusa|Keikyu|Keisei|Hokuso|浅草|京急|京成|北総/i.test([c.lineId,c.operator,c.railway,c.destinationStation].join("|"));}
function code(n){var m=String(n||"").toUpperCase().match(/(?:^|[^0-9])(\d{1,2})([KHN])(?:\([^)]*\))?$/);return m?String(parseInt(m[1],10)).padStart(2,"0")+m[2]:"";}
function resolveEvidence(n,c){
 c=c||{};var d=String(c.serviceDate||"").slice(0,10);if(!network(c)||!rows[d])return null;
 var o=code(n),r=rows[d][o];if(!r)return null;
 var owner=o.endsWith("H")?"Keikyu":o.endsWith("K")?"Keisei":"Hokuso";
 return {operator:owner,vehicleType:r[0],formationId:r[1],grade:"C",sourceUrl:BASE+d.replace(/-/g,"")+"/",provenance:"loo-ool dated Asakusa operation observation",observedDate:d,operationCode:o};
}
var p={id:"loo-ool-asakusa-dated-formations",grade:"C",sourceUrl:BASE,resolveEvidence:resolveEvidence};
if(window.TrainOperationEvidence&&typeof window.TrainOperationEvidence.register==="function")window.TrainOperationEvidence.register(p);
else (window.TRAIN_OPERATION_EVIDENCE_PROVIDERS||(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS=[])).push(p);
})();