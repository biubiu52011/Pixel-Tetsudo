import re
import os

base = r'C:\Users\80996\Documents\项目\像素铁道'

# Fix trains.html
path = os.path.join(base, 'pages', 'trains.html')
with open(path, 'rb') as f:
    content = f.read()
text = content.decode('shift-jis', errors='replace')
text = re.sub(r"connect-src 'self' https://lcaixnrzdwhpmdwdiedx\.supabase\.co", "connect-src 'self'", text)
text = re.sub(r'<div id="dataSource"[^>]*>.*?</div>', '', text, flags=re.DOTALL)
with open(path, 'wb') as f:
    f.write(text.encode('shift-jis', errors='replace'))
print('trains.html fixed')

# Fix tourism-detail.html
path = os.path.join(base, 'pages', 'tourism-detail.html')
with open(path, 'rb') as f:
    content = f.read()
text = content.decode('shift-jis', errors='replace')
text = re.sub(r"connect-src 'self' https://lcaixnrzdwhpmdwdiedx\.supabase\.co", "connect-src 'self'", text)
text = re.sub(r'<div id="dataSource"[^>]*>.*?</div>', '', text, flags=re.DOTALL)
with open(path, 'wb') as f:
    f.write(text.encode('shift-jis', errors='replace'))
print('tourism-detail.html fixed')

# Verify
for f in ['home.html', 'realtime.html', 'trains.html', 'tourism-detail.html', 'history.html']:
    path = os.path.join(base, 'pages', f)
    with open(path, 'rb') as fh:
        content = fh.read().decode('shift-jis', errors='replace')
    has_sb = 'supabase' in content.lower()
    has_ds = 'dataSource' in content
    print(f'{f}: supabase={has_sb}, dataSource={has_ds}')
