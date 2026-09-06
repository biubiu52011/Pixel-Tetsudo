import json,re
with open('data/core/railway_data.json','r',encoding='utf-8') as f:
    data=json.load(f)
with open('data/core/line-operation-systems.js','r',encoding='utf-8') as f:
    c=f.read()
los=set()
for arr in re.findall('lineIds:\\s*\\[([^\\]]+)\\]',c):
    los.update(re.findall('"([^"]+)"',arr))
all=set(data['lines'].keys())
print('UNCOVERED:',sorted(all-los))
print('ORPHAN:',sorted(los-all))
print('COV:',len(los&all),len(all))
