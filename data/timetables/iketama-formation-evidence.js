/*
 * Pixel Tetsudo - Tokyu Ikegami / Tamagawa dated formation evidence
 * v4.3.1073
 * Source: dated enthusiast operation records. Formation-level evidence only.
 */
(function(){"use strict";
var SOURCE="https://yacchann.blog13.fc2.com/?cat=21";
var rows={
 "2026-09-08":{
  "01":"1502F","02":"1503F","03":"1020F","04":"1019F","05":"7113F","06":"7104F",
  "07":"1522F","08":"7109F","09":"7101F","10":"7111F","11":"7106F","12":"1507F",
  "13":"1017F","14":"7114F","15":"7110F","16":"1523F","17":"1013F","18":"7107F",
  "19":"1012F","20":"7108F"
 },
 "2026-09-19":{"03":"1501F","04":"7102F","05":"1017F","06":"1012F","07":"7107F","08":"1507F","09":"1502F","10":"1503F","21":"1505F","22":"7110F","24":"7113F","25":"1013F"},
 "2026-09-20":{"01":"1505F","02":"1501F","03":"7108F","04":"1017F","05":"7105F","06":"7107F","07":"1507F","08":"7114F","09":"1503F","10":"1013F","21":"7113F","22":"1012F","23":"7110F","24":"7104F","25":"7102F"}
};
function opNo(n){var m=String(n||"").match(/(?:^|[^0-9])(0[1-9]|1[0-9]|2[0-9])(?:[^0-9]|$)/);return m?m[1]:"";}
function model(f){if(/^7/.test(f))return "東急7000系";if(/^(15|152)/.test(f))return "東急1000系1500番台";if(/^10/.test(f))return "東急1000系";return "";}
function resolveEvidence(trainNumber,ctx){
 ctx=ctx||{};var hay=[ctx.lineId,ctx.railway].join("|");
 if(!/TokyuIkegami|TokyuTamagawa|Ikegami|池上|東急多摩川/i.test(hay))return null;
 var d=String(ctx.serviceDate||"").slice(0,10),n=opNo(trainNumber),f=rows[d]&&rows[d][n];
 if(!f)return null;var v=model(f);if(!v)return null;
 return {operator:"TOKYU",vehicleType:v,formationId:f,grade:"C",sourceUrl:SOURCE,
  provenance:"dated Ikegami/Tamagawa operation observation",observedDate:d};
}
(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS||(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS=[])).push(
 {id:"tokyu-iketama-dated-formations",grade:"C",resolveEvidence:resolveEvidence});
})();