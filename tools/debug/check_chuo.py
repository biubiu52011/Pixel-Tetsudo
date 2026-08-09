path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find ChuoRapid block
idx = content.find('"ChuoRapid":')
end = content.find('    },', idx) + 8
block = content[idx:end]
print('ChuoRapid block:')
print(block)
print()
# Count stations
st_match = re.search(r'stations:\s*\[([^\]]*)\]', block)
dur_match = re.search(r'durations:\s*Array\((\d+)\)', block)
if st_match:
    stations = [s.strip().strip('"') for s in st_match.group(1).split(',') if s.strip().strip('"')]
    print(f'Stations count: {len(stations)}')
    print(f'Stations: {stations}')
if dur_match:
    print(f'Duration: Array({dur_match.group(1)})')
