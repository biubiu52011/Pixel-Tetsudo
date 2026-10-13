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
const token=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const aliases=snapshot.networkAliases||[];
const networksFor=id=>{
  const accepted=new Set([token(id)]);
  for(let pass=0;pass<3;pass++) for(const a of aliases)
    if (accepted.has(token(a.alias_key))) accepted.add(token(a.canonical_network_key));
  return accepted;
};
const lineCoverage=Object.entries(canonical.lines).map(([id,line])=>{
  const keys=networksFor(id);
  const evidence=[...(snapshot.records||[]),...(snapshot.datedRecords||[]),...(snapshot.familyRules||[]),...(snapshot.referenceRules||[])]
    .filter(r=>keys.has(token(r.networkKey)));
  const models=[...new Set(evidence.map(r=>r.vehicleType||r.exactVehicleType).filter(Boolean))];
  return {lineId:id,operator:line.operator,identityResolver:'shared',deduplication:'source identity / scoped running chain',
    evidenceRows:evidence.length,models,modelsWithPng:models.filter(model=>vehicle.resolve({timetableVehicleType:model}).iconPath),
    status:evidence.length?'source-scoped-evidence':'explicit-source-identity-required'};
});
const reportIndex=process.argv.indexOf('--json-report');
if(reportIndex>=0) fs.writeFileSync(process.argv[reportIndex+1],JSON.stringify({lineCoverage},null,2)+'\n');
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
  unresolvedArtworkPaths:missing.length,knownArtworkDebt:missing.slice(0,20),
  note:'Unresolved historical artwork paths are non-blocking; never replace them with another vehicle'
},null,2));
