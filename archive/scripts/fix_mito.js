// 修复水戸線站表
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 找到水戸線
const line = Object.values(data.lines).find(l => l.nameJa === '水戸線');
if (!line) {
  console.error('未找到水戸線');
  process.exit(1);
}

console.log('修复前站数:', line.stations.length);
console.log('修复前站表:', line.stations.join(', '));

// 官方站表（小山～友部，16站）
line.stations = [
  "Oyama",              // 小山
  "Otabayashi",         // 小田林
  "Yuki",               // 結城
  "Higashi-Yuki",       // 東結城
  "Kawashima",          // 川島
  "Tamado",             // 玉戸
  "Shimodate",          // 下館
  "Niihari",            // 新治
  "Yamato",             // 大和
  "Iwase",              // 岩瀬
  "Haguro",             // 羽黒
  "Fukuhara",           // 福原
  "Inada",              // 稲田
  "Kasama",             // 笠間
  "Shishido",           // 宍戸
  "Tomobe"              // 友部
];

console.log('修复后站数:', line.stations.length);
console.log('修复后站表:', line.stations.join(', '));

// 保存
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('水戸線站表修复完成！');
