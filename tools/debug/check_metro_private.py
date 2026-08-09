path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

metro_keys = ['Ginza', 'Marunouchi', 'Hibiya', 'Yurakucho', 'Tozai', 'Asakusa', 'Mita', 'Shinjuku', 'Oedo']
private_keys = ['Odawara', 'Keio', 'TobuIsesaki', 'TobuSkytree', 'TobuNikko', 'TokyuToyoko', 'SeibuShinjuku', 'SeibuIkebukuro', 'SeibuChichibu', 'SeibuTamako', 'SeibuTamagawa', 'YokohamaBlue', 'Keisei', 'OdakyuEnoshima', 'TobuNoda']

out = []
out.append('=== Tokyo Metro Lines ===')
for key in metro_keys:
    idx = content.find('"' + key + '":')
    if idx < 0:
        out.append(key + ': NOT FOUND')
        continue
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    st_m = re.search(r'stations:\s*\[([^\]]*)\]', block)
    dur_m = re.search(r'durations:\s*Array\((\d+)\)', block)
    code_m = re.search(r'code: "([^"]+)"', block)
    if st_m and dur_m:
        stations = [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
        dur = int(dur_m.group(1))
        out.append(key + ' (' + code_m.group(1) + '): ' + str(len(stations)) + ' stations, dur=' + str(dur))
        out.append('  stations: ' + str(stations))

out.append('')
out.append('=== Odakyu / Private Lines ===')
for key in private_keys:
    idx = content.find('"' + key + '":')
    if idx < 0:
        idx = content.find(key)
        if idx < 0:
            out.append(key + ': NOT FOUND')
            continue
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    st_m = re.search(r'stations:\s*\[([^\]]*)\]', block)
    dur_m = re.search(r'durations:\s*Array\((\d+)\)', block)
    code_m = re.search(r'code: "([^"]+)"', block)
    if st_m and dur_m:
        stations = [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
        dur = int(dur_m.group(1))
        out.append(key + ' (' + code_m.group(1) + '): ' + str(len(stations)) + ' stations, dur=' + str(dur))
        out.append('  stations: ' + str(stations))

with open(r'C:\Users\80996\Documents\项目\像素铁道\scripts\metro_private_check.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
print('Done')
