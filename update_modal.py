path = r'C:\Users\80996\Documents\项目\像素铁道\data\api\odpt-unified.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_modal = '''    function openModal(lineId, linesData) {
        var modal = document.getElementById("lineDetailModal");
        if (!modal || !linesData) return;
        var line = linesData[lineId];
        if (!line) return;

        var apiInfo = getApiDelayInfo(line);
        var status = getLineStatus(line, apiInfo);
        var maxDelay = getMaxDelay(line, apiInfo);
        var interval = getDelayInterval(line, apiInfo);
        var cause = getDelayCause(line, apiInfo);

        var statusText = window.t ? (status === "suspended" ? window.t("status.suspended") : (status === "delayed" ? window.t("status.delayed") : window.t("status.normal"))) : (status === "suspended" ? "运休" : (status === "delayed" ? "延误" : "正常"));
        var statusClass = status === "suspended" ? "rs-status-suspended" : (status === "delayed" ? "rs-status-delayed" : "rs-status-normal");

        var body = modal.querySelector(".rs-modal-body");
        var title = modal.querySelector(".rs-modal-title");
        title.textContent = line.name;

        var html = "";

        // 1. 运行状态
        html += '<div class="rs-status-section ' + statusClass + '"><span class="rs-status-indicator"><span style="background:var(--' + (status === "suspended" ? "red" : (status === "delayed" ? "orange" : "green")) + ')"></span>' + statusText + '</span>';
        if (maxDelay > 0) html += '<span class="rs-delay-badge">最大延误 +' + maxDelay + '分</span>';
        html += '</div>';

        // 2. 区间信息 - 始终显示
        html += '<div class="rs-interval-section"><div class="rs-interval-header">区间信息</div><div class="rs-interval-stations">';
        if (!interval || status === "normal") {
            html += '<span class="rs-station-text">全线正常运行</span>';
        } else {
            var parts = interval.split("→");
            if (parts.length >= 2) {
                html += '<span class="rs-station-start">' + escapeHtml(parts[0]) + '</span>';
                html += '<span class="rs-interval-arrow">→</span>';
                html += '<span class="rs-station-end">' + escapeHtml(parts[1]) + '</span>';
            } else {
                html += '<span class="rs-station-text">' + escapeHtml(interval) + '</span>';
            }
        }
        html += '</div></div>';

        // 3. 原因 - 始终显示
        html += '<div class="rs-cause-section"><div class="rs-section-title">原因</div><div class="rs-cause-text">';
        if (cause && status !== "normal") {
            html += escapeHtml(cause);
        } else {
            html += '<span class="rs-normal-cause">无</span>';
        }
        html += '</div></div>';

        body.innerHTML = html;
        modal.classList.add("active");
        document.body.classList.add("modal-open");
    }'''

new_modal = '''    function openModal(lineId, linesData) {
        var modal = document.getElementById("lineDetailModal");
        if (!modal || !linesData) return;
        var line = linesData[lineId];
        if (!line) return;

        var apiInfo = getApiDelayInfo(line);
        var status = getLineStatus(line, apiInfo);
        var maxDelay = getMaxDelay(line, apiInfo);
        var interval = getDelayInterval(line, apiInfo);
        var cause = getDelayCause(line, apiInfo);

        var statusText = window.t ? (status === "suspended" ? window.t("status.suspended") : (status === "delayed" ? window.t("status.delayed") : window.t("status.normal"))) : (status === "suspended" ? "运休" : (status === "delayed" ? "延误" : "正常"));
        var statusClass = status === "suspended" ? "rs-status-suspended" : (status === "delayed" ? "rs-status-delayed" : "rs-status-normal");
        var statusIcon = status === "suspended" ? "⊗" : (status === "delayed" ? "△" : "○");

        var body = modal.querySelector(".rs-modal-body");
        var title = modal.querySelector(".rs-modal-title");
        title.textContent = line.name;

        var html = "";

        // 1. 运行状态 - 大区块显示
        html += '<div class="rs-status-section ' + statusClass + '">';
        html += '<div class="rs-status-main">';
        html += '<span class="rs-status-icon-lg ' + statusClass + '">' + statusIcon + '</span>';
        html += '<div class="rs-status-text">' + statusText + '</div>';
        if (maxDelay > 0) {
            html += '<div class="rs-delay-info">最大延误 +' + maxDelay + '分</div>';
        }
        html += '</div></div>';

        // 2. 区间信息
        html += '<div class="rs-info-card rs-interval-card">';
        html += '<div class="rs-card-label">区间信息</div>';
        html += '<div class="rs-card-value">';
        if (!interval || status === "normal") {
            html += '<span class="rs-normal-badge">全线正常运行</span>';
        } else {
            var parts = interval.split("→");
            if (parts.length >= 2) {
                html += '<span class="rs-station">' + escapeHtml(parts[0]) + '</span>';
                html += '<span class="rs-arrow">→</span>';
                html += '<span class="rs-station">' + escapeHtml(parts[1]) + '</span>';
            } else {
                html += '<span class="rs-station">' + escapeHtml(interval) + '</span>';
            }
        }
        html += '</div></div>';

        // 3. 延误原因
        html += '<div class="rs-info-card rs-cause-card">';
        html += '<div class="rs-card-label">延误原因</div>';
        html += '<div class="rs-card-value rs-cause-value">';
        if (cause && status !== "normal") {
            html += escapeHtml(cause);
        } else {
            html += '<span class="rs-normal-text">无</span>';
        }
        html += '</div></div>';

        body.innerHTML = html;
        modal.classList.add("active");
        document.body.classList.add("modal-open");
    }'''

if old_modal in content:
    content = content.replace(old_modal, new_modal)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Modal updated successfully')
else:
    print('Old modal not found')
    # Debug
    idx = content.find('function openModal')
    if idx != -1:
        print('Found at index:', idx)
        print('Context:', repr(content[idx:idx+200]))
