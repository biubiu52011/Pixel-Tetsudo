/*
 * Pixel Tetsudo - Odakyu dated formation evidence
 * v4.3.1100
 * Source: loo-ool OD operation observations, snapshot updated 2026-08-06.
 */
(function(){"use strict";
var SOURCE="https://loo-ool.com/rail/OD/";
var rows={"2026-08-06":{
"E12":["小田急3000形","3093F"],
"E13":["小田急3000形","1057F / 3276F"],
"E14":["小田急3000形","3094F"],
"E15":["小田急5000形","5052F"],
"E17":["小田急3000形","3082F"],
"E18":["小田急5000形","5060F"],
"E19":["小田急8000形","8051F / 8252F"],
"E20":["小田急3000形","3085F"],
"E21":["小田急1000形","1092F"],
"E22":["小田急5000形","5053F"],
"E23":["小田急3000形","3083F"],
"E24":["小田急4000形","4060F"],
"E25":["小田急1000形","1097F"],
"E26":["小田急3000形","3092F"],
"E27":["小田急8000形","8063F / 8263F"],
"E28":["小田急8000形","8053F / 8253F"],
"E29":["小田急3000形","3081F"],
"E30":["小田急8000形","8058F / 8260F"],
"E31":["小田急5000形","5055F"],
"E32":["小田急4000形","4062F"],
"E33":["小田急1000形","1094F"],
"E34":["小田急3000形","3095F"],
"E35":["小田急1000形","1096F / 5057F"],
"E61":["小田急3000形","3087F"],
"E62":["小田急5000形","5059F"],
"E63":["小田急5000形","5051F"],
"E64":["小田急5000形","5065F"],
"E65":["小田急1000形","1091F"],
"E66":["小田急5000形","5056F"],
"E67":["小田急5000形","5054F"],
"E68":["小田急5000形","5063F"],
"E69":["小田急8000形","8057F / 8262F"],
"E70":["小田急5000形","5064F"],
"E81":["小田急5000形","5062F"],
"E82":["小田急3000形","3091F"],
"E83":["小田急5000形","5066F"],
"E84":["小田急1000形","1095F"],
"E85":["小田急3000形","3084F"]
}};
function op(raw){var m=String(raw||"").toUpperCase().match(/(?:^|[^A-Z0-9])(E(?:1[1-9]|2[0-9]|3[0-5]|6[1-9]|70|8[1-5]))(?:[^A-Z0-9]|$)/);return m?m[1]:"";}
function network(ctx){return /Odawara|OdakyuTama|OdakyuEnoshima|小田急|江ノ島/i.test([ctx.lineId,ctx.railway,ctx.operator].join("|"));}
function resolveEvidence(trainNumber,ctx){ctx=ctx||{};if(!network(ctx))return null;
 var d=String(ctx.serviceDate||"").slice(0,10),code=op(ctx.operationCode)||op(trainNumber),r=rows[d]&&rows[d][code];if(!r)return null;
 return {operator:"Odakyu",vehicleType:r[0],formationId:r[1],grade:"C",sourceUrl:SOURCE,
 provenance:"loo-ool dated Odakyu operation observation",observedDate:d,operationCode:code};}
(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS||(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS=[])).push(
{id:"odakyu-dated-formations",grade:"C",resolveEvidence:resolveEvidence});
})();