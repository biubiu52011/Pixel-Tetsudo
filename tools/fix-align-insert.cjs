// Pretty-format aware: align image refs to disk (exact/ws-only name match) AND insert image/imageSource for the 9 new entries.
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "data", "core", "tourism_data.json");
const raw0 = fs.readFileSync(DATA, "utf8");
const json = JSON.parse(raw0);
const spots = json.spots;
const first = spots.find(s => s.image).image;
const relDir = first.substring(0, first.lastIndexOf("/"));
const dir = path.join(ROOT, relDir.replace(/^\.\.\//, ""));
const disk = new Set(fs.readdirSync(dir));
const imgPrefix = '"image": "' + relDir + "/";

function normWS(s) { return String(s || "").replace(/\s+/g, ""); }

// ---- plan align fixes ----
const fixes = [];
for (const s of spots) {
  if (!s.image) continue;
  const base = path.basename(s.image);
  if (disk.has(base)) continue;
  const exact = s.name + ".jpg";
  if (disk.has(exact)) { fixes.push({ name: s.name, from: base, to: exact }); continue; }
  const cand = Array.from(disk).filter(f => normWS(path.basename(f, path.extname(f))) === normWS(s.name));
  if (cand.length === 1) fixes.push({ name: s.name, from: base, to: cand[0] });
  else fixes.push({ name: s.name, from: base, to: null, why: "no-match" });
}

// ---- new images ----
const NEW = [
  { name: "東京スカイツリー", src: "Wikimedia Commons (File:Tokyo_Skytree_2014_Ⅱ.jpg)" },
  { name: "東洋百貨店 別館", src: "公式サイト bekkan.k-toyo.jp (sanpo_03_17)" },
  { name: "本多劇場", src: "Wikimedia Commons (File:Honda_theater_shimokitazawa_2009.JPG)" },
  { name: "下北沢SHELTER", src: "Wikimedia Commons (File:NECRONOMIDOL_Live_at_Shimokitazawa_SHELTER,_Dec_2021.jpg)" },
  { name: "隅田川花火大会", src: "Wikimedia Commons (File:2012年隅田川花火大会.jpg)" },
  { name: "三社祭（浅草神社例大祭）", src: "Wikimedia Commons (File:三之宮神輿宮出し.JPG)" },
  { name: "浅草サンバカーニバル パレードコンテスト", src: "Wikimedia Commons (File:Asakusa-Samba-Carnival-parade.jpg)" },
  { name: "神宮外苑花火大会", src: "Wikimedia Commons (File:Jingu_Fireworks_08-1.jpg)" },
  { name: "東京高円寺阿波おどり", src: "Wikimedia Commons (File:Awa-odori_Kōenji_01.jpg)" }
];

// ---- dry-run report ----
let out = raw0;
let nFix = 0, nIns = 0, anchorFail = 0;

// 1) align replacements
for (const f of fixes) {
  if (!f.to) { console.log("TODO no-match: " + f.name + " | " + f.from); continue; }
  const oldRef = imgPrefix + f.from + '"';
  const newRef = imgPrefix + f.to + '"';
  const cnt = out.split(oldRef).length - 1;
  if (cnt !== 1) { console.log("WARN align count " + cnt + " for " + f.from); }
  out = out.split(oldRef).join(newRef);
  nFix++;
  console.log("FIX " + f.name + " | " + f.from + " -> " + f.to);
}

// 2) insert image/imageSource after "name": for the 9 new entries (only if no image yet)
for (const s of spots) {
  const hit = NEW.find(n => n.name === s.name);
  if (!hit) continue;
  if (s.image) { console.log("SKIP already has image: " + s.name); continue; }
  const nameKey = '"name": ' + JSON.stringify(s.name);
  const idx = out.indexOf(nameKey);
  if (idx < 0) { console.log("ANCHOR FAIL: " + s.name); anchorFail++; continue; }
  const endOfValue = idx + nameKey.length; // points right after the closing quote of the name string
  const imgRef = relDir + "/" + s.name + ".jpg";
  const snippet = ',\n   "image": ' + JSON.stringify(imgRef) + ',\n   "imageSource": ' + JSON.stringify(hit.src);
  out = out.slice(0, endOfValue) + snippet + out.slice(endOfValue);
  nIns++;
  console.log("INS " + s.name + " | image + source");
}

console.log("fixes=" + nFix + " inserts=" + nIns + " anchorFails=" + anchorFail);

if (process.argv.includes("--apply")) {
  fs.writeFileSync(DATA, out, "utf8");
  console.log("APPLIED");
  // verify
  const v = JSON.parse(fs.readFileSync(DATA, "utf8"));
  let b = 0;
  for (const s of v.spots) {
    if (!s.image) continue;
    if (!fs.existsSync(path.join(ROOT, s.image.replace(/^\.\.\//, "")))) { b++; console.log("VERIFY BROKEN: " + s.name + " -> " + s.image); }
  }
  const done = v.spots.filter(s => NEW.some(n => n.name === s.name));
  console.log("verify broken=" + b + " new9 image=" + done.every(s => !!s.image) + " source=" + done.every(s => !!s.imageSource));
} else {
  console.log("DRY-RUN (pass --apply to write)");
}
