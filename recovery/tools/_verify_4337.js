const fs = require("fs");
const ds = fs.readFileSync("js/data-state.js", "utf8");
const df = fs.readFileSync("js/data-fusion.js", "utf8");
const res = fs.readFileSync("js/running-chain-resolver.js", "utf8");

console.log("=== 4.3.37 Verification ===\n");

const checks = {
  "getAggregatedDelay helper": ds.includes("function getAggregatedDelay"),
  "Uses RunningChainResolver": ds.includes("RunningChainResolver.getResolutionContext"),
  "Checks isThroughService": ds.includes("ctx.isThroughService"),
  "Iterates relatedLines": ds.includes("ctx.relatedLines"),
  "Computes MAX delay": ds.includes("maxDelay > maxDelay") || ds.includes("d.maxDelay > maxDelay"),
  "No mutation of original": !ds.includes("line.delayInfo ="),
  "No aggregation in data-fusion": !df.toLowerCase().includes("aggregate"),
  "No aggregation in resolver": !res.toLowerCase().includes("aggregate"),
  "UNKNOWN badge path exists": ds.includes('identity === "UNKNOWN"'),
  "BRANCH_OF sets SAME": res.includes('ctx.reason="BRANCH_OF"'),
  "JS syntax valid": (() => { try { new Function(ds); return true; } catch(e) { return false; } })(),
};

let allOk = true;
Object.entries(checks).forEach(([k, v]) => {
  console.log((v ? "?" : "?") + " " + k);
  if (!v) allOk = false;
});

console.log("\n=== " + (allOk ? "ALL PASSED" : "SOME FAILED") + " ===");

// Show the aggregation call in context
const lines = ds.split("\n");
lines.forEach((l, i) => {
  if (l.includes("_aggDelay")) {
    console.log("\nAggregation call at L" + (i+1) + ":");
    lines.slice(Math.max(0,i-2), i+3).forEach((ll, j) => console.log("  L" + (i+j-1+1) + ": " + ll));
  }
});
