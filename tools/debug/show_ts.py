path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find all line keys and show their throughServices
keys = re.findall(r'    "(\w+)":\s*\{', content)
print('All keys:', keys)
print()

# Find Utsunomiya and JobanRapid blocks
for key in ['Utsunomiya', 'Joban', 'JobanRapid', 'Yokohama']:
    idx = content.find(f'"{key}":')
    if idx < 0:
        idx = content.find(key)
        if idx < 0:
            print(f'{key} NOT FOUND')
            continue
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    code_m = re.search(r'code: "([^"]+)"', block)
    name_m = re.search(r'name: "([^"]+)"', block)
    print(f'{key}: code={code_m.group(1) if code_m else "?"}, name={name_m.group(1) if name_m else "?"}')
    ts_m = re.search(r'throughServices:\s*\[([^\]]*)\]', block)
    if ts_m:
        print(f'  throughServices: {ts_m.group(1).strip()}')
    else:
        print(f'  throughServices: NONE')
