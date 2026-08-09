path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re
# Find all line keys with their positions
keys = re.findall(r'    "(\w+)":\s*\{', content)
print('All keys:', keys)

# Find TobuNoda specifically
idx = content.find('TobuNoda')
print(f'TobuNoda at: {idx}')
if idx >= 0:
    # Find the name: field
    name_ctx = content[idx:idx+200]
    print(repr(name_ctx))
