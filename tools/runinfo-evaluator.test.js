const assert = require("assert");
const E = require("../js/runinfo-evaluator.js");
function st(text){ return E.evaluate({text}).status; }
assert.strictEqual(st("現在、平常通り運転しています。"), "normal");
assert.strictEqual(st("現在、平常どおり運転しています。"), "normal");
let toei=E.evaluate({text:"現在、１５分以上の遅延はありません。"});
assert.strictEqual(toei.status,"normal"); assert.strictEqual(toei.maxDelay,null); assert.strictEqual(toei.delayUpperBoundMinutes,15);
assert.strictEqual(st("一部列車が運休しています。"),"notice");
assert.strictEqual(st("全線で運転を見合わせています。"),"suspended");
assert.strictEqual(st("B線の運転見合わせの影響により、B線との直通運転を中止しています。"),"notice");
assert.strictEqual(st("B線との直通運転を中止しています。ダイヤが乱れています。"),"delayed");
assert.strictEqual(st("A駅～B駅間で運転を見合わせています。"),"suspended");
assert.strictEqual(st("運休のお知らせがあります。"),"info");
assert.strictEqual(E.evaluate({structuredStatus:"Suspension",text:"直通運転を中止しています。"}).status,"suspended");
assert.strictEqual(E.evaluate({signalStatus:"delayed",text:""}).status,"delayed");
console.log("runinfo-evaluator: 11 PASS");
