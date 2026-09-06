data = open("js/data-state.js","r",encoding="utf-8").read()
lines = data.split("\n")
new_lines = []
for i, line in enumerate(lines):
    if i == 149:
        # Replace the return line to include _chainBadgeHtml
        new_lines.append("    return '" + '"<div class=\"rs-line-card\" data-line=\"" + "' + 'escapeHtml(lineId) + \"" data-line-color=\"" + "' + 'escapeHtml(lineColor) + \">\" + _chainBadgeHtml'")
    else:
        new_lines.append(line)
with open("js/data-state.js","w",encoding="utf-8") as f:
    f.write("\n".join(new_lines))
print("Done")
