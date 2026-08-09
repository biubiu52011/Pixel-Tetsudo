path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find KeihinTohoku block
idx = content.find('"KeihinTohoku"')
if idx < 0:
    print('KeihinTohoku not found')
    exit()
end = content.find('    },', idx) + 8
block = content[idx:end]
print('Current block:')
print(block[:500])
print('...')
print(block[-200:])
