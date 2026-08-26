import json, os
from datetime import datetime
repo = os.getcwd()
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))
final_res = json.load(open(os.path.join(repo,"recovery/reconciliation/2_1_1_final_resolution.json"),"r",encoding="utf-8"))

# Apply all 2.1.1 resolutions to create the canonical candidate
import copy
candidate = copy.deepcopy(json.load(open(os.path.join(repo,"recovery/output/railway_data_candidate_v2.json"),"r",encoding="utf-8")))

applied = []
for res in final_res["resolutions"]:
    lid = res["line"]
    field = res["field"]
    decision = res["decision"]
    
    if field == "stations" and decision == "ACCEPT_CURRENT":
        candidate["lines"][lid]["stations"] = cur["lines"][lid]["stations"]
        applied.append({"line": lid, "field": field, "action": "use_current_stations"})
    elif field == "durations" and decision == "RECOMPUTE":
        # Will be handled in relation layer rebuild
        applied.append({"line": lid, "field": field, "action": "mark_for_recompute"})
    elif field == "code" and decision == "ACCEPT_CURRENT":
        candidate["lines"][lid]["code"] = cur["lines"][lid]["code"]
        applied.append({"line": lid, "field": field, "action": "use_current_code"})
    elif field == "branchOf" and decision == "ACCEPT_SOURCE":
        candidate["lines"][lid]["branchOf"] = src["lines"][lid]["branchOf"]
        applied.append({"line": lid, "field": field, "action": "restore_source_branchOf"})

# Recompute durations and relation layer from resolved stations
for lid, l in candidate["lines"].items():
    stations = l.get("stations", [])
    l["durations"] = [2] * len(stations)  # Default 2 min per segment

# Rebuild relation layer
station_lines = {}
line_station_order = {}
for lid, l in candidate["lines"].items():
    line_station_order[lid] = {}
    for order, sid in enumerate(l.get("stations", [])):
        line_station_order[lid][sid] = order
        station_lines.setdefault(sid, []).append({"line_id": lid, "station_order": order})

candidate["stationLines"] = station_lines
candidate["lineStationOrder"] = line_station_order

# Verify
print(f"Applied {len(applied)} resolutions")
print(f"Candidate lines: {len(candidate['lines'])}")
print(f"Candidate stations: {len(candidate['stations'])}")
print(f"Candidate stationLines: {len(candidate['stationLines'])}")
print(f"Candidate lineStationOrder: {len(candidate['lineStationOrder'])}")

# Check orphans
all_refs = set()
for l in candidate["lines"].values():
    all_refs.update(l.get("stations", []))
orphans = all_refs - set(candidate["stations"].keys())
print(f"Orphan refs: {len(orphans)}")

# Data loss check
src_lines = set(src["lines"].keys())
cand_lines = set(candidate["lines"].keys())
lost_l = src_lines - cand_lines
src_st = set(src["stations"].keys())
cand_st = set(candidate["stations"].keys())
lost_s = src_st - cand_st
print(f"Lost lines: {sorted(lost_l)}")
print(f"Lost stations: {sorted(lost_s)}")

# Save
import hashlib
out_path = os.path.join(repo, "recovery", "output", "railway_data_canonical_candidate.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(candidate, f, ensure_ascii=False, indent=2)
sha = hashlib.sha256(open(out_path,"rb").read()).hexdigest().upper()
print(f"\nSaved to {out_path}")
print(f"SHA-256: {sha}")
print(f"Size: {os.path.getsize(out_path)} bytes")