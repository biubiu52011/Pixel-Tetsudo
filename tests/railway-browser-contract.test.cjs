// Cross-page DOM ownership guard. Run: node --test tests/railway-browser-contract.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

for (const [page, filterId, listId] of [
  ['realtime', 'realtimeFilterBar', 'realtimeStatusContainer'],
  ['trains', 'trainsFilterBar', 'trainsLineListContent']
]) {
  test(page + ': filter and list have one shared layout owner', () => {
    const html = read('pages/' + page + '.html');
    const opening = html.indexOf('data-railway-browser');
    const filter = html.indexOf('id="' + filterId + '"');
    const shell = html.indexOf('class="pixel-card rs-line-list-shell"');
    const list = html.indexOf('id="' + listId + '"');
    assert.ok(opening > 0 && filter > opening && shell > filter && list > shell);
    assert.equal((html.match(/data-railway-browser/g) || []).length, 1);
    assert.match(html, new RegExp('id="' + listId + '"[^>]*data-state-host="railway-lines"'));
  });
}

test('filter bar does not inspect list internals globally', () => {
  const js = read('js/operator-filter-bar.js');
  assert.doesNotMatch(js, /document\.querySelectorAll\(["']\.rs-line-list-content/);
  assert.match(js, /operators\(lines\)/);
});

test('page controllers use shared list visibility and data filtering', () => {
  const data = read('js/data-state.js');
  assert.match(data, /function setOperatorVisibility\(/);
  assert.match(data, /function filterLinesByOperator\(/);
  for (const page of ['js/realtime-view.js', 'js/trains-page.js']) {
    const js = read(page);
    assert.match(js, /DataState\.setOperatorVisibility\(/);
    assert.match(js, /DataState\.filterLinesByOperator\(/);
    assert.doesNotMatch(js, /group\.style\.display\s*=/);
  }
});

test('realtime selection is scoped and history mount is stable', () => {
  assert.doesNotMatch(read('js/realtime-view.js'), /document\.querySelectorAll\(["']\.rs-line-card\.selected/);
  assert.match(read('js/history.js'), /getElementById\("historyContainer"\)/);
  const html = read('pages/history.html');
  assert.match(html, /id="historyContainer"/);
  assert.doesNotMatch(html, /id="historyEmpty"|id="historyList"/);
});

test('trains detail hides the whole browser and restores it on return', () => {
  const js = read('js/trains-page.js');
  assert.match(js, /browser\.classList\.add\("hidden"\)/);
  assert.match(js, /browser\.classList\.remove\("hidden"\)/);
  assert.match(js, /filterLinesByOperator\(getLinesData\(\), _selectedOperator\)/);
  assert.doesNotMatch(js, /_oldGroups|_freshGroups|_freshByOp/);
});

test('canonical trains refresh and realtime status reconciliation honor operator selection', () => {
  const trains = read('js/trains-page.js');
  const realtime = read('js/realtime-view.js');
  assert.match(trains, /renderFiltered\(el, ul\)/);
  assert.match(realtime, /var visibleLines = window\.DataState\.filterLinesByOperator\(linesObj, _selectedOperator\)/);
  assert.match(realtime, /Object\.keys\(visibleLines \|\| \{\}\)/);
});
