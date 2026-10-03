/*
 * Pixel Tetsudo - dated formation assignment evidence
 * v4.3.1060
 *
 * C-grade historical operation observations from loo-ool.
 * IMPORTANT: assignments are date-scoped. Never carry a formation to another day.
 */
(function(){
  "use strict";
  var SOURCE_BASE="https://loo-ool.com/rail/MZ/00/";
  var rows={
    "2026-04-13":{
      "57S":{vehicleType:"東京メトロ18000系",formationId:"18110F / 18109F"},
      "63S":{vehicleType:"東京メトロ18000系",formationId:"18101F"},
      "65S":{vehicleType:"東京メトロ08系",formationId:"0854F"},
      "79S":{vehicleType:"東京メトロ8000系",formationId:"8109F"}
    }
  };
  function network(ctx){
    return /Denentoshi|Hanzomon|田園都市|半蔵門/i.test(
      [ctx.lineId,ctx.operator,ctx.railway,ctx.destinationStation].join("|"));
  }
  function opCode(trainNumber){
    var raw=String(trainNumber||"").toUpperCase();
    var m=raw.match(/(?:^|[^0-9])(?:A|B)?(\d{1,2})S$/);
    if(m)return String(parseInt(m[1],10)).padStart(2,"0")+"S";
    var p=raw.match(/^(\d{3})[-_]/);
    if(p){
      var n=parseInt(p[1],10);
      if(n>=51&&n<=93&&n%2===1)return String(n).padStart(2,"0")+"S";
    }
    return "";
  }
  function resolveEvidence(trainNumber,ctx){
    ctx=ctx||{};
    var date=String(ctx.serviceDate||"").slice(0,10);
    if(!network(ctx)||!rows[date])return null;
    var op=opCode(trainNumber);
    var rec=rows[date][op];
    if(!rec)return null;
    return {
      operator:"TokyoMetro",
      vehicleType:rec.vehicleType,
      formationId:rec.formationId,
      grade:"C",
      sourceUrl:SOURCE_BASE+date.replace(/-/g,"")+"/",
      provenance:"loo-ool dated Hanzomon/Denentoshi operation observation",
      observedDate:date,
      operationCode:op
    };
  }
  var provider={id:"loo-ool-hanzomon-dated-formations",grade:"C",sourceUrl:SOURCE_BASE,resolveEvidence:resolveEvidence};
  if(window.TrainOperationEvidence&&typeof window.TrainOperationEvidence.register==="function"){
    window.TrainOperationEvidence.register(provider);
  }else{
    (window.TRAIN_OPERATION_EVIDENCE_PROVIDERS||(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS=[])).push(provider);
  }
})();
