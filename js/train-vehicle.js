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
  var TRAIN_NO_VEHICLE_SCOPED = window.TRAIN_NO_VEHICLE_SCOPED || {};
  window.TRAIN_NO_VEHICLE = TRAIN_NO_VEHICLE; // 兼容旧引用（外部只读）
  window.TRAIN_NO_VEHICLE_SCOPED = TRAIN_NO_VEHICLE_SCOPED;

  // ============================================================
  // 车号 → 车型候选 累积表（key = 纯车号，跨线累积去重）
  // ============================================================
  function registerVehicle(trainNumber, vehicleTypeStr, operator) {
    if (!trainNumber || !vehicleTypeStr) return;
    var key = String(trainNumber);
    var exist = TRAIN_NO_VEHICLE[key] || (TRAIN_NO_VEHICLE[key] = []);
    var op = normOp(operator);
    var scopedKey = op ? (op + "::" + key) : "";
    var scoped = scopedKey ? (TRAIN_NO_VEHICLE_SCOPED[scopedKey] || (TRAIN_NO_VEHICLE_SCOPED[scopedKey] = [])) : null;
    String(vehicleTypeStr).split('/').forEach(function(s) {
      var c = s.trim();
      if (!c) return;
      if (exist.indexOf(c) < 0) exist.push(c);
      if (scoped && scoped.indexOf(c) < 0) scoped.push(c);
    });
  }

  function getCandidates(trainNumber, operator) {
    if (!trainNumber) return [];
    var key = String(trainNumber);
    var op = normOp(operator);
    var scopedKey = op ? (op + "::" + key) : "";
    if (scopedKey && TRAIN_NO_VEHICLE_SCOPED[scopedKey]) return TRAIN_NO_VEHICLE_SCOPED[scopedKey];
    // Same train numbers are reused by unrelated operators. Never import
    // another operator's vehicle evidence; through continuity uses runningChainId.
    if (op) return [];
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

  // ODPT trainOwner is physical rolling-stock ownership evidence. It cannot
  // identify a model by itself, but it can safely remove other operators' stock
  // from a multi-company through-service candidate pool.
  function ownerMatchesCandidate(owner, candidate) {
    var op = normOp(owner);
    if (!op || !candidate) return false;
    var rules = {
      "JR-East": /^(?:JR東日本|JR\s*)?(?:E|209|253|E2|E3|E5|E6|E7|E8|E257|E259|E353|E531|E653|E657|E751)/i,
      "TokyoMetro": /東京メトロ/,
      "Toei": /(?:都営|東京都交通局)/,
      "Tokyu": /(?:東急|東急電鉄)/,
      "TOKYU": /(?:東急|東急電鉄)/,
      "Tobu": /(?:東武|東武鉄道)/,
      "Seibu": /(?:西武|西武鉄道)/,
      "Sotetsu": /(?:相鉄|相模鉄道)/,
      "Odakyu": /(?:小田急|小田急電鉄)/,
      "Keio": /(?:京王|京王電鉄)/,
      "Keikyu": /(?:京急|京浜急行)/,
      "Keisei": /(?:京成|京成電鉄)/,
      "Hokuso": /(?:北総|北総鉄道)/,
      "Minatomirai": /(?:横浜高速|Y500|Y000)/i,
      "SaitamaRailway": /(?:埼玉高速|埼玉高速鉄道)/,
      "ToyoRapid": /(?:東葉高速|東葉高速鉄道)/,
      "TWR": /(?:東京臨海高速|りんかい)/,
      "TsukubaExpress": /(?:首都圏新都市鉄道|TX-)/i
    };
    var re = rules[op];
    return !!(re && re.test(String(candidate)));
  }

  function filterCandidatesByOwner(candidates, owner) {
    if (!owner || !candidates || candidates.length < 2) return candidates || [];
    var matched = candidates.filter(function(c) { return ownerMatchesCandidate(owner, c); });
    return matched.length ? matched : candidates;
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
    var trainOwner = normOp(ctx.trainOwner || ctx.odptTrainOwner || '');
    // B1: assignmentOperator is derived from a train-operation/working-number
    // evidence provider. It is weaker than explicit vehicleType but equivalent
    // to trainOwner for safely removing other operators' stock.
    var assignmentOperator = normOp(ctx.assignmentOperator || ctx.operationOperator || '');
    var effectiveOwner = trainOwner || assignmentOperator;
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
    var _manualEvidenceSource = String(ctx.vehicleEvidenceSource || '').trim();

    addFrom(ctx.vehicleTypeManual, 'manual');      // S0
    addFrom(ctx.odptVehicleType, 'odpt');          // S1
    getCandidates(trainNumber, operator).forEach(function(c) { // S2
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
    var _trainNoCands = getCandidates(trainNumber, operator);
    if (_manualCands.length > 1 && _trainNoCands.length > 0) {
      order = ['trainNo', 'manual', 'odpt', 'map'];
    }
    // v4.3.1006b/c: 加权候选池统一按 orderArr（S0 manual + S3 map 全候选）判定——
    // 候选串可能来自 S0 manual（estimator 转存）或 S3 map（Arakawa ODPT 无车型、vehicleType 空，
    // 候选串由 vehicle-type-map.js MAP 提供），两种情况都应按保有数比例映射；
    // S2 若携带 orderArr 之外的新候选（跨线/实时车号级实证）才阻断加权、保持实证优先。
    // Multiple candidates without train-level evidence remain ambiguous.
    // Do not manufacture a concrete vehicle identity from fleet ratios/hash;
    // that creates a stable-looking but unsupported icon assignment.
    var chosen = '';
    var chosenSrc = '';
    // A source may select a concrete vehicle only when it identifies exactly
    // one candidate. Multi-candidate timetable/fleet evidence describes the
    // possible fleet, not the actual formation assigned to this service.
    // If train-number evidence exists, intersect it with higher-level evidence;
    // choose only when that intersection is unique.
    var _trainNoSet = getCandidates(trainNumber, operator);
    for (var oi = 0; oi < order.length && !chosen; oi++) {
      var srcName = order[oi];
      var srcCandidates = Object.keys(pool).filter(function(c) {
        return pool[c].sources.indexOf(srcName) >= 0;
      });
      var ownerFiltered = filterCandidatesByOwner(srcCandidates, effectiveOwner);
      if (ownerFiltered.length !== srcCandidates.length) srcCandidates = ownerFiltered;
      if (srcCandidates.length === 1) {
        chosen = srcCandidates[0];
        chosenSrc = (effectiveOwner && ownerMatchesCandidate(effectiveOwner, chosen)) ? (srcName + '+trainOwner') : srcName;
        break;
      }
      if (srcCandidates.length > 1 && _trainNoSet.length) {
        var intersection = srcCandidates.filter(function(c) {
          return _trainNoSet.indexOf(c) >= 0;
        });
        if (intersection.length === 1) {
          chosen = intersection[0];
          chosenSrc = 'trainNo';
          break;
        }
      }
    }

    // 3) 可信度
    //    manual/odpt = high；trainNo 多来源交叉 = high，单来源 = medium；map = medium；icons = low
    var confidence = 'none';
    var crossCount = chosen && pool[chosen] ? pool[chosen].count : 0;
    if (/^(manual|odpt)(?:\+trainOwner)?$/.test(chosenSrc)) confidence = 'high';
    else if (chosenSrc === 'trainNo') confidence = crossCount >= 2 ? 'high' : 'medium';
    else if (chosenSrc === 'map' || chosenSrc === 'map+trainOwner') confidence = 'medium';
    else if (chosenSrc === 'icons') confidence = 'low';

    // 4) 图标：候选 → 图标库；无图标再走 S4 规则兜底
    var iconPath = chosen ? resolveIconForName(chosen, ctx.lineId) : '';
    var _explicitUnknownVehicle = !!(chosen && _explicitVehicleInput && !iconPath);
    // v4.3.988: 直通稳定——首选候选在本视图无图时，回退遍历候选池中带公司前缀的
    // 候选按车籍解析（如 相鉄20000系 在東武視図無图 → 相模鉄道20000系），
    // 确保同一趟直通列车跨线路视图显示同一张车籍图标，杜绝 S4 视图默认图换图标。
    if (!iconPath && chosen && !_explicitUnknownVehicle && orderArr.length > 1) {
      var _compRe = /鉄道|電鉄|メトロ|都営|京成|京王|京急|東急|東武|西武|相鉄|小田急|JR|モノレール|新都市|高速|埼玉|ゆりかもめ/;
      for (var _ci = 0; _ci < orderArr.length && !iconPath; _ci++) {
        var _cc = orderArr[_ci];
        if (_cc === chosen || !_cc) continue;
        if (_compRe.test(_cc)) {
          iconPath = resolveIconForName(_cc, ctx.lineId);
        }
      }
    }
    // Do not invent a formation/livery icon when vehicle identity is unresolved.
    // Line-level icon rules are presentation fallbacks only after a concrete
    // vehicle identity exists; otherwise the renderer must use its neutral marker.
    if (!iconPath && chosen && !_explicitUnknownVehicle) iconPath = resolveIconByRules(ctx);
    if (!chosen && iconPath && lineId !== 'Yamanote' &&
        /\/E235系山手線\.png$/i.test(String(iconPath))) {
      iconPath = '';
    }

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
    var operationVehicleCandidates = Array.isArray(ctx.operationVehicleCandidates)
      ? ctx.operationVehicleCandidates.filter(Boolean) : [];
    if (operationVehicleCandidates.length && effectiveCandidates.length > 1) {
      var constrained = effectiveCandidates.filter(function(c) {
        return operationVehicleCandidates.indexOf(c) >= 0;
      });
      if (constrained.length) effectiveCandidates = constrained;
    }
    if (effectiveOwner && effectiveCandidates.length > 1) {
      effectiveCandidates = filterCandidatesByOwner(effectiveCandidates, effectiveOwner);
    }
    if (chosen) {
      identityStatus = 'EXACT';
      if (/^(manual|odpt)/.test(chosenSrc)) identityReason =
        (_manualEvidenceSource === 'operation-assignment-provider') ? 'dated-operation-vehicle-evidence' : 'explicit-vehicle-evidence';
      else if (chosenSrc === 'trainNo') identityReason = 'train-number-evidence';
      else if (chosenSrc === 'map' || chosenSrc === 'map+trainOwner') identityReason = 'single-vehicle-timetable-constraint';
      else identityReason = 'resolved-vehicle-evidence';
    } else if (effectiveCandidates.length > 0) {
      identityStatus = 'NARROWED';
      identityReason = effectiveOwner && effectiveCandidates.length < orderArr.length
        ? (trainOwner ? 'train-owner-narrowed-candidates' : 'operation-operator-narrowed-candidates')
        : (operationVehicleCandidates.length && effectiveCandidates.length < orderArr.length
          ? 'operation-vehicle-narrowed-candidates' : 'timetable-multiple-candidates');
    }

    // Visual fleet assignment for NARROWED identities.
    // Evidence semantics remain unchanged: this does NOT promote a timetable/fleet
    // candidate to EXACT. It only gives each physical service a stable visual
    // representative from the externally-confirmed legal candidate pool.
    // Prefer runningChainId so through-services keep the same visual vehicle across
    // line/operator views; fall back to train number and stable operation context.
    var visualVehicle = chosen || '';
    if (identityStatus === 'NARROWED' && effectiveCandidates.length > 1) {
      var visualSeed = String(ctx.runningChainId || ctx.trainId || trainNumber || '') + '|' +
        String(ctx.operationId || ctx.operationCode || '') + '|' +
        String(lineId || '') + '|' + effectiveCandidates.join('|');
      var visualHash = 2166136261 >>> 0;
      for (var vh = 0; vh < visualSeed.length; vh++) {
        visualHash ^= visualSeed.charCodeAt(vh);
        visualHash = Math.imul(visualHash, 16777619) >>> 0;
      }
      visualVehicle = effectiveCandidates[visualHash % effectiveCandidates.length];
      iconPath = resolveIconForName(visualVehicle, ctx.lineId) || '';
      if (!iconPath && window.TrainIcons && typeof window.TrainIcons.resolveVehicleIcon === 'function') {
        iconPath = window.TrainIcons.resolveVehicleIcon(visualVehicle, ctx.lineId) || '';
      }
    } else if (identityStatus !== 'EXACT') {
      iconPath = '';
    }

    return {
      name: chosen,                                  // evidence identity only; empty while ambiguous
      candidates: effectiveCandidates,               // candidates after safe owner narrowing
      allCandidates: orderArr,                        // raw S0→S3 evidence pool for diagnostics
      identityStatus: identityStatus,                 // EXACT / NARROWED / UNKNOWN
      identityReason: identityReason,
      visualVehicle: visualVehicle,                  // presentation-only choice; never evidence
      visualAssignment: identityStatus === 'NARROWED' && !!visualVehicle ? 'stable-candidate-pick' : (chosen ? 'evidence' : 'none'),
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
    registerVehicle: registerVehicle,
    registerFormationEvidence: registerFormationEvidence,
    resolveFormationEvidence: resolveFormationEvidence,
    clearFormationEvidenceOtherDates: clearFormationEvidenceOtherDates,
    getCandidates: getCandidates,
    // 调试/审计用
    _table: function() { return TRAIN_NO_VEHICLE; },
    _scopedTable: function() { return TRAIN_NO_VEHICLE_SCOPED; }
  };

  console.debug('[TrainVehicle] v4.3.1053 initialized（B0 EXACT/NARROWED/UNKNOWN vehicle identity contract）');
})();
