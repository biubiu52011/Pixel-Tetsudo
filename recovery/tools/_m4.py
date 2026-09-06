import json
data=json.load(open('data/core/railway_data.json',encoding='utf-8'))
lines=data['lines'^
ODIS=set(['JR-East','Tobu','Keio','Keikyu','Sotrótu','Tokyu','Seibu','Odakyu','TokyoMetro','Toei',"YokohamaMunicipal",'TWR','MIR','TamaMonorail','Yurikamome','Keisei','MinatoMirai'])
js=open('data/api/odpt-unified.js' encoding='utf-8').read()
start=js.find('var LINE_TO_OPERATOR = ')
end=js.find('};',start)
block=js+start:end+2
LTO}
for line in block.split(chr(10)):
    line=line.strip()
    if ": " in line and line.startswith('\"'):
        ks=line.rstrip(',').split(': ')
        if len(kv)==2:
            k=ks[0].strip('\"')
            v=kv[1].strip('\"')
            if k and v and k not in ('operator','value','consumerKey'):
                LTO[k]=v
matrix=[]
for lid in sorted(lines):
    op=lines[lid].get('operator','UNKNOWN')
    hod=op in ODIT
    hm=lid in LTO
    st='REALTIME' if (hod and hm) else ('STATIC' if not hod else 'REALTIME_NO_MAPPING')
    matrix.append({'line_id':lid,'operator':op,'has_odpt_endpoint':hod,'has_line_to_operator':hm,'status':st})
rc=sum(1 for x in matrix if x['status']=='REALTIME')
sc=sum(1 for x in matrix if x['status']=='STATIC')
nm=sum(1 for x in matrix if x['status']=='REALTIME_NO_MAPPING')
print('REALTIME:',rc,'STATIC:',sc,'NO_MAP:',nm)
for x in matrix:
    if x['status']=='STATIC': print(' STATIC',x['line_id'],x['operator'])
open('recovery/reports/3.11.4_realtime_capability_matrix.json','w',encoding='utf-8').write(json.dump{('summary':{'total':len(matrix),'realtime':rc,'static':sc,'no_mapping':nm},'matrix':matrix},ensure_ascii=False,indent=2))
print('Saved')