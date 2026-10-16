// Rename tourism main images so the file stem matches the spot name (skip pure-whitespace differences).
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "data", "core", "tourism_data.json");
let raw = fs.readFileSync(DATA, "utf8");
const json = JSON.parse(raw);
const spots = json.spots;

function normalizeWS(s) {
  return String(s || "").replace(/\s+/g, "");
}

const pairs = []; // { oldBase, newBase, dir, name }
for (const s of spots) {
  if (!s.image) continue;
  const base = path.basename(s.image);
  const stem = path.basename(base, path.extname(base));
  if (stem === s.name) continue;
  // skip pure whitespace differences only
  if (normalizeWS(stem) === normalizeWS(s.name) && stem !== s.name) {
    pairs.push({ oldBase: base, newBase: s.name + ".jpg", dir: path.dirname(s.image), name: s.name, skippedWS: true });
    continue;
  }
  pairs.push({ oldBase: base, newBase: s.name + ".jpg", dir: path.dirname(s.image), name: s.name, skippedWS: false });
}

console.log("candidate renames: " + pairs.length);
const willRename = pairs.filter(p => !p.skippedWS);
console.log("actual renames: " + willRename.length);
const skipped = pairs.filter(p => p.skippedWS);
skipped.forEach(p => console.log("SKIP(ws only): " + p.oldBase + " -> " + p.newBase));

// safety: target file must not already exist; old file must exist
let fail = false;
for (const p of willRename) {
  const absDir = path.join(ROOT, p.dir.replace(/^\.\.\//, ""));
  const oldAbs = path.join(absDir, p.oldBase);
  const newAbs = path.join(absDir, p.newBase);
  if (!fs.existsSync(oldAbs)) { console.log("FAIL: old missing " + p.oldBase); fail = true; }
  if (fs.existsSync(newAbs)) { console.log("FAIL: new exists " + p.newBase); fail = true; }
}
if (fail) { console.log("aborted due to safety check failures"); process.exit(1); }

// perform file renames
for (const p of willRename) {
  const absDir = path.join(ROOT, p.dir.replace(/^\.\.\//, ""));
  fs.renameSync(path.join(absDir, p.oldBase), path.join(absDir, p.newBase));
  // update JSON text: only inside image field values
  const oldRef = p.dir + "/" + p.oldBase;
  const newRef = p.dir + "/" + p.newBase;
  const count = raw.split(oldRef).length - 1;
  if (count !== 1) { console.log("WARN: ref count " + count + " for " + oldRef); }
  raw = raw.split(oldRef).join(newRef);
  console.log("RENAMED: " + p.oldBase + " -> " + p.newBase);
}

fs.writeFileSync(DATA, raw, "utf8");

// verify
const v = JSON.parse(raw);
let broken = 0;
for (const s of v.spots) {
  if (!s.image) continue;
  const abs = path.join(ROOT, s.image.replace(/^\.\.\//, ""));
  if (!fs.existsSync(abs)) { console.log("VERIFY FAIL: " + s.name + " -> " + s.image); broken++; }
}
console.log("verify broken refs: " + broken);
console.log("done");
