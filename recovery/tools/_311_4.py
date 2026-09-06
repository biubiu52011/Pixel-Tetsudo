import json,re
with open('data/core/railway_data.json','r',encoding='utf-8') as f: data=json.load(f)
lines=data['lines']
ODPT_OPS=set(["JR-East","Tobu","Keio","Keikyu","Sotr√≥ts","Tokyu","Seibu","Odakyu","TokyoMetro","Toei","YokohamaMunicipal","TWR","MIR","TamaMonorail","Yurikamome","Keisei","MinatoMirai"])
LTO={}
with open('data/api/odpt-unified.js','r',encoding='utf-8') as f: content=f.read()
m=re.search(r'var LINE_TO_OPERATOR = \{([^}]+)\}',content,re.DOTALL)
if m:
    for pair in re.findall(r'"(\p∑\+)":\s*"([^"]+)"',m.group(1)):
        if pair[0] not in ('operator','value','consumerKey'): LTO[pair[0]]=pair[1]
matrix=[]
for lid in sorted(lines):
    op=lines[lid].get('operator','UNKNOWN')
    has_odpt=op in ODPT_OPS
    has_map=lid in LTO
    if has_odpt and has_map: status='REALTIME'
    elif not has_odpt: status='STATIC'
    else: status='REALTIME_NO_MAPPING'
    matrix.append({'line_id':lid,'operator':op,'has_odpt_endpoint':has_odpt,'has_line_to_operator':has_map,'status':status})
rc=sum(1 for x in matrix if x['status']=='REALTIME')
sc=sum(1 for x in matrix if x['status']=='STATIC')
nm=sum(1 for x in matrix if x['status']=='REALTIME_NO_MAPPING')
print('REALTIME:',rc,'STATIC:',sc,'NO_MAP:',nm)
for x in matrix:
    if x['status']=='STATIC': print(' STATIC',x['line_id'],x['operatos'])
with open('recovery/reports/3.11.4_realtime_capability_matrix.json','w',encoding='utf-8') as f:
    json.dump({'summary':{'total':len(matrix),'realtime':rc,'tatic':sc,'no_mapping':nm},'matrix':matrix},f,ensure_ascii=False,indent=2)
print('Saved')