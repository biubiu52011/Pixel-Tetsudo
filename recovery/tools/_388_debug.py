import sys, re
# Check JS files for console.log or debug output that might leak to user
js_files = [
    r'C:\Users\80996\Documents\项目\像素铁道\js\data-state.js',
    r'C:\Users\80996\Documents\项目\像素铁道\js\trains-page.js',
    r'C:\Users\80996\Documents\项目\像素铁道\js\realtime-view.js',
    r'C:\Users\80996\Documents\项目\像素铁道\js\trains-detail.js',
    r'C:\Users\80996\Documents\项目\像素铁道\js\route-search.js',
]
for f in js_files:
    name = f.split(chr(92))[-1]
    content = open(f, 'r', encoding='utf-8').read()
    logs = re.findall(r'console\.log\([^)]+\)', content)
    if logs:
        print(name + ': ' + str(len(logs)) + ' console.log')
        for l in logs[:3]:
            print('  ' + l[:80])
print('JS debug check complete')
