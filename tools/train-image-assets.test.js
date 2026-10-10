const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const files = ["js/train-vehicle.js"];
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
// All 51 current canonical references exist in the committed gallery.
// Future stale filenames must fail rather than silently accumulating debt.
const KNOWN_MISSING_BASELINE = 0;
const uniqueMissing = [...new Set(missing)];
assert(
  uniqueMissing.length <= KNOWN_MISSING_BASELINE,
  "new train image asset regression: baseline=" + KNOWN_MISSING_BASELINE +
  " current=" + uniqueMissing.length + "\n" + uniqueMissing.join("\n")
);
if (uniqueMissing.length) {
  console.warn("train-image-assets: KNOWN DEBT (" + uniqueMissing.length +
    " unique missing refs; baseline " + KNOWN_MISSING_BASELINE + ")");
} else {
  console.log("train-image-assets: PASS (" + checked + " refs)");
}
