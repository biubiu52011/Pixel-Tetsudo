/*
 * Pixel Tetsudo - Tozai / Chuo-Sobu / Toyo Rapid operation evidence
 * v4.3.1089
 * Structural operation ownership: S=TokyoMetro, K=JR-East, T=ToyoRapid.
 * Source: loo-ool MT operation table (2026-04-16 snapshot).
 */
(function(){"use strict";
var SOURCE="https://loo-ool.com/rail/MT/";
function op(n){var m=String(n||"").toUpperCase().match(/(?:^|[^0-9A-Z])((?:0[3579]|11)K|(?:50|52|54|56|58|60|62|64|66|68)T|(?:0[2]|1[3579]|2[13579]|3[13579]|4[13579]|5[13579]|6[13579]|7[13579]|8[13579]|9[1357])S)(?:[^0-9A-Z]|$)/);return m?m[1]:"";}
function resolveEvidence(trainNumber,ctx){
 ctx=ctx||{};var hay=[ctx.lineId,ctx.railway].join("|");
 if(!/Tozai|ChuoSobu|ToyoRapid|東西|中央.*総武|東葉/i.test(hay))return null;
 var k=op(trainNumber);if(!k)return null;
 var suffix=k.slice(-1);
 if(suffix==="K")return {operator:"JR-East",vehicleType:"JR E231系800番台(10両)",grade:"C",sourceUrl:SOURCE,provenance:"Tozai operation ownership / fleet constraint",observedDate:"2026-04-16"};
 if(suffix==="T")return {operator:"ToyoRapid",vehicleType:"東葉高速2000系(10両)",grade:"C",sourceUrl:SOURCE,provenance:"Tozai operation ownership / fleet constraint",observedDate:"2026-04-16"};
 return {operator:"TokyoMetro",grade:"C",sourceUrl:SOURCE,provenance:"Tozai operation ownership; Metro fleet remains multi-model",observedDate:"2026-04-16"};
}
(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS||(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS=[])).push({id:"tozai-operation-ownership-2026",grade:"C",resolveEvidence:resolveEvidence});
})();