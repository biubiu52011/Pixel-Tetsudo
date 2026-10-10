#!/usr/bin/env node
/*
 * Old vehicle-audit map/fix/deploy machinery was retired with the duplicated
 * icon dictionaries. This entrypoint delegates to the single-runtime audit.
 */
'use strict';
const args=process.argv.slice(2);
if (args.some(x => /^(fix|deploy|--apply|--bump)$/.test(x))) {
  console.error('Legacy vehicle-map mutation/deploy is disabled. Use verified GitHub CI and the canonical vehicle evidence database.');
  process.exit(2);
}
require('./audit_train_mapping.js');
