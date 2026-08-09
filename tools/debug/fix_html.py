import re

with open('pages/home.html', 'r', encoding='utf-8') as f:
    c = f.read()

# 替换按钮内容 - 用简单的文本刷新图标
old_btn = '''<button id=\"smRelocateBtn\" class=\"sm-relocate-btn\" title=\"重新定位\">
      <svg class=\"sm-relocate-icon\" shape-rendering=\"crispEdges\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">
  <polyline points=\"23 4 23 10 17 10\"></polyline>
  <polyline points=\"1 20 1 14 7 14\"></polyline>
  <path d=\"M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15\"></path>
</svg>
    </button>'''

new_btn = '<button id=\"smRelocateBtn\" class=\"sm-relocate-btn\" title=\"重新定位\">⟳</button>'

if old_btn in c:
    c = c.replace(old_btn, new_btn)
    with open('pages/home.html', 'w', encoding='utf-8') as f:
        f.write(c)
    print('HTML fixed!')
else:
    print('Pattern not found, checking...')
    idx = c.find('smRelocateBtn')
    print(repr(c[idx:idx+400]))
