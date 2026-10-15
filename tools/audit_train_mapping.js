/*
 * Pixel Tetsudo vehicle artwork audit.
 * Single source: js/train-vehicle.js. No legacy parallel mapping tables.
 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '..');
const file = 'js/train-vehicle.js';
const src = fs.readFileSync(path.join(root, file), 'utf8');
const sandbox = {window:{}, console:{debug(){},log(){},warn(){},error(){}}};
sandbox.self=sandbox.window;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'data/timetables/vehicle-operation-evidence-data.js'),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'js/train-vehicle.js'),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'js/train-position-estimator.js'),'utf8'),sandbox);
vm.runInContext(src,sandbox,{filename:file});
const icons=sandbox.window.TrainIcons;
const vehicle=sandbox.window.TrainVehicle;
if (!icons || !vehicle || typeof vehicle.resolve !== 'function' ||
    typeof vehicle.selectMarkerArtwork !== 'function') {
  throw new Error('Unified vehicle runtime or marker-artwork selector missing');
}
if (fs.existsSync(path.join(root,'js/train-icons.js')))
  throw new Error('Deprecated parallel js/train-icons.js still present');
const rows=Object.entries(icons.CANONICAL_VEHICLES || {});
const missing=[];
const snapshot=JSON.parse(fs.readFileSync(path.join(root,'data/timetables/vehicle-operation-evidence.json'),'utf8'));
const canonical=JSON.parse(fs.readFileSync(path.join(root,'data/core/railway_data.json'),'utf8'));
const matchesNetwork=sandbox.window.TrainOperationEvidence.matchesNetwork;
const serviceDate=sandbox.window.TrainPositionEstimator.getCurrentServiceDate();
const calendar=sandbox.window.TrainPositionEstimator.getCurrentCalendar() === 'odpt.Calendar:Weekday' ? 'weekday' : 'holiday';
const evidenceRows=[...(snapshot.records||[]),...(snapshot.datedRecords||[]),...(snapshot.familyRules||[]),...(snapshot.referenceRules||[])];
const lineCoverage=Object.entries(canonical.lines).map(([id,line])=>{
  const evidence=evidenceRows.filter(r=>matchesNetwork(r.networkKey,{lineId:id}));
  const models=[...new Set(evidence.map(r=>r.vehicleType||r.exactVehicleType).filter(Boolean))];
  const current=evidence.filter(r=> (!r.validDate || r.validDate===serviceDate) &&
    (!r.effectiveFrom || r.effectiveFrom<=serviceDate) && (!r.effectiveTo || r.effectiveTo>=serviceDate) &&
    (!r.calendarType || r.calendarType===calendar));
  return {lineId:id,operator:line.operator,identityResolver:'shared',deduplication:'source identity / scoped running chain',
    evidenceRows:evidence.length,models,modelsWithPng:models.filter(model=>vehicle.resolve({timetableVehicleType:model}).iconPath),
    currentEvidenceRows:current.length,currentDatedPhysicalRows:current.filter(r=>r.validDate &&
      ((r.formationIds||[]).length || r.formationId)).length,
    status:current.length?'eligible-evidence-requires-train-match':
      (evidence.length?'historical-evidence-only':'explicit-source-identity-required')};
});
const reportIndex=process.argv.indexOf('--json-report');
if(reportIndex>=0) fs.writeFileSync(process.argv[reportIndex+1],JSON.stringify({serviceDate,calendar,lineCoverage},null,2)+'\n');
for (const [id,record] of rows) {
  const asset=record.asset || '';
  if (!asset) continue;
  if (!fs.existsSync(path.join(root,asset.replace(/^\.\.\//,'')))) missing.push({id,asset});
}
if (vehicle.selectMarkerArtwork({vehicleResolvedUpstream:false,vehicleType:'E235系0番台（山手線）'},false).kind!=='unresolved')
  throw new Error('Unverified train must remain a neutral marker');
console.log(JSON.stringify({
  status:'PASS',runtime:file,canonicalArtworkEntries:rows.length,
  auditedLines:lineCoverage.length,linesWithSnapshotEvidence:lineCoverage.filter(r=>r.evidenceRows).length,
  serviceDate,calendar,linesWithCurrentEligibleEvidence:lineCoverage.filter(r=>r.currentEvidenceRows).length,
  unresolvedArtworkPaths:missing.length,knownArtworkDebt:missing.slice(0,20),
  note:'Unresolved historical artwork paths are non-blocking; never replace them with another vehicle'
},null,2));
