path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Count occurrences of each duration value
import re
dur_vals = re.findall(r'durations:\s*Array\((\d+)\)', content)
from collections import Counter
c = Counter(dur_vals)
for v, n in sorted(c.items(), key=lambda x: int(x[0])):
    print(f'Array({v}): {n} times')
