// 修复越后线白山站ID冲突
// 问题：三田线白山站（东京）和越后线白山站（新潟）用了同一个ID "Hakusan"
// 解决：越后线的白山站改名为 "Hakusan-Niigata"

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'core', 'railway_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 1. 越后线站表：Hakusan → Hakusan-Niigata
const echigo = data.lines['Echigo'];
if (echigo) {
  const idx = echigo.stations.indexOf('Hakusan');
  if (idx >= 0) {
    echigo.stations[idx] = 'Hakusan-Niigata';
    console.log('越后线站表：Hakusan → Hakusan-Niigata (位置', idx, ')');
  }
}

// 2. stationLines：Hakusan 的 Echigo 改成 Hakusan-Niigata
if (data.stationLines && data.stationLines['Hakusan']) {
  data.stationLines['Hakusan'] = data.stationLines['Hakusan'].filter(function(sl) {
    return sl.line_id !== 'Echigo';
  });
  console.log('stationLines[Hakusan]：删除 Echigo');
}
if (!data.stationLines['Hakusan-Niigata']) {
  data.stationLines['Hakusan-Niigata'] = [];
}
data.stationLines['Hakusan-Niigata'].push({ line_id: 'Echigo', station_order: 30 });
console.log('stationLines[Hakusan-Niigata]：添加 Echigo');

// 3. lineStationOrder：越后线的 Hakusan → Hakusan-Niigata
if (data.lineStationOrder && data.lineStationOrder['Echigo']) {
  if (data.lineStationOrder['Echigo']['Hakusan'] !== undefined) {
    data.lineStationOrder['Echigo']['Hakusan-Niigata'] = data.lineStationOrder['Echigo']['Hakusan'];
    delete data.lineStationOrder['Echigo']['Hakusan'];
    console.log('lineStationOrder[Echigo]：Hakusan → Hakusan-Niigata');
  }
}

// 4. transferStations：越后线的 Hakusan → Hakusan-Niigata
// 检查越后线的 transferStations
if (echigo && echigo.transferStations) {
  console.log('越后线transferStations：', echigo.transferStations);
}

// 5. stations坐标表：Hakusan 是三田线的（东京），保留
// 新增 Hakusan-Niigata 坐标（新潟市）
if (!data.stations['Hakusan-Niigata']) {
  data.stations['Hakusan-Niigata'] = {
    "lat": 37.90583,
    "lng": 139.0325
  };
  console.log('stations：新增 Hakusan-Niigata 坐标');
}

// 6. name_map：新增 白山 → Hakusan-Niigata 的映射？不，白山还是对应东京的
// 新增新潟白山的日文名映射？
// 白山（新潟）的日文也是「白山」，所以 name_map 里「白山」已经对应 Hakusan 了
// 我们需要在 i18n 里加 Hakusan-Niigata 的条目

// 保存
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('railway_data.json 已更新');
