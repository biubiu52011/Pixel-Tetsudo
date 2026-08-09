import sys
sys.stdout.reconfigure(encoding="utf-8")

path = "js/bundle-realtime.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace renderCard function
old_func = '''function renderCard(line, lineId) {
    var iconHtml = line.image
      ? "<img src=\"" + getBasePath() + "/" + escapeHtml(line.image) + "\" alt=\"" + escapeHtml(line.code) + "\" class=\"rs-line-icon\">"
      : "<div class=\"rs-code-badge\" style=\"background:" + (line.color || "#999") + ";\">" + escapeHtml(line.code) + "</div>";
    return "<div class=\"rs-line-card\" data-line=\"" + escapeHtml(lineId) + "\"><div class=\"rs-line-header\">" + iconHtml
      + "<div class=\"rs-line-info\"><div class=\"rs-line-name\">" + escapeHtml(line.name) + "</div>"
      + "<div class=\"rs-line-operator\">" + escapeHtml(line.operator) + "</div></div>"
      + "<div class=\"rs-status-badge\" style=\"color:" + (line.color || "#999") + ";\">" + escapeHtml(line.code) + "</div></div></div>";
  }'''

new_func = '''function getLineStatus(line) {
    if (line.delayInfo && line.delayInfo.trains && line.delayInfo.trains.length > 0) {
      return "delayed";
    }
    return "normal";
  }
  function getStatusIcon(status) {
    if (status === "delayed") {
      return \'<span class="rs-status-dot rs-status-dot-delayed" title="延误"></span>\';
    }
    return \'<span class="rs-status-dot rs-status-dot-normal" title="正常"></span>\';
  }
  function renderCard(line, lineId) {
    var iconHtml = line.image
      ? "<img src=\"" + getBasePath() + "/" + escapeHtml(line.image) + "\" alt=\"" + escapeHtml(line.code) + "\" class=\"rs-line-icon\">"
      : "<div class=\"rs-code-badge\" style=\"background:" + (line.color || "#999") + ";\">" + escapeHtml(line.code) + "</div>";
    var status = getLineStatus(line);
    return "<div class=\"rs-line-card\" data-line=\"" + escapeHtml(lineId) + "\"><div class=\"rs-line-header\">" + iconHtml
      + "<div class=\"rs-line-info\"><div class=\"rs-line-name\">" + escapeHtml(line.name) + "</div>"
      + "<div class=\"rs-line-operator\">" + escapeHtml(line.operator) + "</div></div>"
      + getStatusIcon(status) + "</div></div>";
  }'''

content = content.replace(old_func, new_func)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
