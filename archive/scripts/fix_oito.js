// 修复大糸線站表
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 找到大糸線
const line = Object.values(data.lines).find(l => l.nameJa === '大糸線');
if (!line) {
  console.error('未找到大糸線');
  process.exit(1);
}

console.log('修复前站数:', line.stations.length);
console.log('修复前站表:', line.stations.join(', '));

// 官方站表（松本～南小谷，JR东日本区间，32站）
line.stations = [
  "Matsumoto",              // 松本
  "Kita-Matsumoto",         // 北松本
  "Shimauchi",              // 島内
  "Shimatakamatsu",         // 島高松
  "Azusabashi",             // 梓橋
  "Hitoichiba",             // 一日市場
  "Nakagaya",               // 中萱
  "Minami-Toyoshina",       // 南豊科
  "Toyoshina",              // 豊科
  "Hakuyacho",              // 柏矢町
  "Hotaka",                 // 穂高
  "Ariake",                 // 有明
  "Azumi-Oiwake",           // 安曇追分
  "Hosono",                 // 細野
  "Kita-Hosono",            // 北細野
  "Shinano-Matsukawa",      // 信濃松川
  "Azumi-Kutsukake",        // 安曇沓掛
  "Shinano-Tokiwa",         // 信濃常盤
  "Minami-Omachi",          // 南大町
  "Shinano-Omachi",         // 信濃大町
  "Kita-Omachi",            // 北大町
  "Shinano-Kizaki",         // 信濃木崎
  "Inao",                   // 稲尾
  "Uminoguchi",              // 海ノ口
  "Yanaba",                 // 簗場
  "Minami-Kamishiro",       // 南神城
  "Kamishiro",              // 神城
  "Iimori",                 // 飯森
  "Hakuba",                 // 白馬
  "Shinano-Moriue",         // 信濃森上
  "Hakuba-Oike",            // 白馬大池
  "Chikuni",                // 千国
  "Otariguchi",             // 小谷口
  "Kita-Otari",             // 北小谷
  "Naka-Otsari",            // 南小谷（终点）
  "Minami-Otari"            // 南小谷
];

console.log('修复后站数:', line.stations.length);
console.log('修复后站表:', line.stations.join(', '));

// 保存
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('大糸線站表修复完成！');
