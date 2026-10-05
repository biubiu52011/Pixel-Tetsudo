/**
 * LinePresentationService unified ordering regression tests.
 *
 * Covers the LINE LIST DISPLAY ORDER spec:
 *  - global category order: JR > Metro > Private > Other
 *  - sort unit = Presentation (multi-line presentations occupy ONE slot)
 *  - within operator group: explicit order -> special symbol -> A-Z -> fallback
 *  - stable / deterministic comparator; unknown operators never crash
 */
const fs = require("fs"), path = require("path"), assert = require("assert"), vm = require("vm");
const root = path.join(__dirname, "..");

function makeContext() {
  const sandbox = { console: console, window: {}, document: { title: "" } };
  sandbox.window = sandbox;
  return { sandbox: sandbox, ctx: vm.createContext(sandbox) };
}

function loadCommon(ctx) {
  new vm.Script(fs.readFileSync(path.join(root, "js/common.js"), "utf8"), { filename: "common.js" }).runInContext(ctx);
}
function loadLPS(ctx) {
  new vm.Script(fs.readFileSync(path.join(root, "js/line-presentation-service.js"), "utf8"), { filename: "line-presentation-service.js" }).runInContext(ctx);
}

function makeLine(id, op, code, pres) {
  const l = { id: id, name: id, nameJa: id + "線", code: code || null, operator: op };
  if (pres) l.presentation = pres;
  return l;
}

const FIXTURES = {
  JR_EAST: [
    makeLine("Saikyo", "JR-East", "JA", { code: "JA", order: 1, lineIds: ["Saikyo", "Kawagoe"], nameJa: "埼京線", operatorGroup: "JR_EAST" }),
    makeLine("Kawagoe", "JR-East", "JA", null), // member: no sort slot
    makeLine("ChuoRapid", "JR-East", "JC", { code: "JC", order: 3, lineIds: ["ChuoRapid"], nameJa: "中央線快速", operatorGroup: "JR_EAST" }),
    makeLine("Yokosuka", "JR-East", "JO", { code: "JO", order: 14, lineIds: ["Yokosuka", "SobuRapid"], nameJa: "横須賀線・総武線快速", operatorGroup: "JR_EAST" }),
    makeLine("SobuRapid", "JR-East", "JO", null), // member of JO
    makeLine("NumeroLine", "JR-East", "0", { code: "0", order: 5, lineIds: ["NumeroLine"], nameJa: "数字線", operatorGroup: "JR_EAST" }),
    makeLine("PlainFallback", "JR-East", null, null) // no presentation -> fallback tier
  ],
  METRO: [
    makeLine("Ginza", "TokyoMetro", "G", { code: "G", order: 1, lineIds: ["Ginza"], nameJa: "銀座線", operatorGroup: "TOKYO_METRO" }),
    makeLine("Marunouchi", "TokyoMetro", "M", { code: "M", order: 2, lineIds: ["Marunouchi"], nameJa: "丸ノ内線", operatorGroup: "TOKYO_METRO" })
  ],
  PRIVATE: [
    makeLine("KeioLine", "Keio", "KO", { code: "KO", order: 1, lineIds: ["KeioLine"], nameJa: "京王線", operatorGroup: "KEIO" })
  ],
  OTHER: [
    makeLine("TWR", "TWR", "R", { code: "R", order: 1, lineIds: ["TWR"], nameJa: "りんかい線", operatorGroup: "TWR" })
  ],
  UNKNOWN_OP: [
    makeLine("Mystery", "MysteryRailway", "X", { code: "X", order: 1, lineIds: ["Mystery"], nameJa: "謎線", operatorGroup: "MYSTERY" })
  ],
  JR_WEST: [
    makeLine("Sanin", "JR-West", "V", { code: "V", order: 1, lineIds: ["Sanin"], nameJa: "山陰線", operatorGroup: "JR_WEST" })
  ]
};

function buildLines() {
  const out = {};
  Object.keys(FIXTURES).forEach((g) => FIXTURES[g].forEach((l) => { out[l.id] = l; }));
  return out;
}

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; console.error("FAIL:", name); }
}

// ---- 1-3. Global category order (JR > Metro > Private > Other) ----
(function testCategoryOrder() {
  const { sandbox, ctx } = makeContext();
  loadCommon(ctx); loadLPS(ctx);
  sandbox.window.UNIFIED_LINES = buildLines();
  const LPS = sandbox.window.LinePresentationService;
  const order = LPS.getOperatorOrder(sandbox.window.UNIFIED_LINES);
  const idx = (op) => order.indexOf(op);
  ok(idx("JR-East") >= 0 && idx("TokyoMetro") >= 0 && idx("JR-East") < idx("TokyoMetro"), "JR before Metro");
  ok(idx("TokyoMetro") < idx("Keio"), "Metro before Private");
  ok(idx("Keio") < idx("TWR"), "Private before Other");
  ok(idx("JR-West") >= 0 && idx("JR-West") < idx("TokyoMetro"), "JR-West joins JR category before Metro");
  ok(idx("MysteryRailway") > idx("TWR"), "unknown operator goes after known Other ops");
  ok(idx("JR-East") < idx("JR-West"), "JR-East (OP_ORDER) before JR-West (alpha) within JR");
})();

// ---- 4-5. Symbol tier: special before A-Z; A < B < C ----
(function testSymbolTier() {
  const { sandbox, ctx } = makeContext();
  loadCommon(ctx); loadLPS(ctx);
  const lines = {
    B: makeLine("B", "JR-East", "B", { code: "B", order: null, lineIds: ["B"], nameJa: "B線" }),
    A: makeLine("A", "JR-East", "A", { code: "A", order: null, lineIds: ["A"], nameJa: "A線" }),
    C: makeLine("C", "JR-East", "C", { code: "C", order: null, lineIds: ["C"], nameJa: "C線" }),
    Spec: makeLine("Spec", "JR-East", "1", { code: "1", order: null, lineIds: ["Spec"], nameJa: "数字線" }),
    SpecHy: makeLine("SpecHy", "JR-East", "C-1", { code: "C-1", order: null, lineIds: ["SpecHy"], nameJa: "ハイフン線" })
  };
  sandbox.window.UNIFIED_LINES = lines;
  const LPS = sandbox.window.LinePresentationService;
  const order = LPS.getPresentationOrder(lines).map((e) => e.id);
  const pos = (id) => order.indexOf(id);
  ok(pos("Spec") < pos("A"), "numeric symbol before A-Z");
  ok(pos("SpecHy") < pos("A"), "mixed symbol before A-Z");
  ok(pos("A") < pos("B") && pos("B") < pos("C"), "A < B < C");
})();

// ---- 6-8. JO single slot; members not separate; order independent of lineIds order ----
(function testJOSingleSlot() {
  const { sandbox, ctx } = makeContext();
  loadCommon(ctx); loadLPS(ctx);
  sandbox.window.UNIFIED_LINES = buildLines();
  const LPS = sandbox.window.LinePresentationService;
  const pres = LPS.getPresentationOrder(sandbox.window.UNIFIED_LINES);
  const jo = pres.filter((e) => e.pres && e.pres.code === "JO");
  ok(jo.length === 1, "JO occupies exactly one presentation slot");
  ok(jo[0].id === "Yokosuka", "JO primary is Yokosuka");
  const presIds = pres.map((e) => e.id);
  ok(presIds.indexOf("SobuRapid") === -1, "SobuRapid is not a standalone sort slot");
  const full = LPS.getDisplayOrder(sandbox.window.UNIFIED_LINES);
  ok(full.indexOf("Yokosuka") >= 0 && full.indexOf("SobuRapid") === full.indexOf("Yokosuka") + 1, "member follows primary in full order");

  // lineIds array order must not affect slot count or JO sort position
  const swapped = buildLines();
  swapped["Yokosuka"].presentation = null;
  swapped["SobuRapid"].presentation = { code: "JO", order: 14, lineIds: ["SobuRapid", "Yokosuka"], nameJa: "横須賀線・総武線快速", operatorGroup: "JR_EAST" };
  const pres2 = LPS.getPresentationOrder(swapped);
  const jo2 = pres2.filter((e) => e.pres && e.pres.code === "JO");
  ok(jo2.length === 1 && jo2[0].id === "SobuRapid", "JO slot unaffected by lineIds order");
  const full2 = LPS.getDisplayOrder(swapped);
  ok(full2.indexOf("SobuRapid") >= 0 && full2.indexOf("Yokosuka") === full2.indexOf("SobuRapid") + 1, "member ordering stable when lineIds swapped");
  // JO sort position comes from the presentation itself (order=14), not the primary id
  const joPosBefore = pres.filter((e) => e.pres && e.pres.code === "JO")[0];
  const joPosAfter = jo2[0];
  ok(joPosBefore && joPosAfter, "JO entity present in both lineIds arrangements");
  const keyOf = (e) => String(e.pres.order) + "|" + e.pres.code;
  ok(keyOf(joPosBefore) === keyOf(joPosAfter), "JO sort key identical regardless of primary id");
})();

// ---- 9. JA multi-line presentation also single slot ----
(function testJASingleSlot() {
  const { sandbox, ctx } = makeContext();
  loadCommon(ctx); loadLPS(ctx);
  sandbox.window.UNIFIED_LINES = buildLines();
  const LPS = sandbox.window.LinePresentationService;
  const pres = LPS.getPresentationOrder(sandbox.window.UNIFIED_LINES);
  const ja = pres.filter((e) => e.pres && e.pres.code === "JA");
  ok(ja.length === 1 && ja[0].id === "Saikyo", "JA occupies one slot (Saikyo primary)");
  const presIds = pres.map((e) => e.id);
  ok(presIds.indexOf("Kawagoe") === -1, "Kawagoe member not a sort slot");
})();

// ---- 10. No-symbol fallback stable ----
(function testFallbackStable() {
  const { sandbox, ctx } = makeContext();
  loadCommon(ctx); loadLPS(ctx);
  const lines = {
    Z: makeLine("Z", "JR-East", "Z", { code: "Z", order: null, lineIds: ["Z"], nameJa: "Z線" }),
    NoSym1: makeLine("NoSym1", "JR-East", null, null),
    NoSym2: makeLine("NoSym2", "JR-East", null, null)
  };
  sandbox.window.UNIFIED_LINES = lines;
  const LPS = sandbox.window.LinePresentationService;
  const order = LPS.getDisplayOrder(lines);
  ok(order.indexOf("NoSym1") >= 0 && order.indexOf("NoSym2") >= 0, "no-symbol lines present");
  ok(order.indexOf("Z") < order.indexOf("NoSym1"), "symbol lines sort before fallback");
  // deterministic across calls
  const order2 = LPS.getDisplayOrder(lines);
  ok(order.join(",") === order2.join(","), "fallback ordering deterministic");
})();

// ---- 11. Unknown operator never crashes ----
(function testUnknownOperator() {
  const { sandbox, ctx } = makeContext();
  loadCommon(ctx); loadLPS(ctx);
  sandbox.window.UNIFIED_LINES = buildLines();
  const LPS = sandbox.window.LinePresentationService;
  let threw = false;
  let order = null;
  try { order = LPS.getDisplayOrder(sandbox.window.UNIFIED_LINES); } catch (e) { threw = true; }
  ok(!threw, "unknown operator does not crash getDisplayOrder");
  ok(order.indexOf("Mystery") >= 0, "unknown-operator line still present (Other category)");
  const ops = LPS.orderOperators(["MysteryRailway", "JR-East", "Keio"]);
  ok(ops[0] === "JR-East" && ops[1] === "Keio" && ops[2] === "MysteryRailway", "orderOperators stable for unknown ops");
})();

// ---- 12. Same key keeps stable ordering (original order) ----
(function testStableSameKey() {
  const { sandbox, ctx } = makeContext();
  loadCommon(ctx); loadLPS(ctx);
  const lines = {
    First: makeLine("First", "JR-East", "X", { code: "X", order: 9, lineIds: ["First"], nameJa: "同線" }),
    Second: makeLine("Second", "JR-East", "X", { code: "X", order: 9, lineIds: ["Second"], nameJa: "同線" })
  };
  sandbox.window.UNIFIED_LINES = lines;
  const LPS = sandbox.window.LinePresentationService;
  const order = LPS.getDisplayOrder(lines);
  ok(order[0] === "First" && order[1] === "Second", "same sort key keeps stable original order");
})();

// ---- Real railway_data.json sanity: JO single slot on full dataset ----
(function testRealData() {
  const { sandbox, ctx } = makeContext();
  loadCommon(ctx); loadLPS(ctx);
  const raw = JSON.parse(fs.readFileSync(path.join(root, "data/core/railway_data.json"), "utf8"));
  sandbox.window.UNIFIED_LINES = raw.lines;
  const LPS = sandbox.window.LinePresentationService;
  let threw = false;
  let full = null;
  try { full = LPS.getDisplayOrder(raw.lines); } catch (e) { threw = true; console.error("realdata err:", e.message); }
  ok(!threw, "full dataset getDisplayOrder no crash");
  if (full) {
    const pres = LPS.getPresentationOrder(raw.lines);
    const jo = pres.filter((e) => e.pres && e.pres.code === "JO");
    // Real data: two independent JA systems exist (埼京線・川越線 JA on Saikyo,
    // 川越線・八高線 JA on KawagoeWest) — each is a distinct presentation entity.
    const saikyoJA = pres.filter((e) => e.id === "Saikyo" && e.pres && e.pres.code === "JA");
    ok(jo.length === 1, "real data: JO single slot");
    ok(saikyoJA.length === 1, "real data: Saikyo JA single slot (member Kawagoe deduped)");
    const jaMembers = pres.filter((e) => e.pres && e.pres.code === "JA" && e.id !== "Saikyo" && e.id !== "KawagoeWest");
    ok(jaMembers.length === 0, "real data: no extra JA slots beyond Saikyo/KawagoeWest");
    ok(full.indexOf("Yokosuka") === full.indexOf("SobuRapid") - 1, "real data: SobuRapid follows Yokosuka");
    // Category ordering on real operators
    const ops = LPS.getOperatorOrder(raw.lines);
    ok(ops.indexOf("JR-East") < ops.indexOf("TokyoMetro"), "real: JR-East before TokyoMetro");
    ok(ops.indexOf("TokyoMetro") < ops.indexOf("Keio"), "real: TokyoMetro before Keio");
    const otherOp = ["Rinkai", "TWR", "MinatoMirai", "Yurikamome"].filter((o) => ops.indexOf(o) >= 0);
    ok(otherOp.length > 0 && ops.indexOf("Keio") < ops.indexOf(otherOp[0]), "real: Keio before Other ops");
    ok(ops.indexOf("JR-West") >= 0 && ops.indexOf("JR-West") < ops.indexOf("TokyoMetro"), "real: JR-West inside JR category");
    ok(full.length === Object.keys(raw.lines).length, "real: full order covers every line exactly once");
    const uniq = new Set(full).size;
    ok(uniq === full.length, "real: no duplicate lineIds in order");
  }
})();

console.log("line-presentation-sort: PASS " + pass + " / " + (pass + fail));
if (fail > 0) { console.error("line-presentation-sort: " + fail + " FAILURES"); process.exit(1); }
