path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Check and fix JobanLocal code JB -> JL
jb_positions = []
i = 0
while True:
    pos = content.find('code: "JB"', i)
    if pos < 0:
        break
    jb_positions.append(pos)
    i = pos + 1

print(f'JB occurrences: {jb_positions}')
for pos in jb_positions:
    ctx = content[pos:pos+60]
    print(f'  {repr(ctx)}')

# The JobanLocal has color #837DBE, SobuLocal has #FF9300
# Find the one with #837DBE
for pos in jb_positions:
    ctx = content[pos:pos+80]
    if '#837DBE' in ctx:
        # This is JobanLocal, change JB to JL
        old = content[pos:pos+20]
        new = content[:pos] + 'code: "JL"' + content[pos+11:]
        content = new
        print(f'Fixed JB->JL at pos {pos}')
        break

# Check result
jb_after = content.count('code: "JB"')
jl_after = content.count('code: "JL"')
print(f'After: JB={jb_after}, JL={jl_after}')

# Check mismatches
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

mismatches = []
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
        if len(stations) != dur_len:
            mismatches.append((name, len(stations), dur_len))

print(f'\nTotal lines: {len(line_starts)}')
print(f'Mismatches: {len(mismatches)}')
for m in mismatches[:15]:
    print(f'  {m[0]}: stations={m[1]}, dur={m[2]}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('\nFile saved.')
