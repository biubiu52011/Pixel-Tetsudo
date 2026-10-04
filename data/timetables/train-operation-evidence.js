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
        var line = [ctx.lineId, ctx.railway, ctx.operator].join("|");
        var n = String(trainNumber || "");
        var matches = [];
        for (var i=0;i<records.length;i++) {
          var r=records[i];
          if (!r || r.validDate !== d) continue;
          if (line.indexOf(r.networkKey) < 0) continue;
          var trainMatch = r.trainNumbers && r.trainNumbers.indexOf(n) >= 0;
          var opMatch = ctx.operationCode && String(ctx.operationCode) === String(r.operationCode);
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
        var line = [ctx.lineId,ctx.railway,ctx.operator].join("|");
        var n = String(trainNumber || "");
        var op = String(ctx.operationCode || normalizeOperationCode(n,ctx) || "");
        var exactTrain = [], operation = [];
        for (var i=0;i<records.length;i++) {
          var r=records[i];
          if (!r || r.validDate !== d || line.indexOf(r.networkKey) < 0) continue;
          if (r.trainNumber && String(r.trainNumber) === n) exactTrain.push(r);
          else if (r.operationCode && op && String(r.operationCode) === op) operation.push(r);
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
        var line=[ctx.lineId,ctx.railway,ctx.operator].join("|");
        var op=String(ctx.operationCode||normalizeOperationCode(trainNumber,ctx)||"");
        if (!d) return null;
        var cal=String(ctx.calendarType||"").toLowerCase();
        var matches=rules.filter(function(r){
          if (line.indexOf(r.networkKey)<0) return false;
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

  // Single evidence resolver. Realtime-derived mode intentionally admits only
  // structural/family providers; fallback mode uses the existing canonical
  // providers in priority order. No parallel realtime resolver is maintained.
  function resolveEvidence(trainNumber, ctx, mode) {
    mode = mode || "fallback";
    var familyHit = null;
    var runHits = [];
    for (var i = 0; i < providers.length; i++) {
      var provider = providers[i];
      if (!provider) continue;
      var isFamily = provider.id === "canonical-vehicle-family-rules";
      var isRunEvidence = provider.id === "canonical-dated-vehicle-evidence" ||
        provider.id === "canonical-vehicle-operation-evidence";
      if (!isFamily && (mode === "realtime-derived" || !isRunEvidence)) continue;
      var rec = normalizeEvidence(provider, provider.resolveEvidence(trainNumber, ctx || {}));
      if (!rec) continue;
      if (isFamily) familyHit = rec;
      else runHits.push(rec);
    }

    // Realtime-derived identity is allowed to use the canonical family rule
    // directly. Fallback treats the same B-grade rule only as a constraint.
    if (mode === "realtime-derived") return familyHit;

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
      // Structural evidence remains a constraint in fallback mode, never a
      // standalone run assignment (including ownership-only family rules).
      return null;
    }
    var first = runHits[0] || familyHit;
    if (!first) return null;
    first.vehicleType = "";
    first.vehicleCandidates = candidateKeys;
    return first;
  }


  window.TrainOperationEvidence = {
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
