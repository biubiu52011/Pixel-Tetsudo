/*
 * Pixel Tetsudo - 2026 Den-en-toshi/Hanzomon/Tobu operation evidence
 * v4.3.1058
 *
 * C-grade dated operation ownership:
 * Chokopy's Train-Page, 2026-03-14 timetable revision.
 * Explicit working codes identify operator ownership when the source/train data
 * carries the K/S/T suffix itself. Numeric public train-number ranges are not
 * converted into working codes. T workings can be either
 * Tobu 50050 or 50000 in observed service, so model identity requires dated evidence.
 */
(function() {
  "use strict";
  var SOURCE="https://www.train.chokopy.net/unyo/tables/dt_20260314.html";
  var EFFECTIVE="2026-03-14";

  function network(ctx){
    return /Denentoshi|Hanzomon|Isesaki|Skytree|Tobu|田園都市|半蔵門/i.test(
      [ctx.lineId,ctx.operator,ctx.railway,ctx.destinationStation].join("|"));
  }

  function parseOperation(trainNumber){
    var raw=String(trainNumber||"").toUpperCase().trim();
    // Explicit working-number form: 26K / 57S / 50T, optionally prefixed A/B.
    var m=raw.match(/(?:^|[^0-9])(?:A|B)?(\d{1,2})([KST])$/);
    if(m) return {number:parseInt(m[1],10),letter:m[2]};
    return null;
  }

  function resolveEvidence(trainNumber,ctx){
    ctx=ctx||{};
    var date=String(ctx.serviceDate||"").slice(0,10);
    if(!date||date<EFFECTIVE||!network(ctx)) return null;
    var op=parseOperation(trainNumber);
    if(!op)return null;
    var owner=op.letter==="K"?"TOKYU":(op.letter==="S"?"TokyoMetro":"Tobu");
    return {
      operator:owner,
      // Operator ownership is structural; vehicle model requires dated run evidence.
      vehicleType:"",
      grade:"C",
      sourceUrl:SOURCE,
      provenance:"Chokopy 2026-03-14 Denentoshi operation table",
      observedDate:date,
      operationCode:String(op.number).padStart(2,"0")+op.letter
    };
  }

  var provider={id:"chokopy-denentoshi-20260314",grade:"C",sourceUrl:SOURCE,effectiveDate:EFFECTIVE,resolveEvidence:resolveEvidence};
  if(window.TrainOperationEvidence&&typeof window.TrainOperationEvidence.register==="function"){
    window.TrainOperationEvidence.register(provider);
  }else{
    (window.TRAIN_OPERATION_EVIDENCE_PROVIDERS||(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS=[])).push(provider);
  }
})();
