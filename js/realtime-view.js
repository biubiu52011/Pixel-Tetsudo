/*
 * Pixel Tetsudo - Realtime View
 * 直接读取 RAILWAY_DATA，无需 DataFusion 依赖
 */
(function() {
  "use strict";

  const t = window.t || ((k) => k);
  const tLine = (code) => (window.tLine ? window.tLine(code) : code) || code;
  const tOp = (name) => (window.tOp ? window.tOp(name) : name) || name;
  const tStation = (name) => (window.tStation ? window.tStation(name) : name) || name;


  // STATUS_META is defined in data-state.js; use window.DataState.STATUS_META
  const STATUS_META = {
    normal:    { icon: "\u25cb", color: "green"  },
    delayed:   { icon: "\u25b3", color: "orange" },
    suspended: { icon: "\u00d7", color: "red"  },
    no_data:   { icon: "\u25cc", color: "gray"   },
  };

  function getDelayInfo(line) {
    if (line.delayInfo) return line.delayInfo;
    if (line.status) return { status: line.status, interval: line.interval, cause: line.cause };
    return null;
  }

  function clearSelectedCards() {
    document.querySelectorAll(".rs-line-card.selected").forEach(function(c) { c.classList.remove("selected"); });
  }

  function renderLineCard(line, lineId) {
    return window.DataState.renderCard(line, lineId, { mode: "realtime" });
  }

  function renderLinesList(container, linesObj, lineOrderArr) {
    window.DataState.renderList(container, linesObj, { mode: "realtime", lineOrder: lineOrderArr });
  }

  function openModal(lineId, linesObj) {
    var modal = document.getElementById("lineDetailModal");
    if (!modal || !linesObj || !linesObj[lineId]) return;
    var line = linesObj[lineId];
    var delayInfo = getDelayInfo(line) || {};
    // Use window.DataState.getStatus for consistent NO_DATA handling
    var status = delayInfo && delayInfo.status ? delayInfo.status : (delayInfo ? "normal" : "no_data");
    var interval = delayInfo.interval || "";
    var cause = delayInfo.cause || "";
    var s = window.DataState ? (window.DataState && window.DataState.STATUS_META && window.DataState.STATUS_META[status]) || STATUS_META[status] : STATUS_META[status] || STATUS_META.no_data;
    var statusText = t("status." + status) || status;
    // Title
    modal.querySelector(".rs-modal-title").textContent = window.RailwayDB && window.RailwayDB.resolveLineName ? window.RailwayDB.resolveLineName(line.id, window.currentLang) : line.id || tLine(line.id) || line.name;
    // Status section
    var statusSection = modal.querySelector(".rs-status-section");
    statusSection.className = "rs-status-section rs-status-" + status;
    // Hide non-essential sections when running normally
    var intervalSection = modal.querySelector(".rs-interval-section");
    var causeSection = modal.querySelector(".rs-cause-section");
    var updatedSection = modal.querySelector(".rs-updated-section");
      if (intervalSection) intervalSection.style.display = "none";
      if (causeSection) causeSection.style.display = "none";
      if (updatedSection) updatedSection.style.display = "none";
    } else {
      if (intervalSection) intervalSection.style.display = "";
      if (causeSection) causeSection.style.display = "";
      if (updatedSection) updatedSection.style.display = "";
    }
    statusSection.innerHTML = '<span class="rs-status-indicator"><span style="background:var(--' + s.color + ')"></span>' + statusText + '</span>';
    // Interval section
    var intervalSection = modal.querySelector(".rs-interval-section");
    intervalSection.querySelector(".rs-info-label").textContent = t("status.interval");
    var intervalHtml;
      intervalHtml = '<span class="rs-station-text">' + t("status.all_lines") + '</span>';
    } else {
      var parts = interval.split("\u2192");
        intervalHtml = '<span class="rs-station-start">' + escapeHtml(tStation(parts[0])) + '</span>'
          + '<span class="rs-interval-arrow">\u2192</span>'
          + '<span class="rs-station-end">' + escapeHtml(tStation(parts[1])) + '</span>';
      } else {
        intervalHtml = '<span class="rs-station-text">' + escapeHtml(interval) + '</span>';
      }
    }
    intervalSection.querySelector(".rs-interval-stations").innerHTML = intervalHtml;
    // Cause section
    var causeSection = modal.querySelector(".rs-cause-section");
    causeSection.querySelector(".rs-section-title").textContent = t("status.delay_cause");
    var causeHtml;
      causeHtml = '<span style="color:var(--text-muted)">' + t("status.no_data") + '</span>';
    } else if (cause) {
      causeHtml = escapeHtml(cause);
    } else {
      causeHtml = '<span style="color:var(--text-muted)">' + t("status.none") + '</span>';
    }
    causeSection.querySelector(".rs-cause-text").innerHTML = causeHtml;
    // Updated time section
    var updatedSection = modal.querySelector(".rs-updated-section");
    updatedSection.querySelector(".rs-info-label").textContent = t("status.updated");
    var fused = window.DataFusion ? window.DataFusion.getFusedData() : null;
    var updateTime = "";
      var d = new Date(fused.timestamp);
      updateTime = d.getHours().toString().padStart(2,"0") + ":" + d.getMinutes().toString().padStart(2,"0");
    } else if (status === "no_data") {
      updateTime = t("status.no_data");
    } else {
      updateTime = t("status.unknown");
    }
    updatedSection.querySelector(".rs-updated-time").textContent = updateTime;
    // Show modal
    modal.classList.add("active");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    var modal = document.getElementById("lineDetailModal");
    if (!modal) return;
    modal.classList.remove("active");
    document.body.classList.remove("modal-open");
  }

  let _latestLines = null;
  let _latestOrder = null;
  let _selectedOperator = null;


  function escapeHtml(s) {
    if (!s) return "";
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function renderFilterBar(linesObj) {
    var bar = document.getElementById("realtimeFilterBar");
    var toggleBtn = document.createElement("button");
    toggleBtn.className = "rs-filter-toggle";
    toggleBtn.textContent = t("filter.show_all") || "Show all operators";
      bar.classList.toggle("active");
    });
    bar.insertBefore(toggleBtn, bar.firstChild);
    bar.classList.add("rs-filter-collapsed");
    if (!bar || !linesObj) return;
    var ops = {};
      var line = linesObj[id];
      if (line && line.operator) ops[line.operator] = true;
    });
    var opList = Object.keys(ops).sort();
    var html = '<button class="rs-filter-btn' + (_selectedOperator === null ? ' active' : '') + '" data-operator="">';
    html += (typeof window.t === "function" && window.t("filter.all")) ? window.t("filter.all") : "All";
    html += "</button>";
      html += '<button class="rs-filter-btn' + (_selectedOperator === op ? ' active' : '') + '" data-operator="' + escapeHtml(op) + '">' + escapeHtml(tOp(op)) + "</button>";
    });
    bar.innerHTML = html;
        setFilter(this.dataset.operator || null);
      });
    });
  }

  function setFilter(operator) {
    _selectedOperator = operator;
      renderFiltered();
      renderFilterBar(_latestLines);
    }
  }

  function renderFiltered() {
    if (!_latestLines) return;
    var filtered = _latestLines;
      var f = {};
          f[id] = _latestLines[id];
        }
      });
      filtered = f;
    }
    var container = document.getElementById("realtimeStatusContainer");
    if (!container) return;
      container.innerHTML = '<div class="rs-empty">' + (typeof window.t === "function" ? window.t("status.no_lines") : "No lines") + "</div>";
      return;
    }
    window.DataState.renderList(container, filtered, { mode: "realtime", lineOrder: _latestOrder || [] });
  }

  function getLines() {
    const container = document.getElementById("realtimeStatusContainer");
    if (!container) return;

      window.DataState.renderList(container, linesObj, { mode: "realtime", lineOrder: lineOrderArr });
    }

      // Priority 1: DataFusion fused data (has delay info)
        var fused = window.DataFusion.getFusedData();
        if (fused && fused.lines && Object.keys(fused.lines).length > 0) return fused;
      }
      // Priority 2: DataLayer (RailwayDB-first) raw data, no delay info
      var dlLines = window.DataLayer ? window.DataLayer.getAllLines() : null;
        var dlDict = Array.isArray(dlLines) ? (function(){ var d={}; dlLines.forEach(function(l){ d[l.id||l.line_id]=l; }); return d; })() : dlLines;
          var lpsOrder = (window.LinePresentationService && dlDict) ? window.LinePresentationService.getDisplayOrder(dlDict) : Object.keys(dlDict);
          return { lines: dlDict, lineOrder: lpsOrder };
        }
      }
      // Priority 3: Direct UNIFIED_LINES compat fallback
        var lpsOrder = (window.LinePresentationService && window.UNIFIED_LINES) ? window.LinePresentationService.getDisplayOrder(window.UNIFIED_LINES) : []; return { lines: window.UNIFIED_LINES, lineOrder: lpsOrder };
      }
      return null;
    }

  function render(container) {
      var fused = getLines();
        container.innerHTML = '<div class="rs-loading"><div class="rs-loading-spinner"></div><span>' + t("status.loading") + '</span></div>';
        return;
      }
      _latestLines = fused.lines;
      _latestOrder = fused.lineOrder || [];
        renderLinesList(container, fused.lines, _latestOrder);
        renderFilterBar(fused.lines);
      } catch (e) {
        container.innerHTML = '<div class="rs-error">' + t('status.render_error') + '</div>';
      }
    }

  function init() {
    // Immediate check first
    render();

    // Poll for UNIFIED_LINES (handles async data loading)
    var _pollCount = 0;
      _pollCount++;
      var fused = getLines();
        clearInterval(_pollTimer);
        render();
      } else if (_pollCount > 20) {
        // After 6 seconds, give up polling
        clearInterval(_pollTimer);
          container.innerHTML = '<div class="rs-empty">' + t("status.load_error") + '</div>';
        }
      }
    }, 300);

    // Subscribe to DataFusion updates for live status
          render();
            renderFiltered();
            renderFilterBar(_latestLines);
          }
        }
      });
    }

    // Setup modal handlers
    var modal = document.getElementById('lineDetailModal');
      modal.querySelector('.rs-modal-close').addEventListener('click', closeModal);
        if (e.target === modal) closeModal();
      });
        if (e.key === 'Escape') closeModal();
      });
    }

    // Card click handler
      var card = e.target.closest('.rs-line-card');
        clearSelectedCards();
        card.classList.add('selected');
        openModal(card.dataset.line, _latestLines);
      }
    });
    }
    if (typeof window.onLanguageChange === "function") { window.onLanguageChange(function() { render(); if (_selectedOperator) renderFiltered(); }); }
  init();
})();