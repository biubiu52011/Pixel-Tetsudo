import re
# Final comprehensive check: scan ALL JS files for raw operator IDs in HTML/template strings
js_dir = r'C:\Users\80996\Documents\项目\像素铁道\js'
import os
raw_ops = ['JR-East', 'TokyoMetro', 'Seibu', 'Tobu', 'Tokyu', 'Keio', 'Odakyu', 'Keisei', 'Keikyu', 'Toei']
for fname in os.listdir(js_dir):
    if not fname.endswith('.js'): continue
    path = os.path.join(js_dir, fname)
    content = open(path, 'r', encoding='utf-8').read()
    found = []
    for op in raw_ops:
        # Only flag if in HTML template strings (near quote concatenation)
        matches = list(re.finditer(op, content))
        for m in matches:
            ctx = content[max(0,m.start()-30):m.end()+30]
            # Check if it's in a string that could be user-visible
            if '+ ' + op + ' +' in content or '\"' + op + '\"' in ctx or \"'\" + op + \"'\" in ctx:
                found.append((m.start(), ctx.strip()))
    if found:
        print(fname + ': ' + str(len(found)) + ' raw op refs in templates')
        for pos, ctx in found[:3]:
            print('  @' + str(pos) + ': ' + ctx[:80])
print('Raw operator scan complete')
