import sys
sys.stdout.reconfigure(encoding='utf-8')
f=open('js/sightseeing.js','r', encoding='utf-8')
src=f.read();f.close()
lines=src.split(chr(10))
new=[]
i=0
while i<len(lines):
    l=lines[i]
    if 'if (cur && cur.subs' in l:
        i+=1
        continue
    if l.strip()=='}' and i>0 and 'sm-tag-row-sub' in lines[i-1]:
        i+=1
        continue
    new.append(l)
    i+=1
src=chr(10).join(new)
f=open('js/sightseeing.js','w', encoding='utf-8')
f.write(src);f.close()
print('ok')
