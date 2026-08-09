import re
src = open(r'C:\Users\80996\Documents\项目\像素铁道\data\tourism-data.js', encoding='utf-8').read()
lines = src.split('\n')
stations = []
current = None
for i, line in enumerate(lines):
    stripped = line.strip()
    m = re.match(r'^"([^"]+)":\s*\{', stripped)
    if m:
        current = m.group(1)
    elif stripped.startswith('coord:') and current:
        cm = re.search(r'coord:\s*\[([^\]]+)\]', stripped)
        if cm:
            stations.append((current, cm.group(1)))
        current = None
for name, coord in stations:
    print(f'{name}: [{coord}]')
print(f'Total: {len(stations)}')
