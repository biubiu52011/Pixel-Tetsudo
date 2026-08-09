path = r'C:\Users\80996\Documents\项目\像素铁道\data\api\odpt-unified.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_code = '''          // 1. 运行状态
          html += '\''<div class="rs-status-section ' + statusClass + '\'"><span class="rs-status-indicator"><span style="background:var(--' + (status === "suspended" ? "red" : (status === "delayed" ? "orange" : "green")) + ')"></span>' + statusText + '</span>';
          if (maxDelay > 0) html += '\''<span class="rs-delay-badge">最大延误 +' + maxDelay + '分</span>'\'';
          html += '\''</div>'\'';

          // 2. 区间信息 - 始终显示
          html += '\''<div class="rs-interval-section"><div class="rs-interval-header">区间信息</div><div class="rs-interval-stations">'\'';
          if (!interval || status === "normal") {
              html += '\''<span class="rs-station-text">全线正常运行</span>'\'';
          } else {
              var parts = interval.split("→");
              if (parts.length >= 2) {
                  html += '\''<span class="rs-station-start">'\'' + escapeHtml(parts[0]) + '\''</span>'\'';
                  html += '\''<span class="rs-interval-arrow">→</span>'\'';
                  html += '\''<span class="rs-station-end">'\'' + escapeHtml(parts[1]) + '\''</span>'\'';
              } else {
                  html += '\''<span class="rs-station-text">'\'' + escapeHtml(interval) + '\''</span>'\'';
              }
          }
          html += '\''</div></div>'\'';

          // 3. 原因 - 始终显示
          html += '\''<div class="rs-cause-section"><div class="rs-section-title">原因</div><div class="rs-cause-text">'\'';
          if (cause && status !== "normal") {
              html += escapeHtml(cause);
          } else {
              html += '\''<span class="rs-normal-cause">无</span>'\'';
          }
          html += '\''</div></div>'\'';'''

new_code = '''          // 1. 运行状态
          html += '\''<div class="rs-status-section ' + statusClass + '\'">'\'';
          html += '\''<div class="rs-status-header">'\'';
          html += '\''<span class="rs-status-dot" style="background:var(--' + (status === "suspended" ? "red" : (status === "delayed" ? "orange" : "green")) + ')"></span>'\'';
          html += '\''<span class="rs-status-title">' + statusText + '</span>'\'';
          if (maxDelay > 0) {
              html += '\''<span class="rs-delay-badge">+' + maxDelay + '分</span>'\'';
          }
          html += '\''</div>'\'';
          html += '\''</div>'\'';

          // 2. 区间信息
          html += '\''<div class="rs-info-card">'\'';
          html += '\''<div class="rs-card-label">区间信息</div>'\'';
          html += '\''<div class="rs-card-value">'\'';
          if (!interval || status === "normal") {
              html += '\''<span class="rs-status-tag rs-tag-normal">全线正常运行</span>'\'';
          } else {
              var parts = interval.split("→");
              if (parts.length >= 2) {
                  html += '\''<span class="rs-station-name">' + escapeHtml(parts[0]) + '</span>'\'';
                  html += '\''<span class="rs-arrow">→</span>'\'';
                  html += '\''<span class="rs-station-name">' + escapeHtml(parts[1]) + '</span>'\'';
              } else {
                  html += '\''<span class="rs-station-name">' + escapeHtml(interval) + '</span>'\'';
              }
          }
          html += '\''</div></div>'\'';

          // 3. 延误原因
          html += '\''<div class="rs-info-card">'\'';
          html += '\''<div class="rs-card-label">延误原因</div>'\'';
          html += '\''<div class="rs-card-value">'\'';
          if (cause && status !== "normal") {
              html += escapeHtml(cause);
          } else {
              html += '\''<span class="rs-normal-text">无</span>'\'';
          }
          html += '\''</div></div>'\'';'''

if old_code in content:
    content = content.replace(old_code, new_code)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Updated modal HTML')
else:
    print('Pattern not found, trying alternative...')
    idx = content.find('// 1. 运行状态')
    if idx != -1:
        print('Found at index:', idx)
        print(repr(content[idx:idx+500]))
