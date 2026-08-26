import json, os, hashlib, sys
from datetime import datetime
from collections import OrderedDict

repo = os.getcwd()
SRC = os.path.join(repo, "recovery", "source", "railway_152_raw.json")
CUR = os.path.join(repo, "data", "core", "railway_data.json")
OUT = os.path.join(repo, "recovery", "output")
REC = os.path.join(repo, "recovery", "reconciliation")

os.makedirs(OUT, exist_ok=True)
os.makedirs(REC, exist_ok=True)

src = json.load(open(SRC, "r", encoding="utf-8"))
cur = json.load(open(CUR, "r", encoding="utf-8"))

conflicts = {"lines": [], "stations": [], "relations": []}
lost_entities = {"lines": [], "stations": []}

# ========== Step 1: Build migration candidate line set ==========
# Source lines (152) + current-only lines (4)
src_line_ids = set(src["lines"].keys())
cur_line_ids = set(cur["lines"].keys())
common_lines = src_line_ids & cur_line_ids
src_only_lines = src_line_ids - cur_line_ids  # 96 lines lost
cur_only_lines = cur_line_ids - src_line_ids  # 4 lines new

print(f"Source lines: {len(src_line_ids)}")
print(f"Current lines: {len(cur_line_ids)}")
print(f"Common: {len(common_lines)}, Source-only: {len(src_only_lines)}, Current-only: {len(cur_only_lines)}")

candidate_lines = {}

# Add all 152 source lines first
for lid, l in src["lines"].items():
    candidate_lines[lid] = {
        "name": l.get("name"),
        "nameEn": l.get("nameEn"),
        "nameJa": l.get("nameJa", ""),
        "code": l.get("code"),
        "color": l.get("color"),
        "operator": l.get("operator"),
        "region": l.get("region"),
        "type": l.get("type"),
        "image": l.get("image", ""),
        "durationTotalMin": l.get("durationTotalMin"),
        "branchOf": l.get("branchOf"),
        "stations": l.get("stations", []),
        "durations": l.get("durations"),
        # New relation layer fields (computed)
        "throughServices": l.get("throughServices", []),
        "transferStations": l.get("transferStations", []),
    }

# Merge current-only lines (4 lines not in source)
for lid in sorted(cur_only_lines):
    l = cur["lines"][lid]
    candidate_lines[lid] = {
        "name": l.get("name"),
        "nameEn": l.get("nameEn"),
        "nameJa": "",
        "code": l.get("code"),
        "color": l.get("color"),
        "operator": l.get("operator"),
        "region": l.get("region"),
        "type": l.get("type"),
        "image": l.get("image", ""),
        "durationTotalMin": l.get("durationTotalMin"),
        "branchOf": l.get("branchOf"),
        "stations": l.get("stations", []),
        "durations": l.get("durations"),
        "throughServices": l.get("throughServices", []),
        "transferStations": l.get("transferStations", []),
    }
    conflicts["lines"].append({
        "line_id": lid,
        "type": "current_only",
        "source": "current_production",
        "note": "Not in 152 source; added from current production"
    })

# Resolve conflicts for common lines
for lid in sorted(common_lines):
    sl = src["lines"][lid]
    cl = cur["lines"][lid]
    # Check if they differ
    if sl != cl:
        diff_fields = []
        for key in set(list(sl.keys()) + list(cl.keys())):
            if sl.get(key) != cl.get(key):
                diff_fields.append({
                    "field": key,
                    "source_value": str(sl.get(key))[:100],
                    "current_value": str(cl.get(key))[:100],
                })
        # Prefer source data (historical), mark conflict
        conflicts["lines"].append({
            "line_id": lid,
            "type": "content_difference",
            "source": "railway_152_raw",
            "current": "production_canonical",
            "diff_fields": diff_fields,
            "decision": "prefer_source",
            "reason": "Historical source is more complete"
        })
        # Use source data as it has nameJa and more fields
        candidate_lines[lid] = {
            "name": sl.get("name"),
            "nameEn": sl.get("nameEn"),
            "nameJa": sl.get("nameJa", ""),
            "code": sl.get("code"),
            "color": sl.get("color"),
            "operator": sl.get("operator"),
            "region": sl.get("region"),
            "type": sl.get("type"),
            "image": sl.get("image", ""),
            "durationTotalMin": sl.get("durationTotalMin"),
            "branchOf": sl.get("branchOf"),
            "stations": sl.get("stations", []),
            "durations": sl.get("durations"),
            "throughServices": sl.get("throughServices", []),
            "transferStations": sl.get("transferStations", []),
        }

print(f"Candidate lines total: {len(candidate_lines)}")

# ========== Step 2: Build migration candidate station set ==========
src_station_ids = set(src["stations"].keys())
cur_station_ids = set(cur["stations"].keys())
common_stations = src_station_ids & cur_station_ids
src_only_stations = src_station_ids - cur_station_ids
cur_only_stations = cur_station_ids - src_station_ids

print(f"Source stations: {len(src_station_ids)}")
print(f"Current stations: {len(cur_station_ids)}")
print(f"Common: {len(common_stations)}, Source-only: {len(src_only_stations)}, Current-only: {len(cur_only_stations)}")

candidate_stations = {}

# Add all source stations
for sid, s in src["stations"].items():
    candidate_stations[sid] = {
        "lat": s.get("lat"),
        "lng": s.get("lng"),
    }

# Handle current-only stations
for sid in sorted(cur_only_stations):
    s = cur["stations"][sid]
    candidate_stations[sid] = {
        "lat": s.get("lat"),
        "lng": s.get("lng"),
    }
    conflicts["stations"].append({
        "station_id": sid,
        "type": "current_only",
        "source": "current_production",
        "note": "Not in 152 source"
    })

# Handle source-only stations
for sid in sorted(src_only_stations):
    conflicts["stations"].append({
        "station_id": sid,
        "type": "source_only",
        "source": "railway_152_raw",
        "note": "Not in current production"
    })

# Resolve conflicts for common stations
for sid in sorted(common_stations):
    ss = src["stations"][sid]
    cs = cur["stations"][sid]
    if ss != cs:
        diff_fields = []
        for key in set(list(ss.keys()) + list(cs.keys())):
            if ss.get(key) != cs.get(key):
                diff_fields.append({"field": key, "source": str(ss.get(key)), "current": str(cs.get(key))})
        conflicts["stations"].append({
            "station_id": sid,
            "type": "content_difference",
            "diff_fields": diff_fields,
            "decision": "prefer_source",
            "reason": "Source has more complete data"
        })
        # Use source if it has lat/lng
        candidate_stations[sid] = {
            "lat": ss.get("lat", cs.get("lat")),
            "lng": ss.get("lng", cs.get("lng")),
        }

print(f"Candidate stations total: {len(candidate_stations)}")

# ========== Step 3: Compute relation layer ==========
# Build stationLines from candidate lines
station_lines = {}
for lid, l in candidate_lines.items():
    for order, sid in enumerate(l.get("stations", [])):
        entry = {"line_id": lid, "station_order": order}
        if sid not in station_lines:
            station_lines[sid] = []
        station_lines[sid].append(entry)

# Build lineStationOrder from candidate lines
line_station_order = {}
for lid, l in candidate_lines.items():
    stations = l.get("stations", [])
    line_station_order[lid] = {}
    for order, sid in enumerate(stations):
        line_station_order[lid][sid] = order

print(f"stationLines entries: {len(station_lines)}")
print(f"lineStationOrder entries: {len(line_station_order)}")

# ========== Step 4: Build name_map ==========
# Merge source and current name_maps
src_nm = src.get("name_map", {})
cur_nm = cur.get("name_map", {})
merged_nm = dict(src_nm)
for k, v in cur_nm.items():
    if k not in merged_nm:
        merged_nm[k] = v
    elif merged_nm[k] != v:
        conflicts["relations"].append({
            "type": "name_map_conflict",
            "key": k,
            "source": merged_nm[k],
            "current": v,
            "decision": "keep_source",
        })
print(f"name_map entries: {len(merged_nm)}")

# ========== Step 5: Tourism (unchanged) ==========
tourism = cur.get("tourism", {})
print(f"Tourism entries: {len(tourism)}")

# ========== Step 6: Build candidate JSON ==========
candidate = {
    "stations": candidate_stations,
    "lines": candidate_lines,
    "name_map": merged_nm,
    "tourism": tourism,
    "stationLines": station_lines,
    "lineStationOrder": line_station_order,
}

# Validate
lost_lines = [lid for lid in src_line_ids if lid not in candidate_lines]
lost_stations = [sid for sid in src_station_ids if sid not in candidate_stations]
print(f"\nValidation:")
print(f"  Lost lines: {lost_lines}")
print(f"  Lost stations: {lost_stations}")
print(f"  Candidate lines >= 152: {len(candidate_lines)} >= 152 = {len(candidate_lines) >= 152}")
print(f"  Candidate stations >= 503: {len(candidate_stations)} >= 503 = {len(candidate_stations) >= 503}")

# Write candidate
out_path = os.path.join(OUT, "railway_data_candidate.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(candidate, f, ensure_ascii=False, indent=2)
print(f"\nCandidate written: {out_path} ({os.path.getsize(out_path)} bytes)")

# Write migration report
report = {
    "timestamp": datetime.now().isoformat(),
    "source_file": SRC,
    "source_sha256": hashlib.sha256(open(SRC, "rb").read()).hexdigest().upper(),
    "current_file": CUR,
    "current_sha256": hashlib.sha256(open(CUR, "rb").read()).hexdigest().upper(),
    "output_file": out_path,
    "output_sha256": hashlib.sha256(open(out_path, "rb").read()).hexdigest().upper(),
    "summary": {
        "candidate_lines": len(candidate_lines),
        "candidate_stations": len(candidate_stations),
        "name_map_entries": len(merged_nm),
        "tourism_entries": len(tourism),
        "stationLines_entries": len(station_lines),
        "lineStationOrder_entries": len(line_station_order),
        "source_only_lines": sorted(src_only_lines),
        "current_only_lines": sorted(cur_only_lines),
        "source_only_stations": sorted(src_only_stations),
        "current_only_stations": sorted(cur_only_stations),
        "total_conflicts": len(conflicts["lines"]) + len(conflicts["stations"]) + len(conflicts["relations"]),
    },
    "validation": {
        "lines_gte_152": len(candidate_lines) >= 152,
        "stations_gte_503": len(candidate_stations) >= 503,
        "lost_lines": lost_lines,
        "lost_stations": lost_stations,
        "all_checks_pass": len(lost_lines) == 0 and len(lost_stations) == 0 and len(candidate_lines) >= 152 and len(candidate_stations) >= 503,
    }
}
rep_path = os.path.join(OUT, "migration_report.json")
with open(rep_path, "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2, ensure_ascii=False)

# Write conflicts
conf_path = os.path.join(REC, "conflicts.json")
with open(conf_path, "w", encoding="utf-8") as f:
    json.dump(conflicts, f, indent=2, ensure_ascii=False)

# Write statistics
stat_path = os.path.join(OUT, "statistics.json")
stats = {
    "timestamp": datetime.now().isoformat(),
    "source": {
        "lines": len(src["lines"]),
        "stations": len(src["stations"]),
        "name_map": len(src.get("name_map", {})),
        "tourism": len(src.get("tourism", {})),
        "stationLines": len(src.get("stationLines", {})),
        "lineStationOrder": len(src.get("lineStationOrder", {})),
    },
    "current": {
        "lines": len(cur["lines"]),
        "stations": len(cur["stations"]),
        "name_map": len(cur.get("name_map", {})),
        "tourism": len(cur.get("tourism", {})),
    },
    "candidate": {
        "lines": len(candidate_lines),
        "stations": len(candidate_stations),
        "name_map": len(merged_nm),
        "tourism": len(tourism),
        "stationLines": len(station_lines),
        "lineStationOrder": len(line_station_order),
    },
    "conflict_counts": {
        "line_content_diff": len([c for c in conflicts["lines"] if c["type"] == "content_difference"]),
        "line_current_only": len([c for c in conflicts["lines"] if c["type"] == "current_only"]),
        "station_content_diff": len([c for c in conflicts["stations"] if c["type"] == "content_difference"]),
        "station_current_only": len([c for c in conflicts["stations"] if c["type"] == "current_only"]),
        "station_source_only": len([c for c in conflicts["stations"] if c["type"] == "source_only"]),
    }
}
with open(stat_path, "w", encoding="utf-8") as f:
    json.dump(stats, f, indent=2, ensure_ascii=False)

print("\n=== Task 1 Migration Complete ===")
print(f"All checks pass: {report['validation']['all_checks_pass']}")
print(f"Conflicts: {report['summary']['total_conflicts']}")