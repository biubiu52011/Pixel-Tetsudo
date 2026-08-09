path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re
# Pair each key with its station/duration counts
keys = re.findall(r'    "(\w+)":\s*\{', content)

results = []
for key in keys:
    # Find this key in content
    idx = content.find(f'    "{key}":')
    if idx < 0:
        continue
    end = content.find('    },', idx)
    block = content[idx:end]
    
    st_match = re.search(r'stations:\s*\[([^\]]*)\]', block)
    dur_match = re.search(r'durations:\s*Array\((\d+)\)', block)
    
    if st_match and dur_match:
        stations = [s.strip().strip('"') for s in st_match.group(1).split(',') if s.strip().strip('"')]
        dur = int(dur_match.group(1))
        match = "OK" if len(stations) == dur else f"MISMATCH(s={len(stations)},d={dur})"
        results.append((key, len(stations), dur, match))

print(f"{'Line':25} | {'Stations':>8} | {'Duration':>8} | Status")
print("-" * 65)
for r in results:
    print(f"{r[0]:25} | {r[1]:8} | {r[2]:8} | {r[3]}")
