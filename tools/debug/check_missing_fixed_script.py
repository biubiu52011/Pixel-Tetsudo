path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Check missing lines are now present
all_keys = re.findall(r'"(\w+)":\s*\{', content)
out = []
tm_lines = ['Ginza', 'Marunouchi', 'Hibiya', 'Yurakucho', 'Tozai', 'Chiyoda', 'Hanzomon', 'Namboku', 'Fukutoshin']
toei_lines = ['Asakusa', 'Mita', 'Shinjuku', 'Oedo']

out.append('=== Tokyo Metro Lines ===')
for line in tm_lines:
    status = 'OK' if line in all_keys else 'MISSING'
    out.append(line + ': ' + status)

out.append('')
out.append('=== Toei Lines ===')
for line in toei_lines:
    status = 'OK' if line in all_keys else 'MISSING'
    out.append(line + ': ' + status)

out.append('')
out.append('Total lines: ' + str(len(all_keys)))

with open(r'C:\Users\80996\Documents\项目\像素铁道\scripts\check_missing_fixed.py', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
print('Done')
