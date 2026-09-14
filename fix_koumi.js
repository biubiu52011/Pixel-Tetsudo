// 修复小海線站表
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 找到小海線
const line = Object.values(data.lines).find(l => l.nameJa === '小海線');
if (!line) {
  console.error('未找到小海線');
  process.exit(1);
}

console.log('修复前站数:', line.stations.length);
console.log('修复前站表:', line.stations.join(', '));

// 官方站表（小渊泽～小诸，31站）
line.stations = [
  "Kobuchizawa",             // 小淵沢
  "Kai-Koizumi",             // 甲斐小泉
  "Kai-Oizumi",              // 甲斐大泉
  "Kiyosato",                // 清里
  "Nobeyama",                // 野辺山
  "Shinano-Kawakami",        // 信濃川上
  "Saku-Hirose",             // 佐久広瀬
  "Saku-Uminokuchi",         // 佐久海ノ口
  "Umijiri",                 // 海尻
  "Matsubarako",              // 松原湖
  "Koumi",                   // 小海
  "Managashi",               // 馬流
  "Takaiwa",                 // 高岩
  "Yachiho",                 // 八千穂
  "Kaise",                   // 海瀬
  "Haguroshita",             // 羽黒下
  "Aonuma",                  // 青沼
  "Usuda",                   // 臼田
  "Tatsuokajo",              // 龍岡城
  "Otabe",                   // 太田部
  "Nakagomi",                // 中込
  "Namezu",                  // 滑津
  "Kita-Nakagomi",           // 北中込
  "Iwamurada",               // 岩村田
  "Sakudaira",               // 佐久平
  "Nakasato",                // 中佐都
  "Misato",                  // 美里
  "Mitsuoka",                // 三岡
  "Otome",                   // 乙女
  "Higashi-Komoro",          // 東小諸
  "Komoro"                   // 小諸
];

console.log('修复后站数:', line.stations.length);
console.log('修复后站表:', line.stations.join(', '));

// 保存
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('小海線站表修复完成！');
