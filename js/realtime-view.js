/*
 * Pixel Tetsudo - Realtime View
 * Line Status View
 */
(function() {
  "use strict";

  const t = window.t || ((k) => k);
  const tLine = (code) => (window.tLine ? window.tLine(code) : code) || code;
  const tOp = (name) => (window.tOp ? window.tOp(name) : name) || name;
  const tStation = (name) => (window.tStation ? window.tStation(name) : name) || name;

  // -- Status helpers --
  const STATUS_META = {
    normal:  { icon: "\u25cb", cls: "rs-status-icon-normal",  color: "green"  },
    delayed: { icon: "\u25b3", cls: "rs-status-icon-delayed", color: "orange" },
    suspended: { icon: "\u2717", cls: "rs-status-icon-suspended", color: "red" },
  };

  function getLineStatus(line) {
    return line.delayInfo?.status || "normal";
  }

  function getStatusIcon(status) {
    const s = STATUS_META[status] || STATUS_META.normal;
    return `<span class="rs-status-icon ${s.cls}">${s.icon}</span>`;
  }

  function clearSelectedCards() {
    document.querySelectorAll(".rs-line-card.selected").forEach((c) => c.classList.remove("selected"));
  }

  // -- Card rendering --
  function renderCard(line, lineId) {
    const status = getLineStatus(line);
    const interval = line.delayInfo?.interval || "";
    const lineColor = line.color || "#00b643";
    const displayName = tLine(line.id) || line.name || lineId;
    const iconHtml = line.image
      ? (line.image.indexOf("JRグループ.png") >= 0 ? `<div class="rs-line-icon-fallback" style="background:${line.color}"><img class="rs-line-icon" src="${escapeHtml(line.image)}" alt=""></div>` : `<img class="rs-line-icon" src="${escapeHtml(line.image)}" alt="">`)
      : `<div class="rs-code-badge">${escapeHtml(line.code)}</div>`;

    return `<div class="rs-line-card" data-line="${escapeHtml(lineId)}" style="--line-color:${escapeHtml(lineColor)}">
      <div class="rs-line-header">
        ${iconHtml}
        <div class="rs-line-info">
          <div class="rs-line-name">${escapeHtml(displayName)}</div>
          <div class="rs-line-interval">${escapeHtml(interval)}</div>
        </div>
        ${getStatusIcon(status)}
      </div>
    </div>`;
  }

  // -- Main render --
  function render(container, fusedData) {
    if (!container || !fusedData?.lines) {
      console.warn("[RealtimeView] Missing data:", { container: !!container, hasFusedData: !!fusedData, hasLines: !!(fusedData?.lines) });
      return;
    }

    const groups = Object.values(fusedData.lines).reduce((acc, line) => {
      const op = tOp(line.operator || "Unknown");
      (acc[op] ??= []).push({ id: line.id, line });
      return acc;
    }, Object.create(null));

    container.innerHTML = Object.keys(groups).sort().map((op) => `
      <div class="rs-operator-group">
        <div class="rs-operator-title">${escapeHtml(op)}</div>
        <div class="rs-cards-container">
          ${groups[op].map(({ line, id }) => renderCard(line, id)).join("")}
        </div>
      </div>
    `).join("");
  }

  // -- Modal --
  function openModal(lineId, fusedData) {
    const modal = document.getElementById("lineDetailModal");
    if (!modal || !fusedData?.lines?.[lineId]) return;

    const line = fusedData.lines[lineId];
    const status = getLineStatus(line);
    const interval = line.delayInfo?.interval;
    const cause = line.delayInfo?.cause;
    const s = STATUS_META[status] || STATUS_META.normal;
    const statusText = t(`status.${status}`);

    const titleEl = modal.querySelector(".rs-modal-title");
    const bodyEl = modal.querySelector(".rs-modal-body");

    titleEl.textContent = tLine(line.id) || line.name;

    let intervalHtml;
    if (!interval || status === "normal") {
      intervalHtml = `<span class="rs-station-text">${t("status.all_lines")}</span>`;
    } else {
      const parts = interval.split("→");
      intervalHtml = parts.length >= 2
        ? `<span class="rs-station-start">${escapeHtml(tStation(parts[0]))}</span>
           <span class="rs-interval-arrow">→</span>
           <span class="rs-station-end">${escapeHtml(tStation(parts[1]))}</span>`
        : `<span class="rs-station-text">${escapeHtml(interval)}</span>`;
    }

    const causeHtml = cause && status !== "normal"
      ? escapeHtml(cause)
      : `<span style="color:var(--text-muted)">${t("status.none")}</span>`;

    bodyEl.innerHTML = `
      <div class="rs-status-section rs-status-${status}">
        <span class="rs-status-indicator">
          <span style="background:var(--${s.color})"></span>${statusText}
        </span>
      </div>
      <div class="rs-interval-section">
        <div class="rs-info-label">${t("status.interval")}</div>
        <div class="rs-interval-stations">${intervalHtml}</div>
      </div>
      <div class="rs-cause-section">
        <div class="rs-section-title">${t("status.delay_cause")}</div>
        <div class="rs-cause-text">${causeHtml}</div>
      </div>
    `;

    modal.classList.add("active");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    const modal = document.getElementById("lineDetailModal");
    if (!modal) return;
    modal.classList.remove("active");
    document.body.classList.remove("modal-open");
  }

  // -- Init --
  let _latestFusedData = null;

  function init() {
    const container = document.getElementById("realtimeStatusContainer");
    if (!container) return;

    if (!window.DataFusion) {
      container.innerHTML = `<div class="rs-error">${t("status.load_error")}</div>`;
      console.error("[RealtimeView] DataFusion not available");
      return;
    }

    // Fallback: try loading cached data from IndexedDB
    if (window.RailwayRTC) {
      window.RailwayRTC.loadDelayInfo().then(function(delayInfo) {
        if (delayInfo && Object.keys(delayInfo).length > 0 && window.UNIFIED_LINES) {
          const cachedData = { version: 0, timestamp: new Date().toISOString(), lines: {}, lineOrder: [], odptOperatorsLoaded: 0, totalLines: Object.keys(window.UNIFIED_LINES).length };
          Object.keys(window.UNIFIED_LINES).forEach(function(lid) {
            const line = window.UNIFIED_LINES[lid];
            const delay = delayInfo[lid] || { status: "normal", maxDelay: 0, interval: null, cause: null };
            cachedData.lines[lid] = Object.assign({}, line, { delayInfo: delay });
          });
          _latestFusedData = cachedData;
          try { render(container, cachedData); }
          catch (e) { console.error("[RealtimeView] Cache render error:", e.message); }
          console.log("[RealtimeView] Loaded cached delay info for " + Object.keys(delayInfo).length + " lines");
        }
      }).catch(function(e) { console.warn("[RealtimeView] Cache load error:", e.message); });
    }

    window.DataFusion.subscribe((fusedData) => {
      _latestFusedData = fusedData;
      try { render(container, fusedData); }
      catch (e) { console.error("[RealtimeView] Render error:", e.message); }
    });

    // Card click -> open modal
    container.addEventListener("click", (e) => {
      const card = e.target.closest(".rs-line-card");
      if (!card || !_latestFusedData) return;
      clearSelectedCards();
      card.classList.add("selected");
      openModal(card.dataset.line, _latestFusedData);
    });

    // Modal close handlers
    const modal = document.getElementById("lineDetailModal");
    if (modal) {
      modal.querySelector(".rs-modal-close").addEventListener("click", () => {
        closeModal();
        clearSelectedCards();
      });
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          closeModal();
          clearSelectedCards();
        }
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          closeModal();
          clearSelectedCards();
        }
      });
    }

    // Language change -> re-render
    if (typeof window.onLanguageChange === "function") {
      window.onLanguageChange(() => {
        const data = window.DataFusion.getFusedData();
        if (data) render(container, data);
        if (modal?.classList.contains("active") && _latestFusedData) {
          const selected = document.querySelector(".rs-line-card.selected");
          if (selected) openModal(selected.dataset.line, _latestFusedData);
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
