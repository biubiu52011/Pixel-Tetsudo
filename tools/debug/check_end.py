path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Show the end of the file to check structure
lines = content.split('\n')
print('Total lines: ' + str(len(lines)))
print('Last 20 lines:')
for i in range(max(0, len(lines)-20), len(lines)):
    print(str(i+1) + ': ' + lines[i][:100])
