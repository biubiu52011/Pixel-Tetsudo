/*
 * Pixel Tetsudo - Tokyo Metro Tozai dated formation evidence
 * v4.3.1089
 * Source: loo-ool MT, observed 2026-04-16.
 * Rows with unresolved intra-day (1)/(2) model changes are intentionally omitted.
 */
(function(){"use strict";
var SOURCE="https://loo-ool.com/rail/MT/";
var rows={"2026-04-16":{
 "02S":["東京メトロ15000系(10両)","1500064F"],
 "19S":["東京メトロ05系(10両)","0522F"],
 "21S":["東京メトロ15000系(10両)","1500062F"],
 "25S":["東京メトロ05系(10両)","0520F"],
 "27S":["東京メトロ05系(10両)","0515F"],
 "31S":["東京メトロ05系(10両)","0531F"],
 "35S":["東京メトロ07系(10両)","0772F"],
 "37S":["東京メトロ05系(10両)","0521F"],
 "39S":["東京メトロ05系(10両)","0534F"],
 "43S":["東京メトロ05系(10両)","0524F"],
 "53S":["東京メトロ15000系(10両)","1500058F"],
 "55S":["東京メトロ05系(10両)","0541F"],
 "57S":["東京メトロ05系(10両)","0532F"],
 "65S":["東京メトロ05系(10両)","0538F"],
 "69S":["東京メトロ05系(10両)","0543F"],
 "71S":["東京メトロ15000系(10両)","1500061F"],
 "75S":["東京メトロ07系(10両)","0774F"],
 "77S":["東京メトロ15000系(10両)","1500057F"],
 "79S":["東京メトロ07系(10両)","0776F"],
 "81S":["東京メトロ07系(10両)","0775F"],
 "85S":["東京メトロ05系(10両)","0537F"],
 "87S":["東京メトロ15000系(10両)","1500053F"],
 "89S":["東京メトロ05系(10両)","0514F"],
 "93S":["東京メトロ05系(10両)","0533F"],
 "95S":["東京メトロ15000系(10両)","1500066F"]
}};
function op(n){var m=String(n||"").toUpperCase().match(/(?:^|[^0-9A-Z])((?:0[2]|1[3579]|2[13579]|3[13579]|4[13579]|5[13579]|6[13579]|7[13579]|8[13579]|9[1357])S)(?:[^0-9A-Z]|$)/);return m?m[1]:"";}
function resolveEvidence(trainNumber,ctx){
 ctx=ctx||{};var hay=[ctx.lineId,ctx.railway].join("|");if(!/Tozai|ChuoSobu|ToyoRapid|東西|中央.*総武|東葉/i.test(hay))return null;
 var d=String(ctx.serviceDate||"").slice(0,10),r=rows[d]&&rows[d][op(trainNumber)];if(!r)return null;
 return {operator:"TokyoMetro",vehicleType:r[0],formationId:r[1],grade:"C",sourceUrl:SOURCE,provenance:"dated Tozai formation observation",observedDate:d};
}
(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS||(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS=[])).push({id:"tozai-dated-formations",grade:"C",resolveEvidence:resolveEvidence});
})();