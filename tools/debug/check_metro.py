path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Correct station counts for each line (from official sources)
# Tokyo Metro
metro_counts = {
    'Ginza': 12,       # 银座线 - 正确
    'Marunouchi': 24,   # 丸之内线 - 正确 (38站含分支但主线24)
    'Hibiya': 19,       # 日比谷线 - 少(实际19)
    'Yurakucho': 20,    # 有乐町线 - 少(实际20)
    'Tozai': 24,        # 东西线 - 少(实际24)
    'Asakusa': 14,      # 浅草线 - 少(实际14)
    'Mita': 16,         # 三田线 - 正确
    'Shinjuku': 17,     # 新宿线 - 正确
    'Oedo': 22,         # 大江户线 - 少(实际42)
}

# Odakyu
odakyu_counts = {
    'Odawara': 35,      # 小田原线 - 少(实际35)
    'OdakyuEnoshima': 21,  # 江之岛线 - 少(实际21)
}

# Check what we have now
out = []
for key, expected in metro_counts.items():
    idx = content.find('"' + key + '":')
    if idx < 0:
        out.append(key + ': NOT FOUND')
        continue
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    st_m = re.search(r'stations:\s*\[([^\]]*)\]', block)
    if st_m:
        stations = [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
        # Check for duplicates
        unique = list(dict.fromkeys(stations))
        out.append(key + ': current=' + str(len(stations)) + ' unique=' + str(len(unique)) + ' expected=' + str(expected) + ' ' + ('OK' if len(stations)==expected else 'NEEDS FIX'))

with open(r'C:\Users\80996\Documents\项目\像素铁道\scripts\metro_check.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
print('Done')
