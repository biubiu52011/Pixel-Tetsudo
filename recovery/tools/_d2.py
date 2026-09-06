import sys 
c=open('js/data-state.js','r',encoding='utf-8').read() 
open('recovery/reports/_debug4.txt','w',encoding='utf-8').write('no_odpt: '+str('no_odpt' in c)) 
