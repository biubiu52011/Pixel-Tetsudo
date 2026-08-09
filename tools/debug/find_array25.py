path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find the two Array(25) and their line contexts
positions = []
i = 0
while True:
    pos = content.find('durations: Array(25)', i)
    if pos < 0:
        break
    positions.append(pos)
    i = pos + 1
print('Array(25) positions:', positions)

for p in positions:
    # Look backwards for line key
    chunk = content[max(0,p-800):p]
    keys = re.findall(r'"(\w+)":\s*\{', chunk)
    line_key = keys[-1] if keys else 'unknown'
    
    # Count stations in this block
    block_start = content.rfind('    "', 0, p)
    block_end = content.find('    },', p) + 8
    block = content[block_start:block_end]
    st_match = re.search(r'stations:\s*\[([^\]]*)\]', block)
    if st_match:
        stations = [s.strip().strip('"') for s in st_match.group(1).split(',') if s.strip().strip('"')]
        print(f'{line_key}: stations={len(stations)}, dur=Array(25)')
