const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const {performance}=require('node:perf_hooks');
const read=p=>fs.readFileSync(p,'utf8'), fixture=JSON.parse(read('tests/fixtures/guards/train-har-replay.json'));
const c={window:{},console:{debug(){}},performance};vm.createContext(c);
for(const p of ['js/train-vehicle.js','data/timetables/vehicle-operation-evidence-data.js']) {
  let code=read(p);
  if(p==='js/train-vehicle.js')code=code.replace('var matches=candidateRules.filter(function(r){',
    'var matches=candidateRules.filter(function(r){ window._familyRuleVisits=(window._familyRuleVisits||0)+1;');
  vm.runInContext(code,c);
}
for(const m of read('pages/trains.html').matchAll(/src="\.\.\/(data\/timetables\/[^"?]*operation-evidence[^"?]*\.js)/g))vm.runInContext(read(m[1]),c);
c.window.TrainOperationEvidence.getRevision();
const timings={};
for(const provider of c.window.TrainOperationEvidence.providers){
  const original=provider.resolveEvidence;
  provider.resolveEvidence=function(...args){const start=performance.now();try{return original.apply(this,args);}finally{timings[provider.id]=(timings[provider.id]||0)+performance.now()-start;}};
}
const contexts=fixture.rows.map(row=>({lineId:String(row['odpt:railway']||'').split('.').pop(),
  railway:row['odpt:railway'],operator:String(row['odpt:operator']||'').replace('odpt.Operator:',''),
  trainNumber:row['odpt:trainNumber'],trainOwner:row['odpt:trainOwner']||'',railDirection:row['odpt:railDirection'],
  trainId:row['owl:sameAs']||row['@id'],fromStation:row['odpt:fromStation'],toStation:row['odpt:toStation'],
  destinationStation:row['odpt:destinationStation']||[],trainType:row['odpt:trainType'],
  realtimeVehicleType:row['odpt:vehicleType']||'',serviceDate:'2026-10-17',serviceTime:'19:00',calendarType:'saturday_holiday'}));
const start=performance.now();
const first=contexts.map(ctx=>c.window.TrainVehicle.resolveRealtime(ctx));
const firstMs=performance.now()-start;
const againStart=performance.now();
const again=contexts.map(ctx=>c.window.TrainVehicle.resolveRealtime(ctx));
assert.equal(JSON.stringify(first),JSON.stringify(again),'identical HAR replay preserves all decisions and evidence');
const digest=require('crypto').createHash('sha256').update(JSON.stringify(first)).digest('hex');
assert.equal(digest,'8a646b8babe0fe3006e9439211f7fd2266e320b4953279885e48930a73a91e18','all 429 captured model/evidence/PNG decisions match pre-index output');
assert(c.window._familyRuleVisits<10000,'HAR family-rule evaluation budget exceeded');
console.log(JSON.stringify({familyRuleVisits:c.window._familyRuleVisits,rows:contexts.length,firstMs:Math.round(firstMs),repeatMs:Math.round(performance.now()-againStart),providers:timings,sha256:require('crypto').createHash('sha256').update(JSON.stringify(first)).digest('hex')},null,2));


// Replacement snapshots and alias revocation invalidate the network rule index.
const evidence=c.window.TrainOperationEvidence;
c.window.VEHICLE_FAMILY_RULES=[{networkKey:'benchmark-domain',codePattern:'*',exactVehicleType:'E353系',grade:'B',sourceUrl:'https://example.test/rule'}];
const input={lineId:'unlinked',serviceDate:'2026-10-17',calendarType:'saturday_holiday'};
assert.equal(evidence.resolveEvidence('BENCHMARK',input,'planned'),null);
c.window.VEHICLE_NETWORK_ALIASES=[{canonical_network_key:'benchmark-domain',alias_key:'unlinked',alias_scope:'exact'}];
assert.equal(evidence.resolveEvidence('BENCHMARK',input,'planned').vehicleType,'E353系');
c.window.VEHICLE_NETWORK_ALIASES=[];
assert.equal(evidence.resolveEvidence('BENCHMARK',input,'planned'),null,'revoked alias must never reuse a scoped result');
