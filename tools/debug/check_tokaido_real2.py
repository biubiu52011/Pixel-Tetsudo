path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find all "Tokaido" occurrences
positions = []
i = 0
while True:
    pos = content.find('"Tokaido"', i)
    if pos < 0:
        break
    positions.append(pos)
    i = pos + 1
print('Tokaido positions:', positions)

# Also check if our new block was inserted
if '热海' in content:
    print('热海 found in content!')
    idx = content.find('热海')
    print('热海 at:', idx)
else:
    print('热海 NOT found - fix did not apply')

if '大宫' in content:
    count = content.count('大宫')
    print('大宫 occurrences:', count)
