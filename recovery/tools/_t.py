lines = open('js/translations.js', encoding='utf-8').readlines()
out = []
added = 0
for line in lines:
    out.append(line)
    if 'transfer_at' in line and 'search_result' in line:
        if 'Transfer' in line:
