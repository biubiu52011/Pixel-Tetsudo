import re, json

src_path = r'C:\Users\80996\Documents\项目\像素铁道\data\tourism-data.js'
coords_path = r'C:\Users\80996\Documents\项目\像素铁道\data\station-coords.js'
tourism_path = src_path

src = open(src_path, encoding='utf-8').read()
lines = src.split('\n')

# Extract stations with their coords
stations = {}
current = None
for i, line in enumerate(lines):
    stripped = line.strip()
    m = re.match(r'^"([^"]+)":\s*\{', stripped)
    if m:
        current = m.group(1)
    elif stripped.startswith('coord:') and current:
        cm = re.search(r'coord:\s*\[([^\]]+)\]', stripped)
        if cm:
            coords = [float(x.strip()) for x in cm.group(1).split(',')]
            if current not in stations:
                stations[current] = coords
        current = None

print(f"Extracted {len(stations)} stations")

# Write station-coords.js
pairs = []
for k, v in sorted(stations.items()):
    pairs.append(f'    "{k}": [{v[0]}, {v[1]}]')
js_content = '(function() {\n  "use strict";\n  window.STATION_COORDS = {\n' + ',\n'.join(pairs) + '\n  };\n})();\n'
open(coords_path, 'w', encoding='utf-8').write(js_content)
print(f"Written {len(pairs)} entries to station-coords.js")

# Remove coord lines from tourism-data.js
# We need to remove lines that contain 'coord:' within a station block
result_lines = []
in_station = False
for line in lines:
    stripped = line.strip()
    # Detect station key opening
    if re.match(r'^"[^"]+":\s*\{', stripped):
        in_station = True
        result_lines.append(line)
        continue
    # Detect end of station (closing } followed by , or ;)
    if in_station and stripped in ('}', '},', '};'):
        in_station = False
        result_lines.append(line)
        continue
    # Skip coord lines within station blocks
    if in_station and stripped.startswith('coord:'):
        continue
    result_lines.append(line)

result = '\n'.join(result_lines)
open(tourism_path, 'w', encoding='utf-8').write(result)
print(f"Written tourism-data.js without coord lines ({len(result_lines)} lines)")
