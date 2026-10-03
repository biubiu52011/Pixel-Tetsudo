/*
 * Pixel Tetsudo - Tokyu Oimachi dated formation evidence
 * v4.3.1074
 * Source: loo-ool Oimachi operation archive.
 */
(function(){"use strict";
var SOURCE="https://www.loo-ool.com/rail/OM/00/20260124/";
var rows={"2026-04-15":{
 "102":["東急6020系(5両)","602055F"],"105":["東急6020系(5両)","602058F"],
 "106":["東急6020系(5両)","602059F"],"107":["東急6020系(5両)","602054F"],
 "108":["東急6020系(5両)","602051F"],"111":["東急6020系(5両)","602052F"],
 "112":["東急6020系(5両)","602052F"],"115":["東急6020系(5両)","602057F"],
 "116":["東急6020系(5両)","602056F"],"132":["東急6020系(7両)","602022F"],
 "133":["東急6020系(7両)","602021F"]
}};
function opNo(n){var m=String(n||"").match(/(?:^|[^0-9])(1(?:0[1-9]|1[0-6]|3[1-7]))(?:[^0-9]|$)/);return m?m[1]:"";}
function resolveEvidence(trainNumber,ctx){
 ctx=ctx||{};var hay=[ctx.lineId,ctx.railway].join("|");
 if(!/TokyuOimachi|Oimachi|大井町/i.test(hay))return null;
 var d=String(ctx.serviceDate||"").slice(0,10),r=rows[d]&&rows[d][opNo(trainNumber)];
 if(!r)return null;
 return {operator:"TOKYU",vehicleType:r[0],formationId:r[1],grade:"C",sourceUrl:SOURCE,
 provenance:"dated Oimachi operation observation",observedDate:d};
}
(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS||(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS=[])).push(
 {id:"tokyu-oimachi-dated-formations",grade:"C",resolveEvidence:resolveEvidence});
})();