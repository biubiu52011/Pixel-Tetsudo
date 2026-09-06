with open('js/trains-page.js', 'r', encoding='utf-8') as f:
    c = f.read()
old = 'try { window.DataState.renderList(el, ul, { mode: \\\ trains\\\ }); } catch(e) { el.innerHTML = \\\<div class=\\\\\\\rs-error\\\\\\\>Render failed</div>\\\; }'
new = 'var lineOrder = (window.LinePresentationService && window.UNIFIED_LINES) ? window.LinePresentationService.getDisplayOrder(window.UNIFIED_LINES) : []; try { window.DataState.renderList(el, ul, { mode: \\\trains\\\, lineOrder: lineOrder }); } catch(e) { el.innerHTML = \\\<div class=\\\\\\\rs-error\\\\\\\>Render failed</div>\\\; }'
c = c.replace(old, new)
with open('js/trains-page.js', 'w', encoding='utf-8', newline='
') as f:
    f.write(c)
print('trains-page.js done')
