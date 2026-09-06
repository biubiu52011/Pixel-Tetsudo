import sys
path = r"C:\Users\80996\Documents\项目\像素铁道\js\running-chain-resolver.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = 'if(r.relation==="BRANCH_OF"){\n        ctx.isBranch=true;\n        if(ctx.identity==="STANDALONE"){ctx.identity="UNKNOWN";ctx.confidence="LOW";ctx.reason="BRANCH_OF";}\n      }else if(r.relation==="PHYSICAL_CONNECT"&&ctx.identity==="STANDALONE"){\n        ctx.identity="UNKNOWN";ctx.confidence="LOW";ctx.reason="PHYSICAL_CONNECT";\n      }'

new = 'if(r.relation==="BRANCH_OF"){\n        ctx.isBranch=true;\n        if(ctx.identity==="STANDALONE"){ctx.identity="SAME";ctx.confidence="LOW";ctx.reason="BRANCH_OF";}\n      }else if(r.relation==="PHYSICAL_CONNECT"&&ctx.identity==="STANDALONE"){\n        ctx.identity="SAME";ctx.confidence="LOW";ctx.reason="PHYSICAL_CONNECT";\n      }else if(r.relation==="UNKNOWN"&&ctx.identity==="STANDALONE"){\n        ctx.identity="UNKNOWN";ctx.confidence="LOW";ctx.reason="UNKNOWN_RELATION";\n      }'

if old in content:
    content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("OK: patched running-chain-resolver.js")
else:
    print("ERROR: pattern not found")
    # Debug: show what's actually there
    idx = content.find('BRANCH_OF')
    if idx >= 0:
        print(repr(content[idx-20:idx+200]))
