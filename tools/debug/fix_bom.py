path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'rb') as f:
    raw = f.read()

# Check for BOM
if raw[:3] == b'\xef\xbb\xbf':
    print('Has UTF-8 BOM')
    # Remove BOM
    raw = raw[3:]
    with open(path, 'wb') as f:
        f.write(raw)
    print('Removed BOM')
else:
    print('No BOM found')

# Check first few bytes
with open(path, 'rb') as f:
    raw = f.read(100)
print('First 100 bytes:', raw[:50])
