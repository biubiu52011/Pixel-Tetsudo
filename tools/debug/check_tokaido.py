path1 = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
path2 = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control-new.js'
path3 = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\c'

with open(path1, 'r', encoding='utf-8') as f:
    current = f.read()
with open(path2, 'r', encoding='utf-8') as f:
    newjs = f.read()
with open(path3, 'r', encoding='utf-8') as f:
    c = f.read()

# Check which file has the correct Tokaido block (the one we just fixed)
for name, content in [('current', current), ('newjs', newjs), ('c', c)]:
    idx = content.find('"Tokaido":')
    if idx >= 0:
        end = content.find('    },', idx) + 8
        block = content[idx:end]
        import re
        st_m = re.search(r'stations:\s*\[([^\]]*)\]', block)
        if st_m:
            stations = [s.strip().strip('"') for s in st_m.group(1).split(',') if s.strip().strip('"')]
            print(f'{name}: Tokaido stations={len(stations)}, first={stations[0] if stations else "none"}, last={stations[-1] if stations else "none"}')
