path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Check for missing Tokyo Metro lines
all_keys = re.findall(r'"(\w+)":\s*\{', content)
out = []

# Tokyo Metro official lines
tm_official = ['Ginza', 'Marunouchi', 'Hibiya', 'Yurakucho', 'Tozai', 'Chiyoda', 'Hanzomon', 'Namboku', 'Fukutoshin']
# Toei lines
toei_official = ['Asakusa', 'Mita', 'Shinjuku', 'Oedo']

out.append('=== Missing Lines ===')
for line in tm_official + toei_official:
    if line not in all_keys:
        out.append('MISSING: ' + line)
    else:
        out.append('OK: ' + line)

out.append('')
out.append('=== All Keys in File ===')
out.append(str(all_keys))

with open(r'C:\Users\80996\Documents\项目\像素铁道\scripts\missing_lines.py', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
print('Done')
