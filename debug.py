import re
path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('"Yurikamome":')
print('Yurikamome found at:', idx)
if idx > 0:
    print('Context:', repr(content[idx-20:idx+30]))
