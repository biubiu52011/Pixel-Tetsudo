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


// Cross-operator same-code invariant: railway short code is not globally unique.
const tobuLine={id:"Utsunomiya",operator:"Tobu"};
window.ODPTClient.LINE_RAILWAY_CODE.Utsunomiya="Utsunomiya";
const sameCode=[
 {"odpt:railway":"odpt.Railway:JR-East.Utsunomiya","odpt:trainInformationStatus":"Suspension","odpt:trainInformationText":{"ja":"JR suspended"}},
 {"odpt:railway":"odpt.Railway:Tobu.Utsunomiya","odpt:trainInformationStatus":"Normal","odpt:trainInformationText":{"ja":"Tobu normal"}}
];
const tobuScoped=api._selectScopedRecords(sameCode,tobuLine);
assert.strictEqual(tobuScoped.length,1);
assert.strictEqual(tobuScoped[0]["odpt:railway"],"odpt.Railway:Tobu.Utsunomiya");
assert.strictEqual(api._aggregateStatus(sameCode,tobuLine),"normal");
const unresolved=api._selectScopedRecords(sameCode,{id:"Utsunomiya"});
assert.strictEqual(unresolved.length,0);
console.log("runinfo-scope namespace: 4 PASS");
