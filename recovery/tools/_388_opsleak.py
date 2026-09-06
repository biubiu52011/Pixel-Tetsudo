import sys, re
# Check for raw operator IDs that might appear in UI output
# Look at the render functions
files_to_check = {
    'data-state.js': r'C:\Users\80996\Documents\项目\像素铁道\js\data-state.js',
    'realtime-view.js': r'C:\Users\80996\Documents\项目\像素铁道\js\realtime-view.js',
    'trains-detail.js': r'C:\Users\80996\Documents\项目\像素铁道\js\trains-detail.js',
}
for name, path in files_to_check.items():
    content = open(path, 'r', encoding='utf-8').read()
    # Check for raw operator IDs in HTML output
    raw_ops = re.findall(r'JR-East|TokyoMetro|Seibu|Tobu|Tokyu|Keio|Odakyu', content)
    if raw_ops:
        print(name + ': ' + str(len(raw_ops)) + ' raw op refs')
        for r in raw_ops[:5]:
            print('  ' + r)
print('Operator leak check complete')
