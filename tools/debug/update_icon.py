import sys
sys.stdout.reconfigure(encoding="utf-8")
path = "js/bundle-realtime.js"
with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "function getStatusIcon" in line:
        lines[i] = "  function getStatusIcon(status) {\n"
        lines[i+1] = "    if (status === " + chr(34) + "delayed" + chr(34) + ") {\n"
        lines[i+2] = "      return " + chr(39) + '<span class="rs-status-icon rs-status-icon-delayed" title="延误">' + chr(9651) + "</span>" + chr(39) + ";\n"
        lines[i+3] = "    }\n"
        lines[i+4] = "    return " + chr(39) + '<span class="rs-status-icon rs-status-icon-normal" title="正常">' + chr(9679) + "</span>" + chr(39) + ";\n"
        lines[i+5] = "  }\n"
        break
with open(path, "w", encoding="utf-8") as f:
    f.writelines(lines)
print("Done")
