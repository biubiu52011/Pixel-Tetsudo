// 修复水郡線站表
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 找到水郡線
const line = Object.values(data.lines).find(l => l.nameJa === '水郡線');
if (!line) {
  console.error('未找到水郡線');
  process.exit(1);
}

console.log('修复前站数:', line.stations.length);
console.log('修复前站表:', line.stations.join(', '));

// 官方站表（水戸～安積永盛，40站）
line.stations = [
  "Mito",                    // 水戸
  "Hitachi-Aoyagi",          // 常陸青柳
  "Hitachi-Tsuda",           // 常陸津田
  "Godai",                   // 後台
  "Shimo-Sugaya",            // 下菅谷
  "Naka-Sugaya",             // 中菅谷
  "Kami-Sugaya",             // 上菅谷
  "Hitachi-Konosu",          // 常陸鴻巣
  "Urizura",                 // 瓜連
  "Shizu",                   // 静
  "Hitachi-Omiya",           // 常陸大宮
  "Tamagawamura",            // 玉川村
  "Nogamihara",              // 野上原
  "Yamagatajuku",            // 山方宿
  "Naka-Funyu",              // 中舟生
  "Shimo-Ogawa",             // 下小川
  "Saigane",                 // 西金
  "Kami-Ogawa",              // 上小川
  "Fukuroda",                // 袋田
  "Hitachi-Daigo",           // 常陸大子
  "Shimonomiya",             // 下野宮
  "Yamatsuriyama",           // 矢祭山
  "Higashidate",             // 東館
  "Minami-Ishii",            // 南石井
  "Iwaki-Ishii",             // 磐城石井
  "Iwaki-Hanawa",            // 磐城塙
  "Chikatsu",                // 近津
  "Nakatoyo",                // 中豊
  "Iwaki-Tanakura",          // 磐城棚倉
  "Iwaki-Asakawa",           // 磐城浅川
  "Satoshiroishi",           // 里白石
  "Iwaki-Ishikawa",          // 磐城石川
  "Nogisawa",                // 野木沢
  "Kawabeoki",               // 川辺沖
  "Izumigo",                 // 泉郷
  "Kawahigashi",             // 川東
  "Oshioe",                  // 小塩江
  "Yatakawa",                // 谷田川
  "Iwaki-Moriyama",          // 磐城守山
  "Asaka-Nagamori"           // 安積永盛
];

console.log('修复后站数:', line.stations.length);
console.log('修复后站表:', line.stations.join(', '));

// 保存
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('水郡線站表修复完成！');
