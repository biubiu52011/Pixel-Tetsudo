path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find all "Key": { patterns and check their structure
keys = re.findall(r'"(\w+)":\s*\{', content)
print('Found ' + str(len(keys)) + ' keys')

# Check each key block
for key in keys:
    idx = content.find('"' + key + '":')
    if idx < 0:
        continue
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    
    # Count braces in block
    open_b = block.count('{')
    close_b = block.count('}')
    open_br = block.count('[')
    close_br = block.count(']')
    
    if open_b != close_b or open_br != close_br:
        print(key + ': BRACE IMBALANCE {{=' + str(open_b) + ' }}=' + str(close_b) + ' [|=' + str(open_br) + ' ]=' + str(close_br))
    else:
        print(key + ': OK')
