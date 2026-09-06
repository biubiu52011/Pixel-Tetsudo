import re
# Check route-search.js and search-ui.js for issues
files = [
    r'C:\Users\80996\Documents\项目\像素铁道\js\route-search.js',
    r'C:\Users\80996\Documents\项目\像素铁道\js\search-ui.js',
]
for f in files:
    name = f.split(chr(92))[-1]
    content = open(f, 'r', encoding='utf-8').read()
    # Check for raw IDs in output
    leaks = re.findall(r'line_id|station_id|branchOf', content)
    if leaks:
        print(name + ': ' + str(len(leaks)) + ' potential leaks')
    # Check console.log
    logs = re.findall(r'console\.log', content)
    if logs:
        print(name + ': ' + str(len(logs)) + ' console.log')
    print(name + ': OK (' + str(len(content)) + ' chars)')
