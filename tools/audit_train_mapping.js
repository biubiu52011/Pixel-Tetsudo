const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function imageExists(url) {
  if (!url || typeof url !== 'string') return false;
  const rel = url.replace(/^\.\.\//, '').replace(/\//g, path.sep);
  return fs.existsSync(path.join(ROOT, rel));
}

function loadBrowserTables() {
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
  ['js/train-icons.js', 'data/timetables/vehicle-type-map.js', 'js/train-vehicle.js'].forEach((rel) => {
    vm.runInContext(read(rel), context, { filename: rel });
  });
  return context.window;
}

function collectUrlsFromSource(rel) {
  const text = read(rel);
  const urls = new Set();
  const re = /"\.\.\/images\/列车\/[^"]+?\.png"/g;
  let m;
  while ((m = re.exec(text))) urls.add(m[0].slice(1, -1));
  return [...urls].sort();
}

function compareMap(label, a, b) {
  const out = [];
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  [...keys].sort().forEach((key) => {
    if ((a || {})[key] !== (b || {})[key]) {
      out.push({ type: label, key, trainIcons: (a || {})[key] || '', resolver: (b || {})[key] || '' });
    }
  });
  return out;
}

function main() {
  const win = loadBrowserTables();
  const icons = win.TrainIcons;
  const resolver = require(path.join(ROOT, 'js/train-vehicle-resolver.js'));
  const issues = [];

  [
    ['LINE_ICONS', icons.LINE_ICONS],
    ['OPERATOR_ICONS', icons.OPERATOR_ICONS],
    ['VEHICLE_NAME_TO_ICON', icons.VEHICLE_NAME_TO_ICON]
  ].forEach(([label, obj]) => {
    Object.entries(obj || {}).forEach(([key, url]) => {
      if (!imageExists(url)) issues.push({ type: 'missing-image', table: label, key, url });
    });
  });

  Object.entries(icons.FLEET_ICON_POOLS || {}).forEach(([key, urls]) => {
    (urls || []).forEach((url) => {
      if (!imageExists(url)) issues.push({ type: 'missing-image', table: 'FLEET_ICON_POOLS', key, url });
    });
  });

  ['js/train-icons.js', 'js/train-vehicle.js', 'js/train-vehicle-resolver.js', 'data/timetables/vehicle-type-map.js']
    .forEach((rel) => {
      collectUrlsFromSource(rel).forEach((url) => {
        if (!imageExists(url)) issues.push({ type: 'missing-image-literal', file: rel, url });
      });
    });

  const drift = [
    ...compareMap('drift:LINE_ICONS', icons.LINE_ICONS, resolver.LINE_ICONS),
    ...compareMap('drift:OPERATOR_ICONS', icons.OPERATOR_ICONS, resolver.OPERATOR_ICONS),
    ...compareMap('drift:VEHICLE_NAME_TO_ICON', icons.VEHICLE_NAME_TO_ICON, resolver.VEHICLE_NAME_TO_ICON)
  ];

  const probes = [
    { name: 'Tobu operator default', ctx: { lineId: 'Unknown', operator: 'Tobu', trainId: 'x_1' }, forbid: /8000系/ },
    { name: 'MIR operator default', ctx: { lineId: 'Unknown', operator: 'MIR', trainId: 'x_1' }, expect: /TX-3000系/ },
    { name: 'JR West operator default', ctx: { lineId: 'Unknown', operator: 'JR West', trainId: 'x_1' }, forbid: /JR東日本|E235系山手線/ },
    { name: 'Karasuyama', ctx: { lineId: 'Karasuyama', operator: 'JR-East', trainId: 'x_1' }, expect: /EV-E301/ },
    { name: 'Toei old Asakusa alias', ctx: { lineId: 'Asakusa', operator: 'Toei', vehicleTypeManual: '5300形', trainId: 'x_1' }, expect: /5500形/ },
    { name: 'Metro Marunouchi old alias', ctx: { lineId: 'Marunouchi', operator: 'TokyoMetro', vehicleTypeManual: '02系', trainId: 'x_1' }, expect: /2000系/ },
    { name: 'Rinkai 71', ctx: { lineId: 'Rinkai', operator: 'TWR', trainId: 'x_1' }, expect: /71-000形/ },
    { name: 'Chuo-Sobu local default', ctx: { lineId: 'ChuoSobuLocal', operator: 'JR-East', trainId: '1000C' }, expect: /E231系総武中央線/, forbid: /E235系総武中央線|常磐LED/ },
    { name: 'Chuo-Sobu local timetable vehicle', ctx: { lineId: 'ChuoSobuLocal', operator: 'JR-East', vehicleTypeManual: 'E231系500番台 / E231系0番台', trainId: '1000C' }, expect: /E231系総武中央線/, forbid: /E235系総武中央線|常磐LED/ }
  ];
  probes.forEach((p) => {
    const r = win.TrainVehicle.resolve(p.ctx);
    const value = `${r.name || ''} ${r.iconPath || ''}`;
    if (p.expect && !p.expect.test(value)) issues.push({ type: 'probe-failed', name: p.name, value, expect: String(p.expect), result: r });
    if (p.forbid && p.forbid.test(value)) issues.push({ type: 'probe-forbidden', name: p.name, value, forbid: String(p.forbid), result: r });
  });

  const summary = {
    counts: {
      missingImages: issues.filter((i) => /^missing-image/.test(i.type)).length,
      drift: drift.length,
      probes: issues.filter((i) => /^probe-/.test(i.type)).length
    },
    drift: drift.slice(0, 200),
    issues: issues.slice(0, 200)
  };
  console.log(JSON.stringify(summary, null, 2));
  if (summary.counts.missingImages || summary.counts.probes) process.exitCode = 1;
}

main();
