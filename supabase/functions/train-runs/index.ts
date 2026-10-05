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
    return json({
      ok: true, cache: "MISS", complete: false, line_id: lineId, service_date: serviceDate,
      source: !source?.odpt_operator || !source?.odpt_railway || !source?.odpt_base_url
        ? "UNMAPPED" : (sourceKey ? "READY" : "UNCONFIGURED"),
      runs: []
    });
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
