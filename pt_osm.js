const https = require('https');
const q = '[out:json][timeout:25];(nwr["name"~"PARCO"](35.725,139.705,35.735,139.725);nwr["name"~"ドン・キホーテ"](35.725,139.705,35.735,139.725););out center 20;';
https.get({ host: 'overpass-api.de', path: '/api/interpreter?data=' + encodeURIComponent(q), headers: { 'User-Agent': 'pt-audit' } }, (r) => {
  let d = '';
  r.on('data', (c) => (d += c));
  r.on('end', () => {
    try {
      const j = JSON.parse(d);
      (j.elements || []).forEach((e) => {
        const lat = e.lat || (e.center && e.center.lat), lon = e.lon || (e.center && e.center.lon);
        console.log(e.type, (e.tags && e.tags.name) || '?', '=>', lat, lon);
      });
    } catch (e) { console.log('ERR', d.slice(0, 200)); }
  });
}).on('error', (e) => console.log('ERR', e.message));
