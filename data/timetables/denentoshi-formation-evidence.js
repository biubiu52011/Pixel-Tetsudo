/*
 * Pixel Tetsudo - Tokyu Den-en-toshi dated formation evidence
 * v4.3.1080
 * Source: loo-ool MZ operation observations, 2026-04-18.
 */
(function(){"use strict";
var SOURCE="https://loo-ool.com/rail/MZ/";
var rows={"2026-04-18":{
"01K":["東急5000系(10両)","500008F"],"05K":["東急5000系(10両)","500010F"],
"06K":["東急2020系(10両)","202040F"],"07K":["東急2020系(10両)","202024F"],
"08K":["東急2020系(10両)","202045F"],"10K":["東急2020系(10両)","202029F / 202009F"],
"12K":["東急2020系(10両)","202041F"],"13K":["東急5000系(10両)","500017F"],
"14K":["東急2020系(10両)","202046F"],"15K":["東急2020系(10両)","202025F"],
"17K":["東急5000系(10両)","500012F"],"19K":["東急5000系(10両)","500005F"],
"21K":["東急2020系(10両)","202042F"],"22K":["東急5000系(10両)","500014F"],
"25K":["東急5000系(10両)","500020F"],"26K":["東急5000系(10両)","500002F"]
}};
function code(n){var m=String(n||"").toUpperCase().match(/(?:^|[^0-9])([0-4][0-9]K)(?:[^0-9A-Z]|$)/);return m?m[1]:"";}
function network(ctx){return /DenEn|Denentoshi|Hanzomon|Tobu|田園都市|半蔵門/i.test([ctx.lineId,ctx.railway,ctx.destinationStation].join("|"));}
function resolveEvidence(trainNumber,ctx){ctx=ctx||{};if(!network(ctx))return null;
 var d=String(ctx.serviceDate||"").slice(0,10),r=rows[d]&&rows[d][code(trainNumber)];if(!r)return null;
 return {operator:"Tokyu",vehicleType:r[0],formationId:r[1],grade:"C",sourceUrl:SOURCE,
 provenance:"loo-ool dated Den-en-toshi/Hanzomon operation observation",observedDate:d};}
(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS||(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS=[])).push(
{id:"denentoshi-dated-formations",grade:"C",resolveEvidence:resolveEvidence});
})();