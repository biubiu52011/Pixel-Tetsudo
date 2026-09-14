// 修复Yamato站ID冲突
// 问题：神奈川的大和站（小田急+相铁）和茨城的大和站（水户线）用了同一个ID "Yamato"
// 解决：水户线的大和站改名为 "Yamato-Mito"

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 1. 水户线站表：Yamato → Yamato-Mito
const mito = data.lines['Mito'];
if (mito) {
  const idx = mito.stations.indexOf('Yamato');
  if (idx >= 0) {
    mito.stations[idx] = 'Yamato-Mito';
    console.log('水户线站表：Yamato → Yamato-Mito (位置', idx, ')');
  }
}

// 2. stationLines：Yamato 的 Mito 改成 Yamato-Mito
if (data.stationLines && data.stationLines['Yamato']) {
  console.log('修复前 stationLines[Yamato]:', data.stationLines['Yamato']);
  data.stationLines['Yamato'] = data.stationLines['Yamato'].filter(function(lineId) {
    return lineId !== 'Mito';
  });
  console.log('修复后 stationLines[Yamato]:', data.stationLines['Yamato']);
}
if (!data.stationLines['Yamato-Mito']) {
  data.stationLines['Yamato-Mito'] = ['Mito'];
  console.log('新增 stationLines[Yamato-Mito]:', data.stationLines['Yamato-Mito']);
}

// 3. lineStationOrder：水户线的 Yamato → Yamato-Mito
if (data.lineStationOrder && data.lineStationOrder['Mito']) {
  if (data.lineStationOrder['Mito']['Yamato'] !== undefined) {
    data.lineStationOrder['Mito']['Yamato-Mito'] = data.lineStationOrder['Mito']['Yamato'];
    delete data.lineStationOrder['Mito']['Yamato'];
    console.log('lineStationOrder[Mito]：Yamato → Yamato-Mito');
  }
}

// 4. 相铁本线transferStations：删除错误的 Yamato → Mito
const sotetsuMain = data.lines['SotetsuMain'];
if (sotetsuMain && sotetsuMain.transferStations) {
  sotetsuMain.transferStations = sotetsuMain.transferStations.filter(function(ts) {
    if (ts.station === 'Yamato' && ts.lineId === 'Mito') {
      console.log('删除相铁本线错误换乘：', ts);
      return false;
    }
    return true;
  });
}

// 5. 小田急江之岛线transferStations：删除错误的 Yamato → Mito
const odakyuEnoshima = data.lines['OdakyuEnoshima'];
if (odakyuEnoshima && odakyuEnoshima.transferStations) {
  odakyuEnoshima.transferStations = odakyuEnoshima.transferStations.filter(function(ts) {
    if (ts.station === 'Yamato' && ts.lineId === 'Mito') {
      console.log('删除小田急江之岛线错误换乘：', ts);
      return false;
    }
    return true;
  });
}

// 6. 水户线transferStations：Yamato → Yamato-Mito
if (mito && mito.transferStations) {
  mito.transferStations.forEach(function(ts) {
    if (ts.station === 'Yamato') {
      ts.station = 'Yamato-Mito';
      console.log('水户线transferStations：Yamato → Yamato-Mito');
    }
  });
}

// 7. stations坐标表：Yamato 是神奈川的（小田急+相铁），保留
// 新增 Yamato-Mito 坐标（茨城县东茨城郡）
if (!data.stations['Yamato-Mito']) {
  data.stations['Yamato-Mito'] = {
    "lat": 36.28694,
    "lng": 140.23917
  };
  console.log('stations：新增 Yamato-Mito 坐标');
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('railway_data.json 已更新');
