/*
 * Pixel Tetsudo - Supabase TrainRun read-through cache
 * Fetches only the line the user opened. A cache MISS/PARTIAL/error is not an
 * error condition: callers fall back to existing ODPT/manual timetable sources.
 */
(function() {
  "use strict";

  var ENDPOINT = "https://pnupwfmgbtxqhpzsrhfn.supabase.co/functions/v1/train-runs";
  var TTL_MS = 30 * 1000;
  var _cache = {};
  var _inflight = {};

  function serviceDateJst() {
    var parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(new Date());
    var out = {};
    parts.forEach(function(p) { if (p.type !== "literal") out[p.type] = p.value; });
    // Railway service day changes at 04:00 JST.
    var nowJst = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
    if (nowJst.getHours() < 4) {
      var d = new Date(Date.UTC(Number(out.year), Number(out.month) - 1, Number(out.day)) - 86400000);
      return d.toISOString().slice(0, 10);
    }
    return out.year + "-" + out.month + "-" + out.day;
  }

  function toOdpt(run) {
    var railway = run.network_key || run.line_id || "";
    var objects = (run.stops || []).map(function(stop) {
      var o = {};
      if (stop.arrival_time) o["odpt:arrivalTime"] = String(stop.arrival_time).slice(0, 5);
      if (stop.departure_time) o["odpt:departureTime"] = String(stop.departure_time).slice(0, 5);
      if (stop.station_urn) {
        if (stop.arrival_time) o["odpt:arrivalStation"] = stop.station_urn;
        if (stop.departure_time) o["odpt:departureStation"] = stop.station_urn;
        if (!stop.arrival_time && !stop.departure_time) o["odpt:departureStation"] = stop.station_urn;
      }
      return o;
    });
    return {
      "@id": "supabase:TrainRun:" + run.id,
      "odpt:trainNumber": run.train_number || "",
      "odpt:railway": railway,
      "odpt:calendar": run.calendar_type === "holiday" ? "odpt.Calendar:SaturdayHoliday" : "odpt.Calendar:Weekday",
      "odpt:trainTimetableObject": objects,
      _positionSource: "supabase-train-run",
      _supabaseTrainRun: true
    };
  }

  function load(lineId, serviceDate) {
    serviceDate = serviceDate || serviceDateJst();
    var key = lineId + "|" + serviceDate;
    var hit = _cache[key];
    if (hit && Date.now() - hit.at < TTL_MS) return Promise.resolve(hit.value);
    if (_inflight[key]) return _inflight[key];

    var url = ENDPOINT + "?line_id=" + encodeURIComponent(lineId) +
      "&service_date=" + encodeURIComponent(serviceDate);
    _inflight[key] = fetch(url, { method: "GET", credentials: "omit" })
      .then(function(res) {
        if (!res.ok) throw new Error("train-runs HTTP " + res.status);
        return res.json();
      })
      .then(function(body) {
        var value = {
          lineId: lineId,
          serviceDate: serviceDate,
          cache: body && body.cache || "MISS",
          complete: !!(body && body.complete),
          rows: body && body.complete && Array.isArray(body.runs) ? body.runs.map(toOdpt) : []
        };
        _cache[key] = { at: Date.now(), value: value };
        return value;
      })
      .finally(function() { delete _inflight[key]; });
    return _inflight[key];
  }

  window.TrainRunClient = {
    load: load,
    serviceDateJst: serviceDateJst,
    clear: function(lineId) {
      Object.keys(_cache).forEach(function(k) {
        if (!lineId || k.indexOf(lineId + "|") === 0) delete _cache[k];
      });
    }
  };
})();
