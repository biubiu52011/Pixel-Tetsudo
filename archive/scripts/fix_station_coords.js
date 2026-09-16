// 修复Yamato-Mito坐标和stationLines格式问题

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 1. 修复Yamato-Mito坐标（茨城县东茨城郡，不是神奈川）
if (data.stations['Yamato-Mito']) {
  console.log('修复前 Yamato-Mito坐标:', data.stations['Yamato-Mito']);
  data.stations['Yamato-Mito'] = {
    "lat": 36.28694,
    "lng": 140.23917
  };
  console.log('修复后 Yamato-Mito坐标:', data.stations['Yamato-Mito']);
}

// 2. 修复Hakusan-Niigata的stationLines格式（改成简单字符串数组）
if (data.stationLines['Hakusan-Niigata']) {
  console.log('修复前 stationLines[Hakusan-Niigata]:', data.stationLines['Hakusan-Niigata']);
  data.stationLines['Hakusan-Niigata'] = ['Echigo'];
  console.log('修复后 stationLines[Hakusan-Niigata]:', data.stationLines['Hakusan-Niigata']);
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('railway_data.json 已更新');
