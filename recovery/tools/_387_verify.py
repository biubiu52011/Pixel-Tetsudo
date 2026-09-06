path = r'C:\Users\80996\Documents\项目\像素铁道\js\translations.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re
for lang in ['en','zh','ja','ko']:
    # Find section boundaries
    start = content.find(lang + ': {')
    if start < 0:
        print(lang + ': NOT FOUND')
        continue
    next_langs = [l for l in ['en','zh','ja','ko'] if l != lang]
    end = len(content)
    for nl in next_langs:
        ei = content.find(nl + ': {', start+1)
        if ei > 0 and ei < end:
            end = ei
    section = content[start:end]
    ops = re.findall(r'\"op\.([^\"]+)\":\s*\"([^\"]+)\"', section)
    print(lang + ': ' + str(len(ops)) + ' operators')
    if ops:
        print('  First: ' + ops[0][0] + ' => ' + ops[0][1])
        print('  Last:  ' + ops[-1][0] + ' => ' + ops[-1][1])
