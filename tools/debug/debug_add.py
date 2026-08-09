path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Check if new lines were added
for key in ['Marunouchi', 'Chiyoda', 'Hanzomon', 'Namboku', 'Fukutoshin']:
    idx = content.find('"' + key + '":')
    print(key + ' found at: ' + str(idx))
    if idx >= 0:
        # Show context
        print('  Context: ' + repr(content[idx:idx+100]))

print()
print('Total length:', len(content))

# Check the area around close_pos
close_pos = content.rfind('  };')
print('Close position:', close_pos)
print('Content around close:', repr(content[close_pos-100:close_pos+30]))
