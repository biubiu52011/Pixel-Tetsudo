const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync('data/timetables/oimachi-formation-evidence.js','utf8');
const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(src,sandbox);
const p=sandbox.window.TRAIN_OPERATION_EVIDENCE_PROVIDERS[0];
function r(n,d='2026-04-16',line='TokyuOimachi'){return p.resolveEvidence(n,{serviceDate:d,lineId:line,railway:line});}
let x=r('103');assert.equal(x.vehicleType,'東急6020系(5両)');assert.equal(x.formationId,'602055F');
x=r('101');assert.equal(x.vehicleType,'東急9020系');assert.equal(x.formationId,'902021F');
x=r('132');assert.equal(x.vehicleType,'東急6000系');assert.equal(x.formationId,'600001F');
x=r('133');assert.equal(x.vehicleType,'東急6020系(7両)');assert.equal(x.formationId,'602022F');
assert.equal(r('103','2026-04-15'),null);
assert.equal(r('103','2026-04-16','TokyuToyoko'),null);
console.log('Oimachi formation evidence: PASS');