/*
 * Pixel Tetsudo - Train Vehicle Resolver
 *
 * Zero-fallback vehicle identity contract:
 *   - EXACT only from one explicit train-level vehicle identity or dated
 *     operation/formation evidence.
 *   - NARROWED may expose multiple evidence candidates, but never a concrete icon.
 *   - UNKNOWN stays unknown.
 *   - line/operator/train type/train number/history/static maps/icon rules may not
 *     manufacture vehicle identity.
 *   - artwork is only a projection of an already-EXACT identity; missing artwork
 *     stays missing.
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

  // ============================================================
  // Main decision: explicit and dated evidence only.
  // ============================================================
  function resolve(ctx) {
    ctx = ctx || {};
    var assignmentOperator = normOp(ctx.assignmentOperator || ctx.operationOperator || '');

    // 1) Evidence candidates are limited to explicit train-level input.
    // Historical train-number and static fleet inference are excluded from runtime identity.
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
    // Historical train-number, owner, line/type/number and static fleet inference are forbidden.
    var chosen = '';
    var chosenSrc = '';
    var _timetableCands = splitCandidates(ctx.timetableVehicleType || ctx.vehicleTypeManual);
    var _realtimeCands = splitCandidates(ctx.realtimeVehicleType || ctx.odptVehicleType);
    // Parallel authoritative sources with explicit arbitration:
    // realtime train-level identity wins when present; timetable/SQL identity is
    // selected only when realtime carries no exact vehicle fact. Timetable is a
    // first-class source, not a heuristic fallback.
    if (_realtimeCands.length === 1) {
      chosen = _realtimeCands[0];
      chosenSrc = 'realtime';
    } else if (_realtimeCands.length === 0 && _timetableCands.length === 1) {
      chosen = _timetableCands[0];
      chosenSrc = 'timetable';
    }

    // Explicit train-level or dated operation evidence is high confidence.
    var confidence = chosen ? 'high' : 'none';

    // 4) Artwork is a strict projection of the already-exact vehicle identity.
    // Missing artwork stays missing; never substitute another candidate, line,
    // operator, retired replacement, or rule-derived vehicle.
    var iconPath = chosen ? resolveIconForName(chosen, ctx.lineId) : '';

    // Display-name normalization is allowed only after identity is exact.

    // v4.3.991: 标签诚实化——manual 为多候选串（如混跑"71-000形 / 70-000形"）时传原文串，
    // resolveVehicleDisplayName 对全部可解析的多候选返回完整串（表达不确定），不再只显示第一项；
    // 单候选/其他来源保持原名与 alias 展开（4.3.987 一致化不回归）。
    if (chosen && iconPath && window.TrainIcons && typeof window.TrainIcons.resolveVehicleDisplayName === 'function') {
      var _dispSrc = chosen || (orderArr.length ? orderArr.join(' / ') : '');
      var _disp = window.TrainIcons.resolveVehicleDisplayName(_dispSrc, ctx.lineId);
      if (_disp && _disp !== chosen) chosen = _disp;
    }

    // B0 vehicle-identity contract:
    // EXACT     = one concrete vehicle is supported by train-level/explicit evidence,
    //             or the applicable timetable fleet itself has only one possible type.
    // NARROWED  = timetable/owner evidence reduced the fleet but still leaves >1 type.
    // UNKNOWN   = no usable vehicle evidence exists.
    var identityStatus = 'UNKNOWN';
    var identityReason = 'no-vehicle-evidence';
    var effectiveCandidates = orderArr.slice();
    if (chosen) {
      identityStatus = 'EXACT';
      identityReason = chosenSrc === 'realtime' ? 'realtime-vehicle-evidence'
        : ((_manualEvidenceSource === 'operation-assignment-provider')
          ? 'dated-operation-vehicle-evidence' : 'timetable-vehicle-evidence');
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
      vehicleTypeStr: chosen || ''
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
    // Evidence admission must never depend on whether artwork exists. A dated,
    // explicit vehicle identity may be stored even when the gallery has no image;
    // artwork is resolved only when the evidence is later projected for display.
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
      identityStatus:"EXACT", identityReason:"dated-running-chain-vehicle-evidence",
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
