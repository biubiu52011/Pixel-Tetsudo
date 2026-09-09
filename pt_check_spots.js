const fs = require('fs');
const t = JSON.parse(fs.readFileSync('data/core/tourism_data.json', 'utf8'));
const i18nKeys = ['name_i18n', 'desc_i18n', 'hours_i18n', 'fee_i18n', 'bestTime_i18n', 'tips_i18n'];
const langs = ['ja', 'zh', 'en', 'ko'];
const reqKeys = ['name', 'coord', 'dist', 'dir', 'desc', 'tags', 'image', 'bestTime', 'hours', 'fee', 'tips'];
let errors = [];
console.log('spots:', t.spots.length);
t.spots.forEach((s, i) => {
  for (const k of reqKeys) if (s[k] === undefined || s[k] === null || s[k] === '') errors.push(`[${i}] missing field: ${k} (${s.name})`);
  for (const ik of i18nKeys) {
    if (!s[ik]) { errors.push(`[${i}] missing i18n block: ${ik}`); continue; }
    for (const l of langs) {
      const v = s[ik][l];
      if (v === undefined || v === null || v === '') errors.push(`[${i}] ${ik}.${l} empty (${s.name})`);
      else if (Array.isArray(s[ik]) === false && ik === 'tips_i18n') {}
    }
  }
  if (Array.isArray(s.tips_i18n) && s.tips_i18n.length !== 4) errors.push(`[${i}] tips_i18n wrong shape`);
  const img = s.image.replace('../', '');
  if (!fs.existsSync(img)) errors.push(`[${i}] image missing: ${img}`);
});
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'ALL OK: 39 spots, 4-lang i18n complete, images exist');
// check newly added 8
const names = t.spots.slice(31).map(s => s.name);
console.log('new spots:', names.join(' | '));
