// 修正烏山線站表
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data', 'core');
const rdata = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'railway_data.json'), 'utf8'));
const i18n = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'station_i18n.json'), 'utf8'));

// 官方正确站表（宝积寺→乌山方向）
const correctStations = [
  'Hoshakuji',           // 宝积寺
  'Shimotsuke-Hanaoka',  // 下野花冈
  'Niita',               // 仁井田
  'Konoyama',            // 鸿野山
  'Ogane',               // 大金
  'Kobana',              // 小塙
  'Taki',                // 泷
  'Karasuyama'           // 乌山
];

// 1. 修正烏山線站表
const karasuyama = rdata.lines['Karasuyama'];
console.log('原站表:', karasuyama.stations);
karasuyama.stations = correctStations;
console.log('新站表:', karasuyama.stations);

// 2. 添加缺失站到 stations 实体
const newStations = {
  'Shimotsuke-Hanaoka': { lat: 36.689722, lng: 139.969167 },
  'Niita': { lat: 36.683611, lng: 139.990278 },
  'Kobana': { lat: 36.625833, lng: 140.065278 }
};
for (const [id, coord] of Object.entries(newStations)) {
  if (!rdata.stations[id]) {
    rdata.stations[id] = coord;
    console.log('添加站实体:', id);
  }
}

// 3. 修正 lineStationOrder
if (rdata.lineStationOrder && rdata.lineStationOrder['Karasuyama']) {
  const newOrder = {};
  correctStations.forEach((s, i) => newOrder[s] = i);
  rdata.lineStationOrder['Karasuyama'] = newOrder;
  console.log('修正 lineStationOrder');
}

// 4. 删除错误站的 stationLines
const wrongStations = ['Nishi-Karasuyama', 'Nekona', 'Nishinasuno'];
for (const s of wrongStations) {
  delete rdata.stationLines[s];
  console.log('删除 stationLines:', s);
}

// 5. 添加新站的 i18n
const newI18n = {
  'Shimotsuke-Hanaoka': { ja: '下野花岡', zh: '下野花冈', ko: '시모츠케하나오카', en: 'Shimotsuke-Hanaoka' },
  'Niita': { ja: '仁井田', zh: '仁井田', ko: '니이타', en: 'Niita' },
  'Kobana': { ja: '小塙', zh: '小塙', ko: '코바나', en: 'Kobana' }
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
