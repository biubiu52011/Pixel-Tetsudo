// 批量修复i18n键名：zh-CN -> zh
const fs = require('fs');
const path = require('path');

const i18nPath = path.join(__dirname, 'data', 'core', 'station_i18n.json');
const i18n = JSON.parse(fs.readFileSync(i18nPath, 'utf8'));

let fixed = 0;
Object.keys(i18n).forEach(function(stationId) {
  const entry = i18n[stationId];
  if (entry['zh-CN'] && !entry['zh']) {
    entry['zh'] = entry['zh-CN'];
    delete entry['zh-CN'];
    fixed++;
  }
});

console.log('修复了', fixed, '个条目的键名 zh-CN -> zh');

fs.writeFileSync(i18nPath, JSON.stringify(i18n, null, 2), 'utf8');
console.log('station_i18n.json 已更新');
