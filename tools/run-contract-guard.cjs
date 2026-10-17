// Prefer the protected base's checker; never replace it with the PR's checker.
const fs=require('node:fs'),cp=require('node:child_process');
const base=process.env.BASE_SHA||cp.execFileSync('git',['merge-base','origin/main','HEAD'],{encoding:'utf8'}).trim();
if(!/^[a-f0-9]{40}$/.test(base))throw Error('Trusted base SHA required');
const trusted=cp.spawnSync('git',['show',base+':tools/contract-change-guard.cjs'],{encoding:'utf8'});
fs.mkdirSync('.work',{recursive:true});
const script='.work/trusted-contract-guard.cjs';
if(trusted.status===0)fs.writeFileSync(script,trusted.stdout);
else{console.log('First installation: contract checker and design are part of this review.');fs.copyFileSync('tools/contract-change-guard.cjs',script);}
const result=cp.spawnSync(process.execPath,[script],{stdio:'inherit',env:{...process.env,BASE_SHA:base}});
process.exitCode=result.status??1;
