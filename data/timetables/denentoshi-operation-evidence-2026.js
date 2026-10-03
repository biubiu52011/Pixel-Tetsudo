/*
 * Pixel Tetsudo - 2026 Den-en-toshi/Hanzomon/Tobu operation evidence
 * v4.3.1058
 *
 * C-grade dated operation ownership:
 * Chokopy's Train-Page, 2026-03-14 timetable revision.
 * Published families: 01K-26K Tokyu, 51S-77S Tokyo Metro,
 * 50T-82T Tobu (holiday table; weekday table is validated by the same source).
 * This provider establishes operator ownership. Tobu T workings are promoted
 * to 50050 series using Tobu's official through-service fleet definition;
 * Metro S workings remain multi-model and therefore narrowed.
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
    // Tokyu public train number form: 026-081, 057-102, etc.
    var p=raw.match(/^(\d{3})[-_]/);
    if(p){
      var n=parseInt(p[1],10);
      if(n>=1&&n<=26) return {number:n,letter:"K"};
      if(n>=51&&n<=77&&n%2===1) return {number:n,letter:"S"};
      if(n>=50&&n<=82&&n%2===0) return {number:n,letter:"T"};
    }
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
      // Tobu officially designates 50050 as the Hanzomon/Denentoshi through fleet.
      // Metro remains multi-model in 2026 (8000/08/18000), so S workings stay narrowed.
      vehicleType:owner==="Tobu" ? "東武50050系" : "",
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
