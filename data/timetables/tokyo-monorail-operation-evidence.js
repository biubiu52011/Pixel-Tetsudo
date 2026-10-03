/*
 * Pixel Tetsudo - Tokyo Monorail dated operation/formation evidence
 * Generated from canonical operation_vehicle_date_rules.
 * Evidence is date + operation-code scoped. No line default, range or hash inference.
 */
(function(){"use strict";
var SOURCE="https://loo-ool.com/rail/TMO/";
var rows={
 "2026-04-10":{
  "03":["東京モノレール10000形","10051F"],"05":["東京モノレール1000形","1091F"],
  "07":["東京モノレール1000形","1079F"],"11":["東京モノレール1000形","1007F"],
  "15":["東京モノレール10000形","10081F"],"17":["東京モノレール2000形","20011F"],
  "19":["東京モノレール10000形","10031F"],"21":["東京モノレール10000形","10041F"],
  "23":["東京モノレール1000形","1085F"],"25":["東京モノレール10000形","10071F"],
  "27":["東京モノレール1000形","1043F"],"29":["東京モノレール2000形","20021F"]
 }
};
function opCode(trainNumber,ctx){
 var explicit=String((ctx&&ctx.operationCode)||"").match(/(?:^|[^0-9])(0[1-9]|[12][13579]|29)(?:[^0-9]|$)/);
 if(explicit)return explicit[1];
 var raw=String(trainNumber||"").trim();
 return /^(?:0[1-9]|[12][13579]|29)$/.test(raw)?raw:"";
}
function resolveEvidence(trainNumber,ctx){
 ctx=ctx||{}; var hay=[ctx.lineId,ctx.railway,ctx.operator].join("|");
 if(!/TokyoMonorail|東京モノレール/i.test(hay))return null;
 var d=String(ctx.serviceDate||"").slice(0,10),op=opCode(trainNumber,ctx),r=rows[d]&&rows[d][op];
 if(!r)return null;
 return {operator:"TokyoMonorail",vehicleType:r[0],formationId:r[1],grade:"C",sourceUrl:SOURCE,
  provenance:"dated Tokyo Monorail operation assignment",observedDate:d};
}
(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS||(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS=[])).push(
 {id:"tokyo-monorail-dated-operations",grade:"C",sourceUrl:SOURCE,resolveEvidence:resolveEvidence});
})();