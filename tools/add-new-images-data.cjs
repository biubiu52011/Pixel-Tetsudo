// Verify ref alignment; add image + imageSource for the 9 new images via text-level insertion (no full re-serialize).
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "data", "core", "tourism_data.json");
let raw = fs.readFileSync(DATA, "utf8");
const json = JSON.parse(raw);
const spots = json.spots;
const first = spots.find(s => s.image).image;
const relDir = first.substring(0, first.lastIndexOf("/"));
const dir = path.join(ROOT, relDir.replace(/^\.\.\//, ""));
const disk = new Set(fs.readdirSync(dir));

let broken = 0;
for (const s of spots) {
  if (!s.image) continue;
  const abs = path.join(ROOT, s.image.replace(/^\.\.\//, ""));
  if (!fs.existsSync(abs)) { console.log("BROKEN: " + s.name + " -> " + s.image); broken++; }
}
console.log("broken refs after align: " + broken);

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

// text-level insert: after "name":<escaped>, insert image + imageSource fields
let applied = 0;
for (const s of spots) {
  const hit = NEW.find(n => n.name === s.name);
  if (!hit) continue;
  const abs = path.join(dir, s.name + ".jpg");
  if (!fs.existsSync(abs)) { console.log("MISSING FILE for " + s.name); continue; }
  const nameKey = '"name":' + JSON.stringify(s.name);
  const idx = raw.indexOf(nameKey);
  if (idx < 0) { console.log("ANCHOR NOT FOUND: " + s.name); continue; }
  // find end of the name string literal (after closing quote of value)
  const valStart = idx + nameKey.length;
  const closeQuote = raw.indexOf('"', valStart);
  const insertAt = closeQuote + 1;
  const imgRef = JSON.stringify(relDir + "/" + s.name + ".jpg");
  const srcRef = JSON.stringify(hit.src);
  const snippet = ',"image":' + imgRef + ',"imageSource":' + srcRef;
  raw = raw.slice(0, insertAt) + snippet + raw.slice(insertAt);
  applied++;
}
console.log("inserted image fields: " + applied);

fs.writeFileSync(DATA, raw, "utf8");

// final verify
const v = JSON.parse(fs.readFileSync(DATA, "utf8"));
let b2 = 0;
for (const s of v.spots) {
  if (!s.image) continue;
  const abs = path.join(ROOT, s.image.replace(/^\.\.\//, ""));
  if (!fs.existsSync(abs)) { console.log("FINAL BROKEN: " + s.name + " -> " + s.image); b2++; }
}
console.log("final broken refs: " + b2);
const newOnes = v.spots.filter(s => NEW.some(n => n.name === s.name));
console.log("new-image entries: " + newOnes.length + " | all have image: " + newOnes.every(s => !!s.image) + " | all have source: " + newOnes.every(s => !!s.imageSource));
console.log("total spots: " + v.spots.length);
