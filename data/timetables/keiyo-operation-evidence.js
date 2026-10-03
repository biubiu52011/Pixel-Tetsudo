/*
 * Pixel Tetsudo - JR Keiyo dated operation vehicle evidence
 * v4.3.1088
 * Source: loo-ool Keiyo operation archive, 2026-03-14 timetable revision.
 */
(function(){"use strict";
var SOURCE="https://loo-ool.com/rail/B/";
var rows={
 "2026-04-01":{"01":"233","03":"233","05":"233","09":"233","11":"233","15":"233","17":"233","19":"209","21":"233","23":"233","25":"233","27":"233","29":"233","31":"233","33":"233","35":"233","37":"233","83":"233"},
 "2026-04-14":{"01":"233","03":"233","05":"233","09":"233","11":"233","15":"233","17":"233","19":"233","21":"233","23":"233","25":"233","27":"233","29":"233","31":"233","33":"233","35":"233","37":"209","81":"233"}
};
function opNo(n){var m=String(n||"").match(/(?:^|[^0-9])(0[1-9]|[123][13579]|81|83)(?:[^0-9]|$)/);return m?m[1]:"";}
function resolveEvidence(trainNumber,ctx){
 ctx=ctx||{};var hay=[ctx.lineId,ctx.railway].join("|");
 if(!/Keiyo|京葉/i.test(hay))return null;
 var d=String(ctx.serviceDate||"").slice(0,10),k=opNo(trainNumber),v=rows[d]&&rows[d][k];
 if(!v)return null;
 return {operator:"JR-East",vehicleType:v==="209"?"JR 209系500番台":"JR E233系5000番台",
  grade:"C",sourceUrl:SOURCE,provenance:"dated Keiyo operation observation",observedDate:d};
}
(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS||(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS=[])).push(
 {id:"jr-keiyo-dated-operations",grade:"C",resolveEvidence:resolveEvidence});
})();