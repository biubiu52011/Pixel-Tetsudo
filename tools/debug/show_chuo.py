path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Directly check ChuoRapid
idx = content.find('"ChuoRapid":')
end = content.find('    },', idx) + 8
block = content[idx:end]
print(block)
