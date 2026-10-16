// Fix the 3 empty image fields (duplicate-key shadowing) by locating each entry block and replacing its empty image value.
"use strict";
const fs = require("fs");
const path = require("path");
const p = path.resolve("C:/Users/80996/Documents/项目/像素铁道/data/core/tourism_data.json");
const DATA = p;
const raw = fs.readFileSync(DATA, "utf8");
const relDir = "../images/観光地";

const FIX = [
  { name: "東洋百貨店 別館", ref: relDir + "/東洋百貨店 別館.jpg" },
  { name: "本多劇場", ref: relDir + "/本多劇場.jpg" },
  { name: "下北沢SHELTER", ref: relDir + "/下北沢SHELTER.jpg" }
];

let out = raw;
let applied = 0;
for (const f of FIX) {
  const anchor = '"name": ' + JSON.stringify(f.name);
  const idx = out.indexOf(anchor);
  if (idx < 0) { console.log("anchor fail: " + f.name); continue; }
  // entry block extends to the next '"name":' or end
  const nextName = out.indexOf('"name":', idx + anchor.length);
  const blockEnd = nextName > 0 ? nextName : out.length;
  const block = out.slice(idx, blockEnd);
  const emptyKey = '"image": ""';
  const pos = block.indexOf(emptyKey);
  if (pos < 0) { console.log("no empty image in block: " + f.name); continue; }
  const absPos = idx + pos;
  const oldSeg = out.slice(absPos, absPos + emptyKey.length);
  const newSeg = '"image": ' + JSON.stringify(f.ref);
  out = out.slice(0, absPos) + newSeg + out.slice(absPos + emptyKey.length);
  applied++;
  console.log("fixed: " + f.name);
}
fs.writeFileSync(DATA, out, "utf8");
console.log("applied: " + applied);
// verify
const v = JSON.parse(fs.readFileSync(DATA, "utf8"));
for (const f of FIX) {
  const s = v.spots.find(x => x.name === f.name);
  console.log("verify: " + f.name + " image=[" + (s ? s.image : "?") + "]");
}
console.log("empty-image occurrences left: " + (out.split('"image": ""').length - 1));
