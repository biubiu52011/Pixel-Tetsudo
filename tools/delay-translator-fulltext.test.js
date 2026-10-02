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
