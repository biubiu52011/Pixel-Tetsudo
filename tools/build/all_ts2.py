path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Show all line blocks with their throughServices
keys = re.findall(r'    "(\w+)":\s*\{', content)
for key in keys:
    idx = content.find(f'"{key}":')
    if idx < 0:
        continue
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    ts_m = re.search(r'throughServices:\s*\[([^\]]*)\]', block)
    ts = ts_m.group(1).strip() if ts_m else ''
    code_m = re.search(r'code: "([^"]+)"', block)
    code = code_m.group(1) if code_m else '?'
    if ts:
        print(f'{key} ({code}): {ts}')
    else:
        print(f'{key} ({code}): (empty)')
