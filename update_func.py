# Python script to update trains-page.js
import sys

path = r'C:\Users\80996\Documents\项目\像素铁道\js\trains-page.js'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find renderTrainMap line
for i, line in enumerate(lines):
    if 'function renderTrainMap' in line:
        # Insert new function before it
        new_func = '''  function getDelayIntervalForLine(lineId) {
    var op = window.ODPT_CONFIG && window.ODPT_CONFIG.lineToOperator ? window.ODPT_CONFIG.lineToOperator[lineId] : null;
    if (!op || !window.ODPT_DELAY_DATA || !window.ODPT_DELAY_DATA[op]) return null;
    var info = window.ODPT_DELAY_DATA[op];
    if (!info) return null;
    var title = info['odpt:informationTitle'] || '';
    var content = info['odpt:informationContent'] || '';
    var text = title + ' ' + content;
    var match = text.match(/([^\\s\\-]+)\\s*[-～至]\\s*([^\\s\\-]+)/);
    return match ? match[1] + '->' + match[2] : null;
  }

'''
        lines.insert(i, new_func)
        print(f'Added getDelayIntervalForLine at line {i+1}')
        break

# Write back
with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print('Done')
