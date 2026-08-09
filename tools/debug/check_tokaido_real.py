path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find Tokaido block
idx = content.find('"Tokaido":')
if idx < 0:
    idx = content.find('Tokaido')
print('Tokaido found at:', idx)
if idx >= 0:
    # Find the full block
    end = content.find('    },', idx)
    block = content[idx:end+8]
    # Write to file
    with open(r'C:\Users\80996\Documents\项目\像素铁道\scripts\tokaido_block.txt', 'w', encoding='utf-8') as f:
        f.write(block)
    print('Written to tokaido_block.txt, length:', len(block))
    
    # Check stations
    st_m = re.search(r'stations:\s*\[([^\]]*)\]', block)
    if st_m:
        stations = [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
        print('Stations count:', len(stations))
        print('First 5:', stations[:5])
        print('Last 5:', stations[-5:])
