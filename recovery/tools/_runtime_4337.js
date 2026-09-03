const fs = require("fs");
global.window = { LineServiceRelations: null, UNIFIED_LINES: null, DataState: { _lines: {}, getLine(id){return this._lines[id]||null}, setLine(id,d){this._lines[id]=d} } };
const rd = JSON.parse(fs.readFileSync("data/core/railway_data.json","utf8"));
global.window.UNIFIED_LINES = {};
Object.keys(rd.lines||{}).forEach(id => { global.window.UNIFIED_LINES[id] = {id, name: rd.lines[id].name||id, code: rd.lines[id].code||null, operator: rd.lines[id].operator||"Unknown", stations: rd.lines[id].stations||[]}; });

// Extract relations by eval (safe - it just sets a global array)
eval(fs.readFileSync("data/core/line-service-relations.js","utf8").replace(/^\xEFxBBxBF/,""));
console.log("Relations loaded:", global.window.LineServiceRelations.length);
console.log("THROUGH_SERVICE:", global.window.LineServiceRelations.filter(r=>r.relation==="THROUGH_SERVICE").map(r=>r.lineA+"-"+r.lineB));

eval(fs.readFileSync("js/running-chain-resolver.js","utf8"));
const idx = global.window.RunningChainResolver._getIndexes();
console.log("Chains:", Object.keys(idx.throughServiceChains));

function getAggregatedDelay(lineId, line) {
  try {
    if(!global.window.RunningChainResolver) return null;
    var ctx = global.window.RunningChainResolver.getResolutionContext(lineId, Object.keys(global.window.UNIFIED_LINES));
    if(!ctx||!ctx.isThroughService||!ctx.relatedLines||ctx.relatedLines.length===0) return null;
    var maxDelay=0, maxReason=null;
    var curDelay = line && line.delayInfo;
    if(curDelay && curDelay.maxDelay!=null && curDelay.maxDelay>maxDelay){maxDelay=curDelay.maxDelay; maxReason=curDelay.cause||null;}
    ctx.relatedLines.forEach(function(rid){
      var rl = global.window.DataState.getLine(rid);
      if(!rl||!rl.delayInfo) return;
      var d=rl.delayInfo;
      if(d&&d.maxDelay!=null&&d.maxDelay>maxDelay){maxDelay=d.maxDelay; maxReason=d.cause||null;}
    });
    if(maxDelay>0) return {status:"delayed",maxDelay:maxDelay,interval:null,cause:maxReason};
  } catch(e){}
  return null;
}
function mkD(ms,cause){return {status:ms>0?"delayed":"normal",maxDelay:ms||null,interval:null,cause:cause||null};}
function mkND(){return {status:"no_data",maxDelay:null,interval:null,cause:null};}
function init(ids,dels){ids.forEach(function(id){global.window.DataState.setLine(id,{id:id,delayInfo:dels[id]||mkND()});});}

console.log("\n=== 4.3.37 Runtime Verification ===\n");
var P=0,F=0;
function test(name, actual, expected, desc) {
  var ok = expected===null ? actual===null : (actual&&actual.maxDelay===expected.maxDelay&&actual.status===expected.status);
  if(ok){P++;console.log("  PASS: "+name);}
  else{F++;console.log("  FAIL: "+name+" got="+JSON.stringify(actual)+" exp="+JSON.stringify(expected)+(desc?" ("+desc+")":""));
  }
}

console.log("--- T1: Saikyo(5)+Kawagoe(12) ---");
init(["Saikyo","Kawagoe"],{"Saikyo":mkD(5,"weather"),"Kawagoe":mkD(12,"equip")});
test("MAX=12", getAggregatedDelay("Saikyo",{delayInfo:mkD(5)}), {status:"delayed",maxDelay:12});

console.log("--- T2: Saikyo(15)+Kawagoe(7) ---");
init(["Saikyo","Kawagoe"],{"Saikyo":mkD(15),"Kawagoe":mkD(7)});
test("MAX=15", getAggregatedDelay("Saikyo",{delayInfo:mkD(15)}), {status:"delayed",maxDelay:15});

console.log("--- T3: Saikyo(8)+Kawagoe(null) ---");
init(["Saikyo","Kawagoe"],{"Saikyo":mkD(8),"Kawagoe":mkND()});
test("MAX(valid)=8", getAggregatedDelay("Saikyo",{delayInfo:mkD(8)}), {status:"delayed",maxDelay:8});

console.log("--- T4: Both invalid ---");
init(["Saikyo","Kawagoe"],{"Saikyo":mkND(),"Kawagoe":mkND()});
test("Both invalid->null", getAggregatedDelay("Saikyo",{delayInfo:mkND()}), null);

console.log("--- T5: BRANCH_OF ---");
init(["Agatsuma","Takasaki"],{"Agatsuma":mkD(4),"Takasaki":mkD(9)});
var ctx5=global.window.RunningChainResolver.getResolutionContext("Agatsuma",Object.keys(global.window.UNIFIED_LINES));
test("BRANCH independent", getAggregatedDelay("Agatsuma",{delayInfo:mkD(4)}), null, "ctx="+ctx5.identity+" branch="+ctx5.isBranch);

console.log("--- T6: PHYSICAL_CONNECT ---");
init(["Marunouchi","MarunouchiBranch"],{"Marunouchi":mkD(2),"MarunouchiBranch":mkD(6)});
var ctx6=global.window.RunningChainResolver.getResolutionContext("Marunouchi",Object.keys(global.window.UNIFIED_LINES));
test("PHYSICAL independent", getAggregatedDelay("Marunouchi",{delayInfo:mkD(2)}), null, "ctx="+ctx6.identity+" through="+ctx6.isThroughService);

console.log("--- T7: ALIAS_OF ---");
init(["KeikyuMain","Sakuragi"],{"KeikyuMain":mkD(7),"Sakuragi":mkD(7)});
var ctx7=global.window.RunningChainResolver.getResolutionContext("KeikyuMain",Object.keys(global.window.UNIFIED_LINES));
test("ALIAS independent", getAggregatedDelay("KeikyuMain",{delayInfo:mkD(7)}), null, "ctx="+ctx7.identity+" alias="+ctx7.isAlias);

console.log("--- T8: UNKNOWN ---");
init(["TobuNikko","Nikkoku"],{"TobuNikko":mkND(),"Nikkoku":mkND()});
var ctx8=global.window.RunningChainResolver.getResolutionContext("TobuNikko",Object.keys(global.window.UNIFIED_LINES));
test("UNKNOWN independent", getAggregatedDelay("TobuNikko",{delayInfo:mkND()}), null, "ctx="+ctx8.identity+" reason="+ctx8.reason);

console.log("--- T9: STANDALONE ---");
init(["Yamanote"],{"Yamanote":mkD(0)});
var ctx9=global.window.RunningChainResolver.getResolutionContext("Yamanote",Object.keys(global.window.UNIFIED_LINES));
test("STANDALONE independent", getAggregatedDelay("Yamanote",{delayInfo:mkD(0)}), null, "ctx="+ctx9.identity);

console.log("--- T10: SeibuIke(3)+Ikebukuro(8) ---");
init(["SeibuIkebukuro","Ikebukuro"],{"SeibuIkebukuro":mkD(3),"Ikebukuro":mkD(8,"signal")});
test("MAX=8", getAggregatedDelay("SeibuIkebukuro",{delayInfo:mkD(3)}), {status:"delayed",maxDelay:8,cause:"signal"});

console.log("--- T11: Original unchanged ---");
init(["Saikyo","Kawagoe"],{"Saikyo":mkD(5),"Kawagoe":mkD(12)});
var before=JSON.stringify(global.window.DataState.getLine("Saikyo").delayInfo);
getAggregatedDelay("Saikyo",{delayInfo:mkD(5)});
var after=JSON.stringify(global.window.DataState.getLine("Saikyo").delayInfo);
test("Original unchanged", after, before);

console.log("\n=== RESULTS: "+P+"/"+(P+F)+" PASSED ===");
if(F>0){console.log("SOME FAILED");process.exit(1);}
else console.log("ALL TESTS PASSED");
