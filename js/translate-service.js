/*
 * Translate Service (4.3.443)
 * ------------------------------------------------------------------
 * 无需注册的翻译 Provider：将 ODPT 运行情报等日文动态文本翻译为当前界面语言。
 * 经本地 serve.py /api-proxy/translate 端点转发（MyMemory 主力 + Google gtx 兜底，
 * 两者均无需注册 key；服务端有 7 天文本缓存，避免 30s 自动刷新烧免费额度）。
 *
 * 设计边界：
 * - 只翻译"动态日文文本"（运行情报正文/原因/文本兜底区间），不碰站名/线路名
 *   （那些由 RailwayDB/LOS i18n 数据层负责，禁止二次翻译导致站名被改写）。
 * - ja 界面永远返回原文；翻译失败/离线回退原文（现状不受影响）。
 * - 同文本+语言结果在客户端二级缓存，语言切换即时生效。
 *
 * Provider: window.TranslateService
 * Consumers: realtime-view（弹窗正文/原因/区间概览）
 * ------------------------------------------------------------------
 */
(function () {
  "use strict";

  var _cache = {};    // lang|text -> translated
  var _inflight = {}; // lang|text -> Promise

  function translate(text, lang) {
    lang = lang || window.currentLang || "ja";
    if (!text || !String(text).trim() || lang === "ja") return Promise.resolve(text);
    var key = lang + "|" + text;
    if (_cache[key]) return Promise.resolve(_cache[key]);
    if (_inflight[key]) return _inflight[key];
    var p;
    try {
      p = fetch("/api-proxy/translate?lang=" + encodeURIComponent(lang) + "&text=" + encodeURIComponent(text))
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j && j.ok && j.translated) { _cache[key] = j.translated; return j.translated; }
          return text; // 失败回退原文
        })
        .catch(function () { return text; });
    } catch (e) {
      return Promise.resolve(text);
    }
    _inflight[key] = p;
    p.then(function () { delete _inflight[key]; }, function () { delete _inflight[key]; });
    return p;
  }

  // 异步翻译并更新 DOM 元素（仅当元素文本未被后续渲染改动时写入）
  function applyToElement(el, originalText, lang) {
    if (!el) return;
    translate(originalText, lang).then(function (tr) {
      if (el && el.textContent === originalText) el.textContent = tr;
    });
  }

  window.TranslateService = {
    translate: translate,
    applyToElement: applyToElement
  };
})();
