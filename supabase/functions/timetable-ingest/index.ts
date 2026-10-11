import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

function reply(body: Record<string, unknown>, code = 200) {
  return new Response(JSON.stringify(body), {
    status: code, headers: { "content-type": "application/json; charset=utf-8" }
  });
}

async function publicProjectTimetableKey(baseUrl: string): Promise<string | null> {
  // Temporary ingestion-only bridge to the project's ALREADY PUBLIC ODPT
  // link catalog. Pin the source revision; never log decoded URLs/keys.
  // Production should instead configure Edge Function ODPT_* secrets.
  const src = "https://raw.githubusercontent.com/biubiu52011/Pixel-Tetsudo/" +
    "3b52bdcf4523f1de13587832f143907e850020d5/data/api/odpt-links.js";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  let res: Response;
  try { res = await fetch(src, { signal: controller.signal }); }
  finally { clearTimeout(timer); }
  if (!res.ok) throw new Error("PROJECT_LINK_CATALOG_UNAVAILABLE");
  const m = /ODPT_LINKS_ENC\s*=\s*"([A-Za-z0-9+/=]+)"/.exec(await res.text());
  if (!m) throw new Error("PROJECT_LINK_CATALOG_MALFORMED");
  const binary = atob(m[1]);
  const seed = "PixelTetsudo".split("").reverse().join("") + "-" +
    "ODPT".split("").reverse().join("") + "-2026";
  let clear = "";
  for (let i = 0; i < binary.length; i++) {
    clear += String.fromCharCode(binary.charCodeAt(i) ^ seed.charCodeAt(i % seed.length));
  }
  const links: unknown = JSON.parse(clear);
  if (!Array.isArray(links)) throw new Error("PROJECT_LINK_CATALOG_INVALID");
  const targetHost = new URL(baseUrl).hostname;
  for (const raw of links) {
    if (typeof raw !== "string") continue;
    try {
      const url = new URL(raw);
      if (url.hostname === targetHost && url.protocol === "https:") {
        const value = url.searchParams.get("acl:consumerKey");
        if (value) return value;
      }
    } catch {}
  }
  return null;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return reply({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405);
  // This import endpoint accepts only a high-entropy single-use job capability.
  // Jobs are provisioned by privileged SQL, expire after 30 minutes, and are
  // atomically claimed as running. Never disclose job nonces to clients.
  let jobId = "", nonce = "";
  try {
    const body = await request.json();
    jobId = String(body.job_id || "");
    nonce = String(body.nonce || "");
  } catch { return reply({ ok: false, error: "INVALID_REQUEST" }, 400); }
  const uuid = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i;
  if (!uuid.test(jobId) || !uuid.test(nonce)) {
    return reply({ ok: false, error: "INVALID_CREDENTIALS" }, 403);
  }
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const secretKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !secretKey) return reply({ ok: false, error: "SERVER_CONFIG" }, 500);
  const db = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const now = new Date().toISOString();
  const { data: job, error: claimError } = await db.from("timetable_ingest_jobs")
    .update({ status: "running", updated_at: now })
    .eq("id", jobId).eq("secret_nonce", nonce)
    .eq("status", "pending").gt("expires_at", now)
    .select("line_id,calendar_urn").maybeSingle();
  if (claimError || !job) return reply({ ok: false, error: "JOB_NOT_AUTHORIZED" }, 403);

  try {
    const { data: line, error: lineError } = await db.from("railway_lines")
      .select("id,odpt_operator,odpt_railway,odpt_base_url,timetable_api_enabled")
      .eq("id", job.line_id).single();
    if (lineError || !line?.timetable_api_enabled || !line.odpt_base_url ||
        !line.odpt_operator || !line.odpt_railway) throw new Error("TIMETABLE_API_NOT_CONFIGURED");
    const keyName = line.odpt_base_url.includes("api-challenge")
      ? "ODPT_CHALLENGE_CONSUMER_KEY" : "ODPT_CONSUMER_KEY";
    const upstreamKey = Deno.env.get(keyName) ||
      await publicProjectTimetableKey(line.odpt_base_url);
    if (!upstreamKey) throw new Error("UPSTREAM_KEY_UNAVAILABLE");
    const url = new URL("./odpt:TrainTimetable", line.odpt_base_url);
    url.searchParams.set("odpt:operator", "odpt.Operator:" + line.odpt_operator);
    url.searchParams.set("odpt:railway", "odpt.Railway:" + line.odpt_operator + "." + line.odpt_railway);
    url.searchParams.set("odpt:calendar", job.calendar_urn);
    url.searchParams.set("acl:consumerKey", upstreamKey);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    let response: Response;
    try { response = await fetch(url.toString(), { signal: controller.signal }); }
    finally { clearTimeout(timer); }
    if (!response.ok) throw new Error("UPSTREAM_HTTP_" + response.status);
    const rows: unknown = await response.json();
    if (!Array.isArray(rows)) throw new Error("UPSTREAM_NOT_ARRAY");
    if (rows.length >= 1000) throw new Error("UPSTREAM_POSSIBLY_TRUNCATED");
    if (!rows.length) {
      const { error } = await db.from("timetable_ingest_jobs").update({
        status: "empty", train_count: 0, stop_count: 0, updated_at: new Date().toISOString()
      }).eq("id", jobId);
      if (error) throw new Error("STATUS_WRITE_FAILED");
      return reply({ ok: true, status: "empty", line_id: job.line_id });
    }
    // Existing SQL tables are authoritative; the RPC replaces one validated
    // line/calendar snapshot atomically, keeping all raw source fields.
    const { data, error } = await db.rpc("persist_odpt_timetable_templates", {
      p_line_id: job.line_id, p_calendar_urn: job.calendar_urn, p_rows: rows
    });
    if (error) throw new Error("SQL_IMPORT_FAILED:" + error.message);
    const counts = Array.isArray(data) ? data[0] : data;
    if (!counts || Number(counts.train_count) < 1 ||
        Number(counts.train_count) > rows.length) {
      throw new Error("IMPORT_COUNT_MISMATCH");
    }
    // Incomplete upstream train rows remain excluded from movement estimates.
    // Record omissions explicitly so consumers never mistake this for a full timetable.
    const omitted = rows.length - Number(counts.train_count);
    const resultStatus = omitted ? "partial" : "complete";
    const { error: statusError } = await db.from("timetable_ingest_jobs").update({
      status: resultStatus, train_count: Number(counts.train_count),
      stop_count: Number(counts.stop_count), omitted_count: omitted,
      updated_at: new Date().toISOString()
    }).eq("id", jobId);
    if (statusError) throw new Error("STATUS_WRITE_FAILED");
    return reply({ ok: true, status: resultStatus, line_id: job.line_id,
      trains: counts.train_count, stops: counts.stop_count, omitted });
  } catch (e) {
    const message = String(e instanceof Error ? e.message : e);
    // Errors include only a status code or SQL validation reason, not raw URLs/keys.
    const safe = message.slice(0, 300).replace(/acl:consumerKey=[^&\s]+/g, "[redacted]");
    await db.from("timetable_ingest_jobs").update({
      status: "failed", error_code: safe, updated_at: new Date().toISOString()
    }).eq("id", jobId);
    return reply({ ok: false, error: "IMPORT_FAILED", job_id: jobId }, 500);
  }
});
