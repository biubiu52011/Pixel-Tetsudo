/*
 * Pixel Tetsudo - Tokyu Ikegami / Tamagawa dated formation evidence
 * v4.3.1084
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
 "2026-09-21":{"01":"7113F","02":"7108F","03":"7112F","04":"7105F","05":"1524F","06":"1522F","07":"7114F","08":"1502F","09":"1013F","10":"7102F","21":"7104F","22":"7107F","23":"1012F","24":"7109F","25":"1017F"},
 "2026-09-22":{"01":"7104F","02":"7112F","03":"1507F","04":"1524F","05":"7113F","06":"1017F","07":"1502F","08":"7108F","09":"7102F","10":"1505F","21":"7109F","22":"1522F","23":"7107F","24":"7114F","25":"7105F"},
 "2026-09-24":{"01":"1507F","02":"1508F","03":"7110F","05":"1524F","06":"1505F","21":"7114F","22":"7101F","23":"1017F","24":"7108F","26":"7105F","27":"7107F","28":"1012F"},
 "2026-09-25":{"01":"1021F","02":"1501F","03":"1507F","05":"1505F","06":"1523F","21":"1503F","22":"7113F","23":"7101F","24":"1522F","26":"1508F","27":"7108F","28":"7107F"},
 "2026-09-26":{"01":"7114F","02":"7107F","03":"1523F","04":"1020F","05":"1507F","06":"1503F","07":"1504F","08":"1508F","09":"7104F","10":"7101F","21":"1522F","22":"1502F","23":"7113F","24":"1501F","25":"7102F"},
 "2026-09-27":{"01":"1522F","02":"1523F","03":"7104F","04":"1507F","05":"7108F","06":"7102F","07":"1508F","08":"7115F","09":"7101F","10":"1504F","21":"1501F","22":"7113F","23":"1502F","24":"1505F","25":"1020F"},
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