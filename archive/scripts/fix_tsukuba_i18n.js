// 补充筑波快线新站ID的i18n翻译
const fs = require('fs');
const path = require('path');

const i18nPath = path.join(__dirname, 'data', 'core', 'station_i18n.json');
const i18n = JSON.parse(fs.readFileSync(i18nPath, 'utf8'));

// 筑波快线新站ID的中文翻译
const tsukubaStations = {
  "Rokucho": "六町",
  "Yashio": "八潮",
  "Minami-Nagareyama": "南流山",
  "Nagareyama-Central-Park": "流山中央公园",
  "Nagareyama-Otakanomori": "流山大鹰之森",
  "Kashiwanoha-Campus": "柏之叶校园",
  "Miraidaira": "未来平",
  "Midorino": "绿野",
  "Bampaku-Kinen-Koen": "万博纪念公园",
  "Kenkyu-Gakuen": "研究学园"
};

let added = 0;
Object.keys(tsukubaStations).forEach(function(stationId) {
  const zhName = tsukubaStations[stationId];
  if (!i18n[stationId]) {
    i18n[stationId] = {
      "ja": zhName,
      "en": stationId.replace(/-/g, ' '),
      "zh": zhName,
      "ko": zhName
    };
    added++;
  } else if (!i18n[stationId].zh) {
    i18n[stationId].zh = zhName;
    added++;
  }
});

console.log('补充了', added, '个筑波快线站点的i18n翻译');

fs.writeFileSync(i18nPath, JSON.stringify(i18n, null, 2), 'utf8');
console.log('station_i18n.json 已更新');
