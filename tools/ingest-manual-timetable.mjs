#!/usr/bin/env node
/**
 * Materialize one repository manual timetable into Supabase train_runs/train_run_stops.
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SECRET_KEY=... node tools/ingest-manual-timetable.mjs LineId YYYY-MM-DD [weekday|holiday]
 *
 * No browser key is used. The script is intentionally explicit per line/date so CI can
 * schedule only the lines that need refreshing instead of rebuilding the whole network.
 */
import fs from "node:fs/promises";
import path from "node:path";

const [lineId, serviceDate, calendarArg] = process.argv.slice(2);
const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!lineId || !/^\d{4}-\d{2}-\d{2}$/.test(serviceDate || "")) {
  throw new Error("Usage: node tools/ingest-manual-timetable.mjs LineId YYYY-MM-DD [weekday|holiday]");
}
if (!supabaseUrl || !secretKey) throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY are required");

const date = new Date(serviceDate + "T12:00:00Z");
if (Number.isNaN(date.getTime())) throw new Error("Invalid service date");
const calendarType = calendarArg || ([0, 6].includes(date.getUTCDay()) ? "holiday" : "weekday");
if (!["weekday", "holiday"].includes(calendarType)) throw new Error("calendar must be weekday or holiday");

const file = path.resolve("data", "timetables", lineId + "-manual.js");
const source = await fs.readFile(file, "utf8");
const match = source.match(/=\s*(\[[\s\S]*\])\s*;?\s*$/);
if (!match) throw new Error("Unsupported manual timetable wrapper: " + file);
const rows = JSON.parse(match[1]);

const calendarMatches = (value) => {
  const s = String(value || "");
  return calendarType === "weekday"
    ? /(?:Weekday)$/.test(s)
    : /(?:SaturdayHoliday|Holiday|Saturday|Sunday)$/.test(s);
};
const minute = (value) => {
  if (!value) return null;
  const m = String(value).match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  let h = Number(m[1]);
  if (h < 4) h += 24;
  return h * 60 + Number(m[2]);
};
const sqlTime = (value) => {
  if (!value) return null;
  const m = String(value).match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return null;
  return String(Number(m[1]) % 24).padStart(2, "0") + ":" + m[2] + ":" + (m[3] || "00");
};
const stationUrn = (stop) => stop["odpt:arrivalStation"] || stop["odpt:departureStation"] || null;
const stationKey = (urn) => urn ? String(urn).split(".").pop() : null;
const railwayOperator = (railway) => {
  const tail = String(railway || "").split(":").pop() || "";
  return tail.split(".")[0] || "unknown";
};

async function rest(route, init = {}) {
  const res = await fetch(supabaseUrl + "/rest/v1/" + route, {
    ...init,
    headers: {
      apikey: secretKey,
      Authorization: "Bearer " + secretKey,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(res.status + " " + route + ": " + text);
  return text ? JSON.parse(text) : null;
}

const selected = rows.filter((row) => calendarMatches(row["odpt:calendar"]));
if (!selected.length) throw new Error("No timetable rows for " + lineId + " / " + calendarType);

const runRows = selected.map((row) => {
  const railway = row["odpt:railway"] || lineId;
  return {
    service_date: serviceDate,
    calendar_type: calendarType,
    operator: railwayOperator(railway),
    network_key: railway,
    line_id: lineId,
    train_number: String(row["odpt:trainNumber"] || ""),
    operation_code: null,
  };
}).filter((row) => row.train_number);

const runs = await rest(
  "train_runs?on_conflict=service_date,operator,network_key,train_number",
  {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(runRows),
  },
);

const runByKey = new Map(runs.map((run) => [
  [run.operator, run.network_key, run.train_number].join("|"),
  run,
]));

const runIds = runs.map((run) => run.id);
if (runIds.length) {
  await rest("train_run_stops?train_run_id=in.(" + runIds.join(",") + ")", { method: "DELETE" });
}

const stops = [];
for (const row of selected) {
  const railway = row["odpt:railway"] || lineId;
  const key = [railwayOperator(railway), railway, String(row["odpt:trainNumber"] || "")].join("|");
  const run = runByKey.get(key);
  if (!run) continue;
  const objects = Array.isArray(row["odpt:trainTimetableObject"]) ? row["odpt:trainTimetableObject"] : [];
  objects.forEach((stop, index) => {
    const urn = stationUrn(stop);
    const keyName = stationKey(urn);
    if (!keyName) return;
    stops.push({
      train_run_id: run.id,
      stop_sequence: index,
      station_key: keyName,
      station_urn: urn,
      arrival_time: sqlTime(stop["odpt:arrivalTime"]),
      departure_time: sqlTime(stop["odpt:departureTime"]),
      arrival_minute: minute(stop["odpt:arrivalTime"]),
      departure_minute: minute(stop["odpt:departureTime"]),
    });
  });
}
if (stops.length) await rest("train_run_stops", { method: "POST", body: JSON.stringify(stops) });

console.log(JSON.stringify({
  line_id: lineId,
  service_date: serviceDate,
  calendar_type: calendarType,
  source_rows: selected.length,
  train_runs: runs.length,
  train_run_stops: stops.length,
}, null, 2));
