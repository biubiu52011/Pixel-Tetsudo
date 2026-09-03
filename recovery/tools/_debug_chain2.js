const fs = require("fs");
global.window = { LineServiceRelations: null, UNIFIED_LINES: null, DataState: { _lines: {}, getLine(id){return this._lines[id]||null}, setLine(id,d){this._lines[id]=d} } };
const rd = JSON.parse(fs.readFileSync("data/core/railway_data.json","utf8"));
global.window.UNIFIED_LINES = {};
Object.keys(rd.lines||{}).forEach(id => { global.window.UNIFIED_LINES[id] = {id, name: rd.lines[id].name||id, code: rd.lines[id].code||null, operator: rd.lines[id].operator||"Unknown", stations: rd.lines[id].stations||[]}; });
const rels = [];
const rm = fs.readFileSync("data/core/line-service-relations.js","utf8").match(/LineServiceRelations\s*=\s*\[([\s\S]*?)\];/);
if(rm) {
  rm[1].split("},").forEach(function(c){
    c = c.trim().replace(/^{|},?$/g, "");
    if(!c) return;
    var o = {};
    c.split(",").forEach(function(p){var k=p.split(":"); if(k.length>=2) o[k[0].trim()]=k.slice(1).join(":").trim().replace(/"/g,"")});
    if(o.lineA && o.lineB) rels.push(o);
  });
}
global.window.LineServiceRelations = rels;

// Evaluate resolver directly (same scope as window)
eval(fs.readFileSync("js/running-chain-resolver.js","utf8"));

// Check raw indexes
const idx = global.window.RunningChainResolver._getIndexes();
console.log("throughServiceChains:", JSON.stringify(idx.throughServiceChains));

// Set test data
global.window.DataState.setLine("Saikyo", {id:"Saikyo", delayInfo:{status:"delayed",maxDelay:15,interval:null,cause:null}});
global.window.DataState.setLine("Kawagoe", {id:"Kawagoe", delayInfo:{status:"delayed",maxDelay:7,interval:null,cause:null}});

// Check ctx
const ctx = global.window.RunningChainResolver.getResolutionContext("Saikyo", Object.keys(global.window.UNIFIED_LINES));
console.log("Saikyo ctx relatedLines:", JSON.stringify(ctx.relatedLines));
console.log("Kawagoe ctx relatedLines:", JSON.stringify(global.window.RunningChainResolver.getResolutionContext("Kawagoe", Object.keys(global.window.UNIFIED_LINES)).relatedLines));

// Now test aggregation directly
function getAggregatedDelay(lineId, line) {
  try {
    if (!global.window.RunningChainResolver) return null;
    var ctx = global.window.RunningChainResolver.getResolutionContext(lineId, Object.keys(global.window.UNIFIED_LINES));
    console.log("  ctx for", lineId, ":", ctx.identity, "isThroughService=" + ctx.isThroughService, "relatedLines=" + JSON.stringify(ctx.relatedLines));
    if (!ctx || !ctx.isThroughService || !ctx.relatedLines || ctx.relatedLines.length === 0) return null;
    var maxDelay = 0;
    var maxReason = null;
    // Include current line
    var curDelay = line && line.delayInfo;
    console.log("  curDelay:", JSON.stringify(curDelay));
    if (curDelay && curDelay.maxDelay != null && curDelay.maxDelay > maxDelay) {
      maxDelay = curDelay.maxDelay;
      maxReason = curDelay.cause || null;
      console.log("  updated maxDelay from current:", maxDelay);
    }
    ctx.relatedLines.forEach(function(relId) {
      var relLine = global.window.DataState.getLine(relId);
      console.log("  checking relId:", relId, "relLine:", relLine ? JSON.stringify(relLine.delayInfo) : "null");
      if (!relLine || !relLine.delayInfo) return;
      var d = relLine.delayInfo;
      if (d && d.maxDelay != null && d.maxDelay > maxDelay) {
        maxDelay = d.maxDelay;
        maxReason = d.cause || null;
        console.log("  updated maxDelay from rel:", maxDelay);
      }
    });
    console.log("  final maxDelay:", maxDelay);
    if (maxDelay > 0) return { status: "delayed", maxDelay: maxDelay, interval: null, cause: maxReason };
  } catch(e) { console.log("  ERROR:", e.message); }
  return null;
}

console.log("\n--- Test Saikyo(15)+Kawagoe(7) ---");
var result = getAggregatedDelay("Saikyo", {delayInfo:{status:"delayed",maxDelay:15,interval:null,cause:null}});
console.log("RESULT:", JSON.stringify(result));
