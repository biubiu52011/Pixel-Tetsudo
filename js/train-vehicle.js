/*
 * Pixel Tetsudo - Train Vehicle Resolver（全局车辆判定脚本）
 * v4.3.950
 *
 * 统一入口：window.TrainVehicle
 * 全局生效：数据层（TrainPositionEstimator / DataFusion）与渲染层（TrainsRender）
 *   的车型判定全部收敛到此脚本，单一决策路径，消除散落逻辑与 key 不匹配。
 *
 * 数据源（可信度从高到低，支持交叉验证）：
 *   S0  manual 内嵌 vehicleType —— 时刻表记录直带字段（ODPT 官方/人工核验），最高可信
 *   S1  ODPT 实时 vehicleType —— ODPT Train 响应中的 vehicleType 字段（如可用）
 *   S2  车号→车型候选累积表（TRAIN_NO_VEHICLE）—— 由 S0/S1 按车号跨线累积去重，
 *       同一车号在不同来源出现相同候选 = 交叉验证通过
 *   S3  VehicleTypeMap 静态查表 —— 按「线路 × 種別 × 直通先 operator」的公开资料推定
 *   S4  TrainIcons 图标规则 —— 线路/运营商/车号规则/部署区间推定；S0–S3 无依据时，
 *       图标文件名作为最低可信推定名（source='icons', confidence='low'；排除 E235系山手線
 *       乱入非山手线）。图标本身始终由 S4 兜底。
 *
 * 原则（不猜）：
 *   - 车型名（resolve.name / getName）：S0–S3 实证优先；无实证时仅采用人工核验的图标
 *     推定名（S4），绝不凭空编造；终极兜底 E235系山手線 不会冒充非山手线的车型。
 *   - 图标（resolve.iconPath / getIconPath）：始终有值。
 *
 * 修复（相对 v4.3.940）：
 *   - TRAIN_NO_VEHICLE 查表 key 不匹配：原估计车 trainId="lineId_trainNumber" 查不到
 *     纯车号 key，候选表对估计车失效。本脚本统一按纯车号管理，getCandidates 同时兼容
 *     两种格式兜底，数据层额外输出 trainNumber 字段供渲染层直查。
 */
(function() {
  "use strict";

  var TRAIN_NO_VEHICLE = window.TRAIN_NO_VEHICLE || {};
  window.TRAIN_NO_VEHICLE = TRAIN_NO_VEHICLE; // 兼容旧引用（外部只读）

  // ============================================================
  // 车号 → 车型候选 累积表（key = 纯车号，跨线累积去重）
  // ============================================================
  function registerVehicle(trainNumber, vehicleTypeStr) {
    if (!trainNumber || !vehicleTypeStr) return;
    var exist = TRAIN_NO_VEHICLE[trainNumber] || (TRAIN_NO_VEHICLE[trainNumber] = []);
    String(vehicleTypeStr).split('/').forEach(function(s) {
      var c = s.trim();
      if (c && exist.indexOf(c) < 0) exist.push(c);
    });
  }

  function getCandidates(trainNumber) {
    if (!trainNumber) return [];
    var key = String(trainNumber);
    if (TRAIN_NO_VEHICLE[key]) return TRAIN_NO_VEHICLE[key];
    // 兜底：旧调用可能传 "lineId_trainNumber"（lineId 本身可能含下划线，如 Daishi_Tobu），
    // 从后往前逐段去掉前缀尝试命中纯车号 key。
    if (key.indexOf('_') >= 0) {
      var parts = key.split('_');
      for (var i = parts.length - 1; i >= 1; i--) {
        var cand = parts.slice(i).join('_');
        if (TRAIN_NO_VEHICLE[cand]) return TRAIN_NO_VEHICLE[cand];
      }
    }
    return [];
  }

  // ============================================================
  // 工具
  // ============================================================
  function normOp(op) {
    if (!op) return '';
    if (window.TransitConstants && typeof window.TransitConstants.normalizeOp === 'function') {
      return window.TransitConstants.normalizeOp(op);
    }
    return String(op).replace(/^odpt\.Operator:/, '');
  }

  // "odpt.TrainType:JR-East.Local" → "Local"；"JR-East.Local" → "Local"
  function normTrainType(t) {
    if (!t) return '';
    var s = String(t);
    if (s.indexOf(':') >= 0) s = s.split(':').pop();
    if (s.indexOf('.') >= 0) s = s.split('.').pop();
    return s;
  }

  // destinationStation URN → 直通先 operator 短名
  // "odpt.Station:TokyoMetro.Fukutoshin.Wakoshi" → "TokyoMetro"
  function destOperator(destUrn) {
    if (!destUrn) return '';
    var urn = Array.isArray(destUrn) ? destUrn[0] : destUrn;
    var parts = String(urn).split('.');
    var opPart = parts[1] || '';
    return opPart.split(':')[1] || opPart;
  }

  // 候选串 "A / B / C" → 去重数组 ["A","B","C"]
  function splitCandidates(str) {
    var out = [];
    if (!str) return out;
    String(str).split('/').forEach(function(s) {
      var c = s.trim();
      if (c && out.indexOf(c) < 0) out.push(c);
    });
    return out;
  }

  // 图标库反查（S0–S3 候选 → 图标路径）
  function resolveIconForName(name, lineId) {
    if (!name) return '';
    if (window.TrainIcons && typeof window.TrainIcons.resolveVehicleIcon === 'function') {
      return window.TrainIcons.resolveVehicleIcon(name, lineId) || '';
    }
    return '';
  }

  // S4 图标规则兜底（视觉表示）
  function resolveIconByRules(ctx) {
    if (window.TrainIcons && typeof window.TrainIcons.getTrainIcon === 'function') {
      var trainId = ctx.trainId || ((ctx.trainNumber || '') + '_' + (ctx.stationIndex || 0));
      return window.TrainIcons.getTrainIcon(
        ctx.lineId, ctx.operator,
        trainId, ctx.stationIndex, ctx.trainType, !!ctx.byOperator
      ) || '';
    }
    return '';
  }

  // ============================================================
  // 主判定：聚合 S0–S4 → 交叉验证 → 决策
  // ============================================================
  function resolve(ctx) {
    ctx = ctx || {};
    var lineId = ctx.lineId || '';
    var operator = normOp(ctx.operator);
    var trainNumber = ctx.trainNumber || '';
    var trainType = ctx.trainType || '';
    var dest = ctx.destinationStation || '';
    var stationIndex = (typeof ctx.stationIndex === 'number') ? ctx.stationIndex : undefined;

    // 1) 收集候选池（带来源，候选 → 支持来源集合；orderArr 保持 S0→S3 稳定顺序）
    var pool = {};      // candidate -> { sources: [], count }
    var orderArr = [];  // 候选稳定顺序（manual → odpt → trainNo → map）
    function addFrom(str, src) {
      splitCandidates(str).forEach(function(c) {
        var rec = pool[c];
        if (!rec) {
          rec = pool[c] = { sources: [], count: 0 };
          orderArr.push(c);
        }
        if (rec.sources.indexOf(src) < 0) rec.sources.push(src);
        rec.count++;
      });
    }

    var _explicitVehicleInput = splitCandidates(ctx.vehicleTypeManual).length > 0 ||
      splitCandidates(ctx.odptVehicleType).length > 0;

    addFrom(ctx.vehicleTypeManual, 'manual');      // S0
    addFrom(ctx.odptVehicleType, 'odpt');          // S1
    getCandidates(trainNumber).forEach(function(c) { // S2
      var rec = pool[c];
      if (!rec) {
        rec = pool[c] = { sources: [], count: 0 };
        orderArr.push(c);
      }
      if (rec.sources.indexOf('trainNo') < 0) rec.sources.push('trainNo');
      rec.count++;
    });
    if (window.VehicleTypeMap && typeof window.VehicleTypeMap.resolve === 'function') { // S3
      addFrom(window.VehicleTypeMap.resolve(lineId, trainType, dest), 'map');
    }

    // 2) 决策：按来源可信度顺序取首选候选（不猜——仅取有依据的）
    // v4.3.989: manual 为多候选串（ODPT 数据宽泛，如"8000系/11000系/20000系"）时，
    // 若 S2 车号级已有跨线累积实证（A 线 ODPT 实时/时刻表注册），优先 S2——
    // 保证直通列车在 B 线（时刻表推定、无实时车型）视图继承 A 线同列次号车型，
    // 杜绝"宽泛候选第一项"压过车号级实证导致跨视图换图标。
    var order = ['manual', 'odpt', 'trainNo', 'map'];
    var _manualCands = splitCandidates(ctx.vehicleTypeManual);
    var _trainNoCands = getCandidates(trainNumber);
    if (_manualCands.length > 1 && _trainNoCands.length > 0) {
      order = ['trainNo', 'manual', 'odpt', 'map'];
    }
    // v4.3.1006b/c: 加权候选池统一按 orderArr（S0 manual + S3 map 全候选）判定——
    // 候选串可能来自 S0 manual（estimator 转存）或 S3 map（Arakawa ODPT 无车型、vehicleType 空，
    // 候选串由 vehicle-type-map.js MAP 提供），两种情况都应按保有数比例映射；
    // S2 若携带 orderArr 之外的新候选（跨线/实时车号级实证）才阻断加权、保持实证优先。
    var _fleetEligible = orderArr.length > 1;
    if (_fleetEligible && _trainNoCands.length > 0) {
      var _sameAsManual = _trainNoCands.length === orderArr.length &&
        _trainNoCands.every(function(c) { return orderArr.indexOf(c) >= 0; });
      if (!_sameAsManual) _fleetEligible = false;
    }
    var chosen = '';
    var chosenSrc = '';
    // v4.3.1006: 保有数比例加权随机映射（用户决策 2026-09-24）——
    // 候选串无法精确识别（如都電五选一"7700形/8500形/8800形/8900形/9000形"）且无 S2 车号实证时，
    // 按官网在籍数权重做确定性 hash 选型：同一车次（trainId）每次稳定同一车型，
    // 杜绝"全线一个兜底跑天下"；权重表 VEHICLE_FLEET_WEIGHTS（train-icons.js）人工按官网核验。
    if (_fleetEligible &&
        window.TrainIcons && window.TrainIcons.VEHICLE_FLEET_WEIGHTS && lineId) {
      var _fleet = window.TrainIcons.VEHICLE_FLEET_WEIGHTS[lineId] || {};
      var _fleetKey = orderArr.join(' / ');
      var _wArr = _fleet[_fleetKey] || _fleet['*'];
      if (_wArr && _wArr.length === orderArr.length) {
        var _seed = (trainNumber || '') + '|' + lineId + '|' + _fleetKey;
        var _h = 0;
        for (var _si = 0; _si < _seed.length; _si++) _h = ((_h * 31) + _seed.charCodeAt(_si)) >>> 0;
        var _total = 0;
        _wArr.forEach(function(w) { _total += w; });
        var _r = _h % _total, _acc = 0, _fleetIdx = -1;
        for (var _wi = 0; _wi < _wArr.length; _wi++) {
          _acc += _wArr[_wi];
          if (_r < _acc) { _fleetIdx = _wi; break; }
        }
        if (_fleetIdx < 0) _fleetIdx = _wArr.length - 1;
        chosen = orderArr[_fleetIdx];
        chosenSrc = 'fleet';
      }
    }
    if (!chosen) {
      for (var oi = 0; oi < order.length; oi++) {
        var srcName = order[oi];
        var found = null;
        Object.keys(pool).forEach(function(c) {
          if (!found && pool[c].sources.indexOf(srcName) >= 0) found = c;
        });
        if (found) { chosen = found; chosenSrc = srcName; break; }
      }
    }

    // 3) 可信度
    //    manual/odpt = high；trainNo 多来源交叉 = high，单来源 = medium；map = medium；icons = low
    var confidence = 'none';
    var crossCount = chosen && pool[chosen] ? pool[chosen].count : 0;
    if (chosenSrc === 'manual' || chosenSrc === 'odpt') confidence = 'high';
    else if (chosenSrc === 'trainNo') confidence = crossCount >= 2 ? 'high' : 'medium';
    else if (chosenSrc === 'map') confidence = 'medium';
    else if (chosenSrc === 'icons') confidence = 'low';
    else if (chosenSrc === 'fleet') confidence = 'low';   // v4.3.1006: 保有数比例加权随机映射（低置信度推定）

    // 4) 图标：候选 → 图标库；无图标再走 S4 规则兜底
    var iconPath = chosen ? resolveIconForName(chosen, ctx.lineId) : '';
    var _explicitUnknownVehicle = !!(chosen && _explicitVehicleInput && !iconPath);
    // v4.3.988: 直通稳定——首选候选在本视图无图时，回退遍历候选池中带公司前缀的
    // 候选按车籍解析（如 相鉄20000系 在東武視図無图 → 相模鉄道20000系），
    // 确保同一趟直通列车跨线路视图显示同一张车籍图标，杜绝 S4 视图默认图换图标。
    if (!iconPath && !_explicitUnknownVehicle && orderArr.length > 1) {
      var _compRe = /鉄道|電鉄|メトロ|都営|京成|京王|京急|東急|東武|西武|相鉄|小田急|JR|モノレール|新都市|高速|埼玉|ゆりかもめ/;
      for (var _ci = 0; _ci < orderArr.length && !iconPath; _ci++) {
        var _cc = orderArr[_ci];
        if (_cc === chosen || !_cc) continue;
        if (_compRe.test(_cc)) {
          iconPath = resolveIconForName(_cc, ctx.lineId);
        }
      }
    }
    if (!iconPath && !_explicitUnknownVehicle) iconPath = resolveIconByRules(ctx);
    if (!chosen && iconPath && lineId !== 'Yamanote' &&
        /\/E235系山手線\.png$/i.test(String(iconPath))) {
      iconPath = '';
    }

    // 5) 推定名兜底（S4）：S0–S3 无依据时，用图标规则命中的图标文件名作为推定车型——
    //    LINE_ICONS/部署区间/运营商图标均为人工按 ODPT 时刻表与部署核验的线路主力车型，
    //    非模型臆测（source='icons', confidence='low'）。唯一排除项：终极兜底 E235系山手線
    //    不得用于非山手线（避免"东京通勤车乱入地方线"旧病复发）。
    if (!chosen && iconPath) {
      var _iconName = String(iconPath).split('/').pop().replace(/\.png$/i, '');
      if (_iconName && !(_iconName === 'E235系山手線' && lineId !== 'Yamanote')) {
        chosen = _iconName;
        chosenSrc = 'icons';
        confidence = 'low';
      }
    }

    // v4.3.991: 标签诚实化——manual 为多候选串（如混跑"71-000形 / 70-000形"）时传原文串，
    // resolveVehicleDisplayName 对全部可解析的多候选返回完整串（表达不确定），不再只显示第一项；
    // 单候选/其他来源保持原名与 alias 展开（4.3.987 一致化不回归）。
    if (chosen && iconPath && window.TrainIcons && typeof window.TrainIcons.resolveVehicleDisplayName === 'function') {
      var _dispSrc = (chosenSrc === 'manual' && ctx.vehicleTypeManual) ? ctx.vehicleTypeManual
        : (chosen || (orderArr.length ? orderArr.join(' / ') : ''));
      var _disp = window.TrainIcons.resolveVehicleDisplayName(_dispSrc, ctx.lineId);
      if (_disp && _disp !== chosen) chosen = _disp;
    }

    return {
      name: chosen,                                  // 车型名（S0–S3 实证或 S4 推定；alias 后与图标一致）
      candidates: orderArr,                          // 全部候选（S0→S3 稳定顺序）
      sources: chosen ? (pool[chosen] ? pool[chosen].sources.slice() : (chosenSrc ? [chosenSrc] : [])) : [],
      source: chosenSrc,                             // 决策来源：manual/odpt/trainNo/map/icons/''（''=无依据）
      confidence: confidence,
      iconPath: iconPath,
      // 兼容原 vehicleType 候选串格式（"A / B / C"，稳定顺序）
      // v4.3.1007b: 加权随机映射已确定单一车型时,vehicleTypeStr 与 name 一致(title 不再显示候选串)
      vehicleTypeStr: (chosenSrc === 'fleet' && chosen) ? chosen : orderArr.join(' / ')
    };
  }

  function getName(ctx) { return resolve(ctx).name; }
  function getIconPath(ctx) { return resolve(ctx).iconPath; }

  // ============================================================
  // Public API
  // ============================================================
  window.TrainVehicle = {
    version: '4.3.950',
    resolve: resolve,
    getName: getName,
    getIconPath: getIconPath,
    registerVehicle: registerVehicle,
    getCandidates: getCandidates,
    // 调试/审计用
    _table: function() { return TRAIN_NO_VEHICLE; }
  };

  console.debug('[TrainVehicle] v4.3.950 initialized（全局车辆判定统一入口）');
})();
