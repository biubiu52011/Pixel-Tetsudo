const fs=require("fs"),path=require("path"),assert=require("assert"),vm=require("vm");
const root=path.join(__dirname,"..");
const window={};const ctx={window,console};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,"data/timetables/iketama-formation-evidence.js"),"utf8"),ctx);
const p=window.TRAIN_OPERATION_EVIDENCE_PROVIDERS.find(x=>x.id==="tokyu-iketama-dated-formations");
assert(p,"Ikegami/Tamagawa provider missing");
let r=p.resolveEvidence("01",{serviceDate:"2026-09-23",lineId:"TokyuIkegami"});
assert(r&&r.vehicleType==="東急7000系"&&r.formationId==="7104F","09/23 stable operation must resolve");
assert.strictEqual(p.resolveEvidence("08",{serviceDate:"2026-09-23",lineId:"TokyuIkegami"}),null,
  "09/23 operation 08 changes between 1000 and 1500 subseries; without a reliable boundary it must remain unresolved");
r=p.resolveEvidence("03",{serviceDate:"2026-09-08",lineId:"TokyuTamagawa"});
assert(r&&r.vehicleType==="東急1000系"&&r.formationId==="1020F","existing dated evidence regression");
assert.strictEqual(p.resolveEvidence("01",{serviceDate:"2026-09-23",lineId:"TokyuToyoko"}),null,"wrong line must not resolve");
console.log("Ikegami/Tamagawa formation evidence: PASS");
