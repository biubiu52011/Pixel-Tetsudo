path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8-sig') as f:
    content = f.read()

import re

# Extract all line data from current file
lines_data = {}
keys = re.findall(r'"(\w+)":\s*\{', content)
for key in keys:
    idx = content.find('"' + key + '":')
    if idx < 0:
        continue
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    
    code_m = re.search(r'code: "([^"]+)"', block)
    st_m = re.search(r'stations:\s*\[(.+?)\]', block, re.DOTALL)
    dur_m = re.search(r'durations:\s*Array\((\d+)\)', block)
    ts_m = re.search(r'throughServices:\s*\[([^\]]*)\]', block)
    
    if st_m and dur_m:
        stations = [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
        dur = int(dur_m.group(1))
        code = code_m.group(1) if code_m else '?'
        ts = ts_m.group(1).strip() if ts_m else ''
        lines_data[key] = {'code': code, 'stations': stations, 'dur': dur, 'ts': ts}

# Print summary
out = []
for key in sorted(lines_data.keys()):
    info = lines_data[key]
    match = 'OK' if len(info['stations']) == info['dur'] else 'MISMATCH'
    out.append(key + ' (' + info['code'] + '): ' + str(len(info['stations'])) + '/' + info['dur'] + ' ' + match)

with open(r'C:\Users\80996\Documents\项目\像素铁道\scripts\summary.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
print('Done')
