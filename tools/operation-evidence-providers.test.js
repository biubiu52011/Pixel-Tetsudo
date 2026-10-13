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
assert.strictEqual(hit(p,"050-001","2026-10-03","TokyoMetro.Hanzomon"),null);
assert.strictEqual(hit(p,"057-102","2026-10-03","TokyoMetro.Hanzomon"),null);
assert.strictEqual(hit(p,"026-081","2026-10-03","Denentoshi"),null);

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
r=hit(p,"95G","2026-10-02","Tokyu.Toyoko");
assert(r&&r.operator==="Sotetsu"&&r.vehicleType==="相鉄20000系(10両)");
assert.strictEqual(hit(p,"99G","2026-10-02","Tokyu.Toyoko"),null);
assert.strictEqual(hit(p,"99M","2026-10-02","Tokyu.Toyoko"),null);
assert.strictEqual(hit(p,"99S","2026-10-02","Tokyu.Toyoko"),null);
r=hit(p,"95G","2026-10-02","Tokyu.ShinYokohama");
assert(r && r.operator==="Sotetsu" && /20000/.test(r.vehicleType));
assert.strictEqual(hit(p,"95G","2026-10-02","TokyoMetro.Ginza"),null);

p=load("data/timetables/asakusa-operation-evidence-2026.js");
r=hit(p,"21T","2026-10-03","Toei.Asakusa");
assert(r&&r.operator==="Toei"&&r.vehicleType==="都営5500形");
r=hit(p,"73H","2026-10-03","Toei.Asakusa");
assert(r&&r.operator==="Keikyu"&&!r.vehicleType);


(function(){
 const providers=[],sandbox={window:{TRAIN_OPERATION_EVIDENCE_PROVIDERS:providers},console:{debug:function(){},log:function(){},warn:function(){},error:function(){}}};
 vm.createContext(sandbox);
 vm.runInContext(fs.readFileSync("data/timetables/vehicle-operation-evidence-data.js","utf8"),sandbox);
 vm.runInContext(fs.readFileSync("data/timetables/train-operation-evidence.js","utf8"),sandbox);
 const cp=providers.find(x=>x.id==="canonical-vehicle-operation-evidence");
 assert(cp);
 let x=cp.resolveEvidence("TMW001D",{serviceDate:"2026-04-10",lineId:"TokyoMonorail"});
 assert(x&&x.operationCode==="03"&&x.vehicleType==="10000形"&&x.formationId==="51F");
 assert.strictEqual(cp.resolveEvidence("TMW002D",{serviceDate:"2026-04-10",lineId:"TokyoMonorail"}),null);
 assert.strictEqual(cp.resolveEvidence("TMW001D",{serviceDate:"2026-04-11",lineId:"TokyoMonorail"}),null);
})();

// Realtime ODPT vehicle mapping reuses the canonical dated providers.
// Only an exact, same-day public train number may attach a physical carset:
// identical working numbers on other trains are not a proof of ownership.
(function(){
 const rows=[{
   networkKey:"test-odpt",validDate:"2026-10-13",operationCode:"03K",
   operator:"Example",vehicleType:"Example1000系",formationIds:["101F"],
   trainNumbers:["1203K"],validFromTime:"05:00",validToTime:"13:00",
   grade:"C",sourceUrl:"https://example.test/proof",observedDate:"2026-10-13"
 }];
 const dated=[{
   networkKey:"test-odpt",validDate:"2026-10-13",trainNumber:"5707K",
   operationCode:"07K",operator:"Example",vehicleType:"Example2000系",
   formationIds:["201F"],grade:"C",sourceUrl:"https://example.test/dated"
 }];
 const sandbox={window:{
   VEHICLE_OPERATION_EVIDENCE:rows,VEHICLE_DATED_EVIDENCE:dated,
   VEHICLE_REFERENCE_RULES:[],VEHICLE_FAMILY_RULES:[]
 },console:{debug(){}}};
 vm.createContext(sandbox);
 vm.runInContext(fs.readFileSync("data/timetables/train-operation-evidence.js","utf8"),sandbox);
 const resolve=sandbox.window.TrainOperationEvidence.resolveEvidence;
 const ctx={lineId:"test-odpt",serviceDate:"2026-10-13",serviceTime:"11:30",operationCode:"03K"};
 let hit=resolve("1203K",ctx,"realtime-derived");
 assert(hit&&hit.vehicleType==="Example1000系"&&hit.formationId==="101F"&&hit.decisive,
   "exact dated ODPT train may reuse the verified model/formation");
 assert.strictEqual(resolve("9999K",ctx,"realtime-derived"),null,
   "reused operation code must not impersonate an observed physical train");
 assert.strictEqual(resolve("1203K",{...ctx,serviceDate:"2026-10-14"},"realtime-derived"),null,
   "historical carset must not propagate to a later day");
 assert.strictEqual(resolve("1203K",{...ctx,serviceTime:"14:00"},"realtime-derived"),null,
   "time-segment mismatch must not reuse a previous formation");
 hit=resolve("5707K",{...ctx,operationCode:"07K"},"realtime-derived");
 assert(hit&&hit.vehicleType==="Example2000系"&&hit.formationId==="201F",
   "a dated train-number rule should reach realtime through the existing provider");
 assert(resolve("9999K",ctx,"fallback")&&
   resolve("9999K",ctx,"fallback").vehicleType==="Example1000系",
   "timetable fallback keeps its existing operation-code policy");
 rows.push({...rows[0],vehicleType:"Example3000系",formationIds:["301F"]});
 assert.strictEqual(resolve("1203K",ctx,"realtime-derived"),null,
   "conflicting realtime carset evidence must fail closed");
 rows.pop();
 dated.push({...dated[0],trainNumber:"1203K",vehicleType:"Example1000系",
   formationIds:["999F"]});
 assert.strictEqual(resolve("1203K",ctx,"realtime-derived"),null,
   "same-model contradictory dated formations must also fail closed");
})();
console.log("ODPT dated train-number vehicle evidence: 8 PASS");
console.log("operation evidence providers: PASS");