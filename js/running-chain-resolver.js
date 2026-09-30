/*
 * Pixel Tetsudo - Running-Chain Resolver
 * Transient ResolutionContext per line. Chain != canonical entity.
 */
(function() {
  "use strict";
  var _initialized = false;
  var _lineRelations = {};
  var _aliasMap = {};
  var _branchOfMap = {};
  var _directThrough = {};

  function buildIndexes() {
    var rels = window.LineServiceRelations || [];
    _lineRelations = {}; _aliasMap = {}; _branchOfMap = {}; _directThrough = {};
    rels.forEach(function(rel) {
      if (!rel.lineA || !rel.lineB) return;
      if (!_lineRelations[rel.lineA]) _lineRelations[rel.lineA] = [];
      if (!_lineRelations[rel.lineB]) _lineRelations[rel.lineB] = [];
      _lineRelations[rel.lineA].push(rel);
      _lineRelations[rel.lineB].push(rel);
      if (rel.relation === "ALIAS_OF") { _aliasMap[rel.lineA] = rel.lineB; _aliasMap[rel.lineB] = rel.lineA; }
      if (rel.relation === "BRANCH_OF") { _branchOfMap[rel.lineA] = rel.lineB; _branchOfMap[rel.lineB] = rel.lineA; }
    });
    rels.filter(function(r){return r.relation==="THROUGH_SERVICE";}).forEach(function(r){
      _directThrough[r.lineA]=_directThrough[r.lineA]||[];
      _directThrough[r.lineB]=_directThrough[r.lineB]||[];
      _directThrough[r.lineA].push(r.lineB);
      _directThrough[r.lineB].push(r.lineA);
    });
    _initialized=true;
  }

  function scoreEvidence(a,b){
    var s=0;
    var la=(window.UNIFIED_LINES&&window.UNIFIED_LINES[a])||null;
    var lb=(window.UNIFIED_LINES&&window.UNIFIED_LINES[b])||null;
    var rels = _lineRelations[a] || [];
    for(var i=0;i<rels.length;i++){
      var r = rels[i];
      if(r.lineA===b||r.lineB===a){
        if(r.relation==="THROUGH_SERVICE")s+=3;
        else if(r.relation==="BRANCH_OF"||r.relation==="PHYSICAL_CONNECT")s+=2;
        else if(r.relation==="ALIAS_OF")s+=3;
        break;
      }
    }
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
    if(!sameId&&!sameNo)return null;
    return {dt:dt,sameId:sameId,score:(sameId?4:2)+(dt<=5?3:dt<=10?2:1)};
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
    for(var i=0;i<segments.length;i++)for(var j=i+1;j<segments.length;j++){
      var a=segments[i],b=segments[j];
      if((_directThrough[a.lineId]||[]).indexOf(b.lineId)<0)continue;
      var rels=_lineRelations[a.lineId]||[],joins=[];
      for(var k=0;k<rels.length;k++){var r=rels[k],o=r.lineA===a.lineId?r.lineB:r.lineA;if(o===b.lineId&&r.relation==="THROUGH_SERVICE"){joins=r.handoverStations||[];break;}}
      var ev=_confirmedEdge(a,b,joins); if(!ev)continue;
      var ak=a.lineId+"|"+a.id,bk=b.lineId+"|"+b.id;
      adj[ak].push({key:bk,ev:ev});adj[bk].push({key:ak,ev:ev});
    }
    var root=base.lineId+"|"+base.id,q=[root],vis={};vis[root]=true;var ids=[],strong=false,maxGap=0;
    while(q.length){var cur=q.shift(),parts=cur.split("|");ids.push(parts.slice(1).join("|"));(adj[cur]||[]).forEach(function(e){if(e.ev.sameId)strong=true;if(e.ev.dt>maxGap)maxGap=e.ev.dt;if(!vis[e.key]){vis[e.key]=true;q.push(e.key);}});}
    ids=ids.filter(function(v,i,a){return a.indexOf(v)===i;}).sort();
    if(ids.length===1)return {runningChainId:base.id,evidence:"NO_CONFIRMED_BOUNDARY"};
    return {runningChainId:"rc:"+ids.join("~"),evidence:strong?"CONFIRMED_SEGMENT_GRAPH+TIMETABLE_ID":"CONFIRMED_SEGMENT_GRAPH+TRAIN_NUMBER",timeGapMin:maxGap,segmentCount:ids.length};
  }

  function getResolutionContext(lineId, availableLineIds){
    if(!_initialized)buildIndexes();
    var allowed=null;
    if(Array.isArray(availableLineIds)){allowed={};availableLineIds.forEach(function(id){allowed[id]=true;});}
    var rels=_lineRelations[lineId]||[], related=[], through=[];
    var isAlias=false,isBranch=false,aliasLineId=null,branchLineId=null;
    rels.forEach(function(r){
      var other=r.lineA===lineId?r.lineB:r.lineA;
      if(!other||(allowed&&!allowed[other]))return;
      if(related.indexOf(other)<0)related.push(other);
      if(r.relation==="THROUGH_SERVICE"&&through.indexOf(other)<0)through.push(other);
      if(r.relation==="ALIAS_OF"){isAlias=true;aliasLineId=other;}
      if(r.relation==="BRANCH_OF"){isBranch=true;branchLineId=other;}
    });
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
    hasRelation:function(a,b,rt){if(!_initialized)buildIndexes();var rs=_lineRelations[a]||[];for(var i=0;i<rs.length;i++){var o=rs[i].lineA===a?rs[i].lineB:rs[i].lineA;if(o===b&&(!rt||rs[i].relation===rt))return true;}return false;},
    _getIndexes:function(){return{relations:_lineRelations,aliasMap:_aliasMap,branchOfMap:_branchOfMap,directThrough:_directThrough};}
  };

  if(window.LineServiceRelations){init();}else{
    var _p=0;(function _c(){_p++;if(window.LineServiceRelations){init();}else if(_p<20){setTimeout(_c,100);}})();
  }
})();
