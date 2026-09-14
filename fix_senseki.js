// 修复仙石線站表
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 找到仙石線
const line = Object.values(data.lines).find(l => l.nameJa === '仙石線');
if (!line) {
  console.error('未找到仙石線');
  process.exit(1);
}

console.log('修复前站数:', line.stations.length);
console.log('修复前站表:', line.stations.join(', '));

// 官方站表（青叶通～石卷，27站）
line.stations = [
  "Aoba-dori",              // あおば通
  "Sendai",                 // 仙台
  "Tsutsujigaoka",          // 榴ケ岡
  "Miyaginohara",           // 宮城野原
  "Rikuzen-Haranomachi",    // 陸前原ノ町
  "Nigatake",               // 苦竹
  "Kozuru-Shinden",         // 小鶴新田
  "Fukudamachi",            // 福田町
  "Rikuzen-Takasago",       // 陸前高砂
  "Nakanosakae",            // 中野栄
  "Tagajo",                 // 多賀城
  "Geba",                   // 下馬
  "Nishi-Shiogama",         // 西塩釜
  "Hon-Shiogama",           // 本塩釜
  "Higashi-Shiogama",       // 東塩釜
  "Rikuzen-Hamada",         // 陸前浜田
  "Matsushima-Kaigan",      // 松島海岸
  "Takagimachi",            // 高城町
  "Tetaru",                 // 手樽
  "Rikuzen-Tomiyama",       // 陸前富山
  "Rikuzen-Otsuka",         // 陸前大塚
  "Tona",                   // 東名
  "Nobiru",                 // 野蒜
  "Rikuzen-Ono",            // 陸前小野
  "Kazuma",                 // 鹿妻
  "Yamoto",                 // 矢本
  "Higashi-Yamoto",         // 東矢本
  "Rikuzen-Akai",           // 陸前赤井
  "Ishinomaki-Ayumino",     // 石巻あゆみ野
  "Hebita",                 // 蛇田
  "Rikuzen-Yamashita",      // 陸前山下
  "Ishinomaki"              // 石巻
];

console.log('修复后站数:', line.stations.length);
console.log('修复后站表:', line.stations.join(', '));

// 保存
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('仙石線站表修复完成！');
