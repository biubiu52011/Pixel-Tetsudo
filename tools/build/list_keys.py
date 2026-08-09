path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find the actual key names in the file
keys = re.findall(r'"(\w+)":\s*\{', content)
print('All keys:')
for i, k in enumerate(keys):
    print(str(i) + ': ' + k)
