path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Check JobanLocal
idx = content.find('"JobanLocal":')
if idx >= 0:
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    code_m = re.search(r'code: "([^"]+)"', block)
    print('JobanLocal code: ' + (code_m.group(1) if code_m else 'NOT FOUND'))
    print('Block length: ' + str(len(block)))
else:
    print('JobanLocal NOT FOUND')

# Check for any extra closing braces
lines = content.split('\n')
brace_count = 0
for i, line in enumerate(lines):
    brace_count += line.count('{') - line.count('}')
    if brace_count < 0:
        print('Negative brace count at line ' + str(i+1) + ': ' + str(brace_count))
        print('Line: ' + line[:100])

print('Final brace count: ' + str(brace_count))
