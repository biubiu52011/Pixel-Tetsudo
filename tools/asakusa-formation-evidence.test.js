const fs=require("fs"),vm=require("vm"),assert=require("assert");
function load(path){
 const providers=[];const sandbox={window:{TRAIN_OPERATION_EVIDENCE_PROVIDERS:providers}};
 vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path,"utf8"),sandbox);
 return providers[0];
}
const p=load("data/timetables/asakusa-formation-evidence.js");
const net={serviceDate:"2026-04-12",lineId:"Toei.Asakusa"};
let r=p.resolveEvidence("73H",net);
assert(r&&r.vehicleType==="京急600形"&&r.formationId==="607F");
r=p.resolveEvidence("01K",net);
assert(r&&r.vehicleType==="京成3100形"&&r.formationId==="3154F");
r=p.resolveEvidence("03K",net);
assert(r&&r.vehicleType==="京成3100形"&&r.formationId.includes("/"));
assert.strictEqual(p.resolveEvidence("73H",{serviceDate:"2026-04-13",lineId:"Toei.Asakusa"}),null);
assert.strictEqual(p.resolveEvidence("73H",{serviceDate:"2026-04-12",lineId:"TokyoMetro.Ginza"}),null);
console.log("asakusa formation provider: PASS");