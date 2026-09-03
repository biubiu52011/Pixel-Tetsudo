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
eval(fs.readFileSync("js/running-chain-resolver.js","utf8"));

console.log("Saikyo ctx:", JSON.stringify(global.window.RunningChainResolver.getResolutionContext("Saikyo", Object.keys(global.window.UNIFIED_LINES))));
console.log("Kawagoe ctx:", JSON.stringify(global.window.RunningChainResolver.getResolutionContext("Kawagoe", Object.keys(global.window.UNIFIED_LINES))));
console.log("Same chain:", global.window.RunningChainResolver.isInThroughServiceChain("Saikyo", "Kawagoe"));

global.window.DataState.setLine("Saikyo", {id:"Saikyo", delayInfo:{status:"delayed",maxDelay:15,interval:null,cause:null}});
global.window.DataState.setLine("Kawagoe", {id:"Kawagoe", delayInfo:{status:"delayed",maxDelay:7,interval:null,cause:null}});
console.log("DataState Saikyo:", JSON.stringify(global.window.DataState.getLine("Saikyo")));
console.log("DataState Kawagoe:", JSON.stringify(global.window.DataState.getLine("Kawagoe")));

// Extract and eval getAggregatedDelay from data-state.js
const dsSrc = fs.readFileSync("js/data-state.js","utf8");
const fnMatch = dsSrc.match(/function getAggregatedDelay\(lineId, line\) \{[\s\S]*?\n  \}/);
if(fnMatch) {
  console.log("\nAggregation function:");
  console.log(fnMatch[0]);
  const aggFn = new Function("window", fnMatch[0] + "\nreturn getAggregatedDelay;");
  const getAgg = aggFn(global.window);
  const result = getAgg("Saikyo", {delayInfo:{status:"delayed",maxDelay:15,interval:null,cause:null}});
  console.log("\nResult for Saikyo(15):", JSON.stringify(result));
}
