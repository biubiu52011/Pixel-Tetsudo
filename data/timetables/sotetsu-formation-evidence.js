/*
 * Pixel Tetsudo - Sotetsu dated formation evidence
 * v4.3.1077
 * Source: loo-ool Sotetsu operation archive, 2026-04-08 snapshot.
 */
(function(){"use strict";
var SOURCE="https://loo-ool.com/rail/SA/00/20250604/";
var rows={"2026-04-08":{
"11":["相鉄10000系(8両)","10703F"],"12":["相鉄13000系(8両)","13101F"],
"15":["相鉄10000系(8両)","10705F"],"50":["相鉄9000系(10両)","9706F"],
"51":["相鉄8000系(10両)","8713F"],"52":["相鉄9000系(10両)","9705F"],
"54":["相鉄9000系(10両)","9704F"],"55":["相鉄11000系(10両)","11001F"],
"56":["相鉄8000系(10両)","8708F"],"58":["相鉄11000系(10両)","11004F"],
"62":["相鉄11000系(10両)","11005F"],"64":["相鉄9000系(10両)","9707F"],
"65":["相鉄10000系(10両)","10701F"],"67":["相鉄11000系(10両)","11003F"],
"68":["相鉄9000系(10両)","9702F"],"70":["相鉄12000系(10両)","12101F"],
"71":["相鉄12000系(10両)","12104F"],"72":["相鉄12000系(10両)","12103F"],
"73":["相鉄12000系(10両)","12106F"],"91G":["相鉄20000系(10両)","20104F"],
"93G":["相鉄20000系(10両)","20102F"],"94G":["相鉄20000系(10両)","20101F"],
"95G":["相鉄20000系(10両)","20105F"]
}};
function code(n){var m=String(n||"").toUpperCase().match(/(?:^|[^0-9A-Z])((?:[1-8][0-9]|9[1-5]G|[0-9]{2}K))(?:[^0-9A-Z]|$)/);return m?m[1]:"";}
function resolveEvidence(trainNumber,ctx){ctx=ctx||{};var hay=[ctx.lineId,ctx.railway,ctx.operator].join("|");
 if(!/Sotetsu|相鉄/i.test(hay))return null;
 var d=String(ctx.serviceDate||"").slice(0,10),r=rows[d]&&rows[d][code(trainNumber)];if(!r)return null;
 return {operator:"Sotetsu",vehicleType:r[0],formationId:r[1],grade:"C",sourceUrl:SOURCE,
 provenance:"dated Sotetsu operation observation",observedDate:d};}
(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS||(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS=[])).push(
{id:"sotetsu-dated-formations",grade:"C",resolveEvidence:resolveEvidence});
})();