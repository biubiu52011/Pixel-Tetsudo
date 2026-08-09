path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Final verification
out = []
out.append('=== FINAL STATUS ===')
out.append('File length: ' + str(len(content)))

# Syntax
open_b = content.count('{')
close_b = content.count('}')
open_br = content.count('[')
close_br = content.count(']')
double_comma = len(re.findall(r',\s*,', content))
out.append('Braces balanced: ' + str(open_b == close_b))
out.append('Brackets balanced: ' + str(open_br == close_br))
out.append('Double commas: ' + str(double_comma))
out.append('')

# Lines
keys = re.findall(r'"(\w+)":\s*\{', content)
out.append('Total lines: ' + str(len(keys)))
out.append('')

# throughServices
ts_lines = []
for key in keys:
    idx = content.find('"' + key + '":')
    if idx < 0:
        continue
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    if 'throughServices: [{{' in block or ("throughServices: [{" in block and ']' in block):
        ts_lines.append(key)
out.append('Lines with throughServices: ' + str(len(ts_lines)))
out.append('  ' + str(ts_lines))
out.append('')

# Key checks
out.append('=== KEY CHECKS ===')
out.append('JobanLocal code=JL: ' + str('code: "JL"' in content))
out.append('SobuLocal code=JB: ' + str('code: "JB"' in content))
out.append('Tokaido has Atami: ' + str('Atami' in content))
out.append('Tokaido has Omiya: ' + str(content.count('Omiya') >= 2))
out.append('Takasaki has 23 stations: ' + str('Maebashi' in content))
out.append('')

# Mismatch check
mismatches = 0
for key in keys:
    idx = content.find('"' + key + '":')
    if idx < 0:
        mismatches += 1
        continue
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    st_m = re.search(r'stations:\s*\[(.+?)\]', block, re.DOTALL)
    dur_m = re.search(r'durations:\s*Array\((\d+)\)', block)
    if st_m and dur_m:
        stations = [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
        dur = int(dur_m.group(1))
        if len(stations) != dur:
            mismatches += 1
            out.append('MISMATCH: ' + key + ' stations=' + str(len(stations)) + ' dur=' + str(dur))

out.append('Mismatches: ' + str(mismatches))
out.append('=== END ===')

with open(r'C:\Users\80996\Documents\项目\像素铁道\scripts\final_status.py', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
print('Done')
