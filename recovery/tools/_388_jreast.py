import re
content = open(r'C:\Users\80996\Documents\项目\像素铁道\js\data-state.js', 'r', encoding='utf-8').read()
# Find where JR-East appears
for m in re.finditer(r'JR-East', content):
    start = max(0, m.start()-50)
    end = min(len(content), m.end()+50)
    print('Pos ' + str(m.start()) + ': ' + repr(content[start:end]))
