// 修复新宿线和有乐町线之间错误的一之江换乘
// 问题：有乐町线根本没有一之江站，错误地加了换乘条目

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 1. 有乐町线：删除错误的 Ichinoe → Shinjuku 换乘
const yurakucho = data.lines['Yurakucho'];
if (yurakucho && yurakucho.transferStations) {
  yurakucho.transferStations = yurakucho.transferStations.filter(function(ts) {
    if (ts.station === 'Ichinoe' && ts.lineId === 'Shinjuku') {
      console.log('删除有乐町线错误换乘：', ts);
      return false;
    }
    return true;
  });
  console.log('有乐町线transferStations已更新');
}

// 2. 新宿线：删除错误的 Ichinoe → Yurakucho 换乘
const shinjuku = data.lines['Shinjuku'];
if (shinjuku && shinjuku.transferStations) {
  shinjuku.transferStations = shinjuku.transferStations.filter(function(ts) {
    if (ts.station === 'Ichinoe' && ts.lineId === 'Yurakucho') {
      console.log('删除新宿线错误换乘：', ts);
      return false;
    }
    return true;
  });
  console.log('新宿线transferStations已更新');
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('railway_data.json 已更新');
