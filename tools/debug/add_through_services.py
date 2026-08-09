path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Add throughServices to specific lines
fixes = [
    ('KeihinTohoku', '{"line": "Joban", "code": "JL", "note": "常磐快速直通"}'),
    ('Tokaido', '{"line": "Takasaki", "code": "JU", "note": "上野东京线直通高崎线"}'),
    ('Takasaki', '{"line": "Tokaido", "code": "JT", "note": "上野东京线直通东海道线"}'),
]

for key, ts_value in fixes:
    idx = content.find('"' + key + '":')
    if idx < 0:
        print(key + ': NOT FOUND')
        continue
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    
    # Check if throughServices exists
    if 'throughServices: []' in block:
        old = 'throughServices: []'
        new = 'throughServices: [' + ts_value + ']'
        content = content[:idx] + block.replace(old, new) + content[end:]
        print(key + ': added throughServices')
    else:
        print(key + ': throughServices pattern not found')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Saved')
