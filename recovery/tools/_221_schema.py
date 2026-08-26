import json, os
from datetime import datetime

repo = os.getcwd()
cand = json.load(open(os.path.join(repo,"recovery/output/railway_data_canonical_candidate.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))

# 2.2.1: Fix the typo and re-run
schema_issues = []

# Top-level keys
expected_keys = {"stations", "lines", "name_map", "tourism", "stationLines", "lineStationOrder"}
actual_keys = set(cand.keys())
missing_keys = expected_keys - actual_keys
extra_keys = actual_keys - expected_keys
if missing_keys:
    schema_issues.append({"severity": "ERROR", "check": "top_level_keys", "issue": f"Missing keys: {sorted(missing_keys)}"})
if extra_keys:
    schema_issues.append({"severity": "WARNING", "check": "top_level_keys", "issue": f"Extra keys: {sorted(extra_keys)}"})

# Lines schema check
valid_line_fields = {"name", "nameEn", "nameJa", "code", "color", "operator", "region", "type", 
                     "image", "durationTotalMin", "branchOf", "stations", "durations",
                     "throughServices", "transferStations"}
for lid, l in cand["lines"].items():
    missing = valid_line_fields - set(l.keys())
    extra = set(l.keys()) - valid_line_fields
    if missing:
        schema_issues.append({"severity": "WARNING", "check": f"line.{lid}.fields", "issue": f"Missing fields: {sorted(missing)}"})
    if extra:
        schema_issues.append({"severity": "INFO", "check": f"line.{lid}.fields", "issue": f"Extra fields: {sorted(extra)}"})
    if not l.get("name"):
        schema_issues.append({"severity": "ERROR", "check": f"line.{lid}.name", "issue": "Missing name"})
    if not l.get("stations") or not isinstance(l["stations"], list):
        schema_issues.append({"severity": "ERROR", "check": f"line.{lid}.stations", "issue": "Missing or invalid stations"})
    if not isinstance(lid, str) or not lid:
        schema_issues.append({"severity": "ERROR", "check": f"line.{lid}", "issue": "Invalid line_id type"})

# Stations schema check
valid_station_fields = {"lat", "lng"}
invalid_coords = []
for sid, s in cand["stations"].items():
    if not isinstance(sid, str) or not sid:
        schema_issues.append({"severity": "ERROR", "check": f"station.{sid}", "issue": "Invalid station_id type"})
    if not isinstance(s, dict):
        schema_issues.append({"severity": "ERROR", "check": f"station.{sid}", "issue": "Station must be dict"})
    elif "lat" not in s or "lng" not in s:
        schema_issues.append({"severity": "ERROR", "check": f"station.{sid}", "issue": "Missing lat/lng"})
    elif not isinstance(s["lat"], (int, float)) or not isinstance(s["lng"], (int, float)):
        schema_issues.append({"severity": "ERROR", "check": f"station.{sid}", "issue": f"Invalid lat/lng type: lat={type(s['lat']).__name__}, lng={type(s['lng']).__name__}"})
        invalid_coords.append(sid)
    # Check for zero coordinates
    if s.get("lat") == 0 and s.get("lng") == 0:
        schema_issues.append({"severity": "WARNING", "check": f"station.{sid}", "issue": "Zero coordinates"})

# Relation layer schema check
for lid, order in cand.get("lineStationOrder", {}).items():
    if not isinstance(order, dict):
        schema_issues.append({"severity": "ERROR", "check": f"lineStationOrder.{lid}", "issue": "Must be dict"})
for sid, lines in cand.get("stationLines", {}).items():
    if not isinstance(lines, list):
        schema_issues.append({"severity": "ERROR", "check": f"stationLines.{sid}", "issue": "Must be list"})
    for entry in lines:
        if not isinstance(entry, dict) or "line_id" not in entry or "station_order" not in entry:
            schema_issues.append({"severity": "ERROR", "check": f"stationLines.{sid}", "issue": "Invalid entry format"})

# Name map and tourism
if not isinstance(cand.get("name_map"), dict):
    schema_issues.append({"severity": "ERROR", "check": "name_map", "issue": "Must be dict"})
if not isinstance(cand.get("tourism"), dict):
    schema_issues.append({"severity": "ERROR", "check": "tourism", "issue": "Must be dict"})

# Compare with current production
cur_line_fields = set()
for l in cur["lines"].values():
    cur_line_fields.update(l.keys())
cand_line_fields = set()
for l in cand["lines"].values():
    cand_line_fields.update(l.keys())

print("=== 2.2.1 Schema Validation ===")
print(f"Candidate keys: {sorted(actual_keys)}")
print(f"Current keys: {sorted(set(cur.keys()))}")
print(f"Field diff (candidate-only): {sorted(cand_line_fields - cur_line_fields)}")
print(f"Field diff (current-only): {sorted(cur_line_fields - cand_line_fields)}")

errors = [i for i in schema_issues if i["severity"] == "ERROR"]
warnings = [i for i in schema_issues if i["severity"] == "WARNING"]
info = [i for i in schema_issues if i["severity"] == "INFO"]
print(f"\nErrors: {len(errors)}, Warnings: {len(warnings)}, Info: {len(info)}")
print(f"Invalid coordinates: {len(invalid_coords)}")
if invalid_coords:
    print(f"  Sample: {invalid_coords[:5]}")
if errors:
    for e in errors[:10]:
        print(f"  ERROR [{e['check']}]: {e['issue']}")

out = {
    "task": "2.2.1 Schema Validation",
    "timestamp": datetime.now().isoformat(),
    "issues": schema_issues,
    "error_count": len(errors),
    "warning_count": len(warnings),
    "info_count": len(info),
    "invalid_coordinate_count": len(invalid_coords),
    "pass": len(errors) == 0,
}
with open(os.path.join(repo,"recovery","output","2_2_1_schema_validation.json"),"w",encoding="utf-8") as f:
    json.dump(out, f, indent=2, ensure_ascii=False)
print(f"\nSaved to recovery/output/2_2_1_schema_validation.json")