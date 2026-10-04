const fs=require("fs"),path=require("path"),assert=require("assert"),vm=require("vm");
const root=path.join(__dirname,"..");
function read(p){return fs.readFileSync(path.join(root,p),"utf8");}

for(const js of ["js/data-fusion.js","js/train-position-estimator.js","js/running-chain-resolver.js","js/trains-data.js"]){
  new vm.Script(read(js),{filename:js});
}

const fusion=read("js/data-fusion.js");
assert(/ambiguous realtime line identity/.test(fusion),"ambiguous realtime line identity must remain unresolved");
assert(!/mainLines\.sort[\s\S]{0,500}targetLine\s*=\s*mainLines\[0\]/.test(fusion),"must not choose longest line for ambiguous realtime");
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
assert(/\(estimated\[_vlid\] \|\| \[\]\)\.forEach\(_rememberChainVehicle\)/.test(fusion),"verified timetable vehicle evidence must seed running-chain registry");
const estimator=read("js/train-position-estimator.js");
const estimatorSource=estimator;
const fusionSource=fusion;
assert(/vehicleResolvedUpstream:\s*vehResult\.identityStatus === 'EXACT'/.test(estimator),
  "upstream vehicle authority must represent EXACT identity, not artwork availability");
assert(/TRAIN_VEHICLE_EVIDENCE_PROVIDERS/.test(estimator),"estimator must consume generic exact-train vehicle evidence providers");
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


assert(estimatorSource.includes('TRAIN_OPERATION_EVIDENCE_PROVIDERS'),
  'estimator must consult train operation evidence providers');
assert(estimatorSource.includes('Object.keys(_assignmentOperators).length === 1'),
  'conflicting operation-provider operators must remain unresolved');
assert(estimatorSource.includes('vehicleIdentityStatus: vehResult.identityStatus'),
  'estimated trains must expose vehicle identity resolution state');


assert(estimatorSource.includes('rec.decisive && rec.operator'),
  'only decisive graded evidence may establish assignment operator');
assert(estimatorSource.includes('timetableEvidence: _assignmentMatches'),
  'dated timetable evidence must reach the central vehicle authority');
assert(estimatorSource.includes('_resolvedOperationCodeList.length === 1'),
  'operation-code bridge must require one unanimous mapped operation code');
assert(estimatorSource.includes('if (!_matchedProviderIndexes[providerIndex])'),
  'operation-code bridge must retry only providers that did not already match');
assert(estimatorSource.includes('_bridgedOperationCtx.operationCode = _resolvedOperationCodeList[0]'),
  'mapped train-number operation code must reach downstream dated formation providers');
assert(/at:\s*\(function\(\)\{ var d=new Date\(Date\.now\(\)\+9\*60\*60\*1000\)/.test(estimatorSource),
  'segmented operation evidence must receive JST service time, not UTC');

const operationEvidenceSource = fs.readFileSync('data/timetables/train-operation-evidence.js','utf8');
assert(operationEvidenceSource.includes('if (timed.length !== 1) return null;'),
  'segmented operation evidence must remain unresolved when service time hits zero or multiple segments');
assert(operationEvidenceSource.includes('if (hasTimedSegments)'),
  'time-segmented operation evidence must not collapse back to an all-day identity');
assert(operationEvidenceSource.includes("evidenceRole: rec.evidenceRole || ''"),
  'normalized operation evidence must preserve SQL primary/fallback policy metadata');
assert(operationEvidenceSource.includes('realtimeApiAvailable: rec.realtimeApiAvailable === true'),
  'normalized operation evidence must preserve realtime API capability metadata');
assert(operationEvidenceSource.includes("realtimeVehicleIdentityStatus: rec.realtimeVehicleIdentityStatus || ''"),
  'normalized operation evidence must preserve realtime vehicle-identity capability status');
assert(operationEvidenceSource.includes('evidenceRole:hit.evidenceRole||""'),
  'canonical snapshot provider must propagate evidence role instead of dropping source policy');


assert(estimatorSource.includes("Object.keys(_assignmentVehicles).length === 1"),
  'operation model evidence must require unanimous decisive providers');
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
assert(estimatorSource.includes("timetableVehicleType: _timetableVehicleInput"),
  'timetable identity must enter TrainVehicle only through the unified timetable evidence channel');
assert(!estimatorSource.includes("operationVehicleCandidates:"),
  'operation candidates must not enter TrainVehicle as a third vehicle source');
assert(estimatorSource.includes("var _candidateSetsAgree = _assignmentCandidateSets.every"),
  'ambiguous timetable candidates must require provider agreement before entering the timetable channel');
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
assert(fusionSource.includes('timetableVehicleType: _fe.vehicleName'),
  'fused formation evidence must use the timetable vehicle source channel');

console.log("train-position-evidence-regression: PASS");
