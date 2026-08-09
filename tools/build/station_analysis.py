path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find all unique station lists
station_lists = {}
for m in re.finditer(r'"(\w+)":\s*\{([^}]+)stations:\s*\[(.+?)\][^}]+durations:\s*Array\((\d+)\)', content, re.DOTALL):
    key = m.group(1)
    stations_str = m.group(3)
    dur = m.group(4)
    stations = [s.strip().strip('"') for s in stations_str.split(',') if s.strip().strip('"')]
    station_lists[key] = {'stations': stations, 'dur': int(dur), 'stations_str': stations_str}

# Print each line with its station count and first/last station
out = []
for key in sorted(station_lists.keys()):
    info = station_lists[key]
    out.append(key + ': ' + str(len(info['stations'])) + ' stations, dur=' + str(info['dur']) + ' first=' + info['stations'][0] + ' last=' + info['stations'][-1])

with open(r'C:\Users\80996\Documents\项目\像素铁道\scripts\station_analysis.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
print('Done')
