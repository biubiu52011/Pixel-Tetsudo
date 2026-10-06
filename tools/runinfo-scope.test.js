const fs=require("fs"),vm=require("vm"),assert=require("assert");
const E=require("../js/runinfo-evaluator.js");
const code=fs.readFileSync(require("path").join(__dirname,"../js/runinfo-api.js"),"utf8");
const ctx={window:{RunInfoEvaluator:E,ODPTClient:{LINE_RAILWAY_CODE:{Asakusa:"Asakusa",Shinjuku:"Shinjuku",Oedo:"Oedo"},LINE_TO_OPERATOR:{Asakusa:"Toei",Shinjuku:"Toei",Oedo:"Toei"}}},document:{dispatchEvent(){}} ,CustomEvent:function(){},Promise,Date,console};
vm.createContext(ctx); vm.runInContext(code,ctx);
const A={id:"Asakusa",operator:"Toei"},B={id:"Shinjuku",operator:"Toei"};
const records=[
 {"odpt:railway":"odpt.Railway:Toei.Asakusa","odpt:trainInformationText":{"ja":"全線で運転を見合わせています。"}},
 {"odpt:railway":"odpt.Railway:Toei.Shinjuku","odpt:trainInformationText":{"ja":"現在、平常どおり運転しています。"}}
];
assert.strictEqual(ctx.window.RunInfoAPI._aggregateStatus(records,A),"suspended");
assert.strictEqual(ctx.window.RunInfoAPI._aggregateStatus(records,B),"normal");
assert.strictEqual(ctx.window.RunInfoAPI._selectScopedRecords(records,B).length,1);
const global=[...records,{"odpt:trainInformationText":{"ja":"ダイヤが乱れています。"}}];
assert.strictEqual(ctx.window.RunInfoAPI._aggregateStatus(global,B),"normal"); // own record wins over global
assert.strictEqual(ctx.window.RunInfoAPI._aggregateStatus(global,{id:"Oedo",operator:"Toei"}),"delayed"); // no own record -> global only
console.log("runinfo-scope: 5 PASS");


// Cross-operator same-code invariant: railway short code is not globally unique.
const tobuLine={id:"Utsunomiya",operator:"Tobu"};
ctx.window.ODPTClient.LINE_RAILWAY_CODE.Utsunomiya="Utsunomiya";
const sameCode=[
 {"odpt:railway":"odpt.Railway:JR-East.Utsunomiya","odpt:trainInformationStatus":"Suspension","odpt:trainInformationText":{"ja":"JR suspended"}},
 {"odpt:railway":"odpt.Railway:Tobu.Utsunomiya","odpt:trainInformationStatus":"Normal","odpt:trainInformationText":{"ja":"Tobu normal"}}
];
const tobuScoped=ctx.window.RunInfoAPI._selectScopedRecords(sameCode,tobuLine);
assert.strictEqual(tobuScoped.length,1);
assert.strictEqual(tobuScoped[0]["odpt:railway"],"odpt.Railway:Tobu.Utsunomiya");
assert.strictEqual(ctx.window.RunInfoAPI._aggregateStatus(sameCode,tobuLine),"normal");
const unresolved=ctx.window.RunInfoAPI._selectScopedRecords(sameCode,{id:"Utsunomiya"});
assert.strictEqual(unresolved.length,0);
console.log("runinfo-scope namespace: 4 PASS");


// Same-operator exact-code invariant: similar/prefix railway codes must not match.
const similarCodes=[
 {"odpt:railway":"odpt.Railway:Tobu.UtsunomiyaBranch","odpt:trainInformationStatus":"Suspension","odpt:trainInformationText":{"ja":"branch suspended"}},
 {"odpt:railway":"odpt.Railway:Tobu.Kinugawa","odpt:trainInformationStatus":"Delay","odpt:trainInformationText":{"ja":"kinugawa delayed"}},
 {"odpt:railway":"odpt.Railway:Tobu.Utsunomiya","odpt:trainInformationStatus":"Normal","odpt:trainInformationText":{"ja":"utsunomiya normal"}}
];
const exactScoped=ctx.window.RunInfoAPI._selectScopedRecords(similarCodes,tobuLine);
assert.strictEqual(exactScoped.length,1);
assert.strictEqual(exactScoped[0]["odpt:railway"],"odpt.Railway:Tobu.Utsunomiya");
assert.strictEqual(ctx.window.RunInfoAPI._aggregateStatus(similarCodes,tobuLine),"normal");
console.log("runinfo-scope exact-code: 3 PASS");


// Structured-only official record must remain authoritative even without text.
const structuredOnly=[
 {"odpt:railway":"odpt.Railway:Tobu.Utsunomiya","odpt:trainInformationStatus":"Suspension","dc:date":"2026-10-01T12:00:00+09:00"}
];
assert.strictEqual(ctx.window.RunInfoAPI._selectScopedRecords(structuredOnly,tobuLine).length,1);
assert.strictEqual(ctx.window.RunInfoAPI._aggregateStatus(structuredOnly,tobuLine),"suspended");
console.log("runinfo-scope structured-only: 2 PASS");


// Nippori-Toneri Liner is an official Toei TrainInformation line.
// Canonical ODPT mapping must win even when presentation metadata uses a localized operator name.
ctx.window.ODPTClient.LINE_RAILWAY_CODE.NipporiToneri="NipporiToneri";
ctx.window.ODPTClient.LINE_TO_OPERATOR.NipporiToneri="Toei";
const ntLine={id:"NipporiToneri",operator:"東京都交通局"};
const ntRecords=[
 {"odpt:railway":"odpt.Railway:Toei.NipporiToneri","odpt:trainInformationText":{"ja":"平常運転"}}
];
assert.strictEqual(ctx.window.RunInfoAPI._selectScopedRecords(ntRecords,ntLine).length,1);
assert.strictEqual(ctx.window.RunInfoAPI._aggregateStatus(ntRecords,ntLine),"normal");
console.log("runinfo-scope Nippori-Toneri: 2 PASS");

// Notices must not outrank current realtime state in a mixed ODPT response.
const mixedNoticeRealtime=[
 {"odpt:railway":"odpt.Railway:Toei.Asakusa","pt:messageKind":"notice","odpt:trainInformationStatus":"Suspension","odpt:trainInformationText":{"ja":"明日は全線で運転を見合わせます。"}},
 {"odpt:railway":"odpt.Railway:Toei.Asakusa","pt:messageKind":"realtime","odpt:trainInformationStatus":"Normal","odpt:trainInformationText":{"ja":"現在、平常どおり運転しています。"}}
];
assert.strictEqual(ctx.window.RunInfoAPI._aggregateStatus(mixedNoticeRealtime,A),"normal");
const noticeOnly=[
 {"odpt:railway":"odpt.Railway:Toei.Asakusa","pt:messageKind":"notice","odpt:trainInformationStatus":"Suspension","odpt:trainInformationText":{"ja":"明日は全線で運転を見合わせます。"}}
];
assert.strictEqual(ctx.window.RunInfoAPI._aggregateStatus(noticeOnly,A),"notice");
console.log("runinfo-scope notice isolation: 2 PASS");
