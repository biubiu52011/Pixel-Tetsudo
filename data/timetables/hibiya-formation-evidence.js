/*
 * Pixel Tetsudo - Hibiya/Tobu dated formation evidence
 * v4.3.1065
 *
 * C-grade loo-ool observations. Hibiya operation suffix S/T is NOT treated as
 * owner identity: both Metro 13000 and Tobu 70000/70090 can appear across it.
 * Date-scoped only.
 */
(function(){
"use strict";
var BASE="https://loo-ool.com/rail/MH/00/";
var rows={
 "2026-04-16":{
  "02S":["東京メトロ13000系","1300086F"],
  "04S":["東京メトロ13000系","1300094F"],
  "06S":["東京メトロ13000系","1300093F"],
  "24S":["東京メトロ13000系","1300084F / 1300081F"],
  "60S":["東京メトロ13000系","1300051F"],
  "66S":["東武70000系","7000012F"],
  "01T":["東武70000系","7000007F"],
  "03T":["東武70000系","7000011F"],
  "05T":["東武70000系","7000005F"],
  "07T":["東武70000系","7000016F"],
  "21T":["東京メトロ13000系","1300059F"],
  "27T":["東武70090型","7009092F"],
  "41T":["東武70090型","7009091F"],
  "43T":["東武70090型","7009096F"],
  "45T":["東武70090型","7009094F"],
  "47T":["東武70090型","7009093F"]
 }
};
function network(c){return /Hibiya|Skytree|Isesaki|日比谷|スカイツリー|伊勢崎/i.test([c.lineId,c.operator,c.railway,c.destinationStation].join("|"));}
function code(n){var m=String(n||"").toUpperCase().match(/(?:^|[^0-9])(\d{1,2})([ST])$/);return m?String(parseInt(m[1],10)).padStart(2,"0")+m[2]:"";}
function resolveEvidence(n,c){
 c=c||{};var d=String(c.serviceDate||"").slice(0,10);if(!network(c)||!rows[d])return null;
 var o=code(n),r=rows[d][o];if(!r)return null;
 var owner=/^東武/.test(r[0])?"Tobu":"TokyoMetro";
 return {operator:owner,vehicleType:r[0],formationId:r[1],grade:"C",sourceUrl:BASE+d.replace(/-/g,"")+"/",provenance:"loo-ool dated Hibiya operation observation",observedDate:d,operationCode:o};
}
var p={id:"loo-ool-hibiya-dated-formations",grade:"C",sourceUrl:BASE,resolveEvidence:resolveEvidence};
if(window.TrainOperationEvidence&&typeof window.TrainOperationEvidence.register==="function")window.TrainOperationEvidence.register(p);
else (window.TRAIN_OPERATION_EVIDENCE_PROVIDERS||(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS=[])).push(p);
})();