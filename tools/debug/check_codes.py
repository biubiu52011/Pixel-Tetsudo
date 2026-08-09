path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Check all codes in file
codes = re.findall(r'code: "([^"]+)"', content)
print('All codes:')
for c in codes:
    print('  ' + c)

print()
print('JB count: ' + str(codes.count('JB')))
print('JL count: ' + str(codes.count('JL')))

# Check which line has each code
for key in ['JobanLocal', 'SobuLocal']:
    idx = content.find('"' + key + '":')
    if idx >= 0:
        end = content.find('    },', idx) + 8
        block = content[idx:end]
        code_m = re.search(r'code: "([^"]+)"', block)
        print(key + ': code=' + (code_m.group(1) if code_m else 'NOT FOUND'))
