path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Syntax check
open_brace = content.count('{')
close_brace = content.count('}')
open_bracket = content.count('[')
close_bracket = content.count(']')
double_comma = len(re.findall(r',\s*,', content))

out = []
out.append('Braces: {{={0}, }}={1}, balance={2}'.format(open_brace, close_brace, open_brace-close_brace))
out.append('Brackets: [{0}], ]={1}, balance={2}'.format(open_bracket, close_bracket, open_bracket-close_bracket))
out.append('Double commas: {0}'.format(double_comma))

# Line count verification
line_starts = []
idx = 0
while True:
    pos = content.find('    "', idx)
    if pos < 0:
        break
    bracket = content.find(':', pos)
    if bracket > pos and bracket < pos + 30:
        line_starts.append(pos)
    idx = pos + 1

mismatches = 0
for start in line_starts:
    end = content.find('    },', start)
    if end < 0:
        continue
    block = content[start:end]
    name_match = re.search(r'"(\w+)"', block)
    name = name_match.group(1) if name_match else 'unknown'
    st_match = re.search(r'stations:\s*\[([^\]]*)\]', block)
    dur_match = re.search(r'durations:\s*Array\((\d+)\)', block)
    if st_match and dur_match:
        stations = [s.strip().strip('"') for s in st_match.group(1).split(',') if s.strip().strip('"')]
        dur = int(dur_match.group(1))
        if len(stations) != dur:
            mismatches += 1
            out.append('MISMATCH: ' + name + ' stations=' + str(len(stations)) + ' dur=' + str(dur))

out.append('Total lines: ' + str(len(line_starts)))
out.append('Mismatches: ' + str(mismatches))

# Code check
jb_count = content.count('code: "JB"')
jl_count = content.count('code: "JL"')
out.append('JB count: ' + str(jb_count) + ', JL count: ' + str(jl_count))

# Key line verification
for key in ['KeihinTohoku', 'Tokaido', 'Takasaki']:
    idx2 = content.find('"' + key + '":')
    if idx2 >= 0:
        block = content[idx2:idx2+500]
        st_m = re.search(r'stations:\s*\[([^\]]*)\]', block)
        if st_m:
            stations = [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
            out.append(key + ': ' + str(len(stations)) + ' stations, first=' + stations[0] + ', last=' + stations[-1])

with open(r'C:\Users\80996\Documents\项目\像素铁道\scripts\final_verify.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
print('Done')
