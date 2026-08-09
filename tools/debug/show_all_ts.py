path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re
# Show all throughServices values
for m in re.finditer(r'"(\w+)":\s*\{[^}]*throughServices:\s*\[([^\]]*)\]', content, re.DOTALL):
    name = m.group(1)
    ts = m.group(2).strip()
    if ts:
        print(f'{name}: {ts}')
