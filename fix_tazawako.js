// 修复田沢湖線站表
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 找到田沢湖線
const line = Object.values(data.lines).find(l => l.nameJa === '田沢湖線');
if (!line) {
  console.error('未找到田沢湖線');
  process.exit(1);
}

console.log('修复前站数:', line.stations.length);
console.log('修复前站表:', line.stations.join(', '));

// 官方站表（盛岡～大曲，18站）
line.stations = [
  "Morioka",               // 盛岡
  "Maegata",               // 前潟
  "Okama",                 // 大釜
  "Koiwai",                // 小岩井
  "Shizukuishi",           // 雫石
  "Harukiba",              // 春木場
  "Akabuchi",              // 赤渕
  "Tazawako",              // 田沢湖
  "Sashimaki",             // 刺巻
  "Jindai",                // 神代
  "Shoden",                // 生田
  "Kakunodate",            // 角館
  "Uguisuno",              // 鶯野
  "Ugo-Nagano",            // 羽後長野
  "Yariminai",             // 鑓見内
  "Ugo-Yotsuya",           // 羽後四ツ屋
  "Kita-Omagari",          // 北大曲
  "Omagari"                // 大曲
];

console.log('修复后站数:', line.stations.length);
console.log('修复后站表:', line.stations.join(', '));

// 保存
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('田沢湖線站表修复完成！');
