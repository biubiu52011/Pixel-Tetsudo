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
console.log("Relations count:", rels.length);
console.log("THROUGH_SERVICE relations:", rels.filter(r=>r.relation==="THROUGH_SERVICE").map(r=>r.lineA+"-"+r.lineB));
global.window.LineServiceRelations = rels;

// Manual eval with debug
const resolverSrc = fs.readFileSync("js/running-chain-resolver.js","utf8");
// Inject debug into buildIndexes
const debugSrc = resolverSrc.replace(
  'if(chain.length>1)_throughServiceChains[chain.sort().join(",")]=chain;',
  'if(chain.length>1){console.log("CHAIN BUILD:", chain, "-> key:", chain.sort().join(",")); _throughServiceChains[chain.sort().join(",")]=chain;}'
);
eval(debugSrc);

console.log("\nAfter init:");
console.log("throughServiceChains keys:", Object.keys(global.window.RunningChainResolver._getIndexes().throughServiceChains));

// Now check computeCtx for Saikyo
const ctx = global.window.RunningChainResolver.getResolutionContext("Saikyo", Object.keys(global.window.UNIFIED_LINES));
console.log("\nSaikyo ctx:", JSON.stringify(ctx));

// Check raw indexes
const idx = global.window.RunningChainResolver._getIndexes();
console.log("\n_raw throughServiceChains:", JSON.stringify(idx.throughServiceChains));
