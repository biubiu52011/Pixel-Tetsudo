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
for (const [id,record] of rows) {
  const asset=record.asset || '';
  if (!asset) continue;
  if (!fs.existsSync(path.join(root,asset.replace(/^\.\.\//,'')))) missing.push({id,asset});
}
if (vehicle.selectMarkerArtwork({vehicleResolvedUpstream:false,vehicleType:'E235系0番台（山手線）'},false).kind!=='generic')
  throw new Error('Unverified train must remain a neutral marker');
console.log(JSON.stringify({
  status:'PASS',runtime:file,canonicalArtworkEntries:rows.length,
  unresolvedArtworkPaths:missing.length,knownArtworkDebt:missing.slice(0,20),
  note:'Unresolved historical artwork paths are non-blocking; never replace them with another vehicle'
},null,2));
