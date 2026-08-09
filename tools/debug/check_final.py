path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

print('File length:', len(content))
print()

# Check structure
print('First 200 chars:', repr(content[:200]))
print()
print('Last 200 chars:', repr(content[-200:]))
print()

# Check braces
open_b = content.count('{')
close_b = content.count('}')
open_br = content.count('[')
close_br = content.count(']')
print('Braces: {{=' + str(open_b) + ', }}=' + str(close_b) + ', balance=' + str(open_b-close_b))
print('Brackets: [' + str(open_br) + ', ]=' + str(close_br) + ', balance=' + str(open_br-close_br))
print()

# Check keys
keys = re.findall(r'"(\w+)":\s*\{', content)
print('Keys found:', len(keys))
print('Keys:', keys)
print()

# Check JobanLocal
print('JobanLocal in file:', 'JobanLocal' in content)
print('code: "JL" in file:', 'code: "JL"' in content)
print('code: "JB" in file:', 'code: "JB"' in content)
