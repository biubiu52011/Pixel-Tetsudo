path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re
# Find the two Array(25) occurrences
positions = []
i = 0
while True:
    pos = content.find('durations: Array(25)', i)
    if pos < 0:
        break
    positions.append(pos)
    i = pos + 1
print('Array(25) at positions:', positions)
for p in positions:
    ctx = content[max(0,p-100):p+60]
    print(f'  Context: {repr(ctx)}')
