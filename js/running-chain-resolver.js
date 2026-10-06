/*
 * Pixel Tetsudo - Running-Chain Resolver
 * Transient ResolutionContext per line. Chain != canonical entity.
 */
(function() {
  "use strict";
  var _initialized = false;
  var _boundaryMap = {};
  var _branchOfMap = {};
  var _directThrough = {};

  function buildIndexes() {
    var lines = window.UNIFIED_LINES || {};
    _boundaryMap = {}; _branchOfMap = {}; _directThrough = {};
    Object.keys(lines).forEach(function(lineId) {
      var line = lines[lineId] || {};
      if (line.branchOf && lines[line.branchOf]) _branchOfMap[lineId] = line.branchOf;
      var boundaries = Array.isArray(line.serviceBoundaries) ? line.serviceBoundaries : [];
      _boundaryMap[lineId] = {};
      _directThrough[lineId] = [];
      boundaries.forEach(function(boundary) {
        if (!boundary || !boundary.lineId || !lines[boundary.lineId]) return;
        var joins = Array.isArray(boundary.handoverStations) ? boundary.handoverStations.filter(Boolean) : [];
        if (joins.length) {
          _boundaryMap[lineId][boundary.lineId] = joins.slice();
          _directThrough[lineId].push(boundary.lineId);
        }
      });
    });
    _initialized=true;
  }

  function scoreEvidence(a,b){
    var s=0;
    var la=(window.UNIFIED_LINES&&window.UNIFIED_LINES[a])||null;
    var lb=(window.UNIFIED_LINES&&window.UNIFIED_LINES[b])||null;
    if((_directThrough[a]||[]).indexOf(b)>=0)s+=3;
    if(la&&lb&&la.code&&lb.code&&la.code===lb.code)s+=(la.operator===lb.operator)?2:-5;
    var sa=la&&la.stations?la.stations:[];
    var sb=lb&&lb.stations?lb.stations:[];
    var set={},sc=0;
    sa.forEach(function(x){set[x]=true;});
    sb.forEach(function(x){if(set[x])sc++;});
    if(sc>0)s+=1;
    return s;
  }

  function _stationKey(v){var p=String(v||"").split(".");return p[p.length-1]||"";}
  function _timeMin(v){if(!v)return null;var m=String(v).match(/^(\\d{1,2}):(\\d{2})/);if(!m)return null;return parseInt(m[1],10)*60+parseInt(m[2],10);}
  function _segment(tt,lineId){
    var a=(tt&&tt["odpt:trainTimetableObject"])||[]; if(!a.length)return null;
    var first=a[0]||{}, last=a[a.length-1]||{};
    var firstStation=_stationKey(first["odpt:departureStation"]||first["odpt:arrivalStation"]||first["odpt:station"]);
    var lastStation=_stationKey(last["odpt:arrivalStation"]||last["odpt:departureStation"]||last["odpt:station"]);
    var firstTime=_timeMin(first["odpt:departureTime"]||first["odpt:arrivalTime"]);
    var lastTime=_timeMin(last["odpt:arrivalTime"]||last["odpt:departureTime"]);
    var trainNumber=String(tt["odpt:trainNumber"]||tt["odpt:train"]||"");
    var id=String(tt["@id"]||tt["owl:sameAs"]||((tt["odpt:railway"]||lineId||"")+"|"+trainNumber));
    return {lineId:lineId,id:id,trainNumber:trainNumber,firstStation:firstStation,lastStation:lastStation,firstTime:firstTime,lastTime:lastTime};
  }
  function _confirmedEdge(a,b,joins){
    if(!a||!b||!joins||!joins.length)return null;
    var forward=joins.indexOf(a.lastStation)>=0&&joins.indexOf(b.firstStation)>=0;
    var reverse=joins.indexOf(b.lastStation)>=0&&joins.indexOf(a.firstStation)>=0;
    if(!forward&&!reverse)return null;
    var dt=forward&&a.lastTime!==null&&b.firstTime!==null?b.firstTime-a.lastTime:
           reverse&&b.lastTime!==null&&a.firstTime!==null?a.firstTime-b.lastTime:null;
    if(dt===null||dt<0||dt>20)return null;
    var sameId=a.id===b.id, sameNo=a.trainNumber&&a.trainNumber===b.trainNumber;
    return {dt:dt,sameId:sameId,sameNo:sameNo,numberChanged:!sameId&&!sameNo,
      score:(sameId?4:(sameNo?2:0))+(dt<=5?3:dt<=10?2:1)};
  }
  function resolveTimetableChain(tt,lineId,candidates){
    if(!_initialized)buildIndexes();
    var base=_segment(tt,lineId); if(!base)return {runningChainId:null,evidence:"NO_SEGMENT"};
    var segments=[base], seen={}; seen[base.lineId+"|"+base.id]=true;
    (candidates||[]).forEach(function(x){
      if(!x||!x.lineId||!x.timetable)return;
      var s=_segment(x.timetable,x.lineId), key=s&&(s.lineId+"|"+s.id);
      if(s&&!seen[key]){seen[key]=true;segments.push(s);}
    });
    var adj={}; segments.forEach(function(s){adj[s.lineId+"|"+s.id]=[];});
    var edgeCandidates=[];
    for(var i=0;i<segments.length;i++)for(var j=i+1;j<segments.length;j++){
      var a=segments[i],b=segments[j];
      if((_directThrough[a.lineId]||[]).indexOf(b.lineId)<0)continue;
      var joins=(_boundaryMap[a.lineId]&&_boundaryMap[a.lineId][b.lineId])||[];
      var ev=_confirmedEdge(a,b,joins); if(!ev||ev.unresolved)continue;
      edgeCandidates.push({a:a,b:b,ev:ev});
    }
    // Different train numbers are accepted only when the operational boundary
    // pairing is unique for BOTH segments. Through-service relation + handover
    // station + time continuity alone are not enough if another candidate fits.
    edgeCandidates.forEach(function(ec){
      var ev=ec.ev;
      if(ev.numberChanged){
        var peers=edgeCandidates.filter(function(x){
          if(!x.ev.numberChanged)return false;
          return x.a===ec.a||x.b===ec.a||x.a===ec.b||x.b===ec.b;
        });
        if(peers.length!==1)return;
      }
      var ak=ec.a.lineId+"|"+ec.a.id,bk=ec.b.lineId+"|"+ec.b.id;
      adj[ak].push({key:bk,ev:ev});adj[bk].push({key:ak,ev:ev});
    });
    var root=base.lineId+"|"+base.id,q=[root],vis={};vis[root]=true;var ids=[],strong=false,numberChanged=false,maxGap=0;
    while(q.length){var cur=q.shift(),parts=cur.split("|");ids.push(parts.slice(1).join("|"));(adj[cur]||[]).forEach(function(e){if(e.ev.sameId)strong=true;if(e.ev.numberChanged)numberChanged=true;if(e.ev.dt>maxGap)maxGap=e.ev.dt;if(!vis[e.key]){vis[e.key]=true;q.push(e.key);}});}
    ids=ids.filter(function(v,i,a){return a.indexOf(v)===i;}).sort();
    if(ids.length===1)return {runningChainId:base.id,evidence:"NO_CONFIRMED_BOUNDARY"};
    return {runningChainId:"rc:"+ids.join("~"),evidence:strong?"CONFIRMED_SEGMENT_GRAPH+TIMETABLE_ID":(numberChanged?"CONFIRMED_UNIQUE_BOUNDARY+TRAIN_NUMBER_CHANGED":"CONFIRMED_SEGMENT_GRAPH+TRAIN_NUMBER"),timeGapMin:maxGap,segmentCount:ids.length};
  }

  function getResolutionContext(lineId, availableLineIds){
    if(!_initialized)buildIndexes();
    var allowed=null;
    if(Array.isArray(availableLineIds)){allowed={};availableLineIds.forEach(function(id){allowed[id]=true;});}
    var related=[], through=(_directThrough[lineId]||[]).filter(function(other){return !allowed||allowed[other];});
    var line=(window.UNIFIED_LINES&&window.UNIFIED_LINES[lineId])||null;
    var isAlias=false,aliasLineId=null;
    var branchLineId=line&&line.branchOf||null;
    var isBranch=!!branchLineId;
    return {
      lineId:lineId,
      isThroughService:through.length>0,
      relatedLines:through,
      isAlias:isAlias,
      aliasLineId:aliasLineId,
      isBranch:isBranch,
      branchLineId:branchLineId,
      identity:(through.length||isAlias||isBranch)?"RELATED":"SEPARATE",
      reason:(through.length?"THROUGH_SERVICE":(isAlias?"ALIAS_OF":(isBranch?"BRANCH_OF":"NO_DIRECT_RELATION")))
    };
  }

  function init(){if(_initialized)return;buildIndexes();}

  window.RunningChainResolver={
    init:init,
    isDirectThroughService:function(a,b){if(!_initialized)buildIndexes();if(!a||!b||a===b)return false;return (_directThrough[a]||[]).indexOf(b)>=0;},
    getDirectThroughLines:function(lid){if(!_initialized)buildIndexes();return (_directThrough[lid]||[]).slice();},
    getResolutionContext:getResolutionContext,
    resolveTimetableChain:resolveTimetableChain,
    hasRelation:function(a,b,rt){if(!_initialized)buildIndexes();if(!a||!b)return false;if(!rt||rt==="SERVICE_BOUNDARY")return !!(_boundaryMap[a]&&_boundaryMap[a][b]);if(rt==="BRANCH_OF")return _branchOfMap[a]===b||_branchOfMap[b]===a;if(rt==="THROUGH_SERVICE")return (_directThrough[a]||[]).indexOf(b)>=0;return false;},
    _getIndexes:function(){return{boundaries:_boundaryMap,branchOfMap:_branchOfMap,directThrough:_directThrough};}
  };

  if(window.UNIFIED_LINES){init();}
})();
