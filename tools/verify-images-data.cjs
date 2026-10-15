// English-only verification output
"use strict";
const fs = require("fs");
const path = require("path");
const root = path.resolve("C:/Users/80996/Documents/项目/像素铁道");
const p = path.join(root, "data/core/tourism_data.json");
const j = JSON.parse(fs.readFileSync(p, "utf8"));
let broken = 0;
for (const s of j.spots) {
  if (!s.image) continue;
  if (!fs.existsSync(path.join(root, s.image.replace(/^\.\.\//, "")))) { broken++; console.log("BROKEN: " + s.name + " -> " + s.image); }
}
console.log("broken:" + broken);
const nine = ["東京スカイツリー","東洋百貨店 別館","本多劇場","下北沢SHELTER","隅田川花火大会","三社祭（浅草神社例大祭）","浅草サンバカーニバル パレードコンテスト","神宮外苑花火大会","東京高円寺阿波おどり"];
let okCount = 0;
for (const n of nine) {
  const s = j.spots.find(x => x.name === n);
  const hasImg = !!(s && s.image);
  const hasSrc = !!(s && s.imageSource);
  if (hasImg && hasSrc) okCount++;
  console.log((hasImg && hasSrc ? "OK  " : "MISS") + " [" + n + "] img=" + hasImg + " src=" + hasSrc);
}
console.log("new9-ok:" + okCount + "/9");
console.log("total:" + j.spots.length);
console.log("sample-marui:" + (j.spots.find(x => x.name === "北千住丸井 (Marui)") || {}).image);
