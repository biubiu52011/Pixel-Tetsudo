import re
import os

file_path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

base_path = r'C:\Users\80996\Documents\项目\像素铁道'

# Extract all lines
lines = re.findall(r'"(\w+)":\s*\{([\s\S]*?)branchOf:\s*null', content)

print('=== Stations/Durations Mismatch Check ===')
mismatches = []
for lid, body in lines:
    stations_match = re.search(r'stations:\s*\[(.*?)\]', body, re.DOTALL)
    durations_match = re.search(r'durations:\s*Array\((\d+)\)', body)
    
    if stations_match and durations_match:
        station_count = len([s for s in stations_match.group(1).split(',') if s.strip().strip('"')])
        duration_count = int(durations_match.group(1))
        
        if station_count != duration_count:
            mismatches.append((lid, station_count, duration_count))
            print(f'  {lid}: stations={station_count}, durations=Array({duration_count}) -> MISMATCH')

if not mismatches:
    print('  All lines match')
else:
    print(f'\nTotal {len(mismatches)} mismatches')

print()
print('=== Image File Check ===')
missing = []
for lid, body in lines:
    img_match = re.search(r'image:\s*"([^"]+)"', body)
    if img_match:
        img_path = os.path.join(base_path, img_match.group(1))
        if not os.path.exists(img_path):
            missing.append((lid, img_match.group(1)))
            print(f'  {lid}: {img_match.group(1)} -> MISSING')

if not missing:
    print('  All images exist')
else:
    print(f'\nTotal {len(missing)} missing')

print()
print('=== throughServices Empty Check ===')
empty = []
for lid, body in lines:
    ts_match = re.search(r'throughServices:\s*\[\s*\]', body)
    if ts_match:
        empty.append(lid)

if not empty:
    print('  All lines have throughServices')
else:
    print(f'  Lines with empty throughServices ({len(empty)}):')
    for lid in empty:
        print(f'    {lid}')

print()
print('=== Syntax Error Check (backtick-n残留) ===')
issues = []
for i, line in enumerate(content.split('\n'), 1):
    if line.strip().startswith('`n'):
        issues.append((i, line[:80]))
        print(f'  Line {i}: found `n -> {line[:80]}')

if not issues:
    print('  No `n found')
