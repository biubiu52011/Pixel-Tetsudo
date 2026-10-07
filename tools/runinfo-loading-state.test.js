const fs=require("fs"),assert=require("assert");
const fusion=fs.readFileSync(require("path").join(__dirname,"../js/data-fusion.js"),"utf8");
const api=fs.readFileSync(require("path").join(__dirname,"../js/runinfo-api.js"),"utf8");
const state=fs.readFileSync(require("path").join(__dirname,"../js/data-state.js"),"utf8");
const card=fs.readFileSync(require("path").join(__dirname,"../js/line-card.js"),"utf8");
const view=fs.readFileSync(require("path").join(__dirname,"../js/realtime-view.js"),"utf8");
assert(!/aggregateStatus\(records, lineObj\) \|\| ["']normal/.test(api));
assert(!/status:\s*w\.status \|\| ["']normal/.test(api));
assert(!/status:\s*d\.status \|\| ["']normal/.test(api));
assert(/awaiting_line_record/.test(fusion));
assert(/getLastGoodDelay\(lineId\)/.test(fusion));
assert(/pt_runinfo_last_good_v1/.test(api) && /pt_runinfo_last_good_v1/.test(fusion));
assert(!/if \(!statusMap\[id\]\) statusMap\[id\] = \{ status: "normal"/.test(fusion));
assert(/source: "initial_check"/.test(fusion));
assert(/: "loading";/.test(card));
assert(/LAST_GOOD_MAX_AGE_MS = 10 \* 60 \* 1000/.test(api));
assert(/LAST_GOOD_MAX_AGE_MS = 10 \* 60 \* 1000/.test(fusion));
assert(/CACHE_TTL_MS = 15 \* 1000/.test(api));
assert(!/CACHE_TTL_MS = 5 \* 60 \* 1000/.test(api));
assert(/Date\.now\(\) - v\.t/.test(api) && /Date\.now\(\) - v\.t/.test(fusion));
assert(!/dInfo \? "normal" : "no_data"/.test(card));
assert(!/delayInfo \? "normal" : "no_data"/.test(view));
assert(/only claim normal when every member is confirmed/.test(card));
// A TrainInformation payload belongs to its explicit railway identity. Missing
// own-line records must never inherit the worst incident from another line of
// the same operator.
const getApiDelayBody=(fusion.match(/function getApiDelayInfo\(line\) \{([\s\S]*?)\n  \}\n\n\n  function fuseLine/)||[])[1]||"";
assert(getApiDelayBody.length>0);
assert(!/aggregateDelayRecords\(raw\)/.test(getApiDelayBody));
assert(/without a matching[\s\S]*railway identity/.test(getApiDelayBody));
console.log("runinfo-loading-state: 20 PASS");

const trainsPage = fs.readFileSync(require("path").join(__dirname, "../js/trains-page.js"), "utf8");
const loader = fs.readFileSync(require("path").join(__dirname, "../data/core/db-loader.js"), "utf8");
assert.ok(!/ensureDataReady/.test(trainsPage), "trains page must not own a startup data poll");
assert.ok(!/_pollTimer|_pollCount/.test(view), "realtime page must not own a startup data poll");
assert.ok(view.includes('pt:railway-error'), "realtime must terminate loading from canonical loader failure");
assert.ok(trainsPage.includes('pt:railway-error'), "trains must terminate loading from canonical loader failure");
assert.ok(loader.includes('if (_loadPromise) return _loadPromise;'), "retry must reuse an in-flight canonical load");
assert.ok(loader.includes('pt:railway-error'), "loader must publish terminal railway failure");
console.log("railway-loading-lifecycle: PASS");
