const fs=require("fs"),vm=require("vm"),assert=require("assert");
const E=require("../js/runinfo-evaluator.js");
const code=fs.readFileSync(require("path").join(__dirname,"../js/runinfo-api.js"),"utf8");
const ctx={window:{RunInfoEvaluator:E,ODPTClient:{LINE_RAILWAY_CODE:{Asakusa:"Asakusa",Shinjuku:"Shinjuku"}}},document:{dispatchEvent(){}} ,CustomEvent:function(){},Promise,Date,console};
vm.createContext(ctx); vm.runInContext(code,ctx);
const A={id:"Asakusa"},B={id:"Shinjuku"};
const records=[
 {"odpt:railway":"odpt.Railway:Toei.Asakusa","odpt:trainInformationText":{"ja":"全線で運転を見合わせています。"}},
 {"odpt:railway":"odpt.Railway:Toei.Shinjuku","odpt:trainInformationText":{"ja":"現在、平常どおり運転しています。"}}
];
assert.strictEqual(ctx.window.RunInfoAPI._aggregateStatus(records,A),"suspended");
assert.strictEqual(ctx.window.RunInfoAPI._aggregateStatus(records,B),"normal");
assert.strictEqual(ctx.window.RunInfoAPI._selectScopedRecords(records,B).length,1);
const global=[...records,{"odpt:trainInformationText":{"ja":"ダイヤが乱れています。"}}];
assert.strictEqual(ctx.window.RunInfoAPI._aggregateStatus(global,B),"normal"); // own record wins over global
assert.strictEqual(ctx.window.RunInfoAPI._aggregateStatus(global,{id:"Oedo"}),"delayed"); // no own record -> global only
console.log("runinfo-scope: 5 PASS");
