/*
 * Pixel Tetsudo - Train operation evidence registry
 * v4.3.1054
 *
 * B1 bridge: concrete operation/train-number evidence -> responsible operator.
 * Providers must use verified run-level evidence. Line/service defaults, number
 * prefixes/ranges and hash assignment are explicitly forbidden here.
 */
(function() {
  "use strict";

  var providers = window.TRAIN_OPERATION_EVIDENCE_PROVIDERS ||
    (window.TRAIN_OPERATION_EVIDENCE_PROVIDERS = []);

  function register(provider) {
    if (!provider || !provider.id || typeof provider.resolveEvidence !== 'function') return false;
    for (var i = 0; i < providers.length; i++) {
      if (providers[i] && providers[i].id === provider.id) return false;
    }
    providers.push(provider);
    return true;
  }

  window.TrainOperationEvidence = {
    register: register,
    providers: providers,
    policy: {
      exactRunEvidenceOnly: true,
      forbidLineDefault: true,
      forbidNumberRangeGuess: true,
      forbidPrefixGuess: true,
      forbidHashAssignment: true
    }
  };

  console.debug('[TrainOperationEvidence] v4.3.1054 initialized (verified run-level evidence only)');
})();
