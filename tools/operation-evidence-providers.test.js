const fs=require("fs"),vm=require("vm"),assert=require("assert");
function load(path){
 const providers=[]; const sandbox={window:{TRAIN_OPERATION_EVIDENCE_PROVIDERS:providers}};
 vm.createContext(sandbox); vm.runInContext(fs.readFileSync(path,"utf8"),sandbox);
 return providers[0];
}
function hit(p,n,date,line){return p.resolveEvidence(n,{serviceDate:date,lineId:line});}

let p=load("data/timetables/denentoshi-operation-evidence-2026.js");
let r=hit(p,"50T","2026-10-03","TokyoMetro.Hanzomon");
assert(r&&r.operator==="Tobu"&&!r.vehicleType);
r=hit(p,"57S","2026-10-03","TokyoMetro.Hanzomon");
assert(r&&r.operator==="TokyoMetro"&&!r.vehicleType);
assert.strictEqual(hit(p,"50T","2026-10-03","TokyoMetro.Ginza"),null);

p=load("data/timetables/chiyoda-operation-evidence-2026.js");
assert.strictEqual(hit(p,"12K","2026-10-03","TokyoMetro.Chiyoda").vehicleType,"JR東日本E233系2000番台");
assert.strictEqual(hit(p,"31S","2026-10-03","TokyoMetro.Chiyoda").vehicleType,"東京メトロ16000系");
assert.strictEqual(hit(p,"45E","2026-10-03","TokyoMetro.Chiyoda").vehicleType,"小田急4000形");
assert.strictEqual(hit(p,"31S","2026-03-01","TokyoMetro.Chiyoda"),null);

p=load("data/timetables/meguro-operation-evidence-2026.js");
r=hit(p,"631","2026-10-03","Tokyu.Meguro");
assert(r&&r.operator==="Sotetsu"&&r.vehicleType==="相鉄21000系(8両)");
r=hit(p,"631","2026-10-03","Tokyu.ShinYokohama"); // meguro axis
assert(r&&r.operator==="Sotetsu"&&r.vehicleType==="相鉄21000系(8両)");

p=load("data/timetables/toyoko-operation-evidence-2026.js");
r=hit(p,"95G","2026-10-03","Tokyu.Toyoko");
assert(r&&r.operator==="Sotetsu"&&r.vehicleType==="相鉄20000系(10両)");
assert.strictEqual(hit(p,"99G","2026-10-03","Tokyu.Toyoko"),null);
assert.strictEqual(hit(p,"99M","2026-10-03","Tokyu.Toyoko"),null);
assert.strictEqual(hit(p,"99S","2026-10-03","Tokyu.Toyoko"),null);
r=hit(p,"95G","2026-10-03","Tokyu.ShinYokohama");
assert(r && r.operator==="Sotetsu" && /20000/.test(r.vehicleType));
assert.strictEqual(hit(p,"95G","2026-10-03","TokyoMetro.Ginza"),null);

p=load("data/timetables/asakusa-operation-evidence-2026.js");
r=hit(p,"21T","2026-10-03","Toei.Asakusa");
assert(r&&r.operator==="Toei"&&r.vehicleType==="都営5500形");
r=hit(p,"73H","2026-10-03","Toei.Asakusa");
assert(r&&r.operator==="Keikyu"&&!r.vehicleType);

console.log("operation evidence providers: PASS");