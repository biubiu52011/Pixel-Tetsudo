const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
function inventory() {
  const result={};
  function walk(dir) {
    for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
      const file=path.posix.join(dir,entry.name);
      if(entry.isDirectory()) walk(file);
      else if(file.endsWith('.js')) {
        const source=fs.readFileSync(file,'utf8');
        const network=(source.match(/\bfetch\s*\(|\bnew\s+(?:XMLHttpRequest|WebSocket|EventSource)\s*\(/g)||[]).length;
        const polling=(source.match(/\bsetInterval\s*\(/g)||[]).length;
        if(network||polling)result[file]={network,polling};
      }
    }
  }
  walk('js');walk('data');return result;
}
const baseline=JSON.parse(fs.readFileSync('tests/fixtures/guards/runtime-owners.json','utf8'));
assert.deepEqual(inventory(),baseline,'network/polling ownership changed: review the existing owner, lifecycle registry and contract tests before updating this inventory');
const ci=fs.readFileSync('.github/workflows/ci-cd.yml','utf8');
assert.match(ci,/cancel-in-progress: \$\{\{ github.event_name == 'pull_request' \}\}/,'production publication cannot be cancelled midway');
console.log('runtime architecture: network and recurring timer inventory unchanged; production publication protected PASS');
