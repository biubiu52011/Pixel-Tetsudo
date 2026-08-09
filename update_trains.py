path = r'C:\Users\80996\Documents\项目\像素铁道\js\trains-page.js'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    if '// Draw line' in line and i + 1 < len(lines) and 'e0e0e0' in lines[i+1]:
        new_lines.append('    // Draw line segments with delay highlighting\n')
        new_lines.append('    var delayInterval = getDelayIntervalForLine(lineId);\n')
        new_lines.append('    var segments = line.stations.length - 1;\n')
        new_lines.append('    for (var s = 0; s < segments; s++) {\n')
        new_lines.append('      var x1 = 50 + s * 65;\n')
        new_lines.append('      var x2 = 50 + (s + 1) * 65;\n')
        new_lines.append("      var strokeColor = '#e0e0e0';\n")
        new_lines.append('      var strokeWidth = 4;\n')
        new_lines.append('      if (delayInterval) {\n')
        new_lines.append("        var parts = delayInterval.split('->');\n")
        new_lines.append('        if (parts.length >= 2) {\n')
        new_lines.append('          var startStation = parts[0].trim();\n')
        new_lines.append('          var endStation = parts[1].trim();\n')
        new_lines.append('          var startIndex = line.stations.indexOf(startStation);\n')
        new_lines.append('          var endIndex = line.stations.indexOf(endStation);\n')
        new_lines.append('          if (startIndex >= 0 && endIndex >= 0) {\n')
        new_lines.append('            if (s >= Math.min(startIndex, endIndex) && s < Math.max(startIndex, endIndex)) {\n')
        new_lines.append("              strokeColor = line.color || '#ff4757';\n")
        new_lines.append('              strokeWidth = 6;\n')
        new_lines.append('            }\n')
        new_lines.append('          }\n')
        new_lines.append('        }\n')
        new_lines.append('      }\n')
        new_lines.append("      svg += '<line x1=\"' + x1 + '\" y1=\"90\" x2=\"' + x2 + '\" y2=\"90\" stroke=\"' + strokeColor + '\" stroke-width=\"' + strokeWidth + '\" stroke-linecap=\"round\"/>';\n")
        new_lines.append('    }\n')
        i += 2
    else:
        new_lines.append(line)
        i += 1

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print('Done')
