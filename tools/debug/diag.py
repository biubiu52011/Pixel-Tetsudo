path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Check file size and key markers
print('File length:', len(content))
print('热海 in content:', '热海' in content)
print('汤河原 in content:', '汤河原' in content)
print('大宫 in content (count):', content.count('大宫'))
print('前桥 in content:', '前桥' in content)
print('宫原 in content:', '宫原' in content)

# Check if our new blocks are there
print('JobanLocal JL:', 'code: "JL"' in content)
print('JT-UU throughServices:', '上野东京线直通' in content or 'JT' in content)

# Write diagnostic to file
import re
out = []
out.append('File length: ' + str(len(content)))
out.append('热海 found: ' + str('热海' in content))
out.append('前桥 found: ' + str('前桥' in content))
out.append('宫原 found: ' + str('宫原' in content))
out.append('code JL found: ' + str('code: "JL"' in content))
out.append('大宫 count: ' + str(content.count('大宫')))

# Check Tokaido block directly
idx = content.find('"Tokaido":')
if idx >= 0:
    block = content[idx:idx+600]
    out.append('Tokaido block first 200 chars: ' + block[:200])

with open(r'C:\Users\80996\Documents\项目\像素铁道\scripts\diag.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
