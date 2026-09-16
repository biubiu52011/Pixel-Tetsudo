// 修复三田线transferStations里残留的越后线换乘

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 三田线：删除错误的 Hakusan → Echigo 换乘
const mita = data.lines['Mita'];
if (mita && mita.transferStations) {
  console.log('修复前 transferStations 数量:', mita.transferStations.length);
  mita.transferStations = mita.transferStations.filter(function(ts) {
    if (ts.station === 'Hakusan' && ts.lineId === 'Echigo') {
      console.log('删除错误换乘：', ts);
      return false;
    }
    return true;
  });
  console.log('修复后 transferStations 数量:', mita.transferStations.length);
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('railway_data.json 已更新');
