// Verify generated tourism-data.file.js contains renamed menu refs and new images
"use strict";
const fs = require("fs");
const path = require("path");
const p = path.resolve("C:/Users/80996/Documents/项目/像素铁道/data/core/tourism-data.file.js");
const raw = fs.readFileSync(p, "utf8");
const checks = [
  "浅草聚楽_0_オムライス.jpg",
  "キッチンフライパン_1_チキンソースカツ丼.jpg",
  "上川口屋（かみかわぐちや）_2_ばら売りキャラメル.jpg",
  "東京スカイツリー.jpg",
  "東洋百貨店 別館.jpg",
  "本多劇場.jpg",
  "下北沢SHELTER.jpg",
  "隅田川花火大会.jpg",
  "三社祭（浅草神社例大祭）.jpg",
  "浅草サンバカーニバル パレードコンテスト.jpg",
  "神宮外苑花火大会.jpg",
  "東京高円寺阿波おどり.jpg",
  "北千住丸井 (Marui).jpg",
  "Wikimedia Commons (File:Tokyo_Skytree_2014_Ⅱ.jpg)"
];
let ok = 0;
for (const c of checks) {
  const hit = raw.indexOf(c) >= 0;
  if (hit) ok++;
  console.log((hit ? "OK  " : "MISS") + " " + c);
}
console.log("checks: " + ok + "/" + checks.length);
// old names should be gone from menu refs
const stale = ["asakusa-juraku_0_omurice.jpg", "frypan_1_chicken-katsudon.jpg", "kamikawaguchiya_2_caramel.jpg"];
for (const s of stale) console.log((raw.indexOf(s) >= 0 ? "STALE" : "CLEAN") + " " + s);
