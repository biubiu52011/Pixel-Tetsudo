import re
# Check if console.log output could leak to user-visible DOM
content = open(r'C:\Users\80996\Documents\项目\像素铁道\js\data-state.js', 'r', encoding='utf-8').read()
logs = re.findall(r'console\.log\(.*?\)', content)
print('data-state.js console.log count:', len(logs))
for l in logs:
    # Check if any log contains user-visible data
    if 'innerHTML' in l or 'container' in l.lower():
        print('  DEBUG LOG (not user-visible): ' + l[:100])
    else:
        print('  LOG: ' + l[:100])
