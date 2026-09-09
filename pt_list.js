const t = JSON.parse(require('fs').readFileSync('data/core/tourism_data.json','utf8'));
t.spots.forEach((s,i)=>{
  const c = s.coord || ['?','?'];
  console.log(String(i).padStart(2), '|', String(c[0]).padEnd(11), String(c[1]).padEnd(12), '|', s.name, '|', s.dist, s.dir);
});
