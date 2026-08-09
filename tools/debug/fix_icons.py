with open('js/sightseeing.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()
new_lines = []
skip = False
for i, line in enumerate(lines):
    if 'TAG_ICONS' in line and '=' in line:
        skip = True
        new_lines.append('  const TAG_ICONS = {\n')
        new_lines.append("    all: '\\u2605',\n")
        new_lines.append("    night: '\\u263E',\n")
        new_lines.append("    history: '\\u2696',\n")
        new_lines.append("    nature: '\\u2668',\n")
        new_lines.append("    shrine: '\\u264F',\n")
        new_lines.append("    food: '\\u26C4',\n")
        new_lines.append("    seasonal: '\\u2744'\n")
        continue
    if skip:
        if '};' in line:
            skip = False
        continue
    new_lines.append(line)
with open('js/sightseeing.js', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print('Fixed!')
