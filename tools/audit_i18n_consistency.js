const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const LANGS = ['en', 'zh', 'ja', 'ko'];
const pageSync = require('./sync_i18n_pages.js');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function json(rel) {
  return JSON.parse(read(rel));
}

function sortDeep(value) {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === 'object') {
    const out = {};
    Object.keys(value).sort().forEach((key) => {
      out[key] = sortDeep(value[key]);
    });
    return out;
  }
  return value;
}

function sameJson(a, b) {
  return JSON.stringify(sortDeep(a)) === JSON.stringify(sortDeep(b));
}

function loadWindowAssignment(rel, name) {
  const text = read(rel);
  const re = new RegExp('window\\.' + name + '\\s*=\\s*([\\s\\S]*?)\\s*;\\s*$');
  const m = text.match(re);
  if (!m) throw new Error('Cannot locate window.' + name + ' assignment in ' + rel);
  return new Function('return (' + m[1] + ');')();
}

function loadTranslations() {
  const text = read('js/translations.js');
  const marker = 'var translations =';
  const start = text.indexOf(marker);
  const end = text.indexOf('\n  function t', start);
  if (start < 0 || end < 0) throw new Error('Cannot locate translations object');
  const src = text.slice(start + marker.length, end).trim().replace(/;\s*$/, '');
  return new Function('return (' + src + ');')();
}

function assertEquals(errors, type, actual, expected, meta) {
  if (actual !== expected) {
    errors.push(Object.assign({ type, actual, expected }, meta || {}));
  }
}

function collectPageI18nKeys() {
  const pagesDir = path.join(ROOT, 'pages');
  const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.html'));
  const keys = [];
  files.forEach((file) => {
    const text = fs.readFileSync(path.join(pagesDir, file), 'utf8');
    const re = /\bdata-i18n(?:-placeholder)?="([^"]+)"/g;
    let m;
    while ((m = re.exec(text))) keys.push({ file: 'pages/' + file, key: m[1] });
  });
  return keys;
}

function generatedDataConfigBundle() {
  const dir = path.join(ROOT, 'data/core');
  const order = [
    'transfer-hints.js',
    'runtime-config.js',
    'through-service.js',
    'line-operation-systems.js',
    'platform-data.js',
    'line-service-relations.js',
    'train-type-defs.js',
  ];
  let out = '/* Pixel Tetsudo - Data Config Bundle (auto-merged).\n' +
    ' * Merged from: ' + order.join(', ') + '.\n' +
    ' * Do not edit here; edit the source files and re-run node data/core/gen-config-bundle.js\n */\n';
  order.forEach((file) => {
    const p = path.join(dir, file);
    if (!fs.existsSync(p)) return;
    let src = fs.readFileSync(p, 'utf8');
    if (src.charCodeAt(0) === 0xFEFF) src = src.slice(1);
    out += '\n// ===== ' + file + ' =====\n' + src + '\n';
  });
  return out;
}

function loadTransitConstants() {
  const context = {
    console,
    window: {
      addEventListener() {},
      location: { pathname: '/' },
      document: {
        createElement() {
          return { textContent: '', innerHTML: '' };
        }
      }
    }
  };
  vm.createContext(context);
  vm.runInContext(read('js/common.js'), context, { filename: 'js/common.js' });
  return context.window.TransitConstants || {};
}

function main() {
  const errors = [];
  const warnings = [];

  const stationJson = json('data/core/station_i18n.json');
  const stationFile = loadWindowAssignment('data/core/station-i18n.file.js', 'RAILWAY_I18N');
  if (!sameJson(stationJson, stationFile)) {
    errors.push({ type: 'derived-drift', source: 'data/core/station_i18n.json', derived: 'data/core/station-i18n.file.js' });
  }

  const railwayJson = json('data/core/railway_data.json');
  const railwayFile = loadWindowAssignment('data/core/railway-data.file.js', 'RAILWAY_DATA');
  if (!sameJson(railwayJson, railwayFile)) {
    errors.push({ type: 'derived-drift', source: 'data/core/railway_data.json', derived: 'data/core/railway-data.file.js' });
  }

  const expectedBundle = generatedDataConfigBundle();
  const actualBundle = read('data/core/data-config-bundle.js');
  if (expectedBundle !== actualBundle) {
    errors.push({ type: 'derived-drift', source: 'data/core/*.js config sources', derived: 'data/core/data-config-bundle.js' });
  }

  const translations = loadTranslations();
  const termMap = json('data/core/i18n-term-map.json');
  LANGS.forEach((lang) => {
    if (!translations[lang]) errors.push({ type: 'missing-language', lang });
    if (!termMap[lang]) errors.push({ type: 'term-map-language-missing', lang });
    else if (!termMap[lang] || typeof termMap[lang] !== 'object' || Array.isArray(termMap[lang])) {
      errors.push({ type: 'term-map-language-invalid', lang });
    }
  });

  const allTranslationKeys = new Set();
  LANGS.forEach((lang) => {
    Object.keys(translations[lang] || {}).forEach((key) => allTranslationKeys.add(key));
  });
  [...allTranslationKeys].sort().forEach((key) => {
    const missing = LANGS.filter((lang) => !(translations[lang] || {}).hasOwnProperty(key));
    if (missing.length) errors.push({ type: 'translation-key-missing-language', key, missing });
  });

  collectPageI18nKeys().forEach(({ file, key }) => {
    const missing = LANGS.filter((lang) => !(translations[lang] || {}).hasOwnProperty(key));
    if (missing.length) errors.push({ type: 'page-i18n-key-missing', file, key, missing });
  });

  pageSync.collectPageEntries().forEach((entry) => {
    const expected = translations.ja && translations.ja[entry.key];
    if (expected && entry.value && expected !== entry.value) {
      errors.push({ type: 'page-ja-fallback-drift', file: entry.file, kind: entry.kind, key: entry.key, page: entry.value, translationsJa: expected });
    }
  });

  const semanticChecks = [
    ['en', 'op.MIR', 'Metropolitan Intercity Railway'],
    ['zh', 'op.MIR', '首都圈新都市铁道'],
    ['ja', 'op.MIR', '首都圏新都市鉄道'],
    ['ko', 'op.MIR', '수도권 신도시 철도']
  ];
  semanticChecks.forEach(([lang, key, expected]) => {
    assertEquals(errors, 'translation-semantic-drift', translations[lang] && translations[lang][key], expected, { lang, key });
  });

  const tc = loadTransitConstants();
  (tc.OP_ORDER || []).forEach((op) => {
    const key = 'op.' + op;
    const missing = LANGS.filter((lang) => !(translations[lang] || {}).hasOwnProperty(key));
    if (missing.length) errors.push({ type: 'operator-i18n-missing', operator: op, key, missing });
  });

  const stationIds = new Set(Object.keys((railwayJson && railwayJson.stations) || {}));
  const missingStationI18n = [...stationIds].filter((id) => !stationJson[id]);
  if (missingStationI18n.length) {
    warnings.push({ type: 'station-i18n-missing', count: missingStationI18n.length, sample: missingStationI18n.slice(0, 20) });
  }

  const orphanStationI18n = Object.keys(stationJson).filter((id) => !stationIds.has(id));
  if (orphanStationI18n.length) {
    warnings.push({ type: 'station-i18n-without-station', count: orphanStationI18n.length, sample: orphanStationI18n.slice(0, 20) });
  }

  const summary = {
    counts: {
      errors: errors.length,
      warnings: warnings.length,
      translationKeys: allTranslationKeys.size,
      pageI18nRefs: collectPageI18nKeys().length,
      stationI18n: Object.keys(stationJson).length,
      stations: stationIds.size
    },
    errors: errors.slice(0, 200),
    warnings: warnings.slice(0, 50)
  };
  console.log(JSON.stringify(summary, null, 2));
  if (errors.length) process.exitCode = 1;
}

main();
