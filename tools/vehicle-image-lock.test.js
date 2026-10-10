/* Release guard: Git blob hashes of previously reviewed train PNGs.
 * Update the baseline only after explicit asset re-review; never auto-regenerate in CI.
 * SHA uses Git's "blob <byteLength>\0" object header.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const baseline = require('./vehicle-image-lock-baseline.json');
assert.equal(baseline.schema, 1);
assert.ok(Object.keys(baseline.images).length > 0, 'empty train PNG baseline');
for (const [name, expected] of Object.entries(baseline.images)) {
  assert.match(name, /^images\/列车\/[^\\n]+\\.png$/);
  assert.match(expected, /^[0-9a-f]{40}$/);
  const target = path.resolve(root, name);
  assert.ok(target.startsWith(path.join(root, 'images', '列车') + path.sep), 'unsafe path: ' + name);
  assert.ok(fs.existsSync(target), 'locked PNG missing: ' + name);
  const bytes = fs.readFileSync(target);
  const header = Buffer.from('blob ' + bytes.length + '\0');
  const actual = crypto.createHash('sha1').update(header).update(bytes).digest('hex');
  assert.equal(actual, expected, 'locked PNG changed: ' + name);
}
console.log('vehicle-image-lock: PASS (' + Object.keys(baseline.images).length + ' locked PNGs)');
