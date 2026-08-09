path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Show first 2000 chars to see what we have now
out_lines = []
out_lines.append('Length: ' + str(len(content)))
out_lines.append('First 500 chars:')
out_lines.append(content[:500])
out_lines.append('')

# Check JobanLocal code
jb_pos = content.find('code: "JB"')
jl_pos = content.find('code: "JL"')
out_lines.append('JB at: ' + str(jb_pos))
out_lines.append('JL at: ' + str(jl_pos))

# Check Tokaido
td_pos = content.find('"Tokaido":')
out_lines.append('Tokaido at: ' + str(td_pos))
if td_pos >= 0:
    block = content[td_pos:td_pos+500]
    out_lines.append('Tokaido block[:300]: ' + repr(block[:300]))

with open(r'C:\Users\80996\Documents\项目\像素铁道\scripts\current_state.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out_lines))
print('Done')
