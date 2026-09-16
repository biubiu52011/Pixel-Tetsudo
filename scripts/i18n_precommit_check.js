#!/usr/bin/env node
/* Pre-commit i18n gate for tourism data + UI copy.
 *
 * Usage: node scripts/i18n_precommit_check.js
 *   Optionally pass custom thresholds:
 *   I18N_MIN_RATIO=0.3 I18N_MAX_RATIO=3 node scripts/i18n_precommit_check.js
 *
 * Exits 0 if all checks pass, 1 otherwise.
 * Intended to be wired into a git pre-commit hook:
 *
 *   .git/hooks/pre-commit:
 *     #!/bin/sh
 *     node scripts/i18n_precommit_check.js || exit 1
 */
"use strict";

const { execSync } = require("child_process");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

function run(cmd) {
  console.log("\$ " + cmd);
  try {
    execSync(cmd, { stdio: "inherit", cwd: ROOT });
    return true;
  } catch (e) {
    console.error("FAILED: " + cmd);
    return false;
  }
}

const files = [
  "js/translations.js",
  "js/tourism-core.js",
  "js/tourism-shop.js",
  "data/core/tourism-data.file.js"
];

let ok = true;

// 1. Syntax check all relevant files
for (const f of files) {
  ok = run("node --check " + f) && ok;
}

// 2. Align i18n from ja base (idempotent; fixes missing/length-mismatched values)
ok = run("node scripts/align_i18n_from_ja.js") && ok;

// 3. Audit (thresholds configurable via I18N_MIN_RATIO / I18N_MAX_RATIO)
ok = run("node scripts/i18n_audit.js") && ok;

if (ok) {
  console.log("\nAll i18n pre-commit checks passed.");
  process.exit(0);
} else {
  console.error("\ni18n pre-commit checks FAILED — see output above.");
  process.exit(1);
}
