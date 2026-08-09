path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix TobuNoda: stations=33, duration=25 -> fix duration to 33
old = 'durations: Array(25)'
new = 'durations: Array(33)'
if old in content:
    content = content.replace(old, new, 1)  # replace only first occurrence
    print('Fixed TobuNoda: Array(25) -> Array(33)')
else:
    print('Pattern not found')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Saved.')
