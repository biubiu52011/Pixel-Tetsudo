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

  // Normalize operator labels only for metadata carried by explicit evidence.
  function normOp(op) {
    if (!op) return '';
    if (window.TransitConstants && typeof window.TransitConstants.normalizeOp === 'function') {
      return window.TransitConstants.normalizeOp(op);
    }
    return String(op).replace(/^odpt\.Operator:/, '');
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
    var assignmentOperator = normOp(ctx.assignmentOperator || ctx.operationOperator || '');

    // 1) Evidence candidates are limited to explicit train-level input.
    // Historical train-number tables and static VehicleTypeMap are deliberately
    // excluded from runtime identity and ambiguity state.
    var pool = {};
    var orderArr = [];
    function addFrom(str, src) {
      splitCandidates(str).forEach(function(candidate) {
        if (!pool[candidate]) {
          pool[candidate] = { sources: [], count: 0 };
          orderArr.push(candidate);
        }
        if (pool[candidate].sources.indexOf(src) < 0) pool[candidate].sources.push(src);
        pool[candidate].count++;
      });
    }
    var _manualEvidenceSource = String(ctx.vehicleEvidenceSource || '').trim();
    addFrom(ctx.vehicleTypeManual, 'manual');
    addFrom(ctx.odptVehicleType, 'odpt');
    if (Array.isArray(ctx.operationVehicleCandidates)) {
      ctx.operationVehicleCandidates.filter(Boolean).forEach(function(candidate) {
        addFrom(candidate, 'operation');
      });
    }

    // 2) Zero-fallback identity decision.
    // Only explicit vehicle identity carried by this train record may become EXACT.
    // Historical train-number tables, VehicleTypeMap, owner narrowing, line/type/number
    // rules and candidate intersections remain diagnostics only.
    var chosen = '';
    var chosenSrc = '';
    var _manualCands = splitCandidates(ctx.vehicleTypeManual);
    var _odptCands = splitCandidates(ctx.odptVehicleType);
    if (_manualCands.length === 1) {
      chosen = _manualCands[0];
      chosenSrc = 'manual';
    } else if (_odptCands.length === 1) {
      chosen = _odptCands[0];
      chosenSrc = 'odpt';
    }

    // Explicit train-level or dated operation evidence is high confidence.
    var confidence = chosen ? 'high' : 'none';

    // 4) Artwork is a strict projection of the already-exact vehicle identity.
    // Missing artwork stays missing; never substitute another candidate, line,
    // operator, retired replacement, or rule-derived vehicle.
    var iconPath = chosen ? resolveIconForName(chosen, ctx.lineId) : '';

    // 5) S4 图标兜底只提供视觉 locator，不再从 PNG basename 反推出车型身份。
    // 车型身份必须来自 S0-S3 或 canonical/alias 层，避免 physical filename 承担 identity。

    // v4.3.991: 标签诚实化——manual 为多候选串（如混跑"71-000形 / 70-000形"）时传原文串，
    // resolveVehicleDisplayName 对全部可解析的多候选返回完整串（表达不确定），不再只显示第一项；
    // 单候选/其他来源保持原名与 alias 展开（4.3.987 一致化不回归）。
    if (chosen && iconPath && window.TrainIcons && typeof window.TrainIcons.resolveVehicleDisplayName === 'function') {
      var _dispSrc = (chosenSrc === 'manual' && ctx.vehicleTypeManual) ? ctx.vehicleTypeManual
        : (chosen || (orderArr.length ? orderArr.join(' / ') : ''));
      var _disp = window.TrainIcons.resolveVehicleDisplayName(_dispSrc, ctx.lineId);
      if (_disp && _disp !== chosen) chosen = _disp;
    }

    // B0 vehicle-identity contract:
    // EXACT     = one concrete vehicle is supported by train-level/explicit evidence,
    //             or the applicable timetable fleet itself has only one possible type.
    // NARROWED  = timetable/owner evidence reduced the fleet but still leaves >1 type.
    // UNKNOWN   = no usable vehicle evidence exists.
    // IMPORTANT: a multi-vehicle VehicleTypeMap/default is never EXACT.
    var identityStatus = 'UNKNOWN';
    var identityReason = 'no-vehicle-evidence';
    var effectiveCandidates = orderArr.slice();
    if (chosen) {
      identityStatus = 'EXACT';
      identityReason = (_manualEvidenceSource === 'operation-assignment-provider')
        ? 'dated-operation-vehicle-evidence' : 'explicit-vehicle-evidence';
    } else if (effectiveCandidates.length > 0) {
      identityStatus = 'NARROWED';
      identityReason = 'non-decisive-vehicle-candidates';
    }

    // B0 hard invariant: unresolved multi-candidate identity must never leak a
    // candidate-specific vehicle/formation/livery image. Rendering can use its
    // neutral marker outside this resolver.
    if (identityStatus !== 'EXACT') iconPath = '';

    return {
      name: chosen,                                  // EXACT vehicle only; empty while ambiguous
      candidates: effectiveCandidates,               // explicit/dated evidence candidates
      allCandidates: orderArr,                        // explicit/dated evidence pool for diagnostics
      identityStatus: identityStatus,                 // EXACT / NARROWED / UNKNOWN
      identityReason: identityReason,
      assignmentOperator: assignmentOperator,
      sources: chosen ? (pool[chosen] ? pool[chosen].sources.slice() : (chosenSrc ? [chosenSrc] : [])) : [],
      source: chosenSrc,                             // decision source; empty when unresolved
      confidence: confidence,
      iconPath: iconPath,
      // 兼容原 vehicleType 候选串格式（"A / B / C"，稳定顺序）
      // v4.3.1007b: 加权随机映射已确定单一车型时,vehicleTypeStr 与 name 一致(title 不再显示候选串)
      vehicleTypeStr: orderArr.join(' / ')
    };
  }

  function getName(ctx) { return resolve(ctx).name; }
  function getIconPath(ctx) { return resolve(ctx).iconPath; }

  // Daily formation evidence. This layer never guesses a formation:
  // it only propagates a dated, externally confirmed formation along an
  // already-resolved physical runningChainId.
  var _formationEvidence = {};
  function _formationServiceDate(d) {
    var x = d instanceof Date ? d : new Date(d || Date.now());
    return x.getFullYear() + "-" + String(x.getMonth()+1).padStart(2,"0") + "-" + String(x.getDate()).padStart(2,"0");
  }
  function _normalizeFormation(lineId, formationId) {
    if (lineId !== "NewShuttle") return null;
    var id = String(formationId == null ? "" : formationId).replace(/[^0-9]/g,"");
    if (/^0[1-7]$/.test(id)) return { id:id, vehicleName:"埼玉新都市交通2000系（"+id+"編成）" };
    if (/^2[1-6]$/.test(id)) return { id:id, vehicleName:"2020系（"+id+"編成）" };
    return null;
  }
  function registerFormationEvidence(anchor) {
    if (!anchor || !anchor.runningChainId) return false;
    var f = anchor.formationId ? _normalizeFormation(anchor.lineId, anchor.formationId) : null;
    var explicitVehicle = String(anchor.vehicleName || anchor.vehicleType || "").trim();
    var vehicleName = f ? f.vehicleName : explicitVehicle;
    if (!vehicleName) return false;
    // Explicit timetable/operator vehicle type is evidence; never derive it from
    // train number, line, icon fallback, or a generic LimitedExpress label.
    if (!f && !resolveIconForName(vehicleName, anchor.lineId)) return false;
    var date = anchor.serviceDate || _formationServiceDate(anchor.observedAt);
    var evidenceKey = date+"|"+anchor.runningChainId;
    var existing = _formationEvidence[evidenceKey];
    if (existing && existing.vehicleName && existing.vehicleName !== vehicleName) {
      // Two incompatible explicit identities on one physical chain are a data
      // conflict, never permission to let the latest segment silently win.
      _formationEvidence[evidenceKey] = {
        lineId:anchor.lineId, runningChainId:anchor.runningChainId, serviceDate:date,
        formationId:"", vehicleName:"", conflict:true,
        conflictingVehicles:[existing.vehicleName, vehicleName].filter(function(v,i,a){return v && a.indexOf(v)===i;}),
        evidenceSource:"conflicting-explicit-vehicle-evidence",
        evidenceDetail:{ previous:existing.evidenceDetail || null, incoming:anchor.evidenceDetail || null },
        observedAt:anchor.observedAt || existing.observedAt || null
      };
      return false;
    }
    if (existing && existing.conflict) return false;
    _formationEvidence[evidenceKey] = {
      lineId:anchor.lineId, runningChainId:anchor.runningChainId, serviceDate:date,
      formationId:f ? f.id : "",
      vehicleName:vehicleName,
      evidenceSource:anchor.evidenceSource || (f ? "daily-observation" : "official-timetable-vehicle"),
      evidenceDetail:anchor.evidenceDetail || null,
      observedAt:anchor.observedAt || null
    };
    return true;
  }
  function resolveFormationEvidence(ctx) {
    if (!ctx || !ctx.runningChainId) return null;
    var date = ctx.serviceDate || _formationServiceDate(ctx.at);
    var a = _formationEvidence[date+"|"+ctx.runningChainId];
    if (!a || a.conflict) return null;
    var icon = resolveIconForName(a.vehicleName, a.lineId);
    if (!icon) return null;
    return {
      formationId:a.formationId, vehicleName:a.vehicleName, iconPath:icon,
      serviceDate:a.serviceDate, source:"formation-evidence", confidence:"high",
      evidenceSource:a.evidenceSource, evidenceDetail:a.evidenceDetail || null, observedAt:a.observedAt,
      propagatedByRunningChain:true
    };
  }
  function clearFormationEvidenceOtherDates(date) {
    var keep = date || _formationServiceDate();
    Object.keys(_formationEvidence).forEach(function(k) {
      if (k.indexOf(keep+"|") !== 0) delete _formationEvidence[k];
    });
  }

  // ============================================================
  // Public API
  // ============================================================
  window.TrainVehicle = {
    version: '4.3.1051',
    resolve: resolve,
    getName: getName,
    getIconPath: getIconPath,
    registerFormationEvidence: registerFormationEvidence,
    resolveFormationEvidence: resolveFormationEvidence,
    clearFormationEvidenceOtherDates: clearFormationEvidenceOtherDates,
  };

  console.debug('[TrainVehicle] v4.3.1053 initialized（B0 EXACT/NARROWED/UNKNOWN vehicle identity contract）');
})();
