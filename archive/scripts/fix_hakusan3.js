// 修复stationLines里Hakusan的Echigo残留
// stationLines格式是简单的字符串数组，不是对象数组

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 1. stationLines[Hakusan]：删除Echigo
if (data.stationLines && data.stationLines['Hakusan']) {
  console.log('修复前 stationLines[Hakusan]:', data.stationLines['Hakusan']);
  data.stationLines['Hakusan'] = data.stationLines['Hakusan'].filter(function(lineId) {
    return lineId !== 'Echigo';
  });
  console.log('修复后 stationLines[Hakusan]:', data.stationLines['Hakusan']);
}

// 2. stationLines[Hakusan-Niigata]：确保只有Echigo
if (!data.stationLines['Hakusan-Niigata']) {
  data.stationLines['Hakusan-Niigata'] = ['Echigo'];
  console.log('新增 stationLines[Hakusan-Niigata]:', data.stationLines['Hakusan-Niigata']);
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('railway_data.json 已更新');
