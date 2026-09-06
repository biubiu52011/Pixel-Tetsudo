lines = open('js/translations.js', encoding='utf-8').readlines()
for line in lines:
    out.append(line)
    if 'transfer_at' in line and 'search_result' in line:
out = []
added = 0
        elif chr(25435) in line:
            out.append('      search_result.transfer_count: cihuan,\n')
            added += 1
        if chr(84)+chr(114)+chr(97)+chr(110)+chr(115)+chr(102)+chr(101)+chr(114) in line:
            out.append('      search_result.transfer_count: transfer(s),\n')
            added += 1
        elif chr(36744) in line:
            out.append('      search_result.transfer_count: zhuanyun,\n')
            added += 1
