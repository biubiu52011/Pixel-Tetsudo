// 修复五能線站表
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 找到五能線
const line = Object.values(data.lines).find(l => l.nameJa === '五能線');
if (!line) {
  console.error('未找到五能線');
  process.exit(1);
}

console.log('修复前站数:', line.stations.length);
console.log('修复前站表:', line.stations.join(', '));

// 官方站表（東能代～川部，43站）
line.stations = [
  "Higashi-Noshiro",           // 東能代
  "Noshiro",                    // 能代
  "Mukai-Noshiro",              // 向能代
  "Kita-Noshiro",               // 北能代
  "Torigata",                   // 鳥形
  "Sawame",                     // 沢目
  "Higashi-Hachimori",          // 東八森
  "Hachimori",                  // 八森
  "Takinoma",                   // 滝ノ間
  "Akita-Shirakami",            // あきた白神
  "Iwadate",                    // 岩館
  "Omaigoshi",                  // 大間越
  "Shirakamidake-Tozanguchi",   // 白神岳登山口
  "Matsukami",                  // 松神
  "Juniko",                     // 十二湖
  "Mutsu-Iwasaki",              // 陸奥岩崎
  "Mutsu-Sawabe",               // 陸奥沢辺
  "WeSPa-Tsubakiyama",          // ウェスパ椿山
  "Henashi",                    // 艫作
  "Yokoiso",                    // 横磯
  "Fukaura",                    // 深浦
  "Hiroto",                     // 広戸
  "Oirase",                     // 追良瀬
  "Todorogi",                   // 驫木
  "Kasose",                     // 風合瀬
  "Odo",                        // 大戸瀬
  "Senjojiki",                  // 千畳敷
  "Kita-Kanegasawa",            // 北金ケ沢
  "Mutsu-Yanagita",             // 陸奥柳田
  "Mutsu-Akaishi",              // 陸奥赤石
  "Ajigasawa",                  // 鰺ケ沢
  "Narusawa",                   // 鳴沢
  "Koshimizu",                  // 越水
  "Mutsu-Morita",               // 陸奥森田
  "Nakata",                     // 中田
  "Kizukuri",                   // 木造
  "Goshogawara",                // 五所川原
  "Mutsu-Tsuruda",              // 陸奥鶴田
  "Tsurudomari",                // 鶴泊
  "Itayanagi",                  // 板柳
  "Hayashizaki",                // 林崎
  "Fujisaki",                   // 藤崎
  "Kawabe"                      // 川部
];

console.log('修复后站数:', line.stations.length);
console.log('修复后站表:', line.stations.join(', '));

// 保存
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('五能線站表修复完成！');
