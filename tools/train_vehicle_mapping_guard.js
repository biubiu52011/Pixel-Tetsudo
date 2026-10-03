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
    'data/timetables/tobu-limited-express-vehicle-evidence.js',
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
    'E235系_1000番代.png',
    'E235系_0番代_B31編成_中央・総武線.png',
    'E231系_0番代.png',
    'E231系_800番代',
    'E231系_1000番代.png',
    'E233系_2000番代.png',
    'E233系_3000番代.png',
    'E233系_5000番代.png',
    'E233系_7000番代.png'
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
  const badAsset = 'E235系総武中央線.png'; // 已随图库修正删除的虚构命名，任何解析都不会再命中
  const values = walkMap(win.VehicleTypeMap.MAP);
  values.forEach((value) => {
    const icon = win.TrainIcons.resolveVehicleIcon(value, '');
    assert(!icon || !icon.includes(badAsset), 'CURRENT map can reach confirmed fictional asset', { value, icon });
  });
}

function assertNoFilenameDependentIdentity(win) {
  [
    'E209系',
    'E209系（房総）',
    'E209系（京葉線）',
    '209系3500番台（八高・川越線）',
    'E231系常磐LED',
    'E235系山手線',
    'E235系総武中央線',
    'E723系',
    'E253系',
    'JR東日本E253系',
    'E209系（e209_kt2）',
    'E209系（e209_kt）',
    '209系2000・2100番台（房総地区）',
    '209系3000番台（八高・川越線）',
    'E209系（e209jg2）',
    '209系1000番台（中央快速線）',
    'E209系（e209jg4）',
    '209系1000番台（常磐緩行線）',
    'E209系（e209jy1）',
    'E209系（e209jy）',
    'E209系（e209kt0）',
    'E209系（e209kt2）',
    'E209系（e209kt3）',
    'E209系（e209kt_ad）',
    'E209系（e209kt）',
    'E209系（e209ky1）',
    '209系500番台（京葉線）',
    '209系500番台（武蔵野線）',
    'E209系（e209na2）',
    '209系2200番台（南武線）',
    '209系0番台（南武線）',
    'E209系（e209or1）',
    '209系500番台（中央・総武緩行線・ミツ501-510）',
    'E209系（e209so）',
    'E209系（e209sta）'
  ].forEach((name) => {
    assert(!win.TrainIcons.VEHICLE_NAME_TO_ICON[name], 'filename basename remains in vehicle identity index', { name });
    assert(!win.TrainIcons.VEHICLE_NAME_ALIASES[name], 'filename basename remains in vehicle alias index', { name });
  });
}

function assertCanonicalAssetRenameSimulation(win) {
  const cases = [
    {
      id: 'jr-east-e235-0-yamanote',
      query: 'E235系0番台（山手線）',
      lineId: 'Yamanote',
      simulatedAsset: '../images/列车/JR東日本/__phase4b_simulated_yamanote.png'
    },
    {
      id: 'jr-east-209-3500-hachiko-kawagoe',
      query: '209系3500番台',
      lineId: 'Hachiko',
      simulatedAsset: '../images/列车/JR東日本/__phase4b_simulated_209_3500.png'
    },
    {
      id: 'jr-east-253-1000-nikko-kinugawa',
      query: '253系（日光・きぬがわ）',
      lineId: 'UtsunomiyaJR',
      simulatedAsset: '../images/列车/JR東日本/__phase4b_simulated_253.png'
    }
  ];
  cases.forEach((entry) => {
    const vehicle = win.TrainIcons.CANONICAL_VEHICLES[entry.id];
    assert(vehicle, 'canonical vehicle missing for rename simulation', entry);
    const originalAsset = vehicle.asset;
    const before = win.TrainIcons.resolveCanonicalVehicle(entry.query);
    assert(before && before.id === entry.id, 'canonical query did not resolve before rename simulation', { entry, before });
    vehicle.asset = entry.simulatedAsset;
    try {
      const after = win.TrainIcons.resolveCanonicalVehicle(entry.query);
      assert(after && after.id === entry.id, 'canonical id changed after simulated asset rename', { entry, after });
      assert(after.displayName === before.displayName, 'canonical display changed after simulated asset rename', { entry, before, after });
      const icon = win.TrainIcons.resolveVehicleIcon(entry.query, entry.lineId);
      assert(icon === entry.simulatedAsset, 'asset locator did not follow simulated rename', { entry, icon });
    } finally {
      vehicle.asset = originalAsset;
    }
  });
}

function assertDeterministic(win, label, ctx) {
  const first = win.TrainVehicle.resolve(Object.assign({ trainNumber: `det-${label}` }, ctx));
  for (let i = 0; i < 100; i += 1) {
    const next = win.TrainVehicle.resolve(Object.assign({ trainNumber: `det-${label}` }, ctx));
    assert(next.name === first.name && next.iconPath === first.iconPath, `${label}: nondeterministic runtime result`, { first, next, i });
  }
}

function assertCompanyQualifiedTrainAssets() {
  const root = path.join(ROOT, 'images', '列车');
  fs.readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory()).forEach((entry) => {
    const company = entry.name;
    const dir = path.join(root, company);
    fs.readdirSync(dir, { withFileTypes: true }).filter((asset) => asset.isFile() && /\.png$/i.test(asset.name)).forEach((asset) => {
      assert(asset.name.startsWith(company + '_'), 'train asset filename missing company namespace', {
        company,
        asset: asset.name,
        expectedPrefix: company + '_'
      });
    });
  });
}

function main() {
  const win = loadRuntime();
  assertCompanyQualifiedTrainAssets();

  // 東急支線は大井町線の車両を継承しない。
  expectMap(win, 'Tokyu Tamagawa local fleet', 'TokyuTamagawa', 'Local', '東急電鉄1000系 / 7000系', ['6020系', '9000系', '9020系']);
  expectMap(win, 'Tokyu Ikegami local fleet', 'TokyuIkegami', 'Local', '東急電鉄1000系 / 7000系', ['6020系', '9000系', '9020系']);
  expectMap(win, 'Tokyu Kodomonokuni local fleet', 'TokyuKodomonokuni', 'Local', 'Y000系', ['6020系', '9000系', '9020系']);
  expectMap(win, 'Tokyu Setagaya local fleet', 'TokyuSetagaya', 'Local', '300系', ['6020系', '9000系', '9020系']);

  // S-TRAIN is a Seibu 40000 series reserved-seat through service across
  // Seibu / Tokyo Metro / Tokyu / Minatomirai. Destination operator must
  // not substitute another operator's ordinary through-service stock.
  [
    ['TokyuToyoko', null],
    ['TokyuToyoko', 'odpt.Station:TokyoMetro.Fukutoshin.Ikebukuro'],
    ['TokyuToyoko', 'odpt.Station:Minatomirai.Minatomirai.MotomachiChukagai'],
    ['Fukutoshin', null],
    ['Fukutoshin', 'odpt.Station:Tokyu.Toyoko.Yokohama'],
    ['Fukutoshin', 'odpt.Station:Minatomirai.Minatomirai.MotomachiChukagai']
  ].forEach(([lineId, dest]) => {
    const vt = win.VehicleTypeMap.resolve(lineId, 'odpt.TrainType:Seibu.S-TRAIN', dest);
    assert(vt === '西武40000系', 'S-TRAIN must resolve only Seibu 40000 series', { lineId, dest, vt });
  });

  const yurakuchoSTrain = win.VehicleTypeMap.resolve('Yurakucho', 'odpt.TrainType:Seibu.S-TRAIN', null);
  assert(yurakuchoSTrain === '西武40000系', 'Yurakucho S-TRAIN must resolve only Seibu 40000 series', { yurakuchoSTrain });

  // Sotetsu 20000 = 10-car Tokyu Toyoko through-service stock.
  // Sotetsu 21000 = 8-car Tokyu Meguro / Namboku / Mita through-service stock.
  [
    ['TokyuToyoko', 'Local', 'odpt.Station:Sotetsu.Main.Ebina'],
    ['TokyuToyoko', 'Express', 'odpt.Station:Sotetsu.Izumino.Shonandai'],
    ['Fukutoshin', 'Local', 'odpt.Station:Sotetsu.Main.Ebina']
  ].forEach(([lineId, type, dest]) => {
    const vt = win.VehicleTypeMap.resolve(lineId, 'odpt.TrainType:Tokyu.' + type, dest);
    assert(!/21000/.test(vt), 'Toyoko-side through fleet must not contain Sotetsu 21000', { lineId, type, dest, vt });
  });
  [
    ['TokyuMeguro', 'Local', 'odpt.Station:Sotetsu.Main.Ebina'],
    ['TokyuMeguro', 'Express', 'odpt.Station:Sotetsu.Izumino.Shonandai'],
    ['Namboku', 'Local', 'odpt.Station:Sotetsu.Main.Ebina'],
    ['Namboku', 'Express', 'odpt.Station:Sotetsu.Main.Ebina'],
    ['Mita', 'Local', 'odpt.Station:Sotetsu.Main.Ebina']
  ].forEach(([lineId, type, dest]) => {
    const vt = win.VehicleTypeMap.resolve(lineId, 'odpt.TrainType:TokyoMetro.' + type, dest);
    assert(!/20000/.test(vt) && /21000/.test(vt), 'Meguro-side Sotetsu through fleet must use 21000, not 20000', { lineId, type, dest, vt });
  });


  expectMap(win, 'Yamanote P1/critical', 'Yamanote', 'Local', 'E235系0番台（山手線）', ['E235系1000番台', 'E235系総武中央線']);
  expectMap(win, 'Tozai JR-East local P0', 'Tozai', 'Local', 'E231系800番台（東西線直通） / 東京メトロ05系 / 東京メトロ07系 / 東京メトロ15000系', ['E231系500番台', 'JR E231系'], 'odpt.Station:JR-East.ChuoSobuLocal.Nakano');
  expectMap(win, 'Tozai default rapid P0', 'Tozai', 'Rapid', '東京メトロ05系 / 東京メトロ07系 / 東京メトロ15000系 / E231系800番台（東西線直通） / 東葉高速2000系', ['JR E231系', '東葉高速1000系']);
  expectMap(win, 'Chiyoda local P0', 'Chiyoda', 'Local', '東京メトロ16000系 / 東京メトロ05系（北綾瀬） / E233系2000番台 / 小田急4000形', ['JR E233系']);
  expectMap(win, 'Joban rapid P0', 'Joban', 'Rapid', 'E231系0番台（常磐快速線・LED）', ['E231系1000番台', 'E233系3000番台']);
  expectMap(win, 'Joban rapid Toride keeps rapid EMU', 'Joban', 'Rapid', 'E231系0番台（常磐快速線・LED）', ['E531系'], 'odpt.Station:JR-East.Joban.Toride');
  expectMap(win, 'Joban local Tsuchiura uses medium-distance EMU', 'Joban', 'Local', 'E531系', ['E231系0番台（常磐快速線・LED）'], 'odpt.Station:JR-East.Joban.Tsuchiura');
  expectMap(win, 'Joban rapid Tsuchiura uses medium-distance EMU', 'Joban', 'Rapid', 'E531系', ['E231系0番台（常磐快速線・LED）'], 'odpt.Station:JR-East.Joban.Tsuchiura');
  expectMap(win, 'Joban special rapid P0', 'Joban', 'SpecialRapid', 'E531系', ['E231系1000番台', 'E233系3000番台']);
  expectMap(win, 'Joban local line pool', 'JobanLocal', 'Local', 'E233系2000番台 / 東京メトロ16000系 / 小田急4000形', ['E231系0番台', 'E231系1000番台', 'E233系3000番台']);
  expectMap(win, 'Joban local through destination keeps JR local first', 'JobanLocal', 'Local', 'E233系2000番台 / 東京メトロ16000系 / 小田急4000形', ['E231系0番台', 'E231系1000番台', 'E233系3000番台'], 'odpt.Station:TokyoMetro.Chiyoda.Ayase');
  expectMap(win, 'Keiyo local P1', 'Keiyo', 'Local', 'E233系5000番台', ['E231系900番台']);
  expectMap(win, 'Musashino local ODPT evidence', 'Musashino', 'Local', 'E231系900番台', ['E231系0番台']);
  expectMap(win, 'Hachiko local ODPT evidence', 'Hachiko', 'Local', '209系3000番台', ['E209系（京葉線）']);
  expectMap(win, 'Kawagoe local ODPT evidence', 'Kawagoe', 'Local', '209系3100番台 / E233系7000番台', ['E209系（京葉線）']);
  expectMap(win, 'KawagoeWest local ODPT evidence', 'KawagoeWest', 'Local', '209系3000番台', ['E209系（京葉線）']);
  expectMap(win, 'ShonanShinjuku rapid P0', 'ShonanShinjuku', 'Rapid', 'E231系1000番台 / E233系3000番台', ['E235系1000番台']);
  expectMap(win, 'Ito Odoriko P1', 'Ito', 'LimitedExpress', 'E257系2000番台 / E257系2500番台', ['E257系1500番台']);
  expectMap(win, 'UtsunomiyaJR Nikko P1', 'UtsunomiyaJR', 'LimitedExpress', '253系（日光・きぬがわ）', ['E253系']);

  expectIcon(win, 'E235 0 Yamanote', 'E235系0番台（山手線）', 'Yamanote', 'E235系_0番代.png', ['E235系_1000番代.png', 'E235系_0番代_B31編成_中央・総武線.png']);
  expectIcon(win, 'E235 1000 Yokosuka', 'E235系1000番台', 'Yokosuka', 'E235系_1000番代.png', ['E235系_0番代.png', 'E235系_0番代_B31編成_中央・総武線.png']);
  expectIcon(win, 'Tozai E231-800', 'E231系800番台（東西線直通）', 'Tozai', 'E231系_800番代.png', ['E231系_0番代_中央・総武線各駅停車.png']);
  expectIcon(win, 'Boso 209-2000/2100', '209系2000番台 / 2100番台', 'SobuMain', '209系_2000・2100番代_房総地区.png', ['209系_500番代_京葉線.png']);
  expectIcon(win, 'Hachiko 209-3000', '209系3000番台', 'Hachiko', '209系_3500番代.png', ['209系_500番代_京葉線.png']);
  expectIcon(win, 'Musashino E231-900', 'E231系900番台', 'Musashino', 'E231系_0番代.png', ['E231系_0番代_常磐快速線.png']);
  expectIcon(win, 'Nikko formal 253', '253系（日光・きぬがわ）', 'UtsunomiyaJR', '253系_1000番代.png', ['E253系.png']);

  const canonical = win.TrainIcons.resolveCanonicalVehicle('jr-east-e235-0-yamanote');
  assert(canonical && canonical.displayName === 'E235系0番台（山手線）', 'canonical id does not resolve to display name', { canonical });
  assert(canonical.asset && canonical.asset.endsWith('E235系_0番代.png'), 'canonical id does not resolve to asset', { canonical });

  expectRuntime(win, 'Yamanote runtime', {
    lineId: 'Yamanote',
    operator: 'JR-East',
    trainType: trainType('JR-East', 'Local')
  }, 'E235系0番台（山手線）', 'E235系_0番代.png', ['E235系_1000番代.png', 'E235系_0番代_B31編成_中央・総武線.png']);

  expectRuntime(win, 'Joban rapid livery runtime', {
    lineId: 'Joban',
    operator: 'JR-East',
    trainType: trainType('JR-East', 'Rapid')
  }, 'E231系0番台（常磐快速線・LED）', 'E231系_0番代_常磐快速線.png', ['E231系_0番代.png']);

  expectRuntime(win, 'Joban Tsuchiura medium-distance runtime', {
    lineId: 'Joban',
    operator: 'JR-East',
    trainType: trainType('JR-East', 'Local'),
    destinationStation: 'odpt.Station:JR-East.Joban.Tsuchiura'
  }, 'E531系', 'E531系.png', ['E231系_0番代_常磐快速線.png']);

  expectRuntime(win, 'Tozai JR-East runtime', {
    lineId: 'Tozai',
    operator: 'JR-East',
    trainType: trainType('TokyoMetro', 'Local'),
    destinationStation: 'odpt.Station:JR-East.ChuoSobuLocal.Nakano'
  }, 'E231系800番台（東西線直通）', 'E231系_800番代.png', ['E231系_0番代_中央・総武線各駅停車.png']);

  expectRuntime(win, 'ShonanShinjuku runtime', {
    lineId: 'ShonanShinjuku',
    operator: 'JR-East',
    trainType: trainType('JR-East', 'Rapid')
  }, 'E231系1000番台', 'E231系_1000番代.png', ['E235系_1000番代.png']);

  expectRuntime(win, 'Hachiko runtime ODPT evidence', {
    lineId: 'Hachiko',
    operator: 'JR-East',
    trainType: trainType('JR-East', 'Local')
  }, '209系3000番台', '209系_3500番代.png', ['209系_500番代_京葉線.png']);

  expectRuntime(win, 'KawagoeWest runtime ODPT evidence', {
    lineId: 'KawagoeWest',
    operator: 'JR-East',
    trainType: trainType('JR-East', 'Local')
  }, '209系3000番台', '209系_3500番代.png', ['209系_500番代_京葉線.png']);

  expectRuntime(win, 'Yokosuka local accepted safe behavior', {
    lineId: 'Yokosuka',
    operator: 'JR-East',
    trainType: trainType('JR-East', 'Local')
  }, 'E235系1000番台', 'E235系_1000番代.png', ['E235系_0番代.png', 'E235系_0番代_B31編成_中央・総武線.png']);

  expectRuntime(win, 'Yokosuka rapid accepted safe behavior', {
    lineId: 'Yokosuka',
    operator: 'JR-East',
    trainType: trainType('JR-East', 'Rapid')
  }, 'E235系1000番台', 'E235系_1000番代.png', ['E235系_0番代.png', 'E235系_0番代_B31編成_中央・総武線.png']);

  expectRuntime(win, 'ABSENT vehicle known route default', {
    lineId: 'Yamanote',
    operator: 'JR-East',
    trainType: trainType('JR-East', 'Local')
  }, 'E235系0番台（山手線）', 'E235系_0番代.png', ['E235系_1000番代.png']);

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

  // Cross-operator/mode guard: highly ambiguous bare series names must never
  // resolve globally to one operator's asset (e.g. 1000系 -> Tama Monorail).
  ['1000系','2000系','3000系','5000系','6000系','7000系','8000系','9000系','10000系'].forEach((name) => {
    assert(!win.TrainIcons.VEHICLE_NAME_TO_ICON[name], 'ambiguous bare series leaked into global vehicle identity index', { name, icon: win.TrainIcons.VEHICLE_NAME_TO_ICON[name] });
  });
  const tama1000 = win.TrainIcons.resolveVehicleIcon('1000系', 'TamaMonorail');
  assert(tama1000 && tama1000.includes('/多摩都市モノレール/1000系_標準塗装.png'), 'TamaMonorail line context must resolve its own 1000 series', { tama1000 });
  const unrelated1000 = win.TrainIcons.resolveVehicleIcon('1000系', 'UnknownRoute');
  assert(!unrelated1000 || !unrelated1000.includes('/多摩都市モノレール/'), 'unrelated railway must not inherit Tama Monorail 1000 series', { unrelated1000 });

  // Infrastructure-name vs operating-system regression: E353 limited
  // expresses use ChuoRapid east of Takao and ChuoMain west of Takao.
  const chuoRapidLtd = win.VehicleTypeMap.resolve('ChuoRapid', 'odpt.TrainType:JR-East.LimitedExpress', null);
  assert(/E353/.test(chuoRapidLtd), 'ChuoRapid LimitedExpress must resolve E353', { chuoRapidLtd });
  const chuoMainLtd = win.VehicleTypeMap.resolve('ChuoMain', 'odpt.TrainType:JR-East.LimitedExpress', null);
  assert(/E353/.test(chuoMainLtd), 'ChuoMain LimitedExpress must resolve E353', { chuoMainLtd });
  const chuoLocalLtd = win.VehicleTypeMap.resolve('ChuoSobuLocal', 'odpt.TrainType:JR-East.LimitedExpress', null);
  assert(!chuoLocalLtd, 'ChuoSobuLocal must not inherit Chuo limited-express stock', { chuoLocalLtd });
  const unknownType = win.VehicleTypeMap.resolve('ChuoRapid', 'odpt.TrainType:JR-East.UnmappedSpecialService', null);
  assert(!unknownType, 'unmapped train type must remain unresolved instead of falling back to Local', { unknownType });
  const shonanNikkoLtd = win.VehicleTypeMap.resolve('ShonanShinjuku', 'odpt.TrainType:JR-East.LimitedExpress', null);
  assert(/253系1000番台/.test(shonanNikkoLtd) && /東武100系/.test(shonanNikkoLtd), 'ShonanShinjuku JR-Tobu limited express must preserve current 253-1000/Tobu100 candidates', { shonanNikkoLtd });
  const utsunomiyaNikkoLtd = win.VehicleTypeMap.resolve('UtsunomiyaJR', 'odpt.TrainType:JR-East.LimitedExpress', null);
  assert(/253系1000番台/.test(utsunomiyaNikkoLtd) && /東武100系/.test(utsunomiyaNikkoLtd), 'UtsunomiyaJR JR-Tobu limited express must preserve current 253-1000/Tobu100 candidates', { utsunomiyaNikkoLtd });

  const jobanLtd = win.VehicleTypeMap.resolve('Joban', 'odpt.TrainType:JR-East.LimitedExpress', null);
  assert(/E657/.test(jobanLtd), 'Joban operating system must resolve Hitachi/Tokiwa E657', { jobanLtd });
  const uenoTokyoLtd = win.VehicleTypeMap.resolve('UenoTokyo', 'odpt.TrainType:JR-East.LimitedExpress', null);
  assert(/E657/.test(uenoTokyoLtd), 'UenoTokyo corridor must preserve Joban limited-express E657 identity', { uenoTokyoLtd });


  const unresolvedNewShuttle = win.TrainVehicle.resolve({
    lineId: 'NewShuttle', trainNumber: 'NS-test-unassigned', trainType: 'Local', destinationStation: 'Uchijuku'
  });
  assert(!unresolvedNewShuttle.name && !unresolvedNewShuttle.iconPath,
    'New Shuttle formation must remain unresolved without formation-level evidence', unresolvedNewShuttle);


  // Daily New Shuttle formation evidence: a confirmed formation is bound to
  // the physical running chain for that service date only.
  assert(win.TrainVehicle.registerFormationEvidence({
    lineId: 'NewShuttle', runningChainId: 'rc:newshuttle:daily-A',
    serviceDate: '2026-10-03', formationId: '21', evidenceSource: 'test-observation'
  }), 'New Shuttle 21 formation evidence should register');
  const formation21 = win.TrainVehicle.resolveFormationEvidence({
    lineId: 'NewShuttle', runningChainId: 'rc:newshuttle:daily-A', serviceDate: '2026-10-03'
  });
  assert(formation21 && formation21.formationId === '21' &&
         /2020系_21編成_グリーンクリスタル\.png$/.test(formation21.iconPath),
    'same-day running chain must propagate confirmed 21 formation and its fixed livery', formation21);
  const formationNextDay = win.TrainVehicle.resolveFormationEvidence({
    lineId: 'NewShuttle', runningChainId: 'rc:newshuttle:daily-A', serviceDate: '2026-10-04'
  });
  assert(!formationNextDay, 'formation evidence must not survive into the next service date', formationNextDay);
  const formationOtherChain = win.TrainVehicle.resolveFormationEvidence({
    lineId: 'NewShuttle', runningChainId: 'rc:newshuttle:daily-B', serviceDate: '2026-10-03'
  });
  assert(!formationOtherChain, 'formation evidence must not leak to another running chain', formationOtherChain);

  [
    ['Local', 'odpt.Station:TokyoMetro.Fukutoshin.Ikebukuro'],
    ['Express', 'odpt.Station:TokyoMetro.Fukutoshin.Shibuya'],
    ['RapidExpress', 'odpt.Station:Minatomirai.Minatomirai.MotomachiChukagai']
  ].forEach(([type, dest]) => {
    const vt = win.VehicleTypeMap.resolve('Tojo', 'odpt.TrainType:Tobu.' + type, dest);
    assert(!/90000/.test(vt), 'Tobu 90000 must not be confused with legacy 9000/9050 through-service stock', { type, dest, vt });
    assert(/9000型/.test(vt) && /9050型/.test(vt) && /50070/.test(vt), 'Tobu Metro through pool must preserve 9000/9050/50070 stock', { type, dest, vt });
  });
  ['TokyuToyoko', 'Fukutoshin'].forEach((lineId) => {
    const vt = win.VehicleTypeMap.resolve(lineId, 'odpt.TrainType:Tokyu.F-Liner', null);
    assert(/5050系4000番台/.test(vt), 'F-Liner pool must include Tokyu 5050-4000 10-car stock', { lineId, vt });
    assert(!/(^| \/ )(5050系|5000系|横浜高速Y500系)( \/ |$)/.test(vt), 'F-Liner default pool must not use ordinary 8-car Tokyu/Y500 stock', { lineId, vt });
  });

    const mmFLiner = win.VehicleTypeMap.resolve('MinatoMirai', 'odpt.TrainType:Tokyu.F-Liner', null);
  assert(/17000系\(10両\)/.test(mmFLiner), 'Minatomirai F-Liner must distinguish the 10-car Metro 17000 formation', { mmFLiner });
  assert(!/Y500/.test(mmFLiner), '8-car Y500 must not enter the normal 10-car F-Liner pool', { mmFLiner });
  const mmSTrain = win.VehicleTypeMap.resolve('MinatoMirai', 'odpt.TrainType:Seibu.S-TRAIN', null);
  assert(mmSTrain === '西武40000系', 'Minatomirai S-TRAIN must resolve only Seibu 40000 series', { mmSTrain });

    const fLocalTobu = win.VehicleTypeMap.resolve('Fukutoshin', 'odpt.TrainType:TokyoMetro.Local', 'odpt.Station:Tobu.Tojo.Shiki');
  assert(/東武9000型/.test(fLocalTobu) && /東武9050型/.test(fLocalTobu) && /東武50070系/.test(fLocalTobu),
    'Fukutoshin local Tobu through pool must preserve 9000/9050/50070', { fLocalTobu });
  assert(!/90000/.test(fLocalTobu), 'Fukutoshin local must not confuse Tobu 9000 with 90000 series', { fLocalTobu });
  const fLocal = win.VehicleTypeMap.resolve('Fukutoshin', 'odpt.TrainType:TokyoMetro.Local', null);
  assert(/17000系\(8両\/10両\)/.test(fLocal), 'ordinary Fukutoshin service must preserve 17000 mixed 8/10-car ambiguity', { fLocal });
  const mmF = win.VehicleTypeMap.resolve('MinatoMirai', 'odpt.TrainType:Tokyu.F-Liner', null);
  assert(/17000系\(10両\)/.test(mmF) && !/Y500/.test(mmF), 'Minatomirai F-Liner must remain a 10-car pool without Y500', { mmF });

    const yLocalSeibu = win.VehicleTypeMap.resolve('Yurakucho', 'odpt.TrainType:TokyoMetro.Local', 'odpt.Station:Seibu.Ikebukuro.Kotesashi');
  assert(/西武6000系\(10両\)/.test(yLocalSeibu), 'Seibu 6000 through stock must remain 10-car fixed', { yLocalSeibu });
  assert(/西武40000系\(8両\/10両\)/.test(yLocalSeibu), 'ordinary Seibu 40000 fleet must preserve 8/10-car ambiguity', { yLocalSeibu });
  assert(!/90000/.test(win.VehicleTypeMap.resolve('Yurakucho', 'odpt.TrainType:TokyoMetro.Local', 'odpt.Station:Tobu.Tojo.Shiki')),
    'Yurakucho Tobu through pool must not contain nonexistent 90000-series identity');
  const ikeF = win.VehicleTypeMap.resolve('Ikebukuro', 'odpt.TrainType:Seibu.F-Liner', null);
  assert(/6000系\(10両\)/.test(ikeF) && /40000系\(10両\)/.test(ikeF) && /17000系\(10両\)/.test(ikeF),
    'Ikebukuro F-Liner must resolve as a 10-car through-service pool', { ikeF });

    const ikeSTrain = win.VehicleTypeMap.resolve('Ikebukuro', 'odpt.TrainType:Seibu.S-TRAIN', null);
  assert(ikeSTrain === '西武40000系', 'Seibu Ikebukuro S-TRAIN must resolve only Seibu 40000 series', { ikeSTrain });

    const mitaDefault = win.VehicleTypeMap.resolve('Mita', 'odpt.TrainType:Toei.Local', null);
  assert(/都営6300形/.test(mitaDefault) && /都営6500形/.test(mitaDefault),
    'Mita default pool must preserve current 6300 and 6500 stock', { mitaDefault });
  const mitaSotetsu = win.VehicleTypeMap.resolve('Mita', 'odpt.TrainType:Toei.Local', 'odpt.Station:Sotetsu.Main.Ebina');
  assert(!/6300/.test(mitaSotetsu) && /相鉄21000系/.test(mitaSotetsu),
    'Sotetsu-bound Mita pool must exclude 6-car 6300 and preserve 21000', { mitaSotetsu });
  const sotMetro = win.VehicleTypeMap.resolve('SotetsuMain', 'odpt.TrainType:Sotetsu.Local', 'odpt.Station:TokyoMetro.Namboku.UrawaMisono');
  assert(!/(メトロ17000|東京メトロ17000|東京メトロ9000|埼玉高速2000|東武50070)/.test(sotMetro),
    'remote operator stock must not be inferred to enter Sotetsu Main', { sotMetro });
  assert(/相鉄21000系/.test(sotMetro), 'Sotetsu Main Metro-axis pool must preserve 21000', { sotMetro });

    const nambokuDefault = win.VehicleTypeMap.resolve('Namboku', 'odpt.TrainType:TokyoMetro.Local', null);
  assert(/東京メトロ9000系\(6両\/8両\)/.test(nambokuDefault),
    'Namboku 9000 must preserve the current mixed 6/8-car fleet state', { nambokuDefault });
  const nambokuSotetsu = win.VehicleTypeMap.resolve('Namboku', 'odpt.TrainType:TokyoMetro.Local', 'odpt.Station:Sotetsu.Main.Ebina');
  assert(nambokuSotetsu === '相鉄21000系',
    'Namboku Sotetsu-bound pool must use explicitly evidenced 21000 only', { nambokuSotetsu });
  const mitaDefaultLength = win.VehicleTypeMap.resolve('Mita', 'odpt.TrainType:Toei.Local', null);
  assert(/6300形\(6両\)/.test(mitaDefaultLength) && /6500形\(8両\)/.test(mitaDefaultLength),
    'Mita default pool must encode 6300/6500 formation lengths', { mitaDefaultLength });
  const mitaSotetsuEvidence = win.VehicleTypeMap.resolve('Mita', 'odpt.TrainType:Toei.Local', 'odpt.Station:Sotetsu.Main.Ebina');
  assert(!/6500/.test(mitaSotetsuEvidence) && /相鉄21000系/.test(mitaSotetsuEvidence),
    'Mita Sotetsu-bound pool must not claim unsupported Toei 6500 entry into Sotetsu', { mitaSotetsuEvidence });

    const hanzomon = win.VehicleTypeMap.resolve('Hanzomon', 'odpt.TrainType:TokyoMetro.Local', null);
  assert(/8000系\(10両\)/.test(hanzomon) && /08系\(10両\)/.test(hanzomon) && /18000系\(10両\)/.test(hanzomon),
    'Hanzomon current Metro fleet must preserve 8000/08/18000 as 10-car stock', { hanzomon });
  const denTobu = win.VehicleTypeMap.resolve('TokyuDenEn', 'odpt.TrainType:Tokyu.Express', 'odpt.Station:Tobu.Skytree.Kuki');
  assert(/50050系\(10両\)/.test(denTobu) && !/30000/.test(denTobu),
    'Denentoshi Tobu through pool must use current 50050, not former 30000 through stock', { denTobu });
  const denDefault = win.VehicleTypeMap.resolve('TokyuDenEn', 'odpt.TrainType:Tokyu.Local', null);
  assert(/東急5000系\(10両\)/.test(denDefault) && /東急2020系\(10両\)/.test(denDefault),
    'Denentoshi default stock must be explicit 10-car 5000/2020', { denDefault });

    const chiyodaLocal = win.VehicleTypeMap.resolve('Chiyoda', 'odpt.TrainType:TokyoMetro.Local', null);
  assert(!/05系/.test(chiyodaLocal), '3-car Chiyoda 05 branch stock must not enter the generic main-line pool', { chiyodaLocal });
  assert(/16000系\(10両\)/.test(chiyodaLocal) && /E233系2000番台\(10両\)/.test(chiyodaLocal) && /小田急4000形\(10両\)/.test(chiyodaLocal),
    'Chiyoda generic local pool must preserve the 10-car through fleet', { chiyodaLocal });
  const chiyodaOdakyu = win.VehicleTypeMap.resolve('Chiyoda', 'odpt.TrainType:TokyoMetro.Local', 'odpt.Station:Odakyu.Odawara.HonAtsugi');
  assert(/小田急4000形\(10両\)/.test(chiyodaOdakyu) && /東京メトロ16000系\(10両\)/.test(chiyodaOdakyu),
    'Chiyoda Odakyu through pool must remain 10-car capable', { chiyodaOdakyu });

    const tozai = win.VehicleTypeMap.resolve('Tozai', 'odpt.TrainType:TokyoMetro.Local', null);
  assert(/05系\(10両\)/.test(tozai) && /07系\(10両\)/.test(tozai) && /15000系\(10両\)/.test(tozai),
    'Tozai Metro fleet must preserve current 10-car 05/07/15000 stock', { tozai });
  const sobuMetro = win.VehicleTypeMap.resolve('ChuoSobuLocal', 'odpt.TrainType:JR-East.Local', 'odpt.Station:TokyoMetro.Tozai.Nakano');
  assert(/E231系800番台\(10両・東西線直通\)/.test(sobuMetro),
    'Chuo-Sobu Metro through pool must use E231-800 subway stock', { sobuMetro });
  assert(!/(E231系500番台|E231系0番台)/.test(sobuMetro),
    'ordinary Chuo-Sobu E231-500/0 must not enter the Tozai through pool', { sobuMetro });
  const tozaiToyo = win.VehicleTypeMap.resolve('Tozai', 'odpt.TrainType:TokyoMetro.Local', 'odpt.Station:ToyoRapid.ToyoRapid.Katsutadai');
  assert(/東葉高速2000系\(10両\)/.test(tozaiToyo),
    'Toyo Rapid destination pool must preserve Toyo 2000 stock', { tozaiToyo });

    const asakusaTobu = win.VehicleTypeMap.resolve('Asakusa', 'odpt.TrainType:Toei.Local', 'odpt.Station:Tobu.Skytree.Asakusa');
  assert(!/東武8000/.test(asakusaTobu), 'Tobu surface Asakusa must never imply Toei Asakusa through stock', { asakusaTobu });
  const asakusaKeikyu = win.VehicleTypeMap.resolve('Asakusa', 'odpt.TrainType:Toei.Local', 'odpt.Station:Keikyu.Main.Yokohama');
  assert(!/1500形/.test(asakusaKeikyu), 'retired Keikyu 1500 must not remain in current Asakusa through pool', { asakusaKeikyu });
  assert(/都営5500形/.test(asakusaKeikyu) && /京急新1000形/.test(asakusaKeikyu),
    'Asakusa Keikyu pool must preserve current 5500/new-1000 through stock', { asakusaKeikyu });
  const keikyuToei = win.VehicleTypeMap.resolve('Keikyu', 'odpt.TrainType:Keikyu.Local', 'odpt.Station:Toei.Asakusa.Oshiage');
  assert(!/1500形/.test(keikyuToei), 'retired Keikyu 1500 must not return through Toei destination mapping', { keikyuToei });

    const hokuso = win.VehicleTypeMap.resolve('Hokuso', 'odpt.TrainType:Hokuso.Local', null);
  assert(/北総7300形/.test(hokuso) && /北総7500形/.test(hokuso) && /北総9100形/.test(hokuso),
    'Hokuso must resolve its own current fleet instead of falling back', { hokuso });
  const hokusoAccess = win.VehicleTypeMap.resolve('Hokuso', 'odpt.TrainType:Hokuso.AccessExpress', 'odpt.Station:Keisei.NaritaSkyAccess.NaritaAirportTerminal1');
  assert(/京成3100形/.test(hokusoAccess) && !/50番台/.test(hokusoAccess),
    'Hokuso Access pool must use current Keisei 3100 identity without fictional 50-subseries', { hokusoAccess });
  const shibayama = win.VehicleTypeMap.resolve('Shibayama', 'odpt.TrainType:Shibayama.Local', null);
  assert(/芝山鉄道3500形/.test(shibayama),
    'Shibayama must resolve its own 3500 stock instead of generic fallback', { shibayama });

    const shinjukuKeio = win.VehicleTypeMap.resolve('Shinjuku', 'odpt.TrainType:Toei.Local', 'odpt.Station:Keio.Keio.Sasazuka');
  assert(/京王電鉄9000系30番台/.test(shinjukuKeio) && /京王電鉄5000系/.test(shinjukuKeio) && /都営10-300形/.test(shinjukuKeio),
    'Toei Shinjuku Keio through pool must preserve 9000-30/5000/10-300', { shinjukuKeio });
  assert(!/(京王電鉄7000系|京王電鉄8000系)/.test(shinjukuKeio),
    'Keio 7000/8000 must not enter the Toei Shinjuku through pool', { shinjukuKeio });
  const keioToei = win.VehicleTypeMap.resolve('Keio', 'odpt.TrainType:Keio.Local', 'odpt.Station:Toei.Shinjuku.Shinjuku');
  assert(!/(京王電鉄7000系|京王電鉄8000系)/.test(keioToei) && /9000系30番台/.test(keioToei),
    'Keio Toei destination mapping must remain subway-capable stock only', { keioToei });

    const hibiyaTobu = win.VehicleTypeMap.resolve('Hibiya', 'odpt.TrainType:TokyoMetro.Local', 'odpt.Station:Tobu.Skytree.KitaSenju');
  assert(/東京メトロ13000系\(7両\)/.test(hibiyaTobu) && /東武70000系\(7両\)/.test(hibiyaTobu) && /東武70090系\(7両\)/.test(hibiyaTobu),
    'Hibiya Tobu ordinary pool must preserve the current 7-car through fleet', { hibiyaTobu });
  const th = win.VehicleTypeMap.resolve('Hibiya', 'odpt.TrainType:TokyoMetro.TH-LINER', null);
  assert(/^東武70090系\(7両\)$/.test(th),
    'TH-LINER must resolve only to Tobu 70090', { th });
  const isesakiF = win.VehicleTypeMap.resolve('TobuIsesaki', 'odpt.TrainType:Tobu.F-Liner', null);
  assert(!/(東武50070系|東京メトロ17000系|東京メトロ10000系)/.test(isesakiF),
    'Tojo/Fukutoshin F-Liner stock must not leak into Tobu Isesaki', { isesakiF });

    const tojoSotetsu = win.VehicleTypeMap.resolve('Tojo', 'odpt.TrainType:Tobu.Local', 'odpt.Station:Sotetsu.Main.Ebina');
  assert(!/相鉄20000系/.test(tojoSotetsu),
    'Sotetsu 20000 must not be inferred as entering the Tobu Tojo line', { tojoSotetsu });
  assert(/東武50070系/.test(tojoSotetsu) && /東急5050系4000番台/.test(tojoSotetsu),
    'Tojo Sotetsu-direction pool must preserve vehicles capable of the Tojo/Fukutoshin/Tokyu corridor', { tojoSotetsu });
  const fukutoshinDefault = win.VehicleTypeMap.resolve('Fukutoshin', 'odpt.TrainType:TokyoMetro.Local', null);
  assert(/東京メトロ17000系\(8両\/10両\)/.test(fukutoshinDefault) && /東京メトロ10000系/.test(fukutoshinDefault),
    'Fukutoshin generic pool must preserve explicit Metro mixed-length identity', { fukutoshinDefault });

    const seibuTokyu = win.VehicleTypeMap.resolve('Ikebukuro', 'odpt.TrainType:Seibu.Local', 'odpt.Station:Tokyu.Toyoko.Yokohama');
  assert(/西武40000系\(10両\)/.test(seibuTokyu) && /西武6000系\(10両\)/.test(seibuTokyu),
    'Seibu southbound Tokyu pool must preserve 10-car subway-capable Seibu stock', { seibuTokyu });
  assert(!/西武40000系\(8両\/10両\)/.test(seibuTokyu),
    'Tokyu-bound Seibu pool must not leave 40000 formation length ambiguous', { seibuTokyu });
  const seibuSotetsu = win.VehicleTypeMap.resolve('Ikebukuro', 'odpt.TrainType:Seibu.Local', 'odpt.Station:Sotetsu.Main.Ebina');
  assert(!/(相鉄20000系|相鉄21000系)/.test(seibuSotetsu),
    'Seibu lines must not infer Sotetsu rolling stock or a Seibu-Sotetsu through service', { seibuSotetsu });

    const jobanThrough = win.VehicleTypeMap.resolve('JobanLocal', 'odpt.TrainType:JR-East.Local', 'odpt.Station:Odakyu.Odawara.YoyogiUehara');
  assert(/JR E233系2000番台\(10両\)/.test(jobanThrough) && /東京メトロ16000系\(10両\)/.test(jobanThrough) && /小田急4000形\(10両\)/.test(jobanThrough),
    'Joban Local through pool must preserve explicit 10-car JR/Metro/Odakyu identities', { jobanThrough });
  const odawaraMetro = win.VehicleTypeMap.resolve('Odawara', 'odpt.TrainType:Odakyu.Local', 'odpt.Station:TokyoMetro.Chiyoda.KitaAyase');
  assert(/小田急4000形\(10両\)/.test(odawaraMetro) && /東京メトロ16000系\(10両\)/.test(odawaraMetro),
    'Odakyu Chiyoda-bound pool must remain subway-capable stock', { odawaraMetro });

    const skytreeGround = win.VehicleTypeMap.resolve('TobuSkytree', 'odpt.TrainType:Tobu.Local', null);
  assert(!/(東武50050系|都営5500形)/.test(skytreeGround),
    'Skytree ground fallback must not imply Hanzomon or Toei Asakusa rolling stock', { skytreeGround });
  const skytreeHanzomon = win.VehicleTypeMap.resolve('TobuSkytree', 'odpt.TrainType:Tobu.SemiExpress', 'odpt.Station:TokyoMetro.Hanzomon.Oshiage');
  assert(/東武50050系\(10両\)/.test(skytreeHanzomon) && /東京メトロ18000系\(10両\)/.test(skytreeHanzomon),
    'Skytree Hanzomon through pool must preserve explicit 10-car through stock', { skytreeHanzomon });
  const skytreeTH = win.VehicleTypeMap.resolve('TobuSkytree', 'odpt.TrainType:Tobu.TH-LINER', 'odpt.Station:TokyoMetro.Hibiya.Kasumigaseki');
  assert(/^東武70090系\(7両\)$/.test(skytreeTH),
    'Skytree TH-LINER must resolve only to Tobu 70090', { skytreeTH });
  const skytreeToei = win.VehicleTypeMap.resolve('TobuSkytree', 'odpt.TrainType:Tobu.Local', 'odpt.Station:Toei.Asakusa.Asakusa');
  assert(!/都営5500形/.test(skytreeToei),
    'Asakusa terminal context must not be confused with Toei Asakusa through service', { skytreeToei });

    const skytreeBlock = JSON.stringify(win.VehicleTypeMap.map.TobuSkytree || {});
  assert(!/東武8000系/.test(skytreeBlock),
    'Tobu 8000 must not return to the current Skytree-line fleet map', { skytreeBlock });
  for (const type of ['SectionExpress', 'SemiExpress', 'Express', 'SectionSemiExpress']) {
    const block = (win.VehicleTypeMap.map.TobuSkytree || {})[type] || {};
    assert(!JSON.stringify(block).match(/(東京メトロ13000系|東武70000系|東武70090系)/),
      'Hibiya through stock must not leak into Skytree express-family mappings', { type, block });
  }
  const skytreeLocal = (win.VehicleTypeMap.map.TobuSkytree || {}).Local || {};
  assert(!('TokyoMetro' in skytreeLocal) && !('Hanzomon' in skytreeLocal),
    'Skytree Local must not use ambiguous TokyoMetro/Hanzomon operator fallbacks', { skytreeLocal });
  assert(/東京メトロ13000系\(7両\)/.test(skytreeLocal.Hibiya || '') && /東武70000系\(7両\)/.test(skytreeLocal.Hibiya || ''),
    'Skytree Local Hibiya pool must preserve current Hibiya through stock', { skytreeLocal });

    const unknownIcon = win.TrainIcons.getTrainIcon('Unknown', 'MIR', 'x_1', null, null, true);
  assert(!unknownIcon || !/JR東日本|E235系/.test(unknownIcon),
    'Unknown/non-JR trains must never use a concrete JR E235 universal fallback', { unknownIcon });

    const unknownSkytreeIcon = win.TrainIcons.getTrainIcon('TobuSkytree', 'Tobu', 'x_1', null, null, false);
  assert(!unknownSkytreeIcon,
    'TobuSkytree without service/vehicle evidence must not resolve to a concrete class', { unknownSkytreeIcon });
  const unknownIsesakiIcon = win.TrainIcons.getTrainIcon('TobuIsesaki', 'Tobu', 'x_1', null, null, false);
  assert(!unknownIsesakiIcon,
    'TobuIsesaki without service/vehicle evidence must not resolve to a concrete class', { unknownIsesakiIcon });

    const unknownTobuIcon = win.TrainIcons.getTrainIcon('Unknown', 'Tobu', 'x_1', null, null, true);
  assert(!unknownTobuIcon,
    'Unknown Tobu vehicle identity must not be disguised as a concrete Tobu class', { unknownTobuIcon });
  const fabricatedTobu = win.TrainIcons.resolveVehicleIcon('東武99999系', 'TobuSkytree');
  assert(!fabricatedTobu,
    'Unknown Tobu model names must not fabricate asset paths', { fabricatedTobu });

    const tobuGenericLtd = win.TrainIcons.getTrainIcon('TobuSkytree', 'Tobu', 'unknown_ltd', null, 'odpt.TrainType:Tobu.LimitedExpress', true);
  assert(!tobuGenericLtd,
    'Generic Tobu LimitedExpress must not collapse to one representative vehicle icon', { tobuGenericLtd });
  const tobuLtdCandidates = win.VehicleTypeMap.resolve('TobuSkytree', 'odpt.TrainType:Tobu.LimitedExpress', null);
  assert(/東武N100系|東武100系|東武500系|東武200系/.test(tobuLtdCandidates || ''),
    'Skytree LimitedExpress mapping must preserve multiple current vehicle candidates', { tobuLtdCandidates });

    const tobuEvidence = win.TOBU_LIMITED_EXPRESS_VEHICLE_EVIDENCE;
  assert(tobuEvidence && typeof tobuEvidence.resolve === 'function',
    'Tobu official vehicle evidence resolver must be loaded');
  assert(typeof tobuEvidence.resolveEvidence === 'function',
    'Tobu evidence resolver must expose full matched evidence for diagnostics');
  const evidenceDetail = tobuEvidence.resolveEvidence('1262', 'スペーシアX62号', 'up', '2026-08-08', { lineId: 'TobuNikko', operator: 'Tobu' });
  assert(evidenceDetail && evidenceDetail.vehicleType === '東武N100系' && evidenceDetail.service === 'スペーシアX62号',
    'Detailed evidence lookup must preserve the exact matched record', { evidenceDetail });
  assert(!tobuEvidence.resolve('1263', '', 'down', '2026-07-18', { lineId: 'TobuNikko', operator: 'Tobu' }),
    'Duplicate Tobu 1263 without service identity must remain unknown');
  assert(tobuEvidence.resolve('1263', 'スカイツリートレイン63号', 'down', '2026-07-04', { lineId: 'TobuNikko', operator: 'Tobu' }) === '東武634型',
    '1263 SKYTREE TRAIN 63 must resolve to Tobu 634');
  assert(tobuEvidence.resolve('1263', 'スペーシアX909号', 'down', '2026-07-18', { lineId: 'TobuNikko', operator: 'Tobu' }) === '東武N100系',
    '1263 SPACIA X 909 must resolve to Tobu N100');
  assert(!tobuEvidence.resolve('1263', 'スペーシアX909号', 'up', '2026-07-18', { lineId: 'TobuNikko', operator: 'Tobu' }),
    'Tobu evidence must reject direction mismatch');
  assert(!tobuEvidence.resolve('5021M', '', 'down', '2026-09-20', { lineId: 'TobuNikko', operator: 'Tobu' }),
    '5021M without service identity must remain unknown when multiple dated candidates match');
  assert(tobuEvidence.resolve('5021M', 'スペーシア日光21号', 'down', '2026-09-20', { lineId: 'TobuNikko', operator: 'Tobu' }) === '東武100系',
    '5021M SPACIA Nikko 21 on its valid dates must resolve to Tobu 100');
  assert(!tobuEvidence.resolve('5021M', 'スペーシア日光21号', 'down', '2026-10-03', { lineId: 'TobuNikko', operator: 'Tobu' }),
    'Dated Tobu evidence must expire outside its validity window');
  assert(tobuEvidence.resolve('1083M', 'きぬがわ3号', 'down', '2026-10-03', { lineId: 'TobuNikko', operator: 'JR-East' }) === 'JR東日本E253系',
    'Current Kinugawa 3 evidence must resolve to JR East E253');
  assert(tobuEvidence.resolve('5113M', 'きぬがわ13号', 'down', '2026-11-21', { lineId: 'TobuNikko', operator: 'JR-East' }) === 'JR東日本E253系',
    'Temporary Kinugawa 13 must resolve on an explicitly verified operating date');
  assert(!tobuEvidence.resolve('5113M', 'きぬがわ13号', 'down', '2026-11-20', { lineId: 'TobuNikko', operator: 'JR-East' }),
    'Temporary Kinugawa 13 must remain unknown outside explicitly verified operating dates');
  assert(tobuEvidence.resolve('1262', 'スカイツリートレイン62号', 'up', '2026-08-01', { lineId: 'TobuNikko', operator: 'Tobu' }) === '東武634型',
    '1262 SKYTREE TRAIN 62 must resolve to Tobu 634 on its operating date');
  assert(tobuEvidence.resolve('1262', 'スペーシアX62号', 'up', '2026-08-08', { lineId: 'TobuNikko', operator: 'Tobu' }) === '東武N100系',
    '1262 SPACIA X 62 must resolve to Tobu N100 on its operating date');
  assert(tobuEvidence.resolve('5112M', 'きぬがわ34号', 'up', '2026-07-20', { lineId: 'TobuNikko', operator: 'JR-East' }) === 'JR東日本E253系',
    '5112M Kinugawa 34 must resolve to JR East E253 on 2026-07-20');
  assert(!tobuEvidence.resolve('5112M', '', 'up', '2026-07-20', { lineId: 'TobuNikko', operator: 'JR-East' }),
    '5112M without service identity must remain unknown when the number is reused');

    assertNoCurrentFictionalAsset(win);
  const trainIconsSource = fs.readFileSync(path.join(ROOT, 'js/train-icons.js'), 'utf8');
  assert(/var THROUGH_PREFIX_RULES\s*=\s*\{\s*\}/.test(trainIconsSource),
    'Through-service train-number prefix guessing must remain disabled');
  assert(/var THROUGH_SUFFIX_RULES\s*=\s*\{\s*\}/.test(trainIconsSource),
    'Through-service train-number suffix guessing must remain disabled');
  assert(!/lines:\s*\['Rinkai'\][\s\S]{0,200}E233系_7000/.test(trainIconsSource),
    'Rinkai trains must not default to JR E233-7000 without vehicle evidence');
  const vehicleMapSource = fs.readFileSync(path.join(ROOT, 'data/timetables/vehicle-type-map.js'), 'utf8');
  assert(/'Rinkai':\s*'JR E233系7000番台 \/ 東京臨海高速鉄道71-000形 \/ 東京臨海高速鉄道70-000形'/.test(vehicleMapSource),
    'Rinkai-to-JR pool must include both current TWR generations and JR E233-7000');
  assert(/'Saikyo':[\s\S]{0,900}'Rinkai':\s*'JR E233系7000番台 \/ 東京臨海高速鉄道71-000形 \/ 東京臨海高速鉄道70-000形'/.test(vehicleMapSource),
    'Saikyo-to-Rinkai pool must include TWR 70-000 and 71-000');
  assert(/'Saikyo':[\s\S]{0,900}'Sotetsu':\s*'JR E233系7000番台 \/ 相鉄12000系'/.test(vehicleMapSource),
    'JR-Sotetsu through pool must retain both E233-7000 and Sotetsu 12000');
  assert(vehicleMapSource.includes('千葉ニュータウン鉄道9100形') &&
         vehicleMapSource.includes('千葉ニュータウン鉄道9200形') &&
         vehicleMapSource.includes('千葉ニュータウン鉄道9800形'),
    'Chiba New Town Railway fleets must retain their actual owner identity');
  assert(!vehicleMapSource.includes('北総9100形') &&
         !vehicleMapSource.includes('北総9200形') &&
         !vehicleMapSource.includes('北総9800形'),
    'Chiba New Town Railway fleets must not be mislabeled as Hokuso-owned');
  assert(/'Asakusa':[\s\S]{0,1800}'Keikyu':\s*'都営5500形 \/ 京急新1000形 \/ 京急600形'/.test(vehicleMapSource),
    'Asakusa-Keikyu pool must include both current Keikyu subway-through fleets');
  assert(!/'(?:Asakusa|Keikyu|Hokuso)'[\s\S]{0,3500}'(?:Toei|Keikyu|Keisei|Hokuso)': '[^']*京成3000形(?!\(8両\))/.test(vehicleMapSource),
    'Keisei 3000 must be explicitly eight-car when used as an Asakusa-network through candidate');
  assert(!/'JR-East': '相鉄12000系 \/ 相鉄20000系 \/ 相鉄21000系'/.test(vehicleMapSource),
    'JR-Sotetsu pools must not include Tokyu-through 20000/21000 series');
  assert(/'SotetsuMain':[\s\S]{0,1200}'default': '[^']*相鉄13000系/.test(vehicleMapSource) &&
         /'SotetsuIzumino':[\s\S]{0,1200}'default': '[^']*相鉄13000系/.test(vehicleMapSource),
    'Sotetsu 13000 must be present in line-internal Main/Izumino pools');
  assert(!/'(?:JR-East|Tokyu|TokyoMetro|Toei|Tobu|SaitamaRailway)': '[^']*相鉄13000系/.test(vehicleMapSource),
    'Sotetsu 13000 is line-internal only and must never enter through-service pools');
  assert(/'Fukutoshin':[\s\S]{0,5000}'Sotetsu': '東急5050系4000番台\(10両\) \/ 相鉄20000系\(10両\)'/.test(vehicleMapSource),
    'Fukutoshin-Sotetsu candidates must remain ten-car Toyoko-compatible fleets');
  assert(/'Yurakucho':[\s\S]{0,4200}'Tobu': '東武9000型\(10両\) \/ 東武9050型\(10両\) \/ 東武50070系\(10両\) \/ 東京メトロ10000系\(10両\) \/ 東京メトロ17000系\(10両\)'/.test(vehicleMapSource),
    'Yurakucho-Tobu candidates must retain the complete ten-car through fleet');
  assert(!/'Yurakucho':[\s\S]{0,4200}'Tobu': '[^']*17000系\(8両\/10両\)/.test(vehicleMapSource),
    'Eight-car Metro 17000 formations must not enter Tobu-bound Yurakucho pools');
  assert(!/'(?:Yurakucho|Fukutoshin)'[\s\S]{0,6000}'(?:Tobu|TokyoMetro|Tokyu|Seibu|Sotetsu)': '[^']*90000系/.test(vehicleMapSource),
    'Tobu 90000 must not be inferred into Metro through pools without operational evidence');
  assert(!vehicleMapSource.includes('東京東京メトロ') && !vehicleMapSource.includes('(8両/10両)(10両)'),
    'vehicle labels must not contain duplicated operator or formation qualifiers');
  for (const lineKey of ['Ikebukuro', 'Yurakucho_Seibu', 'MinatoMirai']) {
    const start = vehicleMapSource.indexOf("'" + lineKey + "': {");
    const end = vehicleMapSource.indexOf("\n    '", start + 8);
    const block = vehicleMapSource.slice(start, end < 0 ? vehicleMapSource.length : end);
    const fStart = block.indexOf("'F-Liner': {");
    if (fStart >= 0) {
      const fEnd = block.indexOf("\n      },", fStart);
      const fBlock = block.slice(fStart, fEnd < 0 ? block.length : fEnd);
      assert(!fBlock.includes('(8両/10両)'), lineKey + ' F-Liner must remain ten-car only');
    }
  }
  assert(/'MinatoMirai':[\s\S]{0,2200}'default': '横浜高速鉄道Y500系\(8両\) \/ 東急5050系\(8両\) \/ 東急5000系\(8両\) \/ 東急5050系4000番台\(10両\)'/.test(vehicleMapSource),
    'MinatoMirai local pool must preserve explicit eight/ten-car identities');
  assert(/'MinatoMirai':[\s\S]{0,2600}'Tobu': '東急5050系4000番台\(10両\) \/ 東武9000型\(10両\) \/ 東武9050型\(10両\) \/ 東武50070系\(10両\) \/ 東京メトロ10000系\(10両\) \/ 東京メトロ17000系\(10両\)'/.test(vehicleMapSource),
    'MinatoMirai-Tobu pool must remain ten-car only');
  assert(!/'MinatoMirai':[\s\S]{0,2600}'Tobu': '[^']*(?:Y500|東急5050系\(8両\)|東急5000系\(8両\))/.test(vehicleMapSource),
    'Eight-car MinatoMirai fleets must not enter the Tobu-bound pool');
  assert(/'Kawagoe':[\s\S]{0,900}'Sotetsu': 'JR E233系7000番台 \/ 相鉄12000系'/.test(vehicleMapSource),
    'Kawagoe-Sotetsu pool must retain both JR E233-7000 and Sotetsu 12000');
  assert(/'Kawagoe':[\s\S]{0,900}'TWR': 'JR E233系7000番台 \/ 東京臨海高速鉄道71-000形 \/ 東京臨海高速鉄道70-000形'/.test(vehicleMapSource),
    'Kawagoe-Rinkai pool must retain JR and both current TWR fleets');
  assert(!/'Kawagoe':[\s\S]{0,900}209系3100番台/.test(vehicleMapSource),
    'Retired 209-3100 must not return to the current Kawagoe through-service pool');
  assertNoFilenameDependentIdentity(win);
  assertCanonicalAssetRenameSimulation(win);

  Object.values(win.TrainIcons.CANONICAL_VEHICLES).forEach((vehicle) => {
    assert(imageExists(vehicle.asset), 'canonical asset missing', vehicle);
  });

  console.log(JSON.stringify({
    status: 'PASS',
    p0: 3,
    p1: 5,
    filenameDependentVehicleIdentity: 0,
    renameSimulation: 'PASS',
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
// JR E233-7000 and TWR 70-000/71-000 are three distinct canonical identities.
// Never collapse them by numeric similarity or mixed-operator fleet weighting.
assert(trainIconsSource.includes('"jr-east-e233-7000-saikyo"') &&
       trainIconsSource.includes('"twr-70-000-rinkai"') &&
       trainIconsSource.includes('"twr-71-000-rinkai"'),
  'JR E233-7000 and both TWR fleets must have separate canonical identities');
assert(!trainIconsSource.includes('"E233系7000番台 / 71-000形 / 70-000形": [38,4,4]'),
  'cross-operator JR/TWR fleet-weight guessing must remain removed');
assert(trainIconsSource.includes('"東京臨海高速鉄道70-000形": "東京臨海高速鉄道70-000形"') &&
       trainIconsSource.includes('"東京臨海高速鉄道71-000形": "東京臨海高速鉄道71-000形"'),
  'Rinkai vehicle identities must retain operator-qualified locks');


// Chuo-Sobu ordinary E231-0/500 are not Tozai-through stock.
// JR's Tozai-through identity is E231-800; keep the boundary explicit.
assert(vehicleMapSource.includes("'TokyoMetro': 'E231系800番台（東西線直通） / 東京メトロ05系(10両) / 東京メトロ07系(10両) / 東京メトロ15000系(10両)'"),
  'Chuo-Sobu TokyoMetro pool must use E231-800 and Metro Tozai stock');
assert(!vehicleMapSource.includes("'TokyoMetro': 'E231系500番台 / E231系0番台 / 東京メトロ05系"),
  'ordinary E231-0/500 must not enter the Tozai-through pool');

// Fukutoshin formation boundary guards.
assert(!vehicleMapSource.includes('西武40000系(10両)(8両/10両)'),
  'malformed Seibu 40000 formation label must not return');
assert(!/'Fukutoshin':[\s\S]{0,6500}東京メトロ10000系(?!\(10両\))/.test(vehicleMapSource),
  'Metro 10000 must remain explicitly ten-car in Fukutoshin mappings');
assert(/'Fukutoshin':[\s\S]{0,6500}'Minatomirai': '東京メトロ10000系\(10両\) \/ 東京メトロ17000系\(8両\/10両\) \/ 横浜高速鉄道Y500系\(8両\)'/.test(vehicleMapSource),
  'Fukutoshin-MinatoMirai local pool must preserve explicit 8/10-car identities');
assert(!/'Fukutoshin':[\s\S]{0,6500}'Tokyu': '[^']*(?:東武50070系|西武40000系)/.test(
  vehicleMapSource.match(/'F-Liner': \{[\s\S]*?\n      \},\n      'Local'/)?.[0] || ''
), 'F-Liner Tokyu pool must not collapse Tobu/Seibu branch stock into a mixed pool');

// 2026 Keisei / Shibayama current-fleet guards.
assert(!vehicleMapSource.includes('芝山鉄道3500形'),
  'retired Shibayama 3500 must not return after 2026-03-31');
assert(vehicleMapSource.includes('芝山鉄道3600形(4両)'),
  'current Shibayama-owned 3600 four-car set must remain represented');
assert(!/京成3050形(?!\(8両\))/.test(vehicleMapSource),
  'Keisei 3050 must retain its explicit eight-car identity');
assert(!/京成3100形(?!\(8両\))/.test(vehicleMapSource),
  'Keisei 3100 must retain its explicit eight-car identity');
assert(!vehicleMapSource.includes('(8両)(8両)'),
  'formation normalization must not duplicate eight-car suffixes');

// Keikyu identity / duplicate-key guards.
assert(vehicleMapSource.includes("'Daishi_Keikyu': {\n      'Local': { 'default': '京急1500形 / 京急新1000形（4両編成）' }"),
  'Daishi line must keep current Keikyu-qualified 1500/1000 identities');
const kurihamaBlock = vehicleMapSource.match(/'KeikyuKurihama': \{[\s\S]*?\n    \},\n    'KeikyuZushi'/)?.[0] || '';
assert((kurihamaBlock.match(/'MorningWing':/g) || []).length === 1 &&
       (kurihamaBlock.match(/'EveningWing':/g) || []).length === 1,
  'KeikyuKurihama must not contain duplicate Wing service keys');
assert(!kurihamaBlock.includes("'default': '2100形") &&
       !kurihamaBlock.includes("'default': '新1000形") &&
       !kurihamaBlock.includes(" / 1500形"),
  'KeikyuKurihama rolling-stock identities must retain the Keikyu operator prefix');

// Fukutoshin branch-boundary guards: Seibu and Tobu branches meet the Metro network,
// but their rolling stock must not be inferred to cross into the opposite branch.
const ikebukuroBlock = vehicleMapSource.match(/'Ikebukuro': \{[\s\S]*?\n    \},\n    'Yurakucho_Seibu'/)?.[0] || '';
const seibuYurakuchoBlock = vehicleMapSource.match(/'Yurakucho_Seibu': \{[\s\S]*?\n    \},\n\n    \/\/ ={10,}/)?.[0] || '';
const ikebukuroFLiner = ikebukuroBlock.match(/'F-Liner': \{[\s\S]*?\n      \}/)?.[0] || '';
const seibuFLiner = seibuYurakuchoBlock.match(/'F-Liner': \{[\s\S]*?\n      \}/)?.[0] || '';
assert(!/東武9000型|東武9050型|東武50070系/.test(ikebukuroFLiner),
  'Tobu through stock must not leak into Seibu Ikebukuro F-Liner pool');
assert(!/東武9000型|東武9050型|東武50070系/.test(seibuFLiner),
  'Tobu through stock must not leak into Seibu Yurakucho F-Liner pool');
const tojoBlock = vehicleMapSource.match(/'Tojo': \{[\s\S]*?\n    \},\n\n    \/\/ ={10,}\n    \/\/ 京王/)?.[0] || '';
assert(!/東京メトロ17000系\(8両\/10両\)/.test(tojoBlock),
  'Tojo through pools must not admit the 8-car Metro 17000 formation');
assert(/東武50070系\(10両\)/.test(tojoBlock),
  'Tojo through stock must retain explicit 10-car 50070 identity');

// Batch guard: current JR suburban fleets + Keio/Toei boundary + Odakyu canonical names.
assert(vehicleMapSource.includes("'KawagoeWest': {\n      'Local': { 'default': 'JR E231系3000番台 / JR 209系3500番台' }"),
  'Kawagoe west must use current E231-3000 / 209-3500 fleet');
assert(vehicleMapSource.includes("'Musashino': {\n      'Local': { 'default': 'JR E231系0番台 / JR E231系900番台 / JR 209系500番台' }"),
  'Musashino must retain its current transferred E231/209 fleet');
assert(vehicleMapSource.includes("'Yokosuka': {\n      'Local': { 'default': 'JR E235系1000番台' },\n      'Rapid': { 'default': 'JR E235系1000番台' }"),
  'Yokosuka ordinary fleet must not fall back to Ueno-Tokyo E231/E233 stock');
const keioMainBlock = vehicleMapSource.match(/'KeioMain': \{[\s\S]*?\n    \},\n\n    \/\/ ={10,}\n    \/\/ 北総/)?.[0] || '';
assert(!/'Toei': '[^']*(?:京王電鉄7000系|京王電鉄8000系)(?:[^']*)'/.test(keioMainBlock),
  'Keio 7000/8000 must not enter Toei Shinjuku through pools');
assert(/京王電鉄9000系30番台 \/ 京王電鉄5000系 \/ 都営10-300形/.test(keioMainBlock),
  'KeioMain Toei pool must preserve subway-compatible Keio/Toei stock');

// Batch guard: Chiba-area local fleets and Fukutoshin-Tojo formation boundary.
for (const line of ['Sotobo','Uchibo']) {
  const block = vehicleMapSource.match(new RegExp("'" + line + "': \\{[\\s\\S]*?\\n    \\},"))?.[0] || '';
  assert(/'Local': \{ 'default': '[^']*JR E131系0番台[^']*JR 209系/.test(block),
    line + ' local pool must retain Chiba-area E131/209 stock');
  assert(!/'Local': \{ 'default': '[^']*JR E235系1000番台/.test(block),
    line + ' local default must not treat Sobu Rapid E235 as local stock');
}
const fukutoshinBlock2 = vehicleMapSource.match(/'Fukutoshin': \{[\s\S]*?\n    \},\n    'Hanzomon'/)?.[0] || '';
for (const m of fukutoshinBlock2.matchAll(/'Tobu': '([^']+)'/g)) {
  assert(!m[1].includes('東京メトロ17000系(8両/10両)'),
    'Fukutoshin Tobu pools must not admit 8-car Metro 17000 formations');
}

// Batch guard: Hachiko current electric fleet and Keisei branch isolation.
assert(vehicleMapSource.includes("'Hachiko': {\n      'Local': { 'default': 'JR 209系3500番台 / JR E231系3000番台' }"),
  'Hachiko electric section must not regress to retired 209-3000 stock');
for (const line of ['KeiseiKanamachi','KeiseiChiba','KeiseiChihara']) {
  const block = vehicleMapSource.match(new RegExp("'" + line + "': \\{[\\s\\S]*?\\n    \\}"))?.[0] || '';
  assert(block, line + ' must retain a dedicated vehicle map');
  assert(!/京成3100形|都営5500形|京急/.test(block),
    line + ' must not inherit Oshiage/Asakusa through stock');
}
assert(!/"KeiseiKanamachi":\s*"KeiseiOshiage"/.test(vehicleMapSource) &&
       !/"KeiseiChiba":\s*"KeiseiOshiage"/.test(vehicleMapSource) &&
       !/"KeiseiChihara":\s*"KeiseiOshiage"/.test(vehicleMapSource),
  'Keisei branch IDs must not alias to Oshiage vehicle pools');

// Batch guard: Tokyu Toyoko canonical operator + formation identities.
const toyokoBlock = vehicleMapSource.match(/'TokyuToyoko': \{[\s\S]*?\n    \},\n    'TokyuDenEn'/)?.[0] || '';
assert(!/(?<!東急)5050系|(?<!東急)5000系/.test(toyokoBlock),
  'Toyoko stock must retain Tokyu operator identity');
assert(!/東武9000型(?!\(10両\))|東武9050型(?!\(10両\))|東武50070系(?!\(10両\))/.test(toyokoBlock),
  'Toyoko Tobu through stock must retain explicit ten-car identity');
assert(!/西武6000系(?!\(10両\))|西武40000系(?!\(10両\))/.test(toyokoBlock),
  'Toyoko Seibu through stock must retain explicit ten-car identity');
const toyokoFLiner = toyokoBlock.match(/'F-Liner': \{[\s\S]*?\n      \}/)?.[0] || '';
assert(!/東京メトロ17000系(?!\(10両\))/.test(toyokoFLiner),
  'Toyoko F-Liner must not admit 8-car Metro 17000 formations');

// Batch guard: 2026 Shiosai mixed E259/E257 operation and JR canonical identities.
for (const line of ['SobuRapid','SobuMain']) {
  const block = vehicleMapSource.match(new RegExp("'" + line + "': \\{[\\s\\S]*?\\n    \\},"))?.[0] || '';
  for (const dest of ['Choshi','Sakura','Naruto']) {
    const row = block.match(new RegExp("'" + dest + "': '([^']+)'"))?.[1] || '';
    assert(row.includes('JR E259系（しおさい）') && row.includes('JR E257系500番台（しおさい）'),
      line + ' ' + dest + ' must preserve both current Shiosai vehicle families');
  }
}
assert(vehicleMapSource.includes("'SobuRapid': {\n      'Rapid': { 'default': 'JR E235系1000番台' }"),
  'Sobu Rapid must retain canonical JR E235-1000 identity');
assert(vehicleMapSource.includes("'Keiyo': {\n      'Local': { 'default': 'JR E233系5000番台' },\n      'Rapid': { 'default': 'JR E233系5000番台' }"),
  'Keiyo must retain canonical JR E233-5000 identity');

// Batch guard: Takasaki / Joetsu / Agatsuma E257-5500 express identity.
for (const line of ['Takasaki','Agatsuma','Joetsu']) {
  const block = vehicleMapSource.match(new RegExp("'" + line + "': \\{[\\s\\S]*?\\n    \\},"))?.[0] || '';
  assert(block.includes('JR E257系5500番台(5両)'),
    line + ' limited express must retain current E257-5500 five-car identity');
  assert(!block.includes('E257系2500番台'),
    line + ' must not mix Odoriko/Shonan E257-2500 stock into Gunma express service');
}

// Batch guard: Izu local stock vs JR Odoriko/Shonan E257 fleet.
for (const line of ['Tokaido','TokaidoMain']) {
  const block = vehicleMapSource.match(new RegExp("'" + line + "': \\{[\\s\\S]*?\\n    \\},"))?.[0] || '';
  const limited = block.match(/'LimitedExpress': \{[\s\S]*?\n      \}/)?.[0] || '';
  assert(!limited.includes('伊豆急行8000系'),
    line + ' limited express pool must not treat Izukyu 8000 as Odoriko stock');
  assert(limited.includes('JR E257系2000番台(9両)') && limited.includes('JR E257系2500番台(5両)'),
    line + ' Odoriko/Shonan pool must retain current E257 2000/2500 formations');
}
const itoBlock = vehicleMapSource.match(/'Ito': \{[\s\S]*?\n    \},\n    'Itsukaichi'/)?.[0] || '';
assert(/'Local': \{ 'default': '[^']*伊豆急行8000系[^']*伊豆急行2100系/.test(itoBlock),
  'Ito local pool must retain Izukyu ordinary/resort stock');
assert(!/'LimitedExpress': \{ 'default': '[^']*伊豆急行8000系/.test(itoBlock),
  'Ito limited express pool must not use Izukyu 8000 as Odoriko');

// Batch guard: Keisei canonical identity and 6/8-car boundary.
for (const line of ['Keisei','KeiseiOshiage','NaritaSkyAccess']) {
  const block = vehicleMapSource.match(new RegExp("'" + line + "': \\{[\\s\\S]*?\\n    \\},"))?.[0] || '';
  assert(!/(^|[ /'])3000形|(^|[ /'])3700形|(^|[ /'])AE形/.test(block),
    line + ' must not regress to bare Keisei vehicle identities');
}
const nsaBlock = vehicleMapSource.match(/'NaritaSkyAccess': \{[\s\S]*?\n    \}/)?.[0] || '';
assert(!/京成3000形(?!\(8両\))/.test(nsaBlock),
  'Narita Sky Access 3000 stock must retain explicit 8-car identity');
assert(nsaBlock.includes('京成3100形(8両)'),
  'Narita Sky Access must retain current 3100 eight-car identity');
const keiseiBlock = vehicleMapSource.match(/'Keisei': \{[\s\S]*?\n    \},\n\n    \/\/ 京成押上線/)?.[0] || '';
assert(keiseiBlock.includes('京成3000形(6両/8両)'),
  'Keisei domestic pool must preserve both 3000 six/eight-car formations');


// Batch guard: Saikyo / Rinkai / Sotetsu through-service operator and formation identity.
assert(/'Rinkai': 'TWR'/.test(vehicleMapSource),
  'Rinkai railway fallback owner must remain TWR, not JR-East');
assert(!/'Rinkai': 'JR-East'/.test(vehicleMapSource),
  'Rinkai railway fallback must never regress to JR-East');
const saikyoBlock = vehicleMapSource.match(/'Saikyo': \{[\s\S]*?\n    \},\n    'ShonanShinjuku'/)?.[0] || '';
assert(saikyoBlock.includes('JR E233系7000番台(10両)'),
  'Saikyo through pool must preserve JR E233-7000 ten-car identity');
assert(saikyoBlock.includes('東京臨海高速鉄道71-000形(10両)'),
  'Saikyo Rinkai pool must preserve TWR 71-000 ten-car identity');
assert(saikyoBlock.includes('東京臨海高速鉄道70-000形(10両)'),
  'Saikyo Rinkai pool must preserve TWR 70-000 ten-car identity');
assert(saikyoBlock.includes('相鉄12000系(10両)'),
  'Saikyo Sotetsu pool must preserve Sotetsu 12000 ten-car identity');
const rinkaiBlock = vehicleMapSource.match(/'Rinkai': \{[\s\S]*?\n    \},\n    'Saikyo'/)?.[0] || '';
assert(rinkaiBlock.includes('東京臨海高速鉄道71-000形(10両)') && rinkaiBlock.includes('東京臨海高速鉄道70-000形(10両)'),
  'Rinkai pool must retain operator-qualified ten-car TWR fleet identities');
const sotetsuBlock = vehicleMapSource.match(/'SotetsuMain': \{[\s\S]*?\n    \},\n    'SotetsuIzumino'/)?.[0] || '';
assert(!/相鉄20000系 \/ 21000系|相鉄20000系 \/ 21000系 \/ 12000系/.test(sotetsuBlock),
  'Sotetsu pool must not regress to bare numeric fleet identities');
assert(sotetsuBlock.includes('相鉄20000系(10両)') && sotetsuBlock.includes('相鉄21000系(8両)'),
  'Sotetsu pool must preserve 20000 ten-car / 21000 eight-car boundary');


// Batch guard: Sotetsu-Tokyu through network must preserve 8/10-car system boundaries.
const sotetsuMainBlock2 = vehicleMapSource.match(/'SotetsuMain': \{[\s\S]*?\n    \},\n    'SotetsuIzumino'/)?.[0] || '';
assert(!/\/ (?:12000系|9000系|10000系|11000系|21000系)(?:[ /']|$)/.test(sotetsuMainBlock2),
  'Sotetsu main pool must not regress to bare numeric fleet identities');
assert(sotetsuMainBlock2.includes('相鉄20000系(10両)') && sotetsuMainBlock2.includes('相鉄21000系(8両)'),
  'Sotetsu main pool must preserve Toyoko 10-car / Meguro 8-car identities');
const meguroBlock = vehicleMapSource.match(/'TokyuMeguro': \{[\s\S]*?\n    \},\n\n    \/\/ =+\n    \/\/ 東京メトロ/)?.[0] || '';
assert(meguroBlock.includes('東急3000系(8両)') && meguroBlock.includes('東急5080系(8両)') && meguroBlock.includes('東急3020系(8両)'),
  'Tokyu Meguro pool must preserve current Tokyu eight-car identities');
assert(!meguroBlock.includes('相鉄20000系(10両)'),
  'Tokyu Meguro pool must not mix Sotetsu 20000 Toyoko ten-car stock');
const toyokoBlock2 = vehicleMapSource.match(/'TokyuToyoko': \{[\s\S]*?\n    \},\n    'TokyuDenEn'/)?.[0] || '';
assert(toyokoBlock2.includes('相鉄20000系(10両)') && !toyokoBlock2.includes('相鉄21000系(8両)'),
  'Tokyu Toyoko through pool must keep Sotetsu 20000 and exclude 21000');
const mitaBlock = vehicleMapSource.match(/'Mita': \{[\s\S]*?\n    \},\n    'Shinjuku'/)?.[0] || '';
assert(mitaBlock.includes('都営6500形(8両)') && mitaBlock.includes('相鉄21000系(8両)'),
  'Mita-Sotetsu through pool must preserve eight-car identities');
assert(!/東京メトロ17000系\(10両\)\(10両\)/.test(vehicleMapSource),
  'vehicle map must not contain duplicated formation suffixes');


// Batch guard: Fukutoshin / Toyoko / Tobu-Seibu through branches preserve formation boundaries.
const fukutoshinBlock = vehicleMapSource.match(/'Fukutoshin': \{[\s\S]*?\n    \},\n    'Hanzomon'/)?.[0] || '';
assert(/'Seibu': '西武40000系\(10両\) \/ 西武6000系\(10両\) \/ 東京メトロ10000系\(10両\) \/ 東京メトロ17000系\(10両\)'/.test(fukutoshinBlock),
  'Fukutoshin Seibu through branch must remain ten-car only');
assert(!/'Seibu': '[^']*(?:西武40000系\(8両\/10両\)|東京メトロ17000系\(8両\/10両\))/.test(fukutoshinBlock),
  'Fukutoshin Seibu through branch must not admit ambiguous eight-car stock');
const toyokoBlock3 = vehicleMapSource.match(/'TokyuToyoko': \{[\s\S]*?\n    \},\n    'TokyuDenEn'/)?.[0] || '';
assert(toyokoBlock3.includes('横浜高速鉄道Y500系(8両)'),
  'Toyoko-Minatomirai pool must preserve Y500 eight-car identity');
assert(toyokoBlock3.includes('相鉄20000系(10両)') && !toyokoBlock3.includes('相鉄21000系(8両)'),
  'Toyoko-Sotetsu branch must remain the ten-car 20000 system');
const tojoBlock = vehicleMapSource.match(/'Tojo': \{[\s\S]*?\n    \},\n\n    \/\/ =+\n    \/\/ 京王/)?.[0] || '';
assert(!/東急5050系4000番台(?!\(10両\))/.test(tojoBlock),
  'Tobu Tojo through references must retain 5050-4000 ten-car identity');
const yurakuchoBlock = vehicleMapSource.match(/'Yurakucho': \{[\s\S]*?\n    \},\n\n    \/\/ =+\n    \/\/ 都営/)?.[0] || '';
assert(/'S-TRAIN': \{[\s\S]*?'default': '西武40000系\(10両\)'/.test(yurakuchoBlock),
  'Yurakucho S-TRAIN must retain Seibu 40000 ten-car identity');


// Batch guard: private-railway through identities must stay operator-qualified and formation-safe.
for (const forbidden of [
  '東急3000系 /',
  '東急5080系 /',
  "相鉄21000系'",
  '東京メトロ10000系 /',
  "西武40000系'",
  "東急5050系4000番台'",
  '東急電鉄1000系 / 7000系',
  '6020系（5両） / 9000系'
]) {
  assert(!vehicleMapSource.includes(forbidden),
    'batch normalized private fleet identity regressed: ' + forbidden);
}
assert(vehicleMapSource.includes('東急1000系 / 東急7000系'),
  'Tokyu Tamagawa/Ikegami fleet names must remain canonical and operator-qualified');
assert(vehicleMapSource.includes('東急6020系（5両） / 東急9000系 / 東急9020系'),
  'Tokyu Oimachi local fleet identities must remain operator-qualified');
assert(vehicleMapSource.includes('東急6020系（7両） / 東急6000系'),
  'Tokyu Oimachi express fleet identities must remain operator-qualified');
assert(vehicleMapSource.includes('横浜高速鉄道Y500系(8両)'),
  'Minatomirai Y500 identity must retain operator and eight-car formation');


// Batch guard: JR East fleet identities must not depend on line-directory context.
for (const model of ['E233系0番台','E231系0番台','E231系1000番台','E233系3000番台','E531系','E129系','E721系','701系','211系','E127系100番台']) {
  assert(!vehicleMapSource.includes("'default': '" + model) && !vehicleMapSource.includes(' / ' + model),
    'JR East fleet identity must remain operator-qualified: ' + model);
}
assert(vehicleMapSource.includes('JR E235系0番台（山手線）'), 'Yamanote E235 identity must remain JR-qualified');
assert(vehicleMapSource.includes('JR E233系1000番台'), 'Keihin-Tohoku E233-1000 identity must remain JR-qualified');
assert(vehicleMapSource.includes('JR E131系500番台'), 'Sagami E131-500 identity must remain JR-qualified');


// Batch guard: independent private/public railway fleets must carry explicit operator identity.
for (const required of [
  '都営12-000形 / 都営12-600形',
  '都電7700形 / 都電8500形 / 都電8800形 / 都電8900形 / 都電9000形',
  '東京都交通局330形',
  '東京モノレール10000形 / 東京モノレール2000形',
  'ゆりかもめ7300系 / ゆりかもめ7500系',
  '横浜高速鉄道Y000系',
  '東急300系',
  '京王電鉄1000系',
  '野岩鉄道6050系100番台',
  '東武N100系（スペーシアX）'
]) {
  assert(vehicleMapSource.includes(required),
    'explicit operator-qualified fleet identity missing: ' + required);
}
for (const forbidden of [
  "'default': '12-000形 / 12-600形'",
  "'default': '7700形 / 8500形 / 8800形 / 8900形 / 9000形'",
  "'default': '330形'",
  "'default': '10000形 / 2000形'",
  "'default': '7300系 / 7500系（7000系は全廃）'",
  "'default': 'Y000系'",
  "'default': '300系'",
  "'default': '1000系'"
]) {
  assert(!vehicleMapSource.includes(forbidden),
    'bare fleet identity regressed: ' + forbidden);
}


// Batch guard: residual cross-operator fleet identities must remain self-identifying.
for (const required of [
  '小田急60000形MSE',
  '小田急70000形GSE',
  'JR E231系800番台（東西線直通）',
  'JR 253系1000番台（日光・きぬがわ）',
  'JR 285系（サンライズ出雲）',
  '京成3600形',
  '京成3500形',
  '京成3400形',
  '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系',
  '横浜市交通局3000形 / 横浜市交通局4000形',
  '横浜市交通局10000形',
  '多摩都市モノレール1000系',
  '首都圏新都市鉄道TX-1000系 / 首都圏新都市鉄道TX-2000系 / 首都圏新都市鉄道TX-3000系',
  'JR東海383系（しなの）'
]) {
  assert(vehicleMapSource.includes(required),
    'residual fleet identity lost operator qualification: ' + required);
}


// Canonical operator-prefix guard: do not reintroduce alternate long-form prefixes.
for (const forbidden of ['小田急電鉄30000形', '小田急電鉄60000形', '小田急電鉄70000形', '東急電鉄1000系', '東急電鉄7000系']) {
  assert(!vehicleMapSource.includes(forbidden),
    'alternate operator prefix regressed into vehicle identity: ' + forbidden);
}
assert(vehicleMapSource.includes('小田急30000形EXEα / 小田急60000形MSE / 小田急70000形GSE'),
  'Odakyu Romancecar identities must use canonical operator prefix');
