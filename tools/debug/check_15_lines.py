path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Check what we have
keys = re.findall(r'"(\w+)":\s*\{', content)
print('Lines in file:', len(keys))
print('Keys:', keys)

# Check for any complete blocks
for key in keys:
    idx = content.find('"' + key + '":')
    if idx >= 0:
        end = content.find('    },', idx) + 8
        block = content[idx:end]
        st_m = re.search(r'stations:\s*\[(.+?)\]', block, re.DOTALL)
        dur_m = re.search(r'durations:\s*Array\((\d+)\)', block)
        if st_m and dur_m:
            stations = [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
            dur = int(dur_m.group(1))
            match = 'OK' if len(stations) == dur else 'MISMATCH'
            print(key + ': ' + str(len(stations)) + '/' + str(dur) + ' ' + match)
        else:
            print(key + ': incomplete block')
