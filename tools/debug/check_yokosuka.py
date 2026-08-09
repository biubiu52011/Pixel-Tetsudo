path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find and fix Yokosuka duration
idx = content.find('"Yokosuka":')
if idx >= 0:
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    st_m = re.search(r'stations:\s*\[(.+?)\]', block, re.DOTALL)
    if st_m:
        stations = [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
        print('Yokosuka: ' + str(len(stations)) + ' stations')
        print('Stations: ' + str(stations))
    
    dur_m = re.search(r'durations:\s*Array\((\d+)\)', block)
    if dur_m:
        print('Current duration: Array(' + dur_m.group(1) + ')')
