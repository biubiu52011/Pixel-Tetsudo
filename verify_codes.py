import re
path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
codes = {}
for m in re.finditer(r'name:\s*"(\w+)"', content):
    name = m.group(1)
    start = m.end()
    block = content[start:start+200]
    cm = re.search(r'code:\s*"([^"]+)"', block)
    if cm:
        code = cm.group(1)
        if code not in codes:
            codes[code] = []
        codes[code].append(name)
print("=== Duplicate Codes ===")
found_dup = False
for code, names in sorted(codes.items()):
    if len(names) > 1:
        found_dup = True
        print(f"  {code}: {names}")
if not found_dup:
    print("  None - all codes unique!")
