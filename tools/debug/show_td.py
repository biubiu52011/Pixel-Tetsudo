path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

for key in ['Tokaido', 'Utsunomiya', 'Takasaki', 'Yokohama']:
    idx = content.find(f'"{key}":')
    if idx < 0:
        print(f'{key} not found')
        continue
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    # Extract key fields
    code_m = re.search(r'code: "([^"]+)"', block)
    name_m = re.search(r'name: "([^"]+)"', block)
    stations_m = re.search(r'stations:\s*\[([^\]]*)\]', block)
    dur_m = re.search(r'durations:\s*Array\((\d+)\)', block)
    ts_m = re.search(r'throughServices:\s*\[([^\]]*)\]', block)
    
    stations = []
    if stations_m:
        stations = [s.strip().strip('"') for s in stations_m.group(1).split(',') if s.strip().strip('"')]
    
    print(f'=== {key} ===')
    print(f'  code={code_m.group(1) if code_m else "?"}, name={name_m.group(1) if name_m else "?"}')
    print(f'  stations={len(stations)}, dur=Array({dur_m.group(1) if dur_m else "?"})')
    print(f'  throughServices={ts_m.group(1).strip() if ts_m else "empty"}')
    print(f'  stations list: {stations}')
    print()
