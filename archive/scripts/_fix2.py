import sys
sys.stdout.reconfigure(encoding='utf-8')
f=open('js/sightseeing.js','r', encoding='utf-8')
src=f.read();f.close()
lines=src.split(chr(10))
new_lines=[]
for i,l in enumerate(lines):
    if "if (tag === "all" && group === null)" in l: continue
    if "// 一级" in l: continue
    if "state.activeSub = null;" in l: continue
    if "} else if (group !== null && sub === null)" in l: continue
    if "// 一级大类" in l: continue
    if "if (state.activeTag === group)" in l: continue
    if "state.activeTag = group;" in l: continue
    if "} else if (group !== null)" in l: continue
    if "// 二级子分类" in l: continue
    new_lines.append(l)
src=chr(10).join(new_lines)
f=open('js/sightseeing.js','w', encoding='utf-8')
f.write(src);f.close()
print('ok')
