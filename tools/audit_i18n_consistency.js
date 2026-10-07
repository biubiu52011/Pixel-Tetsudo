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
    ['ko', 'op.MIR', '수도권 신도시 철도'],
    ['en', 'op.SaitamaRapidRailway', 'Saitama Rapid Railway'],
    ['zh', 'op.SaitamaRapidRailway', '埼玉高速铁道'],
    ['ja', 'op.SaitamaRapidRailway', '埼玉高速鉄道'],
    ['ko', 'op.SaitamaRapidRailway', '사이타마 고속철도'],
    ['en', 'op.ToyoRapid', 'Toyo Rapid Railway'],
    ['zh', 'op.ToyoRapid', '东叶高速铁道'],
    ['ja', 'op.ToyoRapid', '東葉高速鉄道'],
    ['ko', 'op.ToyoRapid', '도요 고속철도'],
    ['en', 'op.Sotetsu', 'Sotetsu Railway'],
    ['zh', 'op.Sotetsu', '相模铁道'],
    ['ja', 'op.Sotetsu', '相模鉄道'],
    ['ko', 'op.Sotetsu', '사가미 철도'],
    ['en', 'op.TWR', 'Tokyo Waterfront Area Rapid Transit'],
    ['zh', 'op.TWR', '东京临海高速铁道'],
    ['ja', 'op.TWR', '東京臨海高速鉄道'],
    ['ko', 'op.TWR', '도쿄 임해 고속철도'],
    ['en', 'op.Rinkai', 'Tokyo Waterfront Area Rapid Transit'],
    ['zh', 'op.Rinkai', '东京临海高速铁道'],
    ['ja', 'op.Rinkai', '東京臨海高速鉄道'],
    ['ko', 'op.Rinkai', '도쿄 임해 고속철도'],
    ['en', 'op.MinatoMirai', 'Yokohama Minatomirai Railway'],
    ['zh', 'op.MinatoMirai', '横滨高速铁道'],
    ['ja', 'op.MinatoMirai', '横浜高速鉄道'],
    ['ko', 'op.MinatoMirai', '요코하마 고속철도'],
    ['en', 'op.TsukubaExpress', 'Metropolitan Intercity Railway'],
    ['zh', 'op.TsukubaExpress', '首都圈新都市铁道'],
    ['ja', 'op.TsukubaExpress', '首都圏新都市鉄道'],
    ['ko', 'op.TsukubaExpress', '수도권 신도시 철도']
  ];
  semanticChecks.forEach(([lang, key, expected]) => {
    assertEquals(errors, 'translation-semantic-drift', translations[lang] && translations[lang][key], expected, { lang, key });
  });

  const tc = loadTransitConstants();
  const lineRecords = Object.values((railwayJson && railwayJson.lines) || {});
  const actualOperators = new Set((tc.OP_ORDER || []).concat(
    lineRecords.map((line) => line && line.operator).filter(Boolean)
  ));
  [...actualOperators].sort().forEach((op) => {
    const key = 'op.' + op;
    const missing = LANGS.filter((lang) => !(translations[lang] || {}).hasOwnProperty(key));
    if (missing.length) errors.push({ type: 'operator-i18n-missing', operator: op, key, missing });
  });

  const stationIds = new Set(Object.keys((railwayJson && railwayJson.stations) || {}));
  const referencedStationIds = new Set();
  lineRecords.forEach((line) => {
    ((line && line.stations) || []).forEach((id) => referencedStationIds.add(id));
  });
  const missingStationI18n = [...referencedStationIds].filter((id) => !stationJson[id]);
  if (missingStationI18n.length) {
    errors.push({ type: 'referenced-station-i18n-missing', count: missingStationI18n.length, sample: missingStationI18n.slice(0, 50) });
  }
  [...referencedStationIds].forEach((id) => {
    const entry = stationJson[id];
    if (!entry) return;
    const missing = LANGS.filter((lang) => !entry[lang] || !String(entry[lang]).trim());
    if (missing.length) errors.push({ type: 'referenced-station-i18n-language-missing', station: id, missing });
  });
  const userStateKeys = [
    'status.display_unavailable',
    'status.display_unavailable_hint',
    'status.fetch_unavailable',
    'status.fetch_unavailable_hint',
    'status.retry',
    'status.timeout',
    'status.timeout_hint',
    'status.offline',
    'status.offline_hint',
    'trains.map_error',
    'tourism.loc_error',
    'detail.unavailable'
  ];
  userStateKeys.forEach((key) => {
    LANGS.forEach((lang) => {
      if (!translations[lang] || !String(translations[lang][key] || '').trim()) {
        errors.push({ type: 'missing-user-state-translation', lang, key });
      }
    });
  });
  const dataStateSource = fs.readFileSync(path.join(ROOT, 'js', 'data-state.js'), 'utf8');
  if (!dataStateSource.includes('setPageStateRetry')) {
    errors.push({ type: 'missing-page-state-recovery-hook', file: 'js/data-state.js' });
  }
  const trainsPageSource = fs.readFileSync(path.join(ROOT, 'js', 'trains-page.js'), 'utf8');
  if (/function showLineView[\s\S]*?catch\s*\(e\)\s*\{\s*\}/.test(trainsPageSource)) {
    errors.push({ type: 'silent-user-facing-render-failure', file: 'js/trains-page.js', function: 'showLineView' });
  }

  const recoveryCss = fs.readFileSync(path.join(ROOT, 'css/style.css'), 'utf8');
  const dataStateJs = fs.readFileSync(path.join(ROOT, 'js/data-state.js'), 'utf8');
  if (!/\.rs-state-retry\s*\{/.test(recoveryCss)) {
    errors.push({ type: 'page-retry-style-missing', file: 'css/style.css' });
  }
  if (!/class=\\?"rs-state-retry/.test(dataStateJs) || !/addEventListener\(\s*["']click["']/.test(dataStateJs)) {
    errors.push({ type: 'page-retry-behavior-missing', file: 'js/data-state.js' });
  }

  const dbLoaderRecovery = fs.readFileSync(path.join(ROOT, 'data/core/db-loader.js'), 'utf8');
  if (!/retry:\s*retry/.test(dbLoaderRecovery) || !/function retry\(\)/.test(dbLoaderRecovery)) {
    errors.push({ type: 'canonical-data-retry-missing', file: 'data/core/db-loader.js' });
  }

  ['js/trains-page.js', 'js/realtime-view.js'].forEach((rel) => {
    const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    if (!/function setFilterAvailability\(available\)/.test(src) ||
        !/setFilterAvailability\(false\)/.test(src) ||
        !/setFilterAvailability\(true\)/.test(src) ||
        !/DataLoader\.retry\(\)/.test(src)) {
      errors.push({ type: 'page-filter-state-lifecycle-missing', file: rel });
    }
  });

  const technicalErrorLabels = {
    en: ['Render error:', 'Data load error'],
    zh: ['渲染失败:', '数据加载失败'],
    ja: ['描画失敗:', 'データ読込失敗'],
    ko: ['렌더링 실패:', '데이터 로드 실패']
  };
  Object.entries(technicalErrorLabels).forEach(([lang, labels]) => {
    labels.forEach((label) => {
      if (translations[lang] && translations[lang]['status.render_error'] === label) {
        errors.push({ type: 'technical-error-copy-exposed', lang, key: 'status.render_error', value: label });
      }
    });
  });

  const kanaRe = /[\u3040-\u30ff]/;
  [...referencedStationIds].forEach((id) => {
    const entry = stationJson[id];
    if (!entry) return;
    if (kanaRe.test(String(entry.zh || ''))) {
      errors.push({ type: 'station-zh-kana-contamination', station: id, value: entry.zh });
    }
    if (kanaRe.test(String(entry.ko || ''))) {
      errors.push({ type: 'station-ko-kana-contamination', station: id, value: entry.ko });
    }
  });

  const normalizedStationIdentityGroups = {};
  Object.keys(stationJson).forEach((id) => {
    const normalized = id.replace(/-/g, '').toLowerCase();
    (normalizedStationIdentityGroups[normalized] || (normalizedStationIdentityGroups[normalized] = [])).push(id);
  });
  Object.entries(normalizedStationIdentityGroups).forEach(([normalized, ids]) => {
    if (ids.length < 2) return;
    const jaNames = [...new Set(ids.map((id) => String((stationJson[id] && stationJson[id].ja) || '')).filter(Boolean))];
    if (jaNames.length > 1) {
      warnings.push({ type: 'station-normalized-id-collision', normalized, ids, jaNames });
    }
  });

  const normalizedStationAliases = {};
  Object.keys(stationJson).forEach((id) => {
    const normalized = id.replace(/-/g, '').toLowerCase();
    (normalizedStationAliases[normalized] || (normalizedStationAliases[normalized] = [])).push(id);
  });
  Object.values(normalizedStationAliases).forEach((ids) => {
    if (ids.length < 2) return;
    const byJa = {};
    ids.forEach((id) => {
      const ja = String((stationJson[id] && stationJson[id].ja) || '');
      (byJa[ja] || (byJa[ja] = [])).push(id);
    });
    Object.entries(byJa).forEach(([ja, aliases]) => {
      if (!ja || aliases.length < 2) return;
      const baseline = stationJson[aliases[0]];
      aliases.slice(1).forEach((id) => {
        LANGS.forEach((lang) => {
          if ((stationJson[id] && stationJson[id][lang]) !== baseline[lang]) {
            errors.push({
              type: 'station-i18n-alias-drift',
              normalized: aliases[0].replace(/-/g, '').toLowerCase(),
              ja,
              aliases,
              lang,
              values: aliases.map((alias) => stationJson[alias] && stationJson[alias][lang])
            });
          }
        });
      });
    });
  });

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
