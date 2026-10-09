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
assert(/_realtimeEvidenceWithoutPosition\s*=\s*\{\};/.test(fusion),"positionless realtime evidence must be snapshot-scoped");

assert(/Object\.keys\(_realtimeEvidenceWithoutPosition\)/.test(fusion),"positionless realtime vehicle evidence must have a consumer");

const estimator=read("js/train-position-estimator.js");
const estimatorSource=estimator;
const fusionSource=fusion;
assert(/vehicleResolvedUpstream:\s*vehResult\.identityStatus === 'EXACT'/.test(estimator),
  "upstream vehicle authority must represent EXACT identity, not artwork availability");
const tobuEvidence=read("data/timetables/tobu-limited-express-vehicle-evidence.js");
assert(/TRAIN_VEHICLE_EVIDENCE_PROVIDERS/.test(tobuEvidence),"Tobu exact-train evidence must register through generic provider registry");
assert(/id:\s*"tobu-official-limited-express-2026"/.test(tobuEvidence),"vehicle evidence provider must expose stable provenance id");
assert(/if \(!d\) return null;/.test(tobuEvidence),
  "exact Tobu vehicle evidence must require an explicit service date");
assert(/!hasExplicitValidity && d !== provider\.effectiveDate/.test(tobuEvidence),
  "undated Tobu timetable rows must not become open-ended vehicle assignments");
const renderer=read("js/trains-render.js");
assert(renderer.includes('_request.state === "error"') && renderer.includes('_request.state === "empty"'),
  "empty API responses and request failures must use distinct states");
assert(renderer.includes('ODPTのリアルタイム位置情報が期限切れです') &&
       renderer.includes('ODPT 实时位置已过期'),
  "expired realtime status must have Japanese and Chinese fallbacks");
assert(renderer.includes('expiredRealtime = positions.some(function(p)'),
  "expired realtime must be tracked independently of timetable estimation");
assert(renderer.includes('updateEstimatedNote(el, getRealtimePositions(lineId));'),
  "source status must inspect raw positions even when stale realtime markers are filtered");

const trackLayoutSource=read("js/train-track-layout.js");
const trainsCssSource=read("css/trains.css");
assert(!/transition:\s*x\s+14s[\s\S]{0,120}y\s+14s/.test(trainsCssSource),
  "CSS must not compete with the JS/layout train-marker animation authority");
assert(/if \(!isFinite\(rawIdx\) \|\| rawIdx < 0\) return null;/.test(trackLayoutSource),
  "track layout must fail closed on missing/invalid stationIndex instead of coercing it to station 0");
assert(/if \(!loc\) continue;/.test(renderer),
  "renderer must fail closed when TrainTrackLayout cannot resolve position geometry");
assert(!/loc = \{ x: stationCoords\[idx\]\.x, y: stationCoords\[idx\]\.y/.test(renderer),
  "renderer must not reconstruct a second geometry path from station coordinates");

assert(!/Math\.min\(_epPos\.stationIndex \|\| 0, stationCoords\.length - 1\)/.test(renderer),
  "estimated-row bucketing must not coerce missing stationIndex to station 0");
assert(/if \(!isFinite\(_epRawIdx\) \|\| _epRawIdx < 0 \|\| _epRawIdx >= stationCoords\.length\) continue;/.test(renderer),
  "estimated rows must fail closed before occupancy/bucketing");
assert(/TrainTrackLayout owns target geometry; this marker owns interpolation/.test(renderer),
  "renderer must animate TrainTrackLayout targets through the single per-marker RAF authority");
assert(/cancelAnimationFrame\(existingIcon\._moveRaf\)/.test(renderer),
  "a new train snapshot must cancel the marker's previous RAF before continuing");
assert(/_icon\._displayX = _curX;[\s\S]{0,120}_icon\._displayY = _curY;/.test(renderer),
  "animation must persist the current interpolated marker position for interruption-safe continuation");
assert(/_distance > _snapDistance/.test(renderer),
  "implausibly large marker jumps must snap instead of sweeping across the map");
assert(/_displayNextStationIdx/.test(renderer),
  "marker continuity must persist the resolved next-station segment endpoint");
assert(/var _sameSegment = _targetIdx === _previousIdx && _targetNextIdx === _previousNextIdx;/.test(renderer) &&
       /var _advancedSegment = _targetIdx === _previousNextIdx;/.test(renderer),
  "cross-poll animation must require same-segment or adjacent-segment continuity");
assert(/var _adjacentGaps = \[\];[\s\S]{0,900}var _snapDistance = Math\.max\(80, _medianStationGap \* 2\.5\);/.test(renderer),
  "snap distance must be derived once from line geometry per render pass");
assert(!/var _adjacent = \[\];[\s\S]{0,700}var _medianGap/.test(renderer),
  "each train marker must not rescan the full station geometry for its snap threshold");
assert(/_moveTrainLabels\(trainLayer, trainUid, _curX, _curY/.test(renderer),
  "train labels must follow the marker in the same animation frame");
assert(/function _trainLabelSignature\(p, lineId\)/.test(renderer),
  "train labels must have a stable content signature across service updates");
assert(/existing\.getAttribute\("data-label-signature"\) !== signature/.test(renderer),
  "train label sync must refresh stale direction/destination/type content");
assert(!/markerById\[String\(trainUid\)\] = existingIcon;\s*appendTrainLabels/.test(renderer),
  "marker creation must use the same label synchronization lifecycle as updates");
assert(!/isLoop && _loopRect && _needMove && !window\.TrainTrackLayout/.test(renderer),
  "legacy loop RAF must not remain as a second animation path beside TrainTrackLayout");
assert(!/idx = clamp\(idx, 0, points\.length - 1\)/.test(trackLayoutSource),
  "out-of-range stationIndex must fail closed instead of collapsing onto an endpoint station");
assert(/stableStackOrdinal\(position, index\)/.test(trackLayoutSource),
  "multi-train stack offsets must be keyed by stable train identity across polling updates");
assert(!/\("train_" \+ pi\)/.test(renderer),
  "renderer must never use current row order as persistent train identity");
assert(!/\("row-" \+ index\)/.test(trackLayoutSource),
  "layout occupancy must never use current row order as stable train identity");
assert(/p\.runningChainId \|\| p\.trainId \|\| p\.sourceTrainId \|\| p\.timetableObjectId/.test(renderer),
  "renderer identity must use stable source-object or running-chain identifiers only");
assert(!/var trainUid = p\.runningChainId \|\| p\.trainId \|\| p\.trainNumber/.test(renderer),
  "bare train number must remain bounded fusion evidence, never persistent DOM marker identity");
assert(/var markerById = \{\};/.test(renderer) && /var _existingMarkers = trainLayer\.querySelectorAll\('\[data-train-id\]'\)/.test(renderer),
  "renderer must index existing train markers once per render pass");
assert(!/var _trainNodes = trainLayer\.querySelectorAll\('\[data-train-id\]'\)/.test(renderer),
  "renderer must not rescan every marker for every train row");
var _moveDirCalls = (renderer.match(/_trainMoveDir\(/g) || []).length;
assert(_moveDirCalls === 3,
  "_trainMoveDir must remain display-only: one definition plus label create/move consumers");
assert(/getDisplayMoveDir:\s*_trainMoveDir/.test(renderer),
  "layout may receive renderer direction only through the explicitly display-only fallback hook");
assert(!/getMoveDir:\s*_trainMoveDir/.test(renderer),
  "renderer display direction must never be wired back as geometry authority");
assert(/routePos:\s*routePos/.test(trackLayoutSource),
  "TrainTrackLayout must expose loop route position to the single marker animation authority");
assert(/_useLoopRoute[\s\S]{0,900}_loopPosToXY\(_curRoutePos, _loopRect\)/.test(renderer),
  "loop marker interpolation must follow route geometry instead of cutting corners in XY space");
assert(/p && p\.vehicleResolvedUpstream === true \? \(p\.vehicleIconPath \|\| ""\) : ""/.test(renderer),
  "renderer must consume only the upstream vehicle artwork projection");
assert(!/var exact = p && \(p\.vehicleIdentityStatus/.test(renderer),
  "renderer must not re-arbitrate vehicle identity status");
assert(!/vehicleResolvedFromRealtime/.test(renderer),
  "renderer must not branch on vehicle evidence source");
assert(/kind: iconSrc && !artworkFailed \? "vehicle" : "generic"/.test(renderer),
  "TrainMarker artwork must be exactly vehicle PNG or generic train");
assert(!/iconSrc \? "image" : "circle"/.test(renderer),
  "the legacy circle fallback kind must not return");
assert(!/outer\.setAttribute\("r", "8"\)/.test(renderer),
  "the legacy neutral circle fallback must not return");
assert(/_createGenericTrainMarker\(svgNS, className, color\)/.test(renderer) &&
       /createElementNS\(svgNS, "rect"\)/.test(renderer),
  "generic artwork must be an SVG primitive train marker, not a data-point dot");
assert(/marker\.addEventListener\("error"/.test(renderer) &&
       /_swapTrainMarkerToGeneric\(trainLayer, svgNS, marker, uid\)/.test(renderer),
  "vehicle PNG load failure must swap the single marker to generic artwork in place");
assert(/marker\._artworkSwapped/.test(renderer) &&
       /replaceChild\(g, marker\)/.test(renderer),
  "artwork swaps must be idempotent and replace the marker root, never overlay a second marker");
assert(/_trainMarkerSpec\(p, trainUid\)/.test(renderer),
  "the artwork decision must be keyed by the stable train identity");
assert(/existingIcon\.getAttribute\("data-marker-kind"\) !== markerSpec\.kind[\s\S]{0,260}removeChild\(existingIcon\)/.test(renderer),
  "marker kind changes must replace the old marker instead of layering image and fallback circle");
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
const loopDirectionBranch = render.indexOf("} else if (isLoopDir) {");
const genericDestinationBranch = render.indexOf("} else if (p.destinationStation) {", loopDirectionBranch);
assert(loopDirectionBranch >= 0 && genericDestinationBranch > loopDirectionBranch,
  "authoritative loop direction must outrank destinationStation in passenger-facing labels");
assert(!/isLoopDir && p\.destinationStation/.test(render),
  "loop destinationStation must not override InnerLoop/OuterLoop labels");

const trains=read("js/trains-data.js");
const runtimePolicy=read("data/core/runtime-config.js");
assert(fusion.includes('delete _timetableLoading[lineInfo.lineId];'),
  "ODPT timetable evidence loading must release its in-flight flag after completion");
assert(fusion.includes('Timetable may be loaded as operation/vehicle evidence'),
  "timetable evidence must be documented separately from position authority");
const odptClient=read("data/api/odpt-unified.js");
assert(odptClient.includes('window.ODPT_POSITION_REQUEST_STATUS[op] = { state: "loading"') &&
       odptClient.includes('state: "error"') && odptClient.includes('"ok" : "empty"'),
  "ODPT must distinguish loading, error and successful empty responses");
assert(renderer.includes('_request.state === "ok" && _request.assigned === true && !anyRealtime') &&
       renderer.includes('该线路暂无 ODPT 实时位置记录'),
  "operator success without line records must have its own status");
assert(odptClient.includes('if (!window.ODPT_TRAIN_POSITIONS) window.ODPT_TRAIN_POSITIONS = {};') &&
       !odptClient.includes('if (!window.ODPT_TRAIN_POSITIONS || !positionOperators)'),
  "full ODPT refresh must not clear all operator position snapshots");
assert(odptClient.includes('if (!result || !Array.isArray(data)) throw new Error("Invalid ODPT train position payload")') &&
       odptClient.includes('if (!resp.ok) throw new Error("HTTP " + resp.status);'),
  "ODPT position responses must reject malformed JSON payloads and HTTP errors");
assert(odptClient.includes('if (propagateError) return rateLimitedFetch(url);') &&
       odptClient.includes("fetchODPT(buildUrl(op, 'train'), true)") &&
       odptClient.includes('state: "error"'),
  "ODPT position network failures must propagate instead of being classified as empty");
assert(odptClient.includes('if (!hasPositions) return true;') &&
       odptClient.includes('if (!window.DataFusion.loadTrainPositions) return false;') &&
       odptClient.includes('return !!(lines && Object.keys(lines).length > 0);'),
  "cached realtime positions must wait for fusion and railway data readiness");
assert(odptClient.includes('operatorTs: window.ODPT_POSITION_SNAPSHOT_AT || {}') &&
       odptClient.includes('now - operatorTs > RAW_REALTIME_FRESH_MS') &&
       odptClient.includes('window.ODPT_POSITION_SNAPSHOT_AT[op] = operatorTs;'),
  "ODPT cached position snapshots must enforce per-operator freshness");
assert(odptClient.includes('Number.isFinite(delayRec.ts) && delayRec.ts <= now') &&
       odptClient.includes('Number.isFinite(posRec.ts) && posRec.ts <= now') &&
       odptClient.includes('!Array.isArray(posRec.data)'),
  "raw realtime cache must reject future timestamps and malformed position maps");
assert(odptClient.includes('window.ODPT_POSITION_REQUEST_STATUS[op]) return;') &&
       odptClient.includes('restoredPositions = true;') &&
       !odptClient.includes('window.ODPT_TRAIN_POSITIONS = posRec.data;'),
  "delayed cache restore must not overwrite live operator requests");
assert(odptClient.includes('requestId !== _requestId') &&
       odptClient.includes('status.requestId === positionRequestIds[op]'),
  "stale operator responses and stale fusion completions must not overwrite newer refresh state");
assert(odptClient.includes('status.assigned = true;'),
  "ODPT line absence must wait for position assignment");
assert(renderer.includes('ODPTの位置情報を取得できません') && renderer.includes('ODPT 未返回位置数据'),
  "train map must expose localized request failure and empty response states");

assert(!fusion.includes('}).catch(function() { return ensureManualTimetable(lineId); });'),
  "SQL failure must not silently switch to manual timetable positioning");
assert(fusion.includes('manual timetable fallback disabled:'),
  "SQL source failure must remain observable");
assert(odptClient.includes('throw new Error("TrainRun SQL query failed:'),
  "SQL failures must not silently become empty timetables");
assert(!odptClient.includes('}).catch(function(){ return []; }).finally(function(){ delete _trainRunInflight[key]; });'),
  "TrainRun SQL errors must propagate to callers");
assert(/defaultMode:\s*"UNKNOWN"/.test(runtimePolicy),"unknown API coverage must fail closed");
assert(/return mode === "NO_REALTIME" \|\| mode === "TIMETABLE_ONLY"/.test(fusion),"timetable position must require explicit non-realtime source assignment");
assert(/function _isFreshRealtimePosition/.test(trains),"realtime freshness guard missing");
assert(!/return _isFreshRealtimePosition\(p\) \? 0 : 8/.test(trains),"expired realtime must not promote timetable authority");
assert(/return 0; \/\/ Expiry is reported separately/.test(trains),"realtime source remains authoritative regardless of freshness");


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
assert(!fusionSource.includes("positionData.odptVehicleType"),
  'DataFusion must not expose a second ODPT vehicle identity field');



assert(!/tobu-official-2026-timetable-service-name/.test(estimatorSource),
  'service-name-only vehicle inference must not return');

assert(estimatorSource.includes("var explicitVehicle = (pos.vehicleIdentityStatus === 'EXACT')"),
  'running-chain formation evidence must originate from an already-EXACT resolved position');
assert(!estimatorSource.includes("var explicitVehicle = sourceTT['vehicleType'] || sourceTT['odpt:vehicleType'] || ''"),
  'raw timetable vehicleType must not be re-promoted directly into running-chain evidence');



assert(estimatorSource.includes("vehicleFormationId: _assignmentFormationIds.length === 1"),
  'formation identity must be exposed only when decisive providers agree on one formation');
assert(estimatorSource.includes("vehicleFormationCandidates: _assignmentFormationIds.slice()"),
  'formation candidate set must remain visible when formation identity is ambiguous');
assert(estimatorSource.includes("split(/\\s*\\/\\s*|\\s*,\\s*|\\s*\\|\\s*/)"),
  'multi-formation evidence must be split into candidates instead of treated as one formation');


assert(fusionSource.includes('if (!resolution || resolution.identityStatus !== "EXACT" || !resolution.name) return;'),
  'running-chain registry must store only canonical EXACT vehicle resolutions');
assert(fusionSource.includes('resolution: resolution'),
  'running-chain registry must store the canonical resolution object instead of projected field copies');
assert(fusionSource.includes('_projectVehicleResolution(p, v.resolution, true)'),
  'running-chain inheritance must reuse the single vehicle projection path');
assert(fusionSource.includes('_evResolution.identityStatus !== "EXACT"'),
  'realtime evidence without EXACT vehicle identity must not seed running-chain inheritance');
assert(fusionSource.includes('realtimeVehicleType: odptVehicleType'),
  'realtime API vehicle identity must enter the explicit realtime source channel');
assert(fusionSource.includes('_queueChainVehicle(_rp)'),
  'realtime rows must enter the single chain candidate pool rather than write registry directly');
assert(fusionSource.includes('sources.indexOf("realtime") >= 0') &&
       fusionSource.includes('sources.indexOf("realtime-derived") >= 0') &&
       fusionSource.includes('sources.indexOf("structural") >= 0') &&
       fusionSource.includes('sources.indexOf("timetable") >= 0'),
  'running-chain arbitration must rank the canonical sources array so converged multi-source evidence preserves realtime > derived > structural > dated/timetable priority');
assert(fusionSource.includes('_sources.indexOf("realtime") >= 0') &&
       fusionSource.includes('_sources.indexOf("realtime-derived") >= 0'),
  'vehicle projection must preserve realtime evidence flags when the resolver converges multiple sources');
assert(fusionSource.includes('_evSources.indexOf("realtime") < 0 && _evResolution.source !== "realtime"'),
  'positionless realtime vehicle evidence must use the canonical sources array rather than require a single-source resolver result');
assert(fusionSource.includes('var trainId = t["odpt:train"] || t["odpt:trainNumber"] || "";') &&
       fusionSource.includes('var trainNumber = String(t["odpt:trainNumber"] || t["odpt:train"] || "");') &&
       fusionSource.includes('trainId: trainId,') &&
       fusionSource.includes('trainNumber: trainNumber,'),
  'realtime source-object identity and service train number must remain separate while retaining bounded missing-field fallbacks');
assert(!fusionSource.includes('var trainId = t["odpt:trainNumber"] || t["odpt:train"] || "";'),
  'ODPT train number must not replace the source train object identity');
assert(fusionSource.includes('TrainOperationEvidence.resolveEvidence(positionData.trainNumber, {'),
  'realtime-derived vehicle evidence must be keyed by canonical train number, never the source train id');
assert(!fusionSource.includes('TrainOperationEvidence.resolveEvidence(trainId, {'),
  'source train id must not be reused as a train-number evidence key');
assert(fusionSource.includes('(posMap[_vlid] || []).forEach(function(_p) {\n                _inheritChainVehicle(_p);'),
  'canonical timetable/SQL EXACT vehicle evidence must be able to inherit onto realtime-position rows through the resolved running chain');
assert(estimatorSource.includes("timetableVehicleType: _timetableVehicleInput"),
  'timetable identity must enter TrainVehicle only through the unified timetable evidence channel');
assert(!estimatorSource.includes("operationVehicleCandidates:"),
  'operation candidates must not enter TrainVehicle as a third vehicle source');
assert(!estimatorSource.includes("_candidateSetsAgree"),
  'estimator must not duplicate candidate agreement arbitration');
assert(fusionSource.includes('sources.indexOf("structural") >= 0 || src === "structural" || src === "formation-evidence") return 3;') &&
  fusionSource.includes('sources.indexOf("timetable") >= 0 || src === "operation-assignment-provider" || src === "odpt" || src === "timetable") return 2;'),
  'running-chain registry rank must preserve structural/formation-before-timetable source priority');
assert(operationEvidenceSource.includes('if (exactKeys.length > 1) return null;'),
  'canonical resolver must keep conflicting exact vehicle identities unresolved');
assert(operationEvidenceSource.includes('first.vehicleType = "";') &&
  operationEvidenceSource.includes('first.vehicleCandidates = candidateKeys;'),
  'candidate-only evidence must remain candidate-only in the canonical resolver');
assert(!/tt\['vehicleType'\]\s*=\s*Object\.keys\(_assignmentVehicles\)/.test(estimatorSource),
  'dated operation evidence must not be written back into legacy timetable vehicleType');
assert(!estimatorSource.includes("if (!window.TrainVehicle) _vehicleType = tt['vehicleType'] || ''"),
  'timetable identity must not bypass the central source arbiter when TrainVehicle is unavailable');
assert(estimatorSource.includes("var chainVehicle = window.TrainVehicle.resolveFormationEvidence({"),
  'running-chain formation evidence must be resolved by the canonical TrainVehicle formation authority');
assert(estimatorSource.includes("pos.vehicleResolution = chainVehicle;") &&
       estimatorSource.includes("pos.vehicleSource = chainVehicle.source || 'formation-evidence';"),
  'running-chain formation projection must preserve the canonical resolution and structural provenance');
assert(!estimatorSource.includes("timetableVehicleType: chainVehicle.vehicleName"),
  'running-chain formation evidence must never be relabeled as timetable evidence');
assert(fusionSource.includes('formationCandidates: (p.vehicleFormationCandidates || []).slice()'),
  'running-chain registry must preserve formation candidate sets in the canonical resolution payload');
assert(fusionSource.includes('p.vehicleFormationCandidates = (v.formationCandidates || []).slice();'),
  'running-chain inheritance must propagate formation candidate sets from the canonical resolution payload');
assert(!fusionSource.includes('_p.vehicleType = _fe.vehicleName'),
  'fused formation evidence must not bypass the canonical vehicle projection with a direct identity write');
assert(fusionSource.includes('source:"formation-evidence", sources:["formation-evidence"]') &&
       fusionSource.includes('identityStatus:_fe.identityStatus||"EXACT"'),
  'dated formation evidence must retain its canonical structural provenance and exact identity state');
assert(fusionSource.includes('_queueChainVehicle({') && fusionSource.includes('vehicleFormationId:_fe.formationId'),
  'formation evidence must enter the existing pre-commit candidate queue');
assert(!fusionSource.includes('if (mode !== "SEGMENTED") return true; // HYBRID / COARSE / UNKNOWN'),
  'HYBRID/COARSE/UNKNOWN must not automatically authorize timetable position fallback');
assert(fusionSource.includes('if (_chainVehicleRegistry[_cid]) _chainVehicleRegistry[_cid].lastSeenAt = Date.now();'),
  'an active timetable running chain must keep confirmed vehicle identity alive across realtime coverage gaps');
assert(fusionSource.includes('Object.keys(posMap).forEach(function(_vlid) {') &&
       fusionSource.includes('_inheritChainVehicle(_p);') &&
       fusionSource.includes('Object.keys(estimated).forEach(function(_vlid) {'),
  'confirmed running-chain vehicle identity must project onto both realtime and timetable segments across line/operator boundaries');
assert(fusionSource.includes('if (!_activeChainIds[_cid] && (!_cv || !_cv.lastSeenAt ||'),
  'vehicle identity may expire only after the physical running chain is absent, not merely because realtime position disappeared');

const runningChainSource = fs.readFileSync('js/running-chain-resolver.js','utf8');
assert(!runningChainSource.includes('line.throughServices'),
  'running-chain adjacency must not read throughServices compatibility projection');
assert(runningChainSource.includes('var boundaries = Array.isArray(line.serviceBoundaries)'),
  'running-chain adjacency must originate from canonical serviceBoundaries');
assert(runningChainSource.includes('_directThrough[lineId].push(boundary.lineId)'),
  'direct-through runtime index must be projected from validated service boundaries');

console.log("train-position-evidence-regression: PASS");

const renderSource=fs.readFileSync(require("path").join(__dirname,"../js/trains-render.js"),"utf8");
assert(/function _isFreshRealtimeRecord\(record\)/.test(fusionSource));
assert(/!t \|\| !_isFreshRealtimeRecord\(t\)/.test(fusionSource));
assert(/record\["dct:valid"\]/.test(fusionSource));
assert(/record\["dc:date"\]/.test(fusionSource));
assert(/record\["odpt:frequency"\]/.test(fusionSource));
assert(!/if \(!p\.sourceValidUntil\) return true;/.test(renderSource));
assert(/p\.sourceUpdatedAt/.test(renderSource) && /p\.sourceFrequency/.test(renderSource));
console.log("train-position freshness guard: 7 PASS");

