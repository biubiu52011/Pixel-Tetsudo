import re
# Check HTML pages for raw IDs or tech leaks
pages = [
    r'C:\Users\80996\Documents\项目\像素铁道\pages\trains.html',
    r'C:\Users\80996\Documents\项目\像素铁道\pages\realtime.html',
    r'C:\Users\80996\Documents\项目\像素铁道\pages\home.html',
    r'C:\Users\80996\Documents\项目\像素铁道\pages\history.html',
]
tech_patterns = [r'line_id', r'station_id', r'branchOf', r'TODO', r'DEBUG', r'console\.log']
for page in pages:
    name = page.split(chr(92))[-1]
    content = open(page, 'r', encoding='utf-8').read()
    for pat in tech_patterns:
        matches = re.findall(pat, content, re.IGNORECASE)
        if matches:
            print(name + ': ' + pat + ' x' + str(len(matches)))
print('HTML check complete')
