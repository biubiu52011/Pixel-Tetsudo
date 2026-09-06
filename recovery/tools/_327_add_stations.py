import json
import hashlib
from datetime import datetime
import os

data = json.load(open('data/core/railway_data.json', encoding='utf-8'))
original_sha = hashlib.sha256(json.dumps(data, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
print(f'Stations before: {len(data[\"stations\"])}')
print(f'Original SHA: {original_sha}')

new_stations = {
    'Aomori': {'lat': 40.8244, 'lng': 140.74},
    'Daikanyama': {'lat': 35.6533, 'lng': 139.6986},
    'Niigata': {'lat': 37.9026, 'lng': 139.0232},
    'Sendai': {'lat': 38.2682, 'lng': 140.8694},
    'Kawaguchiko': {'lat': 35.5133, 'lng': 138.7658},
    'Kiyosumi-Shirakawa': {'lat': 35.6944, 'lng': 139.7631}
}

added = 0
for sid, coords in new_stations.items():
    if sid not in data['stations']:
        data['stations'][sid] = coords
        added += 1
        print(f'Added: {sid}')
    else:
        print(f'Skip (exists): {sid}')

print(f'Stations after: {len(data[\"stations\"])}')
print(f'Added: {added}')

new_sha = hashlib.sha256(json.dumps(data, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
print(f'New SHA: {new_sha}')
print(f'SHA changed: {original_sha != new_sha}')

# Verify stationLines
sl = data.get('stationLines', {})
for sid in new_stations:
    if sid in sl:
        print(f'{sid}: stationLines OK -> {len(sl[sid])} lines')
    else:
        print(f'{sid}: no stationLines (OK)')

# Write back
with open('data/core/railway_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write('\n')
print('File written')
