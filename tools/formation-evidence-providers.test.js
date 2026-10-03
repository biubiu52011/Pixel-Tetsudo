const fs=require("fs"),vm=require("vm"),assert=require("assert");
function load(path){
 const providers=[];const sandbox={window:{TRAIN_OPERATION_EVIDENCE_PROVIDERS:providers}};
 vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path,"utf8"),sandbox);
 return providers[0];
}
function hit(p,n,date,line){return p.resolveEvidence(n,{serviceDate:date,lineId:line});}

let p=load("data/timetables/hanzomon-formation-evidence.js");
let r=hit(p,"63S","2026-04-13","TokyoMetro.Hanzomon");
assert(r&&r.vehicleType==="東京メトロ18000系"&&r.formationId==="18101F");
r=hit(p,"57S","2026-04-13","TokyoMetro.Hanzomon");
assert(r&&r.vehicleType==="東京メトロ18000系"&&r.formationId.includes("/"));
assert.strictEqual(hit(p,"63S","2026-04-14","TokyoMetro.Hanzomon"),null);
assert.strictEqual(hit(p,"63S","2026-04-13","TokyoMetro.Ginza"),null);

p=load("data/timetables/saikyo-formation-evidence.js");
r=hit(p,"77","2026-04-03","JR-East.Saikyo");
assert(r&&r.vehicleType==="相鉄12000系"&&r.formationId==="12104F");
r=hit(p,"85","2026-04-03","TWR.Rinkai");
assert(r&&r.vehicleType==="東京臨海高速鉄道71-000形"&&r.formationId==="Z12");
r=hit(p,"81","2026-04-04","TWR.Rinkai");
assert(r&&r.vehicleType==="東京臨海高速鉄道70-000形"&&r.formationId==="Z2");
assert.strictEqual(hit(p,"77","2026-04-04","JR-East.Saikyo"),null);
assert.strictEqual(hit(p,"85","2026-04-03","TokyoMetro.Ginza"),null);

console.log("formation evidence providers: PASS");