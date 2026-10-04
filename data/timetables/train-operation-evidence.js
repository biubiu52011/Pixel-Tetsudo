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
      // A/C run-level evidence may decide a dated assignment. B is structural
      // constraint only. D is a lead and must never decide identity by itself.
      decisive: (grade === 'A' || grade === 'C') && !!observedDate && !!sourceUrl
    };
  }

  function normalizeOperationCode(trainNumber, ctx) {
    ctx = ctx || {};
    var raw = String(trainNumber || "").toUpperCase().trim();
    // Explicit working-number forms are lossless and safe across through networks.
    // Examples: 03K, 50T, 02S, 91G, A1291G, B691G.
    var explicit = raw.match(/(?:^|[^0-9A-Z])(?:A|B)?(\d{1,4})([KSMTGE])$/);
    if (explicit) {
      var digits = explicit[1];
      // A1291G/B691G encode the working number in the final two digits.
      if (/^[AB]/.test(raw) && digits.length >= 3) digits = digits.slice(-2);
      return String(parseInt(digits, 10)).padStart(2, "0") + explicit[2];
    }
    // Tozai public train numbers preserve the working suffix in their final
    // two digits + owner letter: 507K -> 07K, 603K -> 03K, 655S -> 55S,
    // A650T -> 50T. JR East / published operation tables confirm this form.
    if (/Tozai|ChuoSobu|ToyoRapid|東西|中央.*総武|東葉/i.test([ctx.lineId,ctx.railway].join("|"))) {
      var tz = raw.match(/(?:^|[^0-9A-Z])(?:A|B)?\d*(\d{2})([KST])(?:R)?$/);
      if (tz) return tz[1] + tz[2];
    }
    // Provider-proven public-number form already used by Den-en-toshi:
    // 026-081 -> 26K, 057-102 -> 57S, 050-... -> 50T.
    if (/Denentoshi|Hanzomon|田園都市|半蔵門/i.test([ctx.lineId,ctx.railway].join("|"))) {
      var dt = raw.match(/^(\d{3})[-_]/);
      if (dt) {
        var n = parseInt(dt[1],10);
        if (n>=1 && n<=26) return String(n).padStart(2,"0")+"K";
        if (n>=51 && n<=77 && n%2===1) return String(n).padStart(2,"0")+"S";
        if (n>=50 && n<=82 && n%2===0) return String(n).padStart(2,"0")+"T";
      }
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
          provenance:"canonical vehicle operation evidence snapshot",observedDate:d};
      }
    });
  }

  registerCanonicalSnapshotProvider();

  window.TrainOperationEvidence = {
    register: register,
    normalizeEvidence: normalizeEvidence,
    normalizeOperationCode: normalizeOperationCode,
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
