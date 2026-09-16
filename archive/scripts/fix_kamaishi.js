// 修复釜石線站表
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 找到釜石線
const line = Object.values(data.lines).find(l => l.nameJa === '釜石線');
if (!line) {
  console.error('未找到釜石線');
  process.exit(1);
}

console.log('修复前站数:', line.stations.length);
console.log('修复前站表:', line.stations.join(', '));

// 官方站表（花巻～釜石，24站）
line.stations = [
  "Hanamaki",               // 花巻
  "Nitanai",                // 似内
  "Shin-Hanamaki",          // 新花巻
  "Oyamada",                // 小山田
  "Tsuchizawa",             // 土沢
  "Haruyama",               // 晴山
  "Iwanebashi",             // 岩根橋
  "Miyamori",               // 宮守
  "Kashiwagidaira",         // 柏木平
  "Masuzawa",               // 鱒沢
  "Arayamae",               // 荒谷前
  "Iwate-Futsukamachi",     // 岩手二日町
  "Ayaori",                 // 綾織
  "Tono",                   // 遠野
  "Aozasa",                 // 青笹
  "Iwate-Kamigo",           // 岩手上郷
  "Hirakura",               // 平倉
  "Ashigase",               // 足ケ瀬
  "Kami-Arisu",             // 上有住
  "Rikuchu-Ohashi",         // 陸中大橋
  "Dosen",                  // 洞泉
  "Matsukura",              // 松倉
  "Kosano",                 // 小佐野
  "Kamaishi"                // 釜石
];

console.log('修复后站数:', line.stations.length);
console.log('修复后站表:', line.stations.join(', '));

// 保存
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('釜石線站表修复完成！');
