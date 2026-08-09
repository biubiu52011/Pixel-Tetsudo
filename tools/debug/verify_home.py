import sys
sys.stdout.reconfigure(encoding='utf-8')

# Check home.html
with open('pages/home.html', 'r', encoding='utf-8') as f:
    html = f.read()

print('=== home.html 验证 ===')
print('文件大小:', len(html), '字符')
print()
print('关键元素:')
checks = [
    ('DOCTYPE', '<!DOCTYPE html>' in html),
    ('CSS - style', 'style.css' in html),
    ('CSS - lang-bar', 'lang-bar.css' in html),
    ('CSS - tourism-styles', 'tourism-styles.css' in html),
    ('JS - translations', 'translations.js' in html),
    ('JS - lang-init', 'lang-init.js' in html),
    ('JS - sightseeing', 'sightseeing.js' in html),
    ('元素 - smModule', 'smModule' in html),
    ('元素 - smStationSelect', 'smStationSelect' in html),
    ('元素 - smTagFilters', 'smTagFilters' in html),
    ('元素 - smSearchSort', 'smSearchSort' in html),
    ('元素 - smSearchInput', 'smSearchInput' in html),
    ('元素 - smSortSelect', 'smSortSelect' in html),
    ('元素 - smGrid', 'smGrid' in html),
    ('元素 - smEmpty', 'smEmpty' in html),
]
for name, result in checks:
    status = '✓' if result else '✗'
    print(f'  {status} {name}')

print()
print('中文文本:')
chinese_checks = [
    ('观光信息', '观光信息' in html),
    ('选择车站', '选择车站' in html),
    ('搜索', '搜索' in html),
    ('距离排序', '距离排序' in html),
    ('名称排序', '名称排序' in html),
]
for name, result in chinese_checks:
    status = '✓' if result else '✗'
    print(f'  {status} {name}')
