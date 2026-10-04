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

async function get(table, select) {
  const url = base + "/rest/v1/" + table + "?select=" + encodeURIComponent(select) + "&order=service_date.asc,operator.asc,network_key.asc,operation_code.asc,id.asc";
  const res = await fetch(url, {headers:{apikey:key,Authorization:"Bearer "+key}});
  if (!res.ok) throw new Error(table+" export failed: "+res.status+" "+await res.text());
  return res.json();
}

(async function(){
  const [obs, sources] = await Promise.all([
    get("operation_vehicle_observations","id,service_date,operator,network_key,operation_code,valid_from_time,valid_to_time,vehicle_type,formation_ids,ambiguity_group,observed_date,source_id"),
    (async()=> {
      const url=base+"/rest/v1/evidence_sources?select=id,source_url,evidence_grade";
      const res=await fetch(url,{headers:{apikey:key,Authorization:"Bearer "+key}});
      if(!res.ok) throw new Error("evidence_sources export failed: "+res.status+" "+await res.text());
      return res.json();
    })()
  ]);
  const sm = Object.fromEntries(sources.map(s=>[s.id,s]));
  const records = obs.map(r=>{
    const s=sm[r.source_id]||{};
    return {
      networkKey:normalizeNetworkKey(r.network_key),validDate:r.service_date,operationCode:r.operation_code,operator:r.operator,
      vehicleType:r.vehicle_type||"",formationIds:Array.isArray(r.formation_ids)?r.formation_ids:[],
      validFromTime:r.valid_from_time||"",validToTime:r.valid_to_time||"",ambiguityGroup:r.ambiguity_group||"",
      observedDate:r.observed_date||r.service_date,grade:s.evidence_grade||"C",sourceUrl:s.source_url||"",trainNumbers:[]
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
