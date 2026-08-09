path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Check Tokyo Metro specific lines
out = []
metro_lines = {
    'Ginza': 12,
    'Marunouchi': 24,
    'Hibiya': 19,
    'Yurakucho': 20,
    'Tozai': 24,
    'Chiyoda': 20,
    'Hanzomon': 12,
    'Namboku': 16,
    'Fukutoshin': 17,
}

out.append('=== Tokyo Metro Verification ===')
for key, expected in metro_lines.items():
    idx = content.find('"' + key + '":')
    if idx < 0:
        out.append(key + ': NOT FOUND')
        continue
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    st_m = re.search(r'stations:\s*\[(.+?)\]', block, re.DOTALL)
    dur_m = re.search(r'durations:\s*Array\((\d+)\)', block)
    if st_m and dur_m:
        stations = [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
        dur = int(dur_m.group(1))
        match = 'OK' if len(stations) == expected and len(stations) == dur else 'WRONG'
        out.append(key + ': ' + str(len(stations)) + ' stations (expected ' + str(expected) + '), dur=' + str(dur) + ' ' + match)
    else:
        out.append(key + ': incomplete')

with open(r'C:\Users\80996\Documents\项目\像素铁道\scripts\metro_verify.py', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
print('Done')
