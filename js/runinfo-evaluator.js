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

    if (whole) return { status: "suspended", evidence: evidence, delayUpperBoundMinutes: null };
    if (timetable) return { status: "delayed", evidence: evidence, delayUpperBoundMinutes: null };
    var directionalSuspension = /(?:上り線|下り線|内回り|外回り)[^。\n]*(?:運転見合わせ|運転を見合わせ|運転中止|運転を中止|運休)/.test(s);
    if (directionalSuspension) evidence.push({ type: "DIRECTIONAL_SUSPENSION" });
    // Station ranges and one-direction suspensions are partial impacts, never whole-line ×.
    if (explicitRangeSuspension || directionalSuspension || through || partial || reducedService) return { status: "notice", evidence: evidence, delayUpperBoundMinutes: null };

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
    // A cause on another railway must never become this line's affected interval.
    // Optional canonical station membership is a second, independent safeguard.
    var lineStations = Array.isArray(input.lineStations) ? input.lineStations.map(function(v) {
      return textOf(v).trim().replace(/駅$/, "");
    }) : null;
    function belongsToLine(range) {
      if (!range || range === "全線" || !lineStations || !lineStations.length) return true;
      var ends = range.split("→");
      return ends.length !== 2 || ends.every(function(v) {
        return lineStations.indexOf(v.trim().replace(/駅$/, "")) !== -1;
      });
    }
    // Cause phrases alone do not establish foreign-line identity: a local
    // station range can also be followed by "設備点検の影響で".
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
      if (ranges.length) interval = ranges.filter(belongsToLine).join("、") || null;
      else if (/全線/.test(text)) interval = "全線";
    }
    var direction = null;
    if (/内回り/.test(text)) direction = "inner";
    else if (/外回り/.test(text)) direction = "outer";
    else if (/上下線|上下両線|両方向/.test(text)) direction = "both";
    else if (/上り線|上り列車|上り方面/.test(text)) direction = "up";
    else if (/下り線|下り列車|下り方面/.test(text)) direction = "down";

    var effect = null;
    if (/運転見合わせ|運転を見合わせ|運転中止|運転を中止/.test(text)) effect = "suspension";
    else if (/直通(?:運転|運行)[^。\n]*(?:中止|取りやめ|見合わせ)|(?:中止|取りやめ|見合わせ)[^。\n]*直通(?:運転|運行)/.test(text)) effect = "through_suspension";
    else if (/区間運休|一部(?:の)?(?:列車|電車)?[^。\n]*運休/.test(text)) effect = "partial_cancellation";
    else if (/遅延|遅れ|ダイヤ(?:が|は)?(?:乱れ|乱れて)|ダイヤ乱れ/.test(text)) effect = "delay";
    else if (/平常(?:通り|どおり|運転|運行)|通常(?:運転|運行)|正常(?:運転|運行)/.test(text)) effect = "normal";

    function directionOf(fragment) {
      if (/内回り/.test(fragment)) return "inner";
      if (/外回り/.test(fragment)) return "outer";
      if (/上下線|上下両線|両方向/.test(fragment)) return "both";
      if (/上り線|上り列車|上り方面/.test(fragment)) return "up";
      if (/下り線|下り列車|下り方面/.test(fragment)) return "down";
      return null;
    }
    function effectOf(fragment) {
      if (/直通(?:運転|運行)[^。\n]*(?:中止|取りやめ|見合わせ)|(?:中止|取りやめ|見合わせ)[^。\n]*直通(?:運転|運行)/.test(fragment)) return "through_suspension";
      if (/運転見合わせ|運転を見合わせ|運転中止|運転を中止/.test(fragment)) return "suspension";
      if (/区間運休|一部(?:の)?(?:列車|電車)?[^。\n]*運休/.test(fragment)) return "partial_cancellation";
      if (/遅延|遅れ|ダイヤ(?:が|は)?(?:乱れ|乱れて)|ダイヤ乱れ/.test(fragment)) return "delay";
      if (/平常(?:通り|どおり|運転|運行)|通常(?:運転|運行)|正常(?:運転|運行)/.test(fragment)) return "normal";
      return null;
    }
    function intervalOf(fragment) {
      var ir = fragment.match(/([^。\n、，,]{1,30}?駅)\s*[～〜－−-]\s*([^。\n、，,]{1,30}?駅)(?:間)?/);
      if (!ir) ir = fragment.match(/([^。\n、，,]{1,30}?)\s*[～〜－−-]\s*([^。\n、，,]{1,30}?駅)(?:間)?/);
      if (ir) {
        var from = ir[1].trim().replace(/^.*[（(]/, "").replace(/^[・･（(]+/, "");
        var to = ir[2].trim().replace(/[）)]*$/, "");
        return from + "→" + to;
      }
      return /全線/.test(fragment) ? "全線" : null;
    }
    function effectClauses(sentence) {
      var clauses = [];
      var re = /(直通(?:運転|運行)[^。\n]{0,40}?(?:中止|取りやめ|見合わせ)|(?:運転を?見合わせ|運転見合わせ|運転を?中止|区間運休|一部(?:の)?(?:列車|電車)?[^。\n]{0,20}?運休|遅延|遅れ|平常(?:通り|どおり|運転|運行)|通常(?:運転|運行)|正常(?:運転|運行)))/g;
      var m;
      while ((m = re.exec(sentence))) clauses.push({ index: m.index, effect: effectOf(m[0]) || effectOf(sentence.slice(Math.max(0, m.index - 40), re.lastIndex)) });
      return clauses.filter(function(x){ return !!x.effect; });
    }
    function nearestBefore(items, index) {
      var best = null;
      items.forEach(function(item) {
        if (item.index <= index && (!best || item.index > best.index)) best = item;
      });
      return best;
    }
    var impacts = [];
    var precedingSentenceRange = null;
    text.split(/[。\n；;]/).forEach(function(sentence) {
      sentence = sentence.trim();
      if (!sentence) return;

      var scopes = [];
      var scopeRe = /([^。\n、，,]{1,30}?駅\s*[～〜－−-]\s*[^。\n、，,]{1,30}?駅(?:間)?|[^。\n、，,]{1,30}?\s*[～〜－−-]\s*[^。\n、，,]{1,30}?駅(?:間)?|全線|上下線|上下両線|両方向|上り線|上り列車|上り方面|下り線|下り列車|下り方面|内回り(?:電車)?|外回り(?:電車)?)/g;
      var sm;
      while ((sm = scopeRe.exec(sentence))) {
        var raw = sm[0];
        var scopedInterval = intervalOf(raw);
        // Only canonical membership, not causal wording, excludes a range.
        if (scopedInterval && !belongsToLine(scopedInterval)) scopedInterval = null;
        scopes.push({ index: sm.index, interval: scopedInterval, direction: directionOf(raw) });
      }

      var effects = effectClauses(sentence);
      if (!effects.length) return;
      effects.forEach(function(fx, effectIndex) {
        var preceding = scopes.filter(function(s){ return s.index <= fx.index; });
        var rangeScopes = preceding.filter(function(s){ return !!s.interval; });
        var rangeScope = nearestBefore(rangeScopes, fx.index);
        var directionScope = nearestBefore(preceding.filter(function(s){ return !!s.direction; }), fx.index);
        var previousEffectIndex = effectIndex > 0 ? effects[effectIndex - 1].index : -1;

        // Multiple station ranges listed before one effect share that effect
        // ("A-B間・C-D間で運転見合わせ"). Only ranges introduced after the
        // previous effect belong to the current clause; this prevents a later
        // delay clause from inheriting every earlier range.
        var clauseRanges = rangeScopes.filter(function(s){ return s.index > previousEffectIndex; });
        if (clauseRanges.length > 1) {
          clauseRanges.forEach(function(scope) {
            impacts.push({
              interval: scope.interval,
              direction: directionScope ? directionScope.direction : null,
              effect: fx.effect
            });
          });
          return;
        }

        impacts.push({
          interval: rangeScope ? rangeScope.interval : (!rangeScopes.length && precedingSentenceRange && /^\s*(?:上り線|下り線|上下線|内回り|外回り)(?:では|は|で)/.test(sentence) ? precedingSentenceRange : null),
          direction: directionScope ? directionScope.direction : null,
          effect: fx.effect
        });
      });
      var sentenceRanges = scopes.filter(function(scope){ return !!scope.interval; });
      if (sentenceRanges.length === 1) precedingSentenceRange = sentenceRanges[0].interval;
      else if (sentenceRanges.length > 1 || !/^\s*(?:上り線|下り線|上下線|内回り|外回り)/.test(sentence)) precedingSentenceRange = null;
    });
    // Deduplicate only identical semantic impacts; never merge different effects
    // or directions merely because they occur in the same sentence.
    impacts = impacts.filter(function(item, idx, arr) {
      return arr.findIndex(function(other) {
        return other.interval === item.interval && other.direction === item.direction && other.effect === item.effect;
      }) === idx;
    });
    if (!impacts.length && (interval || direction || effect)) impacts.push({ interval: interval, direction: direction, effect: effect });
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
    return { interval: interval, direction: direction, effect: effect, impacts: impacts, cause: cause, resume: resume, detail: text || null, textDelayMinutes: textDelayMinutes, serviceLevel: serviceLevel };
  }

  function normalizeMessageKind(v) {
    var s = textOf(v).trim();
    if (!s) return null;
    if (/^(?:notice|announcement|お知らせ|告知|通知)$/i.test(s)) return "notice";
    if (/^(?:realtime|operation|status|運行状況|運行情報|運転状況|運転情報)$/i.test(s)) return "realtime";
    return null;
  }

  function inferMessageKind(input) {
    var explicit = normalizeMessageKind(input.messageKind || input.category || input.messageCategory);
    if (explicit) return explicit;
    // Structured operational signals are current operating-state evidence.
    if (normalizeStructuredStatus(input.structuredStatus) || input.suspension === true || input.delay === true || (typeof input.delayMinutes === "number" && input.delayMinutes > 0)) return "realtime";
    // A caller may assert that the record came from a current official
    // operational-status endpoint. This is source provenance, not text guessing.
    if (input.currentOperationalSource === true) return "realtime";
    // Do not infer notice/realtime from causes or operational-looking prose alone.
    return "unknown";
  }

  // Notice subject is independent of whether it is currently in force.
  // Never turn a planned notice into a live suspension from keywords alone.
  function classifyNotice(input) {
    input = input || {};
    var s = textOf(input.text || input.statusText || "");
    var construction = /集中工事|計画工事|線路工事|設備工事|保守工事|工事に伴う/.test(s);
    var recovery = /復旧工事|災害復旧|土砂崩れ|土砂流入|斜面崩壊|崩落|被災/.test(s);
    var planned = /予定|実施します|実施予定|運休します|運休予定|運転計画|(?:来週|明日|翌日|週末)|(?:[０-９0-9]{1,2}月[０-９0-9]{1,2}日)/.test(s);
    var active = /現在|運休しています|運転を見合わせています|運転見合わせ中|運転を中止しています|当面の間|復旧まで/.test(s);
    var resumed = /運転を再開しました|運転再開済み|平常運転に戻りました/.test(s);
    var subject = recovery ? "disaster_recovery" : construction ? "construction" :
      /台風|大雨|大雪|地震|強風/.test(s) ? "weather" :
      /振替輸送|代行バス|バス代行/.test(s) ? "replacement_transport" : "general";
    var phase = resumed ? "ended_claim" : active ? "active_claim" :
      planned ? "planned" : "undetermined";
    return { subject: subject, phase: phase, currentStatusVerified: false };
  }

  function statusSymbol(result) {
    result = result || {};
    if (result.messageKind === "notice") return "!";
    if (result.messageKind !== "realtime") return null;
    if (result.status === "normal") return "○";
    if (result.status === "suspended") return "×";
    if (result.status === "delayed" || result.status === "notice" || result.status === "info") return "△";
    return null;
  }

  function evaluate(input) {
    input = input || {};
    var evidence = [];
    var messageKind = inferMessageKind(input);
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
    if (messageKind === "realtime" && metadata.impacts && metadata.impacts.length > 1) {
      var hasWholeSuspension = metadata.impacts.some(function(x){ return x.interval === "全線" && x.effect === "suspension"; });
      if (!hasWholeSuspension && structured === "suspended") {
        structured = "notice";
        evidence.push({ type: "MULTI_IMPACT_PARTIAL_OPERATION" });
      }
    }
    // A structured Suspension may describe only a station range. Whole-line × is
    // reserved for an unscoped/whole-line suspension; scoped ranges stay △.
    if (structured === "suspended" && metadata.interval && metadata.interval !== "全線") {
      structured = "notice";
      evidence.push({ type: "STRUCTURED_PARTIAL_SUSPENSION", interval: metadata.interval });
    }

    // A source explicitly categorized as a notice is not current operating
    // state evidence. Preserve parsed impact metadata for display, but never let
    // planned/stale notices promote the line to delayed/suspended downstream.
    var resolvedStatus = structured || te.status || "unknown";
    if (messageKind === "notice") {
      resolvedStatus = "notice";
      evidence.push({ type: "NOTICE_STATUS_ISOLATION" });
    }

    var result = {
      messageKind: messageKind,
      noticeClassification: messageKind === "notice" ? classifyNotice(input) : null,
      status: resolvedStatus,
      maxDelay: delayMinutes != null ? delayMinutes : metadata.textDelayMinutes,
      delayUpperBoundMinutes: te.delayUpperBoundMinutes,
      interval: metadata.interval,
      direction: metadata.direction,
      effect: metadata.effect,
      impacts: metadata.impacts,
      cause: metadata.cause,
      resume: metadata.resume,
      detail: metadata.detail,
      serviceLevel: metadata.serviceLevel,
      evidence: evidence,
      source: input.source || null
    };
    result.symbol = statusSymbol(result);
    return result;
  }

  return { version: "1.3.1", classifyNotice: classifyNotice, evaluate: evaluate, evaluateText: evaluateText, extractMetadata: extractMetadata, normalizeStructuredStatus: normalizeStructuredStatus, normalizeMessageKind: normalizeMessageKind, inferMessageKind: inferMessageKind, statusSymbol: statusSymbol };
});
