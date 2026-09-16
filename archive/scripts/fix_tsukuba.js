// 修复筑波快线站表ID错误
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 筑波快线（TsukubaExpress）正确站表
const correctStations = [
  "Akihabara",           // TX01 秋叶原
  "Shin-Okachimachi",    // TX02 新御徒町
  "Asakusa",             // TX03 浅草
  "Minami-Senju",        // TX04 南千住
  "Kita-Senju",          // TX05 北千住
  "Aoi",                 // TX06 青井
  "Rokucho",             // TX07 六町
  "Yashio",              // TX08 八潮
  "Misato-Chuo",         // TX09 三乡中央
  "Minami-Nagareyama",   // TX10 南流山
  "Nagareyama-Central-Park", // TX11 流山中央公园
  "Nagareyama-Otakanomori",  // TX12 流山大鹰之森
  "Kashiwanoha-Campus",  // TX13 柏之叶校园
  "Kashiwa-Tanaka",      // TX14 柏田中
  "Moriya",              // TX15 守谷
  "Miraidaira",          // TX16 未来平
  "Midorino",            // TX17 绿野
  "Bampaku-Kinen-Koen",  // TX18 万博纪念公园
  "Kenkyu-Gakuen",       // TX19 研究学园
  "Tsukuba"              // TX20 筑波
];

// 找到筑波快线
const lineId = 'TsukubaExpress';
const line = data.lines[lineId];
if (!line) {
  console.log('TsukubaExpress not found!');
  process.exit(1);
}

console.log('旧站表：', line.stations);
console.log('旧站数：', line.stations.length);

// 更新站表
line.stations = correctStations;

console.log('新站表：', line.stations);
console.log('新站数：', line.stations.length);

// 保存
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('railway_data.json 已更新');
