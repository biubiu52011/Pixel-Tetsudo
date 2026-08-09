import re
with open(r'C:\Users\80996\Documents\项目\像素铁道\pages\trains.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Show the actual bytes around CSP
idx = content.find('Content-Security-Policy')
if idx >= 0:
    snippet = content[idx:idx+200]
    print('Actual CSP snippet:')
    print(repr(snippet[:150]))
