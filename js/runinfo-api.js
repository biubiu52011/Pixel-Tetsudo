/*
 * Pixel Tetsudo - RunInfo API (v4.3.964)
 * 运行情报统一查询 API：嫁接官方数据接口并只对外提供文字。
 *
 * 数据源优先级（按线路自动路由）：
 *   ① ODPT 官方接口 odpt:TrainInformation（ODPTClient.getTrainInformation，覆盖 16 运营商）
 *   ② 官网网页源（WebRunInfo，千葉都市モノレール / 湘南モノレール——ODPT 实测无数据）
 *   ③ 本地兜底（线路自带 status/interval/cause）
 *   ④ null（无任何源）
 *
 * 输出契约（只展示文字）：
 *   { status, text, links[], updatedAt, source }
 *   - text   : 官方原文全文（ODPT odpt:text / 官网原文），不碎片化解析
 *   - links[]: 从原文提取出的 URL 列表（正文不再平铺 URL，渲染为可点击链接）
 *   - status : 概览用状态词（normal/info/delayed/suspended/no_data），仅作兜底与卡片图标
 */
(function() {
  "use strict";

  var MODULE_VERSION = "4.3.969"; // v4.3.969: 官网网页源不再对外返回 URL 链接行

  // ========== URL 提取 ==========
  // 从原文中提取 https:// 链接，正文保留纯文字。返回 { cleanText, links[] }
  function extractLinks(text) {
    if (!text) return { cleanText: (text || ""), links: [] };
    var links = [];
    var seen = {};
    var clean = String(text).replace(/\(?\s*(https?:\/\/[^\s\u3000\u3001\u3002\uff08\uff09<>"'\\]+)\s*\)?/g, function(m, u) {
      // 去掉结尾的标点噪声（URL 后紧跟的句号/括号等）
      u = u.replace(/[)）,，。.;；]+$/, "");
      if (u && !seen[u]) { seen[u] = true; links.push(u); }
      return "";
    });
    // 清理提取后残留的空白
    clean = clean.replace(/[ \t]+/g, " ").replace(/ ?\n ?/g, "\n").replace(/\n{2,}/g, "\n").trim();
    return { cleanText: clean, links: links };
  }

  // ========== 数据源路由 ==========
  function getOperator(line) {
    if (!line) return null;
    if (line.operator) return line.operator;
    return null;
  }

  // ODPT 官方接口：operator -> Promise<records[]>
  function fetchODPT(operator) {
    if (!operator) return Promise.resolve([]);
    if (!window.ODPTClient || typeof window.ODPTClient.getTrainInformation !== "function") return Promise.resolve([]);
    try {
      return window.ODPTClient.getTrainInformation(operator).catch(function() { return []; });
    } catch (e) { return Promise.resolve([]); }
  }

  // Select only records that are allowed to affect this line.
  // Railway-specific records win; no-railway records are operator/global fallback only.
  function selectScopedRecords(records, line) {
    if (!records || records.length === 0) return [];
    var code = line && line.id ? line.id : "";
    if (window.ODPTClient && window.ODPTClient.LINE_RAILWAY_CODE && line && line.id &&
        window.ODPTClient.LINE_RAILWAY_CODE[line.id]) code = window.ODPTClient.LINE_RAILWAY_CODE[line.id];
    function shortOf(rec) {
      try {
        var rw = (rec && rec["odpt:railway"]) || "";
        if (!rw) return "";
        var parts = String(rw).split(":");
        var dots = parts[parts.length - 1].split(".");
        return dots[dots.length - 1] || "";
      } catch (e) { return ""; }
    }
    var own = records.filter(function(rec) {
      return rec && shortOf(rec).toLowerCase() === String(code).toLowerCase();
    });
    if (own.length) return own;
    return records.filter(function(rec) { return rec && !shortOf(rec); });
  }

  function recordText(rec) {
    if (!rec) return "";
    var v = rec["odpt:trainInformationText"] || rec["odpt:text"] || "";
    if (typeof v === "string") return v;
    if (v && typeof v === "object") return String(v.ja || v["ja-Hrkt"] || v.en || v["zh-Hans"] || v["zh-Hant"] || v.ko || "");
    return "";
  }

  function pickText(records, line) {
    var scoped = selectScopedRecords(records, line);
    if (!scoped.length) return null;
    var rank = { suspended: 5, delayed: 4, notice: 3, info: 2, normal: 1, unknown: 0 };
    var chosen = null, chosenRank = -1;
    scoped.forEach(function(rec) {
      var text = recordText(rec);
      if (!text) return;
      var st = parseStatus(rec);
      var rr = rank[st] == null ? 0 : rank[st];
      if (!chosen || rr > chosenRank) { chosen = rec; chosenRank = rr; }
    });
    return chosen ? recordText(chosen) : null;
  }

  // ODPT record -> 概览状态（统一 Evidence Evaluator）
  function parseStatus(rec) {
    if (!rec) return "unknown";
    if (window.RunInfoEvaluator) {
      var ti = rec["odpt:trainInformationText"] || rec["odpt:text"] || "";
      return window.RunInfoEvaluator.evaluate({
        source: "odpt",
        structuredStatus: rec["odpt:trainInformationStatus"],
        suspension: rec["odpt:suspension"] === true,
        delay: rec["odpt:delay"] === true,
        delayMinutes: (typeof rec["odpt:delay"] === "number") ? rec["odpt:delay"] : null,
        text: ti
      }).status;
    }
    return "info";
  }

  // ========== 统一查询 API ==========
  // query(lineId, line) -> Promise<{status, text, links[], updatedAt, source} | null>
  var _cache = {};          // lineId -> { t: timestamp, r: result }
  var CACHE_TTL_MS = 5 * 60 * 1000; // 5 分钟内存缓存（避免每次弹窗重复请求官方接口/官网）

  // v4.3.968: 弹窗统一操作区——通用手动覆盖（任意线路可用；持久化与 WebRunInfo 手动缓存分离）
  var _manualOverride = {};  // lineId -> { text, status, updatedAt }

  function setManualOverride(lineId, text) {
    if (!lineId || !text) return null;
    _manualOverride[lineId] = { text: String(text), status: "notice", updatedAt: Date.now() };
    invalidate(lineId);
    try { document.dispatchEvent(new CustomEvent("pt-runinfo-updated", { detail: { lineId: lineId } })); } catch(e) {}
    return _manualOverride[lineId];
  }

  function getManualOverride(lineId) {
    return lineId ? _manualOverride[lineId] : null;
  }

  function query(lineId, line) {
    var lineObj = line || (window.DataLayer && window.DataLayer.getLine ? window.DataLayer.getLine(lineId) : null)
      || (window.UNIFIED_LINES && window.UNIFIED_LINES[lineId]) || null;
    // v4.3.968: 统一弹窗操作区——手动覆盖对所有线路一致；覆盖后仍走同一 query 输出契约
    var _ov = getManualOverride(lineId);
    if (_ov) {
      var _ovEx = extractLinks(_ov.text);
      return Promise.resolve({
        status: _ov.status || "notice",
        text: _ovEx.cleanText,
        links: _ovEx.links,
        updatedAt: _ov.updatedAt || null,
        source: "manual"
      });
    }

    // 缓存命中（5 分钟内直接返回同一结果，降低 ODPT 请求量防 429）
    var cached = _cache[lineId];
    if (cached && (Date.now() - cached.t) < CACHE_TTL_MS) {
      return Promise.resolve(cached.r);
    }

    var p;
    // ① 官网网页源（千叶/湘南——ODPT 无数据）
    if (window.WebRunInfo && window.WebRunInfo.isWebLine && window.WebRunInfo.isWebLine(lineId)) {
      try {
        var w = window.WebRunInfo.getDelayInfo(lineId, lineObj);
        if (w && (w.detail || w.cause)) {
          var rawText = w.detail || w.cause || "";
          var ex = extractLinks(rawText);
          p = Promise.resolve({
            status: w.status || "normal",
            text: ex.cleanText,
            links: [],
            updatedAt: w.updatedAt || null,
            source: w.source || "web"
          });
        } else {
          p = Promise.resolve({ status: "no_data", text: "", links: [], updatedAt: null, source: null });
        }
      } catch (e) { p = Promise.resolve(null); }
    } else {
      // ② ODPT 官方接口（TrainInformation）
      var op = getOperator(lineObj);
      if (op) {
        p = fetchODPT(op).then(function(records) {
          var text = pickText(records, lineObj);
          if (text) {
            var ex = extractLinks(text);
            return {
              status: aggregateStatus(records, lineObj) || "normal",
              text: ex.cleanText,
              links: ex.links,
              updatedAt: Date.now(),
              source: "odpt"
            };
          }
          // ODPT 无该线路报文 → 降级③
          return localFallback(lineId, lineObj);
        });
      } else {
        // ③ 本地兜底
        p = Promise.resolve(localFallback(lineId, lineObj));
      }
    }

    // 写缓存（null 也缓存，避免无数据线路反复请求）
    return p.then(function(r) {
      try { _cache[lineId] = { t: Date.now(), r: r }; } catch(e) {}
      return r;
    });
  }

  // 供手动刷新：清除某线路缓存（WebRunInfo 手动更新后调用，让弹窗重新 query）
  function invalidate(lineId) {
    if (lineId) { delete _cache[lineId]; }
    else { _cache = {}; }
  }

  function aggregateStatus(records, line) {
    var scoped = selectScopedRecords(records, line);
    if (!scoped.length) return null;
    var rank = { suspended: 5, delayed: 4, notice: 3, info: 2, normal: 1, unknown: 0 };
    var worst = null;
    for (var i = 0; i < scoped.length; i++) {
      var st = parseStatus(scoped[i]);
      if (!worst || (rank[st] || 0) > (rank[worst] || 0)) worst = st;
    }
    return worst;
  }

  function localFallback(lineId, lineObj) {
    try {
      if (lineObj && lineObj.delayInfo) {
        var d = lineObj.delayInfo;
        var raw = d.detail || d.cause || "";
        var ex = extractLinks(raw);
        return { status: d.status || "normal", text: ex.cleanText, links: ex.links, updatedAt: d.updatedAt || null, source: d.source || "local" };
      }
      if (lineObj && lineObj.status) {
        var raw2 = lineObj.cause || "";
        var ex2 = extractLinks(raw2);
        return { status: lineObj.status, text: ex2.cleanText, links: ex2.links, updatedAt: null, source: "local" };
      }
    } catch (e) {}
    return null;
  }

  // ========== 对外 API ==========
  window.RunInfoAPI = {
    version: MODULE_VERSION,
    query: query,
    invalidate: invalidate,
    extractLinks: extractLinks,
    // v4.3.968: 统一弹窗操作区的手动输入入口（ODPT/官网线路同一行为）
    setManualOverride: setManualOverride,
    getManualOverride: getManualOverride,
    isWebLine: function(lineId) {
      return !!(window.WebRunInfo && window.WebRunInfo.isWebLine && window.WebRunInfo.isWebLine(lineId));
    }
  };
})();
