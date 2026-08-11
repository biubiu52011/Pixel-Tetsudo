import re

js_path = r'C:\Users\80996\Documents\项目\像素铁道\data\api\odpt-unified.js'
with open(js_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_func = '''function renderCard(line, lineId) {
        var apiInfo = getApiDelayInfo(line);
        var status = getLineStatus(line, apiInfo);
        var maxDelay = getMaxDelay(line, apiInfo);
        var interval = getDelayInterval(line, apiInfo);
        var intervalText = interval || line.interval || "";
        var iconHtml = line.image ? '<img class="rs-line-icon" src="' + line.image + '" alt="">': '<div class="rs-code-badge">'+ escapeHtml(line.code) + '</div>';
        var statusAttr = status !== 'normal' ? ' data-status="' + status + '"' : '';
        return '<div class="rs-line-card" data-line="' + escapeHtml(lineId) + statusAttr + '"><div class="rs-line-header">'
            + iconHtml
            + '<div class="rs-line-info"><div class="rs-line-name"><span class="rs-live-dot"></span>' + escapeHtml(line.name) + '</div>'
            + '<div class="rs-line-interval">' + escapeHtml(intervalText) + '</div></div>'
            + getStatusIcon(status)
            + '<span class="rs-line-arrow">›</span></div></div>';
    }'''

new_func = '''function renderCard(line, lineId) {
        var apiInfo = getApiDelayInfo(line);
        var status = getLineStatus(line, apiInfo);
        var trains = window.TRAINS[line.name] || window.TRAINS[line.id] || [];
        var trainCount = trains.length;
        var iconHtml = line.image ? '<img class="rs-line-icon" src="' + line.image + '" alt="">': '<div class="rs-code-badge">'+ escapeHtml(line.code) + '</div>';
        var statusColor = status === 'delayed' ? 'var(--orange)' : status === 'suspended' ? 'var(--red)' : line.color;
        var statusAttr = status !== 'normal' ? ' data-status="' + status + '" style="--line-color:' + statusColor + ';"' : ' style="--line-color:' + line.color + ';"';
        var typeText = line.type === 'loop' ? 'Loop' : 'Straight';
        return '<div class="rs-line-card" data-line="' + escapeHtml(lineId) + statusAttr + '"><div class="rs-line-header">'
            + iconHtml
            + '<div class="rs-line-info"><div class="rs-line-name"><span class="rs-live-dot"></span>' + escapeHtml(line.name) + '</div>'
            + '<div class="rs-line-detail">'
            + '<span class="rs-line-operator">' + escapeHtml(line.operator || 'Other') + '</span>'
            + '<span class="rs-line-type">' + typeText + '</span>'
            + '<span class="rs-train-count">' + trainCount + ' cars</span>'
            + '</div></div>'
            + '<span class="rs-status-symbol rs-status-' + status + '">' + getStatusSymbol(status) + '</span>'
            + '</div></div>';
    }'''

if old_func in content:
    content = content.replace(old_func, new_func)
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Updated successfully!')
else:
    print('Pattern not found')
