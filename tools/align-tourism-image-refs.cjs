// Align tourism_data.json image refs to actual files on disk (disk names = normalized entry names).
// Dry-run mode by default: prints planned changes without writing.
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "data", "core", "tourism_data.json");
const raw = fs.readFileSync(DATA, "utf8");
const json = JSON.parse(raw);
const spots = json.spots;

const first = spots.find(s => s.image).image;
const dir = path.join(ROOT, first.substring(0, first.lastIndexOf("/")).replace(/^\.\.\//, ""));
const disk = new Set(fs.readdirSync(dir));

function normWS(s) { return String(s || "").replace(/\s+/g, ""); }

const plan = [];
let broken = 0;
for (const s of spots) {
  if (!s.image) continue;
  const base = path.basename(s.image);
  if (disk.has(base)) continue;
  broken++;
  // find disk file matching entry name
  const exact = s.name + ".jpg";
  if (disk.has(exact)) {
    plan.push({ name: s.name, from: base, to: exact, how: "exact" });
    continue;
  }
  const candidates = Array.from(disk).filter(f => normWS(path.basename(f, path.extname(f))) === normWS(s.name));
  if (candidates.length === 1) {
    plan.push({ name: s.name, from: base, to: candidates[0], how: "ws-only" });
  } else {
    plan.push({ name: s.name, from: base, to: null, how: "NO-MATCH(" + candidates.length + ")" });
  }
}

console.log("broken refs: " + broken);
console.log("planned fixes: " + plan.filter(p => p.to).length);
console.log("unresolvable: " + plan.filter(p => !p.to).length);
for (const p of plan) {
  console.log((p.to ? "FIX  " : "TODO ") + p.how + " | " + p.name + " | " + p.from + " -> " + (p.to || "(none)"));
}

// write mode: pass --apply
if (process.argv.includes("--apply")) {
  let out = raw;
  let applied = 0;
  for (const p of plan) {
    if (!p.to) continue;
    const oldRef = p.from; // basename appears only in this spot's image value (unique basename)
    if (!out.includes(oldRef)) { console.log("WARN: cannot find ref in text: " + oldRef); continue; }
    // replace only the LAST occurrence? refs are unique per basename across the file; but guard: replace first occurrence of dir-joined ref
    const oldFull = "../images/" + first.substring(first.indexOf("/") + 1, first.lastIndexOf("/")) + "/" + p.from;
    const newFull = "../images/" + first.substring(first.indexOf("/") + 1, first.lastIndexOf("/")) + "/" + p.to;
    const before = out.split(oldFull).length - 1;
    if (before !== 1) { console.log("WARN: occurrence count " + before + " for " + oldFull); }
    out = out.split(oldFull).join(newFull);
    applied++;
  }
  fs.writeFileSync(DATA, out, "utf8");
  console.log("applied " + applied + " ref updates");
  // verify
  const v = JSON.parse(out);
  let still = 0;
  for (const s of v.spots) {
    if (!s.image) continue;
    const abs = path.join(ROOT, s.image.replace(/^\.\.\//, ""));
    if (!fs.existsSync(abs)) { still++; console.log("VERIFY FAIL: " + s.name + " -> " + s.image); }
  }
  console.log("verify remaining broken: " + still);
}
