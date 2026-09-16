// 修复米坂線站表
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 找到米坂線
const line = Object.values(data.lines).find(l => l.nameJa === '米坂線');
if (!line) {
  console.error('未找到米坂線');
  process.exit(1);
}

console.log('修复前站数:', line.stations.length);
console.log('修复前站表:', line.stations.join(', '));

// 官方站表（米沢～坂町，20站）
line.stations = [
  "Yonezawa",               // 米沢
  "Minami-Yonezawa",        // 南米沢
  "Nishi-Yonezawa",         // 西米沢
  "Narushima",              // 成島
  "Chugun",                 // 中郡
  "Uzen-Komatsu",           // 羽前小松
  "Inukawa",                // 犬川
  "Imaizumi",               // 今泉
  "Hagyu",                  // 萩生
  "Uzen-Tsubaki",           // 羽前椿
  "Tenoko",                 // 手ノ子
  "Uzen-Numazawa",          // 羽前沼沢
  "Isaryo",                 // 伊佐領
  "Uzen-Matsuoka",          // 羽前松岡
  "Oguni",                  // 小国
  "Echigo-Kanamaru",        // 越後金丸
  "Echigo-Katakai",         // 越後片貝
  "Echigo-Shimoseki",       // 越後下関
  "Echigo-Oshima",          // 越後大島
  "Sakamachi"               // 坂町
];

console.log('修复后站数:', line.stations.length);
console.log('修复后站表:', line.stations.join(', '));

// 保存
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('米坂線站表修复完成！');
