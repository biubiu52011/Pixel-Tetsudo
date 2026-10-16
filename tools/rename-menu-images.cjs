// Rename images/料理 menu images to <spot.name>_<idx>_<item>.jpg (Japanese) and sync all menu[].img refs in tourism_data.json.
"use strict";
const fs = require("fs");
const path = require("path");
const root = path.resolve("C:/Users/80996/Documents/项目/像素铁道");
const DIR = path.join(root, "images/料理");
const DATA = path.join(root, "data/core/tourism_data.json");
const REL = "../images/料理";

const INVALID = /[\\/:*?"<>|\u0000-\u001f]/g;
function safeName(s) {
  let out = String(s).replace(INVALID, " ").replace(/\s+/g, " ").trim();
  out = out.replace(/[. ]+$/, "");
  return out;
}

const raw0 = fs.readFileSync(DATA, "utf8");
const j = JSON.parse(raw0);

// Build rename map: old basename -> new basename
const plan = new Map();
const issues = [];
const used = new Set();
for (const s of j.spots) {
  const menu = s.menu || [];
  for (let i = 0; i < menu.length; i++) {
    const it = menu[i];
    if (!it.img) continue;
    const oldBase = path.basename(it.img);
    const itemName = safeName(it.item || ("item_" + i));
    const spotName = safeName(s.name || ("spot_" + i));
    let newBase = spotName + "_" + i + "_" + itemName + ".jpg";
    if (newBase.length > 150) newBase = spotName + "_" + i + "_" + itemName.slice(0, 80) + ".jpg";
    if (used.has(newBase)) { issues.push("COLLISION: " + newBase); }
    used.add(newBase);
    plan.set(oldBase, { newBase, spot: s.name, item: it.item, idx: i });
  }
}

console.log("plan size: " + plan.size);
for (const [oldB, p] of Array.from(plan.entries()).sort()) {
  console.log("  " + oldB + "  =>  " + p.newBase + "   | " + p.spot + " [" + p.idx + "] " + (p.item || ""));
}
console.log("issues: " + issues.length);
for (const i of issues) console.log("  " + i);

if (process.argv.includes("--apply")) {
  // rename files
  for (const [oldB, p] of plan) {
    const src = path.join(DIR, oldB);
    const dst = path.join(DIR, p.newBase);
    if (!fs.existsSync(src)) { console.log("RENAME MISSING SRC: " + oldB); continue; }
    fs.renameSync(src, dst);
    console.log("renamed: " + oldB + " -> " + p.newBase);
  }
  // sync data refs
  let out = raw0;
  for (const [oldB, p] of plan) {
    const oldRef = '"' + REL + "/" + oldB + '"';
    const newRef = '"' + REL + "/" + p.newBase + '"';
    const cnt = out.split(oldRef).length - 1;
    if (cnt !== 1) console.log("WARN ref count " + cnt + " for " + oldB);
    out = out.split(oldRef).join(newRef);
  }
  fs.writeFileSync(DATA, out, "utf8");
  console.log("data synced");
  // verify
  const v = JSON.parse(fs.readFileSync(DATA, "utf8"));
  let broken = 0;
  const diskNow = new Set(fs.readdirSync(DIR));
  for (const s of v.spots) {
    for (const it of s.menu || []) {
      if (it.img && !diskNow.has(path.basename(it.img))) { broken++; console.log("VERIFY BROKEN: " + s.name + " -> " + it.img); }
    }
  }
  console.log("verify broken: " + broken);
} else {
  console.log("DRY-RUN (pass --apply)");
}
