const fs=require('fs'),vm=require('vm'),assert=require('assert');
const c={window:{},console:{debug(){}}};vm.createContext(c);
for(const p of ['js/train-vehicle.js','data/timetables/vehicle-operation-evidence-data.js'])vm.runInContext(fs.readFileSync(p,'utf8'),c);
const api=c.window.TrainVehicle,ev=c.window.TrainOperationEvidence;
function tt(lineId,type,stations,label='',day='2026-10-15',number='99998'){
 const data={_positionSource:'supabase-train-run',_sqlVehicleCandidateLabel:label,'odpt:trainType':'odpt.TrainType:Fixture.'+type,'odpt:destinationStation':[stations[stations.length-1]],'odpt:trainTimetableObject':stations.map((s,i)=>i===0?{'odpt:departureStation':s,'odpt:departureTime':'12:00'}:{'odpt:arrivalStation':s,'odpt:arrivalTime':'12:10'})};
 const operator=lineId==='Rinkai'?'TWR':lineId==='TsukubaExpress'?'TsukubaExpress':lineId==='Ikebukuro'?'Seibu':'Odakyu';
 const run={trainNumber:number,calendar:'odpt.Calendar:Weekday',destinationStationUrn:stations[stations.length-1]};
 return api.resolveTimetableRun(run,data,lineId,{operator},day).vehicleResult;
}
const oe=s=>'odpt.Station:Odakyu.Odawara.'+s;
const tx=s=>'odpt.Station:MIR.TsukubaExpress.'+s;
const ordinary=tt('Odawara','Local',[oe('Shinjuku'),oe('Odawara')]);
assert.equal(ordinary.identityStatus,'UNKNOWN');
assert.equal(ordinary.vehiclePlan.status,'PLANNED_CANDIDATES');
assert(ordinary.vehiclePlan.models.includes('小田急2000形'));
assert(ordinary.vehiclePlan.iconPath.endsWith('小田急電鉄_1000形_標準色.png'));
assert(!ordinary.vehiclePlan.models.some(x=>/60000|70000|30000/.test(x)));
assert.equal(ordinary.vehiclePlan.formationId,'');
assert(tt('Odawara','Local',[oe('Shinjuku'),oe('Odawara')],'','2026-12-01').vehiclePlan,'recurring plans need no daily observation or invented end date');
const express=tt('Odawara','RapidExpress',[oe('Shinjuku'),oe('Odawara')]);
assert(!express.vehiclePlan.models.includes('小田急2000形'));
const romance=tt('Odawara','LimitedExpress',[oe('Shinjuku'),'odpt.Station:OdakyuHakone.HakoneTozan.HakoneYumoto']);
assert.deepEqual(Array.from(romance.vehiclePlan.models),['小田急60000形','小田急70000形','小田急30000形（EXE）','小田急30000形（EXEα）']);
for(const stations of [[oe('Shinjuku'),'odpt.Station:JR-Central.Gotemba.Gotemba'],['odpt.Station:JR-Central.Gotemba.Gotemba',oe('Shinjuku')],[oe('Shinjuku'),'odpt.Station:TokyoMetro.Chiyoda.KitaSenju'],['odpt.Station:TokyoMetro.Chiyoda.KitaSenju',oe('Shinjuku')]]){
 const v=tt('Odawara','LimitedExpress',stations);
 assert.equal(v.identityStatus,'UNKNOWN');assert.deepEqual(Array.from(v.vehiclePlan.models),['小田急60000形']);
}
const through=tt('Odawara','Express',['odpt.Station:JR-East.JobanLocal.Abiko',oe('Shinjuku')]);
assert.equal(through.vehiclePlan.models.length,3);
assert(!through.vehiclePlan.models.includes('小田急1000形'));
assert(through.vehiclePlan.models.includes('E233系2000番台'));
for(const r of [
 tt('Odawara','Unknown',[oe('Shinjuku'),oe('Odawara')]),
 tt('OdakyuTama','Local',[oe('Shinjuku'),oe('Odawara')]),
 tt('Odawara','Local',[oe('Shinjuku'),'odpt.Station:JR-Central.Gotemba.Gotemba']),
 tt('Odawara','Local',['UnknownStation',oe('Odawara')]),
 tt('Odawara','Local',[oe('Shinjuku'),oe('Odawara')],'','2026-10-14')
])assert(!r.vehiclePlan,'unscoped/unknown/out-of-validity must not borrow a fleet');
for(const stations of [[tx('Akihabara'),tx('Tsukuba')],[tx('Tsukuba'),tx('Akihabara')],[tx('Akihabara'),tx('Midorino'),tx('Moriya')]]){
 const v=tt('TsukubaExpress','Local',stations,'TX-1000系 / TX-2000系 / TX-3000系');
 assert.deepEqual(Array.from(v.vehiclePlan.models),['TX-2000系','TX-3000系']);
 assert(v.vehiclePlan.iconPath.endsWith('首都圏新都市鉄道_TX-2000系.png'));
}
const dc=tt('TsukubaExpress','Local',[tx('Akihabara'),tx('Moriya')],'TX-1000系 / TX-2000系 / TX-3000系');
assert(dc.vehiclePlan.models.includes('TX-1000系'));
const rinkaiStations=['odpt.Station:TWR.Rinkai.ShinKiba','odpt.Station:JR-East.Saikyo.Osaki'];
const rinkai=tt('Rinkai','Local',rinkaiStations,'E233系7000番台');
assert(rinkai.vehiclePlan.iconPath.endsWith('JR東日本_E233系_7000番台.png'));
assert(!tt('Rinkai','Local',rinkaiStations).vehiclePlan,'through qualification cannot invent a missing raw model');
assert(!tt('Rinkai','LimitedExpress',rinkaiStations,'E233系7000番台').vehiclePlan.iconPath);
const boso=api.resolveTimetableRun({trainNumber:'99999',calendar:'odpt.Calendar:Weekday'},{_positionSource:'supabase-train-run',_sqlVehicleCandidateLabel:'209系2000番台 / 2100番台'},'SobuMain',{operator:'JR-East'},'2026-10-15').vehicleResult;
assert.deepEqual(Array.from(boso.vehiclePlan.models),['209系2000番台','209系2100番台']);
assert(boso.vehiclePlan.iconPath.endsWith('JR東日本_209系_2000・2100番台_房総地区.png'));
assert.equal(c.window.TrainIcons.resolveVehicleArtwork('209系2000番台'),null,'shared planned illustration does not prove exact physical artwork');
const laview=tt('Ikebukuro','LimitedExpress',['odpt.Station:Seibu.Ikebukuro.Ikebukuro','odpt.Station:Seibu.Ikebukuro.Hanno'],'001系(Laview) / 10000系');
assert(laview.vehiclePlan.iconPath.endsWith('西武鉄道_001系_Laview.png'));
// Fleet scopes never become dated physical evidence or override a supplied live model.
const context={lineId:'Odawara',operator:'Odakyu',trainNumber:'99998',serviceDate:'2026-10-15',calendarType:'weekday',trainType:'odpt.TrainType:Odakyu.Local',destinationStation:oe('Odawara'),fromStation:oe('Shinjuku')};
assert.equal(ev.resolveEvidence('99998',context,'realtime-derived'),null);
assert.equal(ev.resolveEvidence('99998',context,'fallback'),null);
const actual=api.resolveRealtime({...context,realtimeVehicleType:'小田急5000形'}).vehicleResult;
assert.equal(actual.name,'小田急5000形');assert.equal(actual.identityStatus,'EXACT');assert(!actual.vehiclePlan);
const plannedLive=api.resolveRealtime(context).vehicleResult;
assert.equal(plannedLive.identityStatus,'UNKNOWN');assert(plannedLive.vehiclePlan.iconPath);
const old=c.window.VEHICLE_FAMILY_RULES;c.window.VEHICLE_FAMILY_RULES=old.map(r=>r.codePattern==='PLAN:LOCAL-INTERNAL'?{...r,planScope:{...r.planScope,unknownUnsafeKey:true}}:r);
assert(!api.resolveRealtime(context).vehicleResult.vehiclePlan,'unknown scope options fail closed');
for(const r of Object.values(c.window.TrainIcons.CANONICAL_VEHICLES))for(const asset of [r.asset,r.plannedAsset].filter(Boolean))assert(fs.existsSync(asset.replace(/^\.\.\//,'')),asset);
console.log('scoped Odawara fleets / Romancecar / Chiyoda / Gotemba, full-route TX AC exclusion, qualified Rinkai, date/type isolation, canonical abbreviations and actual priority PASS');
