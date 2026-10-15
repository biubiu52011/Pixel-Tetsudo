const fs=require('fs'),vm=require('vm'),assert=require('assert');
const s={window:{},console:{debug(){}}};vm.createContext(s);
for(const p of ['js/train-vehicle.js','data/timetables/vehicle-operation-evidence-data.js','data/timetables/train-operation-evidence.js'])
 vm.runInContext(fs.readFileSync(p,'utf8'),s,{filename:p});
const evidence=s.window.TrainOperationEvidence,vehicle=s.window.TrainVehicle;
for(const [line,model]of [['Marunouchi','東京メトロ2000系'],['MarunouchiBranch','東京メトロ2000系'],['Ginza','東京メトロ1000系']]){
 for(const mode of ['fallback','realtime-derived']){
  const e=evidence.resolveEvidence('A849',{lineId:line,serviceDate:'2026-10-15',calendarType:'weekday'},mode);
  assert(e&&e.vehicleType===model&&e.grade==='A');
  assert(!e.formationId,'fleet model never proves a carset');
  const v=vehicle.resolve({timetableVehicleType:e.vehicleType,serviceDate:'2026-10-15'});
  assert.equal(v.identityStatus,'EXACT');assert.equal(v.name,model);
  assert(fs.existsSync(v.iconPath.replace(/^\.\.\//,'')));
  assert.equal(evidence.resolveEvidence('A849',{lineId:line,serviceDate:'2026-12-01'},mode),null);
  assert.equal(evidence.resolveEvidence('A849',{lineId:line,serviceDate:'2026-10-14'},mode),null);
 }
}
for(const line of ['NotMarunouchi','MarunouchiFake','Hanzomon','Namboku']){
 const e=evidence.resolveEvidence('A849',{lineId:line,serviceDate:'2026-10-15'},'fallback');
 assert(!e||!['東京メトロ2000系','東京メトロ1000系'].includes(e.vehicleType));
}
const b=JSON.parse(fs.readFileSync('data/timetables/vehicle-operation-evidence.json'));
for(const r of b.familyRules.filter(r=>['Marunouchi','Ginza'].includes(r.networkKey))){
 assert.equal(r.grade,'A');assert.equal(r.effectiveFrom,'2026-10-15');assert.equal(r.effectiveTo,'2026-11-30');
 assert(r.sourceUrl.startsWith('https://www.tokyometro.jp/'));
}
console.log('Metro current single-family model, branch alias, PNG, dates and scope: PASS');
