// Unit harness: verify TourismType.getSpotType hard rule (mall -> spot) after 4.3.1242.
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
global.window = {};
const src = fs.readFileSync(path.join(ROOT, "js", "tourism-type.js"), "utf8");
eval(src);
const T = global.window.TourismType;
if (!T) { console.error("FAIL: TourismType not exported"); process.exit(1); }

function spot(tags, extra) {
  const s = Object.assign({ name: "t", tags: tags }, extra || {});
  return s;
}

const cases = [
  // [desc, spot, expected]
  ["mall + shopping -> spot (hard rule)", spot(["all", "mall", "shopping"]), "spot"],
  ["mall only -> spot", spot(["all", "mall"]), "spot"],
  ["shopping only -> shop", spot(["all", "shopping"]), "shop"],
  ["food -> shop", spot(["all", "food"]), "shop"],
  ["event -> event", spot(["all", "event"]), "event"],
  ["mall + event -> event (event precedence)", spot(["all", "mall", "event"]), "event"],
  ["explicit type mall -> spot", spot(["all"], { tourismType: "mall" }), "spot"],
  ["explicit type department_store -> spot", spot(["all"], { category: "department_store" }), "spot"],
  ["explicit type shopping_mall -> spot", spot(["all"], { type: "shopping_mall" }), "spot"],
  ["explicit type store -> shop", spot(["all"], { type: "store" }), "shop"],
  ["no tags -> spot", spot([]), "spot"],
  ["play -> shop", spot(["all", "play"]), "shop"],
  ["null -> spot", null, "spot"],
];

let failed = 0;
for (const [desc, s, exp] of cases) {
  const got = T.getSpotType(s);
  const ok = got === exp;
  if (!ok) failed++;
  console.log((ok ? "PASS" : "FAIL") + " | " + desc + " | expected=" + exp + " got=" + got);
}

// partitionSpots sanity
const parts = T.partitionSpots([
  spot(["all", "mall"]),
  spot(["all", "shopping"]),
  spot(["all", "event"]),
]);
const pExpected = { event: 1, shop: 1, spot: 1 };
const pOk = parts.event.length === pExpected.event && parts.shop.length === pExpected.shop && parts.spot.length === pExpected.spot;
if (!pOk) failed++;
console.log((pOk ? "PASS" : "FAIL") + " | partitionSpots mall->spot / shopping->shop / event->event");

process.exit(failed === 0 ? 0 : 1);
