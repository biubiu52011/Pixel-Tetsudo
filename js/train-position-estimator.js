/*
 * Pixel Tetsudo - Train Position Estimator
 * 基于时刻表+延误信息推算没有实时位置的线路的列车位置
 *
 * Provider: TrainPositionEstimator
 * Consumer: DataFusion.loadTrainPositions()
 * Input: ODPT TrainTimetable data + delayInfo + line stations + current time
 * Output: estimated positions [{ stationIndex, trainId, delayMin, estimated: true }]
 */
(function() {
  "use strict";

  var ESTIMATOR_VERSION = 6;

  // ========== Train type classification ==========
  // 通用特急关键词——JR-East/東武 等只写 "LimitedExpress"（4.3.484/4.3.485 实测：爱称不出现，具体名规则全部失效）
  var LIMITED_EXPRESS_KEYWORDS = ['LimitedExpress', 'Limited Express', '特急'];

  // 有料特急 operator 白名单——这些 operator 的通用词 LimitedExpress 指「有料特急」（需特急券）
  // 实测（4.3.484/4.3.485）：JR-East（あずさ/かいじ等）・Tobu（スペーシアX/リバティ等）trainType 一律通用词
  // 铁道路知识：Odakyu（ロマンスカー全特急有料）・Seibu（特急=座席指定有料）同义
  // 京急（LimitedExpress/RapidLimitedExpress=快特・特急，普通运费速达）・京成/京王/都営（特急=普通运费）
  // 的 LimitedExpress 不属于有料特急——不在此白名单则通用词不生效（防止误爆）
  var PAID_LIMITED_EXPRESS_OPS = ['JR-East', 'Tobu', 'Odakyu', 'Seibu'];

  // 有料特急爱称名（按 line 归属）——ODPT 中 京成/小田急/西武 在 trainType 写具体爱称
  // （train-icons.js typeMatch 实测命中：Skyliner/SuperHakone/Hakone/HomeWay/MorningWay/Enoshima/BayResort/Ltrain/S-TRAIN）
  // 与 train-icons.js「特急・観光列車」区段保持整合；新增爱称时两侧同步
  var LIMITED_EXPRESS_NAMES = {
    'NaritaAccess': ['Skyliner'],
    'NaritaSkyAccess': ['Skyliner'],
    'Odawara': ['SuperHakone', 'Hakone', 'HomeWay', 'MorningWay'],
    'OdakyuEnoshima': ['Enoshima', 'BayResort', 'HomeWay', 'MorningWay'],
    'Ikebukuro': ['Ltrain', 'S-TRAIN', 'STRAIN'],
    'SeibuChichibu': ['Ltrain'],
    'SeibuShinjuku': ['S-TRAIN', 'STRAIN']
  };

  // 从 trainType URN 提取 operator key："odpt.TrainType:JR-East.LimitedExpress" → "JR-East"；
  // 兼容 "Tobu.LimitedExpress" 省略形式
  function extractOperatorKey(typeStr) {
    try {
      var m = String(typeStr).match(/(?:odpt\.TrainType:)?([^.:]+)\./);
      return m ? m[1] : '';
    } catch(e) { return ''; }
  }
  
  // 直通运行列车类型
  // v3.1: 移除 JR 中央线三个 SpecialRapid（CommuterSpecialRapid/ChuoSpecialRapid/OmeSpecialRapid）——
  // 它们是中央线快速等级（特快），非直通运行（跨图显示由 ODPT 按 railway 分段数据 + 按线匹配实现，与此字段无关）。
  // 保留项均为真实直通/有料列车：TH-LINER（東武晴空塔⇄地下鉄）、TJ-LINER（東上線有料）、
  // S-TRAIN/F-Liner（西武⇄地下鉄⇄東急 直通）、KeioLiner（京王有料）。
  // 车号尾字母 S/K 规则保留：埼京線（S 结尾，川越線直通）・東武直通系车号特征（字段当前无页面消费者，语义清洁不做过度收紧）。
  var THROUGH_TRAIN_TYPES = {
    'TH-LINER': 'Tobu-TokyoMetro through',
    'TJ-LINER': 'Tobu Tojo line reserved',
    'S-TRAIN': 'Seibu-TokyoMetro-Tokyu through',
    'F-Liner': 'Tokyu-TokyoMetro-Seibu through',
    'KeioLiner': 'Keio reserved train'
  };

  // 判断是否为有料特急列车（需特急券）
  // lineId 用于爱称归属限定（同词在不同 line 可能不同义）；operator 语义经 PAID_LIMITED_EXPRESS_OPS 限定
  function isLimitedExpress(trainType, lineId) {
    try {
      if (!trainType) return false;
      var typeStr = typeof trainType === 'object' ? JSON.stringify(trainType) : String(trainType);
      // 1. 爱称白名单（按 line 归属）——京成 Skyliner / 小田急ロマンスカー / 西武 L-train・S-TRAIN
      if (lineId && LIMITED_EXPRESS_NAMES[lineId]) {
        var names = LIMITED_EXPRESS_NAMES[lineId];
        for (var ni = 0; ni < names.length; ni++) {
          if (typeStr.indexOf(names[ni]) >= 0) return true;
        }
      }
      // 2. 通用词——仅限「LimitedExpress=有料特急」的 operator
      //    （京急 LimitedExpress/RapidLimitedExpress=快特・特急、京成/京王/都営 LimitedExpress=特急，均普通运费速达）
      if (PAID_LIMITED_EXPRESS_OPS.indexOf(extractOperatorKey(typeStr)) < 0) return false;
      for (var i = 0; i < LIMITED_EXPRESS_KEYWORDS.length; i++) {
        if (typeStr.indexOf(LIMITED_EXPRESS_KEYWORDS[i]) >= 0) return true;
      }
      return false;
    } catch(e) { return false; }
  }

  // 判断是否为直通运行列车
  function isThroughTrain(trainType, trainNumber) {
    try {
      var typeStr = typeof trainType === 'object' ? JSON.stringify(trainType) : String(trainType);
      // 检查列车类型
      for (var key in THROUGH_TRAIN_TYPES) {
        if (typeStr.indexOf(key) >= 0) return true;
      }
      // 检查列车编号（东武直通列车通常以特定字母结尾）
      if (trainNumber) {
        var numStr = String(trainNumber);
        // 东武晴空塔线直通日比谷线的列车通常以S结尾
        // 东武伊势崎线直通半藏门线的列车通常以K结尾
        if (/[SK]$/.test(numStr)) return true;
      }
      return false;
    } catch(e) { return false; }
  }

  // 获取列车类型分类
  function classifyTrain(trainType, trainNumber, lineId) {
    try {
      var result = {
        isLimitedExpress: isLimitedExpress(trainType, lineId),
        isThroughTrain: isThroughTrain(trainType, trainNumber),
        typeName: ''
      };
      var typeStr = typeof trainType === 'object' ? (trainType['odpt:trainType'] || JSON.stringify(trainType)) : String(trainType);
      // 提取类型名称
      var parts = typeStr.split(':');
      result.typeName = parts.length > 1 ? parts[parts.length - 1] : typeStr;
      return result;
    } catch(e) {
      return { isLimitedExpress: false, isThroughTrain: false, typeName: 'unknown' };
    }
  }

  // ========== Calendar detection ==========
  function getCurrentCalendars() {
    try {
      var now = new Date();
      var day = now.getDay(); // 0=Sunday, 6=Saturday
      // Return array of matching calendar types
      if (day === 6) return ["odpt.Calendar:Saturday", "odpt.Calendar:SaturdayHoliday", "odpt.Calendar:Holiday"];
      if (day === 0) return ["odpt.Calendar:Holiday", "odpt.Calendar:SaturdayHoliday", "odpt.Calendar:Sunday"];
      return ["odpt.Calendar:Weekday"];
    } catch(e) { return ["odpt.Calendar:Weekday"]; }
  }

  // Backward compatibility
  function getCurrentCalendar() {
    var cals = getCurrentCalendars();
    return cals[0];
  }

  // ========== Time parsing ==========
  function parseTimeToMinutes(timeStr) {
    try {
      if (!timeStr) return null;
      var parts = timeStr.split(":");
      if (parts.length < 2) return null;
      var h = parseInt(parts[0], 10);
      var m = parseInt(parts[1], 10);
      // v4: 跨零点时间不再 h-24（24:05→5 会把深夜列车错位到当天凌晨，被误判已到终点/收车丢弃）。
      // 保留原值使 24:xx = 1440+（次日凌晨偏移），与当天 0-1439 时间轴单调连续：
      // 23:50 发车 24:05 到达 → 1445，任何当天时刻（≤1439）都不会越过它
      return h * 60 + m;
    } catch(e) { return null; }
  }

  function getCurrentMinutes() {
    try {
      var now = new Date();
      return now.getHours() * 60 + now.getMinutes();
    } catch(e) { return 0; }
  }

  // ========== Station name extraction ==========
  function extractStationKey(stationUrn) {
    try {
      if (!stationUrn) return "";
      // "odpt.Station:TokyoMetro.Namboku.Ichigaya" -> "Ichigaya"
      var parts = String(stationUrn).split(".");
      return parts[parts.length - 1] || "";
    } catch(e) { return ""; }
  }

  // Normalize station key for matching (remove hyphens, handle common variants)
  function normalizeStationKey(key) {
    try {
      if (!key) return "";
      var k = String(key).toLowerCase();
      // Remove hyphens and spaces
      k = k.replace(/[-_\s]/g, "");
      // Handle common naming variants
      var aliases = {
        "kokusaitenjijo": "tokyoshowacenter",
        "tennozuisle": "tennozuise",
        "shinagawaseaside": "shinagawaseaside",
        "oimachi": "oimachi",
        "tokyoteleport": "tokyoteleport",
        "shinkiba": "shinkiba",
        "shinonome": "shinonome"
      };
      return aliases[k] || k;
    } catch(e) { return String(key || "").toLowerCase().replace(/[-_\s]/g, ""); }
  }

  function extractRailwayKey(railwayUrn) {
    try {
      if (!railwayUrn) return "";
      // "odpt.Railway:TokyoMetro.Namboku" -> "Namboku"
      var parts = String(railwayUrn).split(":");
      if (parts.length < 2) return "";
      var dotParts = parts[1].split(".");
      return dotParts[dotParts.length - 1] || "";
    } catch(e) { return ""; }
  }

  // ========== Delay lookup ==========
  // v4.3.386: compatible with full-record array (worst delay of the operator)
  function getDelayForOperator(operatorId, delayInfo) {
    try {
      if (!delayInfo) return 0;
      var info = delayInfo[operatorId];
      if (!info) return 0;
      if (Array.isArray(info)) {
        var worst = 0;
        for (var i = 0; i < info.length; i++) {
          var rec = info[i] || {};
          var st = String(rec["odpt:trainInformationStatus"] || "").split(".").pop();
          var t = String(rec["odpt:trainInformationText"] || "");
          // v4: ①status URN 解析 bug——原 split(":") 得 "JR-East.Suspension"，永远匹配不上
          //    "Suspension"（延误 status 全靠文本兜底）；改 split(".") 取末段。
          //    ②中断文本按 4.3.425 语义收紧：仅"運転を見合わせ/運転を中止/全線運休"判中断，
          //    "6本の列車を運休"（部分運休）不判全线中断
          if (st === "Suspension" || t.indexOf("全線運休") >= 0 || t.indexOf("運転を見合わせ") >= 0 || t.indexOf("運転を中止") >= 0 || t.toLowerCase().indexOf("suspended") >= 0) return 60;
          // v4: 修正日文拼写（運延→遅延、運れ→遅れ）与延误数字正则（d+→\d+）——
          // 原写法 d 是字面量，"10分遅延" 永远匹配不到，任何延误都回退默认 15 分钟
          if (st === "Delay" || st === "遅延" || t.indexOf("遅延") >= 0 || t.indexOf("遅れ") >= 0 || t.toLowerCase().indexOf("delay") >= 0) {
            var tm = t.match(/(\d+)\s*(分|min)/i);
            worst = Math.max(worst, tm ? (parseInt(tm[1], 10) || 15) : 15);
          }
        }
        return worst;
      }
      if (info.status === "normal" || info.status === "no_data") return 0;
      return info.maxDelay || info.delay || 0;
    } catch(e) { return 0; }
  }

  // ========== Extrapolation (v6: 接续推定——数据最远端之后) ==========
  // 用户需求（2026-09-11）：列车到达 ODPT 提供数据的最后站后，推定其接续行驶，不中途消失。
  // 全量核查（41 线 18903 记录）实证：真截断 175 条集中在首都圈大线——
  //   ChuoSobuLocal 76 / ShonanShinjuku 69 / SobuMain 16 / Saikyo 10 / Sotobo 4。
  //   例：中央総武 1012Y（三鷹→西船橋 全程列车）记录只给前 7 站（三鷹→中野），dest=西船橋（站表 29 位），
  //   列车在图内开到中野就消失——用户所见"半路没了"的元凶。
  // 方案（经全量核查修正）：
  //   1. dest 可映射到本线站表且 dest 索引 > 记录末站索引 → 外推到 dest（列车真实终点）
  //   2. dest 跨线/缺失 → 不接续（列车在本线旅程 = 记录覆盖段，到段末出图/收车是正确行为）
  //      注：跨线不外推——上越線 高崎→渋川 后列车拐入吾妻線（dest=長野原草津口），
  //      外推到上越線末站長岡 会把列车放上它根本没走的区间（假位置）。
  // 算法：已知段平均速度 v=(末站时刻−首站时刻)/(末站索引−首站索引) 分钟/站索引差
  //       （按站索引差天然兼容跳站列车），后续站时刻 = 末站时刻 + v×(目标索引−末站索引)。
  //       终点站 depTime=null（到站即收车，不"通过"）；中间外推站 depTime=arrTime（不停车通过）。
  // 完整数据（dest 索引 <= 末站索引）→ 不外推，零影响。
  function buildExtrapolation(tt, tto, stationIndexMap) {
    try {
      var destStations = tt['odpt:destinationStation'];
      var destUrn = (destStations && destStations.length > 0) ? String(destStations[0]) : '';
      if (!destUrn) return null;
      var dKey = extractStationKey(destUrn);
      var targetIdx = stationIndexMap[normalizeStationKey(dKey)];
      if (targetIdx === undefined) targetIdx = stationIndexMap[dKey];
      if (targetIdx === undefined || targetIdx < 0) return null; // dest 跨线/不可映射 → 不接续

      // 已知段首末可映射站（索引 + 时刻）
      var firstIdx = -1, lastIdx = -1, firstTime = null, lastTime = null;
      for (var i = 0; i < tto.length; i++) {
        var stop = tto[i] || {};
        var key = extractStationKey(stop['odpt:departureStation'] || stop['odpt:arrivalStation']);
        var idx = stationIndexMap[normalizeStationKey(key)];
        if (idx === undefined) idx = stationIndexMap[key];
        if (idx === undefined || idx < 0) continue;
        var arr = parseTimeToMinutes(stop['odpt:arrivalTime']);
        var dep = parseTimeToMinutes(stop['odpt:departureTime']);
        var tm = (arr !== null && arr !== undefined) ? arr : dep;
        if (firstIdx < 0) { firstIdx = idx; firstTime = tm; }
        lastIdx = idx;
        if (tm !== null && tm !== undefined) lastTime = tm;
      }
      if (firstIdx < 0 || lastIdx <= firstIdx || lastTime === null || firstTime === null) return null;
      if (targetIdx <= lastIdx) return null; // 数据已覆盖到 dest → 不外推（完整/区间车）

      var v = (lastTime - firstTime) / (lastIdx - firstIdx);
      if (!(v > 0)) return null; // 速度异常（0/负）不外推

      var stops = [];
      for (var idx2 = lastIdx + 1; idx2 <= targetIdx; idx2++) {
        var time = Math.round(lastTime + v * (idx2 - lastIdx));
        stops.push({ _index: idx2, arrTime: time, depTime: (idx2 < targetIdx) ? time : null });
      }
      return { stops: stops, lastIdx: lastIdx, targetIdx: targetIdx };
    } catch(e) { return null; }
  }

  // ========== Core estimation ==========
  /**
   * Estimate train positions for a single line based on timetable + delay
   * @param {string} lineId - Line ID (e.g. "Namboku")
   * @param {object} line - Line object with stations array
   * @param {Array} timetableData - Array of TrainTimetable objects for this line's operator
   * @param {object} delayInfo - Delay info keyed by operator
   * @param {string} operatorId - Normalized operator ID
   * @returns {Array} Estimated positions [{ stationIndex, trainId, delayMin, estimated: true }]
   */
  function estimateLinePositions(lineId, line, timetableData, delayInfo, operatorId) {
    try {
      if (!line || !line.stations || !Array.isArray(line.stations) || line.stations.length === 0) return [];
      if (!timetableData || !Array.isArray(timetableData) || timetableData.length === 0) return [];

      var currentCalendars = getCurrentCalendars();
      var currentMin = getCurrentMinutes();
      var delayMin = getDelayForOperator(operatorId, delayInfo);
      // v5: 延误方向修正——列车实际到站 = 时刻表时刻 + 延误，故「当前时刻 − 延误」才等于
      // 列车在时刻表上的等效位置：now >= T + delay ⟺ now − delay >= T。
      // 原实现 currentMin + delayMin 把列车当「提前」delay 分钟——A 10:24 / B 10:36、
      // 当前 10:40、延误 27 分时列车实际 10:51 才到 A，原逻辑却推定它已过 B（方向完全相反）。
      var adjustedCurrentMin = currentMin - delayMin;

      // Build station index map for this line (using normalized keys)
      var stationIndexMap = {};
      for (var i = 0; i < line.stations.length; i++) {
        var normKey = normalizeStationKey(line.stations[i]);
        stationIndexMap[normKey] = i;
        // Also store original key for fallback
        stationIndexMap[line.stations[i]] = i;
      }

      var positions = [];
      var processedTrainIds = {};

      for (var t = 0; t < timetableData.length; t++) {
        var tt = timetableData[t];
        if (!tt) continue;

        // Filter by calendar (match any of current calendar types)
        var calendar = tt["odpt:calendar"];
        if (calendar && currentCalendars.indexOf(calendar) < 0) continue;

        // Filter by railway (if lineId matches)
        var railway = tt["odpt:railway"];
        var railwayKey = extractRailwayKey(railway);
        if (railwayKey && railwayKey !== lineId) {
          // v4.3.437: 反查 LINE_RAILWAY_CODE——ODPT Kawagoe（川越-高麗川間）数据对应
          // 项目 KawagoeWest 线、SaikyoKawagoe 数据对应 Saikyo/Kawagoe 线（大宮〜川越段）
          var _kwMatch = false;
          var _rwc = window.ODPTClient && window.ODPTClient.LINE_RAILWAY_CODE;
          if (_rwc) {
            Object.keys(_rwc).forEach(function(k) {
              if (_rwc[k] === railwayKey && k === lineId) _kwMatch = true;
            });
          }
          if (!_kwMatch) continue;
        }

        var trainNumber = tt["odpt:trainNumber"] || tt["odpt:train"] || ("est_" + t);
        if (processedTrainIds[trainNumber]) continue; // Avoid duplicates

        var tto = tt["odpt:trainTimetableObject"];
        if (!tto || !Array.isArray(tto) || tto.length === 0) continue;

        // v6: 接续推定——数据最远端之后。dest 在本线站表内且更远 → 外推补充站序列；
        // 否则（跨线/缺失/数据完整）fullStops === tto，零影响。
        var ext = buildExtrapolation(tt, tto, stationIndexMap);
        var fullStops = ext ? tto.concat(ext.stops) : tto;
        var extrapolated = false;

        // Find current station based on time
        var currentStationIndex = -1;
        var foundInService = false;

        for (var s = 0; s < fullStops.length; s++) {
          var stop = fullStops[s];
          if (!stop) continue;

          var depTime, arrTime, idx;
          if (stop._index !== undefined) {
            // 外推虚拟站（已带站表索引与推定时刻）
            idx = stop._index;
            arrTime = stop.arrTime;
            depTime = stop.depTime;
          } else {
            depTime = parseTimeToMinutes(stop["odpt:departureTime"]);
            arrTime = parseTimeToMinutes(stop["odpt:arrivalTime"]);
            var stationKey = extractStationKey(stop["odpt:departureStation"] || stop["odpt:arrivalStation"]);
            var normStationKey = normalizeStationKey(stationKey);
            idx = stationIndexMap[normStationKey];
            if (idx === undefined) idx = stationIndexMap[stationKey]; // fallback to original key
          }

          if (idx === undefined || idx < 0) continue;

          // v4: 站内停车判定拆分——到达（arrival）与发车（departure）分开判定：
          // 停车期间（arrTime <= now < depTime）列车就在本站，不应回退显示在上一站。
          // 显式 !== null（0 = 00:00 是合法时间，原 depTime || arrTime 把 0 当 falsy 误判）
          var effectiveArrival = (arrTime !== null && arrTime !== undefined) ? arrTime : depTime;
          var effectiveDeparture = (depTime !== null && depTime !== undefined) ? depTime : arrTime;
          if (effectiveArrival !== null && adjustedCurrentMin >= effectiveArrival) {
            currentStationIndex = idx;
            foundInService = true;
            if (ext && idx > ext.lastIdx) extrapolated = true;
          }
          // 尚未发车（停车中或未到达）即停——列车不会越过本站
          if (effectiveDeparture !== null && adjustedCurrentMin < effectiveDeparture) {
            break;
          }
        }

        // Only include trains that are currently in service (have departed at least one station)
        if (foundInService && currentStationIndex >= 0) {
          // Check if train has already terminated (current time past last station arrival)
          // v6: 收车判定基于外推后的末站——真截断列车走完全程后才收车
          var lastStop = fullStops[fullStops.length - 1];
          var lastArrTime = (lastStop._index !== undefined) ? lastStop.arrTime : parseTimeToMinutes(lastStop["odpt:arrivalTime"] || lastStop["odpt:departureTime"]);
          if (lastArrTime !== null && adjustedCurrentMin > lastArrTime + 5) continue; // 5 min grace

          processedTrainIds[trainNumber] = true;
          var trainClassification = classifyTrain(tt['odpt:trainType'], trainNumber, lineId);
          // 提取方向字段
          var railDirection = tt['odpt:railDirection'] || '';
          var directionName = '';
          if (railDirection) {
            var dirParts = String(railDirection).split(':');
            directionName = dirParts.length > 1 ? dirParts[dirParts.length - 1] : String(railDirection);
          }
          // v4.3.454: 终点站提取（odpt:destinationStation）——供详情图列车标签显示终点/方向
          var destStations = tt['odpt:destinationStation'] || [];
          var destinationStation = destStations.length > 0 ? String(destStations[0]).split(".").pop() : "";
          // v5: 车型判断（数据层）——TrainIcons.getTrainClass 复用渲染层同一套选择逻辑，
          // 输入与渲染 trainUid 同构（lineId_trainNumber_stationIndex），车号规则解析一致
          var trainClass = '';
          try {
            if (window.TrainIcons && typeof window.TrainIcons.getTrainClass === "function") {
              trainClass = window.TrainIcons.getTrainClass(
                lineId, line.operator,
                lineId + '_' + trainNumber + '_' + currentStationIndex,
                currentStationIndex, tt['odpt:trainType']
              );
            }
          } catch(e) {}
          positions.push({
            stationIndex: currentStationIndex,
            trainId: lineId + '_' + trainNumber,
            delayMin: delayMin,
            estimated: true,
            extrapolated: extrapolated, // v6: 位置位于外推段（数据最远端之后）
            trainType: tt['odpt:trainType'] || '',
            typeName: trainClassification.typeName,
            isLimitedExpress: trainClassification.isLimitedExpress,
            isThroughTrain: trainClassification.isThroughTrain,
            railDirection: directionName,
            destinationStation: destinationStation,
            trainClass: trainClass
          });
        }
      }

      return positions;
    } catch(e) {
      console.debug("[PositionEstimator] estimateLinePositions error for", lineId, ":", e.message);
      return [];
    }
  }

  /**
   * Estimate positions for all lines that don't have realtime data
   * @param {object} allLines - All line objects keyed by lineId
   * @param {object} odptTrains - Raw ODPT train/timetable data keyed by operator
   * @param {object} delayInfo - Delay info keyed by operator
   * @param {object} existingPositions - Already-known realtime positions keyed by lineId
   * @returns {object} Estimated positions keyed by lineId
   */
  function estimateAllPositions(allLines, odptTrains, delayInfo, existingPositions) {
    try {
      var estimated = {};
      var lineIds = Object.keys(allLines || {});

      // v4: 预索引——按 (operator, railway) 分组时刻表。原实现每条 line 全量扫描 operator
      // 全部时刻表（JR-East 19625 条 × 85 线 ≈ 167 万次迭代/刷新），预索引后每条 line
      // 只处理本线子集（平均 ~230 条），约 85 倍加速
      var timetableIndex = {}; // op -> { railwayKey: [tt...] }
      Object.keys(odptTrains || {}).forEach(function(op) {
        var data = odptTrains[op];
        if (!Array.isArray(data) || data.length === 0) return;
        var first = data[0];
        if (!(first && first["odpt:trainTimetableObject"])) return;
        var idx = {};
        for (var ti = 0; ti < data.length; ti++) {
          var _tt = data[ti];
          if (!_tt) continue;
          var rk = extractRailwayKey(_tt["odpt:railway"]) || "_";
          (idx[rk] = idx[rk] || []).push(_tt);
        }
        timetableIndex[op] = idx;
      });

      if (Object.keys(timetableIndex).length === 0) return estimated;

      // Process each line
      for (var i = 0; i < lineIds.length; i++) {
        var lineId = lineIds[i];
        var line = allLines[lineId];

        // Skip lines that already have realtime positions
        if (existingPositions && existingPositions[lineId] && existingPositions[lineId].length > 0) continue;
        if (!line || !line.operator) continue;

        // Normalize operator ID
        var opId = line.operator;
        if (window.TransitConstants && typeof window.TransitConstants.normalizeOp === "function") {
          opId = window.TransitConstants.normalizeOp(opId);
        }

        // Find timetable data for this operator（v4: 按 railway 子集，非全量）
        var rIdx = timetableIndex[opId];
        if (!rIdx) continue;

        // v4: 聚合本线子集——直接同名（railwayKey===lineId）+ LINE_RAILWAY_CODE 反查
        // （ODPT Kawagoe=川越〜高麗川 对应项目 KawagoeWest、SaikyoKawagoe 对应 Saikyo/Kawagoe）
        var lineTimetable = [];
        var wantKeys = {};
        if (rIdx[lineId]) wantKeys[lineId] = true;
        var _rwc2 = window.ODPTClient && window.ODPTClient.LINE_RAILWAY_CODE;
        if (_rwc2 && _rwc2[lineId] && rIdx[_rwc2[lineId]]) wantKeys[_rwc2[lineId]] = true;
        Object.keys(wantKeys).forEach(function(rk) {
          lineTimetable = lineTimetable.concat(rIdx[rk]);
        });
        if (lineTimetable.length === 0) continue;

        var positions = estimateLinePositions(lineId, line, lineTimetable, delayInfo, opId);
        if (positions.length > 0) {
          estimated[lineId] = positions;
        }
      }

      return estimated;
    } catch(e) {
      console.debug("[PositionEstimator] estimateAllPositions error:", e.message);
      return {};
    }
  }

  // ========== Public API ==========
  window.TrainPositionEstimator = {
    version: ESTIMATOR_VERSION,
    estimateLinePositions: estimateLinePositions,
    estimateAllPositions: estimateAllPositions,
    getCurrentCalendar: getCurrentCalendar,
    getCurrentCalendars: getCurrentCalendars,
    getCurrentMinutes: getCurrentMinutes,
    normalizeStationKey: normalizeStationKey,
    isLimitedExpress: isLimitedExpress
  };

  console.log("[PositionEstimator] v" + ESTIMATOR_VERSION + " initialized");
})();
