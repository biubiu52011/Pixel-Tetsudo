const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const files = ["js/train-icons.js"];
let checked = 0;
const missing = [];

for (const rel of files) {
  const src = fs.readFileSync(path.join(root, rel), "utf8");
  const re = /["'](\.\.\/images\/列车\/[^"'\n]+)["']/g;
  let m;
  while ((m = re.exec(src))) {
    checked++;
    const target = path.normalize(path.join(root, "js", m[1]));
    if (!fs.existsSync(target)) missing.push(m[1]);
  }
}
assert(checked > 0, "no train image references found");
assert.strictEqual(missing.length, 0, "missing train image assets:\n" + missing.join("\n"));
console.log("train-image-assets: PASS (" + checked + " refs)");
