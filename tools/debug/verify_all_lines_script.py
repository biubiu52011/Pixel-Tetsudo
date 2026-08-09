path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Verify all lines
keys = re.findall(r'"(\w+)":\s*\{', content)
out = []
out.append('Total lines: ' + str(len(keys)))
out.append('')

# Check syntax
open_b = content.count('{')
close_b = content.count('}')
open_br = content.count('[')
close_br = content.count(']')
out.append('Braces: {{=' + str(open_b) + ', }}=' + str(close_b) + ', balanced=' + str(open_b==close_b))
out.append('Brackets: [' + str(open_br) + ', ]=' + str(close_br) + ', balanced=' + str(open_br==close_br))
out.append('')

# Check each line
mismatches = 0
for key in keys:
    idx = content.find('"' + key + '":')
    if idx < 0:
        out.append(key + ': NOT FOUND')
        mismatches += 1
        continue
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    st_m = re.search(r'stations:\s*\[(.+?)\]', block, re.DOTALL)
    dur_m = re.search(r'durations:\s*Array\((\d+)\)', block)
    code_m = re.search(r'code: "([^"]+)"', block)
    if st_m and dur_m:
        stations = [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
        dur = int(dur_m.group(1))
        match = 'OK' if len(stations) == dur else 'MISMATCH'
        if match == 'MISMATCH':
            mismatches += 1
        out.append(key + ' (' + code_m.group(1) + '): ' + str(len(stations)) + '/' + str(dur) + ' ' + match)
    else:
        out.append(key + ': incomplete')
        mismatches += 1

out.append('')
out.append('Mismatches: ' + str(mismatches))

with open(r'C:\Users\80996\Documents\项目\像素铁道\scripts\verify_all_lines.py', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
print('Done')
