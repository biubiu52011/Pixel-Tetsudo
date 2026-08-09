path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Check Takasaki stations
idx = content.find('"Takasaki":')
if idx >= 0:
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    st_m = re.search(r'stations:\s*\[(.+?)\]', block, re.DOTALL)
    if st_m:
        stations = [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
        print('Takasaki stations: ' + str(len(stations)))
        print('First 5: ' + str(stations[:5]))
        print('Last 5: ' + str(stations[-5:]))
        print('Has Ueno: ' + str('Ueno' in stations))
        print('Has Omiya: ' + str('Omiya' in stations))
        print('Has Takasaki: ' + str('Takasaki' in stations))
        print('Has Maebashi: ' + str('Maebashi' in stations))
