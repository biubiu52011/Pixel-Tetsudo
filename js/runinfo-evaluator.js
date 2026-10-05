/*
 * Pixel Tetsudo - RunInfo Evaluator
 * Source-neutral operational-status evidence evaluator.
 * Structured official signals win; text-only sources are interpreted conservatively.
 */
(function(root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.RunInfoEvaluator = api;
})(typeof window !== "undefined" ? window : null, function() {
  "use strict";

  var RANK = { unknown: 0, normal: 1, info: 2, notice: 3, delayed: 4, suspended: 5 };

  function textOf(v) {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "object") return String(v.ja || v["ja-Hrkt"] || v.en || v["zh-Hans"] || v["zh-Hant"] || v.ko || "");
    return String(v);
  }

  function normalizeStructuredStatus(v) {
    var s = textOf(v);
    if (!s) return null;
    var tail = s.split(":").pop();
    if (/^(?:Normal|normal)$/i.test(tail)) return "normal";
    if (/^(?:Delay|Delayed|delay)$/i.test(tail)) return "delayed";
    if (/^(?:Suspension|Suspended|suspension)$/i.test(tail)) return "suspended";
    return null;
  }

  function evaluateText(text) {
    var s = textOf(text).replace(/\s+/g, " ").trim();
    var evidence = [];
    if (!s) return { status: "unknown", evidence: evidence, delayUpperBoundMinutes: null };

    var threshold = s.match(/([０-９0-9]{1,3})\s*分以上(?:の)?(?:遅延|遅れ)[^。\n]*(?:ありません|ございません|なし)/);
    if (threshold) {
      var n = parseInt(threshold[1].replace(/[０-９]/g, function(c){ return String(c.charCodeAt(0)-0xFF10); }), 10);
      evidence.push({ type: "DELAY_THRESHOLD_NEGATIVE", minutes: n });
      return { status: "normal", evidence: evidence, delayUpperBoundMinutes: isNaN(n) ? null : n };
    }

    if (/平常(?:通り|どおり|運転|運行)|通常(?:運転|運行)|正常(?:運転|運行)|遅延(?:は)?ありません|遅延なし/.test(s)) {
      evidence.push({ type: "EXPLICIT_NORMAL" });
      return { status: "normal", evidence: evidence, delayUpperBoundMinutes: null };
    }

    var through = /直通(?:運転|運行)[^。\n]*(?:中止|取りやめ|見合わせ|運休)|(?:中止|取りやめ|見合わせ)[^。\n]*直通(?:運転|運行)/.test(s);
    if (through) evidence.push({ type: "THROUGH_SERVICE_CANCELLED" });

    var timetable = /ダイヤ(?:が|は)?(?:乱れ|乱れて)|ダイヤ乱れ|時刻表[^。\n]*(?:乱れ|変更)|遅延|遅れ/.test(s);
    if (timetable) evidence.push({ type: "TIMETABLE_DISRUPTION" });

    var partial = /一部(?:の)?(?:列車|電車|区間)?[^。\n]*(?:運休|運転見合わせ|運転を見合わせ|運転中止|取りやめ)|一部列車[^。\n]*区間運休|区間運休/.test(s);
    var reducedService = /通常の[０-９0-9]+割程度[^。\n]*運転|列車本数[^。\n]*(?:少な|減少)|本数を減らして[^。\n]*運転/.test(s);
    if (reducedService) evidence.push({ type: "REDUCED_SERVICE" });
    if (partial) evidence.push({ type: "PARTIAL_SERVICE_IMPACT" });

    var whole = /全線[^。\n]*(?:運休|運転見合わせ|運転を見合わせ|運転中止|運転を中止|取りやめ)|全列車[^。\n]*(?:運休|取りやめ|運転を見合わせ)/.test(s);
    if (whole) evidence.push({ type: "WHOLE_LINE_SUSPENSION" });

    var explicitRangeSuspension = /[^。\n]{1,40}駅\s*[～〜－−-]\s*[^。\n]{1,40}駅(?:間)?[^。\n]*(?:運転見合わせ|運転を見合わせ|運休|運転中止)/.test(s);
    if (explicitRangeSuspension) evidence.push({ type: "RANGE_SUSPENSION" });

    if (whole || explicitRangeSuspension) return { status: "suspended", evidence: evidence, delayUpperBoundMinutes: null };
    if (timetable) return { status: "delayed", evidence: evidence, delayUpperBoundMinutes: null };
    if (through || partial || reducedService) return { status: "notice", evidence: evidence, delayUpperBoundMinutes: null };

    // A bare keyword is not enough to upgrade the whole line.
    if (/運休|見合わせ|中止|運行情報|運転情報/.test(s)) {
      evidence.push({ type: "UNSCOPED_OPERATIONAL_INFO" });
      return { status: "info", evidence: evidence, delayUpperBoundMinutes: null };
    }
    return { status: "info", evidence: [{ type: "UNCLASSIFIED_TEXT" }], delayUpperBoundMinutes: null };
  }

  function normalizeRange(v) {
    var s = textOf(v).trim();
    return s ? s.replace(/間(?=\s*(?:[〜～－−→]|$))/g, "").replace(/[〜～－−]/g, "→") : null;
  }

  function extractMetadata(input) {
    input = input || {};
    var text = textOf(input.text || "");
    var cause = textOf(input.cause).trim() || null;
    var interval = normalizeRange(input.range);
    if (!interval) {
      var from = textOf(input.stationFromName).trim();
      var to = textOf(input.stationToName).trim();
      if (from && to) interval = from + "→" + to;
      else if (from) interval = from + "方面";
      else if (to) interval = to + "方面";
    }
    // Text-only official messages often carry the affected station range
    // without structured stationFrom/stationTo fields.
    if (!interval && text) {
      var rangeRe = /([^。\n、，,]{1,30}?駅)\s*[～〜－−-]\s*([^。\n、，,]{1,30}?駅)(?:間)?/g;
      var ranges = [];
      var rangeMatch;
      while ((rangeMatch = rangeRe.exec(text))) {
        var left = rangeMatch[1].trim().replace(/^[・･]+/, "");
        ranges.push(left + "→" + rangeMatch[2].trim());
      }
      if (!ranges.length) {
        var omittedStationRe = /([^。\n、，,]{1,30}?)\s*[～〜－−-]\s*([^。\n、，,]{1,30}?駅)(?:間)?/g;
        while ((rangeMatch = omittedStationRe.exec(text))) {
          var leftOmitted = rangeMatch[1].trim().replace(/^[・･]+/, "");
          ranges.push(leftOmitted + "→" + rangeMatch[2].trim());
        }
      }
      if (!ranges.length) {
        var fromToRe = /([^。\n、，,]{1,30}?駅)\s*から\s*([^。\n、，,]{1,30}?駅)\s*まで/g;
        while ((rangeMatch = fromToRe.exec(text))) ranges.push(rangeMatch[1].trim() + "→" + rangeMatch[2].trim());
      }
      if (ranges.length) interval = ranges.join("、");
      else if (/全線/.test(text)) interval = "全線";
    }
    var resume = null;
    if (input.resumeEstimate) {
      var rm = String(input.resumeEstimate).match(/(\d{2}):(\d{2})/);
      if (rm) resume = rm[1] + ":" + rm[2];
    }
    var serviceLevel = null;
    var serviceRange = text.match(/通常の\s*([０-９0-9]+)\s*[～〜－−-]\s*([０-９0-9]+)\s*割程度/);
    var serviceSingle = !serviceRange && text.match(/通常の\s*([０-９0-9]+)\s*割程度/);
    function toAsciiNumber(v) {
      return parseInt(String(v).replace(/[０-９]/g, function(c){ return String(c.charCodeAt(0)-0xFF10); }), 10);
    }
    if (serviceRange) {
      serviceLevel = { minPercent: toAsciiNumber(serviceRange[1]) * 10, maxPercent: toAsciiNumber(serviceRange[2]) * 10 };
    } else if (serviceSingle) {
      var servicePercent = toAsciiNumber(serviceSingle[1]) * 10;
      serviceLevel = { minPercent: servicePercent, maxPercent: servicePercent };
    }
    var textDelayMinutes = null;
    var dm = text.match(/(?:約|およそ)?\s*(\d{1,3})\s*(?:分間|分|min)(?!頃|後|以)/i);
    if (dm) textDelayMinutes = parseInt(dm[1], 10);
    if (!cause && text) {
      var cm = text.match(/(?:発生した|発生し)([^。\n，,、\sで〜～－−至→-]+?)(?:のため|の影響|により|による)/);
      if (!cm) cm = text.match(/(?:で|、|，|,|\s|^)([^。\n，,、\sで〜～－−至→-]+?)(?:のため|の影響|により|による|が原因|の発生|に伴い)/);
      if (cm && cm[1]) cause = cm[1];
    }
    return { interval: interval, cause: cause, resume: resume, detail: text || null, textDelayMinutes: textDelayMinutes, serviceLevel: serviceLevel };
  }

  function evaluate(input) {
    input = input || {};
    var evidence = [];
    var structured = normalizeStructuredStatus(input.structuredStatus);
    if (structured) evidence.push({ type: "STRUCTURED_STATUS", value: structured });

    if (input.suspension === true) {
      structured = "suspended";
      evidence.push({ type: "STRUCTURED_SUSPENSION" });
    }

    var delayMinutes = null;
    if (input.delayMinutes != null && input.delayMinutes !== false) {
      var n = parseInt(input.delayMinutes, 10);
      if (!isNaN(n) && n > 0) {
        delayMinutes = n;
        if (structured !== "suspended") structured = "delayed";
        evidence.push({ type: "STRUCTURED_DELAY", minutes: n });
      }
    } else if (input.delay === true) {
      if (structured !== "suspended") structured = "delayed";
      evidence.push({ type: "STRUCTURED_DELAY" });
    }

    // Official non-text signals (e.g. Shonan status image) are authoritative.
    if (input.signalStatus && RANK[input.signalStatus] != null) {
      structured = input.signalStatus;
      evidence.push({ type: "OFFICIAL_SIGNAL", value: input.signalStatus });
    }

    var te = evaluateText(input.text || input.statusText || "");
    evidence = evidence.concat(te.evidence || []);
    var metadata = extractMetadata(input);

    return {
      status: structured || te.status || "unknown",
      maxDelay: delayMinutes != null ? delayMinutes : metadata.textDelayMinutes,
      delayUpperBoundMinutes: te.delayUpperBoundMinutes,
      interval: metadata.interval,
      cause: metadata.cause,
      resume: metadata.resume,
      detail: metadata.detail,
      serviceLevel: metadata.serviceLevel,
      evidence: evidence,
      source: input.source || null
    };
  }

  return { version: "1.1.0", evaluate: evaluate, evaluateText: evaluateText, extractMetadata: extractMetadata, normalizeStructuredStatus: normalizeStructuredStatus };
});
