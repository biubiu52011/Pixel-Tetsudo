path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Count total Array(N) occurrences
dur_matches = list(re.finditer(r'durations:\s*Array\((\d+)\)', content))
print(f'Total duration entries: {len(dur_matches)}')

# Find all line blocks properly
line_pattern = re.compile(r'    "(\w+)":\s*\{([^}]+stations:[^\]]+\][^}]+durations:[^}]+)}', re.DOTALL)
all_matches = line_pattern.findall(content)
print(f'Lines found by regex: {len(all_matches)}')

# Now check each line
all_ok = True
for name, block in all_matches:
    st_match = re.search(r'stations:\s*\[([^\]]*)\]', block)
    dur_match = re.search(r'durations:\s*Array\((\d+)\)', block)
    if st_match and dur_match:
        stations = [s.strip().strip('"') for s in st_match.group(1).split(',') if s.strip().strip('"')]
        dur = int(dur_match.group(1))
        if len(stations) != dur:
            print(f'  MISMATCH: {name} - stations={len(stations)}, dur={dur}')
            all_ok = False

if all_ok:
    print('ALL LINES OK - no mismatches!')
else:
    print('Some mismatches remain.')

# Also check codes
codes = re.findall(r'code: "([^"]+)"', content)
print(f'\nAll codes ({len(codes)}): {codes}')
print(f'JB count: {codes.count("JB")}, JL count: {codes.count("JL")}')
