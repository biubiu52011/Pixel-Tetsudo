path1 = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
path2 = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control-new.js'
path3 = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\c'

with open(path1, 'r', encoding='utf-8') as f:
    current = f.read()
with open(path2, 'r', encoding='utf-8') as f:
    newjs = f.read()
with open(path3, 'r', encoding='utf-8') as f:
    c = f.read()

import re

def get_keys(content):
    return re.findall(r'"(\w+)":\s*\{', content)

def get_line_info(content, key):
    idx = content.find(f'"{key}":')
    if idx < 0:
        return None
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    st_m = re.search(r'stations:\s*\[([^\]]*)\]', block)
    dur_m = re.search(r'durations:\s*Array\((\d+)\)', block)
    ts_m = re.search(r'throughServices:\s*\[([^\]]*)\]', block)
    code_m = re.search(r'code: "([^"]+)"', block)
    stations = []
    if st_m:
        stations = [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
    return {
        'code': code_m.group(1) if code_m else '',
        'stations': len(stations),
        'dur': int(dur_m.group(1)) if dur_m else 0,
        'ts': ts_m.group(1).strip() if ts_m else ''
    }

keys_all = sorted(set(get_keys(current)) | set(get_keys(newjs)) | set(get_keys(c)))
out = []
for key in keys_all:
    ci = get_line_info(current, key)
    ni = get_line_info(newjs, key)
    if not ci or not ni:
        out.append(f'{key}: missing in current={ci is None}, new={ni is None}')
        continue
    diffs = []
    if ci['code'] != ni['code']:
        diffs.append(f'code:{ci["code"]}vs{ni["code"]}')
    if ci['stations'] != ni['stations']:
        diffs.append(f'stations:{ci["stations"]}vs{ni["stations"]}')
    if ci['dur'] != ni['dur']:
        diffs.append(f'dur:{ci["dur"]}vs{ni["dur"]}')
    if ci['ts'] != ni['ts']:
        diffs.append('throughServices differ')
    if diffs:
        out.append(f'{key}: {", ".join(diffs)}')

with open(r'C:\Users\80996\Documents\项目\像素铁道\scripts\compare_result.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
print('Done, wrote compare_result.txt')
