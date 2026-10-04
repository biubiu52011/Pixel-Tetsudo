/*
 * Pixel Tetsudo - Vehicle Source Adapters
 *
 * Realtime API and timetable evidence are parallel authoritative sources.
 * This module normalizes them; it never guesses identity and never maps artwork.
 */
(function(){
  "use strict";

  function splitExact(value) {
    if (!value) return [];
    return String(value).split('/').map(function(v){ return v.trim(); }).filter(Boolean);
  }

  function realtime(vehicleType, meta) {
    var c = splitExact(vehicleType);
    return {
      source: "REALTIME",
      identityStatus: c.length === 1 ? "EXACT" : (c.length > 1 ? "NARROWED" : "UNKNOWN"),
      vehicleIdentity: c.length === 1 ? c[0] : "",
      candidates: c,
      evidence: meta || null
    };
  }

  function timetable(records, meta) {
    records = Array.isArray(records) ? records.filter(Boolean) : [];
    var exact = {};
    records.forEach(function(rec) {
      if (rec.decisive && rec.vehicleType) exact[String(rec.vehicleType).trim()] = true;
    });
    var c = Object.keys(exact);
    return {
      source: "TIMETABLE",
      identityStatus: c.length === 1 ? "EXACT" : (c.length > 1 ? "NARROWED" : "UNKNOWN"),
      vehicleIdentity: c.length === 1 ? c[0] : "",
      candidates: c,
      evidence: meta || records
    };
  }

  function arbitrate(realtimeSource, timetableSource) {
    var rt = realtimeSource || realtime("");
    var tt = timetableSource || timetable([]);
    if (rt.identityStatus === "EXACT") return rt;
    // Realtime ambiguity is evidence, not absence. Do not override it.
    if (rt.identityStatus === "NARROWED") return rt;
    if (tt.identityStatus === "EXACT" || tt.identityStatus === "NARROWED") return tt;
    return {source:"NONE",identityStatus:"UNKNOWN",vehicleIdentity:"",candidates:[],evidence:null};
  }

  window.VehicleSources = { realtime:realtime, timetable:timetable, arbitrate:arbitrate };
})();
