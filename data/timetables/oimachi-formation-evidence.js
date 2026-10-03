/*
 * Pixel Tetsudo - Tokyu Oimachi dated formation evidence
 * v4.3.1085
 * Source: loo-ool Oimachi operation archive.
 */
(function(){"use strict";
var SOURCE="https://loo-ool.com/rail/OM/";
var rows={
"2026-04-15":{
 "101":["東急9000系","900015F"],"102":["東急6020系(5両)","602055F"],
 "103":["東急9020系","902021F"],"104":["東急9000系","900006F"],
 "105":["東急6020系(5両)","602058F"],"106":["東急6020系(5両)","602059F"],
 "107":["東急6020系(5両)","602054F"],"108":["東急6020系(5両)","602051F"],
 "109":["東急9000系","900014F"],"110":["東急9000系","900004F"],
 "114":["東急9000系","900008F"],"115":["東急6020系(5両)","602057F"],
 "116":["東急6020系(5両)","602056F"],"132":["東急6020系(7両)","602022F"],
 "134":["東急6000系","600003F"],"135":["東急6000系","600004F"],
 "137":["東急6000系","600006F"]
},"2026-04-16":{
 "101":["東急9020系","902021F"],"102":["東急9000系","900008F"],
 "103":["東急6020系(5両)","602055F"],"104":["東急9000系","900001F"],
 "105":["東急9000系","900013F"],"106":["東急6020系(5両)","602053F"],
 "107":["東急6020系(5両)","602059F"],"108":["東急6020系(5両)","602054F"],
 "109":["東急6020系(5両)","602057F"],"110":["東急9000系","900014F"],
 "111":["東急9020系","902022F"],"112":["東急9000系","900015F"],
 "114":["東急6020系(5両)","602051F"],"115":["東急6020系(5両)","602052F"],
 "116":["東急6020系(5両)","602058F"],"132":["東急6000系","600001F"],
 "133":["東急6020系(7両)","602022F"],"134":["東急6000系","600005F"],
 "135":["東急6000系","600003F"],"136":["東急6000系","600004F"]
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