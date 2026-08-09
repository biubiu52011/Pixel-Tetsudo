path1 = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
path2 = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control-new.js'
path3 = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\c'

with open(path1, 'r', encoding='utf-8') as f:
    current = f.read()
with open(path2, 'r', encoding='utf-8') as f:
    newjs = f.read()
with open(path3, 'r', encoding='utf-8') as f:
    c = f.read()

import re

# Extract all line keys from each file
def get_keys(content):
    return re.findall(r'"(\w+)":\s*\{', content)

keys_curr = set(get_keys(current))
keys_new = set(get_keys(newjs))
keys_c = set(get_keys(c))

print(f'Current: {len(keys_curr)} keys')
print(f'new.js: {len(keys_new)} keys')
print(f'c: {len(keys_c)} keys')
print()
print(f'In current only: {keys_curr - keys_new - keys_c}')
print(f'In new only: {keys_new - keys_curr - keys_c}')
print(f'In c only: {keys_c - keys_curr - keys_new}')
print(f'In both new and c (not current): {((keys_new | keys_c) - keys_curr)}')
print()
# Check if newjs and c are identical
print(f'newjs == c: {newjs == c}')
print(f'newjs[:200]: {newjs[:200]}')
print(f'c[:200]: {c[:200]}')
