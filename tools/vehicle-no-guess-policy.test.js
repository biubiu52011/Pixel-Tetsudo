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

const forbiddenAliases = {
  '都営5300形': '5500形',
  '小田急50000形': '70000形',
  '相鉄新7000系': '相模鉄道12000系',
  '東京メトロ03系': '東京メトロ13000系',
  '381系': '273系',
  '117系': '227系',
  'JR東海211系': '315系'
};
Object.keys(forbiddenAliases).forEach((name) => {
  assert(icons.VEHICLE_NAME_ALIASES[name] !== forbiddenAliases[name],
    'cross-vehicle alias substitution reintroduced: ' + name);
});
assert(icons.resolveVehicleDisplayName('都営5300形', 'Asakusa') !== '5500形',
  'retired stock was rewritten as replacement stock');
assert(icons.resolveVehicleDisplayName('小田急50000形', 'Odawara') !== '70000形',
  'VSE was rewritten as GSE');

const serviceOnlyNames = [
  'のぞみ','はやぶさ','はやて','こまち','かがやき','とき','はくたか',
  'あさま','つるぎ','つばさ','やまびこ','つばめ','かもめ','ドクターイエロー'
];
serviceOnlyNames.forEach((name) => {
  assert(!Object.prototype.hasOwnProperty.call(icons.VEHICLE_NAME_ALIASES, name),
    'service name reintroduced as vehicle alias: ' + name);
  assert(icons.resolveVehicleDisplayName(name, '') === name,
    'service name was rewritten as vehicle identity: ' + name);
});
assert(!source.includes('collectIcon(VEHICLE_DEPLOYMENTS)'), 'deployment rules seeded vehicle identity index');
assert(!source.includes('collectIcon(TRAIN_TYPE_ICON_RULES)'), 'train-type rules seeded vehicle identity index');
assert(!source.includes('collectIcon(LINE_ICONS)'), 'line defaults seeded vehicle identity index');
assert(!source.includes('collectIcon(OPERATOR_ICONS)'), 'operator defaults seeded vehicle identity index');

// Zero-fallback contract: known wrong/retired identities must never be replaced
// by a different current vehicle merely to obtain artwork.
assert(icons.resolveVehicleIcon('都営5300形', 'Asakusa') === null,
  'retired Toei 5300 was substituted with another vehicle');
assert(icons.resolveVehicleIcon('小田急50000形', 'Odawara') === null,
  'Odakyu VSE was substituted with another vehicle');
assert(icons.resolveVehicleIcon('相鉄7000系', 'SotetsuMain') === null,
  'Sotetsu 7000 was substituted with another vehicle');
assert(icons.resolveVehicleIcon('7000系（候補）', 'UnknownLine') === null,
  'candidate/base-name stripping manufactured artwork');
assert(icons.resolveVehicleIcon('JR E231系', 'Tozai') === null,
  'generic JR E231 alias manufactured an E231-800 identity');
assert(icons.resolveVehicleIcon('JR E233系', 'Chiyoda') === null,
  'generic JR E233 alias manufactured an E233-2000 identity');
assert(icons.resolveVehicleIcon('209系2000番台', 'Keiyo') === null,
  'single 209 subseries was collapsed into a 2000/2100 combined identity');
assert(icons.resolveVehicleIcon('209系3000番台', 'Hachiko') === null,
  '209-3000 must not borrow 209-3500 artwork');
assert(icons.resolveVehicleIcon('209系3100番台', 'Kawagoe') === null,
  '209-3100 must not borrow 209-3500 artwork');
assert(icons.resolveVehicleIcon('N700系7000番台', 'UnknownLine') === null,
  'N700-7000 must not borrow JR Kyushu 800-series artwork');
assert(icons.resolveVehicleIcon('AE100形', 'UnknownLine') === null,
  'retired AE100 must not borrow AE-series artwork');
assert(icons.resolveVehicleIcon('都営5300形', 'Asakusa') === null,
  'retired Toei 5300 must not borrow 5500 artwork');
assert(icons.resolveVehicleIcon('東武20000系', 'Hibiya') === null,
  'Tobu 20000 must not borrow 20400 artwork');
assert(icons.resolveVehicleIcon('東武50030系', 'UnknownLine') === null,
  'Tobu 50030 must not borrow 50000 artwork');
assert(icons.resolveVehicleIcon('東急5080系', 'Meguro') === null,
  'Tokyu 5080 must not borrow 5000 renewal artwork');
assert(icons.resolveVehicleIcon('E209系（京葉線）', 'Keiyo') === null,
  'ambiguous E209 Keiyo label must not manufacture 209-500 artwork');
assert(!/function _resolveVehicleIconBase[\\s\\S]*?VEHICLE_NAME_ALIASES\[/.test(source),
  'vehicle icon resolver reintroduced alias fallback');
assert(!/function _resolveVehicleIconBase[\\s\\S]*?LINE_VEHICLE_OVERRIDES\[/.test(source),
  'vehicle icon resolver reintroduced line override fallback');

const fallbackContexts = [
  ['Yamanote','JR-East','1234G',0,'Local',false],
  ['Chiyoda','TokyoMetro','1234',0,'LimitedExpress',false],
  ['Odawara','Odakyu','0010',5,'SuperHakone',false],
  ['Narita','JR-East','2022M',3,'LimitedExpress',false],
  ['Tozai','TokyoMetro','15S',4,'Rapid',false],
  ['Rinkai','TWR','81T',2,'Local',false],
  ['KeikyuMain','Keikyu','1201H',7,'AirportExpress',false],
  ['Tokaido','JR-East','3001M',9,'LimitedExpress',false]
];
fallbackContexts.forEach((args) => {
  assert(icons.getTrainIcon.apply(null, args) === null,
    'zero-fallback invariant violated for getTrainIcon: ' + args.join('/'));
  assert(icons.getTrainClass.apply(null, args) === '',
    'zero-fallback invariant violated for getTrainClass: ' + args.join('/'));
});
const resolverBody = source.slice(
  source.indexOf('function _resolveTrainIcon'),
  source.indexOf('function getTrainIcon')
);
assert(/return null;/.test(resolverBody), 'train icon resolver must terminate unknown identity as null');
assert(!/LINE_ICONS|OPERATOR_ICONS|VEHICLE_DEPLOYMENTS|TRAIN_TYPE_ICON_RULES|LINE_ICON_OVERRIDES|THROUGH_PREFIX_RULES|THROUGH_SUFFIX_RULES/.test(resolverBody),
  'operational fallback table re-entered train icon resolver');

console.log('vehicle no-guess policy: PASS');
