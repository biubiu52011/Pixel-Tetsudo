// Check raw image field values for the 3 entries that did not get image set
"use strict";
const fs = require("fs");
const path = require("path");
const p = path.resolve("C:/Users/80996/Documents/项目/像素铁道/data/core/tourism_data.json");
const raw = fs.readFileSync(p, "utf8");
const j = JSON.parse(raw);
for (const n of ["東洋百貨店 別館", "本多劇場", "下北沢SHELTER"]) {
  const s = j.spots.find(x => x.name === n);
  console.log("== " + n);
  console.log("  keys: " + Object.keys(s).join(","));
  console.log("  image: [" + s.image + "]");
  console.log("  imageSource: [" + s.imageSource + "]");
}
// how many occurrences of '"image": ""' overall
const emptyImg = raw.split('"image": ""').length - 1;
console.log("empty-image-field occurrences: " + emptyImg);
