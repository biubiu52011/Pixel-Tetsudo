import re
content = open(r'C:\Users\80996\Documents\项目\像素铁道\js\translations.js', 'r', encoding='utf-8').read()
langs = ['en','zh','ja','ko']
all_keys = {}
for lang in langs:
    idx = content.find(lang + ': {')
    if idx < 0: continue
    end = len(content)
    for o in langs:
        if o != lang:
            ei = content.find(o + ': {', idx+1)
            if 0 < ei < end: end = ei
    section = content[idx:end]
    keys = set(re.findall(r'\"([^\"]+)\":', section))
    all_keys[lang] = keys

# Find keys only in ko
only_ko = all_keys['ko'] - all_keys['en']
print('Keys only in ko:', only_ko)
# Find keys missing from ko
missing_ko = all_keys['en'] - all_keys['ko']
print('Keys missing from ko:', missing_ko)
