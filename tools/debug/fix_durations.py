path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find all line entries and fix duration Array(N) to match actual station count
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

fixes = []
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
        dur_len = int(dur_match.group(1))
        actual = len(stations)
        if actual != dur_len:
            # Replace the old Array(N) with Array(actual)
            old_dur = f'durations: Array({dur_len})'
            new_dur = f'durations: Array({actual})'
            abs_start = start + block.find(old_dur)
            content = content[:abs_start] + new_dur + content[abs_start + len(old_dur):]
            fixes.append((name, dur_len, actual))

# Write back
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Fixed {len(fixes)} lines:')
for name, old, new in fixes:
    print(f'  {name}: Array({old}) -> Array({new})')
