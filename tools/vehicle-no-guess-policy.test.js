const fs = require('fs');
const vm = require('vm');

const src = fs.readFileSync('js/train-icons.js', 'utf8').replace(/^\uFEFF/, '');
const sandbox = { window: {}, console: { debug() {} } };
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(src, sandbox, { filename: 'js/train-icons.js' });

const icons = sandbox.window.TrainIcons;
function assert(cond, msg) { if (!cond) throw new Error(msg); }

// UNKNOWN train identity must not become a concrete vehicle from line/operator defaults.
assert(icons.getTrainIcon('Yamanote', 'JR-East', 'unknown', 0, '', false) === null,
  'UNKNOWN train leaked LINE_ICONS fallback');
assert(icons.getTrainIcon('UnknownLine', 'TokyoMetro', 'unknown', 0, '', false) === null,
  'UNKNOWN train leaked OPERATOR_ICONS fallback');

// Multi-candidate vehicle identity must stay unresolved.
assert(icons.resolveVehicleIcon('小田急1000形 / 小田急3000形', 'Odawara') === null,
  'multi-candidate identity leaked a concrete icon');

// Fleet/livery pools are catalogs, not evidence. The resolver may return the canonical
// type artwork, but must not hash-pick another member of the pool.
const monorail = icons.resolveVehicleIcon('東京モノレール1000形', 'TokyoMonorail');
if (monorail) {
  const pool = icons.FLEET_ICON_POOLS['東京モノレール1000形'] || [];
  if (pool.length > 1) {
    assert(monorail === pool[0] || !pool.includes(monorail),
      'resolver hash-picked a concrete formation/livery from FLEET_ICON_POOLS');
  }
}

const source = src;
assert(!source.includes('return LINE_ICONS[lineId]'), 'line fallback code reintroduced');
assert(!source.includes('return OPERATOR_ICONS[opKey]'), 'operator fallback code reintroduced');
assert(!source.includes('_poolPickByIcon'), 'fleet hash picker reintroduced');
assert(!source.includes('VEHICLE_FLEET_WEIGHTS'), 'fleet-ratio selector reintroduced');
assert(!source.includes('return _rule.icon'), 'train type/number rule leaked a concrete icon');
assert(!source.includes('return _ovIcon'), 'line override leaked a concrete icon');
assert(!/function _resolveTrainRuleDisplayName[\\s\\S]*?LINE_ICON_CANONICAL_IDS\[lineId\]/.test(source),
  'line canonical id leaked a concrete trainClass');
assert(icons.getTrainClass('Yamanote', 'JR-East', 'unknown', 0, '', false) === '',
  'UNKNOWN train leaked a line-derived trainClass');
assert(icons.getTrainIcon('Chiyoda', 'TokyoMetro', '1234', 0, 'LimitedExpress', false) === null,
  'trainType-only rule leaked a concrete vehicle');

console.log('vehicle no-guess policy: PASS');
