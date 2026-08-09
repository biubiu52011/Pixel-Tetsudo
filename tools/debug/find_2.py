path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Check for 宇都宫
idx2 = content.find('宇都宫')
print('宇都宫 found at:', idx2)
if idx2 >= 0:
    ctx = content[max(0,idx2-100):idx2+150]
    print(repr(ctx))

# Check for 上野东京线
idx3 = content.find('上野东京')
print('\n上野东京 found at:', idx3)
if idx3 >= 0:
    ctx = content[max(0,idx3-100):idx3+150]
    print(repr(ctx))
