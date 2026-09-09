const { execFileSync } = require('child_process');
const qs = [
  ['東稲荷神社, 足立区', 'higashi-inari'],
  ['堀切橋, 東京都', 'horikiri-bashi'],
  ['虹の広場, 足立区', 'niji-hiroba'],
  ['柳原商栄会', 'yanagi-shoei'],
  ['柳原千草通り', 'yanagi-chigusa-dori'],
  ['千住街の駅', 'senju-machi-no-eki'],
  ['観臓記念碑, 南千住', 'kanzo-kinenhi'],
];
(async () => {
  for (const [q,tag] of qs) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=3&countrycodes=jp&accept-language=ja`;
      const r = execFileSync('curl.exe', ['-s','--max-time','15',url], {encoding:'utf8'});
      const j = JSON.parse(r);
      if (!j.length) { console.log(tag, '-> no result'); await new Promise(res=>setTimeout(res,1100)); continue; }
      j.forEach(x=>console.log(tag, '->', x.lat+','+x.lon, '|', (x.display_name||'').slice(0,60)));
    } catch(e) { console.log(tag, 'ERR'); }
    await new Promise(res=>setTimeout(res,1100));
  }
})();
