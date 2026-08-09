path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re
# Find all line keys (the "Name": { pattern)
keys = re.findall(r'    "(\w+)":\s*\{', content)
print('Line keys:', keys)
print('Count:', len(keys))
