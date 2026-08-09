import re
path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()
print("=== Color Verification ===")
for i, line in enumerate(lines, 1):
    if 'color:' in line and 'name:' in line:
        m = re.search(r'name:\s*"([^"]+)"', line)
        m2 = re.search(r'code:\s*"([^"]+)"', line)
        m3 = re.search(r'color:\s*"([^"]+)"', line)
        if m and m2 and m3:
            print(f"{i:4d} | {m.group(1)[:20]:20} | code={m2.group(1):4} | color={m3.group(1)}")
