const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LANG = 'ja';
const TRANSLATIONS_FILE = path.join(ROOT, 'js/translations.js');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function write(rel, text) {
  fs.writeFileSync(path.join(ROOT, rel), text, 'utf8');
}

function loadTranslations() {
  const text = fs.readFileSync(TRANSLATIONS_FILE, 'utf8');
  const marker = 'var translations =';
  const start = text.indexOf(marker);
  const end = text.indexOf('\n  function t', start);
  if (start < 0 || end < 0) throw new Error('Cannot locate translations object');
  const src = text.slice(start + marker.length, end).trim().replace(/;\s*$/, '');
  return new Function('return (' + src + ');')();
}

function htmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function htmlUnescape(s) {
  return String(s)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function normalizeText(s) {
  return htmlUnescape(String(s || '').replace(/\s+/g, ' ').trim());
}

function pageFiles() {
  return fs.readdirSync(path.join(ROOT, 'pages'))
    .filter((file) => file.endsWith('.html'))
    .map((file) => 'pages/' + file)
    .sort();
}

function collectPageEntries() {
  const entries = [];
  pageFiles().forEach((rel) => {
    const text = read(rel);
    const bodyRe = /<([a-zA-Z][\w:-]*)([^>]*\bdata-i18n="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/g;
    let m;
    while ((m = bodyRe.exec(text))) {
      if (m[4].includes('<')) continue;
      entries.push({ file: rel, kind: 'text', key: m[3], value: normalizeText(m[4]) });
    }
    const phRe = /<[^>]*\bdata-i18n-placeholder="([^"]+)"[^>]*\bplaceholder="([^"]*)"[^>]*>/g;
    while ((m = phRe.exec(text))) {
      entries.push({ file: rel, kind: 'placeholder', key: m[1], value: normalizeText(m[2]) });
    }
  });
  return entries;
}

function syncPagesFromTranslations(dryRun) {
  const translations = loadTranslations();
  const ja = translations[LANG] || {};
  const changes = [];
  pageFiles().forEach((rel) => {
    let text = read(rel);
    const before = text;
    text = text.replace(/(<([a-zA-Z][\w:-]*)([^>]*\bdata-i18n="([^"]+)"[^>]*)>)([\s\S]*?)(<\/\2>)/g,
      (all, open, tag, attrs, key, body, close) => {
        if (body.includes('<') || !Object.prototype.hasOwnProperty.call(ja, key)) return all;
        const next = htmlEscape(ja[key]);
        if (normalizeText(body) !== ja[key]) changes.push({ file: rel, kind: 'text', key, from: normalizeText(body), to: ja[key] });
        return open + next + close;
      });
    text = text.replace(/(<[^>]*\bdata-i18n-placeholder="([^"]+)"[^>]*\bplaceholder=")([^"]*)("[^>]*>)/g,
      (all, open, key, value, close) => {
        if (!Object.prototype.hasOwnProperty.call(ja, key)) return all;
        if (normalizeText(value) !== ja[key]) changes.push({ file: rel, kind: 'placeholder', key, from: normalizeText(value), to: ja[key] });
        return open + String(ja[key]).replace(/"/g, '&quot;') + close;
      });
    if (text !== before && !dryRun) write(rel, text);
  });
  return changes;
}

function replaceTranslationValue(source, lang, key, value) {
  const langPos = source.indexOf('    ' + lang + ': {');
  if (langPos < 0) throw new Error('Cannot locate language block: ' + lang);
  const nextLang = source.indexOf('\n    },', langPos);
  if (nextLang < 0) throw new Error('Cannot locate end of language block: ' + lang);
  const block = source.slice(langPos, nextLang);
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('("' + escapedKey + '"\\s*:\\s*)"([^"\\\\]*(?:\\\\.[^"\\\\]*)*)"');
  if (!re.test(block)) return source;
  const jsonValue = JSON.stringify(String(value));
  const updatedBlock = block.replace(re, '$1' + jsonValue);
  return source.slice(0, langPos) + updatedBlock + source.slice(nextLang);
}

function syncTranslationsFromPages(dryRun) {
  let source = fs.readFileSync(TRANSLATIONS_FILE, 'utf8');
  const translations = loadTranslations();
  const ja = translations[LANG] || {};
  const changes = [];
  collectPageEntries().forEach((entry) => {
    if (!entry.value || !Object.prototype.hasOwnProperty.call(ja, entry.key)) return;
    if (ja[entry.key] === entry.value) return;
    changes.push({ file: entry.file, kind: entry.kind, key: entry.key, from: ja[entry.key], to: entry.value });
    source = replaceTranslationValue(source, LANG, entry.key, entry.value);
    ja[entry.key] = entry.value;
  });
  if (changes.length && !dryRun) fs.writeFileSync(TRANSLATIONS_FILE, source, 'utf8');
  return changes;
}

function main() {
  const mode = process.argv.includes('--from-pages') ? 'from-pages'
    : process.argv.includes('--from-translations') ? 'from-translations'
    : '';
  const dryRun = process.argv.includes('--check') || process.argv.includes('--dry-run');
  if (!mode) {
    console.error('Usage: node tools/sync_i18n_pages.js --from-pages|--from-translations [--check]');
    process.exit(2);
  }
  const changes = mode === 'from-pages'
    ? syncTranslationsFromPages(dryRun)
    : syncPagesFromTranslations(dryRun);
  console.log(JSON.stringify({ mode, dryRun, changes: changes.length, sample: changes.slice(0, 50) }, null, 2));
  if (dryRun && changes.length) process.exitCode = 1;
}

if (require.main === module) main();

module.exports = { collectPageEntries, syncPagesFromTranslations, syncTranslationsFromPages };
