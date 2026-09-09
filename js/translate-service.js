/*
 * Translate Service (4.3.444)
 * ------------------------------------------------------------------
 * 无需注册的翻译 Provider：将 ODPT 运行情报等日文动态文本翻译为当前界面语言。
 *
 * 双路径策略（4.3.444，适配 GitHub Pages 线上环境）：
 * - 优先本地 serve.py /api-proxy/translate 代理（服务端 7 天缓存，本地环境零额外请求）
 * - 代理不可用时（GitHub Pages 纯静态托管无代理端点，返回 404）自动直连 MyMemory——
 *   MyMemory 公开 API 带 CORS 头（Access-Control-Allow-Origin: *），浏览器可直连，
 *   同样无需注册；直连结果进客户端缓存。
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

  var _LANG_TARGET = { zh: "zh-CN", ko: "ko", en: "en" };

  // 直连 MyMemory（CORS 允许；GitHub Pages 无本地代理时的 fallback）
  function _direct(text, lang) {
    var tgt = _LANG_TARGET[lang] || "zh-CN";
    try {
      return fetch("https://api.mymemory.translated.net/get?q=" + encodeURIComponent(text) + "&langpair=ja|" + tgt)
        .then(function (r) { return r.json(); })
        .then(function (j) {
          var tr = j && j.responseData && j.responseData.translatedText;
          if (tr && j.responseStatus === 200 && tr.toUpperCase().indexOf("MYMEMORY WARNING") === -1) return tr;
          return text;
        })
        .catch(function () { return text; });
    } catch (e) {
      return Promise.resolve(text);
    }
  }

  function translate(text, lang) {
    lang = lang || window.currentLang || "ja";
    if (!text || !String(text).trim() || lang === "ja") return Promise.resolve(text);
    var key = lang + "|" + text;
    if (_cache[key]) return Promise.resolve(_cache[key]);
    if (_inflight[key]) return _inflight[key];
    var p;
    try {
      p = fetch("/api-proxy/translate?lang=" + encodeURIComponent(lang) + "&text=" + encodeURIComponent(text))
        .then(function (r) { if (!r.ok) throw new Error("proxy unavailable"); return r.json(); })
        .then(function (j) {
          if (j && j.ok && j.translated) return j.translated;
          return _direct(text, lang);
        })
        .catch(function () { return _direct(text, lang); })
        .then(function (tr) {
          if (tr && tr !== text) _cache[key] = tr;
          return tr;
        });
    } catch (e) {
      return _direct(text, lang);
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
