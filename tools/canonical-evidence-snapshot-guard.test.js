#!/usr/bin/env node
"use strict";

const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const jsonPath = "data/timetables/vehicle-operation-evidence.json";
const jsPath = "data/timetables/vehicle-operation-evidence-data.js";
const snapshot = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

assert.strictEqual(snapshot.schemaVersion, 2,
  "canonical evidence snapshot must use schema v2; run the canonical Supabase sync");

assert.equal(snapshot.generatedFrom, "Supabase canonical evidence tables");
assert(Array.isArray(snapshot.records), "snapshot records must be an array");
assert(snapshot.records.length > 0, "snapshot must not be empty");
assert(snapshot.records.some(r => r.networkKey === "TokyoMonorail"),
  "snapshot must retain TokyoMonorail canonical evidence");
assert(snapshot.records.some(r => r.networkKey !== "TokyoMonorail"),
  "snapshot must contain canonical evidence beyond the legacy single-network seed");

for (const [i, r] of snapshot.records.entries()) {
  assert(r && !Array.isArray(r) && typeof r === "object", "record "+i+" must be an object");
  for (const key of ["networkKey","validDate","operationCode","operator","vehicleType","formationIds","grade","sourceUrl","trainNumbers"]) {
    assert(Object.prototype.hasOwnProperty.call(r,key), "record "+i+" missing "+key);
  }
  assert(Array.isArray(r.formationIds), "record "+i+" formationIds must be array");
  assert(Array.isArray(r.trainNumbers), "record "+i+" trainNumbers must be array");
}

const sandbox={window:{}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(jsPath,"utf8"),sandbox);
const jsRecords=JSON.parse(JSON.stringify(sandbox.window.VEHICLE_OPERATION_EVIDENCE));
assert.deepStrictEqual(jsRecords,snapshot.records,"JSON and browser JS snapshots must match exactly");

console.log("canonical evidence snapshot guard: PASS ("+snapshot.records.length+" records)");
