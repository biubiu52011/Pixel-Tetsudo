import re
with open(r'data\tourism-data.js', 'r', encoding='utf-8') as f:
    content = f.read()
content = re.sub(r'"(\w+)"\s*,\s*""(\w+)"', r'"\1", "\2"', content)
with open(r'data\tourism-data.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed')
