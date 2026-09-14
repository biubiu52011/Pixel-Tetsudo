// 修正男鹿线第一个站 ID：Oibune → Oiwake
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data', 'core');
const rdata = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'railway_data.json'), 'utf8'));
const i18n = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'station_i18n.json'), 'utf8'));

// 1. 修正男鹿线站表
const oga = rdata.lines['Oga'];
console.log('原站表第一个:', oga.stations[0]);
oga.stations[0] = 'Oiwake';
console.log('新站表第一个:', oga.stations[0]);

// 2. 修正 lineStationOrder
if (rdata.lineStationOrder && rdata.lineStationOrder['Oga']) {
  delete rdata.lineStationOrder['Oga']['Oibune'];
  rdata.lineStationOrder['Oga']['Oiwake'] = 0;
  console.log('修正 lineStationOrder');
}

// 3. 添加 Oiwake 站实体（如果不存在）
if (!rdata.stations['Oiwake']) {
  rdata.stations['Oiwake'] = { lat: 39.848889, lng: 140.050278 };
  console.log('添加 Oiwake 站实体');
}

// 4. 添加 Oiwake i18n（如果不存在）
if (!i18n['Oiwake']) {
  i18n['Oiwake'] = { ja: '追分', zh: '追分', ko: '오이와케', en: 'Oiwake' };
  console.log('添加 Oiwake i18n');
}

// 写回文件
fs.writeFileSync(path.join(DATA_DIR, 'railway_data.json'), JSON.stringify(rdata, null, 2), 'utf8');
fs.writeFileSync(path.join(DATA_DIR, 'station_i18n.json'), JSON.stringify(i18n, null, 2), 'utf8');
console.log('\nSaved!');
