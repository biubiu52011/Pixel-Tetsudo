c=open('js/data-state.js','r',encoding='utf-8').read(); idx=c.find('no_data:'); open('recovery/reports/_debug6.txt','w',encoding='utf-8').write(repr(c[idx:idx+100])) 
