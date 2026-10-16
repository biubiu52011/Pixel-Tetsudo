// Find which spot references kamikawaguchiya menu image
"use strict";
const fs = require("fs");
const path = require("path");
const root = path.resolve("C:/Users/80996/Documents/项目/像素铁道");
const j = JSON.parse(fs.readFileSync(path.join(root, "data/core/tourism_data.json"), "utf8"));
for (const s of j.spots) {
  const menu = s.menu || [];
  for (const it of menu) {
    if (it.img && path.basename(it.img).indexOf("kamikawaguchiya") >= 0) {
      console.log("spot: " + s.name + " | item: " + (it.item || "?") + " | img: " + it.img);
    }
  }
}
console.log("done");
