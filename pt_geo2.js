const { execFileSync } = require('child_process');
const qs = [
  ['千住曙町, 足立区','area-senju-akebono'],
  ['千住関屋町, 足立区','area-senju-sekiya'],
  ['柳原一丁目, 足立区','area-yanagi1'],
  ['千住汐入大橋','shioiri-ohashi'],
  ['千住大川端公園','ookawabata-koen'],
  ['千住大橋, 足立区','senju-ohashi-bridge'],
];
(async () => {
  for (const [q,tag] of qs) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=2&countrycodes=jp&accept-language=ja`;
      const r = execFileSync('curl.exe', ['-s','--max-time','15',url], {encoding:'utf8'});
      const j = JSON.parse(r);
      if (!j.length) { console.log(tag, '-> no result'); continue; }
      j.forEach(x=>console.log(tag, '->', x.lat+','+x.lon, '|', x.display_name.slice(0,55)));
    } catch(e) { console.log(tag, 'ERR'); }
    await new Promise(res=>setTimeout(res,1100));
  }
})();
