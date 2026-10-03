/*
 * Pixel Tetsudo - Odakyu 2026 operation-group vehicle constraints
 * v4.3.1096
 * Source: Yozakura Room, Odakyu operation table after the 2026-03 timetable revision.
 * Group evidence narrows fleet candidates; only a single-model group may establish EXACT.
 */
(function(){"use strict";
var SOURCE="https://yozakura-room.net/oerunyo/";
var TRAIN_MAP_SOURCE="https://w.atwiki.jp/oerunyo2025/pages/19.html";
var EFFECTIVE="2026-03-14";
function network(ctx){return /Odawara|OdakyuTama|OdakyuEnoshima|小田急|江ノ島/i.test([ctx.lineId,ctx.railway,ctx.operator].join("|"));}
var WEEKDAY_TRAIN_TO_OPERATION={
 "7004":"A11","7005":"A11","7012":"A11","7013":"A11",
 "6021":"C11",
 "4300":"C12","6037":"C12","9172":"C12","4039":"C12","4032":"C12","2219":"C12","9266":"C12",
 "9155":"C13","4310":"C13","4035":"C13",
 "1202":"C14","9159":"C14","6002":"C14","6033":"C14","2210":"C14","2017":"C14","2028":"C14","2213":"C14","9234":"C14",
 "9111":"C15","2200":"C15","6025":"C15","4008":"C15","2209":"C15","9208":"C15",
 "9101":"C16","6000":"C16","2215":"C16","9244":"C16",
 "9133":"C17","2204":"C17","6035":"C17","9213":"C17","9174":"C17","6028":"C17",
 "6009":"C18",
 "4308":"C19","4065":"C19",
 "4304":"C20","6031":"C20","9225":"C20",
 "9125":"C21","4302":"C21","4063":"C21",
 "6515":"C22","4318":"C22",
 "6027":"C23","6026":"C23","4049":"C23","9218":"C23","9220":"C23"
};
function mappedOperation(trainNumber,ctx){
 var date=String(ctx.serviceDate||"").slice(0,10); if(!date)return "";
 var d=new Date(date+"T12:00:00Z"),day=d.getUTCDay();
 if(day===0||day===6)return "";
 return WEEKDAY_TRAIN_TO_OPERATION[String(trainNumber||"").replace(/\D/g,"")]||"";
}
function op(raw){
 var m=String(raw||"").toUpperCase().trim().match(/(?:^|[^A-Z0-9])([ABCE])(\d{1,2})(?:[^A-Z0-9]|$)/);
 return m?{group:m[1],number:parseInt(m[2],10)}:null;
}
function resolveEvidence(trainNumber,ctx){
 ctx=ctx||{};var date=String(ctx.serviceDate||"").slice(0,10);
 if(!date||date<EFFECTIVE||!network(ctx))return null;
 var mapped=mappedOperation(trainNumber,ctx);\n var x=op(ctx.operationCode)||op(trainNumber)||op(mapped);if(!x)return null;
 var c=[],exact="";
 if(x.group==="A"&&x.number>=11&&x.number<=34)c=["小田急3000形","小田急8000形"];
 else if(x.group==="B"&&x.number>=11&&x.number<=18)c=["小田急1000形","小田急3000形"];
 else if(x.group==="B"&&x.number>=21&&x.number<=29)c=["小田急1000形","小田急2000形"];
 else if(x.group==="C"&&x.number>=11&&x.number<=23){c=["小田急4000形"];exact="小田急4000形";}
 else if(x.group==="E")c=["小田急1000形","小田急3000形","小田急5000形","小田急8000形"];
 else return null;
 return {operator:"Odakyu",vehicleType:exact,vehicleCandidates:c,grade:"C",sourceUrl:SOURCE,
  provenance:"2026 Odakyu operation-group fleet constraints / verified train-number mapping",observedDate:date,operationCode:x.group+String(x.number).padStart(2,"0")};
}
var p={id:"odakyu-operation-groups-2026",grade:"C",sourceUrl:SOURCE,effectiveDate:EFFECTIVE,resolveEvidence:resolveEvidence};
if(window.TrainOperationEvidence&&typeof window.TrainOperationEvidence.register==="function")window.TrainOperationEvidence.register(p);
else (window.TRAIN_OPERATION_EVIDENCE_PROVIDERS||(window.TRAIN_OPERATION_EVIDENCE_PROVIDERS=[])).push(p);
})();