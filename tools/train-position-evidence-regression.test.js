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
assert(/TRAIN_IDENTITY_CHANGED/.test(resolver),"changed timetable identity/train number must stay unresolved");
assert(/if\(!sameId&&!sameNo\)return \{unresolved:true/.test(resolver),"through boundary must not join changed identities");

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
assert(estimatorSource.includes('operationEvidence: _assignmentMatches'),
  'estimated trains must preserve operation evidence provenance');
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


assert(estimatorSource.includes("Object.keys(_assignmentVehicles).length === 1"),
  'operation model evidence must require unanimous decisive providers');
assert(estimatorSource.includes("operation-assignment-provider"),
  'agreed run-level operation evidence must be promotable to exact model');
assert(estimatorSource.includes("timetableEvidence: _assignmentMatches"),
  'dated operation evidence provenance must remain attached to timetable resolution');

const trainVehicleSource = fs.readFileSync('js/train-vehicle.js','utf8');
assert(trainVehicleSource.includes("'timetable-vehicle-evidence'"),
  'timetable-derived exact vehicle must retain timetable identity reason');
assert(!trainVehicleSource.includes("vehicleTypeManual") && !trainVehicleSource.includes("odptVehicleType"),
  'legacy manual/ODPT vehicle compatibility inputs must stay removed');


assert(estimatorSource.includes("operation-assignment-provider"),
  'Meguro/Sotetsu exact assignment must use the shared operation evidence promotion path');

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


const fusionSource = fs.readFileSync('js/data-fusion.js','utf8');
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
assert(estimatorSource.includes("timetableVehicleType: tt['vehicleType'] || ''"),
  'timetable/SQL vehicle identity must enter the explicit timetable source channel');
assert(!estimatorSource.includes("if (!window.TrainVehicle) _vehicleType = tt['vehicleType'] || ''"),
  'timetable identity must not bypass the central source arbiter when TrainVehicle is unavailable');
assert(fusionSource.includes('vehicleFormationCandidates: (p.vehicleFormationCandidates || []).slice()'),
  'running-chain registry must preserve formation candidate sets');
assert(fusionSource.includes('p.vehicleFormationCandidates = (v.vehicleFormationCandidates || p.vehicleFormationCandidates || []).slice()'),
  'running-chain inheritance must propagate formation candidate sets');

console.log("train-position-evidence-regression: PASS");
