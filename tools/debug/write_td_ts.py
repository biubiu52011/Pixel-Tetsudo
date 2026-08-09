path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Write output to file to avoid encoding issues
out = []
for key in ['Tokaido', 'Takasaki', 'KeihinTohoku']:
    idx = content.find(f'"{key}":')
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    ts_matches = re.findall(r'throughServices:\s*\[([^\]]*)\]', block)
    out.append(f'{key}:')
    for ts in ts_matches:
        out.append(f'  {ts.strip()[:150]}')
    if not ts_matches:
        out.append('  (none)')
    st_m = re.search(r'stations:\s*\[([^\]]*)\]', block)
    dur_m = re.search(r'durations:\s*Array\((\d+)\)', block)
    if st_m:
        stations = [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
        out.append(f'  stations={len(stations)}')
    if dur_m:
        out.append(f'  duration=Array({dur_m.group(1)})')
    out.append('')

result = '\n'.join(out)
with open(r'C:\Users\80996\Documents\项目\像素铁道\scripts\td_ts_result.txt', 'w', encoding='utf-8') as f:
    f.write(result)
print('Done')
