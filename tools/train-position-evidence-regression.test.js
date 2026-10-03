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
assert(/TrainVehicle\.registerVehicle\(_mTrainNo, _mVehicle\)/.test(fusion),"manual timetable vehicle evidence must be registered independently of position");
assert(/_realtimeEvidenceWithoutPosition\s*=\s*\{\};/.test(fusion),"positionless realtime evidence must be snapshot-scoped");
assert(/Object\.keys\(_realtimeEvidenceWithoutPosition\)/.test(fusion),"positionless realtime vehicle evidence must have a consumer");
assert(/\(estimated\[_vlid\] \|\| \[\]\)\.forEach\(_rememberChainVehicle\)/.test(fusion),"verified timetable vehicle evidence must seed running-chain registry");
const estimator=read("js/train-position-estimator.js");
assert(/vehicleResolvedUpstream:\s*!!vehResult\.iconPath/.test(estimator),"estimator vehicle decision metadata must reach renderer");
assert(/TRAIN_VEHICLE_EVIDENCE_PROVIDERS/.test(estimator),"estimator must consume generic exact-train vehicle evidence providers");
assert(/Object\.keys\(_vehicleNames\)\.length === 1/.test(estimator),"conflicting exact-train vehicle providers must remain unresolved");
const tobuEvidence=read("data/timetables/tobu-limited-express-vehicle-evidence.js");
assert(/TRAIN_VEHICLE_EVIDENCE_PROVIDERS/.test(tobuEvidence),"Tobu exact-train evidence must register through generic provider registry");
assert(/id:\s*"tobu-official-limited-express-2026"/.test(tobuEvidence),"vehicle evidence provider must expose stable provenance id");
const renderer=read("js/trains-render.js");
assert(/_hasUpstreamVehicle/.test(renderer),"renderer must consume upstream vehicle resolution before fallback");
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


assert(estimatorSource.includes("Object.keys(_assignmentVehicles).length === 1"),
  'operation model evidence must require unanimous decisive providers');
assert(estimatorSource.includes("operation-assignment-provider"),
  'agreed run-level operation evidence must be promotable to exact model');


assert(estimatorSource.includes("operation-assignment-provider"),
  'Meguro/Sotetsu exact assignment must use the shared operation evidence promotion path');


assert(estimatorSource.includes("vehicleFormationId: Object.keys(_assignmentFormations).length === 1"),
  'formation identity must be exposed only when decisive providers agree on one formation');

console.log("train-position-evidence-regression: PASS");
