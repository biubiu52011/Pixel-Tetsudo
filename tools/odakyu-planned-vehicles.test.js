const fs=require('fs'),vm=require('vm'),assert=require('assert');
const c={window:{},console:{debug(){}}};vm.createContext(c);
for(const p of ['js/train-vehicle.js','data/timetables/vehicle-operation-evidence-data.js'])vm.runInContext(fs.readFileSync(p,'utf8'),c);
const api=c.window.TrainVehicle,ev=c.window.TrainOperationEvidence;
const station=s=>'odpt.Station:Odakyu.Odawara.'+s;
function decide(number,type='Local',calendar='Weekday',label='',day='2026-10-16'){
 const stops=[station('Shinjuku'),station('HonAtsugi')];
 const tt={_positionSource:'supabase-train-run',_sqlVehicleCandidateLabel:label,
 'odpt:trainType':'odpt.TrainType:Odakyu.'+type,'odpt:destinationStation':[stops[1]],
 'odpt:trainTimetableObject':[{'odpt:departureStation':stops[0],'odpt:departureTime':'12:00'},{'odpt:arrivalStation':stops[1],'odpt:arrivalTime':'13:00'}]};
 return api.resolveTimetableRun({trainNumber:number,calendar:'odpt.Calendar:'+calendar,destinationStationUrn:stops[1]},tt,'Odawara',{operator:'Odakyu'},day).vehicleResult;
}
const a=decide('7004'),b=decide('6505');
assert.deepEqual(Array.from(a.vehiclePlan.models),['小田急3000形','小田急8000形']);
assert.deepEqual(Array.from(b.vehiclePlan.models),['小田急2000形','小田急1000形']);
assert.notEqual(a.vehiclePlan.iconPath,b.vehiclePlan.iconPath,'same Local type must use its working, not one fleet icon');
assert.equal(a.vehiclePlan.formationId,'');assert.equal(b.vehiclePlan.formationId,'');
assert.deepEqual(Array.from(decide('7004','Local','Weekday','小田急1000形 / 小田急3000形 / 小田急5000形').vehiclePlan.models),['小田急3000形','小田急8000形'],'published number plan supersedes broad SQL candidates');
const exe=decide('0002','LimitedExpress');
assert.deepEqual(Array.from(exe.vehiclePlan.models),['小田急30000形（EXE）','小田急30000形（EXEα）']);
assert(exe.vehiclePlan.iconPath.endsWith('小田急電鉄_30000形_EXE.png'));
const mse=decide('0401M','LimitedExpress');
assert(mse.name==='小田急60000形'||mse.vehiclePlan.models.includes('小田急60000形'));
const gse=decide('0709','LimitedExpress','SaturdayHoliday','','2026-10-17');
assert(gse.name==='小田急70000形'||gse.vehiclePlan.models.includes('小田急70000形'));
assert(decide('0003','LimitedExpress').vehiclePlan.models.length>1,'variable-day triangle cannot become a fixed model');
const ctx={lineId:'Odawara',operator:'Odakyu',calendarType:'weekday',serviceDate:'2026-10-16'};
assert.equal(ev.resolveEvidence('7004',ctx,'planned').observedDate,'','planned lookup does not manufacture a daily observation');
assert.equal(ev.resolveEvidence('7004',ctx,'planned').decisive,false,'planned lookup is not dated physical proof');
assert.equal(ev.resolveEvidence('0709',ctx,'planned'),null,'holiday-only fixed GSE must not leak to weekday');
assert.equal(ev.resolveEvidence('2',ctx,'planned'),null,'preserve published leading zeroes');
assert.equal(ev.resolveEvidence('7004',{...ctx,serviceDate:'2026-03-15'},'planned'),null,'weekday plan only starts at published weekday revision');
assert.equal(ev.resolveEvidence('7004',{...ctx,calendarType:''},'planned'),null);
assert.equal(ev.resolveEvidence('7004',{...ctx,lineId:'Keisei'},'planned'),null);
const current=api.resolveRealtime({...ctx,trainNumber:'7004',trainType:'odpt.TrainType:Odakyu.Local',fromStation:station('Shinjuku'),destinationStation:station('HonAtsugi'),realtimeVehicleType:'小田急5000形'}).vehicleResult;
assert.equal(current.name,'小田急5000形');assert(!current.vehiclePlan);
const old=c.window.VEHICLE_REFERENCE_RULES;
c.window.VEHICLE_REFERENCE_RULES=[...old,{...old.find(r=>r.networkKey==='odakyu-main'&&r.trainNumber==='7004'&&r.calendarType==='weekday'),vehicleType:'小田急5000形'}];
assert.equal(ev.resolveEvidence('7004',ctx,'planned'),null,'conflicting number plans cannot manufacture a model');
c.window.VEHICLE_REFERENCE_RULES=old;
// Technical whole-route exclusions still win over a bad number-level plan.
c.window.VEHICLE_REFERENCE_RULES=[...old,{operator:'TsukubaExpress',networkKey:'TsukubaExpress',trainNumber:'99997',vehicleType:'TX-1000系',calendarType:'weekday',effectiveFrom:'2026-03-14',sourceUrl:'https://www.mir.co.jp/',grade:'B'}];
const ac=ev.resolveEvidence('99997',{lineId:'TsukubaExpress',serviceDate:'2026-10-16',calendarType:'weekday',itineraryStations:['odpt.Station:MIR.TsukubaExpress.Akihabara','odpt.Station:MIR.TsukubaExpress.Tsukuba']},'planned');
assert.deepEqual(Array.from(ac.vehicleCandidates),['TX-2000系','TX-3000系']);
c.window.VEHICLE_REFERENCE_RULES=old;
const rows=old.filter(r=>/oerunyo2026-local-[wh]\/|\/260314\/(?:weekday|holiday)_(?:up|down)2026\.pdf$/.test(r.sourceUrl));
assert.equal(rows.length,2126);assert.equal(new Set(rows.map(r=>r.calendarType+'|'+r.trainNumber)).size,2126);
for(const r of rows)assert(!r.formationId&&!r.observedDate,'recurring plan has no daily formation/observation');
for(const p of [a.vehiclePlan,b.vehiclePlan,exe.vehiclePlan])assert(fs.existsSync(p.iconPath.replace(/^\.\.\//,'')),p.iconPath);
console.log('Odakyu train-number plans: 2126 sourced rows, Local working split, fixed Romancecar, variable day, leading zero, calendar/revision/network, conflict, technical route and actual vehicle priority PASS');
