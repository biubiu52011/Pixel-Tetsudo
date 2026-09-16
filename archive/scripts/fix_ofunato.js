// 修复大船渡線站表
// 官方站表（一之关～盛，25站）
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 找到大船渡線
const line = Object.values(data.lines).find(l => l.nameJa === '大船渡線');
if (!line) {
  console.error('未找到大船渡線');
  process.exit(1);
}

console.log('修复前站数:', line.stations.length);
console.log('修复前站表:', line.stations.join(', '));

// 官方站表（一之关～盛，25站）
line.stations = [
  "Ichinoseki",           // 一之関
  "Mataki",               // 真滝
  "Rikuchu-Kanzaki",      // 陸中門崎
  "Iwanoshita",           // 岩ノ下
  "Rikuchu-Matsukawa",    // 陸中松川
  "Geibikei",             // 猊鼻渓
  "Shibajuku",            // 柴宿
  "Surisawa",             // 摺沢
  "Senmaya",              // 千厩
  "Konashi",              // 小梨
  "Yagoshi",              // 矢越
  "Orikabe",              // 折壁
  "Niitsuki",             // 新月
  "Kesennuma",            // 気仙沼
  "Shishiori-Karakuwa",   // 鹿折唐桑
  "Kami-Shishiori",       // 上鹿折
  "Rikuzen-Yahagi",       // 陸前矢作
  "Takekoma",             // 竹駒
  "Rikuzen-Takata",       // 陸前高田
  "Wakinosawa",           // 脇ノ沢
  "Otomo",                // 小友
  "Hosoura",              // 細浦
  "Shimo-Funato",         // 下船渡
  "Ofunato",              // 大船渡
  "Sakari"                // 盛
];

console.log('修复后站数:', line.stations.length);
console.log('修复后站表:', line.stations.join(', '));

// 保存
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('大船渡線站表修复完成！');

// 重新生成 bundle
const { execSync } = require('child_process');
execSync('node data/core/gen-file-data.js', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
console.log('Bundle 重新生成完成！');
