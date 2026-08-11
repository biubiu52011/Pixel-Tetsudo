/*
 * Pixel Tetsudo - DataFusion v6
 * ?一数据?：静??路数据 + ODPT ??数据 + GTFS Realtime 列?位置
 * 不再依?本地静??刻表文件
 */
(function() {
  'use strict';

  var REFRESH_INTERVAL = 30000;
  var FUSION_VERSION = 6;

  var odptData = {
    trains: {},
    stations: {},
    delayInfo: {},
    realtimePositions: {}
  };

  var subscribers = [];

  function emitUpdate(fusedData) {
    subscribers.forEach(function(cb) {
      try { cb(fusedData); }
      catch(e) { console.warn('[DataFusion] Subscriber error:', e.message); }
    });
    window.DATA_FUSION = fusedData;
  }

  function subscribe(callback) {
    subscribers.push(callback);
    if (window.DATA_FUSION) {
      try { callback(window.DATA_FUSION); }
      catch(e) { console.warn('[DataFusion] Immediate callback error:', e.message); }
    }
    return function unsubscribe() {
      var idx = subscribers.indexOf(callback);
      if (idx >= 0) subscribers.splice(idx, 1);
    };
  }

  // GTFS Feed 到?路 ID 映射
  var GTFS_FEED_TO_LINES = {
    'toei': ['Asakusa', 'Mita', 'Shinjuku', 'Oedo'],
    'twr': ['Rinko'],
    'tokyometro': ['Ginza', 'Marunouchi', 'MarunouchiBranch', 'Hibiya', 'Tozai', 'Chiyoda', 'Yurakucho', 'Hanzomon', 'Namboku'],
    'tamamonorail': ['TamaMonorail'],
    'mir': ['HitachiNakaKaimin'],
    'yokohama': ['Blue', 'Orange'],
    'tobu': ['TobuSkyTree', 'TobuNikko', 'TobuNoda'],
    'keio': ['KeioLine'],
    'jreast': ['Yamanote', 'KeihinTohoku', 'Yokosuka', 'ChuoRapid', 'Saikyo', 'Joban', 'SobuLocal', 'Keiyo', 'Musashino', 'ShonanShinjuku', 'Takasaki', 'Tsurumi', 'Nambu', 'Tokaido', 'JobanLocal']
  };

  function mapGTFSFeedToLines(feedName) {
    return GTFS_FEED_TO_LINES[feedName] || [];
  }

  // Protobuf 解?
  function decodeVarint(bytes, pos) {
    var result = 0, shift = 0;
    while (pos < bytes.length) {
      var b = bytes[pos++];
      result |= (b & 0x7F) << shift;
      shift += 7;
      if ((b & 0x80) === 0) break;
    }
    return { value: result, pos: pos };
  }

  function decodeString(bytes, pos, end) {
    var str = '';
    for (var i = pos; i < end && i < bytes.length; i++) {
      str += String.fromCharCode(bytes[i]);
    }
    return str;
  }

  function decodeDouble(bytes, pos) {
    var arr = new Uint8Array(8);
    for (var i = 0; i < 8 && pos < bytes.length; i++, pos++) arr[i] = bytes[pos];
    return new Float64Array(arr.buffer)[0];
  }

  function parseGTFSRealtime(buffer) {
    if (!buffer) return [];
    var bytes = new Uint8Array(buffer);
    var entities = [];
    var pos = 0;

    while (pos < bytes.length) {
      var tag = decodeVarint(bytes, pos);
      pos = tag.pos;
      var fieldNum = tag.value >> 3;
      var wireType = tag.value & 0x07;

      if (fieldNum === 1 && wireType === 2) {
        var lenResult = decodeVarint(bytes, pos);
        pos = lenResult.pos;
        var entityEnd = pos + lenResult.value;
        var entity = { id: '', vehicle: null };

        while (pos < entityEnd) {
          var eTag = decodeVarint(bytes, pos);
          pos = eTag.pos;
          var eField = eTag.value >> 3;
          var eWire = eTag.value & 0x07;

          if (eField === 1 && eWire === 0) {
            var idResult = decodeVarint(bytes, pos);
            entity.id = idResult.value.toString();
            pos = idResult.pos;
          } else if (eField === 2 && eWire === 2) {
            var vLen = decodeVarint(bytes, pos).value;
            var vEnd = pos + vLen;
            var vehicle = { timestamp: null, position: null, stopId: null };
            var vPos = pos;
            while (vPos < vEnd) {
              var vTag = decodeVarint(bytes, vPos);
              vPos = vTag.pos;
              var vF = vTag.value >> 3;
              var vW = vTag.value & 0x07;
              if (vF === 1 && vW === 0) {
                var ts = decodeVarint(bytes, vPos);
                vehicle.timestamp = ts.value;
                vPos = ts.pos;
              } else if (vF === 2 && vW === 2) {
                var pLen = decodeVarint(bytes, vPos).value;
                var pStart = vPos + 2;
                var lat = decodeDouble(bytes, pStart);
                var lng = decodeDouble(bytes, pStart + 8);
                vehicle.position = { lat: lat, lng: lng };
                vPos = vPos + 2 + pLen;
              } else if (vF === 3 && vW === 2) {
                var sLen = decodeVarint(bytes, vPos).value;
                vehicle.stopId = decodeString(bytes, vPos + 2, vPos + 2 + sLen);
                vPos = vPos + 2 + sLen;
              } else if (vW === 0) {
                var sv = decodeVarint(bytes, vPos);
                vPos = sv.pos;
              } else if (vW === 2) {
                vPos += 2 + decodeVarint(bytes, vPos).value;
              } else if (vW === 1) { vPos += 8; }
              else if (vW === 5) { vPos += 4; }
              else { break; }
            }
            vehicle.timestamp = vehicle.timestamp || Math.floor(Date.now() / 1000);
            entity.vehicle = vehicle;
            pos = vEnd;
          } else if (eWire === 0) {
            var ev = decodeVarint(bytes, pos);
            pos = ev.pos;
          } else if (eWire === 2) {
            pos += 2 + decodeVarint(bytes, pos).value;
          } else if (eWire === 1) { pos += 8; }
          else if (eWire === 5) { pos += 4; }
          else { break; }
        }
        if (entity.id && entity.vehicle) entities.push(entity);
      } else if (wireType === 0) {
        var v = decodeVarint(bytes, pos);
        pos = v.pos;
      } else if (wireType === 2) {
        pos += 2 + decodeVarint(bytes, pos).value;
      } else if (wireType === 1) { pos += 8; }
      else if (wireType === 5) { pos += 4; }
      else { break; }
    }
    return entities;
  }

  // ODPT API 数据拉取
  async function loadChallengeData() {
    if (!window.ODPTClient || !window.ODPTClient.challenge) return;
    var ops = window.ODPTClient.challenge.OPERATORS;
    for (var op in ops) {
      try {
        var r = await Promise.allSettled([
          window.ODPTClient.challenge.getTrains(op),
          window.ODPTClient.challenge.getStations(op)
        ]);
        odptData.trains[op] = r[0].status === 'fulfilled' ? r[0].value : [];
        odptData.stations[op] = r[1].status === 'fulfilled' ? r[1].value : [];
      } catch (e) {
        console.warn('[DataFusion] Failed Challenge', op, e.message);
      }
    }
  }

  async function loadCenterData() {
    if (!window.ODPTClient || !window.ODPTClient.center) return;
    var ops = window.ODPTClient.center.OPERATORS;
    var tP = [], sP = [], dP = [];
    for (var op in ops) {
      tP.push(window.ODPTClient.center.getTrains(op).then(function(d, o) { return {op:o, data:d}; }.bind(null, op)));
      sP.push(window.ODPTClient.center.getStations(op).then(function(d, o) { return {op:o, data:d}; }.bind(null, op)));
      dP.push(window.ODPTClient.center.getTrainInformation(op).then(function(d, o) { return {op:o, data:d}; }.bind(null, op)).catch(function(e, o) { return {op:o, data:null}; }.bind(null, op)));
    }
    var [tR, sR, dR] = await Promise.all([Promise.all(tP), Promise.all(sP), Promise.all(dP)]);
    tR.forEach(function(r) { odptData.trains[r.op] = r.data || []; });
    sR.forEach(function(r) { odptData.stations[r.op] = r.data || []; });
    dR.forEach(function(r) { if (r.data && r.data.length > 0) odptData.delayInfo[r.op] = r.data[0]; });
  }

  async function loadGTFSRealtime() {
    try {
      if (!window.ODPTClient || !window.ODPTClient.gtfsRealtime) return;
      var results = await window.ODPTClient.gtfsRealtime.getAll();
      results.forEach(function(result) {
        if (result.data) {
          var entities = parseGTFSRealtime(result.data);
          if (entities.length > 0) {
            var lineIds = mapGTFSFeedToLines(result.name.split('_')[0]);
            entities.forEach(function(entity) {
              if (entity.vehicle && entity.vehicle.position) {
                lineIds.forEach(function(lineId) {
                  if (!odptData.realtimePositions[lineId]) odptData.realtimePositions[lineId] = [];
                  odptData.realtimePositions[lineId].push({
                    id: entity.id,
                    timestamp: entity.vehicle.timestamp,
                    position: entity.vehicle.position,
                    stopId: entity.vehicle.stopId
                  });
                });
              }
            });
            console.log('[DataFusion] Loaded', entities.length, 'entities from', result.name);
          }
        }
      });
    } catch (e) {
      console.warn('[DataFusion] Failed GTFS realtime:', e.message);
    }
  }

  async function loadAllODPTData() {
    await Promise.allSettled([loadChallengeData(), loadCenterData(), loadGTFSRealtime()]);
    window.ODPT_ALL_DATA = odptData;
    window.ODPT_DELAY_DATA = odptData.delayInfo;
    console.log('[DataFusion] ODPT loaded:', Object.keys(odptData.delayInfo).length, 'operators with delay info');
  }

  // 数据融合
  function parseODPTDelay(info) {
    if (!info) return null;
    var result = { status: 'normal', interval: null, cause: null, maxDelay: 0 };
    var text = (info['odpt:informationTitle'] || '') + ' ' + (info['odpt:informationContent'] || '');
    if (text.indexOf('\u904B\u4F11') >= 0) result.status = 'suspended';
    else if (text.indexOf('\u904B\u5EF6') >= 0) result.status = 'delayed';
    var m = text.match(/(\d+)\s*(\u5206|min)/i);
    if (m) result.maxDelay = parseInt(m[1], 10);
    var im = text.match(/([^\s\-]+)\s*[-\uff5e\u81F3]\s*([^\s\-]+)/);
    if (im) result.interval = im[1] + '\u2192' + im[2];
    if (info['odpt:informationContent']) result.cause = info['odpt:informationContent'];
    return result;
  }

  function getApiDelayInfo(line) {
    if (!odptData.delayInfo) return null;
    var op = (window.ODPT_CONFIG && window.ODPT_CONFIG.lineToOperator)
      ? (window.ODPT_CONFIG.lineToOperator[line.id] || window.ODPT_CONFIG.lineToOperator[line.name])
      : line.operator;
    if (!op || !odptData.delayInfo[op]) return null;
    return parseODPTDelay(odptData.delayInfo[op]);
  }

  function getLineStatus(line, apiInfo) {
    if (apiInfo) return apiInfo.status || 'normal';
    return 'normal';
  }

  function getMaxDelay(line, apiInfo) {
    if (apiInfo && apiInfo.maxDelay > 0) return apiInfo.maxDelay;
    return 0;
  }

  function getDelayInterval(line, apiInfo) {
    if (apiInfo && apiInfo.interval) return apiInfo.interval;
    return null;
  }

  function getDelayCause(line, apiInfo) {
    if (apiInfo && apiInfo.cause) return apiInfo.cause;
    return null;
  }

  function fuseLine(lineId) {
    var line = window.UNIFIED_LINES && window.UNIFIED_LINES[lineId] ? window.UNIFIED_LINES[lineId] : null;
    if (!line) return null;
    var apiInfo = getApiDelayInfo(line);
    var op = window.ODPT_CONFIG && window.ODPT_CONFIG.lineToOperator ? window.ODPT_CONFIG.lineToOperator[lineId] : null;
    return {
      id: lineId,
      name: line.name,
      nameEn: line.nameEn || line.name,
      code: line.code,
      color: line.color,
      operator: line.operator,
      region: line.region,
      type: line.type,
      image: line.image,
      stations: line.stations || [],
      durations: line.durations || [],
      intervalTotal: line.durationTotalMin || 0,
      odptTrains: op && odptData.trains[op] ? odptData.trains[op] : [],
      odptStations: op && odptData.stations[op] ? odptData.stations[op] : [],
      realtimePositions: odptData.realtimePositions[lineId] || [],
      delayInfo: {
        status: getLineStatus(line, apiInfo),
        maxDelay: getMaxDelay(line, apiInfo),
        interval: getDelayInterval(line, apiInfo),
        cause: getDelayCause(line, apiInfo)
      }
    };
  }

  async function fuseAll() {
    var startTime = Date.now();
    if (!window.UNIFIED_LINES || Object.keys(window.UNIFIED_LINES).length === 0) {
      console.warn('[DataFusion] UNIFIED_LINES not available');
      return null;
    }
    await loadAllODPTData();
    var fusedLines = {};
    var lineIds = Object.keys(window.UNIFIED_LINES);
    for (var i = 0; i < lineIds.length; i++) {
      var fused = fuseLine(lineIds[i]);
      if (fused) fusedLines[fused.id] = fused;
    }
    var elapsed = Date.now() - startTime;
    console.log('[DataFusion] Fused', lineIds.length, 'lines in', elapsed, 'ms');
    var fusedData = {
      version: FUSION_VERSION,
      timestamp: new Date().toISOString(),
      lines: fusedLines,
      lineOrder: lineIds,
      odptOperatorsLoaded: Object.keys(odptData.delayInfo).length,
      totalLines: lineIds.length
    };
    emitUpdate(fusedData);
    return fusedData;
  }

  async function refresh() { return await fuseAll(); }

  async function init() {
    console.log('[DataFusion] Initializing v' + FUSION_VERSION + '...');
    await fuseAll();
    setInterval(function() { fuseAll(); }, REFRESH_INTERVAL);
    console.log('[DataFusion] Ready, refreshing every', REFRESH_INTERVAL, 'ms');
  }

  window.DataFusion = {
    init: init,
    fuseAll: fuseAll,
    refresh: refresh,
    subscribe: subscribe,
    getFusedData: function() { return window.DATA_FUSION || null; },
    getLine: function(lineId) {
      var data = window.DATA_FUSION;
      return data && data.lines ? data.lines[lineId] : null;
    },
    getOdptData: function() { return odptData; },
    getOperatorTrains: function(operator) { return odptData.trains[operator] || []; },
    getOperatorStations: function(operator) { return odptData.stations[operator] || []; },
    getRealtimePositions: function(lineId) { return odptData.realtimePositions[lineId] || []; }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
