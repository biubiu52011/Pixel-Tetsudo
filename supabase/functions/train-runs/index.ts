import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "public, max-age=30, stale-while-revalidate=120",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
  });
}

function serviceCalendars(serviceDate: string) {
  const day = new Date(serviceDate + "T12:00:00+09:00").getUTCDay();
  if (day === 6) return ["odpt.Calendar:SaturdayHoliday", "odpt.Calendar:Holiday", "odpt.Calendar:Saturday"];
  if (day === 0) return ["odpt.Calendar:SaturdayHoliday", "odpt.Calendar:Holiday", "odpt.Calendar:Sunday"];
  return ["odpt.Calendar:Weekday"];
}

function minuteOf(time?: string | null) {
  if (!time) return null;
  const m = /^(\d{1,2}):(\d{2})/.exec(time);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 4) h += 24;
  return h * 60 + min;
}

function stationUrn(stop: Record<string, unknown>) {
  return String(stop["odpt:arrivalStation"] || stop["odpt:departureStation"] || "");
}

function stationKey(urn: string) {
  const p = urn.split(".");
  return p[p.length - 1] || urn;
}

async function fetchOdptRows(source: any, sourceKey: string, serviceDate: string) {
  const calendars = serviceCalendars(serviceDate);
  const seen = new Set<string>();
  const rows: any[] = [];
  for (const calendar of calendars) {
    const u = new URL("odpt:TrainTimetable", source.odpt_base_url);
    u.searchParams.set("odpt:operator", "odpt.Operator:" + source.odpt_operator);
    u.searchParams.set("odpt:railway", "odpt.Railway:" + source.odpt_operator + "." + source.odpt_railway);
    u.searchParams.set("odpt:calendar", calendar);
    u.searchParams.set("acl:consumerKey", sourceKey);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    let res: Response;
    try { res = await fetch(u.toString(), { signal: controller.signal }); }
    finally { clearTimeout(timer); }
    if (!res.ok) throw new Error("ODPT_HTTP_" + res.status);
    const part = await res.json();
    if (!Array.isArray(part)) throw new Error("ODPT_INVALID_PAYLOAD");
    // ODPT's 1000-row response is a truncation signal. Never persist an
    // incomplete timetable as authoritative cache.
    if (part.length >= 1000) throw new Error("ODPT_TRUNCATED");
    for (const tt of part) {
      const key = [tt["odpt:trainNumber"], tt["odpt:calendar"], tt["odpt:railDirection"]].join("|");
      if (!seen.has(key)) { seen.add(key); rows.push(tt); }
    }
  }
  return rows;
}

async function persistOdptRows(db: any, source: any, lineId: string, serviceDate: string, rows: any[]) {
  const valid = rows.filter((tt) =>
    tt && tt["odpt:trainNumber"] && Array.isArray(tt["odpt:trainTimetableObject"]) &&
    tt["odpt:trainTimetableObject"].length >= 2
  );
  if (!valid.length) return false;
  const runRows = valid.map((tt) => ({
    service_date: serviceDate,
    calendar_type: String(tt["odpt:calendar"] || "").includes("Weekday") ? "weekday" : "holiday",
    operator: source.odpt_operator,
    network_key: source.odpt_railway,
    line_id: lineId,
    train_number: String(tt["odpt:trainNumber"]),
    operation_code: String(tt["odpt:trainNumber"]),
    rail_direction: tt["odpt:railDirection"] || null,
    train_type: tt["odpt:trainType"] || null,
    destination_station: Array.isArray(tt["odpt:destinationStation"])
      ? (tt["odpt:destinationStation"][0] || null) : (tt["odpt:destinationStation"] || null),
  }));
  const { data: saved, error } = await db.from("train_runs").upsert(runRows, {
    onConflict: "service_date,operator,network_key,train_number"
  }).select("id,train_number");
  if (error || !saved?.length) throw new Error("DB_RUN_UPSERT_FAILED");

  const idByNumber = new Map(saved.map((r: any) => [String(r.train_number), r.id]));
  const runIds = saved.map((r: any) => r.id);
  const { error: deleteError } = await db.from("train_run_stops").delete().in("train_run_id", runIds);
  if (deleteError) throw new Error("DB_STOP_REPLACE_FAILED");

  const stops: any[] = [];
  for (const tt of valid) {
    const runId = idByNumber.get(String(tt["odpt:trainNumber"]));
    if (!runId) continue;
    tt["odpt:trainTimetableObject"].forEach((stop: any, index: number) => {
      const urn = stationUrn(stop);
      if (!urn) return;
      stops.push({
        train_run_id: runId, stop_sequence: index,
        station_key: stationKey(urn), station_urn: urn,
        arrival_time: stop["odpt:arrivalTime"] || null,
        departure_time: stop["odpt:departureTime"] || null,
        arrival_minute: minuteOf(stop["odpt:arrivalTime"]),
        departure_minute: minuteOf(stop["odpt:departureTime"]),
      });
    });
  }
  if (!stops.length) throw new Error("ODPT_NO_STOPS");
  for (let i = 0; i < stops.length; i += 500) {
    const { error: stopError } = await db.from("train_run_stops").insert(stops.slice(i, i + 500));
    if (stopError) throw new Error("DB_STOP_INSERT_FAILED");
  }
  return true;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "GET") return json({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405);

  const url = new URL(req.url);
  const lineId = (url.searchParams.get("line_id") || "").trim();
  const serviceDate = (url.searchParams.get("service_date") || "").trim();
  if (!/^[A-Za-z0-9._:-]{1,80}$/.test(lineId)) return json({ ok: false, error: "INVALID_LINE_ID" }, 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(serviceDate)) return json({ ok: false, error: "INVALID_SERVICE_DATE" }, 400);

  const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
  const secretKey = secretKeys.default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!supabaseUrl || !secretKey) return json({ ok: false, error: "SERVER_CONFIG" }, 500);

  const db = createClient(supabaseUrl, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: runs, error } = await db
    .from("train_runs")
    .select("id,service_date,calendar_type,operator,network_key,line_id,train_number,operation_code,rail_direction,train_type,destination_station")
    .eq("line_id", lineId).eq("service_date", serviceDate).order("train_number");
  if (error) return json({ ok: false, error: "DB_QUERY_FAILED" }, 500);
  if (!runs?.length) {
    const { data: source } = await db.from("railway_lines")
      .select("odpt_operator,odpt_railway,odpt_base_url").eq("id", lineId).maybeSingle();
    const sourceKey = source?.odpt_base_url?.includes("api-challenge")
      ? Deno.env.get("ODPT_CHALLENGE_CONSUMER_KEY")
      : Deno.env.get("ODPT_CONSUMER_KEY");
    if (!source?.odpt_operator || !source?.odpt_railway || !source?.odpt_base_url) {
      return json({ ok: true, cache: "MISS", complete: false, line_id: lineId, service_date: serviceDate, source: "UNMAPPED", runs: [] });
    }
    if (!sourceKey) {
      return json({ ok: true, cache: "MISS", complete: false, line_id: lineId, service_date: serviceDate, source: "UNCONFIGURED", runs: [] });
    }
    try {
      const odptRows = await fetchOdptRows(source, sourceKey, serviceDate);
      if (!odptRows.length || !await persistOdptRows(db, source, lineId, serviceDate, odptRows)) {
        return json({ ok: true, cache: "MISS", complete: false, line_id: lineId, service_date: serviceDate, source: "EMPTY", runs: [] });
      }
      const { data: filled, error: refillError } = await db.from("train_runs")
        .select("id,service_date,calendar_type,operator,network_key,line_id,train_number,operation_code,rail_direction,train_type,destination_station")
        .eq("line_id", lineId).eq("service_date", serviceDate).order("train_number");
      if (refillError || !filled?.length) return json({ ok: false, error: "DB_REFILL_QUERY_FAILED" }, 500);
      runs.splice(0, runs.length, ...filled);
    } catch (e) {
      console.error("[train-runs] read-through failed", lineId, String(e));
      return json({ ok: true, cache: "MISS", complete: false, line_id: lineId, service_date: serviceDate, source: "ERROR", runs: [] });
    }
  }

  const { data: stops, error: stopError } = await db
    .from("train_run_stops")
    .select("train_run_id,stop_sequence,station_key,station_urn,arrival_time,departure_time,arrival_minute,departure_minute")
    .in("train_run_id", runs.map((r) => r.id))
    .order("train_run_id").order("stop_sequence");
  if (stopError) return json({ ok: false, error: "DB_STOP_QUERY_FAILED" }, 500);

  const byRun = new Map<number, unknown[]>();
  for (const stop of stops || []) {
    const list = byRun.get(stop.train_run_id) || [];
    list.push(stop);
    byRun.set(stop.train_run_id, list);
  }
  const payload = runs.map((run) => ({ ...run, stops: byRun.get(run.id) || [] }));
  const complete = payload.every((run) => run.stops.length >= 2);
  return json({ ok: true, cache: complete ? "HIT" : "PARTIAL", complete, line_id: lineId, service_date: serviceDate, runs: complete ? payload : [] });
});
