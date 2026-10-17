// CI-only headless Chromium driver; use real time so CPU measurements stay real.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawn}=require('node:child_process');
const productionBase=process.argv[2]==='--production'?new URL(process.argv[3]):null;
const output=productionBase?'.work/production-browser':'.work/browser-replay';fs.mkdirSync(output,{recursive:true});
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'pixel-replay-'));
const chrome=spawn(process.env.CHROME_BIN||'google-chrome',['--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
  '--remote-debugging-port=9222','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe']});
chrome.stderr.on('data',data=>fs.appendFileSync(path.join(output,'chromium.log'),data));
let launchError;chrome.on('error',e=>{launchError=e;});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function connect(url) {
  const socket=new WebSocket(url),pending=new Map();let serial=0;
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  socket.addEventListener('message',event=>{const data=JSON.parse(event.data),waiter=pending.get(data.id);if(!waiter)return;pending.delete(data.id);data.error?waiter.reject(new Error(data.error.message)):waiter.resolve(data.result);});
  return {close:()=>socket.close(),call:(method,params={})=>new Promise((resolve,reject)=>{
    const id=++serial;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));
  })};
}
async function main() {
  let ready=false;
  for(let attempt=0;attempt<100;attempt++) {
    if(launchError)throw launchError;
    try{const r=await fetch('http://127.0.0.1:9222/json/version');if(r.ok){ready=true;break;}}catch{}
    await delay(100);
  }
  if(!ready)throw new Error('Headless Chromium did not become ready');
  for(const id of (productionBase?['home','realtime','trains']:['SaikyoKawagoe','ChuoMain','Agatsuma','JobanLocal'])) {
    const url=productionBase?new URL('pages/'+id+'.html'+(id==='trains'?'#SaikyoKawagoe':''),productionBase).href:
      'http://127.0.0.1:8789/pages/trains.html?replay=1&case='+id+'#'+id;
    const target=await (await fetch('http://127.0.0.1:9222/json/new?'+encodeURIComponent(url),{method:'PUT'})).json();
    const page=await connect(target.webSocketDebuggerUrl);
    try {
      let result='',state='';
      for(let attempt=0;attempt<225;attempt++) {
        if(productionBase){
          const value=await page.call('Runtime.evaluate',{expression:
            'document.readyState === "complete" && document.querySelector("#app[data-site-shell-root]") && '+
            (id==='trains'?'document.querySelector("#trainsMapContainer svg")':id==='realtime'?'document.querySelector("#realtimeStatusContainer .rs-line-card")':'document.querySelector("#searchContainer")')+' ? "ready" : ""',returnByValue:true});
          if(value.result?.value==='ready'){
            if(id==='trains'){
              const back=await page.call('Runtime.evaluate',{expression:'document.getElementById("trainsBackBtn").click(); document.getElementById("trainsDetailView").classList.contains("hidden")',returnByValue:true});
              if(!back.result?.value)throw new Error('Production back interaction did not restore the overview');
            }
            result=JSON.stringify({id,url,criticalInteraction:'passed'});state='data-replay-state="passed"';break;
          }
          await delay(200);continue;
        }
        const value=await page.call('Runtime.evaluate',{expression:'document.getElementById("browser-replay-result")?.outerHTML || ""',returnByValue:true});
        state=value.result?.value||'';
        if(state){const text=await page.call('Runtime.evaluate',{expression:'document.getElementById("browser-replay-result").textContent',returnByValue:true});result=text.result?.value||'';break;}
        await delay(200);
      }
      fs.writeFileSync(path.join(output,id+'.json'),result||'No completed browser result');
      const screenshot=await page.call('Page.captureScreenshot',{format:'png'});
      fs.writeFileSync(path.join(output,id+'.png'),Buffer.from(screenshot.data,'base64'));
      if(!state.includes('data-replay-state="passed"'))throw new Error(id+' browser replay failed: '+result);
      console.log(result);
    } finally {page.close();await fetch('http://127.0.0.1:9222/json/close/'+target.id);}
  }
}
const watchdog=setTimeout(()=>{console.error('Browser replay deadline exceeded');chrome.kill();process.exit(1);},240000);
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{clearTimeout(watchdog);chrome.kill();});
