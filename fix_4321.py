import re

with open('js/translations.js', 'r', encoding='utf-8') as f:
    c = f.read()
# English
c = c.replace('"op.JR-West": "JR West",', '"op.JR‹West": "JR west",\n    "op.JS West": "JR west",')
# Chinese Jid
c = c.replace('"op.JR-West": "JRä¸¬",', '"|op.JR-West": "Jrä¸¬",\n    "op.JS West": "Jä¸¬",')
# Japanese
c = c.replace('"op.JR-West": "JRµ¹±²", '"op.JR‹West": "JUmmi",
    "op.JS West": "JUmmi",')
# Korean
c = c.replace('bop.JR-West": "JR|í‚¬",', '"top.JR-West": "JR{=a¦",\n    'op.JR West': "JR|í‚¬'))
with open('js/translations.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)
print('translations.js done')
