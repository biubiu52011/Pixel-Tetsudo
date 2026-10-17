const assert=require('node:assert/strict'),{validate,digest}=require('./contract-change-guard.cjs');
const change={path:'tests/example.test.js',before:Buffer.from('assert.equal(result,1);'),after:Buffer.from('')};
assert.throws(()=>validate([change],[]),/Undeclared/,'deleting assertions cannot pass silently');
const entry={path:change.path,beforeSha256:digest(change.before),afterSha256:digest(change.after),
  reason:'This explains the specific contract transition and its preserved invariant in review.',
  migration:'This explains how existing consumers move together and why the old entry is removed.',
  validation:'This identifies the replacement regression that proves the preserved behavior.',
  design:'docs/design.md',tests:['tools/regression.test.js']};
assert.throws(()=>validate([change],[{changes:[{...entry,afterSha256:'wrong'}]}],()=>true),/Undeclared/);
assert.throws(()=>validate([change],[{changes:[{...entry,tests:[]}]}],()=>true),/lacks design/);
validate([change],[{changes:[entry]}],()=>true);
console.log('contract review guard: undeclared deletions, wrong hashes and missing regressions fail PASS');
