path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Check what we have
keys = re.findall(r'"(\w+)":\s*\{', content)
print('Keys found:', len(keys))
print('Keys:', keys)

# Check for JobanLocal
idx = content.find('"JobanLocal":')
print('JobanLocal found at:', idx)

# Check for any JL code
jl_count = content.count('code: "JL"')
print('JL code count:', jl_count)
