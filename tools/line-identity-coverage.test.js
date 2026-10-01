const fs = require("fs");
const path = require("path");
const assert = require("assert");
const root = path.join(__dirname, "..");
const odpt = fs.readFileSync(path.join(root, "data/api/odpt-unified.js"), "utf8");
const fusion = fs.readFileSync(path.join(root, "js/data-fusion.js"), "utf8");

assert(/var\s+LINE_TO_OPERATOR\s*=\s*\{/.test(odpt), "LINE_TO_OPERATOR missing");
assert(/var\s+LINE_RAILWAY_CODE\s*=\s*\{/.test(odpt), "LINE_RAILWAY_CODE missing");
assert(/function\s+buildLineIdentity\s*\(/.test(fusion), "buildLineIdentity missing");
assert(/if\s*\(!operator\s*\|\|\s*!railwayCode\)\s*return null/.test(fusion), "partial identity must remain unresolved");

function keys(blockName) {
  const start = odpt.indexOf("var " + blockName);
  if (start < 0) return [];
  const open = odpt.indexOf("{", start);
  const close = odpt.indexOf("\n    };", open);
  const block = odpt.slice(open, close > open ? close : odpt.length);
  return [...block.matchAll(/["']([^"']+)["']\s*:/g)].map(m => m[1]);
}
const operators = new Set(keys("LINE_TO_OPERATOR"));
const railway = new Set(keys("LINE_RAILWAY_CODE"));
const uncovered = [...operators].filter(k => !railway.has(k));
console.log("identity-coverage: mapped operators=" + operators.size + ", railway codes=" + railway.size + ", unresolved=" + uncovered.length);
if (uncovered.length) console.log("identity-coverage unresolved (allowed fallback, review): " + uncovered.join(", "));
console.log("identity-coverage: PASS");
