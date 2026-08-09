path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re
# Find Utsunomiya - check if it exists
for key in ['Utsunomiya', 'UtsunomiyaLine', 'utsunomiya']:
    idx = content.find(key)
    print(f'{key}: found at {idx}')
    if idx >= 0:
        print(repr(content[max(0,idx-50):idx+100]))

# Also check for 宇都宫
idx2 = content.find('宇都宫')
print(f'\n宇都宫 found at: {idx2}')
if idx2 >= 0:
    print(repr(content[max(0,idx2-50):idx2+100]))
