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

async function fetchOdptCalendarRows(source: any, sourceKey: string, calendar: string) {
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
  if (part.length >= 1000) throw new Error("ODPT_TRUNCATED");
  return part;
}

async function fetchOdptRows(source: any, sourceKey: string, serviceDate: string) {
  for (const calendar of serviceCalendars(serviceDate)) {
    const part = await fetchOdptCalendarRows(source, sourceKey, calendar);
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
    // Train numbers are not operation codes; the scoped evidence resolver owns that link.
    operation_code: "",
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
async function readManualTemplateRuns(db: any, lineId: string, serviceDate: string, timetableOperator: string | null): Promise<Response> {
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
  let selectedCalendar: string | null = null;
  for (const calendar of serviceCalendars(serviceDate)) {
    const selected = await pages((first, last) => db.from("manual_timetable_templates")
      .select("id,line_key,calendar_urn,train_number,railway_urn,direction_urn,train_type_urn,destination_urns,vehicle_type_label,physical_service_key,source_trip_id,previous_timetable_ids,next_timetable_ids,source_path,source_revision_date")
      .eq("line_key", lineId).eq("calendar_urn", calendar).order("id").range(first, last));
    if (selected.length) { templates = selected; selectedCalendar = calendar; break; }
  }
  // Retain both original SQL imports, but serve one verified itinerary.
  if (lineId === "SaikyoKawagoe") {
    const seen = new Set<string>();
    templates = templates.filter((t: any) => {
      const key = t.physical_service_key ?
        [t.calendar_urn,t.railway_urn,t.physical_service_key].join("|") : "";
      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
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
  // Vehicle type may be verified by a *different* timetable segment of
  // the very same through train. At the canonical Osaki boundary, accept a
  // single exact Rinkai model only when BOTH schedules agree on operating
  // calendar, train number, boundary station and precise scheduled clock.
  // This projects evidence in the response; historical SQL labels remain
  // unchanged, and no train-number-only or line-default model is invented.
  const boundaryVehicle = new Map<number, string>();
  if (lineId === "SaikyoKawagoe" && selectedCalendar) {
    const ambiguous = templates.filter((t: any) =>
      String(t.vehicle_type_label || "").split("/").filter(Boolean).length > 1);
    const numbers = [...new Set(ambiguous.map((t: any) => String(t.train_number || "")).filter(Boolean))];
    if (numbers.length) {
      const rinkaiTemplates: any[] = [];
      for (let i = 0; i < numbers.length; i += 100) {
        const batch = await pages((first, last) => db.from("manual_timetable_templates")
          .select("id,train_number,vehicle_type_label")
          .eq("line_key", "Rinkai").eq("calendar_urn", selectedCalendar)
          .in("train_number", numbers.slice(i, i + 100))
          .order("id").range(first, last));
        rinkaiTemplates.push(...batch.filter((t: any) =>
          t.vehicle_type_label && !String(t.vehicle_type_label).includes("/")));
      }
      const rinkaiStops = new Map<number, any[]>();
      for (let i = 0; i < rinkaiTemplates.length; i += 100) {
        const ids = rinkaiTemplates.slice(i, i + 100).map((t: any) => t.id);
        const rows = await pages((first, last) => db.from("manual_timetable_template_stops")
          .select("template_id,stop_sequence,arrival_station_urn,departure_station_urn,arrival_clock,departure_clock")
          .in("template_id", ids).order("template_id").order("stop_sequence").range(first, last));
        rows.forEach((s: any) => {
          const a = rinkaiStops.get(s.template_id) || [];
          a.push(s);
          rinkaiStops.set(s.template_id, a);
        });
      }
      // A candidate that has a conflicting or duplicate Rinkai model is
      // unresolved, not a reason to pick whichever row happened to sort first.
      const linkCandidates = new Map<string, string[]>();
      const stopName = (s: any) => String(s?.arrival_station_urn || s?.departure_station_urn || "").split(".").pop();
      const clock = (v: any) => String(v || "").slice(0, 5);
      rinkaiTemplates.forEach((t: any) => {
        const stops = rinkaiStops.get(t.id) || [];
        const first = stops[0];
        if (!first || stopName(first) !== "Osaki") return;
        const dep = clock(first.departure_clock || first.arrival_clock);
        if (!dep) return;
        const key = String(t.train_number) + "|" + dep;
        const list = linkCandidates.get(key) || [];
        list.push(String(t.vehicle_type_label).trim());
        linkCandidates.set(key, list);
      });
      ambiguous.forEach((t: any) => {
        const stops = byTemplate.get(t.id) || [];
        const last = stops[stops.length - 1];
        if (!last || stopName(last) !== "Osaki") return;
        const arrival = clock(last.arrival_clock || last.departure_clock);
        const list = linkCandidates.get(String(t.train_number) + "|" + arrival) || [];
        if (list.length !== 1) return;
        const verifiedModel = list[0];
        const candidates = String(t.vehicle_type_label || "").split("/").map((s: string) => s.trim());
        if (candidates.includes(verifiedModel)) boundaryVehicle.set(t.id, verifiedModel);
      });
    }
  }

  const result = templates.map((t) => {
    const operator = timetableOperator || /^odpt\.Railway:([^.]+)\./.exec(t.railway_urn || "")?.[1] || "";
    return {
      // Only SQL-certified identical itineraries share identity across line sources.
      // Keep separate line records/stops; never dedupe by departure time alone.
      id: t.physical_service_key || ("manual-template:" + t.id),
      line_id: lineId,
      service_date: serviceDate,
      calendar_type: calendarType(t.calendar_urn),
      operator, network_key: t.railway_urn,
      train_number: t.train_number,
      operation_code: "",
      rail_direction: t.direction_urn,
      train_type: t.train_type_urn,
      destination_station: t.destination_urns?.[0] || null,
      vehicle_type_label: boundaryVehicle.get(t.id) || t.vehicle_type_label || null,
      vehicle_evidence_source: boundaryVehicle.has(t.id) ? "verified-scheduled-boundary:Rinkai/Osaki" : null,
      source_trip_id: t.source_trip_id || null,
      previous_timetable_ids: t.previous_timetable_ids || [],
      next_timetable_ids: t.next_timetable_ids || [],
      timetable_provenance: t.source_path || null,
      source_revision_date: t.source_revision_date || null,
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
  // Incomplete source rows are preserved in SQL for auditing, but must not
  // suppress other source-verified trains for the same railway/calendar.
  // Never extrapolate a missing stop or report full coverage for a partial set.
  // At least two observed station clocks are required for estimating a
  // moving train. An untimed boundary stop must never become a made-up ETA.
  const validRuns = result.filter(r => r.stops.length >= 2 &&
    r.stops.every(s => !!s.station_urn) &&
    r.stops.filter(s => s.arrival_time || s.departure_time).length >= 2);
  let omittedIncompleteRuns = result.length - validRuns.length;
  // A source may contain unusable upstream rows intentionally omitted from SQL.
  // Preserve that partial status rather than claiming full line coverage.
  if (selectedCalendar) {
    const { data: ingest, error: ingestError } = await db.from("timetable_ingest_jobs")
      .select("omitted_count").eq("line_id", lineId).eq("calendar_urn", selectedCalendar)
      .in("status", ["partial", "complete"])
      .order("updated_at", { ascending: false }).limit(1).maybeSingle();
    if (ingestError) throw ingestError;
    omittedIncompleteRuns += Math.max(0, Number(ingest?.omitted_count) || 0);
  }
  const complete = validRuns.length > 0 && omittedIncompleteRuns === 0;
  const partial = validRuns.length > 0 && omittedIncompleteRuns > 0;
  return json({ ok: true, complete, partial,
    cache: complete ? "HIT" : partial ? "PARTIAL" : "MISS",
    source: "DATABASE_MANUAL_TEMPLATES", line_id: lineId, service_date: serviceDate,
    omitted_incomplete_runs: omittedIncompleteRuns, runs: validRuns });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "GET") return json({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405);

  const url = new URL(req.url);
  // Existing read-only endpoint: serve exact visual identities only when their
  // PNG also has a protected reviewed-asset baseline; never promote an asset lock
  // into vehicle or train identity evidence.
  if (url.searchParams.get("catalog") === "vehicle-artwork") {
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    const key = keys.default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    if (!supabaseUrl || !key) return json({ ok: false, error: "SERVER_CONFIG" }, 500);
    const db = createClient(supabaseUrl, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await db.from("vehicle_artwork_exact_locked")
      .select("operator,vehicle_type,formation_id,livery,theme,valid_from,valid_to,image_path")
      .limit(500);
    if (error) return json({ ok: false, error: "VEHICLE_CATALOG_FAILED" }, 500);
    const paths = (data || []).filter((row: any) =>
      /^images\/列车\/[^/]+\/[^/]+\.png$/.test(row.image_path || ""));
    return json({ ok: true, source: "VERIFIED_SQL_VEHICLE_IDENTITIES", assets: paths });
  }

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
    .select("odpt_operator,odpt_railway,odpt_base_url,timetable_operator,timetable_api_enabled").eq("id", lineId).maybeSingle();
  if (sourceError) return json({ ok: false, error: "DB_SOURCE_LOOKUP_FAILED" }, 500);
  const hasTimetableApi = !!(source?.timetable_api_enabled && source?.odpt_operator &&
    source?.odpt_railway && source?.odpt_base_url);
  // SQL is the shared timetable authority for matching, even when an operator
  // supplies both train-location and TrainTimetable APIs.
  // Browser's fallback_only=1 reads SQL; it never invokes upstream API twice.
  if (hasTimetableApi && url.searchParams.get("fallback_only") !== "1") {
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
    try { return await readManualTemplateRuns(db, lineId, serviceDate, source?.timetable_operator || null); }
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
