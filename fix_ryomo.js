// 修复両毛線站表
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 找到両毛線
const line = Object.values(data.lines).find(l => l.nameJa === '両毛線');
if (!line) {
  console.error('未找到両毛線');
  process.exit(1);
}

console.log('修复前站数:', line.stations.length);
console.log('修复前站表:', line.stations.join(', '));

// 官方站表（小山～高崎，22站）
line.stations = [
  "Oyama",                   // 小山
  "Omoigawa",                // 思川
  "Tochigi",                 // 栃木
  "Ohirashita",              // 大平下
  "Iwafune",                 // 岩舟
  "Sano",                    // 佐野
  "Tomita",                  // 富田
  "Ashikaga-Flower-Park",    // あしかがフラワーパーク
  "Ashikaga",                // 足利
  "Yamamae",                 // 山前
  "Omata",                   // 小俣
  "Koryu",                   // 桐生
  "Iwajuku",                 // 岩宿
  "Kunisada",                // 国定
  "Isesaki",                 // 伊勢崎
  "Komagata",                // 駒形
  "Maebashi-Oshima",         // 前橋大島
  "Maebashi",                // 前橋
  "Shin-Maebashi",           // 新前橋
  "Ino",                     // 井野
  "Takasaki-Tonyamachi",     // 高崎問屋町
  "Takasaki"                 // 高崎
];

console.log('修复后站数:', line.stations.length);
console.log('修复后站表:', line.stations.join(', '));

// 保存
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('両毛線站表修复完成！');
