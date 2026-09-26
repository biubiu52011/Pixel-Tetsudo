const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function loadRuntime() {
  const context = {
    console: { debug() {}, log() {}, warn() {}, error() {} },
    window: {
      TransitConstants: {
        normalizeOp(op) {
          return String(op || '').replace(/^odpt\.Operator:/, '');
        }
      }
    }
  };
  context.self = context.window;
  vm.createContext(context);
  [
    'js/train-icons.js',
    'data/timetables/vehicle-type-map.js',
    'js/train-vehicle.js'
  ].forEach((rel) => {
    vm.runInContext(read(rel), context, { filename: rel });
  });
  return context.window;
}

function imageExists(url) {
  if (!url || typeof url !== 'string') return false;
  const rel = url.replace(/^\.\.\//, '').replace(/\//g, path.sep);
  return fs.existsSync(path.join(ROOT, rel));
}

function trainType(operator, service) {
  return `odpt.TrainType:${operator}.${service}`;
}

function assert(condition, message, details) {
  if (!condition) {
    const err = new Error(message);
    err.details = details;
    throw err;
  }
}

function expectMap(win, label, lineId, service, expected, forbidden = [], destUrn = '') {
  const value = win.VehicleTypeMap.resolve(lineId, trainType('JR-East', service), destUrn);
  assert(value === expected, `${label}: unexpected mapping`, { value, expected });
  forbidden.forEach((needle) => {
    assert(!value.includes(needle), `${label}: forbidden mapping token`, { value, forbidden: needle });
  });
}

function expectIcon(win, label, query, lineId, expectedNeedle, forbiddenNeedles = []) {
  const icon = win.TrainIcons.resolveVehicleIcon(query, lineId);
  assert(icon && icon.includes(expectedNeedle), `${label}: unexpected icon`, { query, lineId, icon, expectedNeedle });
  forbiddenNeedles.forEach((needle) => {
    assert(!icon.includes(needle), `${label}: forbidden icon`, { query, lineId, icon, forbidden: needle });
  });
  assert(imageExists(icon), `${label}: icon reference missing`, { icon });
}

function expectRuntime(win, label, ctx, expectedName, expectedIconNeedle, forbiddenIconNeedles = []) {
  const result = win.TrainVehicle.resolve(Object.assign({ trainNumber: `guard-${label}` }, ctx));
  assert(result.name === expectedName, `${label}: unexpected runtime name`, { result, expectedName });
  assert(result.iconPath && result.iconPath.includes(expectedIconNeedle), `${label}: unexpected runtime icon`, { result, expectedIconNeedle });
  forbiddenIconNeedles.forEach((needle) => {
    assert(!result.iconPath.includes(needle), `${label}: forbidden runtime icon`, { result, forbidden: needle });
  });
  assert(imageExists(result.iconPath), `${label}: runtime icon reference missing`, { result });
  return result;
}

function expectUnknownRuntime(win, label, ctx) {
  const result = win.TrainVehicle.resolve(Object.assign({ trainNumber: `guard-unknown-${label}` }, ctx));
  const value = `${result.name || ''} ${result.iconPath || ''}`;
  [
    'E235系山手線.png',
    'E235系1000番台.png',
    'E235系総武中央線.png',
    'E231系0番台.png',
    'E231系800番台',
    'E231系1000番台.png',
    'E233系2000番台.png',
    'E233系3000番台.png',
    'E233系5000番台.png',
    'E233系7000番台.png'
  ].forEach((needle) => {
    assert(!value.includes(needle), `${label}: UNKNOWN input guessed a real target vehicle`, { result, forbidden: needle });
  });
  return result;
}

function walkMap(obj, out = []) {
  if (!obj || typeof obj !== 'object') return out;
  Object.entries(obj).forEach(([key, value]) => {
    if (key === 'default' && typeof value === 'string') out.push(value);
    else if (key !== 'destStation') walkMap(value, out);
    else walkMap(value, out);
  });
  return out;
}

function assertNoCurrentFictionalAsset(win) {
  const badAsset = 'E235系総武中央線.png';
  const values = walkMap(win.VehicleTypeMap.MAP);
  values.forEach((value) => {
    const icon = win.TrainIcons.resolveVehicleIcon(value, '');
    assert(!icon || !icon.includes(badAsset), 'CURRENT map can reach confirmed fictional asset', { value, icon });
  });
}

function assertDeterministic(win, label, ctx) {
  const first = win.TrainVehicle.resolve(Object.assign({ trainNumber: `det-${label}` }, ctx));
  for (let i = 0; i < 100; i += 1) {
    const next = win.TrainVehicle.resolve(Object.assign({ trainNumber: `det-${label}` }, ctx));
    assert(next.name === first.name && next.iconPath === first.iconPath, `${label}: nondeterministic runtime result`, { first, next, i });
  }
}

function main() {
  const win = loadRuntime();

  expectMap(win, 'Yamanote P1/critical', 'Yamanote', 'Local', 'E235系0番台（山手線）', ['E235系1000番台', 'E235系総武中央線']);
  expectMap(win, 'Tozai JR-East local P0', 'Tozai', 'Local', 'E231系800番台（東西線直通） / 東京メトロ05系 / 東京メトロ07系 / 東京メトロ15000系', ['E231系500番台', 'JR E231系'], 'odpt.Station:JR-East.ChuoSobuLocal.Nakano');
  expectMap(win, 'Tozai default rapid P0', 'Tozai', 'Rapid', '東京メトロ05系 / 東京メトロ07系 / 東京メトロ15000系 / E231系800番台（東西線直通） / 東葉高速2000系', ['JR E231系', '東葉高速1000系']);
  expectMap(win, 'Chiyoda local P0', 'Chiyoda', 'Local', '東京メトロ16000系 / 東京メトロ05系（北綾瀬） / E233系2000番台 / 小田急4000形', ['JR E233系']);
  expectMap(win, 'Joban rapid P0', 'Joban', 'Rapid', 'E231系0番台', ['E231系1000番台', 'E233系3000番台']);
  expectMap(win, 'Joban special rapid P0', 'Joban', 'SpecialRapid', 'E531系', ['E231系1000番台', 'E233系3000番台']);
  expectMap(win, 'Keiyo local P1', 'Keiyo', 'Local', 'E233系5000番台', ['E231系900番台']);
  expectMap(win, 'Musashino local P1', 'Musashino', 'Local', 'E231系0番台', ['E231系900番台']);
  expectMap(win, 'Hachiko local Phase3B', 'Hachiko', 'Local', '209系3500番台', ['209系3000番台']);
  expectMap(win, 'Kawagoe local P1', 'Kawagoe', 'Local', 'E233系7000番台', ['209系3100番台', '209系3000番台']);
  expectMap(win, 'KawagoeWest local Phase3B', 'KawagoeWest', 'Local', '209系3500番台', ['209系3000番台']);
  expectMap(win, 'ShonanShinjuku rapid P0', 'ShonanShinjuku', 'Rapid', 'E231系1000番台 / E233系3000番台', ['E235系1000番台']);
  expectMap(win, 'Ito Odoriko P1', 'Ito', 'LimitedExpress', 'E257系2000番台 / E257系2500番台', ['E257系1500番台']);
  expectMap(win, 'UtsunomiyaJR Nikko P1', 'UtsunomiyaJR', 'LimitedExpress', '253系（日光・きぬがわ）', ['E253系']);

  expectIcon(win, 'E235 0 Yamanote', 'E235系0番台（山手線）', 'Yamanote', 'E235系山手線.png', ['E235系1000番台.png', 'E235系総武中央線.png']);
  expectIcon(win, 'E235 1000 Yokosuka', 'E235系1000番台', 'Yokosuka', 'E235系1000番台.png', ['E235系山手線.png', 'E235系総武中央線.png']);
  expectIcon(win, 'Tozai E231-800', 'E231系800番台（東西線直通）', 'Tozai', 'E231系800番台（東西線直通・青帯）.png', ['E231系総武中央線.png']);
  expectIcon(win, 'Hachiko 209-3500', '209系3500番台', 'Hachiko', 'E209系3500番台.png', ['E209系（京葉線）.png']);
  expectIcon(win, 'Nikko formal 253', '253系（日光・きぬがわ）', 'UtsunomiyaJR', '253系（日光・きぬがわ）.png', ['E253系.png']);

  const canonical = win.TrainIcons.resolveCanonicalVehicle('jr-east-e235-0-yamanote');
  assert(canonical && canonical.displayName === 'E235系0番台（山手線）', 'canonical id does not resolve to display name', { canonical });
  assert(canonical.asset && canonical.asset.endsWith('E235系山手線.png'), 'canonical id does not resolve to asset', { canonical });

  expectRuntime(win, 'Yamanote runtime', {
    lineId: 'Yamanote',
    operator: 'JR-East',
    trainType: trainType('JR-East', 'Local')
  }, 'E235系0番台（山手線）', 'E235系山手線.png', ['E235系1000番台.png', 'E235系総武中央線.png']);

  expectRuntime(win, 'Tozai JR-East runtime', {
    lineId: 'Tozai',
    operator: 'JR-East',
    trainType: trainType('TokyoMetro', 'Local'),
    destinationStation: 'odpt.Station:JR-East.ChuoSobuLocal.Nakano'
  }, 'E231系800番台（東西線直通）', 'E231系800番台（東西線直通・青帯）.png', ['E231系総武中央線.png']);

  expectRuntime(win, 'ShonanShinjuku runtime', {
    lineId: 'ShonanShinjuku',
    operator: 'JR-East',
    trainType: trainType('JR-East', 'Rapid')
  }, 'E231系1000番台', 'E231系1000番台.png', ['E235系1000番台.png']);

  expectRuntime(win, 'Hachiko runtime Phase3B', {
    lineId: 'Hachiko',
    operator: 'JR-East',
    trainType: trainType('JR-East', 'Local')
  }, '209系3500番台', 'E209系3500番台.png', ['E209系（京葉線）.png']);

  expectRuntime(win, 'KawagoeWest runtime Phase3B', {
    lineId: 'KawagoeWest',
    operator: 'JR-East',
    trainType: trainType('JR-East', 'Local')
  }, '209系3500番台', 'E209系3500番台.png', ['E209系（京葉線）.png']);

  expectRuntime(win, 'Yokosuka local accepted safe behavior', {
    lineId: 'Yokosuka',
    operator: 'JR-East',
    trainType: trainType('JR-East', 'Local')
  }, 'E235系1000番台', 'E235系1000番台.png', ['E235系山手線.png', 'E235系総武中央線.png']);

  expectRuntime(win, 'Yokosuka rapid accepted safe behavior', {
    lineId: 'Yokosuka',
    operator: 'JR-East',
    trainType: trainType('JR-East', 'Rapid')
  }, 'E235系1000番台', 'E235系1000番台.png', ['E235系山手線.png', 'E235系総武中央線.png']);

  expectRuntime(win, 'ABSENT vehicle known route default', {
    lineId: 'Yamanote',
    operator: 'JR-East',
    trainType: trainType('JR-East', 'Local')
  }, 'E235系0番台（山手線）', 'E235系山手線.png', ['E235系1000番台.png']);

  expectUnknownRuntime(win, 'unknown explicit E235 subseries', {
    lineId: 'UnknownRoute',
    operator: 'UnknownOperator',
    vehicleTypeManual: 'E235系9999番台',
    trainType: trainType('UnknownOperator', 'Local')
  });
  expectUnknownRuntime(win, 'unknown route and operator absent vehicle', {
    lineId: 'UnknownRoute',
    operator: 'UnknownOperator',
    trainType: trainType('UnknownOperator', 'Local')
  });
  expectUnknownRuntime(win, 'canonical id with random suffix', {
    lineId: 'Yamanote',
    operator: 'JR-East',
    vehicleTypeManual: 'jr-east-e235-0-yamanote-X',
    trainType: trainType('JR-East', 'Local')
  });
  expectUnknownRuntime(win, 'known series unknown E231 subseries', {
    lineId: 'Tozai',
    operator: 'JR-East',
    vehicleTypeManual: 'E231系9999番台',
    trainType: trainType('TokyoMetro', 'Local')
  });
  expectUnknownRuntime(win, 'known operator nonexistent vehicle', {
    lineId: 'UnknownRoute',
    operator: 'JR-East',
    vehicleTypeManual: 'JR東日本9999系',
    trainType: trainType('JR-East', 'Local')
  });

  assertDeterministic(win, 'Yamanote', {
    lineId: 'Yamanote',
    operator: 'JR-East',
    trainType: trainType('JR-East', 'Local')
  });
  assertDeterministic(win, 'ShonanShinjuku', {
    lineId: 'ShonanShinjuku',
    operator: 'JR-East',
    trainType: trainType('JR-East', 'Rapid')
  });

  assertNoCurrentFictionalAsset(win);

  Object.values(win.TrainIcons.CANONICAL_VEHICLES).forEach((vehicle) => {
    assert(imageExists(vehicle.asset), 'canonical asset missing', vehicle);
  });

  console.log(JSON.stringify({
    status: 'PASS',
    p0: 3,
    p1: 5,
    currentResolverFictionalAssets: 0,
    missingReferences: 0
  }, null, 2));
}

try {
  main();
} catch (err) {
  console.error(JSON.stringify({
    status: 'FAIL',
    message: err.message,
    details: err.details || null
  }, null, 2));
  process.exitCode = 1;
}
