const fs=require('fs'),vm=require('vm');const db=JSON.parse(fs.readFileSync('data/core/railway_data.json')).lines;
const ids=['Ginza','Marunouchi','MarunouchiBranch','Hibiya','Tozai','Chiyoda','ChiyodaBranch','Hanzomon','Asakusa','Shinjuku','Oedo','Yurakucho','Fukutoshin','Mita','Namboku'];
const c={window:{},console:{debug(){}}};vm.createContext(c);
for(const f of ['js/train-vehicle.js','data/timetables/vehicle-operation-evidence-data.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);

for(const m of fs.readFileSync('pages/trains.html','utf8').matchAll(/src="\.\.\/(data\/timetables\/[^"]*operation-evidence[^"?]*\.js)/g))vm.runInContext(fs.readFileSync(m[1],'utf8'),c);

const results=[];for(const id of ids){vm.runInContext(fs.readFileSync('data/timetables/'+id+'-manual.js','utf8'),c);const rows=c.window[id+'_MANUAL_TIMETABLES'],bad=[],models={};for(const source of rows){const tt={...source,_positionSource:'supabase-train-run',_sqlVehicleCandidateLabel:source.vehicleType||''};delete tt.vehicleType;const v=c.window.TrainVehicle.resolveTimetableRun({trainNumber:source['odpt:trainNumber'],calendar:source['odpt:calendar']},tt,id,db[id],'2026-10-16').vehicleResult;let names=v.vehiclePlan?.models||[v.name],art=v.iconPath||v.vehiclePlan?.iconPath;if(!art||!fs.existsSync(art.slice(3)))bad.push(source['odpt:trainNumber']);let key=names.join('/');models[key]=(models[key]||0)+1;}results.push({id,total:rows.length,missing:bad.length,samples:bad.slice(0,8),models});}

const assert=require('assert');assert.equal(results.length,15);assert.equal(results.reduce((n,r)=>n+r.total,0),13624);for(const r of results)assert.equal(r.missing,0,r.id+' '+r.samples.join(','));
assert.equal(results.find(r=>r.id==='Chiyoda').models['小田急60000形'],18,'MSE must not become4000');
for(const id of ['Tozai','Hanzomon','Asakusa','Shinjuku'])assert(!Object.keys(results.find(r=>r.id===id).models).some(s=>/東葉高速1000|都営5300|東武30000|東武50070|京王5000/.test(s)),id+' incompatible fleet');
assert(!fs.readFileSync('pages/trains.html','utf8').includes('chiyoda-operation-evidence-2026.js'),'one canonical Chiyoda owner');
const api=c.window.TrainVehicle;
for(const no of ['1012T','1003T']){const v=api.resolveRealtime({lineId:'Shinjuku',operator:'Toei',trainNumber:no,trainOwner:'Toei',railway:'odpt.Railway:Toei.Shinjuku',serviceDate:'2026-10-16',trainType:'odpt.TrainType:Toei.Local'}).vehicleResult;assert(v.iconPath||v.vehiclePlan?.iconPath,'known generic model representative');}
assert.equal(c.window.TrainIcons.resolveVehicleArtwork('都営10-300形'),null,'representative does not prove precise generation');
const actual=api.resolveRealtime({lineId:'Hibiya',trainNumber:'A1005T',serviceDate:'2026-10-16',realtimeVehicleType:'東京メトロ13000系'}).vehicleResult;assert.equal(actual.name,'東京メトロ13000系');assert(!actual.vehiclePlan);
console.log('Subway planned vehicles: 15 line datasets,13624 rows, no missing PNGs; TH-LINER/MSE/shuttle, owner isolation and exact/representative separation PASS');
