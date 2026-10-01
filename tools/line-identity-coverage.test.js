const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "data/api/odpt-unified.js"), "utf8");

// Extract object literals with brace/string awareness instead of regex end markers.
// This prevents comments or later objects from being counted as railway mappings.
function extractObjectLiteral(varName) {
  const marker = "var " + varName;
  const start = source.indexOf(marker);
  assert(start >= 0, varName + " missing");
  const open = source.indexOf("{", start);
  assert(open >= 0, varName + " object missing");

  let depth = 0, quote = null, escape = false, lineComment = false, blockComment = false;
  for (let i = open; i < source.length; i++) {
    const ch = source[i], next = source[i + 1];
    if (lineComment) { if (ch === "\n") lineComment = false; continue; }
    if (blockComment) { if (ch === "*" && next === "/") { blockComment = false; i++; } continue; }
    if (quote) {
      if (escape) { escape = false; continue; }
      if (ch === "\\") { escape = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "/" && next === "/") { lineComment = true; i++; continue; }
    if (ch === "/" && next === "*") { blockComment = true; i++; continue; }
    if (ch === "'" || ch === '"' || ch === "`") { quote = ch; continue; }
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return source.slice(open, i + 1);
    }
  }
  throw new Error("unterminated " + varName);
}

function evaluateObject(varName) {
  return vm.runInNewContext("(" + extractObjectLiteral(varName) + ")", Object.create(null), { timeout: 1000 });
}

const operators = evaluateObject("LINE_TO_OPERATOR");
const railway = evaluateObject("LINE_RAILWAY_CODE");
const operatorKeys = Object.keys(operators);
const railwayKeys = Object.keys(railway);
const unresolved = operatorKeys.filter(k => !railway[k]);

assert(operatorKeys.length > 0, "LINE_TO_OPERATOR empty");
assert(railwayKeys.length > 0, "LINE_RAILWAY_CODE empty");
assert(railwayKeys.every(k => typeof railway[k] === "string" && railway[k].trim()), "invalid railway code value");

console.log("identity-coverage: operators=" + operatorKeys.length + ", railway codes=" + railwayKeys.length + ", unresolved=" + unresolved.length);
if (unresolved.length) {
  console.log("identity-coverage unresolved (fallback allowed; do not invent mappings): " + unresolved.join(", "));
}
console.log("identity-coverage: PASS");
