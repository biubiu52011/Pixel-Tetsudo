/*
 * Pixel Tetsudo - 2026 Meguro/Namboku/Mita/Sotetsu operation evidence
 * v4.3.1057
 *
 * C-grade operation ownership: Chokopy 2026-03-14 revision.
 * B-grade structural cross-check: Sotetsu identifies 21000 as the 8-car
 * Tokyu Meguro through-service fleet. 13000 is Sotetsu-line-only.
 */
(function() {
  "use strict";
  var SOURCE="https://www.train.chokopy.net/unyo-search/Meguro/2026-03-14/weekday";
  var EFFECTIVE="2026-03-14";
  var groups={
    TOKYU:["201","202","204","205","207","208","209","210","211","212","213","214","215","216","217","218","220","221","222","223","225","226","227","229","230","231","233","234","236","238","240","241","243","246","247","248"],
    TokyoMetro:["330","332","334","336","338","340","342","344","346","350","352","354","356","360","362","364","366","368","370"],
    Toei:["421","423","425","431","433","435","437","439","441","443","445","447","449","451","453","455","457","459","461","463","465","467","469","471","473","475","477","479","481","483","485","487","489"],
    SaitamaRailway:["580","582","584","586","588","590","592","594","596"],
    Sotetsu:["631","632","633","635","637","638","639","642","643","644"]
  };
  function network(ctx){
    return /Meguro|Namboku|Mita|Saitama|Sotetsu|ShinYokohama/i.test(
      [ctx.lineId,ctx.operator,ctx.railway,ctx.destinationStation].join("|"));
  }
  function codeOf(n){
    var raw=String(n||"").toUpperCase().trim();
    var digits=raw.replace(/[^0-9]/g,"");
    if(digits.length>=6) return digits.slice(0,3);
    if(digits.length===3) return digits;
    return "";
  }
  function resolveEvidence(trainNumber,ctx){
    ctx=ctx||{};
    var date=String(ctx.serviceDate||"").slice(0,10);
    if(!date||date<EFFECTIVE||!network(ctx)) return null;
    var code=codeOf(trainNumber);
    if(!code)return null;
    var owner="";
    Object.keys(groups).some(function(k){
      if(groups[k].indexOf(code)>=0){owner=k;return true;}
      return false;
    });
    if(!owner)return null;
    return {
      operator:owner,
      vehicleType:owner==="Sotetsu" ? "相鉄21000系(8両)" : "",
      grade:"C",
      sourceUrl:SOURCE,
      provenance:"Chokopy 2026-03-14 Meguro operation table; Sotetsu official fleet constraint for 21000",
      observedDate:date,
      operationCode:code
    };
  }
  var provider={id:"chokopy-meguro-20260314",grade:"C",sourceUrl:SOURCE,effectiveDate:EFFECTIVE,resolveEvidence:resolveEvidence};
  if(window.TrainOperationEvidence&&typeof window.TrainOperationEvidence.register==="function"){
    window.TrainOperationEvidence.register(provider);
  }else{
    (window.TRAIN_OPERATION_EVIDENCE_PROVIDERS||(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS=[])).push(provider);
  }
})();
