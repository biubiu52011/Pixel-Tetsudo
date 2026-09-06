const fs = require('fs');
const ds = fs.readFileSync('js/data-state.js', 'utf8');
const df = fs.readFileSync('js/data-fusion.js', 'utf8');
const css = fs.readFileSync('css/style.css', 'utf8');
const res = fs.readFileSync('js/running-chain-resolver.js', 'utf8');
const rels = fs.readFileSync('data/core/line-service-relations.js', 'utf8');

console.log('=== 4.3.36 Final Verification Gate ===');
console.log('');

// 1. Canonical data
const d = JSON.parse(fs.readFileSync('data/core/railway_data.json', 'utf8'));
console.log('1. Canonical Data:');
console.log('   Lines:', Object.keys(d.lines || {}).length, '(expect 156)');
console.log('   Stations:', Object.keys(d.stations || {}).length, '(expect 509)');
console.log('   NameMap:', Object.keys(d.name_map || {}).length, '(expect 1703)');
console.log('   Tourism:', Object.keys(d.tourism || {}).length, '(expect 93)');

// 2. Relations
const entries = (rels.match(/lineA:/g) || []).length;
const types = rels.match(/relation:\s*"(\w+)"/g) || [];
const tc = {};
types.forEach(t => { tc[t] = (tc[t] || 0) + 1; });
console.log('');
console.log('2. Relation Layer:');
console.log('   Entries:', entries, '(expect 14)');
console.log('   Types:', JSON.stringify(tc));

// 3. Resolver boundary
console.log('');
console.log('3. Resolver Boundary:');
['RunningChainDB','localStorage','sessionStorage','persistent','CHAIN_DB'].forEach(p => {
  console.log('   ' + p + ':', res.includes(p) ? 'FORBIDDEN!' : 'OK');
});

// 4. No aggregation
console.log('');
console.log('4. Delay Aggregation:');
console.log('   data-fusion.js:', df.toLowerCase().includes('aggregate') ? 'WARNING' : 'OK - no aggregation');
console.log('   data-state.js:', ds.toLowerCase().includes('aggregate') ? 'WARNING' : 'OK - no aggregation');

// 5. UNKNOWN badge
console.log('');
console.log('5. UNKNOWN Badge:');
console.log('   data-state.js branch:', ds.includes('identity === "UNKNOWN"') ? 'OK' : 'MISSING!');
console.log('   CSS rule:', css.includes('rs-chain-badge-unknown') ? 'OK' : 'MISSING!');

// 6. BRANCH_OF fix
console.log('');
console.log('6. BRANCH_OF Semantic Fix:');
console.log('   Sets SAME:', res.includes('ctx.identity="SAME";ctx.confidence="LOW";ctx.reason="BRANCH_OF"') ? 'OK' : 'STILL BROKEN!');
console.log('   Does NOT set UNKNOWN:', !res.includes('ctx.identity="UNKNOWN";ctx.confidence="LOW";ctx.reason="BRANCH_OF"') ? 'OK' : 'STILL WRONG!');

// 7. Load order
const rt = fs.readFileSync('pages/realtime.html', 'utf8');
const tr = fs.readFileSync('pages/trains.html', 'utf8');
console.log('');
console.log('7. HTML Load Order:');
console.log('   realtime.html:', rt.indexOf('running-chain-resolver') < rt.indexOf('data-fusion') ? 'OK' : 'WRONG!');
console.log('   trains.html:', tr.indexOf('running-chain-resolver') < tr.indexOf('data-fusion') ? 'OK' : 'WRONG!');

// 8. Summary
const allOk = 
  Object.keys(d.lines || {}).length === 156 &&
  Object.keys(d.stations || {}).length === 509 &&
  entries === 14 &&
  !df.toLowerCase().includes('aggregate') &&
  !ds.toLowerCase().includes('aggregate') &&
  ds.includes('identity === "UNKNOWN"') &&
  css.includes('rs-chain-badge-unknown') &&
  res.includes('ctx.identity="SAME";ctx.confidence="LOW";ctx.reason="BRANCH_OF"') &&
  !res.includes('ctx.identity="UNKNOWN";ctx.confidence="LOW";ctx.reason="BRANCH_OF"') &&
  rt.indexOf('running-chain-resolver') < rt.indexOf('data-fusion') &&
  tr.indexOf('running-chain-resolver') < tr.indexOf('data-fusion') &&
  !res.includes('RunningChainDB') &&
  !res.includes('localStorage');

console.log('');
console.log('=== FINAL: ' + (allOk ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED') + ' ===');
