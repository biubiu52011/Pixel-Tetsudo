// 修复Shizu站ID冲突
// 问题：京成志津站（千叶）和水郡线静站（茨城）用了同一个ID "Shizu"
// 解决：水郡线的静站改名为 "Shizu-Suigun"

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 1. 水郡线站表：Shizu → Shizu-Suigun
const suigun = data.lines['Suigun'];
if (suigun) {
  const idx = suigun.stations.indexOf('Shizu');
  if (idx >= 0) {
    suigun.stations[idx] = 'Shizu-Suigun';
    console.log('水郡线站表：Shizu → Shizu-Suigun (位置', idx, ')');
  }
}

// 2. stationLines：Shizu 的 Suigun 改成 Shizu-Suigun
if (data.stationLines && data.stationLines['Shizu']) {
  console.log('修复前 stationLines[Shizu]:', data.stationLines['Shizu']);
  data.stationLines['Shizu'] = data.stationLines['Shizu'].filter(function(lineId) {
    return lineId !== 'Suigun';
  });
  console.log('修复后 stationLines[Shizu]:', data.stationLines['Shizu']);
}
if (!data.stationLines['Shizu-Suigun']) {
  data.stationLines['Shizu-Suigun'] = ['Suigun'];
  console.log('新增 stationLines[Shizu-Suigun]:', data.stationLines['Shizu-Suigun']);
}

// 3. lineStationOrder：水郡线的 Shizu → Shizu-Suigun
if (data.lineStationOrder && data.lineStationOrder['Suigun']) {
  if (data.lineStationOrder['Suigun']['Shizu'] !== undefined) {
    data.lineStationOrder['Suigun']['Shizu-Suigun'] = data.lineStationOrder['Suigun']['Shizu'];
    delete data.lineStationOrder['Suigun']['Shizu'];
    console.log('lineStationOrder[Suigun]：Shizu → Shizu-Suigun');
  }
}

// 4. 京成本线transferStations：删除错误的 Shizu → Suigun
const keisei = data.lines['Keisei'];
if (keisei && keisei.transferStations) {
  keisei.transferStations = keisei.transferStations.filter(function(ts) {
    if (ts.station === 'Shizu' && ts.lineId === 'Suigun') {
      console.log('删除京成本线错误换乘：', ts);
      return false;
    }
    return true;
  });
}

// 5. 水郡线transferStations：Shizu → Shizu-Suigun（如果有的话）
if (suigun && suigun.transferStations) {
  suigun.transferStations.forEach(function(ts) {
    if (ts.station === 'Shizu') {
      ts.station = 'Shizu-Suigun';
      console.log('水郡线transferStations：Shizu → Shizu-Suigun');
    }
  });
}

// 6. stations坐标表：Shizu 是京成的（千叶），保留
// 新增 Shizu-Suigun 坐标（茨城县常陆大宫市）
if (!data.stations['Shizu-Suigun']) {
  data.stations['Shizu-Suigun'] = {
    "lat": 36.61694,
    "lng": 140.38611
  };
  console.log('stations：新增 Shizu-Suigun 坐标');
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('railway_data.json 已更新');
