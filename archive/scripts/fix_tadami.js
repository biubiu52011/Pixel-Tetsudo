// 修复只見線站表
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 找到只見線
const line = Object.values(data.lines).find(l => l.nameJa === '只見線');
if (!line) {
  console.error('未找到只見線');
  process.exit(1);
}

console.log('修复前站数:', line.stations.length);
console.log('修复前站表:', line.stations.join(', '));

// 官方站表（会津若松～小出，36站）
line.stations = [
  "Aizu-Wakamatsu",       // 会津若松
  "Nanukamachi",          // 七日町
  "Nishi-Wakamatsu",      // 西若松
  "Aizu-Hongo",           // 会津本郷
  "Aizu-Takada",          // 会津高田
  "Negishi",              // 根岸
  "Niitsuru",             // 新鶴
  "Wakamiya",             // 若宮
  "Aizu-Bange",           // 会津坂下
  "Todera",               // 塔寺
  "Aizu-Sakamoto",        // 会津坂本
  "Aizu-Yanaizu",         // 会津柳津
  "Godo",                 // 郷戸
  "Takiya",               // 滝谷
  "Aizu-Hinohara",        // 会津桧原
  "Aizu-Nishikata",       // 会津西方
  "Aizu-Miyashita",       // 会津宮下
  "Hayato",               // 早戸
  "Aizu-Mizunuma",        // 会津水沼
  "Aizu-Nakagawa",        // 会津中川
  "Aizu-Kawaguchi",       // 会津川口
  "Honna",                // 本名
  "Aizu-Kosugawa",        // 会津越川
  "Aizu-Yokota",          // 会津横田
  "Aizu-Oshio",           // 会津大塩
  "Aizu-Shiozawa",        // 会津塩沢
  "Aizu-Gamo",            // 会津蒲生
  "Tadami",               // 只見
  "Oshirakawa",           // 大白川
  "Irihirose",            // 入広瀬
  "Kamijo",               // 上条
  "Echigo-Suhara",        // 越後須原
  "Uonuma-Tanaka",        // 魚沼田中
  "Echigo-Hirose",        // 越後広瀬
  "Yabukami",             // 藪神
  "Koide"                 // 小出
];

console.log('修复后站数:', line.stations.length);
console.log('修复后站表:', line.stations.join(', '));

// 保存
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('只見線站表修复完成！');
