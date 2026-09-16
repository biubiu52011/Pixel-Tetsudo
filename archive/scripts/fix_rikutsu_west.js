// 修正陆羽西线站表
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data', 'core');
const rdata = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'railway_data.json'), 'utf8'));
const i18n = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'station_i18n.json'), 'utf8'));

// 正确站表（新庄→余目，10站）
const correctStations = [
  'Shinjo',          // 新庄
  'Masugata',        // 升形
  'Uzen-Zennami',    // 羽前前波
  'Tsuya',           // 津谷
  'Furuguchi',       // 古口
  'Takaya',          // 高屋
  'Kiyokawa',        // 清川
  'Karigawa',        // 狩川
  'Minamino',        // 南野
  'Amarume'          // 余目
];

// 1. 修正陆羽西线站表
const rikushi = rdata.lines['RikutsuWest'];
console.log('原站表:', rikushi.stations);
rikushi.stations = correctStations;
console.log('新站表:', rikushi.stations);

// 2. 修正 lineStationOrder
if (rdata.lineStationOrder && rdata.lineStationOrder['RikutsuWest']) {
  const newOrder = {};
  correctStations.forEach((s, i) => newOrder[s] = i);
  rdata.lineStationOrder['RikutsuWest'] = newOrder;
  console.log('修正 lineStationOrder');
}

// 3. 添加缺失站实体
const newStations = {
  'Uzen-Zennami': { lat: 38.791944, lng: 140.060278 },
  'Tsuya': { lat: 38.803056, lng: 140.083611 },
  'Minamino': { lat: 38.8575, lng: 139.957778 }
};
for (const [id, coord] of Object.entries(newStations)) {
  if (!rdata.stations[id]) {
    rdata.stations[id] = coord;
    console.log('添加站实体:', id);
  }
}

// 4. 添加缺失站 i18n
const newI18n = {
  'Uzen-Zennami': { ja: '羽前前波', zh: '羽前前波', ko: '우젠젠나미', en: 'Uzen-Zennami' },
  'Tsuya': { ja: '津谷', zh: '津谷', ko: '쓰야', en: 'Tsuya' },
  'Minamino': { ja: '南野', zh: '南野', ko: '미나미노', en: 'Minamino' }
};
for (const [id, names] of Object.entries(newI18n)) {
  if (!i18n[id]) {
    i18n[id] = names;
    console.log('添加 i18n:', id);
  }
}

// 写回文件
fs.writeFileSync(path.join(DATA_DIR, 'railway_data.json'), JSON.stringify(rdata, null, 2), 'utf8');
fs.writeFileSync(path.join(DATA_DIR, 'station_i18n.json'), JSON.stringify(i18n, null, 2), 'utf8');
console.log('\nSaved!');
