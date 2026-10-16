// Audit images/料理: menu img refs vs disk files; naming pattern compliance.
"use strict";
const fs = require("fs");
const path = require("path");
const root = path.resolve("C:/Users/80996/Documents/项目/像素铁道");
const p = path.join(root, "data/core/tourism_data.json");
const j = JSON.parse(fs.readFileSync(p, "utf8"));
const dir = path.join(root, "images/料理");
const disk = new Set(fs.readdirSync(dir));

const refs = new Map(); // basename -> [spot names]
for (const s of j.spots) {
  const menu = s.menu || [];
  for (const it of menu) {
    if (!it.img) continue;
    const base = path.basename(it.img);
    if (!refs.has(base)) refs.set(base, []);
    refs.get(base).push(s.name);
  }
}

console.log("menu refs: " + refs.size + ", disk files: " + disk.size);

// A. broken refs (referenced but missing on disk)
const broken = Array.from(refs.keys()).filter(b => !disk.has(b));
console.log("A broken refs: " + broken.length);
for (const b of broken) console.log("  MISSING: " + b + " <- " + refs.get(b).join(" / "));

// B. orphan files (on disk, no ref)
const orphan = Array.from(disk).filter(f => !refs.has(f));
console.log("B orphan files: " + orphan.length);
for (const f of orphan.sort()) console.log("  ORPHAN: " + f);

// C. naming pattern compliance: <slug>_<num>_<slug>.jpg
const pat = /^[a-z0-9-]+_[0-9]+_[a-z0-9-]+\.jpg$/i;
const bad = Array.from(disk).filter(f => !pat.test(f));
console.log("C non-pattern files: " + bad.length);
for (const f of bad.sort()) console.log("  BADNAME: " + f);

// D. per-store index gaps (files like store_0, store_2 but no store_1)
const byStore = new Map();
for (const f of disk) {
  const m = f.match(/^([a-z0-9-]+)_([0-9]+)_/i);
  if (m) {
    if (!byStore.has(m[1])) byStore.set(m[1], []);
    byStore.get(m[1]).push(parseInt(m[2], 10));
  }
}
console.log("D stores with gaps: ");
for (const [store, idxs] of Array.from(byStore.entries()).sort()) {
  const sorted = idxs.slice().sort((a, b) => a - b);
  let gap = false;
  for (let i = 1; i < sorted.length; i++) if (sorted[i] - sorted[i - 1] > 1) { gap = true; break; }
  if (gap) console.log("  GAP " + store + ": " + sorted.join(","));
}
