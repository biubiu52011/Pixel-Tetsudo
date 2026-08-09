path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re
# Show all duration values and their line context
dur_matches = list(re.finditer(r'durations:\s*Array\((\d+)\)', content))
print(f'Total duration entries: {len(dur_matches)}')
for m in dur_matches:
    pos = m.start()
    # Find line key by looking backwards
    chunk = content[max(0,pos-600):pos]
    keys = re.findall(r'"(\w+)":\s*\{', chunk)
    key = keys[-1] if keys else 'unknown'
    print(f'  {key}: Array({m.group(1)})')
