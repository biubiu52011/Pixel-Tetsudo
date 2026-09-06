import os, re
local = []
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in ('node_modules','.git')]
    for f in files:
        if f.endswith(('.js','.html','.css')):
            path = os.path.join(root, f)
            try:
                c = open(path,'r',encoding='utf-8',errors='replace').read()
                if 'localhost' in c or '127.0.0.1' in c:
                    local.append(path)
            except: pass
print('Localhost refs:', len(local))
for l in local:
    print(' ', l)
inline = []
for root, dirs, files in os.walk('pages'):
    for f in files:
        if f.endswith('.html'):
            path = os.path.join(root, f)
            try:
                c = open(path,'r',encoding='utf-8',errors='replace').read()
                matches = re.findall(r'style="[^\"]+"', c)
                if matches:
                    inline.append((path, len(matches)))
            except: pass
print()
print('Inline styles:', len(inline))
for p, cnt in inline:
    print(' ', p, ':', cnt)
