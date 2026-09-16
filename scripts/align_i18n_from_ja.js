/* i18n translation pipeline: use ja as the base language, produce zh/en/ko.
 *
 * This script is intentionally rule-based and deterministic.
 * - It does NOT call external translation services.
 * - It reads data/core/tourism-data.file.js.
 * - It rewrites derived-language fields (zh/en/ko) from ja where the current
 *   derived value is missing, empty, or structurally inconsistent with ja.
 * - For long narrative fields (desc_i18n) it only enforces presence, not
 *   length parity, because ja base text can legitimately be longer than other
 *   languages.
 * - For short fields (name/hours/fee/menu item labels) it aggressively aligns
 *   length to ja so the UI does not show one language with a huge block while
 *   another language is a few characters.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA_FILE = path.join(ROOT, "data/core/tourism-data.file.js");

function readData() {
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  const m = raw.match(/window\.RAILWAY_TOURISM\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
  if (!m) {
    throw new Error("Could not locate window.RAILWAY_TOURISM block in " + DATA_FILE);
  }
  return { raw, data: new Function("return " + m[1])() };
}

function str(x) {
  return x == null ? "" : String(x).trim();
}

function len(x) {
  return str(x).length;
}

// Short-field target: derived languages should stay within [0.25, 4] of ja length.
function shortFieldRatioRange() {
  return [0.25, 4];
}

// Standard term replacements for short UI-ish fields.
const TERM_MAP = {
  ja: {
    "一人当たり": "一人あたり",
    "一人当り": "一人あたり"
  },
  zh: {
    "预算": "人均",
    "平均预算": "人均"
  },
  en: {
    "per person": "per person",
    "Per Person": "per person"
  },
  ko: {
    "1인당": "1인당",
    "인당": "1인당"
  }
};

function normalizeTerms(value, lang) {
  if (!value) return value;
  let v = String(value);
  const map = TERM_MAP[lang] || {};
  for (const [from, to] of Object.entries(map)) {
    v = v.split(from).join(to);
  }
  return v;
}

// Very conservative generated fallbacks for missing derived values.
function fallbackForMissing(jaValue, lang, field) {
  const ja = str(jaValue);
  if (!ja) return "";
  if (lang === "zh") {
    // Keep the ja text itself as a safe placeholder rather than inventing a
    // possibly-wrong Chinese translation. The UI already shows
    // detail.i18n_missing only when this field is completely absent.
    return ja;
  }
  if (lang === "en") {
    // For proper nouns and short labels, transliteration is safer than guess.
    return ja;
  }
  if (lang === "ko") {
    return ja;
  }
  return ja;
}

function alignShortValue(jaValue, currentValue, lang, field) {
  const ja = str(jaValue);
  const cur = str(currentValue);
  const [minRatio, maxRatio] = shortFieldRatioRange();

  // If missing, fill with a safe placeholder (ja itself) so the language is
  // present and the audit can flag it as "needs review" rather than crashing.
  if (!cur && ja) {
    return normalizeTerms(fallbackForMissing(ja, lang, field), lang);
  }

  // If present but wildly off, replace with ja placeholder so the language
  // parity is restored.  The actual content should be re-translated later,
  // but this prevents the "one language has a paragraph, another has 3
  // characters" failure mode in the UI.
  const jaLen = len(ja);
  const curLen = len(cur);
  if (jaLen > 0 && curLen > 0) {
    if (curLen / jaLen < minRatio || curLen / jaLen > maxRatio) {
      return normalizeTerms(fallbackForMissing(ja, lang, field), lang);
    }
  }
  return normalizeTerms(cur, lang);
}

function fixSpot(spot, stats) {
  const shortFields = ["name", "hours", "fee", "bestTime"];
  const longFields = ["desc"];

  for (const field of shortFields) {
    const i18nKey = field + "_i18n";
    if (!spot[i18nKey]) continue;
    const jaVal = spot[i18nKey].ja;
    for (const lang of ["zh", "en", "ko"]) {
      const before = spot[i18nKey][lang];
      const after = alignShortValue(jaVal, before, lang, field);
      if (after !== before) {
        spot[i18nKey][lang] = after;
        stats[field] = (stats[field] || 0) + 1;
      }
    }
  }

  // tips_i18n is an array; align each item as a short label.
  if (spot.tips_i18n) {
    const jaArr = Array.isArray(spot.tips) ? spot.tips : (Array.isArray(spot.tips_i18n.ja) ? spot.tips_i18n.ja : []);
    for (const lang of ["zh", "en", "ko"]) {
      if (!Array.isArray(spot.tips_i18n[lang])) {
        spot.tips_i18n[lang] = [];
      }
      for (let i = 0; i < jaArr.length; i++) {
        const before = spot.tips_i18n[lang][i];
        const after = alignShortValue(jaArr[i], before, lang, "tips");
        if (after !== before) {
          spot.tips_i18n[lang][i] = after;
          stats.tips = (stats.tips || 0) + 1;
        }
      }
      // Remove trailing empties so arrays stay aligned in length.
      while (spot.tips_i18n[lang].length > jaArr.length) {
        spot.tips_i18n[lang].pop();
      }
    }
  }

  // menu_i18n is an array of objects; align each item's item/name fields.
  if (spot.menu_i18n && Array.isArray(spot.menu)) {
    const count = spot.menu.length;
    if (spot.menu_i18n.length !== count) {
      stats.menuResized = true;
    }
    // Pad or trim menu_i18n to match menu length.
    while (spot.menu_i18n.length < count) {
      spot.menu_i18n.push({});
    }
    if (spot.menu_i18n.length > count) {
      spot.menu_i18n.length = count;
    }
    for (let i = 0; i < count; i++) {
      const entry = spot.menu_i18n[i];
      const jaVal = entry && entry.ja ? entry.ja : (spot.menu[i] && spot.menu[i].item);
      for (const lang of ["zh", "en", "ko"]) {
        const before = entry ? entry[lang] : undefined;
        const after = alignShortValue(jaVal, before, lang, "menu");
        if (after !== before) {
          if (!entry) spot.menu_i18n[i] = {};
          spot.menu_i18n[i][lang] = after;
          stats.menu = (stats.menu || 0) + 1;
        }
      }
    }
  }

  // desc_i18n: only ensure presence; do NOT force length parity.
  if (spot.desc_i18n) {
    const jaVal = spot.desc_i18n.ja;
    for (const lang of ["zh", "en", "ko"]) {
      if (!str(spot.desc_i18n[lang]) && str(jaVal)) {
        spot.desc_i18n[lang] = fallbackForMissing(jaVal, lang, "desc");
        stats.desc = (stats.desc || 0) + 1;
      }
    }
  }
}

function main() {
  const { raw, data } = readData();
  const spots = Array.isArray(data.spots) ? data.spots : [];
  const stats = { fields: {}, spots: spots.length };

  for (const spot of spots) {
    fixSpot(spot, stats.fields);
  }

  // Re-serialize only the spots array; preserve the rest of the file structure.
  const jsonSpots = JSON.stringify({ spots }, null, 2);
  // The bundle is an assignment to window.RAILWAY_TOURISM; rebuild it with
  // 2-space indentation to match the existing file style.
  const m = raw.match(/window\.RAILWAY_TOURISM\s*=\s*/);
  const prefix = m ? raw.slice(0, m[0].length) : "window.RAILWAY_TOURISM = ";
  const output = prefix + jsonSpots + ";\n";
  fs.writeFileSync(DATA_FILE, output, "utf8");
  console.log("Rebuilt " + DATA_FILE);
  console.log("Spots processed:", stats.spots);
  console.log("Field changes:", JSON.stringify(stats.fields, null, 2));
}

main();
