path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Verify all fixes are present
checks = []
# 1. JobanLocal has code JL
checks.append(('JobanLocal code JL', 'code: "JL"' in content and 'JobanLocal' in content))
# 2. Tokaido has 27 stations (热海...)
idx_td = content.find('"Tokaido":')
if idx_td >= 0:
    block = content[idx_td:idx_td+3000]
    st_m = re.search(r'stations:\s*\[([^\]]*)\]', block)
    if st_m:
        stations = [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
        checks.append(('Tokaido 27 stations', len(stations) == 27 and stations[0] == '热海'))
        checks.append(('Tokaido ends with 大宫', stations[-1] == '大宫'))
# 3. Takasaki has 23 stations
idx_tk = content.find('"Takasaki":')
if idx_tk >= 0:
    block = content[idx_tk:idx_tk+3000]
    st_m = re.search(r'stations:\s*\[([^\]]*)\]', block)
    if st_m:
        stations = [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
        checks.append(('Takasaki 23 stations', len(stations) == 23 and stations[0] == '大宫'))
# 4. throughServices for Tokaido and Takasaki
checks.append(('Tokaido has throughServices', 'JT' in content and 'JU' in content))

for name, result in checks:
    print(f'{"OK" if result else "FAIL"}: {name}')
