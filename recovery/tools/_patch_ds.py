path = r"C:\Users\80996\Documents\项目\像素铁道\js\data-state.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''      } else if (_chainMeta.identity === "SEPARATE" && _chainMeta.reason === "CODE_COLLISION_DIFF_OP") {
        _chainBadgeHtml = "<span class=\\"rs-chain-badge rs-chain-badge-collision\\" title=\\"Code collision\\"></span>";
      }'''

new = '''      } else if (_chainMeta.identity === "SEPARATE" && _chainMeta.reason === "CODE_COLLISION_DIFF_OP") {
        _chainBadgeHtml = "<span class=\\"rs-chain-badge rs-chain-badge-collision\\" title=\\"Code collision\\"></span>";
      } else if (_chainMeta.identity === "UNKNOWN") {
        _chainBadgeHtml = "<span class=\\"rs-chain-badge rs-chain-badge-unknown\\" title=\\"Unknown relation\\"></span>";
      }'''

if old in content:
    content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("OK: added UNKNOWN badge branch")
else:
    print("ERROR: pattern not found")
