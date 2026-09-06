import re
from collections import Counter
pages = ['pages/home.html','pages/realtime.html','pages/trains.html','pages/history.html']
targets = ['pixel-card','search-card','sm-module','journey-card','rs-line-card','history-entry','search-result','module-title','rs-modal-content','sm-card','nearby-spot-card']
for p in pages:
    try:
        c = open(p, encoding='utf-8-sig').read()
        scripts = re.findall(r'src="([^"]+)"', c)
        print(f'=== {p} ===')
        print('  JS:')
        for s in scripts: print(f'    {s}')
        classes = re.findall(r'class="([^"]+)"', c)
        flat = []
        for cls in classes: flat.extend(cls.split())
        cnt = Counter(flat)
        print('  Key classes:')
        for t in targets:
            if cnt[t]: print(f'    {t}: {cnt[t]}')
        print()
    except Exception as e: print(f'{p}: ERROR {e}\n')
