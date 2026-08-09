import os, re
proj = r'C:\Users\80996\Documents\项目\像素铁道'

results = []

# 1. Check tourism-data.js emoji status
c = open(os.path.join(proj, 'data', 'tourism-data.js'), encoding='utf-8').read()
emoji_matches = re.findall(r'emoji:\s*"([^"]*)"', c)
with_emoji = sum(1 for e in emoji_matches if e)
empty_emoji = sum(1 for e in emoji_matches if not e)
results.append('=== tourism-data.js Emoji ===')
results.append('Total emoji entries: ' + str(len(emoji_matches)))
results.append('With emoji: ' + str(with_emoji))
results.append('Empty: ' + str(empty_emoji))
results.append('')

# 2. Check station names count
stations = re.findall(r'"(\w+)":\s*\{', c)
results.append('=== Tourism Stations ===')
results.append('Total stations: ' + str(len(stations)))
results.append('First 10: ' + str(stations[:10]))
results.append('')

# 3. Check sightseeing.js DOM references
js_c = open(os.path.join(proj, 'js', 'sightseeing.js'), encoding='utf-8').read()
js_ids = re.findall(r"getElementById\('([^']+)'\)", js_c)
results.append('=== sightseeing.js DOM IDs ===')
results.append('IDs: ' + str(js_ids))
results.append('')

# 4. Check HTML has these IDs
html_c = open(os.path.join(proj, 'pages', 'home.html'), encoding='utf-8').read()
results.append('=== HTML DOM IDs ===')
for id in js_ids:
    found = id in html_c
    results.append(id + ': ' + ('OK' if found else 'MISSING'))
results.append('')

# 5. Check search-ui.js
js_c = open(os.path.join(proj, 'js', 'search-ui.js'), encoding='utf-8').read()
js_ids = re.findall(r"getElementById\('([^']+)'\)", js_c)
results.append('=== search-ui.js DOM IDs ===')
results.append('IDs: ' + str(js_ids))
for id in js_ids:
    found = id in html_c
    results.append(id + ': ' + ('OK' if found else 'MISSING'))
results.append('')

# 6. Check language switcher
js_c = open(os.path.join(proj, 'js', 'lang-init.js'), encoding='utf-8').read()
js_ids = re.findall(r"getElementById\('([^']+)'\)", js_c)
results.append('=== lang-init.js DOM IDs ===')
results.append('IDs: ' + str(js_ids))
for id in js_ids:
    found = id in html_c
    results.append(id + ': ' + ('OK' if found else 'MISSING'))

with open(os.path.join(proj, 'dropdown_check.txt'), 'w', encoding='utf-8') as f:
    f.write(chr(10).join(results))
print('done')
