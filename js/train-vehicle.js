/*
 * Pixel Tetsudo - Train Vehicle Resolver
 *
 * Canonical vehicle identity contract:
 *   - Source priority is realtime direct > realtime-derived > structural/family
 *     > dated/timetable fallback > UNKNOWN.
 *   - EXACT requires one concrete identity from the highest available source.
 *   - NARROWED may expose evidence candidates, but never a concrete icon.
 *   - UNKNOWN stays unknown; line/operator defaults may not manufacture identity.
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
  function resolveArtworkForIdentity(name, formationId) {
    if (!name) return '';
    if (window.TrainIcons && typeof window.TrainIcons.resolveVehicleArtwork === 'function') {
      if (formationId) {
        var formationIdentity = name;
        if (!/編成/.test(formationIdentity)) {
          formationIdentity = name + '（' + String(formationId).trim() + '編成）';
        }
        return window.TrainIcons.resolveVehicleArtwork(formationIdentity) || '';
      }
      return window.TrainIcons.resolveVehicleArtwork(name) || '';
    }
    return '';
  }

  // ============================================================
  // Main decision: one source-priority arbitration path.
  // ============================================================
  function resolve(ctx) {
    ctx = ctx || {};
    var assignmentOperator = normOp(ctx.assignmentOperator || ctx.operationOperator || '');

    // 1) Collect only already-admitted evidence from the upstream canonical
    // resolver/runtime feed. This module arbitrates source priority; it does not
    // independently infer identity from line/operator defaults.
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
    addFrom(ctx.realtimeVehicleType, 'realtime');
    addFrom(ctx.realtimeDerivedVehicleType, 'realtime-derived');
    addFrom(ctx.timetableVehicleType, 'timetable');

    // 2) Uniqueness decision. There is no source-priority fallback:
    // every admitted explicit source must converge on exactly one identity.
    var chosen = '';
    var chosenSrc = '';
    var _timetableCands = splitCandidates(ctx.timetableVehicleType);
    var _derivedCands = splitCandidates(ctx.realtimeDerivedVehicleType);
    var _realtimeCands = splitCandidates(ctx.realtimeVehicleType);
    var _admitted = [];
    [
      { source:'realtime', values:_realtimeCands },
      { source:'realtime-derived', values:_derivedCands },
      { source:'timetable', values:_timetableCands }
    ].forEach(function(group) {
      group.values.forEach(function(value) {
        _admitted.push({ source:group.source, value:value });
      });
    });
    var _uniqueIdentities = [];
    _admitted.forEach(function(item) {
      if (_uniqueIdentities.indexOf(item.value) < 0) _uniqueIdentities.push(item.value);
    });
    if (_uniqueIdentities.length === 1) {
      chosen = _uniqueIdentities[0];
      var _chosenSources = [];
      _admitted.forEach(function(item) {
        if (item.value === chosen && _chosenSources.indexOf(item.source) < 0) _chosenSources.push(item.source);
      });
      chosenSrc = _chosenSources.join('+');
    }

    var confidence = chosen ? 'high' : 'none';

    // 4) Artwork is a strict projection of the already-exact vehicle identity.
    // Missing artwork stays missing; never substitute another candidate, line,
    // operator, retired replacement, or rule-derived vehicle.
    var _formationCandidates = Array.isArray(ctx.formationCandidates)
      ? ctx.formationCandidates.map(function(v){ return String(v || '').trim(); }).filter(Boolean)
      : [];
    _formationCandidates = _formationCandidates.filter(function(v,i,a){ return a.indexOf(v) === i; });
    var _formationId = String(ctx.formationId || '').trim();
    var _formationConstrained = _formationCandidates.length > 0 || !!_formationId;
    var _formationUnique = _formationCandidates.length === 1
      && !!_formationId
      && _formationCandidates[0] === _formationId;
    var iconPath = '';
    if (chosen) {
      if (_formationConstrained) {
        // Formation evidence is authoritative only when both fields agree on one value.
        // Ambiguous, missing, or contradictory formation evidence blocks artwork entirely.
        iconPath = _formationUnique ? resolveArtworkForIdentity(chosen, _formationId) : '';
      } else {
        iconPath = resolveArtworkForIdentity(chosen, '');
      }
    }

    // Display-name normalization is allowed only after identity is exact.

    // Display normalization is presentation-only and runs after EXACT identity.
    if (chosen && iconPath && window.TrainIcons && typeof window.TrainIcons.resolveVehicleDisplayName === 'function') {
      var _dispSrc = chosen || (orderArr.length ? orderArr.join(' / ') : '');
      var _disp = window.TrainIcons.resolveVehicleDisplayName(_dispSrc);
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
      identityReason = 'unique-converged-vehicle-evidence';
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
      candidates: effectiveCandidates,               // admitted evidence candidates
      allCandidates: orderArr,                        // admitted evidence pool for diagnostics
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
    var icon = resolveArtworkForIdentity(a.vehicleName, a.formationId);
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
    version: '4.3.1102',
    resolve: resolve,
    getName: getName,
    getIconPath: getIconPath,
    registerFormationEvidence: registerFormationEvidence,
    resolveFormationEvidence: resolveFormationEvidence,
    clearFormationEvidenceOtherDates: clearFormationEvidenceOtherDates,
  };

  console.debug('[TrainVehicle] v4.3.1102 initialized（canonical EXACT/NARROWED/UNKNOWN vehicle identity contract）');
})();
