path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re
# Show all station counts
for m in re.finditer(r'stations:\s*\[([^\]]*)\]', content):
    pos = m.start()
    ctx = content[max(0,pos-200):pos+50]
    name_match = re.search(r'name: "([^"]+)"', ctx)
    name = name_match.group(1) if name_match else 'unknown'
    stations = [s.strip().strip('"') for s in m.group(1).split(',') if s.strip().strip('"')]
    print(f'  {name}: {len(stations)} stations')
