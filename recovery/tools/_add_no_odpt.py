import json
with open('js/data-state.js','r',encoding='utf-8') as f: content=f.read()
old='no_data:   { icon: '+chr(92)+'u25cc, cls: '+chr(34)+'rs-status-icon-no-data'+chr(34)+',   label: '+chr(34)+'no_data'+chr(34)+'  },'
new=old+chr(10)+'    no_odpt:   { icon: '+chr(92)+'u25cb, cls: '+chr(34)+'rs-status-icon-no-odpt'+chr(34)+',   label: '+chr(34)+'no_odpt'+chr(34)+'  }'
if old in content:
    content=content.replace(old,new)
    with open('js/data-state.js','w',encoding='utf-8') as f: f.write(content)
    print('Added no_odpt status to data-state.js')
else:
    print('Pattern not found')
    idx=content.find('no_data:')
    print(repr(content[idx:idx+100]))
