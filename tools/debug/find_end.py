path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find the last line block and its end position
keys = re.findall(r'"(\w+)":\s*\{', content)
print('Current keys:', keys)
print('Count:', len(keys))

# Find the position after the last block
last_key = keys[-1]
idx = content.rfind('"' + last_key + '":')
if idx >= 0:
    end = content.find('    },', idx) + 8
    print('Last key:', last_key, 'ends at:', end)
    print('File length:', len(content))
    print('Content after last block:', repr(content[end:end+50]))
