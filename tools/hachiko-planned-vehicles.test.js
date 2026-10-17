'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const line=JSON.parse(fs.readFileSync('data/core/railway_data.json')).lines.Hachiko;
const c={window:{},console:{debug(){},warn(){}}};vm.createContext(c);
for(const f of ['data/timetables/vehicle-operation-evidence-data.js','js/train-vehicle.js','data/timetables/Hachiko-manual.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
const api=c.window.TrainVehicle,expected=n=>/D$/.test(n)?['HB-E220系（八高線）']:['E231系3000番台','209系3500番台'];
function live(n,extra={}){return api.resolveRealtime({lineId:'Hachiko',operator:'JR-East',railway:'odpt.Railway:JR-East.Hachiko',trainNumber:n,trainType:'odpt.TrainType:JR-East.Local',serviceDate:'2026-10-17',...extra}).vehicleResult;}
function sql(n,label=''){return api.resolveTimetableRun({trainNumber:n},{'odpt:trainNumber':n,'odpt:trainType':'odpt.TrainType:JR-East.Local',_positionSource:'supabase-train-run',_sqlVehicleCandidateLabel:label},'Hachiko',line,'2026-10-17').vehicleResult;}
function check(v,n){assert(v.vehiclePlan,n+' plan');assert.deepEqual(Array.from(v.vehiclePlan.models),expected(n));const m=api.selectMarkerArtwork({vehicleResolution:v,vehicleResolvedUpstream:v.identityStatus==='EXACT',vehiclePlan:v.vehiclePlan,vehicleIconPath:v.iconPath||''},false);assert.equal(m.kind,'vehicle');assert.equal(m.planned,true);assert(fs.existsSync(v.vehiclePlan.iconPath.slice(3)));assert.equal(v.vehiclePlan.formationId,'');if(/D$/.test(n))assert(v.vehiclePlan.iconPath.includes('HB-E220系_八高線'));else assert(v.vehiclePlan.iconPath.includes('E231系_3000番台'));}
for(const n of ['1166E','1269E','1278E','230D','235D'])for(const v of [live(n),sql(n),sql(n,'209系3000番台')])check(v,n);
const normalize=s=>s.replace(/-/g,'');const southern=new Set(line.stations.slice(0,9).map(normalize)),northern=new Set(line.stations.slice(8).map(normalize));
let checked=0;
for(const tt of c.window.Hachiko_MANUAL_TIMETABLES){const n=tt['odpt:trainNumber'];assert(!tt.vehicleType.includes('209系3000'));for(const stop of tt['odpt:trainTimetableObject']){const s=(stop['odpt:departureStation']||stop['odpt:arrivalStation']).split('.').pop();assert((/D$/.test(n)?northern:southern).has(normalize(s)),n+' physical route boundary '+s);}for(const v of [live(n),sql(n,tt.vehicleType)]){check(v,n);checked++;}}
assert.equal(checked,596);
assert(!live('9999E').vehiclePlan,'unlisted E not inferred');assert(!live('9999D').vehiclePlan,'unlisted D not inferred');
assert(!live('1166E',{trainType:'odpt.TrainType:JR-East.LimitedExpress'}).vehiclePlan,'type boundary');
assert(!live('230D',{serviceDate:'2026-03-13'}).vehiclePlan,'do not backdate the post-revision hybrid plan');
const actual=live('1166E',{realtimeVehicleType:'209系3500番台'});assert.equal(actual.name,'209系3500番台');assert(!actual.vehiclePlan);
assert.equal(c.window.TrainIcons.resolveVehicleArtwork('HB-E220系（八高線）'),null,'planned region representative is not observed carset artwork');
console.log('Hachiko:298rows x realtime/SQL final PNG PASS; electric/northern station boundary, old/blank hints, expiry admission, unknown/type isolation and actual priority PASS');
