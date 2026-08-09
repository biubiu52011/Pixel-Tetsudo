path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Tokyo Metro lines check
metro_lines = {
    'Ginza': 12,      # 银座线
    'Marunouchi': 38,  # 丸之内线（含支線）或 24（主线）
    'Hibiya': 19,      # 日比谷线
    'Yurakucho': 20,   # 有乐町线
    'Tozai': 24,       # 东西线
    'Chiyoda': 20,     # 千代田线
    'MarunouchiBranch': None,  # 丸之内线支線
    'Hanzomon': 12,    # 半藏门线
    'Namboku': 16,     # 南北线
    'Fukutoshin': 17,  # 副都心线
    'Shinjuku': 17,    # 新宿线（都营）
    'Oedo': 42,        # 大江户线（都营）
    'Asakusa': 14,     # 浅草线（都营）
    'Mita': 16,        # 三田线（都营）
}

# Find all keys in file
keys = re.findall(r'"(\w+)":\s*\{', content)
metro_keys_in_file = [k for k in keys if k in ['Ginza', 'Hibiya', 'Yurakucho', 'Tozai', 'Chiyoda', 'Hanzomon', 'Namboku', 'Fukutoshin', 'Shinjuku', 'Oedo', 'Asakusa', 'Mita', 'Marunouchi']]

out = []
out.append('=== Tokyo Metro Lines in File ===')
out.append('Keys found: ' + str(metro_keys_in_file))
out.append('')

for key in metro_keys_in_file:
    idx = content.find('"' + key + '":')
    if idx < 0:
        out.append(key + ': NOT FOUND')
        continue
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    st_m = re.search(r'stations:\s*\[(.+?)\]', block, re.DOTALL)
    dur_m = re.search(r'durations:\s*Array\((\d+)\)', block)
    code_m = re.search(r'code: "([^"]+)"', block)
    if st_m and dur_m:
        stations = [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
        dur = int(dur_m.group(1))
        expected = metro_lines.get(key, '?')
        status = 'OK' if len(stations) == expected else 'WRONG (expected ' + str(expected) + ')'
        out.append(key + ' (' + code_m.group(1) + '): ' + str(len(stations)) + ' stations ' + status)
        out.append('  Stations: ' + str(stations))
    else:
        out.append(key + ': incomplete')

with open(r'C:\Users\80996\Documents\项目\像素铁道\scripts\metro_check.py', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
print('Done')
