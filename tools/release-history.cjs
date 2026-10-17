const fs=require('node:fs');
const {verifyLocal}=require('./release-bundle.cjs');
function verifiedRun(run,jobs){return run.path==='.github/workflows/ci-cd.yml'&&run.head_branch==='main'&&run.conclusion==='success'&&
  ['push','workflow_dispatch'].includes(run.event)&&jobs.some(job=>job.name==='Verify production release'&&job.conclusion==='success');}
async function api(endpoint){
  const repo=process.env.GITHUB_REPOSITORY;if(!/^[\w.-]+\/[\w.-]+$/.test(repo||''))throw Error('Repository required');
  const response=await fetch('https://api.github.com/repos/'+repo+endpoint,{headers:{Authorization:'Bearer '+process.env.GH_TOKEN,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},signal:AbortSignal.timeout(20000)});
  if(!response.ok){const error=Error('Release history API HTTP '+response.status);error.code='API_ERROR';throw error;}return response.json();
}
async function eligible(id){
  if(!/^\d+$/.test(String(id)))throw Error('Numeric release run ID required');
  const [run,jobs,artifacts]=await Promise.all([api('/actions/runs/'+id),api('/actions/runs/'+id+'/jobs?per_page=100'),api('/actions/runs/'+id+'/artifacts?per_page=100')]);
  if(!verifiedRun(run,jobs.jobs)||!artifacts.artifacts.some(a=>a.name==='github-pages'&&!a.expired))throw Error('Release lacks successful production verification or retained artifact');
  return run;
}
function outputs(values){for(const [key,value]of Object.entries(values))fs.appendFileSync(process.env.GITHUB_OUTPUT,key+'='+value+'\n');}
async function select(requested){
  if(requested){await eligible(requested);return String(requested);}
  const list=await api('/actions/workflows/ci-cd.yml/runs?branch=main&status=success&per_page=10');
  for(const run of list.workflow_runs){if(String(run.id)===process.env.GITHUB_RUN_ID)continue;try{await eligible(run.id);return String(run.id);}catch(error){if(error.code==='API_ERROR')throw error;}}
  return '';
}
if(require.main===module)(async()=>{
  const mode=process.argv[2];
  if(mode==='select'){const id=await select(process.argv[3]);outputs({run_id:id,available:String(!!id)});console.log(id?'Verified rollback candidate '+id:'No retained production-verified release yet');}
  else if(mode==='check-bundle'){const manifest=verifyLocal(process.argv[3]||'_site');const run=await eligible(manifest.buildRunId);if(run.head_sha!==manifest.sourceSha)throw Error('Artifact source SHA does not match its verified origin');console.log('Rollback artifact provenance verified: '+manifest.sourceSha);}
  else throw Error('Expected select or check-bundle');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
module.exports={verifiedRun};
