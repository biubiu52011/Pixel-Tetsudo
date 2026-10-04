#!/usr/bin/env node
"use strict";
const fs=require("fs"),vm=require("vm"),assert=require("assert");
const code=fs.readFileSync("data/timetables/train-operation-evidence.js","utf8");
function resolve(records,ctx){
 const sandbox={window:{VEHICLE_OPERATION_EVIDENCE:records},console:{debug(){}}};
 vm.createContext(sandbox); vm.runInContext(code,sandbox);
 const p=sandbox.window.TRAIN_OPERATION_EVIDENCE_PROVIDERS.find(x=>x.id==="canonical-vehicle-operation-evidence");
 return p.resolveEvidence("X",ctx);
}
const base={networkKey:"iketama",validDate:"2026-09-23",operationCode:"08",operator:"TOKYU",grade:"C",sourceUrl:"https://example.test"};
assert.equal(resolve([
 {...base,vehicleType:"東急1000系",formationIds:["1013F"],ambiguityGroup:"2026-09-23-08"},
 {...base,vehicleType:"東急1000系1500番台",formationIds:["1507F"],ambiguityGroup:"2026-09-23-08"}
],{serviceDate:"2026-09-23",operationCode:"08",lineId:"iketama"}),null,"ambiguous identities must not first-match");
let r=resolve([
 {...base,vehicleType:"東急1000系",formationIds:["1013F"],validFromTime:"05:00",validToTime:"12:00"},
 {...base,vehicleType:"東急1000系1500番台",formationIds:["1507F"],validFromTime:"12:00",validToTime:"23:59"}
],{serviceDate:"2026-09-23",serviceTime:"13:00",operationCode:"08",lineId:"iketama"});
assert.equal(r.vehicleType,"東急1000系1500番台");
r=resolve([{...base,vehicleType:"小田急1000形 / 小田急3000形",formationIds:["1057F","3276F"]}],
 {serviceDate:"2026-09-23",operationCode:"08",lineId:"iketama"});
assert.equal(r.formationId,"1057F / 3276F","mixed consist must remain one observation");
console.log("canonical evidence ambiguity tests: PASS");
