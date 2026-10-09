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

// Dates published by Japan's Cabinet Office; same dates as the browser estimator.
// Treat unknown years as unverified instead of silently assuming weekdays.
const JP_HOLIDAYS: Record<string, string[]> = {
  "2026": ["01-01","01-12","02-11","02-23","03-20","04-29","05-03","05-04","05-05","05-06","07-20","08-11","09-21","09-22","09-23","10-12","11-03","11-23"],
  "2027": ["01-01","01-11","02-11","02-23","03-21","03-22","04-29","05-03","05-04","05-05","07-19","08-11","09-20","09-23","10-11","11-03","11-23"]
};
function serviceCalendars(serviceDate: string) {
  const year = serviceDate.slice(0, 4);
  if (!JP_HOLIDAYS[year]) throw new Error("UNVERIFIED_SERVICE_CALENDAR");
  const day = new Date(serviceDate + "T12:00:00+09:00").getUTCDay();
  if (!Number.isFinite(day)) throw new Error("INVALID_SERVICE_DATE");
  if (JP_HOLIDAYS[year].includes(serviceDate.slice(5)) || day === 0) {
    return ["odpt.Calendar:Holiday", "odpt.Calendar:SaturdayHoliday", "odpt.Calendar:Sunday"];
  }
  if (day === 6) return ["odpt.Calendar:Saturday", "odpt.Calendar:SaturdayHoliday"];
  return ["odpt.Calendar:Weekday"];
}

function calendarType(calendar?: string | null) {
  const value = String(calendar || "");
  if (value.includes("Weekday")) return "weekday";
  if (value.includes("SaturdayHoliday")) return "saturday_holiday";
  if (value.includes("Saturday")) return "saturday";
  if (value.includes("Sunday")) return "sunday";
  if (value.includes("Holiday")) return "holiday";
  return "special";
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

function sqlTime(time?: string | null) {
  if (!time) return null;
  return String(time).replace(/^([2-4][0-9]):/, (_m: string, h: string) =>
    String(Number(h) % 24).padStart(2, "0") + ":"
  );
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
  for (const calendar of calendars) {
    const u = new URL("./odpt:TrainTimetable", source.odpt_base_url);
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
    // Calendar variants are alternatives, not additive. Do not combine conflicting schedules.
    if (part.length) return part;
  }
  return [];
}

function formatOdptRows(source: any, lineId: string, serviceDate: string, rows: any[]) {
  const valid = rows.filter((tt) =>
    tt && tt["odpt:trainNumber"] && Array.isArray(tt["odpt:trainTimetableObject"]) &&
    tt["odpt:trainTimetableObject"].length >= 2
  );
  if (valid.length !== rows.length) throw new Error("ODPT_INCOMPLETE_RUNS");
  const importRows = valid.map((tt) => ({
    id: null,
    line_id: lineId,
    service_date: serviceDate,
    source: "ODPT_API",
    calendar_type: calendarType(tt["odpt:calendar"]),
    operator: source.odpt_operator,
    network_key: source.odpt_railway,
    train_number: String(tt["odpt:trainNumber"]),
    operation_code: String(tt["odpt:trainNumber"]),
    rail_direction: tt["odpt:railDirection"] || null,
    train_type: tt["odpt:trainType"] || null,
    destination_station: Array.isArray(tt["odpt:destinationStation"])
      ? (tt["odpt:destinationStation"][0] || null) : (tt["odpt:destinationStation"] || null),
    stops: tt["odpt:trainTimetableObject"].map((stop: any, index: number) => {
      const urn = stationUrn(stop);
      if (!urn) throw new Error("ODPT_MISSING_STATION");
      return {
        train_run_id: null,
        stop_sequence: index,
        station_key: stationKey(urn), station_urn: urn,
        arrival_time: sqlTime(stop["odpt:arrivalTime"]),
        departure_time: sqlTime(stop["odpt:departureTime"]),
        arrival_minute: minuteOf(stop["odpt:arrivalTime"]),
        departure_minute: minuteOf(stop["odpt:departureTime"]),
      };
    }),
  }));
  return importRows;
}


/**
 * Read recurring SQL timetable templates when a line has no upstream API and
 * there is no date-specific run. Calendar variants are alternatives.
 * Page both queries because Supabase Data API defaults to at most 1000 rows.
 */
async function readManualTemplateRuns(db: any, lineId: string, serviceDate: string): Promise<Response> {
  async function pages(makeQuery: (first: number, last: number) => any) {
    const out: any[] = [];
    const size = 700;
    for (let first = 0; first < 35000; first += size) {
      const { data, error } = await makeQuery(first, first + size - 1);
      if (error) throw error;
      if (!Array.isArray(data)) throw new Error("INVALID_SQL_PAGE");
      out.push(...data);
      if (data.length < size) return out;
    }
    throw new Error("SQL_RESULT_TOO_LARGE");
  }
  let templates: any[] = [];
  for (const calendar of serviceCalendars(serviceDate)) {
    const selected = await pages((first, last) => db.from("manual_timetable_templates")
      .select("id,line_key,calendar_urn,train_number,railway_urn,direction_urn,train_type_urn,destination_urns,vehicle_type_label")
      .eq("line_key", lineId).eq("calendar_urn", calendar).order("id").range(first, last));
    if (selected.length) { templates = selected; break; }
  }
  if (!templates.length) return json({ ok: true, complete: false, cache: "MISS",
    source: "NO_API_NO_DATA", line_id: lineId, service_date: serviceDate, runs: [] });

  const byTemplate = new Map<number, any[]>();
  // Keep URL/IN-list bounded; individual batches still page if stops exceed 700.
  for (let pos = 0; pos < templates.length; pos += 100) {
    const ids = templates.slice(pos, pos + 100).map(t => t.id);
    const stops = await pages((first, last) => db.from("manual_timetable_template_stops")
      .select("template_id,stop_sequence,arrival_station_urn,departure_station_urn,arrival_clock,departure_clock")
      .in("template_id", ids).order("template_id").order("stop_sequence").range(first, last));
    for (const stop of stops) {
      const list = byTemplate.get(stop.template_id) || [];
      list.push(stop);
      byTemplate.set(stop.template_id, list);
    }
  }
  const result = templates.map((t) => {
    const operator = /^odpt\.Railway:([^.]+)\./.exec(t.railway_urn || "")?.[1] || "";
    return {
      id: "manual-template:" + t.id,
      line_id: lineId,
      service_date: serviceDate,
      calendar_type: calendarType(t.calendar_urn),
      operator, network_key: t.railway_urn,
      train_number: t.train_number,
      operation_code: t.train_number,
      rail_direction: t.direction_urn,
      train_type: t.train_type_urn,
      destination_station: t.destination_urns?.[0] || null,
      vehicle_type_label: t.vehicle_type_label || null,
      stops: (byTemplate.get(t.id) || []).map((s: any) => {
        const urn = s.arrival_station_urn || s.departure_station_urn || "";
        return {
          station_urn: urn,
          station_key: stationKey(urn),
          arrival_time: sqlTime(s.arrival_clock),
          departure_time: sqlTime(s.departure_clock),
          arrival_minute: minuteOf(s.arrival_clock),
          departure_minute: minuteOf(s.departure_clock),
        };
      }),
    };
  });
  const complete = result.length > 0 && result.every(r => r.stops.length >= 2);
  return json({ ok: true, complete, cache: complete ? "HIT" : "PARTIAL",
    source: "DATABASE_MANUAL_TEMPLATES", line_id: lineId, service_date: serviceDate,
    runs: complete ? result : [] });
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
  const { data: source, error: sourceError } = await db.from("railway_lines")
    .select("odpt_operator,odpt_railway,odpt_base_url").eq("id", lineId).maybeSingle();
  if (sourceError) return json({ ok: false, error: "DB_SOURCE_LOOKUP_FAILED" }, 500);
  const hasApi = !!(source?.odpt_operator && source?.odpt_railway && source?.odpt_base_url);
  // Browser fallback uses SQL only; never refetch the API it already owns.
  if (hasApi && url.searchParams.get("fallback_only") === "1") {
    return json({ ok: true, complete: false, cache: "BYPASS",
      source: "API_AVAILABLE", line_id: lineId, service_date: serviceDate, runs: [] });
  }
  if (hasApi) {
    const sourceKey = source.odpt_base_url.includes("api-challenge")
      ? Deno.env.get("ODPT_CHALLENGE_CONSUMER_KEY") : Deno.env.get("ODPT_CONSUMER_KEY");
    if (!sourceKey) return json({ ok: true, complete: false, cache: "BYPASS",
      source: "API_UNCONFIGURED", line_id: lineId, service_date: serviceDate, runs: [] });
    try {
      const upstream = await fetchOdptRows(source, sourceKey, serviceDate);
      const runs = formatOdptRows(source, lineId, serviceDate, upstream);
      return json({ ok: true, complete: runs.length > 0, cache: "BYPASS",
        source: "ODPT_API", line_id: lineId, service_date: serviceDate, runs });
    } catch (err) {
      console.error("[train-runs] ODPT API read failed", lineId, String(err));
      return json({ ok: true, complete: false, cache: "BYPASS",
        source: "API_ERROR", line_id: lineId, service_date: serviceDate, runs: [] });
    }
  }

  // Database is only for lines without a configured upstream timetable API.
  const { data: runs, error } = await db.from("train_runs")
    .select("id,service_date,calendar_type,operator,network_key,line_id,train_number,operation_code,rail_direction,train_type,destination_station")
    .eq("line_id", lineId).eq("service_date", serviceDate).order("train_number");
  if (error) return json({ ok: false, error: "DB_QUERY_FAILED" }, 500);
  if (!runs?.length) {
    try { return await readManualTemplateRuns(db, lineId, serviceDate); }
    catch (err) {
      console.error("[train-runs] Manual SQL template read failed", lineId, String(err));
      return json({ ok: true, complete: false, cache: "MISS",
        source: "DATABASE_TEMPLATE_ERROR", line_id: lineId, service_date: serviceDate, runs: [] });
    }
  }

  const { data: stops, error: stopError } = await db.from("train_run_stops")
    .select("train_run_id,stop_sequence,station_key,station_urn,arrival_time,departure_time,arrival_minute,departure_minute")
    .in("train_run_id", runs.map((r) => r.id)).order("train_run_id").order("stop_sequence");
  if (stopError) return json({ ok: false, error: "DB_STOP_QUERY_FAILED" }, 500);
  const byRun = new Map<number, unknown[]>();
  for (const stop of stops || []) {
    const list = byRun.get(stop.train_run_id) || [];
    list.push(stop);
    byRun.set(stop.train_run_id, list);
  }
  const result = runs.map((run) => ({ ...run, stops: byRun.get(run.id) || [] }));
  const complete = result.length > 0 && result.every((run) => run.stops.length >= 2);
  return json({ ok: true, cache: complete ? "HIT" : "PARTIAL", complete,
    source: "DATABASE_MANUAL", line_id: lineId, service_date: serviceDate, runs: complete ? result : [] });
});
