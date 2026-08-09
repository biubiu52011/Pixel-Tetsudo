/*
 * 观光数据模块 - 直接使用 line-control.js 数据
 */
(function() {
  "use strict";
  const REFRESH_INTERVAL = 30000;
  
  
  // 格式化时间
  function formatTime(minutes) {
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    return h + ':' + (m < 10 ? '0' : '') + m;
  }
  
  // 获取线路状态
  function getLineStatus(line) {
    if (!line || !line.delayInfo) return "normal";
    if (line.delayInfo.suspended === true) return "suspended";
    if (line.delayInfo.trains && line.delayInfo.trains.length > 0) return "delayed";
    return "normal";
  }
  
  // 获取状态图标?
  function getStatusIcon(status) {
    if (status === "suspended") {
      return '<span class="rs-status-icon rs-status-icon-suspended" title="?停?行">×</span>';
    }
    if (status === "delayed") {
      return '<span class="rs-status-icon rs-status-icon-delayed" title="部分延?">△</span>';
    }
    return '<span class="rs-status-icon rs-status-icon-normal" title="正常?行">○</span>';
  }
  
  function openModal(lineId, linesData) {
    var line = linesData[lineId];
    if (!line) return;
    var modal = document.getElementById("lineDetailModal");
    if (!modal) return;
    modal.querySelector(".rs-modal-title").textContent = line.name;
    var body = modal.querySelector(".rs-modal-body");
    
    var html = '';
    
    // 1. ?行状?
    var delayInfo = line.delayInfo;
    var status = getLineStatus(line);
    var hasDelay = status !== "normal";
    var statusClass = status === "suspended" ? "rs-status-suspended" : (hasDelay ? "rs-status-delayed" : "rs-status-normal");
    var statusText = status === "suspended" ? "?停?行" : (hasDelay ? "部分延?" : "正常?行");
    html += '<div class="rs-status-section ' + statusClass + '">';
    html += '<span class="rs-status-indicator"><span style="background:var(--' + (status === "suspended" ? 'red' : (hasDelay ? 'orange' : 'green')) + ')"></span>' + statusText + '</span>';
    html += '</div>';
    
    // 2. 区?信息
    if (delayInfo && delayInfo.interval) {
      html += '<div class="rs-interval-section">';
      html += '<div class="rs-interval-header"><span class="rs-info-label">延?区?</span></div>';
      html += '<div class="rs-interval-stations">';
      var intervalParts = delayInfo.interval.split("→");
      html += '<span class="rs-station-start">' + escapeHtml(intervalParts[0]) + '</span>';
      html += '<span class="rs-interval-arrow">→</span>';
      html += '<span class="rs-station-end">' + escapeHtml(intervalParts[1]) + '</span>';
      html += '</div></div>';
    }
    
    // 3. 原因
    if (delayInfo && delayInfo.cause) {
      html += '<div class="rs-cause-section">';
      html += '<div class="rs-section-title">延?原因</div>';
      html += '<div class="rs-cause-text">' + escapeHtml(delayInfo.cause) + '</div>';
      html += '</div>';
    }
    
    // 列?信息
    var trains = window.TRAINS && window.TRAINS[lineId] ? window.TRAINS[lineId] : [];
    if (trains.length > 0) {
      html += '<div class="rs-trains-section">';
      html += '<div class="rs-section-title">?行列? (' + trains.length + '列)</div>';
      html += '<div class="rs-trains-list">';
      
      trains.forEach(function(train) {
        html += '<div class="rs-train-item' + (train.delay > 0 ? ' rs-train-delayed' : '') + '">';
        html += '<div class="rs-train-header">';
        html += '<span class="rs-train-id">' + escapeHtml(train.id) + '</span>';
        html += '<span class="rs-train-type">' + escapeHtml(train.type) + '</span>';
        if (train.delay > 0) {
          html += '<span class="rs-train-delay">+' + train.delay + '分</span>';
        }
        html += '</div>';
        html += '<div class="rs-train-detail">';
        html += '<span class="rs-train-dest">→ ' + escapeHtml(train.destination) + '</span>';
        html += '<span class="rs-train-cars">' + train.cars + '?</span>';
        html += '<span class="rs-train-depart">' + formatTime(train.departAt) + '</span>';
        html += '</div></div>';
      });
      
      html += '</div></div>';
    }
    
    body.innerHTML = html;
    modal.classList.add("active");
    document.body.classList.add("modal-open");
  }
  
  function closeModal() {
    var modal = document.getElementById("lineDetailModal");
    if (!modal) return;
    modal.classList.remove("active");
    document.body.classList.remove("modal-open");
  }
  
  function groupByOperator(linesData) {
    var groups = {};
    Object.keys(linesData).forEach(function(id) {
      var line = linesData[id];
      var op = line.operator || "其他";
      if (!groups[op]) groups[op] = [];
      groups[op].push({id: id, line: line});
    });
    return groups;
  }
  
  function renderCard(line, lineId) {
    var iconHtml = line.image
      ? '<img src="' + escapeHtml(line.image) + '" alt="' + escapeHtml(line.code) + '" class="rs-line-icon">'
      : '<div class="rs-code-badge" style="background:' + (line.color || "#999") + ';">' + escapeHtml(line.code) + '</div>';
    var status = getLineStatus(line);
    return '<div class="rs-line-card" data-line="' + escapeHtml(lineId) + '"><div class="rs-line-header">' + iconHtml
      + '<div class="rs-line-info"><div class="rs-line-name">' + escapeHtml(line.name) + '</div>'
      + '<div class="rs-line-interval">' + escapeHtml((line.delayInfo && line.delayInfo.interval && status !== 'normal') ? line.delayInfo.interval : '全?') + '</div></div>'
      + getStatusIcon(status) + '</div></div>';
  }
  
  function render(container, linesData) {
    if (!container) return;
    var groups = groupByOperator(linesData);
    container.innerHTML = Object.keys(groups)
      .sort()
      .map(function(op) {
        return '<div class="rs-operator-group"><div class="rs-operator-title">' + escapeHtml(op) + '</div>'
          + '<div class="rs-cards-container">' + groups[op].map(function(item) { return renderCard(item.line, item.id); }).join("") + '</div></div>';
      }).join("");
    container.onclick = function(e) {
      var card = e.target.closest(".rs-line-card");
      if (card) openModal(card.dataset.line, linesData);
    };
    var modal = document.getElementById("lineDetailModal");
    if (modal) {
      modal.querySelector(".rs-modal-close").onclick = closeModal;
      modal.onclick = function(e) {
        if (e.target === modal) closeModal();
      };
      document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") closeModal();
      });
    }
  }
  
  function init() {
    var container = document.getElementById("realtimeStatusContainer");
    if (!container) return;
    if (!window.UNIFIED_LINES || !Object.keys(window.UNIFIED_LINES).length) {
      container.innerHTML = '<div class="rs-error">数据未加?</div>';
      return;
    }
    render(container, window.UNIFIED_LINES);
  }
  
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
