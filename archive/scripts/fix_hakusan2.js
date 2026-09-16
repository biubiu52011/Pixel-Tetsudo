// 修复越后线transferStations里的错误换乘信息
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const echigo = data.lines['Echigo'];
if (echigo && echigo.transferStations) {
  // 删除错误的 Hakusan → Mita 换乘
  echigo.transferStations = echigo.transferStations.filter(function(ts) {
    if (ts.station === 'Hakusan' && ts.lineId === 'Mita') {
      console.log('删除错误换乘：', ts);
      return false;
    }
    return true;
  });
  console.log('越后线transferStations已更新：', echigo.transferStations);
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('railway_data.json 已更新');
