path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Check if there is any pattern we can use to restore
# Look for any complete line blocks
import re

# Find all blocks between "Key": { and },
pattern = re.compile(r'"(\w+)":\s*\{([^}]+)stations:\s*\[[^\]]+\][^}]+durations:\s*Array\(\d+\)', re.DOTALL)
matches = pattern.findall(content)
print('Complete blocks found:', len(matches))
for name, block in matches:
    st_m = re.search(r'stations:\s*\[(.+?)\]', block, re.DOTALL)
    dur_m = re.search(r'durations:\s*Array\((\d+)\)', block)
    if st_m and dur_m:
        stations = [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
        dur = int(dur_m.group(1))
        print(name + ': ' + str(len(stations)) + ' stations, dur=' + str(dur))
