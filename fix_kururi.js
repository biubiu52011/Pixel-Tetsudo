// 修正久留里线第7站 ID：Uma_Kita → Makuta
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data', 'core');
const rdata = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'railway_data.json'), 'utf8'));
const i18n = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'station_i18n.json'), 'utf8'));

// 1. 修正久留里线站表
const kururi = rdata.lines['Kururi'];
console.log('原第7站:', kururi.stations[6]);
kururi.stations[6] = 'Makuta';
console.log('新第7站:', kururi.stations[6]);

// 2. 修正 lineStationOrder
if (rdata.lineStationOrder && rdata.lineStationOrder['Kururi']) {
  delete rdata.lineStationOrder['Kururi']['Uma_Kita'];
  rdata.lineStationOrder['Kururi']['Makuta'] = 6;
  console.log('修正 lineStationOrder');
}

// 3. 添加 Makuta 站实体（如果不存在）
if (!rdata.stations['Makuta']) {
  rdata.stations['Makuta'] = { lat: 35.3575, lng: 139.9986 };
  console.log('添加 Makuta 站实体');
}

// 4. 添加 Makuta i18n（如果不存在）
if (!i18n['Makuta']) {
  i18n['Makuta'] = { ja: '馬来田', zh: '马来田', ko: '마쿠타', en: 'Makuta' };
  console.log('添加 Makuta i18n');
}

// 写回文件
fs.writeFileSync(path.join(DATA_DIR, 'railway_data.json'), JSON.stringify(rdata, null, 2), 'utf8');
fs.writeFileSync(path.join(DATA_DIR, 'station_i18n.json'), JSON.stringify(i18n, null, 2), 'utf8');
console.log('\nSaved!');
