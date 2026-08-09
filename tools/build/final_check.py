path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Write all checks to file to avoid encoding issues
out = []
out.append('File length: ' + str(len(content)))

# Check structure
out.append('First 200 chars: ' + repr(content[:200]))
out.append('Last 200 chars: ' + repr(content[-200:]))
out.append('')

# Check braces
open_b = content.count('{')
close_b = content.count('}')
open_br = content.count('[')
close_br = content.count(']')
out.append('Braces: {{=' + str(open_b) + ', }}=' + str(close_b) + ', balance=' + str(open_b-close_b))
out.append('Brackets: [' + str(open_br) + ', ]=' + str(close_br) + ', balance=' + str(open_br-close_br))
out.append('')

# Check keys
keys = re.findall(r'"(\w+)":\s*\{', content)
out.append('Keys found: ' + str(len(keys)))
out.append('Keys: ' + str(keys))
out.append('')

# Check JobanLocal
out.append('JobanLocal in file: ' + str('JobanLocal' in content))
out.append('code: "JL" in file: ' + str('code: "JL"' in content))
out.append('code: "JB" in file: ' + str('code: "JB"' in content))
out.append('')

# Verify each line
for key in keys:
    idx = content.find('"' + key + '":')
    if idx < 0:
        out.append(key + ': NOT FOUND')
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
        out.append(key + ' (' + code_m.group(1) + '): ' + str(len(stations)) + '/' + str(dur) + ' ' + match)
    else:
        out.append(key + ': incomplete block')

with open(r'C:\Users\80996\Documents\项目\像素铁道\scripts\final_check_out.py', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
print('Done')
