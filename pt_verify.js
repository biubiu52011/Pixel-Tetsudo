const http = require('http');
const WebSocket = globalThis.WebSocket;
const fs = require('fs');

function httpJson(path, method) {
  return new Promise((res, rej) => {
    const req = http.request({ host: 'localhost', port: 9335, path, method: method || 'GET' }, r => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(new Error(d.slice(0,80))); } });
    });
    req.on('error', rej); req.end();
  });
}

(async () => {
  // create a new tab pointing at home.html
  const target = await httpJson('/json/new?http://localhost:8017/pages/home.html', 'PUT');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0; const pending = {};
  const send = (method, params) => new Promise((res, rej) => {
    const mid = ++id; pending[mid] = { res, rej };
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
  const errors = [];
  ws.addEventListener('message', ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending[msg.id]) { pending[msg.id].res(msg.result); delete pending[msg.id]; }
    if (msg.method === 'Runtime.exceptionThrown') errors.push((msg.params.exceptionDetails.exception && msg.params.exceptionDetails.exception.description || '').slice(0, 200));
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') errors.push('console.error: ' + (msg.params.args || []).map(a => a.value || a.description || '').join(' ').slice(0, 200));
  });
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  await send('Runtime.enable', {});
  await send('Page.enable', {});
  await new Promise(r => setTimeout(r, 9000)); // wait for app init

  const evl = async expr => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    return r && r.result ? r.result.value : undefined;
  };

  const spots = await evl('window.TOURISM_SPOTS ? window.TOURISM_SPOTS.map(s=>s.name) : []');
  console.log('TOURISM_SPOTS count:', Array.isArray(spots) ? spots.length : spots);

  const checks = {
    '千住桜堤': false, 'ダイエー': true /* should NOT exist */,
    '柳原稲荷神社': false, '虹の広場（荒川河川敷）': false, '堀切橋（荒川）': false,
    '関屋の里（冨嶽三十六景）': false, '千住街の駅': false, '宿場町通り商店街': false,
    '観臓記念碑（解体新書）': false, '隅田川テラス（千住発着場）': false, '千住旭町商店街（学園通り）': false,
    '柳原千草園': false, '柳原商栄会商店街': false, '吾妻稲荷神社': true, '迭翠軒 (関屋の里碑)': true,
    '堀切大橋 (荒川河川敷)': true, '学園通り旭町商店街': true, '千住 街之驛': true, '荒川 虹之広場': true,
    '杉田玄白「解体新書」記念碑': true, '隅田川堤防遊歩道 (千住発着場)': true
  };
  for (const name of spots) {
    if (name in checks) checks[name] = !checks[name]; // toggle: true-expect-absent items become true when present (fail)
  }
  let fail = 0;
  for (const [k, v] of Object.entries(checks)) {
    const ok = (v === true);
    if (!ok) fail++;
    console.log((ok ? 'OK  ' : 'FAIL') + ' ' + k);
  }

  // coord spot-checks
  const coords = await evl(`(()=>{const g=s=>window.TOURISM_SPOTS.find(x=>x.name===s);return {
    niji: g('虹の広場（荒川河川敷）')&&g('虹の広場（荒川河川敷）').coord,
    inari: g('柳原稲荷神社')&&g('柳原稲荷神社').coord,
    horikiri: g('堀切橋（荒川）')&&g('堀切橋（荒川）').coord,
    sakura: g('千住桜堤')&&g('千住桜堤').coord
  };})()`);
  console.log('coords:', JSON.stringify(coords));

  // images exist check via fetch
  const imgFail = await evl(`(async()=>{const bad=[];for(const s of window.TOURISM_SPOTS){try{const r=await fetch(s.image.replace('../','http://localhost:8017/'));if(!r.ok)bad.push(s.name+':'+r.status);}catch(e){bad.push(s.name+':ERR')}}return bad.length?bad.slice(0,10):'all-images-ok'})()`);
  console.log('image fetch:', JSON.stringify(imgFail));

  console.log('page exceptions:', errors.length ? errors.slice(0,5) : '0');

  // switch to sightseeing tab & render check
  await evl(`(()=>{const f=document.querySelector('[data-tab="sightseeing"]')||document.querySelector('.tab-btn[data-tab="sightseeing"]')||Array.from(document.querySelectorAll('button,div')).find(e=>e.textContent.trim()==='観光'&&e.className.includes('tab'));if(f)f.click();return !!f})()`);
  await new Promise(r => setTimeout(r, 1500));
  const dom = await evl(`document.body.innerText.slice(0,400)`);
  console.log('tab body head:', JSON.stringify((dom||'').slice(0,200)));

  ws.close();
  process.exit(0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
