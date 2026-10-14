const fs=require("fs"),path=require("path"),assert=require("assert"),vm=require("vm");
const root=path.join(__dirname,"..");
function read(p){return fs.readFileSync(path.join(root,p),"utf8");}

for(const js of ["js/data-fusion.js","js/train-position-estimator.js","js/running-chain-resolver.js","js/trains-data.js"]){
  new vm.Script(read(js),{filename:js});
}

const fusion=read("js/data-fusion.js");
assert(/ambiguous realtime line identity/.test(fusion),"ambiguous realtime line identity must remain unresolved");
assert(fusion.includes('if (_mappedMatches.length === 1) targetLine = _mappedMatches[0];') &&
       fusion.includes('if (_exactMatches.length === 1) targetLine = _exactMatches[0];') &&
       !fusion.includes('mappedLids.indexOf(ml.lid) >= 0) { targetLine = ml; break; }'),
  "ODPT railway ownership must not choose the first matching segment on an ambiguous station");
assert(fusion.includes('var _shortRailway = String(railwayName).split(".").pop();') &&
       fusion.includes('_railwayCodeLines[_shortRailway]'),
  "ODPT railway namespace prefix must be normalized before unique-match lookup");
assert(fusion.includes('var existingIdx = trainId && _linePositionIndex.has(trainId)') &&
       fusion.includes('if (trainId) _linePositionIndex.set(trainId, posMap[lid].length);'),
  "ODPT records with missing source train identity must not overwrite each other");
assert(fusion.includes('updatedMs > now + 60000'),
  "impossibly future-dated ODPT dc:date must not be accepted as live");
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
assert(/serviceTime:\s*_snapshotServiceTime/.test(fusion) &&
       /requireTrainNumberMatch:\s*true/.test(read("data/timetables/train-operation-evidence.js")),
  "ODPT live mapping must admit only dated, exact train-number formation observations");
assert(/timetableVehicleType:\s*_realtimeReferenceModel/.test(fusion) &&
       /positionData\.vehicleFormationCandidates = _rtFormations/.test(fusion),
  "ODPT train vehicle reference and dated formation must share the canonical resolver");
assert(/_snapshotJstNow\.getUTCHours\(\)/.test(fusion) &&
       /_serviceDayNow\.getUTCDate\(\)/.test(fusion),
  "ODPT train evidence date must use JST rather than client device timezone");
assert(/verifiedTimetableArtworkPath:\s*_plannedSqlVehicle/.test(estimator) &&
       /tt\._sqlVehicleMappingLevel === 'dated_schedule_rule'/.test(estimator),
  'source-dated SQL artwork must reach the one vehicle resolver');
for(const rel of ['pages/trains.html','pages/realtime.html']){
 const html=read(rel);
 for(const file of ['odpt-unified.js','train-vehicle.js','vehicle-operation-evidence-data.js',
                    'train-operation-evidence.js','train-position-estimator.js','data-fusion.js']){
  const pinnedVersion = ['train-position-estimator.js','data-fusion.js'].includes(file)
    ? '4.3.1192' : '4.3.1180';
  const escapedFile = file.replace(/\./g, '\\.');
  const version = html.match(new RegExp(escapedFile + '\\?v=(\\d+\\.\\d+\\.\\d+)'));
  const actual = version && version[1].split('.').map(Number);
  const minimum = pinnedVersion.split('.').map(Number);
  assert(actual && actual[0] === minimum[0] && actual[1] === minimum[1] && actual[2] >= minimum[2],
    rel+' still caches older ODPT mapping: '+file);
 }
}
assert(/function matchRealtimeVehicleEvidence\(/.test(estimator) &&
       /_timetableIndexCache.index\[op\]/.test(estimator) &&
       /matchRealtimeVehicleEvidence:\s*matchRealtimeVehicleEvidence/.test(estimator),
  "ODPT realtime trains must join the already indexed timetable evidence on FULL lines");
assert(/matchRealtimeVehicleEvidence\(\s*_liveLineId,_live,allLines\)/.test(fusion) &&
       /verifiedTimetableArtworkPath:_scheduleModel.artworkPath/.test(fusion) &&
       /vehicleEvidenceConflict = _mergedVehicle.identityStatus !== 'EXACT'/.test(fusion),
  "live+schedule exact vehicle identity must pass through the single PNG resolver");
assert(/p.vehicleEvidenceConflict\) return p/.test(fusion),
  "a live/timetable model conflict must not inherit a stale chain default");
assert(/now.getUTCHours\(\) < 4/.test(estimator) &&
       /now.getUTCFullYear\(\)/.test(estimator),
  "ODPT calendar and minute calculations must use JST service date");
// Asset versions were checked against the minimum vehicle-join release above.
// Exercise the *actual* indexed realtime/TrainTimetable join with two
// simultaneous records: an ODPT schedule with no vehicle and a sourced
// timetable row with the same physical itinerary and certified PNG.
{
  const start=estimator.indexOf('  function matchRealtimeVehicleEvidence(');
  const end=estimator.indexOf('  // ========== Public API',start);
  assert(start>0&&end>start);
  const rows=[
    {no:'1203K',sig:'same-itinerary',model:'',calendar:'odpt.Calendar:Weekday',
      direction:'Inbound',date:'2026-10-13'},
    {no:'1203K',sig:'same-itinerary',model:'Example1000系',
      calendar:'odpt.Calendar:Weekday',direction:'Inbound',date:'2026-10-13',
      _positionSource:'supabase-train-run',_sqlVehicleMappingLevel:'dated_schedule_rule',
      vehicleType:'Example1000系',_sqlVehicleArtworkPath:'images/列车/X/example.png'}
  ];
  // Fixtures use the same ODPT fields that the production matcher reads.
  rows.forEach(function(tt) {
    tt['odpt:trainNumber']=tt.no;
    tt['odpt:calendar']=tt.calendar;
    tt._serviceDate=tt.date;
    tt['odpt:railDirection']='odpt.RailDirection:Example.'+tt.direction;
  });
  const context=vm.createContext({
    window:{ODPTClient:{LINE_RAILWAY_CODE:{}},
      TrainIcons:{resolveVehicleDisplayName:function(n){return n;}}},
    _timetableIndexCache:{index:{Example:{TestLine:rows}}},
    getCurrentCalendars:()=>['odpt.Calendar:Weekday'],
    getCurrentMinutes:()=>612,
    getEstimatorStationLayout:()=>({workLine:{stations:['A','B']},stationIndexMap:{A:0,B:1}}),
    compileTrainRun:function(tt){
      return {directionName:tt.direction,scheduledItineraryKey:tt.sig,
        timetableObjectId:'tt:'+tt.sig,
        stops:[{arrivalMinute:600,departureMinute:600},{arrivalMinute:620,departureMinute:620}]};
    },
    resolveTrainRunIdentity:function(run,tt){
      return {vehicleResult:{name:tt.model||'',identityStatus:tt.model?'EXACT':'UNKNOWN'}};
    }
  });
  vm.runInContext(estimator.slice(start,end)+
    '\nthis.join=matchRealtimeVehicleEvidence;',context);
  const lines={TestLine:{operator:'Example',stations:['A','B']}};
  const live={positionSource:'realtime-api',trainNumber:'1203K',
    railDirection:'Inbound',serviceDate:'2026-10-13'};
  const result=context.join('TestLine',live,lines);
  assert(result&&result.model==='Example1000系'&&
    result.artworkPath==='images/列车/X/example.png',
    'untyped ODPT + same-run certified timetable must produce exact PNG proof');
  assert.strictEqual(context.join('TestLine',{...live,trainNumber:'9999K'},lines),null,
    'different train number cannot borrow the model');
  assert.strictEqual(context.join('TestLine',{...live,serviceDate:'2026-10-14'},lines),null,
    'the same train number on a later day cannot inherit a dated model');
  assert.strictEqual(context.join('TestLine',{...live,railDirection:'Outbound'},lines),null,
    'opposite direction is a separate service');
  assert.strictEqual(context.join('Arakawa',live,{Arakawa:lines.TestLine}),null,
    'Toden physical car number must not be treated as a timetable train number');
  rows.push({...rows[1],sig:'other-physical-itinerary'});
  assert.strictEqual(context.join('TestLine',live,lines),null,
    'two possible itineraries must not assign a model');
  rows.pop();
  rows.push({...rows[1],model:'Example2000系'});
  assert.strictEqual(context.join('TestLine',live,lines),null,
    'contradictory timetable identities must remain unresolved');
  console.log('Realtime plus timetable same-run exact PNG join: 7 PASS');
}

const tobuEvidence=read("data/timetables/tobu-limited-express-vehicle-evidence.js");
assert(/TRAIN_VEHICLE_EVIDENCE_PROVIDERS/.test(tobuEvidence),"Tobu exact-train evidence must register through generic provider registry");
assert(/id:\s*"tobu-official-limited-express-2026"/.test(tobuEvidence),"vehicle evidence provider must expose stable provenance id");
assert(/if \(!d\) return null;/.test(tobuEvidence),
  "exact Tobu vehicle evidence must require an explicit service date");
assert(/!hasExplicitValidity && d !== provider\.effectiveDate/.test(tobuEvidence),
  "undated Tobu timetable rows must not become open-ended vehicle assignments");
const renderer=read("js/trains-render.js");
const geometrySource=read("js/trains-geometry.js");
// On the two-column loop, visible placement order differs from the canonical
// station order. Position evidence always indexes canonical line.stations.
assert(/loopPts\[_sourceRi\]\s*=\s*\{/.test(geometrySource) &&
       /var _sourceRi = _rightSeq\[ri\];/.test(geometrySource) &&
       /loopPts\[_sourceLi\]\s*=\s*\{/.test(geometrySource) &&
       /var _sourceLi = _leftSeq\[li\];/.test(geometrySource),
  "double-column coordinates must be keyed by canonical station index (Harajuku/Shinagawa)");
assert(!/loopPts\.push\(\{ x: cx \+ halfW, y: cy - halfH \+ _tR/.test(geometrySource),
  "visual row order must not replace source stationIndex in the train layout");
// Visual contract: 2026-10-11 restored loop design is the approved baseline.
// A realtime/vehicle fix must not silently re-apply the reverted wide-ring PR.
assert(geometrySource.includes('var rectW = _isMobileView() ? 63 : 67.2, rectH = loopRectH;') &&
       geometrySource.includes('svgW = _isMobileView() ? 225 : 240;'),
  "loop ring and canvas must retain approved mobile/desktop dimensions");
assert(!geometrySource.includes('(_isMobileView() ? 120 : 132)') &&
       !geometrySource.includes('isDoubleColumnLoop: line.isDoubleColumnLoop === true,'),
  "do not reintroduce wider double-column loop geometry");
assert(!renderer.includes('_trainLabelDisplayX') &&
       !renderer.includes('geometry.isDoubleColumnLoop ? 24 :') &&
       !renderer.includes('geometry.isDoubleColumnLoop && side === "right" ? 24 :'),
  "loop direction captions and station names must retain original placement");
assert(renderer.includes('var _offsetX = px - (_bbox.x + _bbox.width / 2);') &&
       renderer.includes("'translate(' + (px + _base) + ',0)'"),
  "initial and animated captions must remain centered on their train");


// Ordinary loops share the same two-column template for odd/even station counts.
{
  const db=JSON.parse(read("data/core/railway_data.json"));
  for(const mobile of [true,false]) {
    const ctx={window:{currentLang:"ja"},_routeGeometryCache:{},_geomKey:id=>id,
      _getTransferMap:()=>({}),_isMobileView:()=>mobile,
      _throughDirForStation:()=>null,_throughChipHeight:()=>0,
      getLinesData:()=>({}),GEOM:{BRANCH_COL_W:96,BRANCH_STUB:20,MOBILE_CONTENT_W:297}};
    vm.runInNewContext(geometrySource,ctx);
    vm.runInNewContext(read("js/train-track-layout.js"),ctx);
    for(const id of ["Yamanote","OsakaLoop"]) {
      const line=db.lines[id],g=ctx.computeRouteGeometry(line,id),points=g.stationCoords;
      assert.equal(points.length,line.stations.length);
      line.stations.forEach((sid,i)=>assert.equal(points[i].stationId,sid));
      assert(points.every(p=>["left","right"].includes(p.side)),id+" must have no top/bottom station row");
      assert.equal(new Set(points.map(p=>p.x)).size,2);
      assert.equal(points.filter(p=>p.side==="right").length,Math.ceil(points.length/2));
      assert.equal(points.filter(p=>p.side==="left").length,Math.floor(points.length/2));
      for(const side of ["left","right"]) {
        const ys=points.filter(p=>p.side===side).map(p=>p.y).sort((a,b)=>a-b);
        for(let i=1;i<ys.length;i++)assert(ys[i]-ys[i-1]>=50-1e-6,"station/icon pitch");
      }
      for(let i=0;i<points.length;i++) {
        const p={trainId:id+i,stationIndex:i,segmentToIndex:(i+1)%points.length,segmentProgress:.5,railDirection:"OuterLoop"};
        const loc=ctx.window.TrainTrackLayout.resolveAll([p],points,g,id,{laneGap:1e-6})[0];
        const rect=points._loopRect;
        assert(Number.isFinite(loc.routePos));
        const onRail=Math.min(Math.abs(loc.x-(rect.cx-rect.halfW)),Math.abs(loc.x-(rect.cx+rect.halfW)),
          Math.abs(loc.y-(rect.cy-rect.halfH)),Math.abs(loc.y-(rect.cy+rect.halfH)));
        assert(onRail<1e-3,id+" join must follow ring, not cut diagonally through the middle");
      }
      assert(points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.y>0&&p.y<g.svgH));
      if(id==="Yamanote") {
        const right=points.filter(p=>p.side==="right").sort((a,b)=>a.y-b.y);
        assert.equal(right[0].stationId,"Tabata");assert.equal(right.at(-1).stationId,"Shinagawa");
      }
    }
  }
  console.log("Shared ordinary loop template, odd/even counts, canonical indexing and mobile/desktop: PASS");
}

// Six-shaped loop regression: preserve the approved narrow 6 shape, correct
// physical station indices, and provide text/icon lanes without clipping.
{
  const ctx={
    window:{currentLang:"ja",RailwayDB:{resolveStationName:(id)=>({
      "Tochomae":"都庁前","Hikarigaoka":"光が丘","S2":"西新宿五丁目",
      "S12":"牛込神楽坂","S20":"国立競技場"
    }[id] || id)}},
    _routeGeometryCache:{},_geomKey:(id)=>id,
    _getTransferMap:()=>({}),_isMobileView:()=>true,
    _throughDirForStation:()=>null,_throughChipHeight:()=>0,
    getLinesData:()=>({}),GEOM:{BRANCH_COL_W:96,BRANCH_STUB:20,MAIN_BASE_W_MAX:820,MOBILE_CONTENT_W:297},
  };
  vm.runInNewContext(geometrySource,vm.createContext(ctx),{filename:"trains-geometry.js"});
  const ids=["Tochomae",...Array.from({length:9},(_,i)=>"S"+(i+1)),"Hikarigaoka",
    ...Array.from({length:27},(_,i)=>"S"+(i+11))];
  const six=ctx.computeRouteGeometry({id:"Oedo",type:"loop",isSixShapedLoop:true,
    stations:ids,color:"#bd006b"},"Oedo");
  assert.strictEqual(six.stationCoords.length,ids.length,"six diagram must retain every station");
  ids.forEach((id,i)=>assert.strictEqual(six.stationCoords[i]&&six.stationCoords[i].stationId,id,
    "six position indexed incorrectly at "+i));
  const rect=six.routeElements.find(e=>e.type==="rect");
  assert.strictEqual(rect.attrs.width,63,"six ring must preserve approved mobile width");
  assert.strictEqual(six.sixLoopStartIndex,11,"six loop must begin after Hikarigaoka tail");
  assert(six.stationCoords[1].x < six.junctionX &&
    six.stationCoords[37].x===six.junctionX &&
    six.stationCoords[18].x>six.junctionX,"six tail and ring rails must stay distinct");
  assert(six.svgW>360 && six.svgW>six.junctionX+63+110,
    "six mobile map must preserve a real right-column name/icon lane");
  assert(six.stationCoords[1].x-12-6*16*1.1>0,"longest real tail name must not clip at left edge");
  assert(six.junctionX-12-5*16*1.1>six.stationCoords[1].x,
    "ring-left names must not cross the tail rail");
  const trackSrc=read("js/train-track-layout.js");

  assert.strictEqual(six.sixTopology,"one-line-open-tail-and-closed-loop",
    "Oedo is one railway with an open tail, not a branchOf child");
  assert.strictEqual(six.sixTailEndIndex,10,"Hikarigaoka is last tail stop");
  assert.strictEqual(six.branchLines.length,0,"Oedo tail must never use generic branch rendering");
  const joinedTail=six.routeElements.find(e=>e.type==="path" && e.attrs.d && e.attrs.d.includes(" L "));
  assert(joinedTail && joinedTail.attrs["stroke-width"]===5 && joinedTail.attrs.opacity===1,
    "Oedo tail and loop must share the same full-strength stroke");
  const tctx={window:{}};
  vm.runInNewContext(trackSrc,vm.createContext(tctx),{filename:"train-track-layout.js"});
  const sixRows=[
    {trainId:"tail-out",stationIndex:5,destinationStation:"Hikarigaoka",railDirection:"InnerLoop"},
    {trainId:"tail-in",stationIndex:5,destinationStation:"Tochomae",railDirection:"OuterLoop"},
    {trainId:"junction-tail",stationIndex:0,destinationStation:"Hikarigaoka",railDirection:"InnerLoop"},
    {trainId:"ring-end",stationIndex:37,destinationStation:"Tochomae",railDirection:"OuterLoop"}
  ];
  const sixLayout=tctx.window.TrainTrackLayout.resolveAll(
    sixRows,six.stationCoords,six,"Oedo",{getDisplayMoveDir:()=>null});
  assert.deepStrictEqual(Array.from(sixLayout,p=>p&&p.nextIdx),[6,4,1,0],
    "tail motion and last loop station must follow canonical topology");
  assert(sixLayout[0].y < six.stationCoords[5].y,
    "outbound Hikarigaoka marker must move UP the screen");
  assert(renderer.includes("function _sixTrainDirectionLane(") &&
         renderer.includes('data-six-direction-visible') &&
         renderer.includes('var _actualLane = _sixTrainDirectionLane(') &&
         renderer.includes('var _sixLane = label.getAttribute("data-six-direction-visible")') &&
         !renderer.includes('if (_sixMap && _isMobileView()) {') &&
         !renderer.includes("labelText = labelText.slice(0, 2);"),
    "mobile Oedo must SHOW full direction labels in the stable inside-track lanes");
  assert(renderer.includes('labelText = _trainDestText(_tailDest === "Hikarigaoka" ? "Hikarigaoka" : "Tochomae");') &&
         renderer.includes('return !!LOOP_DIR_NAMES[String(dirName).split(/[:.]/).pop()];'),
    "Oedo tail must show its true travel direction while recognizing full ODPT loop direction");
  assert(renderer.includes('ldir.setAttribute("font-size", _sixLane ? "9" : "8");') &&
         renderer.includes('labelGroup.insertBefore(_whitePlate, labelGroup.firstChild);') &&
         renderer.includes('labelGroup.setAttribute("pointer-events", "none");') &&
         renderer.includes('if (_plate) _plate.setAttribute("y", String(_labelY + _plateOffsetY));'),
    "full direction plate must follow its train without swallowing train selection");

  assert(renderer.includes("tp-six-train-detail") &&
         renderer.includes('node.getAttribute("aria-label")') &&
         renderer.includes('svg.addEventListener("click"'),
    "mobile six train details must be accessible by selection");
  const trainDetailCss=read("css/trains.css");
  assert(trainDetailCss.includes('position: fixed;') &&
         trainDetailCss.includes('bottom: calc(84px + env(safe-area-inset-bottom));'),
    "selected train details must be visible near the mobile viewport, not hidden below a long map");
  assert(trackSrc.includes("sixLoopStartIndex")&&trackSrc.includes("idx === points.length - 1 ? 0"),
    "six ring must rejoin Tochomae instead of a tail station");
  const css=read("css/trains.css");
  assert(renderer.includes('el.classList.toggle("tp-six-fixed-map", !!geometry.isSixShapedLoop)') &&
         renderer.includes('svg.style.width = "100%"') &&
         renderer.includes('el.scrollLeft = 0;') &&
         !renderer.includes('svg.style.maxWidth = "none"') &&
         !renderer.includes('_mapWrap.style.width = Math.ceil(svgW) + "px"') &&
         !renderer.includes('tp-six-pan-hint'),
    "six diagram must stay fixed inside the responsive viewport without panning");
  assert(css.includes('.tp-line-map.tp-six-fixed-map { overflow-x: hidden; overflow-x: clip; }') &&
         css.includes('.tp-six-fixed-map .tp-map-wrap svg { width: 100%; max-width: 100%; height: auto; }'),
    "six map must scale its complete viewBox into the screen instead of clipping it");
  assert(six.svgW < 450,"Japanese six composition must not waste horizontal space when scaled on mobile");
  assert(renderer.includes('anchor = "end";')&&renderer.includes('geometry.isSixShapedLoop && geometry.isDualLoop6'),
    "six labels must stay outside the ring at mobile widths");
}
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
assert(renderer.includes('window.TrainVehicle.selectMarkerArtwork(p, artworkFailed)') &&
       !renderer.includes('window.TrainIcons.resolveVehicleArtwork'),
  "renderer must delegate all PNG/neutral decisions to the single TrainVehicle authority");
assert(!/var exact = p && \(p\.vehicleIdentityStatus/.test(renderer),
  "renderer must not re-arbitrate vehicle identity status");
assert(!/vehicleResolvedFromRealtime/.test(renderer),
  "renderer must not branch on vehicle evidence source");
assert(renderer.includes('kind: artwork.kind === "vehicle" && artwork.iconSrc ? "vehicle" : "unresolved"'),
  "TrainMarker must display an exact vehicle PNG or preserve an unresolved position without a fake asset");
assert(!/iconSrc \? "image" : "circle"/.test(renderer),
  "the legacy circle fallback kind must not return");
assert(!/outer\.setAttribute\("r", "8"\)/.test(renderer),
  "the legacy neutral circle fallback must not return");
assert(!renderer.includes('function _createGenericTrainMarker') &&
       !renderer.includes('function _swapTrainMarkerToGeneric'),
  "train markers must never be self-drawn SVG shapes");
assert(/marker\.addEventListener\("error"/.test(renderer) &&
       /marker\.setAttribute\("visibility", "hidden"\)/.test(renderer),
  "failed certified PNG must hide rather than fabricate a train model");
assert(/document\.createElementNS\(svgNS, "image"\)/.test(renderer) &&
       !renderer.includes('fallback.iconSrc'),
  "train marker must use only certified gallery PNG artwork");
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
assert(/function _isFreshRealtimePosition/.test(trains),"realtime freshness guard missing");
assert(/return _isFreshRealtimePosition\(p\) \? 0 : 8/.test(trains),"expired realtime must lose source priority");


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
assert(fusionSource.includes('var trainId = _realtimeSourceIdentity(t, top, railwayName);') &&
       fusionSource.includes("record['owl:sameAs'] || record['odpt:train']") &&
       fusionSource.includes('var trainNumber = String(t["odpt:trainNumber"] || t["odpt:train"] || "");') &&
       fusionSource.includes('trainId: trainId,') &&
       fusionSource.includes('trainNumber: trainNumber,'),
  'realtime source-object identity and service number must remain separate with railway-scoped fallbacks');
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
assert(fusionSource.includes('formationCandidates: proof ? (p.vehicleFormationCandidates || []).slice() : []'),
  'running-chain registry must preserve dated, proven formation candidates but drop unverified candidates');
assert(fusionSource.includes('p.vehicleFormationCandidates = (v.formationCandidates || []).slice();'),
  'running-chain inheritance must propagate formation candidate sets from the canonical resolution payload');
assert(!fusionSource.includes('_p.vehicleType = _fe.vehicleName'),
  'fused formation evidence must not bypass the canonical vehicle projection with a direct identity write');
assert(fusionSource.includes('source:"formation-evidence", sources:["formation-evidence"]') &&
       fusionSource.includes('identityStatus:_fe.identityStatus||"EXACT"'),
  'dated formation evidence must retain its canonical structural provenance and exact identity state');
assert(fusionSource.includes('_queueChainVehicle({') && fusionSource.includes('vehicleFormationId:_fe.formationId'),
  'formation evidence must enter the existing pre-commit candidate queue');
assert(fusionSource.includes('if (mode !== "SEGMENTED") return true; // HYBRID / COARSE / UNKNOWN'),
  'HYBRID/COARSE/UNKNOWN coverage gaps must remain eligible for timetable position fallback');
assert(fusionSource.includes('if (_chainVehicleRegistry[_cid]) _chainVehicleRegistry[_cid].lastSeenAt = Date.now();'),
  'an active timetable running chain must keep confirmed vehicle identity alive across realtime coverage gaps');
assert(fusionSource.includes('Object.keys(posMap).forEach(function(_vlid) {') &&
       fusionSource.includes('_inheritChainVehicle(_p);') &&
       fusionSource.includes('Object.keys(estimated).forEach(function(_vlid) {'),
  'confirmed running-chain vehicle identity must project onto both realtime and timetable segments across line/operator boundaries');
assert(fusionSource.includes('if (!_activeChainIds[_cid] && (!_cv || !_cv.lastSeenAt ||'),
  'vehicle identity may expire only after the physical running chain is absent, not merely because realtime position disappeared');

// Only DataFusion may merge physical positions. The old immediate manual
// pass plus the second composite pass duplicated Yamanote SQL/ODPT trains.
assert(estimatorSource.includes('estimated[lineId] = positions;') &&
       !estimatorSource.includes('var _merged = existing.slice();'),
  'TrainPositionEstimator must return estimates only, never remap realtime positions');
assert(!fusionSource.includes('Composite mode: ') &&
       !fusionSource.includes('ensureManual: " + lineId + " +'),
  'obsolete manual position insertion path is still active');
assert(fusionSource.includes('if (!posMap[lid]) posMap[lid] = [];') &&
       fusionSource.includes('if ((_pid && _haveId[_pid]) ||') &&
       !fusionSource.includes('posMap[lid] = _est.filter('),
  'same-line duplicate source dedupe must also run when realtime is empty');
assert(fusionSource.includes('null, // No parallel realtime merge inside TrainPositionEstimator.'),
  'DataFusion must not feed a second realtime snapshot into the estimator');

const runningChainSource = fs.readFileSync('js/running-chain-resolver.js','utf8');
assert(!runningChainSource.includes('line.throughServices'),
  'running-chain adjacency must not read throughServices compatibility projection');
assert(runningChainSource.includes('var boundaries = Array.isArray(line.serviceBoundaries)'),
  'running-chain adjacency must originate from canonical serviceBoundaries');
assert(runningChainSource.includes('_directThrough[lineId].push(boundary.lineId)'),
  'direct-through runtime index must be projected from validated service boundaries');

// Canonical all-line identity: no parallel Harajuku/station mapping.
const resolverSandbox={window:{}};
vm.createContext(resolverSandbox);
vm.runInContext(read("js/running-chain-resolver.js"),resolverSandbox);
const scheduleKey=resolverSandbox.window.RunningChainResolver.scheduledMatchKey;
const ym={serviceDate:"2026-10-12",trainNumber:"1151G",railDirection:"InnerLoop"};
const inner=scheduleKey("Yamanote",ym);
assert(inner && inner.startsWith("scheduled-match:"),"valid scoped scheduled key");
assert.strictEqual(inner,scheduleKey("Yamanote",{...ym,railDirection:"inner"}),
  "loop direction normalization must be case-insensitive");
assert.strictEqual(inner,scheduleKey("Yamanote",{...ym,railDirection:"odpt.RailDirection:Inner"}),
  "inner-loop aliases must match");
assert.notStrictEqual(inner,scheduleKey("Yamanote",{...ym,railDirection:"OuterLoop"}),
  "inner and outer routes must remain separate");
assert.notStrictEqual(inner,scheduleKey("Yamanote",{...ym,serviceDate:"2026-10-13"}),
  "different service dates must remain separate");
assert.notStrictEqual(inner,scheduleKey("Yamanote",{...ym,trainNumber:"1152G"}),
  "different train numbers must remain separate");
assert.strictEqual(scheduleKey("Yamanote",{...ym,railDirection:""}),"",
  "no direction means no loop match");
assert.strictEqual(scheduleKey("Yamanote",{...ym,trainNumber:"manual-template:12"}),"",
  "SQL row ID must not masquerade as train number");
// Compare examples from different operators/lines that can reuse a train
// number. Never blend them even when ODPT source IDs share a suffix.
const others=[
  ["Ginza","odpt.RailDirection:Inbound"],
  ["Asakusa","odpt.RailDirection:Outbound"],
  ["Keiyo","odpt.RailDirection:Inbound"],
  ["Chiyoda","odpt.RailDirection:Inbound"],
  ["Rinkai","odpt.RailDirection:Inbound"],
  ["NewShuttle","odpt.RailDirection:Inbound"]
];
others.forEach(function(pair){
  const k=scheduleKey(pair[0],{...ym,railDirection:pair[1]});
  assert(k&&k.startsWith("scheduled-match:"),"valid all-line candidate: "+pair[0]);
  assert.notStrictEqual(k,inner,"Yamanote cannot collide with "+pair[0]);
  const direction=pair[1].split(":").pop();
  const opposite=direction==="Inbound"?"Outbound":"Inbound";
  assert.notStrictEqual(k,scheduleKey(pair[0],{...ym,railDirection:opposite}),
    "opposite directions cannot merge: "+pair[0]);
  assert.strictEqual(k,scheduleKey(pair[0],{...ym,railDirection:direction.toLowerCase()}),
    "case aliases must agree: "+pair[0]);
  assert.strictEqual(scheduleKey(pair[0],{...ym,railDirection:""}),"",
    "missing direction must stay unbound: "+pair[0]);
});
assert.notStrictEqual(scheduleKey("Keiyo",{...ym,railDirection:"Inbound"}),
                      scheduleKey("Chiyoda",{...ym,railDirection:"Inbound"}),
  "train number reuse across lines must remain separate");
assert(!fusion.includes('_chainsByTrainNumber')&&!fusion.includes('_estByTrainNumber')&&
       !fusion.includes('_haveTrainNumber'),
  "remove legacy bare-train-number candidate indices");
assert(fusion.includes('function _chainBridgeKey(lid, p)') &&
       fusion.includes('window.RunningChainResolver.scheduledMatchKey(lid, p)') &&
       fusion.includes('_estKeyCounts[_noKey] === 1 && _liveKeyCounts[_noKey] === 1') &&
       fusion.includes('_scheduledEstimateCounts[_bridgeKey] === 1') &&
       fusion.includes('_scheduledLiveCounts[_bridgeKey] === 1'),
  "all-line live/estimated merge must reuse one singleton resolver and unique evidence");
const yd=read("js/trains-data.js");
assert(yd.includes('p.runningChainId || p.trainId ||') &&
       !yd.includes('p.runningChainId || p.trainNumber'),
  "all-line display dedupe must rely on source object or canonical chain, never bare number");
assert(!yd.includes('.replace(/^odpt\\.Train:/'),
  "source train identifiers must retain their full namespace");
const geom=read("js/trains-geometry.js");
assert(geom.includes('loopPts[_sourceRi] =') && geom.includes('loopPts[_sourceLi] ='),
  "original 30-station Harajuku/Shinagawa indices must remain untouched");
console.log("all-line scoped live/timetable mapping: PASS");

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


// Public train labels use the published train number, never a SQL row ID,
// guessed operation code, or unconfirmed/confirmed physical carset.
assert(/serviceDate:\s*String\(_runIdentity\.key/.test(estimatorSource),
  "estimated assignments must retain the exact service date");
assert(/serviceDate:\s*_snapshotServiceDate/.test(fusionSource),
  "realtime positions must carry the evidence service date");
const titleStart=renderSource.indexOf("  function _trainMarkerTitle(p, lineId) {");
const titleEnd=renderSource.indexOf("  // SVG image title attributes",titleStart);
assert(titleStart>=0&&titleEnd>titleStart,"existing train marker title helper missing");
const trainNumberSandbox={
  window:{currentLang:"ja",TRAIN_TYPE_NAMES:{}},
  _trainDestText:s=>s,
  _isOedoTailTrain:(lid,p)=>lid==="Oedo"&&p&&Number(p.stationIndex)>=1&&Number(p.stationIndex)<=10
};
vm.createContext(trainNumberSandbox);
vm.runInContext(renderSource.slice(titleStart,titleEnd)+
  "\nthis.trainMarkerTitle=_trainMarkerTitle;",trainNumberSandbox);
const trainTitle=trainNumberSandbox.trainMarkerTitle;
const sample={trainNumber:"1151G",vehicleType:"E235系0番台",destinationStation:"池袋",
  vehicleFormationId:"トウ01",operationCode:"51G"};
assert(trainTitle(sample).includes("列車番号 1151G"),"valid train number should be primary label");
assert(trainTitle(sample).includes("E235系0番台"),"keep confirmed vehicle type in tooltip");
assert(trainTitle({railDirection:"odpt:RailDirection:InnerLoop",stationIndex:15},"Oedo").includes("内回り"),
  "Oedo loop train details must retain complete InnerLoop direction");
const oedoTailTitle=trainTitle({stationIndex:5,destinationStation:"Hikarigaoka",railDirection:"InnerLoop"},"Oedo");
assert(oedoTailTitle.includes("Hikarigaoka方面")&&!oedoTailTitle.includes("内回り"),
  "Oedo open-tail train details must show Hikarigaoka rather than an incorrect loop direction");
assert(!trainTitle(sample).includes("トウ01")&&!/運用|編成|Carset|Operation/i.test(trainTitle(sample)),
  "operation and formation fields must not appear in public marker titles");
for (const synthetic of ["est_12","supabase:TrainRun:12","manual-template:12","odpt.Train:X","planned-trip:x"]) {
  assert(!trainTitle({trainNumber:synthetic}).includes(synthetic),
    "source/SQL/synthetic identifiers must never be published as train numbers: "+synthetic);
}
const odptAdapterSource=read("data/api/odpt-unified.js");
assert(odptAdapterSource.includes("function _plannedTrainRunIdentity(run)"),
  "SQL timetable records must use a scheduled-trip identity");
assert(odptAdapterSource.includes('"@id":hasSharedCanonicalTrip') &&
  odptAdapterSource.includes('run.canonical_group_evidence==="verified_continuation"') &&
  odptAdapterSource.includes('run.canonical_group_evidence==="verified_shared_itinerary"') &&
  odptAdapterSource.includes(': scheduledId,'),
  "Only verified shared-physical trips may use canonical train identity; single-source runs retain published-facts IDs");
assert(!odptAdapterSource.includes('"@id":"supabase:TrainRun:"+run.id'),
  "SQL row IDs must not be presented as stable run identities");
assert(renderSource.includes('_setTrainMarkerTooltip(existingIcon, _freshTitle, svgNS);'),
  "reused SVG markers must refresh native tooltips");
console.log("scheduled train-number label and SQL identity guard: PASS");

assert(fusionSource.includes("function _confirmedFormationEvidence(p)"),
  "date-valid carset evidence must be verified before joining live and timetable positions");
assert(fusionSource.includes("preferred.vehicleResolution.name === other.vehicleResolution.name"),
  "carset evidence must not cross different resolved vehicle types");
assert(fusionSource.includes("preferred.serviceDate === other.serviceDate"),
  "carset evidence must not cross operating dates");
assert(fusionSource.includes("p.operationEvidence = (p.operationEvidence || []).concat([v.formationProof])"),
  "evidence provenance must accompany inherited carsets");
assert(fusionSource.includes("!preferred.vehicleFormationConflict"),
  "once date-valid carsets conflict, later candidates cannot silently reselect a formation");
const trainsPageSource=fs.readFileSync("js/trains-page.js","utf8");
assert(trainsPageSource.includes("(_tp.vehicleFormationId ||") &&
       trainsPageSource.includes("_tp.operationEvidence.map(function(e)"),
  "detail map refresh must detect new or revoked carset evidence without moving a station");
assert(renderSource.includes('document.createElementNS(ns, "title")') &&
       renderSource.includes('_setTrainMarkerTooltip(existingIcon, _freshTitle, svgNS)'),
  "existing SVG train markers must expose a native, refreshed train-number tooltip");
assert(!renderSource.includes('ids.join(" + ")'),
  "multiple formation IDs must not imply coupling: sources may include aliases");
console.log("carset evidence propagation and display regression: PASS");

// SQL-origin vehicle labels must enter the ONE upstream identity resolver.
// Candidate lists such as E233 / 70-000 must not be assigned a PNG by guesswork.
assert(estimatorSource.includes('var _declaredVehicleInput = String(tt.vehicleType ||'),
  "SQL vehicle_type_label must reach the existing timetable vehicle evidence resolver");
const selectedVehicleSource=read("js/train-vehicle.js");
assert(!selectedVehicleSource.includes("共通_形式未確認.png") &&
       selectedVehicleSource.includes('return { kind: "unresolved", iconSrc: "" }'),
  "unconfirmed model must not produce generic PNG or impersonate a model");


// Exactly verified Rinkai/Osaki boundary evidence may identify a train model.
const edgeSource=read("supabase/functions/train-runs/index.ts");
assert(edgeSource.includes('if (lineId === "SaikyoKawagoe" && selectedCalendar)') &&
       edgeSource.includes('stopName(last) !== "Osaki"') &&
       edgeSource.includes('stopName(first) !== "Osaki"') &&
       edgeSource.includes('if (list.length !== 1) return;') &&
       edgeSource.includes('candidates.includes(verifiedModel)') &&
       edgeSource.includes('verifiedBoundaryType && !conflict ? "verified-scheduled-boundary:Rinkai/Osaki"') &&
       edgeSource.includes('vehicle_mapping_level: scheduleLevel') &&
       edgeSource.includes('const conflict = !!(ruleType && verifiedBoundaryType && ruleType !== verifiedBoundaryType)'),
  "boundary model projection must require exactly one compatible scheduled counterpart");
assert(estimatorSource.includes('_declaredModels.length === 1 && _operationModels.length > 1') &&
       estimatorSource.includes('_operationModels.indexOf(_declaredModels[0]) >= 0'),
  "exact scheduled model only narrows compatible operation candidate sets");
console.log("Rinkai/Osaki exact vehicle evidence regression: PASS");


// Realtime train PNG continuity: missing a vehicle field in one new live
// snapshot must not erase the previously established model. Prove this with
// the actual DataFusion source-key/chain-registry helpers, not another mapping.
{
  const head = fusion.indexOf('  var _chainVehicleRegistry = {}');
  const tail = fusion.indexOf('  var subscribers = [];', head);
  assert(head >= 0 && tail > head);
  let now = 1000000;
  const isolated = vm.createContext({
    Date: { now() { return now; } },
    window: {}, console
  });
  vm.runInContext(fusion.slice(head,tail) +
    '\nthis.keepVehicle = _preserveRealtimeSourceVehicle;', isolated);
  const resolution = name => ({
    name, vehicleTypeStr:name, iconPath:'../images/列车/test/'+name+'.png',
    source:'realtime', sources:['realtime'], identityStatus:'EXACT', confidence:'high'
  });
  const source = (serviceDate='2026-10-12',trainId='odpt.Train:1',railway='SaikyoKawagoe') => ({
    positionSource:'realtime-api', serviceDate, sourceRailway:railway,
    trainId, trainNumber:'1081F', vehicleType:'', vehicleIdentityStatus:'UNKNOWN'
  });
  const confirmed = source();
  confirmed.vehicleResolution = resolution('E233');
  confirmed.vehicleType = 'E233';
  confirmed.vehicleIdentityStatus = 'EXACT';
  confirmed.vehicleSource = 'realtime';
  isolated.keepVehicle(confirmed, 'E233');
  const missing = source();
  isolated.keepVehicle(missing, '');
  assert.strictEqual(missing.vehicleType,'E233');
  assert.strictEqual(missing.vehicleIdentityStatus,'EXACT');
  assert.strictEqual(missing.vehicleInheritedFromRunningChain,true);
  assert.strictEqual(missing.runningChainId,undefined,'source alias must not alter physical chain identity');
  const otherTrain = source('2026-10-12','odpt.Train:2');
  isolated.keepVehicle(otherTrain,'');
  assert.strictEqual(otherTrain.vehicleIdentityStatus,'UNKNOWN');
  const otherDay = source('2026-10-13');
  isolated.keepVehicle(otherDay,'');
  assert.strictEqual(otherDay.vehicleIdentityStatus,'UNKNOWN');
  const incompatible = source();
  incompatible.vehicleCandidates=['71-000形'];
  isolated.keepVehicle(incompatible,'');
  assert.strictEqual(incompatible.vehicleIdentityStatus,'UNKNOWN');
  const switched = source();
  switched.vehicleResolution = resolution('70-000');
  switched.vehicleIdentityStatus='EXACT';
  switched.vehicleSource='realtime';
  switched.vehicleType='70-000';
  isolated.keepVehicle(switched,'70-000');
  const afterSwitch = source();
  isolated.keepVehicle(afterSwitch,'');
  assert.strictEqual(afterSwitch.vehicleType,'70-000');
  now += 181000;
  const expired = source();
  isolated.keepVehicle(expired,'');
  assert.strictEqual(expired.vehicleIdentityStatus,'UNKNOWN');
  console.log('ODPT missing-vehicle snapshot continuity/isolation/expiry: 7 PASS');
}

// An SVG-image request can fail transiently even when the PNG is valid.
// Only the same train+image is temporarily suppressed, never all models or
// the train forever; the existing canonical TrainVehicle makes every choice.
{
  const rendererHead = renderer.slice(0,renderer.indexOf('  function _renderThroughChip'));
  const start = renderer.indexOf('  function _trainMarkerSpec');
  const end = renderer.indexOf('  // Public identification',start);
  assert(start>0 && end>start);
  let now=2000000;
  const renderCtx=vm.createContext({
    Date:{now(){return now;}}, window:{
      TrainVehicle:{selectMarkerArtwork(p,failed){
        return failed?{kind:'unresolved',iconSrc:''}:{kind:'vehicle',iconSrc:p.vehicleIconPath};
      }}
    }
  });
  vm.runInContext(rendererHead+'\n'+renderer.slice(start,end)+
    '\nthis.remember=_rememberTrainArtworkFailure;this.pick=_trainMarkerSpec;',renderCtx);
  const original={vehicleIconPath:'../images/列车/JR東日本/E233.png'};
  const alternative={vehicleIconPath:'../images/列车/東京臨海高速鉄道/70-000.png'};
  assert.strictEqual(renderCtx.pick(original,'train-1').kind,'vehicle');
  renderCtx.remember('train-1',original.vehicleIconPath);
  assert.strictEqual(renderCtx.pick(original,'train-1').kind,'unresolved');
  assert.strictEqual(renderCtx.pick(alternative,'train-1').kind,'vehicle',
    'failed asset must not prevent a different verified model PNG');
  renderCtx.remember('train-1',original.vehicleIconPath);
  now += 46000;
  assert.strictEqual(renderCtx.pick(original,'train-1').kind,'vehicle',
    'transient image failure must become retryable');
  console.log('Train PNG load failure isolated by path and short retry TTL: 4 PASS');
}



// A missing vehicle model must NOT suppress a source-verified position.
// The neutral marker is a plain location dot, never a drawn train silhouette.
{
  const source=read('js/trains-render.js');
  const functionSource=source.slice(source.indexOf('  function _createTrainMarker('),
    source.indexOf('  function updateTrainLayer('));
  assert.ok(functionSource.includes('knownVehicle ? "image" : "circle"'));
  assert.ok(source.includes('data-position-unresolved'));
  assert.ok(!source.includes('if (!markerSpec.iconSrc) continue;'),
    'unresolved train model must not cause position row to vanish');

  const nodes=[];
  const layer={
    isConnected:true,
    appendChild(n){ n.parentNode=this; n.isConnected=true; nodes.push(n); },
    removeChild(n){ const i=nodes.indexOf(n); if(i>=0)nodes.splice(i,1);
      n.parentNode=null; n.isConnected=false; }
  };
  const fakeDocument={
    createElementNS(ns,tag){
      const attrs={},listeners={};
      return {tagName:tag,attrs,listeners,isConnected:false,
        setAttribute(k,v){attrs[k]=String(v);},
        setAttributeNS(ns,k,v){attrs[(ns==='http://www.w3.org/1999/xlink'?'xlink:':'')+k]=String(v);},
        getAttribute(k){return attrs[k]??null;},
        removeAttribute(k){delete attrs[k];},
        addEventListener(k,fn){listeners[k]=fn;}
      };
    }
  };
  const sandbox={document:fakeDocument,Date,console,
    _trainMarkerTitle(p){return String(p.trainNumber||'');},
    _setTrainMarkerTooltip(m,title){m.title=title;},
    _setTrainIconPosition(m,x,y){
      if(m.tagName==='circle'){m.setAttribute('cx',x);m.setAttribute('cy',y);}
      else {m.setAttribute('x',x-7);m.setAttribute('y',y-9);}
    },
    remembered:[],
    _rememberTrainArtworkFailure(uid,href){sandbox.remembered.push([uid,href]);}
  };
  vm.createContext(sandbox);
  vm.runInContext(functionSource+'\nthis.make=_createTrainMarker;',sandbox);
  const p={positionSource:'realtime-api',trainId:'train-123',
    trainNumber:'1250K',destinationStation:'Shinjuku'};
  const dot=sandbox.make(layer,'svg','train-123',
    {kind:'unresolved',iconSrc:'',className:'train-icon'},54,68,p,'SaikyoKawagoe',false,'#009744',{idx:8});
  assert.strictEqual(dot.tagName,'circle');
  assert.strictEqual(dot.getAttribute('cx'),'54');
  assert.strictEqual(dot.getAttribute('cy'),'68');
  assert.strictEqual(dot.getAttribute('data-position-unresolved'),'true');
  assert.strictEqual(dot.getAttribute('href'),null,
    'neutral position dot must not claim a PNG or vehicle type');
  assert.strictEqual(nodes.length,1);
  const real=sandbox.make(layer,'svg','train-124',
    {kind:'vehicle',iconSrc:'../images/列车/JR東日本/E233.png',className:'train-icon'},
    100,120,{trainNumber:'1251K'},'SaikyoKawagoe',false,'#009744',{idx:11});
  assert.strictEqual(real.tagName,'image');
  assert.strictEqual(real.getAttribute('href'),'../images/列车/JR東日本/E233.png');
  assert.strictEqual(real.getAttribute('xlink:href'),'../images/列车/JR東日本/E233.png',
    'SVG XLink and href must reference the same model PNG');
  real.listeners.error();
  assert.strictEqual(sandbox.remembered.length,1);
  assert.strictEqual(nodes.length,2);
  assert.strictEqual(nodes.filter(n=>n.tagName==='image').length,0,
    'broken model PNG must fall back to a visible neutral position dot immediately');
  assert.ok(nodes.some(n=>n.getAttribute('data-train-id')==='train-124'&&n.tagName==='circle'));
  console.log('Realtime unknown/failed model retains source position as neutral dot: 9 PASS');
}


// JR Saikyo-Kawagoe is ODPT Train + JS vehicle evidence only: never a SQL
// timetable or the old giant local manual timetable. Other lines keep their
// independently configured HYBRID/SQL capabilities.
{
  const bundled = read('data/core/data-config-bundle.js');
  const standalone = read('data/core/runtime-config.js');
  for(const [name,source] of [['bundle',bundled],['standalone',standalone]]){
    assert(/"SaikyoKawagoe":\s*\{\s*mode:\s*"FULL",\s*manualTimetableEvidence:\s*false\s*\}/.test(source),
      name+' must make SaikyoKawagoe realtime position authoritative');
  }
  assert(/"SaikyoKawagoe":\s*true/.test(bundled),
    'the ODPT Train realtime capability must remain explicitly enabled');
  assert(/function _manualEvidenceDisabled\(lineId\)/.test(fusion));
  assert(/if \(_manualEvidenceDisabled\(lineId\)\) return Promise\.resolve\(false\);/.test(fusion));
  assert(/if \(_manualEvidenceDisabled\(lineId\)\) \{ resolve\(false\); return; \}/.test(fusion));
  assert(!fs.existsSync(path.join(root,'data/timetables/SaikyoKawagoe-manual.js')),
    'retired Saikyo SQL/manual duplicate must not remain a separate timetable route');
  assert(!/\"Rinkai\":\s*\{\s*mode:\s*"FULL"/.test(bundled) &&
         !/\"Rinkai\":\s*\{[^}]*manualTimetableEvidence:\s*false/.test(bundled),
    'TWR Rinkai timetable estimation must remain available');
  console.log('Saikyo ODPT+JS-only manual/SQL isolation: 8 PASS');
}

// Independent Joban presentation and collision regression: keep every source train.
{
  const data=JSON.parse(read('data/core/railway_data.json'));
  const lines=data.lines || data;
  assert.equal(lines.Joban.presentation.nameJa,'常磐線快速');
  assert.deepEqual(lines.Joban.presentation.lineIds,['Joban']);
  assert.equal(lines.NaritaAbikoBranch.branchOf,'Narita');
  const ctx={window:{}};
  vm.runInNewContext(read('js/train-track-layout.js'),ctx);
  const api=ctx.window.TrainTrackLayout;
  const trains=Array.from({length:12},(_,i)=>({trainId:'source-'+i,stationIndex:1,segmentToIndex:2,segmentProgress:0,railDirection:'Outbound'}));
  const coords=[{x:150,y:20},{x:150,y:70},{x:150,y:120}];
  const result=api.resolveAll(trains,coords,{},'Joban',{});
  assert.equal(result.filter(Boolean).length,12);
  for(let i=0;i<result.length;i++) for(let j=i+1;j<result.length;j++)
    assert.equal(result[i].x,result[j].x,'same-lane train source anchors must not acquire sideways collision slots');
  const reverse=api.resolveAll(trains.slice().reverse(),coords,{},'Joban',{}).reverse();
  assert.equal(JSON.stringify(result),JSON.stringify(reverse),'source row order must not change marker placement');
  const labels=Array.from({length:8},(_,i)=>({id:'train-'+i,x:110,y:60,width:36,height:10}));
  const obstacle={x:110,y:60,width:36,height:10};
  const bounds={x:0,y:0,width:300,height:300};
  const offsets=api.resolveLabels(labels,[obstacle],bounds);
  const placed=labels.map(l=>({...l,x:l.x+offsets[l.id].x,y:l.y+offsets[l.id].y}));
  function overlaps(a,b){return a.x<b.x+b.width && a.x+a.width>b.x && a.y<b.y+b.height && a.y+a.height>b.y;}
  for(let i=0;i<placed.length;i++){
    assert.equal(offsets[labels[i].id].x,0,'caption centre must stay aligned with its own train');
    assert(Number.isFinite(offsets[labels[i].id].y),'paired units must have finite vertical offsets');
    assert(!overlaps(placed[i],obstacle),'caption must avoid station text');
    assert(placed[i].x>=0 && placed[i].y>=0 && placed[i].x+36<=300 && placed[i].y+10<=300);
    for(let j=i+1;j<placed.length;j++)assert(!overlaps(placed[i],placed[j]),'complete destination labels must not overlap');
  }
  assert.equal(JSON.stringify(offsets),JSON.stringify(api.resolveLabels(labels.slice().reverse(),[obstacle],bounds)));
  console.log('Independent Joban title and crowded marker/caption layout: PASS');
}

// Both directions share the same below-icon anchor; the arrow conveys motion.
{
  const renderer=read('js/trains-render.js');
  const start=renderer.indexOf('  function _trainLabelY(');
  const end=renderer.indexOf('\n  }',start)+4;
  const anchor=vm.runInNewContext('('+renderer.slice(start,end).trim()+')');
  for(const direction of ['up','down',null]){
    assert.equal(anchor('dir',100,direction),121);
    assert(anchor('dir',100,direction)>109,'caption must clear the bottom of the 18px train icon');
  }
  console.log('Direction caption below-icon anchor for up/down/unknown: PASS');
}

// Composite bounds include the icon and its tight caption, not the caption alone.
{
  const ctx={window:{}};
  vm.runInNewContext(read('js/train-track-layout.js'),ctx);
  const units=[{id:'a',x:50,y:60,width:40,height:30},{id:'b',x:50,y:60,width:40,height:30}];
  const shifts=ctx.window.TrainTrackLayout.resolveLabels(units,[],{x:0,y:0,width:300,height:300});
  assert.equal(shifts.a.y,0);
  assert.equal(shifts.b.y,34);
  const obstacle={x:50,y:90,width:40,height:30};
  const nearest=ctx.window.TrainTrackLayout.resolveLabels([units[0]],[obstacle],{x:0,y:0,width:300,height:300});
  assert.equal(nearest.a.y,-4,'unit uses the nearest small vertical clearance rather than a whole-row jump');
  const renderer=read('js/trains-render.js');
  assert(renderer.includes("marker.setAttribute('transform', shift +"));
  assert(renderer.includes("label.setAttribute('transform', shift +"));
  assert(!renderer.includes("link.setAttribute('data-train-caption-link'"),'captions must not acquire detached leader lines');
}

{
 const ctx={window:{}};vm.runInNewContext(read('js/train-track-layout.js'),ctx);
 function node(attrs,b,label){return {attrs:{...attrs},getAttribute(k){return this.attrs[k]||null;},setAttribute(k,v){this.attrs[k]=String(v);},removeAttribute(k){delete this.attrs[k];},closest(){return label?this:null;},getBoundingClientRect(){const m=(this.attrs.transform||'').match(/^translate\(([-0-9.]+),([-0-9.]+)\)/);const x=b.x+(m?+m[1]:0),y=b.y+(m?+m[2]:0);return {x,y,width:b.width,height:b.height,right:x+b.width,bottom:y+b.height};}};}
 const icon=node({'data-train-id':'p','data-marker-raw-transform':''},{x:60,y:60,width:14,height:18});
 const label=node({'data-train-label-for':'p','data-label-raw-transform':'translate(0,0)'},{x:47,y:84,width:40,height:10},true);
 const obstacle=node({},{x:47,y:84,width:40,height:10});
 const svg={__geometry:{},getScreenCTM:()=>({a:1,d:1}),getBoundingClientRect:()=>({x:0,y:0,width:300,height:300}),querySelectorAll:()=>[obstacle,icon]};
 const layer={ownerSVGElement:svg,querySelectorAll:s=>s==='[data-train-id]'?[icon]:s==='[data-train-label-for]'?[label]:[]};
 const renderer=read('js/trains-render.js'),start=renderer.indexOf('  function _resolveTrainLabelCollisions('),end=renderer.indexOf('  // v4.3.454:',start);
 vm.runInNewContext(renderer.slice(start,end)+';this.layout=_resolveTrainLabelCollisions;',ctx);
 ctx.layout(layer);const first=[icon.attrs.transform,label.attrs.transform];
 assert.equal(first[0].trim(),first[1].replace(/ translate\(0,0\)$/,''));
 assert.equal(label.getBoundingClientRect().y-icon.getBoundingClientRect().bottom,6);
 ctx.layout(layer);assert.deepEqual([icon.attrs.transform,label.attrs.transform],first);
 assert.equal(label.getBoundingClientRect().y-icon.getBoundingClientRect().bottom,6);
 console.log('Paired marker/caption renderer spacing and repeat frames: PASS');
}
