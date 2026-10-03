/*
 * Pixel Tetsudo - Chiyoda/Joban/Odakyu operation evidence
 * v4.3.1061
 *
 * C-grade current operation-family evidence from loo-ool MC.
 * K = JR East E233-2000 family, S = Tokyo Metro 16000 family,
 * E = Odakyu 4000 family for through workings.
 * This provider is model-exact, not formation-exact.
 */
(function(){
  "use strict";
  var SOURCE="https://loo-ool.com/rail/MC/";
  var EFFECTIVE="2026-03-14";
  function network(ctx){
    return /Chiyoda|Joban|Odakyu|千代田|常磐|小田急/i.test(
      [ctx.lineId,ctx.operator,ctx.railway,ctx.destinationStation].join("|"));
  }
  function op(trainNumber){
    var raw=String(trainNumber||"").toUpperCase().trim();
    var m=raw.match(/(?:^|[^0-9])(?:A|B)?(\d{1,2})([KSE])$/);
    return m ? {number:parseInt(m[1],10),letter:m[2]} : null;
  }
  function resolveEvidence(trainNumber,ctx){
    ctx=ctx||{};
    var date=String(ctx.serviceDate||"").slice(0,10);
    if(!date||date<EFFECTIVE||!network(ctx))return null;
    var x=op(trainNumber); if(!x)return null;
    var owner="",vehicle="";
    if(x.letter==="K"){owner="JR-East";vehicle="JR東日本E233系2000番台";}
    else if(x.letter==="S"){owner="TokyoMetro";vehicle="東京メトロ16000系";}
    else if(x.letter==="E"){owner="Odakyu";vehicle="小田急4000形";}
    return {
      operator:owner,vehicleType:vehicle,grade:"C",sourceUrl:SOURCE,
      provenance:"loo-ool Chiyoda/Joban operation-family table",
      observedDate:date,operationCode:String(x.number).padStart(2,"0")+x.letter
    };
  }
  var provider={id:"loo-ool-chiyoda-operation-families-2026",grade:"C",sourceUrl:SOURCE,effectiveDate:EFFECTIVE,resolveEvidence:resolveEvidence};
  if(window.TrainOperationEvidence&&typeof window.TrainOperationEvidence.register==="function")window.TrainOperationEvidence.register(provider);
  else (window.TRAIN_OPERATION_EVIDENCE_PROVIDERS||(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS=[])).push(provider);
})();
