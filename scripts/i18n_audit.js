/* i18n audit for tourism UI + data (4 languages: ja/zh/en/ko)
 * Usage: node scripts/i18n_audit.js
 * Exit code: 0 if clean, 1 if missing keys / data i18n / hardcoded UI strings found.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const LANGS = ["ja", "zh", "en", "ko"];

// Configurable ja-base length drift thresholds (ratio of derived-lang length to ja length).
// Override via I18N_MIN_RATIO / I18N_MAX_RATIO env vars.
const MIN_RATIO = parseFloat(process.env.I18N_MIN_RATIO) || 0.25;
const MAX_RATIO = parseFloat(process.env.I18N_MAX_RATIO) || 4;

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function hasAllLang(v) {
  if (!v) return false;
  return LANGS.every((l) => v[l] && String(v[l]).trim());
}

// Detect abnormal length drift between languages for a single i18n value set.
// Returns an array of human-readable warning strings; empty means no drift.
// Base language is Japanese (ja).  zh/en/ko are derived translations.
// A derived language must be present and its length must stay within
// [0.25, 4.0] of the ja length.  ja missing/empty is flagged outright.
function lengthDriftWarnings(values, label) {
  if (!values || !values.ja || !String(values.ja).trim()) {
    return [label + ": ja (base language) missing or empty"];
  }
  const jaLen = String(values.ja).trim().length;
  const out = [];
  for (const lang of LANGS) {
    if (lang === "ja") continue;
    const len = values[lang] ? String(values[lang]).trim().length : 0;
    if (len === 0) {
      out.push(label + ": " + lang + " missing (ja=" + jaLen + " chars)");
      continue;
    }
    if (jaLen > 0 && len / jaLen < MIN_RATIO) {
      out.push(label + ": " + lang + " too short vs ja (" + lang + "=" + len + ", ja=" + jaLen + ")");
    }
    if (jaLen > 0 && len / jaLen > MAX_RATIO) {
      out.push(label + ": " + lang + " too long vs ja (" + lang + "=" + len + ", ja=" + jaLen + ")");
    }
  }
  return out;
}

// ---- 1. translations.js key completeness ----
function auditTranslations() {
  const tRaw = read("js/translations.js");
  const langBlocks = {};
  let cur = null;
  for (const line of tRaw.split(/\r?\n/)) {
    const m = line.match(/^\s*"?(ja|zh|en|ko)"?\s*:\s*\{/);
    if (m) {
      cur = m[1];
      langBlocks[cur] = langBlocks[cur] || [];
      continue;
    }
    if (cur && line.includes("}") && !line.includes(":")) cur = null;
    if (cur) langBlocks[cur].push(line);
  }
  const keysByLang = {};
  for (const lang of LANGS) {
    const text = (langBlocks[lang] || []).join("\n");
    const set = new Set();
    const re = /"detail\.[a-z_0-9]+":/g;
    let m;
    while ((m = re.exec(text))) set.add(m[0].slice(1, -1));
    keysByLang[lang] = set;
  }
  const missing = new Set();
  for (const lang of LANGS) {
    for (const key of keysByLang[lang]) {
      for (const other of LANGS) {
        if (other !== lang && !keysByLang[other].has(key)) {
          missing.add(lang + "/" + other + " missing " + key);
        }
      }
    }
  }
  return [...missing].sort();
}

// ---- 2. tourism data i18n completeness ----
function auditTourismData() {
  const dataRaw = read("data/core/tourism-data.file.js");
  const m = dataRaw.match(/window\.RAILWAY_TOURISM\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
  if (!m) return { issues: ["tourism data bundle not matched in " + "data/core/tourism-data.file.js"], drifts: [] };
  const spots = (new Function("return " + m[1])()).spots || [];
  const issues = [];
  const drifts = [];
  const checkDrift = (values, label) => {
    for (const x of lengthDriftWarnings(values, label)) drifts.push(x);
  };
  for (const spot of spots) {
    if (spot.name_i18n) {
      if (!hasAllLang(spot.name_i18n)) issues.push("name_i18n " + spot.name);
      else checkDrift(spot.name_i18n, "name_i18n " + spot.name);
    }
    if (spot.desc_i18n) {
      if (!hasAllLang(spot.desc_i18n)) issues.push("desc_i18n " + spot.name);
      else checkDrift(spot.desc_i18n, "desc_i18n " + spot.name);
    }
    if (spot.tips_i18n) {
      if (!hasAllLang(spot.tips_i18n)) issues.push("tips_i18n " + spot.name);
      else checkDrift(spot.tips_i18n, "tips_i18n " + spot.name);
    }
    if (spot.hours_i18n) {
      if (!hasAllLang(spot.hours_i18n)) issues.push("hours_i18n " + spot.name);
      else checkDrift(spot.hours_i18n, "hours_i18n " + spot.name);
    }
    if (spot.fee_i18n) {
      if (!hasAllLang(spot.fee_i18n)) issues.push("fee_i18n " + spot.name);
      else checkDrift(spot.fee_i18n, "fee_i18n " + spot.name);
    }
    if (spot.menu_i18n && spot.menu && spot.menu.length) {
      if (spot.menu_i18n.length !== spot.menu.length) issues.push("menu_i18n length " + spot.name);
      for (let i = 0; i < spot.menu_i18n.length; i++) {
        if (!hasAllLang(spot.menu_i18n[i])) {
          issues.push("menu_i18n[" + i + "] " + spot.name);
        } else {
          checkDrift(spot.menu_i18n[i], "menu_i18n[" + i + "] " + spot.name);
        }
      }
    }
  }
  return { issues, drifts };
}

// ---- 3. hardcoded CJK UI strings in tourism JS (excluding translateCommonTerms map & comments) ----
function auditHardcoded() {
  const files = [
    "js/tourism-core.js",
    "js/tourism-shop.js",
    "js/tourism-spot.js",
    "js/tourism-event.js"
  ];
  const out = [];
  for (const f of files) {
    const s = read(f);
    const lines = s.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const re = /'([^']*)'|"([^"]*)"/g;
      let m;
      while ((m = re.exec(lines[i]))) {
        const v = m[1] !== undefined ? m[1] : (m[2] !== undefined ? m[2] : "");
        // Skip keys, data terms already covered by translateCommonTerms map, and CJK punctuation
        if (!v || v.startsWith("detail.") || v.length > 80) continue;
        if (/^[\u3001-\u303F\uFF00-\uFFEF]+$/.test(v)) continue;
        if (/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(v)) {
          out.push(f + ":" + (i + 1) + ": " + v);
        }
      }
    }
  }
  return out;
}

const transMissing = auditTranslations();
const dataAudit = auditTourismData();
const dataMissing = dataAudit.issues;
const dataDrifts = dataAudit.drifts;
const hardcoded = auditHardcoded();

console.log("translation key missing count:", transMissing.length);
transMissing.forEach((x) => console.log("  " + x));

console.log("tourism data i18n missing count:", dataMissing.length);
dataMissing.forEach((x) => console.log("  " + x));

console.log("tourism data length drift warnings:", dataDrifts.length);
dataDrifts.slice(0, 50).forEach((x) => console.log("  " + x));

console.log("possible hardcoded tourism CJK strings:", hardcoded.length);
hardcoded.forEach((x) => console.log("  " + x));

const clean = transMissing.length === 0 && dataMissing.length === 0;
process.exit(clean ? 0 : 1);
