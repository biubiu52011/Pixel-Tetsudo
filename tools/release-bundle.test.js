const fs=require('fs'),os=require('os'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const {build,verifyLocal,verifyRemote}=require('./release-bundle.cjs'),{verifiedRun}=require('./release-history.cjs');
async function main(){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'pixel-release-test-'));
  for(const dir of ['pages','js'])fs.mkdirSync(path.join(root,dir));
  fs.writeFileSync(path.join(root,'pages/home.html'),'<head></head><script src="../js/test.js?v=old"></script><a href="trains.html">go</a>');
  fs.writeFileSync(path.join(root,'js/test.js'),'window.test=1;');
  const sha='a'.repeat(40),manifest=build({root,out:'site',sha,runId:'123',files:['pages/home.html','js/test.js']});
  assert.equal(manifest.sourceSha,sha);assert.equal(manifest.buildRunId,'123');
  assert(fs.readFileSync(path.join(root,'site/pages/home.html'),'utf8').includes('js/test.js?build='+sha));
  assert.equal(verifyLocal(path.join(root,'site')).contentId,manifest.contentId);
  let corruptRemote=false;
  const server=http.createServer((req,res)=>{const file=path.join(root,'site',new URL(req.url,'http://test').pathname);if(!fs.existsSync(file)){res.writeHead(404);res.end();return;}res.end(corruptRemote&&req.url.startsWith('/js/')?'wrong published bytes':fs.readFileSync(file));});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{
    const result=await verifyRemote(path.join(root,'site'),'http://127.0.0.1:'+server.address().port+'/',{attempts:1,wait:0});assert.equal(result.sourceSha,sha);
    corruptRemote=true;
    await assert.rejects(verifyRemote(path.join(root,'site'),'http://127.0.0.1:'+server.address().port+'/',{attempts:1,wait:0}),/Published resource mismatch/);
    fs.writeFileSync(path.join(root,'site/js/test.js'),'corrupt');
    assert.throws(()=>verifyLocal(path.join(root,'site')),/hash mismatch/);
  }finally{await new Promise(resolve=>server.close(resolve));}
  const run={path:'.github/workflows/ci-cd.yml',head_branch:'main',conclusion:'success',event:'push'};
  assert(verifiedRun(run,[{name:'Verify production release',conclusion:'success'}]));
  assert(!verifiedRun(run,[{name:'Validate',conclusion:'success'}]),'three green validation jobs do not prove a production release');
  assert(!verifiedRun({...run,conclusion:'failure'},[{name:'Verify production release',conclusion:'success'}]));
  assert(!verifiedRun({...run,head_branch:'feature'},[{name:'Verify production release',conclusion:'success'}]));
  console.log('release bundle: source stamp, inventory hashes, exact publication, corruption and verified-only rollback PASS');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
