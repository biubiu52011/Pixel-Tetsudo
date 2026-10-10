/* Read-only gallery parity audit.
 * PNG filenames never establish vehicle identity or generate runtime mappings.
 * Canonical mappings live in js/train-vehicle.js; verified formation facts live
 * in Supabase vehicle_visual_identities via the existing train-runs endpoint.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const GALLERY = path.join(ROOT, 'images', '列车');

function loadCanonicalVehicles() {
  const window = {};
  const sandbox = { window, console: { debug() {}, log() {}, warn() {}, error() {} } };
  window.window = window;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/train-vehicle.js'), 'utf8'),
    sandbox, { filename: 'js/train-vehicle.js' });
  return window.TrainIcons.CANONICAL_VEHICLES;
}

function listGalleryPngs() {
  const out = [];
  for (const operator of fs.readdirSync(GALLERY)) {
    const folder = path.join(GALLERY, operator);
    if (!fs.statSync(folder).isDirectory()) continue;
    for (const file of fs.readdirSync(folder)) {
      if (!file.toLowerCase().endsWith('.png')) continue;
      out.push('images/列车/' + operator + '/' + file);
    }
  }
  return out.sort();
}

function main() {
  const registered = loadCanonicalVehicles();
  const files = listGalleryPngs();
  const fileSet = new Set(files);
  const mapped = new Map();
  const missing = [];

  for (const [identity, row] of Object.entries(registered)) {
    if (!row || !row.asset) continue;
    const asset = String(row.asset).replace(/^\.\.\//, '');
    if (!mapped.has(asset)) mapped.set(asset, []);
    mapped.get(asset).push(identity);
    if (!fileSet.has(asset)) missing.push({ identity, path: asset });
  }

  const unmapped = files.filter(file => !mapped.has(file));
  const report = {
    galleryPngs: files.length,
    canonicalMappings: Object.keys(registered).length,
    canonicalPngs: mapped.size,
    missingCanonicalAssets: missing,
    galleryWithoutStaticMapping: unmapped,
    note: 'Unmapped PNGs are not vehicle evidence. SQL exact formation identities are loaded at runtime.'
  };

  if (process.argv.includes('--json')) {
    console.log('@@JSON@@' + JSON.stringify(report));
  } else {
    console.log('gallery-sync (read-only): ' + report.galleryPngs + ' PNGs, ' +
      report.canonicalPngs + ' canonical asset paths, ' +
      missing.length + ' missing, ' + unmapped.length + ' outside static mapping');
    if (missing.length) console.error('Missing canonical assets:', missing);
    console.log('Unmapped PNGs require certified train/formation identity before runtime use.');
  }
  if (missing.length) process.exitCode = 1;
}

main();
