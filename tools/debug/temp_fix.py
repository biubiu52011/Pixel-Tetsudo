with open('C:/Users/80996/Documents/项目/像素铁道/js/realtime.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove 基本信息 section
old1 = """    // 基本信息
    html += '<div class="rs-info-section">';
    html += '<div class="rs-info-row"><span class="rs-info-label">运营公司</span><span class="rs-info-value">' + escapeHtml(line.operator || "") + '</span></div>';
    html += '<div class="rs-info-row"><span class="rs-info-label">线路代码</span><span class="rs-info-value">' + escapeHtml(line.code || "") + '</span></div>';
    html += '<div class="rs-info-row"><span class="rs-info-label">总站点数</span><span class="rs-info-value">' + (line.stations ? line.stations.length : 0) + ' 站</span></div>';
    html += '<div class="rs-info-row"><span class="rs-info-label">全程时间</span><span class="rs-info-value">' + (line.durationTotalMin || 0) + ' 分</span></div>';
    html += '</div>';
"""
content = content.replace(old1, '')

# Remove 换乘信息 section
old2 = """    // 换乘信息
    if (line.transferStations && line.transferStations.length > 0) {
      html += '<div class="rs-transfer-section"><div class="rs-section-title">换乘信息</div><div class="rs-transfers">';
      for (var i = 0; i < line.transferStations.length; i++) {
        var ts = line.transferStations[i];
        if (ts.connects && ts.connects.length > 0) {
          html += '<div class="rs-transfer-item"><strong>' + escapeHtml(ts.station) + '</strong><span>' + ts.connects.join(", ") + '</span></div>';
        }
      }
      html += '</div></div>';
    }
"""
content = content.replace(old2, '')

with open('C:/Users/80996/Documents/项目/像素铁道/js/realtime.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done')
