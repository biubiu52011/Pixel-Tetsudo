path1 = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
path2 = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control-new.js'

with open(path1, 'r', encoding='utf-8') as f:
    current = f.read()
with open(path2, 'r', encoding='utf-8') as f:
    newjs = f.read()

# Show first 500 chars of each
print('CURRENT[:300]:')
print(repr(current[:300]))
print()
print('NEWJS[:300]:')
print(repr(newjs[:300]))
