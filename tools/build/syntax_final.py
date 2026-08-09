path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Syntax check
open_brace = content.count('{')
close_brace = content.count('}')
open_bracket = content.count('[')
close_bracket = content.count(']')
double_comma = len(re.findall(r',\s*,', content))

out = []
out.append('File length: ' + str(len(content)))
out.append('Braces balanced: ' + str(open_brace == close_brace) + ' ({=' + str(open_brace) + ', }=' + str(close_brace) + ')')
out.append('Brackets balanced: ' + str(open_bracket == close_bracket) + ' ([' + str(open_bracket) + ', ]=' + str(close_bracket) + ')')
out.append('Double commas: ' + str(double_comma))
out.append('JobanLocal code JL: ' + str('code: "JL"' in content))
out.append('SobuLocal code JB: ' + str('code: "JB"' in content))
out.append('Tokaido throughServices: ' + str('上野东京线直通' in content))
out.append('Takasaki throughServices: ' + str('上野东京线直通' in content))

with open(r'C:\Users\80996\Documents\项目\像素铁道\scripts\syntax_final.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
print('Done')
