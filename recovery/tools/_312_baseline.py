import json,hashlib 
sha=hashlib.sha256(c.encode('utf-8')).hexdigest() 
with open('pages/home.html','r',encoding='utf-8') as f: c=f.read() 
baseline={ 
  'file':'pages/home.html == data/\u94c1\u9053/home.html (synced)', 
  'sha256_short':sha[:8], 
  'sha256':sha, 
  'modules':{ 
