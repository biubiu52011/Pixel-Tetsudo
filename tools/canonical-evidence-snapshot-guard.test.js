#!/usr/bin/env node
"use strict";

const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const jsonPath = "data/timetables/vehicle-operation-evidence.json";
const jsPath = "data/timetables/vehicle-operation-evidence-data.js";
const snapshot = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

assert.strictEqual(snapshot.schemaVersion, 3,
  "canonical evidence snapshot must use schema v3; run the canonical Supabase sync");

assert.equal(snapshot.generatedFrom, "Supabase canonical evidence tables");
assert(Array.isArray(snapshot.records), "snapshot records must be an array");
assert(Array.isArray(snapshot.datedRecords), "snapshot datedRecords must be an array");
assert(Array.isArray(snapshot.familyRules), "snapshot familyRules must be an array");
assert(snapshot.familyRules.length === 36, "canonical family-rule inventory must contain all 36 rules");
assert(snapshot.familyRules.some(r=>r.networkKey==="Yamanote" && r.codePattern==="*" && r.exactVehicleType==="E235系0番台（山手線）"),
  "Yamanote fleet E235-0 exact rule missing");
assert(snapshot.familyRules.some(r=>r.networkKey==="setagaya" && r.codePattern==="*" && r.exactVehicleType==="東急300系"),
  "Setagaya structural exact rule missing");
assert(snapshot.familyRules.some(r=>r.networkKey==="kodomonokuni" && r.codePattern==="*" && r.exactVehicleType==="横浜高速鉄道Y000系"),
  "Kodomonokuni structural exact rule missing");
assert(snapshot.familyRules.some(r=>r.networkKey==="odakyu-main" && r.codePattern==="E*" && !r.exactVehicleType && r.vehicleCandidates.length===4),
  "Odakyu E-family must remain narrowed rather than exact");
assert(snapshot.familyRules.some(r=>r.networkKey==="asakusa" && r.codePattern==="*K" && !r.exactVehicleType && r.vehicleCandidates.length===0),
  "Asakusa Keisei ownership rule must not invent a vehicle model");
assert(snapshot.datedRecords.length >= 300, "canonical dated evidence unexpectedly incomplete");
for (const kind of ["formation_assignment","train_date_rule","operation_date_rule","train_observation"]) {
  assert(snapshot.datedRecords.some(r=>r.evidenceKind===kind), "dated evidence missing "+kind);
}
for (const [i,r] of snapshot.datedRecords.entries()) {
  assert(r.validDate && r.networkKey && r.vehicleType, "dated record "+i+" missing explicit date/network/vehicle identity");
  assert(r.operationCode || r.trainNumber, "dated record "+i+" must have operationCode or trainNumber");
  assert(["A","B","C","D"].includes(r.grade), "dated record "+i+" missing evidence grade");
  assert(r.sourceUrl, "dated record "+i+" missing traceable source URL");
}
assert(snapshot.records.length > 0, "snapshot must not be empty");
assert(snapshot.records.some(r => r.networkKey === "TokyoMonorail"),
  "snapshot must retain TokyoMonorail canonical evidence");
assert(snapshot.records.some(r => r.networkKey !== "TokyoMonorail"),
  "snapshot must contain canonical evidence beyond the legacy single-network seed");
assert(snapshot.evidenceInventory && Array.isArray(snapshot.evidenceInventory.rows),
  "schema v3 must carry the canonical multi-layer evidence inventory");
assert(snapshot.evidenceInventory.networkCount >= 21,
  "canonical evidence inventory unexpectedly lost network coverage");
for (const key of ["asakusa","chiyoda-joban-odakyu","denentoshi-hanzomon","hibiya","seibu-shinjuku","tobu-limited-express","tsukuba-express"]) {
  assert(snapshot.evidenceInventory.networks.includes(key),
    "canonical evidence inventory missing "+key);
}
const aliasRows=snapshot.evidenceInventory.rows.filter(r=>r.source_network_key!==r.canonical_network_key);
assert(aliasRows.some(r=>r.source_network_key==="TokyoMonorail" && r.canonical_network_key==="tokyo-monorail"),
  "TokyoMonorail legacy key must be canonicalized in evidence inventory");
assert(aliasRows.some(r=>r.source_network_key==="TsukubaExpress" && r.canonical_network_key==="tsukuba-express"),
  "TsukubaExpress legacy key must be canonicalized in evidence inventory");

const odakyuMapped = snapshot.records.find(r =>
  r.networkKey === "odakyu-main" &&
  r.validDate > "2026-03-14" &&
  Array.isArray(r.trainNumbers) &&
  r.trainNumbers.length > 0);
assert(odakyuMapped,
  "effective train-operation mappings must carry forward beyond effective_from; Odakyu post-2026-03-14 evidence lost its explicit train numbers");

for (const [i, r] of snapshot.records.entries()) {
  assert(r && !Array.isArray(r) && typeof r === "object", "record "+i+" must be an object");
  for (const key of ["networkKey","validDate","operationCode","operator","vehicleType","formationIds","grade","sourceUrl","trainNumbers"]) {
    assert(Object.prototype.hasOwnProperty.call(r,key), "record "+i+" missing "+key);
  }
  assert(Array.isArray(r.formationIds), "record "+i+" formationIds must be array");
  assert(Array.isArray(r.trainNumbers), "record "+i+" trainNumbers must be array");
  assert(["primary","fallback","historical"].includes(r.evidenceRole),
    "record "+i+" must carry a valid SQL evidence role");
  assert(!Object.prototype.hasOwnProperty.call(r,"realtimeApiAvailable"),
    "record "+i+" must not export operator API capability as runtime coverage");
  assert(!Object.prototype.hasOwnProperty.call(r,"realtimeVehicleIdentityStatus"),
    "record "+i+" must not export duplicate realtime coverage policy");
}

const sandbox={window:{}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(jsPath,"utf8"),sandbox);
const jsRecords=JSON.parse(JSON.stringify(sandbox.window.VEHICLE_OPERATION_EVIDENCE));
assert.deepStrictEqual(jsRecords,snapshot.records,"JSON and browser JS snapshots must match exactly");
const jsDated=JSON.parse(JSON.stringify(sandbox.window.VEHICLE_DATED_EVIDENCE));
assert.deepStrictEqual(jsDated,snapshot.datedRecords,"JSON and browser JS dated snapshots must match exactly");
const jsFamily=JSON.parse(JSON.stringify(sandbox.window.VEHICLE_FAMILY_RULES));
assert.deepStrictEqual(jsFamily,snapshot.familyRules,"JSON and browser JS family-rule snapshots must match exactly");

console.log("canonical evidence snapshot guard: PASS ("+snapshot.records.length+" records)");
