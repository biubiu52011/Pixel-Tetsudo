issues = []
with open('js/data-state.js', 'r', encoding='utf-8') as f:
    ds = f.read()
# Check the fix
fixed_count = ds.count('icon: \"\\\\u25cb\"')
broken_count = ds.count('icon: \\\\\\\\u25cb')
print('Fixed patterns:', fixed_count)
print('Broken patterns:', broken_count)
print('no_odpt entry:', 'no_odpt' in ds)
print('STATUS_META defined:', 'STATUS_META' in ds)

import os
for jf in ['js/data-state.js','js/data-fusion.js','js/realtime-view.js','data/api/odpt-unified.js','js/translations.js','js/common.js','js/lang-init.js','js/tab-switch.js']:
    if os.path.exists(jf):
        c = open(jf,'r',encoding='utf-8',errors='replace').read()
        if c.count('{') != c.count('}'):
            issues.append(jf + ' brace mismatch')
        if c.count('(') != c.count(')'):
            issues.append(jf + ' paren mismatch')

with open('css/style.css','r',encoding='utf-8',errors='replace') as f:
    sc = f.read()
for cls in ['rs-line-card','rs-status-icon','rs-operator-group','rs-empty','rs-loading','rs-modal']:
    if cls not in sc:
        issues.append('Missing CSS: .' + cls)

with open('css/realtime.css','r',encoding='utf-8',errors='replace') as f:
    rc = f.read()
print('realtime.css length:', len(rc))

if issues:
    print('ISSUES:', issues)
else:
    print('ALL CHECKS PASSED')
