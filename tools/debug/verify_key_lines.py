path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
import re

# Verify key lines have correct data
for key in ['KeihinTohoku', 'Tokaido', 'Takasaki', 'JobanLocal']:
    idx = content.find('"' + key + '":')
    if idx < 0:
        print(key + ': NOT FOUND')
        continue
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    code_m = re.search(r'code: "([^"]+)"', block)
    st_m = re.search(r'stations:\s*\[([^\]]*)\]', block)
    dur_m = re.search(r'durations:\s*Array\((\d+)\)', block)
    ts_m = re.search(r'throughServices:\s*\[([^\]]*)\]', block)
    if st_m and dur_m:
        stations = [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
        dur = int(dur_m.group(1))
        match = 'OK' if len(stations) == dur else 'MISMATCH'
        ts_val = ts_m.group(1).strip() if ts_m else '(empty)'
        print(key + ': code=' + code_m.group(1) + ' stations=' + str(len(stations)) + ' dur=' + str(dur) + ' ' + match + ' TS=' + ts_val[:50])
