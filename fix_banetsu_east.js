// 修复磐越東線站表
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 找到磐越東線
const line = Object.values(data.lines).find(l => l.nameJa === '磐越東線');
if (!line) {
  console.error('未找到磐越東線');
  process.exit(1);
}

console.log('修复前站数:', line.stations.length);
console.log('修复前站表:', line.stations.join(', '));

// 官方站表（磐城～郡山，16站）
line.stations = [
  "Iwaki",                  // 磐城
  "Akai",                   // 赤井
  "Ogawago",                // 小川郷
  "Eda",                    // 江田
  "Kawamae",                // 川前
  "Natsui",                 // 夏井
  "Ononiimachi",            // 小野新町
  "Kanmata",                // 神俣
  "Sugaya",                 // 菅谷
  "Ogoe",                   // 大越
  "Iwaki-Tokiwa",           // 磐城常葉
  "Funehiki",               // 船引
  "Kanameta",               // 要田
  "Miharu",                 // 三春
  "Mogi",                   // 舞木
  "Koriyama"                // 郡山
];

console.log('修复后站数:', line.stations.length);
console.log('修复后站表:', line.stations.join(', '));

// 保存
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('磐越東線站表修复完成！');
