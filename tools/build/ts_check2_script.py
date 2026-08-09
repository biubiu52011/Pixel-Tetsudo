path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Check throughServices
out = []
out.append('=== throughServices Check ===')
for key in ['KeihinTohoku', 'Tokaido', 'Takasaki', 'Namboku', 'Fukutoshin']:
    idx = content.find('"' + key + '":')
    if idx < 0:
        out.append(key + ': NOT FOUND')
        continue
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    if 'throughServices: [{' in block:
        # Extract the throughServices value
        ts_match = re.search(r'throughServices:\s*\[([^\]]*)\]', block)
        if ts_match:
            out.append(key + ': ' + ts_match.group(1).strip()[:80])
    else:
        out.append(key + ': no throughServices')

with open(r'C:\Users\80996\Documents\项目\像素铁道\scripts\ts_check2.py', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
print('Done')
