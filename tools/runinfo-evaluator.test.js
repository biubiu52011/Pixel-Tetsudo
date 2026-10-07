const assert = require("assert");
const E = require("../js/runinfo-evaluator.js");
function st(text){ return E.evaluate({text}).status; }
assert.strictEqual(st("現在、平常通り運転しています。"), "normal");
assert.strictEqual(st("現在、平常どおり運転しています。"), "normal");
assert.strictEqual(st("平常運転"), "normal");
assert.strictEqual(st("平常運行"), "normal");
assert.strictEqual(st("通常運転"), "normal");
let toei=E.evaluate({text:"現在、１５分以上の遅延はありません。"});
assert.strictEqual(toei.status,"normal"); assert.strictEqual(toei.maxDelay,null); assert.strictEqual(toei.delayUpperBoundMinutes,15);
assert.strictEqual(st("一部列車が運休しています。"),"notice");
assert.strictEqual(st("全線で運転を見合わせています。"),"suspended");
assert.strictEqual(st("B線の運転見合わせの影響により、B線との直通運転を中止しています。"),"notice");
assert.strictEqual(st("B線との直通運転を中止しています。ダイヤが乱れています。"),"delayed");
assert.strictEqual(st("A駅～B駅間で運転を見合わせています。"),"notice");
assert.strictEqual(st("運休のお知らせがあります。"),"info");
assert.strictEqual(E.evaluate({structuredStatus:"Suspension",text:"直通運転を中止しています。"}).status,"suspended");
assert.strictEqual(E.evaluate({signalStatus:"delayed",text:""}).status,"delayed");
let meta=E.evaluate({structuredStatus:"Delay",text:"信号確認のため約12分遅れています。18時08分頃再開予定。",range:"A駅間～B駅間",cause:"信号確認",resumeEstimate:"2026-10-02T18:08:00+09:00"});
assert.strictEqual(meta.status,"delayed");
assert.strictEqual(meta.maxDelay,12);
assert.strictEqual(meta.interval,"A駅→B駅");
assert.strictEqual(meta.cause,"信号確認");
assert.strictEqual(meta.resume,"18:08");
assert.ok(meta.detail.indexOf("信号確認")>=0);
let clockOnly=E.evaluate({structuredStatus:"Normal",text:"18時08分頃に再開しました。"});
assert.strictEqual(clockOnly.maxDelay,null);
let stations=E.extractMetadata({stationFromName:"新宿",stationToName:"中野",text:""});
assert.strictEqual(stations.interval,"新宿→中野");
let textRange=E.extractMetadata({text:"A駅～B駅間で運転を見合わせています。"});
assert.strictEqual(textRange.interval,"A駅→B駅");
let liveRange=E.extractMetadata({text:"長野原草津口〜大前駅間の上下線で運転を見合わせています。"});
assert.strictEqual(liveRange.interval,"長野原草津口→大前駅");
let fromToRange=E.extractMetadata({text:"A駅からB駅までの上下線で運転を見合わせています。"});
assert.strictEqual(fromToRange.interval,"A駅→B駅");
let fromToDown=E.extractMetadata({text:"新宿駅から中野駅までの下り線で遅れが出ています。"});
assert.strictEqual(fromToDown.interval,"新宿駅→中野駅");
let causeBeforeRange=E.extractMetadata({text:"駒込駅での安全確認の影響により、新宿駅から中野駅までの上り線で遅れが出ています。"});
assert.strictEqual(causeBeforeRange.interval,"新宿駅→中野駅");
let multiRange=E.extractMetadata({text:"千葉駅～成田駅間・成田駅～成田空港駅間の上下線の一部列車に遅れと運休が出ています。"});
assert.strictEqual(multiRange.interval,"千葉駅→成田駅、成田駅→成田空港駅");
let directionOnly=E.extractMetadata({text:"下り線の一部列車に遅れが出ています。"});
assert.strictEqual(directionOnly.interval,null);
let wholeRange=E.extractMetadata({text:"全線で運転を見合わせています。"});
assert.strictEqual(wholeRange.interval,"全線");
let structuredWins=E.extractMetadata({text:"A駅～B駅間で遅れています。",range:"C駅～D駅"});
assert.strictEqual(structuredWins.interval,"C駅→D駅");
let reduced=E.evaluate({text:"内房線（木更津～安房鴨川駅間）は、台風の影響で、通常の５割程度で運転します。"});
assert.strictEqual(reduced.status,"notice");
let sectionCancelled=E.evaluate({text:"只見～小出駅間の下り線で一部列車が区間運休となります。"});
assert.strictEqual(sectionCancelled.status,"notice");
let noRangeDirection=E.extractMetadata({text:"下り線（日吉方面行）の列車に遅れが出ています。"});
assert.strictEqual(noRangeDirection.interval,null);
let halfService=E.extractMetadata({text:"通常の５割程度で運転します。"});
assert.deepStrictEqual(halfService.serviceLevel,{minPercent:50,maxPercent:50});
let rangedService=E.extractMetadata({text:"通常の７～８割程度で運転しています。"});
assert.deepStrictEqual(rangedService.serviceLevel,{minPercent:70,maxPercent:80});
let noServiceLevel=E.extractMetadata({text:"下り線の一部列車に遅れが出ています。"});
assert.strictEqual(noServiceLevel.serviceLevel,null);
let typhoonSuspension=E.evaluate({structuredStatus:"Suspension",text:"台風の影響で全線で運転を見合わせています。"});
assert.strictEqual(typhoonSuspension.messageKind,"realtime");
assert.strictEqual(typhoonSuspension.status,"suspended");
let typhoonNotice=E.evaluate({messageKind:"notice",text:"台風接近に伴う今後の運転計画についてお知らせします。"});
assert.strictEqual(typhoonNotice.messageKind,"notice");
assert.notStrictEqual(typhoonNotice.status,"suspended");
let typhoonUnknown=E.evaluate({text:"台風に関する情報です。"});
assert.strictEqual(typhoonUnknown.messageKind,"unknown");
let unknownOperationalText=E.evaluate({text:"全線で運転を見合わせています。"});
assert.strictEqual(unknownOperationalText.messageKind,"unknown");
assert.strictEqual(unknownOperationalText.status,"suspended");
assert.strictEqual(unknownOperationalText.symbol,null);
let officialTextOnly=E.evaluate({currentOperationalSource:true,text:"全線で運転を見合わせています。"});
assert.strictEqual(officialTextOnly.messageKind,"realtime");
assert.strictEqual(officialTextOnly.status,"suspended");
assert.strictEqual(officialTextOnly.symbol,"×");
let plannedNoticeWithImpact=E.evaluate({messageKind:"notice",text:"明日は台風の影響で一部列車を運休します。"});
assert.strictEqual(plannedNoticeWithImpact.messageKind,"notice");
assert.strictEqual(plannedNoticeWithImpact.status,"notice");
let realtimeNormal=E.evaluate({messageKind:"realtime",structuredStatus:"Normal",text:"平常通り運転しています。"});
assert.strictEqual(realtimeNormal.symbol,"○");
let realtimeWholeStop=E.evaluate({messageKind:"realtime",text:"全線で運転を見合わせています。"});
assert.strictEqual(realtimeWholeStop.status,"suspended");
assert.strictEqual(realtimeWholeStop.symbol,"×");
let realtimePartialStop=E.evaluate({messageKind:"realtime",text:"新宿駅～中野駅間で運転を見合わせています。"});
assert.strictEqual(realtimePartialStop.status,"notice");
assert.strictEqual(realtimePartialStop.symbol,"△");
let realtimeThroughStop=E.evaluate({messageKind:"realtime",text:"東急線との直通運転を中止しています。"});
assert.strictEqual(realtimeThroughStop.status,"notice");
assert.strictEqual(realtimeThroughStop.symbol,"△");
let realtimeDelay=E.evaluate({messageKind:"realtime",text:"下り線の一部列車に遅れが出ています。"});
assert.strictEqual(realtimeDelay.symbol,"△");
let noticeSymbol=E.evaluate({messageKind:"notice",text:"明日の運転計画についてお知らせします。"});
assert.strictEqual(noticeSymbol.symbol,"!");
let noticeWholeStop=E.evaluate({messageKind:"notice",structuredStatus:"Suspension",text:"台風の影響により全線で運転を見合わせます。"});
assert.strictEqual(noticeWholeStop.messageKind,"notice");
assert.strictEqual(noticeWholeStop.status,"notice");
assert.strictEqual(noticeWholeStop.symbol,"!");
assert.strictEqual(noticeWholeStop.interval,"全線");
assert.strictEqual(noticeWholeStop.effect,"suspension");
assert.ok(noticeWholeStop.evidence.some(function(x){return x.type==="NOTICE_STATUS_ISOLATION";}));
let structuredPartial=E.evaluate({messageKind:"realtime",structuredStatus:"Suspension",range:"新宿駅～中野駅",text:"新宿駅～中野駅間で運転を見合わせています。"});
assert.strictEqual(structuredPartial.status,"notice");
assert.strictEqual(structuredPartial.symbol,"△");
let structuredWhole=E.evaluate({messageKind:"realtime",structuredStatus:"Suspension",range:"全線",text:"全線で運転を見合わせています。"});
assert.strictEqual(structuredWhole.status,"suspended");
assert.strictEqual(structuredWhole.symbol,"×");
let upDelay=E.extractMetadata({text:"上り線の一部列車に遅れが出ています。"});
assert.strictEqual(upDelay.interval,null);
assert.strictEqual(upDelay.direction,"up");
assert.strictEqual(upDelay.effect,"delay");
let downStop=E.extractMetadata({text:"下り線で運転を見合わせています。"});
assert.strictEqual(downStop.interval,null);
assert.strictEqual(downStop.direction,"down");
assert.strictEqual(downStop.effect,"suspension");
let innerDelay=E.extractMetadata({text:"内回り電車に遅れが出ています。"});
assert.strictEqual(innerDelay.direction,"inner");
assert.strictEqual(innerDelay.effect,"delay");
let outerStop=E.extractMetadata({text:"外回りで運転を見合わせています。"});
assert.strictEqual(outerStop.direction,"outer");
assert.strictEqual(outerStop.effect,"suspension");
let rangeDownStop=E.extractMetadata({text:"新宿駅～中野駅間の下り線で運転を見合わせています。"});
assert.strictEqual(rangeDownStop.interval,"新宿駅→中野駅");
assert.strictEqual(rangeDownStop.direction,"down");
assert.strictEqual(rangeDownStop.effect,"suspension");
let bothDelay=E.extractMetadata({text:"千葉駅～成田駅間の上下線で遅れが出ています。"});
assert.strictEqual(bothDelay.interval,"千葉駅→成田駅");
assert.strictEqual(bothDelay.direction,"both");
assert.strictEqual(bothDelay.effect,"delay");
let upSuspensionState=E.evaluate({messageKind:"realtime",text:"上り線で運転を見合わせています。"});
assert.strictEqual(upSuspensionState.status,"notice");
assert.strictEqual(upSuspensionState.symbol,"△");
let outerSuspensionState=E.evaluate({messageKind:"realtime",text:"外回りで運転を見合わせています。"});
assert.strictEqual(outerSuspensionState.status,"notice");
assert.strictEqual(outerSuspensionState.symbol,"△");
let splitDirections=E.extractMetadata({text:"上り線で運転を見合わせています。下り線では遅れが出ています。"});
assert.deepStrictEqual(splitDirections.impacts,[
  {interval:null,direction:"up",effect:"suspension"},
  {interval:null,direction:"down",effect:"delay"}
]);
let loopMixed=E.extractMetadata({text:"内回り電車に遅れが出ています。外回りは平常通り運転しています。"});
assert.deepStrictEqual(loopMixed.impacts,[
  {interval:null,direction:"inner",effect:"delay"},
  {interval:null,direction:"outer",effect:"normal"}
]);
let splitRanges=E.extractMetadata({text:"A駅～B駅間で運転を見合わせています。C駅～D駅間では遅れが出ています。"});
assert.deepStrictEqual(splitRanges.impacts,[
  {interval:"A駅→B駅",direction:null,effect:"suspension"},
  {interval:"C駅→D駅",direction:null,effect:"delay"}
]);
let scopedBothStop=E.evaluate({messageKind:"realtime",structuredStatus:"Suspension",text:"X線（A〜B駅間）は、設備点検の影響で、上下線で終日運転を見合わせます。"});
assert.strictEqual(scopedBothStop.status,"notice");
assert.strictEqual(scopedBothStop.symbol,"△");
assert.deepStrictEqual(scopedBothStop.impacts,[
  {interval:"A→B駅",direction:"both",effect:"suspension"}
]);
let scopedDirectionEffects=E.extractMetadata({text:"A駅～B駅間の上り線で運転を見合わせています。下り線では遅れが出ています。"});
assert.deepStrictEqual(scopedDirectionEffects.impacts,[
  {interval:"A駅→B駅",direction:"up",effect:"suspension"},
  {interval:"A駅→B駅",direction:"down",effect:"delay"}
]);
let genericMultiRange=E.extractMetadata({text:"A駅～B駅間で運転を見合わせています。C駅～D駅間では遅れが出ています。"});
assert.deepStrictEqual(genericMultiRange.impacts,[
  {interval:"A駅→B駅",direction:null,effect:"suspension"},
  {interval:"C駅→D駅",direction:null,effect:"delay"}
]);
let genericDirections=E.extractMetadata({text:"A駅～B駅間の上り線で運転を見合わせています。下り線では遅れが出ています。"});
assert.deepStrictEqual(genericDirections.impacts,[
  {interval:"A駅→B駅",direction:"up",effect:"suspension"},
  {interval:"A駅→B駅",direction:"down",effect:"delay"}
]);
let genericThroughAndDelay=E.extractMetadata({text:"Y線との直通運転を中止しています。本線の下り線では遅れが出ています。"});
assert.deepStrictEqual(genericThroughAndDelay.impacts,[
  {interval:null,direction:null,effect:"through_suspension"},
  {interval:null,direction:"down",effect:"delay"}
]);
let genericSharedEffect=E.extractMetadata({text:"A駅～B駅間・C駅～D駅間で運転を見合わせています。"});
assert.deepStrictEqual(genericSharedEffect.impacts,[
  {interval:"A駅→B駅",direction:null,effect:"suspension"},
  {interval:"C駅→D駅",direction:null,effect:"suspension"}
]);
console.log("runinfo-evaluator: generic scope PASS");
