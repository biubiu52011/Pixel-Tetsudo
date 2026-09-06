import re
path = r'C:\Users\80996\Documents\项目\像素铁道\js\station-resolver.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
# Remove the multi-line console.log: both the opening and continuation lines
pattern = r'  console\.log\(.*?\)\n\s*\"Line stations:.*?\"\);'
new_content = re.sub(pattern, '', content)
with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)
print('Removed console.log from station-resolver.js')
print('Parens: (' + str(new_content.count('(')) + ') / )' + str(new_content.count(')')))
