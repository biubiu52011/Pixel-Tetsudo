// Test-only bootstrap: all remote fetches resolve from captured public data.
(() => {
  window.__replayPerformance={longTasks:[],frameTimes:[]};
  if(window.PerformanceObserver&&PerformanceObserver.supportedEntryTypes.includes('longtask'))new PerformanceObserver(list=>{
    for(const entry of list.getEntries())window.__replayPerformance.longTasks.push(entry.duration);
  }).observe({type:'longtask',buffered:true});
  let lastFrame;
  function frame(now){if(lastFrame!==undefined)window.__replayPerformance.frameTimes.push(now-lastFrame);lastFrame=now;if(window.__replayPerformance.frameTimes.length<600)requestAnimationFrame(frame);}
  requestAnimationFrame(frame);
  const nativeFetch=window.fetch.bind(window),NativeDate=Date,start=performance.now();
  const scenario=new URL(location.href).searchParams.get('case')||'SaikyoKawagoe';
  const ready=nativeFetch('/__replay-data?case='+encodeURIComponent(scenario)).then(r=>r.json()).then(f=>{
    const base=NativeDate.parse(f.at);
    window.Date=class extends NativeDate {
      constructor(...args){super(...(args.length?args:[base+performance.now()-start]));}
      static now(){return base+performance.now()-start;}
    };
    return f;
  });
  window.__replayRequests={total:0,missing:0};
  window.fetch=async function(input,options){
    const url=new URL(typeof input==='string'?input:input.url,location.href);
    if(url.origin===location.origin)return nativeFetch(input,options);
    window.__replayRequests.total++;
    const fixture=await ready;
    const params=['odpt:operator','odpt:railway','odpt:calendar','line_id'].map(k=>url.searchParams.get(k)||'');
    const key=url.pathname+'|'+params.join('|');
    let value=fixture.responses[key];
    if(value===undefined){
      window.__replayRequests.missing++;
      // Missing capture is an error, never an invented empty source response.
      throw new Error('Resource not present in HAR fixture');
    }
    return new Response(JSON.stringify(value),{status:200,headers:{'Content-Type':'application/json'}});
  };
  window.__replayReady=ready;
})();
