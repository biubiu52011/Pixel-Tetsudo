// 修复花輪線站表
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 找到花輪線
const line = Object.values(data.lines).find(l => l.nameJa === '花輪線');
if (!line) {
  console.error('未找到花輪線');
  process.exit(1);
}

console.log('修复前站数:', line.stations.length);
console.log('修复前站表:', line.stations.join(', '));

// 官方站表（好摩～大館，27站）
line.stations = [
  "Koma",                  // 好摩
  "Higashi-Obuke",         // 東大更
  "Obuke",                 // 大更
  "Tairadate",             // 平館
  "Kitamori",              // 北森
  "Matsuo-Hachimantai",    // 松尾八幡平
  "Appi-Kogen",            // 安比高原
  "Akasakata",             // 赤坂田
  "Koyanohata",            // 小屋の畑
  "Araya-Shinmachi",       // 荒屋新町
  "Yokoma",                // 横間
  "Tayama",                // 田山
  "Anihata",               // 兄畑
  "Yuze-Onsen",            // 湯瀬温泉
  "Hachimantai",           // 八幡平
  "Rikuchu-Osato",         // 陸中大里
  "Kazuno-Hanawa",         // 鹿角花輪
  "Shibahira",             // 柴平
  "Towada-Minami",         // 十和田南
  "Suehiro",               // 末広
  "Dobukai",               // 土深井
  "Sawajiri",              // 沢尻
  "Junisho",               // 十二所
  "Otaki-Onsen",           // 大滝温泉
  "Ogita",                 // 扇田
  "Higashi-Odate",         // 東大館
  "Odate"                  // 大館
];

console.log('修复后站数:', line.stations.length);
console.log('修复后站表:', line.stations.join(', '));

// 保存
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('花輪線站表修复完成！');
