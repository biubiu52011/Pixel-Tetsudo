/*
 * Pixel Tetsudo - single-fleet ordinary line structural evidence
 * v4.3.1069
 *
 * B-grade structural fleet constraints. These lines have one current passenger
 * vehicle family in normal service, so line identity is sufficient for model
 * identity. This is model-exact, never formation-exact.
 */
(function(){
"use strict";
var EFFECTIVE="2026-03-14";
var rules=[
 {re:/TokyuSetagaya|Setagaya|世田谷/i,operator:"TOKYU",vehicleType:"東急300系",sourceUrl:"https://www.tokyu.co.jp/railway/data/train_info/setagaya.html"},
 {re:/TokyuKodomonokuni|Kodomonokuni|こどもの国/i,operator:"YokohamaMinatomiraiRailway",vehicleType:"横浜高速鉄道Y000系",sourceUrl:"https://www.mm21railway.co.jp/info/route/kodomonokuni.html"}
];
function resolveEvidence(trainNumber,ctx){
 ctx=ctx||{};var d=String(ctx.serviceDate||"").slice(0,10);
 if(!d||d<EFFECTIVE)return null;
 var hay=[ctx.lineId,ctx.operator,ctx.railway].join("|");
 for(var i=0;i<rules.length;i++){
  var r=rules[i];if(!r.re.test(hay))continue;
  return {operator:r.operator,vehicleType:r.vehicleType,grade:"B",sourceUrl:r.sourceUrl,
   provenance:"current single-fleet ordinary-line structural constraint",observedDate:d,
   structuralExact:true};
 }
 return null;
}
var p={
 id:"single-fleet-ordinary-lines-2026",
 grade:"B",
 effectiveDate:EFFECTIVE,
 resolveEvidence:resolveEvidence,
 resolve:function(trainNumber,ctx){ return resolveEvidence(trainNumber,ctx); }
};
(window.TRAIN_VEHICLE_EVIDENCE_PROVIDERS||(window.TRAIN_VEHICLE_EVIDENCE_PROVIDERS=[])).push(p);
})();