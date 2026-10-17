const fs=require('fs'),vm=require('vm'),zlib=require('zlib'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
function replay(resolverSource) {
  const c={window:{},Date,Intl,URL,URLSearchParams,AbortController,AbortSignal,
    console:{debug(){},warn(){}},document:{addEventListener(){}},setTimeout(){},clearTimeout(){},
    localStorage:{getItem(){return null;}},atob:x=>Buffer.from(x,'base64').toString()};
  c.window.addEventListener=()=>{};vm.createContext(c);
  for(const file of ['js/common.js','data/core/data-config-bundle.js','data/api/odpt-links.js']) {
    vm.runInContext(read(file),c);Object.assign(c,c.window);
  }
  const client=read('data/api/odpt-unified.js');
  vm.runInContext(client.slice(0,client.lastIndexOf('    if (window.ODPT_LAZY === true)'))+'window.adapt=_trainRunToTimetable;})();',c);
  c.window.UNIFIED_LINES=JSON.parse(read('data/core/railway_data.json')).lines;
  vm.runInContext(resolverSource.replace('function _confirmedEdge(a,b,joins){',
    'function _confirmedEdge(a,b,joins){ window._edgeChecks=(window._edgeChecks||0)+1;'),c);
  const captures=JSON.parse(zlib.gunzipSync(fs.readFileSync('tests/fixtures/guards/network-har-replay.json.gz')));
  const results=[];
  for(const scenario of ['ChuoMain','JobanLocal']) {
    const pools={};
    for(const [key,body]of Object.entries(captures[scenario].responses))if(key.includes('/train-runs|'))pools[body.line_id]=body.runs.map(c.window.adapt).filter(Boolean);
    for(const id of Object.keys(pools)) {
      const api=c.window.RunningChainResolver, peers=api.getDirectThroughLines(id);
      let candidates=[];
      for(const other of peers)candidates.push(...(pools[other]||[]).map(timetable=>({lineId:other,timetable})));
      for(const other of peers)for(const next of api.getDirectThroughLines(other))if(next!==id)candidates.push(...(pools[next]||[]).map(timetable=>({lineId:next,timetable})));
      const rows=pools[id],selected=[0,Math.floor(rows.length/2),rows.length-1].filter((x,i,a)=>a.indexOf(x)===i);
      for(const index of selected)results.push({scenario,id,index,result:api.resolveTimetableChain(rows[index],id,candidates)});
    }
  }
  results.checkedPairs=c.window._edgeChecks||0;
  return results;
}
const actual=replay(read('js/running-chain-resolver.js'));
assert.equal(JSON.stringify(actual),JSON.stringify(JSON.parse(read('tests/fixtures/guards/running-chain-har-golden.json'))),'indexed boundary graph preserves pre-refactor chain identities, ambiguity and evidence');
assert(actual.checkedPairs<5000,'boundary graph candidate work budget exceeded');
console.log('running-chain HAR replay: '+actual.length+' roots, '+actual.checkedPairs+' candidate checks, original results preserved PASS');
