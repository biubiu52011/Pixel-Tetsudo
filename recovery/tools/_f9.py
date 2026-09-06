BS=chr(92)+chr(92) 
Q=chr(34) 
  open('js/data-state.js','w',encoding='utf-8').write(c) 
result='NOT_FOUND' 
if target in c: 
target='no_data:   { icon: '+BS+'u25cc, cls: '+Q+'rs-status-icon-no-data'+Q+',   label: '+Q+'no_data'+Q+'  },' 
  result='REPLACED' 
open('recovery/reports/_debug9.txt','w',encoding='utf-8').write(result) 
replacement=target+chr(10)+'    no_odpt:   { icon: '+BS+'u25cb, cls: '+Q+'rs-status-icon-no-odpt'+Q+',   label: '+Q+'no_odpt'+Q+'  }' 
  c=c.replace(target,replacement) 
