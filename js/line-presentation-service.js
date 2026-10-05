/**
 * Line Presentation Service
 * Unified UI list ordering for all line overviews.
 *
 * Sort unit = Presentation / running system:
 *   Each line record carries a `presentation` block (canonical metadata absorbed
 *   from the former LOS layer). The PRIMARY record is the one whose
 *   `presentation.lineIds[0] === lineId`; member lines (lineIds[1..]) share the
 *   primary sort slot and never occupy their own UI position.
 *
 * Global category order: JR > Metro(地下鉄) > Private(私鉄) > Other(その他).
 * Within one operator group:
 *   explicit presentation.order -> special symbol -> A-Z symbol
 *   -> display name -> stable original order.
 *
 * Canonical physical lines remain independently modeled in railway_data.json;
 * this layer is pure presentation and never merges or rewrites canonical topology.
 *
 * API:
 *   - getDisplayOrder(lines)    -> ordered array of line IDs (primaries + members)
 *   - getPresentationOrder(lines) -> ordered primary presentation entities
 *   - getDisplayOrderMap(lines) -> map of line ID -> display index
 *   - orderOperators(ops)       -> operator list sorted by category/OP_ORDER/alpha
 */
(function() {
  "use strict";

  var CATEGORY_ORDER = ["JR", "Metro", "Private", "Other"];

  // Minimal category metadata. JR operators are identified by the "JR-" prefix
  // (JR-East / JR-West / JR-Central / JR-Kyushu / JR-Hokkaido / JR-Shikoku).
  // Metro = 公営・地下鉄 operators; Private = 大手私鉄 + 準大手/近畿・中部・九州私鉄;
  // everything else (monorails, new transit, AGT, TWR...) falls into Other.
  var METRO_OPS = [
    "TokyoMetro", "Toei", "YokohamaMunicipal",
    "OsakaMetro", "NagoyaMunicipal", "KyotoMunicipal", "KobeMunicipal",
    "SapporoMunicipal", "SendaiMunicipal", "FukuokaMunicipal", "HiroshimaElectric"
  ];
  var PRIVATE_OPS = [
    "Keio", "Odakyu", "Seibu", "Tobu", "Tokyu",
    "Keikyu", "Keisei", "Sotetsu",
    "Kintetsu", "Hankyu", "Hanshin", "Keihan", "Nankai",
    "Meitetsu", "Nishitetsu"
  ];

  function categoryOf(op) {
    if (!op) return "Other";
    if (/^JR-/.test(op)) return "JR";
    if (METRO_OPS.indexOf(op) >= 0) return "Metro";
    if (PRIVATE_OPS.indexOf(op) >= 0) return "Private";
    return "Other";
  }

  function categoryIndex(op) {
    var c = categoryOf(op);
    var i = CATEGORY_ORDER.indexOf(c);
    return i >= 0 ? i : CATEGORY_ORDER.length - 1;
  }

  // Normalized symbol token: pure A-Z letters sort alpha; any other token
  // (digits, "-", mixed, CJK) is "special" and sorts BEFORE A-Z.
  function symbolSortKey(code) {
    var c = String(code || "").toUpperCase();
    if (!c) return "2|";                    // no symbol -> fallback tier
    if (/^[A-Z]+$/.test(c)) return "1|" + c; // A-Z tier
    return "0|" + c;                        // special tier (first)
  }

  function displayNameOf(line, pres) {
    if (pres) return pres.nameJa || pres.nameEn || "";
    return (line && (line.nameJa || line.nameEn || line.name)) || "";
  }

  // Deterministic per-entity sort key inside one operator group.
  function entitySortKey(entity) {
    var pres = entity.pres;
    var orderKey = (pres && pres.order != null)
      ? "1|" + String(("0000" + String(pres.order)).slice(-4))
      : "2|";
    var code = (pres && pres.code) || (entity.line && entity.line.code) || "";
    var symKey = "0|" + symbolSortKey(code);
    var nameKey = displayNameOf(entity.line, pres);
    var orig = String(("000000" + String(entity.orig)).slice(-6));
    return orderKey + "|" + symKey + "|" + nameKey + "|" + orig;
  }

  // Collect operator keys present in `lines` (fallback to UNIFIED_LINES).
  function collectOperators(lines) {
    var src = lines || window.UNIFIED_LINES || {};
    var ops = [];
    Object.keys(src).forEach(function(lid) {
      var op = src[lid] && src[lid].operator;
      if (op && ops.indexOf(op) === -1) ops.push(op);
    });
    return ops;
  }

  /**
   * All operator keys sorted by global category (JR > Metro > Private > Other),
   * then OP_ORDER (project canonical), then alpha. Unknown operators never crash.
   */
  function getOperatorOrder(lines) {
    var known = (window.TransitConstants && Array.isArray(window.TransitConstants.OP_ORDER))
      ? window.TransitConstants.OP_ORDER.slice() : [];
    var ops = collectOperators(lines);
    var out = [];
    known.forEach(function(op) { if (ops.indexOf(op) !== -1 && out.indexOf(op) === -1) out.push(op); });
    ops.forEach(function(op) { if (out.indexOf(op) === -1) out.push(op); });
    out.sort(function(a, b) {
      var ca = categoryIndex(a), cb = categoryIndex(b);
      if (ca !== cb) return ca - cb;
      var ia = known.indexOf(a), ib = known.indexOf(b);
      if (ia >= 0 && ib >= 0) return ia - ib;
      if (ia >= 0) return -1;
      if (ib >= 0) return 1;
      return String(a).localeCompare(String(b));
    });
    return out;
  }

  /**
   * orderOperators(ops): stable order for an arbitrary operator subset
   * (used by filter bars). Order follows getOperatorOrder; ops outside the
   * canonical set append in alpha order.
   */
  function orderOperators(ops) {
    if (!Array.isArray(ops) || ops.length === 0) return ops || [];
    var full = getOperatorOrder(null);
    var inFull = [], rest = [];
    ops.forEach(function(op) { (full.indexOf(op) >= 0 ? inFull : rest).push(op); });
    inFull.sort(function(a, b) { return full.indexOf(a) - full.indexOf(b); });
    rest.sort(function(a, b) { return String(a).localeCompare(String(b)); });
    return inFull.concat(rest);
  }

  /**
   * Primary presentation entities in global display order.
   * Each multi-line presentation contributes exactly ONE entity.
   */
  function getPresentationOrder(allLines) {
    allLines = allLines || {};
    var presEntities = [], covered = {};
    Object.keys(allLines).forEach(function(lid) {
      var line = allLines[lid];
      if (!line || !line.presentation) return;
      var ids = line.presentation.lineIds;
      if (!Array.isArray(ids) || ids.length === 0) return;
      if (ids[0] !== lid) return; // member record: not a sort slot
      presEntities.push({ id: lid, pres: line.presentation, line: line, orig: presEntities.length, isPresentation: true });
      ids.forEach(function(m) { covered[m] = true; });
    });
    // Fallback entities: lines without presentation that are not members of one.
    var fallback = [];
    Object.keys(allLines).forEach(function(lid) {
      var line = allLines[lid];
      if (!line || covered[lid]) return;
      fallback.push({ id: lid, pres: null, line: line, orig: 100000 + fallback.length, isPresentation: false });
    });

    var byOp = {};
    presEntities.forEach(function(e) {
      var op = (e.line && e.line.operator) || "Unknown";
      e._op = op;
      if (!byOp[op]) byOp[op] = [];
      byOp[op].push(e);
    });
    fallback.forEach(function(e) {
      var op = (e.line && e.line.operator) || "Unknown";
      e._op = op;
      if (!byOp[op]) byOp[op] = [];
      byOp[op].push(e);
    });

    var opOrder = getOperatorOrder(allLines).filter(function(op) { return byOp[op]; });
    Object.keys(byOp).forEach(function(op) { if (opOrder.indexOf(op) === -1) opOrder.push(op); });

    var result = [];
    opOrder.forEach(function(op) {
      var list = byOp[op].slice();
      list.sort(function(a, b) {
        if (a.isPresentation !== b.isPresentation) return a.isPresentation ? -1 : 1; // presentations first
        var ka = entitySortKey(a), kb = entitySortKey(b);
        return ka < kb ? -1 : (ka > kb ? 1 : 0);
      });
      list.forEach(function(e) { result.push(e); });
    });
    return result;
  }

  /**
   * Full lineId order: presentation primaries in display order, each followed by
   * its member lines (members share the primary slot; UI aggregation dedupes them).
   */
  function getDisplayOrder(allLines) {
    allLines = allLines || {};
    var pres = getPresentationOrder(allLines);
    var out = [];
    pres.forEach(function(e) {
      out.push(e.id);
      if (e.pres) {
        (e.pres.lineIds || []).forEach(function(m) {
          if (m !== e.id && allLines[m]) out.push(m);
        });
      }
    });
    return out;
  }

  function getDisplayOrderMap(allLines) {
    var order = getDisplayOrder(allLines);
    var map = {};
    for (var i = 0; i < order.length; i++) map[order[i]] = i;
    return map;
  }

  window.LinePresentationService = {
    getDisplayOrder: getDisplayOrder,
    getPresentationOrder: getPresentationOrder,
    getDisplayOrderMap: getDisplayOrderMap,
    getOperatorOrder: getOperatorOrder,
    orderOperators: orderOperators,
    categoryOf: categoryOf
  };
})();
