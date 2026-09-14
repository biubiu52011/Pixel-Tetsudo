// 修复越後線站表
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 找到越後線
const line = Object.values(data.lines).find(l => l.nameJa === '越後線');
if (!line) {
  console.error('未找到越後線');
  process.exit(1);
}

console.log('修复前站数:', line.stations.length);
console.log('修复前站表:', line.stations.join(', '));

// 官方站表（柏崎～新潟，33站）
line.stations = [
  "Kashiwazaki",              // 柏崎
  "Higashi-Kashiwazaki",      // 東柏崎
  "Nishi-Nakadori",           // 西中通
  "Arahama",                  // 荒浜
  "Kariwa",                   // 刈羽
  "Nishiyama",                // 西山
  "Raihai",                   // 礼拝
  "Ishiji",                   // 石地
  "Oginojo",                  // 小木ノ城
  "Izumozaki",                // 出雲崎
  "Myohoji",                  // 妙法寺
  "Ojimaya",                  // 小島谷
  "Kirihara",                 // 桐原
  "Teradomari",               // 寺泊
  "Bunsui",                   // 分水
  "Aozu",                     // 粟生津
  "Minami-Yoshida",           // 南吉田
  "Yoshida",                  // 吉田
  "Kita-Yoshida",             // 北吉田
  "Iwamuro",                  // 岩室
  "Maki",                     // 巻
  "Echigo-Sone",              // 越後曽根
  "Echigo-Akatsuka",          // 越後赤塚
  "Uchino-Nishigaoka",        // 内野西が丘
  "Uchino",                   // 内野
  "Niigata-University",       // 新潟大学前
  "Terao",                    // 寺尾
  "Kobari",                   // 小針
  "Aoyama",                   // 青山
  "Sekiya",                   // 関屋
  "Hakusan",                  // 白山
  "Kamitokoro",               // 上所
  "Niigata"                   // 新潟
];

console.log('修复后站数:', line.stations.length);
console.log('修复后站表:', line.stations.join(', '));

// 保存
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('越後線站表修复完成！');
