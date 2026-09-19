// Bundle the static data/core config tables into one file to reduce <script> requests.
// Order follows home.html's existing relative load order. Pure data + small IIFEs,
// so concatenation is safe as long as order is preserved.
const fs = require('fs');
const path = require('path');
const dir = __dirname;

const order = [
  'transfer-hints.js',
  'runtime-config.js',
  'through-service.js',
  'line-operation-systems.js',
  'platform-data.js',
  'line-service-relations.js',
  'train-type-defs.js',
];

let out = '/* Pixel Tetsudo - Data Config Bundle (auto-merged).\n' +
  ' * Merged from: ' + order.join(', ') + '.\n' +
  ' * Do not edit here; edit the source files and re-run node data/core/gen-config-bundle.js\n */\n';
for (const f of order) {
  const p = path.join(dir, f);
  if (!fs.existsSync(p)) continue;
  let src = fs.readFileSync(p, 'utf8');
  // strip BOM
  if (src.charCodeAt(0) === 0xFEFF) src = src.slice(1);
  out += '\n// ===== ' + f + ' =====\n' + src + '\n';
}
fs.writeFileSync(path.join(dir, 'data-config-bundle.js'), out, 'utf8');
console.log('wrote data-config-bundle.js (', (out.length / 1024).toFixed(0), 'KB )');
