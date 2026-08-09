path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Final verification
keys = re.findall(r'"(\w+)":\s*\{', content)
out = []
for key in keys:
    idx = content.find('"' + key + '":')
    if idx < 0:
        out.append(key + ': NOT FOUND')
        continue
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    st_m = re.search(r'stations:\s*\[([^\]]*)\]', block)
    dur_m = re.search(r'durations:\s*Array\((\d+)\)', block)
    code_m = re.search(r'code: "([^"]+)"', block)
    if st_m and dur_m:
        stations = [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
        dur = int(dur_m.group(1))
        match = 'OK' if len(stations) == dur else 'MISMATCH'
        out.append(key + ' (' + code_m.group(1) + '): ' + str(len(stations)) + '/' + str(dur) + ' ' + match)

with open(r'C:\Users\80996\Documents\项目\像素铁道\scripts\final_metro_verify.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
print('Done')
