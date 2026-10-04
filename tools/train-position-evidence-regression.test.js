const fs=require("fs"),path=require("path"),assert=require("assert"),vm=require("vm");
const root=path.join(__dirname,"..");
function read(p){return fs.readFileSync(path.join(root,p),"utf8");}

for(const js of ["js/data-fusion.js","js/train-position-estimator.js","js/running-chain-resolver.js","js/trains-data.js"]){
  new vm.Script(read(js),{filename:js});
}

const fusion=read("js/data-fusion.js");
assert(/ambiguous realtime line identity/.test(fusion),"ambiguous realtime line identity must remain unresolved");
assert(!/mainLines\.sort[\s\S]{0,500}targetLine\s*=\s*mainLines\[0\]/.test(fusion),"must not choose longest line for ambiguous realtime");
assert(/_queueChainVehicle/.test(fusion) && /Object\.keys\(_chainVehicleCandidates\)/.test(fusion),
  "vehicle evidence must converge through one chain candidate pool and one registry commit");
assert(/_uniqueTimetableRailwayForTrain/.test(fusion),"missing unique timetable railway recovery");
assert(/keys\.length === 1 \? keys\[0\] : ""/.test(fusion),"railway recovery must require a unique match");
assert(/_CHAIN_EVIDENCE_TTL_MS\s*=\s*3\s*\*\s*60\s*\*\s*1000/.test(fusion),"dropout evidence TTL missing");
assert(/_realtimeEvidenceWithoutPosition/.test(fusion),"missing-position realtime evidence must be separated");
assert(!/if \(!mayUseTimetablePosition\(lineId\)\)[\s\S]{0,120}resolve\(true\)/.test(fusion),"FULL realtime must not block manual vehicle evidence loading");
assert(!/TrainVehicle\.registerVehicle/.test(fusion),"DataFusion must not accumulate train-number vehicle history");
assert(/_realtimeEvidenceWithoutPosition\s*=\s*\{\};/.test(fusion),"positionless realtime evidence must be snapshot-scoped");
assert(!/positionData\.trainClass\s*=\s*positionData\.trainClass\s*\|\|\s*resolveTrainClass/.test(fusion),
  "DataFusion must not fill trainClass from line/operator/train context");

assert(/Object\.keys\(_realtimeEvidenceWithoutPosition\)/.test(fusion),"positionless realtime vehicle evidence must have a consumer");

const estimator=read("js/train-position-estimator.js");
const estimatorSource=estimator;
const fusionSource=fusion;
assert(/vehicleResolvedUpstream:\s*vehResult\.identityStatus === 'EXACT'/.test(estimator),
  "upstream vehicle authority must represent EXACT identity, not artwork availability");
assert(!/TRAIN_OPERATION_EVIDENCE_PROVIDERS/.test(estimator),"estimator must not directly iterate operation evidence providers");
assert(/Object\.keys\(_vehicleNames\)\.length === 1/.test(estimator),"conflicting exact-train vehicle providers must remain unresolved");
const tobuEvidence=read("data/timetables/tobu-limited-express-vehicle-evidence.js");
assert(/TRAIN_VEHICLE_EVIDENCE_PROVIDERS/.test(tobuEvidence),"Tobu exact-train evidence must register through generic provider registry");
assert(/id:\s*"tobu-official-limited-express-2026"/.test(tobuEvidence),"vehicle evidence provider must expose stable provenance id");
assert(/if \(!d\) return null;/.test(tobuEvidence),
  "exact Tobu vehicle evidence must require an explicit service date");
assert(/!hasExplicitValidity && d !== provider\.effectiveDate/.test(tobuEvidence),
  "undated Tobu timetable rows must not become open-ended vehicle assignments");
const renderer=read("js/trains-render.js");
assert(/_hasUpstreamVehicle/.test(renderer),"renderer must consume upstream vehicle resolution");
assert(/var _identityExact = p\.vehicleIdentityStatus === "EXACT"/.test(renderer),
  "renderer must hard-gate concrete artwork on EXACT vehicle identity");
assert(/var _hasUpstreamVehicle = _identityExact/.test(renderer),
  "upstream authority flags alone must not render concrete vehicle artwork");
assert(!/TrainVehicle\.resolve\(_vrCtx\)/.test(renderer),"renderer must not re-resolve vehicle identity");
assert(!/__trainIconCache/.test(renderer),"renderer must not resurrect stale vehicle artwork from cache");
assert(/if \(!stationKey\)[\s\S]{0,800}return;/.test(fusion),"missing fromStation must not create realtime position");

const resolver=read("js/running-chain-resolver.js");
assert(/numberChanged:!sameId&&!sameNo/.test(resolver),
  "running-chain resolver must explicitly mark train-number changes");
assert(/pairing is unique for BOTH segments/.test(resolver),
  "changed train numbers may join only through the unique operational-boundary rule");

for(const js of ["js/data-fusion.js","js/train-position-estimator.js","js/trains-render.js"]){
  assert(!/loopServiceMode/.test(read(js)),js+" must not synthesize loop service state");
}
const render=read("js/trains-render.js");
assert(/isLoopDir && p\.destinationStation/.test(render),"loop trains with real terminal must display destination directly");

const trains=read("js/trains-data.js");
assert(/function _isFreshRealtimePosition/.test(trains),"realtime freshness guard missing");
assert(/return _isFreshRealtimePosition\(p\) \? 0 : 8/.test(trains),"expired realtime must lose source priority");


assert(!estimatorSource.includes('TRAIN_OPERATION_EVIDENCE_PROVIDERS'),
  'estimator must not bypass the canonical operation evidence resolver');
assert(estimatorSource.includes('TrainOperationEvidence.resolveEvidence'),
  'estimator must use the canonical operation evidence resolver');
assert(estimatorSource.includes('vehicleIdentityStatus: vehResult.identityStatus'),
  'estimated trains must expose vehicle identity resolution state');


assert(estimatorSource.includes('_resolvedEvidence && _resolvedEvidence.decisive && _resolvedEvidence.operator'),
  'only decisive canonical evidence may establish assignment operator');
assert(estimatorSource.includes('timetableEvidence: _assignmentMatches'),
  'dated timetable evidence must reach the central vehicle authority');
assert(estimatorSource.includes('normalizeOperationCode(trainNumber, _baseOperationCtx)'),
  'operation-code normalization must occur before the canonical resolver');
assert(/at:\s*\(function\(\)\{ var d=new Date\(Date\.now\(\)\+9\*60\*60\*1000\)/.test(estimatorSource),
  'segmented operation evidence must receive JST service time, not UTC');

const operationEvidenceSource = fs.readFileSync('data/timetables/train-operation-evidence.js','utf8');
assert(operationEvidenceSource.includes('if (timed.length !== 1) return null;'),
  'segmented operation evidence must remain unresolved when service time hits zero or multiple segments');
assert(operationEvidenceSource.includes('if (hasTimedSegments)'),
  'time-segmented operation evidence must not collapse back to an all-day identity');
assert(operationEvidenceSource.includes("evidenceRole: rec.evidenceRole || ''"),
  'normalized operation evidence must preserve SQL primary/fallback policy metadata');
assert(!operationEvidenceSource.includes('realtimeApiAvailable: rec.realtimeApiAvailable'),
  'operation evidence must not carry duplicate realtime coverage policy');
assert(!operationEvidenceSource.includes('realtimeVehicleIdentityStatus: rec.realtimeVehicleIdentityStatus'),
  'operation evidence must not carry duplicate realtime identity policy');
assert(operationEvidenceSource.includes('evidenceRole:hit.evidenceRole||""'),
  'canonical snapshot provider must propagate evidence role instead of dropping source policy');
assert(operationEvidenceSource.includes('id: "canonical-dated-vehicle-evidence"'),
  'canonical dated evidence must register through the existing operation-evidence provider channel');
assert(operationEvidenceSource.includes('var exactTrain = [], operation = [];'),
  'dated evidence must prefer exact train-number identity before operation-level evidence');
assert(operationEvidenceSource.includes('var matches = exactTrain.length ? exactTrain : operation;'),
  'dated train-number evidence must outrank operation-code evidence');
assert(operationEvidenceSource.includes('if (Object.keys(identities).length !== 1) return null;'),
  'dated evidence conflicts must remain unresolved rather than selecting the first row');
assert(operationEvidenceSource.includes('id:"canonical-vehicle-family-rules"'),
  'family rules must use the existing operation-evidence provider channel');
assert(operationEvidenceSource.includes('if (r.calendarType && (!cal || String(r.calendarType).toLowerCase()!==cal)) return false;'),
  'calendar-scoped family rules must refuse to match without the correct calendar');
assert(operationEvidenceSource.includes('if (exactKeys.length>1) return null;'),
  'conflicting exact family rules must remain unresolved');
assert(operationEvidenceSource.includes('provenance:"canonical operation family ownership rule"'),
  'ownership-only family rules must remain model-free constraints');


assert(estimatorSource.includes('_resolvedEvidence && _resolvedEvidence.vehicleType'),
  'operation model evidence must come from the canonical resolver');
assert(estimatorSource.includes("timetableEvidence: _assignmentMatches"),
  'dated operation evidence provenance must remain attached to timetable resolution');

const trainVehicleSource = fs.readFileSync('js/train-vehicle.js','utf8');
assert(trainVehicleSource.includes("'timetable-vehicle-evidence'"),
  'timetable-derived exact vehicle must retain timetable identity reason');
assert(!trainVehicleSource.includes("vehicleTypeManual") && !trainVehicleSource.includes("odptVehicleType"),
  'legacy manual/ODPT vehicle compatibility inputs must stay removed');
assert(!estimatorSource.includes("vehicleTypeManual"),
  'estimator must not resurrect the legacy manual vehicle channel');
assert(!fusionSource.includes("positionData.odptVehicleType"),
  'DataFusion must not expose a second ODPT vehicle identity field');



assert(!/tobu-official-2026-timetable-service-name/.test(estimatorSource),
  'service-name-only vehicle inference must not return');
assert(!/TrainVehicle\.registerVehicle/.test(estimatorSource),
  'estimator must not accumulate train-number vehicle history');

assert(estimatorSource.includes("var explicitVehicle = (pos.vehicleIdentityStatus === 'EXACT')"),
  'running-chain formation evidence must originate from an already-EXACT resolved position');
assert(!estimatorSource.includes("var explicitVehicle = sourceTT['vehicleType'] || sourceTT['odpt:vehicleType'] || ''"),
  'raw timetable vehicleType must not be re-promoted directly into running-chain evidence');



assert(estimatorSource.includes("vehicleFormationId: Object.keys(_assignmentFormations).length === 1"),
  'formation identity must be exposed only when decisive providers agree on one formation');
assert(estimatorSource.includes("vehicleFormationCandidates: Object.keys(_assignmentFormations)"),
  'formation candidate set must remain visible when formation identity is ambiguous');
assert(estimatorSource.includes("split(/\\s*\\/\\s*|\\s*,\\s*|\\s*\\|\\s*/)"),
  'multi-formation evidence must be split into candidates instead of treated as one formation');


assert(fusionSource.includes('if (!_identityExact || !p.vehicleType) return;'),
  'running-chain registry must hard-reject non-EXACT or identity-less vehicle records');
assert(fusionSource.includes('p.vehicleIdentityStatus === "EXACT"'),
  'running-chain registry must accept exact model evidence');
assert(!fusionSource.includes('_src === "trainNo"'),
  'train-number confidence must never qualify vehicle identity for running-chain inheritance');
assert(fusionSource.includes('_evResolution.identityStatus !== "EXACT"'),
  'realtime evidence without EXACT vehicle identity must not seed running-chain inheritance');
assert(!/_rtVehicle\.source === "trainNo"/.test(fusionSource),
  'train-number history must not be promoted as realtime vehicle evidence');
assert(fusionSource.includes('realtimeVehicleType: odptVehicleType'),
  'realtime API vehicle identity must enter the explicit realtime source channel');
assert(fusionSource.includes('_queueChainVehicle(_rp)'),
  'realtime rows must enter the single chain candidate pool rather than write registry directly');
assert(fusionSource.includes('p.vehicleResolvedFromRealtime === true || src === "realtime" ? 5') &&
       fusionSource.includes('p.vehicleResolvedFromRealtimeDerived === true || src === "realtime-derived" ? 4') &&
       fusionSource.includes('src === "structural" ? 3') &&
       fusionSource.includes('src === "operation-assignment-provider" || src === "odpt" || src === "timetable" ? 2'),
  'running-chain arbitration must preserve realtime > derived > structural > dated/timetable priority');
assert(fusionSource.includes('(posMap[_vlid] || []).forEach(function(_p) {\n                _inheritChainVehicle(_p);'),
  'canonical timetable/SQL EXACT vehicle evidence must be able to inherit onto realtime-position rows through the resolved running chain');
assert(estimatorSource.includes("timetableVehicleType: _timetableVehicleInput"),
  'timetable identity must enter TrainVehicle only through the unified timetable evidence channel');
assert(!estimatorSource.includes("operationVehicleCandidates:"),
  'operation candidates must not enter TrainVehicle as a third vehicle source');
assert(!estimatorSource.includes("_candidateSetsAgree"),
  'estimator must not duplicate candidate agreement arbitration');
assert(fusionSource.includes('src === "structural" ? 3') &&
  fusionSource.includes('src === "operation-assignment-provider" || src === "odpt" || src === "timetable" ? 2'),
  'running-chain registry rank must preserve structural-before-timetable source priority');
assert(operationEvidenceSource.includes('if (exactKeys.length > 1) return null;'),
  'canonical resolver must keep conflicting exact vehicle identities unresolved');
assert(operationEvidenceSource.includes('first.vehicleType = "";') &&
  operationEvidenceSource.includes('first.vehicleCandidates = candidateKeys;'),
  'candidate-only evidence must remain candidate-only in the canonical resolver');
assert(!/tt\['vehicleType'\]\s*=\s*Object\.keys\(_assignmentVehicles\)/.test(estimatorSource),
  'dated operation evidence must not be written back into legacy timetable vehicleType');
assert(!estimatorSource.includes("if (!window.TrainVehicle) _vehicleType = tt['vehicleType'] || ''"),
  'timetable identity must not bypass the central source arbiter when TrainVehicle is unavailable');
assert(!estimatorSource.includes("pos.vehicleType = chainVehicle.vehicleName"),
  'running-chain vehicle evidence must not bypass TrainVehicle with a direct identity write');
assert(estimatorSource.includes("var chainResolved = window.TrainVehicle.resolve({"),
  'running-chain vehicle evidence must re-enter the existing TrainVehicle authority');
assert(estimatorSource.includes("timetableVehicleType: chainVehicle.vehicleName"),
  'running-chain vehicle evidence must enter through the timetable source channel');
assert(fusionSource.includes('vehicleFormationCandidates: (p.vehicleFormationCandidates || []).slice()'),
  'running-chain registry must preserve formation candidate sets');
assert(fusionSource.includes('p.vehicleFormationCandidates = (v.vehicleFormationCandidates || p.vehicleFormationCandidates || []).slice()'),
  'running-chain inheritance must propagate formation candidate sets');
assert(!fusionSource.includes('_p.vehicleType = _fe.vehicleName'),
  'fused formation evidence must not bypass TrainVehicle with a direct identity write');
assert(fusionSource.includes('var _feResolved = window.TrainVehicle.resolve({'),
  'fused formation evidence must re-enter the existing TrainVehicle authority');
assert(/timetableVehicleType\s*:\s*_fe\.vehicleName/.test(fusionSource),
  'fused formation evidence must use the timetable vehicle source channel');
assert(fusionSource.includes('_queueChainVehicle({') && fusionSource.includes('vehicleFormationId:_fe.formationId'),
  'formation evidence must enter the existing pre-commit candidate queue');
assert(!fusionSource.includes('_rememberChainVehicle(_formationCandidate)'),
  'formation evidence must not perform a second registry commit');

console.log("train-position-evidence-regression: PASS");
