/*
 * Pixel Tetsudo - Tokyo Monorail train-number -> operation evidence
 * 2026-03-14 weekday timetable. Rows are matched from published operation
 * chains to the manual timetable by exact terminal departure time/direction.
 * Never infer an operation from numeric proximity or parity.
 */
(function(){"use strict";
var SOURCE="https://www.loo-ool.com/rail/TMO/23/20260401/?U=03";
var op03={
"TMW001D":1,"TMW009D":1,"TMW022D":1,"TMW036D":1,"TMW043D":1,"TMW050D":1,"TMW057D":1,"TMW064D":1,
"TMW075D":1,"TMW086D":1,"TMW097D":1,"TMW108D":1,"TMW119D":1,"TMW130D":1,"TMW141D":1,"TMW152D":1,
"TMW165D":1,"TMW176D":1,"TMW187D":1,"TMW195D":1,
"TMW007U":1,"TMW020U":1,"TMW035U":1,"TMW049U":1,"TMW062U":1,"TMW075U":1,"TMW084U":1,"TMW097U":1,
"TMW106U":1,"TMW119U":1,"TMW128U":1,"TMW141U":1,"TMW150U":1,"TMW164U":1,"TMW175U":1,"TMW186U":1,
"TMW195U":1,"TMW204U":1
};
function resolveEvidence(trainNumber,ctx){
 ctx=ctx||{}; var hay=[ctx.lineId,ctx.railway,ctx.operator].join("|");
 if(!/TokyoMonorail|東京モノレール/i.test(hay))return null;
 var d=String(ctx.serviceDate||"").slice(0,10);
 if(d!=="2026-04-10"||!op03[String(trainNumber||"")])return null;
 return {operator:"TokyoMonorail",operationCode:"03",grade:"C",sourceUrl:SOURCE,
  provenance:"exact train-number match to dated Tokyo Monorail operation chain",observedDate:d};
}
(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS||(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS=[])).push(
 {id:"tokyo-monorail-train-operation-bridge",grade:"C",sourceUrl:SOURCE,resolveEvidence:resolveEvidence});
})();