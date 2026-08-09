path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

lines_to_check = ['Ginza', 'Hibiya', 'Yurakucho', 'Tozai', 'Asakusa', 'Oedo', 'Odawara', 'OdakyuEnoshima']
results = []
for key in lines_to_check:
    idx = content.find('"' + key + '":')
    if idx < 0:
        results.append(key + ': NOT FOUND')
        continue
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    st_m = re.search(r'stations:\s*\[([^\]]*)\]', block)
    if st_m:
        stations = [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
        unique = list(dict.fromkeys(stations))
        results.append(key + ': total=' + str(len(stations)) + ' unique=' + str(len(unique)))
        results.append('  stations: ' + str(stations))

with open(r'C:\Users\80996\Documents\项目\像素铁道\scripts\stations_detail.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(results))
print('Done, wrote stations_detail.txt')
