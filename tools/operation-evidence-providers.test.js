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

(function(){
  // The line-specific mapping scripts were registered but formerly ignored by
  // TrainOperationEvidence.resolveEvidence(). Exercise the public ODPT train
  // number -> registered script -> canonical vehicle model route end-to-end.
  const sandbox={window:{TRAIN_OPERATION_EVIDENCE_PROVIDERS:[]},console:{debug(){}}};
  vm.createContext(sandbox);
  [
    "data/timetables/train-operation-evidence.js",
    "data/timetables/asakusa-operation-evidence-2026.js",
    "data/timetables/chiyoda-operation-evidence-2026.js",
    "data/timetables/meguro-operation-evidence-2026.js",
    "data/timetables/toyoko-operation-evidence-2026.js",
    "data/timetables/tozai-operation-evidence-2026.js",
    "data/timetables/keiyo-operation-evidence.js"
  ].forEach(path=>vm.runInContext(fs.readFileSync(path,"utf8"),sandbox,{filename:path}));
  // Exercise the existing canonical artwork selector too, not just the
  // operation provider's text label. Without this the UI can still be grey
  // even when the number-to-model script returns a non-empty vehicle type.
  vm.runInContext(fs.readFileSync("js/train-vehicle.js","utf8"),sandbox,
    {filename:"js/train-vehicle.js"});
  const evidence=sandbox.window.TrainOperationEvidence;
  const live=(n,line,railway,serviceDate="2026-10-13")=>
    evidence.resolveEvidence(n,{lineId:line,railway,serviceDate},"realtime-derived");
  let v=live("1849T","Asakusa","Toei.Asakusa");
  assert(v && v.vehicleType==="都営5500形" && v.decisive,
    "ODPT Asakusa train number must pass the existing Toei operation model script");
  v=live("1831S","TokyoMetro.Chiyoda","TokyoMetro.Chiyoda");
  assert(v && v.vehicleType==="東京メトロ16000系" && v.decisive,
    "ODPT Chiyoda working number must use the registered owner/model script");
  v=live("631","Tokyu.Meguro","Tokyu.Meguro");
  assert(v && v.vehicleType==="相鉄21000系(8両)" && v.decisive,
    "ODPT Meguro operation number must use the registered sourced model script");
  v=live("507K","TokyoMetro.Tozai","TokyoMetro.Tozai");
  assert(v && v.vehicleType==="JR E231系800番台(10両)" && v.decisive,
    "Tozai ODPT train number must normalize to working number before script matching");
  assert.strictEqual(live("1849T","Mita","Toei.Mita"),null,
    "an Asakusa working code must not reassign a Mita train to Asakusa");
  assert.strictEqual(live("ODPT2898","Arakawa","Toei.Arakawa"),null,
    "an Arakawa service identifier must not become a guessed physical tram model");

  assert.strictEqual(live("1849T","Asakusa","Toei.Asakusa","2026-01-01"),null,
    "line-specific mappings must respect their effective date");
  const cases=[
    ["1849T","Asakusa","Toei.Asakusa","都営5500形","都営地下鉄_5500形.png"],
    ["1831S","Chiyoda","TokyoMetro.Chiyoda","東京メトロ16000系","東京メトロ_16000系.png"],
    ["1812K","Chiyoda","TokyoMetro.Chiyoda","JR東日本E233系2000番台","JR東日本_E233系_2000番台.png"],
    ["1845E","Chiyoda","TokyoMetro.Chiyoda","小田急4000形","小田急電鉄_4000形_標準色.png"],
    ["631","Meguro","Tokyu.Meguro","相鉄21000系(8両)","相模鉄道_21000系.png"],
    ["95G","Toyoko","Tokyu.Toyoko","相鉄20000系(10両)","相模鉄道_20000系_YOKOHAMA_NAVYBLUE.png"],
    ["507K","Tozai","TokyoMetro.Tozai","JR E231系800番台(10両)","JR東日本_E231系_800番台.png"],
    ["650T","Tozai","TokyoMetro.Tozai","東葉高速2000系(10両)","東葉高速鉄道_2000系.png"]
  ];
  const toNative=x=>JSON.parse(JSON.stringify(x));
  for(const [number,line,railway,expectedModel,png] of cases){
    const evidenceHit=live(number,line,railway);
    assert(evidenceHit && evidenceHit.vehicleType===expectedModel && evidenceHit.decisive,
      line+" "+number+" must return sourced, decisive model evidence");
    const resolved=sandbox.window.TrainVehicle.resolve(toNative({
      lineId:line,operator:"Toei",railway:"odpt.Railway:"+railway,
      trainNumber:number,serviceDate:"2026-10-13",
      realtimeDerivedVehicleType:evidenceHit.vehicleType
    }));
    assert.strictEqual(resolved.identityStatus,"EXACT",number+" identity");
    assert(resolved.iconPath && resolved.iconPath.endsWith("/"+png),
      number+" selected model has no canonical PNG");
    assert(fs.existsSync(resolved.iconPath.replace("../","")),
      number+" canonical PNG does not exist in Git repository");
    const marker=sandbox.window.TrainVehicle.selectMarkerArtwork(toNative({
      vehicleResolvedUpstream:true,vehicleIconPath:resolved.iconPath
    }),false);
    assert.strictEqual(marker.kind,"vehicle",number+" renderer must select PNG instead of grey marker");
  }
  // All Toei-owned Shinjuku trains share a model, but the artwork archive
  // distinguishes 1/2nd and 3rd+ generations. Without a dated carset it is
  // false to assign either specific PNG; do not make CI green by guessing.
  const shinjuku=sandbox.window.TrainVehicle.resolve(toNative({
    lineId:"Shinjuku",operator:"Toei",trainOwner:"odpt.Operator:Toei",
    railway:"odpt.Railway:Toei.Shinjuku",trainNumber:"1705T"
  }));
  assert.strictEqual(shinjuku.name,"都営10-300形");
  assert.strictEqual(shinjuku.identityStatus,"EXACT");
  assert.strictEqual(shinjuku.iconPath,"");
  console.log("ODPT number -> existing model -> certified PNG -> marker: 8 PASS");
  console.log("ODPT number -> existing line-script -> canonical model: 7 PASS");
})();
