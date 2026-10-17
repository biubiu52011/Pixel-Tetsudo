// Exercise the shipped controllers/renderer against the captured network.
window.addEventListener('load',()=>setTimeout(async()=>{
  const output=document.createElement('pre');output.id='browser-replay-result';
  try {
    await window.__replayReady;
    const id=location.hash.slice(1), svg=document.querySelector('#trainsMapContainer svg');
    if(!svg||svg.getAttribute('data-line-id')!==id)throw new Error('Target railway SVG not mounted');
    const render=window.TrainsPage.getPerformanceSamples(),fusion=window.DataFusion.getPerformanceSamples();
    if(!render.length)throw new Error('No actual renderer measurements');
    const worstRender=Math.max(...render.map(x=>x.ms));
    const position=fusion.filter(x=>x.name==='loadTrainPositions');
    const worstPosition=Math.max(0,...position.map(x=>x.ms));
    if(worstRender>500)throw new Error('SVG render budget exceeded: '+worstRender+'ms');
    if(worstPosition>2000)throw new Error('Position processing budget exceeded: '+worstPosition+'ms');
    const markers=[...svg.querySelectorAll('[data-train-id]')].map(n=>n.getAttribute('data-train-id'));
    if(new Set(markers).size!==markers.length)throw new Error('Duplicate marker identities');
    if(id==='SaikyoKawagoe'&&!markers.length)throw new Error('Captured realtime trains missing');
    if(id==='JobanLocal'&&!markers.length)throw new Error('Captured through-service trains missing');
    if(window.ODPTClient.getRequestMetrics().started>24||window.__replayRequests.total>40)throw new Error('Request fan-out budget exceeded');
    const rendersBefore=window.TrainsPage.getPerformanceSamples().length;
    window.DataState.setLines(window.DataFusion.getFusedData().lines,{kind:'positions',lines:{[id]:{position:false,display:false,metadata:true}}});
    if(window.TrainsPage.getPerformanceSamples().length!==rendersBefore)throw new Error('Metadata-only event restarted SVG rendering');
    const perf=window.__replayPerformance,frames=[...perf.frameTimes].sort((a,b)=>a-b);
    const frameP95=frames[Math.floor(frames.length*.95)]||0;
    const longestTask=Math.max(0,...perf.longTasks);
    if(frames.length<20||frameP95>50)throw new Error('Frame-time budget exceeded: '+frameP95+'ms over '+frames.length+' frames');
    if(longestTask>2000)throw new Error('Main-thread long-task budget exceeded: '+longestTask+'ms');
    const status=window.ODPTClient.getTrainRunStatus(id);
    if(id==='Agatsuma'&&(!status||status.runs!==6))throw new Error('Agatsuma limited SQL coverage lost');
    if(id==='ChuoMain'&&(!status||!status.partial||status.omittedIncompleteRuns!==43))throw new Error('Chuo partial coverage lost');
    output.textContent=JSON.stringify({id,markers:markers.length,worstRenderMs:worstRender,worstPositionMs:worstPosition,
      frameP95Ms:Math.round(frameP95*10)/10,longestTaskMs:longestTask,network:window.ODPTClient.getRequestMetrics(),fixture:window.__replayRequests,sql:status||null});
    output.setAttribute('data-replay-state','passed');
  } catch(e) {output.textContent=e.stack||e.message;output.setAttribute('data-replay-state','failed');}
  document.body.appendChild(output);
},8000));
