// 修复磐越西線站表
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 找到磐越西線
const line = Object.values(data.lines).find(l => l.nameJa === '磐越西線');
if (!line) {
  console.error('未找到磐越西線');
  process.exit(1);
}

console.log('修复前站数:', line.stations.length);
console.log('修复前站表:', line.stations.join(', '));

// 官方站表（郡山～新津，42站）
line.stations = [
  "Koriyama",              // 郡山
  "Koriyama-Tomita",       // 郡山富田
  "Kikuta",                // 喜久田
  "Akogashima",            // 安子ケ島
  "Bandai-Atami",          // 磐梯熱海
  "Nakayamajuku",          // 中山宿
  "Joko",                  // 上戸
  "Sekito",                // 関都
  "Kawageta",              // 川桁
  "Inawashiro",            // 猪苗代
  "Okinashima",            // 翁島
  "Bandaimachi",           // 磐梯町
  "Higashi-Nagahara",      // 東長原
  "Hirota",                // 広田
  "Aizu-Wakamatsu",        // 会津若松
  "Dojima",                // 堂島
  "Oikawa",                // 笈川
  "Shiokawa",              // 塩川
  "Ubadou",                // 姥堂
  "Aizu-Toyokawa",         // 会津豊川
  "Kitakata",              // 喜多方
  "Yamato",                // 山都
  "Ogino",                 // 荻野
  "Onobori",               // 尾登
  "Nozawa",                // 野沢
  "Kaminojiri",            // 上野尻
  "Tokusawa",              // 徳沢
  "Toyomi",                // 豊実
  "Hideya",                // 日出谷
  "Kanose",                // 鹿瀬
  "Tsugawa",               // 津川
  "Mikawa",                // 三川
  "Igashima",              // 五十島
  "Higashi-Gejo",          // 東下条
  "Sakihana",              // 咲花
  "Maoroshi",              // 馬下
  "Saruwada",              // 猿和田
  "Gosen",                 // 五泉
  "Kita-Gosen",            // 北五泉
  "Shinseki",              // 新関
  "Higashi-Niitsu",        // 東新津
  "Niitsu"                 // 新津
];

console.log('修复后站数:', line.stations.length);
console.log('修复后站表:', line.stations.join(', '));

// 保存
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('磐越西線站表修复完成！');
