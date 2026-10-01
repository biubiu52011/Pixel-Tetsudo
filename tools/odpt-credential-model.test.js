const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const client = fs.readFileSync(path.join(root, "data/api/odpt-unified.js"), "utf8");

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
