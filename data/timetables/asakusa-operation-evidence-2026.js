/*
 * Pixel Tetsudo - Asakusa/Keikyu/Keisei/Hokuso operation evidence
 * v4.3.1063
 *
 * C-grade operation families and dated formation observations: loo-ool MA.
 * T=Toei, K=Keisei, N=Hokuso/Chiba New Town, H=Keikyu.
 * Toei T workings are model-exact 5500. H/K/N remain multi-model unless a
 * date-scoped formation observation identifies the actual train.
 */
(function(){
  "use strict";
  var SOURCE="https://loo-ool.com/rail/MA/";
  var EFFECTIVE="2026-03-14";
  function network(ctx){
    return /Asakusa|Keikyu|Keisei|Hokuso|NaritaSkyAccess|浅草|京急|京成|北総|成田空港/i.test(
      [ctx.lineId,ctx.operator,ctx.railway,ctx.destinationStation].join("|"));
  }
  function op(n){
    var raw=String(n||"").toUpperCase().trim();
    var m=raw.match(/(?:^|[^0-9])(\d{1,2})([TKNH])(?:\([^)]*\))?$/);
    return m?{number:parseInt(m[1],10),letter:m[2]}:null;
  }
  function resolveEvidence(trainNumber,ctx){
    ctx=ctx||{}; var date=String(ctx.serviceDate||"").slice(0,10);
    if(!date||date<EFFECTIVE||!network(ctx))return null;
    var x=op(trainNumber); if(!x)return null;
    var owner=x.letter==="T"?"Toei":x.letter==="K"?"Keisei":x.letter==="H"?"Keikyu":"Hokuso";
    return {
      operator:owner,
      vehicleType:x.letter==="T"?"都営5500形":"",
      grade:"C",sourceUrl:SOURCE,
      provenance:"loo-ool Asakusa four-company operation table; Toei current fleet cross-check",
      observedDate:date,operationCode:String(x.number).padStart(2,"0")+x.letter
    };
  }
  var provider={id:"loo-ool-asakusa-operation-families-2026",grade:"C",sourceUrl:SOURCE,effectiveDate:EFFECTIVE,resolveEvidence:resolveEvidence};
  if(window.TrainOperationEvidence&&typeof window.TrainOperationEvidence.register==="function")window.TrainOperationEvidence.register(provider);
  else (window.TRAIN_OPERATION_EVIDENCE_PROVIDERS||(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS=[])).push(provider);
})();
