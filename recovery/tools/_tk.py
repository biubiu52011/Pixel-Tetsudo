L=open('js/translations.js',encoding='utf-8').readlines(); R=[]; EN=False; ZH=False; JA=False; KO=False
for l in L:
 R.append(l)
 if 'search_result.transfer_at' in l:
  if b'Transfer at'.decode() in l: R.append('      search_result.transfer_count: transfer(s),\n'); EN=True
  elif b'\u5728'.decode() in l: R.append('      search_result.transfer_count: cihuan,\n'); ZH=True
  elif b'\u4e57'.decode() in l or b'\u63db'.decode() in l: R.append('      search_result.transfer_count: zhuanyun,\n'); JA=True
  elif b'\ud658'.decode() in l or b'\uc2b9'.decode() in l: R.append('      search_result.transfer_count: hwanseung,\n'); KO=True
open('js/translations.js','w',encoding='utf-8',newline='').writelines(R)
print(EN,ZH,JA,KO)