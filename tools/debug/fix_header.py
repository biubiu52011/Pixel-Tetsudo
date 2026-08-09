with open(r'C:\Users\80996\Documents\项目\像素铁道\js\sightseeing.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 找到并修复 renderHeader 函数
new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    if 'if (state.autoDetected && state.selectedStation)' in line and i > 100 and i < 120:
        # 跳过接下来的几行错误代码，替换为正确代码
        new_lines.append(line)
        i += 1
        # 跳过错误的 stationLabel 行
        while i < len(lines) and 'stationLabel' in lines[i]:
            i += 1
        # 跳过错误的 html += 行
        while i < len(lines) and 'html += ' in lines[i]:
            i += 1
        # 添加正确的代码
        new_lines.append("      const stationLabel = t('station_names.' + state.selectedStation) || state.selectedStation;\n")
        new_lines.append("      html += '<div id=\"smAutoBadge\" class=\"sm-auto-badge\"><span>' + \n")
        new_lines.append("              t('tourism.auto_detected') + ': ' + stationLabel + '</span></div>';\n")
    else:
        new_lines.append(line)
        i += 1

with open(r'C:\Users\80996\Documents\项目\像素铁道\js\sightseeing.js', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print('Fixed renderHeader')
