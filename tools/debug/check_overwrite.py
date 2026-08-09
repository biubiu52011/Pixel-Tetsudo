path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Check if the file was overwritten after our write
import os
stat = os.stat(path)
print('File size:', stat.st_size)
print('Mtime:', stat.st_mtime)

# Check current content for our fixes
print('Tokaido has 热海:', '热海' in content)
print('Tokaido has 八王子:', '八王子' in content)
print('Takasaki has 前桥:', '前桥' in content)
print('Takasaki has 高崎:', '高崎' in content)

# Show Tokaido block
import re
idx = content.find('"Tokaido":')
if idx >= 0:
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    # Write to file to avoid encoding issues
    with open(r'C:\Users\80996\Documents\项目\像素铁道\scripts\tokaido_current.txt', 'w', encoding='utf-8') as f:
        f.write(block)
    print('Tokaido block written to tokaido_current.txt')
