// Map menu image slugs to actual spot names + menu item names, to decide rename format.
"use strict";
const fs = require("fs");
const path = require("path");
const root = path.resolve("C:/Users/80996/Documents/项目/像素铁道");
const p = path.join(root, "data/core/tourism_data.json");
const j = JSON.parse(fs.readFileSync(p, "utf8"));
const dir = path.join(root, "images/料理");
const disk = fs.readdirSync(dir).sort();

const slugToSpot = new Map(); // slug -> spot
for (const s of j.spots) {
  const menu = s.menu || [];
  if (menu.length === 0) continue;
  const m0 = menu[0] && menu[0].img ? path.basename(menu[0].img).match(/^([a-z0-9-]+)_/) : null;
  if (m0) slugToSpot.set(m0[1], s);
}

console.log("=== slug -> spot name -> menu items (slug_0 sample) ===");
const bySlug = new Map();
for (const f of disk) {
  const m = f.match(/^([a-z0-9-]+)_/);
  if (!m) continue;
  if (!bySlug.has(m[1])) bySlug.set(m[1], []);
  bySlug.get(m[1]).push(f);
}
for (const [slug, files] of Array.from(bySlug.entries()).sort()) {
  const spot = slugToSpot.get(slug);
  const name = spot ? spot.name : "(NO SPOT)";
  // sample items from spot.menu
  let items = "";
  if (spot) {
    items = (spot.menu || []).map((it, i) => i + ":" + (it.item || "?")).join(", ");
  }
  console.log(slug + " | " + name + " | files=" + files.length + " | " + items);
}
