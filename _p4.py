f = open("js/data-state.js", "r", encoding="utf-8").read()
old = "' + escapeHtml(lineColor) + '\">'
new = "' + escapeHtml(lineColor) + '\">' + " + _chainBadgeHtml"
if old in f:
    f = f.replace(old, new, 1)
    open("js/data-state.js", "w", encoding="utf-8").write(f)
    print("patched")
else:
    print("not found")
