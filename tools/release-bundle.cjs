const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const roots=['css/','data/','fonts/','images/','js/','pages/'];
function stamp(html,sha){
  if(!/http-equiv="Cache-Control"/i.test(html))html=html.replace(/(<head[^>]*>)/i,'$1\n<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">');
  return html.replace(/((?:src|href)="(?:\.\.\/)?(?:js|css|data)\/[^"?]+)(?:\?[^\"]*)?(\")/gi,(_,a,b)=>a+'?build='+sha+b)
    .replace(/(href="(?:home|realtime|trains|history|tourism-event|tourism-shop|tourism-spot)\.html)(?:\?[^\"]*)?(\")/gi,(_,a,b)=>a+'?build='+sha+b);
}
function build({root=process.cwd(),out,sha,runId,files}){
  if(!/^[a-f0-9]{40}$/.test(sha||''))throw Error('Full source SHA required');
  out=path.resolve(root,out||'_site');
  if(!out.startsWith(path.resolve(root)+path.sep)||fs.existsSync(out))throw Error('Release output must be a new directory inside the checkout');
  const tracked=files||cp.execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
  fs.mkdirSync(out,{recursive:true});
  for(const file of tracked.filter(file=>roots.some(prefix=>file.startsWith(prefix)))){
    if(file.split('/').includes('..')||file.includes('\\')||path.isAbsolute(file))throw Error('Unsafe release path');
    const source=path.join(root,file);
    if(!fs.lstatSync(source).isFile())throw Error('Non-file release entry: '+file);
    let bytes=fs.readFileSync(source);
    if(file.startsWith('pages/')&&file.endsWith('.html'))bytes=Buffer.from(stamp(bytes.toString('utf8'),sha));
    const target=path.join(out,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);
  }
  fs.writeFileSync(path.join(out,'index.html'),'<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=pages/home.html?build='+sha+'"><a href="pages/home.html?build='+sha+'">Pixel Tetsudo</a>');
  fs.writeFileSync(path.join(out,'.nojekyll'),'');
  const entries={};function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0)){const file=path.join(dir,e.name);if(e.isDirectory())walk(file);else{const bytes=fs.readFileSync(file);entries[path.relative(out,file).split(path.sep).join('/') ]={sha256:digest(bytes),bytes:bytes.length};}}}walk(out);
  const checks=new Set(['index.html']);
  for(const file of Object.keys(entries).filter(p=>p.startsWith('pages/')&&p.endsWith('.html'))){
    checks.add(file);const html=fs.readFileSync(path.join(out,file),'utf8');
    for(const m of html.matchAll(/(?:src|href)="(\.\.\/(?:js|css|data)\/[^"?]+)(?:\?[^\"]*)?"/g))checks.add(path.posix.normalize(path.posix.join('pages',m[1])));
  }
  for(const file of ['data/core/railway_data.compact.json','images/列车/JR東日本/JR東日本_E353系.png'])if(entries[file])checks.add(file);
  const manifest={schemaVersion:1,sourceSha:sha,buildRunId:String(runId||'local'),files:entries,verificationPaths:[...checks].sort()};
  manifest.contentId=digest(JSON.stringify(entries));
  fs.writeFileSync(path.join(out,'release-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  verifyLocal(out);return manifest;
}
function verifyLocal(dir){
  const manifest=JSON.parse(fs.readFileSync(path.join(dir,'release-manifest.json'),'utf8'));
  if(!/^[a-f0-9]{40}$/.test(manifest.sourceSha)||manifest.contentId!==digest(JSON.stringify(manifest.files)))throw Error('Invalid release manifest identity');
  for(const [file,record]of Object.entries(manifest.files)){
    const target=path.resolve(dir,file);if(!target.startsWith(path.resolve(dir)+path.sep))throw Error('Unsafe manifest path');
    if(!fs.lstatSync(target).isFile())throw Error('Non-file release entry');
    const bytes=fs.readFileSync(target);if(bytes.length!==record.bytes||digest(bytes)!==record.sha256)throw Error('Release hash mismatch: '+file);
  }
  const actualFiles=[];
  function inventory(folder){for(const entry of fs.readdirSync(folder,{withFileTypes:true})){const file=path.join(folder,entry.name);if(entry.isDirectory())inventory(file);else{if(!entry.isFile())throw Error('Non-file artifact entry');const relative=path.relative(dir,file).split(path.sep).join('/');if(relative!=='release-manifest.json')actualFiles.push(relative);}}}
  inventory(dir);
  if(JSON.stringify(actualFiles.sort())!==JSON.stringify(Object.keys(manifest.files).sort()))throw Error('Release inventory mismatch');
  for(const file of manifest.verificationPaths)if(!manifest.files[file])throw Error('Verification target absent: '+file);
  return manifest;
}
async function verifyRemote(dir,base,{attempts=6,wait=10000}={}){
  const expected=verifyLocal(dir),url=new URL(base);if(!url.pathname.endsWith('/'))url.pathname+='/';
  let last;
  for(let attempt=0;attempt<attempts;attempt++){
    try{
      const response=await fetch(new URL('release-manifest.json?release_check='+Date.now(),url),{signal:AbortSignal.timeout(15000),cache:'no-store'});
      if(!response.ok)throw Error('Published manifest HTTP '+response.status);
      const actual=await response.json();
      if(actual.sourceSha!==expected.sourceSha||actual.contentId!==expected.contentId||actual.buildRunId!==expected.buildRunId)throw Error('Published release identity mismatch');
      const paths=[...expected.verificationPaths];
      const checks=await Promise.allSettled(Array.from({length:6},async()=>{while(paths.length){const file=paths.pop();const r=await fetch(new URL(file+'?build='+expected.sourceSha+'&release_check='+Date.now(),url),{signal:AbortSignal.timeout(15000),cache:'no-store'});if(!r.ok||digest(Buffer.from(await r.arrayBuffer()))!==expected.files[file].sha256)throw Error('Published resource mismatch: '+file);}}));
      const failed=checks.find(result=>result.status==='rejected');if(failed)throw failed.reason;
      return {sourceSha:expected.sourceSha,contentId:expected.contentId,buildRunId:expected.buildRunId,verifiedPaths:expected.verificationPaths.length};
    }catch(error){last=error;if(attempt+1<attempts)await new Promise(resolve=>setTimeout(resolve,wait));}
  }
  throw last;
}
if(require.main===module){
  const mode=process.argv[2];
  if(mode==='build'){const m=build({sha:process.env.BUILD_SHA,runId:process.env.GITHUB_RUN_ID});console.log('Release '+m.sourceSha+': '+Object.keys(m.files).length+' files; content '+m.contentId);}
  else if(mode==='check'){const m=verifyLocal(process.argv[3]||'_site');console.log(JSON.stringify({sourceSha:m.sourceSha,contentId:m.contentId,files:Object.keys(m.files).length}));}
  else if(mode==='verify')verifyRemote(process.argv[3]||'_site',process.argv[4]).then(result=>{fs.writeFileSync(process.argv[5]||'release-verification.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));}).catch(error=>{console.error(error.message);process.exitCode=1;});
  else throw Error('Expected build, check or verify');
}
module.exports={build,stamp,verifyLocal,verifyRemote};
