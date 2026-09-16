// 修复山田線站表
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 找到山田線
const line = Object.values(data.lines).find(l => l.nameJa === '山田線');
if (!line) {
  console.error('未找到山田線');
  process.exit(1);
}

console.log('修复前站数:', line.stations.length);
console.log('修复前站表:', line.stations.join(', '));

// 官方站表（盛岡～宮古，15站）
line.stations = [
  "Morioka",               // 盛岡
  "Kami-Morioka",          // 上盛岡
  "Yamagishi",             // 山岸
  "Kami-Yonai",            // 上米内
  "Kuzakai",               // 区界
  "Matsukusa",             // 松草
  "Kawauchi",              // 川内
  "Hakoishi",              // 箱石
  "Rikuchu-Kawai",         // 陸中川井
  "Haratai",               // 腹帯
  "Moichi",                // 茂市
  "Hikime",                // 蟇目
  "Kebaraichi",            // 花原市
  "Sentoku",               // 千徳
  "Miyako"                 // 宮古
];

console.log('修复后站数:', line.stations.length);
console.log('修复后站表:', line.stations.join(', '));

// 保存
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('山田線站表修复完成！');
