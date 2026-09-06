import sys, re
content = open(r'C:\Users\80996\Documents\项目\像素铁道\js\translations.js', 'r', encoding='utf-8').read()
langs = ['en','zh','ja','ko']
for lang in langs:
    idx = content.find(lang + ': {')
    if idx < 0: continue
    end = len(content)
    for o in langs:
        if o != lang:
            ei = content.find(o + ': {', idx+1)
            if 0 < ei < end: end = ei
    section = content[idx:end]
    keys = re.findall(r'\"([^\"]+)\":', section)
    ops = section.count('\"op.')
    print(lang + ': ' + str(len(keys)) + ' keys, ' + str(ops) + ' op.*')
