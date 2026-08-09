path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Fix Yokosuka duration: 8 stations, should be Array(8)
# Find and replace
idx = content.find('"Yokosuka":')
if idx >= 0:
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    
    # Replace duration
    old_dur = 'durations: Array(25)'
    new_dur = 'durations: Array(8)'
    if old_dur in block:
        content = content[:idx] + content[idx:end].replace(old_dur, new_dur) + content[end:]
        print('Fixed Yokosuka duration: 25 -> 8')
    else:
        print('Yokosuka duration pattern not found')
        # Show what duration is there
        dur_m = re.search(r'durations:\s*Array\((\d+)\)', block)
        if dur_m:
            print('Current: Array(' + dur_m.group(1) + ')')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Saved')
