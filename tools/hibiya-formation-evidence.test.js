const fs=require("fs"),vm=require("vm"),assert=require("assert");
const providers=[],sandbox={window:{TRAIN_OPERATION_EVIDENCE_PROVIDERS:providers}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync("data/timetables/hibiya-formation-evidence.js","utf8"),sandbox);
const p=providers[0],ctx={serviceDate:"2026-04-16",lineId:"TokyoMetro.Hibiya"};
function hit(n){return p.resolveEvidence(n,ctx);}
let r=hit("66S");assert(r&&r.operator==="Tobu"&&r.vehicleType==="東武70000系"&&r.formationId==="7000012F");
r=hit("21T");assert(r&&r.operator==="TokyoMetro"&&r.vehicleType==="東京メトロ13000系"&&r.formationId==="1300059F");
r=hit("27T");assert(r&&r.vehicleType==="東武70090型"&&r.formationId==="7009092F");
r=hit("24S");assert(r&&r.vehicleType==="東京メトロ13000系"&&r.formationId.includes("/"));
assert.strictEqual(p.resolveEvidence("66S",{serviceDate:"2026-04-17",lineId:"TokyoMetro.Hibiya"}),null);
assert.strictEqual(p.resolveEvidence("66S",{serviceDate:"2026-04-16",lineId:"TokyoMetro.Ginza"}),null);
console.log("hibiya formation provider: PASS");