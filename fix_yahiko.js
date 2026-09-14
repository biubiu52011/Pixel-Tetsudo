// 修复弥彦線站表
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 找到弥彦線
const line = Object.values(data.lines).find(l => l.nameJa === '弥彦線');
if (!line) {
  console.error('未找到弥彦線');
  process.exit(1);
}

console.log('修复前站数:', line.stations.length);
console.log('修复前站表:', line.stations.join(', '));

// 官方站表（弥彦～東三条，8站）
line.stations = [
  "Yahiko",              // 弥彦
  "Yahagi",              // 矢作
  "Yoshida",             // 吉田
  "Nishi-Tsubame",       // 西燕
  "Tsubame",             // 燕
  "Tsubame-Sanjo",       // 燕三条
  "Kita-Sanjo",          // 北三条
  "Higashi-Sanjo"        // 東三条
];

console.log('修复后站数:', line.stations.length);
console.log('修复后站表:', line.stations.join(', '));

// 保存
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('弥彦線站表修复完成！');
