#!/usr/bin/env node
"use strict";
const fs=require("fs"),vm=require("vm"),assert=require("assert");
const code=fs.readFileSync("data/timetables/train-operation-evidence.js","utf8");
function resolve(records,ctx,aliases){
 const sandbox={window:{VEHICLE_OPERATION_EVIDENCE:records,VEHICLE_NETWORK_ALIASES:aliases||[]},console:{debug(){}}};
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
const west={...base,networkKey:"seibu-shinjuku",validDate:"2026-04-17",operationCode:"A12",
 vehicleType:"西武40000系",formationIds:["40103F"]};
assert.equal(resolve([west],{serviceDate:"2026-04-17",operationCode:"A12",lineId:"SeibuShinjuku"}).formationId,
 "40103F","punctuation in the SQL network key must not hide confirmed carsets");
assert.equal(resolve([west],{serviceDate:"2026-10-12",operationCode:"A12",lineId:"SeibuShinjuku"}),null,
 "historical physical formations must not be reused for today's timetable");
const alias=[{alias_key:"Ikebukuro",canonical_network_key:"seibu-ikebukuro",alias_scope:"evidence_domain"}];
const ike={...west,networkKey:"seibu-ikebukuro"};
assert.equal(resolve([ike],{serviceDate:"2026-04-17",operationCode:"A12",lineId:"Ikebukuro"},alias).formationId,
 "40103F","canonical alias must come from SQL evidence-domain configuration");
assert.equal(resolve([ike],{serviceDate:"2026-04-17",operationCode:"A12",lineId:"Tojo"},alias),null,
 "unrelated lines must never inherit another operator's observed carset");
console.log("canonical evidence ambiguity tests: PASS");
