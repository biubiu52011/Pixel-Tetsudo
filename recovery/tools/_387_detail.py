path = r"C:\Users\80996\Documents\项目\像素铁道\js\trains-detail.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = "escapeHtml(line.nameJa || line.nameEn || line.name || lineId)"
new = "getDisplayLineName(line)"

if old in content:
    content = content.replace(old, new, 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("trains-detail.js patched OK")
else:
    print("ERROR: pattern not found")
    idx = content.find("detail-title")
    if idx >= 0:
        print(repr(content[idx-40:idx+120]))
