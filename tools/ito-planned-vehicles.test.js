'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const line=JSON.parse(fs.readFileSync('data/core/railway_data.json')).lines.Ito;
const c={window:{},console:{debug(){},warn(){}}};vm.createContext(c);
for(const f of ['data/timetables/vehicle-operation-evidence-data.js','js/train-vehicle.js','data/timetables/Ito-manual.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
const api=c.window.TrainVehicle;
function live(n,type,extra={}){return api.resolveRealtime({lineId:'Ito',operator:'JR-East',railway:'odpt.Railway:JR-East.Ito',trainNumber:n,trainType:'odpt.TrainType:JR-East.'+type,serviceDate:'2026-10-17',...extra}).vehicleResult;}
function sql(n,type,label=''){return api.resolveTimetableRun({trainNumber:n},{'odpt:trainNumber':n,'odpt:trainType':'odpt.TrainType:JR-East.'+type,_positionSource:'supabase-train-run',_sqlVehicleCandidateLabel:label},'Ito',line,'2026-10-17').vehicleResult;}
function marker(v){const m=api.selectMarkerArtwork({vehicleResolution:v,vehicleResolvedUpstream:v.identityStatus==='EXACT',vehicleIconPath:v.iconPath||'',vehiclePlan:v.vehiclePlan},false);assert.equal(m.kind,'vehicle');assert.equal(m.planned,true);assert(fs.existsSync(v.vehiclePlan.iconPath.slice(3)));return m;}
const expected=[['5641M','Local',['伊豆急行8000系','伊豆急行3000系','伊豆急行2100系']],['1621M','Local',['E231系1000番台','E233系3000番台']],['1560E','Local',['E231系1000番台','E233系3000番台']],['3025M','LimitedExpress',['E257系2000番台']],['3001M','LimitedExpress',['E261系']],['3002M','LimitedExpress',['E261系']]];
for(const [n,type,models] of expected)for(const v of [live(n,type),sql(n,type),sql(n,type,type==='Local'?'E233系1000番台 / 伊豆急行8000系':'E257系1500番台（踊り子）')]){assert.deepEqual(Array.from(v.vehiclePlan.models),models);marker(v);assert.equal(v.vehiclePlan.formationId,'');}
let checked=0;for(const tt of c.window.Ito_MANUAL_TIMETABLES){const n=tt['odpt:trainNumber'],type=tt['odpt:trainType'].split('.').pop();for(const v of [live(n,type),sql(n,type,tt.vehicleType)]){marker(v);assert(!v.vehiclePlan.models.some(x=>/1000番台/.test(x)&&x.startsWith('E233')));checked++;}}
assert.equal(checked,304);
assert(!live('9999M','Local').vehiclePlan,'unknown temporary number must not inherit regular fleet');
assert(!live('5641M','LimitedExpress').vehiclePlan,'type scope retained');
const actual=live('5641M','Local',{realtimeVehicleType:'E233系3000番台'});assert.equal(actual.name,'E233系3000番台');assert(!actual.vehiclePlan,'actual evidence retains priority');
assert.equal(c.window.TrainIcons.resolveVehicleArtwork('伊豆急行3000系'),null,'do not borrow other operator artwork');
assert.equal(c.window.TrainIcons.resolveVehicleArtwork('伊豆急行2100系'),null,'old original livery is not current fleet artwork');
console.log('Ito:152 timetable rows x realtime/SQL reach native planned PNG; old/blank hints, Saphir separation, unknown/type boundaries and observed priority PASS');
