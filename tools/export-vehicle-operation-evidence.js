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
  "tokyo-monorail": "TokyoMonorail",
  "tsukuba-express": "TsukubaExpress"
};

function normalizeNetworkKey(networkKey) {
  return RUNTIME_NETWORK_KEYS[networkKey] || networkKey;
}

async function get(table, select, order) {
  const pageSize = 1000;
  let from = 0, rows = [];
  for (;;) {
    const url = base + "/rest/v1/" + table + "?select=" + encodeURIComponent(select) + (order ? "&order=" + encodeURIComponent(order) : "");
    const res = await fetch(url, {headers:{apikey:key,Authorization:"Bearer "+key,Range:from+"-"+(from+pageSize-1)}});
    if (!res.ok) throw new Error(table+" export failed: "+res.status+" "+await res.text());
    const page = await res.json();
    rows = rows.concat(page);
    if (page.length < pageSize) return rows;
    from += pageSize;
  }
}

(async function(){
  const [obs, policies, mappings, coverage, inventory, formations, trainDates, operationDates, trainObs, sources] = await Promise.all([
    get("runtime_vehicle_operation_evidence",
      "observation_id,service_date,operator,network_key,operation_code,valid_from_time,valid_to_time,vehicle_type,formation_ids,ambiguity_group,observed_date,evidence_grade,source_url,sql_evidence_role",
      "service_date.asc,operator.asc,network_key.asc,operation_code.asc,observation_id.asc"),
    get("runtime_vehicle_source_policy",
      "network_key,realtime_api_available,realtime_vehicle_identity_status,sql_evidence_role",
      "network_key.asc"),
    get("train_operation_mappings",
      "effective_from,network_key,train_number,operation_code",
      "effective_from.asc,network_key.asc,operation_code.asc,train_number.asc"),
    get("runtime_vehicle_network_coverage",
      "network_key,coverage_status,operation_evidence_rows,latest_service_date,realtime_api_available,realtime_vehicle_identity_status,sql_evidence_role,effective_coverage_status",
      "network_key.asc"),
    get("runtime_vehicle_evidence_inventory",
      "source_network_key,canonical_network_key,alias_scope,evidence_kind,evidence_rows,exact_rows,narrowed_rows,min_date,max_date",
      "canonical_network_key.asc,evidence_kind.asc,source_network_key.asc"),
    get("formation_assignments",
      "id,service_date,operator,network_key,operation_code,vehicle_type,formation_ids,observed_date,source_id",
      "service_date.asc,network_key.asc,operation_code.asc,id.asc"),
    get("train_vehicle_date_rules",
      "id,valid_date,operator,network_key,train_number,service_name,direction,vehicle_type,source_id",
      "valid_date.asc,network_key.asc,train_number.asc,id.asc"),
    get("operation_vehicle_date_rules",
      "id,valid_date,operator,network_key,operation_code,vehicle_type,formation_id,source_id",
      "valid_date.asc,network_key.asc,operation_code.asc,id.asc"),
    get("train_vehicle_observations",
      "id,service_date,operator,network_key,train_number,vehicle_type,formation_ids,observed_date,source_id",
      "service_date.asc,network_key.asc,train_number.asc,id.asc"),
    get("evidence_sources",
      "id,source_url,evidence_grade",
      "id.asc")
  ]);
  const pm = Object.fromEntries(policies.map(p=>[p.network_key,p]));
  const cm = Object.fromEntries(coverage.map(c=>[c.network_key,c]));
  for (const p of policies) {
    const c = cm[p.network_key];
    if (!c) throw new Error("Missing canonical network coverage for "+p.network_key);
    if (c.realtime_api_available !== p.realtime_api_available ||
        c.realtime_vehicle_identity_status !== p.realtime_vehicle_identity_status ||
        c.sql_evidence_role !== p.sql_evidence_role) {
      throw new Error("Network coverage policy drift for "+p.network_key);
    }
    if (p.realtime_api_available === true &&
        p.realtime_vehicle_identity_status === "unknown" &&
        c.effective_coverage_status === "active") {
      throw new Error("Unverified realtime vehicle identity cannot produce active coverage for "+p.network_key);
    }
  }
  const evidenceStats = {};
  obs.forEach(r=>{
    const s = evidenceStats[r.network_key] || (evidenceStats[r.network_key]={rows:0,latest:""});
    s.rows++;
    if (r.service_date && r.service_date > s.latest) s.latest=r.service_date;
  });
  for (const p of policies) {
    const c = cm[p.network_key];
    const s = evidenceStats[p.network_key] || {rows:0,latest:""};
    if (Number(c.operation_evidence_rows) !== s.rows)
      throw new Error("Network coverage evidence-row drift for "+p.network_key+": coverage="+c.operation_evidence_rows+" evidence="+s.rows);
    if ((c.latest_service_date || "") !== s.latest)
      throw new Error("Network coverage latest-date drift for "+p.network_key+": coverage="+(c.latest_service_date||"")+" evidence="+s.latest);
  }
  for (const c of coverage) {
    if (!pm[c.network_key]) throw new Error("Orphan canonical network coverage for "+c.network_key);
  }
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
  const sourceById=Object.fromEntries(sources.map(s=>[String(s.id),s]));
  function datedRecord(kind,r) {
    const s=sourceById[String(r.source_id)]||{};
    const validDate=r.valid_date||r.service_date||"";
    return {
      evidenceKind:kind, evidenceId:r.id, networkKey:normalizeNetworkKey(r.network_key),
      validDate, operationCode:r.operation_code||"", trainNumber:r.train_number||"",
      operator:r.operator||"", vehicleType:r.vehicle_type||"",
      formationIds:Array.isArray(r.formation_ids)?r.formation_ids:(r.formation_id?[r.formation_id]:[]),
      observedDate:r.observed_date||validDate, grade:s.evidence_grade||"C", sourceUrl:s.source_url||""
    };
  }
  const datedRecords=[
    ...formations.map(r=>datedRecord("formation_assignment",r)),
    ...trainDates.map(r=>datedRecord("train_date_rule",r)),
    ...operationDates.map(r=>datedRecord("operation_date_rule",r)),
    ...trainObs.map(r=>datedRecord("train_observation",r))
  ];
  const datedConflicts={};
  datedRecords.forEach(r=>{
    const identity=(r.vehicleType||"")+"|"+r.formationIds.join("+");
    const key=[r.networkKey,r.validDate,r.operationCode||"",r.trainNumber||""].join("|");
    (datedConflicts[key]||(datedConflicts[key]=new Set())).add(identity);
  });
  for (const [k,ids] of Object.entries(datedConflicts)) {
    if (ids.size>1) throw new Error("Conflicting dated vehicle identities: "+k+" => "+[...ids].join(", "));
  }
  const inventoryNetworks = [...new Set(inventory.map(r=>r.canonical_network_key))];
  if (!inventoryNetworks.length) throw new Error("Canonical vehicle evidence inventory is empty");
  const json={schemaVersion:3,generatedFrom:"Supabase canonical evidence tables",records,
    datedRecords,
    evidenceInventory:{networkCount:inventoryNetworks.length,networks:inventoryNetworks,rows:inventory}};
  const root=path.join(__dirname,"..","data","timetables");
  fs.writeFileSync(path.join(root,"vehicle-operation-evidence.json"),JSON.stringify(json,null,2)+"\n");
  fs.writeFileSync(path.join(root,"vehicle-operation-evidence-data.js"),
    "/* Generated from canonical Supabase evidence tables. Data only; no line logic. */\n"+
    "window.VEHICLE_OPERATION_EVIDENCE = "+JSON.stringify(records,null,2)+";\n"+
    "window.VEHICLE_DATED_EVIDENCE = "+JSON.stringify(datedRecords,null,2)+";\n");
  console.log("vehicle operation evidence records =",records.length);
})().catch(e=>{console.error(e.stack||e);process.exit(1);});
