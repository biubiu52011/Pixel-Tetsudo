const fs=require("fs"),path=require("path"),assert=require("assert"),vm=require("vm");
const window={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,"..","data/timetables/seibu-shinjuku-formation-evidence.js"),"utf8"),{window,console});
const p=window.TRAIN_OPERATION_EVIDENCE_PROVIDERS.find(x=>x.id==="seibu-shinjuku-dated-trains");assert(p);
function r(n){return p.resolveEvidence(n,{lineId:"SeibuShinjuku",serviceDate:"2026-04-17"});}
assert(r("2601").vehicleType==="西武30000系"&&r("2601").formationId==="30105F");
assert(r("2603").vehicleType==="西武6000系"&&r("2603").formationId==="6104F");
assert(r("6017").vehicleType==="西武9000系");
assert(r("6622").vehicleType==="西武8000系");
assert(r("602").vehicleType==="西武40000系");
assert(r("102").vehicleType==="西武10000系");
let r8=p.resolveEvidence("2601",{lineId:"SeibuShinjuku",serviceDate:"2026-04-08"});assert(r8&&r8.vehicleType==="西武20000系"&&r8.formationId==="20108F","2601 must be date-scoped: 4/8 is 20000");
let r9=p.resolveEvidence("2601",{lineId:"SeibuShinjuku",serviceDate:"2026-04-09"});assert(r9&&r9.vehicleType==="西武20000系"&&r9.formationId==="20105F","2601 4/9 formation");
let r13=p.resolveEvidence("2803",{lineId:"SeibuShinjuku",serviceDate:"2026-04-13"});assert(r13&&r13.vehicleType==="西武40000系"&&r13.formationId==="40103F","4/13 2803");
assert.strictEqual(p.resolveEvidence("2601",{lineId:"SeibuShinjuku",serviceDate:"2026-04-18"}),null);
assert.strictEqual(p.resolveEvidence("2601",{lineId:"SeibuIkebukuro",serviceDate:"2026-04-17"}),null);
console.log("Seibu Shinjuku dated vehicle evidence: PASS");