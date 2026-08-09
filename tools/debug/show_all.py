path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find all line entries with their name, code, station count, duration count
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

results = []
for start in line_starts:
    end = content.find('    },', start)
    if end < 0:
        continue
    block = content[start:end]
    name_match = re.search(r'"(\w+)"', block)
    name = name_match.group(1) if name_match else 'unknown'
    code_match = re.search(r'code: "([^"]+)"', block)
    code = code_match.group(1) if code_match else '?'
    st_match = re.search(r'stations:\s*\[([^\]]*)\]', block)
    dur_match = re.search(r'durations:\s*Array\((\d+)\)', block)
    if st_match and dur_match:
        stations = [s.strip().strip('"') for s in st_match.group(1).split(',') if s.strip().strip('"')]
        dur_len = int(dur_match.group(1))
        match = "OK" if len(stations) == dur_len else f"MISMATCH(s={len(stations)},d={dur_len})"
        results.append((name, code, len(stations), dur_len, match))

print(f"{'Line':25} | {'Code':4} | {'Stations':>8} | {'Duration':>8} | Status")
print("-" * 65)
for r in results:
    print(f"{r[0]:25} | {r[1]:4} | {r[2]:8} | {r[3]:8} | {r[4]}")
