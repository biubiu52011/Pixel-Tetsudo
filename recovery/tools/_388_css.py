import re
content = open(r'C:\Users\80996\Documents\项目\像素铁道\css\style.css', 'r', encoding='utf-8').read()
# Find where 'operator' appears
for m in re.finditer(r'operator', content, re.IGNORECASE):
    start = max(0, m.start()-30)
    end = min(len(content), m.end()+30)
    print(repr(content[start:end]))
