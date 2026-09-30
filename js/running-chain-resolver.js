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

  function computeCtx(lineId,allIds){
    if(!_initialized)buildIndexes();
    var ctx={lineId:lineId,identity:"STANDALONE",confidence:"NONE",reason:"no_candidate",isThroughService:false,isAlias:false,isBranch:false,throughServiceGroup:null,relatedLines:[]};
    if(_aliasMap[lineId]){ctx.identity="SAME";ctx.confidence="HIGH";ctx.reason="ALIAS_OF";ctx.isAlias=true;ctx.relatedLines=[_aliasMap[lineId]];return ctx;}
    var directThrough = (_directThrough[lineId] || []).slice();
    if(directThrough.length>0){
      ctx.isThroughService=true;
      ctx.relatedLines=directThrough.slice();
      ctx.confidence="HIGH";
      ctx.reason="THROUGH_SERVICE_BOUNDARY";
      // A line-level through relation is permission to evaluate a boundary,
      // not proof that any particular train continues across it.
      ctx.identity="STANDALONE";
    }
    (_lineRelations[lineId]||[]).forEach(function(r){
      var other=r.lineA===lineId?r.lineB:r.lineA;
      if(other===lineId)return;
      ctx.relatedLines.push(other);
      if(r.relation==="BRANCH_OF" && r.lineA===lineId){
        // Branch flag applies to the branch end (lineA) only; the trunk (lineB) stays standalone.
        ctx.isBranch=true;
        if(ctx.identity==="STANDALONE"){ctx.identity="SAME";ctx.confidence="LOW";ctx.reason="BRANCH_OF";}
      }else if(r.relation==="PHYSICAL_CONNECT"&&ctx.identity==="STANDALONE"){
        ctx.identity="SAME";ctx.confidence="LOW";ctx.reason="PHYSICAL_CONNECT";
      }else if(r.relation==="UNKNOWN"&&ctx.identity==="STANDALONE"){
        ctx.identity="UNKNOWN";ctx.confidence="LOW";ctx.reason="UNKNOWN_RELATION";
      }
    });
    if(!ctx.isThroughService&&!ctx.isAlias){
      var ln=(window.UNIFIED_LINES&&window.UNIFIED_LINES[lineId])||null;
      if(ln&&ln.code){
        var col=allIds.filter(function(id){var l=(window.UNIFIED_LINES&&window.UNIFIED_LINES[id])||null;return l&&l.code===ln.code&&l.operator!==ln.operator;});
        if(col.length>0){ctx.identity="SEPARATE";ctx.confidence="HIGH";ctx.reason="CODE_COLLISION_DIFF_OP";}
      }
    }
    return ctx;
  }

  function init(){if(_initialized)return;buildIndexes();}

  window.RunningChainResolver={
    init:init,
    getResolutionContext:function(lineId,allIds){if(!_initialized)buildIndexes();return computeCtx(lineId,allIds||(window.UNIFIED_LINES?Object.keys(window.UNIFIED_LINES):[]));},
    isDirectThroughService:function(a,b){if(!_initialized)buildIndexes();if(!a||!b||a===b)return false;return (_directThrough[a]||[]).indexOf(b)>=0;},
    getDirectThroughLines:function(lid){if(!_initialized)buildIndexes();return (_directThrough[lid]||[]).slice();},
    hasRelation:function(a,b,rt){if(!_initialized)buildIndexes();var rs=_lineRelations[a]||[];for(var i=0;i<rs.length;i++){var o=rs[i].lineA===a?rs[i].lineB:rs[i].lineA;if(o===b&&(!rt||rs[i].relation===rt))return true;}return false;},
    _getIndexes:function(){return{relations:_lineRelations,aliasMap:_aliasMap,branchOfMap:_branchOfMap,directThrough:_directThrough};}
  };

  if(window.LineServiceRelations){init();}else{
    var _p=0;(function _c(){_p++;if(window.LineServiceRelations){init();}else if(_p<20){setTimeout(_c,100);}})();
  }
})();
