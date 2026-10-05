const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const client = fs.readFileSync(path.join(root, "data/api/odpt-unified.js"), "utf8");
const src = client;

assert(/浏览器端混淆不是秘密存储|browser.*not.*secret/i.test(client),
  "ODPT client must explicitly document that browser-side obfuscation is not secret storage");
assert(/服务端\/Edge proxy|server.*proxy/i.test(client),
  "ODPT client must preserve the server/Edge proxy migration requirement");

// Static GitHub Pages cannot keep a consumer key secret. This guard prevents
// future code/comments from claiming XOR/Base64 provides credential secrecy.
const misleading = [
  /XOR[^\n]{0,80}(安全|secure|secret|隐藏 key)/i,
  /Base64[^\n]{0,80}(安全|secure|secret|隐藏 key)/i
];
for (const re of misleading) {
  assert(!re.test(client), "misleading client-side credential secrecy claim: " + re);
}
console.log("odpt-credential-model: PASS (static-client exposure documented)");

assert(/auditRealtimeLine:\s*function\(lineId, rows\)/.test(src),
  'ODPT client must expose exact line realtime audit');
assert(/actual\.key === expected\.key/.test(src),
  'line realtime audit must match canonical operator+railway identity');
assert(/ODPT_REALTIME_AUDIT\.Yamanote/.test(src),
  'Yamanote activation must publish an exact realtime audit snapshot');
assert(!/auditRealtimeLine[\s\S]{0,2500}station.*overlap/i.test(src),
  'line realtime audit must not guess by station overlap');
console.log('Yamanote realtime activation contract: 4 PASS');

assert(/YamanoteHistory/.test(src), 'Yamanote realtime audit must retain rolling history');
assert(/history\.length > 10/.test(src), 'Yamanote realtime history must be bounded');
assert(/assessRealtimeFullCandidate:\s*function/.test(src), 'ODPT client must expose FULL-candidate assessment');
assert(/usable\.length < minSamples/.test(src), 'FULL candidate must require multiple usable samples');
assert(/s\.locationCoverage !== 1/.test(src), 'FULL candidate must require complete location fields');
assert(/s\.trainNumberCoverage !== 1/.test(src), 'FULL candidate must require complete train-number fields');
assert(/Object\.keys\(s\.directionCounts \|\| \{\}\)\.length < 2/.test(src),
  'Yamanote FULL candidate must observe both direction identities');
console.log('Yamanote realtime coverage qualification: 7 PASS');
