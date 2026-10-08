const fs = require("fs");
const vm = require("vm");
const assert = require("assert");
const code = fs.readFileSync(require("path").join(__dirname, "../js/delay-translator.js"), "utf8");

const ctx = {
  window: {
    currentLang: "zh",
    RailwayDB: {
      getStations(){ return {}; },
      getAllLines(){ return {}; },
      resolveStationName(){ return ""; },
      resolveLineName(){ return ""; }
    }
  }
};
vm.createContext(ctx);
vm.runInContext(code, ctx);

const src = "信号故障の影響で、列車に遅れが出ています。詳細は係員にお尋ねください。";
const r = ctx.window.DelayTranslator.translate(src, { status: "info", lineId: "Test" }, "zh");
assert.ok(r.translated.includes("信号故障"), "known source detail must survive full-text translation");
assert.ok(r.translated.includes("延误"), "known operational term must be translated");
assert.ok(r.translated.includes("詳細は係員にお尋ねください"), "unmatched official detail must be preserved");
assert.ok(!/^.*有运行情报。$/.test(r.translated), "fallback must not collapse official text to generic summary");

console.log("delay-translator-fulltext: 4 PASS");

const liveNamboku = "駒込駅での停止位置確認の影響により、ダイヤが乱れています。";
const nz = ctx.window.DelayTranslator.translate(liveNamboku, { status: "delayed", lineId: "Namboku" }, "zh");
assert.ok(nz.translated.includes("停车位置确认"), "live stopping-position cause must translate");
assert.ok(nz.translated.includes("运行时刻出现紊乱"), "live timetable disruption must translate");
assert.ok(!nz.translated.includes("停止位置確認") && !nz.translated.includes("ダイヤが乱れています"), "known live fragments must not leak Japanese into zh output");

const liveMeguro = "東京メトロ南北線内での停止位置確認の影響で、下り線の一部列車に遅れが出ています。";
const mz = ctx.window.DelayTranslator.translate(liveMeguro, { status: "delayed", lineId: "Meguro" }, "zh");
assert.ok(mz.translated.includes("停车位置确认"), "through-line live cause must translate");
assert.ok(mz.translated.includes("下行线") && mz.translated.includes("出现延误"), "direction and delay semantics must survive translation");
const reducedZh = ctx.window.DelayTranslator.translate("内房線は、台風の影響で、通常の５割程度で運転します。", { status:"notice", lineId:"Uchibo" }, "zh");
assert.ok(reducedZh.translated.includes("约按正常班次的50%运行"), "reduced service must use complete percentage translation");
assert.ok(!reducedZh.translated.includes("5成左右") && !reducedZh.translated.includes("５割"), "reduced service must not fall back to token-by-token translation");
const reducedRangeEn = ctx.window.DelayTranslator.translate("通常の７～８割程度の本数で運転しています。", { status:"notice", lineId:"Test" }, "en");
assert.ok(reducedRangeEn.translated.includes("70%～80%"), "reduced-service range must preserve both percentages");
const throughZh = ctx.window.DelayTranslator.translate("東急線との直通運転を中止しています。", { status:"notice", lineId:"Test" }, "zh");
assert.ok(throughZh.translated.includes("直通运行"), "through-service suspension must translate as a complete sentence");
const innerZh = ctx.window.DelayTranslator.translate("内回り電車に遅れが出ています。", { status:"delayed", lineId:"Yamanote" }, "zh");
assert.ok(innerZh.translated.includes("内环") && innerZh.translated.includes("延误"), "inner-loop delay must translate direction and effect");
const outerEn = ctx.window.DelayTranslator.translate("外回りで運転を見合わせています。", { status:"notice", lineId:"Yamanote" }, "en");
assert.ok(/outer-loop/i.test(outerEn.translated) && /suspended/i.test(outerEn.translated), "outer-loop suspension must translate direction and effect");
const typhoonZh = ctx.window.DelayTranslator.translate("台風の影響で、一部列車に遅れと運休が発生します。", { status:"delayed", lineId:"Test" }, "zh");
assert.ok(typhoonZh.translated.includes("台风"), "typhoon cause must translate locally");
assert.ok(typhoonZh.translated.includes("延误和停运") || (typhoonZh.translated.includes("延误") && typhoonZh.translated.includes("停运")), "delay/cancellation impact must translate locally");
const illnessEn = ctx.window.DelayTranslator.translate("急病人救護の影響で、列車に遅れが出ています。", { status:"delayed", lineId:"Test" }, "en");
assert.ok(/passenger illness/i.test(illnessEn.translated) && /delay/i.test(illnessEn.translated), "passenger illness delay must retain translated operational semantics");
const trackZh = ctx.window.DelayTranslator.translate("線路内立入の影響で、運転を見合わせています。", { status:"suspended", lineId:"Test" }, "zh");
assert.ok(trackZh.translated.includes("人员进入线路") && trackZh.translated.includes("暂停运行"), "track intrusion suspension must translate locally");
const structuredZh = ctx.window.DelayTranslator.translate("詳細は公式発表をご確認ください。", {
  status: "notice",
  lineId: "Test",
  cause: "台風",
  impacts: [
    { interval: "千葉駅→成田駅", direction: "both", effect: "delay" },
    { interval: "成田駅→成田空港駅", direction: "down", effect: "partial_cancellation" }
  ],
  serviceLevel: { minPercent: 50, maxPercent: 70 }
}, "zh");
assert.strictEqual(structuredZh.structured, true, "structured runinfo semantics must be preferred for complex free text");
assert.ok(structuredZh.translated.includes("台风"), "structured cause must translate");
assert.ok(structuredZh.translated.includes("50%～70%"), "structured service level must translate");
assert.ok(structuredZh.translated.includes("延误") && structuredZh.translated.includes("停运"), "structured impacts must translate");
assert.ok(!/公式発表|ご確認/.test(structuredZh.translated), "complex free text must not leak when structured semantics are available");
const structuredEn = ctx.window.DelayTranslator.translate("公式発表をご確認ください。", {
  status: "delayed",
  cause: "停止位置確認",
  interval: "新宿駅→中野駅",
  direction: "up",
  effect: "delay"
}, "en");
assert.ok(/stopping-position check/i.test(structuredEn.translated), "structured English cause must translate");
assert.ok(/upbound/i.test(structuredEn.translated) && /delays/i.test(structuredEn.translated), "structured English direction/effect must translate");
console.log("delay-translator live-20261006: 14 PASS");
