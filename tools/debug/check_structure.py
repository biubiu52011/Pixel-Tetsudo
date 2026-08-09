path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Check file structure
print('File length:', len(content))
print()

# Find all line keys
keys = re.findall(r'"(\w+)":\s*\{', content)
print('Found keys:', len(keys))
for i, k in enumerate(keys):
    print(str(i) + ': ' + k)

print()

# Check for Yurakucho and Asakusa
for kw in ['Yurakucho', 'Asakusa', 'OdakyuEnoshima', 'Keio', 'TobuIsesaki', 'TobuNikko', 'YokohamaBlue', 'SeibuShinjuku', 'SeibuIkebukuro', 'SeibuTamako', 'TobuNoda', 'Joban', 'ChuoRapid', 'Keiyo', 'ShonanShinjuku', 'Tsurumi', 'Nambu', 'JobanLocal', 'Hibiya', 'Tozai', 'Mita', 'Oedo', 'Yurikamome']:
    idx = content.find('"' + kw + '":')
    print(kw + ': found at ' + str(idx))
