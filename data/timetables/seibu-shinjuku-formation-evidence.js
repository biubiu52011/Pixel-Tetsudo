/*
 * Pixel Tetsudo - Seibu Shinjuku dated train vehicle evidence
 * v4.3.1091
 * Source: loo-ool SS, observed 2026-04-08 / 09 / 13 / 17.
 * Train-number evidence is used directly; no service-type-wide model inference.
 */
(function(){"use strict";
var SOURCE="https://loo-ool.com/rail/SS/";
var rows={
"2026-04-08":{
 "2601":["西武20000系","20108F"],"2603":["西武6000系","6104F"],"2605":["西武6000系","6105F"],
 "5305":["西武20000系","20154F"],"6017":["西武9000系","9104F"],"6018":["西武9000系","9105F"],
 "6622":["西武8000系","8103F"],"602":["西武40000系","40104F"],"604":["西武40000系","40103F"],
 "101":["西武10000系","10112F"],"102":["西武10000系","10112F"],"104":["西武10000系","10110F"],"108":["西武10000系","10108F"]
},
"2026-04-09":{
 "2601":["西武20000系","20105F"],"2603":["西武6000系","6108F"],"2604":["西武6000系","6105F"],
 "6017":["西武9000系","9103F"],"6018":["西武9000系","9108F"],"6086":["西武9000系","9108F"],
 "6626":["西武8000系","8103F"],"110":["西武10000系","10110F"],"112":["西武10000系","10108F"],"126":["西武10000系","10112F"]
},
"2026-04-13":{
 "2803":["西武40000系","40103F"],"5303":["西武6000系","6101F"],"6017":["西武9000系","9105F"],
 "6018":["西武9000系","9104F"],"114":["西武10000系","10109F"],"2306":["西武6000系","6108F"],
 "2312":["西武6000系","6107F"],"2614":["西武6000系","6104F"],"2752":["西武6000系","6102F"]
},
"2026-04-17":{
 "2601":["西武30000系","30105F"],"2603":["西武6000系","6104F"],
 "2605":["西武6000系","6105F"],"2607":["西武2000系","2089F / 2457F"],
 "2609":["西武2000系","2055F"],"5305":["西武20000系","20156F"],
 "6017":["西武9000系","9104F"],"6018":["西武9000系","9105F"],
 "6622":["西武8000系","8103F"],"602":["西武40000系","40103F"],
 "604":["西武40000系","40104F"],"102":["西武10000系","10110F"],
 "104":["西武10000系","10108F"],"106":["西武10000系","10112F"],"124":["西武10000系","10109F"]
}};
function no(n){var m=String(n||"").match(/(?:^|[^0-9])(\d{2,4})(?:[^0-9]|$)/);return m?m[1]:"";}
function resolveEvidence(trainNumber,ctx){
 ctx=ctx||{};var hay=[ctx.lineId,ctx.railway].join("|");if(!/SeibuShinjuku|Haijima|西武新宿|拝島/i.test(hay))return null;
 var d=String(ctx.serviceDate||"").slice(0,10),r=rows[d]&&rows[d][no(trainNumber)];if(!r)return null;
 return {operator:"Seibu",vehicleType:r[0],formationId:r[1],grade:"C",sourceUrl:SOURCE,provenance:"dated Seibu Shinjuku train-number observation",observedDate:d};
}
(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS||(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS=[])).push({id:"seibu-shinjuku-dated-trains",grade:"C",resolveEvidence:resolveEvidence});
})();