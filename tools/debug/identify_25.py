path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find the two Array(25) occurrences and identify which lines they belong to
positions = [16079, 29765]
for p in positions:
    # Look backwards to find the line key
    chunk = content[max(0,p-500):p]
    key_match = re.search(r'"(\w+)":\s*\{', chunk)
    key = key_match.group(1) if key_match else 'unknown'
    
    # Count stations in this block
    block_start = content.rfind('    "', 0, p)
    block_end = content.find('    },', p) + 8
    block = content[block_start:block_end]
    st_match = re.search(r'stations:\s*\[([^\]]*)\]', block)
    if st_match:
        stations = [s.strip().strip('"') for s in st_match.group(1).split(',') if s.strip().strip('"')]
        print(f'{key}: stations={len(stations)}, current Array(25)')
