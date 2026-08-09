with open(r'C:\Users\80996\Documents\项目\像素铁道\pages\trains.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if 'Content-Security' in line:
        print(f'Line {i+1}: {repr(line[:200])}')
