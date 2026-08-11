import re
import json
import os

# Read line-control.js
with open('data/railway/line-control.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract UNIFIED_LINES section
start = content.find('window.UNIFIED_LINES = {')
if start == -1:
    print('ERROR: Not found')
    exit(1)

# Find matching closing brace
brace_count = 0
end = start
for i in range(start, len(content)):
    if content[i] == '{':
        brace_count += 1
    elif content[i] == '}':
        brace_count -= 1
        if brace_count == 0:
            end = i + 1
            break

json_str = content[start:end]

# Convert to valid JSON
# Add quotes to property names
def add_quotes(match):
    key = match.group(1)
    return f'"{key}":'

json_str = re.sub(r'([a-zA-Z_][a-zA-Z0-9_]*)\s*:', add_quotes, json_str)

# Replace Array(n).fill(x) with actual arrays
def replace_array_fill(match):
    n = int(match.group(1))
    x = float(match.group(2))
    return json.dumps([x] * n)

json_str = re.sub(r'Array\((\d+)\)\.fill\(([\d.]+)\)', replace_array_fill, json_str)

# Remove window.UNIFIED_LINES = 
json_str = re.sub(r'window\.UNIFIED_LINES\s*=\s*', '', json_str)

try:
    lines = json.loads('{' + json_str[json_str.find('{')+1:json_str.rfind('}')] + '}')
    print(f'Parsed {len(lines)} lines successfully')
except Exception as e:
    print(f'ERROR: {e}')
    exit(1)

# Escape and process
escaped = {}
for line_id, line in lines.items():
    escaped[line_id] = {
        'name': line.get('name', ''),
        'nameEn': line.get('nameEn', ''),
        'code': line.get('code', ''),
        'color': line.get('color', ''),
        'operator': line.get('operator', ''),
        'region': line.get('region', ''),
        'type': line.get('type', ''),
        'durationTotalMin': line.get('durationTotalMin', 0),
        'stations': line.get('stations', []),
        'durations': line.get('durations', []),
        'transferStations': line.get('transferStations', []),
        'throughServices': line.get('throughServices', []),
        'image': line.get('image', '').replace('./', '')
    }

# Group
grouped_by_op = {}
grouped_by_reg = {}
for line_id, line in escaped.items():
    op = line['operator']
    reg = line['region']
    if op not in grouped_by_op:
        grouped_by_op[op] = []
    grouped_by_op[op].append(line_id)
    if reg not in grouped_by_reg:
        grouped_by_reg[reg] = []
    grouped_by_reg[reg].append(line_id)

# Generate data
common_data = {
    'version': 1,
    'timestamp': '2026-08-11T00:00:00.000Z',
    'lines': escaped,
    'operators': sorted(grouped_by_op.keys()),
    'regions': sorted(grouped_by_reg.keys())
}

trains_data = {
    'version': 1,
    'timestamp': '2026-08-11T00:00:00.000Z',
    'lines': escaped,
    'groupedByOperator': grouped_by_op,
    'groupedByRegion': grouped_by_reg
}

realtime_data = {
    'version': 1,
    'timestamp': '2026-08-11T00:00:00.000Z',
    'lines': escaped,
    'statusMap': {}
}
for line_id, line in escaped.items():
    realtime_data['statusMap'][line_id] = {
        'code': line['code'],
        'name': line['name'],
        'nameEn': line['nameEn'],
        'color': line['color'],
        'operator': line['operator'],
        'type': line['type'],
        'stationCount': len(line['stations']),
        'durationTotalMin': line['durationTotalMin']
    }

# Write
os.makedirs('data/generated', exist_ok=True)

with open('data/generated/common-data.json', 'w', encoding='utf-8') as f:
    json.dump(common_data, f, ensure_ascii=False, indent=2)
print('Generated common-data.json')

with open('data/generated/trains-data.json', 'w', encoding='utf-8') as f:
    json.dump(trains_data, f, ensure_ascii=False, indent=2)
print('Generated trains-data.json')

with open('data/generated/realtime-data.json', 'w', encoding='utf-8') as f:
    json.dump(realtime_data, f, ensure_ascii=False, indent=2)
print('Generated realtime-data.json')

print(f'\nDone! Generated {len(escaped)} lines')
print(f'Operators: {len(grouped_by_op)}')
print(f'Regions: {len(grouped_by_reg)}')
