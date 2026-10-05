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
console.log("delay-translator live-20261005: 5 PASS");
