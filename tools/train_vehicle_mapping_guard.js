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
    // E235系_0番代.png 现在是通用终兜底（Unknown 场景合法命中），不列入 forbid
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

  assertNoCurrentFictionalAsset(win);
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
