path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find where to insert new lines - before the closing };
# Look for the pattern "SeibuTamagawa": { ... },\n  };
# We need to insert before the final };

# Find the last block
last_block_match = re.search(r'"(\w+)":\s*\{[^}]+durations:\s*Array\(\d+\)[^}]+\},\s*\n\s*\}', content)
if last_block_match:
    print('Found last block ending')
    # Find the position of };
    close_pos = content.rfind('};')
    print('Close position:', close_pos)
    print('Context:', repr(content[close_pos-50:close_pos+10]))
else:
    print('Last block not found with regex')
    # Try to find it manually
    lines = content.split('\n')
    for i in range(len(lines)-1, -1, -1):
        if '};' in lines[i]:
            print('Found }; at line', i+1)
            print('Context:', repr(''.join(lines[max(0,i-5):i+2])))
            break
