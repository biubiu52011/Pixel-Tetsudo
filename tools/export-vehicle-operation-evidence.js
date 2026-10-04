#!/usr/bin/env node
"use strict";

/*
 * Export canonical operation/vehicle observations from Supabase into the
 * browser runtime snapshot. Requires SUPABASE_URL and a server-side key via
 * SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY.
 *
 * Usage: node tools/export-vehicle-operation-evidence.js
 */
const fs = require("fs");
const path = require("path");

const base = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!base || !key) {
  console.error("Missing SUPABASE_URL and SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY");
  process.exit(2);
}

const RUNTIME_NETWORK_KEYS = {
  "tokyo-monorail": "TokyoMonorail"
};

function normalizeNetworkKey(networkKey) {
  return RUNTIME_NETWORK_KEYS[networkKey] || networkKey;
}

async function get(table, select, order) {
  const url = base + "/rest/v1/" + table + "?select=" + encodeURIComponent(select) + (order ? "&order=" + encodeURIComponent(order) : "");
  const res = await fetch(url, {headers:{apikey:key,Authorization:"Bearer "+key}});
  if (!res.ok) throw new Error(table+" export failed: "+res.status+" "+await res.text());
  return res.json();
}

(async function(){
  const [obs, policies, mappings] = await Promise.all([
    get("runtime_vehicle_operation_evidence",
      "observation_id,service_date,operator,network_key,operation_code,valid_from_time,valid_to_time,vehicle_type,formation_ids,ambiguity_group,observed_date,evidence_grade,source_url,sql_evidence_role",
      "service_date.asc,operator.asc,network_key.asc,operation_code.asc,observation_id.asc"),
    get("runtime_vehicle_source_policy",
      "network_key,realtime_api_available,realtime_vehicle_identity_status,sql_evidence_role",
      "network_key.asc"),
    get("train_operation_mappings",
      "effective_from,network_key,train_number,operation_code",
      "effective_from.asc,network_key.asc,operation_code.asc,train_number.asc")
  ]);
  const pm = Object.fromEntries(policies.map(p=>[p.network_key,p]));
  // train_operation_mappings.effective_from is a validity boundary, not a
  // service date. For each evidence row, use the newest explicit mapping set
  // whose effective_from is on or before that service date. Never infer across
  // operation codes or networks.
  const mappingsByOperation = {};
  mappings.forEach(m=>{
    const key = normalizeNetworkKey(m.network_key)+"|"+m.operation_code;
    if (!mappingsByOperation[key]) mappingsByOperation[key]=[];
    mappingsByOperation[key].push(m);
  });
  function explicitTrainNumbers(networkKey, operationCode, serviceDate) {
    const candidates = mappingsByOperation[normalizeNetworkKey(networkKey)+"|"+operationCode] || [];
    let effectiveFrom = "";
    for (const m of candidates) {
      if (m.effective_from <= serviceDate && m.effective_from > effectiveFrom) effectiveFrom = m.effective_from;
    }
    if (!effectiveFrom) return [];
    return [...new Set(candidates
      .filter(m=>m.effective_from===effectiveFrom && m.train_number)
      .map(m=>m.train_number))];
  }
  const records = obs.map(r=>{
    const p=pm[r.network_key]||{};
    return {
      networkKey:normalizeNetworkKey(r.network_key),validDate:r.service_date,operationCode:r.operation_code,operator:r.operator,
      vehicleType:r.vehicle_type||"",formationIds:Array.isArray(r.formation_ids)?r.formation_ids:[],
      validFromTime:r.valid_from_time||"",validToTime:r.valid_to_time||"",ambiguityGroup:r.ambiguity_group||"",
      observedDate:r.observed_date||r.service_date,grade:r.evidence_grade||"C",sourceUrl:r.source_url||"",
      trainNumbers:explicitTrainNumbers(r.network_key,r.operation_code,r.service_date),
      evidenceRole:r.sql_evidence_role||p.sql_evidence_role||"primary",
      realtimeApiAvailable:p.realtime_api_available===true,
      realtimeVehicleIdentityStatus:p.realtime_vehicle_identity_status||"unknown"
    };
  });
  const json={schemaVersion:2,generatedFrom:"Supabase canonical evidence tables",records};
  const root=path.join(__dirname,"..","data","timetables");
  fs.writeFileSync(path.join(root,"vehicle-operation-evidence.json"),JSON.stringify(json,null,2)+"\n");
  fs.writeFileSync(path.join(root,"vehicle-operation-evidence-data.js"),
    "/* Generated from canonical Supabase evidence tables. Data only; no line logic. */\n"+
    "window.VEHICLE_OPERATION_EVIDENCE = "+JSON.stringify(records,null,2)+";\n");
  console.log("vehicle operation evidence records =",records.length);
})().catch(e=>{console.error(e.stack||e);process.exit(1);});
