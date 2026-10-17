const fs=require('node:fs'),crypto=require('node:crypto'),cp=require('node:child_process');
const digest=value=>value===null?null:crypto.createHash('sha256').update(value).digest('hex');
const protectedPath=file=>file==='ENGINEERING.md'||file.startsWith('.github/workflows/')||file.startsWith('tests/')||
  /^tools\/.*(?:\.test\.(?:js|cjs)$|guard|release-|contract-change)/.test(file);
function validate(changes,manifests,exists=file=>fs.existsSync(file)){
  for(const change of changes.filter(c=>protectedPath(c.path)&&c.before!==null)){
    const entry=manifests.flatMap(m=>m.changes||[]).find(e=>e.path===change.path&&e.beforeSha256===digest(change.before)&&e.afterSha256===digest(change.after));
    if(!entry)throw Error('Undeclared test/contract change: '+change.path);
    for(const field of ['reason','migration','validation'])if(typeof entry[field]!=='string'||entry[field].trim().length<40)throw Error('Contract rationale missing: '+change.path+' '+field);
    if(!entry.design||!exists(entry.design)||!Array.isArray(entry.tests)||!entry.tests.length||entry.tests.some(file=>!exists(file)))throw Error('Contract change lacks design or executable validation references: '+change.path);
  }
}
function collect(base){
  if(!/^[a-f0-9]{40}$/.test(base))throw Error('Full trusted base SHA required');
  const names=cp.execFileSync('git',['diff','--name-only','--no-renames',base,'--'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
  return names.filter(protectedPath).map(file=>{
    const before=cp.spawnSync('git',['show',base+':'+file],{encoding:null});
    return {path:file,before:before.status===0?before.stdout:null,after:fs.existsSync(file)?fs.readFileSync(file):null};
  });
}
if(require.main===module){
  const base=process.env.BASE_SHA||cp.execFileSync('git',['merge-base','origin/main','HEAD'],{encoding:'utf8'}).trim();
  const dir='.github/contract-changes',manifests=fs.existsSync(dir)?fs.readdirSync(dir).filter(p=>p.endsWith('.json')).map(p=>JSON.parse(fs.readFileSync(dir+'/'+p,'utf8'))):[];
  validate(collect(base),manifests);console.log('contract changes: exact before/after hashes, design, migration and regression evidence PASS');
}
module.exports={validate,collect,digest,protectedPath};
