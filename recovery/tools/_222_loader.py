import json, os
from datetime import datetime

repo = os.getcwd()
cand = json.load(open(os.path.join(repo,"recovery/output/railway_data_canonical_candidate.json"),"r",encoding="utf-8"))

# 2.2.2: RailwayDB Loader Compatibility Check
# Simulate what db-loader.js does with the candidate data

issues = []

# Step 1: Check if all line IDs exist as keys
print("=== 2.2.2 RailwayDB Loader Compatibility ===")
print(f"Lines in candidate: {len(cand['lines'])}")
print(f"Stations in candidate: {len(cand['stations'])}")

# Step 2: Simulate STATION_COORDS building
station_coords = {}
for sid, s in cand["stations"].items():
    if s.get("lat") and s.get("lng"):
        station_coords[sid] = [s["lat"], s["lng"]]
print(f"\nBuildable STATION_COORDS: {len(station_coords)}")

# Step 3: Simulate UNIFIED_LINES building
unified_lines = cand["lines"]
for lid, l in unified_lines.items():
    if not l.get("durations"):
        l["durations"] = [2] * len(l.get("stations", []))
    if not l.get("throughServices"):
        l["throughServices"] = []
    if not l.get("transferStations"):
        l["transferStations"] = []

print(f"UNIFIED_LINES ready: {len(unified_lines)}")

# Step 4: Simulate STATION_LINES building (the critical compatibility check)
station_lines = {}
for lid, l in unified_lines.items():
    for order, sid in enumerate(l.get("stations", [])):
        if sid not in station_lines:
            station_lines[sid] = []
        station_lines[sid].append({"line_id": lid, "station_order": order})

print(f"Computed STATION_LINES entries: {len(station_lines)}")

# Check against stored stationLines
stored_sl = cand.get("stationLines", {})
mismatch = 0
for sid in set(list(station_lines.keys()) + list(stored_sl.keys())):
    computed = set(x["line_id"] for x in station_lines.get(sid, []))
    stored = set(x["line_id"] for x in stored_sl.get(sid, []))
    if computed != stored:
        mismatch += 1
        if mismatch <= 5:
            issues.append({
                "type": "stationLines_mismatch",
                "station_id": sid,
                "computed_count": len(computed),
                "stored_count": len(stored),
            })

print(f"stationLines mismatches: {mismatch}")
if mismatch > 0:
    print("Sample mismatches:")
    for m in issues[:5]:
        print(f"  {m['station_id']}: computed={m['computed_count']} stored={m['stored_count']}")

# Step 5: Simulate LINE_STATION_ORDER building
line_station_order = {}
for lid, l in unified_lines.items():
    line_station_order[lid] = {}
    for order, sid in enumerate(l.get("stations", [])):
        line_station_order[lid][sid] = order

print(f"\nLINE_STATION_ORDER entries: {len(line_station_order)}")
stored_lso = cand.get("lineStationOrder", {})
lso_mismatch = 0
for lid in set(list(line_station_order.keys()) + list(stored_lso.keys())):
    if line_station_order.get(lid) != stored_lso.get(lid):
        lso_mismatch += 1
print(f"lineStationOrder mismatches: {lso_mismatch}")

# Step 6: Check name_map consistency
name_map = cand.get("name_map", {})
print(f"\nNAME_MAP entries: {len(name_map)}")

# Step 7: Check for any line referencing non-existent stations
missing_station_refs = []
for lid, l in unified_lines.items():
    for sid in l.get("stations", []):
        if sid not in cand["stations"]:
            missing_station_refs.append({"line": lid, "station": sid})

print(f"Station references missing from stations dict: {len(missing_station_refs)}")
if missing_station_refs[:5]:
    for m in missing_station_refs[:5]:
        print(f"  {m['line']} -> {m['station']}")

# Step 8: Check tourism structure
tourism = cand.get("tourism", {})
print(f"\nTOURISM entries: {len(tourism)}")
if tourism:
    sample_key = list(tourism.keys())[0]
    sample = tourism[sample_key]
    print(f"  Sample ({sample_key}): type={type(sample).__name__}")
    if isinstance(sample, dict):
        print(f"  Sample keys: {list(sample.keys())[:5]}")

# Summary
all_issues = issues + ( [{"type": "missing_station_refs", "count": len(missing_station_refs)}] if missing_station_refs else [] )
print(f"\n=== Summary ===")
print(f"Loader compatibility: {'PASS' if len(issues) == 0 and lso_mismatch == 0 else 'FAIL'}")
print(f"  stationLines mismatches: {mismatch}")
print(f"  lineStationOrder mismatches: {lso_mismatch}")
print(f"  Missing station refs: {len(missing_station_refs)}")

out = {
    "task": "2.2.2 RailwayDB Loader Compatibility",
    "timestamp": datetime.now().isoformat(),
    "pass": len(issues) == 0 and lso_mismatch == 0,
    "issues": all_issues,
    "checks": {
        "station_coords_buildable": len(station_coords),
        "unified_lines_ready": len(unified_lines),
        "station_lines_mismatches": mismatch,
        "line_station_order_mismatches": lso_mismatch,
        "name_map_entries": len(name_map),
        "missing_station_refs": len(missing_station_refs),
        "tourism_entries": len(tourism),
    }
}
with open(os.path.join(repo,"recovery","output","2_2_2_loader_compatibility.json"),"w",encoding="utf-8") as f:
    json.dump(out, f, indent=2, ensure_ascii=False)
print(f"\nSaved to recovery/output/2_2_2_loader_compatibility.json")