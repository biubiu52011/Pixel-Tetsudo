const fs = require("fs");
const path = "js/running-chain-resolver.js";
let content = fs.readFileSync(path, "utf8");

// The forEach with break is a syntax error. Replace with for loop.
const oldBlock = `    (_lineRelations[a]||[]).forEach(function(r){
      if(r.lineA===b||r.lineB===a){
        if(r.relation==="THROUGH_SERVICE")s+=3;
        else if(r.relation==="BRANCH_OF"||r.relation==="PHYSICAL_CONNECT")s+=2;
        else if(r.relation==="ALIAS_OF")s+=3;
        s+=0;break;
      }
    });`;

const newBlock = `    (function(){
      var rels = _lineRelations[a] || [];
      for(var i2=0;i2<rels.length;i2++){var r=rels[i2];
        if(r.lineA===b||r.lineB===a){
          if(r.relation==="THROUGH_SERVICE")s+=3;
          else if(r.relation==="BRANCH_OF"||r.relation==="PHYSICAL_CONNECT")s+=2;
          else if(r.relation==="ALIAS_OF")s+=3;
          return;
        }
      }
    })();`;

if (content.indexOf(oldBlock) >= 0) {
  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync(path, content, "utf8");
  console.log("OK: fixed break-in-foreach");
} else {
  console.log("Pattern not found exactly, trying line-based fix...");
  const lines = content.split("\n");
  let fixed = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].indexOf("forEach(function(r)") >= 0 && lines[i+5] && lines[i+5].indexOf("break;") >= 0) {
      const indent = "      ";
      lines[i] = "    (function(){";
      lines[i+1] = indent + "var rels = _lineRelations[a] || [];";
      lines[i+2] = indent + "for(var i2=0;i2<rels.length;i2++){var r=rels[i2];";
      lines[i+3] = indent + "  if(r.lineA===b||r.lineB===a){";
      lines[i+4] = indent + "    if(r.relation===\"THROUGH_SERVICE\")s+=3;";
      lines[i+5] = indent + "    else if(r.relation===\"BRANCH_OF\"||r.relation===\"PHYSICAL_CONNECT\")s+=2;";
      lines[i+6] = indent + "    else if(r.relation===\"ALIAS_OF\")s+=3;";
      lines[i+7] = indent + "    return;";
      lines[i+8] = indent + "}";
      lines[i+9] = indent + "}";
      lines[i+10] = "    })();";
      // Remove old lines i+1 through i+9 (9 lines to remove, we replaced 1)
      lines.splice(i+1, 9);
      fixed = true;
      break;
    }
  }
  if (fixed) {
    fs.writeFileSync(path, lines.join("\n"), "utf8");
    console.log("OK: fixed via line-based replacement");
  } else {
    console.log("ERROR: could not find pattern");
  }
}

// Verify syntax
const verify = fs.readFileSync(path, "utf8");
try { new Function(verify); console.log("Syntax: OK"); } catch(e) { console.log("Syntax ERROR:", e.message); }
