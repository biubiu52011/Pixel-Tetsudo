path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Check throughServices in new blocks
for key in ['Tokaido', 'Takasaki', 'KeihinTohoku']:
    idx = content.find(f'"{key}":')
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    # Use a more lenient regex
    ts_matches = re.findall(r'throughServices:\s*\[([^\]]*)\]', block)
    print(f'{key}:')
    for ts in ts_matches:
        print(f'  {ts.strip()[:200]}')
    if not ts_matches:
        print(f'  (none found)')
        # Show the throughServices line directly
        ts_line = re.search(r'throughServices:.*$', block, re.MULTILINE)
        if ts_line:
            print(f'  raw: {repr(ts_line.group()[:200])}')

# Verify station counts
print('\n=== Station counts ===')
for key in ['Tokaido', 'Takasaki']:
    idx = content.find(f'"{key}":')
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    st_m = re.search(r'stations:\s*\[([^\]]*)\]', block)
    dur_m = re.search(r'durations:\s*Array\((\d+)\)', block)
    if st_m:
        stations = [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
        print(f'{key}: {len(stations)} stations')
    if dur_m:
        print(f'  duration: Array({dur_m.group(1)})')
