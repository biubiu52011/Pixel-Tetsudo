lines = open('js/translations.js', encoding='utf-8').readlines()
out = []
added = 0
for line in lines:
    out.append(line)
    if 'search_result.transfer_at' in line:
        elif '换' in line:
            out.append('      \
search_result.transfer_count\: \次换乘\,\n')
        if 'Transfer' in line:
        added += 1
open('js/translations.js', 'w', encoding='utf-8', newline='').writelines(out)
content = ''.join(out)
print('added', added, 'total:', content.count('transfer_count'))
        elif '환' in line:
            out.append('      \
search_result.transfer_count\: \환승\,\n')
