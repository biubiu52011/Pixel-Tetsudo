data = open("js/data-state.js","r",encoding="utf-8").read()
old = '    return "\'<div class=\\"rs-line-card\\" data-line=\\"\' + escapeHtml(lineId) + \'\\" data-line-color=\\"\' + escapeHtml(lineColor) + \'\\">\'"
new = '''    // Read chain metadata for badge display (transient, runtime-only)
    var _chainMeta = line._chainMeta || null;
    var _chainBadgeHtml = "";
    if (_chainMeta) {
      if (_chainMeta.isThroughService) {
        _chainBadgeHtml = \'<span class="rs-chain-badge rs-chain-badge-through" title="Through Service"></span>\';
      } else if (_chainMeta.isAlias) {
        _chainBadgeHtml = \'<span class="rs-chain-badge rs-chain-badge-alias" title="Alias"></span>\';
      } else if (_chainMeta.isBranch) {
        _chainBadgeHtml = \'<span class="rs-chain-badge rs-chain-badge-branch" title="Branch"></span>\';
      } else if (_chainMeta.identity === "SEPARATE" && _chainMeta.reason === "CODE_COLLISION_DIFF_OP") {
        _chainBadgeHtml = \'<span class="rs-chain-badge rs-chain-badge-collision" title="Code collision"></span>\';
      }
    }
    return "\'<div class=\\"rs-line-card\\" data-line=\\"\' + escapeHtml(lineId) + \'\\" data-line-color=\\"\' + escapeHtml(lineColor) + \'\">\' + _chainBadgeHtml'''
if old in data:
    data = data.replace(old, new)
    # Update closing tag
    close_old = "      + '</div></div>'"
    close_new = "      + '</div></div>'"
    # The closing tag already has no reference to chainBadge, need to add it
    # Find and update: line ends with + '</div></div>'
    # Actually let me check what's after the return
    idx = data.find("return '<div class=\"rs-line-card\"")
    print("Found return at:", idx)
    print(repr(data[idx:idx+500]))
else:
    print("Pattern not found in data-state.js")
    idx = data.find('data-line-color')
    print(repr(data[max(0,idx-50):idx+200]))
