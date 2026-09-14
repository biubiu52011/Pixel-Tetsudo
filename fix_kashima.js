// 修复鹿島線站表
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 找到鹿島線
const line = Object.values(data.lines).find(l => l.nameJa === '鹿島線');
if (!line) {
  console.error('未找到鹿島線');
  process.exit(1);
}

console.log('修复前站数:', line.stations.length);
console.log('修复前站表:', line.stations.join(', '));

// 官方站表（香取～鹿島サッカースタジアム，6站）
line.stations = [
  "Katori",                  // 香取
  "Junikyo",                 // 十二橋
  "Itako",                   // 潮来
  "Nobukata",                // 延方
  "Kashima-Jingu",           // 鹿島神宮
  "Kashima-Soccer-Stadium"   // 鹿島サッカースタジアム
];

console.log('修复后站数:', line.stations.length);
console.log('修复后站表:', line.stations.join(', '));

// 保存
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('鹿島線站表修复完成！');
