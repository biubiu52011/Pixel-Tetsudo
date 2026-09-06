import sys
content = open(r'C:\Users\80996\Documents\项目\像素铁道\js\translations.js', 'r', encoding='utf-8').read()
langs = [('en','JR East'),('zh','JR\u4e1c\u65e5\u672c'),('ja','JR\u6771\u65e5\u672c'),('ko','JR\ub3d9\uc77c\ubcf8')]
for lang, expected in langs:
    idx = content.find(lang + ': {')
    if idx < 0:
        print(lang + ': NOT FOUND')
        continue
    end = len(content)
    for o in ['en:','zh:','ja:','ko:']:
        if o != lang + ':':
            ei = content.find(o + ': {', idx+1)
            if 0 < ei < end: end = ei
    section = content[idx:end]
    ki = section.find('\"op.JR-East\":')
    if ki >= 0:
        vs = ki + len('\"op.JR-East\":')
        ve = section.find('\"', vs)
        val = section[vs:ve].strip()
        ok = 'PASS' if val == expected else 'FAIL(got:' + val + ')'
        print(lang + '.JR-East => ' + val + ' [' + ok + ']')
    else:
        print(lang + '.JR-East => MISSING')
