const https = require('https');
const fs = require('fs');
const qs = [
  'LUMINE 池袋', '池袋PARCO', '南池袋公園', 'ドン・キホーテ 池袋東口駅前店',
  '浅草寺', '浅草神社', '東京スカイツリー'
];
const enc = encodeURIComponent;
function get(url) {
  return new Promise((res) => {
    https.get(url, { headers: { 'User-Agent': 'pixel-tetsudo-audit' } }, (r) => {
      let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => res(d));
    }).on('error', (e) => res('ERR:' + e.message));
  });
}
(async () => {
  for (const q of qs) {
    const d = await get('https://nominatim.openstreetmap.org/search?q=' + enc(q) + '&format=json&limit=2&countrycodes=jp');
    try {
      const j = JSON.parse(d);
      if (j.length) console.log(q, '=>', j[0].lat, j[0].lon, '|', j[0].display_name.slice(0, 42));
      else console.log(q, '=> NO HIT');
    } catch (e) { console.log(q, '=> ERR', d.slice(0, 60)); }
    await new Promise((r) => setTimeout(r, 1200));
  }
})();
