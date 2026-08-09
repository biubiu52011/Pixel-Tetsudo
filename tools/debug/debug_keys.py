path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find all line keys
keys = re.findall(r'"(\w+)":\s*\{', content)
print('All keys:', keys)
print('Count:', len(keys))

# Check if Marunouchi exists
if 'Marunouchi' in keys:
    print('Marunouchi exists')
else:
    print('Marunouchi NOT found')

# Check the end of file
print()
print('Last 500 chars:')
print(content[-500:])
