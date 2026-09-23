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

  var MODULE_VERSION = "4.3.964";

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

  // ODPT record -> 该线路专属 text（含 odpt:railway 匹配）；无专属则聚合全网（不误报正常）
  function pickText(records, line) {
    if (!records || records.length === 0) return null;
    var code = line && line.id ? line.id : "";
    if (window.ODPTClient && window.ODPTClient.LINE_RAILWAY_CODE && line && line.id &&
        window.ODPTClient.LINE_RAILWAY_CODE[line.id]) {
      code = window.ODPTClient.LINE_RAILWAY_CODE[line.id];
    }
    function shortOf(rec) {
      try {
        var rw = (rec && rec["odpt:railway"]) || "";
        if (!rw) return "";
        var parts = String(rw).split(":");
        if (parts.length < 2) return "";
        var dots = parts[parts.length - 1].split(".");
        return dots[dots.length - 1] || "";
      } catch (e) { return ""; }
    }
    // ① 有 odpt:railway 的记录专属其线（A 线报文不得显示到 B 线弹窗）
    var own = null;
    for (var i = 0; i < records.length; i++) {
      if (!records[i]) continue;
      if (shortOf(records[i]).toLowerCase() === String(code).toLowerCase()) { own = records[i]; break; }
    }
    // ② 全网/多线报文聚合（无 railway 归属），取最严重状态
    var worst = null;
    var rank = { suspended: 3, delayed: 2, normal: 1 };
    for (var j = 0; j < records.length; j++) {
      if (!records[j]) continue;
      if (shortOf(records[j])) continue;
      var st = parseStatus(records[j]);
      if (!worst || (rank[st] || 0) > (rank[worst.st] || 0)) worst = { rec: records[j], st: st };
    }
    var chosen = own || (worst ? worst.rec : null);
    if (!chosen) return null;
    return String(chosen["odpt:text"] || "");
  }

  // ODPT record -> 概览状态（结构化字段优先）
  function parseStatus(rec) {
    try {
      if (rec && rec["odpt:suspension"] === true) return "suspended";
      if (rec && rec["odpt:delay"] === true) return "delayed";
      var txt = String((rec && rec["odpt:text"]) || "");
      if (/\u904b\u8ee2\u898b\u5408\u308f\u305b|\u904b\u8ee2\u3092\u4e2d\u6b62|\u904b\u4f11/.test(txt)) return "suspended";
      if (/\u9045\u5ef6/.test(txt)) return "delayed";
      return "normal";
    } catch (e) { return "normal"; }
  }

  // ========== 统一查询 API ==========
  // query(lineId, line) -> Promise<{status, text, links[], updatedAt, source} | null>
  function query(lineId, line) {
    var lineObj = line || (window.DataLayer && window.DataLayer.getLine ? window.DataLayer.getLine(lineId) : null)
      || (window.UNIFIED_LINES && window.UNIFIED_LINES[lineId]) || null;

    // ① 官网网页源（千叶/湘南——ODPT 无数据）
    if (window.WebRunInfo && window.WebRunInfo.isWebLine && window.WebRunInfo.isWebLine(lineId)) {
      try {
        var w = window.WebRunInfo.getDelayInfo(lineId, lineObj);
        if (w && (w.detail || w.cause)) {
          var rawText = w.detail || w.cause || "";
          var ex = extractLinks(rawText);
          return Promise.resolve({
            status: w.status || "normal",
            text: ex.cleanText,
            links: ex.links,
            updatedAt: w.updatedAt || null,
            source: w.source || "web"
          });
        }
        return Promise.resolve({ status: "no_data", text: "", links: [], updatedAt: null, source: null });
      } catch (e) { return Promise.resolve(null); }
    }

    // ② ODPT 官方接口（TrainInformation）
    var op = getOperator(lineObj);
    if (op) {
      return fetchODPT(op).then(function(records) {
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
    }

    // ③ 本地兜底
    return Promise.resolve(localFallback(lineId, lineObj));
  }

  function aggregateStatus(records, line) {
    if (!records || records.length === 0) return null;
    var rank = { suspended: 3, delayed: 2, normal: 1 };
    var worst = null;
    for (var i = 0; i < records.length; i++) {
      var st = parseStatus(records[i]);
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
    extractLinks: extractLinks,
    isWebLine: function(lineId) {
      return !!(window.WebRunInfo && window.WebRunInfo.isWebLine && window.WebRunInfo.isWebLine(lineId));
    }
  };
})();
