path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# The file was overwritten. Need to re-apply all fixes.
# Fixes needed:
# 1. JobanLocal code JB -> JL
# 2. All durations Array(N) -> match actual station counts
# 3. KeihinTohoku: 47 stations (with 根岸線)
# 4. Tokaido: 27 stations (热海->大宫)
# 5. Takasaki: 23 stations (大宫->前桥)
# 6. throughServices for KeihinTohoku, Tokaido, Takasaki

import re

# Fix 1: JobanLocal code JB -> JL
old = 'code: "JB", color: "#837DBE"'
new = 'code: "JL", color: "#837DBE"'
if old in content:
    content = content.replace(old, new)
    print('Fixed 1: JobanLocal JB -> JL')
else:
    print('Fix 1: pattern not found')

# Fix 2: duration mismatches - fix all Array(N) to match station count
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

fixes2 = []
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
            fixes2.append((name, dur, len(stations)))

print(f'Fixed 2: {len(fixes2)} duration mismatches')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Saved after fixes 1-2')
