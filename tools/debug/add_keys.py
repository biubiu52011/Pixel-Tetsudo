import os
proj = r'C:\Users\80996\Documents\项目\像素铁道'
path = os.path.join(proj, 'js', 'translations.js')
c = open(path, encoding='utf-8').read()
lines = c.split('\n')
new_lines = []
count = 0
for line in lines:
    new_lines.append(line)
    if 'app.footer' in line and count < 4:
        indent = len(line) - len(line.lstrip())
        sp = ' ' * indent
        if count == 0:
            new_lines.append(sp + '"unit.minute": "分",')
            new_lines.append(sp + '"validate.input_required": "出发站和到达站不能为空",')
        elif count == 1:
            new_lines.append(sp + '"unit.minute": "分钟",')
            new_lines.append(sp + '"validate.input_required": "请输入出发站和到达站",')
        elif count == 2:
            new_lines.append(sp + '"unit.minute": "minute",')
            new_lines.append(sp + '"validate.input_required": "Please enter departure and destination stations",')
        elif count == 3:
            new_lines.append(sp + '"unit.minute": "분",')
            new_lines.append(sp + '"validate.input_required": "출발역과 도착역을 입력해주세요",')
        count += 1
open(path, 'w', encoding='utf-8').write('\n'.join(new_lines))
print('Fixed', count, 'sections')
