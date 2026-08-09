path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Fix ChuoRapid: stations=25, but Array(33) -> should be Array(25)
# Find ChuoRapid block
idx = content.find('"ChuoRapid":')
end = content.find('    },', idx) + 8
block = content[idx:end]
# Count actual stations
st_match = re.search(r'stations:\s*\[([^\]]*)\]', block)
dur_match = re.search(r'durations:\s*Array\((\d+)\)', block)
if st_match and dur_match:
    stations = [s.strip().strip('"') for s in st_match.group(1).split(',') if s.strip().strip('"')]
    dur = int(dur_match.group(1))
    print(f'ChuoRapid: {len(stations)} stations, Array({dur})')
    if len(stations) != dur:
        old = f'durations: Array({dur})'
        new = f'durations: Array({len(stations)})'
        content = content.replace(old, new, 1)
        print(f'Fixed: Array({dur}) -> Array({len(stations)})')

# Also fix the remaining Array(25) that is NOT Tozai
# Find all Array(25) and check each
positions = []
i = 0
while True:
    pos = content.find('durations: Array(25)', i)
    if pos < 0:
        break
    positions.append(pos)
    i = pos + 1
print(f'\nArray(25) at: {positions}')
for p in positions:
    chunk = content[max(0,p-800):p]
    keys = re.findall(r'"(\w+)":\s*\{', chunk)
    line_key = keys[-1] if keys else 'unknown'
    block_start = content.rfind('    "', 0, p)
    block_end = content.find('    },', p) + 8
    block = content[block_start:block_end]
    st_match = re.search(r'stations:\s*\[([^\]]*)\]', block)
    if st_match:
        stations = [s.strip().strip('"') for s in st_match.group(1).split(',') if s.strip().strip('"')]
        status = "OK" if len(stations) == 25 else f"MISMATCH(stations={len(stations)})"
        print(f'  {line_key}: {len(stations)} stations - {status}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('\nSaved.')
