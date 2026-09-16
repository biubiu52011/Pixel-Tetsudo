// 批量补充站点i18n翻译
const fs = require('fs');
const path = require('path');

const i18nPath = path.join(__dirname, 'data', 'core', 'station_i18n.json');
const i18n = JSON.parse(fs.readFileSync(i18nPath, 'utf8'));

// 水户线16站的中文名称
const mitoStations = {
  "Oyama": "小山",
  "Otabayashi": "小田林",
  "Yuki": "结城",
  "Higashi-Yuki": "东结城",
  "Kawashima": "川岛",
  "Tamado": "玉户",
  "Shimodate": "下馆",
  "Niihari": "新治",
  "Yamato": "大和",
  "Iwase": "岩濑",
  "Haguro": "羽黑",
  "Fukuhara": "福原",
  "Inada": "稻田",
  "Kasama": "笠间",
  "Shishido": "宍户",
  "Tomobe": "友部"
};

// 添加缺失的i18n
let added = 0;
Object.keys(mitoStations).forEach(function(stationId) {
  if (!i18n[stationId]) {
    i18n[stationId] = {
      "ja": mitoStations[stationId],
      "en": stationId.replace(/-/g, ' '),
      "zh-CN": mitoStations[stationId],
      "ko": mitoStations[stationId]
    };
    added++;
  } else if (!i18n[stationId]['zh-CN']) {
    i18n[stationId]['zh-CN'] = mitoStations[stationId];
    added++;
  }
});

console.log('水户线补充了', added, '个i18n条目');

// 保存
fs.writeFileSync(i18nPath, JSON.stringify(i18n, null, 2), 'utf8');
console.log('station_i18n.json 已更新');
