const fs = require('fs');
const assert = require('node:assert/strict');
const ci = fs.readFileSync('.github/workflows/ci-cd.yml', 'utf8');
assert.match(ci, /release-guards:\s*\n\s*uses: \.\/\.github\/workflows\/release-guards.yml/);
assert.match(ci, /needs: \[validate, release-guards\]/);
assert.match(ci, /if: github.ref == 'refs\/heads\/main' &&/);
assert.match(ci, /group: ci-\$\{\{ github.ref \}\}/);
assert.match(ci, /group: pages\s*\n\s*cancel-in-progress: false/);
const owners = fs.readdirSync('.github/workflows').filter(f => /\.ya?ml$/.test(f))
  .filter(f => /uses: actions\/deploy-pages@/.test(fs.readFileSync('.github/workflows/' + f, 'utf8')));
assert.deepEqual(owners, ['ci-cd.yml'], 'Pages must have exactly one gated deployment owner');
assert.match(fs.readFileSync('.github/workflows/release-guards.yml', 'utf8'), /on:\s*\n\s*workflow_call:/);
console.log('deployment-gate: validation + release guards required; one deploy owner; PR isolation PASS');
