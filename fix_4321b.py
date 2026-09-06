import re

# Fix lang-init.js
with open('js/lang-init.js', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace(\
JR-West
TokyoMetro
\, \JR-West
JR West
TokyoMetro
\)
with open('js/lang-init.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)
print('lang-init.js done')
