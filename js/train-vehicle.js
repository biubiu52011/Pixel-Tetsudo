/* ODPT / SQL train number -> line providers -> graded evidence -> vehicle -> PNG.
 * TrainOperationEvidence is the evidence API of this single runtime, retained
 * for existing sourced line-provider registrations. It is not a second script.
 */
(function(){
  if(window.TrainVehicle&&window.TrainVehicle.version==='4.3.1242')return;
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
  var evidenceRevision = 0;
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
    evidenceRevision++;
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


  // One evidence resolver for both realtime and timetable estimation. Live
  // rows may consume same-service-day dated train-number proof, but MUST NOT
  // borrow a physical carset merely from an operation code used by other runs.
  // Bind canonical sources at use time: the data snapshot may arrive after
  // this module or be replaced while the page remains open. Custom line
  // providers retain their registrations; only changed canonical bindings reset.
  var canonicalBindings = [{key:'VEHICLE_OPERATION_EVIDENCE',id:'canonical-vehicle-operation-evidence',register:registerCanonicalSnapshotProvider,source:null},
    {key:'VEHICLE_DATED_EVIDENCE',id:'canonical-dated-vehicle-evidence',register:registerCanonicalDatedProvider,source:null},
    {key:'VEHICLE_FAMILY_RULES',id:'canonical-vehicle-family-rules',register:registerCanonicalFamilyRuleProvider,source:null},
    {key:'VEHICLE_REFERENCE_RULES',id:'canonical-timetable-reference-vehicles',register:registerCanonicalReferenceProvider,source:null}];
  function ensureCanonicalProviders() {
    canonicalBindings.forEach(function(binding) {
      var source=window[binding.key]||null;
      if(source===binding.source)return;
      binding.source=source;
      evidenceRevision++;
      for(var i=providers.length-1;i>=0;i--)if(providers[i].id===binding.id)providers.splice(i,1);
      binding.register();
    });
  }
  ensureCanonicalProviders();

  function resolveEvidence(trainNumber, ctx, mode) {
    ensureCanonicalProviders();
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
    if (mode === "realtime-derived") {
      providerCtx = Object.assign({}, providerCtx, { requireTrainNumberMatch: true });
    }
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

    if(mode==='planned')return referenceHit||familyHit;

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
    getRevision: function(){ensureCanonicalProviders();return evidenceRevision;},
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

  console.debug('[TrainVehicle] evidence registry ready (merged runtime)');
})();

/* Pixel Tetsudo — unified vehicle identity + PNG artwork runtime.
 * Position sources remain independent; artwork resolution has one authority.
 * Unknown models and failed artwork use a neutral location marker, never
 * a generated SVG vehicle or another model's PNG.
 */
(function() {
  "use strict";

var CANONICAL_VEHICLES = {
  "jr-e233-1000": {
    displayName:"E233系1000番台", iconName:"E233系1000番台",
    asset:"../images/列车/JR東日本/JR東日本_E233系_1000番台.png",
    aliases:["JR東日本E233系1000番台","JR E233系1000番台"]
  },
  "jr-e233-6000": {
    displayName:"E233系6000番台", iconName:"E233系6000番台",
    asset:"../images/列车/JR東日本/JR東日本_E233系_6000番台.png",
    aliases:["JR東日本E233系6000番台","JR E233系6000番台"]
  },
  "jr-e131-500": {
    displayName:"E131系500番台", iconName:"E131系500番台",
    asset:"../images/列车/JR東日本/JR東日本_E131系_500番台.png",
    aliases:["JR東日本E131系500番台","JR E131系500番台"]
  },
  "jr-e131-800": {
    displayName:"E131系800番台", iconName:"E131系800番台",
    asset:"../images/列车/JR東日本/JR東日本_E131系_800番台.png",
    aliases:["JR東日本E131系800番台","JR E131系800番台"]
  },
  "jr-e131-1000": {
    displayName:"E131系1000番台", iconName:"E131系1000番台",
    asset:"../images/列车/JR東日本/JR東日本_E131系_1000番台.png",
    aliases:["JR東日本E131系1000番台","JR E131系1000番台"]
  },
  "metro-2000": {
    displayName:"東京メトロ2000系", iconName:"東京メトロ2000系",
    asset:"../images/列车/東京メトロ/東京メトロ_2000系.png",
    aliases:["東京メトロ 2000系"]
  },
  "metro-1000": {
    displayName:"東京メトロ1000系", iconName:"東京メトロ1000系",
    asset:"../images/列车/東京メトロ/東京メトロ_1000系.png",
    aliases:["東京メトロ 1000系"]
  },
  "jr-e353": {
    displayName:"E353系", iconName:"E353系",
    asset:"../images/列车/JR東日本/JR東日本_E353系.png",
    aliases:["JR東日本E353系","JR E353系","E353系（あずさ・かいじ）"]
  },
  // JR East standard Chuo Rapid model; no livery/carset/formation inference.
  "jr-e233-0": {
    displayName: "E233系0番台", iconName: "E233系0番台",
    asset: "../images/列车/JR東日本/JR東日本_E233系_0番台.png",
    aliases: ["JR東日本E233系0番台", "JR E233系0番台"]
  },
  // Official identity: https://www.tokyometro.jp/corporate/enterprise/passenger_rail/cars/working/chiyoda_05/index.html
  "metro-05-chiyoda-shuttle": {
    displayName:"東京メトロ05系（千代田支線）",iconName:"東京メトロ05系（千代田支線）",
    asset:"../images/列车/東京メトロ/東京メトロ_05系_区間列車車両.png",
    aliases:["東京メトロ05系（区間列車車両）"]
  },
  "new-shuttle-2000-01": { displayName: "埼玉新都市交通2000系（01編成）", iconName: "埼玉新都市交通2000系（01編成）", asset: "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_01編成_レッドパープル.png", aliases: ["2000系（01編成）","埼玉新都市交通2000系（01編成）"] },
  "new-shuttle-2000-02": { displayName: "埼玉新都市交通2000系（02編成）", iconName: "埼玉新都市交通2000系（02編成）", asset: "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_02編成_オレンジ.png", aliases: ["2000系（02編成）","埼玉新都市交通2000系（02編成）"] },
  "new-shuttle-2000-03": { displayName: "埼玉新都市交通2000系（03編成）", iconName: "埼玉新都市交通2000系（03編成）", asset: "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_03編成_グリーン.png", aliases: ["2000系（03編成）","埼玉新都市交通2000系（03編成）"] },
  "new-shuttle-2000-04": { displayName: "埼玉新都市交通2000系（04編成）", iconName: "埼玉新都市交通2000系（04編成）", asset: "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_04編成_イエロー.png", aliases: ["2000系（04編成）","埼玉新都市交通2000系（04編成）"] },
  "new-shuttle-2000-05": { displayName: "埼玉新都市交通2000系（05編成）", iconName: "埼玉新都市交通2000系（05編成）", asset: "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_05編成_ブルー.png", aliases: ["2000系（05編成）","埼玉新都市交通2000系（05編成）"] },
  "new-shuttle-2000-06": { displayName: "埼玉新都市交通2000系（06編成）", iconName: "埼玉新都市交通2000系（06編成）", asset: "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_06編成_レッド.png", aliases: ["2000系（06編成）","埼玉新都市交通2000系（06編成）"] },
  "new-shuttle-2000-07": { displayName: "埼玉新都市交通2000系（07編成）", iconName: "埼玉新都市交通2000系（07編成）", asset: "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_07編成_さくら色.png", aliases: ["2000系（07編成）","埼玉新都市交通2000系（07編成）"] },

  "keikyu-1500": { displayName: "京急1500形", iconName: "京急1500形", asset: "../images/列车/京浜急行電鉄/京浜急行電鉄_1500形.png", aliases: ["京急1500形","京浜急行電鉄1500形"] },
  "keikyu-600": { displayName: "京急600形", iconName: "京急600形", asset: "../images/列车/京浜急行電鉄/京浜急行電鉄_600形.png", aliases: ["京急600形","京浜急行電鉄600形"] },
  "keisei-3000": { displayName: "京成3000形", iconName: "京成3000形", asset: "../images/列车/京成電鉄/京成電鉄_3000形.png", aliases: ["京成3000形","京成電鉄3000形"] },
  "keisei-3100": { displayName: "京成3100形", iconName: "京成3100形", asset: "../images/列车/京成電鉄/京成電鉄_3100形.png", aliases: ["京成3100形","京成電鉄3100形"] },
  "keisei-3400": { displayName: "京成3400形", iconName: "京成3400形", asset: "../images/列车/京成電鉄/京成電鉄_3400形.png", aliases: ["京成3400形","京成電鉄3400形"] },
  "keisei-3700": { displayName: "京成3700形", iconName: "京成3700形", asset: "../images/列车/京成電鉄/京成電鉄_3700形.png", aliases: ["京成3700形","京成電鉄3700形"] },
  "keio-5000": { displayName: "京王5000系", iconName: "京王5000系", asset: "../images/列车/京王電鉄/京王電鉄_5000系.png", aliases: ["京王5000系","京王電鉄5000系"] },
  "odakyu-4000": { displayName: "小田急4000形", iconName: "小田急4000形", asset: "../images/列车/小田急電鉄/小田急電鉄_4000形_標準色.png", aliases: ["小田急4000形","小田急電鉄4000形"] },
  "metro-16000": {
    displayName: "東京メトロ16000系", iconName: "東京メトロ16000系",
    asset: "../images/列车/東京メトロ/東京メトロ_16000系.png",
    aliases: ["東京メトロ 16000系"]
  },
  "metro-07-10": { displayName: "東京メトロ07系", iconName: "東京メトロ07系", asset: "../images/列车/東京メトロ/東京メトロ_07系.png", aliases: ["東京メトロ07系(10両)","東京メトロ07系"] },
  "metro-15000-10": { displayName: "東京メトロ15000系", iconName: "東京メトロ15000系", asset: "../images/列车/東京メトロ/東京メトロ_15000系.png", aliases: ["東京メトロ15000系(10両)","東京メトロ15000系"] },
  "tokyu-2020-10": { displayName: "東急2020系", iconName: "東急2020系", asset: "../images/列车/東急電鉄/東急電鉄_2020系.png", aliases: ["東急2020系(10両)","東急2020系"] },
  "tokyu-5080": { displayName: "東急5080系", iconName: "東急5080系", asset: "../images/列车/東急電鉄/東急電鉄_5080系.png", aliases: ["東急5080系"] },
  "tokyu-6020": { displayName: "東急6020系", iconName: "東急6020系", asset: "../images/列车/東急電鉄/東急電鉄_6020系.png", aliases: ["東急6020系(5両)","東急6020系(7両)","東急6020系"] },
  "tokyu-7000": { displayName: "東急7000系", iconName: "東急7000系", asset: "../images/列车/東急電鉄/東急電鉄_7000系.png", aliases: ["東急7000系"] },
  "tobu-50000-10": { displayName: "東武50000系", iconName: "東武50000系", asset: "../images/列车/東武鉄道/東武鉄道_50000型.png", aliases: ["東武50000系(10両)","東武50000系"] },
  "tobu-50050-10": { displayName: "東武50050系", iconName: "東武50050系", asset: "../images/列车/東武鉄道/東武鉄道_50050型.png", aliases: ["東武50050系(10両)","東武50050系"] },
  "tobu-70090": { displayName: "東武70090型", iconName: "東武70090型", asset: "../images/列车/東武鉄道/東武鉄道_70090型.png", aliases: ["東武70090型","東武70090系"] },
  "sotetsu-13000-8": { displayName: "相鉄13000系", iconName: "相鉄13000系", asset: "../images/列车/相模鉄道/相模鉄道_13000系_YOKOHAMA_NAVYBLUE.png", aliases: ["相鉄13000系(8両)","相鉄13000系"] },
  "sotetsu-20000-10": { displayName: "相鉄20000系", iconName: "相鉄20000系", asset: "../images/列车/相模鉄道/相模鉄道_20000系_YOKOHAMA_NAVYBLUE.png", aliases: ["相鉄20000系(10両)"] },
  "sotetsu-21000": { displayName: "相鉄21000系", iconName: "相鉄21000系", asset: "../images/列车/相模鉄道/相模鉄道_21000系.png", aliases: ["相鉄21000系", "相鉄21000系(8両)"] },

  "jr-east-209-500-keiyo": {
    displayName: "209系500番台（京葉線）",
    iconName: "209系500番台（京葉線）",
    asset: "../images/列车/JR東日本/JR東日本_209系_500番台_京葉線.png",
    aliases: ["209系500番台（京葉線）", "JR 209系500番台", "JR東日本209系500番台"]
  },
  "sotetsu-12000": {
    displayName: "相鉄12000系",
    iconName: "相鉄12000系",
    asset: "../images/列车/相模鉄道/相模鉄道_12000系_YOKOHAMA_NAVYBLUE.png",
    aliases: ["相模鉄道12000系", "相鉄12000系", "相鉄12000系(10両)"]
  },
  "odakyu-5000": {
    displayName: "小田急5000形",
    iconName: "小田急5000形",
    asset: "../images/列车/小田急電鉄/小田急電鉄_5000形_標準色.png",
    aliases: ["小田急5000形", "小田急電鉄5000形"]
  },
  "jr-east-e235-0-yamanote": {
    displayName: "E235系0番台（山手線）",
    iconName: "E235系山手線",
    asset: "../images/列车/JR東日本/JR東日本_E235系_0番台.png",
    aliases: ["E235系0番台（山手線）", "E235系山手線", "JR E235系0番台"]
  },
  "jr-east-e231-800-tozai-through": {
    displayName: "E231系800番台（東西線直通）",
    iconName: "E231系800番台（東西線直通）",
    asset: "../images/列车/JR東日本/JR東日本_E231系_800番台.png",
    aliases: ["E231系800番台（東西線直通）", "JR E231系800番台(10両)", "JR東日本E231系800番台"]
  },
  "toyo-rapid-2000-tozai-through": {
    displayName: "東葉高速2000系",
    iconName: "東葉高速鉄道2000系",
    asset: "../images/列车/東葉高速鉄道/東葉高速鉄道_2000系.png",
    aliases: ["東葉高速2000系", "東葉高速鉄道2000系", "東葉高速2000系(10両)"]
  },
  "jr-east-e233-2000-joban-local-chiyoda": {
    displayName: "E233系2000番台",
    iconName: "E233系2000番台",
    asset: "../images/列车/JR東日本/JR東日本_E233系_2000番台.png",
    aliases: ["E233系2000番台", "JR東日本E233系2000番台", "JR E233系2000番台"]
  },
  "jr-east-e531-joban-medium": {
    displayName: "E531系",
    iconName: "E531系",
    asset: "../images/列车/JR東日本/JR東日本_E531系.png",
    aliases: ["E531系"]
  },
  // JR East published Hitachi/Tokiwa model. Standard model artwork only;
  // a train number or planned model does not establish a special livery.
  // https://www.jreast.co.jp/train/express/hitachi_tokiwa.html
  "jr-east-e657-hitachi-tokiwa": {
    displayName: "E657系",
    iconName: "E657系",
    asset: "../images/列车/JR東日本/JR東日本_E657系.png",
    aliases: ["JR東日本E657系", "JR E657系"]
  },
  "jr-east-e231-0-joban-rapid": {
    displayName: "E231系0番台",
    iconName: "E231系0番台",
    asset: "../images/列车/JR東日本/JR東日本_E231系_0番台.png",
    aliases: ["E231系0番台"]
  },
  "jr-east-e231-0-joban-rapid-led": {
    displayName: "E231系0番台（常磐快速線・LED）",
    iconName: "E231系0番台（常磐快速線・LED）",
    asset: "../images/列车/JR東日本/JR東日本_E231系_0番台_常磐快速線.png",
    aliases: ["E231系0番台（常磐快速線・LED）"]
  },
  "jr-east-e233-7000-saikyo": {
    displayName: "E233系7000番台",
    iconName: "E233系7000番台",
    asset: "../images/列车/JR東日本/JR東日本_E233系_7000番台.png",
    aliases: ["E233系7000番台", "JR E233系7000番台", "JR東日本E233系7000番台"]
  },
  "twr-70-000-rinkai": {
    displayName: "東京臨海高速鉄道70-000形",
    iconName: "東京臨海高速鉄道70-000形",
    asset: "../images/列车/東京臨海高速鉄道/東京臨海高速鉄道_70-000形.png",
    aliases: ["東京臨海高速鉄道70-000形", "70-000形"]
  },
  "twr-71-000-rinkai": {
    displayName: "東京臨海高速鉄道71-000形",
    iconName: "東京臨海高速鉄道71-000形",
    asset: "../images/列车/東京臨海高速鉄道/東京臨海高速鉄道_71-000形.png",
    aliases: ["東京臨海高速鉄道71-000形", "71-000形"]
  },
  "jr-east-209-3500-hachiko-kawagoe": {
    displayName: "209系3500番台",
    iconName: "209系3500番台（八高・川越線）",
    asset: "../images/列车/JR東日本/JR東日本_209系_3500番台.png",
    aliases: ["209系3500番台", "209系3500番台（八高・川越線）"]
  },
  "jr-east-209-3000-hachiko-kawagoe": {
    displayName: "209系3000番台",
    iconName: "209系3000番台（八高・川越線）",
    asset: null,
    aliases: ["209系3000番台", "209系3000番台（八高・川越線）"]
  },
  "jr-east-209-3100-kawagoe": {
    displayName: "209系3100番台",
    iconName: "209系3100番台（川越線）",
    asset: null,
    aliases: ["209系3100番台", "209系3100番台（川越線）"]
  },
  "jr-east-209-2000-2100-boso-keiyo": {
    displayName: "209系2000番台 / 2100番台",
    iconName: "209系2000番台 / 2100番台",
    asset: "../images/列车/JR東日本/JR東日本_209系_2000・2100番台_房総地区.png",
    aliases: ["209系2000番台 / 2100番台"]
  },
  "jr-east-e233-5000-keiyo": {
    displayName: "E233系5000番台",
    iconName: "E233系5000番台",
    asset: "../images/列车/JR東日本/JR東日本_E233系5000番台.png",
    aliases: ["E233系5000番台", "JR E233系5000番台"]
  },
  "jr-east-e231-900-musashino": {
    displayName: "E231系900番台",
    iconName: "E231系900番台",
    asset: null,
    aliases: ["E231系900番台"]
  },
  "jr-east-e231-1000-shonan-shinjuku": {
    displayName: "E231系1000番台",
    iconName: "E231系1000番台",
    asset: "../images/列车/JR東日本/JR東日本_E231系_1000番台.png",
    aliases: ["E231系1000番台"]
  },
  "jr-east-e233-3000-shonan-shinjuku": {
    displayName: "E233系3000番台",
    iconName: "E233系3000番台",
    asset: "../images/列车/JR東日本/JR東日本_E233系3000番台.png",
    aliases: ["E233系3000番台"]
  },
  "jr-east-e257-2000-odoriko": {
    displayName: "E257系2000番台",
    iconName: "E257系2000番台",
    asset: "../images/列车/JR東日本/JR東日本_E257系_2000番台.png",
    aliases: ["E257系2000番台"]
  },
  "jr-east-e257-2500-odoriko-shonan": {
    displayName: "E257系2500番台",
    iconName: "E257系2500番台",
    asset: "../images/列车/JR東日本/JR東日本_E257系_2500番台.png",
    aliases: ["E257系2500番台"]
  },
  "jr-east-253-1000-nikko-kinugawa": {
    displayName: "253系（日光・きぬがわ）",
    iconName: "253系（日光・きぬがわ）",
    asset: "../images/列车/JR東日本/JR東日本_253系_1000番台.png",
    aliases: ["253系（日光・きぬがわ）", "E253系（日光・きぬがわ）"]
  }
};

/**
 * Tokyo Sakura Tram: historic Toei.Arakawa Train records sometimes used
 * physical four-digit CAR numbers, which can identify one of the 33 vehicles.
 * Actual ODPT Train feed verified 2026-10-13 returns ODPTnnnn trip identifiers
 * with NO car number or vehicleType; NEVER strip the prefix or interpret
 * ODPTnnnn digits as car/formation IDs. Those trains remain UNKNOWN until
 * another source proves the physical vehicle.
 *
 * Fleet 33 cars: https://www.kotsu.metro.tokyo.jp/about/service/toden.html
 * Vehicle/no. livery: https://2nd-train.net/formations/affiliation/216/荒川車両検修所/
 * 8501 was refurbished in April 2026; pixel artwork provided by the project owner.
 * https://www.kotsu.metro.tokyo.jp/pickup_information/news/toden/2026/tdn_p_2026041512633_h.html
 */
var TODEN_ARAKAWA_BY_CAR = Object.create(null);
[
  { cars: "7701 7702", name: "都電7700形（みどり）", asset: "../images/列车/都営地下鉄/都営地下鉄_7700形_みどり.png" },
  { cars: "7703 7704 7705", name: "都電7700形（あお）", asset: "../images/列车/都営地下鉄/都営地下鉄_7700形_あお.png" },
  { cars: "7706 7707 7708", name: "都電7700形（えんじ）", asset: "../images/列车/都営地下鉄/都営地下鉄_7700形_えんじ.png" },
  { cars: "8501", name: "都電8500形（8501号車・リニューアル）", asset: "../images/列车/都営地下鉄/都営地下鉄_8500形_8501号車_山吹色.png" },
  { cars: "8502 8503 8504 8505", name: "都電8500形", asset: "../images/列车/都営地下鉄/都営地下鉄_8500形.png" },
  { cars: "8801 8802 8803 8804 8805", name: "都電8800形（ローズレッド）", asset: "../images/列车/都営地下鉄/都営地下鉄_8800形_ローズレッド.png" },
  { cars: "8806 8807", name: "都電8800形（バイオレット）", asset: "../images/列车/都営地下鉄/都営地下鉄_8800形_バイオレット.png" },
  { cars: "8808 8809", name: "都電8800形（オレンジ）", asset: "../images/列车/都営地下鉄/都営地下鉄_8800形_オレンジ.png" },
  { cars: "8810", name: "都電8800形（イエロー）", asset: "../images/列车/都営地下鉄/都営地下鉄_8800形_イエロー.png" },
  { cars: "8901 8902", name: "都電8900形（オレンジ）", asset: "../images/列车/都営地下鉄/都営地下鉄_8900形_オレンジ.png" },
  { cars: "8903 8904", name: "都電8900形（ブルー）", asset: "../images/列车/都営地下鉄/都営地下鉄_8900形_ブルー.png" },
  { cars: "8905 8906", name: "都電8900形（ローズピンク）", asset: "../images/列车/都営地下鉄/都営地下鉄_8900形_ローズピンク.png" },
  { cars: "8907 8908", name: "都電8900形（イエロー）", asset: "../images/列车/都営地下鉄/都営地下鉄_8900形_イエロー.png" },
  { cars: "9001", name: "都電9000形（9001号車・赤色）", asset: "../images/列车/都営地下鉄/都営地下鉄_9000形_9001号車_赤色.png" },
  { cars: "9002", name: "都電9000形（9002号車・青色）", asset: "../images/列车/都営地下鉄/都営地下鉄_9000形_9002号車_青色.png" }
].forEach(function(group, i) {
  var id = 'toden-arakawa-car-group-' + i;
  CANONICAL_VEHICLES[id] = {
    displayName: group.name, iconName: group.name, asset: group.asset, aliases: []
  };
  group.cars.split(' ').forEach(function(car) {
    if (TODEN_ARAKAWA_BY_CAR[car]) throw new Error('Duplicate Toden car number: ' + car);
    TODEN_ARAKAWA_BY_CAR[car] = group.name;
  });
});

function resolveTodenArakawaLiveCar(ctx) {
  // Three scopes plus a literal physical car number are required.
  // Real ODPT Train data currently uses ODPTnnnn even for Arakawa; never
  // reinterpret those trip IDs as an actual car or map them to a model.
  if (ctx.lineId !== 'Arakawa' || normOp(ctx.operator) !== 'Toei' ||
      ctx.railway !== 'odpt.Railway:Toei.Arakawa') return null;
  var number = String(ctx.realtimeCarNumber || '').trim();
  if (!/^[0-9]{4}$/.test(number)) return null;
  var name = TODEN_ARAKAWA_BY_CAR[number];
  return name ? { number: number, name: name } : null;
}

// Exact source-supplied physical IDs only. Public train numbers are never car
// numbers here. Scope to the vehicle owner on through services, not the host line.
let rosterSource = null;
let rosterCars = Object.create(null);
let rosterFormations = Object.create(null);
function resolveRosterCar(ctx) {
  const number = String(ctx.realtimeCarNumber || ctx.vehicleCarNumber || '').trim();
  const formation = String(ctx.formationId || '').trim();
  const owner = normOp(ctx.trainOwner || ctx.assignmentOperator || ctx.operator);
  const day = String(ctx.serviceDate || '');
  if ((!number && !formation) || !owner || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const roster = window.VEHICLE_CARSETS;
  if (roster !== rosterSource) {
    rosterSource = roster;
    rosterCars = Object.create(null);
    rosterFormations = Object.create(null);
    (Array.isArray(roster) ? roster : []).forEach(function(r) {
      if (!r || !r.source_url || !r.vehicle_type || !r.carset_id ||
          !/^\d{4}-\d{2}-\d{2}$/.test(r.snapshot_date || '')) return;
      const rosterOwner = r.operator === '東京臨海高速鉄道' ? 'TWR' : normOp(r.operator);
      if (!rosterOwner) return;
      const formationKey = rosterOwner + '|' + r.carset_id;
      (rosterFormations[formationKey] || (rosterFormations[formationKey] = [])).push(r);
      (Array.isArray(r.cars) ? r.cars : []).forEach(function(car) {
        const carKey = rosterOwner + '|' + car;
        (rosterCars[carKey] || (rosterCars[carKey] = [])).push(r);
      });
    });
  }
  const scoped = (number ? rosterCars[owner + '|' + number] : rosterFormations[owner + '|' + formation]) || [];
  const dated = scoped.filter(function(r) { return r.snapshot_date <= day; });
  const latestDate = dated.reduce(function(latest,r) { return r.snapshot_date > latest ? r.snapshot_date : latest; },'');
  const hits = dated.filter(function(r) { return r.snapshot_date === latestDate; });
  // Resolve the newest applicable snapshot before checking active status.
  // Otherwise a retired unit can silently fall back to an older active roster.
  if (!hits.length || hits.some(function(r) { return r.status !== '運用中'; })) return null;
  const identities = Object.create(null);
  hits.forEach(function(r) {
    const canonical = resolveCanonicalVehicle(r.vehicle_type);
    identities[(canonical ? canonical.displayName : r.vehicle_type) + '|' + r.carset_id] = r;
  });
  const keys = Object.keys(identities);
  if (keys.length !== 1) return null;
  const hit = identities[keys[0]];
  return {number:number,name:hit.vehicle_type,formationId:hit.carset_id,sourceUrl:hit.source_url};
}

// Verified Toei vehicle identities and available owner-gallery artwork.
// Fleet sources: Tokyo Metropolitan Bureau of Transportation vehicle diagrams
// https://www.kotsu.metro.tokyo.jp/about/koukai/vehicle_outline/model_diagram/
// https://www.kotsu.metro.tokyo.jp/about/service/subway.html
// https://www.kotsu.metro.tokyo.jp/about/service/nippori_toneri.html
// Artwork identity is exact only; bare multi-appearance families carry no PNG.
[
  { id: "toei-fleet-0", displayName: "都営5500形", asset: "../images/列车/都営地下鉄/都営地下鉄_5500形.png", aliases: ["都営地下鉄5500形","東京都交通局5500形"] },
  { id: "toei-fleet-1", displayName: "都営6300形", asset: "../images/列车/都営地下鉄/都営地下鉄_6300形_3次車.png", aliases: ["都営地下鉄6300形","東京都交通局6300形","都営6300形（3次車）"] },
  { id: "toei-fleet-2", displayName: "都営6500形", asset: "../images/列车/都営地下鉄/都営地下鉄_6500形.png", aliases: ["都営地下鉄6500形","東京都交通局6500形"] },
  { id: "toei-fleet-3", displayName: "都営10-300形", asset: null, aliases: ["都営地下鉄10-300形","東京都交通局10-300形"] },
  { id: "toei-fleet-4", displayName: "都営10-300形（1・2次車）", asset: "../images/列车/都営地下鉄/都営地下鉄_10-300形_1・2次車.png", aliases: [] },
  { id: "toei-fleet-5", displayName: "都営10-300形（3次車以降）", asset: "../images/列车/都営地下鉄/都営地下鉄_10-300形_3次車以降.png", aliases: [] },
  { id: "toei-fleet-6", displayName: "都営12-000形（4次車）", asset: "../images/列车/都営地下鉄/都営地下鉄_12-000形_4次車.png", aliases: [] },
  { id: "toei-fleet-7", displayName: "都営12-600形", asset: null, aliases: ["都営地下鉄12-600形","東京都交通局12-600形"] },
  { id: "toei-fleet-8", displayName: "都営12-600形（1次車）", asset: "../images/列车/都営地下鉄/都営地下鉄_12-600形_1次車.png", aliases: [] },
  { id: "toei-fleet-9", displayName: "都営12-600形（前期車）", asset: "../images/列车/都営地下鉄/都営地下鉄_12-600形_前期車.png", aliases: [] },
  { id: "toei-fleet-10", displayName: "都営12-600形（後期車）", asset: "../images/列车/都営地下鉄/都営地下鉄_12-600形_後期車.png", aliases: [] },
  { id: "toei-fleet-11", displayName: "日暮里・舎人ライナー300形", asset: "../images/列车/都営地下鉄/都営地下鉄_300形.png", aliases: ["都営日暮里・舎人ライナー300形"] },
  { id: "toei-fleet-12", displayName: "日暮里・舎人ライナー320形", asset: "../images/列车/都営地下鉄/都営地下鉄_320形.png", aliases: ["都営日暮里・舎人ライナー320形"] },
  { id: "toei-fleet-13", displayName: "日暮里・舎人ライナー330形", asset: "../images/列车/都営地下鉄/都営地下鉄_330形.png", aliases: ["都営日暮里・舎人ライナー330形"] }
].forEach(function(rec) {
  CANONICAL_VEHICLES[rec.id] = {
    displayName: rec.displayName,
    iconName: rec.displayName,
    asset: rec.asset,
    aliases: rec.aliases
  };
});

// ODPT trainOwner (not operator) identifies the actual operator's rolling
// stock on through-service lines. Only these two Toei-owned fleets are
// single-model today; Mita and Oedo have multiple models. Do not guess there.
function resolveToeiOwnerSingleFleet(ctx) {
  if (normOp(ctx.operator) !== "Toei") return null;
  var owner = String(ctx.trainOwner || "").replace(/^odpt\.(?:Operator|TrainOwner):/, "");
  if (owner !== "Toei") return null;
  if (ctx.lineId === "Asakusa" && ctx.railway === "odpt.Railway:Toei.Asakusa")
    return "都営5500形";
  if (ctx.lineId === "Shinjuku" && ctx.railway === "odpt.Railway:Toei.Shinjuku")
    return "都営10-300形";
  return null;
}

// Exact catalogue additions reuse existing named assets; they do not assign trains.
Object.assign(CANONICAL_VEHICLES,{
  "jr-e231-500-plan": {
    "displayName": "E231系500番台",
    "asset": null
  },
  "jr-e231-0-chuo-sobu": {
    "displayName": "E231系0番台（中央・総武線各駅停車）",
    "asset": "../images/列车/JR東日本/JR東日本_E231系_0番台_中央・総武線各駅停車.png"
  },
  "metro-08": {
    "displayName": "東京メトロ08系",
    "iconName": "東京メトロ08系",
    "asset": "../images/列车/東京メトロ/東京メトロ_08系.png",
    "aliases": []
  },
  "metro-8000": {
    "displayName": "東京メトロ8000系",
    "iconName": "東京メトロ8000系",
    "asset": "../images/列车/東京メトロ/東京メトロ_8000系.png",
    "aliases": []
  },
  "metro-9000": {
    "displayName": "東京メトロ9000系",
    "iconName": "東京メトロ9000系",
    "asset": "../images/列车/東京メトロ/東京メトロ_9000系.png",
    "aliases": []
  },
  "metro-10000": {
    "displayName": "東京メトロ10000系",
    "iconName": "東京メトロ10000系",
    "asset": "../images/列车/東京メトロ/東京メトロ_10000系.png",
    "aliases": []
  },
  "metro-13000": {
    "displayName": "東京メトロ13000系",
    "iconName": "東京メトロ13000系",
    "asset": "../images/列车/東京メトロ/東京メトロ_13000系.png",
    "aliases": []
  },
  "metro-17000": {
    "displayName": "東京メトロ17000系",
    "iconName": "東京メトロ17000系",
    "asset": "../images/列车/東京メトロ/東京メトロ_17000系.png",
    "aliases": []
  },
  "metro-18000": {
    "displayName": "東京メトロ18000系",
    "iconName": "東京メトロ18000系",
    "asset": "../images/列车/東京メトロ/東京メトロ_18000系.png",
    "aliases": []
  },
  "keio-7000": {
    "displayName": "京王7000系",
    "iconName": "京王7000系",
    "asset": "../images/列车/京王電鉄/京王電鉄_7000系.png",
    "aliases": []
  },
  "keio-8000": {
    "displayName": "京王8000系",
    "iconName": "京王8000系",
    "asset": "../images/列车/京王電鉄/京王電鉄_8000系.png",
    "aliases": []
  },
  "keio-9000": {
    "displayName": "京王9000系",
    "iconName": "京王9000系",
    "asset": "../images/列车/京王電鉄/京王電鉄_9000系.png",
    "aliases": []
  },
  "tx-TX-1000": {
    "displayName": "TX-1000系",
    "iconName": "TX-1000系",
    "asset": "../images/列车/首都圏新都市鉄道/首都圏新都市鉄道_TX-1000系.png",
    "aliases": []
  },
  "tx-TX-2000": {
    "displayName": "TX-2000系",
    "iconName": "TX-2000系",
    "asset": "../images/列车/首都圏新都市鉄道/首都圏新都市鉄道_TX-2000系.png",
    "aliases": []
  },
  "tx-TX-3000": {
    "displayName": "TX-3000系",
    "iconName": "TX-3000系",
    "asset": "../images/列车/首都圏新都市鉄道/首都圏新都市鉄道_TX-3000系.png",
    "aliases": []
  },
  "keikyu-2100": {
    "displayName": "京急2100形",
    "iconName": "京急2100形",
    "asset": "../images/列车/京浜急行電鉄/京浜急行電鉄_2100形.png",
    "aliases": []
  },
  "tokyu-5050": {
    "displayName": "東急5050系",
    "iconName": "東急5050系",
    "asset": "../images/列车/東急電鉄/東急電鉄_5050系.png",
    "aliases": []
  },
  "tokyu-3020": {
    "displayName": "東急3020系",
    "iconName": "東急3020系",
    "asset": "../images/列车/東急電鉄/東急電鉄_3020系.png",
    "aliases": []
  },
  "odakyu-1000": {
    "displayName": "小田急1000形",
    "iconName": "小田急1000形",
    "asset": "../images/列车/小田急電鉄/小田急電鉄_1000形_標準色.png",
    "aliases": []
  },
  "odakyu-2000": {
    "displayName": "小田急2000形",
    "iconName": "小田急2000形",
    "asset": "../images/列车/小田急電鉄/小田急電鉄_2000形_標準色.png",
    "aliases": []
  },
  "odakyu-3000": {
    "displayName": "小田急3000形",
    "iconName": "小田急3000形",
    "asset": "../images/列车/小田急電鉄/小田急電鉄_3000形_標準色.png",
    "aliases": []
  },
  "odakyu-60000": {
    "displayName": "小田急60000形",
    "iconName": "小田急60000形",
    "asset": "../images/列车/小田急電鉄/小田急電鉄_60000形_MSE.png",
    "aliases": []
  },
  "odakyu-70000": {
    "displayName": "小田急70000形",
    "iconName": "小田急70000形",
    "asset": "../images/列车/小田急電鉄/小田急電鉄_70000形_GSE.png",
    "aliases": []
  },
  "seibu-20000": {
    "displayName": "西武20000系",
    "iconName": "西武20000系",
    "asset": "../images/列车/西武鉄道/西武鉄道_20000系_標準塗装.png",
    "aliases": []
  },
  "seibu-30000": {
    "displayName": "西武30000系",
    "iconName": "西武30000系",
    "asset": "../images/列车/西武鉄道/西武鉄道_30000系_スマイルトレイン.png",
    "aliases": []
  },
  "seibu-9000": {
    "displayName": "西武9000系",
    "iconName": "西武9000系",
    "asset": "../images/列车/西武鉄道/西武鉄道_9000系.png",
    "aliases": []
  },
  "seibu-001": {
    "displayName": "西武001系",
    "iconName": "西武001系",
    "asset": "../images/列车/西武鉄道/西武鉄道_001系_Laview.png",
    "aliases": [
      "001系（Laview）"
    ]
  }
});

var CANONICAL_VEHICLE_ALIAS_INDEX = {};
var CANONICAL_VEHICLE_ALIAS_CONFLICTS = {};
function _registerCanonicalVehicleAlias(alias, rec) {
  var key = String(alias || "").trim();
  if (!key || CANONICAL_VEHICLE_ALIAS_CONFLICTS[key]) return;
  var existing = CANONICAL_VEHICLE_ALIAS_INDEX[key];
  if (existing && existing.id !== rec.id) {
    delete CANONICAL_VEHICLE_ALIAS_INDEX[key];
    CANONICAL_VEHICLE_ALIAS_CONFLICTS[key] = true;
    return;
  }
  CANONICAL_VEHICLE_ALIAS_INDEX[key] = rec;
}
Object.keys(CANONICAL_VEHICLES).forEach(function(id) {
  var rec = CANONICAL_VEHICLES[id];
  rec.id = id;
  // Dated artwork is a factual claim and must carry provenance.
  // Invalid dated records are deliberately not registered, so they cannot resolve.
  if ((rec.validFrom || rec.validTo) && (!rec.evidenceSource || rec.evidenceGrade !== "A")) {
    return;
  }
  _registerCanonicalVehicleAlias(id, rec);
  _registerCanonicalVehicleAlias(rec.displayName, rec);
  _registerCanonicalVehicleAlias(rec.iconName, rec);
  (rec.aliases || []).forEach(function(alias) {
    _registerCanonicalVehicleAlias(alias, rec);
  });
});

function resolveCanonicalVehicle(name) {
  var n = String(name || "").trim();
  if (!n || CANONICAL_VEHICLE_ALIAS_CONFLICTS[n]) return null;
  return CANONICAL_VEHICLE_ALIAS_INDEX[n] || null;
}

// An optional preverified in-memory catalogue can extend the embedded artwork.
// The canonical identity resolver remains
// the only vehicle selector: catalog rows cannot guess a train's type.
var _verifiedSqlArtworkPaths = null;
var _verifiedSqlArtworkByExactName = null;
var _verifiedSqlArtworkByExactFormation = null;
function hydrateVerifiedArtworkCatalog(rows) {
  if (!Array.isArray(rows)) return false;
  var paths = Object.create(null);
  var exact = Object.create(null);
  var formations = Object.create(null);
  rows.forEach(function(row) {
    var path = row && String(row.image_path || "");
    if (!(path.startsWith("images/列车/") && path.endsWith(".png") && path.split("/").length === 4)) return;
    var artwork = "../" + path;
    paths[artwork] = true;
    // Explicit formation evidence can identify a verified variant. Require the
    // operator-qualified type and exact formation; never infer from a bare series.
    var company = path.split("/")[2];
    var vehicle = String(row.vehicle_type || "").trim();
    var formation = String(row.formation_id || "").trim();
    if (company && company !== "共通" && vehicle && formation) {
      var qualifiedType = vehicle.indexOf(company) === 0 ? vehicle : company + vehicle;
      var formationLabel = formation + (/(?:F|編成)$/i.test(formation) ? "" : "編成");
      var identity = qualifiedType + "（" + formationLabel + "）";
      var validFrom = String(row.valid_from || "").slice(0, 10);
      var validTo = String(row.valid_to || "").slice(0, 10);
      if ((!validFrom || /^\d{4}-\d{2}-\d{2}$/.test(validFrom)) &&
          (!validTo || /^\d{4}-\d{2}-\d{2}$/.test(validTo)) &&
          (!validFrom || !validTo || validFrom <= validTo)) {
        if (!formations[identity]) formations[identity] = [];
        formations[identity].push({ artwork: artwork, from: validFrom, to: validTo });
      }
    }
    // A database type name is eligible only when one certified generic vehicle
    // artwork exists for that *exact* name. Formation/livery/theme variants
    // cannot be chosen from a train's type alone.
    if (row.formation_id || row.livery || row.theme) return;
    var name = String(row.vehicle_type || "").trim();
    if (!name) return;
    if (!Object.prototype.hasOwnProperty.call(exact, name)) exact[name] = artwork;
    else if (exact[name] !== artwork) exact[name] = null;
  });
  _verifiedSqlArtworkPaths = paths;
  _verifiedSqlArtworkByExactName = exact;
  _verifiedSqlArtworkByExactFormation = formations;
  return true;
}

// Local approved PNG snapshot from 2026-10-12: no Supabase gallery request at runtime.
// Keep this inside the existing single TrainIcons/TrainVehicle identity module.
// Records only authorize a known exact vehicle/formation to display an image;
// they never establish which vehicle operates an arbitrary train number.
hydrateVerifiedArtworkCatalog([
  {
    "operator": "SaitamaNewUrbanTransit",
    "vehicle_type": "2000系",
    "formation_id": "01",
    "livery": "レッドパープル",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/埼玉新都市交通/埼玉新都市交通_2000系_01編成_レッドパープル.png"
  },
  {
    "operator": "SaitamaNewUrbanTransit",
    "vehicle_type": "2000系",
    "formation_id": "02",
    "livery": "オレンジ",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/埼玉新都市交通/埼玉新都市交通_2000系_02編成_オレンジ.png"
  },
  {
    "operator": "SaitamaNewUrbanTransit",
    "vehicle_type": "2000系",
    "formation_id": "03",
    "livery": "グリーン",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/埼玉新都市交通/埼玉新都市交通_2000系_03編成_グリーン.png"
  },
  {
    "operator": "SaitamaNewUrbanTransit",
    "vehicle_type": "2000系",
    "formation_id": "04",
    "livery": "イエロー",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/埼玉新都市交通/埼玉新都市交通_2000系_04編成_イエロー.png"
  },
  {
    "operator": "SaitamaNewUrbanTransit",
    "vehicle_type": "2000系",
    "formation_id": "05",
    "livery": "ブルー",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/埼玉新都市交通/埼玉新都市交通_2000系_05編成_ブルー.png"
  },
  {
    "operator": "SaitamaNewUrbanTransit",
    "vehicle_type": "2000系",
    "formation_id": "06",
    "livery": "レッド",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/埼玉新都市交通/埼玉新都市交通_2000系_06編成_レッド.png"
  },
  {
    "operator": "SaitamaNewUrbanTransit",
    "vehicle_type": "2000系",
    "formation_id": "07",
    "livery": "さくら色",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/埼玉新都市交通/埼玉新都市交通_2000系_07編成_さくら色.png"
  },
  {
    "operator": "SaitamaNewUrbanTransit",
    "vehicle_type": "2020系",
    "formation_id": "21",
    "livery": "グリーンクリスタル",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/埼玉新都市交通/埼玉新都市交通_2020系_21編成_グリーンクリスタル.png"
  },
  {
    "operator": "SaitamaNewUrbanTransit",
    "vehicle_type": "2020系",
    "formation_id": "22",
    "livery": "ブライトアンバー",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/埼玉新都市交通/埼玉新都市交通_2020系_22編成_ブライトアンバー.png"
  },
  {
    "operator": "SaitamaNewUrbanTransit",
    "vehicle_type": "2020系",
    "formation_id": "23",
    "livery": "ピュアルビー",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/埼玉新都市交通/埼玉新都市交通_2020系_23編成_ピュアルビー.png"
  },
  {
    "operator": "SaitamaNewUrbanTransit",
    "vehicle_type": "2020系",
    "formation_id": "24",
    "livery": "ゴールデントパーズ",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/埼玉新都市交通/埼玉新都市交通_2020系_24編成_ゴールデントパーズ.png"
  },
  {
    "operator": "SaitamaNewUrbanTransit",
    "vehicle_type": "2020系",
    "formation_id": "25",
    "livery": "トワイライトアメジスト",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/埼玉新都市交通/埼玉新都市交通_2020系_25編成_トワイライトアメジスト.png"
  },
  {
    "operator": "SaitamaNewUrbanTransit",
    "vehicle_type": "2020系",
    "formation_id": "26",
    "livery": "ブルーサファイア＆クリソベリル",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/埼玉新都市交通/埼玉新都市交通_2020系_26編成_ブルーサファイア＆クリソベリル.png"
  },
  {
    "operator": "ShonanMonorail",
    "vehicle_type": "5000系",
    "formation_id": "5601",
    "livery": "red",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/湘南モノレール/湘南モノレール_5000系_5601編成_レッド.png"
  },
  {
    "operator": "ShonanMonorail",
    "vehicle_type": "5000系",
    "formation_id": "5603",
    "livery": "blue",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/湘南モノレール/湘南モノレール_5000系_5603編成_ブルー.png"
  },
  {
    "operator": "ShonanMonorail",
    "vehicle_type": "5000系",
    "formation_id": "5605",
    "livery": "green",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/湘南モノレール/湘南モノレール_5000系_5605編成_グリーン.png"
  },
  {
    "operator": "ShonanMonorail",
    "vehicle_type": "5000系",
    "formation_id": "5607",
    "livery": "yellow",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/湘南モノレール/湘南モノレール_5000系_5607編成_イエロー.png"
  },
  {
    "operator": "ShonanMonorail",
    "vehicle_type": "5000系",
    "formation_id": "5609",
    "livery": "purple",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/湘南モノレール/湘南モノレール_5000系_5609編成_バイオレット.png"
  },
  {
    "operator": "ShonanMonorail",
    "vehicle_type": "5000系",
    "formation_id": "5611",
    "livery": "black",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/湘南モノレール/湘南モノレール_5000系_5611編成_ブラック.png"
  },
  {
    "operator": "ShonanMonorail",
    "vehicle_type": "5000系",
    "formation_id": "5613",
    "livery": "pink",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/湘南モノレール/湘南モノレール_5000系_5613編成_ピンク.png"
  },
  {
    "operator": "Tokyu",
    "vehicle_type": "1000系",
    "formation_id": "1013F",
    "livery": null,
    "theme": "緑の電車",
    "valid_from": "2019-11-25",
    "valid_to": null,
    "image_path": "images/列车/東急電鉄/東急電鉄_1000系_1013F_緑の電車.png"
  },
  {
    "operator": "Tokyu",
    "vehicle_type": "1000系",
    "formation_id": "1017F",
    "livery": null,
    "theme": "きになる電車",
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/東急電鉄/東急電鉄_1000系_1017F_きになる電車.png"
  },
  {
    "operator": "Tokyu",
    "vehicle_type": "1000系1500番台",
    "formation_id": "1522F",
    "livery": null,
    "theme": "いけたまハッピートレイン",
    "valid_from": "2024-06-23",
    "valid_to": null,
    "image_path": "images/列车/東急電鉄/東急電鉄_1000系_1500番台_1522F_いけたまハッピートレイン.png"
  },
  {
    "operator": "TOKYU",
    "vehicle_type": "300系",
    "formation_id": "301",
    "livery": "玉電カラー",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/東急電鉄/東急電鉄_300系_301編成_玉電カラー.png"
  },
  {
    "operator": "TOKYU",
    "vehicle_type": "300系",
    "formation_id": "302",
    "livery": "モーニングブルー",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/東急電鉄/東急電鉄_300系_302編成_モーニングブルー.png"
  },
  {
    "operator": "TOKYU",
    "vehicle_type": "300系",
    "formation_id": "303",
    "livery": "クラシックブルー",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/東急電鉄/東急電鉄_300系_303編成_クラシックブルー.png"
  },
  {
    "operator": "TOKYU",
    "vehicle_type": "300系",
    "formation_id": "304",
    "livery": "アップルグリーン",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/東急電鉄/東急電鉄_300系_304編成_アップルグリーン.png"
  },
  {
    "operator": "TOKYU",
    "vehicle_type": "300系",
    "formation_id": "306",
    "livery": "レリーフイエロー",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/東急電鉄/東急電鉄_300系_306編成_レリーフイエロー.png"
  },
  {
    "operator": "TOKYU",
    "vehicle_type": "300系",
    "formation_id": "307",
    "livery": "ブルーイッシュラベンダー",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/東急電鉄/東急電鉄_300系_307編成_ブルーイッシュラベンダー.png"
  },
  {
    "operator": "TOKYU",
    "vehicle_type": "300系",
    "formation_id": "309",
    "livery": "バーントオレンジ",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/東急電鉄/東急電鉄_300系_309編成_バーントオレンジ.png"
  },
  {
    "operator": "TOKYU",
    "vehicle_type": "300系",
    "formation_id": "310",
    "livery": "ターコイズグリーン",
    "theme": null,
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/東急電鉄/東急電鉄_300系_310編成_ターコイズグリーン.png"
  },
  {
    "operator": "Yamaman",
    "vehicle_type": "1000形",
    "formation_id": "第1編成",
    "livery": null,
    "theme": "こあら1号",
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/山万/山万_1000形_第1編成_こあら1号.png"
  },
  {
    "operator": "Yamaman",
    "vehicle_type": "1000形",
    "formation_id": "第2編成",
    "livery": null,
    "theme": "こあら2号",
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/山万/山万_1000形_第2編成_こあら2号.png"
  },
  {
    "operator": "Yamaman",
    "vehicle_type": "1000形",
    "formation_id": "第3編成",
    "livery": null,
    "theme": "こあら3号",
    "valid_from": null,
    "valid_to": null,
    "image_path": "images/列车/山万/山万_1000形_第3編成_こあら3号.png"
  },
  {
    "operator": "YokohamaMinatomiraiRailway",
    "vehicle_type": "Y000系",
    "formation_id": "Y002F",
    "livery": null,
    "theme": "ひつじでんしゃ",
    "valid_from": "2020-03-29",
    "valid_to": null,
    "image_path": "images/列车/東急電鉄/東急電鉄_Y000系_ひつじでんしゃ.png"
  }
]);

function _canonicalVehicleIconPath(name, serviceDate) {
  var n = String(name || "").trim();
  if (!n) return null;
  var rec = resolveCanonicalVehicle(n);
  if (!rec) return null;
  if (rec.validFrom || rec.validTo) {
    var d = String(serviceDate || "").slice(0, 10);
    if (!d) return null;
    if (rec.validFrom && d < rec.validFrom) return null;
    if (rec.validTo && d > rec.validTo) return null;
  }
  // An optional in-memory catalogue may certify the same canonical artwork.
  // Otherwise keep the previously verified static mapping for offline use.
  if (_verifiedSqlArtworkPaths && _verifiedSqlArtworkPaths[rec.asset]) return rec.asset;
  return rec.asset;
}

// No line/operator default vehicle selector exists.

// Display-name normalization may only expand spelling variants within the same
  // canonical identity. It must never rewrite retired stock to a successor,
  // a generic family to a subseries, or an ambiguous candidate to one vehicle.
  function resolveVehicleDisplayName(vehicleIdentity) {
    if (!vehicleIdentity) return null;
    var parts = String(vehicleIdentity).split('/').map(function(s){ return s.trim(); }).filter(Boolean);
    if (parts.length !== 1) return parts.length ? parts.join(' / ') : null;
    var name = parts[0];
    var canonical = resolveCanonicalVehicle(name);
    return canonical ? canonical.displayName : name;
  }

  // Fleet/livery pools are asset catalogs only. A confirmed vehicle type does not
  // prove a concrete formation or livery, so never hash-pick one at runtime.
  // Single artwork mapper. Input is an already-resolved vehicle identity only.
  // Operational context (line/operator/train number/source) is intentionally absent.
  function resolveVehicleArtwork(vehicleIdentity, serviceDate) {
    return _resolveVehicleArtworkBase(vehicleIdentity, serviceDate);
  }
  function _resolveVehicleArtworkBase(vehicleIdentity, serviceDate) {
    if (!vehicleIdentity) return null;
    var parts = String(vehicleIdentity).split('/').map(function(s){ return s.trim(); }).filter(Boolean);
    // A candidate list is not a concrete identity.
    if (parts.length !== 1) return null;
    var name = parts[0];

    // Canonical aliases are allowed only when they resolve to the same registered
    // identity record. No line override, replacement vehicle, base-name stripping,
    // retired-stock substitution, or approximate alias may select artwork.
    // A certified exact formation takes precedence when the SQL catalog has
    // that identity. Static canonical artwork remains the offline fallback.
    // Canonical alias conflicts always block both paths.
    if (CANONICAL_VEHICLE_ALIAS_CONFLICTS[name]) return null;
    if (_verifiedSqlArtworkByExactFormation &&
        Object.prototype.hasOwnProperty.call(_verifiedSqlArtworkByExactFormation, name)) {
      var verified = _verifiedSqlArtworkByExactFormation[name];
      var date = String(serviceDate || "").slice(0, 10);
      var uniqueArtwork = null;
      for (var i = 0; i < verified.length; i++) {
        var candidate = verified[i];
        if ((candidate.from || candidate.to) && !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
        if (candidate.from && date < candidate.from) continue;
        if (candidate.to && date > candidate.to) continue;
        if (uniqueArtwork && uniqueArtwork !== candidate.artwork) return null;
        uniqueArtwork = candidate.artwork;
      }
      return uniqueArtwork;
    }
    var canonical = _canonicalVehicleIconPath(name, serviceDate);
    if (canonical) return canonical;
    // A confirmed upstream vehicle type may use a SQL-certified PNG only on
    // exact, unambiguous type identity (never line-based fleet guessing).
    // Bare series numbers are shared by many operators. A unique row in the
    // currently certified subset is not proof of a unique railway identity.
    if (/^[0-9]{2,5}(?:-[0-9]+)?(?:系|形|型)$/.test(name)) return null;
    if (_verifiedSqlArtworkByExactName &&
        Object.prototype.hasOwnProperty.call(_verifiedSqlArtworkByExactName, name)) {
      return _verifiedSqlArtworkByExactName[name] || null;
    }
    return null;
  }

  window.TrainIcons = {
    resolveVehicleArtwork: resolveVehicleArtwork,
    resolveVehicleDisplayName: resolveVehicleDisplayName,
    resolveCanonicalVehicle: resolveCanonicalVehicle,
    CANONICAL_VEHICLES: CANONICAL_VEHICLES,
    hydrateVerifiedArtworkCatalog: hydrateVerifiedArtworkCatalog,
    // An optional preverified in-memory catalogue may extend embedded assets.
  };

  // Normalize operator labels only for metadata carried by explicit evidence.
  function normOp(op) {
    if (!op) return '';
    op = String(op).replace(/^odpt\.(?:Operator|TrainOwner):/, '');
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
  function resolveArtworkForIdentity(name, formationId, serviceDate) {
    if (!name) return '';
    var identity = name;
    if (formationId && !/編成/.test(identity)) {
      var fid = String(formationId).trim();
      identity = name + '（' + fid + (/(?:F|編成)$/i.test(fid) ? '' : '編成') + '）';
    }
    // Same module, same canonical map; no global legacy icon resolver hop.
    return resolveVehicleArtwork(identity, serviceDate) || '';
  }

  // ============================================================
  // Main decision: one source-priority arbitration path.
  // ============================================================
  function resolve(ctx) {
    ctx = ctx || {};
    var assignmentOperator = normOp(ctx.assignmentOperator || ctx.operationOperator || '');
    var tcar = resolveTodenArakawaLiveCar(ctx) || resolveRosterCar(ctx);
    // A source-supplied exact vehicle model outranks a generic fleet constraint.
    // Keep the latter only for trains without model evidence (never invent variants).
    var hasExplicitVehicle = !!(String(ctx.realtimeVehicleType || '').trim() ||
      String(ctx.realtimeDerivedVehicleType || '').trim() ||
      String(ctx.timetableVehicleType || '').trim() || tcar);
    var toeiFleet = hasExplicitVehicle ? null : resolveToeiOwnerSingleFleet(ctx);

    // One identity arbitration path for realtime, realtime-derived and
    // timetable/SQL evidence. Normalize *registered exact aliases* before
    // comparing sources: "JR E235系0番台" and "E235系0番台（山手線）" are
    // the same verified vehicle, not competing mappings.
    // Unregistered/ambiguous aliases are never guessed or merged.
    var pool = Object.create(null);
    var orderArr = [];
    function admittedIdentity(value) {
      var raw = String(value || '').trim();
      var canonical = resolveCanonicalVehicle(raw);
      return canonical ? canonical.displayName : raw;
    }
    [
      { source: 'realtime', value: ctx.realtimeVehicleType },
      { source: 'realtime-derived', value: ctx.realtimeDerivedVehicleType },
      { source: 'timetable', value: tcar ? '' : ctx.timetableVehicleType },
      { source: tcar && tcar.sourceUrl ? 'roster-physical-id' : 'official-realtime-car-number', value: tcar && tcar.name },
      { source: 'official-train-owner-single-fleet', value: toeiFleet }
    ].forEach(function(group) {
      splitCandidates(group.value).forEach(function(rawCandidate) {
        var candidate = admittedIdentity(rawCandidate);
        if (!candidate) return;
        if (!pool[candidate]) {
          pool[candidate] = { sources: [] };
          orderArr.push(candidate);
        }
        if (pool[candidate].sources.indexOf(group.source) < 0) {
          pool[candidate].sources.push(group.source);
        }
      });
    });

    // A single verified identity may be carried by multiple sources. Conflicting
    // identities remain unresolved; neither source order nor artwork existence
    // is permission to pick a winner.
    var chosen = orderArr.length === 1 ? orderArr[0] : '';
    var chosenSrc = chosen ? pool[chosen].sources.join('+') : '';

    var confidence = chosen ? 'high' : 'none';

    // 4) Artwork is a strict projection of the already-exact vehicle identity.
    // Missing artwork stays missing; never substitute another candidate, line,
    // operator, retired replacement, or rule-derived vehicle.
    var _formationCandidates = Array.isArray(ctx.formationCandidates)
      ? ctx.formationCandidates.map(function(v){ return String(v || '').trim(); }).filter(Boolean)
      : [];
    _formationCandidates = _formationCandidates.filter(function(v,i,a){ return a.indexOf(v) === i; });
    var _formationId = String(ctx.formationId || '').trim();
    if (tcar && tcar.formationId && _formationId && _formationId !== tcar.formationId &&
        _formationCandidates.indexOf(tcar.formationId) < 0) _formationCandidates.push(tcar.formationId);
    if (tcar && tcar.formationId && !_formationId && !_formationCandidates.length) {
      _formationId = tcar.formationId;
      _formationCandidates = [_formationId];
    }
    var _formationConstrained = _formationCandidates.length > 0 || !!_formationId;
    var _formationUnique = _formationCandidates.length === 1
      && !!_formationId
      && _formationCandidates[0] === _formationId;
    var iconPath = '';
    if (chosen) {
      if (_formationConstrained) {
        // Formation evidence is authoritative only when both fields agree on one value.
        // Ambiguous, missing, or contradictory formation evidence blocks artwork entirely.
        // Exact carset evidence can use the verified generic PNG of that SAME
        // model when no dedicated carset PNG exists. Never guess another model.
        iconPath = _formationUnique
          ? (resolveArtworkForIdentity(chosen, _formationId, ctx.serviceDate) ||
             resolveArtworkForIdentity(chosen, '', ctx.serviceDate)) : '';
      } else {
        iconPath = resolveArtworkForIdentity(chosen, '', ctx.serviceDate);
        // The server's source-dated timetable resolver can supply a unique,
        // native, model-exact PNG that is absent from the embedded catalog.
        // Trust neither a bare path nor an arbitrary timetable candidate:
        // the caller must prove the SAME exact model and certified mapping.
        var dbArt = String(ctx.verifiedTimetableArtworkPath || '');
        var dbModel = admittedIdentity(ctx.verifiedTimetableModel);
        if (!iconPath && chosen === dbModel &&
            /^images\/列车\/[^/.][^/]*\/[^/.][^/]*\.png$/.test(dbArt) &&
            dbArt.indexOf('..') < 0) {
          iconPath = '../' + dbArt;
        }
      }
    }

    // Display-name normalization is presentation-only and must never rewrite the
    // resolved identity: name keeps the exact evidence string, artwork projection
    // already happened above against the raw identity.

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
      // Timetable-derived exact vehicles retain their timetable identity reason
      // so downstream diagnostics can distinguish the evidence channel.
      if (tcar && chosen === admittedIdentity(tcar.name)) {
        identityReason = tcar.sourceUrl ? 'verified-roster-physical-id' : 'verified-toden-realtime-car-number';
      } else if (toeiFleet && chosen === toeiFleet) {
        identityReason = 'verified-toei-owner-single-fleet';
      } else if (chosenSrc === 'timetable') {
        identityReason = 'timetable-vehicle-evidence';
      } else {
        identityReason = 'unique-converged-vehicle-evidence';
      }
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
      verifiedCarNumber: tcar && chosen === admittedIdentity(tcar.name) ? tcar.number : '',
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


  // A timetable plan is independent of a dated physical vehicle assignment.
  // Expand source abbreviations, retain ALL candidates, and use the first
  // drawable candidate as a stable representative, never as a daily assignment.
  var _issuedVehiclePlans = new WeakSet();
  var _planOwnerLabels = {
    'JR-East':'JR東日本', 'JR-West':'JR西日本', 'JR-Kyushu':'JR九州',
    'JR-Central':'JR東海', 'JR-Hokkaido':'JR北海道',
    'TokyoMetro':'東京メトロ', 'Toei':'都営', 'Tokyu':'東急', 'TOKYU':'東急',
    'Tobu':'東武', 'Odakyu':'小田急', 'Seibu':'西武', 'Keio':'京王',
    'Keikyu':'京急', 'Keisei':'京成', 'Sotetsu':'相鉄',
    'YokohamaMunicipal':'横浜市営', 'TWR':'東京臨海高速鉄道',
    'Rinkai':'東京臨海高速鉄道', 'TokyoMonorail':'東京モノレール',
    'TamaMonorail':'多摩モノレール', 'Yurikamome':'ゆりかもめ',
    'ToyoRapid':'東葉高速', 'SaitamaRailway':'埼玉高速鉄道'
  };
  function resolveTimetableVehiclePlan(input, ctx) {
    ctx=ctx||{};
    var raw=String(input||'').split(/\s*\/\s*/).map(function(v){return v.trim();}).filter(Boolean);
    if(!raw.length)return null;
    var owner=_planOwnerLabels[normOp(ctx.operator)]||'';
    var labels=Object.keys(_planOwnerLabels).map(function(k){return _planOwnerLabels[k];})
      .filter(function(v,i,a){return a.indexOf(v)===i;}).sort(function(a,b){return b.length-a.length;});
    var candidates=raw.map(function(name){
      var declared=labels.find(function(label){return name.indexOf(label)===0;});
      if(declared)owner=declared;
      var canonical=owner ? resolveCanonicalVehicle(owner+name) : null;
      if(!canonical) {
        var direct=resolveCanonicalVehicle(name);
        var assetOwner=direct&&direct.asset?direct.asset.split('/')[3]:'';
        var expected={'JR東日本':'JR東日本','JR東海':'JR東海','JR西日本':'JR西日本',
          '京急':'京浜急行電鉄','京成':'京成電鉄','京王':'京王電鉄','小田急':'小田急電鉄',
          '東急':'東急電鉄','東武':'東武鉄道','西武':'西武鉄道','相鉄':'相模鉄道',
          '都営':'都営地下鉄','東京メトロ':'東京メトロ'}[owner]||owner;
        // Unqualified labels cannot borrow another owner\u0027s stock.
        if(direct && (declared || (!owner && !ctx.operator) || assetOwner===expected || /^TX-/.test(name)))canonical=direct;
      }
      if(ctx.lineId==='ChuoSobuLocal' && name==='E231系0番台')
        canonical=resolveCanonicalVehicle('E231系0番台（中央・総武線各駅停車）');
      return {label:canonical?canonical.displayName:name,canonical:canonical};
    }).filter(function(v,i,a){return a.findIndex(function(x){return x.label===v.label;})===i;});
    var first=candidates[0], icon='';
    // Illustrate a retained planned candidate without asserting a daily assignment.
    candidates.some(function(candidate) {
      var asset=candidate.canonical&&resolveVehicleArtwork(candidate.canonical.displayName,ctx.serviceDate);
      if(!asset)return false;
      first=candidate;icon=asset;return true;
    });
    var plan={status:candidates.length===1?'PLANNED_MODEL':'PLANNED_CANDIDATES',
      models:candidates.map(function(v){return v.label;}),
      representativeModel:first?first.label:'',iconPath:icon,
      source:ctx.source||'sql-timetable-plan',evidenceRole:'timetable-plan',
      sourceUrl:ctx.sourceUrl||'',formationId:''};
    _issuedVehiclePlans.add(plan);
    return plan;
  }

  function resolveTimetableRun(run, tt, lineId, line, serviceDateOverride) {
    var serviceDate = serviceDateOverride || tt['_serviceDate'] || tt['serviceDate'] || tt['operatingDate'] || '';
    var identityKey = lineId + "|" + String(serviceDate || "").slice(0, 10);
    var evidenceRevision = window.TrainOperationEvidence.getRevision();
    var planInputKey=String(tt._sqlVehicleCandidateLabel||'')+'|'+String(tt.vehicleType||'');
    if (run.identity && run.identity.key === identityKey &&
        run.identity.evidenceRevision === evidenceRevision && run.identity.planInputKey === planInputKey) return run.identity;

    var trainNumber = run.trainNumber;
    var destinationStationUrn = run.destinationStationUrn;
    var _trainOwner = tt['odpt:trainOwner'] || tt['trainOwner'] || '';
    var _assignmentOperator = '';
    var _assignmentMatches = [];
    // SQL recurring timetables supply a planned/reference model, not a
    // particular day's observed carset. Keep that single-model timetable fact
    // independent of historical operation/formation observations.
    var _plannedSqlVehicle = tt._positionSource === 'supabase-train-run' &&
      (tt._sqlVehicleMappingLevel === 'dated_schedule_rule' ||
       tt._sqlVehicleMappingLevel === 'dated_operation_owner' ||
       tt._sqlVehicleMappingLevel === 'verified_scheduled_boundary') &&
      !!String(tt.vehicleType || '').trim() &&
      String(tt.vehicleType).split('/').length === 1;
    var _baseOperationCtx = {
      lineId: lineId,
      operator: tt['odpt:operator'] || line.operator || '',
      railway: tt['odpt:railway'] || '',
      railDirection: run.railDirection || '',
      destinationStation: destinationStationUrn || '',
      timetableObjectId: run.timetableObjectId,
      serviceDate: serviceDate,
      // Exact train-number references are calendar-scoped. Use this source
      // run's published calendar, never infer it from the host machine's day.
      calendarType: /Weekday$/.test(run.calendar || '') ? 'weekday'
        : /(?:SaturdayHoliday|Saturday|Holiday|Sunday)$/.test(run.calendar || '') ? 'holiday' : '',
      at: (function(){ var d=new Date(Date.now()+9*60*60*1000); return d.toISOString().slice(11,16); })()
    };
    _baseOperationCtx.operationCode = String(
      tt['_operationCode'] || tt['operationCode'] || tt['operation_code'] || ''
    ).trim();
    if (!_plannedSqlVehicle && !_baseOperationCtx.operationCode) {
      _baseOperationCtx.operationCode = window.TrainOperationEvidence &&
        typeof window.TrainOperationEvidence.normalizeOperationCode === 'function'
        ? window.TrainOperationEvidence.normalizeOperationCode(trainNumber, _baseOperationCtx) : '';
    }
    var _resolvedEvidence = !_plannedSqlVehicle && window.TrainOperationEvidence &&
      typeof window.TrainOperationEvidence.resolveEvidence === 'function'
      ? window.TrainOperationEvidence.resolveEvidence(trainNumber, _baseOperationCtx, "fallback")
      : null;
    if (_resolvedEvidence) _assignmentMatches.push(_resolvedEvidence);
    if (_resolvedEvidence && _resolvedEvidence.decisive && _resolvedEvidence.operator) {
      _assignmentOperator = _resolvedEvidence.operator;
    }
    var _operationVehicleInput = _resolvedEvidence && _resolvedEvidence.vehicleType
      ? _resolvedEvidence.vehicleType
      : (_resolvedEvidence && _resolvedEvidence.vehicleCandidates || []).join(' / ');
    // Read the actual SQL/manual timetable model evidence already carried
    // through the existing ODPT adapter. Multiple models remain multiple
    // candidates: neither artwork availability nor line name may guess one.
    // SQL stores historical planned-vehicle labels separately from sourced,
    // train-level decisive mappings. Keep all candidates visible to diagnostics
    // without converting "one line has one candidate" into an observed vehicle.
    var _sqlSourceCandidates = tt._positionSource === 'supabase-train-run'
      ? String(tt._sqlVehicleCandidateLabel || '').split(/\s*\/\s*/)
          .map(function(v) { return v.trim(); }).filter(Boolean) : [];
    var _declaredVehicleInput = String(tt.vehicleType || '').trim();
    var _timetableVehicleInput = [_operationVehicleInput, _declaredVehicleInput]
      .filter(Boolean).filter(function(v,i,a) { return a.indexOf(v) === i; }).join(' / ');
    // A precise, boundary-verified SQL vehicle model can narrow an operation
    // evidence *candidate list*. Do not override a different single-model
    // assertion, and never pick a model from an ambiguous list by availability.
    var _declaredModels = _declaredVehicleInput.split('/').map(function(v){return v.trim();}).filter(Boolean);
    var _operationModels = String(_operationVehicleInput || '').split('/').map(function(v){return v.trim();}).filter(Boolean);
    if (_declaredModels.length === 1 && _operationModels.length > 1 &&
        _operationModels.indexOf(_declaredModels[0]) >= 0) {
      _timetableVehicleInput = _declaredModels[0];
    }
    // A dated, decisive train-level model may narrow the timetable's broader
    // candidate set. Compare canonical identities, never working-number suffixes.
    if (_resolvedEvidence && _resolvedEvidence.decisive === true &&
        _operationModels.length === 1 && _declaredModels.length > 1 &&
        window.TrainIcons && typeof window.TrainIcons.resolveCanonicalVehicle === 'function') {
      var _exactCanonical = window.TrainIcons.resolveCanonicalVehicle(_operationModels[0]);
      var _compatible = _exactCanonical && _declaredModels.some(function(candidate) {
        return window.TrainIcons.resolveCanonicalVehicle(candidate) === _exactCanonical;
      });
      if (_compatible) _timetableVehicleInput = _operationModels[0];
    }
    // A historical generic PNG candidate may become usable only after the
    // existing dated operation/reference resolver independently confirms the
    // SAME unique model. The SQL candidate itself never decides identity.
    var _evidenceBackedCandidateArt = '';
    if (!_plannedSqlVehicle && _resolvedEvidence && _resolvedEvidence.decisive === true &&
        _resolvedEvidence.sourceUrl && _resolvedEvidence.observedDate &&
        _operationModels.length === 1 && _sqlSourceCandidates.length === 1 &&
        tt._sqlCandidateArtworkPath &&
        window.TrainIcons && typeof window.TrainIcons.resolveCanonicalVehicle === 'function') {
      var _ruleModel = window.TrainIcons.resolveCanonicalVehicle(_operationModels[0]);
      var _sourceModel = window.TrainIcons.resolveCanonicalVehicle(_sqlSourceCandidates[0]);
      if (_ruleModel && _sourceModel && _ruleModel === _sourceModel) {
        _evidenceBackedCandidateArt = String(tt._sqlCandidateArtworkPath || '');
      }
    }
    var _assignmentFormations = {};
    if (_resolvedEvidence && _resolvedEvidence.formationId) {
      String(_resolvedEvidence.formationId).split(/\s*\/\s*|\s*,\s*|\s*\|\s*/).forEach(function(fid) {
        fid = String(fid || '').trim();
        if (fid) _assignmentFormations[fid] = true;
      });
    }
    var vehCtx = {
      lineId: lineId,
      operator: line.operator,
      trainOwner: _trainOwner,
      assignmentOperator: _assignmentOperator,
      trainNumber: trainNumber,
      trainType: run.trainType,
      destinationStation: destinationStationUrn || '',
      timetableVehicleType: _timetableVehicleInput,
      // SQL supplies this only after a unique model-specific native PNG was
      // certified against the same source-dated canonical train timetable.
      // This is NOT a live formation observation or a model guess.
      verifiedTimetableArtworkPath: _plannedSqlVehicle &&
        (tt._sqlVehicleMappingLevel === 'dated_schedule_rule' ||
         tt._sqlVehicleMappingLevel === 'dated_operation_owner')
          ? String(tt._sqlVehicleArtworkPath || '') : _evidenceBackedCandidateArt,
      verifiedTimetableModel: _plannedSqlVehicle &&
        (tt._sqlVehicleMappingLevel === 'dated_schedule_rule' ||
         tt._sqlVehicleMappingLevel === 'dated_operation_owner')
          ? _declaredVehicleInput : (_evidenceBackedCandidateArt ? _operationModels[0] : ''),
      timetableEvidence: _assignmentMatches,
      formationId: Object.keys(_assignmentFormations).length === 1 ? Object.keys(_assignmentFormations)[0] : '',
      formationCandidates: Object.keys(_assignmentFormations),
      serviceDate: serviceDate,
      trainId: run.timetableIdentity
    };
    var vehResult = resolve(vehCtx);
    if(vehResult.identityStatus!=='EXACT'){
      var plannedEvidence=window.TrainOperationEvidence.resolveEvidence(trainNumber,_baseOperationCtx,'planned');
      var familyPlan=plannedEvidence&&(plannedEvidence.vehicleType||(plannedEvidence.vehicleCandidates||[]).join(' / '));
      var planInput=_sqlSourceCandidates.length?_sqlSourceCandidates.join(' / '):(_declaredVehicleInput||familyPlan||'');
      vehResult.vehiclePlan=resolveTimetableVehiclePlan(planInput,{lineId:lineId,operator:line.operator,serviceDate:serviceDate,source:_sqlSourceCandidates.length?'sql-timetable-plan':'operation-family-plan',sourceUrl:tt._timetableProvenance||(plannedEvidence&&plannedEvidence.sourceUrl)||''});
    }
    run.identity = {
      planInputKey:planInputKey,
      key: identityKey,
      evidenceRevision: evidenceRevision,
      trainOwner: _trainOwner,
      assignmentOperator: _assignmentOperator,
      assignmentMatches: _assignmentMatches,
      assignmentFormations: Object.keys(_assignmentFormations),
      timetableVehicleInput: _timetableVehicleInput,
      plannedVehicleCandidates: _sqlSourceCandidates,
      plannedVehicleCandidateStatus: tt._positionSource === 'supabase-train-run'
        ? (tt._sqlVehicleMappingLevel || 'unresolved') : '',
      candidateArtworkConfirmedByDatedRule: !!_evidenceBackedCandidateArt,
      vehicleResult: vehResult
    };
    return run.identity;
  }

  // One live train entry: number -> registered line evidence -> identity -> PNG.
  function resolveRealtime(ctx) {
    ctx=ctx||{};
    var evidence=!String(ctx.realtimeVehicleType||'').trim()
      ? window.TrainOperationEvidence.resolveEvidence(ctx.trainNumber,ctx,'realtime-derived') : null;
    var planned=!!(evidence&&evidence.evidenceRole==='timetable-reference');
    var input=evidence&&(evidence.vehicleType||(evidence.vehicleCandidates||[]).join(' / '))||'';
    var formations=evidence&&evidence.decisive&&!planned&&evidence.formationId
      ? String(evidence.formationId).split(/\s*\/\s*|\s*,\s*|\s*\|\s*/).filter(Boolean) : [];
    if(ctx.formationId)formations.push(String(ctx.formationId).trim());
    (ctx.formationCandidates||[]).forEach(function(id){if(id)formations.push(String(id).trim());});
    formations=formations.filter(function(id,i,a){return id&&a.indexOf(id)===i;});
    var adapted=Object.assign({},ctx,{
      formationId:formations.length===1?formations[0]:'',formationCandidates:formations,
      realtimeDerivedVehicleType:planned?'':input,timetableVehicleType:planned?input:''
    });
    var result=resolve(adapted);
    if(result.identityStatus!=='EXACT'&&!ctx.realtimeVehicleType){
      var planEvidence=window.TrainOperationEvidence.resolveEvidence(ctx.trainNumber,ctx,'planned');
      var modelPlan=planEvidence&&(planEvidence.vehicleType||(planEvidence.vehicleCandidates||[]).join(' / '));
      result.vehiclePlan=resolveTimetableVehiclePlan(modelPlan,{operator:ctx.operator,serviceDate:ctx.serviceDate,source:'operation-family-plan',sourceUrl:planEvidence&&planEvidence.sourceUrl});
    }
    return {vehicleResult:result,evidence:evidence,isPlannedReference:planned,
      realtimeDerivedVehicleType:adapted.realtimeDerivedVehicleType,
      realtimeReferenceModel:adapted.timetableVehicleType,
      formationId:adapted.formationId,formationCandidates:formations};
  }

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
    var icon = resolveArtworkForIdentity(a.vehicleName, a.formationId, date);
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
  // Single artwork authority for both ODPT real-time and timetable estimates.
  // No model may be inferred from a line, train number or rendering context.
  // Single vehicle-artwork authority. Both ODPT realtime and timetable
  // estimates choose an existing gallery PNG; unknown trains get a neutral PNG.
  // Never synthesize a railway-specific model or draw an SVG vehicle.
  // No generic artwork: unknown vehicle identity does not claim a concrete model.
  function isGalleryPng(path) {
    var src = String(path || "");
    return src.startsWith("../images/列车/") &&
      src.endsWith(".png") && src.split("/").length === 5;
  }
  function selectMarkerArtwork(p, artworkFailed) {
    var iconSrc = p && p.vehicleResolvedUpstream === true ? (p.vehicleIconPath || "") : "";
    if (!iconSrc && p && p.vehicleResolvedUpstream === true &&
        p.vehicleType && !p.vehicleFormationId &&
        (!p.vehicleFormationCandidates || !p.vehicleFormationCandidates.length)) {
      iconSrc = resolveVehicleArtwork(p.vehicleType) || "";
    }
    var vehiclePlan=p&&p.vehiclePlan;
    var plannedMarker=false;
    if(!iconSrc&&!(p&&p.vehicleResolvedUpstream===true)&&vehiclePlan&&_issuedVehiclePlans.has(vehiclePlan)){
      iconSrc=vehiclePlan.iconPath||'';plannedMarker=!!iconSrc;
    }
    if (artworkFailed === true || !isGalleryPng(iconSrc)) {
      return { kind: "unresolved", iconSrc: "" };
    }
    return { kind: "vehicle", iconSrc: iconSrc, planned: plannedMarker };
  }

  window.TrainVehicle = {
    version: '4.3.1242',
    resolveRealtime: resolveRealtime,
    resolveTimetableRun: resolveTimetableRun,
    resolve: resolve,
    selectMarkerArtwork: selectMarkerArtwork,
    registerFormationEvidence: registerFormationEvidence,
    resolveFormationEvidence: resolveFormationEvidence,
    clearFormationEvidenceOtherDates: clearFormationEvidenceOtherDates,
  };

  console.debug('[TrainVehicle] v4.3.1242 initialized（canonical EXACT/NARROWED/UNKNOWN vehicle identity contract）');
})();

})();
