const fs=require('fs'),vm=require('vm'),assert=require('assert');
const s={window:{},console:{debug(){}}};vm.createContext(s);
for(const p of ['js/train-vehicle.js','data/timetables/vehicle-operation-evidence-data.js','js/train-vehicle.js'])vm.runInContext(fs.readFileSync(p,'utf8'),s,{filename:p});
const db=JSON.parse(fs.readFileSync('data/timetables/vehicle-operation-evidence.json'));
const lines=['KeihinTohoku','Yokohama','Sagami','Senseki','Tsurumi','TsurumiOkawa','TsurumiUmiShibaura'];
const refs=db.referenceRules.filter(r=>lines.includes(r.networkKey)&&r.effectiveFrom==='2026-10-15');
assert.equal(refs.length,2916);
const ev=s.window.TrainOperationEvidence,v=s.window.TrainVehicle;
for(const r of refs){
 const ctx={lineId:r.networkKey,serviceDate:'2026-10-15',calendarType:r.calendarType};
 for(const mode of ['fallback','realtime-derived']){
  const e=ev.resolveEvidence(r.trainNumber,ctx,mode);
  assert(e&&e.vehicleType===r.vehicleType,r.networkKey+' '+r.trainNumber+' '+r.calendarType);
  assert.equal(e.evidenceRole,'timetable-reference');assert(!e.formationId);
  const model=v.resolve({timetableVehicleType:e.vehicleType,serviceDate:ctx.serviceDate});
  assert.equal(model.identityStatus,'EXACT');assert.equal(model.name,r.vehicleType);
  assert(fs.existsSync(model.iconPath.replace(/^\.\.\//,'')));
 }
 assert.equal(ev.resolveEvidence(r.trainNumber,{...ctx,serviceDate:'2026-12-01'},'fallback'),null);
}
function hit(line,no,cal='weekday'){return ev.resolveEvidence(no,{lineId:line,serviceDate:'2026-10-15',calendarType:cal},'fallback');}
assert.equal(hit('KeihinTohoku','1000A').vehicleType,'E233系1000番台');
assert.equal(hit('KeihinTohoku','1005K','holiday').vehicleType,'E233系6000番台');
assert.equal(hit('Yokohama','1005K','holiday').vehicleType,'E233系6000番台');
assert.equal(hit('KeihinTohoku','516K'),null,'no published continuation proof');
assert.equal(hit('KeihinTohoku','532K','holiday'),null,'no published continuation proof');
for(const [line,no]of [['Senseki','5520D'],['SensekiTohoku','5520D'],['Yokohama','999999K'],['Sagami','999999F'],['Tsurumi','999999']])assert.equal(hit(line,no),null);
assert.equal(hit('KeihinTohoku','1000A','special'),null);
assert.equal(v.resolve({realtimeVehicleType:'E233系6000番台'}).name,'E233系6000番台');
console.log('JR exact train/calendar references, native PNG, expiry, through-network isolation: PASS ('+refs.length+' references)');
