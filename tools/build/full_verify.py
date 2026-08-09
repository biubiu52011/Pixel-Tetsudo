path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Write full verification to file
import re, os
out = []
out.append('File size: ' + str(len(content)))
out.append('Mtime: ' + str(os.path.getmtime(path)))
out.append('')

# Check key content markers
out.append('热海 in content: ' + str('热海' in content))
out.append('八王子 in content: ' + str('八王子' in content))
out.append('前桥 in content: ' + str('前桥' in content))
out.append('高崎 in content: ' + str('高崎' in content))
out.append('code JL: ' + str('code: "JL"' in content))
out.append('code JB: ' + str('code: "JB"' in content))
out.append('')

# Check all lines
keys = re.findall(r'"(\w+)":\s*\{', content)
out.append('Total keys: ' + str(len(keys)))

for key in keys:
    idx = content.find('"' + key + '":')
    if idx < 0:
        continue
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    st_m = re.search(r'stations:\s*\[([^\]]*)\]', block)
    dur_m = re.search(r'durations:\s*Array\((\d+)\)', block)
    code_m = re.search(r'code: "([^"]+)"', block)
    ts_m = re.search(r'throughServices:\s*\[([^\]]*)\]', block)
    if st_m and dur_m:
        stations = [s.strip().strip('"') for s in st_match.group(1).split(',') if s.strip().strip('"')] if False else [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
        dur = int(dur_m.group(1))
        match = 'OK' if len(stations) == dur else 'MISMATCH'
        ts_val = ts_m.group(1).strip()[:30] if ts_m and ts_m.group(1).strip() else '(empty)'
        out.append(key + ' (' + code_m.group(1) + '): ' + str(len(stations)) + ' stations, dur=' + str(dur) + ' ' + match + ', TS=' + ts_val)

with open(r'C:\Users\80996\Documents\项目\像素铁道\scripts\full_verify.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
print('Done')
