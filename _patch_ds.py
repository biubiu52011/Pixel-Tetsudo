data = open("js/data-state.js","r",encoding="utf-8").read()
lines = data.split("\n")
new_lines = []
for i, line in enumerate(lines):
    if i == 135:
        new_lines.append("    // Read chain metadata for badge display (transient, runtime-only)")
        new_lines.append("    var _chainMeta = line._chainMeta || null;")
        new_lines.append('    var _chainBadgeHtml = "";')
        new_lines.append('    if (_chainMeta) {')
        new_lines.append('      if (_chainMeta.isThroughService) {')
        new_lines.append('        _chainBadgeHtml = "<span class=\\"rs-chain-badge rs-chain-badge-through\\" title=\\"Through Service\\"></span>";')
        new_lines.append('      } else if (_chainMeta.isAlias) {')
        new_lines.append('        _chainBadgeHtml = "<span class=\\"rs-chain-badge rs-chain-badge-alias\\" title=\\"Alias\\"></span>";')
        new_lines.append('      } else if (_chainMeta.isBranch) {')
        new_lines.append('        _chainBadgeHtml = "<span class=\\"rs-chain-badge rs-chain-badge-branch\\" title=\\"Branch\\"></span>";')
        new_lines.append('      } else if (_chainMeta.identity === "SEPARATE" && _chainMeta.reason === "CODE_COLLISION_DIFF_OP") {')
        new_lines.append('        _chainBadgeHtml = "<span class=\\"rs-chain-badge rs-chain-badge-collision\\" title=\\"Code collision\\"></span>";')
        new_lines.append('      }')
        new_lines.append("    }")
        new_lines.append(line)
    else:
        new_lines.append(line)
with open("js/data-state.js","w",encoding="utf-8") as f:
    f.write("\n".join(new_lines))
print("OK lines:", len(new_lines))
