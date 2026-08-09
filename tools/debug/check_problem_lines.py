path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Check Yurakucho, Asakusa, OdakyuEnoshima
for key in ['Yurakucho', 'Asakusa', 'OdakyuEnoshima']:
    idx = content.find('"' + key + '":')
    if idx < 0:
        print(key + ': NOT FOUND')
        continue
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    
    # Find stations line
    st_match = re.search(r'stations:\s*\[(.+?)\]', block, re.DOTALL)
    dur_match = re.search(r'durations:\s*Array\((\d+)\)', block)
    code_m = re.search(r'code: "([^"]+)"', block)
    
    print(key + ' (' + code_m.group(1) + '):')
    if st_match:
        stations_str = st_match.group(1)
        # Count stations
        stations = [s.strip().strip('"') for s in stations_str.split(',') if s.strip().strip('"')]
        print('  stations count: ' + str(len(stations)))
        print('  first 5: ' + str(stations[:5]))
        print('  last 5: ' + str(stations[-5:]))
    if dur_match:
        print('  duration: Array(' + dur_match.group(1) + ')')
    print()
