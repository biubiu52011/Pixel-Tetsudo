// 修复飯山線站表
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 找到飯山線
const line = Object.values(data.lines).find(l => l.nameJa === '飯山線');
if (!line) {
  console.error('未找到飯山線');
  process.exit(1);
}

console.log('修复前站数:', line.stations.length);
console.log('修复前站表:', line.stations.join(', '));

// 官方站表（豊野～越後川口，31站）
line.stations = [
  "Toyono",                  // 豊野
  "Shinano-Asano",           // 信濃浅野
  "Tategahana",              // 立ケ花
  "Kami-Imai",               // 上今井
  "Kaesa",                   // 替佐
  "Hachisu",                 // 蓮
  "Iiyama",                  // 飯山
  "Kita-Iiyama",             // 北飯山
  "Shinano-Taira",           // 信濃平
  "Togari-Nozawa-Onsen",     // 戸狩野沢温泉
  "Kamisakai",               // 上境
  "Kami-Kuwanagawa",         // 上桑名川
  "Kuwanagawa",              // 桑名川
  "Nishi-Otaki",             // 西大滝
  "Shinano-Shiratori",       // 信濃白鳥
  "Hirataki",                // 平滝
  "Yokokura",                // 横倉
  "Mori-Miyanohara",         // 森宮野原
  "Ashidaki",                // 足滝
  "Echigo-Tanaka",           // 越後田中
  "Tsunan",                  // 津南
  "Echigo-Shikawatari",      // 越後鹿渡
  "Echigo-Tazawa",           // 越後田沢
  "Echigo-Mizusawa",         // 越後水沢
  "Doichi",                  // 土市
  "Tokamachi",               // 十日町
  "Uonuma-Nakajo",           // 魚沼中条
  "Gejo",                    // 下条
  "Echigo-Iwasawa",          // 越後岩沢
  "Uchigamaki",              // 内ケ巻
  "Echigo-Kawaguchi"         // 越後川口
];

console.log('修复后站数:', line.stations.length);
console.log('修复后站表:', line.stations.join(', '));

// 保存
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('飯山線站表修复完成！');
