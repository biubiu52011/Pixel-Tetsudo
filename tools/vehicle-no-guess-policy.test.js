const fs = require('fs');
const vm = require('vm');

const src = fs.readFileSync('js/train-icons.js', 'utf8').replace(/^\uFEFF/, '');
const sandbox = { window: {}, console: { debug() {} } };
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(src, sandbox, { filename: 'js/train-icons.js' });

const icons = sandbox.window.TrainIcons;
function assert(cond, msg) { if (!cond) throw new Error(msg); }

assert(typeof icons.resolveVehicleArtwork === 'function',
  'single identity-only vehicle artwork mapper must be exported');
assert(typeof icons.resolveVehicleIcon === 'undefined' && typeof icons.getTrainIcon === 'undefined' && typeof icons.getTrainClass === 'undefined',
  'legacy vehicle inference/display compatibility APIs must be removed');
assert(!/function resolveVehicleArtwork\([^)]*(line|operator|train|source)/i.test(src),
  'artwork mapper must not accept operational context');

// UNKNOWN train identity must not become a concrete vehicle from line/operator defaults.

// Multi-candidate vehicle identity must stay unresolved.
assert(icons.resolveVehicleArtwork('小田急1000形 / 小田急3000形', 'Odawara') === null,
  'multi-candidate identity leaked a concrete icon');

// A confirmed exact identity may resolve to one representative artwork, but the
// public mapper must expose no fleet/livery pool that could become a second selector.
const monorail = icons.resolveVehicleArtwork('東京モノレール1000形');
assert(typeof icons.FLEET_ICON_POOLS === 'undefined',
  'fleet/livery pool export reintroduced a parallel artwork-selection path');
assert(monorail === null || typeof monorail === 'string',
  'exact vehicle identity must resolve only to a representative artwork or null');

const source = src;
assert(!source.includes('return LINE_ICONS[lineId]'), 'line fallback code reintroduced');
assert(!source.includes('return OPERATOR_ICONS[opKey]'), 'operator fallback code reintroduced');
assert(!source.includes('_poolPickByIcon'), 'fleet hash picker reintroduced');
assert(!source.includes('VEHICLE_FLEET_WEIGHTS'), 'fleet-ratio selector reintroduced');
assert(!source.includes('return _rule.icon'), 'train type/number rule leaked a concrete icon');
assert(!source.includes('return _ovIcon'), 'line override leaked a concrete icon');
assert(!/function _resolveTrainRuleDisplayName[\\s\\S]*?LINE_ICON_CANONICAL_IDS\[lineId\]/.test(source),
  'line canonical id leaked a concrete trainClass');

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
  assert(icons.resolveVehicleDisplayName(name) !== forbiddenAliases[name],
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
  assert(icons.resolveVehicleDisplayName(name) === name,
    'service name reintroduced as vehicle alias: ' + name);
  assert(icons.resolveVehicleDisplayName(name) === name,
    'service name was rewritten as vehicle identity: ' + name);
});
assert(!source.includes('collectIcon(VEHICLE_DEPLOYMENTS)'), 'deployment rules seeded vehicle identity index');
assert(!source.includes('collectIcon(TRAIN_TYPE_ICON_RULES)'), 'train-type rules seeded vehicle identity index');
assert(!source.includes('collectIcon(LINE_ICONS)'), 'line defaults seeded vehicle identity index');
assert(!source.includes('collectIcon(OPERATOR_ICONS)'), 'operator defaults seeded vehicle identity index');

// Zero-fallback contract: known wrong/retired identities must never be replaced
// by a different current vehicle merely to obtain artwork.
assert(icons.resolveVehicleArtwork('都営5300形', 'Asakusa') === null,
  'retired Toei 5300 was substituted with another vehicle');
assert(icons.resolveVehicleArtwork('小田急50000形', 'Odawara') === null,
  'Odakyu VSE was substituted with another vehicle');
assert(icons.resolveVehicleArtwork('相鉄7000系', 'SotetsuMain') === null,
  'Sotetsu 7000 was substituted with another vehicle');
assert(icons.resolveVehicleArtwork('7000系（候補）', 'UnknownLine') === null,
  'candidate/base-name stripping manufactured artwork');
assert(icons.resolveVehicleArtwork('JR E231系', 'Tozai') === null,
  'generic JR E231 alias manufactured an E231-800 identity');
assert(icons.resolveVehicleArtwork('JR E233系', 'Chiyoda') === null,
  'generic JR E233 alias manufactured an E233-2000 identity');
assert(icons.resolveVehicleArtwork('209系2000番台', 'Keiyo') === null,
  'single 209 subseries was collapsed into a 2000/2100 combined identity');
assert(icons.resolveVehicleArtwork('209系3000番台', 'Hachiko') === null,
  '209-3000 must not borrow 209-3500 artwork');
assert(icons.resolveVehicleArtwork('209系3100番台', 'Kawagoe') === null,
  '209-3100 must not borrow 209-3500 artwork');
assert(icons.resolveVehicleArtwork('N700系7000番台', 'UnknownLine') === null,
  'N700-7000 must not borrow JR Kyushu 800-series artwork');
assert(icons.resolveVehicleArtwork('AE100形', 'UnknownLine') === null,
  'retired AE100 must not borrow AE-series artwork');
assert(icons.resolveVehicleArtwork('都営5300形', 'Asakusa') === null,
  'retired Toei 5300 must not borrow 5500 artwork');
assert(icons.resolveVehicleArtwork('東武20000系', 'Hibiya') === null,
  'Tobu 20000 must not borrow 20400 artwork');
assert(icons.resolveVehicleArtwork('東武50030系', 'UnknownLine') === null,
  'Tobu 50030 must not borrow 50000 artwork');
assert(icons.resolveVehicleArtwork('東急5080系', 'Meguro') === null,
  'Tokyu 5080 must not borrow 5000 renewal artwork');
assert(icons.resolveVehicleArtwork('E209系（京葉線）', 'Keiyo') === null,
  'ambiguous E209 Keiyo label must not manufacture 209-500 artwork');
assert(icons.resolveVehicleArtwork('東武800系', 'UnknownLine') === null,
  'Tobu 800 must not borrow 8000-series artwork');
assert(icons.resolveVehicleArtwork('東急5050系4000番台', 'Toyoko') === null,
  '5050-4000 must not borrow generic 5050 artwork without an exact asset mapping');
assert(icons.resolveVehicleArtwork('1000形（別）', 'UnknownLine') === null,
  'gallery variant labels must not act as exact vehicle identities');
assert(icons.resolveVehicleArtwork('toky5500', 'Asakusa') === null,
  'internal asset locator codes must not act as vehicle identities');
assert(icons.resolveVehicleArtwork('yrkm7300', 'Yurikamome') === null,
  'internal Yurikamome asset locator must not act as vehicle identity');
assert(!/function _resolveVehicleIconBase[\\s\\S]*?VEHICLE_NAME_ALIASES\[/.test(source),
  'vehicle icon resolver reintroduced alias fallback');
assert(!/function _resolveVehicleIconBase[\\s\\S]*?LINE_VEHICLE_OVERRIDES\[/.test(source),
  'vehicle icon resolver reintroduced line override fallback');
assert(icons.resolveCanonicalVehicle('E231系0番台') === null,
  'duplicate canonical alias must remain ambiguous instead of last-write-wins');
assert(/CANONICAL_VEHICLE_ALIAS_CONFLICTS/.test(source),
  'canonical alias collisions must be tracked explicitly');


console.log('vehicle no-guess policy: PASS');

const vehicleResolverSrc = fs.readFileSync('js/train-vehicle.js','utf8');
assert(!vehicleResolverSrc.includes('Lower-priority evidence is fallback'),
  'vehicle resolver must not contain source-priority fallback');
assert(vehicleResolverSrc.includes('_uniqueIdentities.length === 1'),
  'EXACT vehicle identity must require one unique identity across admitted evidence');
assert(vehicleResolverSrc.includes("identityReason = 'unique-converged-vehicle-evidence'"),
  'EXACT status must document unique converged evidence');
console.log('vehicle evidence uniqueness: 3 PASS');
