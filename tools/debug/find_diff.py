path1 = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
path2 = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control-new.js'
path3 = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\c'

with open(path1, 'r', encoding='utf-8') as f:
    current = f.read()
with open(path2, 'r', encoding='utf-8') as f:
    newjs = f.read()
with open(path3, 'r', encoding='utf-8') as f:
    c = f.read()

# Compare byte-by-byte to find first difference between current and newjs
min_len = min(len(current), len(newjs))
diff_pos = -1
for i in range(min_len):
    if current[i] != newjs[i]:
        diff_pos = i
        break
print(f'First diff between current and newjs at pos: {diff_pos}')
if diff_pos >= 0:
    print(f'current[{diff_pos-20}:{diff_pos+40}] = {repr(current[diff_pos-20:diff_pos+40])}')
    print(f'newjs[{diff_pos-20}:{diff_pos+40}] = {repr(newjs[diff_pos-20:diff_pos+40])}')

# Also diff newjs vs c
min_len2 = min(len(newjs), len(c))
diff_pos2 = -1
for i in range(min_len2):
    if newjs[i] != c[i]:
        diff_pos2 = i
        break
print(f'\nFirst diff between newjs and c at pos: {diff_pos2}')
if diff_pos2 >= 0:
    print(f'newjs[{diff_pos2-20}:{diff_pos2+40}] = {repr(newjs[diff_pos2-20:diff_pos2+40])}')
    print(f'c[{diff_pos2-20}:{diff_pos2+40}] = {repr(c[diff_pos2-20:diff_pos2+40])}')

# Show lengths
print(f'\ncurrent={len(current)}, newjs={len(newjs)}, c={len(c)}')
