path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Check OdakyuEnoshima
idx = content.find('"OdakyuEnoshima":')
if idx < 0:
    print('OdakyuEnoshima not found')
else:
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    st_m = re.search(r'stations:\s*\[(.+?)\]', block, re.DOTALL)
    dur_m = re.search(r'durations:\s*Array\((\d+)\)', block)
    if st_m:
        stations = [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
        print('OdakyuEnoshima: ' + str(len(stations)) + ' stations')
        print('Stations: ' + str(stations))
    if dur_m:
        print('Duration: Array(' + dur_m.group(1) + ')')

# Check if Yurakucho and Asakusa exist under different names
for kw in ['Yurakucho', 'YurakuchoLine', 'yurakucho', 'Asakusa', 'AsakusaLine', 'asakusa']:
    idx = content.find(kw)
    if idx >= 0:
        print(kw + ' found at ' + str(idx))
        print('Context: ' + repr(content[max(0,idx-20):idx+50]))
    else:
        print(kw + ' NOT found')
