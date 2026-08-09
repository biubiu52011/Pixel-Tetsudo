path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Step 1: Fix all duration mismatches first
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

fixes = 0
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
            old_dur = f'durations: Array({dur})'
            new_dur = f'durations: Array({len(stations)})'
            abs_start = start + block.find(old_dur)
            content = content[:abs_start] + new_dur + content[abs_start + len(old_dur):]
            fixes += 1
            print(name + ': dur ' + str(dur) + ' -> ' + str(len(stations)))

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Step 1 done: fixed ' + str(fixes) + ' duration mismatches')
