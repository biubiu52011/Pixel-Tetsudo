with open('js/translations.js', 'r', encoding='utf-8') as f:
    c = f.read()
repls = [
    ('\ op.JR-West\: \JR West\,', '\op.JR-West\: \JR West\,
      \op.JR West\: \JR West\,'),
    ('\op.JR-West\: \JR\u4e1c\u672c\,', '\op.JR-West\: \JR\u4e1c\u672c\,
      \op.JR West\: \JR\u4e1c\u672c\,'),
    ('\op.JR-West\: \JR\u897f\u65e5\u672c\,', '\op.JR-West\: \JR\u897f\u65e5\u672c\,
      \op.JR West\: \JR\u897f\u65e5\u672c\,'),
    ('\op.JR-West\: \JR\ub3d9\uc77c\ubcf8\,', '\op.JR-West\: \JR\ub3d9\uc77c\ubcf8\,
      \op.JR West\: \JR\uc11c\uc77c\ubcf8\,'),
]
for old, new in repls:
    c = c.replace(old, new)
with open('js/translations.js', 'w', encoding='utf-8', newline='
') as f:
    f.write(c)
print('translations.js done')
