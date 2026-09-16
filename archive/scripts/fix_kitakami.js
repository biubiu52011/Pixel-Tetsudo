// 修复北上線站表
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 找到北上線
const line = Object.values(data.lines).find(l => l.nameJa === '北上線');
if (!line) {
  console.error('未找到北上線');
  process.exit(1);
}

console.log('修复前站数:', line.stations.length);
console.log('修复前站表:', line.stations.join(', '));

// 官方站表（北上～横手，15站）
line.stations = [
  "Kitakami",              // 北上
  "Yanagihara",            // 柳原
  "Ezuriko",               // 江釣子
  "Fujine",                // 藤根
  "Tatekawame",            // 立川目
  "Yokokawame",            // 横川目
  "Iwasawa",               // 岩沢
  "Waka-Sennin",           // 和賀仙人
  "Yuda-Kinshuko",         // ゆだ錦秋湖
  "Hotto-Yuda",            // ほっとゆだ
  "Yuda-Kogen",            // ゆだ高原
  "Kurosawa",              // 黒沢
  "Komatsukawa",           // 小松川
  "Ainono",                // 相野々
  "Yokote"                 // 横手
];

console.log('修复后站数:', line.stations.length);
console.log('修复后站表:', line.stations.join(', '));

// 保存
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('北上線站表修复完成！');
