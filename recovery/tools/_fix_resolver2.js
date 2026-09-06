const fs = require("fs");
const path = "js/running-chain-resolver.js";
let content = fs.readFileSync(path, "utf8");

// Replace the broken scoreEvidence function with a correct implementation
const oldFunc = `  function scoreEvidence(a,b){
    var s=0;
    (function(){
    })();
    var sa=la&&la.stations?la.stations:[];
    var sb=lb&&lb.stations?lb.stations:[];`;

const newFunc = `  function scoreEvidence(a,b){
    var s=0;
    var la=(window.UNIFIED_LINES&&window.UNIFIED_LINES[a])||null;
    var lb=(window.UNIFIED_LINES&&window.UNIFIED_LINES[b])||null;
    (_lineRelations[a]||[]).forEach(function(r){
      if(r.lineA===b||r.lineB===a){
        if(r.relation==="THROUGH_SERVICE")s+=3;
        else if(r.relation==="BRANCH_OF"||r.relation==="PHYSICAL_CONNECT")s+=2;
        else if(r.relation==="ALIAS_OF")s+=3;
      }
    });
    if(la&&lb&&la.code&&lb.code&&la.code===lb.code)s+=(la.operator===lb.operator)?2:-5;
    var sa=la&&la.stations?la.stations:[];
    var sb=lb&&lb.stations?lb.stations:[];`;

if (content.indexOf(oldFunc) >= 0) {
  content = content.replace(oldFunc, newFunc);
  fs.writeFileSync(path, content, "utf8");
  console.log("OK: scoreEvidence fixed");
} else {
  console.log("Pattern not found, doing line-by-line fix...");
  const lines = content.split("\n");
  let inFunc = false, braceCount = 0, startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].indexOf("function scoreEvidence") >= 0) {
      inFunc = true;
      startIdx = i;
      braceCount = 0;
    }
    if (inFunc) {
      braceCount += (lines[i].match(/{/g) || []).length;
      braceCount -= (lines[i].match(/}/g) || []).length;
      if (braceCount === 0 && i > startIdx) {
        // Found the end of the function
        const indent = "    ";
        const newLines = [
          "  function scoreEvidence(a,b){",
          indent + "var s=0;",
          indent + "var la=(window.UNIFIED_LINES&&window.UNIFIED_LINES[a])||null;",
          indent + "var lb=(window.UNIFIED_LINES&&window.UNIFIED_LINES[b])||null;",
          indent + "(_lineRelations[a]||[]).forEach(function(r){",
          indent + "  if(r.lineA===b||r.lineB===a){",
          indent + "    if(r.relation===\"THROUGH_SERVICE\")s+=3;",
          indent + "    else if(r.relation===\"BRANCH_OF\"||r.relation===\"PHYSICAL_CONNECT\")s+=2;",
          indent + "    else if(r.relation===\"ALIAS_OF\")s+=3;",
          indent + "  }",
          indent + "});",
          indent + "if(la&&lb&&la.code&&lb.code&&la.code===lb.code)s+=(la.operator===lb.operator)?2:-5;",
          indent + "var sa=la&&la.stations?la.stations:[];",
          indent + "var sb=lb&&lb.stations?lb.stations:[];",
        ];
        lines.splice(startIdx, i - startIdx + 1, newLines.join("\n"));
        break;
      }
    }
  }
  fs.writeFileSync(path, lines.join("\n"), "utf8");
  console.log("OK: line-by-line fix applied");
}

// Verify
const verify = fs.readFileSync(path, "utf8");
try { new Function(verify); console.log("Syntax: OK"); } catch(e) { console.log("Syntax ERROR:", e.message); }

// Also verify no more break-in-foreach issues
const hasBadBreak = verify.match(/forEach.*\n[\s\S]*?break;/);
console.log("No break-in-foreach:", !hasBadBreak ? "OK" : "STILL BROKEN");
