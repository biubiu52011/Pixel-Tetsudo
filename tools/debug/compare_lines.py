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

# For each key, compare station counts and throughServices
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
    name_m = re.search(r'name: "([^"]+)"', block)
    stations = []
    if st_m:
        stations = [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
    return {
        'name': name_m.group(1) if name_m else '',
        'code': code_m.group(1) if code_m else '',
        'stations': len(stations),
        'dur': int(dur_m.group(1)) if dur_m else 0,
        'ts': ts_m.group(1).strip() if ts_m else ''
    }

keys_all = sorted(set(get_keys(current)) | set(get_keys(newjs)) | set(get_keys(c)))
for key in keys_all:
    ci = get_line_info(current, key)
    ni = get_line_info(newjs, key)
    ci2 = get_line_info(c, key)
    diff = []
    if ci and ni:
        if ci['stations'] != ni['stations']:
            diff.append(f'stations:{ci["stations"]}vs{ni["stations"]}')
        if ci['ts'] != ni['ts']:
            diff.append(f'throughServices differ')
    if diff:
        print(f'{key}: {", ".join(diff)}')
