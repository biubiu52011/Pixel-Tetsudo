import sys
import os
sys.stdout.reconfigure(encoding='utf-8')
os.chdir(r'C:\Users\80996\Documents\项目\像素铁道')
if os.path.exists('js/bundle-home.js'):
    with open('js/bundle-home.js', 'r', encoding='utf-8') as f:
        content = f.read()
    print(f"bundle-home.js: {len(content)} chars")
    print(content[:500])
else:
    print("NOT FOUND")
