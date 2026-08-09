path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re
# Show all duration patterns in the file
for m in re.finditer(r'durations:\s*Array\((\d+)\)', content):
    pos = m.start()
    ctx = content[max(0,pos-100):pos+80]
    # Find which line this belongs to
    name_match = re.search(r'name: "([^"]+)"', ctx)
    name = name_match.group(1) if name_match else 'unknown'
    print(f'  {name}: durations: Array({m.group(1)})')
