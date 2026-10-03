/*
 * Pixel Tetsudo - Saikyo/Rinkai/Sotetsu dated formation evidence
 * v4.3.1062
 *
 * C-grade loo-ool dated observations. No cross-date carry-over.
 */
(function(){
  "use strict";
  var BASE="https://www.loo-ool.com/rail/A/00/";
  var rows={
    "2026-04-03":{
      "77":{vehicleType:"相鉄12000系",formationId:"12104F"},
      "81":{vehicleType:"東京臨海高速鉄道70-000形",formationId:"Z2"},
      "83":{vehicleType:"東京臨海高速鉄道70-000形",formationId:"Z7"},
      "85":{vehicleType:"東京臨海高速鉄道71-000形",formationId:"Z12"},
      "87":{vehicleType:"東京臨海高速鉄道70-000形",formationId:"Z1"},
      "89":{vehicleType:"東京臨海高速鉄道71-000形",formationId:"Z11"},
      "91":{vehicleType:"東京臨海高速鉄道70-000形",formationId:"Z3"}
    },
    "2026-04-04":{
      "81":{vehicleType:"東京臨海高速鉄道70-000形",formationId:"Z2"},
      "83":{vehicleType:"東京臨海高速鉄道70-000形",formationId:"Z7"},
      "85":{vehicleType:"東京臨海高速鉄道71-000形",formationId:"Z12"},
      "87":{vehicleType:"東京臨海高速鉄道70-000形",formationId:"Z1"},
      "89":{vehicleType:"東京臨海高速鉄道71-000形",formationId:"Z11"},
      "91":{vehicleType:"東京臨海高速鉄道70-000形",formationId:"Z3"}
    }
  };
  function network(ctx){
    return /Saikyo|Kawagoe|Rinkai|Sotetsu|埼京|川越|りんかい|相鉄/i.test(
      [ctx.lineId,ctx.operator,ctx.railway,ctx.destinationStation].join("|"));
  }
  function code(n){
    var raw=String(n||"").toUpperCase();
    var m=raw.match(/(?:^|[^0-9])(\d{2})(?:K|M)?$/);
    if(m)return m[1];
    return "";
  }
  function resolveEvidence(trainNumber,ctx){
    ctx=ctx||{}; var date=String(ctx.serviceDate||"").slice(0,10);
    if(!network(ctx)||!rows[date])return null;
    var c=code(trainNumber),rec=rows[date][c]; if(!rec)return null;
    var owner=/12000/.test(rec.vehicleType)?"Sotetsu":"TWR";
    return {operator:owner,vehicleType:rec.vehicleType,formationId:rec.formationId,grade:"C",
      sourceUrl:BASE+date.replace(/-/g,"")+"/",
      provenance:"loo-ool dated Saikyo/Rinkai/Sotetsu operation observation",
      observedDate:date,operationCode:c};
  }
  var provider={id:"loo-ool-saikyo-dated-formations",grade:"C",sourceUrl:BASE,resolveEvidence:resolveEvidence};
  if(window.TrainOperationEvidence&&typeof window.TrainOperationEvidence.register==="function")window.TrainOperationEvidence.register(provider);
  else (window.TRAIN_OPERATION_EVIDENCE_PROVIDERS||(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS=[])).push(provider);
})();
