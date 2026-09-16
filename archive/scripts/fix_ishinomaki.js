// 修正石卷线：添加石卷站
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data', 'core');
const rdata = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'railway_data.json'), 'utf8'));
const i18n = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'station_i18n.json'), 'utf8'));

// 正确站表（小牛田→女川，14站）
const correctStations = [
  'Kogota',           // 小牛田
  'Kami-Wakuya',      // 上涌谷
  'Wakuya',           // 涌谷
  'Maeyachi',         // 前谷地
  'Kakeyama',         // 佳景山
  'Kanomata',         // 鹿又
  'Sobanokami',       // 曾波神
  'Ishinomaki',       // 石卷（缺失的站）
  'Rikuzen-Inai',     // 陆前稻井
  'Watanoha',         // 渡波
  'Mangoku-Ura',      // 万石浦
  'Sawada',           // 泽田
  'Urashuku',         // 浦宿
  'Onagawa'           // 女川
];

// 1. 修正石卷线站表
const ish = rdata.lines['Ishinomaki'];
console.log('原站表:', ish.stations);
ish.stations = correctStations;
console.log('新站表:', ish.stations);

// 2. 修正 lineStationOrder
if (rdata.lineStationOrder && rdata.lineStationOrder['Ishinomaki']) {
  const newOrder = {};
  correctStations.forEach((s, i) => newOrder[s] = i);
  rdata.lineStationOrder['Ishinomaki'] = newOrder;
  console.log('修正 lineStationOrder');
}

// 3. 确认 Ishinomaki 站实体存在
if (!rdata.stations['Ishinomaki']) {
  rdata.stations['Ishinomaki'] = { lat: 38.43518056, lng: 141.30374722 };
  console.log('添加 Ishinomaki 站实体');
}

// 写回文件
fs.writeFileSync(path.join(DATA_DIR, 'railway_data.json'), JSON.stringify(rdata, null, 2), 'utf8');
console.log('\nSaved!');
