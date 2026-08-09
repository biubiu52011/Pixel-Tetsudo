path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Fix JobanLocal code: change JB to JL
# Find the JobanLocal block and fix its code
idx = content.find('"JobanLocal":')
if idx >= 0:
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    
    # Check current code
    code_m = re.search(r'code: "([^"]+)"', block)
    print('Current JobanLocal code: ' + (code_m.group(1) if code_m else 'NOT FOUND'))
    
    # Replace JB with JL in JobanLocal block
    if code_m and code_m.group(1) == 'JB':
        old = 'code: "JB", color: "#837DBE"'
        new = 'code: "JL", color: "#837DBE"'
        if old in block:
            content = content[:idx] + block.replace(old, new) + content[end:]
            print('Fixed JobanLocal code: JB -> JL')
        else:
            print('Pattern not found, checking...')
            # Show what code is there
            print('Block code line: ' + re.search(r'code: "([^"]+)"', block).group(0) if code_m else 'No code found')
    else:
        print('JobanLocal code is already JL or not found')
else:
    print('JobanLocal NOT FOUND in file')

# Write back
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Saved')
