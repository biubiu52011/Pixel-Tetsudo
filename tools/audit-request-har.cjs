// Emits aggregate evidence only: never URLs with queries, cookies or headers.
const fs = require('node:fs');
const crypto = require('node:crypto');
function audit(file) {
  const raw = fs.readFileSync(file);
  const entries = JSON.parse(raw.toString('utf8').replace(/^\uFEFF/, '')).log.entries;
  const groups = {}, active = new Map(), sql = [];
  let overlapping = 0;
  for (const e of [...entries].sort((a,b) => Date.parse(a.startedDateTime)-Date.parse(b.startedDateTime))) {
    const u = new URL(e.request.url), key = u.host + u.pathname;
    const g = groups[key] ||= {requests:0, errors:0, totalMs:0, contentBytes:0, transferBytes:0};
    g.requests++; g.errors += e.response.status === 0 || e.response.status >= 400 ? 1 : 0;
    g.totalMs += e.time; g.contentBytes += Math.max(0,e.response.content.size || 0);
    g.transferBytes += Math.max(0,e.response._transferSize || 0);
    const start = Date.parse(e.startedDateTime), exact = e.request.method + e.request.url;
    if ((active.get(exact)||0) > start) overlapping++;
    active.set(exact, Math.max(active.get(exact)||0,start+Math.max(0,e.time)));
    if (u.pathname.endsWith('/train-runs') && e.response.content.text) {
      const c = e.response.content;
      try {
        const b = JSON.parse(c.encoding === 'base64' ? Buffer.from(c.text,'base64').toString() : c.text);
        sql.push({line:b.line_id, serviceDate:b.service_date, complete:b.complete, partial:b.partial,
          runs:b.runs?.length||0, omitted:b.omitted_incomplete_runs||0,
          dateVerified:b.date_verified_runs||0, dateUnverified:b.date_unverified_runs||0});
      } catch {}
    }
  }
  return {file:require('node:path').basename(file), sha256:crypto.createHash('sha256').update(raw).digest('hex'),
    requests:entries.length, overlappingIdenticalRequests:overlapping, groups, sql,
    limitation:'HAR measures network only; JavaScript execution and render timings require browser traces.'};
}
if (require.main === module) console.log(JSON.stringify(process.argv.slice(2).map(audit),null,2));
module.exports = audit;
