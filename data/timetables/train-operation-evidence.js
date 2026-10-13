/*
 * Pixel Tetsudo - Train operation evidence registry
 * v4.3.1101
 *
 * Evidence is ranked by traceability, not by "official vs fan" alone.
 * A  direct run evidence: realtime owner/vehicle or dated formation assignment
 * B  official structural evidence: compatibility, fleet/formation constraints
 * C  curated enthusiast operation/formation database with dated, auditable rows
 * D  isolated observation/social/forum lead; discovery only, never decisive alone
 */
(function() {
  "use strict";

  var providers = window.TRAIN_OPERATION_EVIDENCE_PROVIDERS ||
    (window.TRAIN_OPERATION_EVIDENCE_PROVIDERS = []);
  var VALID_GRADES = { A:true, B:true, C:true, D:true };

  function normalizeEvidence(provider, rec) {
    if (!provider || !rec) return null;
    var grade = String(rec.grade || provider.grade || '').toUpperCase();
    if (!VALID_GRADES[grade]) return null;
    var sourceUrl = rec.sourceUrl || provider.sourceUrl || '';
    var observedDate = rec.observedDate || rec.serviceDate || '';
    var provenance = rec.provenance || provider.provenance || '';
    return {
      operator: rec.operator || '',
      vehicleType: rec.vehicleType || '',
      vehicleCandidates: Array.isArray(rec.vehicleCandidates) ? rec.vehicleCandidates.slice() : [],
      formationId: rec.formationId || '',
      operationCode: rec.operationCode || '',
      grade: grade,
      sourceUrl: sourceUrl,
      provenance: provenance,
      observedDate: observedDate,
      providerId: provider.id,
      evidenceRole: rec.evidenceRole || '',
      // A/C run-level evidence may decide a dated assignment. B is structural
      // constraint only. D is a lead and must never decide identity by itself.
      decisive: (grade === 'A' || grade === 'C') && !!observedDate && !!sourceUrl
    };
  }

  function normalizeOperationCode(trainNumber, ctx) {
    ctx = ctx || {};
    var raw = String(trainNumber || "").toUpperCase().trim();
    // Tozai public train numbers preserve the working suffix in their final
    // two digits + owner letter: 507K -> 07K, 603K -> 03K, 655S -> 55S,
    // A650T -> 50T. Resolve this network form before the generic explicit form.
    if (/Tozai|ChuoSobu|ToyoRapid|東西|中央.*総武|東葉/i.test([ctx.lineId,ctx.railway].join("|"))) {
      var tz = raw.match(/(?:^|[^0-9A-Z])(?:A|B)?\d*(\d{2})([KST])(?:R)?$/);
      if (tz) return tz[1] + tz[2];
    }
    // Explicit working-number forms are lossless and safe across through networks.
    // Examples: 03K, 50T, 02S, 91G, A1291G, B691G.
    var explicit = raw.match(/(?:^|[^0-9A-Z])(?:A|B)?(\d{1,4})([KSMTGE])$/);
    if (explicit) {
      var digits = explicit[1];
      // A1291G/B691G encode the working number in the final two digits.
      if (/^[AB]/.test(raw) && digits.length >= 3) digits = digits.slice(-2);
      return String(parseInt(digits, 10)).padStart(2, "0") + explicit[2];
    }
    return "";
  }

  // SQL evidence-domain aliases are the only cross-line identity aliases.
  // Normalize spelling but never infer a vehicle from a train/operation number.
  function _evidenceNetworkToken(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  }
  let networkAliasSource = null;
  let networkAliasEdges = Object.create(null);
  let networkMatchesCache = Object.create(null);
  function _evidenceNetworkMatches(networkKey, ctx) {
    ctx = ctx || {};
    const key = _evidenceNetworkToken(networkKey);
    if (!key) return false;
    const aliases = window.VEHICLE_NETWORK_ALIASES;
    if (aliases !== networkAliasSource) {
      networkAliasSource = aliases;
      networkAliasEdges = Object.create(null);
      networkMatchesCache = Object.create(null);
      (Array.isArray(aliases) ? aliases : []).forEach(function(row) {
        if (!row || (row.alias_scope !== 'evidence_domain' && row.alias_scope !== 'exact')) return;
        const canonical = _evidenceNetworkToken(row.canonical_network_key);
        const alias = _evidenceNetworkToken(row.alias_key);
        if (canonical && alias) (networkAliasEdges[canonical] || (networkAliasEdges[canonical] = [])).push(alias);
      });
    }
    let accepted = networkMatchesCache[key];
    if (!accepted) {
      accepted = Object.create(null);
      accepted[key] = true;
      const pending = [key];
      for (let i = 0; i < pending.length; i++) {
        (networkAliasEdges[pending[i]] || []).forEach(function(alias) {
          if (!accepted[alias]) { accepted[alias] = true; pending.push(alias); }
        });
      }
      networkMatchesCache[key] = accepted;
    }
    return [ctx.lineId, ctx.railway].some(function(raw) {
      if (accepted[_evidenceNetworkToken(raw)]) return true;
      // Parse the ODPT railway namespace; arbitrary suffixes are not identities.
      const railway = String(raw || '').match(/^odpt\.Railway:[^.]+\.(.+)$/);
      return !!(railway && accepted[_evidenceNetworkToken(railway[1])]);
    });
  }

  function register(provider) {
    if (!provider || !provider.id || typeof provider.resolveEvidence !== 'function') return false;
    for (var i = 0; i < providers.length; i++) {
      if (providers[i] && providers[i].id === provider.id) return false;
    }
    providers.push(provider);
    return true;
  }

  // Canonical data provider. One provider consumes all line records from the
  // generated snapshot; line-specific evidence belongs in data, not JS.
  function registerCanonicalSnapshotProvider() {
    var records = window.VEHICLE_OPERATION_EVIDENCE || [];
    if (!Array.isArray(records) || !records.length) return false;
    return register({
      id: "canonical-vehicle-operation-evidence",
      grade: "C",
      resolveEvidence: function(trainNumber, ctx) {
        ctx = ctx || {};
        var d = String(ctx.serviceDate || "").slice(0, 10);
        var n = String(trainNumber || "");
        var matches = [];
        for (var i=0;i<records.length;i++) {
          var r=records[i];
          if (!r || r.validDate !== d) continue;
          if (!_evidenceNetworkMatches(r.networkKey, ctx)) continue;
          var trainMatch = r.trainNumbers && r.trainNumbers.indexOf(n) >= 0;
          var opMatch = !ctx.requireTrainNumberMatch && ctx.operationCode && String(ctx.operationCode) === String(r.operationCode);
          if (trainMatch || opMatch) matches.push(r);
        }
        if (!matches.length) return null;

        // Prefer an explicit time segment when the caller supplies service time.
        var t = String(ctx.serviceTime || ctx.currentTime || "").slice(0,5);
        if (t) {
          var hasTimedSegments = matches.some(function(r) {
            return !!(String(r.validFromTime || "").slice(0,5) || String(r.validToTime || "").slice(0,5));
          });
          var timed = matches.filter(function(r) {
            var from = String(r.validFromTime || "").slice(0,5);
            var to = String(r.validToTime || "").slice(0,5);
            if (!from && !to) return false;
            return (!from || t >= from) && (!to || t < to);
          });
          // Once an operation/date is segmented, service time is part of identity.
          // A gap or overlap must remain unresolved; never fall back to an
          // all-day same-model collapse.
          if (hasTimedSegments) {
            if (timed.length !== 1) return null;
            matches = timed;
          }
        }

        // Duplicate evidence for the same identity is safe to collapse. Different
        // identities for the same date/operation are ambiguous unless a segment
        // or exact train number uniquely resolved them. Never return first match.
        var identities = {};
        matches.forEach(function(r) {
          var formations = Array.isArray(r.formationIds) ? r.formationIds.join("+") : (r.formationId || "");
          identities[(r.vehicleType || "") + "|" + formations] = true;
        });
        if (Object.keys(identities).length !== 1) return null;

        var hit = matches[0];
        return {operator:hit.operator,vehicleType:hit.vehicleType,
          formationId:hit.formationId || (Array.isArray(hit.formationIds) ? hit.formationIds.join(" / ") : ""),
          operationCode:hit.operationCode,grade:hit.grade||"C",sourceUrl:hit.sourceUrl||"",
          provenance:"canonical vehicle operation evidence snapshot",observedDate:d,
          evidenceRole:hit.evidenceRole||""};
      }
    });
  }

  registerCanonicalSnapshotProvider();

  // Canonical dated evidence provider. This stays inside the existing timetable
  // evidence channel; it is not a third vehicle source. Exact train-number
  // evidence outranks operation-code evidence when both are present.
  function registerCanonicalDatedProvider() {
    var records = window.VEHICLE_DATED_EVIDENCE || [];
    if (!Array.isArray(records) || !records.length) return false;
    return register({
      id: "canonical-dated-vehicle-evidence",
      grade: "C",
      resolveEvidence: function(trainNumber, ctx) {
        ctx = ctx || {};
        var d = String(ctx.serviceDate || "").slice(0,10);
        if (!d) return null;
        var n = String(trainNumber || "");
        var op = String(ctx.operationCode || normalizeOperationCode(n,ctx) || "");
        var exactTrain = [], operation = [];
        for (var i=0;i<records.length;i++) {
          var r=records[i];
          if (!r || r.validDate !== d || !_evidenceNetworkMatches(r.networkKey, ctx)) continue;
          if (r.trainNumber && String(r.trainNumber) === n) exactTrain.push(r);
          else if (!ctx.requireTrainNumberMatch && r.operationCode && op && String(r.operationCode) === op) operation.push(r);
        }
        var matches = exactTrain.length ? exactTrain : operation;
        if (!matches.length) return null;
        var identities = {};
        matches.forEach(function(r) {
          identities[(r.vehicleType||"")+"|"+(Array.isArray(r.formationIds)?r.formationIds.join("+"):"")] = true;
        });
        if (Object.keys(identities).length !== 1) return null;
        var hit=matches[0];
        return {operator:hit.operator,vehicleType:hit.vehicleType,
          formationId:Array.isArray(hit.formationIds)?hit.formationIds.join(" / "):"",
          operationCode:hit.operationCode||op,grade:hit.grade||"C",sourceUrl:hit.sourceUrl||"",
          provenance:"canonical dated vehicle evidence snapshot",observedDate:hit.observedDate||d};
      }
    });
  }

  registerCanonicalDatedProvider();

  function familyPatternMatches(pattern, operationCode) {
    pattern=String(pattern||"").trim(); operationCode=String(operationCode||"").trim().toUpperCase();
    if (!pattern || !operationCode) return false;
    if (pattern === "*") return true;
    if (/^\*[A-Z]$/.test(pattern)) return operationCode.endsWith(pattern.slice(1));
    if (/^[A-Z]\*$/.test(pattern)) return operationCode.startsWith(pattern.slice(0,1));
    if (pattern.indexOf(",")>=0) return pattern.split(",").map(function(x){return x.trim().toUpperCase();}).indexOf(operationCode)>=0;
    var m=pattern.match(/^([A-Z]?)(\d+)([A-Z]?)-([A-Z]?)(\d+)([A-Z]?)(?:\s+(odd|even))?$/i);
    if (m) {
      var om=operationCode.match(/^([A-Z]?)(\d+)([A-Z]?)$/);
      if (!om) return false;
      var prefix=(m[1]||m[4]||"").toUpperCase(), suffix=(m[3]||m[6]||"").toUpperCase();
      if (prefix && om[1]!==prefix) return false;
      if (suffix && om[3]!==suffix) return false;
      var n=parseInt(om[2],10), lo=parseInt(m[2],10), hi=parseInt(m[5],10);
      if (n<lo || n>hi) return false;
      if (m[7]==="odd" && n%2!==1) return false;
      if (m[7]==="even" && n%2!==0) return false;
      return true;
    }
    return pattern.toUpperCase()===operationCode;
  }

  function registerCanonicalFamilyRuleProvider() {
    var rules=window.VEHICLE_FAMILY_RULES||[];
    if (!Array.isArray(rules)||!rules.length) return false;
    return register({
      id:"canonical-vehicle-family-rules", grade:"B",
      resolveEvidence:function(trainNumber,ctx) {
        ctx=ctx||{}; var d=String(ctx.serviceDate||"").slice(0,10);
        var op=String(ctx.operationCode||normalizeOperationCode(trainNumber,ctx)||"");
        if (!d) return null;
        var cal=String(ctx.calendarType||"").toLowerCase();
        var matches=rules.filter(function(r){
          if (!_evidenceNetworkMatches(r.networkKey, ctx)) return false;
          if (r.effectiveFrom && d<r.effectiveFrom) return false;
          if (r.effectiveTo && d>r.effectiveTo) return false;
          if (r.calendarType && (!cal || String(r.calendarType).toLowerCase()!==cal)) return false;
          return r.codePattern === "*" ? true : (!!op && familyPatternMatches(r.codePattern,op));
        });
        if (!matches.length) return null;
        var exact={}; var candidates={}; var operators={};
        matches.forEach(function(r){
          if (r.operator) operators[r.operator]=true;
          if (r.exactVehicleType) exact[r.exactVehicleType]=r;
          (r.vehicleCandidates||[]).forEach(function(v){if(v)candidates[v]=true;});
        });
        var exactKeys=Object.keys(exact), candidateKeys=Object.keys(candidates), operatorKeys=Object.keys(operators);
        if (exactKeys.length===1) {
          var hit=exact[exactKeys[0]];
          return {operator:operatorKeys.length===1?operatorKeys[0]:"",vehicleType:exactKeys[0],
            vehicleCandidates:[exactKeys[0]],operationCode:op,grade:hit.grade||"B",sourceUrl:hit.sourceUrl||"",
            provenance:"canonical operation family exact rule",observedDate:d};
        }
        if (exactKeys.length>1) return null;
        if (candidateKeys.length) {
          var hit2=matches.find(function(r){return (r.vehicleCandidates||[]).length;})||matches[0];
          return {operator:operatorKeys.length===1?operatorKeys[0]:"",vehicleType:"",
            vehicleCandidates:candidateKeys,operationCode:op,grade:hit2.grade||"B",sourceUrl:hit2.sourceUrl||"",
            provenance:"canonical operation family narrowed rule",observedDate:d};
        }
        // Ownership-only rules may constrain operator but never invent a model.
        var own=matches[0];
        return {operator:operatorKeys.length===1?operatorKeys[0]:"",vehicleType:"",vehicleCandidates:[],
          operationCode:op,grade:own.grade||"B",sourceUrl:own.sourceUrl||"",
          provenance:"canonical operation family ownership rule",observedDate:d};
      }
    });
  }

  registerCanonicalFamilyRuleProvider();


  // Timetable reference vehicle by exact published train number, railway,
  // service calendar and effective timetable revision. It is not a claim of
  // today's physical formation and must not infer any operation number.
  function registerCanonicalReferenceProvider() {
    var rules = window.VEHICLE_REFERENCE_RULES || [];
    if (!Array.isArray(rules) || !rules.length) return false;
    var byNumber = Object.create(null);
    rules.forEach(function(r) {
      if (!r || !r.trainNumber || !r.sourceUrl || !r.effectiveFrom) return;
      (byNumber[r.trainNumber] || (byNumber[r.trainNumber] = [])).push(r);
    });
    return register({
      id: "canonical-timetable-reference-vehicles", grade: "C",
      resolveEvidence: function(trainNumber, ctx) {
        ctx = ctx || {};
        var n = String(trainNumber || "").trim();
        var day = String(ctx.serviceDate || "").slice(0, 10);
        var cal = String(ctx.calendarType || "").toLowerCase();
        if (!n || !day || !cal) return null;
        var hits = (byNumber[n] || []).filter(function(r) {
          return r.trainNumber === n &&
            r.calendarType === cal &&
            (!r.effectiveFrom || day >= r.effectiveFrom) &&
            (!r.effectiveTo || day <= r.effectiveTo) &&
            _evidenceNetworkMatches(r.networkKey, ctx);
        });
        if (!hits.length) return null;
        var models = {};
        hits.forEach(function(r) { if (r.vehicleType) models[r.vehicleType] = true; });
        if (Object.keys(models).length !== 1) return null;
        var hit = hits[0];
        return {
          operator: hit.operator || "", vehicleType: Object.keys(models)[0],
          grade: hit.grade || "C", sourceUrl: hit.sourceUrl || "",
          observedDate: day, evidenceRole: "timetable-reference",
          provenance: "published timetable reference model (not live carset)"
        };
      }
    });
  }
  registerCanonicalReferenceProvider();

  // One evidence resolver for both realtime and timetable estimation. Live
  // rows may consume same-service-day dated train-number proof, but MUST NOT
  // borrow a physical carset merely from an operation code used by other runs.
  function resolveEvidence(trainNumber, ctx, mode) {
    mode = mode || "fallback";
    var familyHit = null;
    var referenceHit = null;
    var runHits = [];
    // The API/SQL provide the train number. Registered line-operation scripts
    // interpret its documented working code and supply the model evidence.
    // Keep one arbitration path; do not bypass it in DataFusion or the renderer.
    var inputCtx = ctx || {};
    var providerCtx = Object.assign({}, inputCtx, {
      operationCode: inputCtx.operationCode ||
        normalizeOperationCode(trainNumber, inputCtx)
    });
    if (mode === "realtime-derived") providerCtx.requireTrainNumberMatch = true;
    for (var i = 0; i < providers.length; i++) {
      var provider = providers[i];
      if (!provider) continue;
      var isFamily = provider.id === "canonical-vehicle-family-rules";
      var isReference = provider.id === "canonical-timetable-reference-vehicles";
      var isCanonicalRun = provider.id === "canonical-dated-vehicle-evidence" ||
        provider.id === "canonical-vehicle-operation-evidence";
      // Other already-registered line-specific scripts were previously skipped
      // even after register(provider). Admit their sourced evidence to the SAME
      // conflict/date/candidate checks, never as an icon/line-name fallback.
      var rec = normalizeEvidence(provider, provider.resolveEvidence(trainNumber, providerCtx));
      if (!rec) continue;
      if (!isFamily && !isReference && !isCanonicalRun &&
          (!rec.sourceUrl || !rec.observedDate)) continue;
      if (isFamily) familyHit = rec;
      else if (isReference) referenceHit = rec;
      else runHits.push(rec);
    }

    // Realtime never treats a bare working number as a physical carset proof.
    // Canonical dated providers above require the exact public train number,
    // current service date, unique model/formation, and traceable source.
    if (mode === "realtime-derived") {
      var liveIdentities = {};
      runHits.forEach(function(hit) {
        if (!hit.decisive || !hit.vehicleType) return;
        var formations = String(hit.formationId || "").split(/\s*\/\s*|\s*,\s*|\s*\|\s*/)
          .filter(Boolean).sort().join("|");
        liveIdentities[hit.vehicleType + "|" + formations] = hit;
      });
      var liveKeys = Object.keys(liveIdentities);
      // Same model with different physical formations is also ambiguous.
      if (liveKeys.length > 1) return null;
      if (liveKeys.length === 1) {
        var liveHit = liveIdentities[liveKeys[0]];
        var liveName = liveHit.vehicleType;
        if (familyHit &&
            ((familyHit.vehicleType && familyHit.vehicleType !== liveName) ||
             (familyHit.vehicleCandidates.length &&
              familyHit.vehicleCandidates.indexOf(liveName) < 0))) return null;
        return liveHit;
      }
      // A published train/calendar reference is a planned model, not a live
      // formation. Its provenance stays distinct in the downstream adapter.
      // Reject conflicting fleet constraints rather than interpreting the
      // planned reference as proof that a different vehicle is running live.
      if (referenceHit && familyHit && referenceHit.vehicleType &&
          ((familyHit.vehicleType && familyHit.vehicleType !== referenceHit.vehicleType) ||
           (familyHit.vehicleCandidates.length &&
            familyHit.vehicleCandidates.indexOf(referenceHit.vehicleType) < 0))) return null;
      return referenceHit || familyHit;
    }

    // A/C dated run evidence may decide identity, but all decisive providers
    // must agree before structural constraints are applied.
    var exact = {};
    runHits.forEach(function(h){
      if (h.decisive && h.vehicleType) exact[h.vehicleType] = h;
    });
    var exactKeys = Object.keys(exact);
    if (exactKeys.length > 1) return null;

    var allowedVehicles = null;
    if (familyHit) {
      var familyVehicles = [];
      if (familyHit.vehicleType) familyVehicles.push(familyHit.vehicleType);
      (familyHit.vehicleCandidates || []).forEach(function(v){
        if (v && familyVehicles.indexOf(v) < 0) familyVehicles.push(v);
      });
      if (familyVehicles.length) allowedVehicles = familyVehicles;
    }

    if (exactKeys.length === 1) {
      var exactHit = exact[exactKeys[0]];
      // Structural/family evidence constrains fallback identity. A dated exact
      // outside the compatible family is a conflict, never a reason to override
      // the structural rule.
      if (allowedVehicles && allowedVehicles.indexOf(exactKeys[0]) < 0) return null;
      return exactHit;
    }

    // Exact dated operating observations outrank a planned reference, while a
    // matching reference may fill missing vehicle identity on any destination.
    if (referenceHit) return referenceHit;

    // One documented Grade-A, date-valid single-fleet fact is decisive for
    // timetable estimation just as it is for realtime-derived identity.
    // This is NOT a general line/operator default: B/C family assignments
    // remain constraints, and any conflicting dated run candidate blocks it.
    if (familyHit && familyHit.grade === "A" && familyHit.decisive &&
        familyHit.vehicleType && familyHit.sourceUrl &&
        allowedVehicles && allowedVehicles.length === 1) {
      var incompatible = runHits.some(function(h) {
        if (h.vehicleType && h.vehicleType !== familyHit.vehicleType) return true;
        return (h.vehicleCandidates || []).some(function(v) {
          return v && v !== familyHit.vehicleType;
        });
      });
      if (!incompatible) return familyHit;
    }

    // No decisive run-level exact: preserve only candidates compatible with the
    // structural family. Candidate evidence must never manufacture an EXACT.
    var candidates = {};
    runHits.forEach(function(h){
      (h.vehicleCandidates || []).forEach(function(v){
        if (v && (!allowedVehicles || allowedVehicles.indexOf(v) >= 0)) candidates[v] = true;
      });
    });
    var candidateKeys = Object.keys(candidates);
    if (!candidateKeys.length) {
      // B/C structural evidence remains a constraint in fallback mode, never
      // a standalone run assignment (including ownership-only family rules).
      return null;
    }
    var first = runHits[0] || familyHit;
    if (!first) return null;
    first.vehicleType = "";
    first.vehicleCandidates = candidateKeys;
    return first;
  }


  window.TrainOperationEvidence = {
    matchesNetwork: _evidenceNetworkMatches,
    register: register,
    normalizeEvidence: normalizeEvidence,
    normalizeOperationCode: normalizeOperationCode,
    resolveEvidence: resolveEvidence,
    providers: providers,
    policy: {
      requireTraceableSourceForDecisiveEvidence: true,
      allowCuratedEnthusiastRunEvidence: true,
      structuralEvidenceIsConstraintOnly: true,
      isolatedObservationIsNonDecisive: true,
      forbidLineDefault: true,
      forbidNumberRangeGuess: true,
      forbidPrefixGuessWithoutProviderEvidence: true,
      forbidHashAssignment: true
    }
  };

  console.debug('[TrainOperationEvidence] v4.3.1094 initialized (graded provenance model)');
})();
