// Pixel Tetsudo — file:// protocol data bundle generator.
// Regenerates data/core/*.file.js from the canonical JSON files so the app
// works when home.html is opened by double-click (fetch is CORS-blocked under
// file://, but <script src> is not). Run: node data/core/gen-file-data.js
// The JSON files remain the single source of truth (Freeze Rule untouched).
const fs = require('fs');
const path = require('path');
const dir = __dirname;

const pairs = [
  ['railway_data.json', 'railway-data.file.js', 'window.RAILWAY_DATA'],
  ['station_i18n.json', 'station-i18n.file.js', 'window.RAILWAY_I18N'],
  ['tourism_data.json', 'tourism-data.file.js', 'window.RAILWAY_TOURISM']
];

for (const [json, js, varName] of pairs) {
  const raw = fs.readFileSync(path.join(dir, json), 'utf8');
  // Escape "</script" sequences so the bundle cannot close the script tag early.
  const safe = raw.replace(/<\/script/gi, '<\\/script');
  fs.writeFileSync(path.join(dir, js), varName + ' = ' + safe + ';\n');
  console.log('wrote', js, '(', (safe.length / 1024).toFixed(0), 'KB )');
}
