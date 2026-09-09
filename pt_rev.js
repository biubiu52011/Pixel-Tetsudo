const { execFileSync } = require('child_process');
const spots = [
  [24,'迭翠軒',35.743139,139.81225],
  [25,'吾妻稲荷神社',35.744111,139.812361],
  [26,'柳原千草園',35.745417,139.815028],
  [27,'隅田川堤防遊歩道',35.742056,139.814389],
  [28,'堀切大橋',35.746111,139.8225],
  [29,'ダイエー千住曙町店',35.742714,139.812289],
  [30,'柳原商栄会',35.745833,139.813056],
  [5,'虹之広場',35.75705,139.804111],
  [31,'学園通り旭町',35.749111,139.8075],
];
(async () => {
  for (const [i,name,lat,lon] of spots) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&zoom=16&accept-language=ja`;
      const r = execFileSync('curl.exe', ['-s','--max-time','15',url], {encoding:'utf8'});
      const j = JSON.parse(r);
      console.log(String(i).padStart(2), name.padEnd(10), '->', (j.display_name||'?').slice(0,70));
    } catch(e) { console.log(String(i).padStart(2), name, 'ERR'); }
    await new Promise(res=>setTimeout(res,1100));
  }
})();
